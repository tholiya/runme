var socket = null;
class socketFunctions {
    /**
     * constructor
     */
    constructor() {
        socket = io(socket_base_url);
        socket.on("connect", () => {
            console.log(socket.id); // x8WIv7-mJelg7on_ALbx
        });
    };

    receiveCronStatusEvent() {
        socket.emit('join', 'updateCronStatus');
        socket.on('updateCronStatus', function (notificationData) {
            notificationData = JSON.parse(notificationData);
            let className = (notificationData.isRunning ? 'badge-success' : 'badge-danger');
            $('#'+notificationData.id).html('<span class="badge badge-pill '+className+' badge-round badge-glow">&nbsp;&nbsp;&nbsp;</span>')
        });
    };
}
var socketFun = new socketFunctions();