const handleProductCategorySwitch = (result) => {
  let updatedObject = {};

  switch (result?.["Product Category*"]?.trim()) {
    case "Alternative Medicines":
      updatedObject["composition"] =
        result?.["Composition/Ingredients*"]?.toString()?.trim() || "";
      updatedObject["healthClaims"] =
        result?.["Health Claims"]?.toString()?.trim() || "";
      updatedObject["healthClaimsFile"] =
        result?.["Health Claims File"]
          ?.split(",")
          ?.map((ele) => ele?.toString()?.trim()) || [];
      updatedObject["purpose"] = result?.["Purpose"]?.toString()?.trim() || "";
      updatedObject["expiry"] =
        result?.["Shelf Life/Expiry*"]?.toString()?.trim() || "";
      break;

    case "Dental Products":
      updatedObject["productMaterial"] =
        result?.["Product Material"]?.toString()?.trim() || "";
      updatedObject["purpose"] = result?.["Purpose"]?.toString()?.trim() || "";
      updatedObject["targetCondition"] =
        result?.["Target Condition"]?.toString()?.trim() || "";
      updatedObject["expiry"] =
        result?.["Shelf Life/Expiry*"]?.toString()?.trim() || "";
      updatedObject["usageRate"] =
        result?.["Usage Rate"]?.toString()?.trim() || "";
      updatedObject["maintenanceNotes"] =
        result?.["Maintenance Notes"]?.toString()?.trim() || "";
      updatedObject["compatibleEquipment"] =
        result?.["Compatible Equipment"]?.toString()?.trim() || "";
      break;

    case "Diagnostic and Monitoring Devices":
      updatedObject["diagnosticFunctions"] =
        result?.["Diagnostic Functions*"]?.toString()?.trim() || "";
      updatedObject["flowRate"] =
        result?.["Flow Rate"]?.toString()?.trim() || "";
      updatedObject["concentration"] =
        result?.["Concentration"]?.toString()?.trim() || "";
      updatedObject["measurementRange"] =
        result?.["Measurement Range"]?.toString()?.trim() || "";
      updatedObject["noiseLevel"] =
        result?.["Noise Level"]?.toString()?.trim() || "";
      updatedObject["usageRate"] =
        result?.["Usage Rate"]?.toString()?.trim() || "";
      updatedObject["maintenanceNotes"] =
        result?.["Maintenance Notes"]?.toString()?.trim() || "";
      updatedObject["compatibleEquipment"] =
        result?.["Compatible Equipment"]?.toString()?.trim() || "";
      updatedObject["specification"] =
        result?.["Specification*"]?.toString()?.trim() || "";
      updatedObject["specificationFile"] =
        result?.["Specification File*"]
          ?.split(",")
          ?.map((ele) => ele?.toString()?.trim()) || [];
      updatedObject["performanceTestingReport"] =
        result?.["Performance Testing Report"]?.toString()?.trim() || "";
      updatedObject["performanceTestingReportFile"] =
        result?.["Performance Testing Report File"]
          ?.split(",")
          ?.map((ele) => ele?.toString()?.trim()) || [];
      break;

    case "Disinfection and Hygiene Supplies":
      updatedObject["composition"] =
        result?.["Composition/Ingredients*"]?.toString()?.trim() || "";
      updatedObject["concentration"] =
        result?.["Concentration"]?.toString()?.trim() || "";
      updatedObject["formulation"] =
        result?.["Formulation"]?.toString()?.trim() || "";
      updatedObject["fragrance"] =
        result?.["Fragrance"]?.toString()?.trim() || "";
      updatedObject["expiry"] =
        result?.["Shelf Life/Expiry*"]?.toString()?.trim() || "";
      break;

    case "Emergency and First Aid Supplies":
      updatedObject["composition"] =
        result?.["Composition/Ingredients*"]?.toString()?.trim() || "";
      updatedObject["productLongevity"] =
        result?.["Product Longevity*"]?.toString()?.trim() || "";
      updatedObject["foldability"] =
        result?.["Foldability*"]?.toString()?.trim() || "";
      updatedObject["expiry"] =
        result?.["Shelf Life/Expiry*"]?.toString()?.trim() || "";
      break;

    case "Eye Care Supplies":
      updatedObject["frame"] = result?.["Frame"]?.toString()?.trim() || "";
      updatedObject["lens"] = result?.["Lens"]?.toString()?.trim() || "";
      updatedObject["lensMaterial"] =
        result?.["Lens Material"]?.toString()?.trim() || "";
      updatedObject["diameter"] =
        result?.["Diameter"]?.toString()?.trim() || "";
      updatedObject["lensPower"] =
        result?.["Lens Power"]?.toString()?.trim() || "";
      updatedObject["baseCurve"] =
        result?.["Base Curve"]?.toString()?.trim() || "";
      updatedObject["colorOptions"] =
        result?.["Color Options"]?.toString()?.trim() || "";
      break;

    case "Healthcare IT Solutions":
      updatedObject["scalabilityInfo"] =
        result?.["Scalability Info*"]?.toString()?.trim() || "";
      updatedObject["license"] = result?.["License*"]?.toString()?.trim() || "";
      updatedObject["addOns"] = result?.["Add-Ons*"]?.toString()?.trim() || "";
      updatedObject["userAccess"] =
        result?.["User Access*"]?.toString()?.trim() || "";
      updatedObject["keyFeatures"] =
        result?.["Key Features*"]?.toString()?.trim() || "";
      updatedObject["coreFunctionalities"] =
        result?.["Core Functionalities*"]?.toString()?.trim() || "";
      updatedObject["interoperability"] =
        result?.["Interoperability*"]?.toString()?.trim() || "";
      updatedObject["interoperabilityFile"] =
        result?.["Interoperability File*"]
          ?.split(",")
          ?.map((ele) => ele?.toString()?.trim()) || [];
      break;

    case "Hospital and Clinic Supplies":
      updatedObject["thickness"] =
        result?.["Thickness"]?.toString()?.trim() || "";
      updatedObject["productMaterial"] =
        result?.["Product Material"]?.toString()?.trim() || "";
      updatedObject["purpose"] = result?.["Purpose"]?.toString()?.trim() || "";
      updatedObject["chemicalResistance"] =
        result?.["Chemical Resistance"]?.toString()?.trim() || "";
      updatedObject["powdered"] = result?.["Powdered"] === "true" || false;
      updatedObject["texture"] = result?.["Texture"] === "true" || false;
      updatedObject["expiry"] =
        result?.["Shelf Life/Expiry*"]?.toString()?.trim() || "";
      updatedObject["sterilized"] = result?.["Sterilized"] === "true" || false;
      updatedObject["adhesiveness"] =
        result?.["Adhesiveness"]?.toString()?.trim() || "";
      updatedObject["absorbency"] =
        result?.["Absorbency"]?.toString()?.trim() || "";
      updatedObject["elasticity"] =
        result?.["Elasticity"]?.toString()?.trim() || "";
      updatedObject["fluidResistance"] =
        result?.["Fluid Resistance"] === "true" || false;
      break;

    case "Home Healthcare Products":
      updatedObject["colorOptions"] =
        result?.["Color Options"]?.toString()?.trim() || "";
      updatedObject["maxWeightCapacity"] =
        result?.["Max Weight Capacity"]?.toString()?.trim() || "";
      updatedObject["gripType"] =
        result?.["Grip Type"]?.toString()?.trim() || "";
      updatedObject["foldability"] =
        result?.["Foldability"]?.toString()?.trim() || "";
      updatedObject["lockingMechanism"] =
        result?.["Locking Mechanism"]?.toString()?.trim() || "";
      updatedObject["typeOfSupport"] =
        result?.["Type of Support"]?.toString()?.trim() || "";
      updatedObject["flowRate"] =
        result?.["Flow Rate"]?.toString()?.trim() || "";
      updatedObject["concentration"] =
        result?.["Concentration"]?.toString()?.trim() || "";
      updatedObject["batteryType"] =
        result?.["Battery Type"]?.toString()?.trim() || "";
      updatedObject["batterySize"] =
        result?.["Battery Size"]?.toString()?.trim() || "";
      updatedObject["performanceTestingReport"] =
        result?.["Performance Testing Report"]?.toString()?.trim() || "";
      updatedObject["performanceTestingReportFile"] =
        result?.["Performance Testing Report File"]
          ?.split(",")
          ?.map((ele) => ele?.toString()?.trim()) || [];
      updatedObject["expiry"] =
        result?.["Shelf Life/Expiry*"]?.toString()?.trim() || "";
      break;

    case "Laboratory Supplies":
      updatedObject["physicalState"] =
        result?.["Physical State"]
          ?.split(",")
          ?.map((ele) => ele?.toString()?.trim()) || [];
      updatedObject["hazardClassification"] =
        result?.["Hazard Classification"]
          ?.split(",")
          ?.map((ele) => ele?.toString()?.trim()) || [];
      updatedObject["shape"] = result?.["Shape"]?.toString()?.trim() || "";
      updatedObject["coating"] = result?.["Coating"]?.toString()?.trim() || "";
      updatedObject["purpose"] = result?.["Purpose"]?.toString()?.trim() || "";
      updatedObject["casNumber"] =
        result?.["CAS Number"]?.toString()?.trim() || "";
      updatedObject["grade"] = result?.["Grade"]?.toString()?.trim() || "";
      updatedObject["concentration"] =
        result?.["Concentration"]?.toString()?.trim() || "";
      updatedObject["connectivity"] =
        result?.["Connectivity"]?.toString()?.trim() || "";
      updatedObject["magnificationRange"] =
        result?.["Magnification Range"]?.toString()?.trim() || "";
      updatedObject["objectiveLenses"] =
        result?.["Objective Lenses"]?.toString()?.trim() || "";
      updatedObject["powerSource"] =
        result?.["Power Source"]?.toString()?.trim() || "";
      updatedObject["resolution"] =
        result?.["Resolution"]?.toString()?.trim() || "";
      break;

    case "Medical Consumables and Disposables":
      updatedObject["thickness"] =
        result?.["Thickness"]?.toString()?.trim() || "";
      updatedObject["productMaterial"] =
        result?.["Product Material"]?.toString()?.trim() || "";
      updatedObject["filtrationType"] =
        result?.["Filtration Type"]
          ?.split(",")
          ?.map((ele) => ele?.toString()?.trim()) || [];
      updatedObject["purpose"] = result?.["Purpose"]?.toString()?.trim() || "";
      updatedObject["chemicalResistance"] =
        result?.["Chemical Resistance"]?.toString()?.trim() || "";
      updatedObject["shape"] = result?.["Shape"]?.toString()?.trim() || "";
      updatedObject["coating"] = result?.["Coating"]?.toString()?.trim() || "";
      updatedObject["powdered"] = result?.["Powdered"] === "true" || false;
      updatedObject["texture"] = result?.["Texture"] === "true" || false;
      updatedObject["expiry"] =
        result?.["Shelf Life/Expiry*"]?.toString()?.trim() || "";
      updatedObject["allergens"] =
        result?.["Allergens"]?.toString()?.trim() || "";
      updatedObject["sterilized"] = result?.["Sterilized"] === "true" || false;
      updatedObject["filtrationEfficiency"] =
        result?.["Filtration Efficiency"]?.toString()?.trim() || "";
      updatedObject["breathability"] =
        result?.["Breathability"]?.toString()?.trim() || "";
      updatedObject["layerCount"] =
        result?.["Layer Count"]?.toString()?.trim() || "";
      updatedObject["fluidResistance"] =
        result?.["Fluid Resistance"] === "true" || false;
      break;

    case "Medical Equipment and Devices":
      updatedObject["interoperability"] =
        result?.["Interoperability"]?.toString()?.trim() || "";
      updatedObject["laserType"] =
        result?.["Laser Type"]?.toString()?.trim() || "";
      updatedObject["coolingSystem"] =
        result?.["Cooling System"]?.toString()?.trim() || "";
      updatedObject["spotSize"] =
        result?.["Spot Size"]?.toString()?.trim() || "";
      updatedObject["diagnosticFunctions"] =
        result?.["Diagnostic Functions"]?.toString()?.trim() || "";
      updatedObject["performanceTestingReport"] =
        result?.["Performance Testing Report"]?.toString()?.trim() || "";
      updatedObject["performanceTestingReportFile"] =
        result?.["Performance Testing Report File"]
          ?.split(",")
          ?.map((ele) => ele?.toString()?.trim()) || [];
      updatedObject["specification"] =
        result?.["Specification*"]?.toString()?.trim() || "";
      updatedObject["specificationFile"] =
        result?.["Specification File"]
          ?.split(",")
          ?.map((ele) => ele?.toString()?.trim()) || [];
      break;

    case "Nutrition and Dietary Products":
      updatedObject["dairyFree"] =
        result?.["Dairy Free*"]?.toString()?.trim() || "";
      updatedObject["flavorOptions"] =
        result?.["Flavor Options*"]?.toString()?.trim() || "";
      updatedObject["aminoAcidProfile"] =
        result?.["Amino Acid Profile*"]?.toString()?.trim() || "";
      updatedObject["fatContent"] =
        result?.["Fat Content*"]?.toString()?.trim() || "";
      updatedObject["healthBenefit"] =
        result?.["Health Benefit*"]?.toString()?.trim() || "";
      updatedObject["purpose"] = result?.["Purpose"]?.toString()?.trim() || "";
      updatedObject["composition"] =
        result?.["Composition/Ingredients*"]?.toString()?.trim() || "";
      updatedObject["additivesNSweeteners"] =
        result?.["Additives & Sweeteners*"]?.toString()?.trim() || "";
      updatedObject["vegan"] = result?.["Vegan"] === "true" || false;
      updatedObject["expiry"] =
        result?.["Shelf Life/Expiry*"]?.toString()?.trim() || "";
      break;

    case "Orthopedic Supplies":
      updatedObject["strength"] =
        result?.["Strength*"]?.toString()?.trim() || "";
      updatedObject["moistureResistance"] =
        result?.["Moisture Resistance"]?.toString()?.trim() || "";
      updatedObject["purpose"] = result?.["Purpose"]?.toString()?.trim() || "";
      updatedObject["targetCondition"] =
        result?.["Target Condition*"]?.toString()?.trim() || "";
      updatedObject["coating"] = result?.["Coating"]?.toString()?.trim() || "";
      updatedObject["sterilized"] = result?.["Sterilized"] === "true" || false;
      updatedObject["elasticity"] =
        result?.["Elasticity"]?.toString()?.trim() || "";
      updatedObject["absorbency"] =
        result?.["Absorbency"]?.toString()?.trim() || "";
      updatedObject["breathability"] =
        result?.["Breathability"]?.toString()?.trim() || "";
      updatedObject["colorOptions"] =
        result?.["Color Options"]?.toString()?.trim() || "";
      break;

    case "Pharmaceuticals":
      updatedObject["genericName"] =
        result?.["Generic Name*"]?.toString()?.trim() || "";
      updatedObject["drugClass"] =
        result?.["Drug Class*"]?.toString()?.trim() || "";
      updatedObject["strength"] =
        result?.["Strength*"]?.toString()?.trim() || "";
      updatedObject["otcClassification"] =
        result?.["OTC Classification"]?.toString()?.trim() || "";
      updatedObject["composition"] =
        result?.["Composition/Ingredients*"]?.toString()?.trim() || "";
      updatedObject["formulation"] =
        result?.["Formulation"]?.toString()?.trim() || "";
      updatedObject["purpose"] = result?.["Purpose"]?.toString()?.trim() || "";
      updatedObject["drugAdministrationRoute"] =
        result?.["Drug Administration Route*"]?.toString()?.trim() || "";
      updatedObject["controlledSubstance"] =
        result?.["Controlled Substance"] === "true" || false;
      updatedObject["expiry"] =
        result?.["Shelf Life/Expiry*"]?.toString()?.trim() || "";
      updatedObject["sideEffectsAndWarnings"] =
        result?.["Side Effects and Warnings"]?.toString()?.trim() || "";
      updatedObject["allergens"] =
        result?.["Allergens"]?.toString()?.trim() || "";
      break;

    case "Skin, Hair and Cosmetic Supplies":
      updatedObject["spf"] = result?.["SPF"]?.toString()?.trim() || "";
      updatedObject["fragrance"] =
        result?.["Fragrance"]?.toString()?.trim() || "";
      updatedObject["strength"] =
        result?.["Strength"]?.toString()?.trim() || "";
      updatedObject["elasticity"] =
        result?.["Elasticity"]?.toString()?.trim() || "";
      updatedObject["adhesiveness"] =
        result?.["Adhesiveness"]?.toString()?.trim() || "";
      updatedObject["thickness"] =
        result?.["Thickness"]?.toString()?.trim() || "";
      updatedObject["otcClassification"] =
        result?.["OTC Classification"]?.toString()?.trim() || "";
      updatedObject["formulation"] =
        result?.["Formulation"]?.toString()?.trim() || "";
      updatedObject["composition"] =
        result?.["Composition/Ingredients*"]?.toString()?.trim() || "";
      updatedObject["purpose"] = result?.["Purpose*"]?.toString()?.trim() || "";
      updatedObject["targetCondition"] =
        result?.["Target Condition*"]?.toString()?.trim() || "";
      updatedObject["drugAdministrationRoute"] =
        result?.["Drug Administration Route*"]?.toString()?.trim() || "";
      updatedObject["drugClass"] =
        result?.["Drug Class*"]?.toString()?.trim() || "";
      updatedObject["concentration"] =
        result?.["Concentration"]?.toString()?.trim() || "";
      updatedObject["moisturizers"] =
        result?.["Moisturizers"]?.toString()?.trim() || "";
      updatedObject["fillerType"] =
        result?.["Filler Type"]?.toString()?.trim() || "";
      updatedObject["vegan"] = result?.["Vegan"] === "true" || false;
      updatedObject["crueltyFree"] =
        result?.["Cruelty-Free"] === "true" || false;
      updatedObject["controlledSubstance"] =
        result?.["Controlled Substance"] === "true" || false;
      updatedObject["dermatologistTested"] =
        result?.["Dermatologist Tested*"]?.toString()?.trim() || "";
      updatedObject["dermatologistTestedFile"] =
        result?.["Dermatologist Tested File"]
          ?.split(",")
          ?.map((ele) => ele?.toString()?.trim()) || [];
      (updatedObject["pediatricianRecommended"] =
        result?.["Pediatrician Recommended*"]?.toString()?.trim() || ""),
        (updatedObject["pediatricianRecommendedFile"] =
          result?.["Pediatrician Recommended File"]
            ?.split(",")
            ?.map((ele) => ele?.toString()?.trim()) || []);
      updatedObject["sideEffectsAndWarnings"] =
        result?.["Side Effects and Warnings"]?.toString()?.trim() || "";
      updatedObject["allergens"] =
        result?.["Allergens"]?.toString()?.trim() || "";
      updatedObject["expiry"] =
        result?.["Shelf Life/Expiry*"]?.toString()?.trim() || "";
      break;

    case "Vital Health and Wellness":
      updatedObject["healthBenefit"] =
        result?.["Health Benefit*"]?.toString()?.trim() || "";
      updatedObject["genericName"] =
        result?.["Generic Name*"]?.toString()?.trim() || "";
      updatedObject["strength"] =
        result?.["Strength*"]?.toString()?.trim() || "";
      updatedObject["purpose"] = result?.["Purpose"]?.toString()?.trim() || "";
      updatedObject["drugAdministrationRoute"] =
        result?.["Drug Administration Route*"]?.toString()?.trim() || "";
      updatedObject["drugClass"] =
        result?.["Drug Class*"]?.toString()?.trim() || "";
      updatedObject["controlledSubstance"] =
        result?.["Controlled Substance"] === "true" || false;
      updatedObject["expiry"] =
        result?.["Shelf Life/Expiry*"]?.toString()?.trim() || "";
      updatedObject["sideEffectsAndWarnings"] =
        result?.["Side Effects and Warnings"]?.toString()?.trim() || "";
      updatedObject["allergens"] =
        result?.["Allergens"]?.toString()?.trim() || "";
      updatedObject["vegan"] = result?.["Vegan"] === "true" || false;
      updatedObject["crueltyFree"] =
        result?.["Cruelty-Free"] === "true" || false;
      updatedObject["additivesNSweeteners"] =
        result?.["Additives & Sweeteners"]?.toString()?.trim() || "";
      break;

    default:
      break;
  }

  return updatedObject;
};

