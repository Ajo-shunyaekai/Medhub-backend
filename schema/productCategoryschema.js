// const mongoose = require("mongoose");
// const { Schema, model } = mongoose;

// // MedicalEquipmentAndDevicesSchema
// const medicalEquipmentAndDevicesSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: [
//         "Diagnostic Tools",
//         "Imaging Equipment",
//         "Surgical Instruments",
//         "Monitoring Devices",
//         "Mobility Aids",
//         "Respiratory Care",
//         "Elderly Care Products",
//       ],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     specification: {
//       type: String,
//       trim: true,
//     },
//     specificationFile: [
//       {
//         type: String,
//         trim: true,
//       },
//     ],
//     diagnosticFunctions: {
//       type: String,
//       trim: true,
//     },
//     interoperability: {
//       type: String,
//       trim: true,
//     },
//     laserType: {
//       type: String,
//       trim: true,
//     },
//     coolingSystem: {
//       type: String,
//       trim: true,
//     },
//     spotSize: {
//       type: String,
//       trim: true,
//     },
//     performanceTestingReport: {
//       type: String,
//       trim: true,
//     },
//     performanceTestingReportFile: [
//       {
//         type: String,
//         trim: true,
//       },
//     ],
//   },
//   { timestamps: true }
// );

// // PharmaceuticalsSchema
// const pharmaceuticalsSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: [
//         "Prescription Medications",
//         "Over-the-Counter Medications",
//         "Vaccines",
//         "Generic Drugs",
//         "Specialized Treatments",
//       ],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     genericName: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Generic Name is required."],
//     },
//     strength: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Strength is required."],
//     },
//     composition: {
//       type: String,
//       trim: true,
//       required: [
//         true,
//         "Validation Error: Composition/Ingredients is required.",
//       ],
//     },
//     formulation: {
//       type: String,
//       trim: true,
//     },
//     purpose: {
//       type: String,
//       trim: true,
//     },
//     drugAdministrationRoute: {
//       type: String,
//       trim: true,
//       required: [
//         true,
//         "Validation Error: Drug Administration Route is required.",
//       ],
//     },
//     drugClass: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Drug Class is required."],
//     },
//     controlledSubstance: {
//       type: Boolean,
//       trim: true,
//     },
//     otcClassification: {
//       type: String,
//       trim: true,
//       enum: ["Category I", "Category II", "Category III"],
//     },
//     expiry: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Shelf Life/Expiry is required."],
//     },
//     sideEffectsAndWarnings: {
//       type: String,
//       trim: true,
//     },
//     allergens: {
//       type: String,
//       trim: true,
//     },
//   },
//   { timestamps: true }
// );

// // SkinHairCosmeticSuppliesSchema
// const skinHairCosmeticSuppliesSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: [
//         "Skin Care",
//         "Hair Care",
//         "Personal Hygiene",
//         "Baby Care",
//         "Anti-aging Solutions",
//         "Skin Graft",
//         "Anti-Scar & Healing Ointments",
//         "Burn Care Solutions",
//         "Dermal Fillers & Injectables",
//         "Laser Treatment Devices",
//         "Chemical Peels",
//       ],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     fragranceragrance: {
//       type: String,
//       trim: true,
//     },
//     spf: {
//       type: String,
//       trim: true,
//     },
//     vegan: {
//       type: Boolean,
//     },
//     crueltyFree: {
//       type: Boolean,
//     },
//     formulation: {
//       type: String,
//       trim: true,
//     },
//     strength: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Strength is required."],
//     },
//     composition: {
//       type: String,
//       trim: true,
//       required: [
//         true,
//         "Validation Error: Composition/Ingredients is required.",
//       ],
//     },
//     purpose: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Purpose is required."],
//     },
//     targetCondition: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Target Condition is required."],
//     },
//     drugAdministrationRoute: {
//       type: String,
//       trim: true,
//       required: [
//         true,
//         "Validation Error: Drug Administration Route is required.",
//       ],
//     },
//     drugClass: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Drug Class is required."],
//     },
//     controlledSubstance: {
//       type: String,
//       trim: true,
//     },
//     otcClassification: {
//       type: String,
//       trim: true,
//       enum: ["Category I", "Category II", "Category III"],
//     },
//     expiry: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Shelf Life/Expiry is required."],
//     },
//     sideEffectsAndWarnings: {
//       type: String,
//       trim: true,
//     },
//     allergens: {
//       type: String,
//       trim: true,
//     },
//     dermatologistTested: {
//       type: String,
//       enum: ["Yes", "No"],
//       required: [true, "Validation Error: Dermatologist Tested is required."],
//     },
//     dermatologistTestedFile: [
//       {
//         type: String,
//         trim: true,
//       },
//     ],
//     pediatricianRecommended: {
//       type: String,
//       enum: ["Yes", "No"],
//       required: [
//         true,
//         "Validation Error: Pediatrician Recommended is required.",
//       ],
//     },
//     pediatricianRecommendedFile: [
//       {
//         type: String,
//         trim: true,
//       },
//     ],
//     elasticity: {
//       type: String,
//       trim: true,
//     },
//     adhesiveness: {
//       type: String,
//       trim: true,
//     },
//     thickness: {
//       type: String,
//       trim: true,
//     },
//     concentration: {
//       type: String,
//       trim: true,
//     },
//     purpose: {
//       type: String,
//       trim: true,
//     },
//     moisturizers: {
//       type: String,
//       trim: true,
//     },
//     fillerType: {
//       type: String,
//       trim: true,
//     },
//   },
//   { timestamps: true }
// );

