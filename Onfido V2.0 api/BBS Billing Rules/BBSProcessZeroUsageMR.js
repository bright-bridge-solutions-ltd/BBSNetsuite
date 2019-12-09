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
	
	billingType = currentScript.getParameter({
		name: 'custscript_bbs_billing_type_select'
	});
	
	billingTypeText = currentScript.getParameter({
		name: 'custscript_bbs_billing_type_select_text'
	});
	
	initiatingUser = currentScript.getParameter({
		name: 'custscript_bbs_billing_email_emp_alert'
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
    	
    	// create search to find contract records with no usage
    	var contractRecordSearch = search.create({
    		type: 'customrecord_bbs_contract_period',
    		
    		filters: [{
    			name: 'isinactive',
    			join: 'custrecord_bbs_contract_period_contract',
    			operator: 'is',
    			values: ['F']
    		},
    		       	{
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
    			name: 'custrecord_bbs_contract_period_prod_use',
    			operator: 'isempty'
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
    	
    	// check if the billingType variable contains a value
    	if (billingType)
    		{
    			// get the current search filters
    			var filters = contractRecordSearch.filters; //reference Search.filters object to a new variable
    	    
    			// create a new search filter
    			var newFilter = search.createFilter({
    	            name: 'custrecord_bbs_contract_billing_type',
    	            join: 'custrecord_bbs_contract_period_contract',
    	            operator: 'anyof',
    	            values: [billingType]
    	        });

    			// add the filter using .push() method
    			filters.push(newFilter);
    		}
    	
    	// return the search object to the map stage
    	return contractRecordSearch;
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
				columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_currency']
			});
			
			// return values from the contractRecordLookup
			var customer = contractRecordLookup.custrecord_bbs_contract_customer[0].value;
			var currency = contractRecordLookup.custrecord_bbs_contract_currency[0].value;
		    
		    // call function to create a sales order. Pass in contractRecordID, customer and currency
    		createSalesOrder(contractRecordID, customer, currency);
    	}
    
    function AMP(contractRecordID)
    	{
	    	// lookup fields on the contract record
			var contractRecordLookup = search.lookupFields({
				type: 'customrecord_bbs_contract',
				id: contractRecordID,
				columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_currency', 'custrecord_bbs_contract_end_date']
			});
			
			// return values from the contractRecordLookup
			var customer = contractRecordLookup.custrecord_bbs_contract_customer[0].value;
			var currency = contractRecordLookup.custrecord_bbs_contract_currency[0].value;
			var contractEnd = contractRecordLookup.custrecord_bbs_contract_end_date;
			
			// format contractEnd as a date object
		    contractEnd = format.parse({
		    	type: format.Type.DATE,
		    	value: contractEnd
		    });
		    
		    // check if this is the end of the contract or has already passed
		    if (contractEnd <= processDate)
		    	{
		    		// call function to create a sales order. Pass in contractRecordID, customer and currency
	    			createSalesOrder(contractRecordID, customer, currency);
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
						columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_currency']
					});
					
					// return values from the contractRecordLookup
					var customer = contractRecordLookup.custrecord_bbs_contract_customer[0].value;
					var currency = contractRecordLookup.custrecord_bbs_contract_currency[0].value;
					
					// call function to create a sales order. Pass in contractRecordID, customer and currency
		    		createSalesOrder(contractRecordID, customer, currency);
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
						columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_currency']
					});
					
					// return values from the contractRecordLookup
					var customer = contractRecordLookup.custrecord_bbs_contract_customer[0].value;
					var currency = contractRecordLookup.custrecord_bbs_contract_currency[0].value;
					
					// call function to create a sales order. Pass in contractRecordID, customer and currency
		    		createSalesOrder(contractRecordID, customer, currency);
				}
    	}
    
    function UIOLI(contractRecordID)
    	{
	    	// lookup fields on the contract record
			var contractRecordLookup = search.lookupFields({
				type: 'customrecord_bbs_contract',
				id: contractRecordID,
				columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_currency']
			});
			
			// return values from the contractRecordLookup
			var customer = contractRecordLookup.custrecord_bbs_contract_customer[0].value;
			var currency = contractRecordLookup.custrecord_bbs_contract_currency[0].value;
			
			// call function to create a sales order. Pass in contractRecordID, customer and currency
    		createSalesOrder(contractRecordID, customer, currency);
    	}
    
    // ================================
    // FUNCTION TO CREATE A SALES ORDER
    // ================================
    
    function createSalesOrder(contractRecordID, customer, currency, minimumUsage)
	    {
	    	try
    			{
		    		// create a new sales order record
					var soRecord = record.transform({
					    fromType: record.Type.CUSTOMER,
					    fromId: customer,
					    toType: record.Type.SALES_ORDER,
					    isDynamic: true,
					    defaultValues: {
					    	customform: soForm
					    }
					});
	    		
					// set header fields on the soRecord
    				soRecord.setValue({
    					fieldId: 'trandate',
    					value: processDate
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
	    				value: 0
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
    	    deploymentId: 'customdeploy_bbs_billing_map_reduce',
    	    params: {
    	    	custscript_bbs_billing_type_select: billingType,
    	    	custscript_bbs_billing_type_select_text: billingTypeText,
    	    	custscript_bbs_billing_email_emp_alert: initiatingUser
    	    }
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
