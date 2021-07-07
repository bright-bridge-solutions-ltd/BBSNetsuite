/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/url', 'N/runtime', 'N/record', 'N/search', 'N/format', 'N/task', 'N/redirect'],
/**
 * @param {record} record
 */
function(ui, url, runtime, record, search, format, task, redirect) {
	
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script	
	qmpItem = currentScript.getParameter({
    	name: 'custscript_bbs_qmp_item'
    });
	
	ampItem = currentScript.getParameter({
    	name: 'custscript_bbs_amp_item'
    });
	
	burItem = currentScript.getParameter({
		name: 'custscript_bbs_bi_annual_min_prepay_item'
	});
	
	deferredIncomeAccount = currentScript.getParameter({
		name: 'custscript_bbs_def_inc_upfront'
	});
	
	unusedMinimumsAccount = currentScript.getParameter({
		name: 'custscript_bbs_unused_income_account'
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
    	
    	// check if the record is being viewed in the UI
    	if (scriptContext.type == scriptContext.UserEventType.VIEW && runtime.executionContext == runtime.ContextType.USER_INTERFACE)
    		{ 	
    			// set client script to run on the form
				scriptContext.form.clientScriptFileId = 39736;
    		
    			// get the currentRecord object
		    	var currentRecord = scriptContext.newRecord;
		    	
		    	// get the internal ID of the current record
    			var recordID = scriptContext.newRecord.id;
		    	
		    	// get the value of the 'status' field from the record
		    	var status = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_contract_status'
		    	});
		    	
		    	// get the 'Minimum Usage' sublist
		    	var sublist = scriptContext.form.getSublist({
		    		id: 'recmachcustrecord_bbs_contract_min_usage_parent'
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
			    		
			    		// get the billing type
			    		var billingType = currentRecord.getValue({
			    			fieldId: 'custrecord_bbs_contract_billing_type'
			    		});
			    		
			    		// if the billing type is 2 (UIOLI) or 6 (AMBMA)
			    		if (billingType == 2 || billingType == 6)
			    			{
				    			// define suiteletURL2 variable
					    		var suiteletURL2 = url.resolveScript({
					    			scriptId: 'customscript_bbs_update_minimum_usage_sl',
					    			deploymentId: 'customdeploy_bbs_update_minimum_usage_sl',
					    		});
					    		
					    		// add parameters to suiteletURL2 variable
					    		suiteletURL2 += '&record=' + recordID;
						    		
						    	// add a button to the 'Minimum Usage' sublist
						    	sublist.addButton({
						    		id: 'custpage_update_minimum_usage',
						    		label: 'Update Minimum Usage',
						    		functionName: "window.open('" + suiteletURL2 + "','_self');" // call Suitelet when button is clicked. This will open in the current window
						    	});
			    			}
			    		else
			    			{
			    				// hide the 'Minimum Usage' sublist
			    				sublist.displayType = ui.SublistDisplayType.HIDDEN;
			    			}
			    		
			    		// add buttons to the form
			    		scriptContext.form.addButton({
			    			id: 'custpage_create_payg_contract',
			    			label: 'Create PAYG Contract',
			    			functionName: "createPAYGContract(" + recordID + ")" // call client script when button is clicked. Pass recordID to client script
			    		});
			    		
			    		scriptContext.form.addButton({
			    			id: 'custpage_create_renewal_contract',
			    			label: 'Create Renewal Contract',
			    			functionName: "createRenewalContract(" + recordID + ")" // call client script when button is clicked. Pass recordID to client script
			    		});
		    		}
		    	else
		    		{
		    			// if the status variable returns 2 (Pending Approval)
		    			if (status == 2)
		    				{
			    				// add button to the form
					    		scriptContext.form.addButton({
					    			id: 'custpage_delete_contract',
					    			label: 'Delete Contract',
					    			functionName: "showAlert(" + recordID + ")" // call client script when button is clicked. Pass recordID to client script
					    		});
		    				}
		    			
		    			// hide the 'Minimum Usage' sublist
	    				sublist.displayType = ui.SublistDisplayType.HIDDEN;
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
    	
    	// check if the record is being created
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
	    		// get the oldRecord and newRecord objects
				var oldRecord = scriptContext.oldRecord;
				var currentRecord = scriptContext.newRecord;
    			
    			// get the internal ID of the customer from the currentRecord object
			    var customer = currentRecord.getValue({
					fieldId: 'custrecord_bbs_contract_customer'
				});
    			
    			// get the value of the 'Consolidated Invoicing Required' field from the currentRecord object
    			var consolInvReq = currentRecord.getValue({
    				fieldId: 'custrecord_bbs_contract_consol_inv'
    			});
    			
    			// lookup fields on the customer record
    			var customerLookup = search.lookupFields({
    				type: search.Type.CUSTOMER,
    				id: customer,
    				columns: ['parent']
    			});
    			
    			// get values from the customerLookup object
    			var parentCustomer = customerLookup.parent[0].value;
    			
    			// check that the customer is not equal to parentCustomer
    			if (customer != parentCustomer)
    				{
	    				// check if the consolInvReq variable returns 1 (Yes)
	        			if (consolInvReq == 1)
	        				{
	        					// untick the 'Exclude from Consolidated Invoicing' checkbox on the parent and customer records
		        				record.submitFields({
	        						type: record.Type.CUSTOMER,
	        						id: parentCustomer,
	        						values: {
	        							custentity_nsts_ci_exclude_ci: false
	        						}
	        					});
	        				
	        					record.submitFields({
	        						type: record.Type.CUSTOMER,
	        						id: customer,
	        						values: {
	        							custentity_nsts_ci_exclude_ci: false
	        						}
	        					});
	        				}
	        			// if the consolInvReq variable returns 2 (No)
	        			else if (consolInvReq == 2)
	        				{
	    	    				// tick the 'Exclude from Consolidated Invoicing' checkbox on the parent and customer records
		        				record.submitFields({
	    							type: record.Type.CUSTOMER,
	    							id: parentCustomer,
	    							values: {
	    								custentity_nsts_ci_exclude_ci: true
	    							}
	    						});
	        				
		        				record.submitFields({
	    							type: record.Type.CUSTOMER,
	    							id: customer,
	    							values: {
	    								custentity_nsts_ci_exclude_ci: true
	    							}
	    						});
	        				}
    				}
    			else // customer is equal to parentCustomer
    				{
	    				// check if the consolInvReq variable returns 1 (Yes)
	        			if (consolInvReq == 1)
	        				{
	        					// untick the 'Exclude from Consolidated Invoicing' checkbox on the customer record
	        					record.submitFields({
	        						type: record.Type.CUSTOMER,
	        						id: customer,
	        						values: {
	        							custentity_nsts_ci_exclude_ci: false
	        						}
	        					});
	        				}
	        			// if the consolInvReq variable returns 2 (No)
	        			else if (consolInvReq == 2)
	        				{
	    	    				// tick the 'Exclude from Consolidated Invoicing' checkbox on the customer record
	    						record.submitFields({
	    							type: record.Type.CUSTOMER,
	    							id: customer,
	    							values: {
	    								custentity_nsts_ci_exclude_ci: true
	    							}
	    						});
	        				}
    				}
    			
    			// check if the record is being created
    			if (scriptContext.type == scriptContext.UserEventType.CREATE)
    				{
    					// get the value of the currency field from the currentRecord object
    					var currency = currentRecord.getValue({
    						fieldId: 'custrecord_bbs_contract_currency'
    					});
    					
    					// call function to add the currency to the customer record
    					addCurrencyToCustomer(customer, currency);
    				}
    			
    			// check if the record is being edited
    	    	if (scriptContext.type == scriptContext.UserEventType.EDIT)
    	    		{
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
	        			
	        			// get the value of the minimum bi-annual usage field from the oldRecord object
	        			var oldBiAnnMin = oldRecord.getValue({
	        				fieldId: 'custrecord_bbs_contract_bi_ann_use'
	        			});
	        			
	        			// get the value of the minimum bi-annual usage field from the currentRecord object
	        			var newBiAnnMin = currentRecord.getValue({
	        				fieldId: 'custrecord_bbs_contract_bi_ann_use'
	        			});
	        			
	        			// get the value of the start date from the oldRecord object
	        			var oldStartDate = oldRecord.getValue({
	        				fieldId: 'custrecord_bbs_contract_start_date'
	        			});
	        			
	        			// get the value of the start date from the currentRecord object
	        			var newStartDate = currentRecord.getValue({
	        				fieldId: 'custrecord_bbs_contract_start_date'
	        			});
	        			
	        			// get the value of the end date from the oldRecord object
	        			var oldEndDate = oldRecord.getValue({
	        				fieldId: 'custrecord_bbs_contract_end_date'
	        			});
	        			
	        			// get the value of the end date from the currentRecord object
	        			var newEndDate = currentRecord.getValue({
	        				fieldId: 'custrecord_bbs_contract_end_date'
	        			});
	        			
	        			// get the value of the 'billing type' field from the currentRecord object
	    		    	var billingType = currentRecord.getValue({
	    		    		fieldId: 'custrecord_bbs_contract_billing_type'
	    		    	});
        			
	        			// check that oldStatus variable returns 2 and the newStatus variable returns 1 (IE contract has been edited and status changed from Pending Approval to Approved)
	        			if (oldStatus == 2 && newStatus == 1) // 2 = Pending Approval, 1 = Approved
	        				{
	        					// check the billingType is 2 (UIOLI) or 6 (AMBMA)
	        					if (billingType == 2 || billingType == 6)
	        						{
	        							// call function to create minimum usage records. Pass currentRecord object
	        							createMinimumUsageRecords(currentRecord);
	        						}
	        				
	        					// check if the billingType is 3 (QMP)
	    				    	if (billingType == 3)
	    				    		{
	    				    			// call the QMP function. Pass currentRecord object and billingType/currentRecordID variables
	    				    			QMP(billingType, currentRecord, currentRecordID);
	    				    		}
	    				    	// if the billingType is 4 (AMP)
	    				    	else if (billingType == 4)
	    				    		{
	    				    			// call the AMP function. Pass currentRecord object and billingType/currentRecordID variables
	    				    			AMP(billingType, currentRecord, currentRecordID);
	    				    		}
	    				    	// if the billingType is 5 (QUR)
	    				    	else if (billingType == 5)
	    				    		{
	    				    			// call the QUR function. Pass currentRecord object and billingType/currentRecordID variables
	    				    			QUR(billingType, currentRecord, currentRecordID);
	    				    		}
	    				    	// if the billing type is 7 (BUR)
	    				    	else if (billingType == 7)
	    				    		{
	    				    			// call the BUR function. Pass currentRecord object and billingType/currentRecordID variables
	    				    			BUR(billingType, currentRecord, currentRecordID);
	    				    		}
	    				    	// if the billing type is 8 (Contract Extension)
	    				    	else if (billingType == 8)
	    				    		{
	    				    			// call the contractExtension function. Pass billingType, currentRecord object, currentRecordID and newStartDate variables
	    				    			contractExtension(billingType, currentRecord, currentRecordID, newStartDate);
	    				    		}
	    				    	else
	    				    		{
		    				    		// declare and initialize variables
	    				    			var setupFeeInvoice = 'F';
	    				    			var mgmtFeeInvoice = 'F';
	    				    		
	    				    			// get the value of the 'setup fee' field
		    					    	var setupFee = currentRecord.getValue({
		    					    		fieldId: 'custrecord_bbs_contract_setup_fee'
		    					    	});
		    					    	
		    					    	// get the value of the 'setup fee billed' field
		    					    	var setupFeeBilled = currentRecord.getValue({
		    					    		fieldId: 'custrecord_bbs_contract_setup_fee_billed'
		    					    	});
		    					    	
		    					    	// get the value of the 'Management Fee' field
		    					    	var mgmtFee = currentRecord.getValue({
		    					    		fieldId: 'custrecord_bbs_contract_mgmt_fee',
		    					    	});
		    					    	
		    					    	// get the value of the 'Management Fee Type' field
		    					    	var mgmtFeeType = currentRecord.getValue({
		    					    		fieldId: 'custrecord_bbs_contract_mgmt_fee_type',
		    					    	});
		    					    	
		    					    	// get the value of the 'Management Fee Billed' field
		    					    	var mgmtFeeBilled = currentRecord.getValue({
		    					    		fieldId: 'custrecord_bbs_contract_mgmt_fee_billed'
		    					    	});
		    					    	
		    					    	// check if the setupFee variable returns true (checkbox is ticked) and setupFeeBilled variable returns false (checkbox is NOT ticked)
		    					    	if (setupFee == true && setupFeeBilled == false)
		    					    		{
		    						    		// set setupFeeInvoice variable to 'T'
		    					    			setupFeeInvoice = 'T';
		    					    		}
		    					    	
		    					    	// check if mgmtFee is 1 (Yes) AND mgmtFeeType is 2 (Upfront) AND mgmtFeeAmt is greater than 0 AND mgmtFeeBilled is false (checkbox is NOT ticked)
		    					    	if (mgmtFee == 1 && mgmtFeeType == 2 && mgmtFeeBilled == false)
		    					    		{
		    					    			// set mgmtFeeInvoice to 'T'
		    					    			mgmtFeeInvoice = 'T';
		    					    		}
		    					    	
		    					    	// check setupFeeInvoice or mgmtFeeInvoice variables return 'T'
		    					    	if (setupFeeInvoice == 'T' || mgmtFeeInvoice == 'T')
		    					    		{
			    					    		// call function to create initial invoices. Pass currentRecordID, billingType, setupFeeInvoice and mgmtFeeInvoice
			    								createInitialInvoices(currentRecordID, '0.00', billingType, setupFeeInvoice, mgmtFeeInvoice, 'F');
		    					    		}
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
	    	    						// call function to create a prepayment invoice
	    	    						createInitialInvoices(currentRecordID, difference, billingType, 'F', 'F', 'T');
	        						}
	        				}
	        			// check if the oldAnnMin and newAnnMin variables are NOT the same (IE contract has been edited and annual minimum amount has been changed)
	        			else if ((oldAnnMin != newAnnMin) && billingType != 6) // 6 = AMBMA
	        				{
	    	    				// calculate the difference by subtracting oldAnnMin from newQtrMin
	    						var difference = (newAnnMin - oldAnnMin);
	    						
	    						// check if the difference variable is greater than 0
	    						if (difference > 0)
	    							{
	    								// call function to create a prepayment invoice
	    								createInitialInvoices(currentRecordID, difference, billingType, 'F', 'F', 'T');
	    							}
	        				}
	        			// check if the oldBiAnnMin and newBiAnnMin variables are NOT the same (IE contract has been edited and bi-annual minimum amount has been changed)
	        			else if (oldBiAnnMin != newBiAnnMin)
	        				{
		        				// calculate the difference by subtracting oldBiAnnMin from newBiAnnMin
	    						var difference = (newBiAnnMin - oldBiAnnMin);
	    						
	    						// check if the difference variable is greater than 0
	    						if (difference > 0)
	    							{
	    								// call function to create a prepayment invoice
	    								createInitialInvoices(currentRecordID, difference, billingType, 'F', 'F', 'T');
	    							}
	        				}
	        			// check if the record is approved and the dates have changed and the billingType is 2 (UIOLI) or 6 (AMBMA)
	        			else if (newStatus == 1 && (oldStartDate != newStartDate || oldEndDate != newEndDate) && (billingType == 2 || billingType == 6))
	    		    		{
	    		    			// call function to delete existing minimum usage records
	    		    			deleteMinimumUsageRecords(currentRecordID);
	    		    			
	    		    			// call function to create new minimum usage records
	    		    			createMinimumUsageRecords(currentRecord);
	    		    		}
	        			
	        			// if the record is approved and the dates have changed
	        			if (newStatus == 1 && (oldStartDate != newStartDate || oldEndDate != newEndDate))
	        				{
		        				// call function to update dates on recurring product records
	    		    			updateRecurringProducts(currentRecordID, newStartDate, newEndDate);
	        				}
	        			
    	    		}
    	    	
    	    	// redirect the user back to the current record
    	    	redirect.toRecord({
    	    		type: 'customrecord_bbs_contract',
    	    		id: currentRecord.id
    	    	});
    	    	
    		}
    }

    //==================================
	// FUNCTION FOR THE QMP BILLING TYPE
	//==================================
    
    function QMP(billingType, currentRecord, currentRecordID)
    	{
	    	// declare and initialize variables
    		var setupFeeInvoice = 'F';
    		var mgmtFeeInvoice = 'F';
    		var prepaymentInvoice = 'F';
    	
    		// get the minimum usage from the current record			
			var qmpAmt = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_qu_min_use'
			});
			
			// use parseFloat to convert to decimal number
			qmpAmt = parseFloat(qmpAmt);
			
			// get the value of the 'Usage Invoice Billed' checkbox
			var usageInvoiceBilled = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_initial_invoice'
			});
			
			// get the value of the 'setup fee' field
	    	var setupFee = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_setup_fee'
	    	});
	    	
	    	// get the value of the 'setup fee billed' field
	    	var setupFeeBilled = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_setup_fee_billed'
	    	});
	    	
	    	// get the value of the 'Management Fee' field
	    	var mgmtFee = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_mgmt_fee',
	    	});
	    	
	    	// get the value of the 'Management Fee Type' field
	    	var mgmtFeeType = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_mgmt_fee_type',
	    	});
	    	
	    	// get the value of the 'Management Fee Billed' field
	    	var mgmtFeeBilled = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_mgmt_fee_billed'
	    	});
	    	
	    	// get the contract start date
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
			
			// check that the contractStart is within 30 days of today's date and the usageInvoiceBilled variable is false
			if (contractStart <= thirtyDaysAfterToday && usageInvoiceBilled == false)
				{
					// set the prepaymentInvoice variable to 'T'
					prepaymentInvoice = 'T';
				}
	    	
	    	// check if the setupFee variable returns true (checkbox is ticked) and setupFeeBilled variable returns false (checkbox is NOT ticked)
	    	if (setupFee == true && setupFeeBilled == false)
	    		{
		    		// set setupFeeInvoice variable to 'T'
	    			setupFeeInvoice = 'T';
	    		}
	    	
	    	// check if mgmtFee is 1 (Yes) AND mgmtFeeType is 2 (Upfront) AND mgmtFeeBilled returns false (checkbox is NOT ticked)
	    	if (mgmtFee == 1 && mgmtFeeType == 2 && mgmtFeeBilled == false)
	    		{
	    			// set mgmtFeeInvoice to 'T'
	    			mgmtFeeInvoice = 'T';
	    		}
	    	
	    	// call function to create initial invoices. Pass currentRecordID, qmpAmt, billingType, setupFeeInvoice, mgmtFeeInvoice and prepaymentInvoice
			createInitialInvoices(currentRecordID, qmpAmt, billingType, setupFeeInvoice, mgmtFeeInvoice, prepaymentInvoice);
    	}
    
    //==================================
	// FUNCTION FOR THE AMP BILLING TYPE
	//==================================
    
    function AMP(billingType, currentRecord, currentRecordID)
    	{
	    	// declare and initialize variables
			var setupFeeInvoice = 'F';
			var mgmtFeeInvoice = 'F';
			var prepaymentInvoice = 'F';
			
			// get the minimum annual usage		
			var ampAmt = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_min_ann_use'
			});
			
			// use parseFloat to convert to decimal number
			ampAmt = parseFloat(ampAmt);
			
			// get the value of the 'Usage Invoice Billed' checkbox
			var usageInvoiceBilled = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_initial_invoice'
			});
			
			// get the value of the 'setup fee' field
	    	var setupFee = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_setup_fee'
	    	});
	    	
	    	// get the value of the 'setup fee billed' field
	    	var setupFeeBilled = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_setup_fee_billed'
	    	});
	    	
	    	// get the value of the 'Management Fee' field
	    	var mgmtFee = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_mgmt_fee',
	    	});
	    	
	    	// get the value of the 'Management Fee Type' field
	    	var mgmtFeeType = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_mgmt_fee_type',
	    	});
	    	
	    	// get the value of the 'Management Fee Billed' field
	    	var mgmtFeeBilled = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_mgmt_fee_billed'
	    	});
    	
    		// get the contract start date
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
			
			// check that the contractStart is within 30 days of today's date and the usageInvoiceBilled variable is false
			if (contractStart <= thirtyDaysAfterToday && usageInvoiceBilled == false)
				{
					// set the prepaymentInvoice variable to 'T'
					prepaymentInvoice = 'T';
				}
	    	
	    	// check if the setupFee variable returns true (checkbox is ticked) and setupFeeBilled variable returns false (checkbox is NOT ticked)
	    	if (setupFee == true && setupFeeBilled == false)
	    		{
		    		// set setupFeeInvoice variable to 'T'
	    			setupFeeInvoice = 'T';
	    		}
	    	
	    	// check if mgmtFee is 1 (Yes) AND mgmtFeeType is 2 (Upfront) AND mgmtFeeBilled returns false (checkbox is NOT ticked)
	    	if (mgmtFee == 1 && mgmtFeeType == 2 && mgmtFeeBilled == false)
	    		{
	    			// set mgmtFeeInvoice to 'T'
	    			mgmtFeeInvoice = 'T';
	    		}
	    	
	    	// call function to create initial invoices. Pass currentRecordID, ampAmt, billingType, setupFeeInvoice, mgmtFeeInvoice and prepaymentInvoice
			createInitialInvoices(currentRecordID, ampAmt, billingType, setupFeeInvoice, mgmtFeeInvoice, prepaymentInvoice);
    	}
   
    //==================================
	// FUNCTION FOR THE QUR BILLING TYPE
	//==================================
    
    function QUR(billingType, currentRecord, currentRecordID)
    	{
    		// declare and initialize variables
			var setupFeeInvoice = 'F';
			var mgmtFeeInvoice = 'F';
			var prepaymentInvoice = 'F';
    	
    		// get the minimum quarterly usage		
			var qmpAmt = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_qu_min_use'
			});
			
			// use parseFloat to convert to decimal number
			qmpAmt = parseFloat(qmpAmt);
			
			// get the value of the 'Usage Invoice Billed' checkbox
			var usageInvoiceBilled = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_initial_invoice'
			});
			
			// get the value of the 'setup fee' field
	    	var setupFee = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_setup_fee'
	    	});
	    	
	    	// get the value of the 'setup fee billed' field
	    	var setupFeeBilled = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_setup_fee_billed'
	    	});
	    	
	    	// get the value of the 'Management Fee' field
	    	var mgmtFee = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_mgmt_fee',
	    	});
	    	
	    	// get the value of the 'Management Fee Type' field
	    	var mgmtFeeType = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_mgmt_fee_type',
	    	});
	    	
	    	// get the value of the 'Management Fee Billed' field
	    	var mgmtFeeBilled = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_mgmt_fee_billed'
	    	});
			
			// get the contract start date
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
			
			// check that the contractStart is within 30 days of today's date and the usageInvoiceBilled variable is false
			if (contractStart <= thirtyDaysAfterToday && usageInvoiceBilled == false)
				{
					// set the prepaymentInvoice variable to 'T'
					prepaymentInvoice = 'T';
				}
			
			// check if the setupFee variable returns true (checkbox is ticked) and setupFeeBilled variable returns false (checkbox is NOT ticked)
	    	if (setupFee == true && setupFeeBilled == false)
	    		{
		    		// set setupFeeInvoice variable to 'T'
	    			setupFeeInvoice = 'T';
	    		}
	    	
	    	// check if mgmtFee is 1 (Yes) AND mgmtFeeType is 2 (Upfront) AND mgmtFeeBilled returns false (checkbox is NOT ticked)
	    	if (mgmtFee == 1 && mgmtFeeType == 2 && mgmtFeeBilled == false)
	    		{
	    			// set mgmtFeeInvoice to 'T'
	    			mgmtFeeInvoice = 'T';
	    		}
	    	
	    	// call function to create initial invoices. Pass currentRecordID, qmpAmt, billingType, setupFeeInvoice, mgmtFeeInvoice and prepaymentInvoice
			createInitialInvoices(currentRecordID, qmpAmt, billingType, setupFeeInvoice, mgmtFeeInvoice, prepaymentInvoice);
    	}
    
    // =================================
    // FUNCTION FOR THE BUR BILLING TYPE
    // =================================
    
    function BUR(billingType, currentRecord, currentRecordID)
		{
			// declare and initialize variables
			var setupFeeInvoice = 'F';
			var mgmtFeeInvoice = 'F';
			var prepaymentInvoice = 'F';
		
			// get the bi-annual minimum usage			
			var burAmt = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_bi_ann_use'
			});
			
			// use parseFloat to convert to decimal number
			burAmt = parseFloat(burAmt);
			
			// get the value of the 'Usage Invoice Billed' checkbox
			var usageInvoiceBilled = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_initial_invoice'
			});
			
			// get the value of the 'setup fee' field
	    	var setupFee = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_setup_fee'
	    	});
	    	
	    	// get the value of the 'setup fee billed' field
	    	var setupFeeBilled = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_setup_fee_billed'
	    	});
	    	
	    	// get the value of the 'Management Fee' field
	    	var mgmtFee = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_mgmt_fee',
	    	});
	    	
	    	// get the value of the 'Management Fee Type' field
	    	var mgmtFeeType = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_mgmt_fee_type',
	    	});
	    	
	    	// get the value of the 'Management Fee Billed' field
	    	var mgmtFeeBilled = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_mgmt_fee_billed'
	    	});
			
			// get the contract start date
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
			
			// check that the contractStart is within 30 days of today's date and the usageInvoiceBilled variable is false
			if (contractStart <= thirtyDaysAfterToday && usageInvoiceBilled == false)
				{
					// set the prepaymentInvoice variable to 'T'
					prepaymentInvoice = 'T';
				}
			
			// check if the setupFee variable returns true (checkbox is ticked) and setupFeeBilled variable returns false (checkbox is NOT ticked)
	    	if (setupFee == true && setupFeeBilled == false)
	    		{
		    		// set setupFeeInvoice variable to 'T'
	    			setupFeeInvoice = 'T';
	    		}
	    	
	    	// check if mgmtFee is 1 (Yes) AND mgmtFeeType is 2 (Upfront) AND mgmtFeeBilled returns false (checkbox is NOT ticked)
	    	if (mgmtFee == 1 && mgmtFeeType == 2 && mgmtFeeBilled == false)
	    		{
	    			// set mgmtFeeInvoice to 'T'
	    			mgmtFeeInvoice = 'T';
	    		}
	    	
	    	// call function to create initial invoices. Pass currentRecordID, burAmt, billingType, setupFeeInvoice, mgmtFeeInvoice and prepaymentInvoice
			createInitialInvoices(currentRecordID, burAmt, billingType, setupFeeInvoice, mgmtFeeInvoice, prepaymentInvoice);
		}
    
    // ================================================
    // FUNCTION FOR THE CONTRACT EXTENSION BILLING TYPE
    // ================================================
    
    function contractExtension(billingType, currentRecord, currentRecordID, journalDate)
		{
    		// format journalDate as a date string
    		var contractStartDate = format.format({
    			type: format.Type.DATE,
    			value: journalDate
    		});
    	
    		// declare and initialize variables
    		var mgmtFeeInvoice = 'F';
    		
    		// get the deferred income balance (old contract)
    		var deferredIncomeBalance = currentRecord.getValue({
    			fieldId: 'custrecord_bbs_contract_old_def_inc_bal'
    		});
    		
    		// get the subsidiary
    		var subsidiary = currentRecord.getValue({
    			fieldId: 'custrecord_bbs_contract_subsidiary'
    		});
    		
    		// get the currency
    		var currency = currentRecord.getValue({
    			fieldId: 'custrecord_bbs_contract_currency'
    		});
    		
    		// get the customer
    		var customer = currentRecord.getValue({
    			fieldId: 'custrecord_bbs_contract_customer'
    		});
    		
    		// get the location
    		var location = currentRecord.getValue({
    			fieldId: 'custrecord_bbs_contract_location'
    		});
    		
    		try
    			{
    				// create a journal record
    				var journalRecord = record.create({
    					type: record.Type.JOURNAL_ENTRY,
    					isDynamic: true
    				});
    				
    				// set header fields on the journal
    				journalRecord.setValue({
    					fieldId: 'trandate',
    					value: journalDate
    				});
    				
    				journalRecord.setValue({
    					fieldId: 'subsidiary',
    					value: subsidiary
    				});
    				
    				journalRecord.setValue({
    					fieldId: 'currency',
    					value: currency
    				});
    				
    				journalRecord.setValue({
    					fieldId: 'memo',
    					value: 'Contract Extension + ' + contractStartDate
    				});
    				
    				journalRecord.setValue({
    					fieldId: 'custbody_bbs_contract_record',
    					value: currentRecordID
    				});
    				
    				journalRecord.setValue({
	    				fieldId: 'approvalstatus',
	    				value: 2 // Approved
	    			});
    				
    				// add a line to the journal to subtract balance from the unused minimums account
    				journalRecord.selectNewLine({
    					sublistId: 'line'
    				});
    				
    				journalRecord.setCurrentSublistValue({
    					sublistId: 'line',
    					fieldId: 'account',
    					value: unusedMinimumsAccount
    				});
    				
    				journalRecord.setCurrentSublistValue({
    					sublistId: 'line',
    					fieldId: 'debit',
    					value: deferredIncomeBalance
    				});
    				
    				journalRecord.setCurrentSublistValue({
    					sublistId: 'line',
    					fieldId: 'memo',
    					value: 'Contract Extension + ' + contractStartDate
    				});
    				
    				journalRecord.setCurrentSublistValue({
    					sublistId: 'line',
    					fieldId: 'entity',
    					value: customer
    				});
    				
    				journalRecord.setCurrentSublistValue({
    					sublistId: 'line',
    					fieldId: 'location',
    					value: location
    				});
    				
    				journalRecord.setCurrentSublistValue({
    					sublistId: 'line',
    					fieldId: 'custcol_bbs_contract_record',
    					value: currentRecordID
    				});
    				
    				journalRecord.commitLine({
    					sublistId: 'line'
    				});
    				
    				// add a line to the journal to add balances to the deferred income account
    				journalRecord.selectNewLine({
    					sublistId: 'line'
    				});
    				
    				journalRecord.setCurrentSublistValue({
    					sublistId: 'line',
    					fieldId: 'account',
    					value: deferredIncomeAccount
    				});
    				
    				journalRecord.setCurrentSublistValue({
    					sublistId: 'line',
    					fieldId: 'credit',
    					value: deferredIncomeBalance
    				});
    				
    				journalRecord.setCurrentSublistValue({
    					sublistId: 'line',
    					fieldId: 'memo',
    					value: 'Contract Extension + ' + contractStartDate
    				});
    				
    				journalRecord.setCurrentSublistValue({
    					sublistId: 'line',
    					fieldId: 'entity',
    					value: customer
    				});
    				
    				journalRecord.setCurrentSublistValue({
    					sublistId: 'line',
    					fieldId: 'location',
    					value: location
    				});
    				
    				journalRecord.setCurrentSublistValue({
    					sublistId: 'line',
    					fieldId: 'custcol_bbs_contract_record',
    					value: currentRecordID
    				});
    				
    				journalRecord.commitLine({
    					sublistId: 'line'
    				});
    				
    				// save the journal record
    				var journalID = journalRecord.save({
    					enableSourcing: false,
			    		ignoreMandatoryFields: true
		    		});
    				
    				log.audit({
    					title: 'Journal Record Created',
    					details: journalID
    				});
    			}
    		catch(e)
    			{
    				log.error({
    					title: 'Error Creating Journal',
    					details: e
    				});
    			}
    		
    		// get the value of the 'Management Fee' field
	    	var mgmtFee = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_mgmt_fee',
	    	});
	    	
	    	// get the value of the 'Management Fee Type' field
	    	var mgmtFeeType = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_mgmt_fee_type',
	    	});
	    	
	    	// get the value of the 'Management Fee Billed' field
	    	var mgmtFeeBilled = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_mgmt_fee_billed'
	    	});
    		
    		// check if mgmtFee is 1 (Yes) AND mgmtFeeType is 2 (Upfront) AND mgmtFeeBilled is false (checkbox is NOT ticked)
	    	if (mgmtFee == 1 && mgmtFeeType == 2 && mgmtFeeBilled == false)
	    		{
	    			// set mgmtFeeInvoice to 'T'
	    			mgmtFeeInvoice = 'T';
	    		}
	    	
	    	// call function to create initial invoices. Pass currentRecordID, billingType and mgmtFeeInvoice
			createInitialInvoices(currentRecordID, '0.00', billingType, 'F', mgmtFeeInvoice, 'F');
    		
		}
    
    // ===================================
    // FUNCTION TO CREATE INITIAL INVOICES
    // ===================================
    
    function createInitialInvoices(contractRecord, prepaymentInvoiceAmt, billingType, setupFeeInvoice, mgmtFeeInvoice, prepaymentInvoice)
    	{
	    	// declare and initiate variables
			var prepaymentItem;
		
			// check if the billingType is 3 (QMP) or 5 (QUR)
			if (billingType == '3' || billingType == '5')
				{
					// set the prepaymentItem variable using the qmpItem variable
					prepaymentItem = qmpItem;
				}
			else if (billingType == '4') // billingType is 4 (AMP)
				{
					// set the prepaymentItem variable using the ampItem variable
					prepaymentItem = ampItem;
				}
			else if (billingType == 7) // billing Type is 7 (BUR)
				{
					// set the prepaymentItem variable using the ampItem variable
					prepaymentItem = burItem;
				}

			// =======================================================
	    	// NOW SCHEDULE SCHEDULE SCRIPT TO CREATE INITIAL INVOICES
	    	// =======================================================
	    	
	    	// create a scheduled task
	    	var scheduledTask = task.create({
	    	    taskType: task.TaskType.SCHEDULED_SCRIPT,
	    	    scriptId: 'customscript_bbs_create_initial_inv',
	    	    deploymentId: null,
	    	    params: {
	    	    	custscript_bbs_contract_record: contractRecord,
	    	    	custscript_bbs_prepay_item: prepaymentItem,
	    	    	custscript_bbs_prepay_amt: prepaymentInvoiceAmt,
	    	    	custscript_bbs_setup_fee_inv: setupFeeInvoice,
	    	    	custscript_bbs_mgmt_fee_inv: mgmtFeeInvoice,
	    	    	custscript_bbs_prepay_inv: prepaymentInvoice
	    	    }
	    	});
	    	
	    	// submit the scheduled task
	    	var scheduledTaskID = scheduledTask.submit();
	    	
	    	log.audit({
	    		title: 'Script Scheduled',
	    		details: 'BBS Create Initial Invoices script has been Scheduled. Job ID ' + scheduledTaskID
	    	});
			
    	}
    
    // ========================================
    // FUNCTION TO CREATE MINIMUM USAGE RECORDS
    // ========================================
    
    function createMinimumUsageRecords(currentRecord)
    	{
	    	// declare and initialize variables
			var monthlyMinimum;
			var thisMonthlyMinimum;
		
			// get the internal ID of the contract
			var contractID = currentRecord.id;
			
			// get the contract term
			var contractTerm = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_term'
			});
			
			// get the start/end dates of the contract
			var startDate = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_start_date'
			});
			
			var endDate = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_end_date'
			});
			
			// get the day of the start/end dates
			var startDay = startDate.getDate();
			var endDay = endDate.getDate();
		
			// check if startDay is not 1 (IE contract starts mid month)
			if (startDay != 1)
				{
					// increase contractTerm by 1
					contractTerm++;
				}
			
			// get the billing type of the contract
	    	var billingType = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_billing_type'
	    	});
	    	
	    	// check if the billing type is 6 (AMBMA)
	    	if (billingType == '6')
	    		{
	    			// get the annual minimum from the contract record
	    			var annualMinimum = currentRecord.getValue({
	    				fieldId: 'custrecord_bbs_contract_min_ann_use'
	    			});
	    			
	    			// divide annualMinimum by 12 to calculate monthlyMinimum
	    			monthlyMinimum = parseFloat(annualMinimum / 12).toFixed(2);
	    		}
	    	// check if the billing type is 2 (UIOLI)
	    	else if (billingType == '2')
	    		{
	    			// get the monthly minimum from the current record
	    			monthlyMinimum = currentRecord.getValue({
	    				fieldId: 'custrecord_bbs_contract_mon_min_use'
	    			});
	    		}
	    	
	    	// loop through contract term
	    	for (var ct = 1; ct <= contractTerm; ct++)
	    		{
		    		// reset the thisMonthlyMinimum variable's value using the monthlyMinimum variable
	    			thisMonthlyMinimum = monthlyMinimum;
	    		
	    			// check if this is the first month and the startDay is not equal to 1
	    			if (ct == 1 && startDay != 1)
	    				{
		    				// call function to calculate number of days in the startDate month
		        			var daysInMonth = getDaysInMonth(startDate.getMonth(), startDate.getFullYear());
	    				
	    					// calculate the days remaining in the month
							var daysRemaining = daysInMonth - (startDay-1);
							
							// divide thisMonthlyMinimum by daysInMonth to calculate the dailyMinimum
							var dailyMinimum = thisMonthlyMinimum / daysInMonth;
							
							// multiply the dailyMinimum by daysRemaining to calculate the pro rata minimum usage
							thisMonthlyMinimum = parseFloat(dailyMinimum * daysRemaining);
							thisMonthlyMinimum = thisMonthlyMinimum.toFixed(2);
	    				}
	    			else if (ct == contractTerm) // else if this is the last month
	    				{
		    				// call function to calculate number of days in the endDate month
		        			var daysInMonth = getDaysInMonth(endDate.getMonth(), endDate.getFullYear());
		        			
		        			// check if this is not the last day in the month
		        			if (endDay != daysInMonth)
		        				{
			    					// divide thisMonthlyMinimum by daysInMonth to calculate the dailyMinimum
									var dailyMinimum = thisMonthlyMinimum / daysInMonth;
									
									// multiply the dailyMinimum by the endDay to calculate the pro rata minimum usage
									thisMonthlyMinimum = parseFloat(dailyMinimum * endDay);
									thisMonthlyMinimum = thisMonthlyMinimum.toFixed(2);
		        				}
	    				}
	    			
	    			// create a new Contract Minimum Usage record
	    			var contractMinUsageRecord = record.create({
	    				type: 'customrecord_bbs_contract_minimum_usage'
	    			});
	    			
	    			// set fields on the record
	    			contractMinUsageRecord.setValue({
	    				fieldId: 'custrecord_bbs_contract_min_usage_parent',
	    				value: contractID
	    			});
	    			
	    			contractMinUsageRecord.setValue({
	    				fieldId: 'custrecord_bbs_contract_min_usage_month',
	    				value: ct
	    			});
	    			
	    			contractMinUsageRecord.setValue({
	    				fieldId: 'custrecord_bbs_contract_min_usage',
	    				value: thisMonthlyMinimum
	    			});
	    			
	    			// submit the new Contract Minimum Usage record
	    			contractMinUsageRecord.save({
	    				enableSourcing: false,
			    		ignoreMandatoryFields: true
		    		});
	    		}
    	}
    
    // ========================================
    // FUNCTION TO DELETE MINIMUM USAGE RECORDS
    // ========================================
    
    function deleteMinimumUsageRecords(contractRecordID)
    	{
    		/// create search to find minimum usage records for this contract
			var minimumUsageSearch = search.create({
				type: 'customrecord_bbs_contract_minimum_usage',
			
				filters: [{
					name: 'custrecord_bbs_contract_min_usage_parent',
					operator: 'anyof',
					values: [contractRecordID]
				}],
				
				columns: [{
					name: 'internalid'
				}],

			});
		
			// run search and process results
			minimumUsageSearch.run().each(function(result){
				
				// get the internal ID of the record
				var minimumUsageRecord = result.getValue({
					name: 'internalid'
				});
				
				try
	    			{
	    				// delete the record
	    				record.delete({
	    					type: 'customrecord_bbs_contract_minimum_usage',
	    					id: minimumUsageRecord
	    				});
	    			}
				catch(error)
	    			{
	    			
	    			}
			
				// continue processing search results
				return true;
				
			});
    	}
    
    // ============================================
    // FUNCTION TO UPDATE RECURRING PRODUCT RECORDS
    // ============================================
    
    function updateRecurringProducts(contractRecordID, startDate, endDate)
    	{
    		// run search to find existing recurring product records for this contract
    		search.create({
    			type: 'customrecord_bbs_contract_monthly_items',
    			
    			filters: [{
    				name: 'custrecord_bbs_contract_mnth_items_cont',
    				operator: 'anyof',
    				values: [contractRecordID]
    			}],
    			
    			columns: [{
    				name: 'internalid'
    			}],
    			
    		}).run().each(function(result){
    			
    			// get the internal ID of the record
    			var recordID = result.getValue({
    				name: 'internalid'
    			});
    			
    			try
    				{
    					// update the start/end date fields on the product record
    					record.submitFields({
    						type: 'customrecord_bbs_contract_monthly_items',
    						id: recordID,
    						values: {
    							custrecord_bbs_contract_mnth_items_start:	startDate,
    							custrecord_bbs_contract_mnth_items_end:		endDate
    						}
    					});
    					
    					log.audit({
    						title: 'Recurring Product Updated',
    						details: recordID
    					});
    				}
    			catch(e)
    				{
    					log.error({
    						title: 'Error Updating Recurring Product Record',
    						details: 'Record ID: ' + recordID + '<br>Error: ' + e
    					});
    				}
    			
    			// continue processing search results
    			return true;
    			
    		});
    		
    	}
    
    //======================================================
	// FUNCTION TO ADD THE CONTRACT CURRENCY TO THE CUSTOMER
	//======================================================
    
    function addCurrencyToCustomer(customerID, contractCurrency) {
    	
    	try
    		{
    			// declare and initialize variables
    			var addCurrency = true;
    		
    			// load the customer record
    			var customerRecord = record.load({
    				type: record.Type.CUSTOMER,
    				id: customerID,
    				isDynamic: true
    			});
    			
    			// get count of currencies
    			var currencies = customerRecord.getLineCount({
    				sublistId: 'currency'
    			});
    			
    			// loop through currencies
    			for (var i = 0; i < currencies; i++)
    				{
    					// get the currency from the line
    					var lineCurrency = customerRecord.getSublistValue({
    						sublistId: 'currency',
    						fieldId: 'currency',
    						line: i
    					});
    					
    					if (contractCurrency == lineCurrency)
    						{
    							// set addCurrency variable to false
    							addCurrency = false;
    							
    							// break the loop
    							break;
    						}
    				}
    			
    			// if addCurrency variable returns true
    			if (addCurrency == true)
    				{
    					// select a new line on the currency sublist
    					customerRecord.selectNewLine({
    						sublistId: 'currency'
    					});
    					
    					// set currency field on the new line
    					customerRecord.setCurrentSublistValue({
		    				sublistId: 'currency',
		    				fieldId: 'currency',
		    				value: contractCurrency
		    			});
		    			
		    			// commit the new line
		    			customerRecord.commitLine({
		    				sublistId: 'currency'
		    			});
		    			
		    			try
		    				{
			    				// submit the record
					        	customerRecord.save({
					        		ignoreMandatoryFields: true
					        	});
					        			
					        	log.audit({
					        		title: 'Currency Added to Customer Record',
					        		details: 'Record ID: ' + customerID
					        	});
		    				}
		    			catch(e)
		    				{
			    				log.error({
					        		title: 'Error Adding Currency to Customer Record ' + customerID,
					        		details: e
					        	});
		    				}
    				}  			
    		}
    	catch(e)
    		{
	    		log.error({
	        		title: 'Error Adding Currency to Customer Record ' + customerID,
	        		details: e
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

    return {
        beforeLoad: 	contractBL,
        beforeSubmit: 	contractBS,
        afterSubmit: 	contractAS
    };
    
});
