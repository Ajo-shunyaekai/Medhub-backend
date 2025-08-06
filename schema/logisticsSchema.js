const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const enums = [
  "Ready for Dispatch",
  "Logistics Request Accepted -> Shipment Created",
  "Assigned to Logistics Partner",
  "Shipment Accepted",
  "Pick up Done",
  "Delayed",
  "Delivered",
  "Completed",
];

const logisticsSchema = new mongoose.Schema(
  {
    logistics_id: {
      type: String,
      required: true,
      unique: true,
    },
    enquiry_id: {
      type: String,
      // ref: "Enquiry",
      required: true,
    },
    purchaseOrder_id: {
      type: String,
      // ref: "purchaseorder",
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    status: {
      type: String, // P - pending, A - accepted ,
      required: [true, "Validation Error : Status is required"],
    },
    handledBySupplier: {
      type: Boolean,
      default: false,
    },
    logisticsTracking: [
      {
        status: {
          type: String,
          enum: enums,
          required: [true, "Validation Error"],
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    externalLogisticsInfo: {
      carrierName: String,
      trackingUrl: String,
      referenceNumber: String,
    },
    logisticsTrackingStatus: {
      type: String,
      enum: enums,
      required: [true, "Validation Error"],
    },
    pod: {
      fileUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    orderCompleted: { type: String, default: false },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "LogisticsPartner",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Logistics", logisticsSchema);
