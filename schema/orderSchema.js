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

const logisticsSchema = new Schema({
  door_to_door: {
    type: String,
  },
  custom_clearance: {
    type: String,
  },
  prefered_mode: {
    type: String,
  },
  drop_location: {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    mobile: {
      type: String,
    },
    address: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city_district: {
      type: String,
    },
    pincode: {
      type: String,
    },
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
    default: "pending",
  },
});

const shipmentSchema = new Schema({
  supplier_details: {
    name: {
      type: String,
    },
    mobile: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    ciyt_disctrict: {
      type: String,
    },
    pincode: {
      type: String,
    },
    prefered_pickup_date: {
      type: String,
    },
    prefered_pickup_time: {
      type: String,
    },
  },
  shipment_details: {
    no_of_packages: {
      type: String,
    },
    length: {
      type: String,
    },
    breadth: {
      type: String,
    },
    height: {
      type: String,
    },
    total_weight: {
      type: String,
    },
    total_volume: {
      type: String,
    },
  },
  buyer_details: {
    name: {
      type: String,
    },
    mobile: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    ciyt_disctrict: {
      type: String,
    },
    pincode: {
      type: String,
    },
    buyer_type: {
      type: String,
    },
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
    default: "pending",
  },
});

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

const billOfMaterialSchema = new Schema({
  products: [
    {
      product_id: { type: String, required: true },
      product_name: { type: String, required: true },
      quantity: { type: Number, required: true },
      no_of_packages: { type: Number, required: true },
    },
  ],
});

const packageInformationSchema = new Schema({
  total_no_of_packages: { type: Number, required: true },
  package_details: [
    {
      package_name: { type: String },
      dimensions: {
        length: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        volume: { type: Number, required: true },
      },
      weight: { type: Number, required: true },
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
  bill_of_material: billOfMaterialSchema,
  package_information: packageInformationSchema,
  pickup_date: { type: String, required: true },
  pickup_time: { type: String, required: true },
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
  // logistics_details: [logisticsSchema],
  // shipment_details: shipmentSchema,
  buyer_logistics_data: buyerLogisticsSchema,
  supplier_logistics_data: supplierLogisticsSchema,

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
