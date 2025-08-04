const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const configurePassport = require("./config/passport");

// Load env variables
dotenv.config();

// Connect to DB
connectDB();

configurePassport();

// ✅ Initialize app BEFORE using it
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://mosaic-tour-app.vercel.app",
];

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Required for cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // needed methods
    allowedHeaders: ["Content-Type", "Authorization"], // needed headers
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "favicon.ico"));
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes")); // <-- Only add this after app is defined

app.use("/dev", require("./routes/development"));

module.exports = app;
