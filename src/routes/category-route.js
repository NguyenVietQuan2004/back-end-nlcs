import authenticate from "../middlewares/authenticate.js";
import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategory,
  getCategory,
  updateCategory,
} from "../controllers/category-controller.js";
const router = express();

router.post("/create-category", authenticate, createCategory);
router.get("/get-all", getAllCategory);
router.get("/", getCategory);
router.put("/", authenticate, updateCategory);
router.delete("/", authenticate, deleteCategory);

export default router;
