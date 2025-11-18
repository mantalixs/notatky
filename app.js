require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());
app.use(express.static("public"));

// маршрути
app.use("/auth", authRoutes);
app.use("/notes", noteRoutes);

// обробник помилок
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
