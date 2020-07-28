/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search', './BBSCustomerLogicLibrary'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(record, runtime, search, BBSCustomerLogicLibrary) {
   
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() 
	    {
    		var returnObject = {};
    		
    		var customerSearchObj = getResults(search.create({
								    			   type: "customer",
								    			   filters:
								    			   [
								    			   ],
								    			   columns:
								    			   [
								    			      search.createColumn({name: "internalid", label: "Internal ID"})
								    			   ]
								    			}));
    			
			if(customerSearchObj != null && customerSearchObj.length > 0)
				{
					for (var int = 0; int < customerSearchObj.length; int++) 
			   			{
							var custId = customerSearchObj[int].id;
							returnObject[custId] = custId;
						}
			    }

			log.debug({
						title: 		'Number of customers to process =' + customerSearchObj.length,
						details: 	''
						});
			
			return returnObject;
	    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) 
	    {

	    	//Process each sales order
	    	//
	    	var customerRecord = null;
	    			
	    	try
	    		{
	    			customerRecord = record.load({
					    							type:		record.Type.CUSTOMER,
					    							id:			context.value,
					    						});
	    		}
	    	catch(err)
	    		{
	    			customerRecord = null;
	    					
	    			log.error({
								title: 		'Error loading customer with id = ' + context.value,
								details: 	err
								});
	    		}
	    			
	    	if(customerRecord != null)
	    		{
	    			BBSCustomerLogicLibrary.customerLogic(customerRecord);
	    		}
	    }

    //Page through results set from search
    //
    function getResults(_searchObject)
	    {
	    	var results = [];
	
	    	var pageData = _searchObject.runPaged({pageSize: 1000});
	
	    	for (var int = 0; int < pageData.pageRanges.length; int++) 
	    		{
	    			var searchPage = pageData.fetch({index: int});
	    			var data = searchPage.data;
	    			
	    			results = results.concat(data);
	    		}
	
	    	return results;
	    }

    return {
        getInputData: 	getInputData,
        map: 			map
    };
    
});
