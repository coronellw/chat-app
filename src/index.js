const path = require('path');
const http = require('http');
const Filter = require('bad-words');
const express = require('express');
const socketio = require('socket.io');

const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages');

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

io.on('connection', (socket) => {
  socket.emit('message', generateMessage('Welcome!!!'));
  socket.broadcast.emit('message', generateMessage('A new user has joined!'));

  socket.on('sendMessage', (msg, callback) => {
    const filter = new Filter();

    if(filter.isProfane(msg)){
      return callback('Profanity is not allowed')
    }

    io.emit('message', generateMessage(`${socket.id}: ${msg}`));
    callback();
  });

  socket.on('disconnect', () => {
    io.emit('message',generateMessage('A user has left'))
  });

  socket.on('sendLocation', ({latitude, longitude}, callback) => {
    socket.broadcast.emit(
      'locationMessage',
      generateLocationMessage(`https://google.com/maps?q=${latitude},${longitude}`
    ));
    callback();
  });

  socket.on('typing', () => {
    socket.broadcast.emit('typing', `${socket.id} is typing a message`);
  })
});

server.listen(port, () => {
  console.log(`Running on port ${port}`);
});