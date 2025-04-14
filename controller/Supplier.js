require("dotenv").config();
const bcrypt = require("bcrypt");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const Supplier = require("../schema/supplierSchema");
const Buyer = require("../schema/buyerSchema");
const Order = require("../schema/orderSchema");
const Support = require("../schema/supportSchema");
const {
  Medicine,
  SecondaryMarketMedicine,
  NewMedicine,
} = require("../schema/medicineSchema");
const {
  EditMedicine,
  NewMedicineEdit,
  SecondaryMarketMedicineEdit,
} = require("../schema/medicineEditRequestSchema");
const Notification = require("../schema/notificationSchema");
const PurchaseOrder = require("../schema/purchaseOrderSchema");
const Invoice = require("../schema/invoiceSchema");
const Enquiry = require("../schema/enquiryListSchema");
const nodemailer = require("nodemailer");
const { sendEmail } = require("../utils/emailService");
const { getTodayFormattedDate } = require("../utils/utilities");
const { parse } = require("json2csv");
const fs = require("fs");
const path = require("path");
const { flattenData } = require("../utils/csvConverter");
const logErrorToFile = require("../logs/errorLogs");
const {
  sendErrorResponse,
  handleCatchBlockError,
} = require("../utils/commonResonse");
const { getLoginFrequencyLast90Days } = require("../utils/userUtils");

