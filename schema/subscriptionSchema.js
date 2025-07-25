const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "Validation Error: userId is required"],
    },
    userType: {
      type: String,
      enum: ["Supplier", "Buyer"],
      required: [true, "Validation Error: userType is required"],
    },
    custom_subscription_id: {
      type: String,
    },
    custom_invoice_pdf: {
      type: String,
    },
    sessionId: {
      type: String,
    },
    subtotalAmount: {
      type: Number,
    },
    totalAmount: {
      type: Number,
    },
    currency: {
      type: String,
    },
    customer: {
      type: String,
    },
    subscriptionId: {
      type: String,
    },
    paymentMethodId: {
      type: String,
    },
    subscriptionStartDate: {
      type: String,
    },
    subscriptionEndDate: {
      type: String,
    },
    planId: {
      type: String,
    },
    productId: {
      type: String,
    },
    productName: {
      type: String,
    },
    invoiceNumber: {
      type: String,
    },
    invoiceId: {
      type: String,
    },
    invoicePdf: {
      type: String,
    },
    paymentIntentId: {
      type: String,
    },
    invoiceStatus: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
