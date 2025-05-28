require("dotenv").config();
const aws = require("aws-sdk");
const fs = require("fs"); // Import fs module to read file
const path = require("path"); // Import path module to handle file paths

// Configure AWS SDK
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Helper function to create S3 upload params
const formS3Params = (file, isCSVFile, usertype) => {
  const fileContent = fs.readFileSync(file.path); // Read file content using fs
  return {
    ACL: "public-read",
    Bucket: process.env.S3_BUCKET_NAME,
    Body: fileContent, // Use file content here
    Key: isCSVFile
      ? usertype?.toLowerCase() == "supplier"
        ? `${process.env.S3_CSV__FOLDER_NAME2}/${file.filename}`
        : usertype?.toLowerCase() == "admin" &&
          `${process.env.S3_CSV__FOLDER_NAME1}/${file.filename}`
      : `${process.env.S3__FOLDER_NAME}/${Date.now()}-${file.filename}`, // Use 'filename' instead of 'name' as multer renames it
  };
};

const uploadSingleFile = (file, isCSVFile, usertype) =>
  new Promise((resolve, reject) => {
    const s3 = new aws.S3();
    const params = formS3Params(file, isCSVFile, usertype);

    s3.upload(params, (err, data) => {
      if (err) return reject(err);
      resolve(data.Location);
    });
  });

const uploadMultipleFiles = async (files, isCSVFile, usertype) => {
  if (!files || files.length === 0) {
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
