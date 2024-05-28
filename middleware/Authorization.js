require('dotenv').config();
const jwt      = require('jsonwebtoken'); 
const Buyer    = require('../schema/buyerSchema');
const User     = require('../schema/userSchema');
const Seller   = require('../schema/sellerSchema')
const Supplier = require('../schema/supplierSchema')


module.exports = {
    checkAuthorization : async (req, res, next) => {
        try {
            let token  = req.headers.authorization;

            if(!token){
                res.status(401).send({ message : "Auth Token is Missing"});
            } else {
                if(token != process.env.Authorization){
                    res.status(400).send({ message : "Invalid Auth Token"});
                } else {
                    next();
                }
            }
        } catch (error) {
            res.status(500).send({ message : "Internal server error for checkAuthorization"});
        }
    },

    checkAuthentication : async (req, res, next) => {  /// For Admin 
        let access_token = req.headers.access_token;
        try {
            if(!access_token){
                res.status(401).send({ message : "Access Token is Missing"});
    
            } else { 
                const verified = jwt.verify(access_token, process.env.APP_SECRET); 
                if(verified){ 
                    console.log('verified');
                    next();
                } else { 
                    // Access Denied 
                    res.status(400).send({ message : "Invalid Access Token"});
                } 
            }
        } catch (error) {
            res.status(500).send({ message : "Internal server error for checkAuthentication"});
        }
    },

    checkUserAuthentication : async (req, res, next) => {
        let access_token = req.headers.access_token;
        const  user_id   = req.body.user_id;

        try {
            const user = await User.findOne({token: access_token, user_id: user_id});
           
            if (!user) {
                return res.status(400).send({ message: "Invalid Access Token" });
            }
    
            if (user.status === 0) {
                return res.status(400).send({ message: "Access Denied" });
            }

            next();
    
        } catch (error) {
            console.error('Error checking access token:', error);
            return res.status(500).send({ message: "Internal Server Error" });
        }
    },

    //this is working fine
    checkBuyerAuthentication : async (req, res, next) => {
        const access_token  = req.headers.access_token;
        const buyer_id      = req.body.buyer_id;

        try {
            const buyer = await Buyer.findOne({token: access_token, buyer_id: buyer_id});

            if (!buyer) {
                return res.status(400).send({ message: "Invalid Access Token" });
            }

            if (buyer.status === 0) {
                return res.status(400).send({ message: "Access Denied" });
            }
            
            next();

        } catch (error) {
            console.error('Error checking access token:', error);
            return res.status(500).send({ message: "Internal Server Error" });
        }
    },

    checkSellerAuthentication : async (req, res, next) => {
        const access_token  = req.headers.access_token;
        const seller_id     = req.body.seller_id;

        try {
            const seller = await Seller.find({token: access_token, seller_id : seller_id });

            if (!seller) {
                return res.status(400).send({ message: "Invalid Access Token" });
            }

            if (seller.status === 0) {
                return res.status(400).send({ message: "Access Denied" });
            }

            next();

        } catch (error) {
            console.error('Error checking access token:', error);
            return res.status(500).send({ message: "Internal Server Error" });
        }
    },

    checkSupplierAuthentication : async (req, res, next) => {
        const access_token  = req.headers.access_token;
        const supplier_id   = req.body.supplier_id;

        try {
            const supplier = await Supplier.find({token: access_token, supplier_id : supplier_id });

            if (!supplier) {
                return res.status(400).send({ message: "Invalid Access Token" });
            }

            if (supplier.status === 0) {
                return res.status(400).send({ message: "Access Denied" });
            }

            next();

        } catch (error) {
            console.error('Error checking access token:', error);
            return res.status(500).send({ message: "Internal Server Error" });
        }
    },
}