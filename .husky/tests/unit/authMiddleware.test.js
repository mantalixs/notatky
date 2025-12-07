/* eslint-env node, jest */

const jwt = require("jsonwebtoken");
const authMiddleware = require("../../../middlewares/authMiddleware");

jest.mock("jsonwebtoken");

function createRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe("authMiddleware unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Пропускає, якщо токен валідний", () => {
    process.env.JWT_SECRET = "test-secret";

    jwt.verify.mockReturnValue({ id: "123" });

    const req = {
      headers: {
        authorization: "Bearer VALID_TOKEN",
      },
    };
    const res = createRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "VALID_TOKEN",
      process.env.JWT_SECRET,
    );

    expect(req.userId).toBe("123");

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeNull();

    // next викликаний
    expect(next).toHaveBeenCalled();
  });

  test("Повертає 401, якщо токен відсутній", () => {
    const req = { headers: {} };
    const res = createRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);

    expect(res.body).toEqual({ message: "Not authorized" });

    expect(next).not.toHaveBeenCalled();
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  test("Повертає 401, якщо токен невалідний", () => {
    process.env.JWT_SECRET = "test-secret";

    jwt.verify.mockImplementation(() => {
      throw new Error("bad token");
    });

    const req = {
      headers: {
        authorization: "Bearer BAD_TOKEN",
      },
    };
    const res = createRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(res.statusCode).toBe(401);

    expect(res.body).toEqual({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });
});
