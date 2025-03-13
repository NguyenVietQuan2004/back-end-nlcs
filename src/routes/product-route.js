import authenticate from "../middlewares/authenticate.js";
import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  getAllProductById,
  getProduct,
  updateProduct,
} from "../controllers/product-controller.js";
const router = express();

router.post("/create-product", authenticate, createProduct);
router.get("/get-all", getAllProduct);
router.get("/", getProduct);
router.post("/get-by-ids", getAllProductById);
router.put("/", authenticate, updateProduct);
router.delete("/", authenticate, deleteProduct);

export default router;
