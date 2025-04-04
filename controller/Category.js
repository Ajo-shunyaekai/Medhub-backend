const logErrorToFile = require('../logs/errorLogs');
const Category           = require('../schema/categorySchema');
const { sendErrorResponse, handleCatchBlockError } = require('../utils/commonResonse');


module.exports = {

    addCategory : async (req, res, reqObj, callback) => {
        try {
            let category_id  = "CAT-" + Math.random().toString(16).slice(2);

            const category = new Category({
                category_id    : category_id,
                category_name  : reqObj.category_name,
                description    : reqObj.description,
              })

              category.save().then((savedCategory) => {
                return callback({code: 200, message: "Category Added Successfully", result: savedCategory });
              }).catch((err) => {
                return callback({code: 400, message: "Error while adding category" });
               })
        } catch (error) {
            handleCatchBlockError(req, res, error);
        }
    },

    categoriesList : async (req, res, reqObj, callback) => {     
        try { 
            Category.find({}).select('category_id category_name description').then((data) => {
              callback({code: 200, message : 'Category list fetched successfully', result:data})
          }).catch((err) => {
              callback({code: 400, message : 'Error in fetching categories list',error: err})
          });
        } catch (error) {
            handleCatchBlockError(req, res, error);
        }     
    },

    editCategory : async (req, res, reqObj, callback) => {
        try {

        } catch (error) {
            handleCatchBlockError(req, res, error);
        }
    },

}