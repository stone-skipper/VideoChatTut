const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const PORT = process.env.PORT || 5000;
const INDEX = "/index.html";

io.on("connection", (socket) => {
  socket.emit("me", socket.id);
  console.log(socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
    console.log("callUser", data);
  });

  socket.on("switchMode", (data) => {
    socket.broadcast.emit("switchMode", {
      blur: data.blur,
      opacity: data.opacity,
      openHole: data.openHole,
      holeSize: data.holeSize,
      holePos: data.holePos,
      postit: data.postit,
    });
    console.log("switchMode", data);
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(process.env.PORT || PORT, function () {
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});

app.get("/", (req, res) =>
  res.send("Hello World! Server is running on " + PORT)
);
