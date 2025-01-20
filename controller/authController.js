const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const moment = require("moment");
const generator = require("generate-password");
const Admin = require("../schema/adminSchema");
const User = require("../schema/userSchema");
const Order = require("../schema/orderSchema");
const Supplier = require("../schema/supplierSchema");
const Buyer = require("../schema/buyerSchema");
const List = require("../schema/addToListSchema");
const BuyerEdit = require("../schema/buyerEditSchema");
const SupplierEdit = require("../schema/supplierEditSchema");
const MedicineInventory = require("../schema/medicineInventorySchema");
const Support = require("../schema/supportSchema");
const Notification = require("../schema/notificationSchema");
const Enquiry = require("../schema/enquiryListSchema");
const PurchaseOrder = require("../schema/purchaseOrderSchema");
const Invoices = require("../schema/invoiceSchema");
const BuyerProfileEdit = require("../schema/buyerEditSchema");
const SupplierProfileEdit = require("../schema/supplierEditSchema");
const { validation } = require("../utils/utilities");
const path = require("path");
const sendMailFunc = require("../utils/sendEmail");
const sendEmail = require("../utils/emailService");
const { getTodayFormattedDate } = require("../utils/utilities");
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
const {
  supplierRegistrationContent,
  buyerRegistrationContent,
  otpForResetPasswordContent,
  profileEditRequestContent,
} = require("../utils/emailContents");
const {
  sendErrorResponse,
  sendSuccessResponse,
} = require("../utils/commonResonse");
const logErrorToFile = require("../logs/errorLogs");

