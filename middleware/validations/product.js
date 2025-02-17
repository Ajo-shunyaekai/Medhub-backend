const { body } = require("express-validator");

// Define the general validation rules for common fields
const generalValidationRules = [
  // General validation for product details
  body("general.name").notEmpty().withMessage("Product Name is required"),
  body("general.description")
    .notEmpty()
    .withMessage("Product Description is required"),
  body("general.manufacturer")
    .notEmpty()
    .withMessage("Manufacturer is required"),
  body("general.countryOfOrigin")
    .notEmpty()
    .withMessage("Country of origin is required"),
  body("general.upc").optional().trim(),
  body("general.model").notEmpty().withMessage("Part/Model Number is required"),
  body("general.image").optional().trim(),
  body("general.brand").optional().trim(),
  body("general.form").notEmpty().withMessage("Type/Form is required"),
  body("general.quantity")
    .notEmpty()
    .withMessage("Product Quantity is required"),
  body("general.volumn")
    .notEmpty()
    .withMessage("Product Size / Volume is required"),
  body("general.weight").notEmpty().withMessage("Product Weight is required"),
  body("general.packageType")
    .notEmpty()
    .withMessage("Product Packaging Type is required"),
  body("general.packageMaterial")
    .notEmpty()
    .withMessage("Product Packaging Material is required"),
  body("general.unitPrice").optional().trim(),

  body("inventory.sku").optional().trim(),
  body("inventory.stock")
    .notEmpty()
    .withMessage("Product Stock is required")
    .isIn(["In-stock", "Out of Stock", "On-demand"])
    .withMessage(
      "Stock status must be 'In-stock', 'Out of Stock' or 'On-demand'"
    ),
  body("inventory.stockQuantity").optional().trim(),
  //   body("inventory.countries")
  //     .optional()
  //     .isArray()
  //     .withMessage("Countries must be an array"),
  body("inventory.date").optional().trim(),

  //   body("compliance")
  //     .optional()
  //     .isArray()
  //     .withMessage("Compliance must be an array"),
  body("storage").optional().trim(),
  body("additional.other").optional().trim(),
  body("additional.guuidelines").optional().trim(),
  body("additional.warranty").optional().trim(),
  //   body("healthNSafety.safetyDatasheet")
  //     .optional()
  //     .isArray()
  //     .withMessage("Compliance must be an array"),
  body("healthNSafety.healthHazardRating").optional().trim(),
  body("healthNSafety.environmentalImpact").optional().trim(),

  // General validation for category
  body("category")
    .notEmpty()
    .withMessage("Product Category is required")
    .isIn([
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
    ])
    .withMessage("Product Category is invalid"),

  // User schema references
  body("userId").notEmpty().withMessage("userId is required"),
  body("userSchemaReference")
    .isIn(["Supplier", "Buyer"])
    .withMessage("userSchemaReference must be 'Supplier' or 'Buyer'")
    .notEmpty()
    .withMessage("userSchemaReference is required"),
];

