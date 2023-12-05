// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

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
  'Promise Example': '// Promise code here',
  'Callback Function': '// Callback code here',
  'Event Loop': '// Event loop code here'
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
    // Additional logic can be added here for when a mentor disconnects
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));