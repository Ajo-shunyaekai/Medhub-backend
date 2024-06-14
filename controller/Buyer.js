const bcrypt             = require('bcrypt');
const jwt                = require('jsonwebtoken');
const Buyer              = require('../schema/buyerSchema')
const Supplier           = require('../schema/supplierSchema')
const Order              = require('../schema/orderSchema')
const BuyerEdit          = require('../schema/buyerEditSchema')
const Medicine           = require('../schema/medicineSchema')
const MedicineInventory  = require('../schema/medicineInventorySchema')

module.exports = {

    Regsiter : async(reqObj, callback) => {
        try {
            const emailExists = await Buyer.findOne({buyer_email : reqObj.buyer_email})
            if(emailExists) {
              return callback({code : 409, message: "Email already exists"})
            }
            const buyerId     = 'BYR-' + Math.random().toString(16).slice(2);
            let jwtSecretKey  = process.env.APP_SECRET; 
            let data          = {  time : Date(),  buyerId : buyerId } 
            const token       = jwt.sign(data, jwtSecretKey); 
  
            const newBuyer = new Buyer({
                buyer_id                     : buyerId,
                buyer_type                   : reqObj.buyer_type,
                buyer_name                   : reqObj.buyer_name,
                buyer_address                : reqObj.buyer_address,
                buyer_email                  : reqObj.buyer_email,
                buyer_mobile                 : reqObj.buyer_mobile,
                buyer_country_code           : reqObj.buyer_country_code,
                contact_person_name          : reqObj.contact_person_name,
                designation                  : reqObj.designation ,
                contact_person_email         : reqObj.contact_person_email,
                contact_person_mobile        : reqObj.contact_person_mobile,
                contact_person_country_code  : reqObj.contact_person_country_code,
                country_of_origin            : reqObj.country_of_origin,
                country_of_operation         : reqObj.country_of_operation ,
                approx_yearly_purchase_value : reqObj.approx_yearly_purchase_value ,
                interested_in                : reqObj.interested_in,
                license_no                   : reqObj.license_no,
                license_expiry_date          : reqObj.license_expiry_date,
                tax_no                       : reqObj.tax_no,
                description                  : reqObj.description,
                buyer_image                  : reqObj.buyer_image,
                tax_image                    : reqObj.tax_image,
                license_image                : reqObj.license_image,
                certificate_image            : reqObj.certificate_image,
                token                        : token,
                account_status               : 0,
                profile_status               : 0
              });

              newBuyer.save().then(() => {
                callback({code: 200, message: "Buyer registration request submitted successfully"})
              }).catch((err) => {
                console.log('err',err);
                callback({code: 400 , message: "Error in submiiting buyer eegistration request"})
              })
          } catch (error) {
            console.log('error',error);
            callback({code: 500 , message: "Internal Server Error", error: error})
          } 
    },

    Login : async(reqObj, callback) => {
        const password = reqObj.password
        const email    = reqObj.email
  
        try {
          const buyer = await Buyer.findOne({ buyer_email: email });
  
          if (!buyer) {
              console.log('Not found');
              return callback({code: 404, message: "Buyer Not Found"});
          }
  
          const isMatch = await bcrypt.compare(password, buyer.password);
  
          if (isMatch) {
              const buyerData = {
                 buyer_id                    : buyer.buyer_id,
                 buyer_name                  : buyer.buyer_name,
                 buyer_address               : buyer.buyer_address,
                 description                 : buyer.description,
                 buyer_email                 : buyer.buyer_email,
                 buyer_country_code          : buyer.buyer_country_code,
                 buyer_mobile                : buyer.buyer_mobile,
                 contact_person_country_code : buyer.contact_person_country_code,
                 contact_person_email        : buyer.contact_person_email,
                 contact_person_mobile       : buyer.contact_person_mobile,
                 contact_person_name         : buyer.contact_person_name,
                 country_of_operation        : buyer.country_of_operation,
                 designation                 : buyer.designation,
                 buyer_image                 : buyer.buyer_image,
                 license_image               : buyer.license_image,
                 license_no                  : buyer.license_no,
                 tax_image                   : buyer.tax_image,
                 tax_no                      : buyer.tax_no,
                 description                 : buyer.description,
                 country_of_origin           : buyer.country_of_origin,
                 token                       : buyer.token
              }

              callback({code : 200, message: "Buyer Login Successfull", result: buyerData});
          } else {
              callback({code: 401, message: "Incorrect Password"});
          }
        }catch (error) {
          console.error('Error validating user:', error);
          callback({code: 500, message: "Internal Server Error"});
       }
    },

    EditProfile : async(reqObj, callback) => { 
        try {
          const {
            buyer_id, buyer_name, description, buyer_address,buyer_email, buyer_mobile, 
            buyer_country_code, contact_person_name, contact_person_mobile, contact_person_country_code,
            contact_person_email, designation, country_of_origin, country_of_operation, license_no, tax_no,
            buyer_image, tax_image, license_image
          } = reqObj

          const updateObj = {
            buyer_id,
            buyer_name,
            description,
            buyer_address,
            buyer_email,
            buyer_mobile,
            buyer_country_code,
            contact_person_name,
            contact_person_mobile,
            contact_person_country_code,
            contact_person_email,
            designation,
            country_of_origin,
            country_of_operation,
            license_no,
            tax_no,
            buyer_image,
            tax_image,
            license_image,
            edit_status : 0
          };

          const buyer = await Buyer.findOne({ buyer_id: buyer_id });
  
          if (!buyer) {
              return callback({ code: 404, message: 'Buyer Not Found' });
          }

          if(buyer.profile_status === 0) {
            return callback({code: 202, message: 'Edit request already exists for the buyer'})
          }

          Object.keys(updateObj).forEach(key => updateObj[key] === undefined && delete updateObj[key]);

          const buyerEdit = new BuyerEdit(updateObj)

          buyerEdit.save().then((data) => {
            Buyer.findOneAndUpdate({buyer_id : buyer_id},
              {
                $set : {profile_status : 0}
              }).then((result) => {
                callback({ code: 200, message: 'Profile edit request send successfully', result: data});
              })
              .catch((err) => {
                callback({ code: 400, message: 'Error while senidng profile update request', result: err});
              })
            
          })

            // Buyer.findOneAndUpdate({buyer_id: buyer_id},
            //   {
            //     $set: updateObj
            //   },{new: true}
            //   ).then((updateProfile) => {
            //     callback({ code: 200, message: 'Buyer Profile updated successfully', result: updateProfile});
            //   })
            //   .catch((err) => {
            //     callback({ code: 400, message: 'Error in updating the buyer profile', error: updateProfile});
            //   })
        } catch (error) {
          callback({ code: 500, message: 'Internal Server Error', error: error});
        }
    },

    buyerProfileDetails : async(reqObj, callback) => {
      try {
        Buyer.findOne({buyer_id: reqObj.buyer_id}).select('buyer_id buyer_name email mobile country_code company_name') 
        .then((data) => {
          callback({code: 200, message : 'Buyer details fetched successfully', result:data})
      }).catch((error) => {
          console.error('Error:', error);
          callback({code: 400, message : 'Error in fetching buyer details'})
      });
      }catch (error) {
        callback({code: 500, message : 'Internal server error'})
      }
    },

    supplierList : async(reqObj, callback) => {
      try {
        const { searchKey, filterCountry } = reqObj

        if(searchKey === '' && filterCountry === '') {
          Supplier.find({account_status: 1}).select('supplier_id supplier_name supplier_image supplier_country_code supplier_mobile supplier_address description license_no country_of_origin contact_person_name contact_person_mobile_no contact_person_country_code contact_person_email designation tags payment_terms estimated_delivery_time') 
          .then((data) => {
            callback({code: 200, message : 'Supplier list fetched successfully', result:data})
        }).catch((error) => {
            console.error('Error:', error);
            callback({code: 400, message : 'Error in fetching users list'})
        });
        } else if(searchKey !== '' && filterCountry === '' ) {
          Supplier.find({ supplier_name: { $regex: new RegExp(searchKey, 'i') }, account_status : 1}).select('supplier_id supplier_name supplier_image supplier_country_code supplier_mobile supplier_address description license_no country_of_origin contact_person_name contact_person_mobile_no contact_person_country_code contact_person_email designation tags payment_terms estimated_delivery_time') 
          .then((data) => {
            callback({code: 200, message : 'Supplier list fetched successfully', result:data})
        }).catch((error) => {
            console.error('Error:', error);
            callback({code: 400, message : 'Error in fetching users list'})
        });
        } else if(filterCountry !== '' && searchKey === '') {
          Supplier.find({country_of_origin: filterCountry, account_status : 1}).select('supplier_id supplier_name supplier_image supplier_country_code supplier_mobile supplier_address description license_no country_of_origin contact_person_name contact_person_mobile_no contact_person_country_code contact_person_email designation tags payment_terms estimated_delivery_time') 
          .then((data) => {
            callback({code: 200, message : 'Supplier list fetched successfully', result:data})
        }).catch((error) => {
            console.error('Error:', error);
            callback({code: 400, message : 'Error in fetching users list'})
        });

        } else if((searchKey !== '' && searchKey !== undefined) && (filterCountry !== '' && filterCountry !== undefined)) {
          Supplier.find({ supplier_name: { $regex: new RegExp(searchKey, 'i') }, country_of_origin: filterCountry , account_status : 1}).select('supplier_id supplier_name supplier_image supplier_country_code supplier_mobile supplier_address description license_no country_of_origin contact_person_name contact_person_mobile_no contact_person_country_code contact_person_email designation tags payment_terms estimated_delivery_time') 
          .then((data) => {
            callback({code: 200, message : 'Supplier list fetched successfully', result:data})
        }).catch((error) => {
            console.error('Error:', error);
            callback({code: 400, message : 'Error in fetching users list'})
        });
        } else {
          Supplier.find({account_status: 1}).select('supplier_id supplier_name supplier_image supplier_country_code supplier_mobile supplier_address description license_no country_of_origin contact_person_name contact_person_mobile_no contact_person_country_code contact_person_email designation tags payment_terms estimated_delivery_time') 
          .then((data) => {
            callback({code: 200, message : 'Supplier list fetched successfully', result:data})
        }).catch((error) => {
            console.error('Error:', error);
            callback({code: 400, message : 'Error in fetching users list'})
        });
        }
      }catch (error) {
        console.log('Internal Server Error', error)
        callback({code: 500, message : 'Internal server error'})
      }
    },

    supplierDetails : async(reqObj, callback) => {
      try {
        // const fields = [
        //   'supplier_id', 'supplier_name', 'supplier_image', 'supplier_email',
        //   'supplier_country_code', 'supplier_mobile', 'supplier_address', 
        //   'description', 'license_no', 'country_of_origin', 'contact_person_name', 
        //   'contact_person_mobile_no', 'contact_person_country_code', 'contact_person_email', 
        //   'designation', 'tags', 'payment_terms', 'estimated_delivery_time'
        // ];

        Supplier.findOne({supplier_id: reqObj.supplier_id})
        // .select(fields.join(' ')) 
        .select()
        .then((data) => {
          callback({code: 200, message : 'Supplier details fetched successfully', result:data})
      }).catch((error) => {
          console.error('Error:', error);
          callback({code: 400, message : 'Error in fetching supplier details'})
      });
      }catch (error) {
        console.log('Internal Server Error', error)
        callback({code: 500, message : 'Internal server error'})
      }
    },

    supplierProductList : async(reqObj, callback) => {
      try {
       
        const { supplier_id, pageNo, pageSize } = reqObj
  
        const page_no   = pageNo || 1
        const page_size = pageSize || 2
        const offset    = (page_no - 1) * page_size

          Medicine.aggregate([
            {
              $match : {
                supplier_id   : supplier_id,
              }
            },
            {
              $lookup: {
                from         : "medicineinventories",
                localField   : "medicine_id",
                foreignField : "medicine_id",
                as           : "productInventory",
              },
            },
            {
              $project: {
                medicine_id       : 1,
                supplier_id       : 1,
                medicine_name     : 1,
                composition       : 1,
                dossier_type      : 1,
                dossier_status    : 1,
                gmp_approvals     : 1,
                shipping_time     : 1,
                tags              : 1,
                available_for     : 1,
                description       : 1,
                medicine_image    : 1,
                drugs_name        : 1,
                country_of_origin : 1,
                registered_in     : 1,
                comments          : 1,
                dosage_form       : 1,
                category_name     : 1,
                strength          : 1,
                quantity          : 1,
                inventory_info    : 1,
                productInventory : {
                  $arrayElemAt: ["$productInventory", 0],
                },
              },
            },
            // {
            //   $project: {
            //     medicine_id       : 1,
            //     supplier_id       : 1,
            //     medicine_name     : 1,
            //     medicine_image    : 1,
            //     drugs_name        : 1,
            //     country_of_origin : 1,
            //     dossier_type      : 1,
            //     dossier_status    : 1,
            //     gmp_approvals     : 1,
            //     registered_in     : 1,
            //     comments          : 1,
            //     dosage_form       : 1,
            //     category_name     : 1,
            //     strength          : 1,
            //     quantity          : 1,
            //     "inventory.delivery_info"  : 1,
            //     "inventory.price"          : 1,
            //   },
            // },
            { $skip: offset },
            { $limit: page_size },
            
          ])
            .then((data) => {
              Medicine.countDocuments({supplier_id : supplier_id})
              .then(totalItems => {
                  const totalPages = Math.ceil(totalItems / page_size);

                  const returnObj = {
                    data,
                    totalItems
                  }
                  callback({ code: 200, message: "Supplier product list fetched successfully", result: returnObj });
              })
              .catch((err) => {
                callback({code: 400, message: "Error while fetching supplier product list", result: err});
              })
            })
            .catch((err) => {
              console.log(err);
              callback({ code: 400, message: "Error fetching medicine list", result: err});
            });
      } catch (error) {
        console.log(error);
        callback({ code: 500, message: "Internal Server Error", result: error });
      }
    },

    buyerSupplierOrdersList : async(reqObj, callback) => {
      try {
        const { supplier_id, buyer_id, pageNo, pageSize, order_type } = reqObj

        const page_no   = pageNo || 1
        const page_size = pageSize || 2
        const offset    = (page_no - 1) * page_size

        const orderTypeMatch = order_type ? { order_status: order_type } : {};

        Order.aggregate([
          {
            $match: {
              buyer_id    : buyer_id,
              supplier_id : supplier_id,
            }
          },
          {
            $facet: {
              completedCount: [
                {$match: {order_status : 'completed'}},
                {$count: 'completed'}
              ],
              activeCount: [
                {$match: {order_status : 'active'}},
                {$count: 'active'}
              ],
              pendingCount: [
                {$match: {order_status : 'pending'}},
                {$count: 'pending'}
              ],
              orderList: [
                { $match : orderTypeMatch },
                { $sort  : { created_at: -1 } },
                { $skip  : offset },
                { $limit : page_size },
                {
                  $project: {
                    order_id     : 1,
                    buyer_id     : 1,
                    supplier_id  : 1,
                    items        : 1,
                    order_status : 1,
                    created_at   : 1
                  }
                }
              ],
              totalOrders: [
                { $match: orderTypeMatch },
                { $count: 'total' }
              ]
            }
          },
        ]).then((data) => {
          const resultObj = {
            completedCount : data[0]?.completedCount[0]?.completed || 0,
            activeCount    : data[0]?.activeCount[0]?.active || 0,
            pendingCount   : data[0]?.pendingCount[0]?.pending || 0,
            orderList      : data[0]?.orderList,
            totalOrders    : data[0]?.totalOrders[0]?.total || 0
          }
          callback({code: 200, message : 'buyer supplier order list fetched successfully', result: resultObj})
        })
        .catch((err) => {
          console.log(err);
          callback({code: 400, message : 'error while fetching buyer supplier order list', result: err})
        })
      } catch (error) {
        console.log('Internal Server Error', error)
        callback({code: 500, message : 'Internal server error', result: error})
      }
    },

    buyerDashboardOrderDetails : async(reqObj, callback) => {
      try {
        const { buyer_id } = reqObj

        Order.aggregate([
          {
            $match : {buyer_id : buyer_id}
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
                {$match: {order_status : 'completed'}},
                { 
                  $group: {
                    _id            : null,
                    count          : { $sum: 1 },
                    total_purchase : { $sum: "$numeric_total_price" }
                  }
                },
                { 
                  $project: {
                    _id            : 0,
                    count          : 1,
                    total_purchase : 1
                  }
                }
              ],
              activeCount: [
                {$match: {order_status : 'active'}},
                { 
                  $group: {
                    _id            : null,
                    count          : { $sum: 1 },
                    total_purchase : { $sum: "$numeric_total_price" }
                  }
                },
                { 
                  $project: {
                    _id            : 0,
                    count          : 1,
                    total_purchase : 1
                  }
                }
              ],
              pendingCount: [
                {$match: {order_status : 'pending'}},
                { 
                  $group: {
                    _id            : null,
                    count          : { $sum: 1 },
                    total_purchase : { $sum: "$numeric_total_price" }
                  }
                },
                { 
                  $project: {
                    _id            : 0,
                    count          : 1,
                    total_purchase : 1
                  }
                }
              ],
              totalPurchaseAmount: [
                { 
                  $group: {
                    _id            : null,
                    total_purchase : { $sum: "$numeric_total_price" }
                  }
                },
                { 
                  $project: {
                    _id            : 0,
                    total_purchase : 1
                  }
                }
              ]
            }
          }
        ])
        .then((data) => {
          callback({code: 200, message : 'buyer dashoard order details fetched successfully', result: data[0]})
        })
        .catch((err) => {
          console.log(err);
          callback({code: 400, message : 'error while fetching buyer dashboard order details', result: err})
        })
      } catch (error) {
        console.log('Internal Server Error', error)
        callback({code: 500, message : 'Internal server error', result: error})
      }
    },

    buyerOrderSellerCountry : async(reqObj, callback) => {
      try {
        const { buyer_id } = reqObj

        Order.aggregate([
          {
            $match: {buyer_id : buyer_id}
          },
          {
            $lookup: {
              from         : 'suppliers',
              localField   : 'supplier_id',
              foreignField : 'supplier_id',
              as           : 'supplier'
            }
          },
          {
            $unwind: '$supplier'
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
              _id            : '$supplier.country_of_origin',
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
          callback({code: 200, message : 'buyer seller country fetched successfully', result: data})
        })
        .catch((err) => {
          callback({code: 400, message : 'error while fetching buyer seller country', result: err})
        })
      } catch (error) {
        console.log('Internal Server Error', error)
        callback({code: 500, message : 'Internal server error', result: error})
      }
    }


}