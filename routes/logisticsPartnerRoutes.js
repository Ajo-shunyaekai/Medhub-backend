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
  authenticationNAuthorization,
} = require("../middleware/Authorization");
const {
  logisticsPartnerValidationRules,
} = require("../middleware/validations/logisticsPartner");

router.post(
  "/add-logistics-partner",
  checkAuthorization,
  authenticationNAuthorization,
  logisticsPartnerValidationRules,
  addLogisticsPartner
);
router.post(
  "/get-logistics-dashboard-data",
  checkAuthorization,
  authenticationNAuthorization,
  getLogisticsDashboardData
);
router.post(
  "/get-logistics-request-list",
  checkAuthorization,
  authenticationNAuthorization,
  getLogisticsList
);
router.post(
  "/get-logistics-details/:requestId",
  checkAuthorization,
  authenticationNAuthorization,
  getLogisticsDetails
);
router.post(
  "/update-logistics-details",
  checkAuthorization,
  authenticationNAuthorization,
  updateLogisticsRequest
);

module.exports = router;
