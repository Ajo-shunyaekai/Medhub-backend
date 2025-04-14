const { getLoginFrequencyLast90Days } = require("./userUtils");

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const sec = String(date.getSeconds()).padStart(2, "0");

  return `${dd}-${mm}-${yy}, ${hh}:${min}:${sec}`;
};

// Function to flatten data and remove internal Mongoose properties
const flattenData = (obj, excArr = [], incArr = [], list_type, prefix = "") => {
  let result = {};

  for (const key in obj) {
    if (excArr?.includes(key)) continue;

    if (list_type == "order_list" && !incArr?.includes(key)) continue;

    if (obj.hasOwnProperty(key) && !key.startsWith("$")) {
      let newKey = prefix ? `${prefix}.${key}` : key;

      // Special handling for login_history
      if (key === "login_history" && Array.isArray(obj[key])) {
        const loginFrequency = getLoginFrequencyLast90Days(obj[key]);
        result["Login Frequency"] = loginFrequency;
        continue; // skip further processing of login_history
      } else if (key === "createdAt") {
        result["Account Created At"] = formatDateTime(obj[key]);
      }

      newKey = newKey?.replaceAll("_", " ");
      const newArr = newKey?.split(" ");
      const NewArrCaps = newArr?.map(
        (txt) => txt?.[0]?.toUpperCase() + txt?.slice(1)
      );
      newKey = NewArrCaps?.join()?.replaceAll(",", " ");

      if (key === "last_login") {
        result["Last Login"] = formatDateTime(obj[key]);
      } else if (newKey === "Account Status") {
        if (obj[key] === 0) {
          result[newKey] = "Pending";
        } else if (obj[key] === 1) {
          result[newKey] = "Accepted";
        } else if (obj[key] === 2) {
          result[newKey] = "Rejected";
        } else if (obj[key] === 3) {
          result[newKey] = "Blocked";
        }
      } else if (
        typeof obj[key] === "object" &&
        !Array.isArray(obj[key]) &&
        obj[key] !== null
      ) {
        Object.assign(result, flattenData(obj[key], newKey)); // Recursively flatten nested objects
      } else if (Array.isArray(obj[key])) {
        result[newKey] = obj[key].join(", ");
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
