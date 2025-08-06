const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const bidSchema = new Schema(
  {
    general: {
      startDate: {
        type: String,
        trim: true,
        required: [true, "Validation Error: Bid Start Date is required."],
      },
      startTime: {
        type: String,
        trim: true,
        required: [true, "Validation Error: Bid Start Time is required."],
      },
      endTime: {
        type: String,
        trim: true,
        required: [true, "Validation Error: Bid End Time is required."],
      },
      endDate: {
        type: String,
        trim: true,
        required: [true, "Validation Error: Bid End Date is required."],
      },
      description: {
        type: String,
        trim: true,
        required: [true, "Validation Error: Bid Description is required."],
      },
      fromCountries: [
        {
          type: String,
          trim: true,
          required: [true, "Validation Error: From Countries is required."],
        },
      ],
      country: {
        type: String,
        trim: true,
        required: [
          true,
          "Validation Error: Country of Destination is required.",
        ],
      },
      state: {
        type: String,
        trim: true,
        required: [true, "Validation Error: State of Destination is required."],
      },
      bidDocs: [
        {
          type: String,
          trim: true,
          required: [true, "Validation Error: bidDocs is required."],
        },
      ],
      documents: [
        {
          name: {
            type: String,
            trim: true,
            required: [
              true,
              "Validation Error: Requirement Document Name is required.",
            ],
          },
          document: {
            type: String,
            trim: true,
            required: [
              true,
              "Validation Error: Requirement Document is required.",
            ],
          },
        },
      ],
    },
    additionalDetails: [
      {
        itemId: {
          type: String,
          trim: true,
          required: [true, "Validation Error: Bid item id is required."],
          immutable: true,
        },
        certificateName: {
          type: String,
          trim: true,
        },
        docReq: {
          type: String,
          enum: ["Yes", "No"],
          default: "No",
        },
        totalBids: {
          type: Number,
          Default: 0,
        },
        type: {
          type: String,
          trim: true,
          required: [true, "Validation Error: Bid Type is required."],
        },
        category: {
          type: String,
          trim: true,
          required: [true, "Validation Error: Category is required."],
        },
        subCategory: {
          type: String,
          trim: true,
        },
        name: {
          type: String,
          trim: true,
          required: [true, "Validation Error: Name is required."],
        },
        description: {
          type: String,
          trim: true,
          required: [true, "Validation Error: Description is required."],
        },
        upc: {
          type: String,
          trim: true,
        },
        brand: {
          type: String,
          trim: true,
        },
        quantity: {
          type: String,
          trim: true,
          required: [true, "Validation Error: Quantity Required is required."],
        },
        targetPrice: {
          type: String,
          trim: true,
          required: [true, "Validation Error: Target Price is required."],
        },
        openFor: {
          type: String,
          trim: true,
          enum: ["Manufacturer", "Distributor", "Service Provider"],
          required: [true, "Validation Error: Open for is required."],
        },
        delivery: {
          type: String,
          trim: true,
          required: [
            true,
            "Validation Error: Expected Delivery duration is required.",
          ],
        },
        participants: [
          {
            id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Supplier",
              required: [true, "Validation Error: Participant Id is required"],
              immutable: true,
            },
            amount: {
              type: Number,
              required: [
                true,
                "Validation Error: Participant Proposed Amount is required",
              ],
            },
            timeLine: {
              type: Number,
              required: [
                true,
                "Validation Error: Participant Proposed timeLine is required",
              ],
            },
            tnc: {
              type: String,
              required: [
                true,
                "Validation Error: Participant Proposed terms and conditions is required",
              ],
            },
            history: [
              {
                amount: {
                  value: {
                    type: Number,
                    required: [
                      true,
                      "Validation Error: Participant Proposed Amount is required",
                    ],
                  },
                  edited: {
                    type: Boolean,
                    default: false,
                  },
                },
                timeLine: {
                  value: {
                    type: Number,
                    required: [
                      true,
                      "Validation Error: Participant Proposed timeLine is required",
                    ],
                  },
                  edited: {
                    type: Boolean,
                    default: false,
                  },
                },
                tnc: {
                  value: {
                    type: String,
                    required: [
                      true,
                      "Validation Error: Participant Proposed terms and conditions is required",
                    ],
                  },
                  edited: {
                    type: Boolean,
                    default: false,
                  },
                },
                date: {
                  type: Date,
                },
                type: {
                  type: String,
                  enum: ["Bid Created", "Bid Updated"],
                },
              },
            ],
          },
        ],
      },
    ],
    status: {
      type: String,
      trim: true,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    userId: {
      type: String,
      trim: true,
      required: [true, "Validation Error: User Id is required."],
      immutable: true,
    },
    totalBids: {
      type: Number,
      Default: 0,
    },
    userType: {
      type: String,
      trim: true,
      required: [true, "Validation Error: User Type is required."],
      immutable: true,
    },
    bid_id: {
      type: String,
      trim: true,
      required: [true, "Validation Error: Bid Id is required."],
      immutable: true,
    },
    other: {},
  },
  { timestamps: true }
);

// Exporting the models correctly
module.exports = model("Bid", bidSchema);
