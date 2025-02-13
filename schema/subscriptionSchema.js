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
        // required: true,
      },
      customerId: {
        type: String,
        // required: true,
      },
      subscriptionId: {
        type: String,
        // required: true,
      },
      productId: {
        type: String,
        // required: true,
      },
      planId: {
        type: String,
        // required: true,
      },
      paymentIntentTd: {
        type: String,
        // required: true,
      },
      paymentMethodId: {
        type: String,
        // required: true,
      },
      invoiceId: {
        type: String,
        // required: true,
      },
      invoiceNumber: {
        type: String,
        // required: true,
      },
      subscriptionStartDate: {
        type: String,
        // required: true,
      },
      subscriptionEndDate: {
        type: String,
        // required: true,
      },
      currency: {
        type: String,
        // required: true,
      },
      amount: {
        type: String,
        // required: true,
      },
      name: {
        type: String,
        // required: true,
      },
      months: {
        type: Number,
        // required: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