const getFieldName = (key, additionalCheck) => {
  let fieldName;
  switch (key) {
    case "model":
      fieldName = "Part/Model Number*";
      break;

    case "name":
      fieldName = "Product Name*";
      break;

    case "category":
      fieldName = "Product Category*";
      break;

    case "subCategory":
      fieldName = "Product Sub Category*";
      break;

    case "anotherCategory":
      fieldName = "Product Sub Category (Level 3)";
      break;

    case "upc":
      fieldName = "UPC (Universal Product Code)";
      break;

    case "aboutManufacturer":
      fieldName = "Short Description*";
      break;

    case "brand":
      fieldName = "Brand Name";
      break;

    case "form":
      fieldName = "Product Type/Form*";
      break;

    case "quantity":
      fieldName = "Product Total Quantity*";
      break;

    case "volumn":
      fieldName = "Product Volume";
      break;

    case "volumeUnit":
      fieldName = "Product Volume Unit";
      break;

    case "dimension":
      fieldName = "Product Dimension";
      break;

    case "dimensionUnit":
      fieldName = "Product Dimension Unit";
      break;

    case "weight":
      fieldName = "Product Weight*";
      break;

    case "unit":
      fieldName = "Product Weight Units*";
      break;

    case "unit_tax":
      fieldName = "Product Tax%*";
      break;

    case "packageType":
      fieldName = "Product Packaging Type";
      break;

    case "packageMaterial":
      fieldName = "Product Packaging Material";
      break;

    case "storage":
      fieldName = "Storage Conditions";
      break;

    case "manufacturer":
      fieldName = "Manufacturer Name*";
      break;

    case "countryOfOrigin":
      fieldName = "Manufacturer Contry of Origin*";
      break;

    case "image":
      fieldName = "Product Image";
      break;

    case "description":
      fieldName = "Product Description*";
      break;

    case "date":
      fieldName = "Date of Manufacture";
      break;

    case "sku":
      fieldName = "SKU";
      break;

    case "stock":
      fieldName = "Stock*";
      break;

    case "countries":
      fieldName = "Stocked in Countries*";
      break;

    // case "date2":
    //   fieldName = "Date of Manufacture";
    //   break;

    case "country":
      fieldName = "Country where Stock Trades";
      break;

    case "quantity2":
      fieldName = "Quantity From*";
      break;

    case "quantity3":
      fieldName = "Quantity To*";
      break;

    case "price":
      fieldName = "Cost Per Product*";
      break;

    case "deliveryTime":
      fieldName = "Est. Delivery Time*";
      break;

    case "file":
      fieldName = "Regulatory Compliance";
      break;

    case "date3":
      fieldName = "Date of Expiry";
      break;

    case "safetyDatasheet":
      fieldName = "Safety Datasheet";
      break;

    case "healthHazardRating":
      fieldName = "Health Hazard Rating";
      break;

    case "environmentalImpact":
      fieldName = "Environmental Impact";
      break;

    case "warranty":
      fieldName = "Warranty";
      break;

    case "guidelinesFile":
      fieldName = "User Guidelines";
      break;

    case "other":
      fieldName = "Other Information";
      break;

    case "subCategory":
      fieldName = "Product Sub Category*";
      break;

    case "anotherCategory":
      fieldName = "Product 3rd Sub Category";
      break;
    // case "AlternativeMedicines":
    case "healthClaims":
      fieldName = "Health Claims";
      break;

    case "healthClaimsFile":
      fieldName = "Health Claims File";
      break;

    case "expiry":
      fieldName = "Shelf Life/Expiry*";
      break;

    // case "DentalProducts":
    case "productMaterial":
      fieldName = "Product Material";
      break;

    case "usageRate":
      fieldName = "Usage Rate";
      break;

    case "maintenanceNotes":
      fieldName = "Maintenance Notes";
      break;

    case "compatibleEquipment":
      fieldName = "Compatible Equipment";
      break;

    // case "DiagnosticAndMonitoringDevices":
    case "diagnosticFunctions":
      fieldName = additionalCheck
        ? "Diagnostic Functions*"
        : "Diagnostic Functions";
      break;

    case "flowRate":
      fieldName = "Flow Rate";
      break;

    case "concentration":
      fieldName = "Concentration";
      break;

    case "measurementRange":
      fieldName = "Measurement Range";
      break;

    case "noiseLevel":
      fieldName = "Noise Level";
      break;

    case "usageRate":
      fieldName = "Usage Rate";
      break;

    case "maintenanceNotes":
      fieldName = "Maintenance Notes";
      break;

    case "compatibleEquipment":
      fieldName = "Compatible Equipment";
      break;

    case "specification":
      fieldName = additionalCheck ? "Specification*" : "Specification";
      break;

    case "specificationFile":
      fieldName = "Specification File*";
      break;

    case "performanceTestingReport":
      fieldName = "Performance Testing Report";
      break;

    case "performanceTestingReportFile":
      fieldName = "Performance Testing Report File";
      break;

    // case "DisinfectionAndHygieneSupplies":

    case "composition":
      fieldName = "Composition/Ingredients*";
      break;

    case "concentration":
      fieldName = "Concentration";
      break;

    case "formulation":
      fieldName = "Formulation";
      break;

    case "fragrance":
      fieldName = "Fragrance";
      break;

    // case "EmergencyAndFirstAidSupplies":
    case "productLongevity":
      fieldName = "Product Longevity*";
      break;

    case "foldability":
      fieldName = "Foldability*";
      break;

    // case "EyeCareSupplies":
    case "frame":
      fieldName = "Frame";
      break;

    case "lens":
      fieldName = "Lens";
      break;

    case "lensMaterial":
      fieldName = "Lens Material";
      break;

    case "diameter":
      fieldName = "Diameter";
      break;

    case "lensPower":
      fieldName = "Lens Power";
      break;

    case "baseCurve":
      fieldName = "Base Curve";
      break;

    case "colorOptions":
      fieldName = "Color Options";
      break;

    // case "HealthcareITSolutions":
    case "scalabilityInfo":
      fieldName = "Scalability Info*";
      break;

    case "license":
      fieldName = "License*";
      break;

    case "addOns":
      fieldName = "Add-Ons*";
      break;

    case "userAccess":
      fieldName = "User Access*";
      break;

    case "keyFeatures":
      fieldName = "Key Features*";
      break;

    case "coreFunctionalities":
      fieldName = "Core Functionalities*";
      break;

    case "interoperability":
      fieldName = additionalCheck ? "Interoperability*" : "Interoperability";
      break;

    case "interoperabilityFile":
      fieldName = "Interoperability File*";
      break;

    // case "HospitalAndClinicSupplies":
    case "thickness":
      fieldName = "Thickness";
      break;

    case "productMaterial":
      fieldName = "Product Material";
      break;

    case "chemicalResistance":
      fieldName = "Chemical Resistance";
      break;

    case "powdered":
      fieldName = "Powdered";
      break;

    case "texture":
      fieldName = "Texture";
      break;

    case "sterilized":
      fieldName = "Sterilized";
      break;

    case "adhesiveness":
      fieldName = "Adhesiveness";
      break;

    case "absorbency":
      fieldName = "Absorbency";
      break;

    case "elasticity":
      fieldName = "Elasticity";
      break;

    case "fluidResistance":
      fieldName = "Fluid Resistance";
      break;

    // case "HomeHealthcareProducts":
    case "colorOptions":
      fieldName = "Color Options";
      break;

    case "maxWeightCapacity":
      fieldName = "Max Weight Capacity";
      break;

    case "gripType":
      fieldName = "Grip Type";
      break;

    case "foldability":
      fieldName = "Foldability";
      break;

    case "lockingMechanism":
      fieldName = "Locking Mechanism";
      break;

    case "typeOfSupport":
      fieldName = "Type of Support";
      break;

    case "flowRate":
      fieldName = "Flow Rate";
      break;

    case "concentration":
      fieldName = "Concentration";
      break;

    case "batteryType":
      fieldName = "Battery Type";
      break;

    case "batterySize":
      fieldName = "Battery Size";
      break;

    case "performanceTestingReport":
      fieldName = "Performance Testing Report";
      break;

    case "performanceTestingReportFile":
      fieldName = "Performance Testing Report File";
      break;

    // case "LaboratorySupplies":
    case "physicalState":
      fieldName = "Physical State";
      break;

    case "hazardClassification":
      fieldName = "Hazard Classification";
      break;

    case "shape":
      fieldName = "Shape";
      break;

    case "coating":
      fieldName = "Coating";
      break;

    case "casNumber":
      fieldName = "CAS Number";
      break;

    case "grade":
      fieldName = "Grade";
      break;

    case "concentration":
      fieldName = "Concentration";
      break;

    case "connectivity":
      fieldName = "Connectivity";
      break;

    case "magnificationRange":
      fieldName = "Magnification Range";
      break;

    case "objectiveLenses":
      fieldName = "Objective Lenses";
      break;

    case "powerSource":
      fieldName = "Power Source";
      break;

    case "resolution":
      fieldName = "Resolution";
      break;

    // case "MedicalConsumablesAndDisposables":
    case "thickness":
      fieldName = "Thickness";
      break;

    case "productMaterial":
      fieldName = "Product Material";
      break;

    case "filtrationType":
      fieldName = "Filtration Type";
      break;

    case "chemicalResistance":
      fieldName = "Chemical Resistance";
      break;

    case "shape":
      fieldName = "Shape";
      break;

    case "coating":
      fieldName = "Coating";
      break;

    case "powdered":
      fieldName = "Powdered";
      break;

    case "texture":
      fieldName = "Texture";
      break;

    case "allergens":
      fieldName = "Allergens";
      break;

    case "sterilized":
      fieldName = "Sterilized";
      break;

    case "filtrationEfficiency":
      fieldName = "Filtration Efficiency";
      break;

    case "breathability":
      fieldName = "Breathability";
      break;

    case "layerCount":
      fieldName = "Layer Count";
      break;

    case "fluidResistance":
      fieldName = "Fluid Resistance";
      break;

    // case "MedicalEquipmentAndDevices":
    case "laserType":
      fieldName = "Laser Type";
      break;

    case "coolingSystem":
      fieldName = "Cooling System";
      break;

    case "spotSize":
      fieldName = "Spot Size";
      break;

    case "performanceTestingReport":
      fieldName = "Performance Testing Report";
      break;

    case "performanceTestingReportFile":
      fieldName = "Performance Testing Report File";
      break;

    case "specificationFile":
      fieldName = "Specification File";
      break;

    // case "NutritionAndDietaryProducts":
    case "dairyFree":
      fieldName = "Dairy Free*";
      break;

    case "flavorOptions":
      fieldName = "Flavor Options*";
      break;

    case "aminoAcidProfile":
      fieldName = "Amino Acid Profile*";
      break;

    case "fatContent":
      fieldName = "Fat Content*";
      break;

    case "healthBenefit":
      fieldName = additionalCheck ? "Health Benefit*" : "Health Benefit";
      break;

    case "additivesNSweeteners":
      fieldName = "Additives & Sweeteners*";
      break;

    case "vegan":
      fieldName = "Vegan";
      break;

    // case "OrthopedicSupplies"
    case "moistureResistance":
      fieldName = "Moisture Resistance";
      break;

    case "purpose":
      fieldName = additionalCheck ? "Purpose*" : "Purpose";
      break;

    case "targetCondition":
      fieldName = additionalCheck ? "Target Condition*" : "Target Condition";
      break;

    case "coating":
      fieldName = "Coating";
      break;

    case "sterilized":
      fieldName = "Sterilized";
      break;

    case "elasticity":
      fieldName = "Elasticity";
      break;

    case "absorbency":
      fieldName = "Absorbency";
      break;

    case "breathability":
      fieldName = "Breathability";
      break;

    case "colorOptions":
      fieldName = "Color Options";
      break;

    // case "Pharmaceuticals":
    case "genericName":
      fieldName = additionalCheck ? "Generic Name*" : "Generic Name";
      break;

    case "drugClass":
      fieldName = additionalCheck ? "Drug Class*" : "Drug Class";
      break;

    case "strength":
      fieldName = additionalCheck ? "Strength*" : "Strength";
      break;

    case "otcClassification":
      fieldName = "OTC Classification";
      break;

    case "formulation":
      fieldName = "Formulation";
      break;

    case "drugAdministrationRoute":
      fieldName = additionalCheck
        ? "Drug Administration Route*"
        : "Drug Administration Route";
      break;

    case "controlledSubstance":
      fieldName = "Controlled Substance";
      break;

    case "sideEffectsAndWarnings":
      fieldName = "Side Effects and Warnings";
      break;

    case "allergens":
      fieldName = "Allergens";
      break;

    // case "SkinHairCosmeticSupplies":
    case "spf":
      fieldName = "SPF";
      break;

    case "fragrance":
      fieldName = "Fragrance";
      break;

    case "elasticity":
      fieldName = "Elasticity";
      break;

    case "adhesiveness":
      fieldName = "Adhesiveness";
      break;

    case "thickness":
      fieldName = "Thickness";
      break;

    case "otcClassification":
      fieldName = "OTC Classification";
      break;

    case "formulation":
      fieldName = "Formulation";
      break;

    case "concentration":
      fieldName = "Concentration";
      break;

    case "moisturizers":
      fieldName = "Moisturizers";
      break;

    case "fillerType":
      fieldName = "Filler Type";
      break;

    case "vegan":
      fieldName = "Vegan";
      break;

    case "crueltyFree":
      fieldName = "Cruelty-Free";
      break;

    case "controlledSubstance":
      fieldName = "Controlled Substance";
      break;

    case "dermatologistTested":
      fieldName = additionalCheck
        ? "Dermatologist Tested*"
        : "Dermatologist Tested";
      break;

    case "dermatologistTestedFile":
      fieldName = "Dermatologist Tested File";
      break;

    case "pediatricianRecommended":
      fieldName = additionalCheck
        ? "Pediatrician Recommended*"
        : "Pediatrician Recommended";
      break;

    case "pediatricianRecommendedFile":
      fieldName = "Pediatrician Recommended File";
      break;

    case "sideEffectsAndWarnings":
      fieldName = "Side Effects and Warnings";
      break;

    case "allergens":
      fieldName = "Allergens";
      break;

    // case "VitalHealthAndWellness":
    case "controlledSubstance":
      fieldName = "Controlled Substance";
      break;

    case "sideEffectsAndWarnings":
      fieldName = "Side Effects and Warnings";
      break;

    case "allergens":
      fieldName = "Allergens";
      break;

    case "vegan":
      fieldName = "Vegan";
      break;

    case "crueltyFree":
      fieldName = "Cruelty-Free";
      break;

    case "additivesNSweeteners":
      fieldName = "Additives & Sweeteners";
      break;

    default:
      break;
  }
  return fieldName;
};

