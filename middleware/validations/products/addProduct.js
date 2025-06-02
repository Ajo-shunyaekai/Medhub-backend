const { body } = require("express-validator");

// General validation for product details
const generalValidationRules = [
  body("name").notEmpty().withMessage("Product Name is required."),
  // .matches(/^[a-zA-Z0-9\s]+$/)
  // .withMessage(
  //   "Product Name must be alphanumeric (letters, numbers, and spaces only)."
  // ),

  body("market")
    .notEmpty()
    .withMessage("Product Market is required.")
    .isIn(["new", "secondary"])
    .withMessage("Product Market is invalid."),

  body("purchasedOn")
    .optional()
    .custom((value, { req }) => {
      // Only validate if  market is 'Secondary' and purchasedOn is provided
      if (req.body.market === "secondary" && !value) {
        throw new Error(
          "Purchased On is required when the market is 'Secondary'."
        );
      }
      return true;
    }),

  body("condition")
    .optional()
    .custom((value, { req }) => {
      // Only validate if  market is 'Secondary' and condition is provided
      if (req.body.market === "secondary" && !value) {
        throw new Error(
          "Condition is required when the market is 'Secondary'."
        );
      }
      return true;
    }),

  body("minimumPurchaseUnit")
    .optional()
    .custom((value, { req }) => {
      // Only validate if  market is 'Secondary' and minimumPurchaseUnit is provided
      if (req.body.market === "secondary" && !value) {
        throw new Error(
          "Minimum Purchase Unit is required when the market is 'Secondary'."
        );
      }
      return true;
    }),

  body("description")
    .notEmpty()
    .withMessage("Product Description is required."),

  // body("manufacturer")
  //   .notEmpty()
  //   .withMessage("Manufacturer is required."),
  // .matches(/^[a-zA-Z0-9\s]+$/)
  // .withMessage(
  //   "Manufacturer must be alphanumeric (letters, numbers, and spaces only)."
  // ),

  body("aboutManufacturer")
    .notEmpty()
    .withMessage("Short Description is required."),

  // body("countryOfOrigin")
  //   .notEmpty()
  //   .withMessage("Country of origin is required."),

  body("model")
    .notEmpty()
    .withMessage("Part/Model Number is required.")
    .matches(/^[a-zA-Z0-9\s\-\/]+$/)
    .withMessage(
      "Part/Model Number can only contain letters, numbers, spaces, hyphens (-), and slashes (/)."
    ),

  // body("form")
  //   .notEmpty()
  //   .withMessage("Type/Form is required.")
  //   .matches(/^[a-zA-Z0-9\s]+$/)
  //   .withMessage(
  //     "Type/Form must be alphanumeric (letters, numbers, and spaces only)."
  //   ),

  body("quantity")
    .notEmpty()
    .withMessage("Product Quantity is required.")
    .isInt({ gt: 0 })
    .withMessage("Product Quantity must be a positive integer."),

  // body("weight")
  //   .notEmpty()
  //   .withMessage("Product Weight is required.")
  //   .isFloat({ gt: 0 })
  //   .withMessage("Product Weight must be a positive number."),

  // body("unit").notEmpty().withMessage("Product Weight Unit is required."),
  body("unit_tax").notEmpty().withMessage("Tax Percentage is required."),
  body("stock")
    .notEmpty()
    .withMessage("Product Stock is required.")
    .isIn(["In-stock", "Out of Stock", "On-demand"])
    .withMessage(
      "Stock status must be 'In-stock', 'Out of Stock' or 'On-demand'"
    ),

  // Category validation
  body("category")
    .notEmpty()
    .withMessage("Product Category is required.")
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
    .withMessage("Product Category is invalid."),

  // User schema references
  body("supplier_id").notEmpty().withMessage("supplier_id is required."),
];

