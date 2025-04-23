const createMulterMiddleware = require("../../utils/imageUpload");

const medicineUpload = createMulterMiddleware([
  {
    fieldName: "product_image",
    uploadPath: "./uploads/medicine/product_files",
    maxCount: 4,
  },
  {
    fieldName: "invoice_image",
    uploadPath: "./uploads/medicine/invoice_image",
    maxCount: 1,
  },
]);

module.exports = { medicineUpload };
