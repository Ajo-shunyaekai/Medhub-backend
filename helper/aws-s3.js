// require("dotenv").config();
// const aws = require("aws-sdk");
// const fs = require("fs");
// const path = require("path");
// const { fileURLToPath } = require("url");
// const { dirname } = require("path");
// const multerS3 = require("multer-s3");

// // Configure AWS SDK with your credentials
// aws.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// const formS3Params = (file, folder) => ({
//   ACL: "public-read",
//   Bucket: process.env.S3_BUCKET_NAME,
//   Body: file.data, // Use file.data instead of createReadStream
//   Key: `${folder}/${Date.now()}-${file.name}`, // Use file.name for the filename
// });

// const uploadSingleFile = (file, folder) =>
//   new Promise((resolve, reject) => {
//     if (!file) return resolve("");

//     const s3 = new aws.S3();
//     const params = formS3Params(file, folder);

//     s3.upload(params, (err, data) => {
//       if (err) {
//         console.error("Error occurred while trying to upload to S3 bucket", err);
//         return reject(err);
//       }

//       // fs.unlinkSync(file.path);
//       return resolve(data.Location);
//       // return resolve(`https://${formS3Params.Bucket}.s3.amazonaws.com/${formS3Params.Key}`);
//     });
//   });

// const uploadMultipleFiles = (files, folder) =>
//   new Promise((resolve, reject) => {
//     let uploadPromises = files.map((file) => uploadSingleFile(file, folder));
//     Promise.all(uploadPromises)
//       .then((locations) => {
//         return resolve(locations);
//       })
//       .catch((err) => {
//         return reject(err);
//       });
//   });

// // Export functions if needed
// module.exports = {
//   uploadSingleFile,
//   uploadMultipleFiles,
// };

require("dotenv").config();
const aws = require("aws-sdk");

// Configure AWS SDK
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// S3 helper functions
const formS3Params = (file) => ({
  ACL: "public-read",
  Bucket: process.env.S3_BUCKET_NAME,
  Body: file.data,
  Key: `${process.env.S3__FOLDER_NAME}/${Date.now()}-${file.name}`,
});

const uploadSingleFile = (file) =>
  new Promise((resolve, reject) => {
    const s3 = new aws.S3();
    const params = formS3Params(file);

    s3.upload(params, (err, data) => {
      if (err) return reject(err);
      resolve(data.Location);
    });
  });

const uploadMultipleFiles = (files) => {
  if (!files || files.length === 0) {
    return [];
  }
  const uploads = Array.isArray(files)
    ? files.map((file) => uploadSingleFile(file))
    : [uploadSingleFile(files)];

  return Promise.all(uploads);
};

// Export functions if needed
module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
};
