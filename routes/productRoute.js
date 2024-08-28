import express from "express";
import {
  getProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import upload from "../config/multer.js";

const router = express.Router();

router.get("/product", getProduct);
router.get("/product/:id", getProductById);
router.post("/product", createProduct);
router.delete("/product/:id",  deleteProduct);
router.patch("/product/:id", updateProduct);

export default router;
