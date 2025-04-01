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
const {
  getFieldName,
  validateFields,
  handleProductCategorySwitch,
  getCategoryName,
} = require("../utils/bulkUploadProduct");

module.exports = {
  getAllProducts: async (req, res) => {
    try {
      const {
        supplier_id,
        market,
        page_no = 1,
        page_size = 5,
        search_key = "",
        category = "",
        subCategory = "",
        level3Category = "",
        // quantity,
        // price,
      } = req?.query;

      const formatToPascalCase = (str) => {
        return str
          .trim()
          .split(/\s+/) // Split by spaces
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
          .join(""); // Join words without spaces
      };

      // Format category, subCategory, and level3Category
      const formattedCategory = formatToPascalCase(category);
      const formattedSubCategory = formatToPascalCase(subCategory);
      const formattedLevel3Category = formatToPascalCase(level3Category);

      const pageNo = parseInt(page_no) || 1;
      const pageSize = parseInt(page_size) || 10;
      const offset = (pageNo - 1) * pageSize;

      const { price = {}, quantity = {}, deliveryTime = {} } = req?.body;

      // Create the aggregation pipeline
      let pipeline = [];

      // Add match condition
      // pipeline.push({
      //   $match: {
      //     isDeleted: false, // Only products that are not deleted
      //     ...(supplier_id && {
      //       supplier_id: new mongoose.Types.ObjectId(supplier_id),
      //     }),
      //     ...(market && { market: market }),
      //     ...(category && { category: category }),
      //     ...(search_key &&
      //       typeof search_key === "string" &&
      //       search_key.trim() !== "" &&
      //       search_key !== "null" &&
      //       search_key !== "undefined" && {
      //         "general.name": { $regex: search_key, $options: "i" },
      //       }),
      //     ...(category &&
      //       typeof category === "string" &&
      //       category.trim() !== "" &&
      //       category !== "null" &&
      //       category !== "undefined" && {
      //         category: { $regex: category, $options: "i" },
      //       }),
      //     ...(quantity?.min &&
      //       quantity?.max &&
      //       !isNaN(quantity?.min) &&
      //       !isNaN(quantity?.max) && {
      //         // "general.quantity": { $lte: parseInt(quantity, 10) },
      //         "general.quantity": {
      //           $gte: parseInt(quantity?.min, 10),
      //           $lte: parseInt(quantity?.max, 10),
      //         },
      //       }),
      //   },
      // });

      pipeline.push({
        $match: {
          isDeleted: false, // Only products that are not deleted
          ...(supplier_id && {
            supplier_id: new mongoose.Types.ObjectId(supplier_id),
          }),
          ...(market && { market: market }),
          ...(formattedCategory && {
            category: { $regex: formattedCategory, $options: "i" },
          }),
          ...(subCategory && {
            [`${formattedCategory}.subCategory`]: {
              $regex: subCategory,
              $options: "i",
            },
          }),
          ...(level3Category && {
            [`${formattedCategory}.anotherCategory`]: {
              $regex: level3Category,
              $options: "i",
            },
          }),
          ...(search_key && {
            "general.name": { $regex: search_key, $options: "i" },
          }),
          ...(quantity?.min &&
            quantity?.max &&
            !isNaN(quantity?.min) &&
            !isNaN(quantity?.max) && {
              "general.quantity": {
                $gte: parseInt(quantity?.min, 10),
                $lte: parseInt(quantity?.max, 10),
              },
            }),
        },
      });

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

      // Unwind the inventoryList so that each inventory item can be processed individually
      pipeline.push({
        $unwind: {
          path: "$inventoryDetails.inventoryList",
          preserveNullAndEmptyArrays: true, // Keep products without matched inventory details
        },
      });

      // Aggregating price and quantity by inventory UUID and inventoryList
      pipeline.push({
        $group: {
          _id: "$_id", // Group by product id
          general: { $first: "$general" },
          inventory: { $first: "$inventory" },
          complianceFile: { $first: "$complianceFile" },
          cNCFileNDate: {
            $first: "$cNCFileNDate",
          },
          storage: { $first: "$storage" },
          additional: { $first: "$additional" },
          guidelinesFile: { $first: "$guidelinesFile" },
          healthNSafety: { $first: "$healthNSafety" },
          category: { $first: "$category" },
          medicine_id: { $first: "$medicine_id" },
          supplier_id: { $first: "$supplier_id" },
          market: { $first: "$market" },
          secondayMarketDetails: { $first: "$secondayMarketDetails" },
          isDeleted: { $first: "$isDeleted" },
          bulkUpload: { $first: "$bulkUpload" },
          userDetails: { $first: "$userDetails" },
          inventoryDetails: { $push: "$inventoryDetails" }, // Group all inventory details
          MedicalEquipmentAndDevices: { $first: "$MedicalEquipmentAndDevices" },
          Pharmaceuticals: { $first: "$Pharmaceuticals" },
          SkinHairCosmeticSupplies: { $first: "$SkinHairCosmeticSupplies" },
          VitalHealthAndWellness: { $first: "$VitalHealthAndWellness" },
          MedicalConsumablesAndDisposables: {
            $first: "$MedicalConsumablesAndDisposables",
          },
          LaboratorySupplies: { $first: "$LaboratorySupplies" },
          DiagnosticAndMonitoringDevices: {
            $first: "$DiagnosticAndMonitoringDevices",
          },
          HospitalAndClinicSupplies: { $first: "$HospitalAndClinicSupplies" },
          OrthopedicSupplies: { $first: "$OrthopedicSupplies" },
          DentalProducts: { $first: "$DentalProducts" },
          EyeCareSupplies: { $first: "$EyeCareSupplies" },
          HomeHealthcareProducts: { $first: "$HomeHealthcareProducts" },
          AlternativeMedicines: { $first: "$AlternativeMedicines" },
          EmergencyAndFirstAidSupplies: {
            $first: "$EmergencyAndFirstAidSupplies",
          },
          DisinfectionAndHygieneSupplies: {
            $first: "$DisinfectionAndHygieneSupplies",
          },
          NutritionAndDietaryProducts: {
            $first: "$NutritionAndDietaryProducts",
          },
          HealthcareITSolutions: { $first: "$HealthcareITSolutions" },
          priceQuantityDetails: {
            // Aggregate price and quantity from the inventoryList
            $push: {
              price: "$inventoryDetails.inventoryList.price",
              quantity: "$inventoryDetails.inventoryList.quantity",
              deliveryTime: "$inventoryDetails.inventoryList.deliveryTime",
            },
          },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          __v: { $first: "$__v" },
        },
      });

      if (price?.min && price?.max) {
        pipeline.push({
          $match: {
            priceQuantityDetails: {
              $elemMatch: {
                // price: { $lte: parseInt(price, 10) },
                price: {
                  $gte: parseInt(price?.min, 10),
                  $lte: parseInt(price?.max, 10),
                },
              },
            },
          },
        });
      }

      if (deliveryTime?.min && deliveryTime?.max) {
        pipeline.push({
          $match: {
            priceQuantityDetails: {
              $elemMatch: {
                deliveryTime: {
                  $gte: parseInt(deliveryTime?.min, 10),
                  $lte: parseInt(deliveryTime?.max, 10),
                },
              },
            },
          },
        });
      }

      // Add any additional steps like sorting or pagination
      // const totalProductsQuery = {
      //   isDeleted: false,
      //   ...(market ? { market: market } : {}),
      //   ...(search_key &&
      //   typeof search_key === "string" &&
      //   search_key.trim() !== "" &&
      //   search_key !== "null" &&
      //   search_key !== "undefined"
      //     ? { "general.name": { $regex: search_key, $options: "i" } }
      //     : {}),
      // };

      const totalProductsQuery = {
        isDeleted: false,
        ...(market ? { market: market } : {}),
        ...(search_key &&
        typeof search_key === "string" &&
        search_key.trim() !== "" &&
        search_key !== "null" &&
        search_key !== "undefined"
          ? { "general.name": { $regex: search_key, $options: "i" } }
          : {}),
        ...(formattedCategory && {
          category: { $regex: formattedCategory, $options: "i" },
        }),
        ...(formattedSubCategory && {
          [`${formattedCategory}.subCategory`]: {
            $regex: formattedSubCategory,
            $options: "i",
          },
        }),
        ...(formattedLevel3Category && {
          [`${formattedCategory}.anotherCategory`]: {
            $regex: formattedLevel3Category,
            $options: "i",
          },
        }),
      };

      const totalProducts = await Product.countDocuments(totalProductsQuery);

      pipeline.push({
        $sort: { createdAt: -1 },
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
        totalPages,
      });
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

  addProduct: async (req, res) => {
    try {
      // Helper function to retrieve file paths
      async function getFilePaths(fields = []) {
        const filePaths = {};

        // Make sure fields is an array and req.files is an object
        if (!Array.isArray(fields)) {
          console.error(
            "Expected fields to be an array, but received:",
            fields
          );
          return filePaths; // Return an empty filePaths object
        }

        // Iterate over the fields array
        for (const field of fields) {
          if (req?.files?.[field] && req?.files?.[field]?.length > 0) {
            const validPaths = req?.files?.[field]
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
      const generalFiles = await getFilePaths(["image"]);
      // const inventoryFiles = { countries: JSON.parse(req?.body?.countries) };
      const inventoryFiles = [...req?.body?.countries];
      const complianceFiles = await getFilePaths(["complianceFile"]);
      const additionalFiles = await getFilePaths(["guidelinesFile"]);
      const secondaryMarketFiles = await getFilePaths(["purchaseInvoiceFile"]);
      const healthNSafetyFiles = await getFilePaths([
        "safetyDatasheet",
        "healthHazardRating",
        "environmentalImpact",
      ]);

      // Retrieve file paths for the selected category only
      const categoryFiles = await getFilePaths(
        req?.files,
        fileFields[category] || []
      );

      if (category === "AlternativeMedicines") {
        categoryFiles.healthClaimsFile = req.files?.healthClaimsFile
          ? req.files.healthClaimsFile.map((file) => file.filename)
          : [];
      }
      if (category === "HealthcareITSolutions") {
        categoryFiles.interoperabilityFile = req.files?.interoperabilityFile
          ? req.files.interoperabilityFile.map((file) => file.filename)
          : [];
      }
      if (category === "HomeHealthcareProducts") {
        categoryFiles.performanceTestingReportFile = req.files
          ?.performanceTestingReportFile
          ? req.files.performanceTestingReportFile.map((file) => file.filename)
          : [];
      }

      let newProductData = {};
      newProductData[category] = {
        ...req?.body,
        ...(categoryFiles || {}),
      };

      const inventoryUUId = uuidv4();
      const medicine_id = "PRDT-" + Math.random().toString(16).slice(2, 10);

      let cNCFileNDateParsed;

      if (typeof req?.body?.cNCFileNDate == "string") {
        try {
          // cNCFileNDateParsed = JSON.parse(req.body.cNCFileNDate)?.filter(
          //   (value) => value != "[object Object]"
          // );
          if (Array.isArray(req?.body?.cNCFileNDate)) {
            cNCFileNDateParsed = req.body.cNCFileNDate.filter(
              (value) => value !== "[object Object]"
            );
          } else if (typeof req?.body?.cNCFileNDate === "string") {
            // If it's a string, try to parse it as JSON and filter
            cNCFileNDateParsed = JSON.parse(req.body?.cNCFileNDate)?.filter(
              (value) => value !== "[object Object]"
            );
          } else {
            // Handle case where cNCFileNDate is neither an array nor a string
            throw new Error("Invalid cNCFileNDate format.");
          }
        } catch (error) {
          // Handle the case where the JSON parsing fails
          console.error("Internal Server Error:", error);
          logErrorToFile(error, req);
          return;
        }
      } else {
        cNCFileNDateParsed = JSON.parse(
          req.body?.cNCFileNDate?.filter((value) => value != "[object Object]")
        );
      }

      // Create new product with all necessary fields
      newProductData = {
        ...req?.body,
        medicine_id,
        general: {
          ...req?.body,
          ...(generalFiles || []),
        },
        inventory: inventoryUUId,
        complianceFile: complianceFiles.complianceFile,
        cNCFileNDate: cNCFileNDateParsed
          ?.map((ele, index) => {
            return {
              file:
                typeof ele?.file !== "string"
                  ? complianceFiles?.complianceFile?.find((filename) => {
                      const path = ele?.file?.path;

                      // Ensure path is defined and log the file path
                      if (!path) {
                        return false; // If there's no path, skip this entry
                      }

                      const ext = path.split(".").pop(); // Get the file extension

                      const sanitizedPath = path
                        .replaceAll("./", "")
                        .replaceAll(" ", "")
                        .replaceAll(`.${ext}`, "");

                      // Match file by sanitized name
                      return filename?.includes(sanitizedPath);
                    })
                  : ele?.file || complianceFiles?.complianceFile?.[index] || "",

              date: ele?.date || "", // Log the date being used (if any)
            };
          })
          ?.filter((ele) => ele?.file || ele?.date),
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

      return sendSuccessResponse(
        res,
        200,
        "Product Added Succesfully",
        newProduct
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

  editProduct: async (req, res) => {
    try {
      const { category, market = "new" } = req?.body;
      const { productId } = req?.params;

      // Check if the product exists
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return sendErrorResponse(res, 404, "Product not found.");
      }

      // Check if the inventory exists
      const InventoryFound = await Inventory.findOne({
        uuid: existingProduct?.inventory,
      });
      if (!InventoryFound) {
        return sendErrorResponse(res, 404, "Inventory not found.");
      }

      // Helper function to retrieve file paths
      async function getFilePaths(fields) {
        const filePaths = {};

        for (const field of fields) {
          // Step 1: Retrieve the old file names (without "New") from the existing product
          const oldFieldName = field.replace("New", ""); // Remove 'New' to match the old field name
          const oldFiles = Array.isArray(req?.body?.[oldFieldName])
            ? req?.body?.[oldFieldName]
            : [req?.body?.[oldFieldName]] || []; // Default to an empty array if no old files exist

          // Step 2: Get the new file names (with 'New' suffix) from the current upload
          const newFiles =
            req?.files?.[field + "New"]?.map((file) => file?.filename) || [];

          // Step 3: Combine old and new files (remove duplicates)
          const combinedFiles = [...oldFiles, ...newFiles]
            ?.map((filename) => filename?.replaceAll("New", ""))
            ?.filter((filename, index, self) => {
              // Make sure filenames are strings and not arrays or broken down into characters
              return (
                typeof filename === "string" &&
                filename &&
                self.indexOf(filename) === index
              );
            });

          // Step 4: Store the combined file paths for each field
          filePaths[field] = combinedFiles;
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
      const generalFiles = await getFilePaths(["image"]);
      // const inventoryFiles = { countries: JSON.parse(req?.body?.countries) };
      const inventoryFiles = [...req?.body?.countries];
      const complianceFiles = await getFilePaths(["complianceFile"]);
      const additionalFiles = await getFilePaths(["guidelinesFile"]);
      const secondaryMarketFiles = await getFilePaths(["purchaseInvoiceFile"]);
      const healthNSafetyFiles = await getFilePaths([
        "safetyDatasheet",
        "healthHazardRating",
        "environmentalImpact",
      ]);

      // Retrieve file paths for the selected category only
      const categoryFiles = await getFilePaths(fileFields[category]);

      // let cNCFileNDateParsed;

      // // if (typeof req?.body?.cNCFileNDate == "string") {
      // //   try {
      // //     cNCFileNDateParsed = JSON.parse(
      // //       req.body.cNCFileNDate
      // //     )?.filter((value) => value != "[object Object]");
      // //   } catch (error) {
      // //     // Handle the case where the JSON parsing fails
      // //     logErrorToFile(error, req);
      // //     return;
      // //   }
      // // } else {
      // //   cNCFileNDateParsed = JSON.parse(
      // //     req.body?.cNCFileNDate?.filter(
      // //       (value) => {
      // //         return (value != "[object Object]")}
      // //     )
      // //   );
      // // }
      // cNCFileNDateParsed = JSON.parse(
      //   req.body?.cNCFileNDate?.filter((value) => {
      //     return value != "[object Object]";
      //   })
      // );
      let cNCFileNDateParsed;

      try {
        // Check if cNCFileNDate exists and is an array before applying filter
        if (Array.isArray(req?.body?.cNCFileNDate)) {
          cNCFileNDateParsed = req.body.cNCFileNDate.filter(
            (value) => value !== "[object Object]"
          );
        } else if (typeof req?.body?.cNCFileNDate === "string") {
          // If it's a string, try to parse it as JSON and filter
          cNCFileNDateParsed = JSON.parse(req.body?.cNCFileNDate)?.filter(
            (value) => value !== "[object Object]"
          );
        } else {
          // Handle case where cNCFileNDate is neither an array nor a string
          throw new Error("Invalid cNCFileNDate format.");
        }
      } catch (error) {
        console.error("Error while parsing cNCFileNDate:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(res, 400, "Invalid cNCFileNDate format.");
      }

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

        complianceFile: complianceFiles.complianceFile || [],
        // cNCFileNDate: JSON.parse(cNCFileNDateParsed)
        //   ?.map((ele, index) => {
        //     return {
        //       // file: complianceFiles?.complianceFile?.[index] || "",
        //       file:
        //         typeof ele?.file != "string"
        //           ? complianceFiles?.complianceFile?.find((filename) => {
        //               const ext =
        //                 ele?.file?.path?.split?.[
        //                   ele?.file?.path?.split?.length - 1
        //                 ];
        //               return filename?.includes(
        //                 ele?.file?.path
        //                   ?.replaceAll("./", "")
        //                   ?.replaceAll(" ", "")
        //                   ?.replaceAll("." + ext, "")
        //               );
        //             })
        //           : ele?.file || complianceFiles?.complianceFile?.[index] || "",
        //       date: ele?.date || "",
        //     };
        //   })
        cNCFileNDate:
          cNCFileNDateParsed?.length > 0
            ? JSON.parse(cNCFileNDateParsed)
                ?.map((ele, index) => {
                  return {
                    file:
                      typeof ele?.file !== "string"
                        ? complianceFiles?.complianceFile?.find((filename) => {
                            const path = ele?.file?.path;

                            // Ensure path is defined and log the file path
                            if (!path) {
                              return false; // If there's no path, skip this entry
                            }

                            const ext = path.split(".").pop(); // Get the file extension
                            const sanitizedPath = path
                              .replaceAll("./", "")
                              .replaceAll(" ", "")
                              .replaceAll(`.${ext}`, "");

                            // Match file by sanitized name
                            return filename?.includes(sanitizedPath);
                          })
                        : ele?.file ||
                          complianceFiles?.complianceFile?.[index] ||
                          "",

                    date: ele?.date || "", // Log the date being used (if any)
                  };
                })
                ?.filter((ele) => ele?.file || ele?.date)
            : cNCFileNDateParsed,
        additional: {
          ...req?.body,
          ...(additionalFiles || []),
        },
        healthNSafety: {
          ...req?.body,
          ...(healthNSafetyFiles || []),
        },
        [category]: {
          ...req?.body,
          ...(categoryFiles || []),
        }, // Update category-specific fields
      };

      if (market == "secondary") {
        updatedProductData["secondayMarketDetails"] = {
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
          ) || []
        ),
        inventoryList: JSON.parse(
          req?.body?.productPricingDetails?.filter(
            (value) => value != "[object Object]"
          ) || []
        ),
        ...(inventoryFiles || []),
      };

      // Update the inventory in the database
      const updatedInventory = await Inventory.findOneAndUpdate(
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

  productSuppliers: async (req, res) => {
    try {
      const { id } = req?.params;
      const {
        market,
        page_no = 1,
        page_size = 5,
        search_key = "",
        category,
        // quantity,
        // price,
      } = req?.query;
      const pageNo = parseInt(page_no) || 1;
      const pageSize = parseInt(page_size) || 10;
      const offset = (pageNo - 1) * pageSize;

      const { price = {}, quantity = {}, deliveryTime = {} } = req?.body;

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

      let searchFilter = {};

      if (search_key && search_key !== "null") {
        const decodedSearchKey = decodeURIComponent(search_key).trim(); // Decode the URL-encoded string

        searchFilter = {
          $or: [
            {
              "userDetails.supplier_name": {
                $regex: decodedSearchKey,
                $options: "i",
              },
            }, // Match supplier name
            { "general.name": { $regex: decodedSearchKey, $options: "i" } }, // Match product name
          ],
        };
      }

      let pipeline = [];

      pipeline?.push({
        $match: {
          isDeleted: false,
          "general.name": {
            $regex: foundProduct?.general?.name,
            $options: "i",
          },
          ...(market && { market: foundProduct?.market }),
          ...(category && { category: foundProduct?.category }),
          ...searchFilter,
          ...(quantity?.min &&
            quantity?.max &&
            !isNaN(quantity?.min) &&
            !isNaN(quantity?.max) && {
              // "general.quantity": { $lte: parseInt(quantity, 10) },
              "general.quantity": {
                $gte: parseInt(quantity?.min, 10),
                $lte: parseInt(quantity?.max, 10),
              },
            }),
        },
      });
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

      // Unwind the inventoryList so that each inventory item can be processed individually
      pipeline.push({
        $unwind: {
          path: "$inventoryDetails.inventoryList",
          preserveNullAndEmptyArrays: true, // Keep products without matched inventory details
        },
      });

      // Aggregating price and quantity by inventory UUID and inventoryList
      pipeline.push({
        $group: {
          _id: "$_id", // Group by product id
          general: { $first: "$general" },
          inventory: { $first: "$inventory" },
          complianceFile: { $first: "$complianceFile" },
          cNCFileNDate: {
            $first: "$cNCFileNDate",
          },
          storage: { $first: "$storage" },
          additional: { $first: "$additional" },
          guidelinesFile: { $first: "$guidelinesFile" },
          healthNSafety: { $first: "$healthNSafety" },
          category: { $first: "$category" },
          medicine_id: { $first: "$medicine_id" },
          supplier_id: { $first: "$supplier_id" },
          market: { $first: "$market" },
          secondayMarketDetails: { $first: "$secondayMarketDetails" },
          isDeleted: { $first: "$isDeleted" },
          bulkUpload: { $first: "$bulkUpload" },
          userDetails: { $first: "$userDetails" },
          inventoryDetails: { $push: "$inventoryDetails" }, // Group all inventory details
          MedicalEquipmentAndDevices: { $first: "$MedicalEquipmentAndDevices" },
          Pharmaceuticals: { $first: "$Pharmaceuticals" },
          SkinHairCosmeticSupplies: { $first: "$SkinHairCosmeticSupplies" },
          VitalHealthAndWellness: { $first: "$VitalHealthAndWellness" },
          MedicalConsumablesAndDisposables: {
            $first: "$MedicalConsumablesAndDisposables",
          },
          LaboratorySupplies: { $first: "$LaboratorySupplies" },
          DiagnosticAndMonitoringDevices: {
            $first: "$DiagnosticAndMonitoringDevices",
          },
          HospitalAndClinicSupplies: { $first: "$HospitalAndClinicSupplies" },
          OrthopedicSupplies: { $first: "$OrthopedicSupplies" },
          DentalProducts: { $first: "$DentalProducts" },
          EyeCareSupplies: { $first: "$EyeCareSupplies" },
          HomeHealthcareProducts: { $first: "$HomeHealthcareProducts" },
          AlternativeMedicines: { $first: "$AlternativeMedicines" },
          EmergencyAndFirstAidSupplies: {
            $first: "$EmergencyAndFirstAidSupplies",
          },
          DisinfectionAndHygieneSupplies: {
            $first: "$DisinfectionAndHygieneSupplies",
          },
          NutritionAndDietaryProducts: {
            $first: "$NutritionAndDietaryProducts",
          },
          HealthcareITSolutions: { $first: "$HealthcareITSolutions" },
          priceQuantityDetails: {
            // Aggregate price and quantity from the inventoryList
            $push: {
              price: "$inventoryDetails.inventoryList.price",
              quantity: "$inventoryDetails.inventoryList.quantity",
              deliveryTime: "$inventoryDetails.inventoryList.deliveryTime",
            },
          },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          __v: { $first: "$__v" },
        },
      });

      if (price?.min && price?.max) {
        pipeline.push({
          $match: {
            priceQuantityDetails: {
              $elemMatch: {
                // price: { $lte: parseInt(price, 10) },
                price: {
                  $gte: parseInt(price?.min, 10),
                  $lte: parseInt(price?.max, 10),
                },
              },
            },
          },
        });
      }

      if (deliveryTime?.min && deliveryTime?.max) {
        pipeline.push({
          $match: {
            priceQuantityDetails: {
              $elemMatch: {
                deliveryTime: {
                  $gte: parseInt(deliveryTime?.min, 10),
                  $lte: parseInt(deliveryTime?.max, 10),
                },
              },
            },
          },
        });
      }

      // Add any additional steps like sorting or pagination
      const totalProductsQuery = {
        isDeleted: false,
        "general.name": { $regex: foundProduct?.general?.name, $options: "i" },
        ...(market ? { market: foundProduct?.market } : {}),
        ...searchFilter,
      };

      const totalProducts = await Product.countDocuments(totalProductsQuery);

      pipeline.push({
        $sort: { createdAt: -1 },
      });

      // pagination
      pipeline.push({ $skip: offset });
      pipeline.push({ $limit: pageSize });

      // Execute the aggregation
      const products = await Product.aggregate(pipeline);
      const totalPages = Math.ceil(totalProducts / pageSize);

      return sendSuccessResponse(
        res,
        200,
        "Success Fetching Other Supplier with same product",
        {
          products,
          totalItems: totalProducts,
          currentPage: pageNo,
          itemsPerPage: pageSize,
          totalPages,
        }
      );

      return sendSuccessResponse(res, 200, "Success Soft Deleting Product");
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

  otherProducts: async (req, res) => {
    try {
      const { id } = req?.params;
      const {
        page_no = 1,
        page_size = 5,
        search_key = "",
        category,
        // quantity,
        // price,
      } = req?.query;
      const pageNo = parseInt(page_no) || 1;
      const pageSize = parseInt(page_size) || 10;
      const offset = (pageNo - 1) * pageSize;

      const { price = {}, quantity = {}, deliveryTime = {} } = req?.body;

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

      let pipeline = [];

      pipeline?.push({
        $match: {
          isDeleted: false,
          supplier_id: new mongoose.Types.ObjectId(foundProduct?.supplier_id),
          // ...(market && { market: foundProduct?.market }),
          // ...(category && { category: foundProduct?.category }),
          ...(search_key && {
            "general.name": { $regex: search_key, $options: "i" },
          }),
          ...(quantity?.min &&
            quantity?.max &&
            !isNaN(quantity?.min) &&
            !isNaN(quantity?.max) && {
              // "general.quantity": { $lte: parseInt(quantity, 10) },
              "general.quantity": {
                $gte: parseInt(quantity?.min, 10),
                $lte: parseInt(quantity?.max, 10),
              },
            }),
        },
      });
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

      // Unwind the inventoryList so that each inventory item can be processed individually
      pipeline.push({
        $unwind: {
          path: "$inventoryDetails.inventoryList",
          preserveNullAndEmptyArrays: true, // Keep products without matched inventory details
        },
      });

      // Aggregating price and quantity by inventory UUID and inventoryList
      pipeline.push({
        $group: {
          _id: "$_id", // Group by product id
          general: { $first: "$general" },
          inventory: { $first: "$inventory" },
          complianceFile: { $first: "$complianceFile" },
          cNCFileNDate: {
            $first: "$cNCFileNDate",
          },
          storage: { $first: "$storage" },
          additional: { $first: "$additional" },
          guidelinesFile: { $first: "$guidelinesFile" },
          healthNSafety: { $first: "$healthNSafety" },
          category: { $first: "$category" },
          medicine_id: { $first: "$medicine_id" },
          supplier_id: { $first: "$supplier_id" },
          market: { $first: "$market" },
          secondayMarketDetails: { $first: "$secondayMarketDetails" },
          isDeleted: { $first: "$isDeleted" },
          bulkUpload: { $first: "$bulkUpload" },
          userDetails: { $first: "$userDetails" },
          inventoryDetails: { $push: "$inventoryDetails" }, // Group all inventory details
          MedicalEquipmentAndDevices: { $first: "$MedicalEquipmentAndDevices" },
          Pharmaceuticals: { $first: "$Pharmaceuticals" },
          SkinHairCosmeticSupplies: { $first: "$SkinHairCosmeticSupplies" },
          VitalHealthAndWellness: { $first: "$VitalHealthAndWellness" },
          MedicalConsumablesAndDisposables: {
            $first: "$MedicalConsumablesAndDisposables",
          },
          LaboratorySupplies: { $first: "$LaboratorySupplies" },
          DiagnosticAndMonitoringDevices: {
            $first: "$DiagnosticAndMonitoringDevices",
          },
          HospitalAndClinicSupplies: { $first: "$HospitalAndClinicSupplies" },
          OrthopedicSupplies: { $first: "$OrthopedicSupplies" },
          DentalProducts: { $first: "$DentalProducts" },
          EyeCareSupplies: { $first: "$EyeCareSupplies" },
          HomeHealthcareProducts: { $first: "$HomeHealthcareProducts" },
          AlternativeMedicines: { $first: "$AlternativeMedicines" },
          EmergencyAndFirstAidSupplies: {
            $first: "$EmergencyAndFirstAidSupplies",
          },
          DisinfectionAndHygieneSupplies: {
            $first: "$DisinfectionAndHygieneSupplies",
          },
          NutritionAndDietaryProducts: {
            $first: "$NutritionAndDietaryProducts",
          },
          HealthcareITSolutions: { $first: "$HealthcareITSolutions" },
          priceQuantityDetails: {
            // Aggregate price and quantity from the inventoryList
            $push: {
              price: "$inventoryDetails.inventoryList.price",
              quantity: "$inventoryDetails.inventoryList.quantity",
              deliveryTime: "$inventoryDetails.inventoryList.deliveryTime",
            },
          },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          __v: { $first: "$__v" },
        },
      });

      if (price?.min && price?.max) {
        pipeline.push({
          $match: {
            priceQuantityDetails: {
              $elemMatch: {
                // price: { $lte: parseInt(price, 10) },
                price: {
                  $gte: parseInt(price?.min, 10),
                  $lte: parseInt(price?.max, 10),
                },
              },
            },
          },
        });
      }

      if (deliveryTime?.min && deliveryTime?.max) {
        pipeline.push({
          $match: {
            priceQuantityDetails: {
              $elemMatch: {
                deliveryTime: {
                  $gte: parseInt(deliveryTime?.min, 10),
                  $lte: parseInt(deliveryTime?.max, 10),
                },
              },
            },
          },
        });
      }

      // Add any additional steps like sorting or pagination
      const totalProductsQuery = {
        isDeleted: false,
        // ...(market ? { market: foundProduct?.market } : {}),
        supplier_id: new mongoose.Types.ObjectId(foundProduct?.supplier_id),
        ...(search_key &&
          typeof search_key === "string" &&
          search_key.trim() !== "" &&
          search_key !== "null" &&
          search_key !== "undefined"
            ? { "general.name": { $regex: search_key, $options: "i" } }
            : {}),
      };

      const totalProducts = await Product.countDocuments(totalProductsQuery);

      pipeline.push({
        $sort: { createdAt: -1 },
      });

      // pagination
      pipeline.push({ $skip: offset });
      pipeline.push({ $limit: pageSize });

      // Execute the aggregation
      const products = await Product.aggregate(pipeline);
      const totalPages = Math.ceil(totalProducts / pageSize);

      return sendSuccessResponse(
        res,
        200,
        "Success Fetching Other Supplier with same product",
        {
          products,
          totalItems: totalProducts,
          currentPage: pageNo,
          itemsPerPage: pageSize,
          totalPages,
        }
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

  previewBulkUpload: async (req, res) => {
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
      // Check if the product exists
      const existingSupplier = await Supplier.findById(supplier_id);
      if (!existingSupplier) {
        return sendErrorResponse(res, 404, "Supplier not found.");
      }

      const inventoryArray = [];

      const updatedResult = results?.map((result) => {
        const medicine_id = "PRDT-" + Math.random().toString(16).slice(2, 10);
        const inventoryUUId = uuidv4();

        inventoryArray.push({
          uuid: inventoryUUId,
          medicine_id,
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
          // // General
          model: result?.["Part/Model Number*"]?.toString()?.trim() || "",
          name: result?.["Product Name*"]?.toString()?.trim() || "",
          // category:
          //   getCategoryName(
          //     result?.["Product Category*"]?.toString()?.trim()
          //   ) || "",
          category: result?.["Product Category*"]?.toString()?.trim() || "",
          upc:
            result?.["UPC (Universal Product Code)"]?.toString()?.trim() || "",
          aboutManufacturer:
            result?.["Short Description*"]?.toString()?.trim() || "",
          brand: result?.["Brand Name"]?.toString()?.trim() || "",
          form: result?.["Product Type/Form*"]?.toString()?.trim() || "",
          quantity: Number(result?.["Product Total Quantity*"]) || 0,
          volumn: result?.["Product Volume"]?.toString()?.trim() || "",
          volumeUnit: result?.["Product Volume Unit"]?.toString()?.trim() || "",
          dimension: result?.["Product Dimension"]?.toString()?.trim() || "",
          weight: Number(result?.["Product Weight*"]) || 0,
          unit: result?.["Product Weight Units*"]?.toString()?.trim() || "",
          packageType:
            result?.["Product Packaging Type"]?.toString()?.trim() || "",
          packageMaterial:
            result?.["Product Packaging Material"]?.toString()?.trim() || "",
          storage: result?.["Storage Conditions"]?.toString()?.trim() || "",
          manufacturer:
            result?.["Manufacturer Name*"]?.toString()?.trim() || "",
          countryOfOrigin:
            result?.["Manufacturer Contry of Origin*"]?.toString()?.trim() ||
            "",
          image:
            result?.["Product Image"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim())
              ?.filter((ele) => ele) || [], // array
          description:
            result?.["Product Description*"]?.toString()?.trim() || "",
          // // End of General

          // inventory: inventoryUUId,

          // // Inventory
          // uuid: inventoryUUId,
          // medicine_id,
          date: result?.["Date of Manufacture"]?.toString()?.trim() || "",
          sku: result?.["SKU"]?.toString()?.trim() || "",
          stock: result?.["Stock*"]?.toString()?.trim() || "",
          countries:
            result?.["Stocked in Countries*"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim()) || [],
          date2: result?.["Date of Manufacture"]?.toString()?.trim() || "",
          // // stockedInDetails
          country:
            result?.["Country where Stock Trades"]?.toString()?.trim() || "",
          quantity: Number(result?.["Stock Quantity"]) || 0,
          // // End of stockedInDetails

          // // inventoryList
          quantity2: Number(result?.["Quantity*"]) || 0,
          price: Number(result?.["Cost Per Product*"]) || 0,
          deliveryTime: Number(result?.["Est. Delivery Time*"]) || 0,
          // // End of inventoryList

          // // End of Inventory
          // // cNCFileNDate
          // complianceFile: result?.["Regulatory Compliance"]
          // ?.split(",")
          // ?.map((ele) => ele?.toString()?.trim())?.filter(ele=>ele) || [], // array
          file:
            result?.["Regulatory Compliance"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim())
              ?.filter((ele) => ele) || [], // array
          date3: result?.["Date of Expiry"]?.toString()?.trim() || "",

          // // End of cNCFileNDate

          // // healthNSafety
          safetyDatasheet:
            result?.["Safety Datasheet"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim())
              ?.filter((ele) => ele) || [], // array
          healthHazardRating:
            result?.["Health Hazard Rating"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim())
              ?.filter((ele) => ele) || [], // array
          environmentalImpact:
            result?.["Environmental Impact"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim()) || [], //aray
          // end of healthNSafety

          // // additional
          warranty: result?.["Warranty"]?.toString()?.trim() || "",
          guidelinesFile: result?.["User Guidelines"]?.toString()?.trim() || "",
          other: result?.["Other Information"]?.toString()?.trim() || "",
          // // end of additional

          // medicine_id: medicine_id || "",
          // supplier_id: existingSupplier?._id || "",
          // market: "new",
          // isDeleted: false,
          // bulkUpload: true,
        };

        // Call the helper function to handle category-specific updates
        updatedObject = {
          ...updatedObject,
          ...handleProductCategorySwitch(result),
        };

        return updatedObject;
      });

      const previewResponse = updatedResult?.map((elem, index) => {
        const elemCat = elem?.category;

        // Loop through each key in the object
        for (const key in elem) {
          if (elem.hasOwnProperty(key)) {
            // Check if the key is a direct property of the object
            if (
              (elemCat == "Medical Equipment and Devices" &&
                key == "specification") ||
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
              (elemCat == "Disinfection and Hygiene Supplies" &&
                key == "composition") ||
              (elemCat == "Nutrition and Dietary Products" &&
                key == "composition") ||
              (elemCat == "Healthcare IT Solutions" &&
                key == "interoperability")
            ) {
              // You can also use this structure if you want to save the results in an object for each key
              elem[key] = {
                value: elem[key],
                fieldName: getFieldName(key, true),
                error: validateFields(
                  getFieldName(key, true)?.includes("*"),
                  elem[key],
                  getFieldName(key, true),
                  typeof elem[key]
                ),
              };
            } else {
              // You can also use this structure if you want to save the results in an object for each key
              elem[key] = {
                value: elem[key],
                fieldName: getFieldName(key),
                error: validateFields(
                  getFieldName(key)?.includes("*"),
                  elem[key],
                  getFieldName(key),
                  typeof elem[key]
                ),
              };
            }
          }
        }
        return elem;
      });

      const previewHeadings = Object?.values(previewResponse?.[0])?.map(
        (field) => field?.fieldName
      );

      // // Insert multiple records into MongoDB
      // const entries = await Product.insertMany(updatedResult);

      // if (!entries || entries?.length == 0) {
      //   return sendErrorResponse(res, 400, "Failed to add bulk products.");
      // }

      // if (inventoryArray?.length > 0) {
      //   const inventories = await Inventory.insertMany(inventoryArray);

      //   if (!inventories || inventories?.length == 0) {
      //     return sendErrorResponse(res, 400, "Failed to add bulk inventories.");
      //   }
      // }

      // Remove the CSV file after processing
      fs.unlinkSync(filePath);

      return sendSuccessResponse(res, 200, "Success", {
        headings: previewHeadings || [],
        mainContent: previewResponse,
      });
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

  bulkUpload: async (req, res) => {
    try {
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

  csvDownload: async (req, res) => {
    try {
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
};
