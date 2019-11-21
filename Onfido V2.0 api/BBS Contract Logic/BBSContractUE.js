/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/runtime', 'N/record', 'N/search', 'N/format'],
/**
 * @param {record} record
 */
function(url, runtime, record, search, format) {
	
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script
	trpAcc = currentScript.getParameter({
		name: 'custscript_bbs_trp_account'
	});
	
	trcsAcc = currentScript.getParameter({
		name: 'custscript_bbs_trcs_account'
	});
	
	setupFeeItem = currentScript.getParameter({
    	name: 'custscript_bbs_setup_fee_item'
    });
	
	qmpItem = currentScript.getParameter({
    	name: 'custscript_bbs_qmp_item'
    });
	
	ampItem = currentScript.getParameter({
    	name: 'custscript_bbs_amp_item'
    });
	
	invoiceForm = currentScript.getParameter({
		name: 'custscript_bbs_onfido_invoice_form'
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
    function contractBL(scriptContext) {
    	
    	// check if the record is being viewed
    	if (scriptContext.type == scriptContext.UserEventType.VIEW)
    		{ 	
		    	// get the currentRecord object
		    	var currentRecord = scriptContext.newRecord;
		    	
		    	// get the internal ID of the current record
    			var recordID = scriptContext.newRecord.id;
		    	
		    	// get the value of the 'status' field from the record
		    	var status = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_contract_status'
		    	});
		    	
		    	// if statement to check that the status variable returns 1 (Approved)
		    	if (status == 1)
		    		{	    		
		    			// define suiteletURL variable
			    		var suiteletURL = url.resolveScript({
			    			scriptId: 'customscript_bbs_end_contract_sl',
			    			deploymentId: 'customdeploy_bbs_end_contract_sl',
			    		});
			    		
			    		// add parameters to suiteletURL variable
			    		suiteletURL += '&record=' + recordID;
		    		
		    			// add button to the form
			    		scriptContext.form.addButton({
			    			id: 'custpage_end_contract_early',
			    			label: 'End Contract Early',
			    			functionName: "window.open('" + suiteletURL + "','_self');" // call Suitelet when button is clicked. This will open in the current window
			    		});
		    		}
		    	// if the status variable returns 2 (Pending Approval)
		    	else if (status == 2)
		    		{
			    		// set client script to run on the form
						scriptContext.form.clientScriptFileId = 9757;
		    		
		    			// add button to the form
			    		scriptContext.form.addButton({
			    			id: 'custpage_delete_contract',
			    			label: 'Delete Contract',
			    			functionName: "showAlert(" + recordID + ")" // call client script when button is clicked. Pass recordID to client script
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
    function contractBS(scriptContext) {	
 
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
    function contractAS(scriptContext) {
    	
    	// check if the record is being edited
    	if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{    	
		       	// get the oldRecord and newRecord objects
    			var oldRecord = scriptContext.oldRecord;
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the ID of the current record
        		var currentRecordID = scriptContext.newRecord.id;
    			
    			// get the value of the status field from the oldRecord object
    			var oldStatus = oldRecord.getValue({
    				fieldId: 'custrecord_bbs_contract_status'
    			});
    			
    			// get the value of the status field from the currrentRecord object
    			var newStatus = currentRecord.getValue({
    				fieldId: 'custrecord_bbs_contract_status'
    			});
    			
    			// get the value of the minimum quarterly usage field from the oldRecord object
    			var oldQtrMin = oldRecord.getValue({
    				fieldId: 'custrecord_bbs_contract_qu_min_use'
    			});
    			
    			// get the value of the minimum quarterly usage field from the currentRecord object
    			var newQtrMin = currentRecord.getValue({
    				fieldId: 'custrecord_bbs_contract_qu_min_use'
    			});
    			
    			// get the value of the minimum annual usage field from the oldRecord object
    			var oldAnnMin = oldRecord.getValue({
    				fieldId: 'custrecord_bbs_contract_min_ann_use'
    			});
    			
    			// get the value of the minimum annual usage field from the currentRecord object
    			var newAnnMin = currentRecord.getValue({
    				fieldId: 'custrecord_bbs_contract_min_ann_use'
    			});
    			
    			// get the value of the 'billing type' field from the currentRecord object
		    	var billingType = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_contract_billing_type'
		    	});
    			
    			// check that oldStatus variable does NOT return 1 and the newStatus variable DOES return 1 (IE contract has been edited and status changed to approved)
    			if (oldStatus != 1 && newStatus == 1) // 1 = Approved
    				{
	    				// get the value of the 'setup fee' field from the currentRecord object
				    	var setupFee = currentRecord.getValue({
				    		fieldId: 'custrecord_bbs_contract_setup_fee'
				    	});
				    	
				    	// check if the setupFee variable returns true (checkbox is ticked)
				    	if (setupFee == true)
				    		{
				    			// call function to create an account setup fee invoice. Pass currentRecord object and currentRecordID variable
				    			createSetupFeeInvoice(currentRecord, currentRecordID);	
				    		}
				    	
				    	// check if the billingType variable returns 3 (QMP)
				    	if (billingType == 3)
				    		{
				    			// call the QMP function. Pass currentRecord object and currentRecordID variable
				    			QMP(billingType, currentRecord, currentRecordID);
				    		}
				    	// if the billingType variable returns 4 (AMP)
				    	else if (billingType == 4)
				    		{
				    			// call the AMP function. Pass currentRecord object and currentRecord variable
				    			AMP(billingType, currentRecord, currentRecordID);
				    		}
				    	// if the billingType variable returns 5 (QUR)
				    	else if (billingType == 5)
				    		{
				    			// call the QUR function. Pass currentRecord object and currentRecord variable
				    			QUR(billingType, currentRecord, currentRecordID);
				    		}
    				}
    			
    			// check if the oldQtrMin and newQtrMin variables are NOT the same (IE contract has been edited and quarterly minimum amount has been changed)
    			else if (oldQtrMin != newQtrMin)
    				{
    					// calculate the difference by subtracting oldQtrMin from newQtrMin
    					var difference = (newQtrMin - oldQtrMin);
    					
    					// check if the difference variable is greater than 0
    					if (difference > 0)
    						{
	    						// get the customer from the currentRecord object
	    					    var customer = currentRecord.getValue({
	    							fieldId: 'custrecord_bbs_contract_customer'
	    						});
	    					    
	    					    // get the currency from the currentRecord object
	    						var currency = currentRecord.getValue({
	    							fieldId: 'custrecord_bbs_contract_currency'
	    						});
	    						
	    						// call function to create a prepayment invoice
	    						createPrepaymentInvoice(billingType, currentRecordID, customer, currency, difference);
    						}
    				}
    			
    			// check if the oldAnnMin and newAnnMin variables are NOT the same (IE contract has been edited and annual minimum amount has been changed)
    			else if (oldAnnMin != newAnnMin)
    				{
	    				// calculate the difference by subtracting oldAnnMin from newQtrMin
						var difference = (newAnnMin - oldAnnMin);
						
						// check if the difference variable is greater than 0
						if (difference > 0)
							{
								// get the customer from the currentRecord object
	    					    var customer = currentRecord.getValue({
	    							fieldId: 'custrecord_bbs_contract_customer'
	    						});
	    					    
	    					    // get the currency from the currentRecord object	
	    						var currency = currentRecord.getValue({
	    							fieldId: 'custrecord_bbs_contract_currency'
	    						});
	    						
	    						// call function to create a prepayment invoice
	    						createPrepaymentInvoice(billingType, currentRecordID, customer, currency, difference);
							}
    				}
    		}
    }
    
    //================================================
	// FUNCTION TO CREATE AN ACCOUNT SETUP FEE INVOICE
	//================================================
    
    function createSetupFeeInvoice(currentRecord, currentRecordID)
	    {
	    	// get the customer from the currentRecord object
		    var customer = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_customer'
			});
		    
		    // lookup fields on the customer record
			var customerLookup = search.lookupFields({
				type: search.Type.CUSTOMER,
				id: customer,
				columns: ['custentity_bbs_location']
			});
			
			// retrieve values from the customerLookup
			var location = customerLookup.custentity_bbs_location[0].value;
			
	    	// get the currency from the currentRecord object
	    	var currency = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_currency'
			});
			
	    	// get the setup fee from the currentRecord object
	    	var setupFeeAmount = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_setup_fee_amount'
			});
			
	    	// use parseFloat to convert to decimal number
	    	setupFeeAmount = parseFloat(setupFeeAmount);
			
			try
				{
					// create a new invoice record
					var invoice = record.transform({
					    fromType: record.Type.CUSTOMER,
					    fromId: customer,
					    toType: record.Type.INVOICE,
					    isDynamic: true,
					    defaultValues: {
					    	customform: invoiceForm
					    }
					});
				
					// set header fields on the invoice
					invoice.setValue({
	    				fieldId: 'account',
	    				value: trcsAcc
	    			});
	    			
	    			invoice.setValue({
	    				fieldId: 'custbody_bbs_contract_record',
	    				value: currentRecordID
	    			});
	    			
	    			invoice.setValue({
	    				fieldId: 'location',
	    				value: location
	    			});
	    			
	    			invoice.setValue({
	    				fieldId: 'currency',
	    				value: currency
	    			});
	    			
	    			invoice.setValue({
	    				fieldId: 'custbody_bbs_invoice_type',
	    				value: 1 // 1 = Setup Fee
	    			});
	    			
	    			// add a new line to the invoice
	    			invoice.selectNewLine({
	    				sublistId: 'item'
	    			});
	    			
	    			// set fields on the new line
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'item',
	    				value: setupFeeItem
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'quantity',
	    				value: 1
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'rate',
	    				value: setupFeeAmount
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'custcol_bbs_contract_record',
	    				value: currentRecordID
	    			});
	    			
	    			invoice.setCurrentSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'location',
	    				value: location
	    			});
	    			
	    			// commit the line
	    			invoice.commitLine({
						sublistId: 'item'
					});
	    			
	    			// submit the invoice record
	    			var invoiceID = invoice.save();
	    			
	    			log.audit({
	    				title: 'Setup Fee Invoice Created',
	    				details: 'Invoice ID: ' + invoiceID + ' | Contract Record ID: ' + currentRecordID
	    			});
	    			
	    			// update the 'Setup Fee Billed' checkbox on the contract record
	    			record.submitFields({
	    				type: 'customrecord_bbs_contract',
	    				id: currentRecordID,
	    				values: {
	    					custrecord_bbs_contract_setup_fee_billed: true
	    				}
	    			});
				}
			catch(e)
				{
					log.error({
						title: 'Error creating Setup Fee Invoice for Contract Record ' + currentRecordID,
						details: e
					});
				}
	    }

    //==================================
	// FUNCTION FOR THE QMP BILLING TYPE
	//==================================
    
    function QMP(billingType, currentRecord, currentRecordID)
    	{
	    	// get the customer from the current record
		    var customer = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_customer'
			});
		    
		    // get the currency from the current record			
			var currency = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_currency'
			});
			
			// get the minimum usage from the current record			
			var qmpAmt = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_qu_min_use'
			});
			
			// use parseFloat to convert to decimal number
			qmpAmt = parseFloat(qmpAmt);
			
			// call function to create a prepayment invoice
			createPrepaymentInvoice(billingType, currentRecordID, customer, currency, qmpAmt);
    	}
    
    //==================================
	// FUNCTION FOR THE AMP BILLING TYPE
	//==================================
    
    function AMP(billingType, currentRecord, currentRecordID)
    	{
    		// declare variables
    		var invoiceDate;
    	
    		// get the contract start date from the currentRecord object
			var contractStart = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_start_date'
			});
			
			// format contractStart as a date object
			format.parse({
    			type: format.Type.DATE,
    			value: contractStart
    		});
			
			// Create a new date object to return today's date
			var todayDate = new Date();
			todayDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
			
			// calculate 30 days after today's date
			var thirtyDaysAfterToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()+30);
			
			// check that the contractStart is within 30 days of today's date
			if (contractStart <= thirtyDaysAfterToday)
				{
					// check if the contractStart is less than 30 days of today
					if (contractStart < thirtyDaysAfterToday)
						{
							// set the invoiceDate to be today's date
							invoiceDate = new Date();
						}
					else
						{
							// set the invoiceDate to 30 days before the contractStart
							invoiceDate = new Date(contractStart.getFullYear(), contractStart.getMonth(), contractStart.getDate()-30);
						}
				
					// get the customer from the currentRecord object
				    var customer = currentRecord.getValue({
						fieldId: 'custrecord_bbs_contract_customer'
					});
				    
				    // get the currency from the currentRecord object		
					var currency = currentRecord.getValue({
						fieldId: 'custrecord_bbs_contract_currency'
					});
					
					// get the minimum usage from the currentRecord object			
					var ampAmt = currentRecord.getValue({
						fieldId: 'custrecord_bbs_contract_min_ann_use'
					});
					
					// use parseFloat to convert to decimal number
					ampAmt = parseFloat(ampAmt);
					
					// call function to create a prepayment invoice
					createPrepaymentInvoice(billingType, currentRecordID, customer, currency, ampAmt);
				}
    	}
   
    //==================================
	// FUNCTION FOR THE QUR BILLING TYPE
	//==================================
    
    function QUR(billingType, currentRecord, currentRecordID)
    	{
	    	// get the customer from the currentRecord object
		    var customer = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_customer'
			});
		    
		    // get the currency from the currentRecord object		
			var currency = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_currency'
			});
			
			// get the minimum usage from the currentRecord object			
			var qmpAmt = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_qu_min_use'
			});
			
			// use parseFloat to convert to decimal number
			qmpAmt = parseFloat(qmpAmt);
			
			// call function to create a prepayment invoice
			createPrepaymentInvoice(billingType, currentRecordID, customer, currency, qmpAmt);
    	}
    
    //========================================
	// FUNCTION TO CREATE A PREPAYMENT INVOICE
	//========================================
    
    function createPrepaymentInvoice(billingType, contractRecord, customer, currency, amount)
    	{
	    	// lookup fields on the customer record
			var customerLookup = search.lookupFields({
				type: search.Type.CUSTOMER,
				id: customer,
				columns: ['custentity_bbs_location']
			});
			
			// retrieve values from the customerLookup
			var location = customerLookup.custentity_bbs_location[0].value;
    	
    		try
				{
	    			// create a new invoice record
					var invoice = record.transform({
					    fromType: record.Type.CUSTOMER,
					    fromId: customer,
					    toType: record.Type.INVOICE,
					    isDynamic: true,
					    defaultValues: {
					    	customform: invoiceForm
					    }
					});
    			
    				// set header fields on the invoice record
					invoice.setValue({
						fieldId: 'account',
						value: trpAcc
					});
					
					invoice.setValue({
						fieldId: 'custbody_bbs_invoice_type',
						value: 3 // 3 = Prepayment
					});
					
					invoice.setValue({
						fieldId: 'custbody_bbs_contract_record',
						value: contractRecord
					});
					
					invoice.setValue({
						fieldId: 'location',
						value: location
					});
					
					invoice.setValue({
						fieldId: 'currency',
						value: currency
					});
					
					// add a new line to the invoice
					invoice.selectNewLine({
						sublistId: 'item'
					});
					
					// check if the billingType is 3 (QMP) or 5 (QUR)
					if (billingType == '3' || billingType == '5')
						{
							// set the item on the new line using the qmpItem variable
							invoice.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'item',
								value: qmpItem
							});
						}
					else // billingType is 4 (AMP)
						{
							// set the item on the new line using the ampItem variable
							invoice.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'item',
								value: ampItem
							});
						}
						
					// set fields on the new line
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'quantity',
						value: 1
					});
					
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'rate',
						value: amount
					});
					
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'custcol_bbs_contract_record',
						value: contractRecord
					});
					
					invoice.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'location',
						value: location
					});
					
					// commit the line
					invoice.commitLine({
						sublistId: 'item'
					});
					
					// submit the invoice record
					var invoiceID = invoice.save();
					
					log.audit({
						title: 'Initial Prepayment Invoice Created',
						details: 'Invoice ID: ' + invoiceID + ' | Contract Record ID: ' + contractRecord
					});
					
					// update the 'Initial Prepayment Invoice Billed' checkbox on the contract record
					record.submitFields({
						type: 'customrecord_bbs_contract',
						id: contractRecord,
						values: {
							custrecord_bbs_contract_initial_invoice: true
						}
					});
				}
	    	catch(e)
				{
					log.error({
						title: 'Error creating initial prepayment invoice for Contract Record ' + contractRecord,
						details: e
					});
				}
    	}

    return {
        beforeLoad: contractBL,
        beforeSubmit: contractBS,
        afterSubmit: contractAS
    };
    
});
