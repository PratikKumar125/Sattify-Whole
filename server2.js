const express = require("express");
const socket = require("socket.io");
const redis = require("redis");
var amqp = require("amqplib/callback_api");
const app = express();
const db = require("./db/connection.js");
const cors = require("cors");
const jsonwebtoken = require("jsonwebtoken");
const dotenv = require("dotenv");
const userModel = require("./db/models/user.js");
const httpServer = require("http").createServer(app);
const getUserDetails = require("./utils/firebase.js");
dotenv.config();
// const redis_client = redis.createClient({
//   legacyMode: true,
//   socket: {
//     host: process.env.REDIS_HOST || "172.17.0.1",
//     port: process.env.REDIS_PORT || 6379,
//   },
// });
let channel;

function connectRabbit() {
  return new Promise((resolve, reject) => {
    amqp.connect("amqp://localhost:5672", function (error0, connection) {
      if (error0) {
        reject(error0);
      }
      connection.createChannel(function (error1, ch) {
        if (error1) {
          reject(error1);
        }
        channel = ch;
        var queue = "result";

        channel.assertQueue(queue, {
          durable: false,
        });

        resolve();
      });
    });
  });
}

(async () => {
  try {
    app.use(
      cors({
        origin: "*",
      })
    );
    app.use(express.json());

    //connection for rabbitmq
    await connectRabbit();

    //connection for redis
    const redis_client = redis.createClient(6379);
    redis_client.connect();
    redis_client.on("error", (err) => {
      console.log(err);
    });
    const PORT = process.env.PORT ? process.env.PORT : 9001;
    const GAMEID = "GAME127127";

    //connection for sockets
    const io = new socket.Server(httpServer, {
      cors: {
        origin: "*",
        allowedHeaders: "*",
      },
    });

    io.on("connection", async (socket) => {
      console.log("New user connected with socket id as", socket.id);
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
          const payload = JSON.stringify({ user1, user2 });
          channel.sendToQueue("result", Buffer.from(payload));
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
    });

    app.post("/login", async (req, res) => {
      const user = await getUserDetails(req.body.uid);
      const doesUserExists = await userModel.find({ email: user.email });
      if (doesUserExists) {
        const token = await jsonwebtoken.sign(
          { user: doesUserExists[0] },
          "PRATEEKKUMARISMYNAMEBAYAANKRDUJYADATUMSUNOTOSAHI"
        );
        return res.status(200).send({ user: doesUserExists[0], token });
      }
      const new_user = await userModel.create({
        name: user.displayName,
        email: user.email,
        profileSlug: user.photoURL,
      });
      const token = await jsonwebtoken.sign(
        { user: new_user[0] },
        "PRATEEKKUMARISMYNAMEBAYAANKRDUJYADATUMSUNOTOSAHI"
      );
      return res.status(200).send({ user: new_user, token });
    });
    httpServer.listen(PORT, () => {
      console.log(`Server listening at port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
  }
})();

// adding args, env, volumes, entrypoint in docker compose and practical use-cases

//connect -> lobby -> match -> handle user1 & user2 -> give random choice -> timer -> calculate result
/*
1) show you and other
2) show you won or you loose
3) dynamic room name
4) Push notifications
5) How to show result at real-time if using queues?
*/
