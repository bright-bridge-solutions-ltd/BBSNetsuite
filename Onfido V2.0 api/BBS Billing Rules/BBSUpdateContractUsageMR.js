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
			
			filters: [{
				name: 'status',
				operator: search.Operator.ANYOF,
				values: ['SalesOrd:F'] // SalesOrd:F = Pending Billing
			},
					{
				name: 'custbody_bbs_contract_record',
				operator: search.Operator.NONEOF,
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
			},
					{
				name: 'custcol_bbs_usage_updated',
				operator: search.Operator.IS,
				values: ['F']
			},
    				{
    			name: 'custcol_bbs_so_search_date',
    			operator: search.Operator.ISNOTEMPTY
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
    	
    	// declare and initialize variables
    	var linesToUpdate = new Array();
    	
    	// retrieve search results
    	var searchResult 	= JSON.parse(context.value);
    	var tranID			= searchResult.values['GROUP(tranid)'];
    	var recordID		= searchResult.values['MAX(internalid)'];
    	
    	log.audit({
    		title: 'Processing Sales Order',
    		details: 'Tran ID: ' + tranID + '<br>Record ID: ' + recordID
    	});
    	
    	// find the lines that need updating
    	search.create({
    		type: search.Type.SALES_ORDER,
    		
    		filters: [{
				name: 'internalid',
				operator: search.Operator.ANYOF,
				values: [recordID]
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
				name: 'custcol_bbs_usage_updated',
				operator: search.Operator.IS,
				values: ['F']
			},
					{
				name: 'custcol_bbs_contract_record',
				operator: search.Operator.NONEOF,
				values: ['@NONE@']
    		},
    				{
    			name: 'custcol_bbs_so_search_date',
    			operator: search.Operator.ISNOTEMPTY
    		}],
    		
    		columns: [{
				name: 'item',
				summary: search.Summary.GROUP
			},
					{
				name: 'formulatext',
				summary: search.Summary.GROUP,
				formula: "CONCAT('01/', TO_CHAR({custcol_bbs_so_search_date}, 'MM/YYYY'))"
			},		
					{
				name: 'formuladate',
				summary: search.Summary.GROUP,
				formula: 'LAST_DAY({custcol_bbs_so_search_date})',
			},
					{
				name: 'formulatext',
				summary: search.Summary.MAX,
				formula: "REPLACE(NS_CONCAT({linesequencenumber}-1), ',',',')",
			},
					{
				name: 'fxrate',
				summary: search.Summary.MAX
			},
					{
				name: 'quantity',
				summary: search.Summary.SUM
			},
					{
				name: 'fxamount',
				summary: search.Summary.SUM
			},
					{
				name: 'custcol_bbs_contract_record',
				summary: search.Summary.GROUP
			}],
    		
    	}).run().each(function(result){
    		
    		// retrieve search results. Using formula numbers due to using multiple formulas
    		var itemID 			= result.getValue(result.columns[0]);
    		var monthStart 		= result.getValue(result.columns[1]);
    		var monthEnd		= result.getValue(result.columns[2]);
    		var lines			= result.getValue(result.columns[3]).split(','); // split on ',' as needs to be an array
    		var rate			= result.getValue(result.columns[4]);
    		var quantity		= parseInt(result.getValue(result.columns[5]));
    		var amount			= parseFloat(result.getValue(result.columns[6]));
    		var contractRecord	= result.getValue(result.columns[7]);
    		
    		// call function to check if this product already exists on the contract record
    		checkExistingProducts(itemID, contractRecord);
    		
    		// call function to update the usage on the contract period detail record
    		var usageUpdated = updatePeriodDetailRecord(itemID, contractRecord, monthStart, monthEnd, rate, quantity, amount);
    		
    		// if we have been able to update the period detail record successfully
    		if (usageUpdated == true)
    			{
    				// loop through lines
    				for (var i = 0; i < lines.length; i++)
    					{
    						// push the line ID to the linesToUpdate array
    						linesToUpdate.push(lines[i]);
    					}
    			}
    		
    		// continue processing search results
    		return true;
    		
    	});
    	
    	// call function to update the sales order
    	updateSalesOrder(recordID, linesToUpdate);

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
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function checkExistingProducts(itemID, contractRecord) {
    	
    	// declare and initialize variables
    	var productRecords = 0;
    	
    	// run search to check if we have any contract product records for this item
		search.create({
			type: 'customrecord_bbs_contract_product',
				    				
			filters: [{
				name: 'custrecord_contract_product_product',
				operator: search.Operator.ANYOF,
				values: [itemID]
			},
					{
				name: 'custrecord_contract_product_parent',
				operator: search.Operator.ANYOF,
				values: [contractRecord]
			}],
			
			columns: [{
				name: 'internalid'
			}],
		
		}).run().each(function(result) {
				    				
			// increase productRecords variable
			productRecords++;
				    				
		});
		
		// check if the productRecords variable is 0
		if (productRecords == 0)
			{
				// call function to create a new contract product record. Pass contractRecord and itemID variables	
				createContractProduct(contractRecord, itemID);
			}
    	
    }
    
    function createContractProduct(contractRecord, itemID) {
	    	
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
		    	        	subject: 'Item Added to Contract ' + contractRecord,
		    	        	body: 'Item <b>' + itemID + '</b> was added by Jitterbit but did not exist on the contract.<br><br>The item has now been added to the contract.<br><br><span style="font-size:10px;">this alert has been generated by the script BBS Sales Order UE</span>' ,
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
		    	        	subject: 'Unable to Add Item to Contract ' + contractRecord,
		    	        	body: 'Item <b>' + itemID + '</b> was added by Jitterbit but did not exist on the contract.<br><br>The item cannot be added to the contract due to the following error:<br><br>' + error + '<br><br><span style="font-size:10px;">this alert has been generated by the script BBS Sales Order UE</span>' ,
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
    
    function updatePeriodDetailRecord(itemID, contractRecord, monthStart, monthEnd, itemRate, quantity, usage) {
    	
    	// declare and initialize variables
    	var usageUpdated = null;
    	
    	// run search to find the period detail record to update
    	search.create({
    		type: 'customrecord_bbs_contract_period',
			
			filters: [{
				name: 'custrecord_bbs_contract_period_contract',
				operator: search.Operator.ANYOF,
				values: [contractRecord]
			},
					{
				name: 'custrecord_bbs_contract_period_product',
				operator: search.Operator.ANYOF,
				values: [itemID]
			},
					{
				name: 'custrecord_bbs_contract_period_start',
				operator: search.Operator.ONORAFTER,
				values: [monthStart]
			},
					{
				name: 'custrecord_bbs_contract_period_end',
				operator: search.Operator.ONORBEFORE,
				values: [monthEnd]
    		}],
    		
    		columns: [{
				name: 'custrecord_bbs_contract_period_prod_use'
			},
					{
				name: 'custrecord_bbs_contract_period_quantity'
			}],
    		
		}).run().each(function(result) {
			
			// get the current usage and quantity
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
					
					// set usageUpdate flag to true
					usageUpdated = true;
				}
			catch(e)
				{
					log.error({
						title: 'An Error Occured Updating a Period Detail Record',
						details: 'Record ID: ' + result.id + '<br>Error: ' + e
					});
					
					// set usageUpdated flag to false
					usageUpdated = false;
				}
    		
		});
    	
    	// return usageUpdated variable to main script function
    	return usageUpdated;
    	
    }
    
    function updateSalesOrder(salesOrderID, linesToUpdate) {
    	
    	try
			{
	    		// load the sales order record
				var soRecord = record.load({
					type: record.Type.SALES_ORDER,
					id: salesOrderID,
					isDynamic: true
				});
		
				// loop through linesToUpdate
				for (var i = 0; i < linesToUpdate.length; i++)
					{
						// select the line
						soRecord.selectLine({
							sublistId: 'item',
							line: linesToUpdate[i]
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

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
