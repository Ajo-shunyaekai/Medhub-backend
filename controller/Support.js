const mongoose = require("mongoose");
const Order = require("../schema/orderSchema");
const Support = require("../schema/supportSchema");
const Invoice = require("../schema/invoiceNumberSchema");
const Invoices = require("../schema/invoiceSchema");
const Enquiry = require("../schema/enquiryListSchema");
const Buyer = require("../schema/buyerSchema");
const Supplier = require("../schema/supplierSchema");
const Notification = require("../schema/notificationSchema");
const PurchaseOrder = require("../schema/purchaseOrderSchema");
const { Address, UserAddress } = require("../schema/addressSchema");
const Logistics = require("../schema/logisticsSchema");
const { Medicine } = require("../schema/medicineSchema");
const nodemailer = require("nodemailer");
const { sendEmail } = require("../utils/emailService");
const { flattenData } = require("../utils/csvConverter");
const { parse } = require("json2csv");
const fs = require("fs");
const path = require("path");
const { addStageToOrderHistory } = require("./orderHistory");
const logErrorToFile = require("../logs/errorLogs");
const {
  sendErrorResponse,
  handleCatchBlockError,
} = require("../utils/commonResonse");
const {
  createOrderContent,
  bookLogisticsContent,
} = require("../utils/emailContents");

const initializeInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  if (count === 0) {
    const initialInvoiceNumber = new Invoice({ last_invoice_number: 18000 });
    await initialInvoiceNumber.save();
  }
};

module.exports = {
  supportSubmission: async (req, res, reqObj, callback) => {
    try {
      const supportId = "SPT-" + Math.random().toString(16).slice(2, 10);
      const { uploadedFiles } = req;

      const imageField =
        reqObj.support_type === "feedback"
          ? uploadedFiles?.feedback_image
          : uploadedFiles?.complaint_image;
      const uploadDir =
        reqObj.support_type === "feedback"
          ? "feedback_images"
          : "complaint_images";
      const subjectLabel =
        reqObj.support_type === "feedback" ? "Feedback" : "Complaint";

      const newSupport = new Support({
        support_id: supportId,
        user_id: reqObj.buyer_id || reqObj.supplier_id,
        user_type: reqObj.usertype,
        support_type: reqObj.support_type,
        subject: reqObj.subject,
        message: reqObj.message,
        support_image: imageField,
        status: 0,
      });

      const savedSupport = await newSupport.save();

      const emailSubject = `New ${subjectLabel} Received - ${supportId}`;
      const emailBody = `
        <div style="font-family: Arial, sans-serif; padding: 10px; line-height: 1.6;">
          <h2>New ${subjectLabel} Received</h2>
          <p><strong>Support ID:</strong> ${supportId}</p>
          <p><strong>User ID:</strong> ${
            reqObj.buyer_id || reqObj.supplier_id
          }</p>
          <p><strong>User Type:</strong> ${reqObj.usertype}</p>
          <p><strong>Support Type:</strong> ${reqObj.support_type}</p>
          ${
            reqObj.order_id
              ? `<p><strong>Related Order ID:</strong> ${reqObj.order_id}</p>`
              : ""
          }
          <p><strong>Subject:</strong> ${reqObj.subject}</p>
          <p><strong>Message:</strong><br/> ${reqObj.message}</p>
          ${
            imageField?.length > 0
              ? `<p><strong>Attached Image(s):</strong><br/> ${imageField
                  .map((img) => `<div>${img}</div>`)
                  .join("")}</p>`
              : ""
          }
          <p style="margin-top: 20px;">Best Regards,<br/>Medhub Global Team</p>
        </div>
      `;
      const recipientEmail = ["ajo@shunyaekai.tech"];

      const attachments =
        imageField?.length > 0
          ? imageField.map((filename) => ({
              filename,
              path: path.join(
                __dirname,
                "..",
                "uploads",
                "buyer",
                "order",
                uploadDir,
                filename
              ),
            }))
          : [];

      await sendEmail(recipientEmail, emailSubject, emailBody, attachments);

      callback({
        code: 200,
        message: `${subjectLabel} submitted Successfully`,
        result: savedSupport,
      });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },
};
