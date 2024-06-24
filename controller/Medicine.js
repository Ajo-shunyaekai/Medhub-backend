const bcrypt            = require("bcrypt");
const jwt               = require("jsonwebtoken");
const Admin             = require("../schema/adminSchema");
const User              = require("../schema/userSchema");
const Medicine          = require("../schema/medicineSchema");
const MedicineInventory = require("../schema/medicineInventorySchema");
const { aggregation }   = require("../common/common")


module.exports = {
  
  addMedicine: async (reqObj, callback) => {
    try {
      let medicine_id = "MED-" + Math.random().toString(16).slice(2);

      const { strength, quantity, unit_price, total_price, shelf_life, type_of_form, est_delivery_days} = reqObj

      if (!Array.isArray(quantity) || !Array.isArray(strength) || !Array.isArray(unit_price) || !Array.isArray(total_price) || 
          !Array.isArray(type_of_form) || !Array.isArray(est_delivery_days) || !Array.isArray(shelf_life) ) {
  
            return callback({code: 400, message: "Inventory fields should be arrays" });
      }

      if (quantity.length !== strength.length || strength.length !== unit_price.length || unit_price.length !== type_of_form.length || 
          type_of_form.length !== est_delivery_days.length || est_delivery_days.length !== shelf_life.length || shelf_life.length !== total_price.length) {
        
           return callback({code: 400, message: "All inventory arrays must have the same length" });
      }
  
      const inventory_info = quantity.map((_, index) => ({
        strength          : strength[index],
        quantity          : quantity[index],
        unit_price        : unit_price[index],
        total_price       : total_price[index],
        shelf_life        : shelf_life[index],
        type_of_form      : type_of_form[index],
        est_delivery_days : est_delivery_days[index]
      }));

      const medicine = new Medicine({
        medicine_id        : medicine_id,
        supplier_id        : reqObj.supplier_id,
        medicine_name      : reqObj.medicine_name,
        composition        : reqObj.composition,
        dossier_type       : reqObj.dossier_type,
        dossier_status     : reqObj.dossier_status,
        gmp_approvals      : reqObj.gmp_approvals,
        shipping_time      : reqObj.shipping_time,
        tags               : reqObj.tags,
        available_for      : reqObj.available_for,
        description        : reqObj.description,
        country_of_origin  : reqObj.country_of_origin,
        registered_in      : reqObj.registered_in,
        medicine_image     : reqObj.medicine_image,
        inventory_info     : inventory_info,
        status             : 1
      });

      medicine.save().then((savedMedicine) => {

        const medicineInventory = new MedicineInventory({
          medicine_id    : savedMedicine.medicine_id,
          supplier_id    : reqObj.supplier_id,
          inventory_info : inventory_info,
          strength       : reqObj.strength,
          status         : 1
        });
        medicineInventory.save()
        .then((data) => {
            return callback({code: 200, message: "Medicine Added Successfully", result: savedMedicine });
        })
        .catch((err) => {
            console.log(err);
            return callback({ code: 400, message: "Error while adding medicine"});
        });
      });
    } catch (error) {
      console.error("Error", error);
      return callback({ code: 500, message: "Internal Server Error" });
    }
  },

  allMedicineList: async (reqObj, callback) => {
    // try {
    //   const {searchKey, pageNo, pageSize, medicine_type, category_name} = reqObj

    //   const page_no   = pageNo || 1
    //   const page_size = pageSize || 10
    //   const offset    = (page_no - 1) * page_size

    //   if(searchKey === '' || searchKey === undefined) {
    //     Medicine.aggregate([
    //       {
    //         $match: {
    //           'medicine_type': medicine_type,
    //         }
    //       },
    //       {
    //         $lookup: {
    //           from         : "medicineinventories",
    //           localField   : "medicine_id",
    //           foreignField : "medicine_id",
    //           as           : "inventory",
    //         },
    //       },
    //       {
    //         $project: {
    //           medicine_id       : 1,
    //           supplier_id       : 1,
    //           medicine_name     : 1,
    //           medicine_image    : 1,
    //           drugs_name        : 1,
    //           country_of_origin : 1,
    //           dossier_type      : 1,
    //           tags              : 1,
    //           dossier_status    : 1,
    //           gmp_approvals     : 1,
    //           registered_in     : 1,
    //           comments          : 1,
    //           dosage_form       : 1,
    //           category_name     : 1,
    //           strength          : 1,
    //           quantity          : 1,
    //           medicine_type     : 1,
    //           inventory : {
    //             $arrayElemAt: ["$inventory", 0],
    //           },
    //         },
    //       },
    //       {
    //         $project: {
    //           medicine_id       : 1,
    //           supplier_id       : 1,
    //           medicine_name     : 1,
    //           medicine_image    : 1,
    //           drugs_name        : 1,
    //           country_of_origin : 1,
    //           dossier_type      : 1,
    //           tags              : 1,
    //           dossier_status    : 1,
    //           gmp_approvals     : 1,
    //           registered_in     : 1,
    //           comments          : 1,
    //           dosage_form       : 1,
    //           category_name     : 1,
    //           strength          : 1,
    //           quantity          : 1,
    //           medicine_type     : 1,
    //           "inventory.delivery_info"  : 1,
    //           "inventory.price"          : 1,
    //         },
    //       },
    //       { $skip: offset },
    //       { $limit: page_size },
    //     ])
    //       .then((data) => {
    //         Medicine.countDocuments({medicine_type : medicine_type})
    //         .then(totalItems => {
    //             const totalPages = Math.ceil(totalItems / page_size);
    //             const returnObj = {
    //               data,
    //               totalPages
    //             }
    //             callback({ code: 200, message: "Medicine list fetched successfully", result: returnObj });
    //         })
    //         .catch((err) => {
    //           callback({ code: 400, message: "Error while fetching medicine count", result: err});
    //         })
    //       })
    //       .catch((err) => {
    //         console.log(err);
    //         callback({ code: 400, message: "Error fetching medicine list", result: err});
    //       });
    //   } else {
    //     Medicine.aggregate([
    //       {
    //         $match: {
    //           $or: [
    //             { 'medicine_name': { $regex: searchKey, $options: 'i' } },
    //             { 'tags': { $elemMatch: { $regex: searchKey, $options: 'i' } } }
    //             // { 'tags': { $regex: searchKey, $options: 'i' } }
    //           ],
    //           'medicine_type': medicine_type,
    //         }
    //       },
    //       {
    //         $project: {
    //           medicine_id       : 1,
    //           supplier_id       : 1,
    //           medicine_name     : 1,
    //           medicine_image    : 1,
    //           drugs_name        : 1,
    //           country_of_origin : 1,
    //           dossier_type      : 1,
    //           tags              : 1,
    //           dossier_status    : 1,
    //           gmp_approvals     : 1,
    //           registered_in     : 1,
    //           comments          : 1,
    //           dosage_form       : 1,
    //           category_name     : 1,
    //           strength          : 1,
    //           quantity          : 1,
    //           medicine_type     : 1,
    //           inventory : {
    //             $arrayElemAt: ["$inventory", 0],
    //           },
    //         }
    //       },
    //       { $skip: offset },
    //       { $limit: page_size },
    //     ])
    //     .then((data) => {
    //       // Medicine.countDocuments({medicine_type : medicine_type})
    //       Medicine.countDocuments({ 
    //         // medicine_name: { $regex: searchKey, $options: 'i' },
    //         // medicine_type: medicine_type 
    //         $or: [
    //           { 'medicine_name': { $regex: searchKey, $options: 'i' } },
    //           { 'tags': { $elemMatch: { $regex: searchKey, $options: 'i' } } }
    //         ],
    //         'medicine_type': medicine_type 
    //       })
    //         .then(totalItems => {
    //             const totalPages = Math.ceil(totalItems / page_size);
    //             const returnObj = {
    //               data,
    //               totalPages
    //             }
    //             callback({ code: 200, message: "Medicine list fetched successfully", result: returnObj });
    //         })
    //         .catch((err) => {
    //           callback({ code: 400, message: "Error while fetching medicine count", result: err});
    //         })
    //       })
    //     .catch((err) => {
    //       callback({ code: 400, message: "Error fetching medicine list", result: err});
    //     });

    //   }
     
    // } 
    
    try {
      const { searchKey, pageNo, pageSize, medicine_type, category_name } = reqObj;

      const page_no   = pageNo || 1;
      const page_size = pageSize || 10;
      const offset    = (page_no - 1) * page_size;
    
      let matchCondition = {
        medicine_type: medicine_type,
      };
    
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
        matchCondition.category_name = category_name;
      }

      let pipeline = [
        {
          $match: matchCondition,
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
            tags              : 1,
            dossier_status    : 1,
            gmp_approvals     : 1,
            registered_in     : 1,
            comments          : 1,
            dosage_form       : 1,
            category_name     : 1,
            strength          : 1,
            quantity          : 1,
            medicine_type     : 1,
            inventory: { $arrayElemAt: ["$inventory", 0] },
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
            tags              : 1,
            dossier_status    : 1,
            gmp_approvals     : 1,
            registered_in     : 1,
            comments          : 1,
            dosage_form       : 1,
            category_name     : 1,
            strength          : 1,
            quantity          : 1,
            medicine_type     : 1,
            "inventory.delivery_info" : 1,
            "inventory.price"         : 1,
          },
        },
        { $skip  : offset },
        { $limit : page_size },
      ];
    
      Medicine.aggregate(pipeline)
        .then((data) => {
          Medicine.countDocuments(matchCondition)
            .then(totalItems => {
              const totalPages = Math.ceil(totalItems / page_size);
              const returnObj = {
                data,
                totalPages
              };
              callback({ code: 200, message: "Medicine list fetched successfully", result: returnObj });
            })
            .catch((err) => {
              callback({ code: 400, message: "Error while fetching medicine count", result: err });
            });
        })
        .catch((err) => {
          callback({ code: 400, message: "Error fetching medicine list", result: err });
        });
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
            callback({ code: 200, message: "Medicine details fetched successfully", result: data });
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

  editMedicine: async (reqObj, callback) => {
    try {
      const medicine          = await Medicine.findOne({ medicine_id: reqObj.medicine_id});
      const medicineInventory = await MedicineInventory.findOne({medicine_id: reqObj.medicine_id,});

      if (!medicine) {
        return callback({ code: 404, message: "Medicine Not Found" });
      }

      if (!medicineInventory) {
        return callback({ code: 404, message: "Medicine Inventory Not Found" });
      }

      const { strength, quantity, unit_price, type_of_form, est_delivery_days} = reqObj

      if (!Array.isArray(quantity) || !Array.isArray(strength) || !Array.isArray(unit_price) || 
          !Array.isArray(type_of_form) || !Array.isArray(est_delivery_days)) {
        return res.status(400).send({ message: 'Inventory fields should be arrays' });
      }
  
      if (quantity.length !== strength.length || strength.length !== unit_price.length || 
          unit_price.length !== type_of_form.length || type_of_form.length !== est_delivery_days.length) {
        return res.status(400).send({ message: 'All inventory arrays must have the same length' });
      }
  
      const inventory_info = quantity.map((_, index) => ({
        strength          : strength[index],
        quantity          : quantity[index],
        unit_price        : unit_price[index],
        type_of_form      : type_of_form[index],
        est_delivery_days : est_delivery_days[index]
      }));

      Medicine.findOneAndUpdate( { medicine_id: reqObj.medicine_id },
        {
          $set: {
            medicine_name  : reqObj.medicine_name,
            composition    : reqObj.composition,
            dossier_type   : reqObj.dossier_type,
            dossier_status : reqObj.dossier_status,
            gmp_approvals  : reqObj.gmp_approvals,
            shipping_time  : reqObj.shipping_time,
            tags           : reqObj.tags,
            available_for  :  reqObj.available_for,
            description    : reqObj.description,
            registered_in  : reqObj.registered_in,
            medicine_image : reqObj.medicine_image,
            inventory_info : inventory_info
          },
        },{new: true}
      ).then((updatedMedicine) => {
        MedicineInventory.findOneAndUpdate({ medicine_id: reqObj.medicine_id },
          {
            $set: {
              inventory_info : inventory_info,
              strength       : reqObj.strength
            },
          },{new: true}
        )
          .then((updatedMedicineInventory) => {
            const resultObj = {updatedMedicine,updatedMedicineInventory}
            callback({code: 200, message: "Medicine Details updated successfully", result: resultObj});
          })
          .catch((err) => {
            callback({ code: 400, message: "Error in updating the Medicine Details", error: err });
          });
      });
     
    } catch (error) {
      callback({ code: 500, message: "Internal server error" });
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
