const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "Validation Error: userId is required"],
    },
    userSchemaReference: {
      type: String,
      enum: ["Supplier", "Buyer"],
      required: [true, "Validation Error: userSchemaReference is required"],
    },
    subscriptionDetails: {
      sessionId: {
        type: String,
      },
      customerId: {
        type: String,
      },
      subscriptionId: {
        type: String,
      },
      productId: {
        type: String,
      },
      planId: {
        type: String,
      },
      paymentIntentTd: {
        type: String,
      },
      paymentMethodId: {
        type: String,
      },
      invoiceId: {
        type: String,
      },
      invoiceNumber: {
        type: String,
      },
      subscriptionStartDate: {
        type: String,
      },
      subscriptionEndDate: {
        type: String,
      },
      currency: {
        type: String,
      },
      amount: {
        type: String,
      },
      name: {
        type: String,
      },
      months: {
        type: Number,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
