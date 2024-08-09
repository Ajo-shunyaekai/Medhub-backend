const Enquiry  = require('../schema/enquiryListSchema')
const Support  = require('../schema/supportSchema')
const Invoice  = require('../schema/invoiceNumberSchema')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Notification       = require('../schema/notificationSchema')

module.exports = {

    getEnquiryList : async(reqObj, callback) => {
        try {
        const { supplier_id, buyer_id, status, pageNo, pageSize } = reqObj
        const page_no   = pageNo || 1
        const page_size = pageSize || 2
        const offset    = (page_no - 1) * page_size
        // const query     = {enquiry_status: {$ne: 'order created'}}
        
        // if(!supplier_id) {
        //     query.buyer_id = buyer_id
        //     // query.enquiry_status = status 
        // } else if(!buyer_id) {
        //     query.supplier_id = supplier_id
        //     // query.enquiry_status = status 
        // }

        const matchCondition = {enquiry_status: {$ne: 'order created'}};
        if (buyer_id && !supplier_id) {
            matchCondition.buyer_id = buyer_id;
        } else if (supplier_id && !buyer_id) {
            matchCondition.supplier_id = supplier_id;
        }

        // if (status) {
        //     matchCondition.enquiry_status = status;
        // }
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
                        items      : 1,
                        enquiry_status     : 1,
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
                        items      : 1,
                        enquiry_status     : 1,
                        "buyer.buyer_id"             : 1,
                        "buyer.buyer_name"           : 1,
                        "buyer.buyer_type"           : 1,
                        "buyer.buyer_mobile"         : 1,
                        "buyer.country_of_origin"    : 1,
                        "supplier.supplier_id"       : 1,
                        "supplier.supplier_name"     : 1,
                        "supplier.supplier_type"     : 1,
                        "supplier.supplier_mobile"   : 1,
                        "supplier.country_of_origin" : 1,
                    }
                },
                {
                    $sort: { created_at: -1 }
                },
                {
                    $skip: offset
                },
                {
                    $limit: page_size
                },
                
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
                        from         : "buyers",
                        localField   : "buyer_id",
                        foreignField : "buyer_id",
                        as           : "buyer_details",
                    }
                },
                {
                    $lookup: {
                        from         : "suppliers",
                        localField   : "supplier_id",
                        foreignField : "supplier_id",
                        as           : "supplier_details",
                    }
                },
                {
                    $unwind: "$items"
                },
                {
                    $lookup: {
                        from         : "medicines",
                        localField   : "items.medicine_id",
                        foreignField : "medicine_id",
                        as           : "medicine_details",
                    }
                },
                {
                    $unwind: {
                        path : "$medicine_details",
                        preserveNullAndEmptyArrays : true
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        enquiry_id      : { $first: "$enquiry_id" },
                        created_at      : { $first: "$created_at" },
                        quotation_items : { $first: "$quotation_items" },
                        payment_terms   : { $first: "$payment_terms" },
                        items: {
                            $push: {
                                _id               : "$items._id",
                                item_id           : "$items.item_id",
                                medicine_id       : "$items.medicine_id",
                                unit_price        : "$items.unit_price",
                                quantity_required : "$items.quantity_required",
                                est_delivery_days : "$items.est_delivery_days",
                                target_price      : "$items.target_price",
                                counter_price     : "$items.counter_price",
                                status            : "$items.status",
                                medicine_details : "$medicine_details"
                            }
                        },
                        buyer_details    : { $first: "$buyer_details" },
                        supplier_details : { $first: "$supplier_details" }
                    }
                },
                {
                    $addFields: {
                        hasQuotationItems: { $gt: [{ $size: "$quotation_items" }, 0] }
                    }
                },
                {
                    $facet: {
                        withQuotationItems: [
                            { $match  : { hasQuotationItems: true } },
                            { $unwind : "$quotation_items" },
                            {
                                $lookup: {
                                    from         : "medicines",
                                    localField   : "quotation_items.medicine_id",
                                    foreignField : "medicine_id",
                                    as           : "quotation_medicine_details",
                                }
                            },
                            {
                                $unwind: {
                                    path: "$quotation_medicine_details",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $group: {
                                    _id        : "$_id",
                                    enquiry_id : { $first: "$enquiry_id" },
                                    created_at : { $first: "$created_at" },
                                    quotation_items: {
                                        $push: {
                                            _id               : "$quotation_items._id",
                                            item_id           : "$quotation_items.item_id",
                                            medicine_id       : "$quotation_items.medicine_id",
                                            unit_price        : "$quotation_items.unit_price",
                                            quantity_required : "$quotation_items.quantity_required",
                                            est_delivery_days : "$quotation_items.est_delivery_days",
                                            target_price      : "$quotation_items.target_price",
                                            counter_price     : "$quotation_items.counter_price",
                                            status            : "$quotation_items.status",
                                            medicine_details  : "$quotation_medicine_details"
                                        }
                                    },
                                    payment_terms    : { $first: "$payment_terms" },
                                    items            : { $first: "$items" },
                                    buyer_details    : { $first: "$buyer_details" },
                                    supplier_details : { $first: "$supplier_details" }
                                }
                            }
                        ],
                        withoutQuotationItems: [
                            { $match: { hasQuotationItems: false } },
                            {
                                $group: {
                                    _id              : "$_id",
                                    enquiry_id       : { $first: "$enquiry_id" },
                                    created_at       : { $first: "$created_at" },
                                    quotation_items  : { $first: "$quotation_items" },
                                    payment_terms    : { $first: "$payment_terms" },
                                    items            : { $first: "$items" },
                                    buyer_details    : { $first: "$buyer_details" },
                                    supplier_details : { $first: "$supplier_details" }
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        result: {
                            $setUnion: [
                                "$withQuotationItems",
                                "$withoutQuotationItems"
                            ]
                        }
                    }
                },
                {
                    $unwind: "$result"
                },
                {
                    $replaceRoot: {
                        newRoot: "$result"
                    }
                },
                {
                    $addFields: {
                        buyer_details    : { $arrayElemAt: ["$buyer_details", 0] },
                        supplier_details : { $arrayElemAt: ["$supplier_details", 0] }
                    }
                },
                {
                    $project: {
                        enquiry_id      : 1,
                        created_at      : 1,
                        quotation_items : 1,
                        payment_terms   : 1,
                        items           : 1,
                        "buyer.buyer_id"                      : "$buyer_details.buyer_id",
                        "buyer.buyer_name"                    : "$buyer_details.buyer_name",
                        "buyer.buyer_address"                 : "$buyer_details.buyer_address",
                        "buyer.buyer_email"                   : "$buyer_details.buyer_email",
                        "buyer.contact_person_email"          : "$buyer_details.contact_person_email",
                        "buyer.contact_person_mobile"         : "$buyer_details.contact_person_mobile",
                        "buyer.contact_person_country_code"   : "$buyer_details.contact_person_country_code",
                        "buyer.buyer_type"                    : "$buyer_details.buyer_type",
                        "buyer.buyer_mobile"                  : "$buyer_details.buyer_mobile",
                        "buyer.country_of_origin"             : "$buyer_details.country_of_origin",
                        "buyer.buyer_image"                   : "$buyer_details.buyer_image",
                        "buyer.registration_no"               : "$buyer_details.registration_no",
                        "supplier.supplier_id"                : "$supplier_details.supplier_id",
                        "supplier.supplier_name"              : "$supplier_details.supplier_name",
                        "supplier.supplier_type"              : "$supplier_details.supplier_type",
                        "supplier.supplier_mobile"            : "$supplier_details.supplier_mobile",
                        "supplier.supplier_email"             : "$supplier_details.supplier_email",
                        "supplier.contact_person_email"       : "$supplier_details.contact_person_email",
                        "supplier.country_of_origin"          : "$supplier_details.country_of_origin",
                        "supplier.estimated_delivery_time"    : "$supplier_details.estimated_delivery_time",
                        "supplier.supplier_address"           : "$supplier_details.supplier_address",
                        "supplier.supplier_image"             : "$supplier_details.supplier_image",
                        "supplier.registration_no"            : "$supplier_details.registration_no",
                        "supplier.contact_person_mobile_no"   : "$supplier_details.contact_person_mobile_no",
                        "supplier.contact_person_country_code": "$supplier_details.contact_person_country_code",
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
          const { enquiry_id, quotation_details, payment_terms, buyer_id, supplier_id } = reqObj;
  
          const updatedEnquiry = await Enquiry.findOneAndUpdate(
              { enquiry_id : enquiry_id },
              {
                  $set: {
                      quotation_items : quotation_details,
                      payment_terms   : payment_terms,
                      enquiry_status  : 'Quotation submitted'
                  }
              },
              { new: true } 
          );
  
          if (!updatedEnquiry) {
              return callback({ code: 404, message: 'Enquiry not found', result: null });
          }

          for (const detail of quotation_details) {
            //   if (detail.accepted) {
                  const itemId = ObjectId.isValid(detail.itemId) ? new ObjectId(detail.itemId) : null;
                  
                  await Enquiry.updateOne(
                      { enquiry_id: enquiry_id, 'items._id': itemId },
                      { $set: { 'items.$.status': 'Quotation submitted' } }
                  );
            //   }
          }
          const notificationId = 'NOT-' + Math.random().toString(16).slice(2);
      const newNotification = new Notification({
        notification_id         : notificationId,
        event_type   : 'Enquiry quotation',
        event : 'enquiry',
        from : 'supplier',
        to : 'buyer',
        from_id : supplier_id,
        to_id : buyer_id,
        event_id : enquiry_id,
        message : 'Enquiry quotation submitted',
        status : 0
    })
    await newNotification.save()
          callback({ code: 200, message: 'Quotation successfully submitted', result: updatedEnquiry });
      } catch (error) {
          console.log('error', error);
          callback({ code: 500, message: 'Internal server error', result: error });
      }
    },

    acceptRejectQuotation: async (reqObj, callback) => {
        try {
            const { enquiry_id, item_id, buyer_id, new_status } = reqObj;

            const itemId = ObjectId.isValid(item_id) ? new ObjectId(item_id) : null;
    
            const updatedEnquiry = await Enquiry.findOneAndUpdate(
                { enquiry_id: enquiry_id, buyer_id: buyer_id, 'quotation_items._id': itemId },
                {
                    $set: {
                        'quotation_items.$.status': new_status,
                    }
                },
                {
                    new: true,
                    // arrayFilters: [{ 'quotation_items._id': itemId }] 
                }
            );
            if (!updatedEnquiry) {
                return callback({ code: 404, message: 'Enquiry not found', result: null });
            }
    
            callback({ code: 200, message: 'Quotation updated successfully', result: updatedEnquiry });
        } catch (error) {
            console.log('error', error);
            callback({ code: 500, message: 'Internal server error', result: error });
        }
    },

    cancelEnquiry: async (reqObj, callback) => {
        try {
            const { supplier_id, buyer_id, status, enquiry_id } = reqObj;

            const updatedEnquiry = await Enquiry.findOneAndUpdate(
                { enquiry_id: enquiry_id },
                {
                    $set: {
                        enquiry_status         : 'cancelled',
                        'items.$[elem].status' : 'cancelled'
                    }
                },
                {
                    arrayFilters: [{ 'elem.status': { $ne: 'cancelled' } }],
                    new: true
                }
            );
            if (!updatedEnquiry) {
                return callback({ code: 404, message: 'Enquiry not found', result: null });
            }
            callback({ code: 200, message: 'Enquiry cancelled successfully', result: updatedEnquiry });
        } catch (error) {
            console.log(error);
            callback({ code: 500, message: 'Internal Server Error', result: error });
        }
    }
    
    
}    