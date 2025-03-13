import authenticate from "../middlewares/authenticate.js";
import express from "express";
import {
  createImagesHomePage,
  getImagesHomePage,
  updateImagesHomePage,
} from "../controllers/homepage-image-controller.js";
const router = express();

router.post("/create-homepage", authenticate, createImagesHomePage);
router.get("/", getImagesHomePage);
router.put("/", authenticate, updateImagesHomePage);

export default router;
