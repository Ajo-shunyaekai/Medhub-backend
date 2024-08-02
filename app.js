require('dotenv').config();
const express        = require('express');
let app              = express();
const path           = require('path');
const cors           = require('cors');
const cookieParser   = require('cookie-parser');
const bodyParser     = require('body-parser');
const connect        = require('./utils/dbConnection')

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
//-----------------   routes   -----------------------//

//db-connection
connect()

app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const corsOptions = {
  origin: [
    'http://192.168.1.31:2221',
    'http://localhost:2221',
    'http://localhost:3030',
    'http://192.168.1.34:3333',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3333',
    'https://supplierdeliver.shunyaekai.com',
    'https://buyerdeliver.shunyaekai.com',
    'https://deliver.shunyaekai.com'
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

//--------------- api routes ------------------//

const PORT = process.env.PORT || 3333;

const server = app.listen(PORT, (req, res) => {
  console.log(`server is runnig http://localhost:${PORT}/`);
});

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error   = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.send('error');
//   // res.status(err.status || 500).json({ error: err.message });
// });

module.exports = app;


