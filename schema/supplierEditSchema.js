const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const supplierProfileEditSchema = new Schema(
  {
    userId: {
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
      required: true,
      trim: true,
    },
    supplier_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    supplier_address: {
      type: String,
      required: true,
      trim: true,
    },
    supplier_email: {
      type: String,
      // required: true,
      trim: true,
      unique: true,
    },
    supplier_mobile: {
      type: String,
      required: true,
      trim: true,
    },
    supplier_country_code: {
      type: String,
      required: true,
      trim: true,
    },
    license_no: {
      type: String,
      required: true,
      trim: true,
    },
    license_expiry_date: {
      type: String,
      required: true,
      trim: true,
    },
    tax_no: {
      type: String,
      required: true,
      trim: true,
    },
    registration_no: {
      type: String,
      required: true,
      trim: true,
    },
    vat_reg_no: {
      type: String,
      required: true,
      trim: true,
    },
    country_of_origin: {
      type: String,
      required: true,
      trim: true,
    },
    country_of_operation: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    contact_person_name: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    contact_person_mobile_no: {
      type: String,
      required: true,
      trim: true,
    },
    contact_person_country_code: {
      type: String,
      required: true,
      trim: true,
    },
    contact_person_email: {
      type: String,
      required: true,
      trim: true,
    },
    supplier_image: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    license_image: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    tax_image: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    certificate_image: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    payment_terms: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: String,
      required: true,
      trim: true,
    },
    estimated_delivery_time: {
      type: String,
      required: true,
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
