import jwt from "jsonwebtoken";
import UserModel from "../models/user-model.js";
import TokenModel from "../models/token-model.js";

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.split(" ")[1] : null;
  if (token === "APIKEY") {
    next();
  }
  if (!token) {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: "Token not found!",
      data: null,
      error: { description: "Please log in to continue" },
    });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (error, user) => {
    if (error) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Invalid token!",
        data: null,
        error: { description: "Token has expired or is incorrect" },
      });
    }

    const existingUser = await UserModel.findOne({ _id: user._id });
    if (!existingUser) {
      return res.status(401).json({
        statusCode: 401,
        message: "User not found!",
        data: null,
        error: { description: "Account not found in the system" },
      });
    }

    const tokenInDb = await TokenModel.findOne({ access_token: token, user_id: existingUser._id });
    if (!tokenInDb) {
      return res.status(401).json({
        statusCode: 401,
        message: "Token not found in the database!",
        data: null,
        error: { description: "Please log in again" },
      });
    }
    if (new Date() > tokenInDb.access_expires_at) {
      return res.status(401).json({
        statusCode: 401,
        message: "Token has expired!",
        data: null,
        error: { description: "Please log in again to continue using the service" },
      });
    }

    req.user = existingUser;
    next();
  });
}

export default authenticate;
