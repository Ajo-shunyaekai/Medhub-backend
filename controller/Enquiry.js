const mongoose = require("mongoose");
const moment = require("moment");
const ObjectId = mongoose.Types.ObjectId;
const Enquiry = require("../schema/enquiryListSchema");
const Support = require("../schema/supportSchema");
const Invoice = require("../schema/invoiceNumberSchema");
const Buyer = require("../schema/buyerSchema");
const Supplier = require("../schema/supplierSchema");
const Notification = require("../schema/notificationSchema");
const nodemailer = require("nodemailer");
const { addStageToOrderHistory } = require("./orderHistory");
const logErrorToFile = require("../logs/errorLogs");
const {
  sendErrorResponse,
  handleCatchBlockError,
} = require("../utils/commonResonse");
const { submitQuotationContent,cancelEnquiryContent } = require("../utils/emailContents");
const { sendEmail } = require("../utils/emailService");

module.exports = {
  getEnquiryDetails: async (req, res, reqObj, callback) => {
    try {
      const enquiry_id = req?.params?.id;

      Enquiry.aggregate([
        {
          $match: { enquiry_id: enquiry_id },
        },
        {
          $lookup: {
            from: "buyers",
            localField: "buyer_id",
            foreignField: "buyer_id",
            as: "buyer_details",
          },
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "supplier_id",
            foreignField: "supplier_id",
            as: "supplier_details",
          },
        },
        {
          $unwind: "$items",
        },
        {
          $lookup: {
            from: "products",
            localField: "items.product_id",
            foreignField: "product_id",
            as: "medicine_details",
          },
        },
        {
          $unwind: {
            path: "$medicine_details",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$_id",
            enquiry_id: { $first: "$enquiry_id" },
            created_at: { $first: "$created_at" },
            quotation_items: { $first: "$quotation_items" },
            payment_terms: { $first: "$payment_terms" },
            enquiry_status: { $first: "$enquiry_status" },
            status: { $first: "$status" },
            quotation_items_created_at: {
              $first: "$quotation_items_created_at",
            },
            quotation_items_updated_at: {
              $first: "$quotation_items_updated_at",
            },
            items: {
              $push: {
                _id: "$items._id",
                product_id: "$items.product_id",
                medicine_name: "$medicine_details.general.medicine_name",
                unit_price: "$items.unit_price",
                unit_tax: "$items.unit_tax",
                quantity_required: "$items.quantity_required",
                est_delivery_days: "$items.est_delivery_days",
                target_price: "$items.target_price",
                status: "$items.status",
                medicine_details: "$medicine_details",
              },
            },
            buyer_details: { $first: "$buyer_details" },
            supplier_details: { $first: "$supplier_details" },
          },
        },
        {
          $addFields: {
            hasQuotationItems: { $gt: [{ $size: "$quotation_items" }, 0] },
          },
        },
        {
          $facet: {
            withQuotationItems: [
              { $match: { hasQuotationItems: true } },
              { $unwind: "$quotation_items" },
              {
                $lookup: {
                  from: "products",
                  localField: "quotation_items.product_id",
                  foreignField: "product_id",
                  as: "quotation_medicine_details",
                },
              },
              {
                $unwind: {
                  path: "$quotation_medicine_details",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $group: {
                  _id: "$_id",
                  enquiry_id: { $first: "$enquiry_id" },
                  created_at: { $first: "$created_at" },
                  quotation_items: {
                    $push: {
                      _id: "$quotation_items._id",
                      product_id: "$quotation_items.product_id",
                      unit_price: "$quotation_items.unit_price",
                      unit_tax: "$quotation_items.unit_tax",
                      quantity_required: "$quotation_items.quantity_required",
                      est_delivery_days: "$quotation_items.est_delivery_days",
                      target_price: "$quotation_items.target_price",
                      counter_price: "$quotation_items.counter_price",
                      status: "$quotation_items.status",
                      medicine_details: "$quotation_medicine_details",
                    },
                  },
                  payment_terms: { $first: "$payment_terms" },
                  enquiry_status: { $first: "$enquiry_status" },
                  status: { $first: "$status" },
                  items: { $first: "$items" },
                  buyer_details: { $first: "$buyer_details" },
                  supplier_details: { $first: "$supplier_details" },
                  quotation_items_created_at: {
                    $first: "$quotation_items_created_at",
                  },
                  quotation_items_updated_at: {
                    $first: "$quotation_items_updated_at",
                  },
                },
              },
            ],
            withoutQuotationItems: [
              { $match: { hasQuotationItems: false } },
              {
                $group: {
                  _id: "$_id",
                  enquiry_id: { $first: "$enquiry_id" },
                  created_at: { $first: "$created_at" },
                  quotation_items: { $first: "$quotation_items" },
                  payment_terms: { $first: "$payment_terms" },
                  enquiry_status: { $first: "$enquiry_status" },
                  status: { $first: "$status" },
                  items: { $first: "$items" },
                  buyer_details: { $first: "$buyer_details" },
                  supplier_details: { $first: "$supplier_details" },
                  quotation_items_created_at: {
                    $first: "$quotation_items_created_at",
                  },
                  quotation_items_updated_at: {
                    $first: "$quotation_items_updated_at",
                  },
                },
              },
            ],
          },
        },
        {
          $project: {
            result: {
              $setUnion: ["$withQuotationItems", "$withoutQuotationItems"],
            },
          },
        },
        {
          $unwind: "$result",
        },
        {
          $replaceRoot: {
            newRoot: "$result",
          },
        },
        {
          $addFields: {
            buyer_details: { $arrayElemAt: ["$buyer_details", 0] },
            supplier_details: { $arrayElemAt: ["$supplier_details", 0] },
          },
        },
        {
          $project: {
            enquiry_id: 1,
            created_at: 1,
            quotation_items: 1,
            payment_terms: 1,
            enquiry_status: 1,
            status: 1,
            quotation_items_created_at: 1,
            quotation_items_updated_at: 1,
            items: 1,
            "buyer.buyer_id": "$buyer_details.buyer_id",
            "buyer.buyer_name": "$buyer_details.buyer_name",
            "buyer.buyer_address": "$buyer_details.buyer_address",
            "buyer.registered_address": "$buyer_details.registeredAddress",
            "buyer.buyer_email": "$buyer_details.contact_person_email",
            "buyer.contact_person_email": "$buyer_details.contact_person_email",
            "buyer.contact_person_mobile":
              "$buyer_details.contact_person_mobile",
            "buyer.contact_person_country_code":
              "$buyer_details.contact_person_country_code",
            "buyer.buyer_type": "$buyer_details.buyer_type",
            "buyer.buyer_mobile": "$buyer_details.contact_person_mobile",
            "buyer.buyer_country_code":
              "$buyer_details.contact_person_country_code",
            "buyer.country_of_origin": "$buyer_details.country_of_origin",
            "buyer.buyer_image": "$buyer_details.buyer_image",
            "buyer.registration_no": "$buyer_details.registration_no",
            "supplier.supplier_id": "$supplier_details.supplier_id",
            "supplier.supplier_name": "$supplier_details.supplier_name",
            "supplier.supplier_type": "$supplier_details.supplier_type",
            "supplier.supplier_mobile":
              "$supplier_details.contact_person_mobile_no",
            "supplier.supplier_country_code":
              "$supplier_details.contact_person_country_code",
            "supplier.supplier_email": "$supplier_details.contact_person_email",
            "supplier.contact_person_email":
              "$supplier_details.contact_person_email",
            "supplier.country_of_origin": "$supplier_details.country_of_origin",
            "supplier.estimated_delivery_time":
              "$supplier_details.estimated_delivery_time",
            "supplier.supplier_address": "$supplier_details.supplier_address",
            "supplier.registered_address":
              "$supplier_details.registeredAddress",
            "supplier.supplier_image": "$supplier_details.supplier_image",
            "supplier.registration_no": "$supplier_details.registration_no",
            "supplier.contact_person_mobile_no":
              "$supplier_details.contact_person_mobile_no",
            "supplier.contact_person_country_code":
              "$supplier_details.contact_person_country_code",
          },
        },
      ])
        .then((data) => {
          // return false
          callback({ code: 200, message: "Enquiry details", result: data[0] });
        })
        .catch((err) => {
          callback({
            code: 400,
            message: "Error while fetching enquiry details",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  submitQuotation: async (req, res, reqObj, callback) => {
    try {
      const {
        enquiry_id,
        quotation_details,
        payment_terms,
        buyer_id,
        supplier_id,
      } = reqObj;

      const buyer = await Buyer.findOne({ buyer_id: buyer_id });

      if (!buyer) {
        return callback({ code: 404, message: "Buyer Not Found" });
      }

      const updatedEnquiry = await Enquiry.findOneAndUpdate(
        { enquiry_id: enquiry_id },
        {
          $set: {
            quotation_items: quotation_details,
            payment_terms: payment_terms,
            enquiry_status: "Quotation submitted",
            quotation_items_created_at: new Date(),
            quotation_items_updated_at: new Date(),
          },
        },
        { new: true }
      );

      if (!updatedEnquiry) {
        return callback({
          code: 404,
          message: "Enquiry not found",
          result: null,
        });
      }

      for (const detail of quotation_details) {
        //   if (detail.accepted) {
        const itemId = ObjectId.isValid(detail.itemId)
          ? new ObjectId(detail.itemId)
          : null;

        await Enquiry.updateOne(
          { enquiry_id: enquiry_id, "items._id": itemId },
          { $set: { "items.$.status": "Quotation submitted" } }
        );
        //   }
      }
      const notificationId = "NOT-" + Math.random().toString(16).slice(2, 10);
      const newNotification = new Notification({
        notification_id: notificationId,
        event_type: "Enquiry quotation",
        event: "enquiry",
        from: "supplier",
        to: "buyer",
        from_id: supplier_id,
        to_id: buyer_id,
        event_id: enquiry_id,
        message: `Quotation Received!! You’ve received a quote from the supplier for ${enquiry_id}`,
        status: 0,
      });
      await newNotification.save();

      const subject = "Quotation Received!";
      const recipientEmails = [buyer.buyer_email];
      const emailContent = await submitQuotationContent(buyer, enquiry_id);
      await sendEmail(recipientEmails, subject, emailContent);
      //   (id, stageName, stageDescription, stageDate, stageReference, stageReferenceType)
      // const updatedOrderHistory = await addStageToOrderHistory(req, res, updatedEnquiry?._id, 'Quotation Submitted', new Date(), updatedEnquiry?._id, 'Enquiry')

      // Add stage to order history
      const updatedOrderHistory = await addStageToOrderHistory(
        req,
        res,
        updatedEnquiry._id,
        "Quotation Submitted",
        new Date(),
        updatedEnquiry._id,
        "Enquiry"
      );
      if (!updatedOrderHistory || !updatedOrderHistory.orderHistory) {
      }

      callback({
        code: 200,
        message: "Quotation Successfully Submitted",
        result: updatedEnquiry,
      });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  acceptRejectQuotation: async (req, res, reqObj, callback) => {
    try {
      const { enquiry_id, item_id, buyer_id, new_status } = reqObj;

      const itemId = ObjectId.isValid(item_id) ? new ObjectId(item_id) : null;

      const msg = new_status === "accepted" ? "Accepted" : "Rejected";

      const updatedEnquiry = await Enquiry.findOneAndUpdate(
        {
          enquiry_id: enquiry_id,
          buyer_id: buyer_id,
          "quotation_items._id": itemId,
        },
        {
          $set: {
            "quotation_items.$.status": new_status,
            quotation_items_updated_at: new Date(),
          },
        },
        {
          new: true,
          // arrayFilters: [{ 'quotation_items._id': itemId }]
        }
      );
      if (!updatedEnquiry) {
        return callback({
          code: 404,
          message: "Enquiry not found",
          result: null,
        });
      }

      callback({
        code: 200,
        message: `Quotation ${msg} Successfully`,
        result: updatedEnquiry,
      });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  cancelEnquiry: async (req, res, reqObj, callback) => {
    try {
      const { supplier_id, buyer_id, status, enquiry_id, reason, comment } =
        reqObj;

      const supplier = await Supplier.findOne({ supplier_id: supplier_id });
      const buyer = await Buyer.findOne({ buyer_id: buyer_id });

      const updatedEnquiry = await Enquiry.findOneAndUpdate(
        { enquiry_id: enquiry_id },
        {
          $set: {
            cancellation_reason: reason,
            additional_comments: comment,
            enquiry_status: "cancelled",
            "items.$[elem].status": "cancelled",
          },
        },
        {
          arrayFilters: [{ "elem.status": { $ne: "cancelled" } }],
          new: true,
        }
      );
      if (!updatedEnquiry) {
        return callback({
          code: 404,
          message: "Enquiry not found",
          result: null,
        });
      }
      const notificationId = "NOT-" + Math.random().toString(16).slice(2, 10);
      const newNotification = new Notification({
        notification_id: notificationId,
        event_type: "Enquiry request cancelled",
        event: "enquiry",
        from: "buyer",
        to: "supplier",
        from_id: buyer_id,
        to_id: supplier_id,
        event_id: enquiry_id,
        message: `Inquiry Request Cancelled! Inquiry request has been cancelled for ${enquiry_id}`,
        cancel_reason: reason,
        status: 0,
      });
      await newNotification.save();

      const subject = "Inquiry Cancelled!";
      const recipientEmails = [supplier.contact_person_email];
      const emailContent = await cancelEnquiryContent(
        supplier,
        buyer,
        enquiry_id
      );
      await sendEmail(recipientEmails, subject, emailContent);
      callback({
        code: 200,
        message: "Inquiry Cancelled Successfully",
        result: updatedEnquiry,
      });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getEnquiryListAllUsers: async (req, res) => {
    try {
      const { usertype, supplier_id, buyer_id, admin_id } = req?.headers;
      // const { supplier_id, buyer_id, status, pageNo, pageSize,filterValue } = req?.body;
      const { status, pageNo, pageSize, filterValue } = req?.query;
      const page_no = parseInt(pageNo) || 1;
      const page_size = parseInt(pageSize) || 2;
      const offset = (page_no - 1) * page_size;
      const matchCondition = { enquiry_status: { $ne: "order created" } };
      if (buyer_id && !supplier_id) {
        matchCondition.buyer_id = buyer_id;
      } else if (supplier_id && !buyer_id) {
        matchCondition.supplier_id = supplier_id;
      }
      let dateFilter = {};

      const startDate = moment().subtract(365, "days").startOf("day").toDate();
      const endDate = moment().endOf("day").toDate();

      // Apply date filter based on filterValue (today, week, month, year, all)
      if (filterValue === "today") {
        dateFilter = {
          created_at: {
            $gte: moment().startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        };
      } else if (filterValue === "week") {
        dateFilter = {
          created_at: {
            $gte: moment().subtract(7, "days").startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        };
      } else if (filterValue === "month") {
        dateFilter = {
          created_at: {
            $gte: moment().subtract(30, "days").startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        };
      } else if (filterValue === "year") {
        dateFilter = {
          created_at: {
            $gte: startDate,
            $lte: endDate,
          },
        };
      } else if (filterValue === "all" || !filterValue) {
        dateFilter = {}; // No date filter
      }

      // Merge dateFilter with filterCondition to apply both filters
      const combinedFilter = { ...matchCondition, ...dateFilter };
      const AdminProject1 = {
        enquiry_id: 1,
        created_at: 1,
        items: 1,
        quotation_items: 1,
        payment_terms: 1,
        created_at: 1,
        updated_at: 1,
        enquiry_status: 1,
        buyer: {
          $arrayElemAt: ["$buyer_details", 0],
        },
        supplier: {
          $arrayElemAt: ["$supplier_details", 0],
        },
      };

      const AdminProject2 = {
        enquiry_id: 1,
        created_at: 1,
        items: 1,
        quotation_items: 1,
        payment_terms: 1,
        created_at: 1,
        updated_at: 1,
        enquiry_status: 1,
        "buyer.buyer_id": 1,
        "buyer.buyer_name": 1,
        "buyer.buyer_type": 1,
        "buyer.buyer_mobile": 1,
        "buyer.country_of_origin": 1,
        "supplier.supplier_id": 1,
        "supplier.supplier_name": 1,
        "supplier.supplier_type": 1,
        "supplier.supplier_mobile": 1,
        "supplier.country_of_origin": 1,
      };

      const projObj1 = {
        enquiry_id: 1,
        created_at: 1,
        items: 1,
        enquiry_status: 1,
        buyer: {
          $arrayElemAt: ["$buyer_details", 0],
        },
        supplier: {
          $arrayElemAt: ["$supplier_details", 0],
        },
      };

      const projObj2 = {
        enquiry_id: 1,
        created_at: 1,
        items: 1,
        enquiry_status: 1,
        "buyer.buyer_id": 1,
        "buyer.buyer_name": 1,
        "buyer.buyer_type": 1,
        "buyer.buyer_mobile": 1,
        "buyer.country_of_origin": 1,
        "supplier.supplier_id": 1,
        "supplier.supplier_name": 1,
        "supplier.supplier_type": 1,
        "supplier.supplier_mobile": 1,
        "supplier.country_of_origin": 1,
      };

      const proj1 = usertype == "Admin" ? AdminProject1 : projObj1;
      const proj2 = usertype == "Admin" ? AdminProject2 : projObj2;

      let data = await Enquiry.aggregate([
        {
          // $match: matchCondition
          $match: usertype == "Admin" ? combinedFilter : matchCondition,
        },
        {
          $lookup: {
            from: "buyers",
            localField: "buyer_id",
            foreignField: "buyer_id",
            as: "buyer_details",
          },
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "supplier_id",
            foreignField: "supplier_id",
            as: "supplier_details",
          },
        },
        {
          $project: proj1,
        },
        {
          $project: proj2,
        },
        {
          $sort: { created_at: -1 },
        },
        {
          $skip: offset,
        },
        {
          $limit: page_size,
        },
      ]);
      if (!data) {
        return res?.status(400)?.send({
          code: 400,
          message: "Error occured fetching enquiry list",
          result: {},
        });
      }

      const totalItems = await Enquiry.countDocuments(
        usertype == "Admin" ? combinedFilter : matchCondition
      );
      const totalPages = Math.ceil(totalItems / page_size);

      const returnObj = {
        data,
        totalPages,
        totalItems: totalItems,
      };
      return res
        ?.status(200)
        ?.send({ code: 200, message: "Enquiry list", result: returnObj });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },
};
