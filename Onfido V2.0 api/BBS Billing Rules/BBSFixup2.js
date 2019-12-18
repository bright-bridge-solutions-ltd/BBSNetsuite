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
    	
    	// create search to find sales orders to be updated
    	return search.create({
			type: search.Type.SALES_ORDER,
			
			columns: [{
				name: 'tranid'
			}],
			
			filters: [{
				name: 'mainline',
				operator: 'is',
				values: ['T']
			},
					{
				name: 'status',
				operator: 'anyof',
				values: ['SalesOrd:F'] // SalesOrd:F = Pending Billing
			},
					{
				name: 'custbody_bbs_contract_record',
				operator: 'noneof',
				values: ['@NONE@']
    		},
    				{
    			name: 'trandate',
    			operator: 'onorafter',
    			values: ['17/12/2019']
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
    	var searchResult = JSON.parse(context.value);
    	
    	// get the internal ID of the sales order
    	var recordID = searchResult.id;
    	
    	log.audit({
    		title: 'Processing Sales Order',
    		details: searchResult.values['tranid']
    	});
    	
    	try
    		{
	    		// load the sales order record
				var soRecord = record.load({
					type: record.Type.SALES_ORDER,
					id: recordID,
					isDynamic: true
				});
			
				// get count of item lines
		    	var lineCount = soRecord.getLineCount({
		    		sublistId: 'item'
		    	});
		    	
		    	// loop through line count
		    	for (var i = 0; i < lineCount; i++)
		    		{
			    		// select the line
						soRecord.selectLine({
							sublistId: 'item',
							line: i
						});
		    		
		    			// unset the 'Usage Updated' checkbox
		    			soRecord.setCurrentSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'custcol_bbs_usage_updated',
		    				value: false
		    			});
		    			
		    			// commit the line
		        		soRecord.commitLine({
							sublistId: 'item'
						});		
		    			
		    		}
		    	
		    	// save the sales order
		    	soRecord.save();
		    	
		    	log.audit({
		    		title: 'Sales Order Updated',
		    		details: 'Record ID: ' + recordID
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