// General validation for product details
const generalValidationRules2 = [
  body("name").notEmpty().withMessage("Product Name is required."),
  // .matches(/^[a-zA-Z0-9\s]+$/)
  // .withMessage(
  //   "Product Name must be alphanumeric (letters, numbers, and spaces only)."
  // ),

  body("market")
    .notEmpty()
    .withMessage("Product Market is required.")
    .isIn(["new", "secondary"])
    .withMessage("Product Market is invalid."),

  body("purchasedOn")
    .optional()
    .custom((value, { req }) => {
      // Only validate if  market is 'Secondary' and purchasedOn is provided
      if (req.body.market === "secondary" && !value) {
        throw new Error(
          "Purchased On is required when the market is 'Secondary'."
        );
      }
      return true;
    }),

  body("condition")
    .optional()
    .custom((value, { req }) => {
      // Only validate if  market is 'Secondary' and condition is provided
      if (req.body.market === "secondary" && !value) {
        throw new Error(
          "Condition is required when the market is 'Secondary'."
        );
      }
      return true;
    }),

  body("minimumPurchaseUnit")
    .optional()
    .custom((value, { req }) => {
      // Only validate if  market is 'Secondary' and minimumPurchaseUnit is provided
      if (req.body.market === "secondary" && !value) {
        throw new Error(
          "Minimum Purchase Unit is required when the market is 'Secondary'."
        );
      }
      return true;
    }),

  body("description")
    .notEmpty()
    .withMessage("Product Description is required."),

  // body("manufacturer")
  //   .notEmpty()
  //   .withMessage("Manufacturer is required."),
  // .matches(/^[a-zA-Z0-9\s]+$/)
  // .withMessage(
  //   "Manufacturer must be alphanumeric (letters, numbers, and spaces only)."
  // ),

  body("aboutManufacturer")
    .notEmpty()
    .withMessage("Short Description is required."),

  // body("countryOfOrigin")
  //   .notEmpty()
  //   .withMessage("Country of origin is required."),

  body("model")
    .notEmpty()
    .withMessage("Part/Model Number is required.")
    .matches(/^[a-zA-Z0-9\s\-\/]+$/)
    .withMessage(
      "Part/Model Number can only contain letters, numbers, spaces, hyphens (-), and slashes (/)."
    ),

  // body("form")
  //   .notEmpty()
  //   .withMessage("Type/Form is required.")
  //   .matches(/^[a-zA-Z0-9\s]+$/)
  //   .withMessage(
  //     "Type/Form must be alphanumeric (letters, numbers, and spaces only)."
  //   ),

  body("quantity")
    .notEmpty()
    .withMessage("Product Quantity is required.")
    .isInt({ gt: 0 })
    .withMessage("Product Quantity must be a positive integer."),

  // body("weight")
  //   .notEmpty()
  //   .withMessage("Product Weight is required.")
  //   .isFloat({ gt: 0 })
  //   .withMessage("Product Weight must be a positive number."),

  // body("unit").notEmpty().withMessage("Product Weight Unit is required."),
  body("unit_tax").notEmpty().withMessage("Tax Percentage is required."),
  body("stock")
    .notEmpty()
    .withMessage("Product Stock is required.")
    .isIn(["In-stock", "Out of Stock", "On-demand"])
    .withMessage(
      "Stock status must be 'In-stock', 'Out of Stock' or 'On-demand'"
    ),

  // Category validation
  body("category")
    .notEmpty()
    .withMessage("Product Category is required.")
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
    .withMessage("Product Category is invalid."),

  // User schema references
  body("supplier_id").notEmpty().withMessage("supplier_id is required."),
];

