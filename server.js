const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servi file statici dalla directory corrente
app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('Un utente si è connesso');

  socket.on('chatMessage', (data) => {
    socket.broadcast.emit('chatMessage', data);
  });

  socket.on('userConnected', (user) => {
    socket.broadcast.emit('chatMessage', {
      user: 'Sistema',
      message: `${user} si è unito alla chat.`,
    });
  });

  socket.on('userDisconnected', (user) => {
    socket.broadcast.emit('chatMessage', {
      user: 'Sistema',
      message: `${user} ha lasciato la chat.`,
    });
  });

  socket.on('disconnect', () => {
    console.log('Utente disconnesso');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});
