const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

module.exports = {
  async register({ email, password, name }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error("User with this email already exists");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepository.create({ email, passwordHash, name });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    return { user, token };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new Error("Invalid credentials");

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    return { user, token };
  },

  async getProfile(userId) {
    return userRepository.findById(userId);
  },
};