// Conditionally apply validation rules based on category
const categorySpecificValidationRules = [
  body("category").custom((value, { req }) => {
    if (value === "MedicalEquipmentAndDevices") {
      // Validation for MedicalEquipmentAndDevices Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
          "Diagnostic Tools",
          "Imaging Equipment",
          "Surgical Instruments",
          "Monitoring Devices",
          "Mobility Aids",
          "Respiratory Care",
          "Care Products",
          "Blood Pressure Monitor",
          "Anaesthetic Equipment",
        ])
          .withMessage("Sub Category is invalid."),
        body("specification")
          .notEmpty()
          .withMessage("Specification is required."),
      ];
    }
    if (value === "Pharmaceuticals") {
      // Validation for Pharmaceuticals Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Prescription Medications",
            "Over-the-Counter Medications",
            "Vaccines",
            "Generic Drugs",
            "Specialized Treatments",
          ])
          .withMessage("Sub Category is invalid."),
        body("genericName")
          .notEmpty()
          .withMessage("Generic Name is required.")
          .trim()
          .matches(/^[a-zA-Z0-9\s]+$/)
          .withMessage(
            "Generic Name must be alphanumeric (letters and numbers only)."
          ),
        body("strength")
          .notEmpty()
          .withMessage("Strength is required.")
          .trim()
          .matches(/^[a-zA-Z0-9\s]+$/)
          .withMessage(
            "Strength must be alphanumeric (letters and numbers only)."
          ),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients is required.")
          .trim(),
        body("drugClass")
          .notEmpty()
          .withMessage("Drug Class is required.")
          .trim()
          .matches(/^[a-zA-Z0-9\s]+$/)
          .withMessage(
            "Drug Class must be alphanumeric (letters and numbers only)."
          ),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
      ];
    }
    if (value === "SkinHairCosmeticSupplies") {
      // Validation for SkinHairCosmeticSupplies Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
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
          .withMessage("Sub Category is invalid."),
        body("strength")
          .notEmpty()
          .withMessage("Strength is required.")
          .trim()
          .matches(/^[a-zA-Z0-9\s]+$/)
          .withMessage(
            "Strength must be alphanumeric (letters and numbers only)."
          ),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients is required.")
          .trim(),
        body("targetCondition")
          .notEmpty()
          .withMessage("Target Condition is required.")
          .trim(),
        body("purpose").notEmpty().withMessage("Purpose is required.").trim(),
        body("drugAdministrationRoute")
          .notEmpty()
          .withMessage("Drug Administration Route is required.")
          .trim(),
        body("drugClass")
          .notEmpty()
          .withMessage("Drug Class is required.")
          .trim(),
        body("controlledSubstance").optional().trim(),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
        body("dermatologistTested")
          .notEmpty()
          .withMessage("Dermatologist Tested is required.")
          .isIn(["Yes", "No"])
          .withMessage("Dermatologist Tested is invalid."),

        body("pediatricianRecommended")
          .notEmpty()
          .withMessage("Pediatrician Recommended is required.")
          .isIn(["Yes", "No"])
          .withMessage("Pediatrician Recommended is invalid."),
      ];
    }
    if (value === "VitalHealthAndWellness") {
      // Validation for VitalHealthAndWellness Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Fitness Monitors",
            "Herbal & Alternative Medicines",
            "Immune Boosters",
            "Vitamins & Supplements",
            "Weight Management",
          ])
          .withMessage("Sub Category is invalid."),
        body("healthBenefit")
          .notEmpty()
          .withMessage("Health Benefit is required.")
          .trim(),
        body("genericName")
          .notEmpty()
          .withMessage("Generic Name is required.")
          .trim()
          .matches(/^[a-zA-Z0-9\s]+$/)
          .withMessage(
            "Generic Name must be alphanumeric (letters and numbers only)."
          ),
        body("strength")
          .notEmpty()
          .withMessage("Strength is required.")
          .trim()
          .matches(/^[a-zA-Z0-9\s]+$/)
          .withMessage(
            "Strength must be alphanumeric (letters and numbers only)."
          ),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients is required.")
          .trim(),
        body("drugAdministrationRoute")
          .notEmpty()
          .withMessage("Drug Administration Route is required.")
          .trim(),
        body("drugClass")
          .notEmpty()
          .withMessage("Drug Class is required.")
          .trim(),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
      ];
    }
    if (value === "MedicalConsumablesAndDisposables") {
      // Validation for MedicalConsumablesAndDisposables Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Bandages, Gauze, & Wound Dressings",
            "Gloves, Masks, & Protective gear",
            "Sterilization Products",
            "Surgical Sutures & Adhesives",
            "Syringes, IV Sets & Catheters",
            "PFT Mouthpiece",
            "ECG Electrode",
            "ECG Consumables",
            "Ultrasound Consumables",
            "CTG Paper",
            "Infusion Pressure Bag",
            "Connecting Cable",
          ])
          .withMessage("Sub Category is invalid."),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
      ];
    }

    if (value === "DiagnosticAndMonitoringDevices") {
      // Validation for DiagnosticAndMonitoringDevices Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Blood Glucose Monitors",
            "Blood Pressure Monitors",
            "Oxygen Concentrators",
            "Wearable Health Devices",
          ])
          .withMessage("Sub Category is invalid."),
        body("specification")
          .notEmpty()
          .withMessage("Specification is required."),

        body("diagnosticFunctions")
          .notEmpty()
          .withMessage("Diagnostic Functions is required."),
      ];
    }
    if (value === "HospitalAndClinicSupplies") {
      // Validation for HospitalAndClinicSupplies Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Patient Beds & Stretchers",
            "Trolleys & Storage Units",
            "Examination Tables",
            "Medical Furniture",
            "First Aid Kits",
            "Emergency Medical Equipment",
            "Trauma Care Products",
          ])
          .withMessage("Sub Category is invalid."),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
      ];
    }
    if (value === "OrthopedicSupplies") {
      // Validation for OrthopedicSupplies Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Orthopedic Braces & Supports",
            "Splints & Casting Materials",
            "Prosthetics",
            "Rehabilitation Equipment",
          ])
          .withMessage("Sub Category is invalid."),
        body("targetCondition")
          .notEmpty()
          .withMessage("Target Condition is required."),
      ];
    }
    if (value === "DentalProducts") {
      // Validation for DentalProducts Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Dental Instruments & tools",
            "Orthodontic Supplies",
            "Dental Chairs and Accessories",
            "Dental Consumables",
          ])
          .withMessage("Sub Category is invalid."),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
      ];
    }
    if (value === "EyeCareSupplies") {
      // Validation for EyeCareSupplies Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Contact Lenses and Solutions",
            "Eyewear",
            "Eyewear Lenses",
            "Eye Drops and Ointments",
          ])
          .withMessage("Sub Category is invalid."),
      ];
    }
    if (value === "HomeHealthcareProducts") {
      // Validation for HomeHealthcareProducts Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Mobility Aids",
            "Respiratory Care",
            "Patient Monitoring Devices",
            "Care Products",
          ])
          .withMessage("Sub Category is invalid."),

        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
      ];
    }
    if (value === "AlternativeMedicines") {
      // Validation for AlternativeMedicines Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn(["Homeopathy", "Ayurvedic"])
          .withMessage("Sub Category is invalid."),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients is required."),
      ];
    }
    if (value === "EmergencyAndFirstAidSupplies") {
      // Validation for EmergencyAndFirstAidSupplies Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "First Aid Kits",
            "Emergency Medical Equipment",
            "Trauma Care Products",
          ])
          .withMessage("Sub Category is invalid."),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
        body("composition").notEmpty().withMessage("Composition is required."),
        body("productLongevity")
          .notEmpty()
          .withMessage("Product Longevity is required."),
        body("foldability").notEmpty().withMessage("Foldability is required."),
      ];
    }
    if (value === "DisinfectionAndHygieneSupplies") {
      // Validation for DisinfectionAndHygieneSupplies Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn(["Hand Sanitizers", "Air Purifiers", "Cleaning Agents"])
          .withMessage("Sub Category is invalid."),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients is required."),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
      ];
    }
    if (value === "NutritionAndDietaryProducts") {
      // Validation for NutritionAndDietaryProducts Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Protein Powders and Shakes",
            "Specialized Nutrition",
            "Meal Replacement Solutions",
          ])
          .withMessage("Sub Category is invalid."),
        body("flavorOptions")
          .notEmpty()
          .withMessage("Flavor Options are required"),
        body("aminoAcidProfile")
          .notEmpty()
          .withMessage("Amino Acid Profile is required."),
        body("fatContent").notEmpty().withMessage("Fat Content is required."),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
        body("healthBenefit")
          .notEmpty()
          .withMessage("Health Benefit is required."),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients are required"),
        body("additivesNSweeteners")
          .notEmpty()
          .withMessage("Additives & Sweeteners are required"),
        body("dairyFree")
          .notEmpty()
          .withMessage("Dairy Free is required.")
          .isIn(["Yes", "No"])
          .withMessage("Dairy Free must be 'Yes' or 'No'"),
      ];
    }
    if (value === "HealthcareITSolutions") {
      // Validation for HealthcareITSolutions Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Healthcare Management Software",
            "Telemedicine Platforms",
            "Medical Billing Software",
            "IoT-Enabled Medical Devices",
          ])
          .withMessage("Sub Category is invalid."),
        // body("license").notEmpty().withMessage("License is required."),
        // body("scalabilityInfo")
        //   .notEmpty()
        //   .withMessage("Scalability Info is required."),
        // body("addOns").notEmpty().withMessage("Add-Ons is required."),
        // body("interoperability")
        //   .notEmpty()
        //   .withMessage("Interoperability is required."),

        // body("userAccess").notEmpty().withMessage("User Access is required."),
        // body("keyFeatures").notEmpty().withMessage("Key Features is required."),
        // body("coreFunctionalities")
        //   .notEmpty()
        //   .withMessage("Core Functionalities is required."),
      ];
    }

    return true; // No validation required for other categories
  }),
];

