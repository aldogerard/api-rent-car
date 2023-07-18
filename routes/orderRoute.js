import express from "express";
import { checkOrder, createOrder, deleteOrder, getOrder, getOrderById, paymentOrder, updateOrder } from "../controllers/orderController.js";

const router = express.Router();

router.get("/order", getOrder);
router.get("/order/:id", getOrderById);
router.get("/order/check/:id", checkOrder);
router.post("/order", createOrder);
router.patch("/order/payment/:id", paymentOrder);
router.delete("/order/:id", deleteOrder);
router.patch("/order/:id", updateOrder);

export default router;
