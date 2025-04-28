const createMulterMiddleware = require("../../utils/imageUpload");

const invoiceUpload = createMulterMiddleware([
  {
    fieldName: "transaction_image",
    uploadPath: "./uploads/invoices",
    maxCount: 4,
  },
]);

module.exports = { invoiceUpload };
