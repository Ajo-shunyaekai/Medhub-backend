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

      const medicine = new Medicine({
        medicine_id           : medicine_id,
        medicine_name         : reqObj.medicine_name,
        generic_name          : reqObj.generic_name,
        description           : reqObj.description,
        dosage_form           : reqObj.dosage_form,
        strength              : reqObj.strength,
        manufacturer          : reqObj.manufacturer,
        category_name         : reqObj.category_name,
        indications           : reqObj.indications,
        side_effects          : reqObj.side_effects,
        prescription_required : reqObj.prescription_required,
        storage_conditions    : reqObj.storage_conditions,
        medicine_image        : reqObj.medicine_image,
      });

      medicine.save().then((savedMedicine) => {

        const quantityArray  = reqObj.quantity.map((value, index) => ({strength: reqObj.strength[index], value: Number(value) }));
        const unitPriceArray = reqObj.unit_price.map((value, index) => ({strength: reqObj.strength[index], value: Number(value) }));

        const medicineInventory = new MedicineInventory({
          medicine_id   : savedMedicine.medicine_id,
          batch_number  : reqObj.batch_number,
          expiry_date   : reqObj.expiry_date,
          quantity      : quantityArray,
          unit_price    : unitPriceArray,
          location      : reqObj.location,
          supplier      : reqObj.supplier,
          received_date : reqObj.received_date,
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
    try {
      Medicine.aggregate([
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
            medicine_name  : 1,
            medicine_image : 1,
            inventory : {
              $arrayElemAt: ["$inventory", 0],
            },
          },
        },
        {
          $project: {
            medicine_id           : 1,
            medicine_name         : 1,
            medicine_image        : 1,
            "inventory.quantity"  : 1,
            "inventory.price"     : 1,
          },
        },
      ])
        .then((data) => {
          callback({code: 200, message: "Medicine list fetched successfully", result: data});
        })
        .catch((err) => {
          callback({ code: 400, message: "Error fetching medicine list", result: err});
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
            medicine_id           : 1,
            medicine_name         : 1,
            generic_name          : 1,
            description           : 1,
            category_name         : 1,
            medicine_image        : 1,
            strength              : 1,
            dosage_form           : 1,
            manufacturer          : 1,
            indications           : 1,
            side_effects          : 1,
            prescription_required : 1,
            storage_conditions    : 1,
            inventory: {
              $arrayElemAt: ["$inventory", 0],
            },
          },
        },
        {
          $project: {
            medicine_id               : 1,
            medicine_name             : 1,
            generic_name              : 1,
            description               : 1,
            category_name             : 1,
            medicine_image            : 1,
            strength                  : 1,
            dosage_form               : 1,
            manufacturer              : 1,
            indications               : 1,
            side_effects              : 1,
            prescription_required     : 1,
            storage_conditions        : 1,
            "inventory.quantity"      : 1,
            "inventory.unit_price"    : 1,
            "inventory.batch_number"  : 1,
            "inventory.location"      : 1,
            "inventory.supplier"      : 1,
            "inventory.expiry_date"   : 1,
            "inventory.received_date" : 1,
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
      const unitPriceArray = reqObj.unit_price.map((price, index) => ({ strength: reqObj.strength[index], value: price}));
      const quantityArray  = reqObj.quantity.map((qty, index) => ({ strength: reqObj.strength[index], value: qty}));

      Medicine.findOneAndUpdate( { medicine_id: reqObj.medicine_id },
        {
          $set: {
            medicine_name         : reqObj.medicine_name,
            description           : reqObj.description,
            product_image         : reqObj.product_image,
            category_name         : reqObj.category_name,
            generic_name          : reqObj.generic_name,
            dosage_form           : reqObj.dosage_form,
            manufacturer          : reqObj.manufacturer,
            prescription_required : reqObj.prescription_required,
            storage_conditions    : reqObj.storage_conditions,
            strength              : reqObj.strength,
            indications           : reqObj.indications,
            side_effects          : reqObj.side_effects,
          },
        },{new: true}
      ).then((updatedMedicine) => {
        MedicineInventory.findOneAndUpdate({ medicine_id: reqObj.medicine_id },
          {
            $set: {
              batch_number  : reqObj.batch_number,
              location      : reqObj.location,
              expiry_date   : reqObj.expiry_date,
              quantity      : quantityArray,
              received_date : reqObj.received_date,
              supplier      : reqObj.supplier,
              unit_price    : unitPriceArray,
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

};
