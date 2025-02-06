const express = require('express');
const { getAddress, addAddress, editAddress, deleteAddress } = require('../controller/address');
const { checkCommonUserAuthentication, checkAuthorization } = require('../middleware/Authorization');
const { addressValidationRules, handleValidationErrors } = require('../middleware/validations/address');

const router = express.Router();

router.post("/get-address", checkAuthorization, checkCommonUserAuthentication, getAddress);
router.post("/add", checkAuthorization, checkCommonUserAuthentication, addressValidationRules,handleValidationErrors, addAddress);
router.post("/:id/edit/:addressId", checkAuthorization, checkCommonUserAuthentication, addressValidationRules,handleValidationErrors, editAddress);
router.post("/:id/delete/:addressId", checkAuthorization, checkCommonUserAuthentication, deleteAddress);

module.exports = router;
