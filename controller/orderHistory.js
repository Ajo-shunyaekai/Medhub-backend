const Admin = require("../schema/adminSchema");
const Address = require("../schema/addressSchema");
const Enquiry = require("../schema/enquiryListSchema");
const Supplier = require("../schema/supplierSchema");
const Buyer = require("../schema/buyerSchema");
const Order = require("../schema/orderHistorySchema");
const PurchaseOrder = require("../schema/purchaseOrderSchema");
const OrderHistory = require("../schema/orderHistorySchema");

const getOrderHistory = async (req, res) => {
  try {
    const { user_type, buyer_id, admin_id, supplier_id } = req?.headers;
    const { id } = req?.params;

    const orderHistory = await OrderHistory?.findOne({ orderId: id });
    if (!orderHistory) {
      return res
        ?.status(400)
        ?.send({ message: "Failed finding order history details", result: {} });
    }

    const buyerDetails = await Buyer?.findOne({
      buyer_id: orderHistory?.buyerId,
    });
    if (!buyerDetails) {
      return res
        ?.status(400)
        ?.send({ message: "Failed finding buyer details", result: {} });
    }

    const supplierDetails = await Supplier?.findOne({
      supplier_id: orderHistory?.supplierId,
    });
    if (!supplierDetails) {
      return res
        ?.status(400)
        ?.send({ message: "Failed finding supplier details", result: {} });
    }

    const updatedOrderHistory = await Promise.all(
      orderHistory?.stages?.map(async (stage) => {
        let schemaNameToSearchFrom;
        switch (stage?.referenceType) {
          case "Enquiry":
            schemaNameToSearchFrom = Enquiry;
            break;

          case "Purchase Order":
            schemaNameToSearchFrom = PurchaseOrder;
            break;

          case "Order":
            schemaNameToSearchFrom = Order;
            break;

          default:
            break;
        }

        const fetchDetails = async (referenceId) => {
          const fetchData = await schemaNameToSearchFrom?.findOne({
            _id: referenceId,
          });
          if (!fetchData) {
            return res
              ?.status(400)
              ?.send({ message: "Failed finding stage details", result: {} });
          }
          return fetchData;
        };

        const details = await fetchDetails(stage?.referenceId);
        return {
          ...stage,
          details,
        };
      })
    );

    if (!updatedOrderHistory) {
      return res
        ?.status(400)
        ?.send({ message: "Failed finding order history details", result: {} });
    }

    return res?.status(200)?.send({
      message: "Success get Order History!",
      orderHistory: updatedOrderHistory,
    });
  } catch (error) {
    console.log("error", error);
    return res
      ?.status(500)
      ?.send({ message: error.message || "Internal Server Error", result: {} });
  }
};

const addStageToOrderHistory = async ( id, stageName, stageDate, stageReference, stageReferenceType ) => {
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

    let updateFields = {
      $push: { stages: stageDetails },
    };

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

    console.log("\n updatedOrderHistory", updatedOrderHistory);
    return {
      message: "Success added stage to Order History!",
      orderHistory: updatedOrderHistory,
    };
  } catch (error) {
    console.log("error", error);
    return { message: error.message || "Internal Server Error", result: {} };
  }
};

module.exports = { getOrderHistory, addStageToOrderHistory };
