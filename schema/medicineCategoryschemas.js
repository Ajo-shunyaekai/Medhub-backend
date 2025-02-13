const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// MedicalEquipmentAndDevicesSchema
const medicalEquipmentAndDevicesSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [
          "Diagnostic Tools",
          "Imaging Equipment",
          "Surgical Instruments",
          "Monitoring Devices",
          "Mobility Aids",
          "Respiratory Care ",
          "Elderly Care Products",
        ],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
        },
      },
    },
    specification: {
      type: String,
    },
    specificationFile: {
      type: String,
    },
    diagnosticFunctions: {
      type: String,
    },
    interoperability: {
      type: String,
    },
    laserType: {
      type: String,
    },
    coolingSystem: {
      type: String,
    },
    spotSize: {
      type: String,
    },
    performanceTestingReport: {
      type: String,
    },
    performanceTestingReportFile: {
      type: String,
    },
  },
  { timestamps: true }
);

// PharmaceuticalsSchema
const pharmaceuticalsSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
          enum: [],
        },
      },
    },
    genericName: {
      type: String,
      required: [true, "Validation Error: Generic Name is required."],
    },
    strength: {
      type: String,
      required: [true, "Validation Error: Strength is required."],
    },
    composition: {
      type: String,
      required: [
        true,
        "Validation Error: Composition/Ingredients is required.",
      ],
    },
    formulation: {
      type: String,
    },
    purpose: {
      type: String,
    },
    drugAdministrationRoute: {
      type: String,
      required: [
        true,
        "Validation Error: Drug Administration Route is required.",
      ],
    },
    drugClass: {
      type: String,
      required: [true, "Validation Error: Drug Class is required."],
    },
    controlledSubstance: {
      type: String,
    },
    otcClassification: {
      type: String,
    },
    expiry: {
      type: String,
      required: [true, "Validation Error: Shelf Life/Expiry is required."],
    },
    sideEffectsAndWarnings: {
      type: String,
    },
    allergens: {
      type: String,
    },
  },
  { timestamps: true }
);

// SkinHairCosmeticSuppliesSchema
const skinHairCosmeticSuppliesSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
          enum: [],
        },
      },
    },
    fragranceragrance: {
      type: String,
    },
    spf: {
      type: String,
    },
    vegan: {
      type: Boolean,
    },
    crueltyFree: {
      type: Boolean,
    },
    formulation: {
      type: String,
    },
    strength: {
      type: String,
      required: [true, "Validation Error: Strength is required."],
    },
    composition: {
      type: String,
      required: [
        true,
        "Validation Error: Composition/Ingredients is required.",
      ],
    },
    purpose: {
      type: String,
      required: [true, "Validation Error: Purpose is required."],
    },
    targetCondition: {
      type: String,
      required: [true, "Validation Error: Target Condition is required."],
    },
    drugAdministrationRoute: {
      type: String,
      required: [
        true,
        "Validation Error: Drug Administration Route is required.",
      ],
    },
    drugClass: {
      type: String,
      required: [true, "Validation Error: Drug Class is required."],
    },
    controlledSubstance: {
      type: String,
    },
    otcClassification: {
      type: String,
    },
    expiry: {
      type: String,
      required: [true, "Validation Error: Shelf Life/Expiry is required."],
    },
    sideEffectsAndWarnings: {
      type: String,
    },
    Allergens: {
      type: String,
    },
    dermatologistTested: {
      type: Boolean,
      required: [true, "Validation Error: Dermatologist Tested is required."],
    },
    dermatologistTestedFile: {
      type: String,
    },
    pediatricianRecommended: {
      type: Boolean,
      required: [
        true,
        "Validation Error: Pediatrician Recommended is required.",
      ],
    },
    pediatricianRecommendedFile: {
      type: String,
    },
    elasticity: {
      type: Boolean,
    },
    adhesiveness: {
      type: Boolean,
    },
    thickness: {
      type: Boolean,
    },
    concentration: {
      type: Boolean,
    },
    purpose: {
      type: Boolean,
    },
    moisturizers: {
      type: Boolean,
    },
    fillerType: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

