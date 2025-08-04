const { setAuthCookies } = require("./cookieActions");

const logUserIn = async (res, user, statusCode) => {
  try {
    const refreshToken = setAuthCookies(res, user);
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    const userData = user.getPublicProfile();
    typeof statusCode === "number"
      ? res.status(statusCode).json({
          success: true,
          user: userData,
        })
      : res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({
                success: true,
                user: ${JSON.stringify(userData)}
              }, window.location.origin);
              window.close();
            </script>
          </body>
        </html>
      `);
  } catch (err) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

module.exports = { logUserIn };
