const Bid = require('../schema/bidSchema');
const Subscription = require('../schema/subscriptionSchema');
const Supplier = require('../schema/supplierSchema');
const Buyer = require('../schema/buyerSchema');
const { sendEmail } = require("../utils/emailService");
const { sendSubscriptionExpiryEmailContent } = require("../utils/emailContents");
const {
  sendErrorResponse,
  sendSuccessResponse,
  handleCatchBlockError,
} = require("../utils/commonResonse");

const markExpiredBidsAsCompleted = async (req, res) => {

  const now = new Date();
  try {
    const activeBids = await Bid.find({ status: "active" });
    let expiredCount = 0;

    for (const bid of activeBids) {
      const endDateStr = bid.general?.endDate;
      const endTimeStr = bid.general?.endTime || "23:59"; // Default to end of day if missing

    //   console.log('endDateStr:', endDateStr);
    //   console.log('endTimeStr:', endTimeStr);

      if (!endDateStr) {
        // console.log(' Missing endDate', bid._id);
        continue;
      }

      const [endHour, endMinute] = endTimeStr.split(":").map(Number);
      const rawDate = new Date(endDateStr);

      if (
        isNaN(rawDate.getTime()) ||
        isNaN(endHour) ||
        isNaN(endMinute)
      ) {
        // console.log('nvalid date or time, skipping bid:', bid._id);
        continue;
      }

      const endDateTime = new Date(
        rawDate.getFullYear(),
        rawDate.getMonth(),
        rawDate.getDate(),
        endHour,
        endMinute,
        0,
        0
      );

    //   console.log("Bid ID:", bid._id);
    //   console.log("Constructed endDateTime:", endDateTime.toISOString());
    //   console.log(" Current time (now):", now.toISOString());

      if (endDateTime < now) {
        // console.log('Bid expired — marking as completed');
        await Bid.updateOne(
          { _id: bid._id },
          { $set: { status: "completed" } }
        );
        expiredCount++;
      } else {
        // console.log('Bid not yet expired');
      }
    }

    return sendSuccessResponse(
      res,
      200,
      "markExpiredBidsAsCompleted API successful",
      { success: true, expiredCount }
    );
  } catch (error) {
    console.error("Error in markExpiredBidsAsCompleted:", error);
    handleCatchBlockError(req, res, error);
  }
};


const markExpiredSubscriptionsAsExpired = async (req, res) => {
  const now = new Date();
  let expiredCount = 0;

  try {
    const allSubscriptions = await Subscription.find({});
    for (const sub of allSubscriptions) {
      const subEndDateStr = sub.subscriptionEndDate;
      if (!subEndDateStr) continue;

      const subEndDate = new Date(subEndDateStr);
      if (isNaN(subEndDate.getTime())) continue;

      const diffInDays = Math.ceil((subEndDate - now) / (1000 * 60 * 60 * 24));
      let user = null;

      if (sub.userType === "Supplier") {
        user = await Supplier.findOne({ _id: sub.userId });
      } else if (sub.userType === "Buyer") {
        user = await Buyer.findOne({ _id: sub.userId });
      }

      if (!user) continue;

      const reminderDays = sub.productName === "Monthly Subscription" ? [3, 1] : [7, 3, 1];
      const shouldSendReminder = reminderDays.includes(diffInDays);
      const isExpired = subEndDate < now;

      if (shouldSendReminder || isExpired) {
        const emailContent = await sendSubscriptionExpiryEmailContent(sub.userType, user, sub, diffInDays);
        await sendEmail([user.contact_person_email, "ajo@shunyaekai.tech"], "Subscription Payment Link", emailContent);
      }

      if (isExpired && user.currentSubscription?.toString() === sub._id.toString()) {
        const updateQuery = { $unset: { currentSubscription: "" } };
        if (sub.userType === "Supplier") {
          await Supplier.updateOne({ _id: user._id }, updateQuery);
        } else {
          await Buyer.updateOne({ _id: user._id }, updateQuery);
        }
        expiredCount++;
      }
    }

     return sendSuccessResponse(res, 200, "markExpiredSubscriptionsAsExpired api successfull", {success: true, expiredCount});
  } catch (error) {
    console.error("Error in markExpiredSubscriptionsAsExpired:", error);
    handleCatchBlockError(req, res, error);
  }
};

module.exports = {
  markExpiredBidsAsCompleted,
  markExpiredSubscriptionsAsExpired
};
