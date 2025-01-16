require("dotenv").config();
const jwt = require("jsonwebtoken");
const Buyer = require("../schema/buyerSchema");
const User = require("../schema/userSchema");
const Seller = require("../schema/sellerSchema");
const Supplier = require("../schema/supplierSchema");
const Admin = require("../schema/adminSchema");
const LogisticsPartner = require('../schema/logisticsCompanySchema');
const logErrorToFile = require("../logs/errorLogs");
const { sendErrorResponse } = require("../utils/commonResonse");

module.exports = {
  checkAuthorization: async (req, res, next) => {
    try {
      let token = req.headers.authorization;

      if (!token) {
        res.status(401).send({ message: "Auth Token is Missing" });
      } else {
        if (token != process.env.Authorization) {
          res.status(400).send({ message: "Invalid Auth Token" });
        } else {
          next();
        }
      }
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  checkAuthentication: async (req, res, next) => {
    /// For Admin
    let access_token = req.headers.access_token;
    try {
      if (!access_token) {
        res.status(401).send({ message: "Access Token is Missing" });
      } else {
        const verified = jwt.verify(access_token, process.env.APP_SECRET);
        if (verified) {
          console.log("verified");
          next();
        } else {
          // Access Denied
          res.status(400).send({ message: "Invalid Access Token" });
        }
      }
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  checkAdminAuthentication: async (req, res, next) => {
    let access_token = req.headers.access_token;
    const admin_id = req.body.admin_id;

    try {
      const admin = await Admin.findOne({
        token: access_token,
        admin_id: admin_id,
      });

      if (!admin) {
        return res.status(400).send({ message: "Invalid Access Token" });
      }

      if (admin.status === 0) {
        return res.status(400).send({ message: "Access Denied" });
      }

      next();
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  checkUserAuthentication: async (req, res, next) => {
    let access_token = req.headers.access_token;
    const user_id = req.body.user_id;

    try {
      const user = await User.findOne({
        token: access_token,
        user_id: user_id,
      });

      if (!user) {
        return res.status(400).send({ message: "Invalid Access Token" });
      }

      if (user.status === 0) {
        return res.status(400).send({ message: "Access Denied" });
      }

      next();
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },
  //this is working fine
  checkBuyerAuthentication: async (req, res, next) => {
    const access_token = req.headers.access_token;
    const buyer_id = req.body.buyer_id;
    try {
      const buyer = await Buyer.findOne({ token: access_token });

      if (!buyer) {
        return res.status(400).send({ message: "Invalid Access Token" });
      }

      if (buyer.status === 0) {
        return res.status(400).send({ message: "Access Denied" });
      }

      next();
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  checkSupplierAuthentication: async (req, res, next) => {
    const access_token = req.headers.access_token;
    const supplier_id = req.body.supplier_id;

    try {
      const supplier = await Supplier.findOne({ token: access_token });

      if (!supplier) {
        return res.status(400).send({ message: "Invalid Access Token" });
      }

      if (supplier.status === 0) {
        return res.status(400).send({ message: "Access Denied" });
      }

      next();
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  checkSellerAuthentication: async (req, res, next) => {
    const access_token = req.headers.access_token;
    const seller_id = req.body.seller_id;

    try {
      const seller = await Seller.find({
        token: access_token,
        seller_id: seller_id,
      });

      if (!seller) {
        return res.status(400).send({ message: "Invalid Access Token" });
      }

      if (seller.status === 0) {
        return res.status(400).send({ message: "Access Denied" });
      }

      next();
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  commonAuthentication: async (req, res, next) => {
    const access_token = req.headers.access_token;
    const buyer_id = req.headers.buyer_id;
    const supplier_id = req.headers.supplier_id;

    try {
      if (buyer_id) {
        const buyer = await Buyer.findOne({ token: access_token });
        if (!buyer) {
          return res.status(400).send({ message: "Invalid Access Token" });
        }

        if (buyer.account_status === 0) {
          return res.status(400).send({ message: "Access Denied" });
        }
        next();
      } else if (supplier_id) {
        lo
        const supplier = await Supplier.findOne({ token: access_token });

        if (!supplier) {
          return res.status(400).send({ message: "Invalid Access Token" });
        }

        if (supplier.account_status === 0) {
          return res.status(400).send({ message: "Access Denied" });
        }
        next();
      } else {
        return res.status(404).send({ message: "Invalid Access" });
      }
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  checkCommonUserAuthentication: async (req, res, next) => {
    const { access_token, user_type,  supplier_id, seller_id, buyer_id, client_id } = req.headers;
    // const { supplier_id, seller_id, admin_id, buyer_id, supplierId } = req.body;
    
    const admin_id = req.headers?.admin_id ||req?.body?.admin_id
    
    // Log to check if the access token and user type are correct
    // console.log('Access Token:', access_token);
    // console.log('User Type:', user_type);

    try {
      let user = null;
  
      if (user_type === "Buyer") {
        user = await Buyer.findOne({ token: access_token });
      } else if (user_type === "Admin") {
        user = await Admin.findOne({ token: access_token, admin_id });
      } else if (user_type === "Supplier") {
        user = await Supplier.findOne({ token: access_token });
      } else if (user_type === "Logistics") {
        user = await LogisticsPartner.findOne({ token: access_token });
      }
      
      if (!user) {
        // console.log('User not found with the provided access token');
        return res.status(400).send({ message: "Invalid Access Token" });
      }
  
      if (user.status === 0) {
        // console.log('User is disabled (status = 0)');
        return res.status(400).send({ message: "Access Denied" });
      }
  
      next();
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },
};
