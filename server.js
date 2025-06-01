const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./middleware/logger");

// Load env variables
dotenv.config();

// Connect to DB
connectDB();

// ✅ Initialize app BEFORE using it
const app = express();

// Middleware
app.use(logger);
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes")); // <-- Only add this after app is defined

// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
