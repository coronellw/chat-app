const path = require('path');
const http = require('http');
const Filter = require('bad-words');
const express = require('express');
const socketio = require('socket.io');

const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages');

const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
} = require('./utils/users');

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

io.on('connection', (socket) => {

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit('message', generateMessage('Admin', 'Welcome!!!'));
    socket
      .broadcast
      .to(user.room)
      .emit('message', generateMessage('Admin', `${user.username} has joined!`));
    io
      .to(user.room)
      .emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });

  });

  socket.on('sendMessage', (msg, callback) => {
    const user = getUser(socket.id);
    if (!user) {
      return callback({ error: 'invalid user' });
    } else {
      const filter = new Filter();

      if (filter.isProfane(msg)) {
        return callback('Profanity is not allowed')
      }
      console.log(`Shoud send a message from ${user.username}`);
      io.to(user.room).emit('message', generateMessage(user.username, msg));
      return callback();
    }
  });

  socket.on('sendLocation', ({ latitude, longitude }, callback) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        'locationMessage',
        generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`
        ));
      return callback();
    } else {
      return callback({ error: 'invalid user' });
    }
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io
        .to(user.room)
        .emit('message', generateMessage('Admin', `${user.username} has left ${user.room}`));

      io
        .to(user.room)
        .emit('roomData', {
          room: user.room,
          users: getUsersInRoom(user.room),
        });
    }
  });

  socket.on('typing', () => {
    socket.broadcast.emit('typing', `${socket.id} is typing a message`);
  })
});

server.listen(port, () => {
  console.log(`Running on port ${port}`);
});