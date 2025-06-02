const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Optional: Show all users after DB connection (for debugging)

    // const users = await mongoose.connection.db
    //   .collection("users")
    //   .find()
    //   .toArray();
    // console.log("📋 Existing Users:", users);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
