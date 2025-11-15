const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email і пароль обовʼязкові" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ message: "Користувач з таким email вже існує" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      email,
      password: hashed,
      name: email.split("@")[0], // тимчасове імʼя
    });

    res.json({ message: "Користувача створено" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка реєстрації" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Користувача не знайдено" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Невірний пароль" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка авторизації" });
  }
};
