import { createStore, deleteStore, getAllStore, getStore, updateStore } from "../controllers/store-controller.js";
import authenticate from "../middlewares/authenticate.js";
import express from "express";

const router = express();

router.post("/create-store", authenticate, createStore);
router.get("/get-all", authenticate, getAllStore);
router.get("/", getStore);
router.put("/", authenticate, updateStore);
router.delete("/", authenticate, deleteStore);

export default router;
