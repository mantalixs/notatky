/* eslint-env node, jest */

const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

jest.mock("../../../models/User", () => ({
  create: jest.fn(),
  findOne: jest.fn(),
}));
jest.mock("bcryptjs");

const authRoutes = require("../../../routes/authRoutes");
const User = require("../../../models/User");

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret";
});

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/auth", authRoutes);
  return app;
}

describe("Auth integration", () => {
  const app = createApp();

  test("POST /auth/register — успішна реєстрація", async () => {
    User.findOne.mockResolvedValueOnce(null); // користувача ще нема
    bcrypt.hash.mockResolvedValueOnce("hashed-pass");
    User.create.mockResolvedValueOnce({
      _id: "u1",
      email: "test@example.com",
    });

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "test@example.com", password: "secret123" });

    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(300);
    expect(User.create).toHaveBeenCalled();
  });

  test("POST /auth/login — повертає токен", async () => {
    bcrypt.compare.mockResolvedValueOnce(true);
    User.findOne.mockResolvedValueOnce({
      _id: "u1",
      email: "test@example.com",
      password: "hashed-pass",
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com", password: "secret123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();

    const payload = jwt.decode(res.body.token);
    expect(payload).toBeTruthy();
  });
});
