const { setAuthCookies } = require("./cookieActions");

const logUserIn = async (res, user, statusCode) => {
  try {
    const refreshToken = setAuthCookies(res, user);
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    const userData = user.getPublicProfile();

    res.status(statusCode).json({
      success: true,
      user: userData,
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

module.exports = { logUserIn };
