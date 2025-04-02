
module.exports = {
    
    aggregation :(reqObj, matchConditions) => {
        
        let aggregatePipeline
        if((reqObj.strength !== null && reqObj.strength !== undefined && reqObj.strength !== "" ) &&
         (reqObj.unit_price !== null && reqObj.unit_price !== undefined && reqObj.unit_price !== "") &&
         (reqObj.category_name !== null && reqObj.category_name !== undefined && reqObj.category_name !== "")) {

          aggregatePipeline = [
              {
                  $match: matchConditions
              },
              {
                  $unwind: {
                      path: "$strength",
                      preserveNullAndEmptyArrays: true
                  }
              },
              {
                  $match: {
                      $or: [
                          { strength: reqObj.strength },
                      ]
                  }
              },
              {
                  $lookup: {
                      from: 'medicineinventories', 
                      localField: 'product_id', 
                      foreignField: 'product_id', 
                      as: 'inventory'
                  }
              },
              {
                  $unwind: {
                      path: "$inventory",
                      preserveNullAndEmptyArrays: true
                  }
              },
              {
                  $match: {
                      $or: [
                          { "inventory.unit_price.value": reqObj.unit_price },
                      ]
                  }
              }
          ];
      } else if((reqObj.category_name !== null && reqObj.category_name !== undefined && reqObj.category_name !== "")|| 
                (reqObj.unit_price == null && reqObj.unit_price == undefined && reqObj.unit_price == "") || 
                (reqObj.strength == null && reqObj.strength == undefined && reqObj.strength == "") ){

                    aggregatePipeline = [
                      {
                          $match: matchConditions
                      },
                      {
                          $lookup: {
                              from: 'medicineinventories', 
                              localField: 'product_id', 
                              foreignField: 'product_id', 
                              as: 'inventory'
                          }
                      },
                  ];

      } else if((reqObj.unit_price !== null && reqObj.unit_price !== undefined && reqObj.unit_price !== "") || 
                (reqObj.category_name == null && reqObj.category_name == undefined && reqObj.category_name == "")|| 
                (reqObj.strength == null && reqObj.strength == undefined && reqObj.strength == "")) {

                  aggregatePipeline = [
                    {
                        $match: matchConditions
                    },
                    {
                        $lookup: {
                            from: 'medicineinventories', 
                            localField: 'product_id', 
                            foreignField: 'product_id', 
                            as: 'inventory'
                        }
                    },
                    {
                        $unwind: {
                            path: "$inventory",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $match: {
                            $or: [
                                { "inventory.unit_price.value": reqObj.unit_price },
                            ]
                        }
                    }
                ];
      } else if((reqObj.strength !== null && reqObj.strength !== undefined && reqObj.strength !== "") || 
                (reqObj.category_name == null && reqObj.category_name == undefined && reqObj.category_name == "")|| 
                (reqObj.unit_price == null && reqObj.unit_price == undefined && reqObj.unit_price == "")) {

                    aggregatePipeline = [
                      {
                          $match: matchConditions
                      },
                      {
                          $unwind: {
                              path: "$strength",
                              preserveNullAndEmptyArrays: true
                          }
                      },
                      {
                          $match: {
                              $or: [
                                  { strength: reqObj.strength },
                              ]
                          }
                      },
                      {
                          $lookup: {
                              from: 'medicineinventories', 
                              localField: 'product_id', 
                              foreignField: 'product_id', 
                              as: 'inventory'
                          }
                      },
                  ];
      } else {
              aggregatePipeline = [
                {
                    $match: matchConditions
                },
                {
                    $lookup: {
                        from: 'medicineinventories', 
                        localField: 'product_id', 
                        foreignField: 'product_id', 
                        as: 'inventory'
                    }
                },
                {
                    $unwind: {
                        path: "$inventory",
                        preserveNullAndEmptyArrays: true
                    }
                },
            ];
      }
      return aggregatePipeline;
    }

}