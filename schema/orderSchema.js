const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  product_id: {
    type: String,
    required: true,
  },
  medicine_name: {
    type: String,
    required: true,
  },
  quantity_required: {
    type: Number,
    required: true,
  },
  est_delivery_days: {
    type: String,
    required: true,
  },
  unit_price: {
    type: String,
    required: true,
  },
  unit_tax: {
    type: String,
    required: true,
  },
  total_amount: {
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
      "active",
      "in-transit",
      "delivered",
      "completed",
      "cancelled",
      "rejected",
    ],
    default: "active",
  },
});

const orderSchema = new Schema({
  order_id: {
    type: String,
    required: true,
  },
  enquiry_id: {
    type: String,
    ref: "Enquiry",
    required: true,
  },
  purchaseOrder_id: {
    type: String,
    ref: "purchaseorder",
    required: true,
  },
  buyer_id: {
    type: String,
    ref: "Buyer",
    required: true,
  },
  supplier_id: {
    type: String,
    ref: "Supplier",
    required: true,
  },
  invoice_no: {
    type: String,
    required: true,
  },
  invoice_date: {
    type: String,
    required: true,
  },
  payment_due_date: {
    type: String,
    required: true,
  },
  deposit_requested: {
    type: String,
    required: true,
  },
  deposit_due_date: {
    type: String,
    required: true,
  },
  payment_terms: [
    {
      type: String,
      required: true,
    },
  ],
  buyer_name: {
    type: String,
    required: true,
  },
  buyer_email: {
    type: String,
    required: true,
  },
  buyer_mobile: {
    type: String,
    required: true,
  },
  buyer_address: {
    type: String,
    required: true,
  },
  buyer_locality: {
    type: String,
  },
  buyer_landmark: {
    type: String,
  },
  buyer_country: {
    type: String,
  },
  buyer_state: {
    type: String,
  },
  buyer_city: {
    type: String,
  },
  buyer_pincode: {
    type: String,
  },
  supplier_name: {
    type: String,
    required: true,
  },
  supplier_email: {
    type: String,
    required: true,
  },
  supplier_mobile: {
    type: String,
    required: true,
  },
  supplier_address: {
    type: String,
    required: true,
  },
  supplier_locality: {
    type: String,
  },
  supplier_landmark: {
    type: String,
  },
  supplier_country: {
    type: String,
  },
  supplier_state: {
    type: String,
  },
  supplier_city: {
    type: String,
  },
  supplierr_pincode: {
    type: String,
  },
  items: [orderItemSchema],
  grand_total: {
    type: String,
    required: true,
  },
  total_due_amount: {
    type: String,
    required: true,
  },
  total_amount_paid: {
    type: String,
    required: true,
  },
  pending_amount: {
    type: String,
    required: true,
  },
  // buyer_logistics_data: buyerLogisticsSchema,
  // supplier_logistics_data: supplierLogisticsSchema,

  order_status: {
    type: String,
    enum: [
      "pending",
      "active",
      "in-transit",
      "delivered",
      "completed",
      "cancelled",
    ],
    default: "active",
  },
  status: {
    type: String,
    enum: [
      "pending",
      "Active",
      "in-transit",
      "delivered",
      "completed",
      "cancelled",
    ],
    default: "Active",
  },
  invoice_status: {
    type: String,
    enum: [
      "pending",
      "Active",
      "in-transit",
      "delivered",
      "completed",
      "cancelled",
      "Invoice Created",
      "Paid",
    ],
    default: "Invoice Created",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
