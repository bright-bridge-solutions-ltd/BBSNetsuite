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
    	
    	// create search to find records to be updated
    	return search.create({
    		type: search.Type.INVOICE,
    		
    		columns: [{
    			name: 'internalid'
    		}],
    		
    		filters: [{
    			name: 'mainline',
    			operator: 'is',
    			values: ['T']
    		},
    				{
    			name: 'datecreated',
    			operator: 'within',
    			values: ['17/01/2020', '20/01/2020']
    		},
    				{
    			name: 'internalid',
    			operator: 'noneof',
    			values: ['3955', '4333', '3933', '3934', '3935', '3936', '3937']
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
    	
    	// get the internal ID of the record from the search results
		var invoiceID = searchResult.id;
		
		log.audit({
			title: 'Processing Invoice',
			details: invoiceID
		});
		
		try
			{
				// transform the invoice into a credit memo
				var creditMemo = record.transform({
					fromType: record.Type.INVOICE,
					fromId: invoiceID,
					toType: record.Type.CREDIT_MEMO
				});
				
				// save the credit memo record
				var creditMemoID = creditMemo.save();
				
				log.audit({
					title: 'Credit Memo Created',
					details: 'Credit Memo ID: ' + creditMemoID + '<br>Invoice ID: ' + invoiceID
				});
			}
		catch(e)
			{
				log.error({
					title: 'Error Creating Credit Memo',
					details: 'Invoice ID: ' + invoiceID + '<br>Error: ' + e
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

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
