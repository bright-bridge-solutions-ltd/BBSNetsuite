/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/format', 'N/email'],
function(runtime, search, record, format, email) {
	
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script
	emailSender = currentScript.getParameter({
		name: 'custscript_bbs_billing_script_email_send'
	});
	
	emailRecipient = currentScript.getParameter({
    	name: 'custscript_bbs_emp_for_item_add_so_alert'
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
    	
    	// create search to find sales orders to be processed
    	return search.create({
    		type: search.Type.SALES_ORDER,
			
			columns: [{
				name: 'trandate',
				summary: 'MAX'
			},
					{
				name: 'tranid',
				summary: 'GROUP'
			},
					{
				name: 'internalid',
				summary: 'MAX'
			},
					{
				name: 'item',
				summary: 'GROUP'
			},
					{
				name: 'formulatext',
				summary: 'GROUP',
				formula: "CONCAT('01/', TO_CHAR({custcol_bbs_so_search_date}, 'MM/YYYY'))"
			},		
					{
				name: 'formuladate',
				summary: 'GROUP',
				formula: 'LAST_DAY({custcol_bbs_so_search_date})',
			},
					{
				name: 'rate',
				summary: 'MAX'
			},
					{
				name: 'quantity',
				summary: 'SUM'
			},
					{
				name: 'fxamount',
				summary: 'SUM'
			},
					{
				name: 'custcol_bbs_contract_record',
				summary: 'GROUP'
			}],
			
			filters: [{
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
    			name: 'custrecord_bbs_contract_status',
    			join: 'custbody_bbs_contract_record',
    			operator: 'anyof',
    			values: ['1'] // 1 = Approved
    		},
    				{
				name: 'mainline',
				operator: 'is',
				values: ['F']
			},
					{
				name: 'cogs',
				operator: 'is',
				values: ['F']
			},
					{
				name: 'shipping',
				operator: 'is',
				values: ['F']
			},
					{
				name: 'taxline',
				operator: 'is',
				values: ['F']
			},
					{
				name: 'custcol_bbs_usage_updated',
				operator: 'is',
				values: ['F']
			},
					{
				name: 'custcol_bbs_contract_record',
				operator: 'noneof',
				values: ['@NONE@']
    		},
    				{
    			name: 'custcol_bbs_so_search_date',
    			operator: 'isnotempty'
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
		var productRecords = 0;

    	// retrieve search results
    	var searchResult = JSON.parse(context.value);
    	
    	// get values from the searchResult object
    	var tranID = searchResult.values['GROUP(tranid)'];
    	var recordID = searchResult.values['MAX(internalid)'];  	
    	var itemID = searchResult.values['GROUP(item)'].value;
    	var itemText = searchResult.values['GROUP(item)'].text;
    	var monthStart = searchResult.values['GROUP(formulatext)'];
    	var monthEnd = searchResult.values['GROUP(formuladate)'];
    	var itemRate = searchResult.values['MAX(rate)'];
    	var quantity = parseFloat(searchResult.values['SUM(quantity)']); // use parseFloat to convert to floating point number
    	var usage = parseFloat(searchResult.values['SUM(fxamount)']); // use parseFloat to convert to floating point number
    	var contractRecordID = searchResult.values['GROUP(custcol_bbs_contract_record)'].value;
    	var contractRecordText = searchResult.values['GROUP(custcol_bbs_contract_record)'].text;
    	
    	log.audit({
    		title: 'Processing Search Result',
    		details: 'Sales Order: ' + tranID + '<br>Item: ' + itemText + '<br>Contract Record: ' + contractRecordText
    	});
    	
    	// create search to find contract product records for this item
		var productSearch = search.create({
			type: 'customrecord_bbs_contract_product',
				    				
			columns: [{
				name: 'internalid'
				    }],
				    				
			filters: [{
				name: 'custrecord_contract_product_parent',
				operator: 'anyof',
				values: [contractRecordID]
			},
				    {
				name: 'custrecord_contract_product_product',
				operator: 'anyof',
				values: [itemID]
			}],
		});
				    			
		// run search and process results
		productSearch.run().each(function(result) {
				    				
			// increase productRecords variable
			productRecords++;
				    				
		});
		
		// check if the productRecords variable is 0
		if (productRecords == 0)
			{
				// call function to create a new contract product record. Pass contractRecord, contractRecordText, itemID, itemText and tranID variables		
				createProduct(contractRecordID, contractRecordText, itemID, itemText, tranID);
			}
    	
    	// create search to find period detail records to be updated
		var periodDetailSearch = search.create({
			type: 'customrecord_bbs_contract_period',
			
			columns: [{
				name: 'custrecord_bbs_contract_period_prod_use'
			},
					{
				name: 'custrecord_bbs_contract_period_quantity'
			}],
			
			filters: [{
				name: 'custrecord_bbs_contract_period_contract',
				operator: 'anyof',
				values: [contractRecordID]
			},
					{
				name: 'custrecord_bbs_contract_period_product',
				operator: 'anyof',
				values: [itemID]
			},
					{
				name: 'custrecord_bbs_contract_period_start',
				operator: 'onorafter',
				values: [monthStart]
			},
					{
				name: 'custrecord_bbs_contract_period_end',
				operator: 'onorbefore',
				values: [monthEnd]
    		}],
		});
		
		// run search and process search results
		periodDetailSearch.run().each(function(result) {
			
			// get the current usage and quantity from the search results
			var currentUsage = result.getValue({
				name: 'custrecord_bbs_contract_period_prod_use'
			});
			
			var currentQuantity = result.getValue({
				name: 'custrecord_bbs_contract_period_quantity'
			});
			
			// check if the currentUsage variable returns a value
			if (currentUsage)
				{
					// use parseFloat to convert to floating point number
					currentUsage = parseFloat(currentUsage);
				}
			else
				{
					// set the currentUsage variable to 0.00
					currentUsage = 0.00;
				}
			
			// check if the currentQuantity variable returns a value
			if (currentQuantity)
				{
					// use parseFloat to convert to floating point number
					currentQuantity = parseFloat(currentQuantity);
				}
			else
				{
					// set the currentQuantity variable to 0.00
					currentQuantity = 0.00;
				}
			
			// add the usage to the currentUsage to calculate the updatedUsage
			var updatedUsage = currentUsage + usage;
			
			// add the quantity to the currentQuantity to calculate the updatedQuantity
			var updatedQuantity = currentQuantity + quantity;
			
			try
				{
					// update the usage on the period detail record
					record.submitFields({
						type: 'customrecord_bbs_contract_period',
						id: result.id,
						values: {
							custrecord_bbs_contract_period_prod_use: updatedUsage,
							custrecord_bbs_contract_period_quantity: updatedQuantity,
							custrecord_bbs_contract_period_rate: itemRate
						}
					});
					
					log.audit({
						title: 'Period Detail Record Updated',
						details: result.id
					});
					
					// add a key value pair for the tranID and itemID
					context.write({
						key: recordID,
						value: itemID
					});
				}
			catch(e)
				{
					log.error({
						title: 'An Error Occured Updating a Period Detail Record',
						details: 'Record ID: ' + result.id + '<br>Error: ' + e
					});
				}
    		
		});

    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {
    	
    	// get the internal ID of the sales order
    	var salesOrderID = context.key;
    	
    	log.audit({
			title: 'Processing Sales Order',
			details: 'Sales Order ID: ' + context.key
		});
    	
    	try
    		{
	    		// load the sales order record
				var soRecord = record.load({
					type: record.Type.SALES_ORDER,
					id: salesOrderID,
					isDynamic: true
				});
			
				// get count of item lines
		    	var lineCount = soRecord.getLineCount({
		    		sublistId: 'item'
		    	});
		    	
		    	// loop through line count
		    	for (var i = 0; i < lineCount; i++)
		    		{
			    		// declare and initialize variables
						var productRecords = 0;
						var periodDetailRecordID = 0;
						var itemID;
						var keyItem
					
						// select the line
						soRecord.selectLine({
							sublistId: 'item',
							line: i
						});
					
						// get the value of the 'Usage Updated' checkbox for the line
						var usageUpdated = soRecord.getCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_bbs_usage_updated'
						});
						
						// get the value of the search date field for the line
						var searchDate = soRecord.getCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_bbs_so_search_date'
						});
						
						// get the value of the contract record field for the line
						var contractRecord = soRecord.getCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_bbs_contract_record'
						});
						
						// check that the usageUpdated variable returns false (checkbox is NOT ticked) and the searchDate and contractRecord variables return values
						if (usageUpdated == false && searchDate != '' && contractRecord != '')
							{
								// get the internal ID of the item for the line
				    			itemID = soRecord.getCurrentSublistValue({
				    				sublistId: 'item',
				    				fieldId: 'item'
				    			});
				    			
				    			// loop through key value count
				    			for (var x = 0; x < context.values.length; x++)
				    				{
				    					// get the item to be updated
				    					keyItem = context.values[x];
				    					
				    					// check if the itemID and the keyItem are the same
				    					if (itemID == keyItem)
				    						{
					    						// tick the 'Usage Updated' checkbox on the line
								        		soRecord.setCurrentSublistValue({
								        			sublistId: 'item',
								        			fieldId: 'custcol_bbs_usage_updated',
								        			value: true
								        		});
								        		
								        		// commit the line
								        		soRecord.commitLine({
													sublistId: 'item'
												});
								        		
								        		// break the loop
								        		break;
				    						}
				    				}
				    		}
		    		}
		    	
		    	// save the record
		    	soRecord.save({
		    		enableSourcing: false,
					ignoreMandatoryFields: true
		    	});
		    	
		    	log.audit({
		    		title: 'Sales Order Updated',
		    		details: salesOrderID
		    	});   	
		    	
    		}
    	catch(e)
    		{
	    		log.error({
					title: 'Error Updating Sales Order',
					details: 'Sales Order ID: ' + salesOrderID + '<br>Error: ' + e
				});
    		}

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
    
    // ================================================
    // FUNCTION TO CREATE A NEW CONTRACT PRODUCT RECORD
    // ================================================
    
    function createProduct(contractRecord, contractRecordText, itemID, itemText, tranID)
	    {
	    	try
	    		{
	    			// create a new 'Contract Product Detail' record
	    			var productRecord = record.create({
	    				type: 'customrecord_bbs_contract_product'
	    			});
	    			
	    			// set fields on the new 'Contract Product Detail' record
	    			productRecord.setValue({
	    				fieldId: 'custrecord_contract_product_parent',
	    				value: contractRecord
	    			});
	    			
	    			productRecord.setValue({
	    				fieldId: 'custrecord_contract_product_product',
	    				value: itemID
	    			});
	    			
	    			// save the new 'Contract Product Detail' record
	    			var productRecordID = productRecord.save();
	    			
	    			log.audit({
	    				title: 'Contract Product Detail Record Created',
	    				details: 'Contract Record ID: ' + contractRecord + ' | Contract Product Detail Record ID: ' + productRecordID + ' | Item ID: ' + itemID
	    			});

	    			try
		    			{
		    				// send email
		    	        	email.send({
		    	        		author: emailSender,
		    	        		recipients: emailRecipient,
		    	        		subject: 'Item Added to Contract ' + contractRecordText,
		    	        		body: 'Item <b>' + itemText + '</b> was added by Jitterbit to Sales Order <b>' + tranID + '</b> but did not exist on the contract.<br><br>The item has now been added to the contract.<br><br><span style="font-size:10px;">this alert has been generated by the script BBS Sales Order UE</span>' ,
		    	        	});
		    			}
		    		catch(error)
		    			{
		    				log.error({
		    					title: 'Error Sending Item Added to Contract Email',
		    					details: 'Error: ' + error
		    				});
		    			}
	    			
		    		// call function to create contract period detail records. Pass contractRecord and productRecordID variables
					createPeriodDetail(contractRecord, productRecordID);
	    		}
	    	catch(error)
		    	{
		    		log.error({
	    				title: 'Error Creating Contract Product Detail Record ',
	    				details: 'Contract Record ID: ' + contractRecord + ' | Item ID: ' + itemID + ' | Error: ' + error
	    			});
		    		
		    		try
			    		{
			    			// send email
		    	        	email.send({
		    	        		author: emailSender,
		    	        		recipients: emailRecipient,
		    	        		subject: 'Unable to Add Item to Contract ' + contractRecordText,
		    	        		body: 'Item <b>' + itemText + '</b> was added by Jitterbit to Sales Order <b>' + tranID + '</b> but did not exist on the contract.<br><br>The item cannot be added to the contract due to the following error:<br><br>' + error + '<br><br><span style="font-size:10px;">this alert has been generated by the script BBS Sales Order UE</span>' ,
		    	        	});
			    		}
		    		catch(error)
		    			{
		    				log.error({
		    					title: 'Error Sending Unable to Add Item to Contract Email',
		    					details: 'Error: ' + error
		    				});
		    			}
		    	}
	    }
    
    // =================================================
    // FUNCTION TO CREATE CONTRACT PERIOD DETAIL RECORDS
    // =================================================
    
    function createPeriodDetail(contractRecord, productRecordID)
    	{
	    	// declare and initiate variables
	    	var quarter = 0;
	    	var monthlyMinimum;
	    	var thisMonthlyMinimum;
	    	var quarterStart = false;
	    	
	    	// lookup fields on the parent record
	    	var contractRecordLookup = search.lookupFields({
	    		type: 'customrecord_bbs_contract',
				id: contractRecord,
				columns: ['custrecord_bbs_contract_term', 'custrecord_bbs_contract_start_date', 'custrecord_bbs_contract_billing_type', 'custrecord_bbs_contract_min_ann_use', 'custrecord_bbs_contract_mon_min_use', 'custrecord_bbs_contract_qu_min_use']
	    	});
    	
	    	// get the billing type from the parent record
	    	var billingType = contractRecordLookup.custrecord_bbs_contract_billing_type[0].value;
    	
	    	// check if the billing type is 4 (AMP) or 6 (AMBMA)
	    	if (billingType == '4' || billingType == '6')
	    		{
	    			// get the annual minimum from the parent record
	    			var annualMinimum = contractRecordLookup.custrecord_bbs_contract_min_ann_use;
	    			
	    			// divide annualMinimum by 12 to calculate monthlyMinimum
	    			monthlyMinimum = parseFloat(annualMinimum / 12);
	    			monthlyMinimum.toFixed(2);
	    		}
	    	// check if the billing type is 3 (QMP) or 5 (QUR)
	    	else if (billingType == '3' || billingType == '5')
	    		{
		    		// get the quarterly minimum from the parent record
					var qtrMinimum = contractRecordLookup.custrecord_bbs_contract_qu_min_use;
					
					// divide qtrMinimum by 3 to calculate monthlyMinimum
	    			monthlyMinimum = parseFloat(qtrMinimum / 3);
	    			monthlyMinimum.toFixed(2);
	    		}
	    	// check if the billing type is 2 (UIOLI)
	    	else if (billingType == '2')
	    		{
	    			// get the monthly minimum from the parent record and set the monthlyMinimum variable with this value
	    			monthlyMinimum = contractRecordLookup.custrecord_bbs_contract_mon_min_use;
	    		}
		
			// get the contract start date from the parent record
	    	var periodStartDate = contractRecordLookup.custrecord_bbs_contract_start_date;
	    	
	    	// format periodStartDate as a date object
	    	periodStartDate = format.parse({
	    		type: format.Type.DATE,
	    		value: periodStartDate
	    	});

	    	// get the date of the period start date
	    	var day = periodStartDate.getDate();
	    	
	    	// set periodEndDate
	    	var periodEndDate = new Date(periodStartDate.getFullYear(), periodStartDate.getMonth(), 1);
	    	
	    	// set quarterEndDate
	    	var quarterEndDate = new Date(periodEndDate.getFullYear(), periodEndDate.getMonth()-1, 1);
	    	
	    	// get the contract term from the parent record
	    	var contractTerm = contractRecordLookup.custrecord_bbs_contract_term;   	
	    	contractTerm = parseInt(contractTerm); // convert to integer number
    	
	    	// check if the day of the start date is greater than the 1st of the month
	    	if (day > 1)
	    		{
	    			// increase the contractTerm variable by 1
	    			contractTerm++;
	    		}
 
	    	// loop through contract term
	    	for (var ct = 1; ct <= contractTerm; ct++)
	    		{
	    			// reset the thisMonthlyMinimum variable's value using the monthlyMinimum variable
	    			thisMonthlyMinimum = monthlyMinimum;
	    			
	    			// reset the quarterStart variable to false
	    			quarterStart = false;
	    		
	    			// create a new BBS Contract Period Detail record
	    			var newRecord = record.create({
	    				type: 'customrecord_bbs_contract_period'
	    			});
	    					
	    			// set fields on the new record
	    			newRecord.setValue({
	    				fieldId: 'custrecord_bbs_contract_period_contract',
	    				value: contractRecord
	    			});
    			
	    			newRecord.setValue({
	    				fieldId: 'custrecord_bbs_contract_period_parent',
	    				value: productRecordID
	    			});
	    					
	    			newRecord.setValue({
	    				fieldId: 'custrecord_bbs_contract_period_period',
	    				value: ct
	    			});
    			
	    			// if statement to check if this is not the first contract term
	    			if (ct != 1)
	    				{
	    					// set period start date
	    					periodStartDate = new Date(periodStartDate.getFullYear(), periodStartDate.getMonth()+1, 1); // 1st of the month   					
	    				}
	    			
	    			// if this is the last contract period and and the start day is not 1
	    	    	if (ct == contractTerm && day != 1)
	    				{
		    				// decrease the day variable by 1
	    					day--;
	    							
	    					// set period end date
	    					periodEndDate = new Date(periodStartDate.getFullYear(), periodStartDate.getMonth(), day);
	    				}
	    			else
	    				{
	    		    		// set period end date
	    					periodEndDate = new Date(periodStartDate.getFullYear(), periodStartDate.getMonth()+1, 0);
	    				}
	    	    	
	    	    	// call function to calculate number of days in the periodStartDate month
	    			var daysInMonth = getDaysInMonth(periodStartDate.getMonth(), periodStartDate.getFullYear());
	    			
	    			// get the day of the periodStartDate object
	    	    	var periodStartDay = periodStartDate.getDate();
	    	    	
	    	    	// get the day of the periodEndDate object
	    	    	var periodEndDay = periodEndDate.getDate();
    			
	    			// check if the periodStartDay variable is not equal to 1
	    	    	if (periodStartDay != 1)
	    	    		{
		    	    		// calculate the days remaining in the month
							var daysRemaining = daysInMonth - (periodStartDay-1);
							
							// divide thisMonthlyMinimum by daysInMonth to calculate the dailyMinimum
							var dailyMinimum = thisMonthlyMinimum / daysInMonth;
							
							// multiply the dailyMinimum by daysRemaining to calculate the pro rata minimum usage
							thisMonthlyMinimum = parseFloat(dailyMinimum * daysRemaining);
							thisMonthlyMinimum = thisMonthlyMinimum.toFixed(2);
	    	    		}
	    	    	// check if the periodEndDay variable is not equal to daysInMonth variable
	    	    	else if (periodEndDay != daysInMonth)
	    	    		{
		    	    		// divide thisMonthlyMinimum by daysInMonth to calculate the dailyMinimum
							var dailyMinimum = thisMonthlyMinimum / daysInMonth;
							
							// multiply thisMonthlyMinimum by periodEndDay to calculate the pro rata minimum usage
							thisMonthlyMinimum = parseFloat(dailyMinimum * periodEndDay);
							thisMonthlyMinimum = thisMonthlyMinimum.toFixed(2);
	    	    		}
    	    	
	    	    	// set the minimum monthly usage field on the new record
	    	    	newRecord.setValue({
	    	    		fieldId: 'custrecord_bbs_contract_period_min_mon',
	    	    		value: thisMonthlyMinimum
	    	    	}); 	    	
		    				
		    		// set the start and end dates on the new record
	    			newRecord.setValue({
	    				fieldId: 'custrecord_bbs_contract_period_start',
	    				value: periodStartDate
	    			});
	    					
	    			newRecord.setValue({
	    				fieldId: 'custrecord_bbs_contract_period_end',
	    				value: periodEndDate
	    			});
    			
	    			// if statement to check this is the 3rd contract period and not the last contract period
	    			if (ct % 3 === 1 && ct != contractTerm)
	    				{	
		        			// check this is NOT the first month
	    					if (ct != 1)
	    						{
	    							// set the value of the quarterStart variable to true
	    							quarterStart = true;
	    						}
    				
	    					// increase quarter variable by 1
			    			quarter++;
		        			
			    			// if the quarter variable is 5
		        			if (quarter == 5)
		        				{
			        				// reset quarter variable to 1
			    					quarter = 1;
		        				}
	    					
	    					// increase the quarterEndDate by 3 months
		        			quarterEndDate = new Date(quarterEndDate.getFullYear(), quarterEndDate.getMonth()+4, 0); // last day of the month
	    				}
	        			
		        	// set the contract quarter field on the new record
		    		newRecord.setValue({
		    			fieldId: 'custrecord_bbs_contract_period_quarter',
		    			value: quarter
		    		});
	    				
		    		// set quarter end date field on the new record using the quarter end date object
		    		newRecord.setValue({
		    			fieldId: 'custrecord_bbs_contract_period_qu_end',
		    			value: quarterEndDate
		    		});
	    		
		    		// check if quarterStart = true
		    		if (quarterStart == true)
		    			{
		    				// tick the 'Start of New Quarter' checkbox on the new record
		    				newRecord.setValue({
		    					fieldId: 'custrecord_bbs_contract_period_qtr_start',
		    					value: true
		    				});
		    			}
    				
		    		try
		    			{
			    			// submit the new record
			    			var newRecordID = newRecord.save();
		    			
		    				log.audit({
			    				title: 'Contract Period Detail Record Created',
			    				details: 'Contract Record ID: ' + contractRecord + ' | Contract Period Detail Record ID: ' + newRecordID
			    			});
		    			}
		    		catch(error)
			    		{
			    			log.error({
			    				title: 'Error Creating Contract Period Detail Record ',
			    				details: 'Contract Record ID: ' + contractRecord + ' | Error: ' + error
			    			});
			    		}
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

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
