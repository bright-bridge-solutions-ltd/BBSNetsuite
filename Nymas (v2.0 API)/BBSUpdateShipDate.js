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
    	
    	// run search to find sales orders to be updated
    	return search.create({
    		type: search.Type.SALES_ORDER,
    		
    		filters: [{
    			name: 'status',
    			operator: search.Operator.ANYOF,
    			values: ['SalesOrd:D', 'SalesOrd:E'] // SalesOrd:D = Partially Fulfilled, SalesOrd:E = Pending Billing/Partially Fulfilled
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
    			name: 'formulanumeric',
    			formula: '{quantity} - {quantityshiprecv}',
    			operator: search.Operator.GREATERTHAN,
    			values: [0]
    		},
    				{
    			name: 'shipdate',
    			operator: search.Operator.ISNOTEMPTY
    		},
    				{
    			name: 'shipdate',
    			operator: search.Operator.ONORAFTER,
    			values: ['today']
    		}],
    		
    		columns: [{
    			name: 'internalid',
    			summary: 'GROUP'
    		},
    				{
    			name: 'shipdate',
    			summary: 'MIN'
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
    	var searchResults 	= 	JSON.parse(context.value);
    	var recordID		=	searchResults.values['GROUP(internalid)'].value;
    	var shipDate		=	searchResults.values['MIN(shipdate)'];
    	
    	log.audit({
    		title: 'Processing Sales Order',
    		details: recordID
    	});
    	
    	try
    		{
    			// update the ship date on the sales order
    			record.submitFields({
    				type: record.Type.SALES_ORDER,
    				id: recordID,
    				values: {
    					shipdate: shipDate
    				}
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
