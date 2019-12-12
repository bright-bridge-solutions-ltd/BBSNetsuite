/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/format', 'N/email'],
/**
 * @param {record} record
*/		
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
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
    	
    	// check if the record is being copied
    	if (scriptContext.type == 'copy')
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    		
    			// get a count of item lines on the record
		    	var lineCount = currentRecord.getLineCount({
		    		sublistId: 'item'
		    	});
		    	
		    	// loop through item lines
		    	for (var x = 0; x < lineCount; x++)
		    		{
			    		// untick the 'Usage Updated' checkbox on the line
		        		currentRecord.setSublistValue({
		        			sublistId: 'item',
		        			fieldId: 'custcol_bbs_usage_updated',
		        			value: false,
		        			line: x
		        		});
		    		}
    		}
    }
    
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {	 	

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
    	
    	// only run script when the record is being created or edited
    	if (scriptContext.type == 'create' || scriptContext.type == 'edit')
    		{    		
    			// get the ID of the current record
    			var recordID = scriptContext.newRecord.id;
    			
    			// reload the record
    			var soRecord = record.load({
    				type: record.Type.SALES_ORDER,
    				id: recordID,
    				isDynamic: true
    			});
    			
    			// get value of the tranid field
    			var tranID = soRecord.getValue({
    				fieldId: 'tranid'
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
		    		
		    			// select the line
		    			soRecord.selectLine({
		    				sublistId: 'item',
		    				line: i
		    			});
		    		
		    			// get the value of the 'Usage Updated' checkbox for the line
		    			var usageUpdated = soRecord.getSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'custcol_bbs_usage_updated',
		    				line: i
		    			});
		    			
		    			// get the search date for the line
		    			var searchDate = soRecord.getCurrentSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'custcol_bbs_so_search_date'
		    			});
		    			
		    			// get the internal ID of the contract record for the line
		    			var contractRecord = soRecord.getCurrentSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'custcol_bbs_contract_record'
		    			});
		    			
		    			// get the text value of the contract record for the line
		    			var contractRecordText = soRecord.getCurrentSublistText({
		    				sublistId: 'item',
		    				fieldId: 'custcol_bbs_contract_record'
		    			});
		    			
		    			// check that the usageUpdated variable returns false (checkbox is NOT ticked) and the searchDate and contractRecord variables return values
		    			if (usageUpdated == false && searchDate != '' && contractRecord != '')
		    				{
		    					// get the internal ID of the item for the line
				    			var itemID = soRecord.getCurrentSublistValue({
				    				sublistId: 'item',
				    				fieldId: 'item'
				    			});
				    			
				    			// get the text value of the item for the line
				    			var itemText = soRecord.getCurrentSublistText({
				    				sublistId: 'item',
				    				fieldId: 'item'
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
				    					values: [contractRecord]
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
				    					// call function to create a new contract product record. Pass contractRecord, contractRecordText, itemID, itemText and tranID variables. ID of product detail record will be created				    				
				    					createProduct(contractRecord, contractRecordText, itemID, itemText, tranID);
				    				}
				    			
				    			// format searchDate as a date object
				            	var searchDate = format.parse({
				        				value: searchDate,
				        				type: format.Type.DATE
				        		});
				            	
				            	// set the startDate to be the first day of the searchDate month
				    			var startDate = new Date(searchDate.getFullYear(), searchDate.getMonth(), 1);
				    			
				    			// set the endDate to be the last day of the startDate month
				    			var endDate = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0);
				    			
				    			// format startDate so it can be used as a search filter
				    			startDate = format.format({
				    				value: startDate,
				    				type: format.Type.DATE
				    			});
				    			
				    			// format endDate so it can be used as a search filter
				    			endDate = format.format({
				    				value: endDate,
				    				type: format.Type.DATE
				    			});
				    			
				    			// create search to find period detail records to be updated
				    			var periodDetailSearch = search.create({
				        			type: 'customrecord_bbs_contract_period',
				        			
				        			columns: [{
				        				name: 'internalid'
				        			},
				        					{
				        				name: 'custrecord_bbs_contract_period_prod_use'
				        			},
				        					{
				        				name: 'custrecord_bbs_contract_period_quantity'
				        			}],
				        			
				        			filters: [{
				        				name: 'custrecord_bbs_contract_period_contract',
				        				operator: 'anyof',
				        				values: [contractRecord]
				        			},
				        					{
				        				name: 'custrecord_bbs_contract_period_product',
				        				operator: 'anyof',
				        				values: [itemID]
				        			},
				        					{
				        				name: 'custrecord_bbs_contract_period_start',
				        				operator: 'onorafter',
				        				values: [startDate]
				        			},
				        					{
				        				name: 'custrecord_bbs_contract_period_end',
				        				operator: 'onorbefore',
				        				values: [endDate]
				            		}],
				        		});
				    			
				    			// run search and process search results
				        		periodDetailSearch.run().each(function(result) {
				        			
				        			// get the record ID from the search results
				    	    		var recordID = result.getValue({
				    	    			name: 'internalid'
				    	    		});
				    	    		
				    	    		// get the product usage from the search results
				    	    		var currentUsage = result.getValue({
				    	    			name: 'custrecord_bbs_contract_period_prod_use'
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
				    	    		
				    	    		// get the current quantity from the search results
				    	    		var currentQuantity = result.getValue({
				    	    			name: 'custrecord_bbs_contract_period_quantity'
				    	    		});
				    	    		
				    	    		// check if the currentQuantity variable returns a value
				    	    		if (currentQuantity)
				    	    			{
				    	    				// use parseInt to convert to an integer number
				    	    				currentQuantity = parseInt(currentQuantity);
				    	    			}
				    	    		else
				    	    			{
				    	    				// set the currentQuantity variable to 0
				    	    				currentQuantity = 0;
				    	    			}
				    	    		
				    	    		// get the unit price for the line
				    	    		var unitPrice = soRecord.getCurrentSublistValue({
				        				sublistId: 'item',
				        				fieldId: 'rate'
				        			});
				        			
				        			// get the quantity for the line
				    	    		var quantity = soRecord.getCurrentSublistValue({
				        				sublistId: 'item',
				        				fieldId: 'quantity'
				        			});
				        			
				        			// multiply the unitPrice by the quantity to calculate the usage
				    	    		var usage = unitPrice * quantity;
				    	    		
				    	    		// add the usage to the currentUsage to calculate the updatedUsage
				    	    		var updatedUsage = currentUsage + usage;
				    	    		
				    	    		// add the quantity to the currentQuantity to calculate the updatedQuantity
				    	    		var updatedQuantity = currentQuantity + quantity;
				        			
				        			// update the usage on the period detail record
				        			record.submitFields({
				        				type: 'customrecord_bbs_contract_period',
				        				id: recordID,
				        				values: {
				        					custrecord_bbs_contract_period_prod_use: updatedUsage,
				        					custrecord_bbs_contract_period_quantity: updatedQuantity,
				        					custrecord_bbs_contract_period_rate: unitPrice
				        				}
				        			});
				        			
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
				
				        		});

		    				}
		    		}
		    	
		    	// save the record
		    	soRecord.save({
		    		enableSourcing: false,
					ignoreMandatoryFields: true
		    	});
    		}
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
		    				// send email with a list of ended contracts
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
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
