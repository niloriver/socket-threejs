const http = require("http"),
  express = require("express"),
  app = express(),
  socketIo = require("socket.io");

const server = http.Server(app).listen(8080);
const io = socketIo(server);

app.use("/", express.static(__dirname + "/../client/desktop/"));
app.use("/mobile", express.static(__dirname + "/../client/mobile/"));

io.sockets.on("connection", socket => {
  socket.on("mobile connected", () => {
    io.emit("start");
  });

  socket.on("orientation", function(e) {
    io.emit("mobile orientation", e);
  });
});
