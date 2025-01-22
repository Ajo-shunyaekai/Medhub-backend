const express = require('express');
const { getAddress, addAddress, editAddress, deleteAddress } = require('../controller/address');
const { checkCommonUserAuthentication, checkAuthorization } = require('../middleware/Authorization');
const { addressValidationRules, handleValidationErrors } = require('../middleware/validations/address');

const router = express.Router();

router.post("/", checkAuthorization, checkCommonUserAuthentication, getAddress);
router.post("/", checkAuthorization, checkCommonUserAuthentication, addressValidationRules,handleValidationErrors, addAddress);
router.put("/:id", checkAuthorization, checkCommonUserAuthentication, addressValidationRules,handleValidationErrors, editAddress);
router.delete("/:id", checkAuthorization, checkCommonUserAuthentication, deleteAddress);

module.exports = router;
