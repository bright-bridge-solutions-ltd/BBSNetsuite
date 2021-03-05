/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/format',],
function(search, record, format) {
	
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
			
			filters: [{
				name: 'status',
				operator: search.Operator.ANYOF,
				values: ['SalesOrd:F'] // SalesOrd:F = Pending Billing
			},
					{
				name: 'custbody_bbs_contract_record',
				operator: search.Operator.NONEOF,
				values: ['@NONE@']
    		},
    				{
    			name: 'custrecord_bbs_contract_status',
    			join: 'custbody_bbs_contract_record',
    			operator: search.Operator.ANYOF,
    			values: ['1'] // 1 = Approved
    		},
    				{
				name: 'mainline',
				operator: search.Operator.IS,
				values: ['F']
			},
					{
				name: 'cogs',
				operator: search.Operator.IS,
				values: ['F']
			},
					{
				name: 'shipping',
				operator: search.Operator.IS,
				values: ['F']
			},
					{
				name: 'taxline',
				operator: search.Operator.IS,
				values: ['F']
			},
					{
    			name: 'custcol_bbs_so_search_date',
    			operator: search.Operator.WITHIN,
    			values: ['lastmonth']
    		}],
    		
    		columns: [{
				name: 'tranid',
				summary: search.Summary.GROUP
			},
					{
				name: 'internalid',
				summary: search.Summary.MAX
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
    	var tranID			= searchResult.values['GROUP(tranid)'];
    	var recordID		= searchResult.values['MAX(internalid)'];
    	
    	log.audit({
    		title: 'Processing Sales Order',
    		details: 'Tran ID: ' + tranID + '<br>Record ID: ' + recordID
    	});
    	
    	try
    		{
    			// load the sales order
    			var salesOrder = record.load({
    				type: record.Type.SALES_ORDER,
    				id: recordID,
    				isDynamic: true
    			});
    			
    			// get count of lines on the sales order
    			var lineCount = salesOrder.getLineCount({
    				sublistId: 'item'
    			});
    			
    			// loop through lines
    			for (var i = 0; i < lineCount; i++)
    				{
    					// select the line
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
		    					// get the date and month from the searchDate
		    					var month = searchDate.getMonth()+1;
		    					var year  = searchDate.getFullYear();
		    					
		    					// if the search date's month is 2 (February) and year is 2021
		    					if (month == 2 && year == 2021)
		    						{
		    							// update the 'Usage Updated' flag on the line
			    						salesOrder.setCurrentSublistValue({
			        						sublistId: 'item',
			        						fieldId: 'custcol_bbs_usage_updated',
			        						value: false
			        					});
			    						
			    						// commit the changes to the line
			    						salesOrder.commitLine({
			    							sublistId: 'item'
			    						});
		    						}
    						}
    				}
    			
    			// save the changes to the sales order
    			salesOrder.save();
    			
    			log.audit({
    				title: 'Sales Order Updated',
    				details: recordID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Sales Order ' + recordID,
    				details: e
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
        summarize: summarize
    };
    
});
