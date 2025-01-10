const express                                        = require('express');
const router                                           = express.Router();
const { addLogisticsPartner, login } = require('../controller/LogisticsPartner');
const {checkAuthorization, checkCommonUserAuthentication}  = require('../middleware/Authorization')
const { logisticsPartnerValidationRules } = require('../middleware/validations/logisticsPartner');


router.post("/login", checkAuthorization, login);
router.post("/add-logistics-partner", checkAuthorization, checkCommonUserAuthentication, logisticsPartnerValidationRules, addLogisticsPartner);


module.exports = router;