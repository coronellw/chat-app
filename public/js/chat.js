const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const linkTemplate = document.querySelector('#link-template').innerHTML;
const dateFormat = 'HH:mm:ss';

$messageFormButton.setAttribute('disabled', true);

/**
 * All listening for socket io
 */
socket.on('welcome', (msg) => {
  console.log(msg);
});

socket.on('message', (msg) => {
  console.log(msg);

  const html = Mustache.render(messageTemplate, {
    msg: msg.text,
    createdAt: moment(msg.createdAt).format(dateFormat)
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('typing', msg => {
  console.log(msg);
});

socket.on('locationMessage', url => {
  const html = Mustache.render(linkTemplate, {
    url: url.url,
    createdAt: moment(url.createdAt).format(dateFormat)
  })
  $messages.insertAdjacentHTML('beforeend', html);
});

/**
 * All event listener, potential emitters
 */

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute('disabled', 'disabled');

  socket.emit('sendMessage', $messageFormInput.value, error => {
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log('Message delivered');
  });
});

$messageFormInput.addEventListener('keyup', e => {
  if (e.target.value.length > 0) {
    socket.emit('typing');
    $messageFormButton.removeAttribute('disabled')
  } else {
    $messageFormButton.setAttribute('disabled', 'disabled');
  }
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }
  $sendLocationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    const { coords } = position;
    const { latitude, longitude } = coords
    socket.emit('sendLocation', { latitude, longitude }, () => {
      $sendLocationButton.removeAttribute('disabled');
      console.log('Location shared!');
    });
  });
});
