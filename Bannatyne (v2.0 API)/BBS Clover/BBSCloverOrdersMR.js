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
	
	cloverCashSaleForm = currentScript.getParameter({
		name: 'custscript_bbs_clover_cash_sale_form'
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
    		type: 'customrecord_bbs_clover_orders',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_order_date',
    			operator: 'on',
    			values: ['yesterday']
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_clover_location',
    			summary: 'GROUP'
    		},
    				{
    			name: 'internalid',
    			join: 'custrecord_bbs_clover_subsidiary',
    			summary: 'MAX'
    		},
    				{
    			name: 'custrecord_bbs_merchant_id',
    			summary: 'MAX'
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
    	var locationName	= searchResult.values["GROUP(custrecord_bbs_clover_location)"].text;
    	var locationID 		= searchResult.values["GROUP(custrecord_bbs_clover_location)"].value;
    	var subsidiaryID	= searchResult.values["MAX(internalid.custrecord_bbs_clover_subsidiary)"];
    	var merchantID		= searchResult.values["MAX(custrecord_bbs_merchant_id)"];
    	
    	log.audit({
    		title: 'Processing Location',
    		details: locationName + '(' + locationID + ')'
    	});
    	
    	// call function to create a new cash sale. Pass subsidiaryID, locationID and merchantID
    	createCashSale(subsidiaryID, locationID, merchantID);
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
    	
    	// ===========================================================================
    	// NOW SCHEDULE ADDITIONAL MAP/REDUCE SCRIPT TO CREATE CLOVER PAYMENT JOURNALS
    	// ===========================================================================
    	
    	// submit a map/reduce task
    	var mapReduceTaskID = task.create({
    	    taskType: task.TaskType.MAP_REDUCE,
    	    scriptId: 'customscript_bbs_clover_payment_journals',
    	    deploymentId: 'customdeploy_bbs_clover_payment_journals'
    	}).submit();
    	
    	log.audit({
    		title: 'Map/Reduce Script Scheduled',
    		details: 'BBS Clover Payment Journals Map/Reduce script has been Scheduled.<br>Job ID: ' + mapReduceTaskID
    	});

    }
    
    // ==============================
    // FUNCTION TO CREATE A CASH SALE
    // ==============================
    
    function createCashSale(subsidiaryID, locationID, merchantID) {
    	
    	try
    		{
    			// create a cash sale record
    			var cashSale = record.transform({
    				fromType: record.Type.CUSTOMER,
    				fromId: cloverCustomer,
    				toType: record.Type.CASH_SALE,
    				isDynamic: true,
    				defaultValues: {
    					customform: cloverCashSaleForm
    				}
    			});
    			
    			// set header fields on the cash sale
    			cashSale.setValue({
    				fieldId: 'trandate',
    				value: transactionDate
    			});
    			
    			cashSale.setText({
    				fieldId: 'postingperiod',
    				value: postingPeriod
    			});
    			
    			cashSale.setValue({
    				fieldId: 'subsidiary',
    				value: subsidiaryID
    			});
    			
    			cashSale.setValue({
    				fieldId: 'location',
    				value: locationID
    			});
    			
    			cashSale.setValue({
    				fieldId: 'custbodybbs_merchant_id',
    				value: merchantID
    			});
    			
    			// call function to set the posting account. Pass subsdiaryID and locationID
    			var postingAccount = getPostingAccount(subsidiaryID, locationID);
    			
    			cashSale.setValue({
    				fieldId: 'account',
    				value: postingAccount
    			});
    			
    			// call function to return Clover order lines for this location
    			var cloverOrderLines = searchCloverOrderLines(locationID);
    			
    			cloverOrderLines.each(function(result){
    				
    				var itemID = result.getValue({
    					name: 'custrecord_bbs_clover_item_record',
    					summary: 'GROUP'
    				});
    				
    				var rate = result.getValue({
    					name: 'custrecord_bbs_clover_line_price_disc',
    					summary: 'GROUP'
    				});
    				
    				var quantity = result.getValue({
    					name: 'internalid',
    					summary: 'COUNT'
    				});
    				
    				// add a new line to the cash sale
    				cashSale.selectNewLine({
    					sublistId: 'item'
    				});
    				
    				try
    					{
	    					// set the item using the itemID variable
    						cashSale.setCurrentSublistValue({
	        					sublistId: 'item',
	        					fieldId: 'item',
	        					value: itemID
	        				});
    					}
    				catch(e)
    					{
	    					// set the item using the unallocatedCloverItem variable
							cashSale.setCurrentSublistValue({
	        					sublistId: 'item',
	        					fieldId: 'item',
	        					value: unallocatedCloverItem
	        				});
    					}
    				
    				// set fields on the new line
		    		cashSale.setCurrentSublistValue({
		    			sublistId: 'item',
		    			fieldId: 'price',
		    			value: -1 // -1 = Custom
		    		});
		    				
		    		cashSale.setCurrentSublistValue({
		    			sublistId: 'item',
		    			fieldId: 'rate',
		    			value: rate
		    		});
		    				
		    		cashSale.setCurrentSublistValue({
		    			sublistId: 'item',
		    			fieldId: 'quantity',
		    			value: quantity
		    		});
		    				
		    		cashSale.commitLine({
		    			sublistId: 'item'
		    		});

    				// continue processing search results
    				return true;
    				
    			});
    			
    			// save the cash sale record
    			var cashSaleID = cashSale.save({
    				enableSourcing: false,
			    	ignoreMandatoryFields: true
    			});
    			
    			log.audit({
    				title: 'Cash Sale Created',
    				details: 'Location ID: ' + locationID + '<br>Record ID: ' + cashSaleID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Creating Cash Sale',
    				details: 'Location ID: ' + locationID + '<br>Error: ' + e
    			});
    		}
    	
    }
    
    // =====================================
    // FUNCTION TO RETURN CLOVER ORDER LINES
    // =====================================
    
    function searchCloverOrderLines(locationID) {
    	
    	return search.create({
    		type: 'customrecord_bbs_clover_orders',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_clover_location',
    			operator: 'anyof',
    			values: [locationID]
    		},
    				{
    			name: 'custrecord_bbs_order_date',
    			operator: 'on',
    			values: ['yesterday']
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_clover_item_record',
    			summary: 'GROUP'
    		},
    				{
    			name: 'custrecord_bbs_clover_line_price_disc',
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
