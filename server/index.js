import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import userRouter from "./routes/user.js";
import chatRouter from "./routes/chat.js";
import inviteRouter from "./routes/invite.js";
import { auth } from "./middleware/auth.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_BASE_URL,
    methods: ["GET", "POST", "PATCH"],
  },
});

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/user", userRouter);
app.use("/chat", chatRouter);
app.use("/invite", inviteRouter);
const MONGOOSE_URL = process.env.MONGOOSE_URL;
const PORT = process.env.PORT;

mongoose
  .connect(MONGOOSE_URL)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  })
  .catch((error) => console.error(error));

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Database connected");

  const userChangeStream = db.collection("usermodels").watch();
  const chatChangeStream = db.collection("chatmodels").watch();

  // the idea for queuing is genius. The problem was client side was getting the actions emitted
  // but failed to be synchronous making it hard to updating app state in a multiple operation situation
  // Thanks to copilot and whichever source copilot used . :)
  // Queue to ensure order of events
  const eventQueue = [];
  let processingQueue = false;

  const processQueue = async () => {
    if (processingQueue) return;
    processingQueue = true;

    while (eventQueue.length > 0) {
      const { change, type } = eventQueue.shift();
      switch (type) {
        case "user":
          switch (change.operationType) {
            case "insert":
              io.emit("userCreated", change);
              break;
            case "delete":
              io.emit("userDeleted", change);
              break;
            case "update":
              io.emit("userUpdated", change);
              break;
          }
          break;
        case "chat":
          switch (change.operationType) {
            case "insert":
              io.emit("chatCreated", change);
              break;
            case "delete":
              io.emit("chatDeleted", change);
              break;
            case "update":
              io.emit("chatUpdated", change);
              break;
          }
          break;
      }
    }

    processingQueue = false;
  };

  userChangeStream.on("change", (change) => {
    eventQueue.push({ change, type: "user" });
    processQueue();
  });

  chatChangeStream.on("change", (change) => {
    eventQueue.push({ change, type: "chat" });
    processQueue();
  });
});

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
