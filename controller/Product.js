require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const logErrorToFile = require("../logs/errorLogs");
const {
  sendErrorResponse,
  sendSuccessResponse,
  handleCatchBlockError,
} = require("../utils/commonResonse");
const Supplier = require("../schema/supplierSchema");
const Inventory = require("../schema/inventorySchema");
const Buyer = require("../schema/buyerSchema");
const Product = require("../schema/productSchema2");
const CsvFile = require("../schema/csvFilesSchema");
const { default: mongoose } = require("mongoose");
const csv = require("csv-parser");
const { parse } = require("json2csv");

const {
  getFieldName,
  getFieldName2,
  validateFields,
  handleProductCategorySwitch,
  handleProductCategorySwitch2,
  getCategoryName,
  additionalCheckFieldName,
  getCategoryNameForHeading,
} = require("../utils/bulkUploadProduct");
const { getFilePathsEdit, getFilePathsAdd } = require("../helper");
const { validateAnotherCategory } = require("../utils/Category");
const { flattenData } = require("../utils/csvConverter");

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
      } = req?.query;

      const {
        countries,
        price = {},
        quantity = {},
        deliveryTime = {},
      } = req?.body;

      const formatToPascalCase = (str) => {
        return str
          .trim()
          .split(/\s+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join("");
      };

      const formattedCategory = formatToPascalCase(category);
      const formattedSubCategory = formatToPascalCase(subCategory);
      const formattedLevel3Category = formatToPascalCase(level3Category);

      const pageNo = parseInt(page_no) || 1;
      const pageSize = parseInt(page_size) || 10;
      const offset = (pageNo - 1) * pageSize;

      let pipeline = [];

      const totalProductsQuery = {
        isDeleted: false,
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
      };

      pipeline.push({ $match: totalProductsQuery });

      pipeline.push(
        {
          $lookup: {
            from: "suppliers",
            localField: "supplier_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $lookup: {
            from: "inventories",
            localField: "inventory",
            foreignField: "uuid",
            as: "inventoryDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$inventoryDetails",
            preserveNullAndEmptyArrays: true,
          },
        }
      );

      const applyInventoryListFilters =
        (countries && countries.length > 0) ||
        (price?.min && price?.max) ||
        (quantity?.min && quantity?.max) ||
        (deliveryTime?.min && deliveryTime?.max);

      if (applyInventoryListFilters) {
        pipeline.push({
          $unwind: {
            path: "$inventoryDetails.inventoryList",
            preserveNullAndEmptyArrays: true,
          },
        });
      }

      if (countries && Array.isArray(countries) && countries.length > 0) {
        pipeline.push({
          $match: {
            "inventoryDetails.countries": { $in: countries },
          },
        });
      }

      pipeline.push({
        $group: {
          _id: "$_id",
          general: { $first: "$general" },
          inventory: { $first: "$inventory" },
          complianceFile: { $first: "$complianceFile" },
          cNCFileNDate: { $first: "$cNCFileNDate" },
          storage: { $first: "$storage" },
          additional: { $first: "$additional" },
          guidelinesFile: { $first: "$guidelinesFile" },
          healthNSafety: { $first: "$healthNSafety" },
          category: { $first: "$category" },
          product_id: { $first: "$product_id" },
          supplier_id: { $first: "$supplier_id" },
          market: { $first: "$market" },
          secondaryMarketDetails: { $first: "$secondaryMarketDetails" },
          isDeleted: { $first: "$isDeleted" },
          bulkUpload: { $first: "$bulkUpload" },
          userDetails: { $first: "$userDetails" },
          inventoryDetails: { $push: "$inventoryDetails" },
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
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          __v: { $first: "$__v" },
          priceQuantityDetails: {
            $push: {
              price: "$inventoryDetails.inventoryList.price",
              quantity: "$inventoryDetails.inventoryList.quantity",
              deliveryTime: "$inventoryDetails.inventoryList.deliveryTime",
            },
          },
        },
      });

      if (price?.min && price?.max) {
        pipeline.push({
          $match: {
            priceQuantityDetails: {
              $elemMatch: {
                price: {
                  $gte: parseInt(price?.min, 10),
                  $lte: parseInt(price?.max, 10),
                },
              },
            },
          },
        });
      }

      // Uncomment if you want deliveryTime filtering
      // if (deliveryTime?.min && deliveryTime?.max) {
      //   pipeline.push({
      //     $match: {
      //       priceQuantityDetails: {
      //         $elemMatch: {
      //           deliveryTime: {
      //             $gte: parseInt(deliveryTime?.min, 10),
      //             $lte: parseInt(deliveryTime?.max, 10),
      //           },
      //         },
      //       },
      //     },
      //   });
      // }

      pipeline.push({ $sort: { createdAt: -1 } });

      // Clone pipeline for total count calculation
      const countPipeline = [...pipeline];
      countPipeline.push({ $count: "total" });
      const countResult = await Product.aggregate(countPipeline);
      const totalProducts = countResult[0]?.total || 0;
      // Add pagination
      pipeline.push({ $skip: offset });
      pipeline.push({ $limit: pageSize });

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
      handleCatchBlockError(req, res, error);
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
      handleCatchBlockError(req, res, error);
    }
  },

  addProduct: async (req, res) => {
    try {
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
      const generalFiles = await getFilePathsAdd(req, res, ["image"]);
      // const inventoryFiles = { countries: JSON.parse(req?.body?.countries) };
      const inventoryFiles = Array.isArray(req?.body?.countries)
        ? [...req?.body?.countries]
        : req?.body?.countries || [];
      const complianceFiles = await getFilePathsAdd(req, res, [
        "complianceFile",
      ]);
      const additionalFiles = await getFilePathsAdd(req, res, [
        "guidelinesFile",
      ]);
      const secondaryMarketFiles = await getFilePathsAdd(req, res, [
        "purchaseInvoiceFile",
      ]);
      const healthNSafetyFiles = await getFilePathsAdd(req, res, [
        "safetyDatasheet",
        "healthHazardRating",
        "environmentalImpact",
      ]);

      // Retrieve file paths for the selected category only
      const categoryFiles = await getFilePathsAdd(
        req,
        res,
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
      const product_id = "PRDT-" + Math.random().toString(16).slice(2, 10);

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
          handleCatchBlockError(req, res, error);
        }
      } else {
        cNCFileNDateParsed = JSON.parse(
          req.body?.cNCFileNDate?.filter((value) => value != "[object Object]")
        );
      }

      // Create new product with all necessary fields
      newProductData = {
        ...req?.body,
        product_id,
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
        newProductData["secondaryMarketDetails"] = {
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
        productId: newProduct?.product_id,
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
      handleCatchBlockError(req, res, error);
    }
  },

  addProduct2: async (req, res) => {
    try {
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
      const generalFiles = await getFilePathsAdd(req, res, ["image"]);
      // const inventoryFiles = { countries: JSON.parse(req?.body?.countries) };
      const inventoryFiles = Array.isArray(req?.body?.countries)
        ? [...req?.body?.countries]
        : req?.body?.countries || [];
      const complianceFiles = await getFilePathsAdd(req, res, [
        "complianceFile",
      ]);
      const additionalFiles = await getFilePathsAdd(req, res, [
        "guidelinesFile",
      ]);
      const secondaryMarketFiles = await getFilePathsAdd(req, res, [
        "purchaseInvoiceFile",
      ]);
      const healthNSafetyFiles = await getFilePathsAdd(req, res, [
        "safetyDatasheet",
        "healthHazardRating",
        "environmentalImpact",
      ]);

      // Retrieve file paths for the selected category only
      const categoryFiles = await getFilePathsAdd(
        req,
        res,
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
      const product_id = "PRDT-" + Math.random().toString(16).slice(2, 10);

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
          handleCatchBlockError(req, res, error);
        }
      } else {
        cNCFileNDateParsed = JSON.parse(
          req.body?.cNCFileNDate?.filter((value) => value != "[object Object]")
        );
      }

      // Create new product with all necessary fields
      newProductData = {
        ...req?.body,
        product_id,
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
        newProductData["secondaryMarketDetails"] = {
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
        productId: newProduct?.product_id,
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
      handleCatchBlockError(req, res, error);
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
      const generalFiles = await getFilePathsEdit(req, res, ["image"]);
      // const inventoryFiles = { countries: JSON.parse(req?.body?.countries) };
      const inventoryFiles = Array.isArray(req?.body?.countries)
        ? [...req?.body?.countries]
        : req?.body?.countries || [];
      const complianceFiles = await getFilePathsEdit(req, res, [
        "complianceFile",
      ]);
      const additionalFiles = await getFilePathsEdit(req, res, [
        "guidelinesFile",
      ]);
      const secondaryMarketFiles = await getFilePathsEdit(req, res, [
        "purchaseInvoiceFile",
      ]);
      const healthNSafetyFiles = await getFilePathsEdit(req, res, [
        "safetyDatasheet",
        "healthHazardRating",
        "environmentalImpact",
      ]);

      // Retrieve file paths for the selected category only
      const categoryFiles = await getFilePathsEdit(
        req,
        res,
        fileFields[category]
      );
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

        complianceFile: complianceFiles.complianceFile || [],
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
        updatedProductData["secondaryMarketDetails"] = {
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
      handleCatchBlockError(req, res, error);
    }
  },

  editProduct2: async (req, res) => {
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
      const generalFiles = await getFilePathsEdit(req, res, ["image"]);
      // const inventoryFiles = { countries: JSON.parse(req?.body?.countries) };
      const inventoryFiles = Array.isArray(req?.body?.countries)
        ? [...req?.body?.countries]
        : req?.body?.countries || [];
      const complianceFiles = await getFilePathsEdit(req, res, [
        "complianceFile",
      ]);
      const additionalFiles = await getFilePathsEdit(req, res, [
        "guidelinesFile",
      ]);
      const secondaryMarketFiles = await getFilePathsEdit(req, res, [
        "purchaseInvoiceFile",
      ]);
      const healthNSafetyFiles = await getFilePathsEdit(req, res, [
        "safetyDatasheet",
        "healthHazardRating",
        "environmentalImpact",
      ]);

      // Retrieve file paths for the selected category only
      const categoryFiles = await getFilePathsEdit(
        req,
        res,
        fileFields[category]
      );
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

        complianceFile: complianceFiles.complianceFile || [],
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
        updatedProductData["secondaryMarketDetails"] = {
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
      handleCatchBlockError(req, res, error);
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
      handleCatchBlockError(req, res, error);
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

      // Add any additional steps like sorting or pagination
      const totalProductsQuery = {
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
      };

      pipeline?.push({
        $match: totalProductsQuery,
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
          product_id: { $first: "$product_id" },
          supplier_id: { $first: "$supplier_id" },
          market: { $first: "$market" },
          secondaryMarketDetails: { $first: "$secondaryMarketDetails" },
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

      // if (deliveryTime?.min && deliveryTime?.max) {
      //   pipeline.push({
      //     $match: {
      //       priceQuantityDetails: {
      //         $elemMatch: {
      //           deliveryTime: {
      //             $gte: parseInt(deliveryTime?.min, 10),
      //             $lte: parseInt(deliveryTime?.max, 10),
      //           },
      //         },
      //       },
      //     },
      //   });
      // }

      pipeline.push({
        $sort: { createdAt: -1 },
      });

      // pagination
      pipeline.push({ $skip: offset });
      pipeline.push({ $limit: pageSize });

      // Execute the aggregation
      const products = await Product.aggregate(pipeline);
      const totalProducts = (await products?.length) || 0;
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
      handleCatchBlockError(req, res, error);
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

      // Add any additional steps like sorting or pagination
      const totalProductsQuery = {
        isDeleted: false,
        supplier_id: new mongoose.Types.ObjectId(foundProduct?.supplier_id),
        ...(foundProduct?.market && { market: foundProduct?.market }),
        _id: { $ne: new mongoose.Types.ObjectId(id) }, // Exclude the product with the same _id
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
      };

      pipeline?.push({
        $match: totalProductsQuery,
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
          product_id: { $first: "$product_id" },
          supplier_id: { $first: "$supplier_id" },
          market: { $first: "$market" },
          secondaryMarketDetails: { $first: "$secondaryMarketDetails" },
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

      // if (deliveryTime?.min && deliveryTime?.max) {
      //   pipeline.push({
      //     $match: {
      //       priceQuantityDetails: {
      //         $elemMatch: {
      //           deliveryTime: {
      //             $gte: parseInt(deliveryTime?.min, 10),
      //             $lte: parseInt(deliveryTime?.max, 10),
      //           },
      //         },
      //       },
      //     },
      //   });
      // }

      pipeline.push({
        $sort: { createdAt: -1 },
      });

      // pagination
      pipeline.push({ $skip: offset });
      pipeline.push({ $limit: pageSize });

      // Execute the aggregation
      const products = await Product.aggregate(pipeline);
      const totalProducts = (await products?.length) || 0;
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
      handleCatchBlockError(req, res, error);
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

      const updatedResult = results?.map((result) => {
        let updatedObject = {
          // _id: productId ? productId : undefined, // Add _id if Product Id* exists
          model: result?.["Part/Model Number*"]?.toString()?.trim() || "",
          name: result?.["Product Name*"]?.toString()?.trim() || "",
          category: result?.["Product Category*"]?.toString()?.trim() || "",
          subCategory:
            result?.["Product Sub Category*"]?.toString()?.trim() || "",
          upc:
            result?.["UPC (Universal Product Code)"]?.toString()?.trim() || "",
          aboutManufacturer:
            result?.["Short Description*"]?.toString()?.trim() || "",
          brand: result?.["Brand Name"]?.toString()?.trim() || "",
          form: result?.["Product Type/Form"]?.toString()?.trim() || "",
          quantity: Number(result?.["Product Total Quantity*"]) || 0 || 0,
          volumn: result?.["Product Volume"]?.toString()?.trim() || "",
          volumeUnit: result?.["Product Volume Unit"]?.toString()?.trim() || "",
          dimension: result?.["Product Dimension"]?.toString()?.trim() || "",
          dimensionUnit:
            result?.["Product Dimension Unit"]?.toString()?.trim() || "",
          weight: Number(result?.["Product Weight"]) || 0,
          unit: result?.["Product Weight Units"]?.toString()?.trim() || "",
          unit_tax: result?.["Product Tax%*"]?.toString()?.trim() || "",
          packageType:
            result?.["Product Packaging Type"]?.toString()?.trim() || "",
          packageMaterial:
            result?.["Product Packaging Material"]?.toString()?.trim() || "",
          storage: result?.["Storage Conditions"]?.toString()?.trim() || "",
          manufacturer: result?.["Manufacturer Name"]?.toString()?.trim() || "",
          countryOfOrigin:
            result?.["Manufacturer Country of Origin"]?.toString()?.trim() ||
            "",
          image:
            result?.["Product Image"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim()) || [], // array
          description:
            result?.["Product Description*"]?.toString()?.trim() || "",
          date: result?.["Date of Manufacture"]?.toString()?.trim() || "",
          sku: result?.["SKU"]?.toString()?.trim() || "",
          stock: result?.["Stock*"]?.toString()?.trim() || "",
          countries:
            result?.["Stocked in Countries"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim())
              ?.filter((ele) => ele != "" || ele != undefined || ele != null)
              ?.filter((ele) => ele) || [], // array
          country:
            result?.["Country where Stock Trades"]?.toString()?.trim() || "",
          quantity1: Number(result?.["Stock Quantity"]) || 0 || 0,
          quantity2: Number(result?.["Quantity From*"]) || 0,
          quantity3: Number(result?.["Quantity To*"]) || 0,
          price: Number(result?.["Cost Per Product*"]) || 0,
          deliveryTime:
            result?.["Est. Delivery Time"]?.toString()?.trim() || "",
          file:
            result?.["Regulatory Compliance"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim())
              ?.filter((ele) => ele != "" || ele != undefined || ele != null)
              ?.filter((ele) => ele) || [], // array
          date3: result?.["Date of Expiry"]?.toString()?.trim() || "",
          safetyDatasheet:
            result?.["Safety Datasheet"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim())
              ?.filter((ele) => ele != "" || ele != undefined || ele != null)
              ?.filter((ele) => ele) || [], // array
          healthHazardRating:
            result?.["Health Hazard Rating"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim())
              ?.filter((ele) => ele != "" || ele != undefined || ele != null)
              ?.filter((ele) => ele) || [], // array
          environmentalImpact:
            result?.["Environmental Impact"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim())
              ?.filter((ele) => ele != "" || ele != undefined || ele != null)
              ?.filter((ele) => ele) || [], // array
          warranty: result?.["Warranty"]?.toString()?.trim() || "",
          guidelinesFile:
            result?.["User Guidelines"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim())
              ?.filter((ele) => ele != "" || ele != undefined || ele != null)
              ?.filter((ele) => ele) || [], // array
          other: result?.["Other Information"]?.toString()?.trim() || "",
        };

        // Call the helper function to handle category-specific updates
        updatedObject = {
          ...updatedObject,
          ...handleProductCategorySwitch(result),
        };

        return updatedObject;
      });

      const previewResponse = updatedResult
        ?.map((elem, index) => {
          const elemCat = elem?.category;

          // Loop through each key in the object
          for (const key in elem) {
            if (elem.hasOwnProperty(key)) {
              const fieldName = getFieldName(
                key,
                additionalCheckFieldName(elemCat, key)
              );

              elem[key] = {
                value: elem[key],
                fieldName: fieldName,
                error:
                  validateFields(
                    fieldName?.includes("*"),
                    elem[key],
                    fieldName,
                    typeof elem[key]
                  ) || undefined,
              };
            }
          }
          return elem;
        })
        ?.map((ele) => {
          return {
            ...ele,
            anotherCategory: {
              ...ele?.anotherCategory,
              error: ele?.anotherCategory?.value
                ? validateAnotherCategory(
                    ele?.category?.value,
                    ele?.subCategory?.value,
                    ele?.anotherCategory?.value
                  ) === true
                  ? true
                  : undefined
                : undefined,
            },
          };
        });

      const previewHeadings = Object?.values(previewResponse?.[0])?.map(
        (field) => field?.fieldName
      );

      const entriesWithErrors = previewResponse?.filter((item) =>
        Object.values(item).some((field) => field.error)
      );

      // Filter out elements without errors
      const entriesWithoutErrors = previewResponse?.filter(
        (item) => !Object.values(item).some((field) => field.error)
      );

      // Remove the CSV file after processing
      fs.unlinkSync(filePath);

      return sendSuccessResponse(
        res,
        200,
        `${entriesWithoutErrors?.length} ${
          entriesWithoutErrors?.length == 1 ? "product" : "products"
        } imported successfully.`,
        {
          headings: previewHeadings || [],
          entriesWithErrors: entriesWithErrors || [],
          entriesWithErrorsCount: entriesWithErrors?.length || 0,
          entriesWithoutErrors: entriesWithoutErrors || [],
          entriesWithoutErrorsCount: entriesWithoutErrors?.length || 0,
        }
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  previewBulkUpload2: async (req, res) => {
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

      const updatedResult = results?.map((result) => {
        let updatedObject = {
          // _id: productId ? productId : undefined, // Add _id if Product Id* exists
          model: result?.["Part/Model Number*"]?.toString()?.trim() || "",
          name: result?.["Product Name*"]?.toString()?.trim() || "",
          category: result?.["Product Category*"]?.toString()?.trim() || "",
          subCategory:
            result?.["Product Sub Category*"]?.toString()?.trim() || "",
          upc:
            result?.["UPC (Universal Product Code)"]?.toString()?.trim() || "",
          aboutManufacturer:
            result?.["Short Description*"]?.toString()?.trim() || "",
          brand: result?.["Brand Name"]?.toString()?.trim() || "",
          form: result?.["Product Type/Form"]?.toString()?.trim() || "",
          quantity: Number(result?.["Product Total Quantity*"]) || 0 || 0,
          volumn: result?.["Product Volume"]?.toString()?.trim() || "",
          volumeUnit: result?.["Product Volume Unit"]?.toString()?.trim() || "",
          dimension: result?.["Product Dimension"]?.toString()?.trim() || "",
          dimensionUnit:
            result?.["Product Dimension Unit"]?.toString()?.trim() || "",
          weight: Number(result?.["Product Weight"]) || 0,
          unit: result?.["Product Weight Units"]?.toString()?.trim() || "",
          unit_tax: result?.["Product Tax%*"]?.toString()?.trim() || "",
          packageType:
            result?.["Product Packaging Type"]?.toString()?.trim() || "",
          packageMaterial:
            result?.["Product Packaging Material"]?.toString()?.trim() || "",
          storage: result?.["Storage Conditions"]?.toString()?.trim() || "",
          manufacturer: result?.["Manufacturer Name"]?.toString()?.trim() || "",
          countryOfOrigin:
            result?.["Manufacturer Country of Origin"]?.toString()?.trim() ||
            "",
          image:
            result?.["Product Image"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim()) || [], // array
          description:
            result?.["Product Description*"]?.toString()?.trim() || "",
          date: result?.["Date of Manufacture"]?.toString()?.trim() || "",
          sku: result?.["SKU"]?.toString()?.trim() || "",
          stock: result?.["Stock*"]?.toString()?.trim() || "",
          countries:
            result?.["Stocked in Countries"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim())
              ?.filter((ele) => ele != "" || ele != undefined || ele != null)
              ?.filter((ele) => ele) || [], // array
          country:
            result?.["Country where Stock Trades*"]?.toString()?.trim() || "",
          quantity1: Number(result?.["Stock Quantity"]) || 0 || 0,
          quantity2: Number(result?.["Quantity From*"]) || 0,
          quantity3: Number(result?.["Quantity To*"]) || 0,
          price: Number(result?.["Cost Per Product*"]) || 0,
          deliveryTime:
            result?.["Est. Delivery Time"]?.toString()?.trim() || "",
          file:
            result?.["Regulatory Compliance"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim())
              ?.filter((ele) => ele != "" || ele != undefined || ele != null)
              ?.filter((ele) => ele) || [], // array
          date3: result?.["Date of Expiry"]?.toString()?.trim() || "",
          safetyDatasheet:
            result?.["Safety Datasheet"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim())
              ?.filter((ele) => ele != "" || ele != undefined || ele != null)
              ?.filter((ele) => ele) || [], // array
          healthHazardRating:
            result?.["Health Hazard Rating"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim())
              ?.filter((ele) => ele != "" || ele != undefined || ele != null)
              ?.filter((ele) => ele) || [], // array
          environmentalImpact:
            result?.["Environmental Impact"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim())
              ?.filter((ele) => ele != "" || ele != undefined || ele != null)
              ?.filter((ele) => ele) || [], // array
          warranty: result?.["Warranty"]?.toString()?.trim() || "",
          guidelinesFile:
            result?.["User Guidelines"]
              ?.split(",")
              ?.map((ele) => ele?.toString()?.trim())
              ?.filter((ele) => ele != "" || ele != undefined || ele != null)
              ?.filter((ele) => ele) || [], // array
          other: result?.["Other Information"]?.toString()?.trim() || "",
        };

        // Call the helper function to handle category-specific updates
        updatedObject = {
          ...updatedObject,
          ...handleProductCategorySwitch2(result),
        };

        return updatedObject;
      });

      const previewResponse = updatedResult
        ?.map((elem, index) => {
          const elemCat = elem?.category;

          // Loop through each key in the object
          for (const key in elem) {
            if (elem.hasOwnProperty(key)) {
              const fieldName = getFieldName2(
                key,
                additionalCheckFieldName(elemCat, key)
              );

              elem[key] = {
                value: elem[key],
                fieldName: fieldName,
                error:
                  validateFields(
                    fieldName?.includes("*"),
                    elem[key],
                    fieldName,
                    typeof elem[key]
                  ) || undefined,
              };
            }
          }
          return elem;
        })
        ?.map((ele) => {
          return {
            ...ele,
            anotherCategory: {
              ...ele?.anotherCategory,
              error: ele?.anotherCategory?.value
                ? validateAnotherCategory(
                    ele?.category?.value,
                    ele?.subCategory?.value,
                    ele?.anotherCategory?.value
                  ) === true
                  ? true
                  : undefined
                : undefined,
            },
          };
        });

      const previewHeadings = Object?.values(previewResponse?.[0])?.map(
        (field) => field?.fieldName
      );

      const entriesWithErrors = previewResponse?.filter((item) =>
        Object.values(item).some((field) => field.error)
      );

      // Filter out elements without errors
      const entriesWithoutErrors = previewResponse?.filter(
        (item) => !Object.values(item).some((field) => field.error)
      );

      // Remove the CSV file after processing
      fs.unlinkSync(filePath);

      return sendSuccessResponse(
        res,
        200,
        `${entriesWithoutErrors?.length} ${
          entriesWithoutErrors?.length == 1 ? "product" : "products"
        } imported successfully.`,
        {
          headings: previewHeadings || [],
          entriesWithErrors: entriesWithErrors || [],
          entriesWithErrorsCount: entriesWithErrors?.length || 0,
          entriesWithoutErrors: entriesWithoutErrors || [],
          entriesWithoutErrorsCount: entriesWithoutErrors?.length || 0,
        }
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  bulkUpload: async (req, res) => {
    try {
      const { products } = req?.body;
      // Extract the value of each key
      const inventoryArray = [];
      const extractedValues = products?.map((item) => {
        const inventoryUUId = uuidv4();
        const product_id = "PRDT-" + Math.random().toString(16).slice(2, 10);
        const extracted = {};

        const inventoryObj = {
          uuid: inventoryUUId,
          productId: product_id,
          sku: item?.sku?.value,
          stock: item?.stock?.value,
          countries: item?.countries?.value,
          date: item?.date?.value,
          stockedInDetails: [
            {
              country: item?.country?.value,
              quantity: item?.quantity1?.value,
            },
          ],
          inventoryList: [
            {
              quantityFrom: item?.quantity2?.value,
              quantityTo: item?.quantity3?.value,
              price: item?.price?.value,
              deliveryTime: item?.deliveryTime?.value,
            },
          ],
          isDeleted: false,
        };
        inventoryArray?.push(inventoryObj);
        // const category_name = item?.category?.value;
        for (const [key, field] of Object.entries(item)) {
          if (key == "category") {
            extracted[key] = getCategoryName(field?.value);
          } else {
            extracted[key] = field.value; // Extract the value
          }
        }
        delete extracted?._id;
        return {
          ...extracted,
          general: extracted,
          complianceFile: [extracted?.file?.[0] || ""],
          cNCFileNDate: [
            {
              file: extracted?.file?.[0] || "",
              date: extracted?.date3 || "",
            },
          ]
            ?.filter(
              (ele) =>
                ele?.file != "" ||
                ele?.file != undefined ||
                ele?.file != null ||
                ele?.date != "" ||
                ele?.date != undefined ||
                ele?.date != null
            )
            ?.filter((ele) => ele?.file || ele?.date),
          additional: extracted,
          market: "new",
          isDeleted: false,
          bulkUpload: true,
          healthNSafety: extracted,
          inventory: inventoryUUId,
          product_id,
          [extracted?.category]: { ...extracted },
        };
      });

      // Insert multiple records into MongoDB
      const entries = await Product.insertMany(extractedValues);

      if (!entries || entries?.length == 0) {
        return sendErrorResponse(res, 400, "Failed to add bulk products.");
      }

      if (inventoryArray?.length > 0) {
        const inventories = await Inventory.insertMany(inventoryArray);

        if (!inventories || inventories?.length == 0) {
          return sendErrorResponse(res, 400, "Failed to add bulk inventories.");
        }
      }
      return sendSuccessResponse(
        res,
        200,
        ` ${entries.length} ${
          entries?.length == 1 ? "product" : "products"
        } have been uploaded successfully.`,
        entries
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  bulkUpload2: async (req, res) => {
    try {
      const { products } = req?.body;
      // Extract the value of each key
      const inventoryArray = [];
      const extractedValues = products?.map((item) => {
        const inventoryUUId = uuidv4();
        const product_id = "PRDT-" + Math.random().toString(16).slice(2, 10);
        const extracted = {};

        const inventoryObj = {
          uuid: inventoryUUId,
          productId: product_id,
          sku: item?.sku?.value,
          stock: item?.stock?.value,
          countries: item?.countries?.value,
          date: item?.date?.value,
          stockedInDetails: [
            {
              country: item?.country?.value,
              quantity: item?.quantity1?.value,
            },
          ],
          inventoryList: [
            {
              quantityFrom: item?.quantity2?.value,
              quantityTo: item?.quantity3?.value,
              price: item?.price?.value,
              deliveryTime: item?.deliveryTime?.value,
            },
          ],
          isDeleted: false,
        };
        inventoryArray?.push(inventoryObj);
        // const category_name = item?.category?.value;
        for (const [key, field] of Object.entries(item)) {
          if (key == "category") {
            extracted[key] = getCategoryName(field?.value);
          } else {
            extracted[key] = field.value; // Extract the value
          }
        }
        delete extracted?._id;
        return {
          ...extracted,
          general: extracted,
          complianceFile: [extracted?.file?.[0] || ""],
          cNCFileNDate: [
            {
              file: extracted?.file?.[0] || "",
              date: extracted?.date3 || "",
            },
          ]
            ?.filter(
              (ele) =>
                ele?.file != "" ||
                ele?.file != undefined ||
                ele?.file != null ||
                ele?.date != "" ||
                ele?.date != undefined ||
                ele?.date != null
            )
            ?.filter((ele) => ele?.file || ele?.date),
          additional: extracted,
          market: "new",
          isDeleted: false,
          bulkUpload: true,
          healthNSafety: extracted,
          inventory: inventoryUUId,
          product_id,
          [extracted?.category]: { ...extracted },
        };
      });

      // Insert multiple records into MongoDB
      const entries = await Product.insertMany(extractedValues);

      if (!entries || entries?.length == 0) {
        return sendErrorResponse(res, 400, "Failed to add bulk products.");
      }

      if (inventoryArray?.length > 0) {
        const inventories = await Inventory.insertMany(inventoryArray);

        if (!inventories || inventories?.length == 0) {
          return sendErrorResponse(res, 400, "Failed to add bulk inventories.");
        }
      }
      return sendSuccessResponse(
        res,
        200,
        ` ${entries.length} ${
          entries?.length == 1 ? "product" : "products"
        } have been uploaded successfully.`,
        entries
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  csvDownload: async (req, res) => {
    try {
      const { products } = req?.body;

      // Extract the value of each key and dynamically set the field names
      const extractedValues = products?.map((item) => {
        const elemCat = item?.category;
        const extracted = {};

        for (const [key, field] of Object.entries(item)) {
          let value = field.value; // Get the field value

          // If the value is an array, join it as a string
          if (Array.isArray(value)) {
            value = value.join(", ");
          }

          // If the value is a number and it's 0, replace it with an empty string
          if (
            !isNaN(Number(value)) &&
            typeof value === "number" &&
            value === 0
          ) {
            value = "";
          }

          // Remove the "_id" field if present
          if (key === "_id") continue;

          extracted[getFieldName(key, additionalCheckFieldName(elemCat, key))] =
            String(value); // Assign the mapped field name and the value
        }

        return extracted;
      });

      // Convert the flattened data to CSV
      const csv = parse(extractedValues);

      // Set headers for file download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=product.csv");

      // Send the CSV file as a response
      res.status(200).send(csv);
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  csvDownload2: async (req, res) => {
    try {
      const { products } = req?.body;

      // Extract the value of each key and dynamically set the field names
      const extractedValues = products?.map((item) => {
        const elemCat = item?.category;
        const extracted = {};

        for (const [key, field] of Object.entries(item)) {
          let value = field.value; // Get the field value

          // If the value is an array, join it as a string
          if (Array.isArray(value)) {
            value = value.join(", ");
          }

          // If the value is a number and it's 0, replace it with an empty string
          if (
            !isNaN(Number(value)) &&
            typeof value === "number" &&
            value === 0
          ) {
            value = "";
          }

          // Remove the "_id" field if present
          if (key === "_id") continue;

          extracted[
            getFieldName2(key, additionalCheckFieldName(elemCat, key))
          ] = String(value); // Assign the mapped field name and the value
        }

        return extracted;
      });

      // Convert the flattened data to CSV
      const csv = parse(extractedValues);

      // Set headers for file download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=product.csv");

      // Send the CSV file as a response
      res.status(200).send(csv);
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  uploadCsvSheet: async (req, res) => {
    try {
      const { usertype } = req.headers;
      const { id, category } = req.params;

      if (!usertype) return sendErrorResponse(res, 400, "Need User type.");
      if (!id) return sendErrorResponse(res, 400, "Need User Id.");
      if (!category)
        return sendErrorResponse(res, 400, "Need Product Category.");

      // Get uploaded CSV files (should be an array of file URLs)
      const csvFilesFromAWS = await getFilePathsAdd(req, res, ["csvFile"]);
      if (!csvFilesFromAWS || !csvFilesFromAWS.length) {
        return sendErrorResponse(res, 400, "No files uploaded.");
      }

      const existingDoc = await CsvFile.findOne({ userId: id });

      if (existingDoc) {
        // Append a new object to the category's array
        const updateQuery = {
          $push: {
            [category]: {
              file: csvFilesFromAWS?.[0], // <- Must match schema: array of strings
              status: "Pending",
            },
          },
        };

        const updatedDoc = await CsvFile.findOneAndUpdate(
          { userId: id },
          updateQuery,
          { new: true }
        );

        return sendSuccessResponse(
          res,
          200,
          "CSV File uploaded successfully",
          updatedDoc
        );
      } else {
        // Create a new document with one entry under the selected category
        const newCsvFile = await CsvFile.create({
          userId: id,
          isMainTemplate: usertype === "Supplier" ? false : true,
          [category]: [
            {
              file: csvFilesFromAWS,
              status: "Pending",
            },
          ],
        });

        return sendSuccessResponse(
          res,
          200,
          "CSV File uploaded successfully",
          newCsvFile
        );
      }
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getSupplierCsvFiles: async (req, res) => {
    try {
      const { id } = req?.params;
      if (!id) {
        return sendErrorResponse(res, 400, "Need User Id.");
      }

      const csvFile = await CsvFile.findOne({ userId: id });

      if (!csvFile) {
        return sendErrorResponse(
          res,
          400,
          "Need CSV File uploaded by this Supplier."
        );
      }

      return sendSuccessResponse(
        res,
        200,
        "Profile updated successfully",
        csvFile
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getCsvTemplateFiles: async (req, res) => {
    try {
      const csvFile = await CsvFile.findOne({ isMainTemplate: true });

      if (!csvFile) {
        return sendErrorResponse(
          res,
          400,
          "Need CSV File uploaded by this Supplier."
        );
      }

      return sendSuccessResponse(
        res,
        200,
        "Profile updated successfully",
        csvFile
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  updateSupplierCsvFile: async (req, res) => {
    try {
      const { userId, category, id } = req?.params;
      const { status } = req?.body;

      // Find the CSV file for the given user
      const csvFile = await CsvFile.findOne({ userId });

      if (!csvFile) {
        return sendErrorResponse(
          res,
          400,
          "No CSV File uploaded by this Supplier."
        );
      }

      // Find the file within the category array by its _id
      const fileToUpdate = csvFile[category]?.find(
        (file) => file?._id.toString() === id
      );

      if (!fileToUpdate) {
        return sendErrorResponse(res, 400, "File not found.");
      }

      // Update the status of the file
      fileToUpdate.status = status;

      // Update the category array with the modified file
      const updatedCsvFile = await CsvFile.findOneAndUpdate(
        { userId },
        {
          $set: {
            [`${category}.$[elem].status`]: status, // Update the status of the specific file
          },
        },
        {
          arrayFilters: [{ "elem._id": id }], // Use array filters to target the file by _id
          new: true, // Return the updated document
        }
      );

      return sendSuccessResponse(
        res,
        200,
        "Profile updated successfully",
        updatedCsvFile
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  deleteAdminCsvTemplateFile: async (req, res) => {
    try {
      const { userId, category, id } = req?.params;

      // Find the CSV file for the given user
      const csvFile = await CsvFile.findOne({ userId });

      if (!csvFile) {
        return sendErrorResponse(
          res,
          400,
          "No CSV File uploaded by this Supplier."
        );
      }

      // Ensure the category exists
      if (!csvFile[category]) {
        return sendErrorResponse(
          res,
          400,
          `Category ${category} not found in the CSV file.`
        );
      }

      // Remove the file from the specified category
      const updatedCsvFile = await CsvFile.findOneAndUpdate(
        { userId },
        {
          $pull: {
            [category]: { _id: id }, // Remove the file with the matching _id in the category
          },
        },
        { new: true } // Return the updated document
      );

      // Check if the update was successful (the array might be empty after removal)
      if (!updatedCsvFile) {
        return sendErrorResponse(res, 400, "Failed to remove the file.");
      }

      return sendSuccessResponse(
        res,
        200,
        "File deleted successfully",
        updatedCsvFile
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getAllProductQualityReports: async (req, res) => {
    try {
      const {
        supplier_name,
        supplier_id,
        category = "AlternativeMedicines",
        subCategory = "Homeopathy",
        downloadCsv = false,
        searchKey,
      } = req?.body;

      // If supplier_name is provided, override supplier_id with supplier._id
      if (supplier_name) {
        const supplier = await Supplier.findOne({ supplier_name });
        if (supplier?._id) {
          totalProductsQuery = {
            ...totalProductsQuery,
            supplier_id: supplier._id,
          };
        }
      }

      // If searchKey is provided, check for supplier
      if (searchKey) {
        const supplier2 = await Supplier.findOne({ supplier_name: searchKey });
        if (supplier2?._id) {
          totalProductsQuery = {
            ...totalProductsQuery,
            supplier_id: supplier2._id,
          };
        }
        const supplier3 = await Supplier.findOne({ supplier_id: searchKey });
        if (supplier3?._id) {
          totalProductsQuery = {
            ...totalProductsQuery,
            supplier_id: supplier3._id,
          };
        }
      }
      const formatToPascalCase = (str) => {
        return str
          .trim()
          .split(/\s+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join("");
      };

      const formattedCategory = formatToPascalCase(category);
      const formattedSubCategory = formatToPascalCase(subCategory);

      const pageNo = parseInt(req?.query?.pageNo) || 1;
      const pageSize = parseInt(req?.query?.pageSize) || 20;
      const offset = (pageNo - 1) * pageSize;

      // Build query with spread operator
      let totalProductsQuery = {
        isDeleted: false,
        ...(supplier_id && {
          supplier_id: new mongoose.Types.ObjectId(supplier_id),
        }),
        ...(formattedCategory && {
          category: { $regex: formattedCategory, $options: "i" },
        }),
        ...(subCategory && {
          [`${formattedCategory}.subCategory`]: {
            $regex: subCategory,
            $options: "i",
          },
        }),
        ...(searchKey && {
          "general.name": { $regex: searchKey, $options: "i" },
        }),
        ...(searchKey && {
          "general.model": { $regex: searchKey, $options: "i" },
        }),
        ...(searchKey && {
          product_id: { $regex: searchKey, $options: "i" },
        }),
        ...(searchKey && {
          category: { $regex: searchKey, $options: "i" },
        }),
      };

      let pipeline = [];

      // Match stage
      pipeline.push({ $match: totalProductsQuery });

      // Lookup supplier details
      pipeline.push({
        $lookup: {
          from: "suppliers",
          localField: "supplier_id",
          foreignField: "_id",
          as: "supplierDetails",
        },
      });

      // Unwind supplierDetails
      pipeline.push({
        $unwind: {
          path: "$supplierDetails",
          preserveNullAndEmptyArrays: true,
        },
      });

      // // Lookup inventory details
      // pipeline.push({
      //   $lookup: {
      //     from: "inventories",
      //     localField: "inventory",
      //     foreignField: "uuid",
      //     as: "inventoryDetails",
      //   },
      // });

      // // Unwind inventoryDetails
      // pipeline.push({
      //   $unwind: {
      //     path: "$inventoryDetails",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // });

      // Execute aggregation
      pipeline.push({ $sort: { createdAt: -1 } });

      // Clone pipeline for total count calculation
      const countPipeline = [...pipeline];
      countPipeline.push({ $count: "total" });
      const countResult = await Product.aggregate(countPipeline);
      const totalProducts = countResult[0]?.total || 0;
      // Add pagination
      pipeline.push({ $skip: offset });
      pipeline.push({ $limit: pageSize });
      pipeline.push({ $skip: offset });
      pipeline.push({ $limit: pageSize });
      const products = await Product.aggregate(pipeline);
      const totalPages = Math.ceil(totalProducts / pageSize);

      const modifiedProductsResult = products
        ?.map((product) => ({
          ...product?.general,
          // ...product?.inventoryDetails,
          category: getCategoryNameForHeading(product?.category),
          subCategory: product[product?.category]?.subCategory, // Dynamically access the subCategory
          product_id: product?.product_id,
          supplier_name: product?.supplierDetails?.supplier_name,
          supplier_id: product?.supplierDetails?.supplier_id,
          market:
            product?.market?.charAt(0).toUpperCase() +
            product?.market?.slice(1),
          // ...product?.secondaryMarketDetails,
        }))
        ?.filter((item) => {
          return (
            !item?.name ||
            !item?.description ||
            item?.description?.length < 100 ||
            !item?.aboutManufacturer ||
            !item?.model ||
            !item?.image?.length ||
            !item?.category ||
            !item?.subCategory ||
            !item?.product_id ||
            !item?.supplier_name ||
            !item?.supplier_id ||
            !item?.market
          );
        });

      if (
        modifiedProductsResult?.length == 0 ||
        !modifiedProductsResult?.length
      )
        return sendSuccessResponse(
          res,
          200,
          "No Quality reports of supplier products",
          {}
        );

      const overAllTotalProducts = await Product.find({
        ...(supplier_id && { supplier_id }),
      });

      if (downloadCsv) {
        // Convert Mongoose document to plain object and flatten
        const flattenedData = modifiedProductsResult?.map((item) =>
          flattenData(
            item,
            [
              "_id",
              "__v",
              "description",
              "manufacturer",
              "countryOfOrigin",
              "upc",
              "brand",
              "form",
              "quantity",
              "volumn",
              "volumeUnit",
              "dimension",
              "dimensionUnit",
              "weight",
              "unit",
              "unit_tax",
              "packageType",
              "packageMaterial",
              "packageMaterialIfOther",
              "inventory",
            ],
            [
              "supplier_id",
              "supplier_name",
              "product_id",
              "name",
              "market",
              "category",
              "subCategory",
              "model",
              "image",
              "aboutManufacturer",
            ],
            "product_quality_report_list"
          )
        ); // `toObject()` removes internal Mongoose metadata

        const fieldMapping = {
          "Supplier Id": "Supplier Id",
          "Supplier Name": "Supplier Name",
          "Product Id": "Product Id",
          Model: "Product Model",
          Name: "Product Name",
          AboutManufacturer: "Short Description",
          Image: "Product Image",
          Category: "Product Category",
          SubCategory: "Product Sub Category",
          Market: "Market",
        };

        // Convert the flattened data to CSV
        const csv = parse(flattenedData, {
          fields: Object.entries(fieldMapping).map(([value, label]) => ({
            label,
            value,
          })),
        });

        // Set headers for file download
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=users.csv");

        res.status(200).send(csv);
      } else
        return sendSuccessResponse(
          res,
          200,
          "Success fetching supplier products",
          {
            products: modifiedProductsResult,
            overAllTotalProducts: overAllTotalProducts?.length || 0,
            totalItems: totalProducts,
            currentPage: parseInt(pageNo),
            itemsPerPage: parseInt(pageSize),
            totalPages,
          }
        );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },
};
