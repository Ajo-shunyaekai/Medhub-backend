const mongoose = require("mongoose");

const buyerLogisticsSchema = new Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  mobile_number: { type: String, required: true },
  company_reg_address: { type: String, required: true },
  locality: { type: String, required: true },
  land_mark: { type: String },
  state: { type: String },
  city: { type: String },
  country: { type: String, required: true },
  pincode: { type: String },
  address_type: {
    type: String,
    enum: ["Warehouse", "Shop", "Other"],
    required: true,
  },
  mode_of_transport: {
    type: String,
    enum: ["Air Cargo", "Sea Freight", "Road Freight", "Ask Partner"],
    required: true,
  },
  extra_services: [
    {
      type: String,
      enum: ["Door to Door", "Include Custom Clearance"],
    },
  ],
});

const supplierLogisticsSchema = new Schema({
  full_name: { type: String, required: true },
  mobile_number: { type: String, required: true },
  company_reg_address: { type: String, required: true },
  locality: { type: String, required: true },
  land_mark: { type: String },
  country: { type: String, required: true },
  state: { type: String },
  city: { type: String },
  pincode: { type: String },
  address_type: {
    type: String,
    enum: ["Warehouse", "Factory", "Shop", "Other"],
    required: true,
  },
  bill_of_material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
  pickup_date: { type: String, required: true },
  pickup_time: { type: String, required: true },
});

const shipmentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,
    status: String,
    estimatedDelivery: Date,
    history: [
      {
        status: String,
        location: String,
        timestamp: Date,
      },
    ],
    buyer_logistics_data: buyerLogisticsSchema,
    supplier_logistics_data: supplierLogisticsSchema,
  },
  { timestamps: tru }
);

module.exports = mongoose.model("Shipment", shipmentSchema);
