const bcrypt            = require("bcrypt");
const jwt               = require("jsonwebtoken");
const Admin             = require("../schema/adminSchema");
const User              = require("../schema/userSchema");
const MedicineInventory = require("../schema/medicineInventorySchema");
const { aggregation }   = require("../common/common")
const {Medicine, SecondaryMarketMedicine, NewMedicine }    = require("../schema/medicineSchema");
const {EditMedicine, NewMedicineEdit, SecondaryMarketMedicineEdit} = require('../schema/medicineEditRequestSchema')


module.exports = {
  
  addMedicine: async (reqObj, callback) => {
      try {
        let medicine_id = "MED-" + Math.random().toString(16).slice(2);
        
        const { product_type, supplier_id, medicine_name, composition, strength, type_of_form, shelf_life, 
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
    
            const newMedicine = new NewMedicine({
                medicine_id,
                supplier_id,
                medicine_name,
                medicine_type : product_type,
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
                status : 0
            });
    
            newMedicine.save()
              .then((savedMedicine) => {
                  callback({ code: 200, message: "Add Medicine Request Submitted Medicine Successfully", result: savedMedicine });
              })
              .catch((err) => {
                  console.log(err);
                   callback({ code: 400, message: "Error while adding submitting request" });
              });
           
        } else if(product_type === 'secondary market') {
            const { purchased_on, country_available_in, min_purchase_unit, unit_price, condition, invoice_image, quantity } = reqObj;
    
            const secondaryMarketMedicine = new SecondaryMarketMedicine({
                medicine_id,
                supplier_id,
                medicine_name,
                medicine_type : product_type,
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
                status : 0
            });
    
            secondaryMarketMedicine.save()
              .then((savedMedicine) => {
                callback({ code: 200, message: "Add Medicine Request Submitted Medicine Successfully", result: savedMedicine });
              })
              .catch((err) => {
                  console.log(err);
                  callback({ code: 400, message: "Error while adding submitting request" });
              });
        }
      } catch (error) {
        console.error("Error", error);
          callback({ code: 500, message: "Internal Server Error" });
      }
    // }
  },

//   allMedicineList: async (reqObj, callback) => {
//     try {
//         const { searchKey, pageNo, pageSize, medicine_type, category_name, 
//                 medicine_status, price_range, delivery_time, in_stock } = reqObj;

//         const page_no   = pageNo || 1;
//         const page_size = pageSize || 10;
//         const offset    = (page_no - 1) * page_size;

//         let matchCondition = {
//             medicine_type: medicine_type,
//         };

//         if (medicine_status === 'accepted') {
//             matchCondition.status = 1;
//         } else if (medicine_status === 'rejected') {
//             matchCondition.status = 2;
//         } else {
//             matchCondition.status = 0;
//         }

//         if (searchKey && category_name) {
//             matchCondition.$and = [
//                 {
//                     $or: [
//                         { medicine_name: { $regex: searchKey, $options: 'i' } },
//                         { tags: { $elemMatch: { $regex: searchKey, $options: 'i' } } }
//                     ]
//                 },
//                 { category_name: category_name }
//             ];
//         } else if (searchKey) {
//             matchCondition.$or = [
//                 { medicine_name: { $regex: searchKey, $options: 'i' } },
//                 { tags: { $elemMatch: { $regex: searchKey, $options: 'i' } } }
//             ];
//         } else if (category_name) {
//             matchCondition.medicine_category = category_name;
//         }

// // Apply price range filter
// if (price_range && price_range.length > 0) {
//   const ranges = price_range[0].split(',').map(range => range.trim());

//   const priceConditions = ranges.map(range => {
//       if (range.includes('greater than')) {
//           const value = parseFloat(range.split('greater than')[1].trim());
//           return { "inventory_info.unit_price": { $gt: value } };
//       } else {
//           const [min, max] = range.split('AED')[0].trim().split('-').map(num => parseFloat(num.trim()));
//           return { 
//               "inventory_info.unit_price": { $gte: min, $lte: max } 
//           };
//       }
//   });

//   matchCondition.$or = matchCondition.$or || [];
//   matchCondition.$or.push(...priceConditions);
// }

// // Apply delivery time filter
// if (delivery_time && delivery_time.length > 0) {
//   const ranges = delivery_time[0].split(',').map(range => range.trim());

//   const deliveryConditions = ranges.map(range => {
//       if (range.includes('greater than')) {
//           const value = parseInt(range.split('greater than')[1].trim());
//           return { "inventory_info.est_delivery_days": { $gt: value } };
//       } else {
//           const [min, max] = range.split('-').map(num => parseInt(num.trim()));
//           return { 
//               "inventory_info.est_delivery_days": { $gte: min, $lte: max } 
//           };
//       }
//   });

//   matchCondition.$or = matchCondition.$or || [];
//   matchCondition.$or.push(...deliveryConditions);
// }

// if (in_stock && in_stock.length > 0) {
//   const stockedCountries = in_stock[0].split(',').map(country => country.trim());
//   matchCondition.stocked_in = { $in: stockedCountries };
// }

// console.log('matchCondition', matchCondition);
// console.log('matchCondition', JSON.stringify(matchCondition, null, 2));


//         let pipeline = [
//             {
//                 $match: matchCondition,
//             },
//             {
//                 $lookup: {
//                     from         : "medicineinventories",
//                     localField   : "medicine_id",
//                     foreignField : "medicine_id",
//                     as           : "inventory",
//                 },
//             },
//             {
//                 $project: {
//                     medicine_id       : 1,
//                     supplier_id       : 1,
//                     medicine_name     : 1,
//                     medicine_image    : 1,
//                     drugs_name        : 1,
//                     composition       : 1,
//                     country_of_origin : 1,
//                     dossier_type      : 1,
//                     tags              : 1,
//                     dossier_status    : 1,
//                     gmp_approvals     : 1,
//                     registered_in     : 1,
//                     comments          : 1,
//                     dosage_form       : 1,
//                     category_name     : 1,
//                     strength          : 1,
//                     quantity          : 1,
//                     medicine_type     : 1,
//                     inventory         : { $arrayElemAt: ["$inventory", 0] },
//                 },
//             },
//             {
//                 $project: {
//                     medicine_id       : 1,
//                     supplier_id       : 1,
//                     medicine_name     : 1,
//                     medicine_image    : 1,
//                     drugs_name        : 1,
//                     composition       : 1,
//                     country_of_origin : 1,
//                     dossier_type      : 1,
//                     tags              : 1,
//                     dossier_status    : 1,
//                     gmp_approvals     : 1,
//                     registered_in     : 1,
//                     comments          : 1,
//                     dosage_form       : 1,
//                     category_name     : 1,
//                     strength          : 1,
//                     quantity          : 1,
//                     medicine_type     : 1,
//                     "inventory.delivery_info" : 1,
//                     "inventory.price"         : 1,
//                 },
//             },
//             // { $skip  : offset },
//             // { $limit : page_size },
//         ];
  

//         Medicine.aggregate(pipeline)
//             .then((data) => {
//                 Medicine.countDocuments(matchCondition)
//                     .then(totalItems => {
//                         const totalPages = Math.ceil(totalItems / page_size);
//                         const returnObj = {
//                             data,
//                             totalPages,
//                             totalItems
//                         };
//                         callback({ code: 200, message: "Medicine list fetched successfully", result: returnObj });
//                     })
//                     .catch((err) => {
//                         callback({ code: 400, message: "Error while fetching medicine count", result: err });
//                     });
//             })
//             .catch((err) => {
//                 callback({ code: 400, message: "Error fetching medicine list", result: err });
//             });
//     } catch (error) {
//         callback({ code: 500, message: "Internal Server Error", result: error });
//     }

   
//   },


  allMedicineList: async (reqObj, callback) => {
    try {
        const { searchKey, pageNo, pageSize, medicine_type, category_name, 
                medicine_status, price_range, delivery_time, in_stock } = reqObj;

        const page_no   = pageNo || 1;
        const page_size = pageSize || 10;
        const offset    = (page_no - 1) * page_size;

        let matchCondition = {
            medicine_type: medicine_type,
        };

        if (medicine_status === 'accepted') {
            matchCondition.status = 1;
        } else if (medicine_status === 'rejected') {
            matchCondition.status = 2;
        } else {
            matchCondition.status = 0;
        }

        if (searchKey && category_name) {
            matchCondition.$and = [
                {
                    $or: [
                        { medicine_name : { $regex: searchKey, $options: 'i' } },
                        { tags          : { $elemMatch: { $regex: searchKey, $options: 'i' } } }
                    ]
                },
                { category_name: category_name }
            ];
        } else if (searchKey) {
            matchCondition.$or = [
                { medicine_name : { $regex: searchKey, $options: 'i' } },
                { tags          : { $elemMatch: { $regex: searchKey, $options: 'i' } } }
            ];
        } else if (category_name) {
            matchCondition.medicine_category = category_name;
        }

        if (in_stock && in_stock.length > 0) {
            const stockedCountries    = in_stock[0].split(',').map(country => country.trim());
            matchCondition.stocked_in = { $in: stockedCountries };
        }

        let pipeline = [
            {
                $match: matchCondition,
            }
        ];

        if (price_range && price_range.length > 0) {
            const ranges = price_range[0].split(',').map(range => range.trim());
            const priceConditions = ranges.map(range => {
                if (range.includes('greater than')) {
                    const value = parseFloat(range.split('greater than')[1].trim());
                    return { "inventory_info.unit_price": { $gt: value.toString() } };
                } else {
                    const [min, max] = range.split('AED')[0].trim().split('-').map(num => parseFloat(num.trim()));
                    return { 
                        "inventory_info.unit_price": { $gte: min.toString(), $lte: max.toString() } 
                    };
                }
            });
            pipeline.push({ $match: { $or: priceConditions } });
        }

        if (delivery_time && delivery_time.length > 0) {
            const ranges = delivery_time[0].split(',').map(range => range.trim());
            const deliveryConditions = ranges.map(range => {
                if (range.includes('greater than')) {
                    const value = parseInt(range.split('greater than')[1].trim());
                    return { "inventory_info.est_delivery_days": { $gt: value.toString() } };
                } else {
                    const [min, max] = range.split('-').map(num => parseInt(num.trim()));
                    // return { 
                    //     "inventory_info.est_delivery_days": { $gte: min, $lte: max } 
                    // };
                    return { 
                      "inventory_info.est_delivery_days": { $gte: min.toString(), $lte: max.toString() } 
                    };
                }
            });
            pipeline.push({ $match: { $or: deliveryConditions } });
        }

        pipeline.push(
            {
                $project: {
                    medicine_id       : 1,
                    supplier_id       : 1,
                    medicine_name     : 1,
                    medicine_image    : 1,
                    drugs_name        : 1,
                    composition       : 1,
                    country_of_origin : 1,
                    dossier_type      : 1,
                    tags              : 1,
                    dossier_status    : 1,
                    gmp_approvals     : 1,
                    medicine_category : 1,
                    registered_in     : 1,
                    comments          : 1,
                    dosage_form       : 1,
                    category_name     : 1,
                    strength          : 1,
                    quantity          : 1,
                    medicine_type     : 1,
                    stocked_in        : 1,
                    "inventory_info.unit_price"        : 1,
                    "inventory_info.est_delivery_days" : 1,
                    "inventory_info.total_price"       : 1,
                }
            },
            { $skip  : offset },
            { $limit : page_size }
        );

        // console.log('pipeline', JSON.stringify(pipeline, null, 2));

        const data = await Medicine.aggregate(pipeline);

        // Count total items matching the condition
        const totalItems = await Medicine.countDocuments(matchCondition);
        const totalPages = Math.ceil(totalItems / page_size);

        const returnObj = {
            data,
            totalPages,
            totalItems
        };

        callback({ code: 200, message: "Medicine list fetched successfully", result: returnObj });
    } catch (error) {
        callback({ code: 500, message: "Internal Server Error", result: error });
    }
  },

  getMedicineDetails: async (reqObj, callback) => {
    try {
      Medicine.aggregate([
        {
          $match: { medicine_id: reqObj.medicine_id },
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
          $project: {
            medicine_id    : 1,
            supplier_id    : 1,
            medicine_name  : 1,
            composition    : 1,
            dossier_type   : 1,
            dossier_status : 1,
            gmp_approvals  : 1,
            shipping_time  : 1,
            tags           : 1,
            available_for  : 1,
            description    : 1,
            registered_in  : 1,
            inventory_info : 1,
            medicine_image : 1,
            inventory : {
              $arrayElemAt: ["$inventory", 0],
            },
          },
        },
        {
          $project: {
            medicine_id    : 1,
            supplier_id    : 1,
            medicine_name  : 1,
            composition    : 1,
            dossier_type   : 1,
            dossier_status : 1,
            gmp_approvals  : 1,
            shipping_time  : 1,
            tags           : 1,
            available_for  : 1,
            description    : 1,
            registered_in  : 1,
            inventory_info : 1,
            medicine_image : 1,
            "inventory.inventory_info" : 1,
            "inventory.strength"       : 1,
          },
        },
        {
          $lookup: {
            from         : "suppliers",
            localField   : "supplier_id",
            foreignField : "supplier_id",
            as           : "supplier",
          },
        },
        {
          $project: {
            medicine_id    : 1,
            supplier_id    : 1,
            medicine_name  : 1,
            composition    : 1,
            dossier_type   : 1,
            dossier_status : 1,
            gmp_approvals  : 1,
            shipping_time  : 1,
            tags           : 1,
            available_for  : 1,
            description    : 1,
            registered_in  : 1,
            inventory_info : 1,
            medicine_image : 1,
            "inventory.inventory_info" : 1,
            "inventory.strength"       : 1,
            supplier : {
              $arrayElemAt: ["$supplier", 0],
            },
          },
        },
        {
          $project: {
            medicine_id    : 1,
            supplier_id    : 1,
            medicine_name  : 1,
            composition    : 1,
            dossier_type   : 1,
            dossier_status : 1,
            gmp_approvals  : 1,
            shipping_time  : 1,
            tags           : 1,
            available_for  : 1,
            description    : 1,
            registered_in  : 1,
            inventory_info : 1,
            medicine_image : 1,
            "inventory.inventory_info" : 1,
            "inventory.strength"       : 1,
            "supplier.supplier_id"             : 1, 
            "supplier.supplier_name"           : 1,
            "supplier.description"             : 1,
            "supplier.estimated_delivery_time" : 1,
            "supplier.tags"                    : 1,
            "supplier.license_no"              : 1,
            "supplier.supplier_address"        : 1,
            "supplier.payment_terms"           : 1,
            "supplier.country_of_origin"       : 1,
          },
        },
      ])
        .then((data) => {
          if (data.length) {
            callback({ code: 200, message: "Medicine details fetched successfully", result: data[0] });
          } else {
            callback({code: 400, message: "Medicine with requested id not found", result: data });
          }
        })
        .catch((err) => {
          callback({code: 400, message: "Error fetching medicine details", result: err });
        });
    } catch (error) {
      callback({ code: 500, message: "Internal server error", result: error });
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

  medicineEditList : async (reqObj, callback) => {
    try {
      const { status, pageNo, pageSize, medicine_id, supplier_id } = reqObj

        const page_no   = pageNo || 1
        const page_size = pageSize || 10
        const offset    = (page_no - 1) * page_size

        EditMedicine.find({edit_status: status, supplier_id: supplier_id}).sort({createdAt: -1}).skip(offset).limit(page_size)
        .then((data) => {
          callback({code: 200, message: 'Medicine Edit List', result: data})
        })
        .catch((err) => {
        callback({code: 400, message: 'Error while fetching medicine edit list', result: err})
        })
    } catch (error) {
      callback({code: 500, message: 'Internal server error', result: error})
    }
  },

  filterMedicine: async (reqObj, callback) => {  
    try {
      let matchConditions = {};
  
      if (reqObj.category_name && reqObj.category_name !== "") {
          matchConditions.category_name = reqObj.category_name;
      }
  
      if (reqObj.medicine_name && reqObj.medicine_name !== "") {
          matchConditions.medicine_name = reqObj.medicine_name;
      }

      const aggregatePipeline = aggregation(reqObj, matchConditions)

      Medicine.aggregate(aggregatePipeline).then((result) => {
          console.log(result.length);
          callback({code: 200, message: `Filtered Medicine lists`, result: result});
      }).catch((err) => {
        console.log(err);
          callback({ code: 400, message: "Error in filtering", result: err });
      });
    } catch (error) {
      callback({ code: 500, message: "Internal Server Error", result: error });
    }
  },

  similarMedicineList: async (reqObj, callback) => {
    try {
      const {medicine_name, medicine_id, medicine_type, supplier_id, pageNo, pageSize} = reqObj
      
      const page_no   = pageNo || 1
      const page_size = pageSize || 10
      const offset    = (page_no - 1) * page_size

        Medicine.aggregate([
          {
            $match : {
              medicine_type : medicine_type,
              medicine_name : medicine_name,
              supplier_id   : supplier_id,
              medicine_id: { $ne: medicine_id}
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
              "inventory.delivery_info"  : 1,
              "inventory.price"          : 1,
            },
          },
          { $skip  : offset },
          { $limit : page_size },
        ])
          .then((data) => {
            Medicine.countDocuments()
            .then(totalItems => {
                const totalPages = Math.ceil(totalItems / page_size);
                const returnObj = {
                  data, 
                  totalPages
                }
                callback({ code: 200, message: "Medicine list fetched successfully", result: returnObj });
            })
            .catch((err) => {
              callback({ code: 400, message:  " Error while fetching siliar medicine list count", result: returnObj });
            })
          })
          .catch((err) => {
            console.log(err);
            callback({ code: 400, message: "Error fetching medicine list", result: err});
          });
    } catch (error) {
      callback({ code: 500, message: "Internal Server Error", result: error });
    }
  },

};
