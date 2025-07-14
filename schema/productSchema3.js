const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    general: {
      name: {
        type: String,
        trim: true,
        required: [true, "Validation Error: Product Name is required."],
      },
      upc: {
        type: String,
        trim: true,
      },
      form: {
        type: String,
        trim: true,
      },
      model: {
        type: String,
        trim: true,
        required: [true, "Validation Error: Part/Model Number is required."],
      },
      unit_tax: {
        type: Number,
        required: [true, "Validation Error: Tax Percentage is required."],
      },
      description: {
        type: String,
        trim: true,
        required: [true, "Validation Error: Product Description is required."],
      },
      minimumPurchaseUnit: {
        type: String,
        trim: true,
        required: [
          true,
          "Validation Error: Minimum Order Quantity is required.",
        ],
      },
      strength: {
        type: String,
        trim: true,
      },
      strengthUnit: {
        type: String,
        trim: true,
      },
      manufacturer: {
        type: String,
        trim: true,
      },
      aboutManufacturer: {
        type: String,
        trim: true,
        required: [true, "Validation Error: About Manufacturer is required."],
      },
      countryOfOrigin: {
        type: String,
        trim: true,
      },
      quantity: {
        type: Number,
        trim: true,
      },
      image: {
        front: [{ type: String, trim: true }],
        back: [{ type: String, trim: true }],
        side: [{ type: String, trim: true }],
        closeup: [{ type: String, trim: true }],
      },
      brand: {
        type: String,
        trim: true,
      },
      tags: [{ type: String, trim: true }],
      buyersPreferredFrom: [
        { 
          type: String, 
          trim: true,
          required: [true, "Validation Error: Buyers Preferred From is required."],
        }
      ],
    },
    documents: {
      catalogue: [{ type: String, trim: true }],
      specification: [{ type: String, trim: true }],
    },
    inventory: {
      type: String,
      trim: true,
      immutable: true,
      unique: true,
    },
    complianceFile: [
      {
        type: String,
        trim: true,
      },
    ],
    cNCFileNDate: [
      {
        file: [{ type: String }],
        date: { type: String },
      },
    ],
    storage: {
      type: String,
      trim: true,
    },
    additional: {
      other: {
        type: String,
        trim: true,
      },
      guidelinesFile: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    category: {
      type: String,
      enum: [
        "AlternativeMedicines",
        "DentalProducts",
        "DiagnosticAndMonitoringDevices",
        "DisinfectionAndHygieneSupplies",
        "EmergencyAndFirstAidSupplies",
        "EyeCareSupplies",
        "HealthcareITSolutions",
        "HospitalAndClinicSupplies",
        "HomeHealthcareProducts",
        "LaboratorySupplies",
        "MedicalConsumablesAndDisposables",
        "MedicalEquipmentAndDevices",
        "NutritionAndDietaryProducts",
        "OrthopedicSupplies",
        "Pharmaceuticals",
        "SkinHairCosmeticSupplies",
        "VitalHealthAndWellness",
      ],
      required: [true, "Validation Error: Category is required."],
      immutable: true,
    },
    subCategory: {
      type: String,
    },
    anotherCategory: {
      type: String,
      trim: true,
    },
    product_id: {
      type: String,
      required: [true, "Validation Error: User Schema Reference is required."],
      immutable: true,
    },
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Validation Error: User Id is required."],
      immutable: true,
    },
    market: {
      type: String,
      default: "new",
      enum: ["new", "secondary"],
      required: [true, "Validation Error: Product Market is required."],
      immutable: true,
    },
    secondaryMarketDetails: {
      purchasedOn: {
        type: String,
        validate: {
          validator: function (v) {
            return this.market === "secondary" ? !!v : true;
          },
          message: "Validation Error: Purchased On is required.",
        },
      },
      countryAvailable: [
        {
          type: String,
          validate: {
            validator: function (v) {
              return this.market === "secondary" ? !!v : true;
            },
            message: "Validation Error: Country Available is required.",
          },
        },
      ],
      purchaseInvoiceFile: [
        {
          type: String,
          trim: true,
          validate: {
            validator: function (v) {
              return this.market === "secondary" ? !!v : true;
            },
            message: "Validation Error: Performa Invoice is required.",
          },
        },
      ],
      condition: {
        type: String,
        validate: {
          validator: function (v) {
            return this.market === "secondary" ? !!v : true;
          },
          message: "Validation Error: Condition is required.",
        },
      },
      // minimumPurchaseUnit: {
      //   type: String,
      //   validate: {
      //     validator: function (v) {
      //       return this.market === "secondary" ? !!v : true;
      //     },
      //     message: "Validation Error: Minimum Purchase Unit is required.",
      //   },
      // },
    },
    categoryDetailsFile: [
      {
        type: String,
        trim: true,
      },
    ],
    categoryDetails: [
      {
        name: {
          type: String,
          trim: true,
        },
        fieldValue: {
          type: String,
          trim: true,
        },
        type: {
          type: String,
          trim: true,
        },
      },
    ],
    faqs: [
      {
        ques: {
          type: String,
          trim: true,
        },
        ans: {
          type: String,
          trim: true,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    bulkUpload: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
