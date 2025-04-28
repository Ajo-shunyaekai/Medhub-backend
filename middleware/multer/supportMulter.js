const createMulterMiddleware = require("../../utils/imageUpload");

const supportUpload = createMulterMiddleware([
  {
    fieldName: "complaint_image",
    uploadPath: "./uploads/support/complaint_images",
    maxCount: 10,
  },
  {
    fieldName: "feedback_image",
    uploadPath: "./uploads/support/feedback_images",
    maxCount: 10,
  },
]);

module.exports = { supportUpload };
