const mongoose = require("mongoose");
const Enquiry = require("../schema/enquiryListSchema");
const Supplier = require("../schema/supplierSchema");
const Buyer = require("../schema/buyerSchema");
const Order = require("../schema/orderSchema");
const PurchaseOrder = require("../schema/purchaseOrderSchema");
const OrderHistory = require("../schema/orderHistorySchema");
const { handleCatchBlockError } = require("../utils/commonResonse");

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
      orderHistory?.stages?.map(async (stage, index) => {
        let schemaNameToSearchFrom;

        switch (stage?.referenceType) {
          case "Enquiry":
            schemaNameToSearchFrom = await Enquiry;
            break;
          case "PurchaseOrder":
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
    handleCatchBlockError(req, res, error);
  }
};

const addStageToOrderHistory = async (
  req,
  res,
  id,
  stageName,
  stageDate,
  stageReference,
  stageReferenceType
) => {
  try {
    let filterKey;
    switch (stageReferenceType) {
      case "Enquiry":
        filterKey = "enquiryId";
        break;

      case "PurchaseOrder":
        filterKey = "enquiryId";
        break;

      case "Order":
        filterKey = stageName === "Order Created" ? "enquiryId" : "orderId";
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

    let updateFields = {};

    // Handle "Pick up Details Submitted" case with an additional stage
    if (
      stageName === "Pick up Details Submitted" ||
      stageName == "Use Own Logistics"
    ) {
      const additionalStageDetails = {
        name:
          stageName == "Use Own Logistics"
            ? "Use Own Logistics"
            : "Logistics Request Sent",
        date: new Date(stageDate.getTime() + 2 * 60 * 1000), // +2 minutes
        referenceId: stageReference,
        referenceType: stageReferenceType,
      };

      updateFields.$push = {
        stages: {
          $each: [stageDetails, additionalStageDetails],
        },
      };
    } else {
      updateFields.$push = {
        stages: stageDetails,
      };
    }

    // ✅ Ensure we preserve existing fields when adding $set fields
    updateFields.$set = updateFields.$set || {};

    if (
      stageReferenceType === "PurchaseOrder" &&
      stageName === "Purchase Order Created"
    ) {
      updateFields.$set.purchaseOrderId = stageReference;
    }

    if (stageReferenceType === "Order" && stageName === "Order Created") {
      updateFields.$set.orderId = stageReference;
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
    return {
      message: "Internal error in addStageToOrderHistory",
      result: {},
      error,
    };
  }
};

module.exports = { getOrderHistory, addStageToOrderHistory };
