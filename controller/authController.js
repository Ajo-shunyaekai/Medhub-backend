const bcrypt             = require('bcrypt');
const jwt                = require('jsonwebtoken');
const nodemailer         = require('nodemailer');
const moment             = require('moment');
const generator          = require('generate-password');
const Admin              = require('../schema/adminSchema')
const User               = require('../schema/userSchema')
const Order              = require('../schema/orderSchema')
const Supplier           = require('../schema/supplierSchema')
const Buyer              = require('../schema/buyerSchema')
const BuyerEdit          = require('../schema/buyerEditSchema')
const SupplierEdit       = require('../schema/supplierEditSchema')
const MedicineInventory  = require('../schema/medicineInventorySchema')
const Support            = require('../schema/supportSchema')
const Notification       = require('../schema/notificationSchema')
const Enquiry            = require('../schema/enquiryListSchema')
const PurchaseOrder      = require('../schema/purchaseOrderSchema')
const Invoices           = require('../schema/invoiceSchema')
const {Medicine, SecondaryMarketMedicine, NewMedicine }            = require("../schema/medicineSchema");
const {EditMedicine, NewMedicineEdit, SecondaryMarketMedicineEdit} = require('../schema/medicineEditRequestSchema')

const generatePassword = () => {
  const password = generator.generate({
    length  : 12,
    numbers : true
  });
  return password
}

var transporter = nodemailer.createTransport({
    host   : "smtp.gmail.com",
    port   : 587,
    secure : false, // true for 465, false for other ports
    type   : "oauth2",
    // service : 'gmail',
    auth : {
        user : process.env.SMTP_USER_ID,
        pass : process.env.SMTP_USER_PASSWORD
    }
});
const sendMailFunc = (email, subject, body) =>{
    
    var mailOptions = {
        from    : process.env.SMTP_USER_ID,
        to      : email,
        subject : subject,
        // text    : 'This is text mail, and sending for testing purpose'
        html:body
        
    };
    transporter.sendMail(mailOptions);
}

module.exports = {

    // registerUser : async(reqObj, callback) => {
    //     try {
    //       const adminId    = 'ADM-' + Math.random().toString(16).slice(2, 10);
    //       let jwtSecretKey = process.env.APP_SECRET; 
    //       let data         = {  time : Date(),  email:reqObj.email } 
    //       const token      = jwt.sign(data, jwtSecretKey); 
    //       const saltRounds = 10

    //       const newAdmin = new Admin({
    //           admin_id   : adminId,
    //           user_name  : reqObj.name,
    //           email      : reqObj.email,
    //           password   : reqObj.password,
    //           token      : token
    //         });

    //         bcrypt.genSalt(saltRounds).then((salt) => {
    //           return bcrypt.hash(newAdmin.password, salt)
    //         })
    //         .then((hashedPassword) => {
    //           newAdmin.password = hashedPassword

    //           newAdmin.save()
    //           .then((response) => {
    //             callback({code: 200, message : 'Admin regisrtation successfull', result:response})
    //           }) .catch((err) => {
    //             callback({code: 400, message : 'Admin registration failed', result: err})
    //           })
    //         })
    //         .catch((error) => {
    //           callback({code: 400, message: 'Error in generating salt or hashing password', result: error});
    //         }) 
    //     } catch (error) {
    //       callback({code: 500, message: 'Internal server error', result: error})
    //     } 
    // },

    loginUser : async(req, res) => {
      try {
        const { access_token, user_type } = req.headers;
        const {email, password} = req?.body;

         const user = 
          user_type == "Buyer"
            ? await Buyer.findOne({ buyer_email: email })
            : user_type == "Admin"
            ? await Admin.findOne({ email: email })
            : user_type == "Supplier"
            ? await Supplier.findOne({ supplier_email: email })
            : user_type == "Seller"
            ? await Seller.findOne({ email: email })
            : null;

          if (!user) {
              return res?.status(404)?.send({code: 404, message: 'Email not found', result: user || {}})
          }

          const isMatch = await bcrypt.compare(password, user?.password);

          if (!isMatch) {
            return res.status(400).send({code: 400, message: 'Incorrect Password', })
          }
          
         const user2 = 
         user_type == "Buyer"
           ? await Buyer.findById(user?._id)?.select("-password -createdAt -updatedAt -__v")
           : user_type == "Admin"
           ? await Admin.findById(user?._id)?.select("-password -createdAt -updatedAt -__v")
           : user_type == "Supplier"
           ? await Supplier.findById(user?._id)?.select("-password -createdAt -updatedAt -__v")
           : user_type == "Seller"
           ? await Seller.findById(user?._id)?.select("-password -createdAt -updatedAt -__v")
           : null;

          return res.status(200).send({code: 200, message: `${user_type} Login Successfull`, result: user2})

      } catch (error) {
        console.error('Internal Server Error:', error);
        return res.status(500)?.send({code: 500, message: 'Internal Server Error', result: error})
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

    getLoggedinUserProfileDetails : async (req, res) => {
      try {
        const { access_token, user_type } = req.headers;
        const {id} = req?.params;
        
        const user =
                user_type == "Buyer"
                  ? await Buyer.findById(id)?.select("-password -token -createdAt -updatedAt -__v")
                  : user_type == "Admin"
                  ? await Admin.findById(id)?.select("-password -token -createdAt -updatedAt -__v")
                  : user_type == "Supplier"
                  ? await Supplier.findById(id)?.select("-password -token -createdAt -updatedAt -__v")
                  : user_type == "Seller"
                  ? await Seller.findById(id)?.select("-password -token -createdAt -updatedAt -__v")
                  : null;
        
              if (!user) {
                return res.status(400).send({ message: "No user Found" });
              }

              return res?.status(200)?.send({message:"User Found", user})
      }catch (error) {
        console.log({code: 500, message: 'Internal Server Error', result: error})
    }
    },

}