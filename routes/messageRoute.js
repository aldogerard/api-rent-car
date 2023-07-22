import express from "express";
import { createMessage, deleteMessage, getMessage, getMessageById } from "../controllers/messageController.js";

const router = express.Router();

router.get("/message", getMessage);
router.get("/message/:id", getMessageById);
router.post("/message", createMessage);
router.delete("/message", deleteMessage);

export default router;