// // VitalHealthAndWellnessSchema
// const vitalHealthAndWellnessSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: [
//         "Fitness Monitors",
//         "Herbal & Alternative Medicines",
//         "Immune Boosters",
//         "Vitamins & Supplements",
//         "Weight Management",
//       ],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     healthBenefit: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Health Benefit is required."],
//     },
//     genericName: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Generic Name is required."],
//     },
//     strength: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Strength is required."],
//     },
//     composition: {
//       type: String,
//       trim: true,
//       required: [
//         true,
//         "Validation Error: Composition/Ingredients is required.",
//       ],
//     },
//     formulation: {
//       type: String,
//       trim: true,
//     },
//     purpose: {
//       type: String,
//       trim: true,
//     },
//     drugAdministrationRoute: {
//       type: String,
//       trim: true,
//       required: [
//         true,
//         "Validation Error: Drug Administration Route is required.",
//       ],
//     },
//     drugClass: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Drug Class is required."],
//     },
//     controlledSubstance: {
//       type: Boolean,
//     },
//     otcClassification: {
//       type: String,
//       trim: true,
//       enum: ["Category I", "Category II", "Category III"],
//     },
//     expiry: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Shelf Life/Expiry is required."],
//     },
//     sideEffectsAndWarnings: {
//       type: String,
//       trim: true,
//     },
//     allergens: {
//       type: String,
//       trim: true,
//     },
//     vegan: {
//       type: Boolean,
//     },
//     crueltyFree: {
//       type: Boolean,
//     },
//     additivesSweeteners: {
//       type: String,
//       trim: true,
//     },
//   },
//   { timestamps: true }
// );

// // MedicalConsumablesAndDisposablesSchema
// const medicalConsumablesAndDisposablesSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: [
//         "Bandages, Gauze, & Wound Dressings",
//         "Gloves, Masks, & Protective gear",
//         "Sterilization Products",
//         "Surgical Sutures & Adhesives",
//         "Syringes, IV Sets & Catheters",
//       ],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     thickness: {
//       type: String,
//       trim: true,
//     },
//     powdered: {
//       type: Boolean,
//     },
//     productMaterial: {
//       type: String,
//       trim: true,
//     },
//     purpose: {
//       type: String,
//       trim: true,
//     },
//     expiry: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Shelf Life/Expiry is required."],
//     },
//     texture: {
//       type: Boolean,
//     },
//     sterilized: {
//       type: Boolean,
//     },
//     chemicalResistance: {
//       type: String,
//       trim: true,
//     },
//     allergens: {
//       type: String,
//       trim: true,
//     },
//     filtrationEfficiency: {
//       type: String,
//       trim: true,
//     },
//     breathability: {
//       type: String,
//       trim: true,
//     },
//     layerCount: {
//       type: String,
//       trim: true,
//     },
//     fluidResistance: {
//       type: Boolean,
//     },
//     filtrationType: [
//       {
//         type: String,
//         trim: true,
//       },
//     ],
//     shape: {
//       type: String,
//       trim: true,
//     },
//     coating: {
//       type: String,
//       trim: true,
//     },
//   },
//   { timestamps: true }
// );

