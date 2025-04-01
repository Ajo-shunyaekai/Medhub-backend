const mongoose = require('mongoose');
const Admin = require("../schema/adminSchema");
const Address = require("../schema/addressSchema");
const Enquiry = require("../schema/enquiryListSchema");
const Supplier = require("../schema/supplierSchema");
const Buyer = require("../schema/buyerSchema");
const Order = require("../schema/orderSchema");
const PurchaseOrder = require("../schema/purchaseOrderSchema");
const OrderHistory = require("../schema/orderHistorySchema");
const logErrorToFile = require("../logs/errorLogs");
const { sendErrorResponse } = require("../utils/commonResonse");



const getOrderHistory = async (req, res) => {
  try {
    const { usertype, buyer_id, admin_id, supplier_id } = req?.headers;
    const { id } = req?.params;

    const orderHistory = await OrderHistory?.findOne({ orderId: id });
    if (!orderHistory) {
      return res
        ?.status(400)
        ?.send({ message: "Failed finding order history details", result: {} });
    }

    const buyerDetails = await Buyer?.findById(orderHistory?.buyerId);
    if (!buyerDetails) {
      return res
        ?.status(400)
        ?.send({ message: "Failed finding buyer details", result: {} });
    }

    const supplierDetails = await Supplier?.findById(orderHistory?.supplierId);
    if (!supplierDetails) {
      return res
        ?.status(400)
        ?.send({ message: "Failed finding supplier details", result: {} });
    }

    const updatedOrderHistory = await Promise.all(
      orderHistory?.stages?.map(async (stage,index) => {

        let schemaNameToSearchFrom;

        switch (stage?.referenceType) {
          case "Enquiry":
            schemaNameToSearchFrom = await Enquiry;
            break;
          case "Purchase Order":
            schemaNameToSearchFrom = await PurchaseOrder;
            break;
          case "Order":
            schemaNameToSearchFrom = await Order;
            break;
          default:
            schemaNameToSearchFrom = await null; // If referenceType is invalid, skip fetching
        }

        if (!schemaNameToSearchFrom) {
          return { ...stage, details: null }; // If schema is not found, return empty details
        }

        const details = await schemaNameToSearchFrom?.findOne({
          _id: stage?.referenceId,
        });

        if (!details) {
          return { ...stage, details: null }; // If details are not found, add empty details to the stage
        }
        return { ...stage, details };
      })
    );

    return res?.status(200)?.send({
      message: "Success get Order History!",
      orderHistory: updatedOrderHistory,
    });

  } catch (error) {
    console.error("Internal Server Error:", error);
    logErrorToFile(error, req);
    return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
  }
};


const addStageToOrderHistory = async ( req, id, stageName, stageDate, stageReference, stageReferenceType ) => {
  try {

    let filterKey;
    switch (stageReferenceType) {
      case "Enquiry":
        filterKey = "enquiryId";
        break;

      case "Order":
        filterKey = stageName == 'Order Created' ? "enquiryId" : "orderId";
        break;

      default:
        filterKey = "orderId"; 
        break;
    }

    const orderHistory = await OrderHistory?.findOne({ [filterKey]: id });
    if (!orderHistory) {
      return { message: "Failed finding order history details", result: {} };
    }

    const stageDetails = {
      name: stageName,
      date: stageDate,
      referenceId: stageReference,
      referenceType: stageReferenceType,
    };

    const additionalStageDetails = {
      name: "Logistics Request Sent",
      date: new Date(stageDate.getTime() + 2 * 60 * 1000),
      referenceId: stageReference,
      referenceType: stageReferenceType,
    };

    // let updateFields = {
    //   $push: stageName == 'Pick up Details Submitted'? { stages: stageDetails, additionalStageDetails } : { stages: stageDetails },
    // };

    let updateFields = {};
    
    // If the stage is 'Pick up Details Submitted', add both stages
    if (stageName === 'Pick up Details Submitted') {
      const additionalStageDetails = {
        name: "Logistics Request Sent",
        date: new Date(stageDate.getTime() + 2 * 60 * 1000),
        referenceId: stageReference,
        referenceType: stageReferenceType,
      };
      
      updateFields = {
        $push: {
          stages: {
            $each: [stageDetails, additionalStageDetails]
          }
        }
      };
    } else {
      updateFields = {
        $push: { stages: stageDetails }
      };
    }
    

    // If stageReferenceType is "Order" and stageName is "Order Created", set the orderId field as well
    if (stageReferenceType == 'Order' && stageName === "Order Created") {
      updateFields.$set = { orderId: stageReference };
    }

    const updatedOrderHistory = await OrderHistory?.findByIdAndUpdate(
      orderHistory?._id,
      updateFields,
      { new: true }
    );

    if (!updatedOrderHistory) {
      return {
        message: "Failed updating order history stages details",
        result: {},
      };
    }

    return {
      message: "Success added stage to Order History!",
      orderHistory: updatedOrderHistory,
    };
  } catch (error) {
    console.error("Internal Server Error:", error);
    logErrorToFile(error, req);
    return sendErrorResponse(res, 500, "An unexpected error occurred. Please try again later.", error);
  }
};



module.exports = { getOrderHistory, addStageToOrderHistory };
