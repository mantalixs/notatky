const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    let uri;

    if (process.env.RENDER === "true") {
      uri = ATLAS_URI;
    } else {

      uri = process.env.MONGO_URI || ATLAS_URI;
    }

    console.log("Using Mongo URI:", uri);

    await mongoose.connect(uri);

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
