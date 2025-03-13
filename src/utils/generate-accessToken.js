import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { BadRequestError } from "../error/error.js";
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY;
const SECRET_KEY_REFRESH = process.env.JWT_SECRET_KEY_REFRESH;
const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE;
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE;

export const generateTokens = (user) => {
  try {
    if (!user || !user._id) {
      throw new BadRequestError("Invalid user data for token generation");
    }

    const payload = {
      _id: user._id,
      email: user.email || user.phone_number,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRE });
    const refreshToken = jwt.sign(payload, SECRET_KEY_REFRESH, { expiresIn: REFRESH_TOKEN_EXPIRE });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Lỗi tạo token:", error.message);
    throw new InternalServerError("Token generation error!");
  }
};
