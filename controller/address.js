const Admin = require("../schema/adminSchema");
const Address = require("../schema/addressSchema");
const Supplier = require("../schema/supplierSchema");
const Buyer = require("../schema/buyerSchema");
const { validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");

const getAddress = async (req, res) => {
  try {
    const { user_type, admin_id, supplier_id, buyer_id } = req?.headers;
    console.log('req?.headers', req?.headers)
    let user = undefined;

    if (user_type == "Admin") {
      user = await Admin?.findOne({ admin_id });
    } else if (user_type == "Supplier") {
      user = await Supplier?.findOne({ supplier_id });
    } else if (user_type == "Buyer") {
      user = await Buyer?.findOne({ buyer_id });
    }

    if(!user) {
        return res?.status(400)?.send({message: error?.message || "Failed finding user details for address", result: {},})
    }

    const address = await Address?.find({user_id : user?._id})
    if(!address) {
        return res?.status(400)?.send({message: error?.message || "Failed finding address details", result: {},})
    }

    const updatedAddress = [ user?.buyer_address || user?.supplier_address, ...address ]?.filter(ele=>ele!= undefined||ele!=null)
    
    return res?.status(200)?.send({ message:"Success get Address!", address: updatedAddress });
  } catch (error) {
    console.log("error", error);
    return res?.status(500)?.send({ message: error?.message || "Internal Server Error", result: {},});
  }
};

const addAddress = async (req, res) => {
  try {
    // Validate the request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }
    const { user_type, admin_id, supplier_id, buyer_id } = req?.headers;
    const { fullName, phone, houseName, street, city, state, country, postalCode, type, isDefault } = req.body;

    let user = undefined;

    if (user_type === "Admin") {
      user = await Admin?.findOne({ admin_id });
    } else if (user_type === "Supplier") {
      user = await Supplier?.findOne({ supplier_id });
    } else if (user_type === "Buyer") {
      user = await Buyer?.findOne({ buyer_id });
    }

    if (!user) {
      return res.status(400).send({ message: "Failed to find user details for address", result: {} });
    }

    // Create new address
    const newAddress = new Address({
        user_id: user?._id,
        fullName,
        phone,
        houseName,
        street,
        city,
        state,
        country,
        postalCode,
        type,
        isDefault,
    });

    // Save the new address
    await newAddress.save();
    const address = await Address?.find({user_id : user?._id})
    if(!address) {
        return res?.status(400)?.send({message: "Failed finding address details", result: {},})
    }

    const updatedAddress = [ user?.buyer_address || user?.supplier_address, ...address ]?.filter(ele=>ele!= undefined||ele!=null)
    
    return res?.status(200)?.send({ message:"Success add Address!", address: updatedAddress });
  } catch (error) {
    console.log("error", error);
    return res?.status(500)?.send({ message: error?.message || "Internal Server Error", result: {},});
  }
};

const editAddress = async (req, res) => {
    try {
        // Validate the request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
            message: "Validation failed",
            errors: errors.array(),
            })
        }
        const { user_type, admin_id, supplier_id, buyer_id } = req?.headers;
        const { id } = req?.params;
    
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({
            message: "Invalid address ID format",
            result: {},
            });
        }
    
        const existingAddress = await Address.findById(id);
        if (!existingAddress) {
            return res.status(404).send({
            message: "Address not found",
            result: {},
            });
        }
    
        const updatedData = { ...req.body };
        delete updatedData.user_id;  
        delete updatedData._id;     
    
        const updatedAddress = await Address.findByIdAndUpdate(id, updatedData, { new: true });
    
        if (!updatedAddress) {
            return res.status(400).send({
            message: "Failed to update address",
            result: {},
            });
        }
    
        let user = undefined;
    
        if (user_type === "Admin") {
            user = await Admin?.findOne({ admin_id });
        } else if (user_type === "Supplier") {
            user = await Supplier?.findOne({ supplier_id });
        } else if (user_type === "Buyer") {
            user = await Buyer?.findOne({ buyer_id });
        }
    
        if (!user) {
            return res.status(400).send({ message: "Failed to find user details for address", result: {} });
        }
    
        const address = await Address?.find({ user_id: user?._id });
        if (!address) {
            return res?.status(400)?.send({ message: "Failed finding address details", result: {} });
        }
    
        const updatedAddresses = [user?.buyer_address || user?.supplier_address, ...address]?.filter(ele => ele !== undefined && ele !== null);
    
        return res?.status(200)?.send({
            message: "Success edit Address!",
            address: updatedAddresses,
        });
    
        } catch (error) {
        console.log("error", error);
        return res?.status(500)?.send({
            message: error?.message || "Internal Server Error",
            result: {},
        });
        }
};

const deleteAddress = async (req, res) => {
    try {
        const { user_type, admin_id, supplier_id, buyer_id } = req?.headers;
        const { id } = req?.params;
    
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({
            message: "Invalid address ID format",
            result: {},
            });
        }
    
        const addressExists = await Address?.findById(id);
        if (!addressExists) {
            return res.status(400).send({
            message: "Address not found",
            result: {},
            });
        }
    
        const deletedAddress = await Address.findOneAndDelete({ _id: id });
        if (!deletedAddress) {
            return res.status(400).send({
            message: "Failed to delete address",
            result: {},
            });
        }

        let user = undefined;

        if (user_type === "Admin") {
            user = await Admin?.findOne({ admin_id });
        } else if (user_type === "Supplier") {
            user = await Supplier?.findOne({ supplier_id });
        } else if (user_type === "Buyer") {
            user = await Buyer?.findOne({ buyer_id });
        }

        if (!user) {
            return res.status(400).send({ message: "Failed to find user details for address", result: {} });        
        }

        const address = await Address?.find({user_id : user?._id})
        if(!address) {
            return res?.status(400)?.send({message: "Failed finding address details", result: {} })
        }

        const updatedAddress = [ user?.buyer_address || user?.supplier_address, ...address ]?.filter(ele=>ele!= undefined||ele!=null)
        
        return res?.status(200)?.send({ message:"Success delete Address!", address: updatedAddress });
        
    } catch (error) {
    console.log("error", error);
    return res.status(500).send({
        message: error.message || "Internal Server Error",
        result: {},
    });
    }
};

module.exports = { getAddress, addAddress, editAddress, deleteAddress };