// Conditionally apply validation rules based on category
const categorySpecificValidationRules = [
  body("category").custom((value, { req }) => {
    if (value === "MedicalEquipmentAndDevices") {
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn([
            "Diagnostic Tools",
            "Imaging Equipment",
            "Surgical Instruments",
            "Monitoring Devices",
            "Mobility Aids",
            "Respiratory Care",
            "Elderly Care Products",
          ])
          .withMessage("Sub Category is invalid"),
        body("specification").optional().trim(),
        body("anotherCategory").optional().trim(),
        body("specificationFile").optional().trim(),
        body("diagnosticFunctions").optional().trim(),
        body("interoperability").optional().trim(),
        body("laserType").optional().trim(),
        body("coolingSystem").optional().trim(),
        body("spotSize").optional().trim(),
        body("performanceTestingReport").optional().trim(),
        body("performanceTestingReportFile").optional().trim(),
      ];
    }
    if (value === "Pharmaceuticals") {
      return [
        body("anotherCategory").optional().trim(),
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn([
            "Prescription Medications",
            "Over-the-Counter Medications",
            "Vaccines",
            "Generic Drugs",
            "Specialized Treatments",
          ])
          .withMessage("Sub Category is invalid"),
        body("genericName")
          .notEmpty()
          .withMessage("Generic Name is required")
          .trim(),
        body("strength").notEmpty().withMessage("Strength is required").trim(),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients is required")
          .trim(),
        body("formulation").optional().trim(),
        body("purpose").optional().trim(),
        body("drugAdministrationRoute")
          .notEmpty()
          .withMessage("Drug Administration Route is required")
          .trim(),
        body("drugClass")
          .notEmpty()
          .withMessage("Drug Class is required")
          .trim(),
        body("controlledSubstance").optional().trim(),
        body("otcClassification").optional().trim(),
        body("expiry").notEmpty().withMessage("Expiry is required").trim(),
        body("sideEffectsAndWarnings").optional().trim(),
        body("allergens").optional().trim(),
      ];
    }
    if (value === "SkinHairCosmeticSupplies") {
      return [
        body("anotherCategory").optional().trim(),
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn([
            "Skin Care",
            "Hair Care",
            "Personal Hygiene",
            "Baby Care",
            "Anti-aging Solutions",
            "Skin Graft",
            "Anti-Scar & Healing Ointments",
            "Burn Care Solutions",
            "Dermal Fillers & Injectables",
            "Laser Treatment Devices",
            "Chemical Peels",
          ])
          .withMessage("Sub Category is invalid"),
        body("strength").notEmpty().withMessage("Strength is required").trim(),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients is required")
          .trim(),
        body("purpose").notEmpty().withMessage("Purpose is required").trim(),
        body("targetCondition")
          .notEmpty()
          .withMessage("Target Condition is required")
          .trim(),
        body("drugAdministrationRoute")
          .notEmpty()
          .withMessage("Drug Administration Route is required")
          .trim(),
        body("drugClass")
          .notEmpty()
          .withMessage("Drug Class is required")
          .trim(),
        body("expiry").notEmpty().withMessage("Expiry is required").trim(),
        body("dermatologistTested")
          .notEmpty()
          .withMessage("Dermatologist Tested is required")
          .isBoolean()
          .withMessage("Dermatologist Tested must be a boolean"),
        body("pediatricianRecommended")
          .notEmpty()
          .withMessage("Pediatrician Recommended is required")
          .isBoolean()
          .withMessage("Pediatrician Recommended must be a boolean"),
        body("moisturizers")
          .optional()
          .isBoolean()
          .withMessage("Moisturizers must be a boolean"),
        body("elasticity")
          .optional()
          .isBoolean()
          .withMessage("Elasticity must be a boolean"),
        body("adhesiveness")
          .optional()
          .isBoolean()
          .withMessage("Adhesiveness must be a boolean"),
        body("thickness")
          .optional()
          .isBoolean()
          .withMessage("Thickness must be a boolean"),
        body("concentration")
          .optional()
          .isBoolean()
          .withMessage("Concentration must be a boolean"),
        body("fillerType")
          .optional()
          .isBoolean()
          .withMessage("Filler Type must be a boolean"),
        body("fragranceragrance").optional().trim(),
        body("spf").optional().trim(),
        body("crueltyFree")
          .optional()
          .isBoolean()
          .withMessage("Cruelty Free must be a boolean"),
        body("controlledSubstance").optional().trim(),
        body("otcClassification").optional().trim(),
        body("sideEffectsAndWarnings").optional().trim(),
        body("Allergens").optional().trim(),
        body("dermatologistTestedFile").optional().trim(),
        body("pediatricianRecommendedFile").optional().trim(),
      ];
    }
    if (value === "VitalHealthAndWellness") {
      return [
        body("anotherCategory").optional().trim(),
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn([
            "Fitness Monitors",
            "Herbal & Alternative Medicines",
            "Immune Boosters",
            "Vitamins & Supplements",
            "Weight Management",
          ])
          .withMessage("Sub Category is invalid"),
        body("healthBenefit")
          .notEmpty()
          .withMessage("Health Benefit is required")
          .trim(),
        body("genericName")
          .notEmpty()
          .withMessage("Generic Name is required")
          .trim(),
        body("strength").notEmpty().withMessage("Strength is required").trim(),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients is required")
          .trim(),
        body("purpose").notEmpty().withMessage("Purpose is required").trim(),
        body("drugAdministrationRoute")
          .notEmpty()
          .withMessage("Drug Administration Route is required")
          .trim(),
        body("drugClass")
          .notEmpty()
          .withMessage("Drug Class is required")
          .trim(),
        body("expiry").notEmpty().withMessage("Expiry is required").trim(),
        body("vegan")
          .optional()
          .isBoolean()
          .withMessage("Vegan must be a boolean"),
        body("crueltyFree")
          .optional()
          .isBoolean()
          .withMessage("Cruelty Free must be a boolean"),
        body("additivesSweeteners").optional().trim(),
        body("controlledSubstance").optional().trim(),
        body("otcClassification").optional().trim(),
        body("sideEffectsAndWarnings").optional().trim(),
        body("allergens").optional().trim(),
      ];
    }
    if (value === "MedicalConsumablesAndDisposables") {
      return [
        body("anotherCategory").optional().trim(),
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn([
            "Bandages, Gauze, & Wound Dressings",
            "Gloves, Masks, & Protective gear",
            "Sterilization Products",
            "Surgical Sutures & Adhesives",
            "Syringes, IV Sets & Catheters",
          ])
          .withMessage("Sub Category is invalid"),
        body("expiry")
          .notEmpty()
          .withMessage("Shelf Life/Expiry is required")
          .trim(),
        body("thickness").optional().trim(),
        body("powdered")
          .optional()
          .isBoolean()
          .withMessage("Powdered must be a boolean"),
        body("productMaterial").optional().trim(),
        body("purpose").optional().trim(),
        body("texture")
          .optional()
          .isBoolean()
          .withMessage("Texture must be a boolean"),
        body("sterilized")
          .optional()
          .isBoolean()
          .withMessage("Sterilized must be a boolean"),
        body("chemicalResistance").optional().trim(),
        body("allergens").optional().trim(),
        body("filtrationEfficiency").optional().trim(),
        body("breathability").optional().trim(),
        body("layerCount").optional().trim(),
        body("fluidResistance")
          .optional()
          .isBoolean()
          .withMessage("Fluid Resistance must be a boolean"),
        body("filtrationType").optional().trim(),
        body("shape").optional().trim(),
        body("coating").optional().trim(),
      ];
    }
    if (value === "LaboratorySupplies") {
      return [
        body("anotherCategory").optional().trim(),
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn([
            "Test kits",
            "Microscopes & Lab Equipment",
            "Chemicals & Reagents",
            "Lab Consumables",
          ])
          .withMessage("Sub Category is invalid"),
        body("specification")
          .notEmpty()
          .withMessage("Specification is required")
          .trim(),
        body("specificationFile")
          .notEmpty()
          .withMessage("Specification File is required")
          .trim(),
        body("diagnosticFunctions")
          .notEmpty()
          .withMessage("Diagnostic Functions is required")
          .trim(),
        body("measurementRange").optional().trim(),
        body("flowRate").optional().trim(),
        body("concentration").optional().trim(),
        body("noiseLevel").optional().trim(),
        body("maintenanceNotes").optional().trim(),
        body("compatibleEquipment").optional().trim(),
        body("usageRate").optional().trim(),
        body("PerformanceTestingReport").optional().trim(),
      ];
    }
    if (value === "DiagnosticAndMonitoringDevices") {
      return [
        body("anotherCategory").optional().trim(),
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn([
            "Blood Glucose Monitors",
            "Blood Pressure Monitors",
            "Oxygen Concentrators",
            "Wearable Health Devices",
          ])
          .withMessage("Sub Category is invalid"),
        body("magnificationRange").optional().trim(),
        body("objectiveLenses").optional().trim(),
        body("powerSource").optional().trim(),
        body("resolution").optional().trim(),
        body("connectivity").optional().trim(),
        body("shape").optional().trim(),
        body("coating").optional().trim(),
        body("purpose").optional().trim(),
        body("casNumber").optional().trim(),
        body("grade").optional().trim(),
        body("concentration").optional().trim(),
        body("physicalState").optional().trim(),
        body("hazardClassification").optional().trim(),
      ];
    }
    if (value === "HospitalAndClinicSupplies") {
      return [
        body("anotherCategory").optional().trim(),
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn([
            "Patient Beds & Stretchers",
            "Trolleys & Storage Units",
            "Examination Tables",
            "Medical Furniture",
          ])
          .withMessage("Sub Category is invalid"),
        body("adhesiveness").optional().trim(),
        body("absorbency").optional().trim(),
        body("thickness").optional().trim(),
        body("powdered")
          .optional()
          .isBoolean()
          .withMessage("Powdered must be a boolean"),
        body("productMaterial").optional().trim(),
        body("purpose").optional().trim(),
        body("expiry").notEmpty().withMessage("Shelf Life/Expiry is required"),
        body("texture")
          .optional()
          .isBoolean()
          .withMessage("Texture must be a boolean"),
        body("sterilized")
          .optional()
          .isBoolean()
          .withMessage("Sterilized must be a boolean"),
        body("chemicalResistance").optional().trim(),
        body("fluidResistance")
          .optional()
          .isBoolean()
          .withMessage("Fluid Resistance must be a boolean"),
        body("elasticity").optional().trim(),
      ];
    }
    if (value === "OrthopedicSupplies") {
      return [
        body("anotherCategory").optional().trim(),
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn([
            "Orthopedic Braces & Supports",
            "Splints & Casting Materials",
            "Prosthetics",
            "Rehabilitation Equipment",
          ])
          .withMessage("Sub Category is invalid"),
        body("breathability").optional().trim(),
        body("colorOptions").optional().trim(),
        body("elasticity").optional().trim(),
        body("sterilized")
          .optional()
          .isBoolean()
          .withMessage("Sterilized must be a boolean"),
        body("absorbency").optional().trim(),
        body("purpose").optional().trim(),
        body("targetCondition")
          .notEmpty()
          .withMessage("Target Condition is required"),
        body("coating").optional().trim(),
        body("strength").notEmpty().withMessage("Strength is required"),
        body("moistureResistance")
          .optional()
          .isIn(["Yes", "No"])
          .withMessage("Moisture Resistance must be Yes or No"),
      ];
    }
    if (value === "DentalProducts") {
      return [
        body("anotherCategory").optional().trim(),
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn([
            "Dental Instruments & tools",
            "Orthodontic Supplies",
            "Dental Chairs and Accessories",
            "Dental Consumables",
          ])
          .withMessage("Sub Category is invalid"),
        body("productMaterial").optional().trim(),
        body("purpose").optional().trim(),
        body("targetCondition").optional().trim(),
        body("maintenanceNotes").optional().trim(),
        body("compatibleEquipment")
          .notEmpty()
          .withMessage("Compatible Equipment is required"),
        body("usageRate").optional().trim(),
        body("expiry").notEmpty().withMessage("Shelf Life/Expiry is required"),
      ];
    }
    if (value === "EyeCareSupplies") {
      return [
        body("anotherCategory").optional().trim(),
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn([
            "Contact Lenses and Solutions",
            "Eyewear",
            "Eyewear Lenses",
            "Eye Drops and Ointments",
          ])
          .withMessage("Sub Category is invalid"),
        body("lensPower").optional().trim(),
        body("baseCurve").optional().trim(),
        body("diameter").optional().trim(),
        body("frame")
          .optional()
          .isIn(["Metal", "Plastic", "Rimless"])
          .withMessage("Frame type must be one of: Metal, Plastic, Rimless"),
        body("lens")
          .optional()
          .isIn(["Single Vision", "Bifocal", "Progressive", "Anti-Reflective"])
          .withMessage(
            "Lens type must be one of: Single Vision, Bifocal, Progressive, Anti-Reflective"
          ),
        body("lensMaterial")
          .optional()
          .isIn(["Polycarbonate", "Glass", "Trivex"])
          .withMessage(
            "Lens Material must be one of: Polycarbonate, Glass, Trivex"
          ),
        body("colorOptions").optional().trim(),
      ];
    }
    if (value === "HomeHealthcareProducts") {
      return [
        body("anotherCategory").optional().trim(),
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn([
            "Mobility Aids",
            "Respiratory Care",
            "Patient Monitoring Devices",
            "Elderly Care Products",
          ])
          .withMessage("Sub Category is invalid"),
        body("colorOptions").optional().trim(),
        body("maxWeightCapacity").optional().trim(),
        body("gripType").optional().trim(),
        body("foldability").optional().trim(),
        body("lockingMechanism").optional().trim(),
        body("typeOfSupport").optional().trim(),
        body("flowRate").optional().trim(),
        body("concentration").optional().trim(),
        body("batteryType").optional().trim(),
        body("batterySize").optional().trim(),
        body("performanceTestingReport").optional().trim(),
        body("performanceTestingReportFile").optional().trim(),
        body("expiry").notEmpty().withMessage("Shelf Life/Expiry is required"),
      ];
    }
    if (value === "AlternativeMedicines") {
      return [
        body("anotherCategory").optional().trim(),
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn(["Homeopathy", "Ayurvedic"])
          .withMessage("Sub Category is invalid"),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients is required"),
        body("purpose").optional().trim(),
        body("healthClaims").optional().trim(),
        body("healthClaimsFile").optional().trim(),
        body("expiry").notEmpty().withMessage("Shelf Life/Expiry is required"),
      ];
    }
    if (value === "EmergencyAndFirstAidSupplies") {
      return [
        body("anotherCategory").optional().trim(),
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn([
            "First Aid Kits",
            "Emergency Medical Equipment",
            "Trauma Care Products",
          ])
          .withMessage("Sub Category is invalid"),
        body("expiry").notEmpty().withMessage("Expiry is required"),
        body("composition").notEmpty().withMessage("Composition is required"),
        body("productLongevity")
          .notEmpty()
          .withMessage("Product Longevity is required"),
        body("foldability").notEmpty().withMessage("Foldability is required"),
      ];
    }
    if (value === "DisinfectionAndHygieneSupplies") {
      return [
        body("anotherCategory").optional().trim(),
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn(["Hand Sanitizers", "Air Purifiers", "Cleaning Agents"])
          .withMessage("Sub Category is invalid"),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients is required"),
        body("concentration").optional().trim(),
        body("formulation").optional().trim(),
        body("expiry").notEmpty().withMessage("Shelf Life/Expiry is required"),
        body("fragrance").optional().trim(),
      ];
    }
    if (value === "NutritionAndDietaryProducts") {
      return [
        body("anotherCategory").optional().trim(),
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn([
            "Protein Powders and Shakes",
            "Specialized Nutrition",
            "Meal Replacement Solutions",
          ])
          .withMessage("Sub Category is invalid"),
        body("flavorOptions")
          .notEmpty()
          .withMessage("Flavor Options are required"),
        body("aminoAcidProfile")
          .notEmpty()
          .withMessage("Amino Acid Profile is required"),
        body("fatContent").notEmpty().withMessage("Fat Content is required"),
        body("expiry").notEmpty().withMessage("Shelf Life/Expiry is required"),
        body("vegan")
          .optional()
          .isBoolean()
          .withMessage("Vegan must be a boolean"),
        body("purpose").optional().trim(),
        body("healthBenefit")
          .notEmpty()
          .withMessage("Health Benefit is required"),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients are required"),
        body("additivesAndSweeteners")
          .notEmpty()
          .withMessage("Additives & Sweeteners are required"),
        body("dairyFree")
          .optional()
          .isIn(["Yes", "No"])
          .withMessage("Dairy Free must be 'Yes' or 'No'"),
      ];
    }
    if (value === "HealthcareITSolutions") {
      return [
        body("anotherCategory").optional().trim(),
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required")
          .isIn([
            "Healthcare Management Software",
            "Telemedicine Platforms",
            "Medical Billing Software",
            "IoT-Enabled Medical Devices",
          ])
          .withMessage("Sub Category is invalid"),
        body("license").notEmpty().withMessage("License is required"),
        body("scalabilityInfo")
          .notEmpty()
          .withMessage("Scalability Info is required"),
        body("addOns").notEmpty().withMessage("Add-Ons is required"),
        body("interoperability")
          .notEmpty()
          .withMessage("Interoperability is required"),
        body("userAccess").notEmpty().withMessage("User Access is required"),
        body("keyFeatures").notEmpty().withMessage("Key Features is required"),
        body("coreFunctionalities")
          .notEmpty()
          .withMessage("Core Functionalities is required"),
      ];
    }

    return true; // No validation required for other categories
  }),
];

module.exports = { generalValidationRules, categorySpecificValidationRules };
