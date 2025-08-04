const { configDotenv } = require("dotenv");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
configDotenv(); // Load env in config files
const {
  generateRefreshToken,
  generateAccessToken,
} = require("../utils/tokenActions");
const LocalStrategy = require("passport-local").Strategy;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SERVER_URL } = process.env;

// const localStrategy = new LocalStrategy(
//   {
//     usernameField: "email",
//     passwordField: "password",
//     passReqToCallback: true,
//   },
//   async (email, password, done) => {
//     try {
//       if (!email || !password)
//         return done(null, false, {
//           success: false,
//           status: 400,
//           message: "Please provide email and password",
//         });

//       const user = await User.findOne({ email }).select("+password");

//       if (!user) return done(null, false, { message: "Invalid credentials." });

//       if (user.provider !== "local")
//         return done(null, false, {
//           success: false,
//           status: 400,
//           message: "Account uses Social login",
//         });

//       const isMatch = await user.comparePassword(password);
//       if (!isMatch)
//         return done(null, false, {
//           success: false,
//           status: 400,
//           message: "Invalid credentials",
//         });

//       const refreshToken = generateRefreshToken(user);
//       const accessToken = generateAccessToken(user);

//       user.refreshToken = refreshToken;
//       await user.save({ validateBeforeSave: false });

//       req.tokens = { refreshToken, accessToken };
//       req.userData = user.getPublicProfile();

//       return done(null, user);
//     } catch (err) {
//       return done(err.message);
//     }
//   }
// );

// passport.use("local", localStrategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${SERVER_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          let user = await User.findOne({ email });

          if (!user) {
            user = new User({
              email,
              name: profile.displayName,
              googleId: profile.id,
              provider: "google",
              avatar: profile.photos[0].value,
              verified: true,
              verifiedAt: Date.now(),
            });
          } else if (user.provider !== "google") {
            // user.provider = [...user.provider, "google"];
            user.googleId = profile.id;
            user.avatar = profile.photos?.[0]?.value || user.avatar;
            user.verified = true;
            if (!user.verifiedAt) user.verifiedAt = Date.now();
          }
          await user.save();
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};

module.exports = configurePassport;
