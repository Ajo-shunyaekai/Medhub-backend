const express = require("express");
const router = express.Router();
const { sendErrorResponse } = require("../utils/commonResonse");
const logErrorToFile = require("../logs/errorLogs");
const {markExpiredBidsAsCompleted, sendNotificationsForActiveBids, markExpiredSubscriptionsAsExpired} = require("../controller/cronJob")


router.post('/check-bid-expiry', markExpiredBidsAsCompleted);

router.post('/send-bid-notification', sendNotificationsForActiveBids);

router.post('/check-subscription-expiry', markExpiredSubscriptionsAsExpired);


module.exports = router;
