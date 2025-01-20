const { rateLimit } = require("express-rate-limit");

// Create a global rate limiter
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.", // Custom message
  handler: (req, res, next, options) => {
    console.log(`Global Rate limit exceeded for IP: ${req.ip}`);
    return res.status(options.statusCode).json({
      status: 0,
      code: options.statusCode,
      message: "Too many requests from this IP, please try again later.",
    });
  },
  onLimitReached: (req, res, options) => {
    console.log(`Global rate limit reached for IP: ${req.ip}`);
  }
});

// Create a rate limiter for a single route
const limiterForSingleRoute = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2, // Limit each IP to 2 requests per windowMs
  keyGenerator: (req) => req.ip,
  handler: (req, res, next, options) => {
    console.error(`Single route rate limit exceeded for IP: ${req.ip}`);
    return res.json({
      status: 0,
      code: options.statusCode,
      message: ['Rate limit exceeded. Try again later.'],
    });
  },
  onLimitReached: (req, res, options) => {
    console.log(`Single route rate limit reached for IP: ${req.ip}`);
  }
});

module.exports = { rateLimiter, limiterForSingleRoute };
