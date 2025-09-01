const cron = require('node-cron');
const { Medicine } = require('../schema/medicineSchema');
const Supplier = require('../schema/supplierSchema');
const Buyer = require('../schema/buyerSchema')
const { sendEmail } = require("../utils/emailService");
const Bid = require('../schema/bidSchema')
const Subscription = require('../schema/subscriptionSchema')
const { sendSubscriptionExpiryEmailContent } = require("../utils/emailContents");
 
 
// Bid expiry logic with both time and quoteRequested check
const markExpiredOrFullyQuotedBidsAsCompleted = async () => {
  const now = new Date();
 
  try {
    const activeBids = await Bid.find({ status: "active" });
 
    let updatedCount = 0;
 
    for (const bid of activeBids) {
      const { endDate, endTime } = bid.general || {};
 
      if (!endDate || !endTime) continue;
 
      const [endHour, endMinute] = endTime.split(":").map(Number);
      const endDateTime = new Date(endDate);
      if (isNaN(endDateTime.getTime()) || isNaN(endHour) || isNaN(endMinute)) continue;
 
      endDateTime.setHours(endHour, endMinute, 0, 0);
 
      const isExpired = endDateTime <= now;
 
      const allQuoteRequested = bid.additionalDetails.every(
        (item) => item.quoteRequested && mongoose.Types.ObjectId.isValid(item.quoteRequested)
      );
 
      if (isExpired || allQuoteRequested) {
        await Bid.updateOne(
          { _id: bid._id },
          { $set: { status: "completed" } }
        );
        updatedCount++;
      }
    }
 
    // Optionally log it
    if (updatedCount > 0) {
      console.log(`✅ ${updatedCount} bid(s) marked as completed.`);
    }
  } catch (error) {
    console.error("❌ Error in bid status updater cron:", error);
  }
};
 
const scheduleExpiredBidsCronJob = () => {
  cron.schedule("*/2 * * * *", async () => {
    await markExpiredOrFullyQuotedBidsAsCompleted(); // 👈 updated function
  });
};
//bid expiry
 
 
//subscription expiry
const markExpiredSubscriptionsAsExpired = async () => {
  const now = new Date();
 
  try {
    const allSubscriptions = await Subscription.find({});
 
    let expiredCount = 0;
 
    for (const sub of allSubscriptions) {
      const subEndDateStr = sub.subscriptionEndDate;
      if (!subEndDateStr) continue;
 
      const subEndDate = new Date(subEndDateStr);
      if (isNaN(subEndDate.getTime())) continue;
 
      const diffInDays = Math.ceil((subEndDate - now) / (1000 * 60 * 60 * 24));
 
      // Fetch user based on userType
      let user = null;
      const userType = sub.userType;
      if (userType === "Supplier") {
        user = await Supplier.findOne({ _id: sub.userId });
      } else if (userType === "Buyer") {
        user = await Buyer.findOne({ _id: sub.userId });
      }
 
      if (!user) continue;
 
      // Choose reminder days based on productName
      const reminderDays =
        sub.productName === "Monthly Subscription"
          ? [3, 1]
          : [7, 3, 1];
 
      const shouldSendReminder = reminderDays.includes(diffInDays);
      const isExpired = subEndDate < now;
 
      if (shouldSendReminder || isExpired) {
        // console.log("shouldSendReminder || isExpired", shouldSendReminder, isExpired);
        const subject = "Subscription Payment Link";
        const emailContent = await sendSubscriptionExpiryEmailContent(userType, user, sub, diffInDays);
 
        await sendEmail(
          [user.contact_person_email, "ajo@shunyaekai.tech"],
          subject,
          emailContent
        );
      }
 
      // Remove currentSubscription if expired
      if (isExpired) {
        if (user.currentSubscription?.toString() === sub._id.toString()) {
          const updateQuery = { $unset: { currentSubscription: "" } };
 
          if (userType === "Supplier") {
            await Supplier.updateOne({ _id: user._id }, updateQuery);
          } else if (userType === "Buyer") {
            await Buyer.updateOne({ _id: user._id }, updateQuery);
          }
 
          expiredCount++;
          // console.log(`Removed currentSubscription from ${userType} (${user._id})`);
        }
      }
    }
 
    // console.log(`Removed currentSubscription from ${expiredCount} user(s).`);
  } catch (error) {
    console.error("Error in markExpiredSubscriptionsAsExpired:", error);
  }
};
 
 
const scheduleExpiredSubscriptionsCronJob = () => { //runs every morning 8am
  cron.schedule("0 8 * * *", async () => {
    await markExpiredSubscriptionsAsExpired();
  });
};
//subscription expiry
 
 
function initializeCronJobs() {
  scheduleExpiredBidsCronJob();
  scheduleExpiredSubscriptionsCronJob();
}
 
 
initializeCronJobs();