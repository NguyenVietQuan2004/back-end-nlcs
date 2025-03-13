import { getOneYearFromNow } from "../utils/time.js";
import authService from "../services/auth-service.js";
import handleError from "../error/error.js";

// const setAuthCookies = (res, { accessToken, refreshToken }) => {
//   res.setHeader("Set-Cookie", [
//     `accessToken=${accessToken}; Path=/; HttpOnly; Expires=${getOneYearFromNow().toUTCString()}; Secure; SameSite=None`,
//     `refreshToken=${refreshToken}; Path=/; HttpOnly; Expires=${getOneYearFromNow().toUTCString()}; Secure; SameSite=None`,
//   ]);
// };

// [POST] /auth/register
export const register = async (req, res) => {
  try {
    const userRegistrationSuccess = await authService.registerWithAccount(req.body);

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Registration successful!",
      data: userRegistrationSuccess,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Registration");
  }
};

// [POST] /auth/login
export const login = async (req, res) => {
  try {
    const { accessToken, refreshToken, ...user } = await authService.login(req.body);

    // setAuthCookies(res, { accessToken, refreshToken });
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Login successful.",
      data: {
        email: user.email || "",
        phone_number: user.phone_number || "",
        fullname: user.fullname,
        avatar: user.avatar,
        accessToken,
        refreshToken,
      },
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Login");
  }
};

// [POST] /auth/refresh-token
export const refreshToken = async (req, res) => {
  const authHeader = req.headers.authorization;

  const refresh_token = authHeader ? authHeader.split(" ")[1] : null;

  try {
    const token = await authService.refreshToken(refresh_token);

    // setAuthCookies(res, { accessToken, refreshToken });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Refresh token successful.",
      data: token,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Refresh token");
  }
};

// [POST] /auth/logout
export const logout = async (req, res) => {
  const authHeader = req.headers.authorization;

  const accessToken = authHeader ? authHeader.split(" ")[1] : null;

  try {
    await authService.logout(accessToken);
    res.setHeader("Set-Cookie", [
      "accessToken=; Path=/; HttpOnly; Max-Age=0; Secure; SameSite=None",
      "refreshToken=; Path=/; HttpOnly; Max-Age=0; Secure; SameSite=None",
    ]);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Logout successful",
      data: null,
      error: null,
    });
  } catch (error) {
    return handleError(res, error, "Logout");
  }
};
