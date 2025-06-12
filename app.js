const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// Load env variables
dotenv.config();

// Connect to DB
connectDB();

// ✅ Initialize app BEFORE using it
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // Required for cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // needed methods
    allowedHeaders: ["Content-Type", "Authorization"], // needed headers
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes")); // <-- Only add this after app is defined
app.use("/", require("./routes/simpleRoutes"));

module.exports = app;
