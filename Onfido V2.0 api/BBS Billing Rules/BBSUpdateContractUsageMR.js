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
				name: 'fxrate',
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
    	var tranID 				= searchResult.values['GROUP(tranid)'];
    	var recordID 			= searchResult.values['MAX(internalid)'];  	
    	var itemID 				= searchResult.values['GROUP(item)'].value;
    	var itemText 			= searchResult.values['GROUP(item)'].text;
    	var monthStart 			= searchResult.values['GROUP(formulatext)'];
    	var monthEnd 			= searchResult.values['GROUP(formuladate)'];
    	var itemRate 			= searchResult.values['MAX(fxrate)'];
    	var quantity 			= parseFloat(searchResult.values['SUM(quantity)']); // use parseFloat to convert to floating point number
    	var usage				= parseFloat(searchResult.values['SUM(fxamount)']); // use parseFloat to convert to floating point number
    	var contractRecordID 	= searchResult.values['GROUP(custcol_bbs_contract_record)'].value;
    	var contractRecordText 	= searchResult.values['GROUP(custcol_bbs_contract_record)'].text;
    	
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

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
