/* eslint-env node, jest */

jest.mock("../../../models/User", () => ({
  create: jest.fn(),
  findOne: jest.fn(),
}));

const request = require("supertest");
const express = require("express");

const usersRoutes = require("../../../routes/userRoutes");
const User = require("../../../models/User");

const app = express();
app.use(express.json());
app.use("/users", usersRoutes);

describe("Users integration", () => {
  test("Реєстрація", async () => {
    User.create.mockResolvedValue({ id: "1", email: "test@mail.com" });

    const res = await request(app)
      .post("/users/register")
      .send({ email: "test@mail.com", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(User.create).toHaveBeenCalled();
  });

  test("Логін", async () => {
    User.findOne.mockResolvedValue({
      id: "1",
      email: "test@mail.com",
      comparePassword: () => true,
    });

    const res = await request(app)
      .post("/users/login")
      .send({ email: "test@mail.com", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
