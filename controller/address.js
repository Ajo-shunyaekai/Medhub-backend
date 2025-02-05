const Admin = require("../schema/adminSchema");
const { UserAddress } = require("../schema/addressSchema");
const Supplier = require("../schema/supplierSchema");
const Buyer = require("../schema/buyerSchema");
const { validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");
const logErrorToFile = require("../logs/errorLogs");
const { sendErrorResponse } = require("../utils/commonResonse");

const getAddress = async (req, res) => {
  try {
    const { usertype, admin_id, supplier_id, buyer_id } = req?.headers;

    let user = undefined;

    if (usertype === "Admin") {
      user = await Admin?.findOne({ admin_id });
    } else if (usertype === "Supplier") {
      user = await Supplier?.findOne({ supplier_id });
    } else if (usertype === "Buyer") {
      user = await Buyer?.findOne({ buyer_id });
    }

    if (!user) {
      return res.status(400).send({
        message: "Failed to find user details for address",
        result: {},
      });
    }

    const address = (await UserAddress.findOne({ userId: user?._id })) || {};

    const updatedAddress = {
      ...address, // Convert address to plain object to safely spread
      userAddress: [
        ...(address.addresses || []), // Ensure addresses is an array or empty array if not present
        {
          full_name: user?.contact_person_name,
          mobile_number:
            user?.contact_person_country_code +
            " " +
            (user?.contact_person_mobile || user?.contact_person_mobile_no),
          ...user?.registeredAddress,
        } || {
            full_name: user?.contact_person_name,
            mobile_number:
              user?.contact_person_country_code +
              " " +
              (user?.contact_person_mobile || user?.contact_person_mobile_no),
            ...user?.buyer_address,
          } || {
            full_name: user?.contact_person_name,
            mobile_number:
              user?.contact_person_country_code +
              " " +
              (user?.contact_person_mobile || user?.contact_person_mobile_no),
            ...user?.supplier_address,
          },
      ],
    };

    return res.status(200).send({
      message: "Success get Address!",
      address: updatedAddress,
    });
  } catch (error) {
    console.log("Internal Server Error:", error);
    logErrorToFile(error, req);
    return sendErrorResponse(
      res,
      500,
      "An unexpected error occurred. Please try again later.",
      error
    );
  }
};

const addAddress = async (req, res) => {
  try {
    const { usertype, admin_id, supplier_id, buyer_id } = req?.headers;
    const {
      full_name,
      mobile_number,
      company_reg_address,
      locality,
      land_mark,
      city,
      state,
      country,
      pincode,
      type,
      defaultAddress,
    } = req.body; // Extract address data from request body

    // Check if all required address fields are provided
    if (
      !full_name ||
      !mobile_number ||
      !company_reg_address ||
      !locality ||
      !country ||
      !type
    ) {
      return res
        .status(400)
        .send({ message: "All required address fields must be provided" });
    }

    // Find the corresponding user based on usertype
    let user = undefined;
    if (usertype === "Admin") {
      user = await Admin.findOne({ admin_id });
    } else if (usertype === "Supplier") {
      user = await Supplier.findOne({ supplier_id });
    } else if (usertype === "Buyer") {
      user = await Buyer.findOne({ buyer_id });
    }

    if (!user) {
      return res.status(400).send({
        message: "Failed to find user details for address",
        result: {},
      });
    }

    // Construct the new address object
    const newAddress = {
      full_name,
      mobile_number,
      company_reg_address,
      locality,
      land_mark,
      city,
      state,
      country,
      pincode,
      type,
    };

    // Find the user's existing addresses (create one if none exist)
    let userAddress = await UserAddress.findOne({ userId: user?._id });

    // If userAddress does not exist, create a new one
    if (!userAddress) {
      userAddress = new UserAddress({
        userId: user?._id,
        addresses: [newAddress],
      });
    } else {
      // Add the new address to the existing addresses array
      userAddress.addresses.push(newAddress);
    }

    // If the 'defaultAddress' field is true, set the newly added address as the default
    if (defaultAddress) {
      userAddress.default =
        userAddress.addresses[userAddress.addresses.length - 1]._id;
    }

    // Save the updated user address
    await userAddress.save();

    return res.status(200).send({
      message: "Address added successfully!",
      address: userAddress,
    });
  } catch (error) {
    console.log("Internal Server Error:", error);
    logErrorToFile(error, req);
    return sendErrorResponse(
      res,
      500,
      "An unexpected error occurred. Please try again later.",
      error
    );
  }
};

// Edit an address
const editAddress = async (req, res) => {
  try {
    const { id, addressId } = req.params; // id = userId, addressId = id of the address to edit
    const updatedData = req.body; // Data to update

    // Find the user address document
    const userAddress = await UserAddress.findOne({ userId: id });

    if (!userAddress) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the address in the addresses array and update it
    const addressIndex = userAddress.addresses.findIndex(
      (address) => address._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Update the address
    userAddress.addresses[addressIndex] = {
      ...userAddress.addresses[addressIndex].toObject(),
      ...updatedData,
    };

    // Save the updated user address document
    await userAddress.save();

    res.status(200).json({
      message: "Address updated successfully",
      updatedAddress: userAddress.addresses[addressIndex],
    });
  } catch (error) {
    console.log("Internal Server Error:", error);
    logErrorToFile(error, req);
    return sendErrorResponse(
      res,
      500,
      "An unexpected error occurred. Please try again later.",
      error
    );
  }
};

// Delete an address
const deleteAddress = async (req, res) => {
  try {
    const { id, addressId } = req.params; // id = userId, addressId = id of the address to delete

    // Find the user address document
    const userAddress = await UserAddress.findOne({ userId: id });

    if (!userAddress) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the address index in the addresses array
    const addressIndex = userAddress.addresses.findIndex(
      (address) => address._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Remove the address
    userAddress.addresses.splice(addressIndex, 1);

    // Save the updated user address document
    await userAddress.save();

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.log("Internal Server Error:", error);
    logErrorToFile(error, req);
    return sendErrorResponse(
      res,
      500,
      "An unexpected error occurred. Please try again later.",
      error
    );
  }
};

module.exports = { getAddress, addAddress, editAddress, deleteAddress };
