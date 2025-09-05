const express = require("express");
const router = express.Router();
const { sendErrorResponse } = require("../utils/commonResonse");
const logErrorToFile = require("../logs/errorLogs");
const {markExpiredBidsAsCompleted, markExpiredOrFullyQuotedBidsAsCompleted, 
    sendNotificationsForActiveBids, markExpiredSubscriptionsAsExpired} = require("../controller/cronJob")


// router.post('/check-bid-expiry', markExpiredBidsAsCompleted);
router.get('/check-bid-expiry', markExpiredOrFullyQuotedBidsAsCompleted);

router.get('/send-bid-notification', sendNotificationsForActiveBids);

router.get('/check-subscription-expiry', markExpiredSubscriptionsAsExpired);


module.exports = router;
