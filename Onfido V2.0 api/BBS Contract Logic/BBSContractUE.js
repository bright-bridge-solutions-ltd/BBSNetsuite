/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/runtime', 'N/record', 'N/search', 'N/format', 'N/task'],
/**
 * @param {record} record
 */
function(url, runtime, record, search, format, task) {
	
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script	
	qmpItem = currentScript.getParameter({
    	name: 'custscript_bbs_qmp_item'
    });
	
	ampItem = currentScript.getParameter({
    	name: 'custscript_bbs_amp_item'
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
						scriptContext.form.clientScriptFileId = 47097;
		    		
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
    	
    	// check if the record is being created
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
	    		// get the oldRecord and newRecord objects
				var oldRecord = scriptContext.oldRecord;
				var currentRecord = scriptContext.newRecord;
    			
    			// get the internal ID of the custoemr from the currentRecord object
			    var customer = currentRecord.getValue({
					fieldId: 'custrecord_bbs_contract_customer'
				});
    			
    			// get the value of the 'Consolidated Invoicing Required' field from the currentRecord object
    			var consolInvReq = currentRecord.getValue({
    				fieldId: 'custrecord_bbs_contract_consol_inv'
    			});
    			
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
	        			
	        			// get the value of the 'billing type' field from the currentRecord object
	    		    	var billingType = currentRecord.getValue({
	    		    		fieldId: 'custrecord_bbs_contract_billing_type'
	    		    	});
        			
	        			// check that oldStatus variable does NOT return 1 and the newStatus variable DOES return 1 (IE contract has been edited and status changed to approved)
	        			if (oldStatus != 1 && newStatus == 1) // 1 = Approved
	        				{
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
	    				    	else
	    				    		{
		    				    		// get the value of the 'setup fee' field from the currentRecord object
		    					    	var setupFee = currentRecord.getValue({
		    					    		fieldId: 'custrecord_bbs_contract_setup_fee'
		    					    	});
		    					    	
		    					    	// get the value of the 'setup fee billed' field from the currentRecord object
		    					    	var setupFeeBilled = currentRecord.getValue({
		    					    		fieldId: 'custrecord_bbs_contract_setup_fee_billed'
		    					    	});
		    					    	
		    					    	// check if the setupFee variable returns true (checkbox is ticked) and setupFeeBilled variable returns false (checkbox is NOT ticked)
		    					    	if (setupFee == true && setupFeeBilled == false)
		    					    		{
		    					    			// call function to create initial invoices. Pass currentRecordID, qmpAmt, billingType, setupFeeInvoice and prepaymentInvoice
			    								createInitialInvoices(currentRecordID, '0.00', billingType, 'T', 'F');
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
	    	    						createPrepaymentInvoice(currentRecordID, difference, billingType);
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
	    	    						createPrepaymentInvoice(currentRecordID, difference, billingType);
	    							}
	        				}
    	    		}
    		}
    }

    //==================================
	// FUNCTION FOR THE QMP BILLING TYPE
	//==================================
    
    function QMP(billingType, currentRecord, currentRecordID)
    	{
	    	// declare and initialize variables
    		var setupFeeInvoice = 'F';
    		var prepaymentInvoice = 'F';
    	
    		// get the minimum usage from the current record			
			var qmpAmt = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_qu_min_use'
			});
			
			// use parseFloat to convert to decimal number
			qmpAmt = parseFloat(qmpAmt);
			
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
					// set the prepaymentInvoice variable to 'T'
					prepaymentInvoice = 'T';
				}
			
			// get the value of the 'setup fee' field from the currentRecord object
	    	var setupFee = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_setup_fee'
	    	});
	    	
	    	// get the value of the 'setup fee billed' field from the currentRecord object
	    	var setupFeeBilled = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_setup_fee_billed'
	    	});
	    	
	    	// check if the setupFee variable returns true (checkbox is ticked) and setupFeeBilled variable returns false (checkbox is NOT ticked)
	    	if (setupFee == true && setupFeeBilled == false)
	    		{
		    		// set setupFeeInvoice variable to 'T'
	    			setupFeeInvoice = 'T';
	    		}
	    	
	    	// call function to create initial invoices. Pass currentRecordID, qmpAmt, billingType, setupFeeInvoice and prepaymentInvoice
			createInitialInvoices(currentRecordID, qmpAmt, billingType, setupFeeInvoice, prepaymentInvoice);
    	}
    
    //==================================
	// FUNCTION FOR THE AMP BILLING TYPE
	//==================================
    
    function AMP(billingType, currentRecord, currentRecordID)
    	{
	    	// declare and initialize variables
			var setupFeeInvoice = 'F';
			var prepaymentInvoice = 'F';
			
			// get the minimum usage from the currentRecord object			
			var ampAmt = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_min_ann_use'
			});
			
			// use parseFloat to convert to decimal number
			ampAmt = parseFloat(ampAmt);
    	
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
					// set the prepaymentInvoice variable to 'T'
					prepaymentInvoice = 'T';
				}
			
			// get the value of the 'setup fee' field from the currentRecord object
	    	var setupFee = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_setup_fee'
	    	});
	    	
	    	// get the value of the 'setup fee billed' field from the currentRecord object
	    	var setupFeeBilled = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_setup_fee_billed'
	    	});
	    	
	    	// check if the setupFee variable returns true (checkbox is ticked) and setupFeeBilled variable returns false (checkbox is NOT ticked)
	    	if (setupFee == true && setupFeeBilled == false)
	    		{
		    		// set setupFeeInvoice variable to 'T'
	    			setupFeeInvoice = 'T';
	    		}
	    	
	    	// check that EITHER the setupFeeInvoice OR prepaymentInvoice variables return 'T'
	    	if (setupFeeInvoice == 'T' || prepaymentInvoice == 'T')
	    		{
	    			// call function to create initial invoices. Pass currentRecordID, ampAmt, billingType, setupFeeInvoice and prepaymentInvoice
	    			createInitialInvoices(currentRecordID, ampAmt, billingType, setupFeeInvoice, prepaymentInvoice);
	    		}
    	}
   
    //==================================
	// FUNCTION FOR THE QUR BILLING TYPE
	//==================================
    
    function QUR(billingType, currentRecord, currentRecordID)
    	{
    		// declare and initialize variables
			var setupFeeInvoice = 'F';
			var prepaymentInvoice = 'F';
    	
    		// get the minimum usage from the currentRecord object			
			var qmpAmt = currentRecord.getValue({
				fieldId: 'custrecord_bbs_contract_qu_min_use'
			});
			
			// use parseFloat to convert to decimal number
			qmpAmt = parseFloat(qmpAmt);
			
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
					// set the prepaymentInvoice variable to 'T'
					prepaymentInvoice = 'T';
				}
			
			// get the value of the 'setup fee' field from the currentRecord object
	    	var setupFee = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_setup_fee'
	    	});
	    	
	    	// get the value of the 'setup fee billed' field from the currentRecord object
	    	var setupFeeBilled = currentRecord.getValue({
	    		fieldId: 'custrecord_bbs_contract_setup_fee_billed'
	    	});
	    	
	    	// check if the setupFee variable returns true (checkbox is ticked) and setupFeeBilled variable returns false (checkbox is NOT ticked)
	    	if (setupFee == true && setupFeeBilled == false)
	    		{
		    		// set setupFeeInvoice variable to 'T'
	    			setupFeeInvoice = 'T';
	    		}
	    	
	    	// call function to create initial invoices. Pass currentRecordID, ampAmt, billingType, setupFeeInvoice and prepaymentInvoice
			createInitialInvoices(currentRecordID, qmpAmt, billingType, setupFeeInvoice, prepaymentInvoice);
    	}
    
    // ===================================
    // FUNCTION TO CREATE INITIAL INVOICES
    // ===================================
    
    function createInitialInvoices(contractRecord, prepaymentInvoiceAmt, billingType, setupFeeInvoice, prepaymentInvoice)
    	{
	    	// declare and initiate variables
			var prepaymentItem;
		
			// check if the billingType is 3 (QMP) or 5 (QUR)
			if (billingType == '3' || billingType == '5')
				{
					// set the prepaymentItem variable using the qmpItem variable
					prepaymentItem = qmpItem;
				}
			else // billingType is 4 (AMP)
				{
					// set the prepaymentItem variable using the ampItem variable
					prepaymentItem = ampItem;
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

    return {
        beforeLoad: contractBL,
        beforeSubmit: contractBS,
        afterSubmit: contractAS
    };
    
});
