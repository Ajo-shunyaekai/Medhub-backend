const Bid = require('../schema/bidSchema');
const Subscription = require('../schema/subscriptionSchema');
const Supplier = require('../schema/supplierSchema');
const Buyer = require('../schema/buyerSchema');
const Notification = require('../schema/notificationSchema')
const { sendEmail, sendTemplateEmail } = require("../utils/emailService");
const { sendSubscriptionExpiryEmailContent } = require("../utils/emailContents");
const {
  sendErrorResponse,
  sendSuccessResponse,
  handleCatchBlockError,
} = require("../utils/commonResonse");
const {getTimeZoneBidComparision} = require("../utils/timeZone")

const markExpiredBidsAsCompletedOld = async (req, res) => {

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

const markExpiredBidsAsCompleted = async (req, res) => {

  const now = new Date();
  try {
    const activeBids = await Bid.find({ status: "active" });
    let expiredCount = 0;

    for (const bid of activeBids) {
      const endDateStr = bid.general?.endDate;
      const endTimeStr = bid.general?.endTime || "23:59"; // Default to end of day if missing

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

      // console.log("Bid ID:", bid._id);
      // console.log("Constructed endDateTime:", endDateTime.toISOString());
      // console.log(" Current time (now):", now.toISOString());
    const isExpired = endDateTime <= now;
    
    const allQuoteRequested = bid.additionalDetails.every(
        (item) => item.quoteRequested && mongoose.Types.ObjectId.isValid(item.quoteRequested)
      );

      if (isExpired ||  allQuoteRequested) {
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

const markExpiredOrFullyQuotedBidsAsCompleted = async (req, res) => {
  try {
    const bidsToUpdate = await Bid.find({
      status: { $in: ["active", "inactive"] },
    });

    let updatedCount = 0;

    for (const bid of bidsToUpdate) {
      const { startDate, startTime, endDate, endTime, country } = bid.general || {};

      // Skip if essential fields are missing
      if (!startDate || !startTime || !endDate || !endTime || !country) {
        console.warn(`Skipping bid ${bid.bid_id}: Missing required general fields`);
        continue;
      }

      let bidStatus;
      try {
        bidStatus = await getTimeZoneBidComparision(
          startDate,
          startTime,
          endDate,
          endTime,
          country
        );
      } catch (err) {
        console.warn(`Timezone comparison failed for bid ${bid.bid_id}:`, err.message);
        continue;
      }

      console.log("[DEBUG] Bid Status Check:", {
        bidId: bid.bid_id,
        bidStatus,
      });

      const allQuoteRequested = bid.additionalDetails.every(
        (item) =>
          item.quoteRequested &&
          mongoose.Types.ObjectId.isValid(item.quoteRequested)
      );

      if (bidStatus === "completed" || allQuoteRequested) {
        await Bid.updateOne(
          { _id: bid._id },
          { $set: { status: "completed" } }
        );
        updatedCount++;
        console.log(`Marked as completed: ${bid.bid_id}`);
      } else {
        await Bid.updateOne(
          { _id: bid._id },
          { $set: { status: bidStatus } }
        );
        console.log(`Updated status to '${bidStatus}': ${bid.bid_id}`);
      }
    }

    return sendSuccessResponse(res, 200, "Bids updated successfully", {
      success: true,
      updatedCount,
    });
  } catch (error) {
    console.error("Error in markExpiredOrFullyQuotedBidsAsCompleted:", error);
    handleCatchBlockError(req, res, error);
  }
};

const sendNotificationsForActiveBids = async (req, res) => {
  const now = new Date();

  try {
    // Get active bids that are not yet notified
    const activeBids = await Bid.find({ status: "active", notified: { $ne: true } });
    let activatedCount = 0;

    for (const bid of activeBids) {
      const user = await Buyer.findById(bid?.userId);

      const { startDate, startTime } = bid.general || {};
      if (!startDate || !startTime) continue;

      // Parse startDate + startTime into a Date
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const startDateTime = new Date(startDate);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      // Only activate & notify if current time is past start time
      if (now >= startDateTime) {
        const openFor = bid.additionalDetails?.map((s) => s?.openFor).filter(Boolean) || [];
        const categories = bid.additionalDetails?.map((s) => s?.category).filter(Boolean) || [];

        const matchingSuppliers = await Supplier.find({
          supplier_type: { $in: openFor },
          "registeredAddress.country": { $in: bid.general.fromCountries },
          categories: { $in: categories },
        });

        const notificationMessage = `Bid Created! A new bid has been created by ${user?.buyer_name}`;

        for (const supplier of matchingSuppliers) {
          const notificationId = "NOT-" + Math.random().toString(16).slice(2, 10);

          // Save notification
          const newNotification = new Notification({
            notification_id: notificationId,
            event_type: "Bid active",
            event: "bid",
            from: "buyer",
            to: "supplier",
            from_id: user.buyer_id,
            to_id: supplier.supplier_id,
            event_id: bid._id,
            message: notificationMessage,
            status: 0,
          });
          await newNotification.save();

          // Send email
          const subject = "Medhub Global Bid is Now Live!";
          const recipientEmails = [supplier.contact_person_email, "ajo@shunyaekai.tech"];
          const bidTemplateName = "bidInvitationEmail";
          const templateContext = {
            buyerName: user?.contact_person_name,
            supplierName: supplier?.contact_person_name,
            bidId: bid?.bid_id,
          };

          await sendTemplateEmail(
            recipientEmails.join(","),
            subject,
            bidTemplateName,
            templateContext
          );
        }

        // Mark bid as notified
        await Bid.updateOne(
          { _id: bid._id },
          { $set: { notified: true } }
        );

        activatedCount++;
        // console.log(`Bid ${bid.bid_id} marked active & notified.`);
      }
    }

    return sendSuccessResponse(
      res,
      200,
      "markScheduledBidsAsActive API successful",
      { success: true, activatedCount }
    );
  } catch (error) {
    console.error("Error in markScheduledBidsAsActive:", error);
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
  markExpiredOrFullyQuotedBidsAsCompleted,
  sendNotificationsForActiveBids,
  markExpiredSubscriptionsAsExpired
};
