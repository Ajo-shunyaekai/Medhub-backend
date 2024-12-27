require("dotenv").config();
const jwt = require("jsonwebtoken");
const Buyer = require("../schema/buyerSchema");
const User = require("../schema/userSchema");
const Seller = require("../schema/sellerSchema");
const Supplier = require("../schema/supplierSchema");
const Admin = require("../schema/adminSchema");

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
      res
        .status(500)
        .send({ message: "Internal server error for checkAuthorization" });
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
      res
        .status(500)
        .send({ message: "Internal server error for checkAuthentication" });
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
      console.error("Error checking access token:", error);
      return res.status(500).send({ message: "Internal Server Error" });
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
      console.error("Error checking access token:", error);
      return res.status(500).send({ message: "Internal Server Error" });
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
      console.error("Error checking access token:", error);
      return res.status(500).send({ message: "Internal Server Error" });
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
      console.error("Error checking access token:", error);
      return res.status(500).send({ message: "Internal Server Error" });
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
      console.error("Error checking access token:", error);
      return res.status(500).send({ message: "Internal Server Error" });
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
      console.error("Error checking access token:", error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },

  checkCommonUserAuthentication: async (req, res, next) => {
    // console.log('checkCommonUserAuthentication', req.headers.user_type,req.headers.supplier_id );
    
    const { access_token, user_type } = req.headers;
    const { supplier_id, seller_id, admin_id, buyer_id,supplierId } = Object.keys(req.body).length > 0 ? req.body : req.headers;
    // console.log('req?.body', req.body);
    console.log('access_token', access_token);
    try {
      const user =
        user_type == "Buyer"
          ? await Buyer.findOne({ token: access_token })
          : user_type == "Admin"
          ? await Admin.findOne({ token: access_token, admin_id })
          : user_type == "Supplier"
          ? await Supplier.findOne({ token: access_token })
          : user_type == "Seller"
          ? await Seller.find({ token: access_token, seller_id })
          : null;
          
      if (!user) {
        console.log('!user', user);
        return res.status(400).send({ message: "Invalid Access Token" });
      }

      if (user.status === 0) {
        console.log('user.status === 0', user);
        return res.status(400).send({ message: "Access Denied" });
      }

      next();
    } catch (error) {
      console.error("Error checking access token:", error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  },
};
