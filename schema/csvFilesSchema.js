const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const csvFilesSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "Validation Error: User Id is required."],
      immutable: true,
    },
    isMainTemplate: { type: String, default: false, immutable: true },
    AlternativeMedicines: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
    DentalProducts: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
    DiagnosticAndMonitoringDevices: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
    DisinfectionAndHygieneSupplies: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
    EmergencyAndFirstAidSupplies: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
    EyeCareSupplies: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
    HealthcareITSolutions: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
    HomeHealthcareProducts: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
    HospitalAndClinicSupplies: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
    LaboratorySupplies: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
    MedicalConsumablesAndDisposables: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
    MedicalEquipmentAndDevices: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
    NutritionAndDietaryProducts: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
    OrthopedicSupplies: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
    Pharmaceuticals: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
    SkinHairCosmeticSupplies: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
    VitalHealthAndWellness: [
      {
        file: [{ type: String }],
        status: {
          type: String,
          default: "Pending",
          enum: ["Pending", "Uploaded", "Rejected"],
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("CsvFile", csvFilesSchema);
