// Helper function to retrieve file paths
async function getFilePathsAdd(req, res, fields = []) {
  try {
    const filePaths = {};
  
    // Make sure fields is an array and req.files is an object
    if (!Array.isArray(fields)) {
      console.error("Expected fields to be an array, but received:", fields);
      return filePaths; // Return an empty filePaths object
    }
  
    // Iterate over the fields array
    for (const field of fields) {
      if (
        req?.uploadedFiles?.[field] &&
        req?.uploadedFiles?.[field]?.length > 0
      ) {
        const validPaths =
          req?.uploadedFiles?.[field]
            // ?.map((file) => file.filename) // Map to file paths
            ?.map((file) => file) // Map to file paths
            ?.filter((path) => path && path.trim() !== "") || []; // Filter out empty strings
  
        filePaths[field] = validPaths.length > 0 ? validPaths : []; // Use valid paths or empty array
      } else {
        filePaths[field] = []; // Assign empty array if no files are present
      }
    }
  
    return filePaths;
  } catch (error) {
    console.error(error)
  }
}

// Helper function to retrieve file paths
async function getFilePathsEdit(req, res, fields = []) {
  const filePaths = {};

  for (const field of fields) {
    // Step 1: Retrieve the old file names (without "New") from the existing product
    const oldFieldName = field.replace("New", ""); // Remove 'New' to match the old field name
    const oldFiles = Array.isArray(req?.body?.[oldFieldName])
      ? req?.body?.[oldFieldName]
      : [req?.body?.[oldFieldName]] || []; // Default to an empty array if no old files exist

    // Step 2: Get the new file names (with 'New' suffix) from the current upload
    const newFiles =
      // req?.files?.[field + "New"]?.map((file) => file?.filename) || [];
      req?.uploadedFiles?.[field + "New"]
        ?.map((file) => file)
        ?.filter((path) => path && path.trim() !== "") || [];

    // Step 3: Combine old and new files (remove duplicates)
    const combinedFiles = [...oldFiles, ...newFiles]
      ?.map((filename) => filename?.replaceAll("New", ""))
      ?.filter((filename, index, self) => {
        // Make sure filenames are strings and not arrays or broken down into characters
        return (
          typeof filename === "string" &&
          filename &&
          self.indexOf(filename) === index
        );
      });

    // Step 4: Store the combined file paths for each field
    filePaths[field] = combinedFiles;
  }

  return filePaths;
}

function extractLast13WithExtension(filename) {
  // Split the filename at the period to separate the extension
  const parts = filename.split(".");
  const extension = parts[parts.length - 1]; // Get the file extension

  // Remove the extension and get the last 13 characters before the extension
  const baseFilename = parts.slice(0, parts.length - 1).join(".");
  const last13Chars = baseFilename.slice(-13); // Get last 13 characters

  // Return the last 13 characters and the extension
  return last13Chars + "." + extension;
}

module.exports = {
  getFilePathsAdd,
  getFilePathsEdit,
  extractLast13WithExtension,
};
