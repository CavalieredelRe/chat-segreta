const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rotta per la homepage
app.get('/', (req, res) => {
  /opt/render/project/src/public/index.html
});

// Traccia utenti connessi
let onlineUsers = {};

io.on("connection", (socket) => {
  let user = null;

  // Quando un utente si connette
  socket.on("userConnected", (username) => {
    user = username;
    onlineUsers[user] = socket;
    console.log(`🟢 ${user} connesso`);
  });

  // Quando riceve un messaggio
  socket.on("chatMessage", (data) => {
    for (let name in onlineUsers) {
      if (name !== data.user) {
        onlineUsers[name].emit("chatMessage", data);
      }
    }
  });

  // Quando l'utente si disconnette manualmente
  socket.on("userDisconnected", () => {
    if (user) {
      delete onlineUsers[user];
      console.log(`🔴 ${user} disconnesso manualmente`);
    }
  });

  // Quando la connessione viene persa
  socket.on("disconnect", () => {
    if (user) {
      delete onlineUsers[user];
      console.log(`🔴 ${user} disconnesso`);
    }
  });
});

// Avvia il server
server.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
});
