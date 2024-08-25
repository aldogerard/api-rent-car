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
router.post("/product", upload.single("image"), createProduct);
router.delete("/product/:id", upload.none(), deleteProduct);
router.patch("/product/:id", upload.single("image"), updateProduct);

export default router;
