require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const logErrorToFile = require("../logs/errorLogs");
const {
  sendErrorResponse,
  sendSuccessResponse,
} = require("../utils/commonResonse");
const Supplier = require("../schema/supplierSchema");
const Inventory = require("../schema/inventorySchema");
const Buyer = require("../schema/buyerSchema");
const Product = require("../schema/productSchema");
const { default: mongoose } = require("mongoose");
const csv = require("csv-parser");

module.exports = {
  getAllProducts: async (req, res) => {
    try {
      const { supplier_id, market, page_no = 1, page_size = 5 } = req?.query;

        const pageNo = parseInt(page_no) || 1;  
        const pageSize = parseInt(page_size) || 10;
        const offset    = (pageNo - 1) * pageSize;

      // Create the aggregation pipeline
      let pipeline = [];

      // Match documents where isDeleted is false
      pipeline.push({
        $match: {
          isDeleted: false, // Only products that are not deleted
        },
      });

      // Match documents based on the supplier_id query parameter
      if (supplier_id) {
        pipeline.push({
          $match: {
            supplier_id: mongoose.Types.ObjectId(supplier_id), // Ensure ObjectId type matching
          },
        });
      }

      // Match documents based on the market query parameter
      if (market) {
        pipeline.push({
          $match: {
            market: market,
          },
        });
      }

      
      // Lookup Supplier (userDetails) based on supplier_id in Product
      pipeline.push({
        $lookup: {
          from: "suppliers", // Ensure the collection name matches
          localField: "supplier_id", // Reference to supplier_id in the Product schema
          foreignField: "_id", // Reference to supplier_id in the Supplier schema
          as: "userDetails",
        },
      });

      // Lookup Inventory based on the inventory field in Product
      pipeline.push({
        $lookup: {
          from: "inventories", // Ensure the collection name matches
          localField: "inventory", // Reference to the inventory field in Product
          foreignField: "uuid", // Reference to uuid in Inventory schema
          as: "inventoryDetails",
        },
      });

      // Optionally unwind the results if you expect only one result for userDetails and inventoryDetails
      pipeline.push({
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true, // Keep products without matched user details
        },
      });

      pipeline.push({
        $unwind: {
          path: "$inventoryDetails",
          preserveNullAndEmptyArrays: true, // Keep products without matched inventory details
        },
      });

    // Get total count before applying pagination
    const totalProducts = await Product.countDocuments({ 
      isDeleted: false,
      ...(market ? { market: market } : {}) 
  });
  
    pipeline.push({ 
      $sort: { createdAt: -1 } 
  });

    // pagination
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: pageSize });

    // Execute the aggregation
    const products = await Product.aggregate(pipeline);
    const totalPages = Math.ceil(totalProducts / pageSize);

    return sendSuccessResponse(res, 200, "Success Fetching Products", {
        products,
        totalItems: totalProducts,
        currentPage: pageNo,
        itemsPerPage: pageSize,
        totalPages
    });
      
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(
        res,
        500,
        "An unexpected error occurred. Please try again later.",
        error
      );
    }
  },

  getProductDetails: async (req, res) => {
    try {
      const { id } = req?.params;

      // Check if id is a valid ObjectId
      if (!mongoose.isValidObjectId(id)) {
        return sendErrorResponse(res, 400, "Invalid product ID format.", null);
      }

      // Instantiate ObjectId with `new` keyword
      const productId = new mongoose.Types.ObjectId(id);

      // Create the aggregation pipeline
      let pipeline = [];

      // Match documents based on the query params
      if (productId) {
        pipeline.push({
          $match: {
            _id: productId, // Ensure ObjectId type matching
          },
        });
      }

      // Lookup Supplier (userDetails) based on supplier_id in Product
      pipeline.push({
        $lookup: {
          from: "suppliers", // Ensure the collection name matches
          localField: "supplier_id", // Reference to supplier_id in the Product schema
          foreignField: "_id", // Reference to supplier_id in the Supplier schema
          as: "userDetails",
        },
      });

      // Lookup Inventory based on the inventory field in Product
      pipeline.push({
        $lookup: {
          from: "inventories", // Ensure the collection name matches
          localField: "inventory", // Reference to the inventory field in Product
          foreignField: "uuid", // Reference to uuid in Inventory schema
          as: "inventoryDetails",
        },
      });

      // Optionally unwind the results if you expect only one result for userDetails and inventoryDetails
      pipeline.push({
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true, // Keep products without matched user details
        },
      });

      pipeline.push({
        $unwind: {
          path: "$inventoryDetails",
          preserveNullAndEmptyArrays: true, // Keep products without matched inventory details
        },
      });

      // Execute the aggregation
      const products = await Product.aggregate(pipeline);

      // Send the response with the products
      return sendSuccessResponse(
        res,
        200,
        "Success Fetching Product",
        products
      );
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(
        res,
        500,
        "An unexpected error occurred. Please try again later.",
        error
      );
    }
  },

  addProduct: async (req, res) => {
    try {
      // Helper function to retrieve file paths
      async function getFilePaths(uploadedFiles, fields, objeName) {
        const filePaths = {};
        for (const field of fields) {
          if (uploadedFiles[field] && uploadedFiles[field].length > 0) {
            const validPaths = uploadedFiles[field]
              .map((file) => file.filename) // Map to file paths
              .filter((path) => path && path.trim() !== ""); // Filter out empty strings

            filePaths[field] = validPaths.length > 0 ? validPaths : []; // Use valid paths or empty array
          } else {
            filePaths[field] = []; // Assign empty array if no files are present
          }
        }
        return filePaths;
      }

      const { category, market = "new" } = req?.body;

      console.log("req?.body", req?.files);

      // Define file fields for each category
      const fileFields = {
        MedicalEquipmentAndDevices: [
          "specificationFile",
          "performanceTestingReportFile",
        ],
        Pharmaceuticals: [], // Added Pharmaceuticals category with relevant fields
        SkinHairCosmeticSupplies: [
          "dermatologistTestedFile",
          "pediatricianRecommendedFile",
        ],
        VitalHealthAndWellness: [],
        MedicalConsumablesAndDisposables: [],
        LaboratorySupplies: [],
        DiagnosticAndMonitoringDevices: [
          "specificationFile",
          "performanceTestingReportFile",
        ],
        HospitalAndClinicSupplies: [],
        OrthopedicSupplies: [],
        DentalProducts: [],
        EyeCareSupplies: [],
        HomeHealthcareProducts:
          ["performanceTestingReportFile"]?.toString()?.trim() || "",
        AlternativeMedicines: ["healthClaimsFile"]?.toString()?.trim() || "",
        EmergencyAndFirstAidSupplies: [],
        DisinfectionAndHygieneSupplies: [],
        NutritionAndDietaryProducts: [],
        HealthcareITSolutions:
          ["interoperabilityFile"]?.toString()?.trim() || "",
      };

      // Check if the category exists in the fileFields object
      if (!fileFields[category]) {
        return sendErrorResponse(res, 400, "Invalid category specified.");
      }

      // Retrieve file paths for general, inventory, compliance, and additional fields
      const generalFiles = await getFilePaths(req?.files, ["image"]);
      // const inventoryFiles = { countries: JSON.parse(req?.body?.countries) };
      const inventoryFiles = [...req?.body?.countries];
      const complianceFiles = await getFilePaths(req?.files, [
        "complianceFile",
      ]);
      const additionalFiles = await getFilePaths(req?.files, [
        "guidelinesFile",
      ]);
      const secondaryMarketFiles = await getFilePaths(req?.files, [
        "performaInvoiceFile",
      ]);
      const healthNSafetyFiles = await getFilePaths(req?.files, [
        "safetyDatasheet",
        "healthHazardRating",
        "environmentalImpact",
      ]);

      // Retrieve file paths for the selected category only
      const categoryFiles = await getFilePaths(
        req?.files,
        fileFields[category]
      );

      const inventoryUUId = uuidv4();
      const medicine_id = "PRDT-" + Math.random().toString(16).slice(2, 10);

      // Create new product with all necessary fields
      const newProductData = {
        ...req?.body,
        medicine_id,
        general: {
          ...req?.body,
          ...(generalFiles || []),
        },
        inventory: inventoryUUId,
        // inventory: {
        //   ...req?.body,
        //   ...(inventoryFiles || []),
        // },
        complianceFile: complianceFiles.complianceFile,
        additional: {
          ...req?.body,
          ...(additionalFiles || []),
        },
        healthNSafety: {
          ...(healthNSafetyFiles || []),
        },
        [category]: {
          ...req?.body,
          ...(categoryFiles || []),
        }, // Only include the selected category
        market,
        idDeleted: false,
      };

      if (market == "secondary") {
        newProductData["secondayMarketDetails"] = {
          ...req?.body,
          ...(secondaryMarketFiles || []),
        };
      }

      // Create the new product
      const newProduct = await Product.create(newProductData);

      if (!newProduct) {
        return sendErrorResponse(res, 400, "Failed to create new product.");
      }

      const newInventoryDetails = {
        uuid: inventoryUUId,
        productId: newProduct?.medicine_id,
        ...req?.body,
        stockedInDetails: JSON.parse(
          req?.body?.stockedInDetails?.filter(
            (value) => value != "[object Object]"
          )
        ),
        inventoryList: JSON.parse(
          req?.body?.productPricingDetails?.filter(
            (value) => value != "[object Object]"
          )
        ),
        ...(inventoryFiles || []),
      };

      const newInventory = await Inventory.create(newInventoryDetails);

      if (!newInventory) {
        return sendErrorResponse(res, 400, "Failed to create new Inventory.");
      }

      return sendSuccessResponse(res, 200, "Success", newProduct);
    } catch (error) {
      console.error("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(
        res,
        500,
        "An unexpected error occurred. Please try again later.",
        error
      );
    }
  },

  addBulkProducts: async (req, res) => {
    try {
      const { supplier_id } = req?.body;
      const filePath = req.file.path;
      // Utility function to parse CSV
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

      // Parse the CSV file
      const results = await parseCSV(filePath);
      console.log('results',results)
      // Check if the product exists
      const existingSupplier = await Supplier.findById(supplier_id);
      if (!existingSupplier) {
        return sendErrorResponse(res, 404, "Supplier not found.");
      }

      console.log("results", results);
      const inventoryArray = [];

      const updatedResult = results?.map((result) => {
        const productId = "PRDT-" + Math.random().toString(16).slice(2, 10);
        const inventoryUUId = uuidv4();

        inventoryArray.push({
          uuid: inventoryUUId,
          productId,
          sku: result?.["SKU"]?.toString()?.trim() || "",
          stock: result?.["Stock*"]?.toString()?.trim() || "",
          // stockQuantity: Number(result?.["Stock Quantity"]) || 0,
          countries:
            result?.["Countries where Stock Trades"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim()) || [],
          date: result?.["Date of Manufacture"]?.toString()?.trim() || "",
        });
        let updatedObject = {
          general: {
            name: result?.["Product Name*"]?.toString()?.trim() || "",
            description:
              result?.["Product Description*"]?.toString()?.trim() || "",
            manufacturer: result?.["Manufacturer*"]?.toString()?.trim() || "",
            aboutManufacturer: result?.["About Manufacturer*"]?.toString()?.trim() || "",
            countryOfOrigin:
              result?.["Country of origin*"]?.toString()?.trim() || "",
            upc: result?.["UPC"]?.toString()?.trim() || "",
            model: result?.["Part/Model Number*"]?.toString()?.trim() || "",
            image:
              result?.["Product Image"]
                ?.split(",")
                ?.map((ele) => ele?.toString()?.trim()) || [],
            brand: result?.["Brand Name"]?.toString()?.trim() || "",
            form: result?.["Type / Form*"]?.toString()?.trim() || "",
            quantity: Number(result?.["Product Quantity*"]) || 0,
            volumn:
              result?.["Product Size / Volumn*"]?.toString()?.trim() || "",
            weight: Number(result?.["Product Weight*"]) || 0,
            unit: result?.["Unit*"]?.toString()?.trim() || "",
            packageType:
              result?.["Product Packaging Type*"]?.toString()?.trim() || "",
            packageMaterial:
              result?.["Product Packaging Material*"]?.toString()?.trim() || "",
            packageMaterialIfOther:
              result["Product Packaging Material Name (if Other)"]
                ?.toString()
                ?.trim() || "",
            // costPerProduct:
            //   result?.["Cost Per Product"]?.toString()?.trim() || "",
          },
          inventory: inventoryUUId,
          complianeFile:
            result?.["Regulatory Compliance"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim()) || [],
          storage: result?.["Storage Conditions"]?.toString()?.trim() || "",
          additional: {
            other: result?.["Other Information"]?.toString()?.trim() || "",
            guidelinesFile:
              result?.["User Guidelines"]
                ?.split(",")
                ?.map((ele) => ele?.toString()?.trim()) || [],
            warranty: result?.["Warranty"]?.toString()?.trim() || "",
          },
          healthNSafety: {
            safetyDatasheet:
              result?.["Safety Datasheet"]
                ?.split(",")
                ?.map((ele) => ele?.toString()?.trim()) || [],
            healthHazardRating:
              result?.["Health Hazard Rating"]
                ?.split(",")
                ?.map((ele) => ele?.toString()?.trim()) || [],
            environmentalImpact:
              result?.["Environmental Impact"]
                ?.split(",")
                ?.map((ele) => ele?.toString()?.trim()) || [],
          },
          category: result?.["Product Category*"]?.trim()?.replaceAll(" ", ""),
          medicine_id: productId,
          supplier_id,
          market: result?.["Product Market*"] || "new",
          isDeleted: false,
          bulkUpload: true,
        };

        if (result?.["Product Market*"] == "secondary") {
          updatedObject["secondayMarketDetails"] = {
            purchasedOn: result?.["Purchased On"]?.toString()?.trim() || "",
            countryAvailable:
              (result?.["Country Available "] || result?.["Country Available"])
                ?.split(",")
                ?.map((ele) => ele?.toString()?.trim()) || [],
            condition: result?.["Product Condition"]?.toString()?.trim() || "",
            minimumPurchaseUnit:
              result?.["Minimum Purchase Unit"]?.toString()?.trim() || "",
            performaInvoiceFile:
              result?.["Performa Invoice File*"]
                ?.split(",")
                ?.map((ele) => ele?.toString()?.trim()) || [],
          };
        }

        switch (result?.["Product Category*"]?.trim()?.replaceAll(" ", "")) {
          case 'MedicalEquipmentAndDevices':
            updatedObject["MedicalEquipmentAndDevices"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              specification:
                result?.["Specification"]?.toString()?.trim() || "",
              specificationFile:
                result?.["Specification File"]?.toString()?.trim() || "",
              diagnosticFunctions:
                result?.["Diagnostic Functions"]?.toString()?.trim() || "",
              interoperability:
                result?.["Interoperability"]?.toString()?.trim() || "",
              laserType: result?.["Laser Type"]?.toString()?.trim() || "",
              coolingSystem:
                result?.["Cooling System"]?.toString()?.trim() || "",
              spotSize: result?.["Spot Size"]?.toString()?.trim() || "",
              performanceTestingReport:
                result?.["Performance Testing Report"]?.toString()?.trim() ||
                "",
              performanceTestingReportFile:
                result?.["Performance Testing Report File"]
                  ?.split(",")
                  ?.map((ele) => ele?.toString()?.trim()) || [],
            };
            break;

          case 'Pharmaceuticals':
            updatedObject["Pharmaceuticals"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              genericName: result?.["Generic Name*"]?.toString()?.trim() || "",
              strength: result?.["Strength*"]?.toString()?.trim() || "",
              composition:
                result?.["Composition / Ingredients*"]?.toString()?.trim() ||
                "",
              formulation: result?.["Formulation"]?.toString()?.trim() || "",
              purpose: result?.["Purpose"]?.toString()?.trim() || "",
              drugAdministrationRoute:
                result?.["Drug Administration Route*"]?.toString()?.trim() ||
                "",
              drugClass: result?.["Drug Class*"]?.toString()?.trim() || "",
              controlledSubstance:
                result?.["Controlled Substance"] === "true" || false,
              otcClassification:
                result?.["OTC Classification"]?.toString()?.trim() || "",
              expiry:
                result?.["Shelf Life / Expiry*"]?.toString()?.trim() || "",
              sideEffectsAndWarnings:
                result?.["Side Effects and Warnings"]?.toString()?.trim() || "",
              allergens: result?.["Allergens"]?.toString()?.trim() || "",
            };
            break;

          case 'SkinHairCosmeticSupplies':
            updatedObject["SkinHairCosmeticSupplies"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              fragrance: result?.["Fragrance"]?.toString()?.trim() || "",
              spf: result?.["SPF"]?.toString()?.trim() || "",
              vegan: result?.["Vegan"] === "true" || false,
              crueltyFree: result?.["Cruelty-Free"] === "true" || false,
              formulation: result?.["Formulation"]?.toString()?.trim() || "",
              strength: result?.["Strength"]?.toString()?.trim() || "",
              composition:
                result?.["Composition / Ingredients*"]?.toString()?.trim() ||
                "",
              purpose: result?.["Purpose*"]?.toString()?.trim() || "",
              targetCondition:
                result?.["Target Condition*"]?.toString()?.trim() || "",
              drugAdministrationRoute:
                result?.["Drug Administration Route*"]?.toString()?.trim() ||
                "",
              drugClass: result?.["Drug Class*"]?.toString()?.trim() || "",
              controlledSubstance:
                result?.["Controlled Substance"] === "true" || false,
              otcClassification:
                result?.["OTC Classification"]?.toString()?.trim() || "",
              expiry:
                result?.["Shelf Life / Expiry*"]?.toString()?.trim() || "",
              sideEffectsAndWarnings:
                result?.["Side Effects and Warnings"]?.toString()?.trim() || "",
              allergens: result?.["Allergens"]?.toString()?.trim() || "",
              dermatologistTested:
                result?.["Dermatologist Tested*"]?.toString()?.trim() || "",
              dermatologistTestedFile:
                result?.["Dermatologist Tested File"]
                  ?.split(",")
                  ?.map((ele) => ele?.toString()?.trim()) || [],
              pediatricianRecommended:
                result?.["Pediatrician Recommended*"]?.toString()?.trim() || "",
              pediatricianRecommendedFile:
                result?.["Pediatrician Recommended File"]
                  ?.split(",")
                  ?.map((ele) => ele?.toString()?.trim()) || [],
              elasticity: result?.["Elasticity"]?.toString()?.trim() || "",
              adhesiveness: result?.["Adhesiveness"]?.toString()?.trim() || "",
              thickness: result?.["Thickness"]?.toString()?.trim() || "",
              concentration:
                result?.["Concentration"]?.toString()?.trim() || "",
              purpose: result?.["Purpose"]?.toString()?.trim() || "",
              moisturizers: result?.["Moisturizers"]?.toString()?.trim() || "",
              fillerType: result?.["Filler Type"]?.toString()?.trim() || "",
            };
            break;

          case 'VitalHealthAndWellness':
            updatedObject["VitalHealthAndWellness"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              healthBenefit:
                result?.["Health Benefit*"]?.toString()?.trim() || "",
              genericName: result?.["Generic Name*"]?.toString()?.trim() || "",
              strength: result?.["Strength*"]?.toString()?.trim() || "",
              composition:
                result?.["Composition / Ingredients*"]?.toString()?.trim() ||
                "",
              formulation: result?.["Formulation"]?.toString()?.trim() || "",
              purpose: result?.["Purpose"]?.toString()?.trim() || "",
              drugAdministrationRoute:
                result?.["Drug Administration Route*"]?.toString()?.trim() ||
                "",
              drugClass: result?.["Drug Class*"]?.toString()?.trim() || "",
              controlledSubstance:
                result?.["Controlled Substance"] === "true" || false,
              otcClassification:
                result?.["OTC Classification"]?.toString()?.trim() || "",
              expiry:
                result?.["Shelf Life / Expiry*"]?.toString()?.trim() || "",
              sideEffectsAndWarnings:
                result?.["Side Effects and Warnings"]?.toString()?.trim() || "",
              allergens: result?.["Allergens"]?.toString()?.trim() || "",
              vegan: result?.["Vegan"] === "true" || false,
              crueltyFree: result?.["Cruelty-Free"] === "true" || false,
              additivesNSweeteners:
                result?.["Additives & Sweeteners"]?.toString()?.trim() || "",
            };
            break;

          case 'MedicalConsumablesAndDisposables':
            updatedObject["MedicalConsumablesAndDisposables"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              thickness: result?.["Thickness"]?.toString()?.trim() || "",
              powdered: result?.["Powdered"] === "true" || false,
              productMaterial:
                result?.["Product Material"]?.toString()?.trim() || "",
              purpose: result?.["Purpose"]?.toString()?.trim() || "",
              expiry:
                result?.["Shelf Life / Expiry*"]?.toString()?.trim() || "",
              texture: result?.["Texture"] === "true" || false,
              sterilized: result?.["Sterilized"] === "true" || false,
              chemicalResistance:
                result?.["Chemical Resistance"]?.toString()?.trim() || "",
              allergens: result?.["Allergens"]?.toString()?.trim() || "",
              filtrationEfficiency:
                result?.["Filtration Efficiency"]?.toString()?.trim() || "",
              breathability:
                result?.["Breathability"]?.toString()?.trim() || "",
              layerCount: result?.["Layer Count"]?.toString()?.trim() || "",
              fluidResistance: result?.["Fluid Resistance"] === "true" || false,
              filtrationType:
                result?.["Filtration Type"]
                  ?.split(",")
                  ?.map((ele) => ele?.toString()?.trim()) || [],
              shape: result?.[""]?.toString()?.trim() || "",
              coating: result?.[""]?.toString()?.trim() || "",
            };
            break;

          case 'LaboratorySupplies':
            updatedObject["LaboratorySupplies"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              magnificationRange:
                result?.["Magnification Range"]?.toString()?.trim() || "",
              objectiveLenses:
                result?.["Objective Lenses"]?.toString()?.trim() || "",
              powerSource: result?.["Power Source"]?.toString()?.trim() || "",
              resolution: result?.["Resolution"]?.toString()?.trim() || "",
              connectivity: result?.["Connectivity"]?.toString()?.trim() || "",
              shape: result?.["Shape"]?.toString()?.trim() || "",
              coating: result?.["Coating"]?.toString()?.trim() || "",
              purpose: result?.["Purpose"]?.toString()?.trim() || "",
              casNumber: result?.["CAS Number"]?.toString()?.trim() || "",
              grade: result?.["Grade"]?.toString()?.trim() || "",
              concentration:
                result?.["Concentration"]?.toString()?.trim() || "",
              physicalState:
                result?.["Physical State"]
                  ?.split(",")
                  ?.map((ele) => ele?.toString()?.trim()) || [],
              hazardClassification:
                result?.["Hazard Classification"]
                  ?.split(",")
                  ?.map((ele) => ele?.toString()?.trim()) || [],
            };
            break;

          case 'DiagnosticAndMonitoringDevices':
            updatedObject["DiagnosticAndMonitoringDevices"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              specification:
                result?.["Specification*"]?.toString()?.trim() || "",
              specificationFile:
                result?.["Specification File*"]
                  ?.split(",")
                  ?.map((ele) => ele?.toString()?.trim()) || [],
              diagnosticFunctions:
                result?.["Diagnostic Functions*"]?.toString()?.trim() || "",
              measurementRange:
                result?.["Measurement Range"]?.toString()?.trim() || "",
              flowRate: result?.["Flow Rate"]?.toString()?.trim() || "",
              concentration:
                result?.["Concentration"]?.toString()?.trim() || "",
              noiseLevel: result?.["Noise Level"]?.toString()?.trim() || "",
              maintenanceNotes:
                result?.["Maintenance Notes"]?.toString()?.trim() || "",
              compatibleEquipment:
                result?.["Compatible Equipment"]?.toString()?.trim() || "",
              usageRate: result?.["Usage Rate"]?.toString()?.trim() || "",
              performanceTestingReport:
                result?.["Performance Testing Report"]?.toString()?.trim() ||
                "",
              performanceTestingReportFile:
                result?.["Performance Testing Report File"]
                  ?.split(",")
                  ?.map((ele) => ele?.toString()?.trim()) || [],
            };
            break;

          case 'HospitalAndClinicSupplies':
            updatedObject["HospitalAndClinicSupplies"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              adhesiveness: result?.["Adhesiveness"]?.toString()?.trim() || "",
              absorbency: result?.["Absorbency"]?.toString()?.trim() || "",
              thickness: result?.["Thickness"]?.toString()?.trim() || "",
              powdered: result?.["Powdered"] === "true" || false,
              productMaterial:
                result?.["Product Material"]?.toString()?.trim() || "",
              purpose: result?.["Purpose"]?.toString()?.trim() || "",
              expiry:
                result?.["Shelf Life / Expiry*"]?.toString()?.trim() || "",
              texture: result?.["Texture"] === "true" || false,
              sterilized: result?.["Sterilized"] === "true" || false,
              chemicalResistance:
                result?.["Chemical Resistance"]?.toString()?.trim() || "",
              fluidResistance: result?.["Fluid Resistance"] === "true" || false,
              elasticity: result?.["Elasticity"]?.toString()?.trim() || "",
            };
            break;

          case 'OrthopedicSupplies':
            updatedObject["OrthopedicSupplies"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              breathability:
                result?.["Breathability"]?.toString()?.trim() || "",
              colorOptions: result?.["Color Options"]?.toString()?.trim() || "",
              elasticity: result?.["Elasticity"]?.toString()?.trim() || "",
              sterilized: result?.["Sterilized"] === "true" || false,
              absorbency: result?.["Absorbency"]?.toString()?.trim() || "",
              purpose: result?.["Purpose"]?.toString()?.trim() || "",
              targetCondition:
                result?.["Target Condition*"]?.toString()?.trim() || "",
              coating: result?.["Coating"]?.toString()?.trim() || "",
              strength: result?.["Strength*"]?.toString()?.trim() || "",
              moistureResistance:
                result?.["Moisture Resistance"]?.toString()?.trim() || "",
            };
            break;

          case 'DentalProducts':
            updatedObject["DentalProducts"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              productMaterial:
                result?.["Product Material"]?.toString()?.trim() || "",
              purpose: result?.["Purpose"]?.toString()?.trim() || "",
              targetCondition:
                result?.["Target Condition"]?.toString()?.trim() || "",
              maintenanceNotes:
                result?.["Maintenance Notes"]?.toString()?.trim() || "",
              compatibleEquipment:
                result?.["Compatible Equipment"]?.toString()?.trim() || "",
              usageRate: result?.["Usage Rate"]?.toString()?.trim() || "",
              expiry:
                result?.["Shelf Life / Expiry*"]?.toString()?.trim() || "",
            };
            break;

          case 'EyeCareSupplies':
            updatedObject["EyeCareSupplies"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              lensPower: result?.["Lens Power"]?.toString()?.trim() || "",
              baseCurve: result?.["Base Curve"]?.toString()?.trim() || "",
              diameter: result?.["Diameter"]?.toString()?.trim() || "",
              frame: result?.["Frame"]?.toString()?.trim() || "",
              lens: result?.["Lens"]?.toString()?.trim() || "",
              lensMaterial: result?.["Lens Material"]?.toString()?.trim() || "",
              colorOptions: result?.["Color Options"]?.toString()?.trim() || "",
            };
            break;

          case 'HomeHealthcareProducts':
            updatedObject["HomeHealthcareProducts"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              colorOptions: result?.["Color Options"]?.toString()?.trim() || "",
              maxWeightCapacity:
                result?.["Max Weight Capacity"]?.toString()?.trim() || "",
              gripType: result?.["Grip Type"]?.toString()?.trim() || "",
              foldability: result?.["Foldability"]?.toString()?.trim() || "",
              lockingMechanism:
                result?.["Locking Mechanism"]?.toString()?.trim() || "",
              typeOfSupport:
                result?.["Type of Support"]?.toString()?.trim() || "",
              flowRate: result?.["Flow Rate"]?.toString()?.trim() || "",
              concentration:
                result?.["Concentration"]?.toString()?.trim() || "",
              batteryType: result?.["Battery Type"]?.toString()?.trim() || "",
              batterySize: result?.["Battery Size"]?.toString()?.trim() || "",
              performanceTestingReport:
                result?.["Performance Testing Report"]?.toString()?.trim() ||
                "",
              performanceTestingReportFile:
                result?.["Performance Testing Report File"]
                  ?.split(",")
                  ?.map((ele) => ele?.toString()?.trim()) || [],
              expiry:
                result?.["Shelf Life / Expiry*"]?.toString()?.trim() || "",
            };
            break;

          case 'AlternativeMedicines':
            updatedObject["AlternativeMedicines"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              expiry:
                result?.["Shelf Life / Expiry*"]?.toString()?.trim() || "",
              healthClaims: result?.["Health Claims"]?.toString()?.trim() || "",
              healthClaimsFile:
                result?.["Health Claims File"]
                  ?.split(",")
                  ?.map((ele) => ele?.toString()?.trim()) || [],
              purpose: result?.["Purpose"]?.toString()?.trim() || "",
              composition:
                result?.["Composition / Ingredients*"]?.toString()?.trim() ||
                "",
            };
            break;

          case 'EmergencyAndFirstAidSupplies':
            updatedObject["EmergencyAndFirstAidSupplies"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              expiry:
                result?.["Shelf Life / Expiry*"]?.toString()?.trim() || "",
              composition:
                result?.["Composition / Ingredients*"]?.toString()?.trim() ||
                "",
              productLongevity:
                result?.["Product Longevity*"]?.toString()?.trim() || "",
              foldability: result?.["Foldability*"]?.toString()?.trim() || "",
            };
            break;

          case 'DisinfectionAndHygieneSupplies':
            updatedObject["DisinfectionAndHygieneSupplies"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              composition:
                result?.["Composition / Ingredients*"]?.toString()?.trim() ||
                "",
              concentration:
                result?.["Concentration"]?.toString()?.trim() || "",
              formulation: result?.["Formulation"]?.toString()?.trim() || "",
              expiry:
                result?.["Shelf Life / Expiry*"]?.toString()?.trim() || "",
              fragrance: result?.["Fragrance"]?.toString()?.trim() || "",
            };
            break;

          case 'NutritionAndDietaryProducts':
            updatedObject["NutritionAndDietaryProducts"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              flavorOptions:
                result?.["Flavor Options*"]?.toString()?.trim() || "",
              aminoAcidProfile:
                result?.["Amino Acid Profile*"]?.toString()?.trim() || "",
              fatContent: result?.["Fat Content*"]?.toString()?.trim() || "",
              expiry:
                result?.["Shelf Life / Expiry*"]?.toString()?.trim() || "",
              vegan: result?.["Vegan"] === "true" || false,
              purpose: result?.["Purpose"]?.toString()?.trim() || "",
              healthBenefit:
                result?.["Health Benefit*"]?.toString()?.trim() || "",
              composition:
                result?.["Composition / Ingredients*"]?.toString()?.trim() ||
                "",
              additivesNSweeteners:
                result?.["Additives & Sweeteners*"]?.toString()?.trim() || "",
              dairyFree: result?.["Dairy Free*"]?.toString()?.trim() || "",
            };
            break;

          case 'HealthcareITSolutions':
            updatedObject["HealthcareITSolutions"] = {
              subCategory:
                result?.["Product Sub Category*"]?.toString()?.trim() || "",
              anotherCategory:
                result?.["Product 3rd Sub Category"]?.toString()?.trim() || "",
              license: result?.["License*"]?.toString()?.trim() || "",
              scalabilityInfo:
                result?.["Scalability Info*"]?.toString()?.trim() || "",
              addOns: result?.["Add-Ons*"]?.toString()?.trim() || "",
              interoperability:
                result?.["Interoperability*"]?.toString()?.trim() || "",
              interoperabilityFile:
                result?.["Interoperability File*"]
                  ?.split(",")
                  ?.map((ele) => ele?.toString()?.trim()) || [],
              userAccess: result?.["User Access*"]?.toString()?.trim() || "",
              keyFeatures: result?.["Key Features*"]?.toString()?.trim() || "",
              coreFunctionalities:
                result?.["Core Functionalities*"]?.toString()?.trim() || "",
            };
            break;

          default:
            break;
        }

        return updatedObject;
      });

      // Insert multiple records into MongoDB
      const entries = await Product.insertMany(updatedResult);
      console.log("updatedResult", updatedResult);

      if (!entries || entries?.length == 0) {
        return sendErrorResponse(res, 400, "Failed to add bulk products.");
      }

      if (inventoryArray?.length > 0) {
        const inventories = await Inventory.insertMany(inventoryArray);
        console.log("updatedResult", updatedResult);

        if (!inventories || inventories?.length == 0) {
          return sendErrorResponse(res, 400, "Failed to add bulk inventories.");
        }
      }

      // Remove the CSV file after processing
      fs.unlinkSync(filePath);

      res
        .status(200)
        .json({ message: "Data successfully uploaded", data: entries });
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(
        res,
        500,
        "An unexpected error occurred. Please try again later.",
        error
      );
    }
  },

  editProduct: async (req, res) => {
    try {
      const { category, market = "new" } = req?.body;
      const { productId } = req?.params;

      // Check if the product exists
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return sendErrorResponse(res, 404, "Product not found.");
      }

      // Helper function to retrieve file paths
      async function getFilePaths(uploadedFiles, fields) {
        const filePaths = {};
        for (const field of fields) {
          const validPaths = (
            req?.body[field]?.replaceAll("New","")
              ? JSON.parse(req?.body[field]?.replaceAll("New","")) // Replace single backslashes with double backslashes
              : []
          )?.concat(req?.files[field]?.map((file) => file.filename));
          filePaths[field] =
            validPaths?.length > 0
              ? validPaths?.filter((filename) => filename != undefined)
              : [];
        }
        return filePaths;
      }

      // Define file fields for each category (same as addProduct)
      const fileFields = {
        MedicalEquipmentAndDevices: [
          "specificationFileNew",
          "performanceTestingReportFileNew",
        ],
        Pharmaceuticals: [],
        SkinHairCosmeticSupplies: [
          "dermatologistTestedFileNew",
          "pediatricianRecommendedFileNew",
        ],
        VitalHealthAndWellness: [],
        MedicalConsumablesAndDisposables: [],
        LaboratorySupplies: [],
        DiagnosticAndMonitoringDevices: [
          "specificationFileNew",
          "performanceTestingReportFileNew",
        ],
        HospitalAndClinicSupplies: [],
        OrthopedicSupplies: [],
        DentalProducts: [],
        EyeCareSupplies: [],
        HomeHealthcareProducts:
          ["performanceTestingReportFileNew"]?.toString()?.trim() || "",
        AlternativeMedicines: ["healthClaimsFileNew"]?.toString()?.trim() || "",
        EmergencyAndFirstAidSupplies: [],
        DisinfectionAndHygieneSupplies: [],
        NutritionAndDietaryProducts: [],
        HealthcareITSolutions:
          ["interoperabilityFileNew"]?.toString()?.trim() || "",
      };

      // Check if the category exists in the fileFields object
      if (!fileFields[category]) {
        return sendErrorResponse(res, 400, "Invalid category specified.");
      }

      // Retrieve file paths for general, inventory, compliance, and additional fields
      const generalFiles = await getFilePaths(req?.files, ["imageNew"]);
      // const inventoryFiles = { countries: JSON.parse(req?.body?.countries) };
      const inventoryFiles = [...req?.body?.countries];
      const complianceFiles = await getFilePaths(req?.files, [
        "complianceFileNew",
      ]);
      const additionalFiles = await getFilePaths(req?.files, [
        "guidelinesFileNew",
      ]);
      const secondaryMarketFiles = await getFilePaths(req?.files, [
        "performaInvoiceFileNew",
      ]);
      const healthNSafetyFiles = await getFilePaths(req?.files, [
        "safetyDatasheetNew",
        "healthHazardRatingNew",
        "environmentalImpactNew",
      ]);

      // Retrieve file paths for the selected category only
      const categoryFiles = await getFilePaths(
        req?.files,
        fileFields[category]
      );

      console.log("\nfilePaths", complianceFiles.complianceFile);

      // Update existing product data
      const updatedProductData = {
        ...existingProduct._doc, // Use the existing product data
        ...req?.body, // Overwrite with new data from request body
        general: {
          ...req?.body,
          ...(generalFiles || []),
        },
        // inventory: existingProduct?.inventory,
        // inventory: {
        //   ...req?.body,
        //   ...(inventoryFiles || []),
        // },
        complianceFile:
          complianceFiles.complianceFile ||
          existingProduct.complianceFile ||
          [],
        additional: {
          ...req?.body,
          ...(additionalFiles || []),
        },
        healthNSafety: {
          ...req?.body,
          ...(healthNSafetyFiles || []),
        },
        [category]: {
          // ...existingProduct[category],
          // ...categoryFiles || [],
          // ...req?.body,
          ...req?.body,
          ...(categoryFiles || []),
        }, // Update category-specific fields
      };

      if (market == "secondary") {
        updatedProduct["secondayMarketDetails"] = {
          ...req?.body,
          ...(secondaryMarketFiles || []),
        };
      }

      // Update the product in the database
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updatedProductData,
        { new: true }
      );

      if (!updatedProduct) {
        return sendErrorResponse(res, 400, "Failed to update the product.");
      }

      const updatedInventoryData = {
        ...req?.body,
        stockedInDetails: JSON.parse(
          req?.body?.stockedInDetails?.filter(
            (value) => value != "[object Object]"
          )
        ),
        inventoryList: JSON.parse(
          req?.body?.productPricingDetails?.filter(
            (value) => value != "[object Object]"
          )
        ),
        ...(inventoryFiles || []),
      };

      // Update the inventory in the database
      const updatedInventory = await Product.findOneAndUpdate(
        { uuid: existingProduct?.inventory },
        updatedInventoryData,
        { new: true }
      );

      if (!updatedInventory) {
        return sendErrorResponse(res, 400, "Failed to update the inventory.");
      }

      return sendSuccessResponse(
        res,
        200,
        "Product updated successfully",
        updatedProduct
      );
    } catch (error) {
      console.error("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(
        res,
        500,
        "An unexpected error occurred. Please try again later.",
        error
      );
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const { id } = req?.params;
      const foundProduct = await Product?.findById(id);
      if (!foundProduct) {
        return sendErrorResponse(res, 500, "Failed fetching Product");
      }

      const uuid = foundProduct?.inventory;
      const inventoryFound = await Inventory?.findOne({
        uuid,
      });
      if (!inventoryFound) {
        return sendErrorResponse(res, 500, "Failed fetching Inventory");
      }

      const softDeletedProduct = await Product?.findByIdAndUpdate(
        id,
        {
          $set: {
            isDeleted: true,
          },
        },
        { new: true }
      );
      if (!softDeletedProduct) {
        return sendErrorResponse(res, 500, "Failed Soft Deleting Product");
      }

      const softDeletedInventory = await Inventory?.findByIdAndUpdate(
        id,
        {
          $set: {
            isDeleted: true,
          },
        },
        { new: true }
      );
      if (!softDeletedInventory) {
        return sendErrorResponse(res, 500, "Failed Soft Deleting Inventory");
      }

      return sendSuccessResponse(res, 200, "Success Soft Deleting Product");
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(
        res,
        500,
        "An unexpected error occurred. Please try again later.",
        error
      );
    }
  },
};
