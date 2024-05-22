const socketio = require('socket.io');

function initializeSocket(httpServer) {
    
    const io = socketio(httpServer, {
        cors: {
            origin: process.env.VITE_FE_PORT,
            methods: ['GET', 'POST']
        },
    });

    io.on('connection', (socket) => {
        socket.on('chat', data => {
            io.sockets.emit('chat', data);
        });

        socket.on('notification', data => {
            io.sockets.emit('notification', data);
        });
    });
}

module.exports = initializeSocket;
