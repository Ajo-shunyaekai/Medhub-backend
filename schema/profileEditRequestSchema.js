const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const profileEditRequestSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "Validation Error: userId is required"],
    },
    perId: {
      type: String,
      required: [true, "Validation Error: perId is required"],
    },
    userSchemaReference: {
      type: String,
      enum: ["Supplier", "Buyer"],
      required: [true, "Validation Error: userSchemaReference is required"],
    },
    registeredAddress: {
      company_reg_address: {
        value: {
          type: String,
          trim: true,
          required: [true, "Company Billing Address is required for address"],
        },
        isChanged: {
          type: Boolean,
          default: false,
        },
      },
      locality: {
        value: {
          type: String,
          trim: true,
          required: [true, "Street is required for address"],
        },
        isChanged: {
          type: Boolean,
          default: false,
        },
      },
      land_mark: {
        value: {
          type: String,
          trim: true,
        },
        isChanged: {
          type: Boolean,
          default: false,
        },
      },
      city: {
        value: {
          type: String,
          trim: true,
        },
        isChanged: {
          type: Boolean,
          default: false,
        },
      },
      state: {
        value: {
          type: String,
          trim: true,
        },
        isChanged: {
          type: Boolean,
          default: false,
        },
      },
      country: {
        value: {
          type: String,
          trim: true,
          required: [true, "Country is required for address"],
        },
        isChanged: {
          type: Boolean,
          default: false,
        },
      },
      pincode: {
        value: {
          type: String,
          trim: true,
        },
        isChanged: {
          type: Boolean,
          default: false,
        },
      },
      type: {
        type: String,
        enum: ["Registered"],
        default: "Registered",
      },
    },
    editReqStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      required: true,
      trim: true,
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProfileEditRequest", profileEditRequestSchema);
