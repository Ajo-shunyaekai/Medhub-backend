require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const moment = require("moment");
const generator = require("generate-password");
const { addMonths, format } = require("date-fns"); // Use this for adding 2 months
const Admin = require("../schema/adminSchema");
const Order = require("../schema/orderSchema");
const Supplier = require("../schema/supplierSchema");
const Buyer = require("../schema/buyerSchema");
const MedicineInventory = require("../schema/medicineInventorySchema");
const Support = require("../schema/supportSchema");
const Notification = require("../schema/notificationSchema");
const Enquiry = require("../schema/enquiryListSchema");
const PurchaseOrder = require("../schema/purchaseOrderSchema");
const Invoices = require("../schema/invoiceSchema");
const ProfileEditRequest = require("../schema/profileEditRequestSchema");
const Subscription = require("../schema/subscriptionSchema");
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
const { parse } = require("json2csv");
const fs = require("fs");
const path = require("path");
const { flattenData } = require("../utils/csvConverter");
const {
  sendErrorResponse,
  sendSuccessResponse,
  handleCatchBlockError,
} = require("../utils/commonResonse");
const logErrorToFile = require("../logs/errorLogs");
const { generateProfileEditRequestEmail } = require("../utils/emailContents");
const { sendEmail, sendTemplateEmail } = require("../utils/emailService");
const { getFilePathsEdit } = require("../helper");

const generatePassword = () => {
  const password = generator.generate({
    length: 12,
    numbers: true,
  });
  return password;
};

var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  type: "oauth2",
  // service : 'gmail',
  auth: {
    user: process.env.SMTP_USER_ID,
    pass: process.env.SMTP_USER_PASSWORD,
  },
});
const sendMailFunc = (email, subject, body) => {
  var mailOptions = {
    from: `Medhub Global <${process.env.SMTP_USER_ID}>`,
    to: email,
    subject: subject,
    // text    : 'This is text mail, and sending for testing purpose'
    html: body,
  };
  transporter.sendMail(mailOptions);
};

