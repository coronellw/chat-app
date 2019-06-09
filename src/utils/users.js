const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room = "limbo" }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate the data
  if(!username || !room) {
    return {
      error: 'Username and room are required'
    }
  }

  // check for existing user
  const existingUser = users.find(user => user.username === username && user.room === room)

  if(existingUser) return { error: 'Username is taken in this room'};

  // store user
  const user = { id, username, room };

  users.push(user);
  return { user };
}

const removeUser = id => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return { error: 'User not found'}
  }
  
  return users.splice(index, 1)[0];
}

const getUser = id => {
  return users.find(user => user.id === id);
}

const getUsersInRoom = room => {
  return users.filter(user => user.room === room);
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}
