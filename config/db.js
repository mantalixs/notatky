const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error(
        "MONGO_URI=mongodb+srv://notatky_user:Notatky12345@cluster0.dseieg2.mongodb.net/notatky?retryWrites=true&w=majority&appName=Cluster0\n",
      );
    }

    await mongoose.connect(uri); // без зайвих опцій

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
