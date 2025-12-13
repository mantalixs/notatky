/* eslint-env node, jest */

const express = require("express");
const request = require("supertest");

jest.mock("../../../models/Note", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

jest.mock("../../../middlewares/authMiddleware", () => {
  return (req, res, next) => {
    req.userId = "u1";
    next();
  };
});

const noteRoutes = require("../../../routes/noteRoutes");
const Note = require("../../../models/Note");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/notes", noteRoutes);
  return app;
}

describe("Notes integration", () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /notes — успішне створення нотатки", async () => {
    Note.create.mockResolvedValueOnce({
      _id: "n1",
      title: "Test",
      text: "Body",
      user: "u1",
    });

    const res = await request(app)
      .post("/notes")
      .send({ title: "Test", text: "Body" });

    expect(res.statusCode).toBeGreaterThanOrEqual(200);
    expect(res.statusCode).toBeLessThan(300);

    // Перевіряємо, що Note.create викликали з userId
    expect(Note.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Test",
        text: "Body",
        user: "u1",
      }),
    );

    expect(res.body).toBeDefined();
  });

  test("GET /notes — повертає список нотаток користувача", async () => {
    // Note.find(...).sort(...), тому повертаємо об'єкт із sort()
    Note.find.mockReturnValueOnce({
      sort: jest
        .fn()
        .mockResolvedValueOnce([
          { _id: "n1", title: "Test", text: "Body", user: "u1" },
        ]),
    });

    const res = await request(app).get("/notes");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]._id).toBe("n1");
  });
});
