const server = require('./app');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage } = require('./utils/messages');
const UserService = require('./utils/users');
const io = socketio(server);

const handleSocketConnection = (socket) => {

    const adminName = 'Admin';
    const userService = new UserService();

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = userService.addUser({ id: socket.id, username, room });

        if (error) {
            return callback(error);
        }

        socket.join(user.room)

        socket.emit('message', generateMessage({
            text: `${user.username}, welcome to the chat`,
            username: adminName,
        }));

        socket.broadcast.to(user.room).emit('message', generateMessage({
            text: `${user.username} has joined`,
            username: adminName,
        }));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: userService.getUsersInRoom(user.room),
        });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = userService.getUser(socket.id);
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed');
        }
        io.to(user.room).emit('message', generateMessage({text: message, ...user}));
        callback('Message was delivered');
    });

    socket.on('sendLocation', ({lat, long}, callback) => {
        const user = userService.getUser(socket.id);
        io.emit('locationMessage', generateMessage({url: `https://www.google.com/maps?q=${lat},${long}`, ...user}));
        callback();
    })

    socket.on('disconnect', () => {
        const user = userService.removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage({
                text: `${user.username} has left`,
                username: adminName,
            }));

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: userService.getUsersInRoom(user.room),
            });
        }
    });
}

io.on('connection', handleSocketConnection);

server.listen(process.env.PORT, () => {
    console.log(`App is running on http://localhost:${process.env.PORT}`)
});