module.exports = {
  registerUser: async (req, res) => {
    try {
      // const { access_token, user_type } = req.headers;
      const { user_type } = req.body;

      // Use req.body directly instead of stringifying it
      const {
        buyer_mobile,
        buyer_email,
        buyer_type,
        buyer_name,
        buyer_address,
        contact_person_name,
        designation,
        contact_person_email,
        contact_person_mobile,
        country_of_origin,
        country_of_operation,
        approx_yearly_purchase_value,
        interested_in,
        license_no,
        license_expiry_date,
        tax_no,
        registration_no,
        description,
        vat_reg_no,
        trade_code
      } = req.body;

      let regObj = {};

      if (!user_type) {
        return sendErrorResponse(res, 400, "Need User Type.");
      }

      if (user_type === "Buyer") {
        // Validate the required files for "Buyer" type
        if (
          !req.files["buyer_image"] ||
          req.files["buyer_image"].length === 0
        ) {
          return sendErrorResponse(res, 415, "Company Logo is required.");
        }
        if (!req.files["tax_image"] || req.files["tax_image"].length === 0) {
          return sendErrorResponse(res, 415, "Company tax image is required.");
        }
        if (
          !req.files["license_image"] ||
          req.files["license_image"].length === 0
        ) {
          return sendErrorResponse(
            res,
            415,
            "Company license image is required."
          );
        }
        if (
          !req.files["certificate_image"] ||
          req.files["certificate_image"].length === 0
        ) {
          return sendErrorResponse(
            res,
            415,
            "Company certificate image is required."
          );
        }

        // Extract and format the mobile and country code
        const buyerCountryCode = buyer_mobile.split(" ")[0];
        const buyer_mobile_number = buyer_mobile.split(" ").slice(1).join(" ");
        const person_mob_no = contact_person_mobile
          .split(" ")
          .slice(1)
          .join(" ");
        const personCountryCode = contact_person_mobile.split(" ")[0];

        regObj = {
          buyer_email,
          buyer_type,
          buyer_name,
          buyer_address,
          contact_person_name,
          designation,
          contact_person_email,
          contact_person_mobile: person_mob_no,
          contact_person_country_code: personCountryCode,
          country_of_origin,
          country_of_operation,
          approx_yearly_purchase_value,
          interested_in,
          license_no,
          license_expiry_date,
          tax_no,
          registration_no,
          description,
          vat_reg_no,
          trade_code,
          buyer_mobile: buyer_mobile_number,
          buyer_country_code: buyerCountryCode,
          buyer_image: req.files["buyer_image"].map((file) =>
            path.basename(file.path)
          ),
          license_image: req.files["license_image"].map((file) =>
            path.basename(file.path)
          ),
          tax_image: req.files["tax_image"].map((file) =>
            path.basename(file.path)
          ),
          certificate_image: req.files["certificate_image"].map((file) =>
            path.basename(file.path)
          ),
        };

        // Validate registration fields using a custom validation function
        const errObj = validation(regObj, "buyerRegister");
        if (Object.values(errObj).length) {
          return sendErrorResponse(
            res,
            419,
            "All fields are required.",
            errObj
          );
        }
      } else if (user_type === "Supplier") {
        if (
          !req.files["supplier_image"] ||
          req.files["supplier_image"].length === 0
        ) {
          return sendErrorResponse(res, 415, "Supplier Logo is required.");
        }
        if (!req.files["tax_image"] || req.files["tax_image"].length === 0) {
          return sendErrorResponse(res, 415, "Supplier tax image is required.");
        }
        if (
          !req.files["license_image"] ||
          req.files["license_image"].length === 0
        ) {
          return sendErrorResponse(
            res,
            415,
            "Supplier license image is required."
          );
        }

        if (
          !req.files["certificate_image"] ||
          req.files["certificate_image"].length === 0
        ) {
          return sendErrorResponse(
            res,
            415,
            "Supplier Certificate image is required."
          );
        }

        const supplierCountryCode = req.body.supplier_mobile_no.split(" ")[0];
        const supplier_mobile_number = req.body.supplier_mobile_no
          .split(" ")
          .slice(1)
          .join(" ");
        const person_mob_no = req.body.contact_person_mobile
          .split(" ")
          .slice(1)
          .join(" ");
        const personCountryCode = req.body.contact_person_mobile.split(" ")[0];

        regObj = {
          ...req.body,
          supplier_mobile: supplier_mobile_number,
          supplier_country_code: supplierCountryCode,
          contact_person_mobile_no: person_mob_no,
          contact_person_country_code: personCountryCode,
          supplier_image: req.files["supplier_image"].map((file) =>
            path.basename(file.path)
          ),
          license_image: req.files["license_image"].map((file) =>
            path.basename(file.path)
          ),
          tax_image: req.files["tax_image"].map((file) =>
            path.basename(file.path)
          ),
          certificate_image: req.files["certificate_image"].map((file) =>
            path.basename(file.path)
          ),
        };

        const errObj = validation(regObj, "supplierRegister");

        if (Object.values(errObj).length) {
          return sendErrorResponse(res, 419, "All fields are required", errObj);
        }
      }

      // Check for email existence based on user type
      const emailExists =
        user_type === "Buyer"
          ? await Buyer.findOne({
              contact_person_email: regObj?.contact_person_email,
            })
          : user_type === "Admin"
          ? await Admin.findOne({ email: req.body?.email })
          : user_type === "Supplier"
          ? await Supplier.findOne({
              contact_person_email: req.body?.contact_person_email,
            })
          : user_type === "Seller"
          ? await Seller.findOne({ email: req.body?.email })
          : null;

      if (emailExists) {
        return sendErrorResponse(res, 409, "Email already exists");
      }

      // Generate unique notification ID and user ID
      const notificationId = "NOT-" + Math.random().toString(16).slice(2, 10);
      const userId = `${
        user_type === "Buyer"
          ? "BYR-"
          : user_type === "Admin"
          ? "ADM-"
          : user_type === "Supplier"
          ? "SUP-"
          : user_type === "Seller"
          ? "SLR-"
          : ""
      }${Math.random().toString(16).slice(2, 10)}`;

      // Create JWT token for the user
      let jwtSecretKey = process.env.APP_SECRET;
      let data = { time: Date(), email: req.body?.email };
      const token = jwt.sign(data, jwtSecretKey);
      const saltRounds = 10;

      // Create instances of Admin, Supplier, and Buyer models based on user type
      const newAdmin = new Admin({
        admin_id: userId,
        user_name: req.body?.name,
        email: req.body?.email,
        password: req.body?.password,
        token: token,
      });

      const newSupplier = new Supplier({
        supplier_id: userId,
        supplier_type: regObj.supplier_type,
        supplier_name: regObj.supplier_name,
        supplier_address: regObj.supplier_address,
        description: regObj.description,
        supplier_email: regObj.supplier_email,
        supplier_mobile: regObj.supplier_mobile,
        supplier_country_code: regObj.supplier_country_code,
        license_no: regObj.license_no,
        license_expiry_date: regObj.license_expiry_date,
        tax_no: regObj.tax_no,
        // registration_no             : regobj.registration_no,
        country_of_origin: regObj.country_of_origin,
        country_of_operation: regObj.country_of_operation,
        contact_person_name: regObj.contact_person_name,
        designation: regObj.designation,
        contact_person_mobile_no: regObj.contact_person_mobile_no,
        contact_person_country_code: regObj.contact_person_country_code,
        contact_person_email: regObj.contact_person_email,
        supplier_image: regObj.supplier_image,
        license_image: regObj.license_image,
        certificate_image: regObj.certificate_image,
        tax_image: regObj.tax_image,
        payment_terms: regObj.payment_terms,
        estimated_delivery_time: regObj.estimated_delivery_time,
        tags: regObj.tags,
        registration_no: regObj.registration_no,
        vat_reg_no: regObj.vat_reg_no,
        trade_code : regObj.trade_code,
        token: token,
        account_status: 0,
        profile_status: 0,
      });

      const newBuyer = new Buyer({
        buyer_id: userId,
        buyer_type: regObj?.buyer_type,
        buyer_name: regObj?.buyer_name,
        buyer_address: regObj?.buyer_address,
        buyer_email: regObj?.buyer_email,
        buyer_mobile: regObj?.buyer_mobile,
        buyer_country_code: regObj?.buyer_country_code,
        contact_person_name: regObj?.contact_person_name,
        contact_person_email: regObj?.contact_person_email,
        contact_person_mobile: regObj?.contact_person_mobile,
        contact_person_country_code: regObj?.contact_person_country_code,
        country_of_origin: regObj?.country_of_origin,
        country_of_operation: regObj?.country_of_operation,
        approx_yearly_purchase_value: regObj?.approx_yearly_purchase_value,
        interested_in: regObj?.interested_in,
        license_no: regObj?.license_no,
        license_expiry_date: regObj?.license_expiry_date,
        tax_no: regObj?.tax_no,
        registration_no: regObj?.registration_no,
        description: regObj?.description,
        buyer_image: regObj?.buyer_image,
        designation: regObj?.designation,
        tax_image: regObj?.tax_image,
        license_image: regObj?.license_image,
        certificate_image: regObj?.certificate_image,
        vat_reg_no: regObj?.vat_reg_no,
        trade_code : regObj.trade_code,
        token: token,
        account_status: 0,
        profile_status: 0,
      });

      // Hash password
      const hashedPassword = await bcrypt.genSalt(saltRounds);
      if (!hashedPassword) {
        return sendErrorResponse(
          res,
          400,
          "Error in generating salt or hashing password"
        );
      }

      // If user type is "Buyer", save buyer details and send response
      if (user_type === "Buyer") {
        const buyer = await newBuyer.save();

        if (!buyer) {
          return sendErrorResponse(
            res,
            400,
            "Error While Submitting Buyer Registration Request"
          );
        }

        const newNotification = new Notification({
          notification_id: notificationId,
          event_type: "New Registration Request",
          event: "buyerregistration",
          from: "buyer",
          to: "admin",
          from_id: userId,
          event_id: userId,
          message: "New Buyer Registration Request",
          status: 0,
        });

        const savedNotification = await newNotification.save();
        const adminEmail = "ajo@shunyaekai.tech";
        const subject = "New Registration Alert: Buyer Account Created";

        const recipientEmails = [adminEmail, "shivani.shunyaekai@gmail.com"];
        const emailContent = await buyerRegistrationContent(buyer);
        // await sendMailFunc(recipientEmails.join(","), subject, emailContent);
        await sendEmail(recipientEmails, subject, emailContent);

        return sendSuccessResponse(
          res,
          200,
          `Buyer Registration Request Submitted Successfully.`
        );
      }

      // If user type is "Admin", save admin and return response
      else if (user_type === "Admin") {
        newAdmin.password = hashedPassword;
        const admin = await newAdmin.save();
        if (!admin) {
          return sendErrorResponse(
            res,
            400,
            "Error While Submitting Admin Registration Request"
          );
        }
        return sendSuccessResponse(
          res,
          200,
          `Admin Registration Request Successfully.`
        );
      }

      // If user type is "Supplier", save supplier and send response
      else if (user_type === "Supplier") {
        const supplier = await newSupplier.save();
        if (!supplier) {
          return sendErrorResponse(
            res,
            400,
            "Error While Submitting Supplier Registration Request"
          );
        }
        const newNotification = new Notification({
          notification_id: notificationId,
          event_type: "New Registration Request",
          event: "supplierregistration",
          from: "supplier",
          to: "admin",
          from_id: userId,
          event_id: userId,
          message: "New Supplier Registration Request",
          status: 0,
        });

        const savedNotification = await newNotification.save();
        const adminEmail = "ajo@shunyaekai.tech";
        const subject = "New Registration Alert: Supplier Account Created";
        // const subject = New Registration Alert: ${user_type} Account Created;
        const recipientEmails = [adminEmail, "ajo@shunyaekai.tech"];
        const emailContent = await supplierRegistrationContent(supplier);
        // await sendMailFunc(recipientEmails.join(","), subject, emailContent);

        await sendEmail(recipientEmails, subject, emailContent);

        return sendSuccessResponse(
          res,
          200,
          `Supplier Registration Request Submitted Successfully.`
        );
      }

      // Additional handling for other user types (Seller) would go here
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

  loginUser: async (req, res) => {
    try {
      const { access_token } = req.headers;
      const { email, password, user_type } = req.body;

      if (!user_type) {
        return sendErrorResponse(res, 400, "Cannot Identify User.");
      }

      if (!email) {
        return sendErrorResponse(res, 400, "Email isrequired.");
      }

      if (!password) {
        return sendErrorResponse(res, 400, "Password isrequired.");
      }

      // Find the user based on user type
      const user =
        user_type === "Buyer"
          ? await Buyer.findOne({ buyer_email: email })
          : user_type === "Admin"
          ? await Admin.findOne({ email })
          : user_type === "Supplier"
          ? await Supplier.findOne({ supplier_email: email })
          : user_type === "Seller"
          ? await Seller.findOne({ email })
          : null;

      if (!user) {
        return sendErrorResponse(
          res,
          400,
          "User not found. Please enter registered email."
        );
      }

      // Check if the password matches
      const isMatch = await bcrypt.compare(password, user?.password);

      if (!isMatch) {
        return sendErrorResponse(res, 400, "Incorrect Password.");
      }

      // Fetch user details excluding sensitive information
      let user2 =
        user_type === "Buyer"
          ? await Buyer.findById(user?._id)
              .select("-password -createdAt -updatedAt -__v")
              .lean()
          : user_type === "Admin"
          ? await Admin.findById(user?._id)
              .select("-password -createdAt -updatedAt -__v")
              .lean()
          : user_type === "Supplier"
          ? await Supplier.findById(user?._id)
              .select("-password -createdAt -updatedAt -__v")
              .lean()
          : user_type === "Seller"
          ? await Seller.findById(user?._id)
              .select("-password -createdAt -updatedAt -__v")
              .lean()
          : null;

      if (user_type === "Buyer") {
        // Count documents in the List collection for the buyer
        const listCount = await List.countDocuments({
          buyer_id: user2.buyer_id,
        });
        user2.list_count = listCount;
      }

      return sendSuccessResponse(
        res,
        200,
        `${user_type} Login Successful.`,
        user2
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

  getLoggedinUserProfileDetails: async (req, res) => {
    try {
      const { access_token, user_type } = req.headers;
      const { id } = req?.params;

      const user =
        user_type == "Buyer"
          ? await Buyer.findById(id)?.select(
              "-password -token -createdAt -updatedAt -__v"
            )
          : user_type == "Admin"
          ? await Admin.findById(id)?.select(
              "-password -token -createdAt -updatedAt -__v"
            )
          : user_type == "Supplier"
          ? await Supplier.findById(id)?.select(
              "-password -token -createdAt -updatedAt -__v"
            )
          : user_type == "Seller"
          ? await Seller.findById(id)?.select(
              "-password -token -createdAt -updatedAt -__v"
            )
          : null;

      if (!user) {
        return sendErrorResponse(res, 400, "No user Found");
      }

      return sendSuccessResponse(res, 200, "User Found.", user);
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

  verifyEmail: async (req, res) => {
    try {
      const { email, user_type } = req?.body;

      if (!email) {
        return sendErrorResponse(res, 400, "Email is required.");
      }

      let user;

      // Find the user based on their type and email
      if (user_type === "Buyer") {
        user = await Buyer?.findOne({ buyer_email: email });
      } else if (user_type === "Supplier") {
        user = await Supplier?.findOne({ supplier_email: email });
      } else if (user_type === "Admin") {
        user = await Admin?.findOne({ email: email });
      }

      // If the user is not found, return an error response
      if (!user) {
        return sendErrorResponse(
          res,
          400,
          "Email not registered. Please provide a registered address."
        );
      }

      // Generate a new OTP and its expiry time (10 minutes ahead)
      const otp = Math.random()?.toString()?.slice(2, 8);
      const currentDate = new Date();
      const tenMinutesAhead = new Date(currentDate.getTime() + 10 * 60 * 1000);

      let updatedUser;

      // Update the user with OTP and expiry based on their type
      if (user_type === "Buyer") {
        updatedUser = await Buyer?.findOneAndUpdate(
          { buyer_email: email },
          {
            $set: {
              otp: otp,
              otpCount: 1,
              otpExpiry: tenMinutesAhead,
            },
          },
          { new: true }
        );
      } else if (user_type === "Supplier") {
        updatedUser = await Supplier?.findOneAndUpdate(
          { supplier_email: email },
          {
            $set: {
              otp: otp,
              otpCount: 1,
              otpExpiry: tenMinutesAhead,
            },
          },
          { new: true }
        );
      } else if (user_type === "Admin") {
        updatedUser = await Admin?.findOneAndUpdate(
          { email: email },
          {
            $set: {
              otp: otp,
              otpCount: 1,
              otpExpiry: tenMinutesAhead,
            },
          },
          { new: true }
        );
      }

      // If the update fails, return an error
      if (!updatedUser) {
        return sendErrorResponse(
          res,
          400,
          "Error verifying email and generating OTP."
        );
      }

      // Email settings and content
      const adminEmail = "shivani@shunyaekai.tech";
      const subject = "Reset Your Password - One-Time Password (OTP) Enclosed";
      const recipientEmails = [adminEmail, "ajo@shunyaekai.tech", email].filter(
        (email) => email
      );

      // Prepare the email content
      const emailContent = await otpForResetPasswordContent(updatedUser, otp);
      await sendEmail(recipientEmails, subject, emailContent);

      // Success response
      return sendSuccessResponse(
        res,
        200,
        "Mail sent to the registered email."
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

  // verifyEmailAndResendOTP: async (req, res) => {
  //   try {
  //     const { email, user_type } = req?.body;

  //     if (!email) {
  //       return sendErrorResponse(res, 400, "Email is required.");
  //     }

  //     let user;

  //     // Find the user based on their type and email
  //     if (user_type === "Buyer") {
  //       user = await Buyer?.findOne({ buyer_email: email });
  //     } else if (user_type === "Supplier") {
  //       user = await Supplier?.findOne({ supplier_email: email });
  //     } else if (user_type === "Admin") {
  //       user = await Admin?.findOne({ email: email });
  //     }

  //     // If the user is not found, return an error response
  //     if (!user) {
  //       return sendErrorResponse(
  //         res,
  //         400,
  //         "Email not registered. Please provide a registered address."
  //       );
  //     }

  //     // Check if the user has reached their OTP limit
  //     if (user?.otpCount >= 5) {
  //       const currentDate = new Date();

  //       // If the user has an otpLimitReachedAt timestamp, check if 2 hours have passed
  //       if (user?.otpLimitReachedAt) {
  //         const twoHoursLater = new Date(user.otpLimitReachedAt.getTime() + 2 * 60 * 60 * 1000);

  //         // If 2 hours haven't passed, deny the request
  //         if (currentDate < twoHoursLater) {
  //           return sendErrorResponse(
  //             res,
  //             400,
  //             `You have reached your OTP limit. You can request again after ${twoHoursLater.toLocaleString()}.`
  //           );
  //         } else {
  //           // If 2 hours have passed, reset the otpCount and allow the user to request an OTP
  //           user.otpCount = 0;
  //           user.otpLimitReachedAt = null;
  //         }
  //       } else {
  //         // If no timestamp is present, record the time they reached the OTP limit
  //         user.otpLimitReachedAt = currentDate;
  //         await user.save();
  //         return sendErrorResponse(
  //           res,
  //           400,
  //           "You have reached your OTP limit. You can request again after 2 hours."
  //         );
  //       }
  //     }

  //     // Check if OTP matches and if it's still valid (hasn't expired)
  //     const currentDate = new Date();

  //     // Generate a new OTP and its expiry time (10 minutes ahead)
  //     const otp = Math.random()?.toString()?.slice(2, 8);
  //     const tenMinutesAhead = new Date(currentDate.getTime() + 10 * 60 * 1000);

  //     let updatedUser;

  //     // Update the user with OTP and expiry based on their type
  //     if (user_type === "Buyer") {
  //       updatedUser = await Buyer?.findOneAndUpdate(
  //         { buyer_email: email },
  //         {
  //           $set: {
  //             otp: otp,
  //             otpExpiry: tenMinutesAhead,
  //             otpCount: user?.otpCount + 1, // Increment OTP count
  //           },
  //         },
  //         { new: true }
  //       );
  //     } else if (user_type === "Supplier") {
  //       updatedUser = await Supplier?.findOneAndUpdate(
  //         { supplier_email: email },
  //         {
  //           $set: {
  //             otp: otp,
  //             otpExpiry: tenMinutesAhead,
  //             otpCount: user?.otpCount + 1, // Increment OTP count
  //           },
  //         },
  //         { new: true }
  //       );
  //     } else if (user_type === "Admin") {
  //       updatedUser = await Admin?.findOneAndUpdate(
  //         { email: email },
  //         {
  //           $set: {
  //             otp: otp,
  //             otpExpiry: tenMinutesAhead,
  //             otpCount: user?.otpCount + 1, // Increment OTP count
  //           },
  //         },
  //         { new: true }
  //       );
  //     }

  //     // If the update fails, return an error
  //     if (!updatedUser) {
  //       return sendErrorResponse(
  //         res,
  //         400,
  //         "Error verifying email and generating OTP."
  //       );
  //     }

  //     // Email settings and content
  //     const adminEmail = "shivani@shunyaekai.tech";
  //     const subject = "Reset Your Password - One-Time Password (OTP) Enclosed";
  //     const recipientEmails = [adminEmail, "ajo@shunyaekai.tech", email].filter(
  //       (email) => email
  //     );

  //     // Prepare the email content
  //     const emailContent = await otpForResetPasswordContent(updatedUser, otp);
  //     await sendEmail(recipientEmails, subject, emailContent);

  //     // Success response
  //     return sendSuccessResponse(
  //       res,
  //       200,
  //       "Mail sent to the registered email."
  //     );
  //   } catch (error) {
  //     console.log("Internal Server Error:", error);
  //     logErrorToFile(error, req);
  //     return sendErrorResponse(
  //       res,
  //       500,
  //       "An unexpected error occurred. Please try again later.",
  //       error
  //     );
  //   }
  // },

  verifyEmailAndResendOTP: async (req, res) => {
    try {
      const { email, user_type } = req?.body;

      if (!email) {
        return sendErrorResponse(res, 400, "Email is required.");
      }

      let user;

      // Find the user based on their type and email
      if (user_type === "Buyer") {
        user = await Buyer?.findOne({ buyer_email: email });
      } else if (user_type === "Supplier") {
        user = await Supplier?.findOne({ supplier_email: email });
      } else if (user_type === "Admin") {
        user = await Admin?.findOne({ email: email });
      }

      // If the user is not found, return an error response
      if (!user) {
        return sendErrorResponse(
          res,
          400,
          "Email not registered. Please provide a registered address."
        );
      }

      // Check if the user has reached their OTP limit
      const currentDate = new Date();

      if (user?.otpCount >= 5) {
        // If the user has an otpLimitReachedAt timestamp, check if 2 hours have passed
        if (user?.otpLimitReachedAt) {
          const twoHoursLater = new Date(
            user.otpLimitReachedAt.getTime() + 2 * 60 * 60 * 1000
          );

          // If 2 hours haven't passed, deny the request
          if (currentDate < twoHoursLater) {
            return sendErrorResponse(
              res,
              400,
              `You have reached your OTP limit. You can request again after ${twoHoursLater.toLocaleString()}.`
            );
          } else {
            // If 2 hours have passed, reset the otpCount to 1 and remove otpLimitReachedAt
            user.otpCount = 1; // Reset to 1, not 0
            user.otpLimitReachedAt = null; // Remove the otpLimitReachedAt
            await user.save(); // Save the changes
          }
        } else {
          // If no timestamp is present, record the time they reached the OTP limit
          user.otpLimitReachedAt = currentDate;
          await user.save();
          return sendErrorResponse(
            res,
            400,
            "You have reached your OTP limit. You can request again after 2 hours."
          );
        }
      }

      // Generate a new OTP and its expiry time (10 minutes ahead)
      const otp = Math.random()?.toString()?.slice(2, 8);
      const tenMinutesAhead = new Date(currentDate.getTime() + 10 * 60 * 1000);

      let updatedUser;

      // Update the user with OTP and expiry based on their type
      if (user_type === "Buyer") {
        updatedUser = await Buyer?.findOneAndUpdate(
          { buyer_email: email },
          {
            $set: {
              otp: otp,
              otpExpiry: tenMinutesAhead,
              otpCount: user?.otpCount + 1, // Increment OTP count
            },
          },
          { new: true }
        );
      } else if (user_type === "Supplier") {
        updatedUser = await Supplier?.findOneAndUpdate(
          { supplier_email: email },
          {
            $set: {
              otp: otp,
              otpExpiry: tenMinutesAhead,
              otpCount: user?.otpCount + 1, // Increment OTP count
            },
          },
          { new: true }
        );
      } else if (user_type === "Admin") {
        updatedUser = await Admin?.findOneAndUpdate(
          { email: email },
          {
            $set: {
              otp: otp,
              otpExpiry: tenMinutesAhead,
              otpCount: user?.otpCount + 1, // Increment OTP count
            },
          },
          { new: true }
        );
      }

      // If the update fails, return an error
      if (!updatedUser) {
        return sendErrorResponse(
          res,
          400,
          "Error verifying email and generating OTP."
        );
      }

      // Email settings and content
      const adminEmail = "shivani@shunyaekai.tech";
      const subject = "Reset Your Password - One-Time Password (OTP) Enclosed";
      const recipientEmails = [adminEmail, "ajo@shunyaekai.tech", email].filter(
        (email) => email
      );

      // Prepare the email content
      const emailContent = await otpForResetPasswordContent(updatedUser, otp);
      await sendEmail(recipientEmails, subject, emailContent);

      // Success response
      return sendSuccessResponse(
        res,
        200,
        "Mail sent to the registered email."
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

  verifyOTP: async (req, res) => {
    try {
      const { email, otp, user_type } = req?.body;

      if (!email) {
        return sendErrorResponse(res, 400, "Email is required.");
      }

      if (!otp) {
        return sendErrorResponse(res, 400, "OTP is required.");
      }

      let user;

      // Find the user based on their type and email
      if (user_type === "Buyer") {
        user = await Buyer?.findOne({ buyer_email: email });
      } else if (user_type === "Supplier") {
        user = await Supplier?.findOne({ supplier_email: email });
      } else if (user_type === "Admin") {
        user = await Admin?.findOne({ email: email });
      }

      // If the user is not found, return an error response
      if (!user) {
        return sendErrorResponse(
          res,
          400,
          "Email not registered. Please provide a registered address."
        );
      }

      // Check if OTP matches and if it's still valid (hasn't expired)
      const currentDate = new Date();

      if (user.otp !== Number.parseInt(otp)) {
        return sendErrorResponse(res, 400, "Invalid OTP");
      }

      // Ensure the OTP expiry is correctly handled by checking the time
      const otpExpiryDate = new Date(user.otpExpiry); // Convert to Date object
      if (otpExpiryDate < currentDate) {
        return sendErrorResponse(res, 400, "Expired OTP");
      }

      // OTP is valid, now proceed to remove otp and otpExpiry
      let updatedUser;

      // Update the user and unset the otp and otpExpiry fields
      if (user_type === "Buyer") {
        updatedUser = await Buyer?.findOneAndUpdate(
          { buyer_email: email },
          {
            $unset: { otp: "", otpExpiry: "" },
          },
          { new: true }
        );
      } else if (user_type === "Supplier") {
        updatedUser = await Supplier?.findOneAndUpdate(
          { supplier_email: email },
          {
            $unset: { otp: "", otpExpiry: "" },
          },
          { new: true }
        );
      } else if (user_type === "Admin") {
        updatedUser = await Admin?.findOneAndUpdate(
          { email: email },
          {
            $unset: { otp: "", otpExpiry: "" },
          },
          { new: true }
        );
      }

      // If the update fails, return an error
      if (!updatedUser) {
        return sendErrorResponse(
          res,
          400,
          "Error unsetting OTP and OTP expiry."
        );
      }

      // Success response
      return sendSuccessResponse(res, 200, "OTP verified successfully.");
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

  resetPassword: async (req, res) => {
    try {
      const { email, password, user_type } = req?.body;

      if (!email) {
        return sendErrorResponse(res, 400, "Email is required.");
      }

      if (!password) {
        return sendErrorResponse(res, 400, "Password is required.");
      }

      let user;

      // Find the user based on their type and email
      if (user_type === "Buyer") {
        user = await Buyer?.findOne({ buyer_email: email });
      } else if (user_type === "Supplier") {
        user = await Supplier?.findOne({ supplier_email: email });
      } else if (user_type === "Admin") {
        user = await Admin?.findOne({ email: email });
      }

      // If the user is not found, return an error response
      if (!user) {
        return sendErrorResponse(
          res,
          400,
          "Email not registered. Please provide a registered address."
        );
      }

      // Check if the new password matches the old password
      const isMatch = await bcrypt.compare(password, user?.password);
      if (isMatch) {
        return sendErrorResponse(
          res,
          400,
          "New password cannot be the same as old password."
        );
      }

      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      let updateProfile;

      // Update the password based on the user type
      if (user_type === "Buyer") {
        updateProfile = await Buyer?.findOneAndUpdate(
          { buyer_email: email },
          { $set: { password: hashedPassword } },
          { new: true }
        );
      } else if (user_type === "Supplier") {
        updateProfile = await Supplier?.findOneAndUpdate(
          { supplier_email: email },
          { $set: { password: hashedPassword } },
          { new: true }
        );
      } else if (user_type === "Admin") {
        updateProfile = await Admin?.findOneAndUpdate(
          { email: email },
          { $set: { password: hashedPassword } },
          { new: true }
        );
      }

      // If the update fails, return an error response
      if (!updateProfile) {
        return sendErrorResponse(res, 400, "Failed to update password.");
      }

      // Success response
      return sendSuccessResponse(
        res,
        200,
        "Password has been successfully updated."
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

  updatePassword: async (req, res) => {
    try {
      const { id } = req?.params;
      const { user_type } = req?.headers;
      const { newPassword, oldPassword } = req?.body;

      if (!oldPassword) {
        return sendErrorResponse(res, 400, "Old Password is required.");
      }

      if (!newPassword) {
        return sendErrorResponse(res, 400, "New Password is required.");
      }

      let user;

      // Find the user based on their type and email
      if (user_type === "Buyer") {
        user = await Buyer?.findById(id);
      } else if (user_type === "Supplier") {
        user = await Supplier?.findById(id);
      } else if (user_type === "Admin") {
        user = await Admin?.findById(id);
      }

      // If the user is not found, return an error response
      if (!user) {
        return sendErrorResponse(
          res,
          400,
          "Email not registered. Please provide a registered address."
        );
      }

      // Check if the provided old password matches the current password
      const isOldPwdMatch = await bcrypt.compare(oldPassword, user?.password);
      if (!isOldPwdMatch) {
        return sendErrorResponse(res, 400, "Old password is not correct.");
      }

      // Check if the new password matches the old password (to prevent reuse)
      const isNewPwdSameAsOld = await bcrypt.compare(
        newPassword,
        user?.password
      );
      if (isNewPwdSameAsOld) {
        return sendErrorResponse(
          res,
          400,
          "New password cannot be the same as old password."
        );
      }

      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      let updateProfile;

      // Update the password based on the user type
      if (user_type === "Buyer") {
        updateProfile = await Buyer?.findOneAndUpdate(
          { $set: { password: hashedPassword } },
          { new: true }
        );
      } else if (user_type === "Supplier") {
        updateProfile = await Supplier?.findOneAndUpdate(
          { supplier_email: email },
          { $set: { password: hashedPassword } },
          { new: true }
        );
      } else if (user_type === "Admin") {
        updateProfile = await Admin?.findOneAndUpdate(
          { email: email },
          { $set: { password: hashedPassword } },
          { new: true }
        );
      }

      // If the update fails, return an error response
      if (!updateProfile) {
        return sendErrorResponse(res, 400, "Failed to update password.");
      }

      // Success response
      return sendSuccessResponse(
        res,
        200,
        "Password has been successfully updated."
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

  addProfileEditRequest: async (req, res) => {
    try {
      const { id } = req?.params;
      const { user_type } = req?.headers;

      if (user_type === "Buyer") {
        // Validate the required files for "Buyer" type
        if (
          (!req?.body?.buyer_image || !req?.body?.buyer_image?.length === 0) &&
          (!req.files["new_buyer_image"] ||
            req.files["new_buyer_image"].length === 0)
        ) {
          return sendErrorResponse(res, 415, "Company Logo is required.");
        }
        if (
          (!req?.body?.tax_image || !req?.body?.tax_image?.length === 0) &&
          (!req.files["new_tax_image"] ||
            req.files["new_tax_image"].length === 0)
        ) {
          return sendErrorResponse(res, 415, "Company tax image is required.");
        }
        if (
          (!req?.body?.tax_image || !req?.body?.tax_image?.length === 0) &&
          (!req.files["new_license_image"] ||
            req.files["new_license_image"].length === 0)
        ) {
          return sendErrorResponse(
            res,
            415,
            "Company license image is required."
          );
        }
        if (
          (!req?.body?.certificate_image ||
            !req?.body?.certificate_image?.length === 0) &&
          (!req.files["new_certificate_image"] ||
            req.files["new_certificate_image"].length === 0)
        ) {
          return sendErrorResponse(
            res,
            415,
            "Company certificate image is required."
          );
        }

        // Extract and format the mobile and country code
        const buyerCountryCode = buyer_mobile.split(" ")[0];
        const buyer_mobile_number = buyer_mobile.split(" ").slice(1).join(" ");
        const person_mob_no = contact_person_mobile
          .split(" ")
          .slice(1)
          .join(" ");
        const personCountryCode = contact_person_mobile.split(" ")[0];

        const newBuyerImage = req.files["new_buyer_image"].map((file) =>
          path.basename(file.path)
        );
        const updatedBuyerImage = [...newBuyerImage, ...req?.body?.buyer_image];

        const newLicenseImage = req.files["new_license_image"].map((file) =>
          path.basename(file.path)
        );
        const updatedLicenseImage = [
          ...newLicenseImage,
          ...req?.body?.license_image,
        ];

        const newTaxImage = req.files["new_tax_image"].map((file) =>
          path.basename(file.path)
        );
        const updatedTaxImages = [...newTaxImage, ...req?.body?.tax_image];

        const newCertificateImage = req.files["new_certificate_image"].map(
          (file) => path.basename(file.path)
        );
        const updatedCertificateImage = [
          ...newCertificateImage,
          ...req?.body?.certificate_image,
        ];

        regObj = {
          buyer_email,
          buyer_type,
          buyer_name,
          buyer_address,
          contact_person_name,
          designation,
          contact_person_email,
          contact_person_mobile: person_mob_no,
          contact_person_country_code: personCountryCode,
          country_of_origin,
          country_of_operation,
          approx_yearly_purchase_value,
          interested_in,
          license_no,
          license_expiry_date,
          tax_no,
          registration_no,
          description,
          vat_reg_no,
          buyer_mobile: buyer_mobile_number,
          buyer_country_code: buyerCountryCode,
          buyer_image: updatedBuyerImage,
          license_image: updatedLicenseImage,
          tax_image: updatedTaxImages,
          certificate_image: updatedCertificateImage,
        };

        // Validate registration fields using a custom validation function
        const errObj = validation(regObj, "buyerRegister");
        if (Object.values(errObj).length) {
          return sendErrorResponse(
            res,
            419,
            "All fields are required.",
            errObj
          );
        }
      } else if (user_type === "Supplier") {
        if (
          (!req?.body?.supplier_image ||
            !req?.body?.supplier_image?.length === 0) &&
          (!req.files["new_supplier_image"] ||
            req.files["new_supplier_image"].length === 0)
        ) {
          return sendErrorResponse(res, 415, "Supplier Logo is required.");
        }
        if (
          (!req?.body?.tax_image || !req?.body?.tax_image?.length === 0) &&
          (!req.files["new_tax_image"] ||
            req.files["new_tax_image"].length === 0)
        ) {
          return sendErrorResponse(res, 415, "Supplier tax image is required.");
        }
        if (
          (!req?.body?.license_image ||
            !req?.body?.license_image?.length === 0) &&
          (!req.files["new_license_image"] ||
            req.files["new_license_image"].length === 0)
        ) {
          return sendErrorResponse(
            res,
            415,
            "Supplier license image is required."
          );
        }

        if (
          (!req?.body?.certificate_image ||
            !req?.body?.certificate_image?.length === 0) &&
          (!req.files["new_certificate_image"] ||
            req.files["new_certificate_image"].length === 0)
        ) {
          return sendErrorResponse(
            res,
            415,
            "Supplier Certificate image is required."
          );
        }

        const supplierCountryCode = req.body.supplier_mobile_no.split(" ")[0];
        const supplier_mobile_number = req.body.supplier_mobile_no
          .split(" ")
          .slice(1)
          .join(" ");
        const person_mob_no = req.body.contact_person_mobile
          .split(" ")
          .slice(1)
          .join(" ");
        const personCountryCode = req.body.contact_person_mobile.split(" ")[0];

        const newSupplierImage = req.files["new_supplier_image"].map((file) =>
          path.basename(file.path)
        );
        const updatedSupplierImage = [
          ...newSupplierImage,
          ...req?.body?.supplier_image,
        ];

        const newLicenseImage = req.files["new_license_image"].map((file) =>
          path.basename(file.path)
        );
        const updatedLicenseImage = [
          ...newLicenseImage,
          ...req?.body?.license_image,
        ];

        const newTaxImage = req.files["new_tax_image"].map((file) =>
          path.basename(file.path)
        );
        const updatedTaxImages = [...newTaxImage, ...req?.body?.tax_image];

        const newCertificateImage = req.files["new_certificate_image"].map(
          (file) => path.basename(file.path)
        );
        const updatedCertificateImage = [
          ...newCertificateImage,
          ...req?.body?.certificate_image,
        ];

        regObj = {
          ...req.body,
          supplier_mobile: supplier_mobile_number,
          supplier_country_code: supplierCountryCode,
          contact_person_mobile_no: person_mob_no,
          contact_person_country_code: personCountryCode,
          supplier_image: updatedSupplierImage,
          license_image: updatedLicenseImage,
          tax_image: updatedTaxImages,
          certificate_image: updatedCertificateImage,
        };

        const errObj = validation(regObj, "supplierRegister");

        if (Object.values(errObj).length) {
          return sendErrorResponse(res, 419, "All fields are required", errObj);
        }
      }

      // Use req.body directly instead of stringifying it
      const {
        buyer_mobile,
        buyer_email,
        buyer_type,
        buyer_name,
        buyer_address,
        contact_person_name,
        designation,
        contact_person_email,
        contact_person_mobile,
        country_of_origin,
        country_of_operation,
        approx_yearly_purchase_value,
        interested_in,
        license_no,
        license_expiry_date,
        tax_no,
        registration_no,
        description,
        vat_reg_no,
      } = req.body;

      let user;
      if (user_type === "Buyer") {
        user = await Buyer?.findById(id)?.select(
          "-__v -_id -createdAt -updatedAt -password -toekn -otp -profile_status -account_status"
        );
      } else if (user_type === "Supplier") {
        user = await Supplier?.findById(id)?.select(
          "-__v -_id -createdAt -updatedAt -password -toekn -otp -profile_status -account_status"
        );
      }
      // If the user is not found, return an error response
      if (!user) {
        return sendErrorResponse(res, 400, "Failed fetching profile details.");
      }

      // Generate unique notification ID and user ID
      const notificationId = "NOT-" + Math.random().toString(16).slice(2, 10);
      const userId =
        user_type === "Buyer"
          ? user?.buyer_id
          : user_type === "Supplier" && user?.supplier_id;

      const newSupplierReq = new Supplier({
        supplier_id: userId,
        supplierId: user?._id,
        supplier_type: regObj.supplier_type,
        supplier_name: regObj.supplier_name,
        supplier_address: regObj.supplier_address,
        description: regObj.description,
        supplier_email: regObj.supplier_email,
        supplier_mobile: regObj.supplier_mobile,
        supplier_country_code: regObj.supplier_country_code,
        license_no: regObj.license_no,
        license_expiry_date: regObj.license_expiry_date,
        tax_no: regObj.tax_no,
        country_of_origin: regObj.country_of_origin,
        country_of_operation: regObj.country_of_operation,
        contact_person_name: regObj.contact_person_name,
        designation: regObj.designation,
        contact_person_mobile_no: regObj.contact_person_mobile_no,
        contact_person_country_code: regObj.contact_person_country_code,
        contact_person_email: regObj.contact_person_email,
        supplier_image: regObj.supplier_image,
        license_image: regObj.license_image,
        certificate_image: regObj.certificate_image,
        tax_image: regObj.tax_image,
        payment_terms: regObj.payment_terms,
        estimated_delivery_time: regObj.estimated_delivery_time,
        tags: regObj.tags,
        registration_no: regObj.registration_no,
        vat_reg_no: regObj.vat_reg_no,
      });

      const newBuyerReq = new BuyerProfileEdit({
        buyer_id: userId,
        buyerId: user?._id,
        buyer_type: regObj?.buyer_type,
        buyer_name: regObj?.buyer_name,
        buyer_address: regObj?.buyer_address,
        buyer_email: regObj?.buyer_email,
        buyer_mobile: regObj?.buyer_mobile,
        buyer_country_code: regObj?.buyer_country_code,
        contact_person_name: regObj?.contact_person_name,
        contact_person_email: regObj?.contact_person_email,
        contact_person_mobile: regObj?.contact_person_mobile,
        contact_person_country_code: regObj?.contact_person_country_code,
        country_of_origin: regObj?.country_of_origin,
        country_of_operation: regObj?.country_of_operation,
        approx_yearly_purchase_value: regObj?.approx_yearly_purchase_value,
        interested_in: regObj?.interested_in,
        license_no: regObj?.license_no,
        license_expiry_date: regObj?.license_expiry_date,
        tax_no: regObj?.tax_no,
        registration_no: regObj?.registration_no,
        description: regObj?.description,
        buyer_image: regObj?.buyer_image,
        designation: regObj?.designation,
        tax_image: regObj?.tax_image,
        license_image: regObj?.license_image,
        certificate_image: regObj?.certificate_image,
        vat_reg_no: regObj?.vat_reg_no,
      });

      let newProfileEditRequest;
      if (user_type === "Buyer") {
        newProfileEditRequest = await newBuyerReq.save();
      } else if (user_type === "Supplier") {
        newProfileEditRequest = await newSupplierReq.save();
      }

      // If the newProfileEditRequest is not found, return an error response
      if (!newProfileEditRequest) {
        return sendErrorResponse(
          res,
          400,
          "Failed creating your profile update request."
        );
      }

      let updatedUser;
      if (user_type === "Buyer") {
        updatedUser = await Buyer?.findByIdAndUpdate(
          user?._id,
          { profile_status: 0 },
          { new: true }
        );
      } else if (user_type === "Supplier") {
        updatedUser = await Supplier?.findByIdAndUpdate(
          user?._id,
          { profile_status: 0 },
          { new: true }
        );
      }
      // If the updatedUser is not found, return an error response
      if (!updatedUser) {
        return sendErrorResponse(
          res,
          400,
          "Failed updating request status in your profile"
        );
      }

      // save a new notification
      const newNotification = new Notification({
        notification_id: notificationId,
        event_type: `${user_type} profile request`,
        event: user_type?.toLoweeCase() + "prolieupdaterequest",
        from: "buyer",
        to: "admin",
        from_id: userId,
        event_id: userId,
        message: `${user_type} Profile Update Request`,
        status: 0,
      });

      const savedNotification = await newNotification.save();

      // If the savedNotification is not saved, return an error response
      if (!savedNotification) {
        return sendErrorResponse(
          res,
          400,
          "Failed creating notification for admin to edit profile"
        );
      }

      // send email to the admin
      const adminEmail = "ajo@shunyaekai.tech";
      const subject = "New Registration Alert: Buyer Account Created";
      const recipientEmails = [adminEmail, "shivani.shunyaekai@gmail.com"];
      const emailContent = await profileEditRequestContent(
        newProfileEditRequest
      );
      await sendEmail(recipientEmails, subject, emailContent);

      // Success response
      return sendSuccessResponse(
        res,
        200,
        "Profile update request has been sent to the admin."
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

  // Helper functions
  updateProfileDetails: async (
    user,
    userType,
    name,
    email,
    phone,
    address,
    hashedPassword
  ) => {
    const userCountryCode = phone.split(" ")[0];
    const userMobileNumber = phone.split(" ").slice(1).join(" ");

    const updateData = {
      nameField: userType === "Buyer" ? "buyer_name" : "supplier_name",
      emailField: userType === "Buyer" ? "buyer_email" : "supplier_email",
      mobileField: userType === "Buyer" ? "buyer_mobile" : "supplier_mobile",
      countryCodeField:
        userType === "Buyer" ? "buyer_country_code" : "supplier_country_code",
      addressField: userType === "Buyer" ? "buyer_address" : "supplier_address",
    };

    const updateProfile = await (userType === "Buyer"
      ? Buyer
      : Supplier
    )?.findByIdAndUpdate(
      user?._id,
      {
        $set: {
          [updateData.nameField]: name,
          [updateData.emailField]: email,
          [updateData.mobileField]: userMobileNumber,
          [updateData.countryCodeField]: userCountryCode,
          ...(hashedPassword && { password: hashedPassword }), // Update password if hashedPassword is provided
        },
      },
      { new: true }
    );

    return updateProfile;
  },

  sendProfileEditRequest: async (user, userType, address) => {
    const ProfileEdit =
      userType === "Buyer" ? BuyerProfileEdit : SupplierProfileEdit;
    const profileReq = new ProfileEdit({
      [`${userType.toLowerCase()}_id`]: user?.[`${userType.toLowerCase()}_id`],
      [`${userType.toLowerCase()}_address`]: address,
      userId: user?._id,
      editReqStatus: "pendinig",
    });

    return await profileReq.save();
  },

  checkPasswords: async (oldPassword, newPassword, user) => {
    const isOldPwdMatch = await bcrypt.compare(
      oldPassword?.trim(),
      user?.password
    );
    if (!isOldPwdMatch) {
      return { valid: false, message: "Old password is not correct." };
    }

    const isNewPwdSameAsOld = await bcrypt.compare(
      newPassword?.trim(),
      user?.password
    );
    if (isNewPwdSameAsOld) {
      return {
        valid: false,
        message: "New password cannot be the same as old password.",
      };
    }

    return { valid: true };
  },

  // Main function
  updateProfileAndSendEditRequest: async (req, res) => {
    try {
      const { id } = req?.params;
      const { user_type } = req?.headers;
      const { newPassword, oldPassword, name, email, phone, address } =
        req?.body;
      const isPasswordUpdate = newPassword?.trim();

      let user;
      if (user_type === "Buyer") {
        user = await Buyer?.findById(id);
      } else if (user_type === "Supplier") {
        user = await Supplier?.findById(id);
      } else if (user_type === "Admin") {
        user = await Admin?.findById(id);
      }

      if (!user) {
        return sendErrorResponse(res, 400, "Profile not found.");
      }

      const { valid, message } = isPasswordUpdate
        ? await checkPasswords(oldPassword, newPassword, user)
        : { valid: true };
      if (!valid) return sendErrorResponse(res, 400, message);

      const saltRounds = 10;
      const hashedPassword = isPasswordUpdate
        ? await bcrypt.hash(newPassword?.trim(), saltRounds)
        : null;

      const userCountryCode = phone.split(" ")[0];
      const userMobileNumber = phone.split(" ").slice(1).join(" ");

      const changePersonalDetails =
        user_type === "Buyer"
          ? user?.buyer_name !== name ||
            user?.buyer_email !== email ||
            user?.buyer_country_code !== userCountryCode ||
            user?.buyer_mobile !== userMobileNumber
          : user?.supplier_name !== name ||
            user?.supplier_email !== email ||
            user?.supplier_country_code !== userCountryCode ||
            user?.supplier_mobile !== userMobileNumber;

      const sendRequestToAdmin =
        user_type === "Buyer"
          ? user?.buyer_address !== address
          : user?.supplier_address !== address;

      if (changePersonalDetails && sendRequestToAdmin) {
        const updateProfile = await updateProfileDetails(
          user,
          user_type,
          name,
          email,
          phone,
          address,
          hashedPassword
        );
        if (!updateProfile) {
          return sendErrorResponse(
            res,
            400,
            "Failed to update profile details."
          );
        }

        const newProfileEditReq = await sendProfileEditRequest(
          user,
          user_type,
          address
        );
        if (!newProfileEditReq) {
          return sendSuccessResponse(
            res,
            206,
            "Profile details updated, but failed to send address update request to Admin.",
            updateProfile
          );
        }

        return sendSuccessResponse(
          res,
          200,
          "Profile details updated, also send address update request to Admin.",
          updateProfile
        );
      }

      if (changePersonalDetails && !sendRequestToAdmin) {
        const updateProfile = await updateProfileDetails(
          user,
          user_type,
          name,
          email,
          phone,
          address,
          hashedPassword
        );
        if (!updateProfile) {
          return sendErrorResponse(
            res,
            400,
            "Failed to update profile details."
          );
        }

        return sendSuccessResponse(res, 200, "Profile details updated.");
      }

      if (!changePersonalDetails && sendRequestToAdmin) {
        const newProfileEditReq = await sendProfileEditRequest(
          user,
          user_type,
          address
        );
        return sendSuccessResponse(
          res,
          200,
          "Sent address update request to Admin."
        );
      }
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
