import moment from "moment";
import TokenModel from "../models/token-model.js";
import UserModel from "../models/user-model.js";
import { generateTokens } from "../utils/generate-accessToken.js";
import bcrypt from "bcryptjs";
import { BadRequestError, ConflictError, UnauthorizedError } from "../error/error.js";
import { isValidAccount, isValidUser } from "../utils/auth-verify.js";
import jwt from "jsonwebtoken";
const registerWithAccount = async (user) => {
  isValidAccount(user);
  if (user.method !== "account") {
    throw new BadRequestError("Invalid registration method!");
  }
  const query = user.email
    ? { email: user.email, method: "account" }
    : { phone_number: user.phone_number, method: "account" };
  const existingUser = await UserModel.findOne(query);

  if (existingUser) {
    throw new ConflictError("User is already exist!");
  }
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const newUser = new UserModel({
    ...user,
    password: hashedPassword,
  });
  await newUser.save();
  return {
    fullname: user.fullname,
    email: user.email,
    phone_number: user.phone_number,
  };
};

const createAndSaveTokens = async (user) => {
  const tokens = generateTokens(user);

  const accessExpireTime = moment().add(parseInt(process.env.ACCESS_TOKEN_EXPIRE), "days");
  const refreshExpireTime = moment().add(parseInt(process.env.REFRESH_TOKEN_EXPIRE), "days");

  const token = new TokenModel({
    user_id: user._id,
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    access_expires_at: accessExpireTime,
    refresh_expires_at: refreshExpireTime,
  });
  await token.save();
  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, ...user };
};

const loginWithAccount = async (user) => {
  const existingUser = await UserModel.findOne({ email: user.email, method: "account" }).lean();
  let match = existingUser ? await bcrypt.compare(user.password, existingUser.password) : false;

  if (!existingUser || !match) {
    throw new UnauthorizedError("Account information or password is incorrect!");
  }

  return await createAndSaveTokens(existingUser);
};

const loginWithGoogleId = async (user) => {
  let existingUser = await UserModel.findOne(
    user.email ? { email: user.email, method: "google" } : { phone_number: user.phone_number, method: "google" }
  ).lean();

  if (!existingUser) {
    existingUser = new UserModel(user);
    await existingUser.save();
    existingUser = existingUser.toObject();
  }

  return await createAndSaveTokens(existingUser);
};

const login = async (userFromClient) => {
  isValidUser(userFromClient);
  const loginMethods = {
    account: async () => await loginWithAccount(userFromClient),
    google: async () => await loginWithGoogleId(userFromClient),
  };

  return loginMethods[userFromClient.method]();
};

const logout = async (access_token) => {
  // const refresh_token = cookies.refreshToken;
  if (!access_token) {
    throw new BadRequestError("Missing token when logout.");
  }

  await TokenModel.deleteOne({ access_token });
};

const refreshToken = async (refresh_token) => {
  if (!refresh_token) {
    throw new BadRequestError("Refresh token not found");
  }
  let user;
  try {
    user = jwt.verify(refresh_token, process.env.JWT_SECRET_KEY_REFRESH);
  } catch (error) {
    console.error("JWT Verification Error:", error); // 🔥 Log lỗi chi tiết
    throw new BadRequestError(`Invalid refresh token! Reason: ${error.message}`);
  }

  const existingUser = await UserModel.findOne({ _id: user._id }).lean();
  if (!existingUser) {
    throw new UnauthorizedError("User does not exist!");
  }

  const tokenInDb = await TokenModel.findOne({ refresh_token, user_id: existingUser._id });
  if (!tokenInDb) {
    throw new UnauthorizedError("Refresh token not found in database!");
  }

  if (new Date() > tokenInDb.access_expires_at) {
    throw new UnauthorizedError("Refresh token has expired!");
  }
  const tokens = await createAndSaveTokens(existingUser);
  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
};

export default { registerWithAccount, login, logout, refreshToken };
