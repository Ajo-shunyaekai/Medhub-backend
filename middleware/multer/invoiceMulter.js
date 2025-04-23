const createMulterMiddleware = require("../../utils/imageUpload");

const invoiceUpload = createMulterMiddleware([
  {
    fieldName: "transaction_image",
    uploadPath: "./uploads/buyer/order/invoice_images",
    maxCount: 4,
  },
]);

module.exports = { invoiceUpload };
