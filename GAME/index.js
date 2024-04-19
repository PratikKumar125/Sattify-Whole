const express = require("express");
const http = require("http");
const socket = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db/connection.js");
const { decode } = require("./utils/jwt.js");
const userModel = require("./db/models/user.js");
const authController = require("./controllers/authController");
const { channel } = require("./utils/rabbitMQ");
const { redis_client } = require("./utils/redis.js");

dotenv.config();
const app = express();
const httpServer = http.createServer(app);
const io = socket(httpServer, {
  cors: {
    origin: "*",
    allowedHeaders: "*",
  },
});

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  return res.send({ msg: "Everything Working" });
});
app.post("/login", authController.login);

// Socket logic
const GAMEID = "hello";
io.on("connection", async (socket) => {
  console.log("New user connected with socket id as", socket.id);
  const user = await decode(socket?.handshake?.headers?.token);
  console.log(user, "<<USER");
  // console.log(io.engine.clientsCount, "<<SIZE");
  // if (io.engine.clientsCount > 1) {
  //   console.log("KAAM DONE BHAI< AANGE KA DEKH");
  //   // socket.to().("new:user:joined", { uid: user?.user?._id });
  // }
  await redis_client.set(`${user?.user?._id}`, JSON.stringify(socket.id));
  console.log("SAVED IN REDIS DONE");

  socket.on("lobby:join", async (userData) => {
    socket.join(`${GAMEID}-LOBBY`);
    await redis_client.rPush(
      `${GAMEID}-LOBBY`,
      JSON.stringify({ ...userData, socketId: socket.id })
    );
    if ((await redis_client.LLEN(`${GAMEID}-LOBBY`)) >= 2) {
      const user1 = JSON.parse(await redis_client.lPop(`${GAMEID}-LOBBY`));
      const user2 = JSON.parse(await redis_client.lPop(`${GAMEID}-LOBBY`));

      //join them to a game room
      // Emit a message to join a room
      const room_name = `${GAMEID}-GAME-1`;
      // store user count in redis
      if (!redis_client.get(`${room_name}-USER-COUNT-BEFORE_JOIN`)) {
        await redis_client.set(`${room_name}-USER-COUNT-BEFORE_JOIN`, 1);
        io.to(user1.socketId).emit("joinRoom", {
          room: room_name,
          choice: "HEADS",
        }); //create random room name
      } else {
        io.to(user1.socketId).emit("joinRoom", {
          room: room_name,
          choice: "TAILS",
        }); //create random room name
      }

      //Match done
      io.to(user1.socketId)
        .to(user2.socketId)
        .emit("match:done", { user1, user2 });
      await redis_client.set(`${room_name}-ANSWER`, "TAILS");
    } else {
      socket.emit("match:waiting", {
        message: "We are connecting you with your game partner",
      });
    }
  });

  socket.on("joinRoom", async (data) => {
    const room_name = `${GAMEID}-GAME-1`;
    const user_count_in_room = await redis_client.get(
      `${data.roomName}-USER-COUNT`
    );
    console.log(user_count_in_room, "<<<<<<========user count in room");
    await redis_client.set(
      `${data.token}-ROOM`,
      JSON.stringify({ room: data.roomName, choice: data.choice })
    ); //is user ka room ka naam store kia
    await redis_client.set(
      `${data.roomName}-USER-${data.token}`,
      JSON.stringify({ ...data, socketId: socket.id })
    ); //room ke through user ki details fetch krna

    if (!user_count_in_room) {
      await redis_client.set(
        `${data.roomName}-USER-1`,
        JSON.stringify({ ...data, socketId: socket.id })
      ); //room ke through user ki details fetch krna
      await redis_client.set(`${room_name}-USER-COUNT`, "1");
      console.log("setting user count to 1");
    } else {
      await redis_client.set(
        `${data.roomName}-USER-2`,
        JSON.stringify({ ...data, socketId: socket.id })
      ); //room ke through user ki details fetch krna

      //send to queue to calculate result
      const user1 = await redis_client.get(`${data.roomName}-USER-1`);
      const user2 = await redis_client.get(`${data.roomName}-USER-1`);
      console.log(user1, user2, "<<<<======USERS TO SEND TO QUEUE");
      // const payload = JSON.stringify({ user1, user2 });
      // channel.sendToQueue("result", Buffer.from(payload));
      // await new Promise((res, rej) => {
      //   setTimeout(() => res(), 3000);
      // });
      // const result = await redis_client.get(`${data.room}-ANSWER`);
      // io.to(data.roomName).emit("result", {
      //   result,
      // });
      console.log("sent to queue done");
    }
    socket.join(data.roomName);
    socket.leave(`${GAMEID}-LOBBY`);
  });

  socket.on("result", async (data) => {
    console.log(data, "<<<<<<RESULT EVENT DATA PAYLOAD");
    const result = await redis_client.get(`${data.room}-ANSWER`);
    io.to(data?.room).emit("result", {
      result,
    });
  });

  socket.on("message", async (message) => {
    // console.log(
    //   "RECEIVED MESSAGE",
    //   message,
    //   "FROM",
    //   socket?.handshake?.headers?.token
    // );
    // message={{
    //   text: "Great game glad to find this platform",
    //   when: new Date(),
    // }}
    // user={{ name: "Pratik Kumar", slug: "" }}
    const user = await decode(socket?.handshake?.headers?.token);
    const db_user = await userModel.find({ _id: user?.user?._id });
    io.emit("message", {
      text: message,
      when: new Date(),
      from: db_user[0]?.name,
      slug: db_user[0]?.profileSlug,
    });
  });

  socket.on("call:user", async (data) => {
    const { uid, offer } = data;
    const sender = await decode(socket?.handshake?.headers?.token);
    const db_user = await userModel.find({ _id: sender?.user?._id });
    const sender_socket_id = await redis_client.get(_id);
    socket
      .to(sender_socket_id)
      .emit("incoming:call", { from: db_user?._id, offer });
  });

  socket.on("call:accepted", async (data) => {
    const { sender, ans } = data;
    const caller_socketId = await redis_client.get(sender);
    socket.to(caller_socketId).emit("call:accepted", { ans });
  });
});

const PORT = process.env.PORT || 9001;
httpServer.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});
