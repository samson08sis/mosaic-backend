const { generateAccessToken, generateRefreshToken } = require("./tokenActions");
const { NODE_ENV } = process.env;

const cookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const setAuthCookies = (res, user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  try {
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
  return refreshToken;
};

const unsetAuthCookies = (res) => {
  try {
    res.clearCookie("accessToken", { httpOnly: true, secure: true });
    res.clearCookie("refreshToken", { httpOnly: true, secure: true });
  } catch (error) {
    console.log("ERROR UNSETTING COOKIES: ", error.message);
  }
};

module.exports = { setAuthCookies, unsetAuthCookies };
