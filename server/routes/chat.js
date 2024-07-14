import express from "express";
import { loadChat, postMessage, createChat } from "../controller/chat.js";
import {auth} from '../middleware/auth.js';
const router = express.Router();

router.get('/:chatId', loadChat);
router.post('/:chatObjId/:chatId', auth, postMessage);
router.post('/create', auth, createChat);
export default router;