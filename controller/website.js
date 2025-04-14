const { contactUsContent } = require("../utils/emailContents");
const { sendEmail } = require("../utils/emailService");
const EmailListing = require("../schema/emailListingSchema");

module.exports = {
  websiteEnquiryEmail: async (req, res) => {
    const { username, email, phone, checkbox } = req.body;
    // return false
    try {
      if (checkbox === "on") {
        const existingSubscriber = await EmailListing.findOne({ email });
        if (!existingSubscriber) {
          const newSubscriber = new EmailListing({ username, email, phone });
          await newSubscriber.save();
        } else {
        }
      }

      const subject = "Inquiry from Medhub Global";
      // const recipientEmails = [process.env.SMTP_USER_ID, "ajo@shunyaekai.tech"];
      const recipientEmails = ["platform@medhub.global"];
      // const recipientEmails = ["ajo@shunyaekai.tech"]
      const emailContent = await contactUsContent(req.body);
      // const result = await sendEmail({ username, email, subject, phone, message, checkbox });
      await sendEmail(recipientEmails, subject, emailContent);
      res.status(200).json({
        success: true,
        message:
          "Thank you! We have received your details and will get back to you shortly.",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
