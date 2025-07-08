require("dotenv").config();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");
// const { sendErrorResponse } = require("../../utils/commonResonse");
const { uploadMultipleFiles } = require("../helper/aws-s3");

const createMulterMiddleware = (uploadConfig) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const { usertype } = req.headers;

      if (!usertype) {
        return cb(new Error("Need User Type"));
      }

      const fieldConfig = uploadConfig.find(
        (config) => config.fieldName === file.fieldname
      );

      let uploadPath = fieldConfig
        ? fieldConfig.uploadPath
        : "./uploads/default";

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = file.mimetype.split("/")[1];
      cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
    },
  });

  const upload = multer({ storage: storage });

  return (req, res, next) => {
    const fields = uploadConfig.map((config) => ({
      name: config.fieldName,
      maxCount: config.maxCount || 1,
    }));

    upload.fields(fields)(req, res, async (err) => {
      if (err) {
        console.error("Multer Error:", err);
        return res
          .status(500)
          .json({ error: "File upload error", details: err.message });
      }

      let uploadedFiles = {};

      const getUploadedFilesPath = async () => {
        if (req?.files?.["transaction_image"]) {
          uploadedFiles["transaction_image"] = await uploadMultipleFiles(
            // req?.files?.["transaction_image"] || []
            (req?.files?.["transaction_image"] || [])?.map((file) => ({
              ...file,
              path: file.path,
              filename: file.filename,
              contentType: file.mimetype,
            }))
          );
        }
        if (req?.files?.["complaint_image"]) {
          uploadedFiles["complaint_image"] = await uploadMultipleFiles(
            // req?.files?.["complaint_image"] || []
            (req?.files?.["complaint_image"] || [])?.map((file) => ({
              ...file,
              path: file.path,
              filename: file.filename,
              contentType: file.mimetype,
            }))
          );
        }
        if (req?.files?.["feedback_image"]) {
          uploadedFiles["feedback_image"] = await uploadMultipleFiles(
            // req?.files?.["feedback_image"] || []
            (req?.files?.["feedback_image"] || [])?.map((file) => ({
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
        removeLocalFiles([
          ...(req?.files?.["transaction_image"] || []),
          ...(req?.files?.["complaint_image"] || []),
          ...(req?.files?.["feedback_image"] || []),
        ]);

        req.uploadedFiles = uploadedFiles;
        next();
      };

      // Call the function to handle the uploaded files
      await getUploadedFilesPath();
    });
  };
};

module.exports = createMulterMiddleware;
