const createMulterMiddleware = require("../../utils/imageUpload");

const supportUpload = createMulterMiddleware([
  {
    fieldName: "complaint_image",
    uploadPath: "./uploads/buyer/order/complaint_images",
    maxCount: 10,
  },
  {
    fieldName: "feedback_image",
    uploadPath: "./uploads/buyer/order/feedback_images",
    maxCount: 10,
  },
]);

module.exports = { supportUpload };
