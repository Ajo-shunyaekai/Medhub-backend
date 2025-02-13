const express = require("express");
const router = express.Router();
const {
  createSubscription,
  savePayment,
  sendEmailConfirmation,
  getSubscriptionDetils,
} = require("../controller/Subscription");
const multer = require("multer");

// Setup multer for file upload
const upload = multer({ dest: "uploads/" }); // Specify the folder for file storage

// Route for creating subscription
router.post("/create-subscription", createSubscription);

// Route for saving payment with file upload
router.post("/save-payment", savePayment);
// Add 'upload.single('file')' to handle file upload for 'save-payment' route
router.post(
  "/send-confimation-mail",
  upload.single("invoice_pdf"),
  sendEmailConfirmation
);
// Route for get subscription detils
router.post("/:id", getSubscriptionDetils);

module.exports = router;
