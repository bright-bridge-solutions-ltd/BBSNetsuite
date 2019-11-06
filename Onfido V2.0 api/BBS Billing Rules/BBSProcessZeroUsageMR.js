/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/format', 'N/task'],
/**
 * @param {record} record
 * @param {search} search
 * @param {task} task
 */
function(runtime, search, record, format, task) {
	
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script
	adjustmentItem = currentScript.getParameter({
    	name: 'custscript_bbs_min_usage_adj_item'
    });
	
	soForm = currentScript.getParameter({
		name: 'custscript_bbs_sales_order_form'
	});
	
	// declare new date object. Global variable so can be accessed throughout the script
	processDate = new Date();
	processDate.setDate(0); // set date to be the last day of the previous month
	
	processDate = new Date(processDate.getFullYear(), processDate.getMonth(), processDate.getDate());
   
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
    	
    	// run search to find contract records with no usage
    	return search.create({
    		type: 'customrecord_bbs_contract_period',
    		
    		filters: [{
    			name: 'custrecord_bbs_contract_status',
    			join: 'custrecord_bbs_contract_period_contract',
    			operator: 'anyof',
    			values: ['1'] // 1 = Approved
    		},
    				{
    			name: 'custrecord_bbs_contract_billing_type',
    			join: 'custrecord_bbs_contract_period_contract',
    			operator: 'noneof',
    			values: ['1'] // 1 = PAYG
    		},
    				{
    			name: 'custrecord_bbs_contract_period_contract',
    			operator: 'anyof',
    			values: ['165']
    		},
    				{
    			name: 'custrecord_bbs_contract_period_prod_use',
    			operator: 'isempty',
    			summary: 'SUM'
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_contract_period_contract',
    			summary: 'GROUP'
    		},
    				{
    			name: 'custrecord_bbs_contract_billing_type',
    			join: 'custrecord_bbs_contract_period_contract',
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
    	
    	// declare and initialize variables
    	var salesOrders = 0;
    	
    	// retrieve search results
    	var searchResult = JSON.parse(context.value);
    	
    	// get the internal ID of the contract record from the search results
    	var contractRecordID = searchResult.values['GROUP(custrecord_bbs_contract_period_contract)'].value;
    	
    	// get the ID of the contract record from the search results
    	var contractRecord = searchResult.values['GROUP(custrecord_bbs_contract_period_contract)'].text;
    	
    	// get the billing type from the search results
    	var billingType = searchResult.values['MAX(custrecord_bbs_contract_billing_type.custrecord_bbs_contract_period_contract)'];
    	
    	log.audit({
    		title: 'Processing Contract',
    		details: contractRecord
    	});
    	
    	// create search to check if there are any open sales orders for this contract
    	var salesOrderSearch = search.create({
    		type: search.Type.SALES_ORDER,
    		
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
    			operator: 'anyof',
    			values: [contractRecordID]
    		}],
    		
    		columns: [{
    			name: 'tranid'
    		}],
    	});
    	
    	// run search and process results
    	salesOrderSearch.run().each(function(result) {
    		
    		// increase the salesOrders variable for each search result
    		salesOrders++;
    		
    		// continue processing search results
    		return true;
    		
    	});
    	
    	// check if the salesOrders variable is 0 (IE there are no open sales orders for this contract)
    	if (salesOrders == 0)
    		{
	    		// check the contract record's billing type and call appropriate function
	        	if (billingType == 'AMBMA')
	        		{
	        			// call AMBMA function and pass in contractRecordID
	        			AMBMA(contractRecordID);
	        		}
	        	else if (billingType == 'AMP')
	        		{
	        			// call AMP function and pass in contractRecordID
	        			AMP(contractRecordID);
	        		}
	        	else if (billingType == 'QMP')
	        		{
	        			// call QMP function and pass in contractRecordID
	        			QMP(contractRecordID);
	        		}
	        	else if (billingType == 'QUR')
	        		{
	        			// call QUR function and pass in contractRecordID
	        			QUR(contractRecordID);
	        		}
	        	else if (billingType == 'UIOLI')
	        		{
	        			// call UIOLI function and pass in contractRecordID
	        			UIOLI(contractRecordID);
	        		}
    		}
    }
    
    // ========================================
    // SEPARATE FUNCTIONS FOR EACH BILLING TYPE
    // ========================================
    
    function AMBMA(contractRecordID)
    	{
	    	// lookup fields on the contract record
			var contractRecordLookup = search.lookupFields({
				type: 'customrecord_bbs_contract',
				id: contractRecordID,
				columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_currency', 'custrecord_bbs_contract_min_ann_use', 'custrecord_bbs_contract_term']
			});
			
			// return values from the contractRecordLookup
			var customer = contractRecordLookup.custrecord_bbs_contract_customer[0].value;
			var currency = contractRecordLookup.custrecord_bbs_contract_currency[0].value;
			var annualMinimum = contractRecordLookup.custrecord_bbs_contract_min_ann_use;
		    annualMinimum = parseFloat(annualMinimum); // use parseFloat to convert to floating point number
		    var contractTerm = contractRecordLookup.custrecord_bbs_contract_term;
		    contractTerm = parseInt(contractTerm); // use parseInt to convert to integer number
		    
		    // divide annualMinimum by the contractTerm to calculate the monthly minimum
		    var monthlyMinimum = (annualMinimum / contractTerm);
		    
		    // run search to find period detail records for this billing month
		    var periodDetailSearch = search.create({
		    	type: 'customrecord_bbs_contract_period',
		    	
		    	columns: [{
		    		name: 'custrecord_bbs_contract_period_start'
		    	},
		    			{
		    		name: 'custrecord_bbs_contract_period_end'
		    	}],
		    	
		    	filters: [{
    				name: 'custrecord_bbs_contract_period_contract',
    				operator: 'anyof',
    				values: [contractRecordID]
    			},
    					{
    				name: 'custrecord_bbs_contract_period_start',
    				operator: 'within',
    				values: ['lastmonth']
    			},
    					{
    				name: 'custrecord_bbs_contract_period_end',
    				operator: 'within',
    				values: ['lastmonth']
        		}],
        		
		    });
		    	
		    // process search results
    		periodDetailSearch.run().each(function(result) {
    			
    			// get the period start and end dates from the search results
	    		periodStart = result.getValue({
	    			name: 'custrecord_bbs_contract_period_start'
	    		});
	    		
	    		periodEnd = result.getValue({
	    			name: 'custrecord_bbs_contract_period_end'
	    		});

    		});
    		
    		// format periodStart as a date object
    		periodStart = format.parse({
    			type: format.Type.DATE,
    			value: periodStart
    		});
    		
    		// format periodEnd as a date object
    		periodEnd = format.parse({
    			type: format.Type.DATE,
    			value: periodEnd
    		});
    		
    		// get the day of the month from the periodStart and periodEnd objects
    		var periodStartDay = periodStart.getDate();
    		var periodEndDay = periodEnd.getDate();
    		
    		// call function to calculate number of days in the current month
			var daysInMonth = getDaysInMonth(periodStart.getMonth(), periodStart.getFullYear());
			
			// check if the periodStartDay is NOT equal to 1 (IE starts mid month)
			if (periodStartDay != 1)
				{
					// calculate the days remaining in the month
					var daysRemaining = daysInMonth - periodStartDay;
					
					// divide monthlyMinimum by daysInMonth to calculate the dailyMinimum
					var dailyMinimum = monthlyMinimum / daysInMonth;
					
					// multiply the dailyMinimum by daysRemaining to calculate the pro rate minimum usage
					monthlyMinimum = parseFloat(dailyMinimum * daysRemaining);
					monthlyMinimum = monthlyMinimum.toFixed(2);					
				}
			// check that the periodEndDay is NOT equal to the end of the month (IE ends mid month)
			else if (periodEndDay != daysInMonth)
				{
					// divide monthlyMinimum by daysInMonth to calculate the dailyMinimum
					var dailyMinimum = monthlyMinimum / daysInMonth;
					
					// multiply monthlyMinimum by periodEndDay to calculate the pro rate minimum usage
					monthlyMinimum = parseFloat(dailyMinimum * periodEndDay);
					monthlyMinimum = monthlyMinimum.toFixed(2);
				}
			
			// call function to create a sales order. Pass in contractRecordID, customer, currency and monthlyMinimum
    		createSalesOrder(contractRecordID, customer, currency, monthlyMinimum);
    	}
    
    function AMP(contractRecordID)
    	{
	    	// lookup fields on the contract record
			var contractRecordLookup = search.lookupFields({
				type: 'customrecord_bbs_contract',
				id: contractRecordID,
				columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_currency', 'custrecord_bbs_contract_min_ann_use', 'custrecord_bbs_contract_end_date']
			});
			
			// return values from the contractRecordLookup
			var customer = contractRecordLookup.custrecord_bbs_contract_customer[0].value;
			var currency = contractRecordLookup.custrecord_bbs_contract_currency[0].value;
			var annualMinimum = contractRecordLookup.custrecord_bbs_contract_min_ann_use;
			annualMinimum = parseFloat(annualMinimum); // use parseFloat to convert to floating point number
			var contractEnd = contractRecordLookup.custrecord_bbs_contract_end_date;
			
			// format contractEnd as a date object
		    contractEnd = format.parse({
		    	type: format.Type.DATE,
		    	value: contractEnd
		    });
		    
		    // check if this is the end of the contract or has already passed
		    if (contractEnd <= processDate)
		    	{
		    		// call function to create a sales order. Pass in contractRecordID, customer, currency and annualMinimum
	    			createSalesOrder(contractRecordID, customer, currency, annualMinimum);
		    	}    		
    	}
    
    function QMP(contractRecordID)
    	{
	    	// run search to find period detail records for this billing month
			var periodDetailSearch = search.create({
				type: 'customrecord_bbs_contract_period',
	    	
				columns: [{
					name: 'custrecord_bbs_contract_period_qu_end'
				}],
	    	
				filters: [{
					name: 'custrecord_bbs_contract_period_contract',
					operator: 'anyof',
					values: [contractRecordID]
				},
						{
					name: 'custrecord_bbs_contract_period_start',
					operator: 'within',
					values: ['lastmonth']
				},
						{
					name: 'custrecord_bbs_contract_period_end',
					operator: 'within',
					values: ['lastmonth']
				}],
			
			});
	    	
			// process search results
			periodDetailSearch.run().each(function(result) {
			
				// get the quarter end date from the search results
				quarterEnd = result.getValue({
					name: 'custrecord_bbs_contract_period_qu_end'
				});
			
			});
		
			// format quarterEnd as a date object
			quarterEnd = format.parse({
				type: format.Type.DATE,
				value: quarterEnd
			});
		
			// check if the processDate is equal to the quarterEnd
			if (processDate.getTime() == quarterEnd.getTime())
				{
					// lookup fields on the contract record
					var contractRecordLookup = search.lookupFields({
						type: 'customrecord_bbs_contract',
						id: contractRecordID,
						columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_currency', 'custrecord_bbs_contract_qu_min_use']
					});
					
					// return values from the contractRecordLookup
					var customer = contractRecordLookup.custrecord_bbs_contract_customer[0].value;
					var currency = contractRecordLookup.custrecord_bbs_contract_currency[0].value;
					var minimumUsage = contractRecordLookup.custrecord_bbs_contract_qu_min_use;
					minimumUsage = parseFloat(minimumUsage); // use parseFloat to convert to floating point number
					
					// call function to create a sales order. Pass in contractRecordID, customer, currency and minimumUsage
		    		createSalesOrder(contractRecordID, customer, currency, minimumUsage);
				}	
    	}
    
    function QUR(contractRecordID)
    	{
	    	// run search to find period detail records for this billing month
			var periodDetailSearch = search.create({
				type: 'customrecord_bbs_contract_period',
	    	
				columns: [{
					name: 'custrecord_bbs_contract_period_qu_end'
				}],
	    	
				filters: [{
					name: 'custrecord_bbs_contract_period_contract',
					operator: 'anyof',
					values: [contractRecordID]
				},
						{
					name: 'custrecord_bbs_contract_period_start',
					operator: 'within',
					values: ['lastmonth']
				},
						{
					name: 'custrecord_bbs_contract_period_end',
					operator: 'within',
					values: ['lastmonth']
				}],
			
			});
	    	
			// process search results
			periodDetailSearch.run().each(function(result) {
			
				// get the quarter end date from the search results
				quarterEnd = result.getValue({
					name: 'custrecord_bbs_contract_period_qu_end'
				});
			
			});
		
			// format quarterEnd as a date object
			quarterEnd = format.parse({
				type: format.Type.DATE,
				value: quarterEnd
			});
		
			// check if the processDate is equal to the quarterEnd
			if (processDate.getTime() == quarterEnd.getTime())
				{
					// lookup fields on the contract record
					var contractRecordLookup = search.lookupFields({
						type: 'customrecord_bbs_contract',
						id: contractRecordID,
						columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_currency', 'custrecord_bbs_contract_qu_min_use']
					});
					
					// return values from the contractRecordLookup
					var customer = contractRecordLookup.custrecord_bbs_contract_customer[0].value;
					var currency = contractRecordLookup.custrecord_bbs_contract_currency[0].value;
					var minimumUsage = contractRecordLookup.custrecord_bbs_contract_qu_min_use;
					minimumUsage = parseFloat(minimumUsage); // use parseFloat to convert to floating point number
					
					// call function to create a sales order. Pass in contractRecordID, customer, currency and minimumUsage
		    		createSalesOrder(contractRecordID, customer, currency, minimumUsage);
				}
    	}
    
    function UIOLI(contractRecordID)
    	{
	    	// lookup fields on the contract record
			var contractRecordLookup = search.lookupFields({
				type: 'customrecord_bbs_contract',
				id: contractRecordID,
				columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_currency', 'custrecord_bbs_contract_mon_min_use']
			});
			
			// return values from the contractRecordLookup
			var customer = contractRecordLookup.custrecord_bbs_contract_customer[0].value;
			var currency = contractRecordLookup.custrecord_bbs_contract_currency[0].value;
			var monthlyMinimum = contractRecordLookup.custrecord_bbs_contract_mon_min_use;
			monthlyMinimum = parseFloat(monthlyMinimum); // use parseFloat to convert to floating point number
			
			// run search to find period detail records for this billing month
		    var periodDetailSearch = search.create({
		    	type: 'customrecord_bbs_contract_period',
		    	
		    	columns: [{
		    		name: 'custrecord_bbs_contract_period_start'
		    	},
		    			{
		    		name: 'custrecord_bbs_contract_period_end'
		    	}],
		    	
		    	filters: [{
    				name: 'custrecord_bbs_contract_period_contract',
    				operator: 'anyof',
    				values: [contractRecordID]
    			},
    					{
    				name: 'custrecord_bbs_contract_period_start',
    				operator: 'within',
    				values: ['lastmonth']
    			},
    					{
    				name: 'custrecord_bbs_contract_period_end',
    				operator: 'within',
    				values: ['lastmonth']
        		}],
        		
		    });
		    	
		    // process search results
    		periodDetailSearch.run().each(function(result) {
    			
    			// get the period start and end dates from the search results
	    		periodStart = result.getValue({
	    			name: 'custrecord_bbs_contract_period_start'
	    		});
	    		
	    		periodEnd = result.getValue({
	    			name: 'custrecord_bbs_contract_period_end'
	    		});

    		});
    		
    		// format periodStart as a date object
    		periodStart = format.parse({
    			type: format.Type.DATE,
    			value: periodStart
    		});
    		
    		// format periodEnd as a date object
    		periodEnd = format.parse({
    			type: format.Type.DATE,
    			value: periodEnd
    		});
    		
    		// get the day of the month from the periodStart and periodEnd objects
    		var periodStartDay = periodStart.getDate();
    		var periodEndDay = periodEnd.getDate();
    		
    		// call function to calculate number of days in the current month
			var daysInMonth = getDaysInMonth(periodStart.getMonth(), periodStart.getFullYear());
			
			// check if the periodStartDay is NOT equal to 1 (IE starts mid month)
			if (periodStartDay != 1)
				{
					// calculate the days remaining in the month
					var daysRemaining = daysInMonth - periodStartDay;
					
					// divide monthlyMinimum by daysInMonth to calculate the dailyMinimum
					var dailyMinimum = monthlyMinimum / daysInMonth;
					
					// multiply the dailyMinimum by daysRemaining to calculate the pro rate minimum usage
					monthlyMinimum = parseFloat(dailyMinimum * daysRemaining);
					monthlyMinimum = monthlyMinimum.toFixed(2);					
				}
			// check that the periodEndDay is NOT equal to the end of the month (IE ends mid month)
			else if (periodEndDay != daysInMonth)
				{
					// divide monthlyMinimum by daysInMonth to calculate the dailyMinimum
					var dailyMinimum = monthlyMinimum / daysInMonth;
					
					// multiply monthlyMinimum by periodEndDay to calculate the pro rate minimum usage
					monthlyMinimum = parseFloat(dailyMinimum * periodEndDay);
					monthlyMinimum = monthlyMinimum.toFixed(2);
				}
			
			// call function to create a sales order. Pass in contractRecordID, customer, currency and monthlyMinimum
    		createSalesOrder(contractRecordID, customer, currency, monthlyMinimum);    	
    	}
    
    // ================================
    // FUNCTION TO CREATE A SALES ORDER
    // ================================
    
    function createSalesOrder(contractRecordID, customer, currency, minimumUsage)
	    {
	    	try
    			{
    				var soRecord = record.create({
    					type: record.Type.SALES_ORDER,
    					isDynamic: true
    				});
    				
    				// set header fields on the soRecord
    				soRecord.setValue({
    					fieldId: 'customform',
    					value: soForm
    				});
    				
    				soRecord.setValue({
    					fieldId: 'trandate',
    					value: processDate
    				});
    				
    				soRecord.setValue({
    					fieldId: 'entity',
    					value: customer
    				});
    				
    				soRecord.setValue({
    					fieldId: 'currency',
    					value: currency
    				});
    				
    				soRecord.setValue({
    					fieldId: 'custbody_bbs_contract_record',
    					value: contractRecordID
    				});
    				
    				// add a new line to the soRecord
    				soRecord.selectNewLine({
	    				sublistId: 'item'
	    			});
	    			
	    			// set the item on the new line using the adjustmentItem
    				soRecord.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'item',
	    				value: adjustmentItem
	    			});
    				
    				// set fields on the new line
    				soRecord.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'quantity',
	    				value: 1
	    			});
	    			
    				soRecord.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'rate',
	    				value: minimumUsage
	    			});
	    			
    				soRecord.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'custcol_bbs_contract_record',
	    				value: contractRecordID
	    			});
    				
    				// commit the line
    				soRecord.commitLine({
						sublistId: 'item'
					});
	    			
	    			// submit the soRecord record
	    			var soID = soRecord.save({
	    				enableSourcing: false,
			    		ignoreMandatoryFields: true
	    			});
	    			
	    			log.audit({
	    				title: 'Sales Order Created',
	    				details: 'Sales Order ID: ' + soID + ' | Contract ID: ' + contractRecordID
	    			});   				
				}
			catch(error)
				{
					log.error({
						title: 'Error Creating Sales Order for Contract ID: ' + contractRecordID,
						details: error
					});
				}
		}
    
    //================================================
	// FUNCTION TO GET THE NUMBER OF DAYS IN THE MONTH
	//================================================   
    
    function getDaysInMonth(month, year)
	    {
    		// day 0 is the last day in the current month
    	 	return new Date(year, month+1, 0).getDate(); // return the last day of the month
	    }
    
    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {
    	
    	// ================================================================================
    	// NOW SCHEDULE ADDITIONAL MAP/REDUCE SCRIPT TO BILL SALES ORDERS/RECOGNISE REVENUE
    	// ================================================================================
    	
    	// create a map/reduce task
    	var mapReduceTask = task.create({
    	    taskType: task.TaskType.MAP_REDUCE,
    	    scriptId: 'customscript_bbs_billing_map_reduce',
    	    deploymentId: 'customdeploy_bbs_billing_map_reduce'
    	});
    	
    	// submit the map/reduce task
    	var mapReduceTaskID = mapReduceTask.submit();
    	
    	log.audit({
    		title: 'Script scheduled',
    		details: 'BBS Billing Map/Reduce script has been scheduled. Job ID ' + mapReduceTaskID
    	});	

    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
