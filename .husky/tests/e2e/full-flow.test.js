/* eslint-env node, jest */

const express = require("express");
const request = require("supertest");

jest.mock("../../../models/User", () => ({
  create: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock("../../../models/Note", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn((password) => Promise.resolve("hashed-" + password)),
  compare: jest.fn(() => Promise.resolve(true)),
}));

const authRoutes = require("../../../routes/authRoutes");
const noteRoutes = require("../../../routes/noteRoutes");
const User = require("../../../models/User");
const Note = require("../../../models/Note");
const errorHandler = require("../../../middlewares/errorHandler");

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret";
});

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/auth", authRoutes);
  app.use("/notes", noteRoutes);
  app.use(errorHandler);
  return app;
}

describe("Full E2E flow: register → login → CRUD notes", () => {
  const app = createApp();
  let token;

  test("1) Register user", async () => {
    User.findOne.mockResolvedValueOnce(null);
    User.create.mockResolvedValueOnce({
      _id: "u-e2e",
      email: "e2e@example.com",
    });

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "e2e@example.com", password: "secret123" });

    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(300);
  });

  test("2) Login and receive token", async () => {
    User.findOne.mockResolvedValueOnce({
      _id: "u-e2e",
      email: "e2e@example.com",
      password: "hashed-secret",
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "e2e@example.com", password: "secret123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test("3) Create note", async () => {
    Note.create.mockResolvedValueOnce({
      _id: "note-1",
      title: "E2E note",
      text: "Body",
      user: "u-e2e",
    });

    const res = await request(app)
      .post("/notes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "E2E note", text: "Body" });

    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(300);
  });

  test("4) Get notes list", async () => {
    Note.find.mockReturnValueOnce({
      sort: jest
        .fn()
        .mockResolvedValueOnce([
          { _id: "note-1", title: "E2E note", text: "Body", user: "u-e2e" },
        ]),
    });

    const res = await request(app)
      .get("/notes")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test("5) Delete note", async () => {
    Note.findOneAndDelete.mockResolvedValueOnce({
      _id: "note-1",
      title: "E2E note",
      text: "Body",
      user: "u-e2e",
    });

    const res = await request(app)
      .delete("/notes/note-1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});
