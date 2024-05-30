require('dotenv').config();
const express         = require('express');
let app               = express();
const path            = require('path');
const cors            = require('cors');
const cookieParser    = require('cookie-parser');
const bodyParser      = require('body-parser');
const connect         = require('./utils/dbConnection')


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
//-----------------   routes   -----------------------//


//db-connection
connect()

app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'build')));
// app.use(express.static(path.join(__dirname, 'adminBuild')));
// app.use('/buyer', express.static(path.join(__dirname, 'buyerBuild')));
// app.use('/supplier', express.static(path.join(__dirname, 'supplierBuild')));

// Fallback for buyer route (SPA handling)
// app.get('/buyer/*', function (req, res) {
//   res.sendFile(path.join(__dirname, 'buyerBuild', 'index.html'));
// });

// // Fallback for supplier route (SPA handling)
// app.get('/supplier/*', function (req, res) {
//   res.sendFile(path.join(__dirname, 'supplierBuild', 'index.html'));
// });

// // Fallback for admin route (SPA handling)
// app.get('/admin/*', function (req, res) {
//   res.sendFile(path.join(__dirname, 'adminBuild', 'index.html'));
// });

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// app.get('/admin/*', function (req, res) {
//    res.sendFile(path.join(__dirname, 'adminBuild', 'index.html'));
// });

const corsOptions = {
    origins     : [ 'http://192.168.1.31:2221/', 'http://localhost:2221/', 'http://localhost:3030/', '192.168.1.59:3000/','http://localhost:3000/','http://localhost:3001/', 'https://deliver.shunyaekai.com','http://192.168.1.59:3000/'], 
    methods     : 'GET, POST', // HTTP methods to allow
    credentials : true, // Allow sending cookies and HTTP authentication information
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
//-----------------order--------------------------//

//--------------- api routes ------------------//

// function generatePassword() {
//   var length = 12,
//       charset = 
// "@#$&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$&*0123456789abcdefghijklmnopqrstuvwxyz",
//       password = "";
//   for (var i = 0, n = charset.length; i < length; ++i) {
//       password += charset.charAt(Math.floor(Math.random() * n));
//   }
//   return password;
// }

// const password = generatePassword()

const PORT = process.env.PORT || 3333;

const server = app.listen(PORT, (req, res) => {
  console.log(`server is runnig http://localhost:${PORT}/`);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


