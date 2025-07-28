const express = require("express");
const router = express.Router();
const {
  createSubscription,
  // savePayment,
  // sendEmailConfirmation,
  getSubscriptionDetils,
  sendSubscriptionPaymentReqUrl,
  addubscriptionPaymentReqUrl,
} = require("../controller/Subscription2");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Import fs module
const mime = require("mime-types"); // Import mime-types for handling file extensions
const { sendErrorResponse } = require("../utils/commonResonse");
const logErrorToFile = require("../logs/errorLogs");
const { uploadMultipleFiles } = require("../helper/aws-s3");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define upload path for temporary storage
    let uploadPath = "./uploads/common";
    cb(null, uploadPath); // Store files temporarily in uploads/common
  },
  filename: (req, file, cb) => {
    const ext = mime.extension(file.mimetype) || "bin"; // Default to 'bin' for unknown MIME types
    cb(
      null,
      `${file.fieldname?.replaceAll("New", "")}-${file.originalname
        ?.replaceAll(" ", "")
        ?.replaceAll("." + ext, "")}-${Date.now()}.${ext}` // Use timestamp for unique filenames
    );
  },
});

// Initialize multer for handling file upload
const upload = multer({ storage: storage });

const subsIvoiceUpload = (req, res, next) => {
  upload.fields([{ name: "invoice_pdf", maxCount: 1 }])(
    req,
    res,
    async (err) => {
      if (err) {
        console.error("Multer Error:", err); // Log the error to console for debugging
        logErrorToFile(err, req); // Log the error to a file for persistence
        if (err.message.includes("Invalid file format")) {
          return sendErrorResponse(res, 400, err.message, err); // Respond with 400 for invalid file format
        }
        return sendErrorResponse(res, 500, "File upload error", err); // Send a general error response for other cases
      }

      let uploadedFiles = {};

      const getUploadedFilesPath = async () => {
        if (req?.files?.["invoice_pdf"]) {
          uploadedFiles["invoice_pdf"] = await uploadMultipleFiles(
            (req?.files?.["invoice_pdf"] || [])?.map((file) => ({
              ...file,
              path: file.path,
              filename: file.filename,
              contentType: file.mimetype,
            }))
          );
        }

        // Function to remove the files from the local file system
        const removeLocalFiles = (files) => {
          files.forEach((file) => {
            // Resolve the absolute file path
            // const filePath = path.resolve(uploadPath, file.filename);
            const filePath = path.resolve(file?.destination, file.filename);

            // Check if the file exists before trying to delete it
            if (fs.existsSync(filePath)) {
              fs.unlink(filePath, (err) => {
                if (err) {
                  console.error(
                    `\n\n\n\nFailed to delete file ${filePath}:`,
                    err
                  );
                } else {
                }
              });
            } else {
              console.error(`File not found: ${filePath}`);
            }
          });
        };

        // Remove uploaded files from local storage
        removeLocalFiles([...(req?.files?.["invoice_pdf"] || [])]);

        req.uploadedFiles = uploadedFiles;
        next();
      };

      // Call the function to handle the uploaded files
      await getUploadedFilesPath();
    }
  );
};

// Route for creating subscription with invoice upload
router.post("/create-subscription", subsIvoiceUpload, createSubscription);

// Route for requesting subscription payment
router.post("/send-req/:userType/:id", sendSubscriptionPaymentReqUrl);

// Route for adding subscription payment url
router.post("/add-subscription-payment-url/:userType/:userId", addubscriptionPaymentReqUrl);

// Route to get subscription details
router.post("/:id", getSubscriptionDetils);

module.exports = router;
