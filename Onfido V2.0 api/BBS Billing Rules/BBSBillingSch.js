/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/format'],
/**
 * @param {search} search
 */
function(runtime, search, record, format) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	// initiate variables
    	var recordID;
    	var billingType;
    	var billingTypeFunction;
    	var contractRecord;
    	
    	// retrieve script parameters
    	var currentScript = runtime.getCurrentScript();
    	
    	// adjustmentItem is a global variable so it can be accessed throughout the script
    	adjustmentItem = currentScript.getParameter({
	    	name: 'custscript_bbs_min_usage_adj_item'
	    });
    	
    	// run search to find sales orders to be billed
    	var soSearch = search.create({
    		type: search.Type.SALES_ORDER,
			
			columns: [{
				name: 'internalid'
			},
					{
				name: 'custrecord_bbs_contract_billing_type',
				join: 'custbody_bbs_contract_record'
			},
					{
				name: 'custbody_bbs_contract_record'
			}],
			
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
    			name: 'custrecord_bbs_contract_exc_auto_bill',
    			join: 'custbody_bbs_contract_record',
    			operator: 'is',
    			values: ['F']
    		}],
		});
    	
    	// process search results
    	soSearch.run().each(function(result) {
			
			// get the internal ID of the item from the search results
			recordID = result.getValue({
				name: 'internalid'
			});
			
			// get the billing type from the search results
			billingType = result.getValue({
				name: 'custrecord_bbs_contract_billing_type',
				join: 'custbody_bbs_contract_record'
			});
			
			//============================================================================================
			// CHECK THE BILLING TYPE AND CALL THE RELEVANT FUNCTION FOR PRE-PROCESSING OF THE SALES ORDER
			//============================================================================================
			
			// AMBMA billing type
			if (billingType == 6)
				{
					// call the AMBMA function
					AMBMA();
				}
			// AMP billing type
			else if (billingType == 4)
				{
					// call the AMP function
					AMP();
				}
			// PAYG billing type
			else if (billingType == 1)
				{
					// call the PAYG function
					PAYG();
				}
			// QMP billing type
			else if (billingType == 3)
				{
					// call the QMP function
					QMP();
				}
			// QUR billing type
			else if (billingType == 5)
				{
					// call the QUR function
					QUR();
				}
			// UIOLI billing type
			else if (billingType == 2)
				{
					// call the UIOLI function. Pass in the internal ID of the sales order record
					UIOLI(recordID);
				}		
			
			// call function to transform the sales order to an invoice. Pass in ID of sales order. ID of created invoice record will be returned
			invoiceID = createInvoice(recordID);
			
			// call function to update period detail records (to tick the Usage Invoice Issued checkbox). Pass in ID of sales order.
			updatePeriodDetail(recordID);
			
			// continue processing additional records
			return true;
		
    	});

    }
    
    //=========================================
	// SEPARATE FUNCTIONS FOR EACH BILLING TYPE
	//=========================================
    
    function AMBMA()
	    {
    		
	    }
    
    function AMP()
    	{
	    	
    	}
    
    function PAYG()
	    {
	    	
	    }
    
    function QMP()
    	{
	    	
    	}
    
    function QUR()
	    {
	    	
	    }
    
    function UIOLI(recordID)
    	{
    		try
    			{
		    		// load the sales order record
		    		var soRecord = record.load({
		    			type: record.Type.SALES_ORDER,
		    			id: recordID,
		    			isDynamic: true
		    		});
		    		
		    		// get the ID of the contract record from the sales order record
		    		var contractRecord = soRecord.getValue({
		    			fieldId: 'custbody_bbs_contract_record'
		    		});
		    	
		    		// get the minimum usage from the contract record
		    		var contractRecordLookup = search.lookupFields({
		    			type: 'customrecord_bbs_contract',
		    			id: contractRecord,
		    			columns: ['custrecord_bbs_contract_mon_min_use']
		    		});
		    		
		    		var minimumUsage = contractRecordLookup.custrecord_bbs_contract_mon_min_use;
		    		
		    		// get the total usage from the soRecord
		    		var totalUsage = soRecord.getValue({
		    			fieldId: 'subtotal'
		    		});
		    		
		    		// check if the totalUsage is less than the minimumUsage
		    		if (totalUsage < minimumUsage)
			    		{
							// calculate the difference by subtracting the totalUsage from the minimumUsage
							var difference = minimumUsage - totalUsage;
							
							// select a new line on the sales order record
							soRecord.selectNewLine({
								sublistId: 'item'
							});
							
							// set fields on the new line
							soRecord.setCurrentSublistValue({
					            sublistId: 'item',
					            fieldId: 'item',
					            value: adjustmentItem
							});
							
							soRecord.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'quantity',
								value: 1
							});
							
							soRecord.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'rate',
								value: difference
							});
							
							// commit the new line
							soRecord.commitLine({
								sublistId: 'item'
							});
							
							// submit the sales order record
							soRecord.save();
							
							log.audit({
								title: 'New line added to sales order record',
								details: recordID
							});
						}
    			}
    		catch(error)
	    		{
	    			log.error({
	    				title: 'Error updating record ' + recordID,
	    				details: error
	    			});
	    		}
    	}
    
    //====================================================
	// FUNCTION TO TRANSFORM THE SALES ORDER TO AN INVOICE
	//====================================================
    		
    function createInvoice(recordID)
    	{
    		try
    			{
		    		// transform the sales order to an invoice
		    		var invoiceRecord = record.transform({ 
		    			   fromType: record.Type.SALES_ORDER, 
		    			   fromId: recordID, 
		    			   toType: record.Type.INVOICE,
		    			   isDynamic: true
		    		});
		
		    		// save the new invoice record
		    		var invoiceID = invoiceRecord.save();
    		
		    		log.audit({
						title: 'Invoice Created',
						details: 'Invoice ID: ' + invoiceID + ' | Sales Order ID: ' + recordID
					});
    			}
    		catch(error)
	    		{
	    			log.error({
	    				title: 'Error creating invoice for sales order ' + recordID,
	    				details: error
	    			});
	    		}
    	}
    
    //===============================================================
	// FUNCTION TO UPDATE FIELDS ON THE RELEVANT PERIOD DETAIL RECORD	
	//===============================================================
    
    function updatePeriodDetail(recordID)
	    {
	    	// declare variables
	    	var itemID;
	    	var searchItem;

	    	// load the sales order record
    		var soRecord = record.load({
    			type: record.Type.SALES_ORDER,
    			id: recordID
    		});
    		
    		// get the ID of the associated contract record
        	var contractRecord = soRecord.getValue({
        		fieldId: 'custbody_bbs_contract_record'
        	});
    		
    		// get the transaction date
        	var tranDate = soRecord.getValue({
        		fieldId: 'trandate'
        	});
        	
        	// create a new Date object and set it's value to be the tranDate
        	tranDate = new Date(tranDate);
        	
        	// create a new Date object
        	var startDate = new Date();
        	
        	// set the date of the StartDate object
        	startDate.setMonth(tranDate.getMonth());
        	startDate.setDate(1);
        	startDate.setFullYear(tranDate.getFullYear());
        	
        	// format startDate so it can be used as a search filter
        	startDate = format.format({
    				value: startDate,
    				type: format.Type.DATE
    		});
        	
        	// create a new Date object
        	var endDate = new Date();
        	
        	// set the date of the endDate object
        	endDate.setMonth(tranDate.getMonth()+1);
        	endDate.setDate(0);
        	endDate.setFullYear(tranDate.getFullYear());
        	
        	// format endDate so it can be used as a search filter
        	endDate = format.format({
    				value: endDate,
    				type: format.Type.DATE
    		});
        	
        	// get count of item lines
        	var lineCount = soRecord.getLineCount({
        		sublistId: 'item'
        	});
        	
        	// run search to find contract period detail records to be updated
        	var periodDetailSearch = search.create({
    			type: 'customrecord_bbs_contract_period',
    			
    			columns: [{
    				name: 'internalid'
    			},
    					{
    				name: 'custrecord_bbs_contract_period_product'
    			}],
    			
    			filters: [{
    				name: 'custrecord_bbs_contract_period_contract',
    				operator: 'anyof',
    				values: [contractRecord]
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
        	
        	// process search results
    		periodDetailSearch.run().each(function(result) {
    			
    			// get the internal ID of the item from the search results
    			searchItem = result.getValue({
    				name: 'custrecord_bbs_contract_period_product'
    			});
    			
    			// loop through line count
    	    	for (var i = 0; i < lineCount; i++)
    	    		{
    		    		// get the internal ID of the item for the line
    	    			itemID = soRecord.getSublistValue({
    	    				sublistId: 'item',
    	    				fieldId: 'item',
    	    				line: i
    	    			});
    	    			
    	    			// check if the itemID and searchItem variables are the same
    	    			if (itemID == searchItem)
    	    				{
	    	    				// get the record ID from the search results
			    	    		recordID = result.getValue({
			    	    			name: 'internalid'
			    	    		});
    	    				
    	    					try
    	    						{
	    	    						// update fields on the period detail record
	        		        			record.submitFields({
	        		        				type: 'customrecord_bbs_contract_period',
	        		        				id: recordID,
	        		        				values: {
	        		        					custrecord_bbs_contract_period_usage_inv: true
	        		        				}
	        		        			});
	        		        			
	        		        			log.audit({
	        		        				title: 'Period Detail Record Updated',
	        		        				details: recordID
	        		        			});
    	    						}
    	    					
    	    					catch(e)
	    	    					{
	    	    						log.error({
	    	    							title: 'An error occured updating Period Detail record ' + recordID,
	    	    							details: 'Error: ' + e
	    	    						});
	    	    					}
    		        			
    		        			// break the loop
    		        			break;		    	    		
    	    				}
    	    		}
    	    	
    	    	// continue processing search results
    	    	return true;
    		});
    		
	    }

    return {
        execute: execute
    };
    
});