// // LaboratorySuppliesSchema
// const laboratorySuppliesSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: [
//         "Test kits",
//         "Microscopes & Lab Equipment",
//         "Chemicals & Reagents",
//         "Lab Consumables",
//       ],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     magnificationRange: {
//       type: String,
//       trim: true,
//     },
//     objectiveLenses: {
//       type: String,
//       trim: true,
//     },
//     powerSource: {
//       type: String,
//       trim: true,
//     },
//     resolution: {
//       type: String,
//       trim: true,
//     },
//     connectivity: {
//       type: String,
//       trim: true,
//     },
//     shape: {
//       type: String,
//       trim: true,
//     },
//     coating: {
//       type: String,
//       trim: true,
//     },
//     purpose: {
//       type: String,
//       trim: true,
//     },
//     casNumber: {
//       type: String,
//       trim: true,
//     },
//     grade: {
//       type: String,
//       trim: true,
//     },
//     concentration: {
//       type: String,
//       trim: true,
//     },
//     physicalState: [
//       {
//         type: String,
//         trim: true,
//       },
//     ],
//     hazardClassification: [
//       {
//         type: String,
//         trim: true,
//       },
//     ],
//   },
//   { timestamps: true }
// );

// // DiagnosticAndMonitoringDevicesSchema
// const diagnosticAndMonitoringDevicesSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: [
//         "Blood Glucose Monitors",
//         "Blood Pressure Monitors",
//         "Oxygen Concentrators",
//         "Wearable Health Devices",
//       ],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     specification: {
//       type: String,
//       trim: true,
//       required: [true, "Specification is required"],
//     },
//     specificationFile: [
//       {
//         type: String,
//         trim: true,
//         required: [true, "Specification File is required"],
//       },
//     ],
//     diagnosticFunctions: {
//       type: String,
//       trim: true,
//       required: [true, "Diagnostic Functions is required"],
//     },
//     measurementRange: {
//       type: String,
//       trim: true,
//     },
//     flowRate: {
//       type: String,
//       trim: true,
//     },
//     concentration: {
//       type: String,
//       trim: true,
//     },
//     noiseLevel: {
//       type: String,
//       trim: true,
//     },
//     maintenanceNotes: {
//       type: String,
//       trim: true,
//     },
//     compatibleEquipment: {
//       type: String,
//       trim: true,
//     },
//     usageRate: {
//       type: String,
//       trim: true,
//     },
//     performanceTestingReport: {
//       type: String,
//       trim: true,
//     },
//     performanceTestingReportFile: [
//       {
//         type: String,
//         trim: true,
//       },
//     ],
//   },
//   { timestamps: true }
// );

// // HospitalAndClinicSuppliesSchema
// const hospitalAndClinicSuppliesSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: [
//         "Patient Beds & Stretchers",
//         "Trolleys & Storage Units",
//         "Examination Tables",
//         "Medical Furniture",
//       ],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     adhesiveness: {
//       type: String,
//       trim: true,
//     },
//     absorbency: {
//       type: String,
//       trim: true,
//     },
//     thickness: {
//       type: String,
//       trim: true,
//     },
//     powdered: {
//       type: Boolean,
//     },
//     productMaterial: {
//       type: String,
//       trim: true,
//     },
//     purpose: {
//       type: String,
//       trim: true,
//     },
//     expiry: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Shelf Life/Expiry is required."],
//     },
//     texture: {
//       type: Boolean,
//     },
//     sterilized: {
//       type: Boolean,
//     },
//     chemicalResistance: {
//       type: String,
//       trim: true,
//     },
//     fluidResistance: {
//       type: Boolean,
//     },
//     elasticity: {
//       type: String,
//       trim: true,
//     },
//   },
//   { timestamps: true }
// );

// // OrthopedicSuppliesSchema
// const orthopedicSuppliesSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: [
//         "Orthopedic Braces & Supports",
//         "Splints & Casting Materials",
//         "Prosthetics",
//         "Rehabilitation Equipment",
//       ],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     breathability: {
//       type: String,
//       trim: true,
//     },
//     colorOptions: {
//       type: String,
//       trim: true,
//     },
//     elasticity: {
//       type: String,
//       trim: true,
//     },
//     sterilized: {
//       type: Boolean,
//     },
//     absorbency: {
//       type: String,
//       trim: true,
//     },
//     purpose: {
//       type: String,
//       trim: true,
//     },
//     targetCondition: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Target Condition is required."],
//     },
//     coating: {
//       type: String,
//       trim: true,
//     },
//     strength: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Strength is required."],
//     },
//     moistureResistance: {
//       type: String,
//       trim: true,
//       enum: ["Yes", "No"],
//     },
//   },
//   { timestamps: true }
// );

// // DentalProductsSchema
// const dentalProductsSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: [
//         "Dental Instruments & tools",
//         "Orthodontic Supplies",
//         "Dental Chairs and Accessories",
//         "Dental Consumables",
//       ],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     productMaterial: {
//       type: String,
//       trim: true,
//     },
//     purpose: {
//       type: String,
//       trim: true,
//     },
//     targetCondition: {
//       type: String,
//       trim: true,
//     },
//     maintenanceNotes: {
//       type: String,
//       trim: true,
//     },
//     compatibleEquipment: {
//       type: String,
//       trim: true,
//     },
//     usageRate: {
//       type: String,
//       trim: true,
//     },
//     expiry: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Shelf Life/Expiry is required."],
//     },
//   },
//   { timestamps: true }
// );

