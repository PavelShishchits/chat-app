
class UsersService {
    static users = [];

    constructor() {}

    addUser({ id, username, room}) {
        username = username.trim().toLowerCase();
        room = room.trim().toLowerCase();

        if (!username || !room) {
            return {
                error: 'username and room are required'
            }
        }

        if (this.userExist(username, room)) {
            return {
                error: 'User is already exist'
            }
        }

        const user = { id, username, room };

        UsersService.users.push(user);

        return {
            user
        }
    }

    removeUser(id) {
        const index = UsersService.users.findIndex((user) => user.id === id);
        if (index >= 0) {
            return UsersService.users.splice(index, 1)[0];
        }
    }

    getUser(id) {
        return UsersService.users.find((user) => user.id === id);
    }

    getUsersInRoom(room) {
        return UsersService.users.filter((user) => user.room === room);
    }

    userExist(username, room) {
        return UsersService.users.find((user) => user.room === room && user.username === username);
    }
}

module.exports = UsersService;
