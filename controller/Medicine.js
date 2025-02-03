const bcrypt            = require("bcrypt");
const jwt               = require("jsonwebtoken");
const Admin             = require("../schema/adminSchema");
const Supplier          = require("../schema/supplierSchema");
const MedicineInventory = require("../schema/medicineInventorySchema");
const { aggregation }   = require("../common/common")
const {Medicine, SecondaryMarketMedicine, NewMedicine }    = require("../schema/medicineSchema");
const {EditMedicine, NewMedicineEdit, SecondaryMarketMedicineEdit} = require('../schema/medicineEditRequestSchema')
const Notification             = require('../schema/notificationSchema')
const sendEmail                = require('../utils/emailService')
const {getTodayFormattedDate}  = require('../utils/utilities');
const { flattenData } = require("../utils/csvConverter");
const { parse } = require('json2csv');
const fs = require('fs');
const path = require('path');
const logErrorToFile = require("../logs/errorLogs");
const { sendErrorResponse } = require("../utils/commonResonse");


 // Send email to the admin
 const sendAdminEmail = (supplierName, medicineName, description, productCategory) => {
  const adminEmail = 'platform@medhub.global';
  const subject = `New Product Submission: Approval Required`;
  const body = `
    <p>Dear Admin,</p>
    <p>We hope this message finds you well.</p>
    <p>A supplier has submitted a new product for approval on Medhub Global. Please review the details below:</p>
    <ul>
      <li>Supplier Name: ${supplierName}</li>
      <li>Product Name: ${medicineName}</li>
      <li>Product Description: ${description}</li>
      <li>Product Category: ${productCategory}</li>
      <li>Submission Date: ${getTodayFormattedDate()}</li>
    </ul>
    <p>To proceed, please review the product details and approve or reject the submission based on your assessment.</p>
    <p>Best regards,<br/>MedHub Global Team</p>
  `;
  // return sendMailFunc(adminEmail, subject, body);
  return sendEmail(adminEmail, subject, body)
 }

