const express = require("express");
const {
  checkAuthorization,
  checkCommonUserAuthentication,
} = require("../middleware/Authorization");
const router = express.Router();
const {
  addProductUpload,
  editProductUpload,
} = require("../middleware/multer/productMulter");
const {
  getAllProducts,
  getProductDetails,
  addProduct,
  editProduct,
  deleteProduct,
} = require("../controller/Product");
const {
  categorySpecificValidationRules,
  generalValidationRules,
} = require("../middleware/validations/products/addProduct");
const {
  editCategorySpecificValidationRules,
  editGeneralValidationRules,
} = require("../middleware/validations/products/editProduct");
const {
  handleValidationErrors,
} = require("../middleware/validations/validationErrorHandler");
const editProductFileMiddleware = require("../middleware/validations/products/fileUploads/editProduct");
const addProductFileMiddleware = require("../middleware/validations/products/fileUploads/addProduct");

router.post(`/`, checkAuthorization, getAllProducts); // according to the market, user

router.post(
  `/add`,
  checkAuthorization,
  checkCommonUserAuthentication,
  addProductUpload,
  categorySpecificValidationRules,
  generalValidationRules,
  handleValidationErrors,
  addProductFileMiddleware,
  addProduct
);

router.post(
  `/edit/:productId`,
  checkAuthorization,
  checkCommonUserAuthentication,
  editProductUpload,
  editCategorySpecificValidationRules,
  editGeneralValidationRules,
  handleValidationErrors,
  editProductFileMiddleware,
  editProduct
);

router.post(
  `/delete/:id`,
  checkAuthorization,
  checkCommonUserAuthentication,
  deleteProduct
);

router.post(`/:id`, checkAuthorization, getProductDetails);

module.exports = router;
