const bcrypt             = require('bcrypt');
const jwt                = require('jsonwebtoken');
const Buyer              = require('../schema/buyerSchema')
const Supplier           = require('../schema/supplierSchema')
const Order              = require('../schema/orderSchema')

module.exports = {
  
    Regsiter : async(reqObj, callback) => {
        try {
            const emailExists = await Buyer.findOne({email : reqObj.email})
            if(emailExists) {
              return callback({code : 409, message: "Email already exists"})
            }
            const buyerId     = 'BYR-' + Math.random().toString(16).slice(2);
            let jwtSecretKey  = process.env.APP_SECRET; 
            let data          = {  time : Date(),  buyerId : buyerId } 
            const token       = jwt.sign(data, jwtSecretKey); 
  
            const newBuyer = new Buyer({
                buyer_id     : buyerId,
                buyer_name   : reqObj.buyer_name,
                company_name : reqObj.company_name,
                mobile       : reqObj.mobile,
                country_code : reqObj.countryCode,
                email        : reqObj.email,
                password     : reqObj.password,
                token        : token,
                status       : 1
              });
              
              const saltRounds = 10
              bcrypt.genSalt(saltRounds).then((salt) => {
                return bcrypt.hash(newBuyer.password, salt)
              })
              .then((hashedPassword) => {
                newBuyer.password = hashedPassword
                newBuyer.save() .then(() => {
                  callback({code: 200, message: "Buyer Registration Successfull"})
                }).catch((err) => {
                  callback({code: 400 , message: "Buyer Registration Failed"})
                })
              })
              .catch((error) => {
                callback({code: 401});
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
          const buyer = await Buyer.findOne({ email: email });
  
          if (!buyer) {
              console.log('Not found');
              return callback({code: 404, message: "Buyer Not Found"});
          }
  
          const isMatch = await bcrypt.compare(password, buyer.password);
  
          if (isMatch) {
              console.log('Validation successful');
              callback({code : 200, message: "Buyer Login Successfull"});
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
          const buyer_id = reqObj.buyer_id
  
          const buyer    = await Buyer.findOne({ buyer_id: buyer_id });
  
          if (!buyer) {
              return callback({ code: 404, message: 'Buyer Not Found' });
          }

            Buyer.findOneAndUpdate({buyer_id: buyer_id},
              {
                $set: {
                  buyer_name   : reqObj.buyer_name,
                  mobile       : reqObj.mobile,
                  country_code : reqObj.countryCode
  
                }
              },{new: true}
              ).then((updateProfile) => {
                callback({ code: 200, message: 'Buyer Profile updated successfully', result: updateProfile});
              })
              .catch((err) => {
                callback({ code: 400, message: 'Error in updating the buyer profile', error: updateProfile});
              })
        } catch (error) {
          callback({ code: 500, message: 'Internal Server Error', error: error});
        }
    },

    supplierList : async(reqObj, callback) => {
      try {
        const { searchKey, filterCountry } = reqObj

        if(searchKey === '' && filterCountry === '') {
          // console.log('(searchKey ===  filterCountry ===');
          Supplier.find({}).select('supplier_id supplier_name supplier_image country_code mobile supplier_address description license_no country_of_origin contact_person_name designation tags payment_terms estimated_delivery_time') 
          .then((data) => {
            callback({code: 200, message : 'Supplier list fetched successfully', result:data})
        }).catch((error) => {
            console.error('Error:', error);
            callback({code: 400, message : 'Error in fetching users list'})
        });
        } else if(searchKey !== '' && filterCountry === '' ) {
          // console.log('searchKey !==  && filterCountry === ');
          Supplier.find({ supplier_name: { $regex: new RegExp(searchKey, 'i') }}).select('supplier_id supplier_name supplier_image country_code mobile supplier_address description license_no country_of_origin contact_person_name designation tags payment_terms estimated_delivery_time') 
          .then((data) => {
            callback({code: 200, message : 'Supplier list fetched successfully', result:data})
        }).catch((error) => {
            console.error('Error:', error);
            callback({code: 400, message : 'Error in fetching users list'})
        });
        } else if(filterCountry !== '' && searchKey === '') {
          // console.log('filterCountry !==   && searchKey === ');
          Supplier.find({country_of_origin: filterCountry}).select('supplier_id supplier_name supplier_image country_code mobile supplier_address description license_no country_of_origin contact_person_name designation tags payment_terms estimated_delivery_time') 
          .then((data) => {
            callback({code: 200, message : 'Supplier list fetched successfully', result:data})
        }).catch((error) => {
            console.error('Error:', error);
            callback({code: 400, message : 'Error in fetching users list'})
        });

        } else if((searchKey !== '' && searchKey !== undefined) && (filterCountry !== '' && filterCountry !== undefined)) {
          // console.log('searchKey !==  && filterCountry !==  ');
          Supplier.find({ supplier_name: { $regex: new RegExp(searchKey, 'i') }, country_of_origin: filterCountry }).select('supplier_id supplier_name supplier_image country_code mobile supplier_address description license_no country_of_origin contact_person_name designation tags payment_terms estimated_delivery_time') 
          .then((data) => {
            callback({code: 200, message : 'Supplier list fetched successfully', result:data})
        }).catch((error) => {
            console.error('Error:', error);
            callback({code: 400, message : 'Error in fetching users list'})
        });
        } else {
          // console.log('heree');
          Supplier.find({}).select('supplier_id supplier_name supplier_image country_code mobile supplier_address description license_no country_of_origin contact_person_name designation tags payment_terms estimated_delivery_time') 
          .then((data) => {
            callback({code: 200, message : 'Supplier list fetched successfully', result:data})
        }).catch((error) => {
            console.error('Error:', error);
            callback({code: 400, message : 'Error in fetching users list'})
        });
        }
      }catch (error) {
        callback({code: 500, message : 'Internal server error'})
      }
    },

    supplierDetails : async(reqObj, callback) => {
      try {
        Supplier.findOne({supplier_id: reqObj.supplier_id}).select('supplier_id supplier_name supplier_image email mobile country_code supplier_address description license_no country_of_origin contact_person_name designation tags payment_terms estimated_delivery_time') 
        .then((data) => {
          callback({code: 200, message : 'Supplier details fetched successfully', result:data})
      }).catch((error) => {
          console.error('Error:', error);
          callback({code: 400, message : 'Error in fetching supplier details'})
      });
      }catch (error) {
        callback({code: 500, message : 'Internal server error'})
        // callback(500);
      }
    },

    buyerSupplierOrdersList : async(reqObj, callback) => {
      try {
        const {supplier_id, buyer_id} = reqObj

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
              orderList : [
                {$project: {
                  order_id    : 1,
                  buyer_id    : 1,
                  supplier_id : 1,
                  items       : 1,
                  created_at  : 1
                }
              }
              ]
            }
          }
        ]).then((data) => {
          const resultObj = {
            completedCount : data[0]?.completedCount[0]?.completed,
            activeCount    : data[0]?.activeCount[0]?.active,
            pendingCount   : data[0]?.pendingCount[0]?.pending,
            orderList      : data[0]?.orderList
          }
          callback({code: 200, message : 'buyer supplier order list fetched successfully', result: resultObj})
        })
        .catch((err) => {
          console.log(err);
          callback({code: 400, message : 'error while fetching buyer supplier order list', result: err})
        })
      } catch (error) {
        callback({code: 500, message : 'Internal server error', result: error})
      }
    },


}