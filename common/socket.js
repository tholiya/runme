var _this;

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
    };

    sendCronStatusEvent(data) {
        io.to("updateCronStatus").emit("updateCronStatus",JSON.stringify(data));
    }
}

module.exports = socketFunctions;