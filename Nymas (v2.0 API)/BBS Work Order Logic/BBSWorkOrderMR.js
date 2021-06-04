/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record'],
function(runtime, search, record) {
   
    // retrieve script parameters. Script parameters are global variables so can be accessed throughout the script
	allocationStrategy = runtime.getCurrentScript().getParameter({
		name: 'custscript_bbs_wo_def_allocate_strategy'
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
    	
    	// search for records to be processed
    	return search.create({
    		type: search.Type.WORK_ORDER,
    		
    		filters: [{
    			name: 'orderallocationstrategy',
    			operator: search.Operator.ANYOF,
    			values: ['@NONE@']
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
    	var woID			= searchResult.values['MAX(internalid)'];
    	
    	log.audit({
    		title: 'Processing Work Order',
    		details: 'Tran ID: ' + tranID + '<br>Record ID: ' + woID
    	});
    	
    	try
    		{
    			// load the work order
    			var workOrder = record.load({
    				type: record.Type.WORK_ORDER,
    				id: woID,
    				isDynamic: true
    			});
    			
    			// get count of item lines
    			var lineCount = workOrder.getLineCount({
    				sublistId: 'item'
    			});
    			
    			// loop through items
    			for (var i = 0; i < lineCount; i++)
    				{
    					// update the allocation strategy field on the line
    					workOrder.selectLine({
    						sublistId: 'item',
    						line: i
    					});
    				
    					workOrder.setCurrentSublistValue({
    						sublistId: 'item',
    						fieldId: 'orderallocationstrategy',
    						value: allocationStrategy
    					});
    					
    					workOrder.commitLine({
    						sublistId: 'item'
    					});
    				}
    			
    			// save the changes to the work order
    			workOrder.save();
    			
    			log.audit({
    				title: 'Work Order Updated',
    				details: 'Tran ID: ' + tranID + '<br>Record ID: ' + woID
    			});
    		}
    	catch(e)
    		{
	    		log.error({
					title: 'Error Updating Work Order',
					details: 'Tran ID: ' + tranID + '<br>Record ID: ' + woID + '<br>Error: ' + e.message
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
