/* eslint-env node, jest */

const jwt = require("jsonwebtoken");
const authMiddleware = require("../../../middlewares/authMiddleware");

jest.mock("jsonwebtoken");

describe("authMiddleware unit tests", () => {
  test("Пропускає, якщо токен валідний", () => {
    jwt.verify.mockReturnValue({ id: "123" });

    const req = {
      headers: { authorization: "Bearer VALID_TOKEN" },
    };

    const res = {};
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "VALID_TOKEN",
      process.env.JWT_SECRET,
    );
    expect(req.user.id).toBe("123");
    expect(next).toHaveBeenCalled();
  });

  test("Повертає 401, якщо токен відсутній", () => {
    const req = { headers: {} };
    const res = {
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
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
    expect(next).not.toHaveBeenCalled();
  });

  test("Повертає 401, якщо токен невалідний", () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("invalid token");
    });

    const req = {
      headers: { authorization: "Bearer BAD_TOKEN" },
    };

    const res = {
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

    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });
});
