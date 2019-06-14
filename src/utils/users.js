const users = [];

// addUser, removeUser, getUser, getUsersInRoom

// ADD USER
const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if(!username || !room) {
        return {
            error: 'Username and Room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
            return user.room === room && user.username === username;
    });

    // Validate username
    if(existingUser) {
        return {
            error: 'User is in use!'
        }
    }

    // Store User
    const user = { id, username, room };
    users.push(user);
    return { user };    
};

// REMOVE USER
const removeUser = id => {
    const index = users.findIndex((user) => user.id === id);

    if (index != -1) {
        return users.splice(index, 1)[0]; // [0] use because return object instead of array
    }
};

// GET USER
const getUser = id => {
    return users.find(user => user.id === id);
};

// GET USERS IN ROOM
const getUsersInRoom = room => {
    return users.filter(user => user.room === room);
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};