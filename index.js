const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { disconnect } = require("cluster");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const connectedUsers = {};

io.on("connection", (socket) => {
  console.log("a user connected: ", socket.id);
  socket.broadcast.emit('user_connected', socket.id);
  io.allSockets().then(socketids => {
    console.log('ALL socket ids : ', socketids.values());
    socket.emit('all_users', [...socketids]);
  });

  socket.on('disconnecting', () => {
    console.log('disconnecting ', socket.id); // the Set contains at least the socket ID
    socket.broadcast.emit('user_disconnecting', socket.id);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected: ", socket.id);
  });

  socket.on("message", (data) => {
    console.log("Data recieved: ", data, socket.id);

    socket.broadcast.emit("message", data);
  });

  socket.onAny((eventName, ...args) => {
    // console.log('Uncatched :', eventName, args);

    // socket.
  });

  socket.on('connection-offer', (data) => {
    console.log('connection-offer: ', data);
    socket.broadcast.emit('connection-offer', data);
  });

  socket.on('new-ice-candidate', data => {
    console.log('new-ice-candidate: ', data);
    socket.broadcast.emit('new-ice-candidate', data);
  });

  socket.on('connection-answer', data => socket.broadcast.emit('connection-answer', data));
});

server.listen(8000, () => {
  console.log("listening on *:8000");
});
