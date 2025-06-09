const multer = require("multer");
const mime = require("mime-types");
const path = require("path");
const fs = require("fs");

const { sendErrorResponse } = require("../../utils/commonResonse");
const logErrorToFile = require("../../logs/errorLogs");
const { uploadMultipleFiles } = require("../../helper/aws-s3");

// Allowed MIME types for CSV files
const allowedCSVTypes = ["text/csv", "application/vnd.ms-excel"];

// Filter to allow only CSV files for the `csvFile` field
const fileFilter = (req, file, cb) => {
  const { fieldname, mimetype } = file;

  if (fieldname === "csvFile") {
    if (!allowedCSVTypes.includes(mimetype)) {
      return cb(new Error("Only CSV files are allowed."), false);
    }
    return cb(null, true);
  }

  // Reject all other fields
  return cb(new Error("Invalid field. Only 'csvFile' is allowed."), false);
};

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "./uploads/bulkUploads";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const { userId, category } = req.body;
    const ext = mime.extension(file.mimetype) || "csv";
    cb(
      null,
      `${file.fieldname}-${file.originalname.replace(
        /\s+/g,
        ""
      )}-${userId}-${category}-${Date.now()}.${ext}`
    );
  },
});

// Initialize multer
const upload = multer({ storage: storage, fileFilter: fileFilter });

// CSV upload middleware
const bulkProductCSVUpload = (req, res, next) => {
  upload.fields([{ name: "csvFile", maxCount: 4 }])(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      logErrorToFile(err, req);
      const status = err.message.includes("CSV") ? 400 : 500;
      return sendErrorResponse(res, status, err.message, err);
    }

    if (!req?.files?.csvFile) {
      return sendErrorResponse(res, 400, "No CSV file uploaded.");
    }

    try {
      // Upload files to S3
      const { usertype } = req.headers;
      const uploadedFiles = {
        csvFile: await uploadMultipleFiles(req.files.csvFile, true, usertype),
      };

      // Remove local files
      req.files.csvFile.forEach((file) => {
        const filePath = path.resolve(file.destination, file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error(`Failed to delete file ${filePath}:`, err);
          });
        }
      });

      req.uploadedFiles = uploadedFiles;
      next();
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      logErrorToFile(uploadError, req);
      return sendErrorResponse(
        res,
        500,
        "Failed to process uploaded CSV files.",
        uploadError
      );
    }
  });
};

module.exports = { bulkProductCSVUpload };