const validateFields = (checkValidation, value, fieldName, type) => {
  try {
    let errMsg;

    // Handle validation for "number" type
    if (type === "number") {
      if (isNaN(value)) {
        if (value == null || value === "" || value == 0) {
          errMsg = `Please enter a valid number for ${fieldName}.`;
        } else {
          errMsg = `Please enter a valid number for ${fieldName}.`;
        }
      } else {
        if (value == 0) {
          errMsg = `Please enter a valid number for ${fieldName}.`;
        }
      }
    }
    // Handle validation for "array" type
    else if (type === "object") {
      if (
        value?.length > 0 &&
        value?.some((val) => val == null || val === "")
      ) {
        errMsg = `Please enter valid values in ${fieldName}.`;
      }
    }
    // Handle generic validation for other types
    else {
      if (value == null || value === "") {
        errMsg = `Please enter a valid value for ${fieldName}.`;
      }
    }

    // If checkValidation is true, return the error message (or false if there's no error)
    if (checkValidation) {
      return errMsg || undefined;
    }

    return undefined; // Return false if validation isn't checked
  } catch (error) {
    console.error("Internal Server Error:", error);
    // Ensure logErrorToFile and sendErrorResponse functions are available if needed
    logErrorToFile(error, req); // Only if req is available
    return sendErrorResponse(
      res,
      500,
      "An unexpected error occurred. Please try again later.",
      error
    );
  }
};