module.exports = {
  filterValues: async (req, res, reqObj, callback) => {
    try {
      // const countryData = await Supplier.find({}, { country_of_origin: 1, _id: 0 }).exec();
      const countryData = await Supplier.distinct("country_of_origin", {
        account_status: 1,
      });

      const result = {
        country: countryData,
        // forms: formsData
      };

      callback({ code: 200, message: "Filter values", result: [result] });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  supplierDashboardOrderDetails: async (req, res, reqObj, callback) => {
    try {
      const { supplier_id } = reqObj;

      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Aggregation for Orders
      const ordersAggregation = [
        {
          $match: {
            supplier_id: supplier_id,
            // created_at: { $gte: today }  // Match only today's data
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

      // Aggregation for Purchase Orders
      const purchaseOrdersAggregation = [
        {
          $match: {
            supplier_id: supplier_id,
            // created_at: { $gte: today },  // Match only today's data
            po_status: "active", // Filter for active purchase orders
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
            supplier_id: supplier_id,
            // created_at: { $gte: today }  // Match only today's data
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

      const invoicesAggregation = [
        {
          $match: {
            supplier_id: supplier_id,
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
      };

      callback({
        code: 200,
        message: "Supplier dashboard order details fetched successfully",
        result,
      });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  supplierOrderSupplierCountry: async (req, res, reqObj, callback) => {
    try {
      const { supplier_id } = reqObj;

      Order.aggregate([
        {
          $match: { supplier_id: supplier_id },
        },
        {
          $lookup: {
            from: "buyers",
            localField: "buyer_id",
            foreignField: "buyer_id",
            as: "buyer",
          },
        },
        {
          $unwind: "$buyer",
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
            _id: "$buyer.country_of_origin",
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
            message: "supplier buyer country fetched successfully",
            result: data,
          });
        })
        .catch((err) => {
          callback({
            code: 400,
            message: "error while fetching supplier buyer country",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  editMedicine: async (req, res, reqObj, callback) => {
    try {
      const {
        product_id,
        product_type,
        supplier_id,
        medicine_name,
        composition,
        strength,
        type_of_form,
        shelf_life,
        dossier_type,
        dossier_status,
        product_category,
        total_quantity,
        gmp_approvals,
        shipping_time,
        tags,
        country_of_origin,
        stocked_in,
        registered_in,
        available_for,
        description,
        medicine_image,
      } = reqObj;

      if (product_type === "new") {
        const { quantity, unit_price, total_price, est_delivery_days } = reqObj;

        if (
          !Array.isArray(quantity) ||
          !Array.isArray(unit_price) ||
          !Array.isArray(total_price) ||
          !Array.isArray(est_delivery_days)
        ) {
          callback({ code: 400, message: "Inventory fields should be arrays" });
        }

        if (
          quantity.length !== unit_price.length ||
          unit_price.length !== total_price.length ||
          total_price.length !== est_delivery_days.length
        ) {
          callback({
            code: 400,
            message:
              "All inventory arrays (quantity, unit_price, total_price, est_delivery_days) must have the same length",
          });
        }

        const inventory_info = quantity.map((_, index) => ({
          quantity: quantity[index],
          unit_price: unit_price[index],
          total_price: total_price[index],
          est_delivery_days: est_delivery_days[index],
        }));

        const newMedicineObj = {
          product_id,
          supplier_id,
          medicine_name,
          medicine_type: "new_medicine",
          composition,
          strength,
          type_of_form,
          shelf_life,
          dossier_type,
          dossier_status,
          medicine_category: product_category,
          total_quantity,
          gmp_approvals,
          shipping_time,
          tags,
          country_of_origin,
          registered_in,
          stocked_in,
          available_for,
          description,
          medicine_image,
          inventory_info,
          edit_status: 0,
        };

        const medicine = await Medicine.findOne({
          supplier_id: supplier_id,
          product_id: product_id,
        });

        if (!medicine) {
          return callback({ code: 404, message: "Medicine Not Found" });
        }

        const newMedEdit = new NewMedicineEdit(newMedicineObj);

        newMedEdit
          .save()
          .then((savedMedicine) => {
            callback({
              code: 200,
              message: "Edit Medicine Request Submitted Successfully",
              result: savedMedicine,
            });
          })
          .catch((err) => {
            logErrorToFile(err, req);
            callback({ code: 400, message: "Error while submitting request" });
          });
      } else if (product_type === "secondary market") {
        const {
          purchased_on,
          country_available_in,
          min_purchase_unit,
          unit_price,
          condition,
          invoice_image,
          quantity,
        } = reqObj;

        const secondaryMarketMedicineObj = {
          product_id,
          supplier_id,
          medicine_name,
          medicine_type: "secondary_medicine",
          purchased_on,
          country_available_in,
          min_purchase_unit,
          composition,
          strength,
          type_of_form,
          shelf_life,
          dossier_type,
          dossier_status,
          medicine_category: product_category,
          gmp_approvals,
          shipping_time,
          tags,
          country_of_origin,
          registered_in,
          stocked_in,
          available_for,
          description,
          total_quantity: quantity,
          unit_price,
          condition,
          medicine_image,
          invoice_image,
          edit_status: 0,
        };

        const secondaryMedEdit = new SecondaryMarketMedicineEdit(
          secondaryMarketMedicineObj
        );

        secondaryMedEdit
          .save()
          .then((savedMedicine) => {
            callback({
              code: 200,
              message: "Edit Medicine Request Submitted Successfully",
              result: savedMedicine,
            });
          })
          .catch((err) => {
            logErrorToFile(err, req);
            callback({ code: 400, message: "Error while submitting request" });
          });
      }
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getNotificationList: async (req, res, reqObj, callback) => {
    try {
      const { supplier_id, pageNo, pageSize } = reqObj;

      const page_no = pageNo || 1;
      const page_size = pageSize || 100;
      const offset = (page_no - 1) * page_size;

      Notification.aggregate([
        {
          $match: {
            to_id: supplier_id,
            to: "supplier",
            // status: 0
          },
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "to_id",
            foreignField: "supplier_id",
            as: "supplier",
          },
        },
        {
          $lookup: {
            from: "buyers",
            localField: "from_id",
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
            to_id: supplier_id,
            to: "supplier",
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
      const { supplier_id, pageNo, pageSize } = reqObj;

      const page_no = pageNo || 1;
      const page_size = pageSize || 5;
      const offset = (page_no - 1) * page_size;

      Notification.aggregate([
        {
          $match: {
            to_id: supplier_id,
            to: "supplier",
          },
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "to_id",
            foreignField: "supplier_id",
            as: "supplier",
          },
        },
        {
          $lookup: {
            from: "buyers",
            localField: "from_id",
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
            to_id: supplier_id,
            to: "supplier",
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
      const { notification_id, status = 1, supplier_id, usertype } = reqObj;

      const updateNotifications = await Notification.updateMany(
        { to_id: supplier_id, to: usertype },
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
      const { supplier_id } = reqObj;

      Invoice.aggregate([
        {
          $match: {
            supplier_id: supplier_id,
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

  getAllSuppliersList: async (req, res) => {
    try {
      const { usertype } = req?.headers;
      const {
        filterKey,
        filterValue,
        searchKey = "",
        filterCountry = "",
        type = "",
        pageNo = 1,
        pageSize = 1,
      } = req?.query;
      const page_no = parseInt(pageNo) || 1;
      const page_size = parseInt(pageSize) || 2;
      const offSet = parseInt(page_no - 1) * page_size;
      const offset = parseInt(pageNo - 1) * pageSize;

      const fields = {
        token: 0,
        password: 0,
      };

      let filterCondition = {};
      if (filterKey === "pending") {
        filterCondition = { account_status: 0 };
      } else if (filterKey === "accepted") {
        filterCondition = { account_status: 1 };
      } else if (filterKey === "rejected") {
        filterCondition = { account_status: 2 };
      }

      let dateFilter = {};

      const startDate = moment().subtract(365, "days").startOf("day").toDate();
      const endDate = moment().endOf("day").toDate();

      // Apply date filter based on filterValue (today, week, month, year, all)
      if (filterValue === "today") {
        dateFilter = {
          createdAt: {
            $gte: moment().startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        };
      } else if (filterValue === "week") {
        dateFilter = {
          createdAt: {
            $gte: moment().subtract(7, "days").startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        };
      } else if (filterValue === "month") {
        dateFilter = {
          createdAt: {
            $gte: moment().subtract(30, "days").startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        };
      } else if (filterValue === "year") {
        dateFilter = {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        };
      } else if (filterValue === "all" || !filterValue) {
        dateFilter = {}; // No date filter
      }

      // Merge dateFilter with filterCondition to apply both filters
      const combinedFilter = { ...filterCondition, ...dateFilter };

      // let query = { account_status: 1 };
      let query = {
        account_status: 1,
        $or: [
          { test_account: 0 },
          { test_account: { $exists: false } }, // Include documents where test_account is missing
        ],
      };

      if (searchKey) {
        // query.supplier_name = { $regex: new RegExp(searchKey, 'i') };
        query.$or = [
          { supplier_name: { $regex: new RegExp(searchKey, "i") } },
          { tax_no: { $regex: new RegExp(searchKey, "i") } },
        ];
      }

      if (filterCountry) {
        query.country_of_origin = filterCountry;
      }

      if (type) {
        query.supplier_type = type;
      }

      let data;

      if (usertype == "Admin") {
        data = await Supplier.find(combinedFilter)
          .select(fields)
          .sort({ createdAt: -1 })
          .skip(offSet)
          .limit(page_size);
      } else if (usertype == "Buyer") {
        data = await Supplier.find(query)
          .select(
            "supplier_id supplier_name supplier_image supplier_country_code supplier_mobile supplier_address description license_no country_of_origin contact_person_name contact_person_mobile_no contact_person_country_code contact_person_email designation tags payment_terms estimated_delivery_time, license_expiry_date tax_no"
          )
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(pageSize);
      }

      if (!data) {
        res?.status(500)?.send({
          code: 500,
          message: "Error fetching suppliers list",
          result: {},
        });
      }

      const totalItems = await Supplier.countDocuments(
        usertype == "Admin" ? combinedFilter : usertype == "Buyer" && query
      );

      const totalPages = Math.ceil(totalItems / page_size);
      const returnObj = {
        data,
        totalPages,
        totalItems: totalItems,
      };

      res?.status(200)?.send({
        code: 200,
        message: "Supplier list fetched successfully",
        result: returnObj,
      });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getCSVSuppliersList: async (req, res) => {
    try {
      const { usertype } = req?.headers;
      const {
        filterKey,
        filterValue,
        searchKey = "",
        filterCountry = "",
        pageNo = 1,
        pageSize = 1,
      } = req?.body;

      const page_no = pageNo || 1;
      const page_size = pageSize || 2;
      const offSet = (page_no - 1) * page_size;
      const offset = (pageNo - 1) * pageSize;

      const fields = {
        token: 0,
        password: 0,
      };

      let filterCondition = {};
      if (filterKey === "pending") {
        filterCondition = { account_status: 0 };
      } else if (filterKey === "accepted") {
        filterCondition = { account_status: 1 };
      } else if (filterKey === "rejected") {
        filterCondition = { account_status: 2 };
      }

      let dateFilter = {};

      const startDate = moment().subtract(365, "days").startOf("day").toDate();
      const endDate = moment().endOf("day").toDate();

      // Apply date filter based on filterValue (today, week, month, year, all)
      if (filterValue === "today") {
        dateFilter = {
          createdAt: {
            $gte: moment().startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        };
      } else if (filterValue === "week") {
        dateFilter = {
          createdAt: {
            $gte: moment().subtract(7, "days").startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        };
      } else if (filterValue === "month") {
        dateFilter = {
          createdAt: {
            $gte: moment().subtract(30, "days").startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        };
      } else if (filterValue === "year") {
        dateFilter = {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        };
      } else if (filterValue === "all" || !filterValue) {
        dateFilter = {}; // No date filter
      }

      // Merge dateFilter with filterCondition to apply both filters
      const combinedFilter = { ...filterCondition, ...dateFilter };

      let query = { account_status: 1 };

      if (searchKey) {
        query.supplier_name = { $regex: new RegExp(searchKey, "i") };
      }

      if (filterCountry) {
        query.country_of_origin = filterCountry;
      }

      let data;

      if (usertype == "Admin") {
        data = await Supplier.find(combinedFilter)
          .select(fields)
          .sort({ createdAt: -1 })
          .skip(offSet)
          .limit(page_size);
      } else if (usertype == "Buyer") {
        data = await Supplier.find(query)
          .select(
            "supplier_id supplier_name supplier_image supplier_country_code supplier_mobile supplier_address description license_no country_of_origin contact_person_name contact_person_mobile_no contact_person_country_code contact_person_email designation tags payment_terms estimated_delivery_time, license_expiry_date tax_no"
          )
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(pageSize);
      }

      if (!data) {
        res?.status(500)?.send({
          code: 500,
          message: "Error fetching suppliers list",
          result: {},
        });
      }

      // Convert Mongoose document to plain object and flatten
      const flattenedData = data.map((item) =>
        flattenData(
          item.toObject(),
          [
            "_id",
            "__v",
            "Supplier Image",
            "License Image",
            "Tax Image",
            "Certificate Image",
            "Profile Status",
          ],
          [],
          "supplier_list"
        )
      ); // `toObject()` removes internal Mongoose metadata

      // Convert the flattened data to CSV
      const csv = parse(flattenedData);

      // Set headers for file download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=users.csv");

      res.status(200).send(csv);
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },
};
