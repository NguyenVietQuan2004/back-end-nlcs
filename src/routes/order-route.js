import { createOrder, deleteOrder, getAllOrders, overviewOrder, updateOrder } from "../controllers/order-controller.js";
import authenticate from "../middlewares/authenticate.js";
import express from "express";

const router = express();

router.post("/create-order", createOrder);
router.get("/get-all", authenticate, getAllOrders);
router.get("/", authenticate, overviewOrder);
router.put("/", authenticate, updateOrder);
router.delete("/", authenticate, deleteOrder);

export default router;
