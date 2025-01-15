const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const supplierProfileEditSchema = new Schema(
  {
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Validation Error : supplierId is required"],
    },
    supplier_id: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Validation Error : supplier_id is required"],
    },
    supplier_type: {
      type: String,
      trim: true,
    },
    supplier_name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    supplier_address: {
      type: String,
      trim: true,
    },
    supplier_email: {
      type: String,
      trim: true,
      unique: true,
    },
    supplier_mobile: {
      type: String,
      trim: true,
    },
    supplier_country_code: {
      type: String,
      trim: true,
    },
    license_no: {
      type: String,
      trim: true,
    },
    license_expiry_date: {
      type: String,
      trim: true,
    },
    tax_no: {
      type: String,
      trim: true,
    },
    registration_no: {
      type: String,
      trim: true,
    },
    vat_reg_no: {
      type: String,
      trim: true,
    },
    country_of_origin: {
      type: String,
      trim: true,
    },
    country_of_operation: [
      {
        type: String,
        trim: true,
      },
    ],
    contact_person_name: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    contact_person_mobile_no: {
      type: String,
      trim: true,
    },
    contact_person_country_code: {
      type: String,
      trim: true,
    },
    contact_person_email: {
      type: String,
      trim: true,
    },
    supplier_image: [
      {
        type: String,
        trim: true,
      },
    ],
    license_image: [
      {
        type: String,
        trim: true,
      },
    ],
    tax_image: [
      {
        type: String,
        trim: true,
      },
    ],
    certificate_image: [
      {
        type: String,
        trim: true,
      },
    ],
    payment_terms: {
      type: String,
      trim: true,
    },
    tags: {
      type: String,
      trim: true,
    },
    estimated_delivery_time: {
      type: String,
      trim: true,
    },
    editReqStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      required: true,
      trim: true,
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupplierProfileEdit", supplierProfileEditSchema);
