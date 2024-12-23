require('dotenv').config();
const express        = require('express');
let app              = express();
const path           = require('path');
const cors           = require('cors');
const cookieParser   = require('cookie-parser');
const bodyParser     = require('body-parser');
const connect        = require('./utils/dbConnection')
const initializeSocket = require('./utils/socketHandler');
const { Server }     = require('socket.io'); 

//-----------------   routes   -----------------------//
const userRouter      = require('./routes/userRoutes')()
const adminRouter     = require('./routes/adminRoutes')()
const medicineRouter  = require('./routes/medicineRoute')()
const categoryRouter  = require('./routes/categoryRoutes')()
const buyerRouter     = require('./routes/buyerRoutes')()
const sellerRouter    = require('./routes/sellerRoutes')()
const supplierRouter  = require('./routes/supplierRoutes')()
const guestRouter     = require('./routes/guestRoutes')()
const orderRouter     = require('./routes/orderRoutes')()
const enquiryRouter   = require('./routes/enquiryRoutes')()
const purchaseRouter  = require('./routes/purchaseOrderRoutes')()
const invoiceRouter   = require('./routes/invoiceRoutes')()
const authRoutes = require(`./routes/authRoutes`)

//-----------------   routes   -----------------------//

//db-connection
connect()


app.use('/uploads', express.static('uploads'));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/home.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.use(express.static(path.join(__dirname, 'public')));


// ------------------- React Frontend ------------------- //
// Serve React build for other routes
app.use(express.static(path.join(__dirname, 'build')));

app.get(['/*'], (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const corsOptions = {
  origin: [
    'http://192.168.1.31:2221',
    'http://192.168.1.82:3000',
    'http://192.168.1.42:3000',
    'http://192.168.1.87:3000',
    'http://192.168.1.53:3000',
    'http://localhost:2221',
    'http://localhost:3030',
    'http://192.168.1.34:3333',
    'http://192.168.1.218:3030',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3333',
  ],
  methods: 'GET, POST',
  credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(bodyParser.json({ limit: '500000mb' }));

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//------------------------------ api routes ------------------//
app.use(`/api/auth`,authRoutes)
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);

//----------medicine-------------//
app.use('/api/medicine', medicineRouter);
app.use('/api/buyer/medicine', medicineRouter);
app.use('/api/supplier/medicine', medicineRouter);
app.use('/api/admin/medicine', medicineRouter);
//---------------medicine------------------//

app.use('/api/category', categoryRouter);
app.use('/api/buyer', buyerRouter);

app.use('/api/seller', sellerRouter);
// app.use('/api/buyer/seller', sellerRouter);

app.use('/api/supplier', supplierRouter);
app.use('/api/buyer/supplier', supplierRouter);

app.use('/api/guest', guestRouter);

//-----------------order--------------------------//
app.use('/api/order', orderRouter);
app.use('/api/order1', orderRouter);
app.use('/api/buyer/order', orderRouter);
app.use('/api/supplier/order', orderRouter);
//-----------------order--------------------------//

//-----------------enquiry--------------------------// 
app.use('/api/enquiry', enquiryRouter);
app.use('/api/buyer/enquiry', enquiryRouter);
app.use('/api/supplier/enquiry', enquiryRouter);
//-----------------enquiry--------------------------//

//-----------------purchaseorder--------------------------// 
app.use('/api/purchaseorder', purchaseRouter);
app.use('/api/buyer/purchaseorder', purchaseRouter);
app.use('/api/supplier/purchaseorder', purchaseRouter);
//-----------------purchaseorder--------------------------//

//-----------------invoice--------------------------// 
app.use('/api/invoice', invoiceRouter);
app.use('/api/buyer/invoice', invoiceRouter);
app.use('/api/supplier/invoice', invoiceRouter);
//-----------------purchaseorder--------------------------//

//--------------- api routes ------------------//
const ADMIN_ID = process.env.ADMIN_ID
const PORT = process.env.PORT || 2222;

const server = app.listen(PORT, (req, res) => {
  console.log(`server is runnig http://localhost:${PORT}/`);
});

// const io = new Server(server, { // Initialize Socket.IO
//   cors: {
//     origin: [
//       'http://192.168.1.31:2221',
//       'http://192.168.1.82:3000',
//       'http://192.168.1.42:3000',
//       'http://192.168.1.14:3000',
//       'http://localhost:2221',
//       'http://localhost:3030',
//       'http://192.168.1.34:3333',
//       'http://localhost:3000',
//       'http://localhost:3001',
//       'http://localhost:3333',
//       'https://supplierdeliver.shunyaekai.com',
//       'https://buyerdeliver.shunyaekai.com',
//       'https://deliver.shunyaekai.com'
//     ],
//     methods: ['GET', 'POST'],
//     credentials: true
//   }
// });






// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   // Registration handlers
//   ['register', 'registerBuyer', 'registerAdmin'].forEach(event => {
//     socket.on(event, (userId) => {
//       console.log(`${event.replace('register', '')} registered: ${userId}`);
//       socket.join(userId);
//     });
//   });

//   // Notification handlers
//   const notificationEvents = [
//     { event: 'sendNotification', emit: 'notification' },
//     { event: 'sendInquiry', emit: 'newEnquiry' },
//     { event: 'submitQuotation', emit: 'enquiryQuotation' },
//     { event: 'createPO', emit: 'POCreated' },
//     { event: 'editPO', emit: 'POEdited' },
//     { event: 'createOrder', emit: 'orderCreated' },
//     { event: 'bookLogistics', emit: 'logisticsRequest' },
//     { event: 'shipmentDetailsSubmitted', emit: 'shipmentDetailsSubmission' },
//     { event: 'createInvoice', emit: 'invoiceCreated' },
//     { event: 'invoicePaymentDone', emit: 'invoicePaymentStatusUpdated' },
//     { event: 'buyerRegistration', emit: 'buyerRegistered' },
//     { event: 'supplierRegistration', emit: 'supplierRegistered' },
//     { event: 'addMedicine', emit: 'medicineRequest' },
//     { event: 'editNewMedicine', emit: 'newMedicineEditRequest' },
//     { event: 'editSecondaryMedicine', emit: 'secondaryMedicineEditRequest' },
//     { event: 'updateMedicineAddRequest', emit: 'addMedicineRequestUpdated' },
//     { event: 'updateMedicineEditRequest', emit: 'editMedicineRequestUpdated' }
//   ];

//   notificationEvents.forEach(({ event, emit }) => {
//     socket.on(event, (data) => {
//       const { userId, supplierId, buyerId, adminId, message } = data;
//       const targetId = userId || supplierId || buyerId || adminId;
      
//       if (targetId) {
//         io.to(targetId).emit(emit, message);
//         console.log(`${event} notification sent to ${targetId}`);
//       }
//     });
//   });




//   // Handle disconnection
//   socket.on('disconnect', () => {
//       console.log('User disconnected: ', socket.id);
//   });
// });

initializeSocket(server)




module.exports = app;

