import express from "express";
import { register, login, refreshToken, logout } from "../controllers/auth-controller.js";
import authenticate from "../middlewares/authenticate.js";
const router = express();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh-token", refreshToken);
router.post("/logout", authenticate, logout);

export default router;
