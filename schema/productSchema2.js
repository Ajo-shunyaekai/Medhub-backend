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
        // required: [true, "Validation Error: Manufacturer is required."],
      },
      aboutManufacturer: {
        type: String,
        trim: true,
        required: [true, "Validation Error: Short Description is required."],
      },
      countryOfOrigin: {
        type: String,
        trim: true,
        // required: [true, "Validation Error: Country of origin is required."],
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
      image: [
        {
          type: String,
          trim: true,
        },
      ],
      brand: {
        type: String,
        trim: true,
      },
      form: {
        type: String,
        trim: true,
        // required: [true, "Validation Error: Type/Form is required."],
      },
      quantity: {
        type: Number,
        required: [true, "Validation Error: Product Quantity is required."],
      },
      volumn: {
        type: String,
        trim: true,
      },
      volumeUnit: {
        type: String,
        trim: true,
      },
      dimension: {
        type: String,
        trim: true,
      },
      dimensionUnit: {
        type: String,
        trim: true,
      },
      weight: {
        type: Number,
        // required: [true, "Validation Error: Product Weight is required."],
      },
      unit: {
        type: String,
        trim: true,
        // required: [true, "Validation Error: Product Weight Unit is required."],
      },
      unit_tax: {
        type: Number,
        required: [true, "Validation Error: Tax Percentage is required."],
      },
      packageType: {
        type: String,
        trim: true,
      },
      packageMaterial: {
        type: String,
        trim: true,
      },
      packageMaterialIfOther: {
        type: String,
        trim: true,
      },
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
        file: { type: String },
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
      healthHazardRating: [
        {
          type: String,
          trim: true,
        },
      ],
      environmentalImpact: [
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
      minimumPurchaseUnit: {
        type: String,
        validate: {
          validator: function (v) {
            return this.market === "secondary" ? !!v : true;
          },
          message: "Validation Error: Minimum Purchase Unit is required.",
        },
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    bulkUpload: {
      type: Boolean,
      default: false,
    },
    MedicalEquipmentAndDevices: {
      subCategory: {
        type: String,
        trim: true,
        enum: [
          "Diagnostic Tools",
          "Imaging Equipment",
          "Surgical Instruments",
          "Monitoring Devices",
          "Mobility Aids",
          "Respiratory Care",
          "Care Products",
          "Blood Pressure Monitor",
          "Anaesthetic Equipment",
          "ECG Machines",
          "Insufflation Devices",
          "Anaesthetic Equipment",
          "Neonatal Care",
          "Infusion Devices",
          "Operation Theater Lights",
          "Sterilizers",
          "OT Tables",
          "Endoscopy",
          "Ultrasonic Devices",
        ],
        validate: {
          validator: function (v) {
            return this.category === "MedicalEquipmentAndDevices" ? !!v : true;
          },
          message:
            "Validation Error: Sub Category is required for Medical Equipment and Devices.",
        },
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      specification: {
        type: String,
        trim: true,
      },
      specificationFile: [
        {
          type: String,
          trim: true,
        },
      ],
      diagnosticFunctions: {
        type: String,
        trim: true,
      },
      interoperability: {
        type: String,
        trim: true,
      },
      laserType: {
        type: String,
        trim: true,
      },
      coolingSystem: {
        type: String,
        trim: true,
      },
      spotSize: {
        type: String,
        trim: true,
      },
      performanceTestingReport: {
        type: String,
        trim: true,
      },
      performanceTestingReportFile: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    Pharmaceuticals: {
      subCategory: {
        type: String,
        trim: true,
        enum: [
          "Prescription Medications",
          "Over-the-Counter Medications",
          "Vaccines",
          "Generic Drugs",
          "Specialized Treatments",
        ],
        validate: {
          validator: function (v) {
            return this.category === "Pharmaceuticals" ? !!v : true;
          },
          message:
            "Validation Error: Sub Category is required for Pharmaceuticals.",
        },
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      genericName: {
        type: String,
        trim: true,
      },
      strength: {
        type: String,
        trim: true,
      },
      composition: {
        type: String,
        trim: true,
      },
      formulation: {
        type: String,
        trim: true,
      },
      purpose: {
        type: String,
        trim: true,
      },
      drugAdministrationRoute: {
        type: String,
        trim: true,
      },
      drugClass: {
        type: String,
        trim: true,
      },
      controlledSubstance: {
        type: Boolean,
        default: false,
      },
      otcClassification: {
        type: String,
        trim: true,
        // enum: ["Category I", "Category II", "Category III"],
      },
      expiry: {
        type: String,
        trim: true,
      },
      sideEffectsAndWarnings: {
        type: String,
        trim: true,
      },
      allergens: {
        type: String,
        trim: true,
      },
    },
    SkinHairCosmeticSupplies: {
      subCategory: {
        type: String,
        trim: true,
        enum: [
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
        ],
        validate: {
          validator: function (v) {
            return this.category === "SkinHairCosmeticSupplies" ? !!v : true;
          },
          message:
            "Validation Error: Sub Category is required for Skin Hair Cosmetic Supplies.",
        },
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      fragrance: {
        type: String,
        trim: true,
      },
      spf: {
        type: String,
        trim: true,
      },
      vegan: {
        type: Boolean,
        default: false,
      },
      crueltyFree: {
        type: Boolean,
        default: false,
      },
      formulation: {
        type: String,
        trim: true,
      },
      strength: {
        type: String,
        trim: true,
      },
      composition: {
        type: String,
        trim: true,
      },
      purpose: {
        type: String,
        trim: true,
      },
      targetCondition: {
        type: String,
        trim: true,
      },
      drugAdministrationRoute: {
        type: String,
        trim: true,
      },
      drugClass: {
        type: String,
        trim: true,
      },
      controlledSubstance: {
        type: Boolean,
        default: false,
      },
      otcClassification: {
        type: String,
        trim: true,
        // enum: ["Category I", "Category II", "Category III"],
      },
      expiry: {
        type: String,
        trim: true,
      },
      sideEffectsAndWarnings: {
        type: String,
        trim: true,
      },
      allergens: {
        type: String,
        trim: true,
      },
      dermatologistTested: {
        type: String,
        enum: ["Yes", "No", ""],
      },
      dermatologistTestedFile: [
        {
          type: String,
          trim: true,
        },
      ],
      pediatricianRecommended: {
        type: String,
        enum: ["Yes", "No", ""],
      },
      pediatricianRecommendedFile: [
        {
          type: String,
          trim: true,
        },
      ],
      elasticity: {
        type: String,
        trim: true,
      },
      adhesiveness: {
        type: String,
        trim: true,
      },
      thickness: {
        type: String,
        trim: true,
      },
      concentration: {
        type: String,
        trim: true,
      },
      moisturizers: {
        type: String,
        trim: true,
      },
      fillerType: {
        type: String,
        trim: true,
      },
    },
    VitalHealthAndWellness: {
      subCategory: {
        type: String,
        trim: true,
        enum: [
          "Fitness Monitors",
          "Herbal & Alternative Medicines",
          "Immune Boosters",
          "Vitamins & Supplements",
          "Weight Management",
        ],
        validate: {
          validator: function (v) {
            return this.category === "VitalHealthAndWellness" ? !!v : true;
          },
          message:
            "Validation Error: Sub Category is required for Vital Health And Wellness.",
        },
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      healthBenefit: {
        type: String,
        trim: true,
      },
      genericName: {
        type: String,
        trim: true,
      },
      strength: {
        type: String,
        trim: true,
      },
      composition: {
        type: String,
        trim: true,
      },
      formulation: {
        type: String,
        trim: true,
      },
      purpose: {
        type: String,
        trim: true,
      },
      drugAdministrationRoute: {
        type: String,
        trim: true,
      },
      drugClass: {
        type: String,
        trim: true,
      },
      controlledSubstance: {
        type: Boolean,
        default: false,
      },
      otcClassification: {
        type: String,
        trim: true,
      },
      expiry: {
        type: String,
        trim: true,
      },
      sideEffectsAndWarnings: {
        type: String,
        trim: true,
      },
      allergens: {
        type: String,
        trim: true,
      },
      vegan: {
        type: Boolean,
        default: false,
      },
      crueltyFree: {
        type: Boolean,
        default: false,
      },
      additivesNSweeteners: {
        type: String,
        trim: true,
      },
    },
    MedicalConsumablesAndDisposables: {
      subCategory: {
        type: String,
        trim: true,
        enum: [
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
        ],
        validate: {
          validator: function (v) {
            return this.category === "MedicalConsumablesAndDisposables"
              ? !!v
              : true;
          },
          message:
            "Sub Category is required for Medical Consumables AndDisposables.",
        },
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      thickness: {
        type: String,
        trim: true,
      },
      powdered: {
        type: Boolean,
        default: false,
      },
      productMaterial: {
        type: String,
        trim: true,
      },
      purpose: {
        type: String,
        trim: true,
      },
      expiry: {
        type: String,
        trim: true,
      },
      texture: {
        type: Boolean,
        default: false,
      },
      sterilized: {
        type: Boolean,
        default: false,
      },
      chemicalResistance: {
        type: String,
        trim: true,
      },
      allergens: {
        type: String,
        trim: true,
      },
      filtrationEfficiency: {
        type: String,
        trim: true,
      },
      breathability: {
        type: String,
        trim: true,
      },
      layerCount: {
        type: String,
        trim: true,
      },
      fluidResistance: {
        type: Boolean,
        default: false,
      },
      filtrationType: [
        {
          type: String,
          trim: true,
        },
      ],
      shape: {
        type: String,
        trim: true,
      },
      coating: {
        type: String,
        trim: true,
      },
    },
    LaboratorySupplies: {
      subCategory: {
        type: String,
        trim: true,
        enum: [
          "Test kits",
          "Microscopes & Lab Equipment",
          "Chemicals & Reagents",
          "Lab Consumables",
        ],
        validate: {
          validator: function (v) {
            return this.category === "LaboratorySupplies" ? !!v : true;
          },
          message:
            "Validation Error: Sub Category is required for Laboratory Supplies.",
        },
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      magnificationRange: {
        type: String,
        trim: true,
      },
      objectiveLenses: {
        type: String,
        trim: true,
      },
      powerSource: {
        type: String,
        trim: true,
      },
      resolution: {
        type: String,
        trim: true,
      },
      connectivity: {
        type: String,
        trim: true,
      },
      shape: {
        type: String,
        trim: true,
      },
      coating: {
        type: String,
        trim: true,
      },
      purpose: {
        type: String,
        trim: true,
      },
      casNumber: {
        type: String,
        trim: true,
      },
      grade: {
        type: String,
        trim: true,
      },
      concentration: {
        type: String,
        trim: true,
      },
      physicalState: [
        {
          type: String,
          trim: true,
        },
      ],
      hazardClassification: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    DiagnosticAndMonitoringDevices: {
      subCategory: {
        type: String,
        trim: true,
        enum: [
          "Blood Glucose Monitors",
          "Blood Pressure Monitors",
          "Oxygen Concentrators",
          "Wearable Health Devices",
        ],
        validate: {
          validator: function (v) {
            return this.category === "DiagnosticAndMonitoringDevices"
              ? !!v
              : true;
          },
          message:
            "Sub Category is required for Diagnostic And Monitoring Devices.",
        },
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      specification: {
        type: String,
        trim: true,
      },
      specificationFile: [
        {
          type: String,
          trim: true,
        },
      ],
      diagnosticFunctions: {
        type: String,
        trim: true,
      },
      measurementRange: {
        type: String,
        trim: true,
      },
      flowRate: {
        type: String,
        trim: true,
      },
      concentration: {
        type: String,
        trim: true,
      },
      noiseLevel: {
        type: String,
        trim: true,
      },
      maintenanceNotes: {
        type: String,
        trim: true,
      },
      compatibleEquipment: {
        type: String,
        trim: true,
      },
      usageRate: {
        type: String,
        trim: true,
      },
      performanceTestingReport: {
        type: String,
        trim: true,
      },
      performanceTestingReportFile: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    HospitalAndClinicSupplies: {
      subCategory: {
        type: String,
        trim: true,
        enum: [
          "Patient Beds & Stretchers",
          "Trolleys & Storage Units",
          "Examination Tables",
          "Medical Furniture",
          "First Aid Kits",
          "Emergency Medical Equipment",
          "Trauma Care Products",
        ],
        validate: {
          validator: function (v) {
            return this.category === "HospitalAndClinicSupplies" ? !!v : true;
          },
          message:
            "Validation Error: Sub Category is required for Hospital And Clinic Supplies.",
        },
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      adhesiveness: {
        type: String,
        trim: true,
      },
      absorbency: {
        type: String,
        trim: true,
      },
      thickness: {
        type: String,
        trim: true,
      },
      powdered: {
        type: Boolean,
        default: false,
      },
      productMaterial: {
        type: String,
        trim: true,
      },
      purpose: {
        type: String,
        trim: true,
      },
      expiry: {
        type: String,
        trim: true,
      },
      texture: {
        type: Boolean,
        default: false,
      },
      sterilized: {
        type: Boolean,
        default: false,
      },
      chemicalResistance: {
        type: String,
        trim: true,
      },
      fluidResistance: {
        type: Boolean,
        default: false,
      },
      elasticity: {
        type: String,
        trim: true,
      },
    },
    OrthopedicSupplies: {
      subCategory: {
        type: String,
        trim: true,
        enum:  [
          "Orthopedic Braces & Supports",
          "Splints & Casting Materials",
          "Prosthetics",
          "Rehabilitation Equipment",
        ],
        validate: {
          validator: function (v) {
            return this.category === "OrthopedicSupplies" ? !!v : true;
          },
          message:
            "Validation Error: Sub Category is required for Orthopedic Supplies.",
        },
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      breathability: {
        type: String,
        trim: true,
      },
      colorOptions: {
        type: String,
        trim: true,
      },
      elasticity: {
        type: String,
        trim: true,
      },
      sterilized: {
        type: Boolean,
        default: false,
      },
      absorbency: {
        type: String,
        trim: true,
      },
      purpose: {
        type: String,
        trim: true,
      },
      targetCondition: {
        type: String,
        trim: true,
      },
      coating: {
        type: String,
        trim: true,
      },
      strength: {
        type: String,
        trim: true,
      },
      moistureResistance: {
        type: String,
        trim: true,
        enum: ["Yes", "No", ""],
      },
    },
    DentalProducts: {
      subCategory: {
        type: String,
        trim: true,
        enum: [
          "Dental Instruments & tools",
          "Orthodontic Supplies",
          "Dental Chairs and Accessories",
          "Dental Consumables",
        ],
        validate: {
          validator: function (v) {
            return this.category === "DentalProducts" ? !!v : true;
          },
          message:
            "Validation Error: Sub Category is required for Hospital And Dental Products.",
        },
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      productMaterial: {
        type: String,
        trim: true,
      },
      purpose: {
        type: String,
        trim: true,
      },
      targetCondition: {
        type: String,
        trim: true,
      },
      maintenanceNotes: {
        type: String,
        trim: true,
      },
      compatibleEquipment: {
        type: String,
        trim: true,
      },
      usageRate: {
        type: String,
        trim: true,
      },
      expiry: {
        type: String,
        trim: true,
      },
    },
    EyeCareSupplies: {
      subCategory: {
        type: String,
        trim: true,
        enum: [
          "Contact Lenses and Solutions",
          "Eyewear",
          "Eyewear Lenses",
          "Eye Drops and Ointments",
        ],
        validate: {
          validator: function (v) {
            return this.category === "EyeCareSupplies" ? !!v : true;
          },
          message:
            "Sub Category is required for Hospital And Eye Care Supplies.",
        },
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      lensPower: {
        type: String,
        trim: true,
      },
      baseCurve: {
        type: String,
        trim: true,
      },
      diameter: {
        type: String,
        trim: true,
      },
      frame: {
        type: String,
        trim: true,
        enum: ["Metal", "Plastic", "Rimless", ""],
      },
      lens: {
        type: String,
        trim: true,
        enum: [
          "Single Vision",
          "Bifocal",
          "Progressive",
          "Anti-Reflective",
          "",
        ],
      },
      lensMaterial: {
        type: String,
        trim: true,
        enum: ["Polycarbonate", "Glass", "Trivex", ""],
      },
      colorOptions: {
        type: String,
        trim: true,
      },
    },
    HomeHealthcareProducts: {
      subCategory: {
        type: String,
        trim: true,
        enum: [
          "Mobility Aids",
          "Respiratory Care",
          "Patient Monitoring Devices",
          "Care Products",
        ],
        validate: {
          validator: function (v) {
            return this.category === "HomeHealthcareProducts" ? !!v : true;
          },
          message: "Sub Category is required for Home Healthcare Products.",
        },
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      colorOptions: {
        type: String,
        trim: true,
      },
      maxWeightCapacity: {
        type: String,
        trim: true,
      },
      gripType: {
        type: String,
        trim: true,
      },
      foldability: {
        type: String,
        trim: true,
      },
      lockingMechanism: {
        type: String,
        trim: true,
      },
      typeOfSupport: {
        type: String,
        trim: true,
      },
      flowRate: {
        type: String,
        trim: true,
      },
      concentration: {
        type: String,
        trim: true,
      },
      batteryType: {
        type: String,
        trim: true,
      },
      batterySize: {
        type: String,
        trim: true,
      },
      performanceTestingReport: {
        type: String,
        trim: true,
      },
      performanceTestingReportFile: [
        {
          type: String,
          trim: true,
        },
      ],
      expiry: {
        type: String,
        trim: true,
      },
    },
    AlternativeMedicines: {
      subCategory: {
        type: String,
        trim: true,
        enum: ["Homeopathy", "Ayurvedic"],
        validate: {
          validator: function (v) {
            return this.category === "AlternativeMedicines" ? !!v : true;
          },
          message: "Sub Category is required for Alternative Medicines.",
        },
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      composition: {
        type: String,
        trim: true,
      },
      purpose: {
        type: String,
        trim: true,
      },
      healthClaims: {
        type: String,
        trim: true,
      },
      healthClaimsFile: [
        {
          type: String,
          trim: true,
        },
      ],
      expiry: {
        type: String,
        trim: true,
      },
    },
    EmergencyAndFirstAidSupplies: {
      subCategory: {
        type: String,
        trim: true,
        enum: [
          "First Aid Kits",
          "Emergency Medical Equipment",
          "Trauma Care Products",
        ],
        validate: {
          validator: function (v) {
            return this.category === "EmergencyAndFirstAidSupplies"
              ? !!v
              : true;
          },
          message:
            "Sub Category is required for Emergency And First Aid Supplies.",
        },
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      expiry: {
        type: String,
        trim: true,
      },
      composition: {
        type: String,
        trim: true,
      },
      productLongevity: {
        type: String,
        trim: true,
      },
      foldability: {
        type: String,
        trim: true,
      },
    },
    DisinfectionAndHygieneSupplies: {
      subCategory: {
        type: String,
        trim: true,
        enum: ["Hand Sanitizers", "Air Purifiers", "Cleaning Agents"],
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      composition: {
        type: String,
        trim: true,
      },
      concentration: {
        type: String,
        trim: true,
      },
      formulation: {
        type: String,
        trim: true,
      },
      expiry: {
        type: String,
        trim: true,
      },
      fragrance: {
        type: String,
        trim: true,
      },
    },
    NutritionAndDietaryProducts: {
      subCategory: {
        type: String,
        trim: true,
        enum: [
          "Protein Powders and Shakes",
          "Specialized Nutrition",
          "Meal Replacement Solutions",
        ],
        validate: {
          validator: function (v) {
            return this.category === "NutritionAndDietaryProducts" ? !!v : true;
          },
          message:
            "Sub Category is required for Nutrition And Dietary Products.",
        },
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      flavorOptions: {
        type: String,
        trim: true,
      },
      aminoAcidProfile: {
        type: String,
        trim: true,
      },
      fatContent: {
        type: String,
        trim: true,
      },
      expiry: {
        type: String,
        trim: true,
      },
      vegan: {
        type: Boolean,
        default: false,
      },
      purpose: {
        type: String,
        trim: true,
      },
      healthBenefit: {
        type: String,
        trim: true,
      },
      composition: {
        type: String,
        trim: true,
      },
      additivesNSweeteners: {
        type: String,
        trim: true,
      },
      dairyFree: {
        type: String,
        trim: true,
        enum: ["Yes", "No", ""],
        trim: true,
      },
    },
    HealthcareITSolutions: {
      subCategory: {
        type: String,
        trim: true,
        enum: [
          "Healthcare Management Software",
          "Telemedicine Platforms",
          "Medical Billing Software",
          "IoT-Enabled Medical Devices",
        ],
        validate: {
          validator: function (v) {
            return this.category === "HealthcareITSolutions" ? !!v : true;
          },
          message:
            "Validation Error: Sub Category is required for Healthcare IT Solutions.",
        },
      },
      anotherCategory: {
        type: String,
        trim: true,
      },
      license: {
        type: String,
        trim: true,
      },
      scalabilityInfo: {
        type: String,
        trim: true,
      },
      addOns: {
        type: String,
        trim: true,
      },
      interoperability: {
        type: String,
        trim: true,
      },
      interoperabilityFile: [
        {
          type: String,
          trim: true,
        },
      ],
      userAccess: {
        type: String,
        trim: true,
      },
      keyFeatures: {
        type: String,
        trim: true,
      },
      coreFunctionalities: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("Product", productSchema);