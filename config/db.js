const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connectionState = mongoose.connection.readyState;
    if (connectionState === 1) {
      console.log("❄️  Mongoose already connected");
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {});

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("💥 MongoDB connection failed:", error.message);
    // Shutdown in case of connection failure
    process.exit(1);
  }
};

// Event listeners for debugging
mongoose.connection.on("connected", () => {
  console.log("❄️  Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.log(`Mongoose connection error: ${err}`);
});

mongoose.connection.on("disconnected", () => {
  console.log("🔗 Mongoose disconnected");
});

module.exports = connectDB;
