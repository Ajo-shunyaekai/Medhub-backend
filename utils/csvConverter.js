// Function to flatten data and remove internal Mongoose properties
const flattenData = (obj, excArr = [], incArr = [], list_type, prefix = "") => {
  let result = {};

  for (const key in obj) {
    if (excArr?.includes(key)) continue;

    if(list_type == 'order_list' && !incArr?.includes(key))continue;
    
    if (obj.hasOwnProperty(key) && !key.startsWith("$")) {
      let newKey = prefix ? `${prefix}.${key}` : key;

      newKey = newKey?.replaceAll("_", " ");
      const newArr = newKey?.split(" ");
      const NewArrCaps = newArr?.map(
        (txt) => txt?.[0]?.toUpperCase() + txt?.slice(1)
      );
      newKey = NewArrCaps?.join()?.replaceAll(",", " ");

      if (newKey === 'Account Status') {
        if (obj[key] === 0) {
          result[newKey] = 'Pending';
        } else if (obj[key] === 1) {
          result[newKey] = 'Accepted';
        } else if (obj[key] === 2) {
          result[newKey] = 'Rejected';
        } else if (obj[key] === 3) {
            result[newKey] = 'Blocked';
        }
      } else if (
        typeof obj[key] === "object" &&
        !Array.isArray(obj[key]) &&
        obj[key] !== null
      ) {
        Object.assign(result, flattenData(obj[key], newKey)); // Recursively flatten nested objects
      } else {
        result[newKey] = obj[key]; // Directly add key-value if it's not an object
      }
    }

    // If the key is '_id', convert it to string
    if (key === "_id") {
      result[prefix ? `${prefix}._id` : "_id"] = obj[key].toString(); // Convert ObjectId to string
    }
  }

  return result;
};

module.exports = { flattenData };
