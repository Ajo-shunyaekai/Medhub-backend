const multer = require('multer')

module.exports = {
    imageUpload : () => {
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, './uploads/product_files');
            },
            filename: (req, file, cb) => {
                const ext = file.mimetype.split("/")[1];
                cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
            },
        });
        const upload = multer({ storage: storage });
        const cpUpload = upload.fields([
            { name : 'product_image', maxCount  : 4 }, 
        ]);
    }
    
}


