var _this;
const io = require('socket.io')({
    cors: {
        origin: process.env.BASE_URL,
        credentials: true
    }
});

class socketFunctions {
    /**
     * constructor
     */
    constructor() {
        _this = this;
        io.on('connection', client => {
            client.on('join', function (room) {
                client.join(room);
            });
        });
        io.listen(process.env.SOCKET_PORT);
    };

    sendCronStatusEvent(data) {
        io.to("updateCronStatus").emit("updateCronStatus",JSON.stringify(data));
    }
}

module.exports = socketFunctions;