const getCategoryName = (value) => {
  let catName;

  switch (value?.trim()) {
    case "Alternative Medicines":
      catName = "AlternativeMedicines";
      break;

    case "Dental Products":
      catName = "DentalProducts";
      break;

    case "Diagnostic and Monitoring Devices":
      catName = "DiagnosticAndMonitoringDevices";
      break;

    case "Disinfection and Hygiene Supplies":
      catName = "DisinfectionAndHygieneSupplies";
      break;

    case "Emergency and First Aid Supplies":
      catName = "EmergencyAndFirstAidSupplies";
      break;

    case "Eye Care Supplies":
      catName = "EyeCareSupplies";
      break;

    case "Healthcare IT Solutions":
      catName = "HealthcareITSolutions";
      break;

    case "Hospital and Clinic Supplies":
      catName = "HospitalAndClinicSupplies";
      break;

    case "Home Healthcare Products":
      catName = "HomeHealthcareProducts";
      break;

    case "Laboratory Supplies":
      catName = "LaboratorySupplies";
      break;

    case "Medical Consumables and Disposables":
      catName = "MedicalConsumablesAndDisposables";
      break;

    case "Medical Equipment and Devices":
      catName = "MedicalEquipmentAndDevices";
      break;

    case "Nutrition and Dietary Products":
      catName = "NutritionAndDietaryProducts";
      break;

    case "Orthopedic Supplies":
      catName = "OrthopedicSupplies";
      break;

    case "Pharmaceuticals":
      catName = "Pharmaceuticals";
      break;

    case "Skin, Hair and Cosmetic Supplies":
      catName = "SkinHairCosmeticSupplies";
      break;

    case "Vital Health and Wellness":
      catName = "VitalHealthAndWellness";
      break;

    default:
      break;
  }

  return catName;
};

