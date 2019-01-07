class SocketAdmins {
    constructor() {
        this.admins = [];
    }

    AddAdminData(socketId, id, name, image, room) {
        var admins = { socketId, id, name, image, room };
        this.admins.push(admins);
        return admins;
    }

    RemoveAdmin(socketId) {
        var admin = this.GetAdmin(socketId);
        if (admin) {
            this.admins = this.admins.filter((data) => data.socketId !== socketId);
        }
        return admin;
    }

    GetAdmin(socketId) {
        var getAdmin = this.admins.filter((data) => {
            return data.socketId === socketId;
        })[0];
        return getAdmin;
    }

    GetRoomList(room) {
        var admins = this.admins.filter((data) => data.room === room);

        var namesArray = admins.map((data) => {
            return data;
        });

        return namesArray;
    }
}

module.exports = { SocketAdmins };