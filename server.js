const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

let onlineUsers = {};

io.on("connection", (socket) => {
  let user = null;

  socket.on("userConnected", (username) => {
    user = username;
    onlineUsers[user] = socket;
  });

  socket.on("chatMessage", (data) => {
    // Broadcast to all users except the sender
    for (let name in onlineUsers) {
      if (name !== data.user) {
        onlineUsers[name].emit("chatMessage", data);
      }
    }
  });

  socket.on("userDisconnected", (username) => {
    if (user) delete onlineUsers[user];
  });

  socket.on("disconnect", () => {
    if (user) delete onlineUsers[user];
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.listen(PORT, () => {
  console.log(`✅ Server attivo su http://localhost:${PORT}`);
});
