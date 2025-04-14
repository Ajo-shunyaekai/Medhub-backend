const express = require("express");
const {
  getAddress,
  addAddress,
  editAddress,
  deleteAddress,
  getAddressById,
} = require("../controller/address");
const {
  authenticationNAuthorization,
  checkAuthorization,
} = require("../middleware/Authorization");
const {
  addressValidationRules,
  handleValidationErrors,
} = require("../middleware/validations/address");

const router = express.Router();

router.post(
  "/get-address-list",
  checkAuthorization,
  authenticationNAuthorization,
  getAddress
);
router.post(
  "/get-address/:userId/:addressId",
  checkAuthorization,
  authenticationNAuthorization,
  getAddressById
);
router.post(
  "/add-address",
  checkAuthorization,
  authenticationNAuthorization,
  addressValidationRules,
  handleValidationErrors,
  addAddress
);
router.post(
  "/edit-address/:userId/:addressId",
  checkAuthorization,
  authenticationNAuthorization,
  addressValidationRules,
  handleValidationErrors,
  editAddress
);
router.post(
  "/delete-address/:userId/:addressId",
  checkAuthorization,
  authenticationNAuthorization,
  deleteAddress
);

module.exports = router;