// VitalHealthAndWellnessSchema
const vitalHealthAndWellnessSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
          enum: [],
        },
      },
    },
    healthBenefit: {
      type: String,
      required: [true, "Validation Error: Health Benefit is required."],
    },
    genericName: {
      type: String,
      required: [true, "Validation Error: Generic Name is required."],
    },
    strength: {
      type: String,
      required: [true, "Validation Error: Strength is required."],
    },
    composition: {
      type: String,
      required: [
        true,
        "Validation Error: Composition/Ingredients is required.",
      ],
    },
    formulation: {
      type: String,
      //   required: [true, "Validation Error: Formulation is required."],
    },
    purpose: {
      type: String,
      required: [true, "Validation Error: Purpose is required."],
    },
    drugAdministrationRoute: {
      type: String,
      required: [
        true,
        "Validation Error: Drug Administration Route is required.",
      ],
    },
    drugClass: {
      type: String,
      required: [true, "Validation Error: Drug Class is required."],
    },
    controlledSubstance: {
      type: String,
    },
    otcClassification: {
      type: String,
    },
    expiry: {
      type: String,
      required: [true, "Validation Error: Shelf Life/Expiry is required."],
    },
    sideEffectsAndWarnings: {
      type: String,
    },
    allergens: {
      type: String,
    },
    vegan: {
      type: Boolean,
    },
    crueltyFree: {
      type: Boolean,
    },
    additivesSweeteners: {
      type: String,
    },
  },
  { timestamps: true }
);

// MedicalConsumablesAndDisposablesSchema
const medicalConsumablesAndDisposablesSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
          enum: [],
        },
      },
    },
    thickness: {
      type: String,
    },
    powdered: {
      type: Boolean,
    },
    productMaterial: {
      type: String,
    },
    purpose: {
      type: String,
    },
    expiry: {
      type: String,
      required: [true, "Validation Error: Shelf Life/Expiry is required."],
    },
    texture: {
      type: Boolean,
    },
    sterilized: {
      type: Boolean,
    },
    chemicalResistance: {
      type: String,
    },
    allergens: {
      type: String,
    },
    filtrationEfficiency: {
      type: String,
    },
    breathability: {
      type: String,
    },
    layerCount: {
      type: String,
    },
    fluidResistance: {
      type: Boolean,
    },
    filtrationType: {
      type: String,
    },
    shape: {
      type: String,
    },
    coating: {
      type: String,
    },
  },
  { timestamps: true }
);

// LaboratorySuppliesSchema
const laboratorySuppliesSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
          enum: [],
        },
      },
    },
    specification: {
      type: String,
      required: [true, "Validation Error: Specification is required."],
    },
    specificationFile: {
      type: String,
      required: [true, "Validation Error: Specification File is required."],
    },
    diagnosticFunctions: {
      type: String,
      required: [true, "Validation Error: Diagnostic Functions is required."],
    },
    measurementRange: {
      type: String,
    },
    flowRate: {
      type: String,
    },
    concentration: {
      type: String,
    },
    noiseLevel: {
      type: String,
    },
    maintenanceNotes: {
      type: String,
    },
    compatibleEquipment: {
      type: String,
    },
    usageRate: {
      type: String,
    },
    PerformanceTestingReport: {
      type: String,
    },
  },
  { timestamps: true }
);

// DiagnosticAndMonitoringDevicesSchema
const diagnosticAndMonitoringDevicesSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
          enum: [],
        },
      },
    },
    magnificationRange: {
      type: String,
    },
    objectiveLenses: {
      type: String,
    },
    powerSource: {
      type: String,
    },
    resolution: {
      type: String,
    },
    connectivity: {
      type: String,
    },
    shape: {
      type: String,
    },
    coating: {
      type: String,
    },
    purpose: {
      type: String,
    },
    casNumber: {
      type: String,
    },
    grade: {
      type: String,
    },
    concentration: {
      type: String,
    },
    physicalState: {
      type: String,
    },
    hazardClassification: {
      type: String,
    },
  },
  { timestamps: true }
);

// HospitalAndClinicSuppliesSchema
const hospitalAndClinicSuppliesSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
          enum: [],
        },
      },
    },
    adhesiveness: {
      type: String,
    },
    absorbency: {
      type: String,
    },
    thickness: {
      type: String,
    },
    powdered: {
      type: Boolean,
    },
    productMaterial: {
      type: String,
    },
    purpose: {
      type: String,
    },
    expiry: {
      type: String,
      required: [true, "Validation Error: Shelf Life/Expiry is required."],
    },
    texture: {
      type: Boolean,
    },
    sterilized: {
      type: Boolean,
    },
    chemicalResistance: {
      type: String,
    },
    fluidResistance: {
      type: Boolean,
    },
    elasticity: {
      type: String,
    },
  },
  { timestamps: true }
);

