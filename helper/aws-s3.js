require("dotenv").config();
const aws = require("aws-sdk");
const fs = require("fs"); // Import fs module to read file
const path = require("path"); // Import path module to handle file paths

// AWS S3 Configuration
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

// Helper to create S3 params
const formS3Params = (file, isCSVFile, usertype) => {
  const fileContent = fs.readFileSync(file.path); // Read local file content

  let key;

  if (isCSVFile) {
    if (usertype?.toLowerCase() === "supplier") {
      key = `${process.env.S3_CSV__FOLDER_NAME2}/${file.filename}`;
    } else if (usertype?.toLowerCase() === "admin") {
      key = `${process.env.S3_CSV__FOLDER_NAME1}/${file.filename}`;
    }
  } else {
    key = `${process.env.S3__FOLDER_NAME}/${Date.now()}-${file.filename}`;
  }

  return {
    ACL: "public-read",
    Bucket: process.env.S3_BUCKET_NAME,
    Body: fileContent,
    ContentType: file.contentType, // Use contentType from file object
    ContentDisposition: "inline",
    Key: key,
  };
};

// Upload a single file
const uploadSingleFile = (file, isCSVFile, usertype) =>
  new Promise((resolve, reject) => {
    const params = formS3Params(file, isCSVFile, usertype);

    s3.upload(params, (err, data) => {
      if (err) return reject(err);
      resolve(data.Location); // return uploaded file URL
    });
  });

// Upload multiple files
const uploadMultipleFiles = async (files, isCSVFile = false, usertype = "") => {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }
  const uploads = (await Array.isArray(files))
    ? files.map(
        async (file) => await uploadSingleFile(file, isCSVFile, usertype)
      )
    : [uploadSingleFile(files, isCSVFile, usertype)];

  return Promise.all(uploads);
};

// Export functions if needed
module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
};
