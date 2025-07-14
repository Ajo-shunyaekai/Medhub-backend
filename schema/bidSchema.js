const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const bidSchema = new Schema(
  {
    general: {
      startDate: {
        type: String,
        required: [true, "Validation Error: Bid Start Date is required."],
      },
      endDate: {
        type: String,
        required: [true, "Validation Error: Bid End Date is required."],
      },
      description: {
        type: String,
        required: [true, "Validation Error: Bid Description is required."],
      },
      documents: [
        {
          type: String,
          required: [
            true,
            "Validation Error: Requirement Documents is required.",
          ],
        },
      ],
    },
    additionalDetails: [
      {
        type: {
          type: String,
          required: [true, "Validation Error: Bid Type is required."],
        },
        category: {
          type: String,
          required: [true, "Validation Error: Category is required."],
        },
        subCategory: {
          type: String,
        },
        name: {
          type: String,
          required: [true, "Validation Error: Name is required."],
        },
        description: {
          type: String,
          required: [true, "Validation Error: Description is required."],
        },
        upc: {
          type: String,
          required: [true, "Validation Error: UPC is required."],
        },
        brand: {
          type: String,
          required: [true, "Validation Error: Brand Name is required."],
        },
        quantity: {
          type: String,
          required: [true, "Validation Error: Quantity Required is required."],
        },
        targetPrice: {
          type: String,
          required: [true, "Validation Error: Target Price is required."],
        },
        country: {
          type: String,
          required: [
            true,
            "Validation Error: Country of Destination is required.",
          ],
        },
        state: {
          type: String,
          required: [
            true,
            "Validation Error: State of Destination is required.",
          ],
        },
        openFor: {
          type: String,
          enum: ["Manufacturer", "Distriutor", "Service Providor", "All"],
          required: [true, "Validation Error: Open for is required."],
        },
        fromCountries: [
          {
            type: String,
            required: [true, "Validation Error: From Countries is required."],
          },
        ],
        delivery: {
          type: String,
          required: [
            true,
            "Validation Error: Expected Delivery duration is required.",
          ],
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    userId: {
      type: String,
      required: [true, "Validation Error: User Idis required."],
      default: "active",
    },
    other: {},
  },
  { timestamps: true }
);

// Exporting the models correctly
module.exports = model("Bid", bidSchema);
