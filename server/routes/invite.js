import express from "express";
import { createInvite, getInvite } from "../controller/invite.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/:inviteId", getInvite);
router.post("/create", auth, createInvite);

export default router;