const additionalCheckFieldName = (elemCat, key) => {
  // Check if the key is a direct property of the object
  if (
    (elemCat == "Medical Equipment and Devices" && key == "specification") ||
    (elemCat == "Pharmaceuticals" &&
      (key == "genericName" ||
        key == "strength" ||
        key == "composition" ||
        key == "drugClass")) ||
    (elemCat == "Skin, Hair and Cosmetic Supplies" &&
      (key == "purpose" ||
        key == "targetCondition" ||
        key == "composition" ||
        key == "drugAdministrationRoute" ||
        key == "dermatologistTested" ||
        key == "drugClass")) ||
    (elemCat == "Vital Health and Wellness" &&
      (key == "healthBenefit" ||
        key == "genericName" ||
        key == "strength" ||
        key == "composition" ||
        key == "drugAdministrationRoute" ||
        key == "drugClass")) ||
    (elemCat == "Diagnostic and Monitoring Devices" &&
      (key == "specification" || key == "diagnosticFunctions")) ||
    (elemCat == "Orthopedic Supplies" &&
      (key == "targetCondition" || key == "strength")) ||
    (elemCat == "Alternative Medicines" && key == "composition") ||
    (elemCat == "Emergency and First Aid Supplies" &&
      (key == "composition" ||
        key == "productLongevity" ||
        key == "foldability")) ||
    (elemCat == "Disinfection and Hygiene Supplies" && key == "composition") ||
    (elemCat == "Nutrition and Dietary Products" && key == "composition") ||
    (elemCat == "Healthcare IT Solutions" && key == "interoperability")
  ) {
    return true;
  }
  return false;
};

module.exports = {
  handleProductCategorySwitch,
  getFieldName,
  validateFields,
  getCategoryName,
  additionalCheckFieldName,
};