// Conditionally apply validation rules based on category
const categorySpecificValidationRules2 = [
  body("category").custom((value, { req }) => {
    if (value === "MedicalEquipmentAndDevices") {
      // Validation for MedicalEquipmentAndDevices Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
          "Diagnostic Tools",
          "Imaging Equipment",
          "Surgical Instruments",
          "Monitoring Devices",
          "Mobility Aids",
          "Respiratory Care",
          "Care Products",
          "Blood Pressure Monitor",
          "Anaesthetic Equipment",
        ])
          .withMessage("Sub Category is invalid."),
        body("specification")
          .notEmpty()
          .withMessage("Specification is required."),
      ];
    }
    if (value === "Pharmaceuticals") {
      // Validation for Pharmaceuticals Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Prescription Medications",
            "Over-the-Counter Medications",
            "Vaccines",
            "Generic Drugs",
            "Specialized Treatments",
          ])
          .withMessage("Sub Category is invalid."),
        body("genericName")
          .notEmpty()
          .withMessage("Generic Name is required.")
          .trim()
          .matches(/^[a-zA-Z0-9\s]+$/)
          .withMessage(
            "Generic Name must be alphanumeric (letters and numbers only)."
          ),
        body("strength")
          .notEmpty()
          .withMessage("Strength is required.")
          .trim()
          .matches(/^[a-zA-Z0-9\s]+$/)
          .withMessage(
            "Strength must be alphanumeric (letters and numbers only)."
          ),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients is required.")
          .trim(),
        body("drugClass")
          .notEmpty()
          .withMessage("Drug Class is required.")
          .trim()
          .matches(/^[a-zA-Z0-9\s]+$/)
          .withMessage(
            "Drug Class must be alphanumeric (letters and numbers only)."
          ),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
      ];
    }
    if (value === "SkinHairCosmeticSupplies") {
      // Validation for SkinHairCosmeticSupplies Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
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
          .withMessage("Sub Category is invalid."),
        body("strength")
          .notEmpty()
          .withMessage("Strength is required.")
          .trim()
          .matches(/^[a-zA-Z0-9\s]+$/)
          .withMessage(
            "Strength must be alphanumeric (letters and numbers only)."
          ),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients is required.")
          .trim(),
        body("targetCondition")
          .notEmpty()
          .withMessage("Target Condition is required.")
          .trim(),
        body("purpose").notEmpty().withMessage("Purpose is required.").trim(),
        body("drugAdministrationRoute")
          .notEmpty()
          .withMessage("Drug Administration Route is required.")
          .trim(),
        body("drugClass")
          .notEmpty()
          .withMessage("Drug Class is required.")
          .trim(),
        body("controlledSubstance").optional().trim(),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
        body("dermatologistTested")
          .notEmpty()
          .withMessage("Dermatologist Tested is required.")
          .isIn(["Yes", "No"])
          .withMessage("Dermatologist Tested is invalid."),

        body("pediatricianRecommended")
          .notEmpty()
          .withMessage("Pediatrician Recommended is required.")
          .isIn(["Yes", "No"])
          .withMessage("Pediatrician Recommended is invalid."),
      ];
    }
    if (value === "VitalHealthAndWellness") {
      // Validation for VitalHealthAndWellness Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Fitness Monitors",
            "Herbal & Alternative Medicines",
            "Immune Boosters",
            "Vitamins & Supplements",
            "Weight Management",
          ])
          .withMessage("Sub Category is invalid."),
        body("healthBenefit")
          .notEmpty()
          .withMessage("Health Benefit is required.")
          .trim(),
        body("genericName")
          .notEmpty()
          .withMessage("Generic Name is required.")
          .trim()
          .matches(/^[a-zA-Z0-9\s]+$/)
          .withMessage(
            "Generic Name must be alphanumeric (letters and numbers only)."
          ),
        body("strength")
          .notEmpty()
          .withMessage("Strength is required.")
          .trim()
          .matches(/^[a-zA-Z0-9\s]+$/)
          .withMessage(
            "Strength must be alphanumeric (letters and numbers only)."
          ),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients is required.")
          .trim(),
        body("drugAdministrationRoute")
          .notEmpty()
          .withMessage("Drug Administration Route is required.")
          .trim(),
        body("drugClass")
          .notEmpty()
          .withMessage("Drug Class is required.")
          .trim(),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
      ];
    }
    if (value === "MedicalConsumablesAndDisposables") {
      // Validation for MedicalConsumablesAndDisposables Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Bandages, Gauze, & Wound Dressings",
            "Gloves, Masks, & Protective gear",
            "Sterilization Products",
            "Surgical Sutures & Adhesives",
            "Syringes, IV Sets & Catheters",
            "PFT Mouthpiece",
            "ECG Electrode",
            "ECG Consumables",
            "Ultrasound Consumables",
            "CTG Paper",
            "Infusion Pressure Bag",
            "Connecting Cable",
          ])
          .withMessage("Sub Category is invalid."),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
      ];
    }

    if (value === "DiagnosticAndMonitoringDevices") {
      // Validation for DiagnosticAndMonitoringDevices Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Blood Glucose Monitors",
            "Blood Pressure Monitors",
            "Oxygen Concentrators",
            "Wearable Health Devices",
          ])
          .withMessage("Sub Category is invalid."),
        body("specification")
          .notEmpty()
          .withMessage("Specification is required."),

        body("diagnosticFunctions")
          .notEmpty()
          .withMessage("Diagnostic Functions is required."),
      ];
    }
    if (value === "HospitalAndClinicSupplies") {
      // Validation for HospitalAndClinicSupplies Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Patient Beds & Stretchers",
            "Trolleys & Storage Units",
            "Examination Tables",
            "Medical Furniture",
            "First Aid Kits",
            "Emergency Medical Equipment",
            "Trauma Care Products",
          ])
          .withMessage("Sub Category is invalid."),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
      ];
    }
    if (value === "OrthopedicSupplies") {
      // Validation for OrthopedicSupplies Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Orthopedic Braces & Supports",
            "Splints & Casting Materials",
            "Prosthetics",
            "Rehabilitation Equipment",
          ])
          .withMessage("Sub Category is invalid."),
        body("targetCondition")
          .notEmpty()
          .withMessage("Target Condition is required."),
      ];
    }
    if (value === "DentalProducts") {
      // Validation for DentalProducts Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Dental Instruments & tools",
            "Orthodontic Supplies",
            "Dental Chairs and Accessories",
            "Dental Consumables",
          ])
          .withMessage("Sub Category is invalid."),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
      ];
    }
    if (value === "EyeCareSupplies") {
      // Validation for EyeCareSupplies Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Contact Lenses and Solutions",
            "Eyewear",
            "Eyewear Lenses",
            "Eye Drops and Ointments",
          ])
          .withMessage("Sub Category is invalid."),
      ];
    }
    if (value === "HomeHealthcareProducts") {
      // Validation for HomeHealthcareProducts Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Mobility Aids",
            "Respiratory Care",
            "Patient Monitoring Devices",
            "Care Products",
          ])
          .withMessage("Sub Category is invalid."),

        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
      ];
    }
    if (value === "AlternativeMedicines") {
      // Validation for AlternativeMedicines Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn(["Homeopathy", "Ayurvedic"])
          .withMessage("Sub Category is invalid."),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients is required."),
      ];
    }
    if (value === "EmergencyAndFirstAidSupplies") {
      // Validation for EmergencyAndFirstAidSupplies Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "First Aid Kits",
            "Emergency Medical Equipment",
            "Trauma Care Products",
          ])
          .withMessage("Sub Category is invalid."),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
        body("composition").notEmpty().withMessage("Composition is required."),
        body("productLongevity")
          .notEmpty()
          .withMessage("Product Longevity is required."),
        body("foldability").notEmpty().withMessage("Foldability is required."),
      ];
    }
    if (value === "DisinfectionAndHygieneSupplies") {
      // Validation for DisinfectionAndHygieneSupplies Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn(["Hand Sanitizers", "Air Purifiers", "Cleaning Agents"])
          .withMessage("Sub Category is invalid."),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients is required."),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
      ];
    }
    if (value === "NutritionAndDietaryProducts") {
      // Validation for NutritionAndDietaryProducts Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Protein Powders and Shakes",
            "Specialized Nutrition",
            "Meal Replacement Solutions",
          ])
          .withMessage("Sub Category is invalid."),
        body("flavorOptions")
          .notEmpty()
          .withMessage("Flavor Options are required"),
        body("aminoAcidProfile")
          .notEmpty()
          .withMessage("Amino Acid Profile is required."),
        body("fatContent").notEmpty().withMessage("Fat Content is required."),
        // body("expiry")
        //   .notEmpty()
        //   .withMessage("Shelf Life/Expiry is required.")
        //   .trim()
        //   .matches(/^[a-zA-Z0-9\s]+$/)
        //   .withMessage(
        //     "Shelf Life/Expiry must be alphanumeric (letters and numbers only)."
        //   ),
        body("healthBenefit")
          .notEmpty()
          .withMessage("Health Benefit is required."),
        body("composition")
          .notEmpty()
          .withMessage("Composition/Ingredients are required"),
        body("additivesNSweeteners")
          .notEmpty()
          .withMessage("Additives & Sweeteners are required"),
        body("dairyFree")
          .notEmpty()
          .withMessage("Dairy Free is required.")
          .isIn(["Yes", "No"])
          .withMessage("Dairy Free must be 'Yes' or 'No'"),
      ];
    }
    if (value === "HealthcareITSolutions") {
      // Validation for HealthcareITSolutions Category
      return [
        body("subCategory")
          .notEmpty()
          .withMessage("Sub Category is required.")
          .isIn([
            "Healthcare Management Software",
            "Telemedicine Platforms",
            "Medical Billing Software",
            "IoT-Enabled Medical Devices",
          ])
          .withMessage("Sub Category is invalid."),
        // body("license").notEmpty().withMessage("License is required."),
        // body("scalabilityInfo")
        //   .notEmpty()
        //   .withMessage("Scalability Info is required."),
        // body("addOns").notEmpty().withMessage("Add-Ons is required."),
        // body("interoperability")
        //   .notEmpty()
        //   .withMessage("Interoperability is required."),

        // body("userAccess").notEmpty().withMessage("User Access is required."),
        // body("keyFeatures").notEmpty().withMessage("Key Features is required."),
        // body("coreFunctionalities")
        //   .notEmpty()
        //   .withMessage("Core Functionalities is required."),
      ];
    }

    return true; // No validation required for other categories
  }),
];

module.exports = {
  generalValidationRules,
  categorySpecificValidationRules,
  generalValidationRules2,
  categorySpecificValidationRules2,
};
