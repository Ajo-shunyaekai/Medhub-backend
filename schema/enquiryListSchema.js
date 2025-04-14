const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const enquiryItemSchema = new Schema({
  product_id: {
    type: String,
    required: true,
  },
  unit_price: {
    type: String,
    required: true,
  },
  unit_tax: {
    type: Number,
    required: true,
  },
  quantity_required: {
    type: String,
    required: true,
  },
  est_delivery_days: {
    type: String,
    required: true,
  },
  target_price: {
    type: String,
    required: true,
  },
  counter_price: {
    type: String,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "cancelled",
      "rejected",
      "Quotation submitted",
      "PO created",
      "order created",
    ],
    default: "pending",
  },
});

const enquiryQuotationchema = new Schema(
  {
    product_id: {
      type: String,
      required: true,
    },
    unit_price: {
      type: String,
      required: true,
    },
    unit_tax: {
      type: Number,
      required: true,
    },
    quantity_required: {
      type: String,
      required: true,
    },
    est_delivery_days: {
      type: String,
      required: true,
    },
    target_price: {
      type: String,
      required: true,
    },
    counter_price: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "PO created"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const enquirySchema = new Schema({
  enquiry_id: {
    type: String,
    required: true,
  },
  buyer_id: {
    type: String,
    ref: "Buyer",
    required: true,
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
  supplier_id: {
    type: String,
    ref: "Supplier",
    required: true,
  },
  items: [enquiryItemSchema],
  quotation_items: [enquiryQuotationchema],
  payment_terms: [
    {
      type: String,
      required: true,
    },
  ],
  est_delivery_time: {
    type: String,
  },
  cancellation_reason: {
    type: String,
  },
  additional_comments: {
    type: String,
  },
  shipping_details: {
    type: {
      consignor_name: {
        type: String,
      },
      mobile_no: {
        type: String,
      },
      address: {
        type: String,
      },
    },
  },
  remarks: {
    type: String,
  },
  enquiry_status: {
    type: String,
    enum: [
      "pending",
      "active",
      "completed",
      "cancelled",
      "Quotation submitted",
      "PO created",
      "rejected",
      "order created",
    ],
    default: "pending",
  },
  status: {
    type: String,
    enum: [
      "pending",
      "active",
      "completed",
      "cancelled",
      "Quotation submitted",
      "PO created",
      "rejected",
      "order created",
    ],
    default: "pending",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  quotation_items_created_at: {
    type: Date,
    default: Date.now,
  },
  quotation_items_updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Enquiry", enquirySchema);
