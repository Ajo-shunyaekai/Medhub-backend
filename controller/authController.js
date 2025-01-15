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
} = require("../utils/emailContents");
const { sendErrorResponse, sendSuccessResponse } = require("../utils/commonResonse");

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
          return sendErrorResponse(res, 415, "Company license image is required.");
        }
        if (
          !req.files["certificate_image"] ||
          req.files["certificate_image"].length === 0
        ) {
          return sendErrorResponse(res, 415, "Company certificate image is required.");
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
          return sendErrorResponse(res, 419, "All fields are required.", errObj);
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
          return sendErrorResponse(res, 415, "Supplier license image is required.");
        }

        if (
          !req.files["certificate_image"] ||
          req.files["certificate_image"].length === 0
        ) {
          return sendErrorResponse(res, 415, "Supplier Certificate image is required.");
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
          ? await Buyer.findOne({ contact_person_email: regObj?.contact_person_email })
          : user_type === "Admin"
          ? await Admin.findOne({ email: req.body?.email })
          : user_type === "Supplier"
          ? await Supplier.findOne({ contact_person_email: req.body?.contact_person_email })
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
        token: token,
        account_status: 0,
        profile_status: 0,
      });

      // Hash password
      const hashedPassword = await bcrypt.genSalt(saltRounds);
      if (!hashedPassword) {
        return sendErrorResponse(res, 400, "Error in generating salt or hashing password");
      }

      // If user type is "Buyer", save buyer details and send response
      if (user_type === "Buyer") {
        const buyer = await newBuyer.save();

        if (!buyer) {
          return sendErrorResponse(res, 400, "Error While Submitting Buyer Registration Request");
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

        return sendSuccessResponse(res, 200, `Buyer Registration Request Submitted Successfully.`);
      }

      // If user type is "Admin", save admin and return response
      else if (user_type === "Admin") {
        newAdmin.password = hashedPassword;
        const admin = await newAdmin.save();
        if (!admin) {
          return sendErrorResponse(res, 400, "Error While Submitting Admin Registration Request");
        }
        return sendSuccessResponse(res, 200, `Admin Registration Request Successfully.`);
      }

      // If user type is "Supplier", save supplier and send response
      else if (user_type === "Supplier") {
        const supplier = await newSupplier.save();
        if (!supplier) {
          return sendErrorResponse(res, 400, "Error While Submitting Supplier Registration Request");
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

        return sendSuccessResponse(res, 200, `Supplier Registration Request Submitted Successfully.`);
      }

      // Additional handling for other user types (Seller) would go here
    } catch (error) {
      console.log("Internal Server Error:", error);
      return sendErrorResponse(res, 500, "Internal Server Error", error);
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
        return sendErrorResponse(res, 400, "User not found.");
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

      return sendSuccessResponse(res, 200, `${user_type} Login Successful.`, user2);
    } catch (error) {
      console.log("Internal Server Error:", error);
      return sendErrorResponse(res, 500, "Internal Server Error", error);
    }
  },

  // editLoggedinUserProfile : async (reqObj, callback) => {
  //   try {
  //     const { admin_id, user_name, email } = reqObj

  //     const admin = await Admin.findOne({admin_id : admin_id})

  //     if(!admin) {
  //       callback({code: 404, message : 'User not found'})
  //     }

  //     const updateProfile = await Admin.findOneAndUpdate({admin_id : admin_id},  { user_name: user_name, email: email }, {new: true})

  //     if(updateProfile) {
  //       callback({code: 200, message: 'Profile Updated Successfully', result: updateProfile})
  //     } else {
  //       callback({code: 400, message: 'Error while updating profile details', result: updateProfile})
  //     }
  //   } catch (error) {
  //     console.log("error", error)
  //     callback({code: 500, message: 'Internal Server Error', result: error})
  //   }
  // },

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
      return sendErrorResponse(res, 500, "Internal Server Error", error);
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
        return sendErrorResponse(res, 400, "Email not registered. Please provide a registered address.");
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
              otpExpiry: tenMinutesAhead,
            },
          },
          { new: true }
        );
      }

      // If the update fails, return an error
      if (!updatedUser) {
        return sendErrorResponse(res, 400, "Error verifying email and generating OTP.");
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
      return sendSuccessResponse(res, 200, "Mail sent to the registered email.");
    } catch (error) {
      console.log("Internal Server Error:", error);
      return sendErrorResponse(res, 500, "Internal Server Error", error);
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
        return sendErrorResponse(res, 400, "Email not registered. Please provide a registered address.");
      }

      // Check if OTP matches and if it's still valid (hasn't expired)
      const currentDate = new Date();

      if (user.otp !== otp) {
        return sendErrorResponse(res, 400, "Invalid OTP");
      }
      if (user.otpExpiry < currentDate) {
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
        return sendErrorResponse(res, 400, "Error unsetting OTP and OTP expiry.");
      }

      // Success response
      return sendSuccessResponse(res, 200, "OTP verified successfully.");
    } catch (error) {
      console.log("Internal Server Error:", error);
      return sendErrorResponse(res, 500, "Internal Server Error", error);
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
        return sendErrorResponse(res, 400, "Email not registered. Please provide a registered address.");
      }

      // Check if the new password matches the old password
      const isMatch = await bcrypt.compare(password, user?.password);
      if (isMatch) {
        return sendErrorResponse(res, 400, "New password cannot be the same as old password.");
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
      return sendSuccessResponse(res, 200, "Password has been successfully updated.");
    } catch (error) {
      console.log("Internal Server Error:", error);
      return sendErrorResponse(res, 500, "Internal Server Error", error);
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
        return sendErrorResponse(res, 400, "Email not registered. Please provide a registered address.");
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
        return sendErrorResponse(res, 400, "New password cannot be the same as old password.");
      }

      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

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
      return sendSuccessResponse(res, 200, "Password has been successfully updated.");
    } catch (error) {
      console.log("Internal Server Error:", error);
      return sendErrorResponse(res, 500, "Internal Server Error", error);
    }
  },
};
