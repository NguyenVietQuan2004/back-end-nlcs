import authenticate from "../middlewares/authenticate.js";
import express from "express";
import {
  createBillboard,
  deleteBillboard,
  getAllBillboard,
  getBillboard,
  updateBillboard,
} from "../controllers/billboard-controller.js";
const router = express();

router.post("/create-billboard", authenticate, createBillboard);
router.get("/get-all", getAllBillboard);
router.get("/", getBillboard);
router.put("/", authenticate, updateBillboard);
router.delete("/", authenticate, deleteBillboard);

export default router;
