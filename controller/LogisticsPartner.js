require("dotenv").config();
const generator = require("generate-password");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Order = require("../schema/orderSchema");
const LogisticsPartner = require("../schema/logisticsCompanySchema");
const Logistics = require("../schema/logisticsSchema");
const logErrorToFile = require("../logs/errorLogs");
const { sendErrorResponse } = require("../utils/commonResonse");

const generatePassword = () => {
  const password = generator.generate({
    length: 12,
    numbers: true,
  });
  return password;
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email exists
    const logisticsPartner = await LogisticsPartner.findOne({ email });
    if (!logisticsPartner) {
      return res.status(404).send({
        message: "Invalid email or password.",
        result: {},
      });
    }

    // Check if password is valid
    const isPasswordValid = await bcrypt.compare(
      password,
      logisticsPartner.password
    );
    if (!isPasswordValid) {
      return res.status(401).send({
        message: "Invalid email or password.",
        result: {},
      });
    }

    // Generate JWT token
    // const jwtSecretKey = process.env.APP_SECRET;
    // const token = jwt.sign(
    //   {
    //     client_id: logisticsPartner.client_id,
    //     email: logisticsPartner.email,
    //   },
    //   jwtSecretKey,
    //   { expiresIn: '24h' } // Token expiration time
    // );

    // // Update the token in the database
    // logisticsPartner.token = token;
    // await logisticsPartner.save();

    // Successful login response
    return res.status(200).send({
      message: "Login successful.",
      result: {
        token: logisticsPartner.token,
        client_id: logisticsPartner.client_id,
        company_name: logisticsPartner.company_name,
        email: logisticsPartner.email,
      },
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    logErrorToFile(error, req);
    return sendErrorResponse(
      res,
      500,
      "An unexpected error occurred. Please try again later.",
      error
    );
  }
};

const addLogisticsPartner = async (req, res) => {
  try {
    const { company_name, contact_person, email, phone, address } = req.body;

    // return false
    const emailExists = await LogisticsPartner.findOne({ email: req.email });
    if (emailExists) {
      return callback({ code: 409, message: "Email already exists" });
    }

    const partnerId = "LGP-" + Math.random().toString(16).slice(2, 10);
    const jwtSecretKey = process.env.APP_SECRET;
    const data = { time: Date(), partnerId };
    const token = jwt.sign(data, jwtSecretKey);
    const autoGeneratedPassword = generatePassword();
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(autoGeneratedPassword, saltRounds);

    const newClient = new LogisticsPartner({
      partner_id: partnerId,
      company_name: company_name,
      contact_person: contact_person,
      email: email,
      phone: phone,
      address: address,
      password: hashedPassword,
      token: token,
      status: 1,
    });

    await newClient.save();

    // callback({
    //   code: 200,
    //   message: 'Registration Successful',
    //   password: autoGeneratedPassword,
    // });
    return res
      ?.status(200)
      ?.send({
        message: "Logistics Partner Added Successfully",
        result: autoGeneratedPassword,
      });
  } catch (error) {
    console.error("Internal Server Error:", error);
    logErrorToFile(error, req);
    return sendErrorResponse(
      res,
      500,
      "An unexpected error occurred. Please try again later.",
      error
    );
  }
};

const getLogisticsDashboardData = async (req, res) => {
  try {

    const statusCounts = await Logistics.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert aggregation result into an object
    const result = {};
    statusCounts.forEach((item) => {
      result[item._id] = item.count;
    });

    res.status(200).json({
      code: 200,
      message: "Logistics status count fetched successfully",
      result,
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return sendErrorResponse(res, 500, "An unexpected error occurred.", error);
  }
};


const getLogisticsList = async (req, res) => {
  try {

    const { client_id, status, pageNo, pageSize } = req.query;
    const page_no = Number(pageNo) || 1;
    const page_size = Number(pageSize) || 10;
    const offset = (page_no - 1) * page_size;

    const data = await Logistics.aggregate([
      { $match: { status } },
      { $sort: { createdAt: -1 } }, // Sorting in descending order
      { $skip: offset },
      { $limit: page_size },
      {
        $lookup: {
          from: "buyers",
          localField: "buyerId",
          foreignField: "_id",
          as: "buyerDetails",
        },
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "supplierId",
          foreignField: "_id",
          as: "supplierDetails",
        },
      },
      {
        $project: {
          _id: 1,
          logistics_id: 1,
          enquiry_id: 1,
          purchaseOrder_id: 1,
          orderId: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          buyerDetails: { buyer_name: 1, contact_person_email: 1, company: 1 },
          supplierDetails: {
            supplier_name: 1,
            contact_person_email: 1,
            company: 1,
          },
        },
      },
    ]);

    const totalItems = await Logistics.countDocuments({ status });
    const totalPages = Math.ceil(totalItems / page_size);

    res.status(200).json({
      code: 200,
      message: "Logistics list fetched successfully",
      result: {
        data,
        totalPages,
        totalItems,
      },
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    logErrorToFile(error, req);
    return sendErrorResponse(
      res,
      500,
      "An unexpected error occurred. Please try again later.",
      error
    );
  }
};

const getLogisticsDetails = async (req, res) => {
  const { partnerId, requestId } = req.params;

  try {
    const logisticsDetails = await Logistics.aggregate([
      {
        $match: {
          logistics_id: requestId,
          // partner_id : partnerId
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderDetails",
        },
      },
      {
        $unwind: {
          path: "$orderDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "buyers",
          localField: "buyerId",
          foreignField: "_id",
          as: "buyerDetails",
        },
      },
      {
        $unwind: {
          path: "$buyerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "suppliers",
          localField: "supplierId",
          foreignField: "_id",
          as: "supplierDetails",
        },
      },
      {
        $unwind: {
          path: "$supplierDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          logistics_id: 1,
          enquiry_id: 1,
          purchaseOrder_id: 1,
          orderId: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          orderDetails: 1,
          buyerDetails: {
            buyer_name: 1,
            contact_person_name: 1,
            contact_person_email: 1,
            contact_person_country_code: 1,
            contact_person_mobile: 1,
            buyer_type: 1,
          },
          supplierDetails: {
            supplier_name: 1,
            contact_person_name: 1,
            contact_person_email: 1,
            contact_person_country_code: 1,
            contact_person_mobile_no: 1,
            supplier_type: 1,
          },
        },
      },
    ]);

    if (!logisticsDetails.length) {
      return res
        .status(404)
        .json({ message: "No logistics details found for the provided IDs" });
    }

    res.status(200).json({
      code: 200,
      message: "Logistics details fetched successfully",
      result: logisticsDetails[0],
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    logErrorToFile(error, req);
    return sendErrorResponse(
      res,
      500,
      "An unexpected error occurred. Please try again later.",
      error
    );
  }
};


const updateLogisticsRequest = async (req, res) => {
  try {
    const { logisticsId, pickup_time, pickup_date, orderId } = req.body;

    if (!logisticsId || !orderId || !pickup_time || !pickup_date) {
      return res.status(400).json({
        message:
          "logisticsId, orderId, pickup_time, and pickup_date are required",
      });
    }

    // Find and update the logistics status to 'active'
    const logistics = await Logistics.findOneAndUpdate(
      { logistics_id: logisticsId, orderId: orderId },
      { $set: { status: "active" } },
      { new: true }
    );

    if (!logistics) {
      return res.status(404).json({
        message:
          "No logistics details found for the provided logisticsId and orderId",
      });
    }

    // Update the order with pickup_time and pickup_date
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      {
        $set: {
          "supplier_logistics_data.pickup_time": pickup_time,
          "supplier_logistics_data.pickup_date": pickup_date,
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ message: "Order not found or update failed" });
    }

    res.status(200).json({
      code: 200,
      message: "Logistics status updated successfully",
      order: updatedOrder,
      logistics: logistics,
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    logErrorToFile(error, req);
    return sendErrorResponse(
      res,
      500,
      "An unexpected error occurred. Please try again later.",
      error
    );
  }
};


module.exports = {
  login,
  addLogisticsPartner,
  getLogisticsDashboardData,
  getLogisticsList,
  getLogisticsDetails,
  updateLogisticsRequest,
};
