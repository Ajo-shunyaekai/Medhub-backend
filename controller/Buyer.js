const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Buyer = require("../schema/buyerSchema");
const Supplier = require("../schema/supplierSchema");
const Order = require("../schema/orderSchema");
const { Medicine } = require("../schema/medicineSchema");
const MedicineInventory = require("../schema/medicineInventorySchema");
const Support = require("../schema/supportSchema");
const List = require("../schema/addToListSchema");
const Enquiry = require("../schema/enquiryListSchema");
const PurchaseOrder = require("../schema/purchaseOrderSchema");
const Notification = require("../schema/notificationSchema");
const OrderHistory = require("../schema/orderHistorySchema");
const Invoice = require("../schema/invoiceSchema");
const Product = require("../schema/productSchema");
const nodemailer = require("nodemailer");
const { sendEmail, sendTemplateEmail } = require("../utils/emailService");
const { getTodayFormattedDate } = require("../utils/utilities");
const logErrorToFile = require("../logs/errorLogs");
const {
  sendErrorResponse,
  handleCatchBlockError,
} = require("../utils/commonResonse");
const { getLoginFrequencyLast90Days } = require("../utils/userUtils");

module.exports = {
  buyerProfileDetails : async(req, res, reqObj, callback) => {
    try {
      // Buyer.findOne({buyer_id: reqObj.buyer_id}).select('buyer_id buyer_name email mobile country_code company_name')
      const fields = {
        token    : 0,
        password : 0
      }
      Buyer.findOne({buyer_id: req?.params?.id}).select(fields)  
      .then((data) => {
         const loginFrequency = getLoginFrequencyLast90Days(data.login_history);
        const resultData = {
          ...data.toObject(),
          loginFrequencyLast90Days: loginFrequency,
        };
        callback({code: 200, message : 'Buyer details fetched successfully',  result: resultData,})
    }).catch((error) => {
        console.error('Error:', error);
        callback({code: 400, message : 'Error in fetching buyer details'})
    });
    }catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },
  
  mySupplierList: async (req, res, reqObj, callback) => {
    try {
      const { supplier_id, buyer_id, status, pageNo, pageSize } = reqObj;
      const page_no = pageNo || 1;
      const page_size = pageSize || 2;
      const offset = (page_no - 1) * page_size;

      const countPipeline = [
        {
          $match: { buyer_id: buyer_id },
        },
        {
          $lookup: {
            from: "orders",
            let: { buyerId: "$buyer_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$buyer_id", "$$buyerId"] },
                      { $eq: ["$status", "Completed"] },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: "$supplier_id",
                },
              },
            ],
            as: "my_suppliers",
          },
        },
        {
          $unwind: "$my_suppliers",
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "my_suppliers._id",
            foreignField: "supplier_id",
            pipeline: [
              {
                $project: {
                  password: 0,
                  token: 0,
                },
              },
            ],
            as: "supplier_details",
          },
        },
        {
          $unwind: {
            path: "$supplier_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $count: "total_items",
        },
      ];

      const paginatedPipeline = [
        {
          $match: { buyer_id: buyer_id },
        },
        {
          $lookup: {
            from: "orders",
            let: { buyerId: "$buyer_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$buyer_id", "$$buyerId"] },
                      { $eq: ["$status", "Completed"] },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: "$supplier_id",
                },
              },
            ],
            as: "my_suppliers",
          },
        },
        {
          $unwind: "$my_suppliers",
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "my_suppliers._id",
            foreignField: "supplier_id",
            pipeline: [
              {
                $project: {
                  password: 0,
                  token: 0,
                },
              },
            ],
            as: "supplier_details",
          },
        },
        {
          $unwind: {
            path: "$supplier_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $skip: offset,
        },
        {
          $limit: page_size,
        },
        {
          $project: {
            supplier_details: 1,
            _id: 0,
          },
        },
      ];

      // Run the count query
      const totalItemsResult = await Buyer.aggregate(countPipeline);
      const totalItems =
        totalItemsResult.length > 0 ? totalItemsResult[0].total_items : 0;

      // Run the paginated query
      const paginatedResults = await Buyer.aggregate(paginatedPipeline);

      callback({
        code: 200,
        message: "List fetched successfully",
        result: {
          totalItems: totalItems,
          totalItemsPerPage: page_size,
          data: paginatedResults,
        },
      });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  supplierProductList: async (req, res, reqObj, callback) => {
    try {
      const { supplier_id, pageNo, pageSize, medicine_type } = reqObj;

      const page_no = pageNo || 1;
      const page_size = pageSize || 2;
      const offset = (page_no - 1) * page_size;

      const supplier = await Supplier.findOne({ supplier_id: supplier_id });

      Product.aggregate([
        {
          $match: {
            supplier_id: supplier._id,
            market: medicine_type,
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
          $addFields: {
            categoryObject: {
              $getField: {
                field: "$category",
                input: "$$ROOT",
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            supplier_id: 1,
            product_id: 1,
            market: 1,
            inventory: 1,
            storage: 1,
            category: 1,
            isDeleted: 1,
            bulkUpload: 1,
            general: 1,
            categoryObject: 1, // Dynamically extracted category object
            inventoryDetails: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: offset },
        { $limit: page_size },
      ])
        .then((data) => {
          Product.countDocuments({
            supplier_id: supplier._id,
            market: medicine_type,
          })
            .then((totalItems) => {
              const totalPages = Math.ceil(totalItems / page_size);
              const returnObj = {
                data,
                totalPages,
                totalItems,
              };
              callback({
                code: 200,
                message: "Supplier product list fetched successfully",
                result: returnObj,
              });
            })
            .catch((err) => {
              callback({
                code: 400,
                message: "Error while fetching supplier product list",
                result: err,
              });
            });
        })
        .catch((err) => {
          logErrorToFile(err, req);
          callback({
            code: 400,
            message: "Error fetching medicine list",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  buyerSupplierOrdersList: async (req, res, reqObj, callback) => {
    try {
      const { supplier_id, buyer_id, pageNo, pageSize, order_type } = reqObj;

      const page_no = pageNo || 1;
      const page_size = pageSize || 2;
      const offset = (page_no - 1) * page_size;

      const orderTypeMatch = order_type ? { order_status: order_type } : {};

      Order.aggregate([
        {
          $match: {
            buyer_id: buyer_id,
            supplier_id: supplier_id,
            // order_status : 'completed',
          },
        },
        {
          $facet: {
            completedCount: [
              { $match: { order_status: "completed" } },
              { $count: "completed" },
            ],
            activeCount: [
              { $match: { order_status: "active" } },
              { $count: "active" },
            ],
            pendingCount: [
              { $match: { order_status: "pending" } },
              { $count: "pending" },
            ],
            orderList: [
              { $match: orderTypeMatch },
              { $sort: { created_at: -1 } },
              { $skip: offset },
              { $limit: page_size },
              {
                $project: {
                  order_id: 1,
                  buyer_id: 1,
                  supplier_id: 1,
                  items: 1,
                  order_status: 1,
                  status: 1,
                  created_at: 1,
                },
              },
            ],
            totalOrders: [{ $match: orderTypeMatch }, { $count: "total" }],
          },
        },
      ])
        .then((data) => {
          const resultObj = {
            completedCount: data[0]?.completedCount[0]?.completed || 0,
            activeCount: data[0]?.activeCount[0]?.active || 0,
            pendingCount: data[0]?.pendingCount[0]?.pending || 0,
            orderList: data[0]?.orderList,
            totalOrders: data[0]?.totalOrders[0]?.total || 0,
          };
          callback({
            code: 200,
            message: "buyer supplier order list fetched successfully",
            result: resultObj,
          });
        })
        .catch((err) => {
          logErrorToFile(err, req);
          callback({
            code: 400,
            message: "error while fetching buyer supplier order list",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  buyerDashboardOrderDetails: async (req, res, reqObj, callback) => {
    try {
      const { buyer_id } = reqObj;

      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Aggregation for Orders
      const ordersAggregation = [
        {
          $match: {
            buyer_id: buyer_id,
            // created_at : { $gte: today }
          },
        },
        {
          $addFields: {
            numeric_total_price: {
              $toDouble: {
                $arrayElemAt: [{ $split: ["$grand_total", " "] }, 0],
              },
            },
          },
        },
        {
          $facet: {
            completedCount: [
              { $match: { order_status: "completed" } },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  total_purchase: { $sum: "$numeric_total_price" },
                },
              },
              {
                $project: {
                  _id: 0,
                  count: 1,
                  total_purchase: 1,
                },
              },
            ],
            activeCount: [
              { $match: { order_status: "active" } },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  total_purchase: { $sum: "$numeric_total_price" },
                },
              },
              {
                $project: {
                  _id: 0,
                  count: 1,
                  total_purchase: 1,
                },
              },
            ],
            pendingCount: [
              { $match: { order_status: "pending" } },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  total_purchase: { $sum: "$numeric_total_price" },
                },
              },
              {
                $project: {
                  _id: 0,
                  count: 1,
                  total_purchase: 1,
                },
              },
            ],
            totalPurchaseAmount: [
              {
                $group: {
                  _id: null,
                  total_purchase: { $sum: "$numeric_total_price" },
                },
              },
              {
                $project: {
                  _id: 0,
                  total_purchase: 1,
                },
              },
            ],
          },
        },
      ];

      const purchaseOrdersAggregation = [
        {
          $match: {
            buyer_id: buyer_id,
            // created_at : { $gte: today },
            po_status: "active",
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            total_amount: { $sum: "$amount" },
          },
        },
        {
          $project: {
            _id: 0,
            count: 1,
            total_amount: 1,
          },
        },
      ];

      // Aggregation for Enquiries
      const enquiriesAggregation = [
        {
          $match: {
            buyer_id: buyer_id,
            // created_at : { $gte: today }
          },
        },
        {
          $match: { enquiry_status: { $ne: "order created" } },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            count: 1,
          },
        },
      ];

      // Aggregation for Invoices
      const invoicesAggregation = [
        {
          $match: {
            buyer_id: buyer_id,
          },
        },
        {
          $facet: {
            paid: [
              { $match: { invoice_status: "paid" } },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  _id: 0,
                  count: 1,
                },
              },
            ],
            pending: [
              { $match: { invoice_status: "pending" } },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  _id: 0,
                  count: 1,
                },
              },
            ],
          },
        },
      ];

      const countPipeline = [
        {
          $match: { buyer_id: buyer_id },
        },
        {
          $lookup: {
            from: "orders",
            let: { buyerId: "$buyer_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$buyer_id", "$$buyerId"] },
                      { $eq: ["$status", "Completed"] },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: "$supplier_id",
                },
              },
            ],
            as: "my_suppliers",
          },
        },
        {
          $unwind: "$my_suppliers",
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "my_suppliers._id",
            foreignField: "supplier_id",
            as: "supplier_details",
          },
        },
        {
          $unwind: "$supplier_details",
        },
        {
          $count: "total_items",
        },
      ];
      const supplierCount = await Order.aggregate(countPipeline);

      const [ordersData, purchaseOrdersData, enquiriesData, invoicesData] =
        await Promise.all([
          Order.aggregate(ordersAggregation),
          PurchaseOrder.aggregate(purchaseOrdersAggregation),
          Enquiry.aggregate(enquiriesAggregation),
          Invoice.aggregate(invoicesAggregation),
        ]);

      // Prepare the final result
      const result = {
        orderDetails: ordersData[0],
        purchaseOrderCount: purchaseOrdersData[0]?.count || 0,
        purchaseOrderTotalAmount: purchaseOrdersData[0]?.total_amount || 0,
        enquiryCount: enquiriesData[0]?.count || 0,
        invoiceDetails: {
          paidCount: invoicesData[0]?.paid[0]?.count || 0,
          pendingCount: invoicesData[0]?.pending[0]?.count || 0,
        },
        supplierCount: supplierCount.length,
      };

      callback({
        code: 200,
        message: "Buyer dashboard order details fetched successfully",
        result,
      });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  buyerOrderSellerCountry: async (req, res, reqObj, callback) => {
    try {
      const { buyer_id } = reqObj;

      Order.aggregate([
        {
          $match: { buyer_id: buyer_id },
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "supplier_id",
            foreignField: "supplier_id",
            as: "supplier",
          },
        },
        {
          $unwind: "$supplier",
        },
        {
          $addFields: {
            numeric_total_price: {
              $toDouble: {
                $arrayElemAt: [{ $split: ["$grand_total", " "] }, 0],
              },
            },
          },
        },
        {
          $group: {
            _id: "$supplier.country_of_origin",
            total_purchase: { $sum: "$numeric_total_price" },
          },
        },
        {
          $project: {
            _id: 0,
            country: "$_id",
            value: "$total_purchase",
          },
        },
      ])
        .then((data) => {
          callback({
            code: 200,
            message: "buyer seller country fetched successfully",
            result: data,
          });
        })
        .catch((err) => {
          callback({
            code: 400,
            message: "error while fetching buyer seller country",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  addToList: async (req, res, reqObj, callback) => {
    try {
      const existingList = await List.findOne({
        buyer_id: reqObj.buyer_id,
        supplier_id: reqObj.supplier_id,
      });

      const buyerDetails = await Buyer?.findOne({ buyer_id: reqObj.buyer_id });
      const supplierDetails = await Supplier?.findOne({
        supplier_id: reqObj.supplier_id,
      });

      if (existingList) {
        existingList.item_details.push({
          product_id: reqObj.product_id,
          quantity: reqObj.quantity,
          unit_price: reqObj.unit_price,
          est_delivery_days: reqObj.est_delivery_time,
          quantity_required: reqObj.quantity_required,
          target_price: reqObj.target_price,
        });

        existingList
          .save()
          .then(async (data) => {
            const listCount = await List.countDocuments({
              buyer_id: reqObj.buyer_id,
            });
            const obj = {
              data,
              listCount,
            };
            callback({
              code: 200,
              message: "Product Added to Your Cart!",
              result: obj,
            });
          })
          .catch((err) => {
            callback({
              code: 400,
              message: "Error while adding to existing list",
              result: err,
            });
          });
      } else {
        const listId = "LST-" + Math.random().toString(16).slice(2);

        const newList = new List({
          list_id: listId,
          buyer_id: reqObj.buyer_id,
          buyerId: buyerDetails?._id,
          supplierId: supplierDetails?._id,
          supplier_id: reqObj.supplier_id,
          item_details: [
            {
              product_id: reqObj.product_id,
              quantity: reqObj.quantity,
              unit_price: reqObj.unit_price,
              unit_tax: reqObj.unit_tax,
              est_delivery_days: reqObj.est_delivery_time,
              quantity_required: reqObj.quantity_required,
              target_price: reqObj.target_price,
            },
          ],
        });

        newList
          .save()
          .then(async (data) => {
            const listCount = await List.countDocuments({
              buyer_id: reqObj.buyer_id,
            });
            const obj = {
              data,
              listCount,
            };
            callback({
              code: 200,
              message: "Product Added to Your Cart!",
              result: obj,
            });
          })
          .catch((err) => {
            callback({
              code: 400,
              message: "Error while adding to new list",
              result: err,
            });
          });
      }
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  showList: async (req, res, reqObj, callback) => {
    try {
      const { buyer_id, pageNo, pageSize } = reqObj;

      // Fetching buyer details based on buyer_id
      const buyerDetails = await Buyer?.findOne({ buyer_id });

      if (!buyerDetails) {
        callback({
          code: 400,
          message: "Error while fetching buyer details",
          result: {},
        });
        return;
      }

      const page_no = pageNo || 1;
      const page_size = pageSize || 1;
      const offset = (page_no - 1) * page_size;

      List.aggregate([
        {
          $match: {
            buyer_id: buyer_id,
          },
        },
        {
          $unwind: "$item_details",
        },
        {
          $lookup: {
            from: "products",
            localField: "item_details.product_id",
            foreignField: "product_id",
            as: "medicine_details",
          },
        },
        {
          $unwind: "$medicine_details",
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "medicine_details.supplier_id",
            foreignField: "_id",
            as: "supplier_details",
          },
        },
        {
          $group: {
            _id: "$_id",
            list_id: { $first: "$list_id" },
            buyer_id: { $first: "$buyer_id" },
            buyerId: { $first: buyerDetails?._id },
            supplierId: { $first: "$_id" },
            supplier_id: { $first: "$supplier_id" },
            supplier_details: {
              $first: { $arrayElemAt: ["$supplier_details", 0] },
            },
            item_details: {
              $push: {
                _id: "$item_details._id",
                product_id: "$item_details.product_id",
                quantity: "$item_details.quantity",
                unit_price: "$item_details.unit_price",
                unit_tax: "$item_details.unit_tax",
                est_delivery_days: "$item_details.est_delivery_days",
                quantity_required: "$item_details.quantity_required",
                target_price: "$item_details.target_price",
                medicine_image: "$medicine_details.general.image",
                medicine_name: "$medicine_details.general.name",
                total_quantity: "$medicine_details.general.quantity",
              },
            },
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $project: {
            _id: 0,
            list_id: 1,
            buyer_id: 1,
            buyerId: 1,
            supplier_id: 1,
            supplierId: 1,
            // item_details : 1,
            item_details: { $reverseArray: "$item_details" },
            "supplier_details.supplier_id": 1,
            "supplier_details.supplier_name": 1,
            "supplier_details.supplier_email": 1,
            "supplier_details.contact_person_email": 1,
            "supplier_details.supplier_image": 1,
          },
        },
        { $skip: offset },
        { $limit: page_size },
      ])

        .then(async (data) => {
          // return false
          const totalItems = await List.countDocuments({ buyer_id: buyer_id });
          const totalPages = Math.ceil(totalItems / page_size);

          const returnObj = {
            data,
            totalPages,
            totalItems,
          };
          callback({
            code: 200,
            message: "List fetched successfully",
            result: returnObj,
          });
        })
        .catch((err) => {
          logErrorToFile(err, req);
          callback({
            code: 400,
            message: "error while fetching buyer list",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  deleteListItem: async (req, res, reqObj, callback) => {
    try {
      const { buyer_id, product_id, supplier_id, item_id, list_id } = reqObj;
      const itemIds = item_id
        .map((id) => id.trim())
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));

      if (itemIds.length === 0) {
        return callback({
          code: 400,
          message: "No valid item IDs provided",
          result: null,
        });
      }

      const updateQuery = {
        $pull: { item_details: { _id: { $in: itemIds } } },
      };

      const updateResult = await List.updateMany(
        { buyer_id: buyer_id },
        updateQuery
      );

      if (updateResult.modifiedCount === 0) {
        return callback({
          code: 400,
          message: "No items were updated",
          result: updateResult,
        });
      }

      const updatedDocuments = await List.find({ buyer_id: buyer_id });

      for (const doc of updatedDocuments) {
        if (doc.item_details.length === 0) {
          await List.deleteOne({ _id: doc._id });
        }
      }
      const listCount = await List.countDocuments({
        buyer_id: reqObj.buyer_id,
      });
      const returnObj = {
        updateResult,
        listCount,
      };
      callback({
        code: 200,
        message: "Deleted Successfully",
        result: returnObj,
      });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  sendEnquiry: async (req, res, reqObj, callback) => {
    try {
      const { buyer_id, buyer_name, items } = reqObj;

      if (!buyer_id || !items || !Array.isArray(items) || items.length === 0) {
        throw new Error("Invalid request");
      }
      const buyer = await Buyer.findOne({ buyer_id: reqObj.buyer_id });

      let enquiryId = "INQ-" + Math.random().toString(16).slice(2, 10);

      // Grouping items by supplier_id and including supplier details
      const groupedItems = await items.reduce(async (accPromise, item) => {
        const acc = await accPromise;
        const {
          supplier_id,
          supplier_name,
          supplier_email,
          supplier_contact_email,
          list_id,
          item_details,
        } = item;
        if (
          !supplier_id ||
          !item_details ||
          !Array.isArray(item_details) ||
          item_details.length === 0
        ) {
          throw new Error("Missing required item details");
        }
        const supplierDetails = await Supplier.findOne({ supplier_id });

        if (!supplierDetails) {
          throw new Error("Failed fetching supplier details");
        }

        if (!acc[supplier_id]) {
          acc[supplier_id] = {
            supplier_name,
            supplierId: supplierDetails?._id,
            supplier_email,
            supplier_contact_email,
            items: [],
          };
        }

        item_details.forEach((detail) => {
          const {
            product_id,
            unit_price,
            unit_tax,
            quantity_required,
            est_delivery_days,
            target_price,
            item_id,
          } = detail;
          if (
            !product_id ||
            !unit_price ||
            !unit_tax ||
            !quantity_required ||
            !est_delivery_days ||
            !target_price
          ) {
            throw new Error("Missing required item fields");
          }
          acc[supplier_id].items.push({
            item_id,
            product_id,
            unit_price,
            unit_tax,
            quantity_required,
            est_delivery_days,
            target_price,
            counter_price: detail.counter_price || undefined,
            status: detail.status || "pending",
          });
        });

        return acc;
      }, {});

      const enquiries = await Promise.all(
        Object.keys(groupedItems).map(async (supplier_id) => {
          const supplierDetails = await Supplier.findOne({ supplier_id });
          return {
            enquiry_id: enquiryId,
            buyer_id,
            buyerId: buyer?._id,
            supplierId: supplierDetails?._id,
            supplier_id,
            items: groupedItems[supplier_id].items,
          };
        })
      );

      const enquiryDocs = await Enquiry.insertMany(enquiries);

      const dataForOrderHistory = await Promise.all(
        enquiryDocs.map(async (enquiry) => {
          return {
            enquiryId: enquiry?._id,
            buyerId: enquiry?.buyerId,
            supplierId: enquiry?.supplierId,
            stages: [
              {
                name: "Inquiry Raised",
                date: new Date(),
                referenceId: enquiry?._id,
                referenceType: "Enquiry",
              },
            ],
          };
        })
      );

      const orderHistoryDocs = await OrderHistory.insertMany(
        dataForOrderHistory
      );

      // Update lists and remove items from the List collection
      await Promise.all(
        items.map(async (item) => {
          const { list_id, item_details } = item;

          for (const detail of item_details) {
            const { item_id } = detail;

            const objectId = ObjectId.isValid(item_id)
              ? new ObjectId(item_id)
              : null;

            await List.updateOne(
              { list_id },
              { $pull: { item_details: { _id: objectId } } }
            );

            const updatedList = await List.findOne({ list_id });
            if (updatedList && updatedList.item_details.length === 0) {
              await List.deleteOne({ list_id });
            }
          }
        })
      );

      // Send notifications to suppliers
      const notifications = enquiries.map((enquiry) => {
        const notificationId = "NOT-" + Math.random().toString(16).slice(2, 10);
        return {
          notification_id: notificationId,
          event_type: "Enquiry request",
          event: "enquiry",
          from: "buyer",
          to: "supplier",
          from_id: buyer_id,
          to_id: enquiry.supplier_id,
          event_id: enquiry.enquiry_id,
          message: `Inquiry Alert! You’ve received an inquiry about ${enquiryId}`,
          status: 0,
        };
      });

      await Notification.insertMany(notifications);

      // Send emails to suppliers
      await Promise.all(
        Object.keys(groupedItems).map(async (supplier_id) => {
          const supplier = await Supplier.findOne({ supplier_id: supplier_id });
          const {
            supplier_name,
            supplier_email,
            supplier_contact_email,
            items,
          } = groupedItems[supplier_id];
          if (supplier?.contact_person_email) {
            const itemsList = items
              .map((item) => `Medicine ID: ${item.product_id}`)
              .join("<br />");
            const subject = `New Product Inquiry Received from ${buyer.buyer_name}`;
            const body = `Dear ${supplier?.contact_person_name},<br /><br />

                                We are pleased to inform you that you have received a new product inquiry from <strong>${buyer.contact_person_name}</strong> through our platform.<br /><br />

                                <strong>Inquiry Details:</strong><br />
                                Buyer’s Company Name: ${buyer.buyer_name}<br />
                                Contact Person: ${buyer.contact_person_name}<br />
                                Contact Email: ${buyer.contact_person_email}<br />
                                Contact Information: ${buyer.contact_person_country_code} ${buyer.contact_person_mobile} <br /><br />

                                You can view and respond to this inquiry by logging into your account on our platform. Please take the time to review the buyer's request and provide your response at your earliest convenience.<br /><br />

                                <p>If you need further assistance, feel free to reach out to us at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.</p>
                                 <p>Best regards,<br/>Medhub Global Team</p>
                        `;

            // await sendMailFunc(supplier_email, subject, body);
            const recipientEmails = [supplier?.contact_person_email]; // Add more emails if needed
            // await sendMailFunc(recipientEmails.join(','), subject, body);
            await sendEmail(recipientEmails, subject, body);
          }
        })
      );

      const listCount = await List.countDocuments({
        buyer_id: reqObj.buyer_id,
      });
      const returnObj = {
        enquiryDocs,
        listCount,
      };

      callback({
        code: 200,
        message: "Enquiries sent successfully",
        result: returnObj,
      });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getNotificationList: async (req, res, reqObj, callback) => {
    try {
      const { buyer_id, pageNo, pageSize } = reqObj;

      const page_no = pageNo || 1;
      const page_size = pageSize || 100;
      const offset = (page_no - 1) * page_size;

      Notification.aggregate([
        {
          $match: {
            to_id: buyer_id,
            to: "buyer",
            // status: 0
          },
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "from_id",
            foreignField: "supplier_id",
            as: "supplier",
          },
        },
        {
          $project: {
            notification_id: 1,
            event: 1,
            event_type: 1,
            from: 1,
            to: 1,
            from_id: 1,
            to_id: 1,
            event_id: 1,
            connected_id: 1,
            link_id: 1,
            message: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            supplier: { $arrayElemAt: ["$supplier", 0] },
            // buyer          : { $arrayElemAt: ["$buyer", 0] },
          },
        },
        {
          $project: {
            "supplier.password": 0,
            "supplier.token": 0,
          },
        },
        { $sort: { createdAt: -1 } },
        // { $skip  : offset },
        // { $limit : page_size },
      ])

        .then(async (data) => {
          const totalItems = await Notification.countDocuments({
            to_id: buyer_id,
            to: "buyer",
            status: 0,
          });
          const totalPages = Math.ceil(totalItems / page_size);

          const returnObj = {
            data,
            totalPages,
            totalItems,
          };
          callback({
            code: 200,
            message: "List fetched successfully",
            result: returnObj,
          });
        })
        .catch((err) => {
          logErrorToFile(err, req);
          callback({
            code: 400,
            message: "error while fetching buyer list",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getNotificationDetailsList: async (req, res, reqObj, callback) => {
    try {
      const { buyer_id, pageNo, pageSize } = reqObj;

      const page_no = pageNo || 1;
      const page_size = pageSize || 5;
      const offset = (page_no - 1) * page_size;

      Notification.aggregate([
        {
          $match: {
            to_id: buyer_id,
            to: "buyer",
          },
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "from_id",
            foreignField: "supplier_id",
            as: "supplier",
          },
        },
        {
          $lookup: {
            from: "buyers",
            localField: "to_id",
            foreignField: "buyer_id",
            as: "buyer",
          },
        },
        {
          $project: {
            notification_id: 1,
            event: 1,
            event_type: 1,
            from: 1,
            to: 1,
            from_id: 1,
            to_id: 1,
            event_id: 1,
            connected_id: 1,
            link_id: 1,
            message: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            supplier: { $arrayElemAt: ["$supplier", 0] },
            buyer: { $arrayElemAt: ["$buyer", 0] },
          },
        },
        {
          $project: {
            "supplier.password": 0,
            "supplier.token": 0,
            "buyer.password": 0,
            "buyer.token": 0,
          },
        },
        { $sort: { createdAt: -1 } },
        // { $skip  : offset },
        // { $limit : page_size },
      ])

        .then(async (data) => {
          const totalItems = await Notification.countDocuments({
            to_id: buyer_id,
            to: "buyer",
          });
          const totalPages = Math.ceil(totalItems / page_size);

          const returnObj = {
            data,
            totalPages,
            totalItems,
          };
          callback({
            code: 200,
            message: "List fetched successfully",
            result: returnObj,
          });
        })
        .catch((err) => {
          logErrorToFile(err, req);
          callback({
            code: 400,
            message: "error while fetching buyer list",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  updateStatus: async (req, res, reqObj, callback) => {
    try {
      const { notification_id, status = 1, buyer_id, usertype } = reqObj;
      
      const updateNotifications = await Notification.updateMany(
        { to_id: buyer_id, to: usertype },
        {
          $set: {
            status: status,
          },
        },
        { multi: true }
      );
      if (!updateNotifications) {
        return callback({
          code: 404,
          message: "Notification not found",
          result: null,
        });
      }
      callback({
        code: 200,
        message: "Status Updated",
        result: updateNotifications,
      });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getInvoiceCount: async (req, res, reqObj, callback) => {
    try {
      const { buyer_id } = reqObj;

      Invoice.aggregate([
        {
          $match: {
            buyer_id: buyer_id,
            status: "pending",
          },
        },
        {
          $count: "pendingInvoiceCount",
        },
      ])
        .then((data) => {
          const count = data.length > 0 ? data[0].pendingInvoiceCount : 0;
          callback({
            code: 200,
            message: "Pending Invoice Count",
            result: count,
          });
        })
        .catch((err) => {
          callback({
            code: 400,
            message: "Error while fetching count",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },
};
