/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
function(search, record) {
   
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
    function getInputData() {
    	
    	// create search to find sales orders to be processed
    	return search.create({
    		type: search.Type.SALES_ORDER,
			
			columns: [{
				name: 'tranid'
			}],
			
			filters: [{
				name: 'status',
				operator: search.Operator.ANYOF,
				values: ['SalesOrd:F'] // SalesOrd:F = Pending Billing
			},
					{
				name: 'internalid',
				operator: search.Operator.ANYOF,
				values: [194296]
    		},
    				{
				name: 'mainline',
				operator: search.Operator.IS,
				values: ['T']
			}],
		});

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// retrieve search results
    	var searchResult 	= JSON.parse(context.value);
    	var recordID		= searchResult.id;
    	var tranID			= searchResult.values['tranid'];
    	
    	log.audit({
    		title: 'Processing Sales Order',
    		details: 'Tran ID: ' + tranID + '<br>RecordID: ' + recordID
    	});
    	
    	try
    		{
    			// load the sales order
    			var salesOrder = record.load({
    				type: record.Type.SALES_ORDER,
    				id: recordID,
    				isDynamic: true
    			});
    			
    			// get count of item lines
    			var itemCount = salesOrder.getLineCount({
    				sublistId: 'item'
    			});
    			
    			// loop through item lines
    			for (var i = itemCount; i > 0; i--)
    				{
    					// select the line item
    					salesOrder.selectLine({
    						sublistId: 'item',
    						line: i
    					});
    					
    					// get the search date from the line
    					var searchDate = salesOrder.getCurrentSublistValue({
    						sublistId: 'item',
    						fieldId: 'custcol_bbs_so_search_date'
    					});
    					
    					// if we have a search date
    					if (searchDate)
    						{
    							// get the month from the searchDate
    							var month = searchDate.getMonth()+1;
    							
    							// if the month is 10 (October)
    							if (month == 10)
    								{
	    								// remove the line from the sales order
    									salesOrder.removeLine({
	        							    sublistId: 'item',
	        							    line: i,
	        							    ignoreRecalc: true
	        							});
    								}
    						}
    				}
    			
    			// save the changes to the sales order
    			salesOrder.save({
	    			enableSourcing: false,
		    		ignoreMandatoryFields: true
	    		});
    			
    			log.audit({
    				title: 'Sales Order Updated',
    				details: recordID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Sales Order',
    				details: 'Record ID: ' + recordID + '<br>Error: ' + e
    			});
    		}
    	
    	
    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(context) {
    	
    	log.audit({
    		title: 'Units Used',
    		details: context.usage
    	});
    	
    	log.audit({
    		title: 'Number of Yields',
    		details: context.yields
    	});

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
