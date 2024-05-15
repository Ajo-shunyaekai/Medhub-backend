const Category           = require('../schema/categorySchema')


module.exports = {

    addCategory : async(reqObj, callback) => {
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
            callback({code: 500, message : 'Internal server error'})
        }
    },

    categoriesList : async(reqObj, callback) => {     
        try { 
            Category.find({}).select('category_id category_name description').then((data) => {
              callback({code: 200, message : 'Category list fetched successfully', result:data})
          }).catch((err) => {
              callback({code: 400, message : 'Error in fetching categories list',error: err})
          });
        } catch (error) {
            console.log(error);
            callback({code: 500, message : 'Internal server error', error: error})
        }     
    },

    editCategory : async(reqObj, callback) => {
        try {

        } catch (error) {
            callback({code: 500, message : 'Internal server error'})
        }
    },

}