const express                                        = require('express');
const router                                           = express.Router();
const { addLogisticsPartner, login, getLogisticsList, 
    getLogisticsDetails, updateLogisticsDetails } = require('../controller/LogisticsPartner');
const {checkAuthorization, checkCommonUserAuthentication}  = require('../middleware/Authorization')
const { logisticsPartnerValidationRules } = require('../middleware/validations/logisticsPartner');


router.post("/login", checkAuthorization, login);
router.post("/add-logistics-partner", checkAuthorization, checkCommonUserAuthentication, logisticsPartnerValidationRules, addLogisticsPartner);
router.post("/get-logistics-request-list", checkAuthorization, checkCommonUserAuthentication, getLogisticsList);
router.post("/get-logistics-details/:requestId", checkAuthorization, checkCommonUserAuthentication, getLogisticsDetails);
router.patch("/update-logistics-details", checkAuthorization, checkCommonUserAuthentication, updateLogisticsDetails);

module.exports = router;