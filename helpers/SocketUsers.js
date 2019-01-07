class SocketUsers {
    constructor() {
        this.users = [];
    }

    AddUserData(socketId, id, name, image, room) {
        var users = { socketId, id, name, image, room };
        this.users.push(users);
        return users;
    }

    RemoveUser(socketId) {
        var user = this.GetUser(socketId);
        if (user) {
            this.users = this.users.filter((data) => data.socketId !== socketId);
        }
        return user;
    }

    GetUser(socketId) {
        var getUser = this.users.filter((data) => {
            return data.socketId === socketId;
        })[0];
        return getUser;
    }

    GetUsersList(room) {
        var users = this.users.filter((data) => data.room === room);

        var namesArray = users.map((data) => {
            return data;
        });

        return namesArray;
    }
}

module.exports = { SocketUsers };