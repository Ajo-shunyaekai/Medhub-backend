const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderHistorySchema = new Schema(
  {
    enquiryId: {
      type: Schema.Types.ObjectId,
      ref: "Enquiry",
      required: [true, "Enquiry Id is required"],
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    // logisticPartnerId: {
    //   type: Schema.Types.ObjectId,
    //   ref: "LogisticsPartner",
    // },
    logisticId: {
      type: Schema.Types.ObjectId,
      ref: "Logistics",
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "Buyer",
      required: [true, "Buyer Id is required"],
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Supplier Id is required"],
    },
    // Array to track the history of stages
    stages: [
      {
        name: {
          type: String,
          enum: ['Inquiry Raised', 'Quotation Submitted', 'Purchase Order Created', 'Order Created', 'Delivery Details Submitted', 'Pick up Details Submitted', 'Logistics Request Sent', 'Order Initiated by Logistic Partner'],
          required: true,
        },
        date: {
          type: Date,
          default: Date.now, // Store the date when this stage happens
        },
        // description: {
        //   type: String,
        //   default: "", // Optional field for additional details (e.g., buyer's comments, etc.)
        // },
        referenceId: {
          type: Schema.Types.Mixed,  // Flexible to accept any reference
          required: [true, "Reference is required at each stage"],
        },
        referenceType: {
          type: String,  // A string that will store the model name (Enquiry, PurchaseOrder, etc.)
          required: true,  // Each stage must define the model type for the reference
        },
      },
    ],
  },
  {
    timestamps: true,  // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("OrderHistory", orderHistorySchema);  // Export the model
