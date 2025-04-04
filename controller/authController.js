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
const LogisticsPartner   = require('../schema/logisticsCompanySchema')
const Logistics = require('../schema/logisticsSchema');
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
const ProfileEditRequest = require("../schema/profileEditRequestSchema");
const { validation } = require("../utils/utilities");
const path = require("path");
const sendMailFunc = require("../utils/sendEmail");
const {sendEmail, sendTemplateEmail} = require("../utils/emailService");
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
  userRegistrationConfirmationContent,
} = require("../utils/emailContents");
const {
  sendErrorResponse,
  sendSuccessResponse,
  handleCatchBlockError,
} = require("../utils/commonResonse");
const logErrorToFile = require("../logs/errorLogs");

module.exports = {
  registerUser: async (req, res) => {
    try {
      // const { accesstoken, usertype } = req.headers;
      const { usertype } = req.body;

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
        sales_person_name,
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
        land_mark,
        locality,
        city,
        state,
        country,
        pincode,
        activity_code,
        bank_details,
      } = req.body;

      let regObj = {};

      if (!usertype) {
        return sendErrorResponse(res, 400, "Need User Type.");
      }

      if (usertype === "Buyer") {
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
        if (
          req?.body?.buyer_type == "Medical Practitioner" &&
          (!req.files["medical_practitioner_image"] ||
            req.files["medical_practitioner_image"].length === 0)
        ) {
          return sendErrorResponse(
            res,
            415,
            "Medical Practitioner Certificate image is required."
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
          sales_person_name,
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
          activity_code,
          land_mark,
          buyer_mobile: buyer_mobile_number,
          buyer_country_code: buyerCountryCode,
          activity_code,
          bank_details,
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
          medical_certificate:
            req?.files?.["medical_practitioner_image"]?.map((file) =>
              path.basename(file.path)
            ) || [],
          registeredAddress: {
            full_name: contact_person_name || "",
            mobile_number: person_mob_no || "",
            country_code: personCountryCode || "",
            company_reg_address: buyer_address || "",
            locality: locality || "",
            land_mark: land_mark || "",
            city: city || "",
            state: state || "",
            country: country || "",
            pincode: pincode || "",
          },
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
      } else if (usertype === "Supplier") {
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
        if (
          req?.body?.supplier_type == "Medical Practitioner" &&
          (!req.files["medical_practitioner_image"] ||
            req.files["medical_practitioner_image"].length === 0)
        ) {
          return sendErrorResponse(
            res,
            415,
            "Medical Practitioner Certificate image is required."
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
          activity_code,
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
          medical_certificate:
            req?.files?.["medical_practitioner_image"]?.map((file) =>
              path.basename(file.path)
            ) || [],
          registeredAddress: {
            full_name: contact_person_email || "",
            mobile_number: person_mob_no || "",
            country_code: personCountryCode || "",
            company_reg_address: req.body.supplier_address || "",
            locality: locality || "",
            land_mark: land_mark || "",
            city: city || "",
            state: state || "",
            country: country || "",
            pincode: pincode || "",
          },
        };

        const errObj = validation(regObj, "supplierRegister");

        if (Object.values(errObj).length) {
          return sendErrorResponse(res, 419, "All fields are required", errObj);
        }
      }

      // Check for email existence based on user type
      const emailExists =
        usertype === "Buyer"
          ? await Buyer.findOne({
              contact_person_email: regObj?.contact_person_email,
            })
          : usertype === "Admin"
          ? await Admin.findOne({ email: req.body?.email })
          : usertype === "Supplier"
          ? await Supplier.findOne({
              contact_person_email: req.body?.contact_person_email,
            })
          : usertype === "Seller"
          ? await Seller.findOne({ email: req.body?.email })
          : null;

      if (emailExists) {
        return sendErrorResponse(res, 409, "Email already exists");
      }

      // Generate unique notification ID and user ID
      const notificationId = "NOT-" + Math.random().toString(16).slice(2, 10);
      const userId = `${
        usertype === "Buyer"
          ? "BYR-"
          : usertype === "Admin"
          ? "ADM-"
          : usertype === "Supplier"
          ? "SUP-"
          : usertype === "Seller"
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
        medical_practitioner_image: regObj?.medical_practitioner_image,
        activity_code: regObj?.activity_code,
        registeredAddress: regObj.registeredAddress,
        tax_no: regObj.tax_no,
        // registration_no             : regobj.registration_no,
        country_of_origin: regObj.country_of_origin,
        country_of_operation: regObj.country_of_operation,
        contact_person_name: regObj.contact_person_name,
        designation: regObj.designation,
        contact_person_mobile_no: regObj.contact_person_mobile_no,
        contact_person_country_code: regObj.contact_person_country_code,
        contact_person_email: regObj.contact_person_email,
        sales_person_name: regObj.sales_person_name,
        supplier_image: regObj.supplier_image,
        license_image: regObj.license_image,
        certificate_image: regObj.certificate_image,
        medical_certificate: regObj.medical_certificate,
        tax_image: regObj.tax_image,
        payment_terms: regObj.payment_terms,
        estimated_delivery_time: regObj.estimated_delivery_time,
        tags: regObj.tags,
        registration_no: regObj.registration_no,
        vat_reg_no: regObj.vat_reg_no,
        activity_code: regObj.activity_code,
        bank_details: regObj.bank_details,
        registeredAddress: regObj.registeredAddress,
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
        sales_person_name: regObj.sales_person_name,
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
        medical_certificate: regObj.medical_certificate,
        vat_reg_no: regObj?.vat_reg_no,
        activity_code: regObj.activity_code,
        registeredAddress: regObj.registeredAddress,
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
      if (usertype === "Buyer") {
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
        const adminEmail = "platform@medhub.global";
        const subject = "New Registration Alert: Buyer Account Created";

        const recipientEmails = [adminEmail];
        const emailContent = await buyerRegistrationContent(buyer);
        // await sendMailFunc(recipientEmails.join(","), subject, emailContent);
        await sendEmail(recipientEmails, subject, emailContent);

        const confirmationEmailRecipients = [
          buyer.contact_person_email,
        ];
        const confirmationSubject =
          "Thank You for Registering on Medhub Global!";
        const confirmationContent = await userRegistrationConfirmationContent(
          buyer,
          usertype
        );

        //start -> for using ejs template
        const templateName = "thankYou";
        const context = {};
        //end -> for using ejs template

        // await sendEmail(
        //   confirmationEmailRecipients,
        //   confirmationSubject,
        //   confirmationContent,
        // );
         await sendTemplateEmail(
          confirmationEmailRecipients,
          confirmationSubject,
          templateName,
          context
        )

        return sendSuccessResponse(
          res,
          200,
          `Buyer Registration Request Submitted Successfully.`
        );
      }

      // If user type is "Admin", save admin and return response
      else if (usertype === "Admin") {
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
      else if (usertype === "Supplier") {
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
        const adminEmail = "platform@medhub.global";
        const subject = "New Registration Alert: Supplier Account Created";
        // const subject = New Registration Alert: ${usertype} Account Created;
        const recipientEmails = [adminEmail];
        const emailContent = await supplierRegistrationContent(supplier);
        // await sendMailFunc(recipientEmails.join(","), subject, emailContent);

        await sendEmail(recipientEmails, subject, emailContent);

        const confirmationEmailRecipients = [
          supplier.contact_person_email,
        ];
        const confirmationSubject =
          "Thank You for Registering on Medhub Global!";
        const confirmationContent = await userRegistrationConfirmationContent(
          supplier,
          usertype
        );
        //start -> for using ejs template
        const templateName = "thankYou";
        const context = {};
        //end -> for using ejs template
        // await sendEmail(
        //   confirmationEmailRecipients,
        //   confirmationSubject,
        //   confirmationContent
        // );

        await sendTemplateEmail(
          confirmationEmailRecipients,
          confirmationSubject,
          templateName,
          context
        )

        return sendSuccessResponse(
          res,
          200,
          `Supplier Registration Request Submitted Successfully.`
        );
      }

      // Additional handling for other user types (Seller) would go here
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  loginUser: async (req, res) => {
    try {
      const { accesstoken } = req.headers;
      const { email, password, usertype } = req.body;

      if (!usertype) {
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
        usertype === "Buyer"
          ? await Buyer.findOne({ contact_person_email: email })
          : usertype === "Admin"
          ? await Admin.findOne({ email })
          : usertype === "Supplier"
          ? await Supplier.findOne({ contact_person_email: email })
          : usertype === "Logistics"
          ? await LogisticsPartner.findOne({ email })
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
        usertype === "Buyer"
          ? await Buyer.findById(user?._id)
              .select("-password -createdAt -updatedAt -__v")
              .lean()
          : usertype === "Admin"
          ? await Admin.findById(user?._id)
              .select("-password -createdAt -updatedAt -__v")
              .lean()
          : usertype === "Supplier"
          ? await Supplier.findById(user?._id)
              .select("-password -createdAt -updatedAt -__v")
              .lean()
          : usertype === "Logistics"
          ? await LogisticsPartner.findById(user?._id)
              .select("-password -createdAt -updatedAt -__v")
              .lean()
          : null;

      if (usertype === "Buyer") {
        // Count documents in the List collection for the buyer
        const listCount = await List.countDocuments({
          buyer_id: user2.buyer_id,
        });
        user2.list_count = listCount;
      }

      return sendSuccessResponse(
        res,
        200,
        `${usertype} Login Successful.`,
        user2
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  getLoggedinUserProfileDetails: async (req, res) => {
    try {
      const { accesstoken, usertype } = req.headers;
      const { id } = req?.params;

      const user =
        usertype == "Buyer"
          ? await Buyer.findById(id)?.select(
              "-password -token -createdAt -updatedAt -__v"
            )
          : usertype == "Admin"
          ? await Admin.findById(id)?.select(
              "-password -token -createdAt -updatedAt -__v"
            )
          : usertype == "Supplier"
          ? await Supplier.findById(id)?.select(
              "-password -token -createdAt -updatedAt -__v"
            )
          : usertype == "Logistics"
          ? await LogisticsPartner.findById(id)?.select(
              "-password -token -createdAt -updatedAt -__v"
            )
          : null;

      if (!user) {
        return sendErrorResponse(res, 400, "No user Found");
      }

      return sendSuccessResponse(res, 200, "User Found.", user);
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { email, usertype } = req?.body;

      if (!email) {
        return sendErrorResponse(res, 400, "Email is required.");
      }

      let user;

      // Find the user based on their type and email
      if (usertype === "Buyer") {
        user = await Buyer?.findOne({ contact_person_email: email });
      } else if (usertype === "Supplier") {
        user = await Supplier?.findOne({ contact_person_email: email });
      } else if (usertype === "Admin") {
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

      // If the user registration is yet not confirmed by the admin, return an error response
      if (user?.account_status != 1) {
        return sendErrorResponse(
          res,
          400,
          "Registration Confirmation is still pending with the admin"
        );
      }

      // Generate a new OTP and its expiry time (10 minutes ahead)
      const otp = Math.random()?.toString()?.slice(2, 8);
      const currentDate = new Date();
      const tenMinutesAhead = new Date(currentDate.getTime() + 10 * 60 * 1000);

      let updatedUser;

      // Update the user with OTP and expiry based on their type
      if (usertype === "Buyer") {
        updatedUser = await Buyer?.findOneAndUpdate(
          { contact_person_email: email },
          {
            $set: {
              otp: otp,
              otpCount: 1,
              otpExpiry: tenMinutesAhead,
            },
          },
          { new: true }
        );
      } else if (usertype === "Supplier") {
        updatedUser = await Supplier?.findOneAndUpdate(
          { contact_person_email: email },
          {
            $set: {
              otp: otp,
              otpCount: 1,
              otpExpiry: tenMinutesAhead,
            },
          },
          { new: true }
        );
      } else if (usertype === "Admin") {
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
      // const adminEmail = "platform@medhub.global";
      const subject = "Reset Your Password - One-Time Password (OTP) Enclosed";
      const recipientEmails = [email].filter(
        (email) => email
      );

      //start -> for using ejs template
      const templateName = "forgotPassword";
      const context = {
        otp: otp,
        user_type: usertype,
      };
      //end -> for using ejs template

      // Prepare the email content
      const emailContent = await otpForResetPasswordContent(updatedUser, otp);
      // await sendEmail(recipientEmails, subject, emailContent);

      await sendTemplateEmail(
        recipientEmails,
        subject,
        templateName,
        context
      )

      // Success response
      return sendSuccessResponse(
        res,
        200,
        "Mail sent to the registered email."
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },


  verifyEmailAndResendOTP: async (req, res) => {
    try {
      const { email, usertype } = req?.body;

      if (!email) {
        return sendErrorResponse(res, 400, "Email is required.");
      }

      let user;

      // Find the user based on their type and email
      if (usertype === "Buyer") {
        user = await Buyer?.findOne({ contact_person_email: email });
      } else if (usertype === "Supplier") {
        user = await Supplier?.findOne({ contact_person_email: email });
      } else if (usertype === "Admin") {
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

      // If the user registration is yet not confirmed by the admin, return an error response
      if (user?.account_status != 1) {
        return sendErrorResponse(
          res,
          400,
          "Registration Confirmation is still pending with the admin"
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
      if (usertype === "Buyer") {
        updatedUser = await Buyer?.findOneAndUpdate(
          { contact_person_email: email },
          {
            $set: {
              otp: otp,
              otpExpiry: tenMinutesAhead,
              otpCount: user?.otpCount + 1, // Increment OTP count
            },
          },
          { new: true }
        );
      } else if (usertype === "Supplier") {
        updatedUser = await Supplier?.findOneAndUpdate(
          { contact_person_email: email },
          {
            $set: {
              otp: otp,
              otpExpiry: tenMinutesAhead,
              otpCount: user?.otpCount + 1, // Increment OTP count
            },
          },
          { new: true }
        );
      } else if (usertype === "Admin") {
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
      // const adminEmail = "platform@medhub.global";
      const subject = "Reset Your Password - One-Time Password (OTP) Enclosed";
      const recipientEmails = [email].filter(
        (email) => email
      );
      //start -> for using ejs template
        const templateName = "forgotPassword";
        const context = {
          otp: otp,
          user_type: usertype,
        };
        //end -> for using ejs template

      // Prepare the email content
      const emailContent = await otpForResetPasswordContent(updatedUser, otp);
      // await sendEmail(recipientEmails, subject, emailContent);

      await sendTemplateEmail(
        recipientEmails,
        subject,
        templateName,
        context
      )

      // Success response
      return sendSuccessResponse(
        res,
        200,
        "Mail sent to the registered email."
      );
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },

  verifyOTP: async (req, res) => {
    try {
      const { email, otp, usertype } = req?.body;

      if (!email) {
        return sendErrorResponse(res, 400, "Email is required.");
      }

      if (!otp) {
        return sendErrorResponse(res, 400, "OTP is required.");
      }

      let user;

      // Find the user based on their type and email
      if (usertype === "Buyer") {
        user = await Buyer?.findOne({ contact_person_email: email });
      } else if (usertype === "Supplier") {
        user = await Supplier?.findOne({ contact_person_email: email });
      } else if (usertype === "Admin") {
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
      if (usertype === "Buyer") {
        updatedUser = await Buyer?.findOneAndUpdate(
          { contact_person_email: email },
          {
            $unset: { otp: "", otpExpiry: "" },
          },
          { new: true }
        );
      } else if (usertype === "Supplier") {
        updatedUser = await Supplier?.findOneAndUpdate(
          { contact_person_email: email },
          {
            $unset: { otp: "", otpExpiry: "" },
          },
          { new: true }
        );
      } else if (usertype === "Admin") {
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
      handleCatchBlockError(req, res, error);
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, password, usertype } = req?.body;

      if (!email) {
        return sendErrorResponse(res, 400, "Email is required.");
      }

      if (!password) {
        return sendErrorResponse(res, 400, "Password is required.");
      }

      let user;

      // Find the user based on their type and email
      if (usertype === "Buyer") {
        user = await Buyer?.findOne({ contact_person_email: email });
      } else if (usertype === "Supplier") {
        user = await Supplier?.findOne({ contact_person_email: email });
      } else if (usertype === "Admin") {
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
      if (usertype === "Buyer") {
        updateProfile = await Buyer?.findOneAndUpdate(
          { contact_person_email: email },
          { $set: { password: hashedPassword } },
          { new: true }
        );
      } else if (usertype === "Supplier") {
        updateProfile = await Supplier?.findOneAndUpdate(
          { contact_person_email: email },
          { $set: { password: hashedPassword } },
          { new: true }
        );
      } else if (usertype === "Admin") {
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
      handleCatchBlockError(req, res, error);
    }
  },

  updatePassword: async (req, res) => {
    try {
      const { id } = req?.params;
      const { usertype } = req?.headers;
      const { newPassword, oldPassword } = req?.body;

      if (!oldPassword) {
        return sendErrorResponse(res, 400, "Old Password is required.");
      }

      if (!newPassword) {
        return sendErrorResponse(res, 400, "New Password is required.");
      }

      let user;

      // Find the user based on their type and email
      if (usertype === "Buyer") {
        user = await Buyer?.findById(id);
      } else if (usertype === "Supplier") {
        user = await Supplier?.findById(id);
      } else if (usertype === "Admin") {
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
      if (usertype === "Buyer") {
        updateProfile = await Buyer?.findOneAndUpdate(
          { $set: { password: hashedPassword } },
          { new: true }
        );
      } else if (usertype === "Supplier") {
        updateProfile = await Supplier?.findOneAndUpdate(
          { contact_person_email: email },
          { $set: { password: hashedPassword } },
          { new: true }
        );
      } else if (usertype === "Admin") {
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
      handleCatchBlockError(req, res, error);
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
    const userCountryCode = phone.split(" ")[0]?.replaceAll(" ", "");
    const userMobileNumber = phone
      .split(" ")
      .slice(1)
      .join(" ")
      ?.replaceAll(" ", "");

    // Field mappings based on user type
    const fieldMap = {
      Buyer: {
        nameField: "buyer_name",
        emailField: "buyer_email",
        mobileField: "buyer_mobile",
        countryCodeField: "buyer_country_code",
      },
      Supplier: {
        nameField: "supplier_name",
        emailField: "supplier_email",
        mobileField: "supplier_mobile",
        countryCodeField: "supplier_country_code",
      },
    };

    const updateFields = fieldMap[userType];

    if (!updateFields) {
      throw new Error("Invalid user type.");
    }

    const updateProfile = await (userType === "Buyer"
      ? Buyer
      : Supplier
    )?.findByIdAndUpdate(
      user?._id,
      {
        $set: {
          [updateFields.nameField]: name,
          [updateFields.emailField]: email,
          [updateFields.mobileField]: userMobileNumber,
          [updateFields.countryCodeField]: userCountryCode,
          ...(hashedPassword && { password: hashedPassword }), // Update password if provided
        },
      },
      { new: true }
    );

    return updateProfile;
  },

  checkAddressForChanges: (dbObj, otherObj) => {
    let newObj = {};

    // Create newObj with isChanged comparison
    for (let key in otherObj) {
      if (dbObj.hasOwnProperty(key) && otherObj.hasOwnProperty(key)) {
        newObj[key] = {
          value: otherObj[key],
          isChanged: dbObj[key] !== otherObj[key],
        };
      }
    }

    // Check if any property has isChanged set to true
    let hasChanges = Object.values(newObj).some((prop) => prop.isChanged);

    return { newObj, hasChanges };
  },

  validateEmptyFields: (obj) => {
    let errors = {};

    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Check if the value is empty (null, undefined, empty string, or other falsy values)
        if (obj[key] === null || obj[key] === undefined || obj[key] === "") {
          errors[key] = `${key} cannot be empty`;
        }
      }
    }

    // Return errors if any fields are empty, or null if no errors
    return Object.keys(errors).length > 0 ? errors : null;
  },

  sendProfileEditRequest: async (user, userType, address) => {
    // const isAddressNotValid = await this.validateEmptyFields(address);
    // if (isAddressNotValid) {
    //   return sendErrorResponse(
    //     res,
    //     400,
    //     "Failed to update profile details.",
    //     isAddressNotValid
    //   );
    // }
    const ProfileEdit =
      // userType === "Buyer" ? BuyerProfileEdit : SupplierProfileEdit;
      ProfileEditRequest;
    const profileReq = new ProfileEdit({
      registeredAddress: address,
      userId: user?._id,
      userSchemaReference: userType,
      editReqStatus: "Pendinig",
    });

    const sentRequest = await profileReq.save();
    if (!sentRequest) {
      return sendErrorResponse(
        res,
        400,
        "Failed to send address update request to Admin."
      );
    }

    const updateProfile = await (userType === "Buyer"
      ? Buyer
      : Supplier
    )?.findByIdAndUpdate(
      user?._id,
      {
        $set: {
          profile_status: 0,
        },
      },
      { new: true }
    );
    if (!updateProfile) {
      return sendErrorResponse(
        res,
        400,
        "Failed to update request status in profile"
      );
    }

    return sentRequest;
  },

  checkPasswords: async (oldPassword, newPassword, confirmPassword, user) => {
    const isOldPwdMatch = await bcrypt.compare(
      oldPassword?.trim(),
      user?.password
    );
    if (!isOldPwdMatch) {
      return { valid: false, message: "Old password is not correct." };
    }

    if (oldPassword === newPassword) {
      return {
        valid: false,
        message: "New password cannot be the same as old password.",
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        valid: false,
        message: "New password and confirm password must match.",
      };
    }

    // Add additional password strength checks here if necessary
    return { valid: true };
  },

  // Main function
  updateProfileAndSendEditRequest: async (req, res) => {
    try {
      const { id } = req?.params;
      const { usertype } = req?.headers;
      const {
        name = null, // contact person name
        email = null, // contact person email
        phone = null, // contact person phone
        newPassword = null,
        oldPassword = null,
        confirmPassword = null,
        address = {},
      } = req?.body;
      const isPasswordUpdate = newPassword?.trim();

      // check whether user exists or not
      let user;
      if (usertype === "Buyer") {
        user = await Buyer?.findById(id);
      } else if (usertype === "Supplier") {
        user = await Supplier?.findById(id);
      } else if (usertype === "Admin") {
        user = await Admin?.findById(id);
      }

      if (!user) {
        return sendErrorResponse(res, 400, "Profile not found.");
      }

      // check whether we need to update personal details or not
      const userCountryCode = phone.split(" ")[0]?.replaceAll(" ", "");
      const userMobileNumber = phone
        .split(" ")
        .slice(1)
        .join(" ")
        ?.replaceAll(" ", "");

      const changePersonalDetails =
        usertype === "Buyer"
          ? user?.contact_person_name !== name ||
            user?.contact_person_email !== email ||
            user?.contact_person_country_code !== userCountryCode ||
            user?.contact_person_mobile !== userMobileNumber ||
            isPasswordUpdate
          : user?.contact_person_name !== name ||
            user?.contact_person_email !== email ||
            user?.contact_person_country_code !== userCountryCode ||
            user?.contact_person_mobile_no !== userMobileNumber ||
            isPasswordUpdate;

      const checkPasswords = async (
        oldPassword,
        newPassword,
        confirmPassword,
        user
      ) => {
        const isOldPwdMatch = await bcrypt.compare(
          oldPassword?.trim(),
          user?.password
        );
        if (!isOldPwdMatch) {
          return { valid: false, message: "Old password is not correct." };
        }

        if (oldPassword === newPassword) {
          return {
            valid: false,
            message: "New password cannot be the same as old password.",
          };
        }

        if (newPassword !== confirmPassword) {
          return {
            valid: false,
            message: "New password and confirm password must match.",
          };
        }

        // Add additional password strength checks here if necessary
        return { valid: true };
      };

      // check whether we need to update password or not
      const { valid, message } = isPasswordUpdate
        ? await checkPasswords(oldPassword, newPassword, confirmPassword, user)
        : { valid: true };
      if (!valid) return sendErrorResponse(res, 400, message);

      const saltRounds = 10;
      const hashedPassword = isPasswordUpdate
        ? await bcrypt.hash(newPassword?.trim(), saltRounds)
        : null;

      const checkAddressForChanges = async (dbObj, otherObj) => {
        let newObj = {};

        // Create newObj with isChanged comparison
        for (let key in otherObj) {
          if (dbObj.hasOwnProperty(key) && otherObj.hasOwnProperty(key)) {
            newObj[key] = {
              value: otherObj[key],
              isChanged: dbObj[key] !== otherObj[key],
            };
          }
        }

        // Check if any property has isChanged set to true
        let hasChanges = Object.values(newObj).some((prop) => prop.isChanged);

        return { newObj, hasChanges };
      };

      // check whether we need to update billing address or not
      const changedUpdatedddress = await checkAddressForChanges(
        user?.registeredAddress,
        {
          ...address,
          type: "Registered",
        }
      );
      const sendRequestToAdmin = changedUpdatedddress.hasChanges;

      const updateProfileDetails = async (
        user,
        userType,
        name,
        email,
        phone,
        address,
        hashedPassword
      ) => {
        const userCountryCode = phone.split(" ")[0]?.replaceAll(" ", "");
        const userMobileNumber = phone
          .split(" ")
          .slice(1)
          .join(" ")
          ?.replaceAll(" ", "");

        // Field mappings based on user type
        const fieldMap = {
          Buyer: {
            nameField: "contact_person_name",
            emailField: "contact_person_email",
            mobileField: "contact_person_mobile",
            countryCodeField: "contact_person_country_code",
          },
          Supplier: {
            nameField: "contact_person_name",
            emailField: "contact_person_email",
            mobileField: "contact_person_mobile_no",
            countryCodeField: "contact_person_country_code",
          },
        };

        const updateFields = fieldMap[userType];

        if (!updateFields) {
          throw new Error("Invalid user type.");
        }

        const updateProfile = await (userType === "Buyer"
          ? Buyer
          : Supplier
        )?.findByIdAndUpdate(
          user?._id,
          {
            $set: {
              [updateFields.nameField]: name,
              [updateFields.emailField]: email,
              [updateFields.mobileField]: userMobileNumber,
              [updateFields.countryCodeField]: userCountryCode,
              ...(hashedPassword && { password: hashedPassword }), // Update password if provided
            },
          },
          { new: true }
        );

        return updateProfile;
      };

      const sendProfileEditRequest = async (user, userType, address) => {

        const perId = "PER-" + Math.random().toString(16).slice(2, 10);
        const ProfileEdit =
          // userType === "Buyer" ? BuyerProfileEdit : SupplierProfileEdit;
          ProfileEditRequest;
        const profileReq = new ProfileEdit({
          perId,
          registeredAddress: address,
          userId: user?._id,
          userSchemaReference: userType,
          // editReqStatus: "Pendinig",
        });

        const sentRequest = await profileReq.save();
        if (!sentRequest) {
          return sendErrorResponse(
            res,
            400,
            "Failed to send address update request to Admin."
          );
        }

        const updateProfile = await (userType === "Buyer"
          ? Buyer
          : Supplier
        )?.findByIdAndUpdate(
          user?._id,
          {
            $set: {
              profile_status: 0,
            },
          },
          { new: true }
        );
        if (!updateProfile) {
          return sendErrorResponse(
            res,
            400,
            "Failed to update request status in profile"
          );
        }

        return sentRequest;
      };

      if (!changePersonalDetails && !sendRequestToAdmin) {
        return sendSuccessResponse(
          res,
          200,
          "Nothing to change in your profile.",
          user
        );
      }

      if (changePersonalDetails && sendRequestToAdmin) {
        const updateProfile = await updateProfileDetails(
          user,
          usertype,
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
          usertype,
          { ...changedUpdatedddress.newObj, type: "Registered" }
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
          usertype,
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

        return sendSuccessResponse(
          res,
          200,
          "Profile details updated.",
          updateProfile
        );
      }

      if (!changePersonalDetails && sendRequestToAdmin) {
        const newProfileEditReq = await sendProfileEditRequest(
          user,
          usertype,
          { ...changedUpdatedddress.newObj, type: "Registered" }
        );
        if (!newProfileEditReq) {
          return sendErrorResponse(
            res,
            400,
            "Failed to send update profile details request."
          );
        }
        return sendSuccessResponse(
          res,
          200,
          "Sent address update request to Admin.",
          user
        );
      }
    } catch (error) {
      handleCatchBlockError(req, res, error);
    }
  },
};
