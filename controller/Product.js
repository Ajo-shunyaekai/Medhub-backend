require("dotenv").config();
const logErrorToFile = require("../logs/errorLogs");
const {
  sendErrorResponse,
  sendSuccessResponse,
} = require("../utils/commonResonse");
const Supplier = require("../schema/supplierSchema");
const Buyer = require("../schema/buyerSchema");
const Product = require("../schema/productSchema");
const { default: mongoose } = require("mongoose");

module.exports = {
  getAllProducts: async (req, res) => {
    try {
      const { userId, market } = req?.query;

      // Create the aggregation pipeline
      let pipeline = [];

      // Match documents where isDeleted is false
      pipeline.push({
        $match: {
          isDeleted: false, // Only products that are not deleted
        },
      });

      // Match documents based on the userId query parameter
      if (userId) {
        pipeline.push({
          $match: {
            userId: mongoose.Types.ObjectId(userId), // Ensure ObjectId type matching
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

      // Add lookup for Buyer or Supplier schema based on userSchemaReference
      pipeline.push({
        $lookup: {
          from: "Supplier",
          localField: "userId", // Reference field in the Product schema
          foreignField: "_id", // Reference field in Supplier/Buyer schema
          as: "userDetails", // Alias for the joined data
        },
      });

      // Optionally, add a stage to unwind the lookup result if you expect only a single match
      pipeline.push({
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true, // Keep products without matched user details
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

  getProductDetails: async (req, res) => {
    try {
      const { id } = req?.params;

      // Check if id is a valid ObjectId
      if (!mongoose.isValidObjectId(id)) {
        return sendErrorResponse(res, 400, "Invalid product ID format.", null);
      }

      // Instantiate ObjectId with `new` keyword
      const productId = new mongoose.Types.ObjectId(id); // Explicitly using `new` keyword

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

      // Add lookup for Buyer or Supplier schema based on userSchemaReference
      pipeline.push({
        $lookup: {
          from: "Supplier", // Specify the collection name directly
          localField: "userId", // Reference field in the Product schema
          foreignField: "_id", // Reference field in Supplier/Buyer schema
          as: "userDetails", // Alias for the joined data
        },
      });

      // Optionally, add a stage to unwind the lookup result if you expect only a single match
      pipeline.push({
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true, // Keep products without matched user details
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

      const { category } = req?.body;

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
        HomeHealthcareProducts: ["performanceTestingReportFile"],
        AlternativeMedicines: ["healthClaimsFile"],
        EmergencyAndFirstAidSupplies: [],
        DisinfectionAndHygieneSupplies: [],
        NutritionAndDietaryProducts: [],
        HealthcareITSolutions: ["interoperabilityFile"],
      };

      // Check if the category exists in the fileFields object
      if (!fileFields[category]) {
        return sendErrorResponse(res, 400, "Invalid category specified.");
      }

      // Retrieve file paths for general, inventory, compliance, and additional fields
      const generalFiles = await getFilePaths(req?.files, ["image"]);
      const inventoryFiles = { countries: JSON.parse(req?.body?.countries) };
      const complianceFiles = await getFilePaths(req?.files, [
        "complianceFile",
      ]);
      const additionalFiles = await getFilePaths(req?.files, [
        "guidelinesFile",
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

      console.log("categoryFiles", categoryFiles);

      // Create new product with all necessary fields
      const newProductData = {
        ...req?.body,
        general: {
          ...req?.body,
          ...(generalFiles || []),
        },
        inventory: {
          ...req?.body,
          ...(inventoryFiles || []),
        },
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
        userSchemaReference: "Supplier",
        idDeleted: false,
      };

      // Create the new product
      const newProduct = await Product.create(newProductData);

      if (!newProduct) {
        return sendErrorResponse(res, 400, "Failed to create new product.");
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
      const { category } = req?.body;
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
            req?.body[field]
              ? JSON.parse(req.body[field]) // Replace single backslashes with double backslashes
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
          "specificationFile",
          "performanceTestingReportFile",
        ],
        Pharmaceuticals: [],
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
        HomeHealthcareProducts: ["performanceTestingReportFile"],
        AlternativeMedicines: ["healthClaimsFile"],
        EmergencyAndFirstAidSupplies: [],
        DisinfectionAndHygieneSupplies: [],
        NutritionAndDietaryProducts: [],
        HealthcareITSolutions: ["interoperabilityFile"],
      };

      // Check if the category exists in the fileFields object
      if (!fileFields[category]) {
        return sendErrorResponse(res, 400, "Invalid category specified.");
      }

      // Retrieve file paths for general, inventory, compliance, and additional fields
      const generalFiles = await getFilePaths(req?.files, ["image"]);
      const inventoryFiles = { countries: JSON.parse(req?.body?.countries) };
      const complianceFiles = await getFilePaths(req?.files, [
        "complianceFile",
      ]);
      const additionalFiles = await getFilePaths(req?.files, [
        "guidelinesFile",
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

      console.log("\nfilePaths", complianceFiles.complianceFile);

      // Update existing product data
      const updatedProductData = {
        ...existingProduct._doc, // Use the existing product data
        ...req?.body, // Overwrite with new data from request body
        general: {
          ...req?.body,
          ...(generalFiles || []),
        },
        inventory: {
          ...req?.body,
          ...(inventoryFiles || []),
        },
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

      // Update the product in the database
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updatedProductData,
        { new: true }
      );

      if (!updatedProduct) {
        return sendErrorResponse(res, 400, "Failed to update the product.");
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

      console.log("softDeletedProduct", softDeletedProduct);

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
