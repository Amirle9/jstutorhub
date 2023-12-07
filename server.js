
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let codeBlocks = {
  'Async Case': '// Async code here',
  'Data Structures and Algorithms': '// Data Structures and Algorithms code here',
  'Design Patterns': '// Design Patterns code here',
  'Others': '// Others code here'
};

let codeBlockMentors = {}; // Store the mentor of each code block

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (title) => {
    if (!codeBlockMentors[title]) {
      codeBlockMentors[title] = socket.id; // First person to join is the mentor
    }
    socket.join(title);
    socket.emit('code', codeBlocks[title]);
    socket.emit('setRole', socket.id === codeBlockMentors[title] ? 'mentor' : 'student');
  });

  socket.on('updateCode', ({ title, code }) => {
    if (socket.id !== codeBlockMentors[title]) { // Only students can update
      codeBlocks[title] = code;
      io.to(title).emit('codeUpdate', code);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.use(express.static(path.join(__dirname, 'App/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'App/build/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));