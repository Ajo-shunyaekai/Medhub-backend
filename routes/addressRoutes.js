const express = require('express');
const { getAddress, addAddress, editAddress, deleteAddress } = require('../controller/address');
const { checkCommonUserAuthentication, checkAuthorization } = require('../middleware/Authorization');
const { addressValidationRules } = require('../middleware/validations/address');

const router = express.Router();

router.post("/", checkAuthorization, checkCommonUserAuthentication, getAddress);
router.post("/", checkAuthorization, checkCommonUserAuthentication, addressValidationRules, addAddress);
router.put("/:id", checkAuthorization, checkCommonUserAuthentication, addressValidationRules, editAddress);
router.delete("/:id", checkAuthorization, checkCommonUserAuthentication, deleteAddress);

module.exports = router;
