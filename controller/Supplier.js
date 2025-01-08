require('dotenv').config();
const bcrypt       = require('bcrypt');
const moment       = require('moment');
const jwt          = require('jsonwebtoken');
const Supplier     = require('../schema/supplierSchema')
const Buyer        = require('../schema/buyerSchema')
const Order        = require('../schema/orderSchema')
const SupplierEdit = require('../schema/supplierEditSchema')
const Support      = require('../schema/supportSchema')
const {Medicine, SecondaryMarketMedicine, NewMedicine }    = require("../schema/medicineSchema");
const {EditMedicine, NewMedicineEdit, SecondaryMarketMedicineEdit} = require('../schema/medicineEditRequestSchema')
const Notification       = require('../schema/notificationSchema')
const PurchaseOrder = require('../schema/purchaseOrderSchema')
const Invoice  = require('../schema/invoiceSchema')
const Enquiry = require('../schema/enquiryListSchema')
const nodemailer         = require('nodemailer');
const sendEmail = require('../utils/emailService')
const {getTodayFormattedDate}  = require('../utils/utilities')
const { parse } = require('json2csv');
const fs = require('fs');
const path = require('path');
const { flattenData } = require('../utils/csvConverter')

module.exports = {
    
    register : async(reqObj, callback) => {
        try {
          const emailExists = await Supplier.findOne({supplier_email : reqObj.supplier_email})
          if(emailExists) {
            return callback({code : 409, message: "Email already exists"})
          }
          const supplierId  = 'SUP-' + Math.random().toString(16).slice(2, 10);
          let jwtSecretKey  = process.env.APP_SECRET; 
          let data          = {  time : Date(),  supplierId : supplierId } 
          const token       = jwt.sign(data, jwtSecretKey); 

          const newSupplier = new Supplier({
              supplier_id                 : supplierId,
              supplier_type               : reqObj.supplier_type,
              supplier_name               : reqObj.supplier_name,
              supplier_address            : reqObj.supplier_address,
              description                 : reqObj.description,
              supplier_email              : reqObj.supplier_email,
              supplier_mobile             : reqObj.supplier_mobile,
              supplier_country_code       : reqObj.supplier_country_code,
              license_no                  : reqObj.license_no,
              license_expiry_date         : reqObj.license_expiry_date,
              tax_no                      : reqObj.tax_no,
              // registration_no             : reqobj.registration_no,
              country_of_origin           : reqObj.country_of_origin,
              country_of_operation        : reqObj.country_of_operation,
              contact_person_name         : reqObj.contact_person_name,
              designation                 : reqObj.designation,
              contact_person_mobile_no    : reqObj.contact_person_mobile_no,
              contact_person_country_code : reqObj.contact_person_country_code,
              contact_person_email        : reqObj.contact_person_email,
              supplier_image              : reqObj.supplier_image,
              license_image               : reqObj.license_image,
              certificate_image           : reqObj.certificate_image,
              tax_image                   : reqObj.tax_image,
              payment_terms               : reqObj.payment_terms,
              estimated_delivery_time     : reqObj.estimated_delivery_time,
              tags                        : reqObj.tags,
              registration_no             : reqObj.registration_no ,
              vat_reg_no                  : reqObj.vat_reg_no,
              token                       : token,
              account_status              : 0,
              profile_status              : 0
          });

            newSupplier.save() .then(async() => {
              const notificationId = 'NOT-' + Math.random().toString(16).slice(2);
                const newNotification = new Notification({
                  notification_id : notificationId,
                  event_type      : 'New Registration Request',
                  event           : 'supplierregistration',
                  from            : 'supplier',
                  to              : 'admin',
                  from_id         : supplierId,
                  event_id        : supplierId,
                  message         : 'New Supplier Registration Request',
                  status          : 0
                  // to_id : reqObj.buyer_id,
                  // connected_id : reqObj.enquiry_id,
                  
              })
               await newNotification.save()

               const adminEmail = 'ajo@shunyaekai.tech';
                const subject = `New Registration Alert: Supplier Account Created`;
                const body = `
                          <p>Dear Admin,</p>
                          <p>We hope this message finds you well.</p>
                          <p>We are pleased to inform you that a new supplier has registered on Deliver. Below are the details of the new account:</p>
                          <ul>
                            <li>Type of Account: ${reqObj.supplier_type}</li>
                            <li>Company Name: ${reqObj.supplier_name}</li>
                            <li>Contact Person: ${reqObj.contact_person_name}</li>
                            <li>Email Address: ${reqObj.contact_person_email}</li>
                            <li>Phone Number: ${reqObj.contact_person_country_code} ${reqObj.contact_person_mobile_no}</li>
                            <li>Registration Date: ${getTodayFormattedDate()}</li>
                          </ul>
                          <p>Please review the registration details and take any necessary actions to verify and approve the new account.</p>
                          <p>Best regards,<br/>MedHub Global Team</p>
                        `;
                        const recipientEmails = [adminEmail, 'ajo@shunyaekai.tech'];  // Add more emails if needed
                        // await sendMailFunc(recipientEmails.join(','), subject, body);
              await sendEmail(recipientEmails, subject, body)
              callback({code: 200, message: "Supplier Registration Successfull"})
            }).catch((err) => {
              console.log('err',err);
              callback({code: 400 , message: "Error While Registering the Supplier"})
            })
            
        } catch (error) {
          console.log('err',error);
          callback({code: 500, message: 'Internal Server Error'});
        }
    },

    login : async(reqObj, callback) => {
      try {
        const password  = reqObj.password
        const email     = reqObj.email

        const supplier = await Supplier.findOne({ supplier_email: email });

        if (!supplier) {
            return callback({code: 404, message: "Email doesn't exists"});
        }

        const isMatch = await bcrypt.compare(password, supplier.password);

        if (isMatch) {
          const supplierData = {
            _id                         : supplier._id,
            supplier_id                 : supplier.supplier_id,
            supplier_name               : supplier.supplier_name,
            supplier_address            : supplier.supplier_address,
            description                 : supplier.description,
            supplier_email              : supplier.supplier_email,
            supplier_country_code       : supplier.supplier_country_code,
            supplier_mobile             : supplier.supplier_mobile,
            contact_person_country_code : supplier.contact_person_country_code,
            contact_person_email        : supplier.contact_person_email,
            contact_person_mobile       : supplier.contact_person_mobile_no,
            contact_person_name         : supplier.contact_person_name,
            country_of_operation        : supplier.country_of_operation,
            designation                 : supplier.designation,
            supplier_image              : supplier.supplier_image,
            license_image               : supplier.license_image,
            license_no                  : supplier.license_no,
            tax_image                   : supplier.tax_image,
            tax_no                      : supplier.tax_no,
            description                 : supplier.description,
            country_of_origin           : supplier.country_of_origin,
            token                       : supplier.token
         }
            callback({code : 200, message: "Login Successfull", result: supplierData});
        } else {
            callback({code: 401, message: 'Incorrect Password'});
        }
      }catch (error) {
        console.error('Error validating user:', error);
        callback({code: 500});
      }
    },

    filterValues : async(reqObj, callback) => {
      try {
        // const countryData = await Supplier.find({}, { country_of_origin: 1, _id: 0 }).exec();
        const countryData = await Supplier.distinct("country_of_origin", {account_status: 1})

        const result = {
          country: countryData,
          // forms: formsData
      };

      callback({ code: 200, message: "Filter values", result: [result] });
      }catch (error) {
        console.error('Error:', error);
        callback({code: 500});
     }
    },

    editSupplier : async(reqObj, callback) => {
      try {
       const {
          supplier_id, supplier_name, description, supplier_address, 
          supplier_email, supplier_mobile, supplier_country_code, contact_person_name,
          contact_person_mobile_no, contact_person_country_code, contact_person_email, designation,
          country_of_origin, country_of_operation, license_no, tax_no, payment_terms, tags, 
          estimated_delivery_time, supplier_image, tax_image, license_image
        } = reqObj

      const updateObj = {
        supplier_id, 
        supplier_name, 
        description, 
        supplier_address, 
        supplier_email, 
        supplier_mobile, 
        supplier_country_code, 
        contact_person_name,
        contact_person_mobile_no, 
        contact_person_country_code, 
        contact_person_email, 
        designation,
        country_of_origin, 
        country_of_operation, 
        license_no, 
        tax_no, 
        payment_terms, 
        tags, 
        estimated_delivery_time, 
        supplier_image, 
        tax_image, 
        license_image,
        edit_status: 0
      };

      const supplier = await Supplier.findOne({ supplier_id: supplier_id });
  
        if (!supplier) {
            return callback({ code: 404, message: 'Supplier Not Found' });
        }

        if(supplier.profile_status === 0) {
          return callback({code: 202, message: 'Edit request already exists for the supplier'})
        }


      Object.keys(updateObj).forEach(key => updateObj[key] === undefined && delete updateObj[key]);

      const supplierEdit = new SupplierEdit(updateObj)

      supplierEdit.save().then((data) => {
        Supplier.findOneAndUpdate({supplier_id : supplier_id},
          {
            $set: {
              profile_status: 0
            }
          }).then((result) => {
            callback({ code: 200, message: 'Profile edit request send successfully', result: data});
          })
          .catch((err) => {
            callback({ code: 400, message: 'Error while sending profile update request', result: err});
          })
      })
    //   const updatedSupplier = await Supplier.findOneAndUpdate(
    //     { supplier_id: supplier_id },
    //     { $set: updateObj },
    //     { new: true }
    //   );  

    // if (!updatedSupplier) {
    //   return callback({ code: 404, message: 'Supplier not found' });
    // }

    // callback({ code: 200, message: 'Supplier updated successfully', result: updatedSupplier });


      // callback({ code: 200, message: "Filter values", result: [result] });
      }catch (error) {
        console.error('Error:', error);
        callback({ code: 500, message: 'Internal Server Error', error: error});
     }
    },

    supplierProfileDetails : async(req, callback) => {
      try {
        const fields = {
          token : 0,
          password : 0
        }
        Supplier.findOne({supplier_id: req?.params?.id}).select(fields) 
        .then((data) => {
          callback({code: 200, message : 'Supplier details fetched successfully', result:data})
      }).catch((error) => {
          console.error('Error:', error);
          callback({code: 400, message : 'Error in fetching supplier details'})
      });
      }catch (error) {
        callback({code: 500, message : 'Internal server error'})
      }
    },

    buyerDetails : async(reqObj, callback) => {
      try {
        // const fields = [
        //   'supplier_id', 'supplier_name', 'supplier_image', 'supplier_email',
        //   'supplier_country_code', 'supplier_mobile', 'supplier_address', 
        //   'description', 'license_no', 'country_of_origin', 'contact_person_name', 
        //   'contact_person_mobile_no', 'contact_person_country_code', 'contact_person_email', 
        //   'designation', 'tags', 'payment_terms', 'estimated_delivery_time'
        // ];

        Buyer.findOne({buyer_id: reqObj.buyer_id})
        // .select(fields.join(' ')) 
        .select()
        .then((data) => {
          callback({code: 200, message : 'Buyer details fetched successfully', result:data})
      }).catch((error) => {
          console.error('Error:', error);
          callback({code: 400, message : 'Error in fetching Buyer details'})
      });
      }catch (error) {
        console.log('Internal Server Error', error)
        callback({code: 500, message : 'Internal server error'})
      }
    },

    changePassword : async(reqObj, callback) => {
      try {
        const { supplier_id, password } = reqObj
        const supplier = await Supplier.findOne({supplier_id : supplier_id})

        if(!supplier) {
          return callback({code: 404, message: "Supplier doesn't exists"});
        }
        let newPassword
        const saltRounds = 10
        bcrypt.genSalt(saltRounds).then((salt) => {
          return bcrypt.hash(password, salt)
        })
        .then((hashedPassword) => {
          newPassword = hashedPassword
          Supplier.findOneAndUpdate(
            { supplier_id: supplier_id },

            { $set: {password : newPassword} },
            { new: true }
          ).then(() => {
            callback({code: 200, message: "Password updated Successfully"})
          }) 
          .catch((err) => {
            callback({code: 400 , message: "Error while updating password "})
          })
        })
        .catch((err) => {
          callback({code: 401 , message: "Error while updating password "})
        })

        // Supplier.findOneAndUpdate({supplier_id : supplier_id},{$set: {password :}})
      } catch (error) {
        console.log('error',error);
            callback({code: 500 , message: "Internal Server Error", error: error})
      }
    },
    

    supplierDashboardOrderDetails: async (reqObj, callback) => {
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
              created_at: { $gte: today }  // Match only today's data
            }
          },
          {
            $addFields: {
              numeric_total_price: {
                $toDouble: {
                  $arrayElemAt: [
                    { $split: ["$total_price", " "] },
                    0
                  ]
                }
              }
            }
          },
          {
            $facet: {
              completedCount: [
                { $match: { order_status: 'completed' } },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                    total_purchase: { $sum: "$numeric_total_price" }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    count: 1,
                    total_purchase: 1
                  }
                }
              ],
              activeCount: [
                { $match: { order_status: 'active' } },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                    total_purchase: { $sum: "$numeric_total_price" }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    count: 1,
                    total_purchase: 1
                  }
                }
              ],
              pendingCount: [
                { $match: { order_status: 'pending' } },
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                    total_purchase: { $sum: "$numeric_total_price" }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    count: 1,
                    total_purchase: 1
                  }
                }
              ],
              totalPurchaseAmount: [
                {
                  $group: {
                    _id: null,
                    total_purchase: { $sum: "$numeric_total_price" }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    total_purchase: 1
                  }
                }
              ]
            }
          }
        ];
    
        // Aggregation for Purchase Orders
        const purchaseOrdersAggregation = [
          {
            $match: {
              supplier_id: supplier_id,
              created_at: { $gte: today },  // Match only today's data
              po_status: 'active'  // Filter for active purchase orders
            }
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              total_amount: { $sum: "$amount" }
            }
          },
          {
            $project: {
              _id: 0,
              count: 1,
              total_amount: 1
            }
          }
        ];
    
        // Aggregation for Enquiries
        const enquiriesAggregation = [
          {
            $match: {
              supplier_id: supplier_id,
              created_at: { $gte: today }  // Match only today's data
            }
          },
          {
            $match: { enquiry_status: { $ne: 'order created' } }
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              count: 1
            }
          }
        ];
    
        const [ordersData, purchaseOrdersData, enquiriesData] = await Promise.all([
          Order.aggregate(ordersAggregation),
          PurchaseOrder.aggregate(purchaseOrdersAggregation),
          Enquiry.aggregate(enquiriesAggregation)
        ]);
    
        // Prepare the final result
        const result = {
          orderDetails: ordersData[0],
          purchaseOrderCount: purchaseOrdersData[0]?.count || 0,
          purchaseOrderTotalAmount: purchaseOrdersData[0]?.total_amount || 0,
          enquiryCount: enquiriesData[0]?.count || 0
        };
    
        callback({ code: 200, message: 'Supplier dashboard order details fetched successfully', result });
      } catch (error) {
        console.log('Internal Server Error', error);
        callback({ code: 500, message: 'Internal server error', result: error });
      }
    },
    

    supplierOrderSupplierCountry : async(reqObj, callback) => {
      console.log(`\n GET FUNCTIN CALLED`)
      try {
        const { supplier_id } = reqObj

        Order.aggregate([
          {
            $match: { supplier_id : supplier_id }
          },
          {
            $lookup: {
              from         : 'buyers',
              localField   : 'buyer_id',
              foreignField : 'buyer_id',
              as           : 'buyer'
            }
          },
          {
            $unwind: '$buyer'
          },
          {
            $addFields: {
              numeric_total_price: {
                $toDouble: {
                  $arrayElemAt: [
                    { $split: ["$total_price", " "] },
                    0
                  ]
                }
              }
            }
          },
          {
            $group: {
              _id            : '$buyer.country_of_origin',
              total_purchase : { $sum: '$numeric_total_price' }
            }
          },
          {
            $project: {
              _id     : 0,
              country : '$_id',
              value   : '$total_purchase'
            }
          }
        ])
        .then((data) => {
          callback({code: 200, message : 'supplier buyer country fetched successfully', result: data})
        })
        .catch((err) => {
          callback({code: 400, message : 'error while fetching supplier buyer country', result: err})
        })
      } catch (error) {
        console.log('Internal Server Error', error)
        callback({code: 500, message : 'Internal server error', result: error})
      }
    },

    editMedicine : async(reqObj, callback) => {
      try {
        const { medicine_id, product_type, supplier_id, medicine_name, composition, strength, type_of_form, shelf_life, 
          dossier_type, dossier_status, product_category, total_quantity, gmp_approvals, shipping_time, tags, 
          country_of_origin, stocked_in, registered_in, available_for, description, medicine_image } = reqObj;

    if (product_type === 'new') {
      const { quantity, unit_price, total_price, est_delivery_days } = reqObj;

      if (!Array.isArray(quantity) || !Array.isArray(unit_price) || 
          !Array.isArray(total_price) ||  !Array.isArray(est_delivery_days) ) {
          callback({ code: 400, message: "Inventory fields should be arrays" });
      }

      if (quantity.length !== unit_price.length || unit_price.length !== total_price.length || total_price.length !== est_delivery_days.length) {
         callback({ code: 400, message: "All inventory arrays (quantity, unit_price, total_price, est_delivery_days) must have the same length" });
    }
    
      const inventory_info = quantity.map((_, index) => ({
        quantity          : quantity[index],
        unit_price        : unit_price[index],
        total_price       : total_price[index],
        est_delivery_days : est_delivery_days[index],
      }));

      const newMedicineObj = {
          medicine_id,
          supplier_id,
          medicine_name,
          medicine_type : 'new_medicine',
          composition,
          strength,
          type_of_form,
          shelf_life,
          dossier_type,
          dossier_status,
          medicine_category : product_category,
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
          edit_status : 0
      };

      const medicine = await Medicine.findOne({ supplier_id: supplier_id, medicine_id: medicine_id });
  
        if (!medicine) {
            return callback({ code: 404, message: 'Medicine Not Found' });
        }

        const newMedEdit = new NewMedicineEdit(newMedicineObj)

        newMedEdit.save()
        .then((savedMedicine) => {
            callback({ code: 200, message: "Edit Medicine Request Submitted Successfully", result: savedMedicine });
        })
        .catch((err) => {
            console.log(err);
             callback({ code: 400, message: "Error while submitting request" });
        });
     
  } else if(product_type === 'secondary market') {
      const { purchased_on, country_available_in, min_purchase_unit, unit_price, condition, invoice_image, quantity } = reqObj;

      const secondaryMarketMedicineObj = {
          medicine_id,
          supplier_id,
          medicine_name,
          medicine_type : 'secondary_medicine',
          purchased_on,
          country_available_in,
          min_purchase_unit,
          composition,
          strength,
          type_of_form,
          shelf_life,
          dossier_type,
          dossier_status,
          medicine_category : product_category,
          gmp_approvals,
          shipping_time,
          tags,
          country_of_origin,
          registered_in,
          stocked_in,
          available_for,
          description,
          total_quantity : quantity,
          unit_price,
          condition,
          medicine_image,
          invoice_image,
          edit_status : 0
      };

      const secondaryMedEdit = new SecondaryMarketMedicineEdit(secondaryMarketMedicineObj)

      secondaryMedEdit.save()
      .then((savedMedicine) => {
          callback({ code: 200, message: "Edit Medicine Request Submitted Successfully", result: savedMedicine });
      })
      .catch((err) => {
          console.log(err);
           callback({ code: 400, message: "Error while submitting request" });
      });
  }
      }catch (error) {
        console.error('Error:', error);
        callback({ code: 500, message: 'Internal Server Error', error: error});
     }
    },

    //----------------------------- support -------------------------------------//
    
    supportList : async(reqObj, callback) => {
      try {
         const { supplier_id, pageNo, pageSize } = reqObj
 
         const page_no   = pageNo || 1
         const page_size = pageSize || 1
         const offset    = (page_no - 1) * page_size 
 
         Support.find({supplier_id : supplier_id}).skip(offset).limit(page_size).then((data) => {
           Support.countDocuments({supplier_id : supplier_id}).then((totalItems) => {
             const totalPages = Math.ceil(totalItems / page_size)
             const returnObj =  {
               data,
               totalPages
             }
             callback({code: 200, message : 'supplier support list fetched successfully', result: returnObj})
           })
           .catch((err) => {
             console.log(err);
             callback({code: 400, message : 'error while fetching buyer support list count', result: err})
           })
         })
         .catch((err) => {
           console.log(err);
           callback({code: 400, message : 'error while fetching buyer support list', result: err})
         })
 
      } catch (error) {
       callback({code: 500, message : 'Internal Server Error', result: error})
      }
     },
 
    supportDetails : async (reqObj, callback) => {
      try {
          const { supplier_id , support_id } = reqObj

          Support.find({supplier_id : supplier_id, support_id : support_id}).select().then((data) => {
          callback({code: 200, message : 'supplier support details fetched successfully', result: data})
          })
      } catch (error) {
        
      }
    },
 
     //----------------------------- support --------------------------------------//


     getNotificationList : async(reqObj, callback) => {
      try {
        const { supplier_id, pageNo, pageSize } = reqObj

        const page_no   = pageNo || 1
        const page_size = pageSize || 100
        const offset    = (page_no - 1) * page_size 

        Notification.aggregate([
          {
            $match: {
              to_id : supplier_id,
              to    : 'supplier',
              // status: 0
              
            }
          },
          {
            $lookup: {
              from         : "suppliers",
              localField   : "to_id",
              foreignField : "supplier_id",
              as           : "supplier"
            }
          },
          {
            $lookup: {
              from         : "buyers",
              localField   : "from_id",
              foreignField : "buyer_id",
              as           : "buyer"
            }
          },
          {
            $project: {
              notification_id : 1,
              event           : 1,
              event_type      : 1,
              from            : 1,
              to              : 1,
              from_id         : 1,
              to_id           : 1,
              event_id        : 1,
              connected_id    : 1,
              link_id         : 1,
              message         : 1,
              status          : 1,
              createdAt       : 1,
              updatedAt       : 1,
              supplier        : { $arrayElemAt: ["$supplier", 0] },
              buyer           : { $arrayElemAt: ["$buyer", 0] },
            }
          },
          { $sort  : {createdAt: -1} },
          { $skip  : offset },
          { $limit : page_size },
          
        ])
        
        .then( async(data) => {
          const totalItems = await Notification.countDocuments({to_id: supplier_id, to: 'supplier', status: 0});
          const totalPages = Math.ceil(totalItems / page_size);

          const returnObj = {
              data,
              totalPages,
              totalItems
          };
          callback({code: 200, message: "List fetched successfully", result: returnObj})
        })
        .catch((err) => {
          console.log(err);
          callback({code: 400, message : 'error while fetching buyer list', result: err})
        })
      } catch (error) {
        
      }
     },

     getNotificationDetailsList : async(reqObj, callback) => {
      try {
        const { supplier_id, pageNo, pageSize } = reqObj

        const page_no   = pageNo || 1
        const page_size = pageSize || 5
        const offset    = (page_no - 1) * page_size 

        Notification.aggregate([
          {
            $match: {
              to_id : supplier_id,
              to    : 'supplier'
              
            }
          },
          {
            $lookup: {
              from         : "suppliers",
              localField   : "to_id",
              foreignField : "supplier_id",
              as           : "supplier"
            }
          },
          {
            $lookup: {
              from         : "buyers",
              localField   : "from_id",
              foreignField : "buyer_id",
              as           : "buyer"
            }
          },
          {
            $project: {
              notification_id : 1,
              event           : 1,
              event_type      : 1,
              from            : 1,
              to              : 1,
              from_id         : 1,
              to_id           : 1,
              event_id        : 1,
              connected_id    : 1,
              link_id         : 1,
              message         : 1,
              status          : 1,
              createdAt       : 1,
              updatedAt       : 1,
              supplier        : { $arrayElemAt: ["$supplier", 0] },
              buyer           : { $arrayElemAt: ["$buyer", 0] },
            }
          },
          { $sort  : {createdAt: -1} },
          // { $skip  : offset },
          // { $limit : page_size },
          
        ])
        
        .then( async(data) => {
          const totalItems = await Notification.countDocuments({to_id: supplier_id, to: 'supplier'});
          const totalPages = Math.ceil(totalItems / page_size);

          const returnObj = {
              data,
              totalPages,
              totalItems
          };
          callback({code: 200, message: "List fetched successfully", result: returnObj})
        })
        .catch((err) => {
          console.log(err);
          callback({code: 400, message : 'error while fetching buyer list', result: err})
        })
      } catch (error) {
        
      }
     },

     updateStatus : async(reqObj, callback) => {
      try {
        const { notification_id, status = 1, supplier_id, user_type } = reqObj

        const updateNotifications = await Notification.updateMany(
          { to_id: supplier_id, to: user_type }, 
          {
              $set: {
                  status: status, 
              },
          },
          { multi: true } 
      )
      if (!updateNotifications) {
          return callback({ code: 404, message: 'Notification not found', result: null });
      }
      callback({ code: 200, message: "Status Updated", result: updateNotifications });

      } catch (error) {
        console.log(error);
        callback({ code: 500, message: "Internal Server Error", result: error });
      }
     },

     medicinRequestList: async (reqObj, callback) => {
        try {
          const {searchKey, pageNo, pageSize, medicine_type, status, editStatus, supplier_id} = reqObj
    
          const page_no   = pageNo || 1
          const page_size = pageSize || 10
          const offset    = (page_no - 1) * page_size
    
          if(searchKey === '' || searchKey === undefined) {
            Medicine.aggregate([
              {
                $match: {
                    supplier_id : supplier_id,
                    $or: [
                      { status      : { $ne: 1 } },
                      { edit_status : { $ne: 1 } }
                    ]
                }
            },
              {
                $lookup: {
                  from         : "medicineinventories",
                  localField   : "medicine_id",
                  foreignField : "medicine_id",
                  as           : "inventory",
                },
              },
              {
                $sort: { created_at: -1 } 
              },
              {
                $project: {
                  medicine_id       : 1,
                  supplier_id       : 1,
                  medicine_name     : 1,
                  medicine_image    : 1,
                  drugs_name        : 1,
                  country_of_origin : 1,
                  dossier_type      : 1,
                  dossier_status    : 1,
                  gmp_approvals     : 1,
                  registered_in     : 1,
                  comments          : 1,
                  dosage_form       : 1,
                  category_name     : 1,
                  strength          : 1,
                  quantity          : 1,
                  medicine_type     : 1,
                  status            : 1,
                  edit_status       : 1,
                  created_at        : 1,
                  total_quantity    : 1,
                  inventory : {
                    $arrayElemAt: ["$inventory", 0],
                  },
                },
              },
              
              {
                $project: {
                  medicine_id       : 1,
                  supplier_id       : 1,
                  medicine_name     : 1,
                  medicine_image    : 1,
                  drugs_name        : 1,
                  country_of_origin : 1,
                  dossier_type      : 1,
                  dossier_status    : 1,
                  gmp_approvals     : 1,
                  registered_in     : 1,
                  comments          : 1,
                  dosage_form       : 1,
                  category_name     : 1,
                  strength          : 1,
                  quantity          : 1,
                  medicine_type     : 1,
                  status            : 1,
                  edit_status       : 1,
                  created_at        : 1,
                  total_quantity    : 1,
                  "inventory.delivery_info"  : 1,
                  "inventory.price"          : 1,
                },
              },
              
              { $skip: offset },
              { $limit: page_size },
            ])
              .then((data) => {
                
                Medicine.countDocuments({
                  supplier_id: supplier_id,
                  $or: [
                      { status: { $ne: 1 } },
                      { edit_status: { $ne: 1 } }
                  ]
              })
              .then(totalItems => {
                  const totalPages = Math.ceil(totalItems / page_size);
                  const returnObj = {
                      data,
                      totalPages,
                      totalItems
                  };
                  callback({ code: 200, message: "Medicine list fetched successfully", result: returnObj });
              })
              .catch((err) => {
                  callback({ code: 400, message: "Error while fetching medicine count", result: err });
              });
              
              })
              .catch((err) => {
                console.log(err);
                callback({ code: 400, message: "Error fetching medicine list", result: err});
              });
          } else {
            Medicine.aggregate([
              {
                $match: {
                  'medicine_name': { $regex: searchKey, $options: 'i' },
                  'medicine_type': medicine_type
                }
              },
              {
                $project: {
                  medicine_id       : 1,
                  supplier_id       : 1,
                  medicine_name     : 1,
                  medicine_image    : 1,
                  drugs_name        : 1,
                  country_of_origin : 1,
                  dossier_type      : 1,
                  dossier_status    : 1,
                  gmp_approvals     : 1,
                  registered_in     : 1,
                  comments          : 1,
                  dosage_form       : 1,
                  category_name     : 1,
                  strength          : 1,
                  quantity          : 1,
                  medicine_type     : 1,
                  inventory : {
                    $arrayElemAt: ["$inventory", 0],
                  },
                }
              },
              {
                $project: {
                  medicine_id       : 1,
                  supplier_id       : 1,
                  medicine_name     : 1,
                  medicine_image    : 1,
                  drugs_name        : 1,
                  country_of_origin : 1,
                  dossier_type      : 1,
                  dossier_status    : 1,
                  gmp_approvals     : 1,
                  registered_in     : 1,
                  comments          : 1,
                  dosage_form       : 1,
                  category_name     : 1,
                  strength          : 1,
                  quantity          : 1,
                  medicine_type     : 1,
                  "inventory.delivery_info"  : 1,
                  "inventory.price"          : 1,
                },
              },
              {
                $sort: { created_at: -1 } 
              },
              { $skip: offset },
              { $limit: page_size }
            ])
            .then((data) => {
              Medicine.countDocuments({ 
                medicine_name: { $regex: searchKey, $options: 'i' },
                medicine_type: medicine_type 
              })
                .then(totalItems => {
                    const totalPages = Math.ceil(totalItems / page_size);
                    const returnObj = {
                      data,
                      totalPages
                    }
                    callback({ code: 200, message: "Medicine list fetched successfully", result: returnObj });
                })
                .catch((err) => {
                  callback({ code: 400, message: "Error while fetching medicine count", result: err});
                })
              })
            .catch((err) => {
              callback({ code: 400, message: "Error fetching medicine list", result: err});
            });
    
          }
        
        } catch (error) {
          callback({ code: 500, message: "Internal Server Error", result: error });
        }
     },

     getInvoiceCount: async (reqObj, callback) => {
      try {
        const { supplier_id } = reqObj; 
    
        Invoice.aggregate([
          {
            $match: {
              supplier_id : supplier_id,  
              status      : 'pending'    
            }
          },
          {
            $count : "pendingInvoiceCount" 
          }
        ])
        .then((data) => {
          const count = data.length > 0 ? data[0].pendingInvoiceCount : 0; 
          callback({ code: 200, message: "Pending Invoice Count", result: count });
        })
        .catch((err) => {
          callback({ code: 400, message: "Error while fetching count", result: err });
        });
      } catch (error) {
        console.log('server error', error);
        callback({ code: 500, message: "Internal server error", result: error });
      }
     },

     getAllSuppliersList: async (req, res) => {
      try {
        const { user_type } = req?.headers;
        const { filterKey, filterValue, searchKey = '', filterCountry = '', pageNo = 1, pageSize = 1 } = req?.query;

        const page_no = parseInt(pageNo) || 1;
        const page_size = parseInt(pageSize) || 2;
        const offSet = parseInt(page_no - 1) * page_size;
        const offset = parseInt(pageNo - 1) * pageSize;
    
        const fields = {
          token    : 0,
          password : 0
        };

        let filterCondition = {};
        if (filterKey === 'pending') {
          filterCondition = { account_status: 0 };
        } else if (filterKey === 'accepted') {
          filterCondition = { account_status: 1 };
        } else if (filterKey === 'rejected') {
          filterCondition = { account_status: 2 };
        }

        let dateFilter = {}; 

        const startDate = moment().subtract(365, 'days').startOf('day').toDate();
        const endDate   = moment().endOf('day').toDate();

        // Apply date filter based on filterValue (today, week, month, year, all)
        if (filterValue === 'today') {
            dateFilter = {
                createdAt: {
                    $gte: moment().startOf('day').toDate(),
                    $lte: moment().endOf('day').toDate(),
                },
            };
        } else if (filterValue === 'week') {
            dateFilter = {
                createdAt: {
                    $gte: moment().subtract(7, 'days').startOf('day').toDate(),
                    $lte: moment().endOf('day').toDate(),
                },
            };
        } else if (filterValue === 'month') {
            dateFilter = {
                createdAt: {
                    $gte: moment().subtract(30, 'days').startOf('day').toDate(),
                    $lte: moment().endOf('day').toDate(),
                },
            };
        } else if (filterValue === 'year') {
            dateFilter = {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            };
        } else if (filterValue === 'all' || !filterValue) {
            dateFilter = {}; // No date filter
        }
    
        // Merge dateFilter with filterCondition to apply both filters
        const combinedFilter = { ...filterCondition, ...dateFilter };
      
        let query = { account_status: 1 };
        
        if (searchKey) {
          query.supplier_name = { $regex: new RegExp(searchKey, 'i') };
        }
        
        if (filterCountry) {
          query.country_of_origin = filterCountry;
        }
    
        let data;

        if(user_type == 'Admin'){
          data = await Supplier.find(combinedFilter).select(fields).sort({createdAt: -1}).skip(offSet).limit(page_size);
        } else if(user_type == 'Buyer'){
          data = await Supplier.find(query)
            .select('supplier_id supplier_name supplier_image supplier_country_code supplier_mobile supplier_address description license_no country_of_origin contact_person_name contact_person_mobile_no contact_person_country_code contact_person_email designation tags payment_terms estimated_delivery_time, license_expiry_date tax_no')
            .sort({createdAt: -1})
            .skip(offset)
            .limit(pageSize);
        }

        if(!data){
          res?.status(500)?.send({ code: 500, message: "Error fetching suppliers list", result: {} })
        }
        
        const totalItems = await Supplier.countDocuments( user_type == 'Admin' ? combinedFilter: user_type == 'Buyer' && query );
      
        const totalPages = Math.ceil(totalItems / page_size);
        const returnObj = {
          data,
          totalPages,
          totalItems: data?.length || totalItems,
        };
    
        res?.status(200)?.send({ code: 200, message: 'Supplier list fetched successfully', result: returnObj });
      } catch (error) {
        console.log('server error', error);
        res?.status(500)?.send({ code: 500, message: "Internal server error", result: error });
      }
     },

     getCSVSuppliersList: async (req, res) => {
      try {
        const { user_type } = req?.headers;
        const { filterKey, filterValue, searchKey = '', filterCountry = '', pageNo = 1, pageSize = 1 } = req?.body;

        const page_no = pageNo || 1;
        const page_size = pageSize || 2;
        const offSet = (page_no - 1) * page_size;
        const offset = (pageNo - 1) * pageSize;
    
        const fields = {
          token    : 0,
          password : 0
        };

        let filterCondition = {};
        if (filterKey === 'pending') {
          filterCondition = { account_status: 0 };
        } else if (filterKey === 'accepted') {
          filterCondition = { account_status: 1 };
        } else if (filterKey === 'rejected') {
          filterCondition = { account_status: 2 };
        }

        let dateFilter = {}; 

        const startDate = moment().subtract(365, 'days').startOf('day').toDate();
        const endDate   = moment().endOf('day').toDate();

        // Apply date filter based on filterValue (today, week, month, year, all)
        if (filterValue === 'today') {
            dateFilter = {
                createdAt: {
                    $gte: moment().startOf('day').toDate(),
                    $lte: moment().endOf('day').toDate(),
                },
            };
        } else if (filterValue === 'week') {
            dateFilter = {
                createdAt: {
                    $gte: moment().subtract(7, 'days').startOf('day').toDate(),
                    $lte: moment().endOf('day').toDate(),
                },
            };
        } else if (filterValue === 'month') {
            dateFilter = {
                createdAt: {
                    $gte: moment().subtract(30, 'days').startOf('day').toDate(),
                    $lte: moment().endOf('day').toDate(),
                },
            };
        } else if (filterValue === 'year') {
            dateFilter = {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            };
        } else if (filterValue === 'all' || !filterValue) {
            dateFilter = {}; // No date filter
        }
    
        // Merge dateFilter with filterCondition to apply both filters
        const combinedFilter = { ...filterCondition, ...dateFilter };
      
        let query = { account_status: 1 };
        
        if (searchKey) {
          query.supplier_name = { $regex: new RegExp(searchKey, 'i') };
        }
        
        if (filterCountry) {
          query.country_of_origin = filterCountry;
        }
    
        let data;

        if(user_type == 'Admin'){
          data = await Supplier.find(combinedFilter).select(fields).sort({createdAt: -1}).skip(offSet).limit(page_size);
        } else if(user_type == 'Buyer'){
          data = await Supplier.find(query)
            .select('supplier_id supplier_name supplier_image supplier_country_code supplier_mobile supplier_address description license_no country_of_origin contact_person_name contact_person_mobile_no contact_person_country_code contact_person_email designation tags payment_terms estimated_delivery_time, license_expiry_date tax_no')
            .sort({createdAt: -1})
            .skip(offset)
            .limit(pageSize);
        }

        if(!data){
          res?.status(500)?.send({ code: 500, message: "Error fetching suppliers list", result: {} })
        }

        // Convert Mongoose document to plain object and flatten
        const flattenedData = data.map(item => flattenData(item.toObject(), ["_id", "__v", "Supplier Image", "License Image", "Tax Image", "Certificate Image", "Profile Status"], [], 'supplier_list')); // `toObject()` removes internal Mongoose metadata

        // Convert the flattened data to CSV
        const csv = parse(flattenedData);
        
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');

        res.status(200).send(csv);
      } catch (error) {
        console.log('server error', error);
        res.status(500).json({ error: 'Error generating CSV' });
        // res?.status(500)?.send({ code: 500, message: "Internal server error", result: error });
      }
     }
   }
