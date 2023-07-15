import express from "express";
import { getProduct, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";

const router = express.Router();

// router.post("/product", upload.array("file"), (req, res) => {
//   console.log(req.body);
//   console.log(req.files);
// });

router.get("/product", getProduct);
router.get("/product/:id", getProductById);
router.post("/product", createProduct);
router.delete("/product/:id", deleteProduct);
router.patch("/product/:id", updateProduct);

export default router;