// // EyeCareSuppliesSchema
// const eyeCareSuppliesSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: [
//         "Contact Lenses and Solutions",
//         "Eyewear",
//         "Eyewear Lenses",
//         "Eye Drops and Ointments",
//       ],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     lensPower: {
//       type: String,
//       trim: true,
//     },
//     baseCurve: {
//       type: String,
//       trim: true,
//     },
//     diameter: {
//       type: String,
//       trim: true,
//     },
//     frame: {
//       type: String,
//       trim: true,
//       enum: ["Metal", "Plastic", "Rimless"],
//     },
//     lens: {
//       type: String,
//       trim: true,
//       enum: ["Single Vision", "Bifocal", "Progressive", "Anti-Reflective"],
//     },
//     lensMaterial: {
//       type: String,
//       trim: true,
//       enum: ["Polycarbonate", "Glass", "Trivex"],
//     },
//     colorOptions: {
//       type: String,
//       trim: true,
//     },
//   },
//   { timestamps: true }
// );

// // HomeHealthcareProductsSchema
// const homeHealthcareProductsSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: [
//         "Mobility Aids",
//         "Respiratory Care",
//         "Patient Monitoring Devices",
//         "Elderly Care Products",
//       ],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     colorOptions: {
//       type: String,
//       trim: true,
//     },
//     maxWeightCapacity: {
//       type: String,
//       trim: true,
//     },
//     gripType: {
//       type: String,
//       trim: true,
//     },
//     foldability: {
//       type: String,
//       trim: true,
//     },
//     lockingMechanism: {
//       type: String,
//       trim: true,
//     },
//     typeOfSupport: {
//       type: String,
//       trim: true,
//     },
//     flowRate: {
//       type: String,
//       trim: true,
//     },
//     concentration: {
//       type: String,
//       trim: true,
//     },
//     batteryType: {
//       type: String,
//       trim: true,
//     },
//     batterySize: {
//       type: String,
//       trim: true,
//     },
//     performanceTestingReport: {
//       type: String,
//       trim: true,
//     },
//     performanceTestingReportFile: [
//       {
//         type: String,
//         trim: true,
//       },
//     ],
//     expiry: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Shelf Life/Expiry is required."],
//     },
//   },
//   { timestamps: true }
// );

// // AlternativeMedicinesSchema
// const alternativeMedicinesSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: ["Homeopathy", "Ayurvedic"],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     composition: {
//       type: String,
//       trim: true,
//       required: [
//         true,
//         "Validation Error: Composition/Ingredients is required.",
//       ],
//     },
//     purpose: {
//       type: String,
//       trim: true,
//     },
//     healthClaims: {
//       type: String,
//       trim: true,
//     },
//     healthClaimsFile: [
//       {
//         type: String,
//         trim: true,
//       },
//     ],
//     expiry: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Shelf Life/Expiry is required."],
//     },
//   },
//   { timestamps: true }
// );

// // EmergencyAndFirstAidSuppliesSchema
// const emergencyAndFirstAidSuppliesSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: [
//         "First Aid Kits",
//         "Emergency Medical Equipment",
//         "Trauma Care Products",
//       ],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     expiry: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Shelf Life/Expiry is required."],
//     },
//     composition: {
//       type: String,
//       trim: true,
//       required: [
//         true,
//         "Validation Error: Composition/Ingredients is required.",
//       ],
//     },
//     productLongevity: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Product Longevity  is required."],
//     },
//     foldability: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Foldability  is required."],
//     },
//   },
//   { timestamps: true }
// );

// // DisinfectionAndHygieneSuppliesSchema
// const disinfectionAndHygieneSuppliesSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: ["Hand Sanitizers", "Air Purifiers", "Cleaning Agents"],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     composition: {
//       type: String,
//       trim: true,
//       required: [
//         true,
//         "Validation Error: Composition/Ingredients is required.",
//       ],
//     },
//     concentration: {
//       type: String,
//       trim: true,
//     },
//     formulation: {
//       type: String,
//       trim: true,
//     },
//     expiry: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Shelf Life/Expiry is required."],
//     },
//     fragrance: {
//       type: String,
//       trim: true,
//     },
//   },
//   { timestamps: true }
// );