module.exports = {
  getSupplierCSVList: async (req, res) => {
    try {
      const { pageNo, pageSize, filterKey, filterValue } = req?.body;

      let filterCondition = {};
      if (filterKey === "pending") {
        filterCondition = { account_status: 0 };
      } else if (filterKey === "accepted") {
        filterCondition = { account_status: 1 };
      } else if (filterKey === "rejected") {
        filterCondition = { account_status: 2 };
      }

      let dateFilter = {};
      const combinedFilter = { ...filterCondition, ...dateFilter };

      const suppliers = await Supplier.find(combinedFilter).sort({
        createdAt: -1,
      });

      const supplierIds = suppliers.map((buyer) => buyer._id.toString());

      // Fetch subscription data related to buyers
      const subscriptions = await Subscription.find({
        userId: { $in: supplierIds },
        userSchemaReference: "Supplier",
      }).lean();

      // Map subscriptions by userId
      const subscriptionMap = {};
      subscriptions.forEach((sub) => {
        subscriptionMap[sub.userId.toString()] =
          sub.subscriptionDetails || null;
      });

      const enrichedSuppliers = suppliers?.map((supplier) => {
        const subDetails = subscriptionMap[supplier._id.toString()];
        const hasSubscription = !!subDetails;

        return {
          ...supplier,
          subscription_name: hasSubscription ? subDetails.name || "N/A" : "N/A",
          payment_status: hasSubscription ? "Paid" : "Pending",
          promotion_name: hasSubscription
            ? subDetails.promotionName || "N/A"
            : "N/A",
          renewal_date: hasSubscription
            ? subDetails.subscriptionEndDate || "N/A"
            : format(
                addMonths(new Date(supplier.createdAt), 2),
                "MMMM dd, yyyy"
              ),
        };
      });

      // Convert Mongoose document to plain object and flatten
      const flattenedData = enrichedSuppliers.map((item) =>
        flattenData(
          item,
          [
            "_id",
            "__v",
            "supplier_image",
            "license_image",
            "tax_image",
            "otp",
            "otpCount",
            "otpLimitReachedAt",
            "otpExpiry",
            "test_account",
            "currentSubscription",
            "subscriptionsHistory",
          ],
          [],
          "supplier_list"
        )
      ); // `toObject()` removes internal Mongoose metadata

      // Define desired column order
      const fields = [
        "Supplier Id",
        "Supplier Name",
        "Supplier Type",
        "Sales Person Name",
        "Contact Person Name",
        "Contact Person Email",
        "Country Of Origin",
        "Country Of Operation",
        "Categories",
        "Tags",
        "Account Creation Date",
        "Account Approved Date",
        "Last Login",
        "Login Frequency",
        "Account Status",
        // 'Payment Status',
        // 'Subscription Name',
        // 'Promotion Name',
        // 'Renewal date',
        // 'Supplier Email',
        // 'Supplier Country Code',
        // 'Supplier Mobile',
        // 'Contact Person Name',
        // 'Designation',
        // 'Contact Person Email',
        // 'Contact Person Country Code',
        // 'Contact Person Mobile No',
        // 'Description',
        // 'License No',
        // 'Registration No',
        // 'Vat Reg No',
        // 'License Expiry Date',
      ];

      // Convert the flattened data to CSV
      const csv = parse(flattenedData, { fields });

      // Set headers for file download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=users.csv");

      res.status(200).send(csv);
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getBuyerCSVList: async (req, res) => {
    try {
      const { pageNo, pageSize, filterKey, filterValue } = req?.body;

      let filterCondition = {};
      if (filterKey === "pending") {
        filterCondition = { account_status: 0 };
      } else if (filterKey === "accepted") {
        filterCondition = { account_status: 1 };
      } else if (filterKey === "rejected") {
        filterCondition = { account_status: 2 };
      }

      const combinedFilter = { ...filterCondition };

      // Fetch buyers
      const buyers = await Buyer.find(combinedFilter)
        .sort({ createdAt: -1 })
        .lean();

      // Get all buyer _ids to fetch related subscriptions
      const buyerIds = buyers.map((buyer) => buyer._id.toString());

      // Fetch subscription data related to buyers
      const subscriptions = await Subscription.find({
        userId: { $in: buyerIds },
        userSchemaReference: "Buyer",
      }).lean();

      // Map subscriptions by userId
      const subscriptionMap = {};

      subscriptions.forEach((sub) => {
        subscriptionMap[sub.userId.toString()] =
          sub.subscriptionDetails || null;
      });

      const enrichedBuyers = buyers.map((buyer) => {
        const subDetails = subscriptionMap[buyer._id.toString()];
        const hasSubscription = !!subDetails;

        return {
          ...buyer,
          subscription_name: hasSubscription ? subDetails.name || "N/A" : "N/A",
          payment_status: hasSubscription ? "Paid" : "Pending",
          promotion_name: hasSubscription
            ? subDetails.promotionName || "N/A"
            : "N/A",
          renewal_date: hasSubscription
            ? subDetails.subscriptionEndDate || "N/A"
            : format(addMonths(new Date(buyer.createdAt), 2), "MMMM dd, yyyy"),
        };
      });

      // Flatten buyer data for CSV
      const flattenedData = enrichedBuyers.map((item) =>
        flattenData(
          item,
          [
            "_id",
            "__v",
            "supplier_image",
            "buyer_image",
            "license_image",
            "tax_image",
            "certificate_image",
            "profile_status",
            "updatedAt",
            "token",
            "password",
          ],
          [],
          "buyer_list"
        )
      );

      // Fields for CSV
      const fields = [
        "Buyer Id",
        "Buyer Name",
        "Buyer Type",
        "Sales Person Name",
        "Contact Person Name",
        "Contact Person Email",
        "Country Of Origin",
        "Country Of Operation",
        "Interested In",
        "Tags",
        "Account Creation Date",
        "Account Approved Date",
        "Last Login",
        "Login Frequency",
        "Account Status",
        // 'Payment Status',
        // 'Subscription Name',
        // 'Promotion Name',
        // 'Renewal Date',
        // 'Buyer Email',
        // 'Buyer Country Code',
        // 'Buyer Mobile',
        // 'Contact Person Name',
        // // 'Designation',
        // 'Contact Person Email',
        // 'Contact Person Country Code',
        // 'Contact Person Mobile No',
        // 'Description',
        // 'License No',
        // 'Registration No',
        // 'Vat Reg No',
        // 'License Expiry Date',
      ];

      // Convert to CSV
      const csv = parse(flattenedData, { fields });

      // Set headers and send file
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=buyers.csv");
      res.status(200).send(csv);
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getRegReqList: async (req, res, reqObj, callback) => {
    try {
      const { pageNo, limit, filterValue, pageSize, searchKey = '', status } = reqObj;

      const page_no = pageNo || 1; 
      const page_size = limit || pageSize || 5; 
      const offSet = (page_no - 1) * page_size;

      const fields = {
        token: 0,
        password: 0,
      };

      let dateFilter = {}; 

      const startDate = moment().subtract(365, "days").startOf("day").toDate();
      const endDate = moment().endOf("day").toDate();

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
      } else if (!filterValue || filterValue === "all") {
        dateFilter = {}; // No filtering, fetch all data
      }

      const searchFilter = searchKey
      ? {
        supplier_name: { $regex: new RegExp(`^${searchKey}`, "i") },
        }
      : {};

    const query = {
      account_status: status,
      ...dateFilter,
      ...searchFilter,
    };

      Supplier.find(query)
        .select(fields)
        .sort({ createdAt: -1 }) 
        .skip(offSet)
        .limit(page_size)
        .then((data) => {
          Supplier.countDocuments(query)
            .then((totalItems) => {
              const totalPages = Math.ceil(totalItems / page_size);
              const returnObj = {
                data,
                totalPages,
                totalItems,
              };
              callback({
                code: 200,
                message:
                  "Supplier registration request list fetched successfully",
                result: returnObj,
              });
            })
            .catch((err) => {
              console.error("Error while counting documents:", err);
              callback({
                code: 400,
                message:
                  "Error while fetching supplier registration request list count",
                result: err,
              });
            });
        })
        .catch((error) => {
          console.error(
            "Error in fetching suppliers registration request list:",
            error
          );
          callback({
            code: 400,
            message: "Error in fetching supplier registration request list",
            result: error,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getSuppReqCSVList: async (req, res) => {
    try {
      const data = await Supplier.find({ account_status: 0 }).sort({
        createdAt: -1,
      });

      // Convert Mongoose document to plain object and flatten
      const flattenedData = data.map((item) =>
        flattenData(item.toObject(), [
          "_id",
          "__v",
          "supplier_image",
          "license_image",
          "tax_image",
          "certificate_image",
          "profile_status",
          "createdAt",
          "updatedAt",
          "token",
          "password",
        ])
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

  acceptRejectSupplierRegReq: async (req, res, reqObj, callback) => {
    try {
      const { supplier_id, sales_person_name, action } = reqObj;

      const supplier = await Supplier.findOne({ supplier_id: supplier_id });

      if (!supplier) {
        return callback({ code: 400, message: "Supplier not found" });
      }
      const newAccountStatus =
        action === "accept" ? 1 : action === "reject" ? 2 : "";
      const newProfileStatus = 1;

      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, "0")}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${now.getFullYear()} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
        now.getSeconds()
      ).padStart(2, "0")}`;

      let updateFields = {
        account_status: newAccountStatus,
        profile_status: newProfileStatus,
        sales_person_name,
      };

      if (action === "accept") {
        updateFields.account_accepted_date = formattedDate;
      } else if (action === "reject") {
        updateFields.account_rejected_date = formattedDate;
      }

      const updateProfile = await Supplier.findOneAndUpdate(
        { supplier_id: supplier_id },
        updateFields,
        { new: true }
      );

      if (!updateProfile) {
        return callback({
          code: 400,
          message: "Failed to update supplier status",
        });
      }

      if (action === "accept") {
        let password = generatePassword();
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        updateProfile.password = hashedPassword;
        await updateProfile.save();

        const returnObj = {
          supplier_id: updateProfile.supplier_id,
          supplier_name: updateProfile.supplier_name,
          supplier_email: updateProfile.supplier_email,
          supplier_mobile_no: updateProfile.supplier_mobile,
          supplier_country_code: updateProfile.supplier_country_code,
          account_status: updateProfile.account_status,
          profile_status: updateProfile.profile_status,
          password: updateProfile.password,
          generatedPassword: password,
        };

        const subject = "Welcome! Your Medhub Global Account Has Been Verified";

        // Sending the email to multiple recipients
        const recipientEmails = [
          updateProfile.contact_person_email,
        ];

        //start -> for using ejs template
        const templateName = "userRegistrationApproval";
        const context = {
          user_id: updateProfile?.supplier_id,
          company_name: updateProfile?.supplier_name,
          contact_person_name: updateProfile?.contact_person_name,
          contact_person_email: updateProfile.contact_person_email,
          temp_password: password,
          user_type: "supplier",
        };

        await sendTemplateEmail(
          recipientEmails.join(","),
          subject,
          templateName,
          context
        );

        return callback({
          code: 200,
          message: "Supplier Registration Accepted Successfully",
          result: returnObj,
        });
      } else if (action === "reject") {
        return callback({
          code: 200,
          message: "Supplier Registration Rejected",
          result: null,
        });
      } else {
        return callback({ code: 400, message: "Invalid action" });
      }
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  supplierSupportList: async (req, res, reqObj, callback) => {
    try {
      const { pageNo, pageSize } = reqObj;

      const page_no = pageNo || 1;
      const page_size = pageSize || 1;
      const offset = (page_no - 1) * page_size;

      Support.find({ usertype: "supplier" })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(page_size)
        .then((data) => {
          Support.countDocuments()
            .then((totalItems) => {
              const totalPages = Math.ceil(totalItems / page_size);
              const returnObj = {
                data,
                totalPages,
              };
              callback({
                code: 200,
                message: "support list fetched successfully",
                result: returnObj,
              });
            })
            .catch((err) => {
              logErrorToFile(err, req);
              callback({
                code: 400,
                message: "error while fetching support list count",
                result: err,
              });
            });
        })
        .catch((err) => {
          logErrorToFile(err, req);
          callback({
            code: 400,
            message: "error while fetching support list",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getBuyerList: async (req, res, reqObj, callback) => {
    try {
      const { pageNo, pageSize, filterKey, filterValue, searchKey = '' } = reqObj;

      const page_no = pageNo || 1;
      const page_size = pageSize || 2;
      const offSet = (page_no - 1) * page_size;

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

      const searchFilter = searchKey
      ? {
          buyer_name: { $regex: new RegExp(`^${searchKey}`, "i") },
        }
      : {};

      // Merge dateFilter with filterCondition to apply both filters
      const combinedFilter = { ...filterCondition, ...dateFilter, ...searchFilter };

      const data = await Buyer.find(combinedFilter)
        .select(fields)
        .sort({ createdAt: -1 })
        .skip(offSet)
        .limit(page_size);
      const totalItems = await Buyer.countDocuments(combinedFilter);

      const totalPages = Math.ceil(totalItems / page_size);
      const returnObj = {
        data,
        totalPages,
        totalItems,
      };

      callback({
        code: 200,
        message: "Buyer list fetched successfully",
        result: returnObj,
      });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getBuyerRegReqList: async (req, res, reqObj, callback) => {
    try {
      const { pageNo, pageSize, filterValue, searchKey = '' } = reqObj;

      const page_no = pageNo || 1;
      const page_size = pageSize || 2;
      const offSet = (page_no - 1) * page_size;

      const fields = {
        token: 0,
        password: 0,
      };

      let dateFilter = {};

      const startDate = moment().subtract(365, "days").startOf("day").toDate();
      const endDate = moment().endOf("day").toDate();

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
        dateFilter = {};
      }

      const searchFilter = searchKey
      ? {
          buyer_name: { $regex: new RegExp(`^${searchKey}`, "i") },
        }
      : {};

      const query = {
        account_status: 0,
        ...dateFilter,
        ...searchFilter,
      };

      Buyer.find(query)
        .select(fields)
        .sort({ createdAt: -1 })
        .skip(offSet)
        .limit(page_size)
        .then((data) => {
          Buyer.countDocuments(query)
            .then((totalItems) => {
              const totalPages = Math.ceil(totalItems / page_size);
              const resultObj = {
                data,
                totalPages,
                totalItems,
              };
              callback({
                code: 200,
                message: "Buyer Registration Request List fetched Successfully",
                result: resultObj,
              });
            })
            .catch((err) => {
              callback({
                code: 400,
                message: "Error in counting buyer registratiion requests count",
                result: err,
              });
            });
        })
        .catch((err) => {
          callback({
            code: 400,
            message: "Error while fetching supplier registration requests list",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  acceptRejectBuyerRegReq: async (req, res, reqObj, callback) => {
    try {
      const { buyer_id, sales_person_name = "", action } = reqObj;

      const buyer = await Buyer.findOne({ buyer_id: buyer_id });

      if (!buyer) {
        return callback({ code: 400, message: "Buyer not found" });
      }

      const newAccountStatus =
        action === "accept" ? 1 : action === "reject" ? 2 : "";
      const newProfileStatus = 1;

      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, "0")}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${now.getFullYear()} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
        now.getSeconds()
      ).padStart(2, "0")}`;

      let updateFields = {
        account_status: newAccountStatus,
        profile_status: newProfileStatus,
        sales_person_name,
      };

      if (action === "accept") {
        updateFields.account_accepted_date = formattedDate;
      } else if (action === "reject") {
        updateFields.account_rejected_date = formattedDate;
      }

      const updateStatus = await Buyer.findOneAndUpdate(
        { buyer_id: buyer_id },
        updateFields,
        { new: true }
      );

      if (!updateStatus) {
        return callback({
          code: 400,
          message: "Failed to update buyer status",
        });
      }

      if (action === "accept") {
        let password = generatePassword();
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        updateStatus.password = hashedPassword;
        await updateStatus.save();

        const returnObj = {
          buyer_id: updateStatus.buyer_id,
          buyer_name: updateStatus.buyer_name,
          buyer_email: updateStatus.buyer_email,
          buyer_mobile: updateStatus.buyer_mobile,
          buyer_country_code: updateStatus.buyer_country_code,
          status: updateStatus.account_status,
          password: updateStatus.password,
          generatedPassword: password,
        };

        const subject = "Welcome! Your Medhub Global Account Has Been Verified";

        // Sending the email to multiple recipients
        const recipientEmails = [
          updateStatus.contact_person_email,
        ];

        //start -> for using ejs template
        const templateName = "userRegistrationApproval";
        const context = {
          user_id: updateStatus?.buyer_id,
          company_name: updateStatus?.buyer_name,
          contact_person_name: updateStatus?.contact_person_name,
          contact_person_email: updateStatus.contact_person_email,
          temp_password: password,
          user_type: "buyer",
        };

        await sendTemplateEmail(
          recipientEmails.join(","),
          subject,
          templateName,
          context
        );

        return callback({
          code: 200,
          message: "Buyer Registration Accepted Successfully",
          result: returnObj,
        });
      } else if (action === "reject") {
        return callback({
          code: 200,
          message: "Buyer Registration Rejected",
          result: null,
        });
      } else {
        return callback({ code: 400, message: "Invalid action" });
      }
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  buyerOrdersList: async (req, res, reqObj, callback) => {
    try {
      const { pageNo, pageSize, filterKey, buyer_id, filterValue } = reqObj;

      const page_no = pageNo || 1;
      const limit = pageSize || 2;
      const offset = (page_no - 1) * limit;

      let dateFilter = {};

      // Apply date filter based on the filterValue (today, week, month, year, all)
      const currentDate = new Date(); // Current date and time

      if (filterValue === "today") {
        // Filter for today
        dateFilter = {
          created_at: {
            $gte: moment().startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        };
      } else if (filterValue === "week") {
        // Filter for the last 7 days
        dateFilter = {
          created_at: {
            $gte: moment().subtract(7, "days").startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        };
      } else if (filterValue === "month") {
        // Filter for the last 30 days
        dateFilter = {
          created_at: {
            $gte: moment().subtract(30, "days").startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        };
      } else if (filterValue === "year") {
        // Filter for the last 365 days
        dateFilter = {
          created_at: {
            $gte: moment().subtract(365, "days").startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        };
      } else if (filterValue === "all") {
        // No date filter for 'all'
        dateFilter = {};
      } else {
        // callback({ code: 400, message: "Invalid filterValue provided" });
        // return;
      }

      Order.aggregate([
        {
          $match: {
            order_status: reqObj.filterKey,
            ...dateFilter,
          },
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
          $lookup: {
            from: "buyers",
            localField: "buyer_id",
            foreignField: "buyer_id",
            as: "buyer",
          },
        },
        {
          $project: {
            order_id: 1,
            buyer_id: 1,
            buyer_name: 1,
            supplier_id: 1,
            supplier_name: 1,
            items: 1,
            payment_terms: 1,
            est_delivery_time: 1,
            shipping_details: 1,
            remarks: 1,
            order_status: 1,
            status: 1,
            invoice_no: 1,
            created_at: 1,
            supplier: { $arrayElemAt: ["$supplier", 0] },
            buyer: { $arrayElemAt: ["$buyer", 0] },
          },
        },
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: "$_id",
            order_id: { $first: "$order_id" },
            buyer_id: { $first: "$buyer_id" },
            buyer_name: { $first: "$buyer_name" },
            supplier_id: { $first: "$supplier_id" },
            supplier_name: { $first: "$supplier_name" },
            items: { $push: "$items" },
            payment_terms: { $first: "$payment_terms" },
            est_delivery_time: { $first: "$est_delivery_time" },
            shipping_details: { $first: "$shipping_details" },
            remarks: { $first: "$remarks" },
            order_status: { $first: "$order_status" },
            status: { $first: "$status" },
            invoice_no: { $first: "$invoice_no" },
            created_at: { $first: "$created_at" },
            supplier: { $first: "$supplier" },
            buyer: { $first: "$buyer" },
            totalPrice: { $sum: "$items.item_price" },
          },
        },
        {
          $project: {
            order_id: 1,
            buyer_id: 1,
            buyer_name: 1,
            supplier_id: 1,
            supplier_name: 1,
            items: 1,
            payment_terms: 1,
            est_delivery_time: 1,
            shipping_details: 1,
            remarks: 1,
            order_status: 1,
            status: 1,
            invoice_no: 1,
            created_at: 1,
            totalPrice: 1,
            "supplier.supplier_image": 1,
            "supplier.supplier_name": 1,
            "supplier.supplier_type": 1,
            "buyer.buyer_image": 1,
            "buyer.buyer_name": 1,
            "buyer.buyer_type": 1,
          },
        },
        { $sort: { created_at: -1 } },
        { $skip: offset },
        { $limit: limit },
      ])
        .then((data) => {
          Order.countDocuments({ order_status: filterKey, ...dateFilter }).then(
            (totalItems) => {
              const totalPages = Math.ceil(totalItems / limit);

              const responseData = {
                data,
                totalPages,
                totalItems,
              };
              callback({
                code: 200,
                message: "Buyer Order List Fetched successfully",
                result: responseData,
              });
            }
          );
        })
        .catch((err) => {
          logErrorToFile(err, req);
          callback({
            code: 400,
            message: "Error in fetching order list",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  buyerSupportList: async (req, res, reqObj, callback) => {
    try {
      const { pageNo, pageSize } = reqObj;

      const page_no = pageNo || 1;
      const page_size = pageSize || 1;
      const offset = (page_no - 1) * page_size;

      Support.find({ usertype: "buyer" })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(page_size)
        .then((data) => {
          Support.countDocuments()
            .then((totalItems) => {
              const totalPages = Math.ceil(totalItems / page_size);
              const returnObj = {
                data,
                totalPages,
              };
              callback({
                code: 200,
                message: "support list fetched successfully",
                result: returnObj,
              });
            })
            .catch((err) => {
              logErrorToFile(err, req);
              callback({
                code: 400,
                message: "error while fetching support list count",
                result: err,
              });
            });
        })
        .catch((err) => {
          logErrorToFile(err, req);
          callback({
            code: 400,
            message: "error while fetching support list",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  buyerInvoicesList: async (req, res, reqObj, callback) => {
    try {
      const { page_no, limit, filterKey, buyer_id } = reqObj;

      const pageNo = page_no || 1;
      const pageSize = limit || 1;
      const offset = (pageNo - 1) * pageSize;

      Order.aggregate([
        {
          $match: {
            // buyer_id     : reqObj.buyer_id,
            order_status: reqObj.filterKey,
          },
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
          $project: {
            order_id: 1,
            buyer_id: 1,
            buyer_company: 1,
            supplier_id: 1,
            items: 1,
            payment_terms: 1,
            est_delivery_time: 1,
            shipping_details: 1,
            remarks: 1,
            order_status: 1,
            invoice_number: 1,
            created_at: 1,
            supplier: { $arrayElemAt: ["$supplier", 0] },
          },
        },
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: "$_id",
            order_id: { $first: "$order_id" },
            buyer_id: { $first: "$buyer_id" },
            buyer_company: { $first: "$buyer_company" },
            supplier_id: { $first: "$supplier_id" },
            items: { $push: "$items" },
            payment_terms: { $first: "$payment_terms" },
            est_delivery_time: { $first: "$est_delivery_time" },
            shipping_details: { $first: "$shipping_details" },
            remarks: { $first: "$remarks" },
            order_status: { $first: "$order_status" },
            invoice_number: { $first: "$invoice_number" },
            created_at: { $first: "$created_at" },
            supplier: { $first: "$supplier" },
            totalPrice: { $sum: "$items.item_price" },
          },
        },
        {
          $project: {
            order_id: 1,
            buyer_id: 1,
            buyer_company: 1,
            supplier_id: 1,
            items: 1,
            payment_terms: 1,
            est_delivery_time: 1,
            shipping_details: 1,
            remarks: 1,
            order_status: 1,
            invoice_number: 1,
            created_at: 1,
            totalPrice: 1,
            "supplier.supplier_image": 1,
            "supplier.supplier_name": 1,
            "supplier.supplier_address": 1,
          },
        },
        { $sort: { created_at: -1 } },
        { $skip: offset },
        { $limit: pageSize },
      ])
        .then((data) => {
          Order.countDocuments({ order_status: filterKey }).then(
            (totalItems) => {
              const totalPages = Math.ceil(totalItems / pageSize);

              const responseData = {
                data,
                totalPages,
                totalItems,
              };
              callback({
                code: 200,
                message: "List Fetched successfully",
                result: responseData,
              });
            }
          );
        })
        .catch((err) => {
          logErrorToFile(err, req);
          callback({
            code: 400,
            message: "Error in fetching order list",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getTotalRegReqList: async (req, res, reqObj, callback) => {
    try {
      const { pageNo, pageSize, filterValue } = reqObj;

      const page_no = pageNo || 1;
      const page_size = pageSize || 2;
      const offSet = (page_no - 1) * page_size;

      const fields = {
        token: 0,
        password: 0,
      };

      let dateFilter = {};

      const startDate = moment().subtract(365, "days").startOf("day").toDate();
      const endDate = moment().endOf("day").toDate();

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
        dateFilter = {};
      }

      // Fetch all buyer and supplier data first (no pagination applied yet)
      const buyerQuery = Buyer.find({ account_status: 0, ...dateFilter })
        .select(fields)
        .sort({ createdAt: -1 });

      const supplierQuery = Supplier.find({ account_status: 0, ...dateFilter })
        .select(fields)
        .sort({ createdAt: -1 });

      const buyerCountQuery = Buyer.countDocuments({
        account_status: 0,
        ...dateFilter,
      });
      const supplierCountQuery = Supplier.countDocuments({
        account_status: 0,
        ...dateFilter,
      });

      const [buyerData, supplierData, buyerTotalCount, supplierTotalCount] =
        await Promise.all([
          buyerQuery,
          supplierQuery,
          buyerCountQuery,
          supplierCountQuery,
        ]);

      // Add 'registration_type' to differentiate between buyer and supplier
      const unifiedData = [
        ...buyerData.map((buyer) => ({
          ...buyer._doc,
          registration_type: "Buyer",
        })),
        ...supplierData.map((supplier) => ({
          ...supplier._doc,
          registration_type: "Supplier",
        })),
      ];

      // Sort the combined data by creation date
      unifiedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Apply pagination after combining the data
      const paginatedData = unifiedData.slice(offSet, offSet + page_size);

      // Calculate total number of requests and pages
      const totalRequests = buyerTotalCount + supplierTotalCount;
      const totalPages = Math.ceil(totalRequests / page_size);

      // Prepare the result object
      const resultObj = {
        data: paginatedData,
        totalPages,
        totalItems: totalRequests,
      };

      callback({
        code: 200,
        message: "Registration request list fetched successfully",
        result: resultObj,
      });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getTotalApprovedRegReqList: async (req, res, reqObj, callback) => {
    try {
      const { pageNo, pageSize, filterValue } = reqObj;

      const page_no = pageNo || 1;
      const page_size = pageSize || 2;
      const offSet = (page_no - 1) * page_size;

      const fields = {
        token: 0,
        password: 0,
      };

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

      // Fetch all buyer and supplier data first (no pagination applied yet)
      const buyerQuery = Buyer.find({ account_status: 1, ...dateFilter })
        .select(fields)
        .sort({ createdAt: -1 });

      const supplierQuery = Supplier.find({ account_status: 1, ...dateFilter })
        .select(fields)
        .sort({ createdAt: -1 });

      const buyerCountQuery = Buyer.countDocuments({
        account_status: 1,
        ...dateFilter,
      });
      const supplierCountQuery = Supplier.countDocuments({
        account_status: 1,
        ...dateFilter,
      });

      const [buyerData, supplierData, buyerTotalCount, supplierTotalCount] =
        await Promise.all([
          buyerQuery,
          supplierQuery,
          buyerCountQuery,
          supplierCountQuery,
        ]);

      // Add 'registration_type' to differentiate between buyer and supplier
      const unifiedData = [
        ...buyerData.map((buyer) => ({
          ...buyer._doc,
          registration_type: "Buyer",
        })),
        ...supplierData.map((supplier) => ({
          ...supplier._doc,
          registration_type: "Supplier",
        })),
      ];

      // Sort the combined data by creation date
      unifiedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Apply pagination after combining the data
      const paginatedData = unifiedData.slice(offSet, offSet + page_size);

      // Calculate total number of requests and pages
      const totalRequests = buyerTotalCount + supplierTotalCount;
      const totalPages = Math.ceil(totalRequests / page_size);

      // Prepare the result object
      const resultObj = {
        data: paginatedData,
        totalPages,
        totalItems: totalRequests,
      };

      callback({
        code: 200,
        message: "Registration request list fetched successfully",
        result: resultObj,
      });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getProfileUpdateReqList: async (req, res, reqObj, callback) => {
    try {
      const { pageNo, limit, usertype } = reqObj;

      const page_no = pageNo || 1;
      const page_size = limit || 2;
      const offSet = (page_no - 1) * page_size;

      const fieldsToExclude = {
        token: 0,
        createdAt: 0,
        updatedAt: 0,
        password: 0,
      };

      const fetchUpdateProfileRequests = (Model, callback) => {
        Model.find({})
          .select(fieldsToExclude)
          .skip(offSet)
          .limit(page_size)
          .then((data) => {
            Model.countDocuments()
              .then((totalItems) => {
                const totalPages = Math.ceil(totalItems / page_size);
                const returnObj = {
                  data,
                  totalPages,
                };
                callback({
                  code: 200,
                  message: "Update Profile Req list fetched successfully",
                  result: returnObj,
                });
              })
              .catch((err) => {
                callback({
                  code: 400,
                  message: "Error while fetching update profile req list count",
                  result: err,
                });
              });
          })
          .catch((err) => {
            callback({
              code: 400,
              message: "Error while fetching update profile req list",
              result: err,
            });
          });
      };

      if (usertype === "supplier") {
        fetchUpdateProfileRequests(supplierEdit, callback);
      } else if (usertype === "supplier") {
        fetchUpdateProfileRequests(supplierEdit, callback);
      }
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  acceptRejectProfileEditRequest: async (req, res) => {
    const { id } = req?.params;
    const { action } = req?.body;

    try {
      // Find the profile edit request
      const profileReq = await ProfileEditRequest?.findById(id);
      if (!profileReq) {
        return sendErrorResponse(res, 400, "Failed to fetch profile request.");
      }

      // Find the user to update profile request
      const profile = await profileReq?.userSchemaReference?.findById(
        profileReq?.userId
      );
      if (!profile) {
        return sendErrorResponse(
          res,
          400,
          "Failed to fetch profile data to update details."
        );
      }

      // Update the profile edit request status
      const updatedProfileReq = await ProfileEditRequest?.findByIdAndUpdate(
        profileReq?._id,
        {
          $set: {
            editReqStatus: action,
          },
        },
        { new: true }
      );

      if (!updatedProfileReq) {
        return sendErrorResponse(
          res,
          400,
          "Failed to update profile edit request status."
        );
      }

      // Update the profile with new address values, if any changes
      const updatedProfile =
        await profileReq?.userSchemaReference?.findByIdAndUpdate(
          profile?._id,
          {
            $set: {
              registeredAddress: {
                ...profile?.registeredAddress,
                ...updatedProfileReq?.registeredAddress,
              },
              profile_status: action == "Approved" ? 1 : 2,
            },
          },
          { new: true }
        );

      if (!updatedProfile) {
        return sendErrorResponse(res, 400, "Failed to update profile address.");
      }

      // Return a success response
      return sendSuccessResponse(
        res,
        200,
        "Profile edit request processed successfully.",
        { updatedProfileReq, updatedProfile }
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  acceptRejectAddMedicineReq: async (req, res, reqObj, callback) => {
    try {
      const {
        admin_id,
        product_id,
        supplier_id,
        supplier_email,
        supplier_contact_email,
        supplier_name,
        action,
        rejectionReason,
      } = reqObj;

      const medicine = await Medicine.findOne({ product_id, supplier_id });
      const supplier = await Supplier.findOne({ supplier_id: supplier_id });

      if (!medicine) {
        return callback({ code: 400, message: "Medicine not found" });
      }

      const { medicine_type } = medicine; // Fetch the medicine type from the found medicine

      const newMedicineStatus =
        action === "accept" ? 1 : action === "reject" ? 2 : null;

      // Ensure both status and edit_status are updated correctly
      const updateStatus = await Medicine.findOneAndUpdate(
        { product_id, supplier_id }, // Query to find the document
        { status: newMedicineStatus, edit_status: newMedicineStatus }, // Fields to update
        { new: true } // Return the updated document
      );

      if (!updateStatus) {
        return callback({
          code: 400,
          message: "Failed to update medicine status",
        });
      }

      let body;
      let subject;
      let event;

      // Handle the success message based on status and action
      if (action === "accept") {
        subject = "Medicine Added Successfully";
        body = `Dear ${supplier.contact_person_name}, <br /><br />
                      We are pleased to inform you that your medicine request has been approved and successfully added to our records. Below are the details for your reference: <br /><br />
                      <strong>Medicine ID:</strong> ${updateStatus.product_id} <br />
                      <strong>Medicine Name:</strong> ${updateStatus.medicine_name} <br />
                      <strong>Supplier ID:</strong> ${updateStatus.supplier_id} <br /><br />
                      If you require further assistance or have any queries, feel free to contact us at <a href="mailto:connect@medhub.global">connect@medhub.global</a>. <br /><br />
                      Thank you for being a valued partner. <br /><br />
                      Best regards, <br />
                      <strong>Medhub Global Team</strong>`;

        // Determine event type based on medicine_type
        event =
          medicine_type === "new" ? "addnewmedicine" : "addsecondarymedicine";

        // Send email for acceptance
        sendMailFunc(supplier.contact_person_email, subject, body);

        const notificationId = "NOT-" + Math.random().toString(16).slice(2, 10);
        const newNotification = new Notification({
          notification_id: notificationId,
          event_type: "Medicine Request Accepted",
          event,
          from: "admin",
          to: "supplier",
          from_id: admin_id,
          to_id: supplier_id,
          event_id: product_id,
          message: `${product_id}: Your listing has been approved and is now live!`,
          status: 0,
        });
        await newNotification.save();
      } else if (action === "reject") {
        const notificationId = "NOT-" + Math.random().toString(16).slice(2, 10);
        const newNotification = new Notification({
          notification_id: notificationId,
          event_type: "Medicine Request Rejected",
          event: "addmedicine", // This can remain general as the event type
          from: "admin",
          to: "supplier",
          from_id: admin_id,
          to_id: supplier_id,
          event_id: product_id,
          message: `${product_id}: Your listing has been disapproved.`,
          status: 0,
        });
        await newNotification.save();
      } else {
        return callback({ code: 400, message: "Invalid action" });
      }

      // Correctly return the success message based on the updated status
      callback({
        code: 200,
        message: `${
          newMedicineStatus === 1
            ? "Medicine Added Successfully"
            : newMedicineStatus === 2
            ? "Add Medicine Request Rejected"
            : ""
        }`,
        result: updateStatus,
      });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  acceptRejectEditMedicineReq: async (req, res, reqObj, callback) => {
    try {
      const { product_id, supplier_id, action, admin_id } = reqObj;

      const medicine = await EditMedicine.findOne({ product_id, supplier_id });
      const supplier = await Supplier.findOne({ supplier_id: supplier_id });

      if (!medicine) {
        return callback({
          code: 400,
          message: "Medicine edit request not found",
        });
      }

      const editMedicineStatus =
        action === "accept" ? 1 : action === "reject" ? 2 : "";

      if (editMedicineStatus === 1) {
        let updateObj = {
          product_id: medicine.product_id,
          supplier_id: medicine.supplier_id,
          medicine_name: medicine.medicine_name,
          composition: medicine.composition,
          strength: medicine.strength,
          type_of_form: medicine.type_of_form,
          shelf_life: medicine.shelf_life,
          dossier_type: medicine.dossier_type,
          dossier_status: medicine.dossier_status,
          medicine_category: medicine.medicine_category,
          total_quantity: medicine.total_quantity,
          gmp_approvals: medicine.gmp_approvals,
          shipping_time: medicine.shipping_time,
          tags: medicine.tags,
          unit_tax: medicine.unit_tax,
          country_of_origin: medicine.country_of_origin,
          registered_in: medicine.registered_in,
          stocked_in: medicine.stocked_in,
          available_for: medicine.available_for,
          description: medicine.description,
          manufacturer_name: medicine.manufacturer_name,
          manufacturer_country_of_origin:
            medicine.manufacturer_country_of_origin,
          manufacturer_description: medicine.manufacturer_description,
          stockedIn_details: medicine.stockedIn_details,
          inventory_info: medicine.inventory_info,
          edit_status: editMedicineStatus, // Ensure edit_status is updated
        };

        if (medicine.medicine_image && medicine.medicine_image.length > 0) {
          updateObj.medicine_image = medicine.medicine_image;
        }

        if (medicine.medicine_type === "new_medicine") {
          updateObj.medicine_type = "new";
          // updateObj.inventory_info = medicine.inventory_info;
        } else if (medicine.medicine_type === "secondary_medicine") {
          updateObj.medicine_type = "secondary market";
          updateObj.purchased_on = medicine.purchased_on;
          updateObj.country_available_in = medicine.country_available_in;
          updateObj.min_purchase_unit = medicine.min_purchase_unit;
          updateObj.unit_price = medicine.unit_price;
          updateObj.invoice_image = medicine.invoice_image;
        }

        if (medicine.invoice_image && medicine.invoice_image.length > 0) {
          updateObj.invoice_image = medicine.invoice_image;
        }

        try {
          // Update the edit status in the EditMedicine collection
          await EditMedicine.findOneAndUpdate(
            { supplier_id, product_id },
            { $set: { edit_status: editMedicineStatus } }
          );

          let updatedMedicine;
          let event;

          if (medicine.medicine_type === "new_medicine") {
            event = "editnewmedicine";
            updatedMedicine = await NewMedicine.findOneAndUpdate(
              { supplier_id, product_id },
              { $set: updateObj },
              { new: true }
            );
          } else if (medicine.medicine_type === "secondary_medicine") {
            event = "editsecondarymedicine";
            updatedMedicine = await SecondaryMarketMedicine.findOneAndUpdate(
              { supplier_id, product_id },
              { $set: updateObj },
              { new: true }
            );
          }

          if (!updatedMedicine) {
            return callback({
              code: 400,
              message: "Medicine not found for update",
            });
          }

          // Delete the edit request from the EditMedicine collection after successful update
          await EditMedicine.deleteOne({ product_id, supplier_id });

          const notificationId =
            "NOT-" + Math.random().toString(16).slice(2, 10);
          const newNotification = new Notification({
            notification_id: notificationId,
            event_type: "Medicine Edit Request Accepted",
            event,
            from: "admin",
            to: "supplier",
            from_id: admin_id,
            to_id: supplier_id,
            event_id: product_id,
            message: ` ${product_id}: Your listing has been approved and is now live!`,
            status: 0,
          });
          await newNotification.save();

          const subject = "Medicine Edit Request Accepted Successfully";
          const body = `Hello ${medicine.supplier_name}, <br />
                          Your medicine edit request has been approved and changes are live now. <br />
                          Medicine ID: ${updatedMedicine.product_id} <br />
                          Supplier ID: ${updatedMedicine.supplier_id} <br />
                          <br /><br />
                          <p>If you need further assistance, feel free to reach out to us at <a href="mailto:connect@medhub.global">connect@medhub.global</a>.</p>
                          Thanks & Regards, <br />
                          Medhub Global Team`;

          // Send the email to the supplier
          await sendMailFunc(supplier.supplier_email, subject, body);

          return callback({
            code: 200,
            message: `${
              medicine.medicine_type === "new_medicine" ? "New" : "Secondary"
            } Medicine Details Updated Successfully`,
            result: updatedMedicine,
          });
        } catch (error) {
          handleCatchBlockError(req, res, error);
        }
      } else if (editMedicineStatus === 2) {
        try {
          // Update the edit status to rejected in the EditMedicine collection
          const result = await EditMedicine.findOneAndUpdate(
            { supplier_id, product_id },
            { $set: { edit_status: editMedicineStatus } }
          );

          let event;
          // Update the edit status in the respective medicine collection
          if (medicine.medicine_type === "new_medicine") {
            event = "editnewmedicinerequest";
            await Medicine.findOneAndUpdate(
              { supplier_id, product_id },
              { $set: { edit_status: editMedicineStatus } }
            );
          } else if (medicine.medicine_type === "secondary_medicine") {
            event = "editnewmedicinerequest";
            await Medicine.findOneAndUpdate(
              { supplier_id, product_id },
              { $set: { edit_status: editMedicineStatus } }
            );
          }

          const notificationId =
            "NOT-" + Math.random().toString(16).slice(2, 10);
          const newNotification = new Notification({
            notification_id: notificationId,
            event_type: "Medicine Edit Request rejected",
            event,
            from: "admin",
            to: "supplier",
            from_id: admin_id,
            to_id: supplier_id,
            event_id: product_id,
            message: ` ${product_id}: Your listing has been disapproved!`,
            status: 0,
          });
          await newNotification.save();

          return callback({
            code: 200,
            message: "Edit medicine request rejected",
            result,
          });
        } catch (error) {
          handleCatchBlockError(req, res, error);
          y;
        }
      }
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  medicineEditList: async (req, res, reqObj, callback) => {
    try {
      const { searchKey, pageNo, pageSize, medicineType, status } = reqObj;

      const page_no = pageNo || 1;
      const page_size = pageSize || 10;
      const offset = (page_no - 1) * page_size;

      EditMedicine.aggregate([
        {
          $match: {
            medicine_type: medicineType,
            // status : 1,
            edit_status: status,
          },
        },
        {
          $lookup: {
            from: "medicineinventories",
            localField: "product_id",
            foreignField: "product_id",
            as: "inventory",
          },
        },
        {
          $sort: { created_at: -1 },
        },
        {
          $project: {
            product_id: 1,
            supplier_id: 1,
            medicine_name: 1,
            medicine_image: 1,
            drugs_name: 1,
            country_of_origin: 1,
            dossier_type: 1,
            dossier_status: 1,
            gmp_approvals: 1,
            registered_in: 1,
            comments: 1,
            dosage_form: 1,
            category_name: 1,
            strength: 1,
            quantity: 1,
            medicine_type: 1,
            status: 1,
            edit_status: 1,
            inventory: {
              $arrayElemAt: ["$inventory", 0],
            },
          },
        },

        {
          $project: {
            product_id: 1,
            supplier_id: 1,
            medicine_name: 1,
            medicine_image: 1,
            drugs_name: 1,
            country_of_origin: 1,
            dossier_type: 1,
            dossier_status: 1,
            gmp_approvals: 1,
            registered_in: 1,
            comments: 1,
            dosage_form: 1,
            category_name: 1,
            strength: 1,
            quantity: 1,
            medicine_type: 1,
            status: 1,
            edit_status: 1,
            "inventory.delivery_info": 1,
            "inventory.price": 1,
          },
        },

        { $skip: offset },
        { $limit: page_size },
      ])
        .then((data) => {
          EditMedicine.countDocuments({
            medicine_type: medicineType,
            edit_status: status,
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
                message: "Medicine list fetched successfully",
                result: returnObj,
              });
            })
            .catch((err) => {
              callback({
                code: 400,
                message: "Error while fetching medicine count",
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

  editMedicineDetails: async (req, res, reqObj, callback) => {
    try {
      EditMedicine.aggregate([
        {
          $match: { product_id: reqObj.product_id },
        },
        {
          $lookup: {
            from: "medicineinventories",
            localField: "product_id",
            foreignField: "product_id",
            as: "inventory",
          },
        },
        {
          $project: {
            product_id: 1,
            supplier_id: 1,
            medicine_name: 1,
            medicine_type: 1,
            composition: 1,
            dossier_type: 1,
            dossier_status: 1,
            gmp_approvals: 1,
            shipping_time: 1,
            tags: 1,
            available_for: 1,
            description: 1,
            registered_in: 1,
            inventory_info: 1,
            medicine_image: 1,
            invoice_image: 1,
            strength: 1,
            medicine_category: 1,
            total_quantity: 1,
            stocked_in: 1,
            shelf_life: 1,
            type_of_form: 1,
            country_of_origin: 1,
            purchased_on: 1,
            unit_price: 1,
            country_available_in: 1,
            min_purchase_unit: 1,
            condition: 1,
            unit_tax: 1,
            manufacturer_country_of_origin: 1,
            manufacturer_description: 1,
            manufacturer_name: 1,
            stockedIn_details: 1,
            edit_status: 1,
            inventory: {
              $arrayElemAt: ["$inventory", 0],
            },
          },
        },
        {
          $project: {
            product_id: 1,
            supplier_id: 1,
            medicine_name: 1,
            medicine_type: 1,
            composition: 1,
            dossier_type: 1,
            dossier_status: 1,
            gmp_approvals: 1,
            shipping_time: 1,
            tags: 1,
            available_for: 1,
            description: 1,
            registered_in: 1,
            inventory_info: 1,
            medicine_image: 1,
            invoice_image: 1,
            strength: 1,
            medicine_category: 1,
            total_quantity: 1,
            stocked_in: 1,
            shelf_life: 1,
            type_of_form: 1,
            country_of_origin: 1,
            purchased_on: 1,
            unit_price: 1,
            country_available_in: 1,
            min_purchase_unit: 1,
            condition: 1,
            unit_tax: 1,
            manufacturer_country_of_origin: 1,
            manufacturer_description: 1,
            manufacturer_name: 1,
            stockedIn_details: 1,
            edit_status: 1,
            "inventory.inventory_info": 1,
            "inventory.strength": 1,
          },
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
          $project: {
            product_id: 1,
            supplier_id: 1,
            medicine_name: 1,
            medicine_type: 1,
            composition: 1,
            dossier_type: 1,
            dossier_status: 1,
            gmp_approvals: 1,
            shipping_time: 1,
            tags: 1,
            available_for: 1,
            description: 1,
            registered_in: 1,
            inventory_info: 1,
            medicine_image: 1,
            invoice_image: 1,
            strength: 1,
            medicine_category: 1,
            total_quantity: 1,
            stocked_in: 1,
            shelf_life: 1,
            type_of_form: 1,
            country_of_origin: 1,
            purchased_on: 1,
            unit_price: 1,
            country_available_in: 1,
            min_purchase_unit: 1,
            condition: 1,
            unit_tax: 1,
            manufacturer_country_of_origin: 1,
            manufacturer_description: 1,
            manufacturer_name: 1,
            stockedIn_details: 1,
            edit_status: 1,
            "inventory.inventory_info": 1,
            "inventory.strength": 1,
            supplier: {
              $arrayElemAt: ["$supplier", 0],
            },
          },
        },
        {
          $project: {
            product_id: 1,
            supplier_id: 1,
            medicine_name: 1,
            medicine_type: 1,
            composition: 1,
            dossier_type: 1,
            dossier_status: 1,
            gmp_approvals: 1,
            shipping_time: 1,
            tags: 1,
            available_for: 1,
            description: 1,
            registered_in: 1,
            inventory_info: 1,
            medicine_image: 1,
            invoice_image: 1,
            strength: 1,
            medicine_category: 1,
            total_quantity: 1,
            stocked_in: 1,
            shelf_life: 1,
            type_of_form: 1,
            country_of_origin: 1,
            purchased_on: 1,
            unit_price: 1,
            country_available_in: 1,
            min_purchase_unit: 1,
            condition: 1,
            unit_tax: 1,
            manufacturer_country_of_origin: 1,
            manufacturer_description: 1,
            manufacturer_name: 1,
            stockedIn_details: 1,
            edit_status: 1,
            "inventory.inventory_info": 1,
            "inventory.strength": 1,
            "supplier.supplier_id": 1,
            "supplier.supplier_name": 1,
            "supplier.supplier_email": 1,
            "supplier.description": 1,
            "supplier.estimated_delivery_time": 1,
            "supplier.tags": 1,
            "supplier.license_no": 1,
            "supplier.supplier_address": 1,
            "supplier.payment_terms": 1,
            "supplier.country_of_origin": 1,
            "supplier.supplier_type": 1,
            "supplier.contact_person_name": 1,
            "supplier.supplier_country_code": 1,
            "supplier.supplier_mobile": 1,
            "supplier.contact_person_email": 1,
            "supplier.contact_person_mobile_no": 1,
            "supplier.contact_person_country_code": 1,
            "supplier.tax_no": 1,
            "supplier.supplier_type": 1,
            "supplier.country_of_operation": 1,
          },
        },
      ])
        .then((data) => {
          if (data.length) {
            callback({
              code: 200,
              message: "Medicine details fetched successfully",
              result: data[0],
            });
          } else {
            callback({
              code: 400,
              message: "Medicine with requested id not found",
              result: data[0],
            });
          }
        })
        .catch((err) => {
          callback({
            code: 400,
            message: "Error fetching medicine details",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  deleteMedicine: async (req, res, reqObj, callback) => {
    try {
      const { product_id, supplier_id } = reqObj;

      Medicine.findOneAndUpdate(
        { product_id: product_id, supplier_id: supplier_id },
        { $set: { status: 3 } },
        { new: true }
      )
        .then((result) => {
          callback({
            code: 200,
            message: "Updated successfully",
            result: result,
          });
        })
        .catch((err) => {
          callback({ code: 400, message: "Error while updating", result: err });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  supportList: async (req, res, reqObj, callback) => {
    try {
      const { pageNo, pageSize, filterKey, supportType } = reqObj;

      const page_no = pageNo || 1;
      const page_size = pageSize || 2;
      const offSet = (page_no - 1) * page_size;

      let filterCondition = {};

      if (filterKey === "buyer") {
        filterCondition = { user_type: "buyer" };
      } else if (filterKey === "supplier") {
        filterCondition = { user_type: "supplier" };
      }

      if (supportType) {
        filterCondition.support_type = supportType;
      }

      Support.aggregate([
        {
          $match: filterCondition,
        },
        {
          $lookup: {
            from: "buyers",
            localField: "user_id",
            foreignField: "buyer_id",
            as: "buyer_details",
          },
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "user_id",
            foreignField: "supplier_id",
            as: "supplier_details",
          },
        },
        {
          $lookup: {
            from: "orders",
            localField: "order_id",
            foreignField: "order_id",
            as: "order_details",
          },
        },
        {
          $project: {
            support_id: 1,
            support_type: 1,
            user_id: 1,
            usertype: 1,
            order_id: 1,
            reason: 1,
            subject: 1,
            message: 1,
            support_image: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,

            buyer: {
              $arrayElemAt: ["$buyer_details", 0],
            },
            supplier: {
              $arrayElemAt: ["$supplier_details", 0],
            },
            order: {
              $arrayElemAt: ["$order_details", 0],
            },
          },
        },
        {
          $project: {
            support_id: 1,
            support_typ: 1,
            user_id: 1,
            usertype: 1,
            order_id: 1,
            reason: 1,
            subject: 1,
            message: 1,
            support_image: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
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
            "order.order_id": 1,
            "order.enquiry_id": 1,
            "order._purchaseOrder_id": 1,
            "order._buyer_id": 1,
            "order._supplier_id": 1,
            "order._payment_terms": 1,
            "order._buyer_name": 1,
            "order._buyer_email": 1,
            "order._buyer_mobile": 1,
            "order._buyer_address": 1,
            "order._supplier_name": 1,
            "order._supplier_email": 1,
            "order._supplier_mobile": 1,
            "order._supplier_address": 1,
            "order._items": 1,
            "order._order_status": 1,
            "order._status": 1,
            "order._invoice_status": 1,
            "order._logistics_details": 1,
            "order._shipment_details": 1,
            "order._created_at": 1,
            "order._updated_at": 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: offSet,
        },
        {
          $limit: page_size,
        },
      ])
        .then(async (data) => {
          const totalItems = await Support.countDocuments(filterCondition);
          const totalPages = Math.ceil(totalItems / page_size);

          const returnObj = {
            data,
            totalPages,
            totalItems,
          };
          callback({ code: 200, message: "Support list", result: returnObj });
        })
        .catch((err) => {
          callback({
            code: 400,
            message: "Error while fetching supoort list",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  supportDetails: async (req, res, reqObj, callback) => {
    try {
      const { supplier_id, support_id } = reqObj;

      Support.aggregate([
        {
          $match: {
            support_id: support_id,
          },
        },
        {
          $lookup: {
            from: "buyers",
            localField: "user_id",
            foreignField: "buyer_id",
            as: "buyer_details",
          },
        },
        {
          $lookup: {
            from: "suppliers",
            localField: "user_id",
            foreignField: "supplier_id",
            as: "supplier_details",
          },
        },
        {
          $lookup: {
            from: "orders",
            localField: "order_id",
            foreignField: "order_id",
            as: "order_details",
          },
        },
        {
          $project: {
            support_id: 1,
            support_type: 1,
            user_id: 1,
            usertype: 1,
            order_id: 1,
            reason: 1,
            subject: 1,
            message: 1,
            support_image: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            buyer: {
              $arrayElemAt: ["$buyer_details", 0],
            },
            supplier: {
              $arrayElemAt: ["$supplier_details", 0],
            },
            order: {
              $arrayElemAt: ["$order_details", 0],
            },
          },
        },
        {
          $project: {
            support_id: 1,
            support_type: 1,
            user_id: 1,
            usertype: 1,
            order_id: 1,
            reason: 1,
            subject: 1,
            message: 1,
            support_image: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
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
            "order.order_id": 1,
            "order.enquiry_id": 1,
            "order._purchaseOrder_id": 1,
            "order._buyer_id": 1,
            "order._supplier_id": 1,
            "order._payment_terms": 1,
            "order._buyer_name": 1,
            "order._buyer_email": 1,
            "order._buyer_mobile": 1,
            "order._buyer_address": 1,
            "order._supplier_name": 1,
            "order._supplier_email": 1,
            "order._supplier_mobile": 1,
            "order._supplier_address": 1,
            "order._items": 1,
            "order._order_status": 1,
            "order._status": 1,
            "order._invoice_status": 1,
            "order._logistics_details": 1,
            "order._shipment_details": 1,
            "order._created_at": 1,
            "order._updated_at": 1,
          },
        },
      ])
        .then(async (data) => {
          callback({ code: 200, message: "Support Details", result: data[0] });
        })
        .catch((err) => {
          logErrorToFile(err, req);
          callback({
            code: 400,
            message: "Error while fetching support details",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  //----------------------------- support -------------------------------------//

  //----------------------------- dashboard details -------------------------------------//
  adminDashboardDataList: async (req, res, reqObj, callback) => {
    try {
      const { filterValue } = reqObj;

      let startDate = null;
      let endDate = moment().endOf("day");

      if (filterValue === "today") {
        startDate = moment().startOf("day");
        endDate = moment().endOf("day");
      } else if (filterValue === "week") {
        startDate = moment().subtract(7, "days").startOf("day");
      } else if (filterValue === "month") {
        startDate = moment().subtract(30, "days").startOf("day");
      } else if (filterValue === "year") {
        startDate = moment().subtract(365, "days").startOf("day");
      } else if (filterValue === "all" || !filterValue) {
        startDate = null;
        endDate = null;
      }

      const orderDataList = Order.aggregate([
        {
          $addFields: {
            numeric_total_price: {
              $toDouble: {
                $arrayElemAt: [{ $split: ["$total_price", " "] }, 0],
              },
            },
          },
        },

        {
          $match: {
            // createdAt: { $gte: startDate.toDate(), $lt: endDate.toDate() }
            ...(startDate && endDate
              ? {
                  createdAt: {
                    $gte: startDate.toDate(),
                    $lt: endDate.toDate(),
                  },
                }
              : {}),
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
      ]);

      const buyerRegReqList = Buyer.aggregate([
        {
          $match: {
            // createdAt: { $gte: startDate.toDate(), $lt: endDate.toDate() }
            ...(startDate && endDate
              ? {
                  createdAt: {
                    $gte: startDate.toDate(),
                    $lt: endDate.toDate(),
                  },
                }
              : {}),
          },
        },
        {
          $facet: {
            regReqCount: [
              { $match: { account_status: 0 } },
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
            acceptedReqCount: [
              { $match: { account_status: 1 } },
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
            rejectedReqCount: [
              { $match: { account_status: 2 } },
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
      ]);

      const supplierrRegReqList = Supplier.aggregate([
        {
          $match: {
            ...(startDate && endDate
              ? {
                  createdAt: {
                    $gte: startDate.toDate(),
                    $lt: endDate.toDate(),
                  },
                }
              : {}),
          },
        },
        {
          $facet: {
            regReqCount: [
              { $match: { account_status: 0 } },
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
            acceptedReqCount: [
              { $match: { account_status: 1 } },
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
            rejectedReqCount: [
              { $match: { account_status: 2 } },
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
      ]);

      const supplierCountry = Supplier.aggregate([
        {
          $group: {
            _id: "$country_of_origin",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 3,
        },
        {
          $project: {
            _id: 0,
            country: "$_id",
            count: 1,
          },
        },
      ]);

      const buyerCountry = Buyer.aggregate([
        {
          $group: {
            _id: "$country_of_origin",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 3,
        },
        {
          $project: {
            _id: 0,
            country: "$_id",
            count: 1,
          },
        },
      ]);

      const inquiryCount = Enquiry.aggregate([
        {
          $match: {
            ...(startDate && endDate
              ? {
                  created_at: {
                    $gte: startDate.toDate(),
                    $lt: endDate.toDate(),
                  },
                }
              : {}),
          },
        },
        {
          $match: {
            enquiry_status: { $ne: "order created" },
          },
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
      ]);

      const poCount = PurchaseOrder.aggregate([
        {
          $match: {
            ...(startDate && endDate
              ? {
                  created_at: {
                    $gte: startDate.toDate(),
                    $lt: endDate.toDate(),
                  },
                }
              : {}),
          },
        },
        {
          $match: {
            po_status: "active",
          },
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
      ]);

      const orderCount = Order.aggregate([
        {
          $match: {
            ...(startDate && endDate
              ? {
                  createdAt: {
                    $gte: startDate.toDate(),
                    $lt: endDate.toDate(),
                  },
                }
              : {}),
          },
        },
        {
          $match: {
            order_status: "active",
          },
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
      ]);

      const totalOrderCount = Order.aggregate([
        {
          $match: {
            ...(startDate && endDate
              ? {
                  createdAt: {
                    $gte: startDate.toDate(),
                    $lt: endDate.toDate(),
                  },
                }
              : {}),
          },
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
      ]);

      const completedOrderCount = Order.aggregate([
        {
          $match: {
            ...(startDate && endDate
              ? {
                  createdAt: {
                    $gte: startDate.toDate(),
                    $lt: endDate.toDate(),
                  },
                }
              : {}),
          },
        },
        {
          $match: {
            order_status: "completed",
          },
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
      ]);

      const invoiceCount = Invoices.aggregate([
        {
          $match: {
            ...(startDate && endDate
              ? {
                  createdAt: {
                    $gte: startDate.toDate(),
                    $lt: endDate.toDate(),
                  },
                }
              : {}),
          },
        },
        {
          $match: {
            invoice_status: "pending",
          },
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
      ]);

      const [
        orderData,
        buyerData,
        supplierData,
        supplierCountryData,
        buyerCountryData,
        inquiryData,
        poData,
        orderCountData,
        totalOrders,
        completedOrders,
        invoiceData,
      ] = await Promise.all([
        orderDataList,
        buyerRegReqList,
        supplierrRegReqList,
        supplierCountry,
        buyerCountry,
        inquiryCount,
        poCount,
        orderCount,
        totalOrderCount,
        completedOrderCount,
        invoiceCount,
      ]);

      const totalOrderNumber =
        totalOrders.length > 0 ? totalOrders[0].count : 0;
      const completedOrderNumber =
        completedOrders.length > 0 ? completedOrders[0].count : 0;

      const completedOrderPercentage =
        totalOrderNumber > 0
          ? (completedOrderNumber / totalOrderNumber) * 100
          : 0;

      const result = {
        ...orderData[0],
        supplierCountryData,
        buyerCountryData,
        buyerRegisReqCount:
          buyerData[0].regReqCount && buyerData[0].regReqCount[0]
            ? buyerData[0].regReqCount[0]
            : { count: 0 },
        buyerAcceptedReqCount:
          buyerData[0].acceptedReqCount && buyerData[0].acceptedReqCount[0]
            ? buyerData[0].acceptedReqCount[0]
            : { count: 0 },
        buyerRejectedReqCount:
          buyerData[0].rejectedReqCount && buyerData[0].rejectedReqCount[0]
            ? buyerData[0].rejectedReqCount[0]
            : { count: 0 },
        supplierRegisReqCount:
          supplierData[0].regReqCount && supplierData[0].regReqCount[0]
            ? supplierData[0].regReqCount[0]
            : { count: 0 },
        supplierAcceptedReqCount:
          supplierData[0].acceptedReqCount &&
          supplierData[0].acceptedReqCount[0]
            ? supplierData[0].acceptedReqCount[0]
            : { count: 0 },
        supplierRejectedReqCount:
          supplierData[0].rejectedReqCount &&
          supplierData[0].rejectedReqCount[0]
            ? supplierData[0].rejectedReqCount[0]
            : { count: 0 },
        inquiryCount: inquiryData.length > 0 ? inquiryData[0].count : 0,
        poCount: poData.length > 0 ? poData[0].count : 0,
        orderCount: orderCountData.length > 0 ? orderCountData[0].count : 0,
        // completedOrderPercentage : completedOrderPercentage.toFixed(3),
        completedOrderPercentage: completedOrderNumber,
        invoiceCount: invoiceData.length > 0 ? invoiceData[0].count : 0,
      };

      callback({
        code: 200,
        message: "Dashboard data list fetched successfully",
        result,
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
            // to_id: buyer_id,
            to: "admin",
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
            fromDetails: {
              $cond: {
                if: { $gt: [{ $size: "$supplier" }, 0] },
                then: { $arrayElemAt: ["$supplier", 0] },
                else: { $arrayElemAt: ["$buyer", 0] },
              },
            },
          },
        },
        { $sort: { createdAt: -1 } },
        // { $skip  : offset },
        // { $limit : page_size },
      ])
        .then(async (data) => {
          const totalItems = await Notification.countDocuments({
            to: "admin",
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
            message: "Error while fetching buyer list",
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
            to: "admin",
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
            fromDetails: {
              $cond: {
                if: { $gt: [{ $size: "$supplier" }, 0] },
                then: { $arrayElemAt: ["$supplier", 0] },
                else: { $arrayElemAt: ["$buyer", 0] },
              },
            },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: offset },
        { $limit: page_size },
      ])
        .then(async (data) => {
          const totalItems = await Notification.countDocuments({ to: "admin" });
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
      const { notification_id, status = 1, usertype } = reqObj;

      const updateNotifications = await Notification.updateMany(
        { to: usertype },
        {
          $set: {
            status: status,
          },
        }
        // { multi: true }
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

  inquiryDetails: async (req, res, reqObj, callback) => {
    try {
      const { enquiry_id } = reqObj;

      Enquiry.aggregate([
        {
          $match: {
            enquiry_id: enquiry_id,
          },
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
            "buyer.buyer_email": "$buyer_details.buyer_email",
            "buyer.contact_person_email": "$buyer_details.contact_person_email",
            "buyer.contact_person_mobile":
              "$buyer_details.contact_person_mobile",
            "buyer.contact_person_country_code":
              "$buyer_details.contact_person_country_code",
            "buyer.buyer_type": "$buyer_details.buyer_type",
            "buyer.buyer_mobile": "$buyer_details.buyer_mobile",
            "buyer.buyer_country_code": "$buyer_details.buyer_country_code",
            "buyer.country_of_origin": "$buyer_details.country_of_origin",
            "buyer.buyer_image": "$buyer_details.buyer_image",
            "buyer.registration_no": "$buyer_details.registration_no",
            "supplier.supplier_id": "$supplier_details.supplier_id",
            "supplier.supplier_name": "$supplier_details.supplier_name",
            "supplier.supplier_type": "$supplier_details.supplier_type",
            "supplier.supplier_mobile": "$supplier_details.supplier_mobile",
            "supplier.supplier_country_code":
              "$supplier_details.supplier_country_code",
            "supplier.supplier_email": "$supplier_details.supplier_email",
            "supplier.contact_person_email":
              "$supplier_details.contact_person_email",
            "supplier.country_of_origin": "$supplier_details.country_of_origin",
            "supplier.estimated_delivery_time":
              "$supplier_details.estimated_delivery_time",
            "supplier.supplier_address": "$supplier_details.supplier_address",
            "supplier.supplier_image": "$supplier_details.supplier_image",
            "supplier.registration_no": "$supplier_details.registration_no",
            "supplier.contact_person_mobile_no":
              "$supplier_details.contact_person_mobile_no",
            "supplier.contact_person_country_code":
              "$supplier_details.contact_person_country_code",
          },
        },
      ])
        .then(async (data) => {
          callback({ code: 200, message: "Inquiry details", result: data[0] });
        })
        .catch((err) => {
          callback({
            code: 400,
            message: "Error while fetching inquiry detils",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getPOList: async (req, res, reqObj, callback) => {
    try {
      const { supplier_id, buyer_id, status, pageNo, pageSize, filterValue } =
        reqObj;
      const page_no = pageNo || 1;
      const page_size = pageSize || 10;
      const offset = (page_no - 1) * page_size;
      const query = {};

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

      PurchaseOrder.aggregate([
        {
          $match: {
            po_status: status,
            ...dateFilter,
          },
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
          $project: {
            purchaseOrder_id: 1,
            po_number: 1,
            po_date: 1,
            buyer_name: 1,
            buyer_address: 1,
            buyer_mobile: 1,
            buyer_email: 1,
            buyer_regNo: 1,
            supplier_name: 1,
            supplier_address: 1,
            supplier_mobile: 1,
            supplier_email: 1,
            supplier_regNo: 1,
            additional_instructions: 1,
            po_status: 1,
            order_items: 1,
            total_amount: 1,
            enquiry_id: 1,
            created_at: 1,
            updated_at: 1,

            buyer: {
              $arrayElemAt: ["$buyer_details", 0],
            },
            supplier: {
              $arrayElemAt: ["$supplier_details", 0],
            },
          },
        },
        {
          $project: {
            purchaseOrder_id: 1,
            po_number: 1,
            po_date: 1,
            buyer_name: 1,
            buyer_address: 1,
            buyer_mobile: 1,
            buyer_email: 1,
            buyer_regNo: 1,
            supplier_name: 1,
            supplier_address: 1,
            supplier_mobile: 1,
            supplier_email: 1,
            supplier_regNo: 1,
            additional_instructions: 1,
            po_status: 1,
            order_items: 1,
            total_amount: 1,
            enquiry_id: 1,
            created_at: 1,
            updated_at: 1,
            "buyer.buyer_id": 1,
            "buyer.buyer_name": 1,
            "buyer.buyer_type": 1,
            "buyer.buyer_mobile": 1,
            "buyer.buyer_image": 1,
            "buyer.country_of_origin": 1,
            "supplier.supplier_id": 1,
            "supplier.supplier_name": 1,
            "supplier.supplier_type": 1,
            "supplier.supplier_mobile": 1,
            "supplier.supplier_image": 1,
            "supplier.country_of_origin": 1,
          },
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
      ])
        .then(async (data) => {
          const totalItems = await PurchaseOrder.countDocuments({
            po_status: status,
            ...dateFilter,
          });
          const totalPages = Math.ceil(totalItems / page_size);

          const returnObj = {
            data,
            totalPages,
            totalItems,
          };
          callback({ code: 200, message: "PO list", result: returnObj });
        })
        .catch((err) => {
          callback({
            code: 400,
            message: "Error while fetching PO list",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getPODetails: async (req, res, reqObj, callback) => {
    try {
      const { purchaseOrder_id, buyer_id, supplier_id, enquiry_id } = reqObj;
      PurchaseOrder.aggregate([
        {
          $match: {
            purchaseOrder_id: purchaseOrder_id,
          },
        },
        {
          $lookup: {
            from: "enquiries",
            localField: "enquiry_id",
            foreignField: "enquiry_id",
            as: "enquiry_details",
          },
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
          $unwind: "$order_items",
        },
        {
          $lookup: {
            from: "products",
            localField: "order_items.product_id",
            foreignField: "product_id",
            as: "medicine_details",
          },
        },
        {
          $unwind: "$medicine_details",
        },
        {
          $addFields: {
            "order_items.medicine_details": "$medicine_details",
            // Add extracted buyer registered address fields
            buyer_registered_address: {
              company_reg_address: {
                $arrayElemAt: [
                  "$buyer_details.registeredAddress.company_reg_address",
                  0,
                ],
              },
              locality: {
                $arrayElemAt: ["$buyer_details.registeredAddress.locality", 0],
              },
              land_mark: {
                $arrayElemAt: ["$buyer_details.registeredAddress.land_mark", 0],
              },
              city: {
                $arrayElemAt: ["$buyer_details.registeredAddress.city", 0],
              },
              state: {
                $arrayElemAt: ["$buyer_details.registeredAddress.state", 0],
              },
              country: {
                $arrayElemAt: ["$buyer_details.registeredAddress.country", 0],
              },
              pincode: {
                $arrayElemAt: ["$buyer_details.registeredAddress.pincode", 0],
              },
            },
            // Add extracted supplier registered address fields
            supplier_registered_address: {
              company_reg_address: {
                $arrayElemAt: [
                  "$supplier_details.registeredAddress.company_reg_address",
                  0,
                ],
              },
              locality: {
                $arrayElemAt: [
                  "$supplier_details.registeredAddress.locality",
                  0,
                ],
              },
              land_mark: {
                $arrayElemAt: [
                  "$supplier_details.registeredAddress.land_mark",
                  0,
                ],
              },
              city: {
                $arrayElemAt: ["$supplier_details.registeredAddress.city", 0],
              },
              state: {
                $arrayElemAt: ["$supplier_details.registeredAddress.state", 0],
              },
              country: {
                $arrayElemAt: [
                  "$supplier_details.registeredAddress.country",
                  0,
                ],
              },
              pincode: {
                $arrayElemAt: [
                  "$supplier_details.registeredAddress.pincode",
                  0,
                ],
              },
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            enquiry_id: { $first: "$enquiry_id" },
            purchaseOrder_id: { $first: "$purchaseOrder_id" },
            po_date: { $first: "$po_date" },
            po_number: { $first: "$po_number" },
            additional_instructions: { $first: "$additional_instructions" },
            po_status: { $first: "$po_status" },
            total_amount: { $first: "$total_amount" },
            buyer_name: { $first: "$buyer_name" },
            buyer_address: { $first: "$buyer_address" },
            buyer_mobile: { $first: "$buyer_mobile" },
            buyer_country_code: { $first: "$buyer_country_code" },
            buyer_registered_address: { $first: "$buyer_registered_address" }, // Already added
            buyer_email: { $first: "$buyer_email" },
            buyer_regNo: { $first: "$buyer_regNo" },
            supplier_name: { $first: "$supplier_name" },
            supplier_address: { $first: "$supplier_address" },
            supplier_mobile: { $first: "$supplier_mobile" },
            supplier_country_code: { $first: "$supplier_country_code" },
            supplier_registered_address: {
              $first: "$supplier_registered_address",
            }, // Already added
            supplier_email: { $first: "$supplier_email" },
            supplier_regNo: { $first: "$supplier_regNo" },
            supplier_name: { $first: "$supplier_name" },
            buyer_id: { $first: "$buyer_id" },
            supplier_id: { $first: "$supplier_id" },
            order_items: { $push: "$order_items" },
            buyer_details: { $first: "$buyer_details" },
            supplier_details: { $first: "$supplier_details" },
            enquiry_details: { $first: "$enquiry_details" },
          },
        },
      ])
        .then((data) => {
          callback({
            code: 200,
            message: "Purchase Order details",
            result: data[0],
          });
        })
        .catch((err) => {
          callback({
            code: 400,
            message: "Error while fetching purchase order details",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  transactionList: async (req, res, reqObj, callback) => {
    try {
      const { pageNo, pageSize, filterKey, buyer_id } = reqObj;
      const page_no = pageNo || 2;
      const page_size = pageSize || 2;
      const offset = (page_no - 1) * page_size;

      Invoices.aggregate([
        {
          $match: {
            status: filterKey,
          },
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
          $lookup: {
            from: "suppliers",
            localField: "supplier_id",
            foreignField: "supplier_id",
            as: "supplier",
          },
        },
        {
          $project: {
            invoice_id: 1,
            order_id: 1,
            enquiry_id: 1,
            purchaseOrder_id: 1,
            buyer_id: 1,
            supplier_id: 1,
            invoice_no: 1,
            invoice_date: 1,
            buyer_name: 1,
            buyer_address: 1,
            buyer_country: 1,
            buyer_vat_reg_no: 1,
            supplier_name: 1,
            supplier_address: 1,
            supplier_country: 1,
            supplier_vat_reg_no: 1,
            items: 1,
            payment_terms: 1,
            total_payable_amount: 1,
            total_amount_paid: 1,
            pending_amount: 1,
            account_number: 1,
            sort_code: 1,
            transaction_image: 1,
            transaction_id: 1,
            mode_of_payment: 1,
            invoice_status: 1,
            status: 1,
            payment_status: 1,
            created_at: 1,
            buyer: { $arrayElemAt: ["$buyer", 0] },
            supplier: { $arrayElemAt: ["$supplier", 0] },
          },
        },
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: "$_id",
            invoice_id: { $first: "$invoice_id" },
            order_id: { $first: "$order_id" },
            enquiry_id: { $first: "$enquiry_id" },
            purchaseOrder_id: { $first: "$purchaseOrder_id" },
            buyer_id: { $first: "$buyer_id" },
            supplier_id: { $first: "$supplier_id" },
            invoice_no: { $first: "$invoice_no" },
            invoice_date: { $first: "$invoice_date" },
            buyer_name: { $first: "$buyer_name" },
            buyer_address: { $first: "$buyer_address" },
            buyer_country: { $first: "$buyer_country" },
            buyer_vat_reg_no: { $first: "$buyer_vat_reg_no" },
            supplier_name: { $first: "$supplier_name" },
            supplier_address: { $first: "$supplier_address" },
            supplier_country: { $first: "$supplier_country" },
            supplier_vat_reg_no: { $first: "$supplier_vat_reg_no" },
            items: { $push: "$items" },
            payment_terms: { $first: "$payment_terms" },
            total_payable_amount: { $first: "$total_payable_amount" },
            total_amount_paid: { $first: "$total_amount_paid" },
            pending_amount: { $first: "$pending_amount" },
            account_number: { $first: "$account_number" },
            sort_code: { $first: "$sort_code" },
            transaction_image: { $first: "$transaction_image" },
            transaction_id: { $first: "$transaction_id" },
            mode_of_payment: { $first: "$mode_of_payment" },
            invoice_status: { $first: "$invoice_status" },
            status: { $first: "$status" },
            payment_status: { $first: "$payment_status" },
            created_at: { $first: "$created_at" },
            buyer: { $first: "$buyer" },
            supplier: { $first: "$supplier" },
            totalPrice: { $sum: "$items.item_price" },
          },
        },
        {
          $project: {
            invoice_id: 1,
            order_id: 1,
            enquiry_id: 1,
            purchaseOrder_id: 1,
            buyer_id: 1,
            supplier_id: 1,
            invoice_no: 1,
            invoice_date: 1,
            buyer_name: 1,
            buyer_address: 1,
            buyer_country: 1,
            buyer_vat_reg_no: 1,
            supplier_name: 1,
            supplier_address: 1,
            supplier_country: 1,
            supplier_vat_reg_no: 1,
            items: 1,
            payment_terms: 1,
            total_payable_amount: 1,
            total_amount_paid: 1,
            pending_amount: 1,
            account_number: 1,
            sort_code: 1,
            transaction_image: 1,
            transaction_id: 1,
            mode_of_payment: 1,
            invoice_status: 1,
            status: 1,
            payment_status: 1,
            created_at: 1,
            totalPrice: 1,
            "buyer.buyer_image": 1,
            "buyer.buyer_name": 1,
            "buyer.buyer_address": 1,
            "buyer.buyer_type": 1,
            "supplier.supplier_image": 1,
            "supplier.supplier_name": 1,
            "supplier.supplier_address": 1,
            "supplier.supplier_type": 1,
          },
        },
        { $sort: { created_at: -1 } },
        { $skip: offset },
        { $limit: page_size },
      ])
        .then((data) => {
          Invoices.countDocuments({ status: filterKey }).then((totalItems) => {
            const totalPages = Math.ceil(totalItems / page_size);

            const responseData = {
              data,
              totalPages,
              totalItems,
            };
            callback({
              code: 200,
              message: "List Fetched successfully",
              result: responseData,
            });
          });
        })
        .catch((err) => {
          logErrorToFile(err, req);
          callback({
            code: 400,
            message: "Error in fetching transaction list",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  transactionDetails: async (req, res, reqObj, callback) => {
    try {
      const { order_id, invoice_id, supplier_id, transaction_id } = reqObj;

      Invoices.aggregate([
        {
          $match: {
            // transaction_id : transaction_id
            invoice_id: invoice_id,
          },
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
          $lookup: {
            from: "buyers",
            localField: "buyer_id",
            foreignField: "buyer_id",
            as: "buyer",
          },
        },
        {
          $lookup: {
            from: "enquiries",
            localField: "enquiry_id",
            foreignField: "enquiry_id",
            as: "enquiry",
          },
        },
        {
          $project: {
            invoice_id: 1,
            order_id: 1,
            enquiry_id: 1,
            purchaseOrder_id: 1,
            buyer_id: 1,
            supplier_id: 1,
            invoice_no: 1,
            invoice_date: 1,
            buyer_name: 1,
            buyer_address: 1,
            buyer_country: 1,
            buyer_vat_reg_no: 1,
            supplier_name: 1,
            supplier_address: 1,
            supplier_country: 1,
            supplier_vat_reg_no: 1,
            items: 1,
            payment_terms: { $arrayElemAt: ["$enquiry.payment_terms", 0] },
            total_payable_amount: 1,
            total_amount_paid: 1,
            pending_amount: 1,
            account_number: 1,
            sort_code: 1,
            transaction_image: 1,
            invoice_status: 1,
            status: 1,
            payment_status: 1,
            transaction_id: 1,
            amount_paid: 1,
            payment_date: 1,
            mode_of_payment: 1,
            created_at: 1,
            supplier: { $arrayElemAt: ["$supplier", 0] },
            buyer: { $arrayElemAt: ["$buyer", 0] },
          },
        },
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: "$_id",
            invoice_id: { $first: "$invoice_id" },
            order_id: { $first: "$order_id" },
            enquiry_id: { $first: "$enquiry_id" },
            purchaseOrder_id: { $first: "$purchaseOrder_id" },
            buyer_id: { $first: "$buyer_id" },
            supplier_id: { $first: "$supplier_id" },
            invoice_no: { $first: "$invoice_no" },
            invoice_date: { $first: "$invoice_date" },
            buyer_name: { $first: "$buyer_name" },
            buyer_address: { $first: "$buyer_address" },
            buyer_country: { $first: "$buyer_country" },
            buyer_vat_reg_no: { $first: "$buyer_vat_reg_no" },
            supplier_name: { $first: "$supplier_name" },
            supplier_address: { $first: "$supplier_address" },
            supplier_country: { $first: "$supplier_country" },
            supplier_vat_reg_no: { $first: "$supplier_vat_reg_no" },
            items: { $push: "$items" },
            payment_terms: { $first: "$payment_terms" },
            total_payable_amount: { $first: "$total_payable_amount" },
            total_amount_paid: { $first: "$total_amount_paid" },
            pending_amount: { $first: "$pending_amount" },
            account_number: { $first: "$account_number" },
            sort_code: { $first: "$sort_code" },
            transaction_image: { $first: "$transaction_image" },
            invoice_status: { $first: "$invoice_status" },
            status: { $first: "$status" },
            payment_status: { $first: "$payment_status" },
            mode_of_payment: { $first: "$mode_of_payment" },
            transaction_id: { $first: "$transaction_id" },
            payment_date: { $first: "$payment_date" },
            amount_paid: { $first: "$amount_paid" },
            created_at: { $first: "$created_at" },
            supplier: { $first: "$supplier" },
            buyer: { $first: "$buyer" },
            totalPrice: { $sum: "$items.item_price" },
          },
        },
        {
          $project: {
            invoice_id: 1,
            order_id: 1,
            enquiry_id: 1,
            purchaseOrder_id: 1,
            buyer_id: 1,
            supplier_id: 1,
            invoice_no: 1,
            invoice_date: 1,
            buyer_name: 1,
            buyer_address: 1,
            buyer_country: 1,
            buyer_vat_reg_no: 1,
            supplier_name: 1,
            supplier_address: 1,
            supplier_country: 1,
            supplier_vat_reg_no: 1,
            items: 1,
            payment_terms: 1,
            total_payable_amount: 1,
            total_amount_paid: 1,
            pending_amount: 1,
            account_number: 1,
            sort_code: 1,
            transaction_image: 1,
            invoice_status: 1,
            status: 1,
            payment_status: 1,
            mode_of_payment: 1,
            transaction_id: 1,
            amount_paid: 1,
            payment_date: 1,
            created_at: 1,
            totalPrice: 1,
            "supplier.supplier_image": 1,
            "supplier.supplier_name": 1,
            "supplier.supplier_address": 1,
            "supplier.supplier_type": 1,
          },
        },
      ])
        .then((data) => {
          callback({
            code: 200,
            message: "Transaction Details",
            result: data[0],
          });
        })
        .catch((err) => {
          callback({
            code: 400,
            message: "Error while fetching details",
            result: err,
          });
        });
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getProfileEditRequestList: async (req, res) => {
    try {
      const { type, status } = req?.query;

      // Validate inputs
      if (!type) {
        return sendErrorResponse(res, 400, "Type is required.");
      }

      let usersList = await ProfileEditRequest.aggregate([
        // Match based on status and userSchemaReference
        {
          $match: {
            // editReqStatus: status.charAt(0).toUpperCase() + status.slice(1),
            userSchemaReference: type === "supplier" ? "Supplier" : "Buyer",
          },
        },
        // Lookup based on type (Supplier or Buyer)
        {
          $lookup: {
            from: type === "supplier" ? "suppliers" : "buyers",
            localField: "userId",
            foreignField: "_id", // userId field references the _id of the supplier or buyer
            as: type === "supplier" ? "supplierDetails" : "buyerDetails", // Output field name
          },
        },
        // Unwind the lookup result so that we can access the name fields
        {
          $unwind: {
            path: type === "supplier" ? "$supplierDetails" : "$buyerDetails",
            preserveNullAndEmptyArrays: true, // In case there are no matching details
          },
        },
        {
          $sort: { createdAt: -1 }, // <-- Sort by createdAt descending
        },
        // Project necessary fields including name from supplier or buyer
        {
          $project: {
            _id: 1,
            userId: 1,
            userSchemaReference: 1,
            registeredAddress: 1,
            editReqStatus: 1,
            createdAt: 1,
            updatedAt: 1,
            name: {
              $cond: {
                if: { $eq: ["$userSchemaReference", "Supplier"] },
                then: "$supplierDetails.supplier_name", // Adjust according to actual supplier field name if different
                else: "$buyerDetails.buyer_name", // Adjust according to actual buyer field name
              },
            },
            user_id: {
              $cond: {
                if: { $eq: ["$userSchemaReference", "Supplier"] },
                then: "$supplierDetails.supplier_id", // Adjust according to actual supplier field id if different
                else: "$buyerDetails.buyer_id", // Adjust according to actual buyer field id
              },
            },
            contact_person_name: {
              $cond: {
                if: { $eq: ["$userSchemaReference", "Supplier"] },
                then: "$supplierDetails.contact_person_name", // Adjust according to actual supplier field name if different
                else: "$buyerDetails.contact_person_name", // Adjust according to actual buyer field name
              },
            },
            contact_person_email: {
              $cond: {
                if: { $eq: ["$userSchemaReference", "Supplier"] },
                then: "$supplierDetails.contact_person_email", // Adjust according to actual supplier field name if different
                else: "$buyerDetails.contact_person_email", // Adjust according to actual buyer field name
              },
            },
            contact_person_country_code: {
              $cond: {
                if: { $eq: ["$userSchemaReference", "Supplier"] },
                then: "$supplierDetails.contact_person_country_code", // Adjust according to actual supplier field name if different
                else: "$buyerDetails.contact_person_country_code", // Adjust according to actual buyer field name
              },
            },
            contact_person_mobile: {
              $cond: {
                if: { $eq: ["$userSchemaReference", "Supplier"] },
                then: "$supplierDetails.contact_person_mobile_no", // Adjust according to actual supplier field name if different
                else: "$buyerDetails.contact_person_mobile", // Adjust according to actual buyer field name
              },
            },
            usertype: {
              $cond: {
                if: { $eq: ["$userSchemaReference", "Supplier"] },
                then: "$supplierDetails.supplier_type", // Adjust according to actual supplier field name if different
                else: "$buyerDetails.buyer_type", // Adjust according to actual buyer field name
              },
            },
          },
        },
      ]);

      // If no requests are found
      if (!usersList || usersList.length === 0) {
        return sendErrorResponse(res, 404, "No Request List Found.");
      }

      // Success response
      return sendSuccessResponse(
        res,
        200,
        "Successfully fetched profile edit requests.",
        usersList
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getProfileEditRequestDetails: async (req, res) => {
    try {
      // const { type } = req?.query;
      const { type, id } = req?.params;

      // Validate inputs
      if (!id) {
        // only be buyer or supplier
        return sendErrorResponse(res, 400, "id is required.");
      }

      // Ensure the ID is a valid ObjectId and instantiate it correctly
      const objectId = new mongoose.Types.ObjectId(id); // Correct instantiation of ObjectId

      let userProfileEditRequest = await ProfileEditRequest.aggregate([
        // Match based on status and userSchemaReference
        {
          $match: {
            _id: objectId,
          },
        },
        // Lookup based on type (Supplier or Buyer)
        {
          $lookup: {
            from: type === "supplier" ? "suppliers" : "buyers",
            localField: "userId",
            foreignField: "_id", // userId field references the _id of the supplier or buyer
            as: type === "supplier" ? "supplierDetails" : "buyerDetails", // Output field name
          },
        },
        // Unwind the lookup result so that we can access the name fields
        {
          $unwind: {
            path: type === "supplier" ? "$supplierDetails" : "$buyerDetails",
            preserveNullAndEmptyArrays: true, // In case there are no matching details
          },
        },
        // Project necessary fields including name from supplier or buyer
        {
          $project: {
            _id: 1,
            userId: 1,
            userSchemaReference: 1,
            registeredAddress: 1,
            editReqStatus: 1,
            createdAt: 1,
            updatedAt: 1,
            name: {
              $cond: {
                if: { $eq: ["$userSchemaReference", "Supplier"] },
                then: "$supplierDetails.supplier_name", // Adjust according to actual supplier field name if different
                else: "$buyerDetails.buyer_name", // Adjust according to actual buyer field name
              },
            },
            user_id: {
              $cond: {
                if: { $eq: ["$userSchemaReference", "Supplier"] },
                then: "$supplierDetails.supplier_id", // Adjust according to actual supplier field id if different
                else: "$buyerDetails.buyer_id", // Adjust according to actual buyer field id
              },
            },
            contact_person_name: {
              $cond: {
                if: { $eq: ["$userSchemaReference", "Supplier"] },
                then: "$supplierDetails.contact_person_name", // Adjust according to actual supplier field name if different
                else: "$buyerDetails.contact_person_name", // Adjust according to actual buyer field name
              },
            },
            contact_person_email: {
              $cond: {
                if: { $eq: ["$userSchemaReference", "Supplier"] },
                then: "$supplierDetails.contact_person_email", // Adjust according to actual supplier field name if different
                else: "$buyerDetails.contact_person_email", // Adjust according to actual buyer field name
              },
            },
            contact_person_country_code: {
              $cond: {
                if: { $eq: ["$userSchemaReference", "Supplier"] },
                then: "$supplierDetails.contact_person_country_code", // Adjust according to actual supplier field name if different
                else: "$buyerDetails.contact_person_country_code", // Adjust according to actual buyer field name
              },
            },
            contact_person_mobile: {
              $cond: {
                if: { $eq: ["$userSchemaReference", "Supplier"] },
                then: "$supplierDetails.contact_person_mobile_no", // Adjust according to actual supplier field name if different
                else: "$buyerDetails.contact_person_mobile", // Adjust according to actual buyer field name
              },
            },
            usertype: {
              $cond: {
                if: { $eq: ["$userSchemaReference", "Supplier"] },
                then: "$supplierDetails.supplier_type", // Adjust according to actual supplier field name if different
                else: "$buyerDetails.buyer_type", // Adjust according to actual buyer field name
              },
            },
          },
        },
      ]);

      // If no requests are found
      if (!userProfileEditRequest || userProfileEditRequest.length === 0) {
        return sendErrorResponse(res, 404, "No Request List Found.");
      }

      // Success response
      return sendSuccessResponse(
        res,
        200,
        "Successfully fetched profile edit requests.",
        userProfileEditRequest
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  updateProfileRequest: async (req, res) => {
    try {
      const { id } = req?.params;
      const { type, status, admin_id } = req?.body;

      const userReq = await ProfileEditRequest?.findById(id);
      if (!userReq) {
        return sendErrorResponse(res, 400, "No Request Found.");
      }

      const profileModel = type === "buyer" ? Buyer : Supplier;
      const userToUpdate = await profileModel?.findById(userReq?.userId);
      if (!userToUpdate) {
        return sendErrorResponse(res, 400, "No User Found.");
      }

      const updatedUserReq = await ProfileEditRequest?.findByIdAndUpdate(
        id,
        { $set: { editReqStatus: status } },
        { new: true, select: "-password -createdAt -updatedAt -__v -__i" }
      );

      if (!updatedUserReq) {
        return sendErrorResponse(
          res,
          400,
          "Error in updating profile request."
        );
      }

      let updatedProfile;

      if (status === "Approved") {
        const { registeredAddress } = updatedUserReq || {};
        const updatedRegisteredAddress = {};

        if (registeredAddress) {
          [
            "company_reg_address",
            "locality",
            "land_mark",
            "city",
            "state",
            "country",
            "pincode",
          ].forEach((field) => {
            if (registeredAddress[field]?.isChanged) {
              updatedRegisteredAddress[field] =
                registeredAddress?.[field]?.value || null;
            } else {
              updatedRegisteredAddress[field] =
                userToUpdate?.["registeredAddress"]?.[field] || null;
            }
          });
          updatedRegisteredAddress.type = "Registered";
        }
        updatedProfile = await profileModel?.findByIdAndUpdate(
          userToUpdate?._id,
          {
            $set: {
              profile_status: 1, // Profile Accepted
              buyer_address: updatedUserReq?.registeredAddress
                ?.company_reg_address?.isChanged
                ? updatedUserReq?.registeredAddress?.company_reg_address?.value
                : userToUpdate?.["registeredAddress"]?.["company_reg_address"],
              supplier_address: updatedUserReq?.registeredAddress
                ?.company_reg_address?.isChanged
                ? updatedUserReq?.registeredAddress?.company_reg_address?.value
                : userToUpdate?.["registeredAddress"]?.["company_reg_address"],
              registeredAddress: updatedRegisteredAddress,
            },
          },
          { new: true }
        );
      } else if (status === "Rejected") {
        updatedProfile = await profileModel?.findByIdAndUpdate(
          userToUpdate?._id,
          {
            $set: {
              profile_status: 2, // Profile Rejected
            },
          },
          { new: true }
        );
      }

      if (!updatedProfile) {
        return sendErrorResponse(
          res,
          400,
          "Error in updating profile details."
        );
      }

      // Generate unique notification ID
      const notificationId = "NOT-" + Math.random().toString(16).slice(2, 10);
      const newNotification = new Notification({
        notification_id: notificationId,
        event_type: "Profile Edit Request",
        event:
          status === "Approved"
            ? "Profile Edit Approved"
            : "Profile Edit Rejected",
        to: type,
        from: "admin",
        from_id: admin_id,
        to_id:
          type === "buyer" ? userToUpdate?.buyer_id : userToUpdate?.supplier_id,
        event_id: userReq.perId,
        message:
          status === "Approved"
            ? "Your profile edit request has been approved."
            : "Your profile edit request has been rejected.",
        status: 0,
      });

      await newNotification.save();

      // Email setup
      const adminEmail = "platform@medhub.global";
      const subject = `Profile Edit Request Status: ${status}`;
      const recipientEmails = [
        // adminEmail,
        updatedProfile?.contact_person_email,
      ];
      // const { name, userType, email } = userDetails;
      // const { requestDate, status } = requestDetails;
      const emailContent = await generateProfileEditRequestEmail(
        {
          name: updatedProfile?.contact_person_name,
          userType:
            type === "buyer"
              ? updatedProfile?.buyer_type
              : updatedProfile?.supplier_type,
          email: updatedProfile?.contact_person_email,
        },
        { requestDate: updatedUserReq?.createdAt, status }
      );

      await sendEmail(recipientEmails, subject, emailContent);

      return sendSuccessResponse(
        res,
        200,
        "Profile request updated.",
        updatedUserReq
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  editProfileDetails: async (req, res) => {
    try {
      const { id, userType } = req?.params;
      if (!id) {
        return sendErrorResponse(res, 400, "Need User Id.");
      }
      if (!userType) {
        return sendErrorResponse(res, 400, "Need User Type.");
      }
      const Model =
        userType?.toLowerCase() === "buyer"
          ? Buyer
          : userType?.toLowerCase() === "admin"
          ? Admin
          : userType?.toLowerCase() === "supplier"
          ? Supplier
          : userType?.toLowerCase() === "logistics"
          ? LogisticsPartner
          : null;
      const existingUser = await Model.findById(id);
      if (!existingUser) {
        return sendErrorResponse(res, 400, "No User Found.");
      }

      const buyer_imageFiles = await getFilePathsEdit(req, res, [
        "buyer_image",
      ]);
      const supplier_imageFiles = await getFilePathsEdit(req, res, [
        "supplier_image",
      ]);
      const certificate_imageFiles = await getFilePathsEdit(req, res, [
        "certificate_image",
      ]);
      const license_imageFiles = await getFilePathsEdit(req, res, [
        "license_image",
      ]);
      const medical_practitioner_imageFiles = await getFilePathsEdit(req, res, [
        "medical_practitioner_image",
      ]);

      let certificateFileNDateParsed;

      try {
        // Check if certificateFileNDate exists and is an array before applying filter
        if (Array.isArray(req?.body?.certificateFileNDate)) {
          certificateFileNDateParsed = req.body.certificateFileNDate.filter(
            (value) => value !== "[object Object]"
          );
        } else if (typeof req?.body?.certificateFileNDate === "string") {
          // If it's a string, try to parse it as JSON and filter
          certificateFileNDateParsed = JSON.parse(
            req.body?.certificateFileNDate
          )?.filter((value) => value !== "[object Object]");
        } else {
          // Handle case where certificateFileNDate is neither an array nor a string
          throw new Error("Invalid certificateFileNDate format.");
        }
      } catch (error) {
        console.error("Error while parsing certificateFileNDate:", error);
        logErrorToFile(error, req);
        return sendErrorResponse(
          res,
          400,
          "Invalid certificateFileNDate format."
        );
      }

      const updatedUserDetails = {
        ...existingUser.toObject(), // Use the existing product data
        ...req?.body, // Overwrite with new data from request body
        ...(buyer_imageFiles || []),
        ...(supplier_imageFiles || []),
        ...(certificate_imageFiles || []),
        certificate_image: certificate_imageFiles.certificate_image || [],
        certificateFileNDate:
          certificateFileNDateParsed?.length > 0
            ? (Array?.isArray(certificateFileNDateParsed)
                ? certificateFileNDateParsed
                : JSON.parse(certificateFileNDateParsed)
              )
                ?.map((ele, index) => {
                  return {
                    file:
                      typeof ele?.file !== "string"
                        ? certificate_imageFiles?.certificate_image?.find(
                            (filename) => {
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
                            }
                          )
                        : ele?.file ||
                          certificate_imageFiles?.certificate_image?.[index] ||
                          "",

                    date: ele?.date || "", // Log the date being used (if any)
                  };
                })
                ?.filter((ele) => ele?.file || ele?.date)
            : certificateFileNDateParsed,
        ...(license_imageFiles || []),
        medical_certificate:
          medical_practitioner_imageFiles?.medical_practitioner_image || [],
        registeredAddress: {
          ...existingUser?.registeredAddress,
          ...req?.body,
        },
      };
      const updatedUser = await Model.findByIdAndUpdate(
        id,
        updatedUserDetails,
        {
          new: true,
        }
      );

      if (!updatedUser) {
        return sendErrorResponse(
          res,
          400,
          "Error while updating profile details."
        );
      }

      return sendSuccessResponse(
        res,
        200,
        "Profile updated successfully",
        updatedUser
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  updatePassword: async (req, res) => {
    try {
      const { password } = req?.body;

      // Fetch the admin (await async operation)
      const admin = await Admin.find({});

      if (!admin || !admin.length) {
        return sendErrorResponse(
          res,
          400,
          "Error while fetching admin's details."
        );
      }

      // Hash the new password
      const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Update the password (fixed typo from passowrd to password)
      const updatedAdmin = await Admin.findOneAndUpdate(
        { _id: admin[0]._id }, // Fixed the optional chaining here
        {
          $set: { password: hashedPassword }, // Corrected typo here
        },
        { new: true }
      );

      if (!updatedAdmin) {
        return sendErrorResponse(
          res,
          400,
          "Error while updating admin's password."
        );
      }

      // Success response after password update
      return sendSuccessResponse(
        res,
        200,
        "Password updated successfully.",
        updatedAdmin
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  addNewAdmin: async (req, res) => {
    try {
      const { user_name, email, password } = req?.body;

      // Hash the new password
      const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newAdmin = new Admin({
        admin_id: "ADM-" + Math.random().toString(16).slice(2, 10),
        user_name,
        email,
        password: hashedPassword,
      });
      const admin = await newAdmin.save();

      if (!admin) {
        return sendErrorResponse(
          res,
          400,
          "Error While Submitting Admin Registration Request"
        );
      }
      return sendSuccessResponse(res, 200, `Admin Created Successfully.`);
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },
};
