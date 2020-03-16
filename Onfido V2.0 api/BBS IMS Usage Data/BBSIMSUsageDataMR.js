/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/format'],
function(search, record, format) {
   
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
    	
    	// create search to find records to be processed
    	return search.create({
    		type: 'customrecord_bbs_ims_usage_data',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
				name: 'custrecord_bbs_ims_usage_data_processed',
				operator: 'is',
				values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_ims_usage_data_errors',
    			operator: 'isempty',
    		},
    				{
    			name: 'custrecord_bbs_ims_usage_data_contract',
    			operator: 'anyof',
    			values: ['800']
    		},
    				{
    			name: 'custrecord_bbs_ims_usage_data_item_rec',
    			operator: 'noneof',
    			values: ['@NONE@']
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_ims_usage_data_contract',
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
    	
    	// retrieve search results
    	var searchResult = JSON.parse(context.value);
    	
    	// get the contract ID
    	var contractRecord = searchResult.values['GROUP(custrecord_bbs_ims_usage_data_contract)'].text;
    	var contractRecordID = searchResult.values['GROUP(custrecord_bbs_ims_usage_data_contract)'].value;
    	
    	log.audit({
    		title: 'Processing Contract Record',
    		details: 'Contract Record: ' + contractRecord + '<br>ID: ' + contractRecordID
    	});
    	
    	// call function to run search to check if we have an open sales order for this contract. Pass contractRecordID
    	var salesOrderID = checkForOpenSalesOrder(contractRecordID);
    	
    	// check if we have an open sales order
    	if (salesOrderID != null)
    		{
    			// call function to update the sales order. Pass context object, openSalesOrder and contractRecordID variables
    			updateSalesOrder(context, salesOrderID, contractRecordID);
    		}
    	else
    		{
    			// call function to create a new sales order. Pass context object and contractRecordID variables
    			createSalesOrder(context, contractRecordID);
    		}

    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {    	
    	
    	// process key value pairs
    	var key = context.key;
    	var value = context.values[0];
    	
    	try
    		{
		    	// check if we have got a sales order ID
		    	if (parseInt(value))
		    		{
			    		// update the IMS data record with the sales order ID
				    	record.submitFields({
				    		type: 'customrecord_bbs_ims_usage_data',
				    		id: key,
				    		values: {
				    			custrecord_bbs_ims_usage_data_processed: true,
				    			custrecord_bbs_ims_usage_data_sales_ord: value
				    		}
				    	});
		    		}
		    	else // we have got an error message
		    		{
		    			// update the IMS data record with the error message
			    		record.submitFields({
				    		type: 'customrecord_bbs_ims_usage_data',
				    		id: key,
				    		values: {
				    			custrecord_bbs_ims_usage_data_errors: value
				    		}
				    	});
		    		}
		    	
		    	log.audit({
		    		title: 'IMS Data Record Updated',
				    details: key
		    	});
    		}
    	catch(e)
    		{
	    		log.audit({
	        		title: 'Error Updating IMS Data Record',
	    		    details: 'Record ID: ' + key + '<br>Error: ' + e
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

    }
    
    // ==========================================================
    // FUNCTION TO CHECK FOR AN OPEN SALES ORDER FOR THE CONTRACT
    // ==========================================================
    function checkForOpenSalesOrder(contractRecordID)
    	{
    		// declare and initialize variables
    		salesOrderID = null;
    		
    		// create search to find open sales orders for this contract record
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
        			name: 'internalid'
        		}],	
    			
    		});
    		
    		// run search and process results
    		salesOrderSearch.run().each(function(result){
    			
    			// get the internal id of the sales order
    			salesOrderID = result.getValue({
    				name: 'internalid'
    			});
    			
    		});
    		
    		// return to the main script function
    		return salesOrderID;	
    		
    	}
    
    // ==================================
    // FUNCTION TO UPDATE THE SALES ORDER
    // ==================================
    function updateSalesOrder(context, salesOrderID, contractRecordID)
    	{
	    	// declare and initialize variables
			var IMSDataRecords = new Array();
    	
    		try
    			{
    				// load the sales order record
    				var salesOrderRecord = record.load({
    					type: record.Type.SALES_ORDER,
    					id: salesOrderID,
    					isDynamic: true
    				});
    				
    				// create search to find IMS data to be added to the sales order
	    			var IMSDataSearch = search.create({
	    				type: 'customrecord_bbs_ims_usage_data',
	    				
	    				filters: [{
	    					name: 'isinactive',
	    					operator: 'is',
	    					values: ['F']
	    				},
	    						{
	    					name: 'custrecord_bbs_ims_usage_data_processed',
	    					operator: 'is',
	    					values: ['F']
	    	    		},
	    	    				{
	    	    			name: 'custrecord_bbs_ims_usage_data_errors',
	    	    			operator: 'isempty',
	    	    		},
	    						{
	    	    			name: 'custrecord_bbs_ims_usage_data_contract',
	    	    			operator: 'anyof',
	    	    			values: [contractRecordID]
	    	    		},
	    	    				{
	    	    			name: 'custrecord_bbs_ims_usage_data_item_rec',
	    	    			operator: 'noneof',
	    	    			values: ['@NONE@']
	    	    		}],
	    	    		
	    	    		columns: [{
	    	    			name: 'custrecord_bbs_ims_usage_data_item_rec',
	    	    			summary: 'GROUP'
	    	    		},
	    	    				{
	    	    			name: 'custrecord_bbs_ims_usage_data_quantity',
	    	    			summary: 'SUM'
	    	    		},
	    	    				{
	    	    			name: 'custrecord_bbs_ims_usage_data_rate',
	    	    			summary: 'GROUP'
	    	    		},
	    	    				{
	    	    			name: 'custrecord_bbs_ims_usage_data_date',
	    	    			summary: 'MAX'
	    	    		},
	    	    				{
	    	    			name: 'formulatext',
	    	    			summary: 'MAX',
	    	    			formula: "REPLACE(NS_CONCAT({internalid}), ',','|')"
	    	    		}],
	    			
	    			});
	    			
	    			// run search and process results
	    			IMSDataSearch.run().each(function(result){
	    				
	    				// declare and initialize variables
	    				var itemAdded = false;
	    				
	    				// retrieve search results
	    				var IMSDataRecordsSearch = result.getValue({
							name: 'formulatext',
							summary: 'MAX'
						});
	    				
	    				IMSDataRecordsSearch.split('|'); // split on '|' as needs to be an array
	    				
	    				var item = result.getValue({
							name: 'custrecord_bbs_ims_usage_data_item_rec',
							summary: 'GROUP'
						});
						
						var quantity = result.getValue({
							name: 'custrecord_bbs_ims_usage_data_quantity',
							summary: 'SUM'
						});
						
						var rate = result.getValue({
							name: 'custrecord_bbs_ims_usage_data_rate',
							summary: 'GROUP'
						});
						
						var searchDate = result.getValue({
							name: 'custrecord_bbs_ims_usage_data_date',
							summary: 'MAX'
						});
						
						// format searchDate as a date object
						searchDate = format.parse({
							type: format.Type.DATE,
							value: searchDate
						});
						
						try
							{
			    				// select a new line on the sales order
			    				salesOrderRecord.selectNewLine({
									sublistId: 'item'
								});
			    				
			    				// set fields on the new line
			    				salesOrderRecord.setCurrentSublistValue({
			    					sublistId: 'item',
			    					fieldId: 'item',
			    					value: item
			    				});
			    				
			    				// set itemAdded to true
			    				itemAdded = true;
							}
						catch(e)
							{
								// loop through IMSDataRecordsSearch array
			    				for (var i = 0; i < IMSDataRecordsSearch.length; i++)
			    					{
			    						if (IMSDataRecordsSearch[i] != '|')
			    							{
			    								// create a key/value pair
				    							context.write({
				    								key: IMSDataRecordsSearch[i],
				    								value: e
				    							});
			    							}
			    					}
							}
						
						// check if itemAdded is true
						if (itemAdded == true)
							{
			    				
			    				salesOrderRecord.setCurrentSublistValue({
			    					sublistId: 'item',
			    					fieldId: 'quantity',
			    					value: quantity
			    				});
			    				
			    				salesOrderRecord.setCurrentSublistValue({
			    					sublistId: 'item',
			    					fieldId: 'rate',
			    					value: rate
			    				});
			    				
			    				salesOrderRecord.setCurrentSublistValue({
			    					sublistId: 'item',
			    					fieldId: 'custcol_bbs_contract_record',
			    					value: contractRecordID
			    				});
			    				
			    				salesOrderRecord.setCurrentSublistValue({
			    					sublistId: 'item',
			    					fieldId: 'custcol_bbs_so_search_date',
			    					value: searchDate
			    				});
			    				
			    				// commit the line
			    				salesOrderRecord.commitLine({
									sublistId: 'item'
								});
			    				
			    				// loop through IMSDataRecordsSearch array
			    				for (var i = 0; i < IMSDataRecordsSearch.length; i++)
			    					{
			    						if (IMSDataRecordsSearch[i] != '|')
			    							{
			    								IMSDataRecords.push(IMSDataRecordsSearch[i]); // Push to IMSDataRecords array
			    							}
			    					}
							}

						// continue processing results
						return true;
	    			
	    			});
	    			
	    			log.debug({
	    				title: "Trying to save sales order",
	    				details: ''
	    			});
	    			
	    			// submit the sales order record
					salesOrderRecord.save({
			    		enableSourcing: false,
					    ignoreMandatoryFields: true
			    	});
					
					log.audit({
						title: 'Sales Order Updated',
						details: 'Sales Order ID: ' + salesOrderID
					});
					
					// process IMS data records
					for (var i = 0; i < IMSDataRecords.length; i++)
						{
							// create a key/value pair
							context.write({
								key: IMSDataRecords[i],
								value: salesOrderID
							});
						}
	    		}
	    	catch(e)
	    		{
	    			log.error({
	    				title: 'Error Updating Sales Order',
	    				details: 'Sales Order ID: ' + salesOrderID + '<br>Error: ' + e
	    			});
	    			
	    			// process IMS data records
					for (var i = 0; i < IMSDataRecords.length; i++)
						{
							// create a key/value pair
							context.write({
								key: IMSDataRecords[i],
								value: e
							});
						}
	    		}
    	}
    
    // ====================================
    // FUNCTION TO CREATE A NEW SALES ORDER
    // ====================================
    function createSalesOrder(context, contractRecordID)
    	{
	    	// declare and initialize variables
    		var IMSDataRecords = new Array();
    	
    		// lookup fields on the contract record
	    	var contractRecordLookup = search.lookupFields({
	    		type: 'customrecord_bbs_contract',
	    		id: contractRecordID,
	    		columns: ['custrecord_bbs_contract_customer', 'custrecord_bbs_contract_currency', 'custrecord_bbs_contract_location']
	    	});
	    	
	    	// get the customer, currency and location from the contractRecordLookup object
	    	var customer = parseInt(contractRecordLookup.custrecord_bbs_contract_customer[0].value);
	    	var currency = parseInt(contractRecordLookup.custrecord_bbs_contract_currency[0].value);
	    	var location = parseInt(contractRecordLookup.custrecord_bbs_contract_location[0].value);
	    	
	    	try
	    		{
	    			// create a new sales order
	    			var salesOrderRecord = record.transform({
					    fromType: record.Type.CUSTOMER,
					    fromId: customer,
					    toType: record.Type.SALES_ORDER,
					    isDynamic: true
					});
	    			
	    			// set header fields on the sales order
	    			salesOrderRecord.setValue({
	    				fieldId: 'currency',
	    				value: currency
	    			});
	    			
	    			salesOrderRecord.setValue({
	    				fieldId: 'location',
	    				value: location
	    			});
	    			
	    			salesOrderRecord.setValue({
	    				fieldId: 'custbody_bbs_contract_record',
	    				value: contractRecordID
	    			});
	    			
	    			// create search to find IMS data to be added to the sales order
	    			var IMSDataSearch = search.create({
	    				type: 'customrecord_bbs_ims_usage_data',
	    				
	    				filters: [{
	    					name: 'isinactive',
	    					operator: 'is',
	    					values: ['F']
	    				},
	    						{
	    					name: 'custrecord_bbs_ims_usage_data_processed',
	    					operator: 'is',
	    					values: ['F']
	    	    		},
	    	    				{
	    	    			name: 'custrecord_bbs_ims_usage_data_errors',
	    	    			operator: 'isempty',
	    	    		},
	    						{
	    	    			name: 'custrecord_bbs_ims_usage_data_contract',
	    	    			operator: 'anyof',
	    	    			values: [contractRecordID]
	    	    		},
	    	    				{
	    	    			name: 'custrecord_bbs_ims_usage_data_item_rec',
	    	    			operator: 'noneof',
	    	    			values: ['@NONE@']
	    	    		}],
	    	    		
	    	    		columns: [{
	    	    			name: 'custrecord_bbs_ims_usage_data_item_rec',
	    	    			summary: 'GROUP'
	    	    		},
	    	    				{
	    	    			name: 'custrecord_bbs_ims_usage_data_quantity',
	    	    			summary: 'SUM'
	    	    		},
	    	    				{
	    	    			name: 'custrecord_bbs_ims_usage_data_rate',
	    	    			summary: 'GROUP'
	    	    		},
	    	    				{
	    	    			name: 'custrecord_bbs_ims_usage_data_date',
	    	    			summary: 'MAX'
	    	    		},
	    	    				{
	    	    			name: 'formulatext',
	    	    			summary: 'MAX',
	    	    			formula: "REPLACE(NS_CONCAT({internalid}), ',','|')"
	    	    		}],
	    			
	    			});
	    			
	    			// run search and process results
	    			IMSDataSearch.run().each(function(result){
	    				
	    				// declare and initialize variables
	    				var itemAdded = false;
	    				
	    				// retrieve search results
	    				var IMSDataRecordsSearch = result.getValue({
							name: 'formulatext',
							summary: 'MAX'
						});
	    				
	    				IMSDataRecordsSearch.split('|'); // split on '|' as needs to be an array
	    				
	    				var item = result.getValue({
							name: 'custrecord_bbs_ims_usage_data_item_rec',
							summary: 'GROUP'
						});
						
						var quantity = result.getValue({
							name: 'custrecord_bbs_ims_usage_data_quantity',
							summary: 'SUM'
						});
						
						var rate = result.getValue({
							name: 'custrecord_bbs_ims_usage_data_rate',
							summary: 'GROUP'
						});
						
						var searchDate = result.getValue({
							name: 'custrecord_bbs_ims_usage_data_date',
							summary: 'MAX'
						});
						
						// format searchDate as a date object
						searchDate = format.parse({
							type: format.Type.DATE,
							value: searchDate
						});
						
						try
							{
			    				// select a new line on the sales order
			    				salesOrderRecord.selectNewLine({
									sublistId: 'item'
								});
			    				
			    				// set fields on the new line
			    				salesOrderRecord.setCurrentSublistValue({
			    					sublistId: 'item',
			    					fieldId: 'item',
			    					value: item
			    				});
			    				
			    				// set itemAdded to true
			    				itemAdded = true;
							}
						catch(e)
							{
								// loop through IMSDataRecordsSearch array
			    				for (var i = 0; i < IMSDataRecordsSearch.length; i++)
			    					{
			    						if (IMSDataRecordsSearch[i] != '|')
			    							{
			    								// create a key/value pair
				    							context.write({
				    								key: IMSDataRecordsSearch[i],
				    								value: e
				    							});
			    							}
			    					}
							}
					
						// check if itemAdded is true
						if (itemAdded == true)
							{
			    				
			    				salesOrderRecord.setCurrentSublistValue({
			    					sublistId: 'item',
			    					fieldId: 'quantity',
			    					value: quantity
			    				});
			    				
			    				salesOrderRecord.setCurrentSublistValue({
			    					sublistId: 'item',
			    					fieldId: 'rate',
			    					value: rate
			    				});
			    				
			    				salesOrderRecord.setCurrentSublistValue({
			    					sublistId: 'item',
			    					fieldId: 'custcol_bbs_contract_record',
			    					value: contractRecordID
			    				});
			    				
			    				salesOrderRecord.setCurrentSublistValue({
			    					sublistId: 'item',
			    					fieldId: 'custcol_bbs_so_search_date',
			    					value: searchDate
			    				});
			    				
			    				// commit the line
			    				salesOrderRecord.commitLine({
									sublistId: 'item'
								});
			    				
			    				// loop through IMSDataRecordsSearch array
			    				for (var i = 0; i < IMSDataRecordsSearch.length; i++)
			    					{
			    						if (IMSDataRecordsSearch[i] != '|')
			    							{
			    								IMSDataRecords.push(IMSDataRecordsSearch[i]); // Push to IMSDataRecords array
			    							}
			    					}
							}

						// continue processing results
						return true;
	    			
	    			});
	    			
	    			// submit the sales order record
					var salesOrderID = salesOrderRecord.save({
			    		enableSourcing: false,
					    ignoreMandatoryFields: true
			    	});
					
					log.audit({
						title: 'Sales Order Created',
						details: 'Sales Order ID: ' + salesOrderID
					});
					
					// process IMS data records
					for (var i = 0; i < IMSDataRecords.length; i++)
						{
							// create a key/value pair
							context.write({
								key: IMSDataRecords[i],
								value: salesOrderID
							});
						}
	    		}	
	    	catch(e)
	    		{
	    			log.error({
	    				title: 'Error Creating Sales Order',
	    				details: e
	    			});
	    			
	    			// process IMS data records
					for (var i = 0; i < IMSDataRecords.length; i++)
						{
							// create a key/value pair
							context.write({
								key: IMSDataRecords[i],
								value: e
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
