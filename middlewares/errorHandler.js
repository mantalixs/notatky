module.exports = function errorHandler(_err, req, res, _next) {
  console.error(_err);
  res.status(400).json({ message: _err.message || "Unexpected error" });
};
