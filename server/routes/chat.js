import express from "express";
import {
  loadChat,
  postMessage,
  createChat,
  reactMessage,
  addToSeenBy,
  updateNickName,
  addToGroup,
} from "../controller/chat.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();
//donot assign same kind of url that can be mixed up
// [ `/:chatId` & `/create` ] is mixed up when request arrives with url ending with `/create`

router.get("/load/:chatId", loadChat);
router.post("/create", auth, createChat);
router.post("/addToGroup", auth, addToGroup);
router.post("/postMessage/:chatId", auth, postMessage);
router.patch("/postEmoji", auth, reactMessage);
router.patch("/addToSeenBy", auth, addToSeenBy);
router.patch("/updateNickName", auth, updateNickName);
export default router;