// OrthopedicSuppliesSchema
const orthopedicSuppliesSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
          enum: [],
        },
      },
    },
    breathability: {
      type: String,
    },
    colorOptions: {
      type: String,
    },
    elasticity: {
      type: String,
    },
    sterilized: {
      type: Boolean,
    },
    absorbency: {
      type: String,
    },
    purpose: {
      type: String,
    },
    targetCondition: {
      type: String,
      required: [true, "Validation Error: Target Condition is required."],
    },
    coating: {
      type: String,
    },
    strength: {
      type: String,
      required: [true, "Validation Error: Strength is required."],
    },
    moistureResistance: {
      type: String,
      enum: ["Yes", "No"],
    },
  },
  { timestamps: true }
);

// DentalProductsSchema
const dentalProductsSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
          enum: [],
        },
      },
    },
    productMaterial: {
      type: String,
    },
    purpose: {
      type: String,
    },
    targetCondition: {
      type: String,
    },
    maintenanceNotes: {
      type: String,
    },
    compatibleEquipment: {
      type: String,
      required: [true, "Validation Error: Target Condition is required."],
    },
    usageRate: {
      type: String,
    },
    expiry: {
      type: String,
      required: [true, "Validation Error: Shelf Life/Expiry is required."],
    },
  },
  { timestamps: true }
);

// EyeCareSuppliesSchema
const eyeCareSuppliesSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
          enum: [],
        },
      },
    },
    lensPower: {
      type: String,
    },
    baseCurve: {
      type: String,
    },
    diameter: {
      type: String,
    },
    frame: {
      type: String,
      enum: ["Metal", "Plastic", "Rimless"],
    },
    lens: {
      type: String,
      enum: ["Single Vision", "Bifocal", "Progressive", "Anti-Reflective"],
    },
    lensMaterial: {
      type: String,
      enum: ["Polycarbonate", "Glass", "Trivex"],
    },
    colorOptions: {
      type: String,
    },
  },
  { timestamps: true }
);

// HomeHealthcareProductsSchema
const homeHealthcareProductsSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
          enum: [],
        },
      },
    },
    colorOptions: {
      type: String,
    },
    maxWeightCapacity: {
      type: String,
    },
    gripType: {
      type: String,
    },
    foldability: {
      type: String,
    },
    lockingMechanism: {
      type: String,
    },
    typeOfSupport: {
      type: String,
    },
    flowRate: {
      type: String,
    },
    concentration: {
      type: String,
    },
    batteryType: {
      type: String,
    },
    batterySize: {
      type: String,
    },
    performanceTestingReport: {
      type: String,
    },
    performanceTestingReportFile: {
      type: String,
    },
    expiry: {
      type: String,
      required: [true, "Validation Error: Shelf Life/Expiry is required."],
    },
  },
  { timestamps: true }
);

// AlternativeMedicinesSchema
const alternativeMedicinesSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
          enum: [],
        },
      },
    },
    composition: {
      type: String,
      required: [
        true,
        "Validation Error: Composition/Ingredients is required.",
      ],
    },
    purpose: {
      type: String,
    },
    healthClaims: {
      type: String,
    },
    healthClaimsFile: {
      type: String,
    },
    expiry: {
      type: String,
      required: [true, "Validation Error: Shelf Life/Expiry is required."],
    },
  },
  { timestamps: true }
);

// EmergencyAndFirstAidSuppliesSchema
const emergencyAndFirstAidSuppliesSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
          enum: [],
        },
      },
    },
    expiry: {
      type: String,
      required: [true, "Validation Error: Shelf Life/Expiry is required."],
    },
    composition: {
      type: String,
      required: [
        true,
        "Validation Error: Composition/Ingredients is required.",
      ],
    },
    productLongevity: {
      type: String,
      required: [true, "Validation Error: Product Longevity  is required."],
    },
    foldability: {
      type: String,
      required: [true, "Validation Error: Foldability  is required."],
    },
  },
  { timestamps: true }
);

// DisinfectionAndHygieneSuppliesSchema
const disinfectionAndHygieneSuppliesSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
          enum: [],
        },
      },
    },
    composition: {
      type: String,
      required: [
        true,
        "Validation Error: Composition/Ingredients is required.",
      ],
    },
    concentration: {
      type: String,
    },
    formulation: {
      type: String,
    },
    expiry: {
      type: String,
      required: [true, "Validation Error: Shelf Life/Expiry is required."],
    },
    fragrance: {
      type: String,
    },
  },
  { timestamps: true }
);

