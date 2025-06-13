const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // // Optional:
      connectTimeoutMS: 3000,
      // serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
      // maxPoolSize: 10, // Maximum number of sockets in the connection pool
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // const users = await mongoose.connection.db
    //   .collection("users")
    //   .find()
    //   .toArray();
    // console.log("📋 Existing Users:", users);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    // Graceful shutdown in case of connection failure
    process.exit(1);
  }
};

// Optional: Event listeners for better debugging
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
