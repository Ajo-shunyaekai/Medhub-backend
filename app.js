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
const { stripeWebhook } = require("./controller/Subscription2");
const logErrorToFile = require("./logs/errorLogs");
const {
  sendErrorResponse,
  handleCatchBlockError,
} = require("./utils/commonResonse");
const { rateLimiter } = require("./middleware/expressRateLimiter");
const { corsOptions } = require("./config/corsOptions");
const https = require("https");
const http = require("http");
const { URL } = require("url");
//---------------------- PDF Proxy Handler ----------------------//
app.get("/pdf-proxy/*", async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params[0]);
    const s3Url = `${process.env.S3_URL}/${filename}`;
    const parsedUrl = new URL(s3Url);
    const protocol = parsedUrl.protocol === "https:" ? https : http;
 
    res.setHeader("Access-Control-Allow-Origin", "*");
 
    protocol
      .get(s3Url, (s3Res) => {
        res.setHeader(
          "Content-Type",
          s3Res.headers["content-type"] || "application/pdf"
        );
        s3Res.pipe(res);
      })
      .on("error", (err) => {
        console.error("Proxy error:", err);
        res.status(500).send("Error fetching PDF from S3.");
      });
  } catch (error) {
    handleCatchBlockError(req, res, error);
  }
});

//---------------------- DB Connection ----------------------//
connect();

//---------------------- Cron Jobs ----------------------//
// require("./schedulers/tasks");
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.originalUrl}`);
//   next();
// })

//---------------------- Static Folders ----------------------//
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "build")));
app.use("/uploads", express.static("uploads"));
const uploadFolderPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolderPath)) {
  fs.mkdirSync(uploadFolderPath);
}

//---------------------- CORS & Cookie ----------------------//
app.use(cors(corsOptions));
app.use(cookieParser());

//---------------------- Stripe Webhook (RAW BODY) ----------------------//
app.post(
  "/api/stripe-webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhook
);

//---------------------- JSON Parsers (after webhook!) ----------------------//
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: false }));

//---------------------- Main Routes ----------------------//
require("./index")(app);

//---------------------- Global Error Handler ----------------------//
app.use((err, req, res, next) => {
  handleCatchBlockError(req, res, err);
});
 
const ADMIN_ID = process.env.ADMIN_ID;
//---------------------- Start Server ----------------------//
const PORT = process.env.PORT || 2222;
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
//---------------------- Initialize WebSocket ----------------------//
initializeSocket(server);
 
module.exports = app;