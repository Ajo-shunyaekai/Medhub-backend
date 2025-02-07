const express = require('express');
const { getAddress, addAddress, editAddress, deleteAddress, getAddressById } = require('../controller/address');
const { checkCommonUserAuthentication, checkAuthorization } = require('../middleware/Authorization');
const { addressValidationRules, handleValidationErrors } = require('../middleware/validations/address');

const router = express.Router();

router.post("/get-address-list", checkAuthorization, checkCommonUserAuthentication, getAddress);
router.post("/get-address/:userId/:addressId", checkAuthorization, checkCommonUserAuthentication, getAddressById);
router.post("/add-address", checkAuthorization, checkCommonUserAuthentication, addressValidationRules, handleValidationErrors, addAddress);
router.post("/edit-address/:userId/:addressId", checkAuthorization, checkCommonUserAuthentication, addressValidationRules, handleValidationErrors, editAddress);
router.post("/delete-address/:userId/:addressId", checkAuthorization, checkCommonUserAuthentication, deleteAddress);

module.exports = router;
