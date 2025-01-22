const { rateLimit } = require("express-rate-limit");

// Create a global rate limiter
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.", // Custom message
});

// Create a rate limiter for a single route
const limiterForSingleRoute = rateLimit({
  windowMs: 60 * 1000, //15 *
  max: 2,
  keyGenerator: (req) => req.ip,
  handler: (req, res, next, options) => {
    console.error("Rate limit exceeded:", req.ip);
    return res.json({
      status: 0,
      code: options.statusCode,
      message: ["Rate limit exceeded. Try again later."],
    });
  },
});

module.exports = { rateLimiter, limiterForSingleRoute };