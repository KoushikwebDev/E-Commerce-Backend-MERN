const asyncHandler = require("../middleware/bigPromise");

exports.home = asyncHandler((req, res) => {
  res.status(200).json({
    success: true,
    greeting: "Hello Form Rest Api.",
  });
});