module.exports = {

  getMedicineByName: async (req, res, reqObj, callback) => {
    try {
      Medicine.aggregate([
        {
          $match: { 
            medicine_name : { $regex: `^${reqObj.medicine_name}$`, $options: 'i' },
            medicine_type : reqObj.medicine_type,
            status        : 1
          },
        },
        {
          $limit: 1
        }
      ])
      .then((data) => {
        callback({ code: 200, message: "Medicine details fetched successfully", result: data[0] });
      })
      .catch((err) => {
        callback({ code: 400, message: "Medicine details fetched successfully", result: err });
      })
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  addMedicine: async (req, res, reqObj, callback) => {
    try {
      const medicine_id = "MED-" + Math.random().toString(16).slice(2, 10);
  
      let stockedInDetails = reqObj.stocked_in_details;
      if (typeof stockedInDetails === 'string') {
        try {
          stockedInDetails = JSON.parse(stockedInDetails);
        } catch (err) {
          return callback({ code: 400, message: "Invalid format for stocked_in_details" });
        }
      }
      
      const {
        product_type, supplier_id, medicine_name, composition  = '', strength, type_of_form, shelf_life,
        dossier_type, dossier_status, product_category, total_quantity, gmp_approvals, shipping_time, tags,
        unit_tax, country_of_origin, stocked_in, registered_in, available_for, description, medicine_image,
        manufacturer_name, manufacturer_country_of_origin, manufacturer_description, quantity, unit_price,
        est_delivery_days, purchased_on, country_available_in, min_purchase_unit, condition, invoice_image
      } = reqObj;

      const supplierDetails = await Supplier?.findOne({supplier_id})
  
      if (![quantity, unit_price, est_delivery_days].every(Array.isArray)) {
        return callback({ code: 400, message: "Inventory fields should be arrays" });
      }
  
      if (quantity.length !== unit_price.length || unit_price.length !== est_delivery_days.length) {
        return callback({ code: 400, message: "All inventory arrays must have the same length" });
      }
  
      const inventory_info = quantity.map((_, index) => ({
        quantity          : quantity[index],
        unit_price        : unit_price[index],
        // total_price       : total_price[index],
        est_delivery_days : est_delivery_days[index],
      }));
  
      // Create medicine object
      const medicineData = {
        medicine_id,
        supplier_id,
        supplierId : supplierDetails?._id,
        medicine_name,
        // composition,
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
        unit_tax,
        country_of_origin,
        stocked_in,
        registered_in,
        available_for,
        description,
        medicine_image,
        inventory_info,
        manufacturer_name,
        manufacturer_country_of_origin,
        manufacturer_description,
        stockedIn_details: stockedInDetails,
        status: 0,
        edit_status: 0
      };
  
      // Save the medicine based on product type
      let newMedicine;
      if (product_type === 'new') {
        newMedicine = new NewMedicine({ ...medicineData });
      } else if (product_type === 'secondary market') {
        newMedicine = new SecondaryMarketMedicine({
          ...medicineData,
          purchased_on,
          country_available_in,
          min_purchase_unit,
          condition,
          invoice_image
        });
      }
      const savedMedicine = await newMedicine.save();
  
      // Create a notification
      const notificationId = 'NOT-' + Math.random().toString(16).slice(2, 10);
      const event = product_type === 'new' ? 'addnewmedicinerequest' : 'addsecondarymedicinerequest';
      const newNotification = new Notification({
        notification_id : notificationId,
        event_type      : product_type === 'new' ? 'New Medicine Request' : 'New Secondary Medicine Request',
        event,
        from     : 'supplier',
        to       : 'admin',
        from_id  : supplier_id,
        event_id : medicine_id,
        message  : `${product_type === 'new' ? 'New medicine' : 'New secondary medicine'} request from ${supplier_id}`,
        status   : 0
      });
      const supplier = await Supplier.findOne({ supplier_id: supplier_id });
      
      await Promise.all([
        newNotification.save(),
        sendAdminEmail(supplier.supplier_name, medicine_name, description, product_category)
      ]);
  
      callback({ code: 200, message: "Add Medicine Request Submitted Successfully", result: savedMedicine });
  
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  allMedicineList: async (req, res, reqObj, callback) => {
    try {
        const { searchKey, pageNo, pageSize, medicine_type, supplier_id, category_name, 
                medicine_status, price_range, delivery_time, in_stock } = reqObj;

        const page_no   = pageNo || 1;
        const page_size = pageSize || 10;
        const offset    = (page_no - 1) * page_size;

        let matchCondition = {
            medicine_type: medicine_type,
        };

        if (supplier_id) {
          matchCondition.supplier_id = supplier_id;
      }

        if (medicine_status === 'accepted') {
            matchCondition.status = 1;
        } else if (medicine_status === 'rejected') {
            matchCondition.status = 2;
        }  else if (medicine_status === 'pending') {
          matchCondition.status = 0;
      }
        else {
            matchCondition.status = 1;
        }


        if (searchKey && category_name) {
          matchCondition.$and = [
              {
                  $or: [
                      { medicine_name : { $regex: searchKey, $options: 'i' } },
                      { tags          : { $elemMatch: { $regex: searchKey, $options: 'i' } } }
                  ]
              },
              { medicine_category: category_name }  // Ensure the field name is correct
          ];
      } else if (searchKey) {
          matchCondition.$or = [
              { medicine_name : { $regex: searchKey, $options: 'i' } },
              { tags          : { $elemMatch: { $regex: searchKey, $options: 'i' } } }
          ];
      } else if (category_name) {
          matchCondition.medicine_category = category_name;  // Use correct field
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
            $sort: { created_at: -1 }
        },
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
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  getMedicineDetails: async (req, res, reqObj, callback) => {
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
            medicine_id                    : 1,
            supplier_id                    : 1,
            medicine_name                  : 1,
            medicine_type                  : 1,
            composition                    : 1,
            dossier_type                   : 1,
            dossier_status                 : 1,
            gmp_approvals                  : 1,
            shipping_time                  : 1,
            tags                           : 1,
            available_for                  : 1,
            description                    : 1,
            registered_in                  : 1,
            inventory_info                 : 1,
            medicine_image                 : 1,
            invoice_image                  : 1,
            strength                       : 1,
            medicine_category              : 1,
            total_quantity                 : 1,
            stocked_in                     : 1,
            shelf_life                     : 1,
            type_of_form                   : 1,
            country_of_origin              : 1,
            purchased_on                   : 1,
            unit_price                     : 1,
            country_available_in           : 1,
            min_purchase_unit              : 1,
            condition                      : 1,
            unit_tax                       : 1,
            manufacturer_country_of_origin : 1,
            manufacturer_description       : 1,
            manufacturer_name              : 1,
            stockedIn_details              : 1,
            edit_status                    : 1,
            inventory : {
              $arrayElemAt: ["$inventory", 0],
            },
          },
        },
        {
          $project: {
            medicine_id                    : 1,
            supplier_id                    : 1,
            medicine_name                  : 1,
            medicine_type                  : 1,
            composition                    : 1,
            dossier_type                   : 1,
            dossier_status                 : 1,
            gmp_approvals                  : 1,
            shipping_time                  : 1,
            tags                           : 1,
            available_for                  : 1,
            description                    : 1,
            registered_in                  : 1,
            inventory_info                 : 1,
            medicine_image                 : 1,
            invoice_image                  : 1,
            strength                       : 1,
            medicine_category              : 1,
            total_quantity                 : 1,
            stocked_in                     : 1,
            shelf_life                     : 1,
            type_of_form                   : 1,
            country_of_origin              : 1,
            purchased_on                   : 1,
            unit_price                     : 1,
            country_available_in           : 1,
            min_purchase_unit              : 1,
            condition                      : 1,
            unit_tax                       : 1,
            manufacturer_country_of_origin : 1,
            manufacturer_description       : 1,
            manufacturer_name              : 1,
            stockedIn_details              : 1,
            edit_status                    : 1,
            "inventory.inventory_info"     : 1,
            "inventory.strength"           : 1,
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
            medicine_id                    : 1,
            supplier_id                    : 1,
            medicine_name                  : 1,
            medicine_type                  : 1,
            composition                    : 1,
            dossier_type                   : 1,
            dossier_status                 : 1,
            gmp_approvals                  : 1,
            shipping_time                  : 1,
            tags                           : 1,
            available_for                  : 1,
            description                    : 1,
            registered_in                  : 1,
            inventory_info                 : 1,
            medicine_image                 : 1,
            invoice_image                  : 1,
            strength                       : 1,
            medicine_category              : 1,
            total_quantity                 : 1,
            stocked_in                     : 1,
            shelf_life                     : 1,
            type_of_form                   : 1,
            country_of_origin              : 1,
            purchased_on                   : 1,
            unit_price                     : 1,
            country_available_in           : 1,
            min_purchase_unit              : 1,
            condition                      : 1,
            unit_tax                       : 1,
            manufacturer_country_of_origin : 1,
            manufacturer_description       : 1,
            manufacturer_name              : 1,
            stockedIn_details              : 1,
            edit_status                    : 1,
            "inventory.inventory_info"     : 1,
            "inventory.strength"           : 1,
            supplier : {
              $arrayElemAt: ["$supplier", 0],
            },
          },
        },
        {
          $project: {
            medicine_id                    : 1,
            supplier_id                    : 1,
            medicine_name                  : 1,
            medicine_type                  : 1,
            composition                    : 1,
            dossier_type                   : 1,
            dossier_status                 : 1,
            gmp_approvals                  : 1,
            shipping_time                  : 1,
            tags                           : 1,
            available_for                  : 1,
            description                    : 1,
            registered_in                  : 1,
            inventory_info                 : 1,
            medicine_image                 : 1,
            invoice_image                  : 1,
            strength                       : 1,
            medicine_category              : 1,
            total_quantity                 : 1,
            stocked_in                     : 1,
            shelf_life                     : 1,
            type_of_form                   : 1,
            country_of_origin              : 1,
            purchased_on                   : 1,
            unit_price                     : 1,
            country_available_in           : 1,
            min_purchase_unit              : 1,
            condition                      : 1,
            unit_tax                       : 1,
            manufacturer_country_of_origin : 1,
            manufacturer_description       : 1,
            manufacturer_name              : 1,
            stockedIn_details              : 1,
            edit_status                    : 1,
            "inventory.inventory_info"             : 1,
            "inventory.strength"                   : 1,
            "supplier.supplier_id"                 : 1, 
            "supplier.supplier_name"               : 1,
            "supplier.supplier_email"              : 1,
            "supplier.description"                 : 1,
            "supplier.estimated_delivery_time"     : 1,
            "supplier.tags"                        : 1,
            "supplier.license_no"                  : 1,
            "supplier.supplier_address"            : 1,
            "supplier.payment_terms"               : 1,
            "supplier.country_of_origin"           : 1,
            "supplier.supplier_type"               : 1,
            "supplier.contact_person_name"         : 1,
            "supplier.supplier_country_code"       : 1,
            "supplier.supplier_mobile"             : 1,
            "supplier.contact_person_email"        : 1,
            "supplier.contact_person_mobile_no"    : 1,
            "supplier.contact_person_country_code" : 1,
            "supplier.tax_no"                      : 1,
            "supplier.supplier_type"               : 1,
            "supplier.country_of_operation"        : 1,
          },
        },
      ])
        .then(async(data) => {
          if (data.length) {
            const distinctCountries = await Medicine.distinct("stocked_in");
            const responseData = {
              data: data[0],
              countryAvailable: distinctCountries
            }
            callback({ code: 200, message: "Medicine details fetched successfully", result: responseData });
          } else {
            callback({code: 400, message: "Medicine with requested id not found", result: data });
          }
        })
        .catch((err) => {
          callback({code: 400, message: "Error fetching medicine details", result: err });
        });
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  editMedicine : async (req, res, reqObj, callback) => {
    try {
      let stockedInDetails = reqObj.stocked_in_details;

      if (typeof stockedInDetails === 'string') {
          try {
              stockedInDetails = JSON.parse(stockedInDetails);
          } catch (err) {
              return callback({ code: 400, message: "Invalid format for stocked_in_details" });
          }
      }
      const { medicine_id, product_type, supplier_id, medicine_name, composition, strength, type_of_form, shelf_life, 
              dossier_type, dossier_status, product_category, total_quantity, gmp_approvals, shipping_time, tags, 
              unit_tax, country_of_origin, stocked_in, registered_in, available_for, description, medicine_image,
              manufacturer_name, manufacturer_country_of_origin, manufacturer_description, stocked_in_details,
              quantity, unit_price, est_delivery_days, purchased_on, country_available_in, min_purchase_unit, condition, invoice_image
             } = reqObj;

             const supplier = await Supplier.findOne({ supplier_id: supplier_id });

             if (!Array.isArray(quantity) || !Array.isArray(unit_price) ||
              !Array.isArray(est_delivery_days)) {
             return callback({ code: 400, message: "Inventory fields should be arrays" });
           }
       
           if (quantity.length !== unit_price.length || unit_price.length !== est_delivery_days.length) {
             return callback({ code: 400, message: "All inventory fields are required" });
           }
       
           const inventory_info = quantity.map((_, index) => ({
             quantity          : quantity[index],
             unit_price        : unit_price[index],
            //  total_price       : total_price[index],
             est_delivery_days : est_delivery_days[index],
           }));
       
           let newMedicine;

        if (product_type === 'new') {
            const newMedicineObj = {
              medicine_id,
              supplier_id,
              medicine_name,
              medicine_type : 'new_medicine',
              // composition,
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
              unit_tax,
              country_of_origin,
              registered_in,
              stocked_in,
              available_for,
              description,
              medicine_image,
              inventory_info,
              manufacturer_name,
              manufacturer_country_of_origin,
              manufacturer_description,
              stockedIn_details : stockedInDetails,
              edit_status: 0
            };

            const medicine = await Medicine.findOne({ supplier_id: supplier_id, medicine_id: medicine_id });

              if (!medicine) {
                  return callback({ code: 404, message: 'Medicine Not Found' });
              }

              const newMedEdit = new NewMedicineEdit(newMedicineObj)

              newMedEdit.save()
              .then(async(savedMedicine) => {
                const updatedMedicine = await Medicine.findOneAndUpdate(
                  { supplier_id: supplier_id, medicine_id: medicine_id },
                  { edit_status: 0 },
                  { new: true }
                );
              
                if (!updatedMedicine) {
                  return callback({ code: 404, message: 'Medicine Not Found' });
                }

                const notificationId = 'NOT-' + Math.random().toString(16).slice(2, 10)
                const event = product_type === 'new' ? 'editnewmedicinerequest' : 'editsecondarymedicinerequest';
                const newNotification = new Notification({
                  notification_id : notificationId,
                  event_type      :  'New Medicine Edit Request',
                  event           : 'editnewmedicinerequest',
                  from            : 'supplier',
                  to              : 'admin',
                  from_id         : supplier_id,
                  event_id        : medicine_id,
                  message         : `New Edit Medicine Request from ${supplier_id}`,
                  status          : 0
                });
                await newNotification.save();

                const adminEmail = 'platform@medhub.global';
                const subject    = `New Product Edit Request: Approval Required`;
                const body = `
                          <p>Dear Admin,</p>
                          <p>We hope this message finds you well.</p>
                          <p>A supplier has submitted a new edit product request for approval on MedHub Global. Please review the details below:</p>
                          <ul>
                            <li>Supplier Name: ${supplier.supplier_name}</li>
                            <li>Product Name: ${medicine_name}</li>
                            <li>Product Description: ${description}</li>
                            <li>Product Category: ${product_category}</li>
                            <li>Submission Date: ${getTodayFormattedDate()}</li>
                          </ul>
                          <p>To proceed, please review the product details and approve or reject the submission based on your assessment.</p>
                          <p>Best regards,<br/>MedHub Global Team</p>
                        `;
              // sendMailFunc(adminEmail, subject, body);
              await sendEmail(adminEmail, subject, body )

                  callback({ code: 200, message: "Edit Medicine Request Submitted Successfully", result: savedMedicine });
              })
              .catch((err) => {
                  console.log(err);
                  callback({ code: 400, message: "Error while submitting request" });
              });
   
      } 
      else if(product_type === 'secondary market') {
          const secondaryMarketMedicineObj = {
              medicine_id,
              supplier_id,
              medicine_name,
              medicine_type : 'secondary_medicine',
              purchased_on,
              country_available_in,
              min_purchase_unit,
              // composition,
              strength,
              type_of_form,
              shelf_life,
              dossier_type,
              dossier_status,
              medicine_category : product_category,
              gmp_approvals,
              shipping_time,
              tags,
              unit_tax,
              country_of_origin,
              registered_in,
              stocked_in,
              available_for,
              description,
              total_quantity,
              condition,
              inventory_info,
              medicine_image,
              invoice_image,
              manufacturer_name,
              manufacturer_country_of_origin,
              manufacturer_description,
              stockedIn_details: stockedInDetails,
              edit_status : 0
          };

          const secondaryMedEdit = new SecondaryMarketMedicineEdit(secondaryMarketMedicineObj)
          
          secondaryMedEdit.save()
          .then(async(savedMedicine) => {
            const updatedMedicine = await Medicine.findOneAndUpdate(
              { supplier_id : supplier_id, medicine_id: medicine_id },
              { edit_status : 0 },
              { new         : true }
            );
          
            if (!updatedMedicine) {
              return callback({ code: 404, message: 'Medicine Not Found' });
            }
            const notificationId = 'NOT-' + Math.random().toString(16).slice(2, 10)
            const newNotification = new Notification({
              notification_id : notificationId,
              event_type      : 'Secondary Medicine Edit Request',
              event           : 'editsecondarymedicinerequest',
              from            : 'supplier',
              to              : 'admin',
              from_id         : supplier_id,
              event_id        : medicine_id,
              message         : `New Secondary Medicine Edit Request from ${supplier_id}`,
              status          : 0
            });
            await newNotification.save();

            const adminEmail = 'platform@medhub.global';
            const subject = `New Product Edit Request: Approval Required`;
            const body = `
                      <p>Dear Admin,</p>
                      <p>We hope this message finds you well.</p>
                      <p>A supplier has submitted a new edit product request for approval on Medhub Global. Please review the details below:</p>
                      <ul>
                        <li>Supplier Name: ${supplier.supplier_name}</li>
                        <li>Product Name: ${medicine_name}</li>
                        <li>Product Description: ${description}</li>
                        <li>Product Category: ${product_category}</li>
                        <li>Submission Date: ${getTodayFormattedDate()}</li>
                      </ul>
                      <p>To proceed, please review the product details and approve or reject the submission based on your assessment.</p>
                      <p>Best regards,<br/>MedHub Global Team</p>
                    `;
          // sendMailFunc(adminEmail, subject, body);
          await sendEmail(adminEmail, subject, body )
              callback({ code: 200, message: "Edit Medicine Request Submitted Successfully", result: savedMedicine });
          })
          .catch((err) => {
              console.log(err);
              callback({ code: 400, message: "Error while submitting request" });
          });
      }
    }catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
   }
  },

//   editMedicine: async (req, res, reqObj, callback) => {
//     try {
//         // Parse stockedInDetails and inventoryInfo if they are strings
//         let stockedInDetails = reqObj.stocked_in_details;
//         let inventoryInfo = [];

//         console.log('reqObj', reqObj);

//         // Parse JSON strings if needed
//         if (typeof stockedInDetails === 'string') {
//             try {
//                 stockedInDetails = JSON.parse(stockedInDetails);
//             } catch (err) {
//                 return callback({ code: 400, message: "Invalid format for stocked_in_details" });
//             }
//         }

//         if (typeof inventoryInfo === 'string') {
//             try {
//                 inventoryInfo = JSON.parse(inventoryInfo);
//             } catch (err) {
//                 return callback({ code: 400, message: "Invalid format for inventory_info" });
//             }
//         }

//         // Transform arrays into proper format for registered_in, stocked_in, and medicine_image
//         // const registeredInArray = Array.isArray(reqObj.registered_in) ? reqObj.registered_in : [reqObj.registered_in];
//         // const stockedInArray = Array.isArray(reqObj.stocked_in) ? reqObj.stocked_in : [reqObj.stocked_in];
//         // const medicineImageArray = Array.isArray(reqObj.medicine_image) ? reqObj.medicine_image : [reqObj.medicine_image];

//         // // Validate required fields
//         // const requiredFields = [
//         //     'medicine_id', 'supplier_id', 'medicine_name',
//         //     'medicine_category', 'strength', 'type_of_form', 'shelf_life',
//         //     'dossier_type', 'dossier_status', 'total_quantity', 'gmp_approvals',
//         //     'shipping_time', 'unit_tax', 'country_of_origin', 'available_for',
//         //     'description', 'manufacturer_name', 'manufacturer_country_of_origin',
//         //     'manufacturer_description'
//         // ];

//         // const missingFields = requiredFields.filter(field => !reqObj[field]);
//         // if (missingFields.length > 0) {
//         //     return callback({ 
//         //         code: 400, 
//         //         message: `Missing required fields: ${missingFields.join(', ')}` 
//         //     });
//         // }

//         // Transform the request object to match the schema requirements
//         // const transformedReqObj = {
//         //     medicine_id:  reqObj.medicine_id,
//         //     supplier_id:  reqObj.supplier_id ,
//         //     medicine_name: { value: reqObj.medicine_name },
//         //     composition: { value: reqObj.composition },
//         //     strength: { value: reqObj.strength },
//         //     type_of_form: { value: reqObj.type_of_form },
//         //     shelf_life: { value: reqObj.shelf_life },
//         //     dossier_type: { value: reqObj.dossier_type },
//         //     dossier_status: { value: reqObj.dossier_status },
//         //     medicine_category: { value: reqObj.medicine_category },
//         //     total_quantity: { value: reqObj.total_quantity },
//         //     gmp_approvals: { value: reqObj.gmp_approvals },
//         //     shipping_time: { value: reqObj.shipping_time },
//         //     unit_tax: { value: reqObj.unit_tax },
//         //     country_of_origin: { value: reqObj.country_of_origin },
//         //     available_for: { value: reqObj.available_for },
//         //     description: { value: reqObj.description },
//         //     manufacturer_name: { value: reqObj.manufacturer_name },
//         //     manufacturer_country_of_origin: { value: reqObj.manufacturer_country_of_origin },
//         //     manufacturer_description: { value: reqObj.manufacturer_description },
//         //     edit_status: 0 ,
//         //     status: 0 ,
//         //     // Handle array fields properly
//         //     tags: reqObj.tags ? reqObj.tags.split(',').map(tag => ({
//         //         value: tag.trim(),
//         //         isChanged: true
//         //     })) : [],
            
//         //     registered_in: registeredInArray.map(country => ({
//         //         value: country,
//         //         isChanged: true
//         //     })),
            
//         //     stocked_in: stockedInArray.map(country => ({
//         //         value: country,
//         //         isChanged: true
//         //     })),
            
//         //     medicine_image: medicineImageArray.map(image => ({
//         //         value: image,
//         //         isChanged: true
//         //     })),
            
//         //     // Handle nested arrays
//         //     stockedIn_details: stockedInDetails.map(detail => ({
//         //         stocked_in_country: { value: detail.stocked_in_country, isChanged: true },
//         //         stocked_quantity: { value: detail.stocked_quantity, isChanged: true },
//         //         stocked_in_type: { value: detail.stocked_in_type, isChanged: true }
//         //     })),
            
//         //     // inventory_info: inventoryInfo.map(info => ({
//         //     //     quantity: { value: info.quantity, isChanged: true },
//         //     //     unit_price: { value: info.unit_price, isChanged: true },
//         //     //     est_delivery_days: { value: info.est_delivery_days, isChanged: true }
//         //     // }))

//         //     inventory_info: reqObj.quantity.map((qty, index) => ({
//         //       quantity: { value: qty, isChanged: true },
//         //       unit_price: { value: reqObj.unit_price[index], isChanged: true },
//         //       est_delivery_days: { value: reqObj.est_delivery_days[index], isChanged: true }
//         //   }))
          
//         // };

//         // Fetch the original medicine data
//         // const originalMedicine = await Medicine.findOne({ 
//         //     medicine_id: reqObj.medicine_id, 
//         //     supplier_id: reqObj.supplier_id 
//         // });
        
//         // if (!originalMedicine) {
//         //     return callback({ code: 404, message: "Original medicine not found" });
//         // }
//         // Fetch the original medicine data
//         const originalMedicine = await Medicine.findOne({ 
//           medicine_id: reqObj.medicine_id, 
//           supplier_id: reqObj.supplier_id 
//       });
      
//       if (!originalMedicine) {
//           return callback({ code: 404, message: "Original medicine not found" });
//       }

//       // Compare and set isChanged based on original data
//       const setIsChanged = (newValue, originalValue) => newValue !== originalValue;

//       const transformedReqObj = {
//           medicine_id: reqObj.medicine_id,
//           supplier_id: reqObj.supplier_id,
//           medicine_name: { value: reqObj.medicine_name, isChanged: setIsChanged(reqObj.medicine_name, originalMedicine.medicine_name) },
//           composition: { value: reqObj.composition, isChanged: setIsChanged(reqObj.composition, originalMedicine.composition) },
//           strength: { value: reqObj.strength, isChanged: setIsChanged(reqObj.strength, originalMedicine.strength) },
//           type_of_form: { value: reqObj.type_of_form, isChanged: setIsChanged(reqObj.type_of_form, originalMedicine.type_of_form) },
//           shelf_life: { value: reqObj.shelf_life, isChanged: setIsChanged(reqObj.shelf_life, originalMedicine.shelf_life) },
//           dossier_type: { value: reqObj.dossier_type, isChanged: setIsChanged(reqObj.dossier_type, originalMedicine.dossier_type) },
//           dossier_status: { value: reqObj.dossier_status, isChanged: setIsChanged(reqObj.dossier_status, originalMedicine.dossier_status) },
//           medicine_category: { value: reqObj.medicine_category, isChanged: setIsChanged(reqObj.medicine_category, originalMedicine.medicine_category) },
//           total_quantity: { value: reqObj.total_quantity, isChanged: setIsChanged(reqObj.total_quantity, originalMedicine.total_quantity) },
//           gmp_approvals: { value: reqObj.gmp_approvals, isChanged: setIsChanged(reqObj.gmp_approvals, originalMedicine.gmp_approvals) },
//           shipping_time: { value: reqObj.shipping_time, isChanged: setIsChanged(reqObj.shipping_time, originalMedicine.shipping_time) },
//           unit_tax: { value: reqObj.unit_tax, isChanged: setIsChanged(reqObj.unit_tax, originalMedicine.unit_tax) },
//           country_of_origin: { value: reqObj.country_of_origin, isChanged: setIsChanged(reqObj.country_of_origin, originalMedicine.country_of_origin) },
//           available_for: { value: reqObj.available_for, isChanged: setIsChanged(reqObj.available_for, originalMedicine.available_for) },
//           description: { value: reqObj.description, isChanged: setIsChanged(reqObj.description, originalMedicine.description) },
//           manufacturer_name: { value: reqObj.manufacturer_name, isChanged: setIsChanged(reqObj.manufacturer_name, originalMedicine.manufacturer_name) },
//           manufacturer_country_of_origin: { value: reqObj.manufacturer_country_of_origin, isChanged: setIsChanged(reqObj.manufacturer_country_of_origin, originalMedicine.manufacturer_country_of_origin) },
//           manufacturer_description: { value: reqObj.manufacturer_description, isChanged: setIsChanged(reqObj.manufacturer_description, originalMedicine.manufacturer_description) },
//           edit_status: 0,
//           status: 0,
//           tags: reqObj.tags ? reqObj.tags.split(',').map(tag => ({
//               value: tag.trim(),
//               isChanged: !originalMedicine.tags.some(originalTag => originalTag === tag.trim())
//           })) : [],
//           registered_in: (Array.isArray(reqObj.registered_in) ? reqObj.registered_in : [reqObj.registered_in]).map(country => ({
//               value: country,
//               isChanged: !originalMedicine.registered_in.some(originalCountry => originalCountry === country)
//           })),
//           stocked_in: (Array.isArray(reqObj.stocked_in) ? reqObj.stocked_in : [reqObj.stocked_in]).map(country => ({
//               value: country,
//               isChanged: !originalMedicine.stocked_in.some(originalCountry => originalCountry === country)
//           })),
//           medicine_image: (Array.isArray(reqObj.medicine_image) ? reqObj.medicine_image : [reqObj.medicine_image]).map(image => ({
//               value: image,
//               isChanged: !originalMedicine.medicine_image.some(originalImage => originalImage === image)
//           })),
//           stockedIn_details: stockedInDetails.map(detail => ({
//               stocked_in_country: { value: detail.stocked_in_country, isChanged: setIsChanged(detail.stocked_in_country, originalMedicine.stockedIn_details.find(d => d.stocked_in_country === detail.stocked_in_country)?.stocked_in_country) },
//               stocked_quantity: { value: detail.stocked_quantity, isChanged: setIsChanged(detail.stocked_quantity, originalMedicine.stockedIn_details.find(d => d.stocked_in_country === detail.stocked_in_country)?.stocked_quantity)},
//               stocked_in_type: { value: detail.stocked_in_type, isChanged: setIsChanged(detail.stocked_in_type, originalMedicine.stockedIn_details.find(d => d.stocked_in_country === detail.stocked_in_country)?.stocked_in_type) }
//           })),
//           inventory_info: reqObj.quantity.map((qty, index) => ({
//               quantity: { value: qty, isChanged: setIsChanged(qty, originalMedicine.inventory_info[index]?.quantity) },
//               unit_price: { value: reqObj.unit_price[index], isChanged: setIsChanged(reqObj.unit_price[index], originalMedicine.inventory_info[index]?.unit_price) },
//               est_delivery_days: { value: reqObj.est_delivery_days[index], isChanged: setIsChanged(reqObj.est_delivery_days[index], originalMedicine.inventory_info[index]?.est_delivery_days) }
//           }))
//       };

  
//         // Save the edit request based on product type
//         let savedEditRequest;
//         if (reqObj.product_type === 'new') {
//             const newMedEdit = new NewMedicineEdit(transformedReqObj);
//             savedEditRequest = await newMedEdit.save();
//         } else if (reqObj.product_type === 'secondary market') {
//             const secondaryMedEdit = new SecondaryMarketMedicineEdit(transformedReqObj);
//             savedEditRequest = await secondaryMedEdit.save();
//         } else {
//             return callback({ code: 400, message: "Invalid product type" });
//         }

//         // Update the original medicine's edit status
//         const updatedMedicine = await Medicine.findOneAndUpdate(
//             { 
//                 medicine_id: reqObj.medicine_id, 
//                 supplier_id: reqObj.supplier_id 
//             },
//             { edit_status: 0 },
//             { new: true }
//         );

//         if (!updatedMedicine) {
//             return callback({ code: 404, message: "Failed to update medicine edit status" });
//         }

//         // Create notification and send email
//         const notificationId = 'NOT-' + Math.random().toString(16).slice(2, 10);
//         const notificationEvent = reqObj.product_type === 'new' ? 'editnewmedicinerequest' : 'editsecondarymedicinerequest';
//         const newNotification = new Notification({
//             notification_id: notificationId,
//             event_type: reqObj.product_type === 'new' ? 'New Medicine Edit Request' : 'Secondary Medicine Edit Request',
//             event: notificationEvent,
//             from: 'supplier',
//             to: 'admin',
//             from_id: reqObj.supplier_id,
//             event_id: reqObj.medicine_id,
//             message: `New ${reqObj.product_type} Edit Medicine Request from ${reqObj.supplier_id}`,
//             status: 0,
//         });
//         await newNotification.save();

//         // Send email
//         const adminEmail = 'ajo@shunyaekai.tech';
//         const subject = `New Product Edit Request: Approval Required`;
//         const body = `
//             <p>Dear Admin,</p>
//             <p>A supplier has submitted a new edit product request for approval on MedHub Global. Details:</p>
//             <ul>
//                 <li>Supplier Name: ${reqObj.supplier_name}</li>
//                 <li>Product Name: ${reqObj.medicine_name}</li>
//                 <li>Submission Date: ${getTodayFormattedDate()}</li>
//             </ul>
//             <p>Best regards,<br/>MedHub Global Team</p>
//         `;
//         await sendEmail(adminEmail, subject, body);

//         callback({ code: 200, message: "Edit Medicine Request Submitted Successfully", result: savedEditRequest });
//     } catch (error) {
//         console.error("Internal Server Error:", error);
//         logErrorToFile(error, req);
//         return callback({ code: 500, message: "An unexpected error occurred. Please try again later." });
//     }
// },

  
  

  medicineEditList : async (req, res, reqObj, callback) => {
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
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  filterMedicine: async (req, res, reqObj, callback) => {  
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
          callback({code: 200, message: `Filtered Medicine lists`, result: result});
      }).catch((err) => {
        console.log(err);
          callback({ code: 400, message: "Error in filtering", result: err });
      });
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  similarMedicineList: async (req, res, reqObj, callback) => {
    try {
      const {
        medicine_name, medicine_id, medicine_type, status, supplier_id,
        pageNo, pageSize, price_range, quantity_range, delivery_time, in_stock, searchKey
      } = reqObj;
  
      const page_no   = pageNo || 1;
      const page_size = pageSize || 10;
      const offset    = (page_no - 1) * page_size;
  
      let matchCondition = {
        medicine_type : medicine_type,
        medicine_name : medicine_name,
        status        : status,
        // medicine_id: { $ne: medicine_id }
      };
  
      if (in_stock && in_stock.length > 0) {
        const stockedCountries = in_stock[0].split(',').map(country => country.trim());
        matchCondition.stocked_in = { $in: stockedCountries };
      }
  
      let pipeline = [
        {
          $lookup: {
            from         : "suppliers",
            localField   : "supplier_id",
            foreignField : "supplier_id",
            as           : "supplier",
          },
        },
        {
          $unwind : "$supplier"
        },
        {
          $match : matchCondition,
        },
        {
          $unwind : "$inventory_info"
        },
        {
          $addFields: {
            "inventory_info.unit_price_numeric_str": {
              $regexFind: { input: "$inventory_info.unit_price", regex: "[0-9.]+" }
            },
            "inventory_info.est_delivery_days_numeric_str": {
              $regexFind: { input: "$inventory_info.est_delivery_days", regex: "[0-9]+" }
            }
          }
        },
        {
          $addFields: {
            "inventory_info.unit_price_num": {
              $toDouble: "$inventory_info.unit_price_numeric_str.match"
            },
            "inventory_info.est_delivery_days_num": {
              $toInt: "$inventory_info.est_delivery_days_numeric_str.match"
            }
          }
        },
      ];
  
      if (searchKey) {
        pipeline.push({
          $match: {
            $or: [
              { "supplier.supplier_name": { $regex: searchKey, $options: 'i' } }
            ]
          }
        });
      }
  
      if (price_range && price_range.length > 0) {
        const ranges = price_range[0].split(',').map(range => range.trim());
        const priceConditions = ranges.map(range => {
          if (range.includes('greater than')) {
            const value = parseFloat(range.split('greater than')[1].trim());
            return { "inventory_info.unit_price_num": { $gt: value } };
          } else {
            const [min, max] = range.split('AED')[0].trim().split('-').map(num => parseFloat(num.trim()));
            return { "inventory_info.unit_price_num": { $gte: min, $lt: max } };
          }
        });
        pipeline.push({ $match: { $or: priceConditions } });
      }
  
      if (quantity_range && quantity_range.length > 0) {
        const ranges = quantity_range[0].split(',').map(range => range.trim());
        const quantityConditions = ranges.map(range => {
          if (range.includes('greater than')) {
            const value = parseFloat(range.split('greater than')[1].trim());
            return { "inventory_info.quantity": { $gt: value.toString() } };
          } else {
            const [min, max] = range.split('-').map(num => parseFloat(num.trim()));
            return { "inventory_info.quantity": { $gte: min.toString(), $lt: max.toString() } };
          }
        });
        pipeline.push({ $match: { $or: quantityConditions } });
      }
  
      if (delivery_time && delivery_time.length > 0) {
        const ranges = delivery_time[0].split(',').map(range => range.trim());
        const deliveryConditions = ranges.map(range => {
          if (range.includes('greater than')) {
            const value = parseInt(range.split('greater than')[1].trim());
            return { "inventory_info.est_delivery_days_num": { $gt: value } };
          } else {
            const [min, max] = range.split('-').map(num => parseInt(num.trim()));
            return { "inventory_info.est_delivery_days_num": { $gte: min, $lt: max } };
          }
        });
        pipeline.push({ $match: { $or: deliveryConditions } });
      }
  
      pipeline.push(
        {
          $group: {
            _id: {
              medicine_id          : '$medicine_id',
              medicine_type        : '$medicine_type',
              medicine_name        : '$medicine_name',
              status               : '$status',
              supplier_id          : '$supplier_id',
              country_of_origin    : '$country_of_origin',
              dossier_type         : '$dossier_type',
              dossier_status       : '$dossier_status',
              tags                 : '$tags',
              gmp_approvals        : '$gmp_approvals',
              registered_in        : '$registered_in',
              comments             : '$comments',
              dosage_form          : '$dosage_form',
              category_name        : '$category_name',
              strength             : '$strength',
              total_quantity       : '$total_quantity',
              shipping_time        : '$shipping_time',
              country_available_in : '$country_available_in',
              stocked_in           : '$stocked_in',
              medicine_image       : '$medicine_image',
               supplier            : '$supplier'
            },
            inventory_info : { $push: '$inventory_info' }
          }
        },
        {
          $project: {
            _id                  : 0,
            medicine_id          : '$_id.medicine_id',
            medicine_type        : '$_id.medicine_type',
            medicine_name        : '$_id.medicine_name',
            status               : '$_id.status',
            supplier_id          : '$_id.supplier_id',
            country_of_origin    : '$_id.country_of_origin',
            tags                 : '$_id.tags',
            dossier_type         : '$_id.dossier_type',
            dossier_status       : '$_id.dossier_status',
            gmp_approvals        : '$_id.gmp_approvals',
            registered_in        : '$_id.registered_in',
            comments             : '$_id.comments',
            dosage_form          : '$_id.dosage_form',
            category_name        : '$_id.category_name',
            strength             : '$_id.strength',
            total_quantity       : '$_id.total_quantity',
            shipping_time        : '$_id.shipping_time',
            country_available_in : '$_id.country_available_in',
            stocked_in           : '$_id.stocked_in',
            medicine_image       : '$_id.medicine_image',
            supplier             : '$_id.supplier',
            inventory_info       : 1, 
          }
        },
        {
          $sort: { created_at: -1 }
        },
        { $skip  : offset },
        { $limit : page_size }
      );
      // console.log('pipeline', JSON.stringify(pipeline, null, 2));
  
      const countPipeline = [
        {
          $lookup: {
            from         : "suppliers",
            localField   : "supplier_id",
            foreignField : "supplier_id",
            as           : "supplier",
          },
        },
        {
          $unwind: "$supplier"
        },
        {
          $match: matchCondition,
        },
      ];
  
      if (searchKey) {
        countPipeline.push({
          $match: {
            $or: [
              { "supplier.supplier_name": { $regex: searchKey, $options: 'i' } }
            ]
          }
        });
      }
  
      const [data, totalItems] = await Promise.all([
        Medicine.aggregate(pipeline),
        // Medicine.aggregate(countPipeline) // this is has issue with pagination
        Medicine.aggregate(pipeline)
          .count("totalItems")
          .then(counts => (counts[0] ? counts[0].totalItems : 0))
      ]);
  
      const totalPages = Math.ceil(totalItems / page_size);
      const returnObj = {
        data,
        totalPages,
        totalItems
      };
      callback({ code: 200, message: "Medicine list fetched successfully", result: returnObj });
  
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  otherMedicineList: async (req, res, reqObj, callback) => {
    try {
        const { medicine_name, medicine_id, medicine_type, status, supplier_id, pageNo, pageSize } = reqObj;
        const page_no = pageNo || 1;
        const page_size = pageSize || 10;
        const offset = (page_no - 1) * page_size;

        Medicine.aggregate([
            {
                $match: {
                    medicine_type : medicine_type,
                    supplier_id   : supplier_id,
                    status        : status,
                    medicine_id   : { $ne: medicine_id }
                }
            },
            {
                $project: {
                    medicine_id          : 1,
                    supplier_id          : 1,
                    medicine_name        : 1,
                    medicine_image       : 1,
                    drugs_name           : 1,
                    country_of_origin    : 1,
                    dossier_type         : 1,
                    dossier_status       : 1,
                    gmp_approvals        : 1,
                    registered_in        : 1,
                    comments             : 1,
                    dosage_form          : 1,
                    category_name        : 1,
                    stocked_in           : 1,
                    strength             : 1,
                    quantity             : 1,
                    inventory_info       : 1,
                    unit_price           : 1,
                    total_quantity       : 1,
                    est_delivery_time    : 1,
                    shipping_time        : 1,
                    country_available_in : 1,

                }
            },
            { $skip  : offset }, 
            { $limit : page_size } 
            
        ]).then((data) => {
            Medicine.countDocuments({
                medicine_type : medicine_type,
                supplier_id   : supplier_id,
                status        : status,
                medicine_id   : { $ne: medicine_id }
            }).then(totalItems => {
                const totalPages = Math.ceil(totalItems / page_size);
                const returnObj = {
                    data,
                    totalPages,
                    totalItems
                };
                callback({ code: 200, message: "Medicine list fetched successfully", result: returnObj });
            }).catch((err) => {
                callback({ code: 400, message: "Error while fetching similar medicine list count", result: err });
            });
        }).catch((err) => {
            console.log(err);
            callback({ code: 400, message: "Error fetching medicine list", result: err });
        });
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  getSpecificMedicinesList: async (req, res) => {
    try {
      const { usertype, supplier_id, buyer_id, admin_id } = req?.headers;
      // const { status, searchKey, pageNo, pageSize, medicineType, medicine_type, category_name, medicine_status, price_range, delivery_time, in_stock, } = req?.body;
      const { status = undefined, searchKey = undefined, pageNo = undefined, pageSize = undefined, medicineType = undefined, medicine_type = undefined, category_name = undefined, medicine_status = undefined, price_range = undefined, delivery_time = undefined, in_stock = undefined, } = req?.query;

      console.log('req?.query', req?.query)
  
      const page_no   = parseInt(pageNo) || 1;
      const page_size = parseInt(pageSize) || 10;
      const offset    = (page_no - 1) * page_size;
  
      let matchCondition = {
        medicine_type: medicine_type?.replaceAll("%20"," ")|| medicineType?.replaceAll("%20"," "),
      };
  
      if (supplier_id) {
        matchCondition.supplier_id = supplier_id;
      }
  
      if (medicine_status === 'accepted' || status === 'accepted') {
        matchCondition.status = 1;
      } else if (medicine_status === 'rejected' || status === 'rejected') {
        matchCondition.status = 2;
      } else if (medicine_status === 'pending' || status === 'pending') {
        matchCondition.status = 0;
      } else {
        matchCondition.status = 1;
      }
  
  
      if (searchKey && searchKey!=='null' && category_name) {
          matchCondition.$and = [
              {
                  $or: [
                      { medicine_name : { $regex: searchKey, $options: 'i' } },
                      { tags          : { $elemMatch: { $regex: searchKey, $options: 'i' } } }
                  ]
              },
              { medicine_category: category_name }  // Ensure the field name is correct
          ];
      } else if (searchKey && searchKey!=='null' ) {
          matchCondition.$or = [
              { medicine_name : { $regex: searchKey, $options: 'i' } },
              { tags          : { $elemMatch: { $regex: searchKey, $options: 'i' } } }
          ];
      } else if (category_name) {
          matchCondition.medicine_category = category_name;  // Use correct field
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
          $sort: { created_at: -1 }
      },
          {
            
              $project: {
                  medicine_id       : 1,
                  supplier_id       : 1,
                  supplierId        : 1,
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
                  country_available_in : 1,
                  total_quantity : 1,
                  "inventory_info.quantity"          : 1,
                  "inventory_info.unit_price"        : 1,
                  "inventory_info.est_delivery_days" : 1,
                  "inventory_info.total_price"       : 1,
              }
          },
          { $skip  : offset },
          { $limit : page_size }
      );
  
      // console.log('pipeline', JSON.stringify(pipeline, null, 2));
      let data;
      
      if( usertype == 'Admin' ){
        data = await Medicine.aggregate([
          {
            $match: {
              medicine_type: medicine_type?.replaceAll("%20"," ") || medicineType?.replaceAll("%20"," "),
              status       : parseInt(status)
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
              supplierId        : 1,
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
              country_available_in : 1,
              total_quantity       : 1,
              inventory : {
                $arrayElemAt: ["$inventory", 0],
              },
            },
          },
          
          {
            $project: {
              medicine_id       : 1,
              supplier_id       : 1,
              supplierId        : 1,
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
              country_available_in : 1,
              total_quantity       : 1,
              "inventory.delivery_info"  : 1,
              "inventory.price"          : 1,
            },
          },
          
          { $skip: offset },
          { $limit: page_size },
        ])

      } else if(usertype == 'Supplier'){
        data = await Medicine.aggregate(pipeline);
      } else if (usertype == 'Buyer') {
        data = await Medicine.aggregate(pipeline);
      }  
  
      // Count total items matching the condition
      const totalItems = await Medicine.countDocuments(usertype == 'Admin'? {medicine_type: medicine_type?.replaceAll("%20"," ")|| medicineType?.replaceAll("%20"," "), status: parseInt(status)}: {medicine_type: medicine_type?.replaceAll("%20"," "),});
      const totalPages = Math.ceil(totalItems / parseInt(page_size));
  
      const returnObj = {
        data,
        totalPages,
        totalItems: totalItems
      };

      console.log(data)
  
      res?.status(200)?.send({ code: 200, message: "Medicine list fetched successfully", result: returnObj });
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  getMedicinesListCSV: async (req, res) => {
    try {
      const { usertype, supplier_id, buyer_id, admin_id } = req?.headers;
      const { status, searchKey, pageNo, pageSize, medicineType, medicine_type, category_name, medicine_status, price_range, delivery_time, in_stock, } = req?.body;
      // const { status = undefined, searchKey = undefined, pageNo = undefined, pageSize = undefined, medicineType = undefined, medicine_type = undefined, category_name = undefined, medicine_status = undefined, price_range = undefined, delivery_time = undefined, in_stock = undefined, } = req?.query;

      console.log('req?.query', req?.query)
  
      const page_no   = parseInt(pageNo) || 1;
      const page_size = parseInt(pageSize) || 10;
      const offset    = (page_no - 1) * page_size;
  
      let matchCondition = {
        medicine_type: medicine_type?.replaceAll("%20"," ")|| medicineType?.replaceAll("%20"," "),
      };
  
      if (supplier_id) {
        matchCondition.supplier_id = supplier_id;
      }
  
      if (medicine_status === 'accepted' || status === 'accepted') {
        matchCondition.status = 1;
      } else if (medicine_status === 'rejected' || status === 'rejected') {
        matchCondition.status = 2;
      } else if (medicine_status === 'pending' || status === 'pending') {
        matchCondition.status = 0;
      } else {
        matchCondition.status = 1;
      }
  
  
      if (searchKey && searchKey!=='null' && category_name) {
          matchCondition.$and = [
              {
                  $or: [
                      { medicine_name : { $regex: searchKey, $options: 'i' } },
                      { tags          : { $elemMatch: { $regex: searchKey, $options: 'i' } } }
                  ]
              },
              { medicine_category: category_name }  // Ensure the field name is correct
          ];
      } else if (searchKey && searchKey!=='null' ) {
          matchCondition.$or = [
              { medicine_name : { $regex: searchKey, $options: 'i' } },
              { tags          : { $elemMatch: { $regex: searchKey, $options: 'i' } } }
          ];
      } else if (category_name) {
          matchCondition.medicine_category = category_name;  // Use correct field
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
          $sort: { created_at: -1 }
      },
          {
            
              $project: {
                  medicine_id       : 1,
                  supplier_id       : 1,
                  supplierId        : 1,
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
      );
  
      // console.log('pipeline', JSON.stringify(pipeline, null, 2));
      let data;
      
      if( usertype == 'Admin' ){
        data = await Medicine.aggregate([
          {
            $match: {
              medicine_type: medicine_type?.replaceAll("%20"," ") || medicineType?.replaceAll("%20"," "),
              status       : parseInt(status)
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
              supplierId        : 1,
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
              inventory : {
                $arrayElemAt: ["$inventory", 0],
              },
            },
          },
          
          {
            $project: {
              medicine_id       : 1,
              supplier_id       : 1,
              supplierId        : 1,
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
              "inventory.delivery_info"  : 1,
              "inventory.price"          : 1,
            },
          },
        ])

      } else if(usertype == 'Supplier'){
        data = await Medicine.aggregate(pipeline);
      } else if (usertype == 'Buyer') {
        data = await Medicine.aggregate(pipeline);
      }  
      
      // Convert Mongoose document to plain object and flatten
      const flattenedData = data.map(item => flattenData(item, ["_id", "__v", "medicine_image", "Medicine Image","StockedIn Details","stockedIn_details", "Status", "status", "Supplier Id", "supplier_id"], [], 'product_list')); // `toObject()` removes internal Mongoose metadata

      // Convert the flattened data to CSV
      const csv = parse(flattenedData);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=product.csv');

      res.status(200).send(csv);
  
    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

  getSpecificMedicineDetails: async (req, res) => {
    try {
      const { usertype } = req?.headers;
      const data = await Medicine.aggregate([
        {
          $match: { medicine_id: req?.params?.id },
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
            medicine_id                    : 1,
            supplier_id                    : 1,
            medicine_name                  : 1,
            medicine_type                  : 1,
            composition                    : 1,
            dossier_type                   : 1,
            dossier_status                 : 1,
            gmp_approvals                  : 1,
            shipping_time                  : 1,
            tags                           : 1,
            available_for                  : 1,
            description                    : 1,
            registered_in                  : 1,
            inventory_info                 : 1,
            medicine_image                 : 1,
            invoice_image                  : 1,
            strength                       : 1,
            medicine_category              : 1,
            total_quantity                 : 1,
            stocked_in                     : 1,
            shelf_life                     : 1,
            type_of_form                   : 1,
            country_of_origin              : 1,
            purchased_on                   : 1,
            unit_price                     : 1,
            country_available_in           : 1,
            min_purchase_unit              : 1,
            condition                      : 1,
            unit_tax                       : 1,
            manufacturer_country_of_origin : 1,
            manufacturer_description       : 1,
            manufacturer_name              : 1,
            stockedIn_details              : 1,
            edit_status                    : 1,
            inventory : {
              $arrayElemAt: ["$inventory", 0],
            },
          },
        },
        {
          $project: {
            medicine_id                    : 1,
            supplier_id                    : 1,
            medicine_name                  : 1,
            medicine_type                  : 1,
            composition                    : 1,
            dossier_type                   : 1,
            dossier_status                 : 1,
            gmp_approvals                  : 1,
            shipping_time                  : 1,
            tags                           : 1,
            available_for                  : 1,
            description                    : 1,
            registered_in                  : 1,
            inventory_info                 : 1,
            medicine_image                 : 1,
            invoice_image                  : 1,
            strength                       : 1,
            medicine_category              : 1,
            total_quantity                 : 1,
            stocked_in                     : 1,
            shelf_life                     : 1,
            type_of_form                   : 1,
            country_of_origin              : 1,
            purchased_on                   : 1,
            unit_price                     : 1,
            country_available_in           : 1,
            min_purchase_unit              : 1,
            condition                      : 1,
            unit_tax                       : 1,
            manufacturer_country_of_origin : 1,
            manufacturer_description       : 1,
            manufacturer_name              : 1,
            stockedIn_details              : 1,
            edit_status                    : 1,
            "inventory.inventory_info"     : 1,
            "inventory.strength"           : 1,
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
            medicine_id                    : 1,
            supplier_id                    : 1,
            medicine_name                  : 1,
            medicine_type                  : 1,
            composition                    : 1,
            dossier_type                   : 1,
            dossier_status                 : 1,
            gmp_approvals                  : 1,
            shipping_time                  : 1,
            tags                           : 1,
            available_for                  : 1,
            description                    : 1,
            registered_in                  : 1,
            inventory_info                 : 1,
            medicine_image                 : 1,
            invoice_image                  : 1,
            strength                       : 1,
            medicine_category              : 1,
            total_quantity                 : 1,
            stocked_in                     : 1,
            shelf_life                     : 1,
            type_of_form                   : 1,
            country_of_origin              : 1,
            purchased_on                   : 1,
            unit_price                     : 1,
            country_available_in           : 1,
            min_purchase_unit              : 1,
            condition                      : 1,
            unit_tax                       : 1,
            manufacturer_country_of_origin : 1,
            manufacturer_description       : 1,
            manufacturer_name              : 1,
            stockedIn_details              : 1,
            edit_status                    : 1,
            "inventory.inventory_info"     : 1,
            "inventory.strength"           : 1,
            supplier : {
              $arrayElemAt: ["$supplier", 0],
            },
          },
        },
        {
          $project: {
            medicine_id                    : 1,
            supplier_id                    : 1,
            medicine_name                  : 1,
            medicine_type                  : 1,
            composition                    : 1,
            dossier_type                   : 1,
            dossier_status                 : 1,
            gmp_approvals                  : 1,
            shipping_time                  : 1,
            tags                           : 1,
            available_for                  : 1,
            description                    : 1,
            registered_in                  : 1,
            inventory_info                 : 1,
            medicine_image                 : 1,
            invoice_image                  : 1,
            strength                       : 1,
            medicine_category              : 1,
            total_quantity                 : 1,
            stocked_in                     : 1,
            shelf_life                     : 1,
            type_of_form                   : 1,
            country_of_origin              : 1,
            purchased_on                   : 1,
            unit_price                     : 1,
            country_available_in           : 1,
            min_purchase_unit              : 1,
            condition                      : 1,
            unit_tax                       : 1,
            manufacturer_country_of_origin : 1,
            manufacturer_description       : 1,
            manufacturer_name              : 1,
            stockedIn_details              : 1,
            edit_status                    : 1,
            "inventory.inventory_info"             : 1,
            "inventory.strength"                   : 1,
            "supplier.supplier_id"                 : 1, 
            "supplier.supplier_name"               : 1,
            "supplier.supplier_email"              : 1,
            "supplier.description"                 : 1,
            "supplier.estimated_delivery_time"     : 1,
            "supplier.tags"                        : 1,
            "supplier.license_no"                  : 1,
            "supplier.supplier_address"            : 1,
            "supplier.payment_terms"               : 1,
            "supplier.country_of_origin"           : 1,
            "supplier.supplier_type"               : 1,
            "supplier.contact_person_name"         : 1,
            "supplier.supplier_country_code"       : 1,
            "supplier.supplier_mobile"             : 1,
            "supplier.contact_person_email"        : 1,
            "supplier.contact_person_mobile_no"    : 1,
            "supplier.contact_person_country_code" : 1,
            "supplier.tax_no"                      : 1,
            "supplier.supplier_type"               : 1,
            "supplier.country_of_operation"        : 1,
          },
        },
      ])

      if (!data) {
        res?.status(500)?.send({ code: 500, message: "Internal Server Error", result: error });
      }
      const distinctCountries = await Medicine.distinct("stocked_in");
      // const responseData = {
      //   data: data[0],
      //   countryAvailable: distinctCountries
      // }
      res?.status(200)?.send({ code: 200, message: "Medicine details fetched successfully", 
        result: {
        ...data[0], 
        countryAvailable: distinctCountries, 
      }, });

    } catch (error) {
      console.log("Internal Server Error:", error);
      logErrorToFile(error, req);
      return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
    }
  },

};