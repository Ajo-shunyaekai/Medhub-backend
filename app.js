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
const { websiteEnquiryEmail } = require("./controller/website");
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

// Serve HTML files of website
const routes = [
  { paths: ["/", "/index.html", "/index"], file: "index.html" },
  { paths: ["/about.html", "/about"], file: "about.html" },
  { paths: ["/buyer.html"], file: "buyer.html" },
  { paths: ["/supplier.html"], file: "supplier.html" },
  { paths: ["/pricing.html", "/pricing"], file: "pricing.html" },
  { paths: ["/contact-us.html", "/contact-us"], file: "contact-us.html" },
  {
    paths: ["/privacy-policy.html", "/privacy-policy"],
    file: "privacy-policy.html",
  },
  {
    paths: ["/terms-and-conditions.html", "/terms-and-conditions"],
    file: "terms-and-conditions.html",
  },
  {
    paths: ["/request-a-demo.html", "/request-a-demo"],
    file: "request-a-demo.html",
  },
];

routes.forEach((route) => {
  app.get(route.paths, (req, res) => {
    res.sendFile(path.join(__dirname, "public", route.file));
  });
});

// Serve video file from the uploads folder
app.use("/videos", express.static(path.join(__dirname, "uploads/hls")));

// website enquiry email
app.post("/send-email", websiteEnquiryEmail);

// API routes
app.use(`/api/auth`, require(`./routes/authRoutes`));
app.use(`/api/product`, require(`./routes/productRoutes`));
// app.use(`/api/order-history`,orderHistoryRoutes)
app.use("/api/address", require(`./routes/addressRoutes`));
app.use("/api/subscription", require("./routes/subscriptionRoutes"));
app.use("/api/logistics", require(`./routes/logisticsPartnerRoutes`));
app.use("/api/admin", require("./routes/adminRoutes")());
app.use("/api/medicine", require("./routes/medicineRoute")());
app.use("/api/buyer/medicine", require("./routes/medicineRoute")());
app.use("/api/supplier/medicine", require("./routes/medicineRoute")());
app.use("/api/admin/medicine", require("./routes/medicineRoute")());
app.use("/api/buyer", require("./routes/buyerRoutes")());
app.use("/api/supplier", require("./routes/supplierRoutes")());
app.use("/api/order", require("./routes/orderRoutes")());
app.use("/api/enquiry", require("./routes/enquiryRoutes")());
app.use("/api/purchaseorder", require("./routes/purchaseOrderRoutes")());
app.use("/api/invoice", require("./routes/invoiceRoutes")());

app.get(["/*"], (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const ADMIN_ID = process.env.ADMIN_ID;
const PORT = process.env.PORT || 2222;

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

const server = app.listen(PORT, (req, res) => {
  console.log(`server is runnig http://localhost:${PORT}/`);
});

initializeSocket(server);

module.exports = app;
