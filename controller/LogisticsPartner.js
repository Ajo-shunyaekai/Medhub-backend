require('dotenv').config();
const generator = require('generate-password');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const Order = require('../schema/orderSchema')
const LogisticsPartner   = require('../schema/logisticsCompanySchema')
const Logistics = require('../schema/logisticsSchema')

const generatePassword = () => {
    const password = generator.generate({
      length  : 12,
      numbers : true
    });
    return password
  }


  const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if email exists
      const logisticsPartner = await LogisticsPartner.findOne({ email });
      if (!logisticsPartner) {
        return res.status(404).send({
          message: 'Invalid email or password.',
          result: {},
        });
      }
  
      // Check if password is valid
      const isPasswordValid = await bcrypt.compare(password, logisticsPartner.password);
      if (!isPasswordValid) {
        return res.status(401).send({
          message: 'Invalid email or password.',
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
        message: 'Login successful.',
        result: {
          token: logisticsPartner.token,
          client_id: logisticsPartner.client_id,
          company_name: logisticsPartner.company_name,
          email: logisticsPartner.email,
        },
      });
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).send({
        message: error.message || 'Internal Server Error',
        result: {},
      });
    }
  };
  
  const addLogisticsPartner =  async (req, res) => {
    try {
      const {company_name, contact_person, email, phone, address} = req.body
      console.log("req.obj", req.body)
      // return false
      const emailExists = await LogisticsPartner.findOne({ email: req.email });
      if (emailExists) {
        return callback({ code: 409, message: 'Email already exists' });
      }
  
      const clientId = 'LGP-' + Math.random().toString(16).slice(2, 10);
      const jwtSecretKey = process.env.APP_SECRET;
      const data = { time: Date(), clientId };
      const token = jwt.sign(data, jwtSecretKey);
      const autoGeneratedPassword = generatePassword() 
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(autoGeneratedPassword, saltRounds);

      const newClient = new LogisticsPartner({
        client_id: clientId,
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
      return res?.status(200)?.send({ message:"Logistics Partner Added Successfully", result: autoGeneratedPassword });
    } catch (error) {
      console.error(error);
      return res?.status(500)?.send({ message: error?.message || "Internal Server Error", result: {},});
    }
  };

  const getLogisticsList =  async (req, res) => {
    try {
      const {client_id, status, pageNo, pageSize} = req.query
      const page_no   = pageNo || 1
      const page_size = pageSize || 1
      const offset    = (page_no - 1) * page_size 

      const data = await Logistics.find({ status }).skip(offset).limit(pageSize);
      const totalItems = await Logistics.countDocuments({ status });
      const totalPages = Math.ceil(totalItems / pageSize);
      res.status(200).json({
          message: 'Logistics list fetched successfully',
          result: {
              data,
              totalPages,
              totalItems,
          },
      })
    } catch (error) {
      console.error(error);
      return res?.status(500)?.send({ message: error?.message || "Internal Server Error", result: {},});
    }
  };

  const getLogisticsDetails = async (req, res) => {
    const { clientId, logisticsId } = req.query;
    try {
        const logisticsDetails = await Logistics.aggregate([
            {
                $match: {
                    logistics_id: logisticsId,
                    // client_id : clientId 
                },
            },
            {
                $lookup: {
                    from: 'orders', 
                    localField: 'orderId', 
                    foreignField: '_id', 
                    as: 'orderDetails',
                },
            },
            {
                $unwind: {
                    path: '$orderDetails', 
                    preserveNullAndEmptyArrays: true, 
                },
            },
        ]);

        if (!logisticsDetails.length) {
            return res.status(404).json({message: 'No logistics details found for the provided IDs', });
        }
        res.status(200).json({message: 'Logistics details fetched successfully',result: logisticsDetails[0], });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error',error: error.message,});
    }
  };

  const updateLogisticsDetails = async (req, res) => {
    try {
        const { logisticsId, pickup_time, pickup_date, orderId } = req.body;

        if (!logisticsId || !orderId || !pickup_time || !pickup_date) {
            return res.status(400).json({
                message: 'logisticsId, orderId, pickup_time, and pickup_date are required',
            });
        }

        const logistics = await Logistics.findOne({ logistics_id: logisticsId, orderId: orderId });

        if (!logistics) {
            return res.status(404).json({ message: 'No logistics details found for the provided logisticsId and orderId', });
        }

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId }, 
            { 
                $set: { 
                    'supplier_logistics_data.pickup_time': pickup_time,
                    'supplier_logistics_data.pickup_date': pickup_date,
                } 
            }, 
            { new: true } 
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found or update failed', });
        }

        res.status(200).json({ message: 'Order updated successfully', result: updatedOrder, });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message, });
    }
  };

  module.exports = { login, addLogisticsPartner, getLogisticsList, getLogisticsDetails, updateLogisticsDetails };
 

   





      

     
  




  