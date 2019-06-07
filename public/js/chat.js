const socket = io();

socket.on('welcome', (msg) => {
  console.log(msg);
});

socket.on('message', (msg) => {
  console.log(msg);
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
  e.preventDefault();
  socket.emit('sendMessage', e.target.elements.msg.value);
});
