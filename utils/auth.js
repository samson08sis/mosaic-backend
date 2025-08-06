const { setAuthCookies } = require("./cookieActions");
const { generateAccessToken } = require("./tokenActions");

const logUserIn = async (res, user, statusCode) => {
  try {
    const refreshToken = setAuthCookies(res, user);
    user.refreshToken = refreshToken;
    const accessToken = generateAccessToken(user);

    await user.save({ validateBeforeSave: false });
    const userData = user.getPublicProfile();
    res.setHeader("Cross-Origin-Opener-Policy", "restrict-properties");
    typeof statusCode === "number"
      ? res.status(statusCode).json({
          success: true,
          user: userData,
        })
      : res.send(`
        <html>
          <body>
            <script>
              window.location.href = "${process.env.WEB_URN}/api/auth/google/callback?accessToken=${accessToken}&refreshToken=${refreshToken}";
            </script>
          </body>
        </html>
      `);
    // res.send(`
    //   <html>
    //     <body>
    //       <script>
    //         window.opener.postMessage({
    //           success: true,
    //           accessToken: "${accessToken}",
    //           refreshToken: "${refreshToken}"
    //         }, "https://mosaic-tour-app.vercel.app");
    //         window.close();
    //       </script>
    //     </body>
    //   </html>
    // `);
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

module.exports = { logUserIn };
