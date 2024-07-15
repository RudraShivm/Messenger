import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import userRouter from "./routes/user.js";
import chatRouter from "./routes/chat.js";
import inviteRouter from './routes/invite.js';
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://absolutelyoriginalmessenger.netlify.app",
    // origin: "*",
    methods: ["GET", "POST"],
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
  .catch((error) => console.log(error));

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Database connected");

  const userChangeStream = db.collection("usermodels").watch();
  const chatChangeStream = db.collection("chatmodels").watch();

  userChangeStream.on("change", (change) => {
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
  });

  chatChangeStream.on("change", (change) => {
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
  });
});

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
