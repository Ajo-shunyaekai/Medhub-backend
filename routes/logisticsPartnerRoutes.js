const express = require("express");
const router = express.Router();
const {
  addLogisticsPartner,
  getLogisticsList,
  getLogisticsDashboardData,
  getLogisticsDetails,
  updateLogisticsRequest,
} = require("../controller/LogisticsPartner");
const {
  checkAuthorization,
  checkCommonUserAuthentication,
} = require("../middleware/Authorization");
const {
  logisticsPartnerValidationRules,
} = require("../middleware/validations/logisticsPartner");

router.post(
  "/add-logistics-partner",
  checkAuthorization,
  checkCommonUserAuthentication,
  logisticsPartnerValidationRules,
  addLogisticsPartner
);
router.post(
  "/get-logistics-dashboard-data",
  checkAuthorization,
  checkCommonUserAuthentication,
  getLogisticsDashboardData
);
router.post(
  "/get-logistics-request-list",
  checkAuthorization,
  checkCommonUserAuthentication,
  getLogisticsList
);
router.post(
  "/get-logistics-details/:requestId",
  checkAuthorization,
  checkCommonUserAuthentication,
  getLogisticsDetails
);
router.post(
  "/update-logistics-details",
  checkAuthorization,
  checkCommonUserAuthentication,
  updateLogisticsRequest
);

module.exports = router;