// NutritionAndDietaryProductsSchema
const nutritionAndDietaryProductsSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
          enum: [],
        },
      },
    },
    flavorOptions: {
      type: String,
      required: [true, "Validation Error: Flavor Options is required."],
    },
    aminoAcidProfile: {
      type: String,
      required: [true, "Validation Error: Amino Acid Profile is required."],
    },
    fatContent: {
      type: String,
      required: [true, "Validation Error: Fat Content is required."],
    },
    expiry: {
      type: String,
      required: [true, "Validation Error: Shelf Life/Expiry is required."],
    },
    vegan: {
      type: Boolean,
    },
    purpose: {
      type: String,
    },
    healthBenefit: {
      type: String,
      required: [true, "Validation Error: Health Benefit is required."],
    },
    composition: {
      type: String,
      required: [
        true,
        "Validation Error: Composition/Ingredients is required.",
      ],
    },
    additivesAndSweeteners: {
      type: String,
      required: [true, "Validation Error: Additives & Sweeteners is required."],
    },
    dairyFree: {
      type: Boolean,
      enum: ["Yes", "No"],
    },
  },
  { timestamps: true }
);

// HealthcareITSolutionsSchema
const healthcareITSolutionsSchema = new Schema(
  {
    subCategory: {
      value: {
        type: String,
        enum: [],
        required: true,
      },
      anotherSubCatrgory: {
        value: {
          type: String,
          enum: [],
        },
      },
    },
    license: {
      type: String,
      required: [true, "Validation Error: License is required."],
    },
    scalabilityInfo: {
      type: String,
      required: [true, "Validation Error: Scalability Info is required."],
    },
    addOns: {
      type: String,
      required: [true, "Validation Error: Add-Ons is required."],
    },
    interoperability: {
      type: String,
      required: [true, "Validation Error: Interoperability is required."],
    },
    userAccess: {
      type: String,
      required: [true, "Validation Error: User Access is required."],
    },
    keyFeatures: {
      type: String,
      required: [true, "Validation Error: Key Features is required."],
    },
    coreFunctionalities: {
      type: String,
      required: [true, "Validation Error: Core Functionalities is required."],
    },
  },
  { timestamps: true }
);

// Exporting models
module.exports = {
  MedicalEquipmentAndDevices: model(
    "MedicalEquipmentAndDevices",
    medicalEquipmentAndDevicesSchema
  ),
  Pharmaceuticals: model("Pharmaceuticals", pharmaceuticalsSchema),
  SkinHairCosmeticSupplies: model(
    "SkinHairCosmeticSupplies",
    skinHairCosmeticSuppliesSchema
  ),
  VitalHealthAndWellness: model(
    "VitalHealthAndWellness",
    vitalHealthAndWellnessSchema
  ),
  MedicalConsumablesAndDisposables: model(
    "MedicalConsumablesAndDisposables",
    medicalConsumablesAndDisposablesSchema
  ),
  LaboratorySupplies: model("LaboratorySupplies", laboratorySuppliesSchema),
  DiagnosticAndMonitoringDevices: model(
    "DiagnosticAndMonitoringDevices",
    diagnosticAndMonitoringDevicesSchema
  ),
  HospitalAndClinicSupplies: model(
    "HospitalAndClinicSupplies",
    hospitalAndClinicSuppliesSchema
  ),
  OrthopedicSupplies: model("OrthopedicSupplies", orthopedicSuppliesSchema),
  DentalProducts: model("DentalProducts", dentalProductsSchema),
  EyeCareSupplies: model("EyeCareSupplies", eyeCareSuppliesSchema),
  HomeHealthcareProducts: model(
    "HomeHealthcareProducts",
    homeHealthcareProductsSchema
  ),
  AlternativeMedicines: model(
    "AlternativeMedicines",
    alternativeMedicinesSchema
  ),
  EmergencyAndFirstAidSupplies: model(
    "EmergencyAndFirstAidSupplies",
    emergencyAndFirstAidSuppliesSchema
  ),
  DisinfectionAndHygieneSupplies: model(
    "DisinfectionAndHygieneSupplies",
    disinfectionAndHygieneSuppliesSchema
  ),
  NutritionAndDietaryProducts: model(
    "NutritionAndDietaryProducts",
    nutritionAndDietaryProductsSchema
  ),
  HealthcareITSolutions: model(
    "HealthcareITSolutions",
    healthcareITSolutionsSchema
  ),
};
