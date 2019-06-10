const path = require('path');
const http = require('http');
const Filter = require('bad-words');
const express = require('express');
const socketio = require('socket.io');

const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages');

const Users = require('./utils/users');

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

io.on('connection', (socket) => {

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = Users.addUser({ id: socket.id, username, room });
    const roomUsers = Users.getUsersInRoom(room);
    socket.join(room)
    if (error) {
      return callback(error);
    }

    socket.emit('message', generateMessage('Welcome!!!'));
    socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`));
    io.to(user.room).emit('updateUserList', roomUsers)
  });

  socket.on('sendMessage', (msg, callback) => {
    const filter = new Filter();
    const user = Users.getUser(socket.id);

    if (filter.isProfane(msg)) {
      return callback('Profanity is not allowed')
    }

    io.to(user.room).emit('message', generateMessage(user.username, msg));
    callback();
  });

  socket.on('sendLocation', ({ latitude, longitude }, callback) => {
    const user = Users.getUser(socket.id);
    socket.broadcast.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`
      ));
    callback();
  });

  socket.on('disconnect', () => {
    const { error, user } = Users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage(`${user.username} left ${user.room}`));
    }
  });

  socket.on('typing', () => {
    const user = Users.getUser(socket.id);
    socket.broadcast.to(user.room).emit('typing', `${user.username} is typing a message`);
  })
});

server.listen(port, () => {
  console.log(`Running on port ${port}`);
});