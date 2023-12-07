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
    origin: "*", // Set to your deployed site URL
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

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
