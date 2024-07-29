const Enquiry              = require('../schema/enquiryListSchema')
const Support            = require('../schema/supportSchema')
const Invoice            = require('../schema/invoiceNumberSchema')
const mongoose           = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports = {

    getEnquiryList : async(reqObj, callback) => {
        try {
        const { supplier_id, buyer_id, status, pageNo, pageSize } = reqObj
        const page_no   = pageNo || 1
        const page_size = pageSize || 2
        const offset    = (page_no - 1) * page_size
        const query = {}
        

        if(!supplier_id) {
            query.buyer_id = buyer_id,
            query.enquiry_status = status 
        } else if(!buyer_id) {
            query.supplier_id = supplier_id,
            query.enquiry_status = status 
        }

        const matchCondition = {};
        if (buyer_id && !supplier_id) {
            matchCondition.buyer_id = buyer_id;
        } else if (supplier_id && !buyer_id) {
            matchCondition.supplier_id = supplier_id;
        }

        if (status) {
            matchCondition.enquiry_status = status;
        }
            Enquiry.aggregate([
                {
                    $match: matchCondition
                },
                {
                    $lookup : {
                        from         : "buyers",
                        localField   : "buyer_id",
                        foreignField : "buyer_id",
                        as           : "buyer_details",
                    }
                },
                {
                    $lookup : {
                        from         : "suppliers",
                        localField   : "supplier_id",
                        foreignField : "supplier_id",
                        as           : "supplier_details",
                    }
                },
                {
                    $project: {
                        enquiry_id : 1,
                        created_at : 1,
                        items : 1,
                        buyer : {
                            $arrayElemAt : ["$buyer_details", 0]
                        },
                        supplier : {
                            $arrayElemAt : ["$supplier_details", 0]
                        },
                    }
                },
                {
                    $project: {
                        enquiry_id : 1,
                        created_at : 1,
                        items : 1,
                        "buyer.buyer_id": 1,
                        "buyer.buyer_name": 1,
                        "buyer.buyer_type": 1,
                        "buyer.buyer_mobile": 1,
                        "buyer.country_of_origin": 1,
                        "supplier.supplier_id": 1,
                        "supplier.supplier_name": 1,
                        "supplier.supplier_type": 1,
                        "supplier.supplier_mobile": 1,
                        "supplier.country_of_origin": 1,
                    }
                },
                {
                    $skip: offset
                },
                {
                    $limit: page_size
                }
            ])
            .then(async(data) => {
                const totalItems = await Enquiry.countDocuments(matchCondition);
                const totalPages = Math.ceil(totalItems / page_size);

                const returnObj = {
                    data,
                    totalPages,
                    totalItems
                };
                callback({code: 200, message: 'Enquiry list', result: returnObj})
            })
            .catch((err) => {
            callback({code: 400, message: 'Error while fetching enquiry list', result: err})
            })
        } catch (error) {
            console.log(error);
        callback({code: 500, message: 'Internal Server Error'})
        }
    },

    getEnquiryDetails: async (reqObj, callback) => {
        try {
          const { enquiry_id } = reqObj;
      
          Enquiry.aggregate([
            {
              $match: { enquiry_id: enquiry_id }
            },
            {
              $lookup: {
                from: "buyers",
                localField: "buyer_id",
                foreignField: "buyer_id",
                as: "buyer_details",
              }
            },
            {
              $lookup: {
                from: "suppliers",
                localField: "supplier_id",
                foreignField: "supplier_id",
                as: "supplier_details",
              }
            },
            {
              $unwind: "$items"
            },
            {
              $lookup: {
                from: "medicines",
                localField: "items.medicine_id",
                foreignField: "medicine_id",
                as: "medicine_details",
              }
            },
            {
              $unwind: {
                path: "$medicine_details",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $group: {
                _id: "$_id",
                enquiry_id: { $first: "$enquiry_id" },
                created_at: { $first: "$created_at" },
                items: { $push: { 
                    _id :  "$items._id",
                  item_id: "$items.item_id",
                  medicine_id: "$items.medicine_id",
                  unit_price: "$items.unit_price",
                  quantity_required: "$items.quantity_required",
                  est_delivery_days: "$items.est_delivery_days",
                  target_price: "$items.target_price",
                  counter_price: "$items.counter_price",
                  status: "$items.status",
                  medicine_details: "$medicine_details"
                }},
                buyer_details: { $first: "$buyer_details" },
                supplier_details: { $first: "$supplier_details" }
              }
            },
            {
              $project: {
                enquiry_id: 1,
                created_at: 1,
                items: 1,
                buyer: { $arrayElemAt: ["$buyer_details", 0] },
                supplier: { $arrayElemAt: ["$supplier_details", 0] }
              }
            },
            {
              $project: {
                enquiry_id: 1,
                created_at: 1,
                items: 1,
                "buyer.buyer_id": 1,
                "buyer.buyer_name": 1,
                "buyer.buyer_type": 1,
                "buyer.buyer_mobile": 1,
                "buyer.country_of_origin": 1,
                "supplier.supplier_id": 1,
                "supplier.supplier_name": 1,
                "supplier.supplier_type": 1,
                "supplier.supplier_mobile": 1,
                "supplier.country_of_origin": 1,
                "supplier.estimated_delivery_time": 1,
                
              }
            }
          ])
          .then((data) => {
            callback({ code: 200, message: 'Enquiry details', result: data[0] });
          })
          .catch((err) => {
            callback({ code: 400, message: 'Error while fetching enquiry details', result: err });
          });
        } catch (error) {
          console.log(error);
          callback({ code: 500, message: 'Internal Server Error' });
        }
    },

    submitQuotation: async (reqObj, callback) => {
      try {
          const { enquiry_id, quotation_details, payment_terms } = reqObj;
  
          const updatedEnquiry = await Enquiry.findOneAndUpdate(
              { enquiry_id: enquiry_id },
              {
                  $set: {
                      quotation_items : quotation_details,
                      payment_terms   : payment_terms
                  }
              },
              { new: true } 
          );
  
          if (!updatedEnquiry) {
              return callback({ code: 404, message: 'Enquiry not found', result: null });
          }
  
          
          for (const detail of quotation_details) {
              if (detail.accepted) {
                  const itemId = ObjectId.isValid(detail.itemId) ? new ObjectId(detail.itemId) : null;
                  
                  await Enquiry.updateOne(
                      { enquiry_id: enquiry_id, 'items._id': itemId },
                      { $set: { 'items.$.status': 'accepted' } }
                  );
              }
          }
  
          callback({ code: 200, message: 'Quotation successfully submitted', result: updatedEnquiry });
      } catch (error) {
          console.log('error', error);
          callback({ code: 500, message: 'Internal server error', result: error });
      }
    }
}    