// // NutritionAndDietaryProductsSchema
// const nutritionAndDietaryProductsSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: [
//         "Protein Powders and Shakes",
//         "Specialized Nutrition",
//         "Meal Replacement Solutions",
//       ],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     flavorOptions: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Flavor Options is required."],
//     },
//     aminoAcidProfile: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Amino Acid Profile is required."],
//     },
//     fatContent: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Fat Content is required."],
//     },
//     expiry: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Shelf Life/Expiry is required."],
//     },
//     vegan: {
//       type: Boolean,
//     },
//     purpose: {
//       type: String,
//       trim: true,
//     },
//     healthBenefit: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Health Benefit is required."],
//     },
//     composition: {
//       type: String,
//       trim: true,
//       required: [
//         true,
//         "Validation Error: Composition/Ingredients is required.",
//       ],
//     },
//     additivesAndSweeteners: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Additives & Sweeteners is required."],
//     },
//     dairyFree: {
//       type: String,
//       trim: true,
//       enum: ["Yes", "No"],
//       trim: true,
//       required: [true, "Validation Error: Dairy Free is required."],
//     },
//   },
//   { timestamps: true }
// );

// // HealthcareITSolutionsSchema
// const healthcareITSolutionsSchema = new Schema(
//   {
//     subCategory: {
//       type: String,
//       trim: true,
//       enum: [
//         "Healthcare Management Software",
//         "Telemedicine Platforms",
//         "Medical Billing Software",
//         "IoT-Enabled Medical Devices",
//       ],
//       required: true,
//     },
//     anotherCategory: {
//       type: String,
//       trim: true,
//     },
//     license: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: License is required."],
//     },
//     scalabilityInfo: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Scalability Info is required."],
//     },
//     addOns: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Add-Ons is required."],
//     },
//     interoperability: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Interoperability is required."],
//     },
//     interoperabilityFile: [
//       {
//         type: String,
//         trim: true,
//         required: [true, "Validation Error: Interoperability is required."],
//       },
//     ],
//     userAccess: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: User Access is required."],
//     },
//     keyFeatures: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Key Features is required."],
//     },
//     coreFunctionalities: {
//       type: String,
//       trim: true,
//       required: [true, "Validation Error: Core Functionalities is required."],
//     },
//   },
//   { timestamps: true }
// );

// // Exporting models
// module.exports = {
//   MedicalEquipmentAndDevices: model(
//     "MedicalEquipmentAndDevices",
//     medicalEquipmentAndDevicesSchema
//   ),
//   Pharmaceuticals: model("Pharmaceuticals", pharmaceuticalsSchema),
//   SkinHairCosmeticSupplies: model(
//     "SkinHairCosmeticSupplies",
//     skinHairCosmeticSuppliesSchema
//   ),
//   VitalHealthAndWellness: model(
//     "VitalHealthAndWellness",
//     vitalHealthAndWellnessSchema
//   ),
//   MedicalConsumablesAndDisposables: model(
//     "MedicalConsumablesAndDisposables",
//     medicalConsumablesAndDisposablesSchema
//   ),
//   LaboratorySupplies: model("LaboratorySupplies", laboratorySuppliesSchema),
//   DiagnosticAndMonitoringDevices: model(
//     "DiagnosticAndMonitoringDevices",
//     diagnosticAndMonitoringDevicesSchema
//   ),
//   HospitalAndClinicSupplies: model(
//     "HospitalAndClinicSupplies",
//     hospitalAndClinicSuppliesSchema
//   ),
//   OrthopedicSupplies: model("OrthopedicSupplies", orthopedicSuppliesSchema),
//   DentalProducts: model("DentalProducts", dentalProductsSchema),
//   EyeCareSupplies: model("EyeCareSupplies", eyeCareSuppliesSchema),
//   HomeHealthcareProducts: model(
//     "HomeHealthcareProducts",
//     homeHealthcareProductsSchema
//   ),
//   AlternativeMedicines: model(
//     "AlternativeMedicines",
//     alternativeMedicinesSchema
//   ),
//   EmergencyAndFirstAidSupplies: model(
//     "EmergencyAndFirstAidSupplies",
//     emergencyAndFirstAidSuppliesSchema
//   ),
//   DisinfectionAndHygieneSupplies: model(
//     "DisinfectionAndHygieneSupplies",
//     disinfectionAndHygieneSuppliesSchema
//   ),
//   NutritionAndDietaryProducts: model(
//     "NutritionAndDietaryProducts",
//     nutritionAndDietaryProductsSchema
//   ),
//   HealthcareITSolutions: model(
//     "HealthcareITSolutions",
//     healthcareITSolutionsSchema
//   ),
// };
