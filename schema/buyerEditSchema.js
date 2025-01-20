const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const buyerProfileEditSchema = new Schema(
  {
    userId: {
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
    // buyer_type: {
    //   type: String,
    //   trim: true,
    //   required: [true, "Validation Error : buyer_type is required"],
    // },
    // buyer_name: {
    //   type: String,
    //   trim: true,
    //   required: [true, "Validation Error : buyer_name is required"],
    // },
    buyer_address: {
      type: String,
      trim: true,
      required: [true, "Validation Error : buyer_address is required"],
    },
    // buyer_email: {
    //   type: String,
    //   trim: true,
    //   required: [true, "Validation Error : buyer_email is required"],
    //   unique: true,
    // },
    // buyer_mobile: {
    //   type: String,
    //   trim: true,
    //   required: [true, "Validation Error : buyer_mobile is required"],
    // },
    // buyer_country_code: {
    //   type: String,
    //   trim: true,
    //   required: [true, "Validation Error : buyer_country_code is required"],
    // },
    // registration_no: {
    //   type: String,
    //   trim: true,
    //   required: [true, "Validation Error : registration_no is required"],
    // },
    // vat_reg_no: {
    //   type: String,
    //   trim: true,
    //   required: [true, "Validation Error : vat_reg_no is required"],
    // },
    // contact_person_name: {
    //   type: String,
    //   trim: true,
    //   required: [true, "Validation Error : contact_person_name is required"],
    // },
    // designation: {
    //   type: String,
    //   trim: true,
    //   required: [true, "Validation Error : designation is required"],
    // },
    // contact_person_email: {
    //   type: String,
    //   trim: true,
    //   required: [true, "Validation Error : contact_person_email is required"],
    // },
    // contact_person_mobile: {
    //   type: String,
    //   trim: true,
    //   required: [true, "Validation Error : contact_person_mobile is required"],
    // },
    // contact_person_country_code: {
    //   type: String,
    //   trim: true,
    //   required: [
    //     true,
    //     "Validation Error : contact_person_country_code is required",
    //   ],
    // },
    // country_of_origin: {
    //   type: String,
    //   trim: true,
    //   required: [true, "Validation Error : country_of_origin is required"],
    // },
    // country_of_operation: [
    //   {
    //     type: String,
    //     trim: true,
    //     required: [true, "Validation Error : country_of_operation is required"],
    //   },
    // ],
    // approx_yearly_purchase_value: {
    //   type: String,
    //   trim: true,
    //   required: [
    //     true,
    //     "Validation Error : approx_yearly_purchase_value is required",
    //   ],
    // },
    // interested_in: [
    //   {
    //     type: String,
    //     trim: true,
    //     required: [true, "Validation Error : interested_in is required"],
    //   },
    // ],
    // license_no: {
    //   type: String,
    //   trim: true,
    //   required: [true, "Validation Error : license_no is required"],
    // },
    // license_expiry_date: {
    //   type: String,
    //   trim: true,
    //   required: [true, "Validation Error : license_expiry_date is required"],
    // },
    // tax_no: {
    //   type: String,
    //   trim: true,
    //   required: [true, "Validation Error : tax_no is required"],
    // },
    // description: {
    //   type: String,
    //   trim: true,
    //   required: [true, "Validation Error : description is required"],
    // },
    // license_image: [
    //   {
    //     type: String,
    //     trim: true,
    //     required: [true, "Validation Error : license_image is required"],
    //   },
    // ],
    // tax_image: [
    //   {
    //     type: String,
    //     trim: true,
    //     required: [true, "Validation Error : tax_image is required"],
    //   },
    // ],
    // certificate_image: [
    //   {
    //     type: String,
    //     trim: true,
    //     required: [true, "Validation Error : certificate_image is required"],
    //   },
    // ],
    // buyer_image: [
    //   {
    //     type: String,
    //     trim: true,
    //     required: [true, "Validation Error : buyer_image is required"],
    //   },
    // ],
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
