require("dotenv").config();
const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const connect = require("./utils/dbConnection");
const initializeSocket = require("./utils/socketHandler");
// const ffmpeg = require('fluent-ffmpeg');
const logErrorToFile = require("./logs/errorLogs");
const { sendErrorResponse } = require("./utils/commonResonse");
const { rateLimiter } = require("./middleware/expressRateLimiter");
const { corsOptions } = require("./config/corsOptions");
// require('./schedulers/tasks');

// db-connection
connect();

// middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "build")));
app.use(cors(corsOptions));
app.use(cookieParser());
// app.use(rateLimiter)
app.use(bodyParser.json({ limit: "500000mb" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Path for the uploads folder
app.use("/uploads", express.static("uploads"));
const uploadFolderPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolderPath)) {
  fs.mkdirSync(uploadFolderPath);
}

// Import routes from index.js
require("./index")(app);

// Error-handling middleware
app.use((err, req, res, next) => {
  logErrorToFile(err, req); // Log the error
  return sendErrorResponse(
    res,
    500,
    "An unexpected error occurred. Please try again later.",
    err
  );
});

const ADMIN_ID = process.env.ADMIN_ID;
const PORT = process.env.PORT || 2222;

const server = app.listen(PORT, (req, res) => {
  console.log(`server is running on http://localhost:${PORT}/`);
});

initializeSocket(server);

module.exports = app;
