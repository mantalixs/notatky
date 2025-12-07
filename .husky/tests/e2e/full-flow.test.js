/* eslint-env node, jest */

jest.mock("../../../models/User", () => ({
  create: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock("../../../models/Note", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

const request = require("supertest");
const express = require("express");

const usersRoutes = require("../../../routes/userRoutes");
const notesRoutes = require("../../../routes/noteRoutes");

const app = express();
app.use(express.json());
app.use("/users", usersRoutes);
app.use("/notes", notesRoutes);

describe("Full E2E flow: register → login → CRUD notes", () => {
  let token;

  test("1) Register", async () => {
    const User = require("../../../models/User");
    User.create.mockResolvedValue({ id: "1", email: "a@a.com" });

    const res = await request(app)
      .post("/users/register")
      .send({ email: "a@a.com", password: "123456" });

    expect(res.statusCode).toBe(200);
  });

  test("2) Login", async () => {
    const User = require("../../../models/User");
    User.findOne.mockResolvedValue({
      id: "1",
      email: "a@a.com",
      comparePassword: () => true,
    });

    const res = await request(app)
      .post("/users/login")
      .send({ email: "a@a.com", password: "123456" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();

    token = res.body.token;
  });

  test("3) Create note", async () => {
    const Note = require("../../../models/Note");
    Note.create.mockResolvedValue({ id: "n1" });

    const res = await request(app)
      .post("/notes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "test", text: "txt" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  test("4) Get notes list", async () => {
    const Note = require("../../../models/Note");
    Note.find.mockReturnValue({
      sort: () => [{ id: "n1", title: "abc" }],
    });

    const res = await request(app)
      .get("/notes")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("5) Delete note", async () => {
    const Note = require("../../../models/Note");
    Note.findOneAndDelete.mockResolvedValue({ id: "n1" });

    const res = await request(app)
      .delete("/notes/n1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBeDefined();
  });
});
