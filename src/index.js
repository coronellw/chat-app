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

let count = 0;

io.on('connection', (socket) => {
  console.log('New webSocket connection');
  socket.emit('countUpdated', count);

  socket.on('increment', () => {
    console.log('increment received');
    
    count +=1;
    socket.emit('countUpdated', 'everyone by you')
    io.emit('countUpdated', count);
  });
});

server.listen(port, () => {
  console.log(`Running on port ${port}`);
});