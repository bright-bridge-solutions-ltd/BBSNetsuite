/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record'],
function(runtime, search, record) {
	
	// retrieve script parameters
	refundType = runtime.getCurrentScript().getParameter({
		name: 'custscript_bbs_refund_type'
	});
   
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
    	
    	// run search to find refund requests to be processed
    	return search.create({
			type: 'customrecord_refund_request',
			
			filters: [{
				name: 'isinactive',
				operator: search.Operator.IS,
				values: ['F']
			},
					{
				name: 'custrecord_refund_processed',
				operator: search.Operator.IS,
				values: ['F']
			},
					{
				name: 'custrecord_refund_approval_status',
				operator: search.Operator.ANYOF,
				values: [2] // 2 = Approved
			},
					{
				name: 'custrecord_refund_method',
				operator: search.Operator.ANYOF,
				values: [refundType]
			}],
			
			columns: [{
				name: 'internalid'
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
    	var searchResult	= JSON.parse(context.value);
    	var recordID 		= searchResult.id;
    	
    	try
    		{
    			// mark the refund request as processed
    			record.submitFields({
    				type: 'customrecord_refund_request',
    				id: recordID,
    				values: {
    					custrecord_refund_processed: true
    				}
    			});
    			
    			log.audit({
    				title: 'Refund Request Marked as Processed',
    				details: recordID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Marking Refund Request as Processed',
    				details: 'Record ID: ' + recordID + '<br>Error: ' + e.message
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
    function summarize(summary) {
    	
    	log.audit({
    		title: '*** END OF SCRIPT ***',
    		details: 'Duration: ' + summary.seconds + ' seconds<br>Units Used: ' + summary.usage + '<br>Yields: ' + summary.yields
    	});

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
