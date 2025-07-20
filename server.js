const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Servire i file statici dalla cartella "public"
app.use(express.static(path.join(__dirname, 'public')));

// Route base: servire index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let onlineUsers = {};

io.on("connection", (socket) => {
  let user = null;

  socket.on("userConnected", (username) => {
    user = username;
    onlineUsers[user] = socket;
  });

  socket.on("chatMessage", (data) => {
    for (let name in onlineUsers) {
      if (name !== data.user) {
        onlineUsers[name].emit("chatMessage", data);
      }
    }
  });

  socket.on("userDisconnected", () => {
    if (user) delete onlineUsers[user];
  });

  socket.on("disconnect", () => {
    if (user) delete onlineUsers[user];
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server avviato sulla porta ${PORT}`);
});
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
