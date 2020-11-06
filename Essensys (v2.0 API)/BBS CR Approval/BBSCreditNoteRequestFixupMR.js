/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
/**
 * @param {record} record
 * @param {search} search
 */
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
    	
    	// run search to find records to be processed
    	return search.create({
    		type: search.Type.RETURN_AUTHORIZATION,
    		
    		filters: [{
    			name: 'mainline',
    			operator: search.Operator.IS,
    			values: ['T']
    		},
    				{
    			name: 'custbody_bbs_approval_status',
    			operator: search.Operator.ANYOF,
    			values: [6] // 6 = Approved
    		},
    				{
    			name: 'status',
    			operator: search.Operator.ANYOF,
    			values: ['RtnAuth:A'] // RtnAuth:A = Pending Approval
    		}],
    		
    		columns: [{
    			name: 'tranid'
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
    	
    	// retrieve search results
    	var recordID	= searchResult.id;
    	var tranID		= searchResult.values['tranid'];
    	
    	log.audit({
			title: 'Processing Credit Note Request',
			details: 'Record ID: ' + recordID + '<br>Tran ID: ' + tranID
		});
    	
    	try
    		{
    			record.submitFields({
    				type: record.Type.RETURN_AUTHORIZATION,
    				id: recordID,
    				values: {
    					status: 'B' // B = Pending Receipt
    				},
    				enableSourcing: false,
					ignoreMandatoryFields: true
    			});
    			
    			log.audit({
    				title: 'Credit Note Request Updated',
    				details: recordID
    			});
    			
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Credit Note Request',
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
    function summarize(summary) {
    	
    	log.audit({
    		title: '*** END OF SCRIPT ***',
    		details: 'Duration: ' + summary.seconds + ' seconds<br>Units Used: ' + summary.usage + '<br>Yields: ' + summary.yields
    	});
    	
    }
    
    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
