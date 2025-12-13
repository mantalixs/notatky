/* eslint-env node, jest */

const errorHandler = require("../../../middlewares/errorHandler");

// приглушуємо console.error
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

function mockRes() {
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

test("errorHandler повертає 400 і повідомлення помилки", () => {
  const err = new Error("Щось пішло не так");
  const res = mockRes();

  errorHandler(err, {}, res, () => {});

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toBe("Щось пішло не так");
});

test("errorHandler повертає Unexpected error, якщо повідомлення відсутнє", () => {
  const err = {};
  const res = mockRes();

  errorHandler(err, {}, res, () => {});

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toBe("Unexpected error");
});
