const http = require("http");
const cors = require("cors");

const server = http.createServer((req, res) => {
  // Handle HTTP requests if needed
});

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from any origin, you can set this to a specific domain if needed
    methods: ["GET", "POST"], // Allow only GET and POST requests
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle chat messages
  socket.on("chat message", (message) => {
    io.emit("chat message", message); // Broadcast the message to all connected clients
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(3001, () => {
  console.log("WebSocket server listening on port 3001");
});
