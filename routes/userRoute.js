import express from "express";
import { createUser, deleteUser, getUser, getUserById, updateUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/users", getUser);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id", updateUser);

export default router;
