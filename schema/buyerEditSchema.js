const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const buyerProfileEditSchema = new Schema(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "Buyer",
      required: [true, "Validation Error : buyerId is required"],
    },
    buyer_id: {
      type: String,
      trim: true,
      required: [true, "Validation Error : buyer_id is required"],
      unique: true,
    },
    buyer_type: {
      type: String,
      trim: true,
    },
    buyer_name: {
      type: String,
      trim: true,
    },
    buyer_address: {
      type: String,
      trim: true,
    },
    buyer_email: {
      type: String,
      trim: true,
      unique: true,
    },
    buyer_mobile: {
      type: String,
      trim: true,
    },
    buyer_country_code: {
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
    contact_person_name: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    contact_person_email: {
      type: String,
      trim: true,
    },
    contact_person_mobile: {
      type: String,
      trim: true,
    },
    contact_person_country_code: {
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
    approx_yearly_purchase_value: {
      type: String,
      trim: true,
    },
    interested_in: [
      {
        type: String,
        trim: true,
      },
    ],
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
    description: {
      type: String,
      trim: true,
    },
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
    buyer_image: [
      {
        type: String,
        trim: true,
      },
    ],
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

module.exports = mongoose.model("BuyerProfileEdit", buyerProfileEditSchema);
