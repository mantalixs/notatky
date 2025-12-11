const mongoose = require("mongoose");

const ATLAS_URI =
  "mongodb+srv://notatky_user:Notatky12345@cluster0.dseieg2.mongodb.net/notatky?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    let uri;

    // Якщо це Render – використовуємо завжди Atlas URI
    if (process.env.RENDER === "true") {
      uri = ATLAS_URI;
    } else {
      // Локально – з .env, а якщо немає, тоді теж Atlas
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
