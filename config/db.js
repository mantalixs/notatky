const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Loaded DB FILE:", __filename);
    console.log("ENV MONGO_URI:", process.env.MONGO_URI);

    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
