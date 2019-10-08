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
    	var contractRecord;
    	var mgmtFee;
    	var customer;
    	var mgmtFeeAmt;
    	var currency;
    	var netAmt;
    	var monthlyMinimum;
    	
    	// retrieve script parameters
    	var currentScript = runtime.getCurrentScript();
    	
    	// script parameters are global variables so can be accessed throughout the script
    	adjustmentItem = currentScript.getParameter({
	    	name: 'custscript_bbs_min_usage_adj_item'
	    });
    	
    	mgmtFeeItem = currentScript.getParameter({
    		name: 'custscript_bbs_monthly_mgtmt_fee_item'
    	});
    	
    	qmpCreditItem = currentScript.getParameter({
    		name: 'custscript_bbs_credit_qmp_item'
    	});
    	
    	ampCreditItem = currentScript.getParameter({
    		name: 'custscript_bbs_credit_amp_item'
    	});
    	
    	qmpItem = currentScript.getParameter({
    		name: 'custscript_bbs_quarterly_min_prepay_item'
    	});
    	
    	// declare new date object. Global variable so can be accessed throughout the script
    	invoiceDate = new Date();
    	invoiceDate.setDate(0); // set date to be the last day of the previous month
    	
    	// run search to find sales orders to be billed
    	var soSearch = search.create({
    		type: search.Type.SALES_ORDER,
			
			columns: [{
				name: 'internalid'
			},
					{
				name: 'entity',
			},
					{
				name: 'custbody_bbs_contract_record'
			},
					{
				name: 'custrecord_bbs_contract_billing_type',
				join: 'custbody_bbs_contract_record'
			},
					{
				name: 'custrecord_bbs_contract_mgmt_fee',
				join: 'custbody_bbs_contract_record'
			},
					{
				name: 'custrecord_bbs_contract_mgmt_fee_amt',
				join: 'custbody_bbs_contract_record'
			},
				{
				name: 'custrecord_bbs_contract_currency',
				join: 'custbody_bbs_contract_record'
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
			
			// get the internal ID of the contract record from the search results
			contractRecord = result.getValue({
				name: 'custbody_bbs_contract_record'
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
					// call the AMBMA function. Pass in the internal ID of the sales order record
					AMBMA(recordID);
				}
			// AMP billing type
			else if (billingType == 4)
				{
					// call the AMP function. Pass in the internal ID of the sales order record
					AMP(recordID);
				}
			// PAYG billing type
			else if (billingType == 1)
				{
					// call the PAYG function. Pass in the internal ID of the sales order record
					PAYG(recordID);
				}
			// QMP billing type
			else if (billingType == 3)
				{
					// call the QMP function. Pass in the internal ID of the sales order record
					QMP(recordID);
				}
			// QUR billing type
			else if (billingType == 5)
				{
					// call the QUR function. Pass in the internal ID of the sales order record
					QUR(recordID);
				}
			// UIOLI billing type
			else if (billingType == 2)
				{
					// call the UIOLI function. Pass in the internal ID of the sales order record
					UIOLI(recordID);
				}
			
			// get the value of the management fee checkbox from the search results
			mgmtFee = result.getValue({
				name: 'custrecord_bbs_contract_mgmt_fee',
				join: 'custbody_bbs_contract_record'
			});
			
			// if the mgmtFee variable returns 1 (Mgmt Fee is Yes)
			if (mgmtFee == 1)
				{
					// get the billing level from the search results
					billingLevel = result.getValue({
						name: 'custrecord_bbs_contract_billing_level',
						join: 'custbody_bbs_contract_record'
					});
					
					// get the customer from the search results
					customer = result.getValue({
						name: 'entity'
					});
					
					// get the management fee amount from the search results
					mgmtFeeAmt = result.getValue({
						name: 'custrecord_bbs_contract_mgmt_fee_amt',
						join: 'custbody_bbs_contract_record'
					});
					
					// get the currency from the search results
					currency = result.getValue({
						name: 'custrecord_bbs_contract_currency',
						join: 'custbody_bbs_contract_record'
					});
				
					// call function to create invoice for monthly management fee. Pass in ID of contract record, customer, mgmtFeeAmt, currency
					createMgmtFeeInvoice(contractRecord, customer, mgmtFeeAmt, currency);
				}
			
			// call function to update period detail records (to tick the Usage Invoice Issued checkbox). Pass in ID of sales order.
			updatePeriodDetail(recordID);
			
			// continue processing additional records
			return true;
		
    	});

    }
    
    //=========================================
	// SEPARATE FUNCTIONS FOR EACH BILLING TYPE
	//=========================================
    
    function AMBMA(recordID)
	    {
    		// set the billingType variable to AMBMA
    		billingType = 'AMBMA';
    		
	    }
    
    function AMP(recordID)
    	{
    		// set the billingType variable to AMP
			billingType = 'AMP';
    	
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
		    			columns: ['custrecord_bbs_contract_min_ann_use']
		    		});
    		
		    		var minimumUsage = contractRecordLookup.custrecord_bbs_contract_min_ann_use;
    		
		    		// get the total usage from the soRecord
		    		var totalUsage = soRecord.getValue({
		    			fieldId: 'subtotal'
		    		});
    		
		    		// check if the totalUsage is less than the minimumUsage
		    		if (totalUsage <= minimumUsage)
			    		{
		    				// get count of item lines
		    				var lineCount = soRecord.getLineCount({
		    					sublistId: 'item'
		    				});
		    				
		    				// loop through line count
		    				for (var x = 0; x < lineCount; x++)
		    					{
		    						// select the line
		    						soRecord.selectLine({
		    							sublistId: 'item',
		    							line: x
		    						});
		    						
		    						// set the 'isclosed' flag to true
		    						soRecord.setCurrentSublistValue({
		    							sublistId: 'item',
		    							fieldId: 'isclosed',
		    							value: true
		    						});
		    						
		    						// commit the new line
									soRecord.commitLine({
										sublistId: 'item'
									});
		    					}
		    				
		    				// submit the sales order record
		    				soRecord.save();
		    				
		    				log.audit({
		    					title: 'Sales Order Closed',
		    					details: recordID
		    				});
			    		}
		    		// if the totalUsage is greater than the minimumUsage
		    		else
		    			{
		    				// select a new line on the sales order record
		    				soRecord.selectNewLine({
		    					sublistId: 'item'
		    				});
					
		    				// set fields on the new line
		    				soRecord.setCurrentSublistValue({
					            sublistId: 'item',
					            fieldId: 'item',
					            value: ampCreditItem
		    				});
					
							soRecord.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'quantity',
								value: 1
							});
					
							soRecord.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'rate',
								value: (minimumUsage * -1) // multiply the minimumUsage by -1 to convert to a negative number
							});
							
							soRecord.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_bbs_contract_record',
								value: contractRecord
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
							
							// call function to transform the sales order to an invoice. Pass in ID of sales order.
							createInvoice(recordID);					
		    			}
				}
			catch(error)
				{
					log.error({
						title: 'Error Updating Sales Order ' + recordID,
						details: error
					});
				}
    	}
    
    function PAYG(recordID)
	    {
    		// call function to transform the sales order to an invoice. Pass in ID of sales order
			createInvoice(recordID);
	    }
    
    function QMP(recordID)
    	{
    		// set the billingType variable to QMP
			billingType = 'QMP';
    	
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
		    			columns: ['custrecord_bbs_contract_qu_min_use']
		    		});
		    		
		    		var minimumUsage = contractRecordLookup.custrecord_bbs_contract_qu_min_use;
		    		
		    		// get the total usage from the soRecord
		    		var totalUsage = soRecord.getValue({
		    			fieldId: 'subtotal'
		    		});
		    		
		    		// check if the totalUsage is less than the minimumUsage
		    		if (totalUsage <= minimumUsage)
			    		{
		    				// get count of item lines
		    				var lineCount = soRecord.getLineCount({
		    					sublistId: 'item'
		    				});
		    				
		    				// loop through line count
		    				for (var x = 0; x < lineCount; x++)
		    					{
		    						// select the line
		    						soRecord.selectLine({
		    							sublistId: 'item',
		    							line: x
		    						});
		    						
		    						// set the 'isclosed' flag to true
		    						soRecord.setCurrentSublistValue({
		    							sublistId: 'item',
		    							fieldId: 'isclosed',
		    							value: true
		    						});
		    						
		    						// commit the new line
									soRecord.commitLine({
										sublistId: 'item'
									});
		    					}
		    				
		    				// submit the sales order record
		    				soRecord.save();
		    				
		    				log.audit({
		    					title: 'Sales Order Closed',
		    					details: recordID
		    				});
			    		}
		    		// if the totalUsage is greater than the minimumUsage
		    		else
		    			{
		    				// select a new line on the sales order record
		    				soRecord.selectNewLine({
		    					sublistId: 'item'
		    				});
					
		    				// set fields on the new line
		    				soRecord.setCurrentSublistValue({
					            sublistId: 'item',
					            fieldId: 'item',
					            value: qmpCreditItem
		    				});
					
							soRecord.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'quantity',
								value: 1
							});
					
							soRecord.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'rate',
								value: (minimumUsage * -1) // multiply the minimumUsage by -1 to convert to a negative number
							});
							
							soRecord.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_bbs_contract_record',
								value: contractRecord
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
							
							// call function to transform the sales order to an invoice. Pass in ID of sales order.
							createInvoice(recordID);					
		    			}
				}
	    	catch(error)
	    		{
	    			log.error({
	    				title: 'Error Updating Sales Order ' + recordID,
	    				details: error
	    			});
	    		}
	    	
	    	// call function to create a Revenue Recognition Journal. Pass in ID of sales order and billingType variable
    		createRevRecJournal(recordID, billingType);
    	}
    
    function QUR(recordID)
	    {
    		// set the billingType variable to QUR
			billingType = 'QUR';
    	
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
		    			columns: ['custrecord_bbs_contract_qu_min_use']
		    		});
    		
		    		var minimumUsage = contractRecordLookup.custrecord_bbs_contract_qu_min_use;
    		
		    		// get the total usage from the soRecord
		    		var totalUsage = soRecord.getValue({
		    			fieldId: 'subtotal'
		    		});
    		
		    		// check if the totalUsage is less than the minimumUsage
		    		if (totalUsage <= minimumUsage)
			    		{
			    			// lookup the customer and currency fields on the soRecord
		    				var customer = soRecord.getValue({
		    					fieldId: 'entity'
		    				});
		    				
		    				var currency = soRecord.getValue({
		    					fieldId: 'currency'
		    				});
		    			
		    				// get count of item lines
		    				var lineCount = soRecord.getLineCount({
		    					sublistId: 'item'
		    				});
		    				
		    				// loop through line count
		    				for (var x = 0; x < lineCount; x++)
		    					{
		    						// select the line
		    						soRecord.selectLine({
		    							sublistId: 'item',
		    							line: x
		    						});
		    						
		    						// set the 'isclosed' flag to true
		    						soRecord.setCurrentSublistValue({
		    							sublistId: 'item',
		    							fieldId: 'isclosed',
		    							value: true
		    						});
		    						
		    						// commit the new line
									soRecord.commitLine({
										sublistId: 'item'
									});
		    					}
		    				
		    				// submit the sales order record
		    				soRecord.save();
		    				
		    				log.audit({
		    					title: 'Sales Order Closed',
		    					details: recordID
		    				});
		    				
		    				// call function to create quarterly pre-payment invoice. Pass in contractRecord, customer, minimumUsage and currency
		    				createQuarterlyInvoice(contractRecord, customer, minimumUsage, currency);				
			    		}
		    		// if the totalUsage is greater than the minimumUsage
		    		else
		    			{
		    				// select a new line on the sales order record
		    				soRecord.selectNewLine({
		    					sublistId: 'item'
		    				});
					
		    				// set fields on the new line
		    				soRecord.setCurrentSublistValue({
					            sublistId: 'item',
					            fieldId: 'item',
					            value: qmpCreditItem
		    				});
					
							soRecord.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'quantity',
								value: 1
							});
					
							soRecord.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'rate',
								value: (minimumUsage * -1) // multiply the minimumUsage by -1 to convert to a negative number
							});
							
							soRecord.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_bbs_contract_record',
								value: contractRecord
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
							
							// call function to transform the sales order to an invoice. Pass in ID of sales order.
							createInvoice(recordID);					
		    			}
				}
			catch(error)
				{
					log.error({
						title: 'Error Updating Sales Order ' + recordID,
						details: error
					});
				}
	    	
	    }
    
    function UIOLI(recordID)
    	{
    		// set the billingType variable to UIOLI
			billingType = 'UIOLI';
    	
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
							
							soRecord.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'custcol_bbs_contract_record',
								value: contractRecord
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
    		
    		// call function to transform the sales order to an invoice. Pass in ID of sales order
			createInvoice(recordID);
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
		    		
		    		// set the tranDate on the invoiceRecord using the invoiceDate variable
		    		invoiceRecord.setValue({
		    			fieldId: 'trandate',
		    			value: invoiceDate
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
    
    //===================================================================
	// FUNCTION TO CREATE A STANDALONE INVOICE FOR MONTHLY MANAGEMENT FEE
	//===================================================================
    
    function createMgmtFeeInvoice(contractRecord, customer, mgmtFeeAmt, currency)
    	{
    		try
    			{
    				// create a new invoice record
    				var invoice = record.create({
    					type: record.Type.INVOICE,
    					isDynamic: true
    				});
    				
    				// set header fields on the invoice record
		    		invoice.setValue({
		    			fieldId: 'trandate',
		    			value: invoiceDate
		    		});
    				
    				invoice.setValue({
	    				fieldId: 'entity',
	    				value: customer
	    			});
	    			
	    			invoice.setValue({
	    				fieldId: 'custbodybbs_monthly_mgmt_fee_invoice',
	    				value: true
	    			});
	    			
	    			invoice.setValue({
	    				fieldId: 'custbody_bbs_contract_record',
	    				value: contractRecord
	    			});
	    			
	    			invoice.setValue({
	    				fieldId: 'currency',
	    				value: currency
	    			});
	    			
	    			// add a new line to the invoice
	    			invoice.selectNewLine({
	    				sublistId: 'item'
	    			});
	    			
	    			// set fields on the new line
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'item',
	    				value: mgmtFeeItem
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'quantity',
	    				value: 1
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'rate',
	    				value: mgmtFeeAmt
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'custcol_bbs_contract_record',
	    				value: contractRecord
	    			});
	    			
	    			// commit the line
	    			invoice.commitLine({
						sublistId: 'item'
					});
	    			
	    			// submit the invoice record
	    			var invoiceID = invoice.save();
	    			
	    			log.audit({
	    				title: 'Management Fee Invoice Created',
	    				details: 'Invoice ID: ' + invoiceID + ' | Contract ID: ' + contractRecord
	    			});   				
    			}
    		catch(error)
    			{
    				log.error({
    					title: 'Error Creating Mgmt Fee Invoice for Contract ID: ' + contractRecord,
    					details: error
    				});
    			}
    	}
    
    //=================================================================
	// FUNCTION TO CREATE A STANDALONE INVOICE FOR QUARTERLY PREPAYMENT
	//=================================================================
    
    function createQuarterlyInvoice(contractRecord, customer, minimumUsage, currency)
		{
			try
				{
					// create a new invoice record
					var invoice = record.create({
						type: record.Type.INVOICE,
						isDynamic: true
					});
					
					// set header fields on the invoice record
					invoiceRecord.setValue({
		    			fieldId: 'trandate',
		    			value: invoiceDate
		    		});
					
	    			invoice.setValue({
	    				fieldId: 'entity',
	    				value: customer
	    			});
	    			
	    			invoice.setValue({
	    				fieldId: 'custbody_bbs_contract_record',
	    				value: contractRecord
	    			});
	    			
	    			invoice.setValue({
	    				fieldId: 'currency',
	    				value: currency
	    			});
	    			
	    			// add a new line to the invoice
	    			invoice.selectNewLine({
	    				sublistId: 'item'
	    			});
	    			
	    			// set fields on the new line
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'item',
	    				value: qmpItem
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'quantity',
	    				value: 1
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'rate',
	    				value: minimumUsage
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'custcol_bbs_contract_record',
	    				value: contractRecord
	    			});
	    			
	    			// commit the line
	    			invoice.commitLine({
						sublistId: 'item'
					});
	    			
	    			// submit the invoice record
	    			var invoiceID = invoice.save();
	    			
	    			log.audit({
	    				title: 'Quarterly Minimum Prepayment Invoice Created',
	    				details: 'Invoice ID: ' + invoiceID + ' | Contract ID: ' + contractRecord
	    			});   				
				}
			catch(error)
				{
					log.error({
						title: 'Error Creating Quarterly Minimum Prepayment Invoice for Contract ID: ' + contractRecord,
						details: error
					});
				}
		}
    
    //=================================================
	// FUNCTION TO CREATE A REVENUE RECOGNITION JOURNAL
	//=================================================
    
    function createRevRecJournal(recordID, billingType)
	    {
	    	// declare and initialize variables
    		var itemID;
    		var itemLookup;
    		var postingAccount;
    		var rate;
    		var quantity;
    		var lineTotal;
    		
    		// format the invoiceDate object to a date (DD/MM/YYYY)
    		var journalDate = format.format({
    			type: format.Type.DATE,
    			value: invoiceDate
    		});
    	
    		// load the sales order record
    		var soRecord = record.load({
    			type: record.Type.SALES_ORDER,
    			id: recordID
    		});
    		
    		// get field values from the soRecord
    		var customer = soRecord.getValue({
    			fieldId: 'entity'
    		});
    		
    		var contractRecord = soRecord.getValue({
    			fieldId: 'custbody_bbs_contract_record'
    		});
    		
    		var subtotal = soRecord.getValue({
    			fieldId: 'subtotal'
    		});
    		
    		// get line count from the soRecord
    		var lineCount = soRecord.getLineCount({
    			sublistId: 'item'
    		});
    		
    		// lookup fields on the customer record
    		var customerLookup = search.lookupFields({
    			type: search.Type.CUSTOMER,
    			id: customer,
    			columns: ['subsidiary', 'custentity_bbs_location']
    		});
    		
    		// get the subsidiary and location from the customerLookup
    		var subsidiary = customerLookup.subsidiary[0].value;
    		var location = customerLookup.custentity_bbs_location[0].value;
    		
    		// lookup fields on the subsidiary record
    		var subsidiaryLookup = search.lookupFields({
    			type: search.Type.SUBSIDIARY,
    			id: subsidiary,
    			columns: ['currency']
    		});
    		
    		// get the currency from the subsidiaryLookup
    		var currency = subsidiaryLookup.currency[0].value;
    	
    		// create a new journal record
    		var journalRecord = record.create({
    			type: record.Type.JOURNAL_ENTRY,
    			isDynamic: true
    		});
    		
    		// set header fields on the journal record
    		journalRecord.setValue({
    			fieldId: 'trandate',
    			value: invoiceDate
    		});
    		
    		journalRecord.setValue({
    			fieldId: 'memo',
    			value: billingType + ' + ' + journalDate
    		});
    		
    		journalRecord.setValue({
    			fieldId: 'custbody_bbs_contract_record',
    			value: contractRecord
    		});
    		
    		journalRecord.setValue({
    			fieldId: 'custbody_bbs_rev_rec_journal',
    			value: true
    		});
    		
    		journalRecord.setValue({
    			fieldId: 'subsidiary',
    			value: subsidiary
    		});
    		
    		journalRecord.setValue({
    			fieldId: 'location',
    			value: location
    		});
    		
    		journalRecord.setValue({
    			fieldId: 'currency',
    			value: currency
    		});
    		
    		// select a new line on the journal record
    		journalRecord.selectNewLine({
    			sublistId: 'line'
    		});
    		
    		// set fields on the new line
    		journalRecord.setCurrentSublistValue({
    			sublistId: 'line',
    			fieldId: 'account',
    			value: 538 // 538 = 1210010	Deferred Income (Upfront)
    		});
    		
    		journalRecord.setCurrentSublistValue({
    			sublistId: 'line',
    			fieldId: 'custcol_bbs_journal_customer',
    			value: customer
    		});
    		
    		journalRecord.setCurrentSublistValue({
    			sublistId: 'line',
    			fieldId: 'custcol_bbs_contract_record',
    			value: contractRecord
    		});
    		
    		journalRecord.setCurrentSublistValue({
    			sublistId: 'line',
    			fieldId: 'memo',
    			value: billingType + ' + ' + journalDate
    		});
    		
    		journalRecord.setCurrentSublistValue({
    			sublistId: 'line',
    			fieldId: 'debit',
    			value: subtotal // SO subtotal
    		});
    		
    		// commit the line
    		journalRecord.commitLine({
				sublistId: 'line'
			});
    		
    		// loop through soRecord lineCount
    		for (var x = 0; x < lineCount; x++)
    			{	        		
	        		// get the internal ID of the item from the so line
	        		itemID = soRecord.getSublistValue({
	        			sublistId: 'item',
	        			fieldId: 'item',
	        			line: x
	        		});
	        		
	        		// lookup the posting account on the item record
	        		itemLookup = search.lookupFields({
	        			type: search.Type.ITEM,
	        			id: itemID,
	        			columns: ['incomeaccount']
	        		});
	        		
	        		postingAccount = itemLookup.incomeaccount[0].value;
	        		
	        		// get the quantity and rate for the line
	        		quantity = soRecord.getSublistValue({
	        			sublistId: 'item',
	        			fieldId: 'quantity',
	        			line: x
	        		});
	        		
	        		rate = soRecord.getSublistValue({
	        			sublistId: 'item',
	        			fieldId: 'rate',
	        			line: x
	        		});
	        		
	        		// multiply the quantity by the rate to calculate the lineTotal
	        		lineTotal = parseFloat(quantity * rate);
	        		
	        		// select a new line on the journal record
	        		journalRecord.selectNewLine({
	        			sublistId: 'line'
	        		});
	        		
	        		// set fields on the new journal line
	        		journalRecord.setCurrentSublistValue({
	        			sublistId: 'line',
	        			fieldId: 'account',
	        			value: postingAccount
	        		});
	        		
	        		journalRecord.setCurrentSublistValue({
	        			sublistId: 'line',
	        			fieldId: 'credit',
	        			value: lineTotal
	        		});
	        		
	        		journalRecord.setCurrentSublistValue({
	        			sublistId: 'line',
	        			fieldId: 'custcol_bbs_journal_customer',
	        			value: customer
	        		});
	        		
	        		journalRecord.setCurrentSublistValue({
	        			sublistId: 'line',
	        			fieldId: 'memo',
	        			value: billingType + ' + ' + journalDate
	        		});
	        		
	        		journalRecord.setCurrentSublistValue({
	        			sublistId: 'line',
	        			fieldId: 'custcol_bbs_contract_record',
	        			value: contractRecord
	        		});
	        		
	        		// commit the line
	        		journalRecord.commitLine({
	    				sublistId: 'line'
	    			});	
    			}
    		
    		// submit the journal record record
			var journalID = journalRecord.save();
			
			log.audit({
				title: 'Journal Created',
				details: 'Journal ID: ' + journalID + ' | Sales Order ID: ' + recordID
			});   				
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
