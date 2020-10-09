/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(record, runtime, search) {
   
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
    		
	    	//Find the integration record
			//
			var customrecord_bbs_comet_integrationSearchObj = getResults(search.create({
				   type: 	"customrecord_bbs_comet_integration",
				   filters:	[
				           	 	["isinactive","is","F"]
				           	 ],
				   columns:
				   [
				      search.createColumn({name: "custrecord_bbs_comet_cash_sale_cust", 		label: "Cash Sale Customer"})
				   ]
				}));
			
			if(customrecord_bbs_comet_integrationSearchObj != null && customrecord_bbs_comet_integrationSearchObj.length == 1)
				{
					var integrationCashSaleCust		= customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_cash_sale_cust"});

		    		//Find purchase orders that need to be received
		    		//Created before today, pending receipt & created from customer is the cash sale account
		    		//
					var salesorderSearchObj = getResults(search.create({
																	   type: "salesorder",
																	   filters:
																	   [
																	      ["type","anyof","SalesOrd"], 
																	      "AND", 
																	      ["mainline","is","T"], 
																	      "AND", 
																	      ["status","anyof","SalesOrd:B"], 	// SalesOrd:B = Pending Fulfillment
																	      "AND", 
																	      ["name","anyof",integrationCashSaleCust], 
																	      "AND", 
																	      ["trandate","before","today"],
																	      "AND",
																	      ["cseg_bbs_division","anyof","5"] // 5 = Comet
																	   ],
																	   columns:
																	   [
																	      search.createColumn({
																	         name: "ordertype",
																	         sort: search.Sort.ASC,
																	         label: "Order Type"
																	      }),
																	      search.createColumn({name: "tranid", label: "Document Number"})
																	   ]
																	}));
						
			    	
			    	if(salesorderSearchObj != null && salesorderSearchObj.length > 0)
			    		{
			    			for (var int = 0; int < salesorderSearchObj.length; int++) 
				    			{
									var poId = salesorderSearchObj[int].id;
									returnObject[poId] = poId;
								}
			    		}
				}
			else
				{
					log.error({
								title: 		'Error - unable to find configuration record',
								details: 	''
								});
				}
    	
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
	    	var ifRecord = null;
	    			
	    	try
	    		{
					ifRecord = record.transform({
												fromType:		record.Type.SALES_ORDER,
												fromId:			context.value,
												toType:			record.Type.ITEM_FULFILLMENT,
												isDynamic:		true
												});
					
					ifRecord.setValue({
										fieldId:	'shipstatus',
										value:		'C'				//Shipped
									});
					
	    		}
	    	catch(err)
	    		{
	    			ifRecord = null;
	    				
	    			log.error({
								title: 'Error transforming sales order id = ' + context.value,
								details: err
							});
	    		}
	    			
	    	if(ifRecord != null)
	    			{
		    			try
			   				{
				    			var ifRecordId = ifRecord.save({
						    									enableSourcing:			true,
						    									ignoreMandatoryFields:	true
						    									});
			   				}
		    			catch(err)
			   				{
		    					ifRecordId = null;
			    					
			   					log.error({
											title: 'Error saving Item Receipt record',
											details: err
											});
			   				}
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
