const multer = require("multer");

const createMulterMiddleware = (uploadConfig) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const { usertype } = req.headers;

      if (!usertype) {
        
        return cb(new Error("Need User Type"));
      }

      const fieldConfig = uploadConfig.find(
        (config) => config.fieldName === file.fieldname
      );

      let uploadPath = fieldConfig ? fieldConfig.uploadPath : './uploads/default';

    //   if (fieldConfig) {
    //     uploadPath =
    //       usertype === "Buyer"
    //         ? fieldConfig.buyerPath
    //         : usertype === "Supplier"
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
