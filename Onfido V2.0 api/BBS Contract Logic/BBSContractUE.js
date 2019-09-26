/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/runtime', 'N/record'],
/**
 * @param {record} record
 */
function(url, runtime, record) {
   
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
		       	// get the oldrecord and newrecord objects
    			var oldRecord = scriptContext.oldRecord;
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the value of the status field from the oldrecord
    			var oldStatus = oldRecord.getValue({
    				fieldId: 'custrecord_bbs_contract_status'
    			});
    			
    			// get the value of the status field from the newrecord
    			var newStatus = currentRecord.getValue({
    				fieldId: 'custrecord_bbs_contract_status'
    			});
    			
    			// check that oldStatus variable does NOT return 1 and the newStatus variable DOES return 1 (IE contract has been edited and status changed to approved)
    			if (oldStatus != 1 && newStatus == 1) // 1 = Approved
    				{
				    	// get the value of the 'setup fee' field from the record
				    	var setupFee = currentRecord.getValue({
				    		fieldId: 'custrecord_bbs_contract_setup_fee'
				    	});
				    	
				    	// check if the setupFee variable returns true (checkbox is ticked)
				    	if (setupFee == true)
				    		{
				    			// get the ID of the current record
				        		var currentRecordID = scriptContext.newRecord.id;
				    		
				    			// retrieve script parameters
					        	var currentScript = runtime.getCurrentScript();
					
					        	var setupFeeItem = currentScript.getParameter({
					    	    	name: 'custscript_bbs_setup_fee_item'
					    	    });
					        	
				    			// get fields values from the current record
				    			var customer = currentRecord.getValue({
				    				fieldId: 'custrecord_bbs_contract_customer'
				    			});
				    			
				    			var setupFeeAmount = currentRecord.getValue({
				    				fieldId: 'custrecord_bbs_contract_setup_fee_amount'
				    			});
				    			
				    			setupFeeAmount = parseFloat(setupFeeAmount);
				    			
				    			try
				    				{
						    			// create a new invoice record
						    			var invoice = record.create({
						    				type: record.Type.INVOICE,
						    				isDynamic: true
						    			});
						    			
						    			// set header fields on the invoice record
						    			invoice.setValue({
						    				fieldId: 'entity',
						    				value: customer
						    			});
						    			
						    			invoice.setValue({
						    				fieldId: 'custbody_bbs_contract_setup_invoice',
						    				value: true
						    			});
						    			
						    			invoice.setValue({
						    				fieldId: 'custbody_bbs_contract_record',
						    				value: currentRecordID
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
						    			
						    			// commit the line
						    			invoice.commitLine({
											sublistId: 'item'
										});
						    			
						    			// submit the invoice record
						    			var invoiceID = invoice.save();
						    			
						    			log.audit({
						    				title: 'Invoice Created',
						    				details: invoiceID
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
					    					title: 'Error creating invoice for record ' + currentRecordID,
					    					details: e
					    				});
					    			}    		
				    		}
    				}
    		}
    }

    return {
        beforeLoad: contractBL,
        beforeSubmit: contractBS,
        afterSubmit: contractAS
    };
    
});
