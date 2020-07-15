/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search', 'N/task'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(record, runtime, search, task) {
	
	// set transaction date
	transactionDate = new Date();
	transactionDate = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate() - 1); // 1 day before
	
	// call function to calculate the posting period
	postingPeriod = getPostingPeriod(transactionDate);
	
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script
	cloverCustomer = currentScript.getParameter({
		name: 'custscript_bbs_clover_customer'
	});
	
	cloverCashRefundForm = currentScript.getParameter({
		name: 'custscript_bbs_clover_cash_refund_form'
	});
	
	unallocatedCloverItem = currentScript.getParameter({
		name: 'custscript_bbs_unallocated_clover_item'
	});
	
	cloverCashControlBFL = currentScript.getParameter({
		name: 'custscript_bbs_clover_cash_control_bfl'
	});
		
	cloverCashControlBF2L = currentScript.getParameter({
		name: 'custscript_bbs_clover_cash_control_bf2l'
	});
		
	cloverCashControlBHL = currentScript.getParameter({
		name: 'custscript_bbs_clover_cash_control_bhl'
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
    	
    	// search for locations to be processed
    	return search.create({
    		type: 'customrecord_bbs_clover_refunds',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_refund_date',
    			operator: 'on',
    			values: ['4/3/2020']
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_refund_location',
    			summary: 'GROUP'
    		},
    				{
    			name: 'custrecord_bbs_refund_subsidiary',
    			summary: 'GROUP'
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
    	
    	// process search result
    	var searchResult 	= JSON.parse(context.value);
    	var locationName	= searchResult.values["GROUP(custrecord_bbs_refund_location)"].text;
    	var locationID 		= searchResult.values["GROUP(custrecord_bbs_refund_location)"].value;
    	var subsidiaryName	= searchResult.values["GROUP(custrecord_bbs_refund_subsidiary)"].text;
    	var subsidiaryID	= searchResult.values["GROUP(custrecord_bbs_refund_subsidiary)"].value;
    	
    	log.audit({
    		title: 'Processing Location',
    		details: locationName + '(' + locationID + ')'
    	});
    	
    	// call function to create a new cash refund. Pass subsidiaryID, locationName and locationID
    	createCashRefund(subsidiaryID, locationName, locationID);
 
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
    	
    	// ==========================================================================
    	// NOW SCHEDULE ADDITIONAL MAP/REDUCE SCRIPT TO CREATE CLOVER REFUND JOURNALS
    	// ==========================================================================
    	
    	// submit a map/reduce task
    	var mapReduceTaskID = task.create({
    	    taskType: task.TaskType.MAP_REDUCE,
    	    scriptId: 'customscript_bbs_clover_refund_jnl_mr',
    	    deploymentId: 'customdeploy_bbs_clover_refund_jnl_mr'
    	}).submit();
    	
    	log.audit({
    		title: 'Map/Reduce Script Scheduled',
    		details: 'BBS Clover Refund Journals Map/Reduce script has been Scheduled.<br>Job ID: ' + mapReduceTaskID
    	});

    }
    
    // ================================
    // FUNCTION TO CREATE A CASH REFUND
    // ================================
    
    function createCashRefund(subsidiaryID, locationName, locationID) {
    	
    	try
    		{
    			// create a cash refund record
	    		var cashRefund = record.create({
	    			type: record.Type.CASH_REFUND,
	    			isDynamic: true,
	    			defaultValues: {
	    				customform: cloverCashRefundForm
	    			}
	    		});
    		
	    		// set header fields on the cash refund
	    		cashRefund.setValue({
	    			fieldId: 'entity',
	    			value: cloverCustomer
	    		});
	    		
	    		cashRefund.setValue({
    				fieldId: 'subsidiary',
    				value: subsidiaryID
    			});
	    		
	    		cashRefund.setValue({
    				fieldId: 'location',
    				value: locationID
    			});
	    		
	    		cashRefund.setValue({
    				fieldId: 'trandate',
    				value: transactionDate
    			});
    			
	    		cashRefund.setText({
    				fieldId: 'postingperiod',
    				value: postingPeriod
    			});
	    		
    			// call function to set the posting account. Pass subsdiaryID and locationID
    			var postingAccount = getPostingAccount(subsidiaryID, locationID);
    			
    			cashRefund.setValue({
    				fieldId: 'account',
    				value: postingAccount
    			});
    			
    			// call function to return Clover Refund lines for this location
    			searchCloverRefundLines(locationID).each(function(result){
    				
    				// retrieve search results
    				var itemID = result.getValue({
    					name: 'custrecord_bbs_clover_refund_item_record',
    					summary: 'GROUP'
    				});
    				
    				var itemRate = result.getValue({
    					name: 'custrecord_bbs_refund_amount',
    					summary: 'GROUP'
    				});
    				
    				var quantity = result.getValue({
    					name: 'internalid',
    					summary: 'COUNT'
    				});
    				
    				// add a new line to the cash sale
    				cashRefund.selectNewLine({
    					sublistId: 'item'
    				});
    				
    				try
    					{
	    					// set the item using the itemID variable
    						cashRefund.setCurrentSublistValue({
	        					sublistId: 'item',
	        					fieldId: 'item',
	        					value: itemID
	        				});
    					}
    				catch(e)
    					{
	    					// set the item using the unallocatedCloverItem variable
    						cashRefund.setCurrentSublistValue({
	        					sublistId: 'item',
	        					fieldId: 'item',
	        					value: unallocatedCloverItem
	        				});
    					}
    				
    				// set fields on the new line
		    		cashRefund.setCurrentSublistValue({
		    			sublistId: 'item',
		    			fieldId: 'price',
		    			value: -1 // -1 = Custom
		    		});
		    				
		    		cashRefund.setCurrentSublistValue({
		    			sublistId: 'item',
		    			fieldId: 'rate',
		    			value: itemRate
		    		});
		    				
		    		cashRefund.setCurrentSublistValue({
		    			sublistId: 'item',
		    			fieldId: 'quantity',
		    			value: quantity
		    		});
		    				
		    		cashRefund.commitLine({
		    			sublistId: 'item'
		    		});

    				// continue processing search results
    				return true;
    				
    			});
    			
    			// save the cash refund record
    			var cashRefundID = cashRefund.save({
    				enableSourcing: false,
			    	ignoreMandatoryFields: true
    			});
    			
    			log.audit({
    				title: 'Cash Refund Created',
    				details: cashRefundID
    			});
	    		
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Creating Cash Refund for ' + locationName,
    				details: e
    			})
    		}
    	
    }
    
    // ======================================
    // FUNCTION TO RETURN CLOVER REFUND LINES
    // ======================================
    
    function searchCloverRefundLines(locationID) {
    	
    	return search.create({
    		type: 'customrecord_bbs_clover_refunds',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_refund_location',
    			operator: 'anyof',
    			values: [locationID]
    		},
    				{
    			name: 'custrecord_bbs_refund_date',
    			operator: 'on',
    			values: ['4/3/2020']
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_clover_refund_item_record',
    			summary: 'GROUP'
    		},
    				{
    			name: 'custrecord_bbs_refund_amount',
    			summary: 'GROUP'
    		},
    				{
    			name: 'internalid',
    			summary: 'COUNT'
    		}],
    		
    	}).run();
    	
    }
    
    // ===================================
    // FUNCTION TO GET THE POSTING ACCOUNT
    // ===================================
    
    function getPostingAccount(subsidiaryID) {
    	
    	// declare and initialize variables
    	var postingAccount = null;
    	
    	// if subsidiaryID is 4 (Bannatyne Fitness Ltd)
    	if (subsidiaryID == 4)
    		{
    			// set the postingAccount using the cloverCashControlBFL script parameter
    			postingAccount = cloverCashControlBFL;
    		}
    	else if (subsidiaryID == 5) // if subsidiaryID is 5 (Bannatyne Fitness (2) Ltd)
			{
	    		// set the postingAccount using the cloverCashControlBF2L script parameter
				postingAccount = cloverCashControlBF2L;
			}
    	else if (subsidiaryID == 6) // if subsidiaryID is 6 (Bannatyne Hotels Ltd)
    		{
	    		// set the postingAccount using the cloverCashControlBHL script parameter
				postingAccount = cloverCashControlBHL;
    		}
    	
    	return postingAccount;
    	
    }
    
    // ==================================
    // FUNCTION TO GET THE POSTING PERIOD
    // ==================================
    
    function getPostingPeriod(date) {
		
    	// create array of months
		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		
		// calculate/return the posting period
		return months[date.getMonth()] + ' ' + date.getFullYear();
	}

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
