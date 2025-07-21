const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Servire file statici dalla cartella "public"
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html alla root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let onlineUsers = {};

io.on("connection", (socket) => {
  let user = null;

  console.log("🔌 Nuova connessione");

  socket.on("userConnected", (username) => {
    user = username;
    onlineUsers[user] = socket;

    socket.broadcast.emit("chatMessage", {
      user: "Sistema",
      message: `${user} si è unito alla chat.`
    });
  });

  socket.on("chatMessage", (data) => {
    socket.broadcast.emit("chatMessage", data);
  });

  socket.on("userDisconnected", (username) => {
    if (user) {
      delete onlineUsers[user];
      socket.broadcast.emit("chatMessage", {
        user: "Sistema",
        message: `${user} ha lasciato la chat.`
      });
    }
  });

  socket.on("disconnect", (username) => {
    if (user) {
      delete onlineUsers[user];
      socket.broadcast.emit("chatMessage", {
        user: "Sistema",
        message: `${user} ha lasciato la chat.`
      });
    }
    console.log("❌ Disconnessione");
  });
});

// ✅ Solo UNA chiamata a server.listen()
server.listen(PORT, () => {
  console.log(`✅ Server attivo su http://localhost:${PORT}`);
});
