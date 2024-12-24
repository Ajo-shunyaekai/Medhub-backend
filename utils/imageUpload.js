
// const multer = require('multer');

// const createMulterMiddleware = (uploadConfig) => {
//     const storage = multer.diskStorage({
//         destination: (req, file, cb) => {
//             const fieldConfig = uploadConfig.find(config => config.fieldName === file.fieldname);
//             const uploadPath = fieldConfig ? fieldConfig.uploadPath : './uploads/default';
//             cb(null, uploadPath);
//         },
//         filename: (req, file, cb) => {
//             const ext = file.mimetype.split("/")[1];
//             cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
//         },
//     });

//     const upload = multer({ storage: storage });

//     return (req, res, next) => {
//         const fields = uploadConfig.map(config => ({
//             name: config.fieldName,
//             maxCount: config.maxCount || 1 // Default maxCount is 1 if not specified
//         }));

//         upload.fields(fields)(req, res, (err) => {
//             if (err) {
//                 console.error('Multer Error:', err);
//                 return res.status(500).json({ error: 'File upload error', details: err.message });
//             }
//             next();
//         });
//     };
// };

// module.exports = createMulterMiddleware;



const multer = require("multer");

const createMulterMiddleware = (uploadConfig) => {
    console.log('uploadConfig',uploadConfig)
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const { user_type } = req.headers;

      if (!user_type) {
        console.log('error', user_type);
        
        return cb(new Error("Need User Type"));
      }

      const fieldConfig = uploadConfig.find(
        (config) => config.fieldName === file.fieldname
      );

      let uploadPath = fieldConfig ? fieldConfig.uploadPath : './uploads/default';

    //   if (fieldConfig) {
    //     console.log('fieldConfig',fieldConfig)
    //     uploadPath =
    //       user_type === "Buyer"
    //         ? fieldConfig.buyerPath
    //         : user_type === "Supplier"
    //         ? fieldConfig.supplierPath
    //         : 
    //         uploadPath;
    //   }
    

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = file.mimetype.split("/")[1];
      cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
    },
  });

  const upload = multer({ storage: storage });

  return (req, res, next) => {
    const fields = uploadConfig.map((config) => ({
      name: config.fieldName,
      maxCount: config.maxCount || 1,
    }));

    upload.fields(fields)(req, res, (err) => {
      if (err) {
        console.error("Multer Error:", err);
        return res.status(500).json({ error: "File upload error", details: err.message });
      }
      next();
    });
  };
};

module.exports = createMulterMiddleware;
