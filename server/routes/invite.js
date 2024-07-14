import express from "express";
import { createInvite, getInvite } from "../controller/invite.js";

const router = express.Router();

router.get ('/:inviteId', getInvite);
router.post('/create', createInvite);

export default router;