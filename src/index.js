const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

io.on('connection', (socket) => {
  console.log('New webSocket connection');
  socket.emit('welcome', 'Welcome!!!');
  socket.broadcast.emit('message', 'A new user has joined!');

  socket.on('sendMessage', (msg) => {
    io.emit('message', msg);
  });

  socket.on('disconnect', (socket) => {
    io.emit('message','A user has left')
  })
});

server.listen(port, () => {
  console.log(`Running on port ${port}`);
});