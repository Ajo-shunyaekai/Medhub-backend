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
      description: {
        type: String,
        trim: true,
        required: [true, "Validation Error: Product Description is required."],
      },
      manufacturer: {
        type: String,
        trim: true,
        required: [true, "Validation Error: Manufacturer is required."],
      },
      countryOfOrigin: {
        type: String,
        trim: true,
        required: [true, "Validation Error: Country of origin is required."],
      },
      upc: {
        type: String,
        trim: true,
      },
      model: {
        type: String,
        trim: true,
        required: [true, "Validation Error: Part/Model Number is required."],
      },
      image: {
        type: String,
        trim: true,
      },
      brand: {
        type: String,
        trim: true,
      },
      form: {
        type: String,
        trim: true,
        required: [true, "Validation Error: Type/Form is required."],
      },
      quantity: {
        type: String,
        trim: true,
        required: [true, "Validation Error: Product Quantity is required."],
      },
      volumn: {
        type: String,
        trim: true,
        required: [
          true,
          "Validation Error: Product Size / Volumn is required.",
        ],
      },
      weight: {
        type: String,
        trim: true,
        required: [true, "Validation Error: Product Weight is required."],
      },
      packageType: {
        type: String,
        trim: true,
        required: [
          true,
          "Validation Error: Product Packaging Type is required.",
        ],
      },
      packageMaterial: {
        type: String,
        trim: true,
        required: [
          true,
          "Validation Error: Product Packaging Material is required.",
        ],
      },
      unitPrice: {
        type: String,
        trim: true,
      },
    },
    inventory: {
      sku: {
        type: String,
        trim: true,
      },
      stock: {
        type: String,
        trim: true,
        enum: ["In-stock", "Out of Stock", "On-demand"],
      },
      stockQuantity: {
        type: String,
        trim: true,
      },
      countries: [
        {
          type: String,
          trim: true,
        },
      ],
      date: {
        type: String,
        trim: true,
      },
    },
    compliance: [
      {
        type: String,
        trim: true,
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
      guuidelines: {
        type: String,
        trim: true,
      },
      warranty: {
        type: String,
        trim: true,
      },
    },
    healthNSafety: {
      safetyDatasheet: [
        {
          type: String,
          trim: true,
        },
      ],
      healthHazardRating: {
        type: String,
        trim: true,
      },
      environmentalImpact: {
        type: String,
        trim: true,
      },
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Validation Error: categoryId is required"],
    },
    category: {
      type: String,
      enum: [
        "MedicalEquipmentAndDevices",
        "Pharmaceuticals",
        "SkinHairCosmeticSupplies",
        "VitalHealthAndWellness",
        "MedicalConsumablesAndDisposables",
        "LaboratorySupplies",
        "DiagnosticAndMonitoringDevices",
        "HospitalAndClinicSupplies",
        "OrthopedicSupplies",
        "DentalProducts",
        "EyeCareSupplies",
        "HomeHealthcareProducts",
        "AlternativeMedicines",
        "EmergencyAndFirstAidSupplies",
        "DisinfectionAndHygieneSupplies",
        "NutritionAndDietaryProducts",
        "HealthcareITSolutions",
      ],
      required: [true, "Validation Error: categorySchemaRef is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Validation Error: userId is required"],
    },
    userSchemaReference: {
      type: String,
      enum: ["Supplier", "Buyer"],
      required: [true, "Validation Error: userSchemaReference is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
