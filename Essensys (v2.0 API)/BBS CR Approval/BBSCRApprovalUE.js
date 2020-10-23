/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/url', 'N/https', 'N/record'],
function(runtime, url, https, record) {
   
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
    	
    	// check if the record is being viewed
    	if (scriptContext.type == scriptContext.UserEventType.VIEW)
    		{
		    	// get the current record
		    	var currentRecord = scriptContext.newRecord; 
		    	
		    	// get the value of the 'Approval Status' field
		    	var approvalStatus = currentRecord.getValue({
		    		fieldId: 'custbody_bbs_approval_status'
		    	});
		    	
		    	// get the value of the 'Status' field
		    	var status = currentRecord.getValue({
		    		fieldId: 'status'
		    	});
		    	
		    	// get the value of the 'Next Approver' field
		    	var nextApprover = currentRecord.getValue({
		    		fieldId: 'custbody_bbs_next_approver'
		    	});
		    	
		    	// get the ID of the current user
		    	var currentUserID = runtime.getCurrentUser().id;
		    	
		    	// get the current user's role
		    	var currentUserRole = runtime.getCurrentUser().role;
		    	
		    	// if approvalStatus is 3 (Pending Approval) and status is Pending Approval and nextApprover is currentUserID OR currentUserRole is 3 (Administrator)
		    	if (approvalStatus == 3 && status == 'Pending Approval' && (nextApprover == currentUserID || currentUserRole == 3))
		    		{
			    		// get ID of current record
			        	var recordID = scriptContext.newRecord.id;
			        	
			        	// set client script to run on the form
			        	scriptContext.form.clientScriptFileId = 44912;
			        	
			        	// add buttons to the form
			        	scriptContext.form.addButton({
			    			id: 'custpage_approve',
			    			label: 'Approve',
			    			functionName: "approve(" + recordID + ")" // call client script when button is clicked. Pass recordID, invoiceID and level1Approved to client script
			    		});
			        	
			        	scriptContext.form.addButton({
			    			id: 'custpage_reject',
			    			label: 'Reject',
			    			functionName: "reject(" + recordID + ")" // call client script when button is clicked. Pass recordID to client script
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
    	
    	// check the record is being edited or approved
    	if (scriptContext.type == scriptContext.UserEventType.EDIT || scriptContext.type == scriptContext.UserEventType.APPROVE)
    		{
    			// get the old and new versions of the record
    			var oldRecord 		= scriptContext.oldRecord;
    			var currentRecord	= scriptContext.newRecord;
    			
    			// get the status from the old/current record
    			var oldStatus = oldRecord.getValue({
    				fieldId: 'status'
    			});
    			
    			var newStatus = currentRecord.getValue({
    				fieldId: 'status'
    			});
    			
    			// if the status has changed from Pending Approval to B (Pending Receipt)
    			if (oldStatus == 'Pending Approval' && newStatus == 'B')
    				{
	    				// get the internal ID of the current record
    					var recordID = currentRecord.id;
    				
    					// get the related invoice from the current record
    					var invoiceID = currentRecord.getValue({
    						fieldId: 'createdfrom'
    					});
    				
    					// call function to transform the RMA into a Credit Memo. Pass recordID and invoiceID
	    	        	var creditMemoID = transformToCreditMemo(recordID, invoiceID);
	    	        	
	    	        	// if we have been able to create the credit memo
	    	        	if (creditMemoID)
	    	        		{
	    	        			// call function to close the RMA record
	    	        			closeRMA(recordID, creditMemoID);
	    	        		}
    				}   			
    		}

    }
    
    // ================================================
    // FUNCTION TO TRANSFORM THE RMA INTO A CREDIT MEMO
    // ================================================
    
    function transformToCreditMemo(recordID, invoiceID) {
    		
    	// declare and initialize variables
    	var creditMemoRecordID = null;
    	
    	try
	    	{
			    // transform the RMA into a credit memo
	    		var creditMemoRecord = record.transform({
	    			fromType: record.Type.RETURN_AUTHORIZATION,
	    			fromId: recordID,
	    			toType: record.Type.CREDIT_MEMO
	    		});
	    			
	    		// get count of 'Apply' sublist lines
	    		var lineCount = creditMemoRecord.getLineCount({
	    			sublistId: 'apply'
	    		});
	    			
	    		// loop through 'Apply' sublist
	    		for (var i = 0; i < lineCount; i++)
	    			{
	    				// get the invoice ID for the current line
	    				var lineInvoiceID = creditMemoRecord.getSublistValue({
	    					sublistId: 'apply',
	    					fieldId: 'internalid',
	    					line: i
	    				});
	    					
	    				// is lineInvoiceID the same as the invoiceID
	    				if (lineInvoiceID == invoiceID)
	    					{
	    						// tick the 'Apply' checkbox for the line
	    						creditMemoRecord.setSublistValue({
	    							sublistId: 'apply',
	    							fieldId: 'apply',
	    							value: true,
	    							line: i
	    						});
	    					}
	    			}
	    			
	    		// save the credit memo record
	    		creditMemoRecordID = creditMemoRecord.save({
	    			ignoreMandatoryFields: true
	    		});
	    			
	    		log.audit({
	    			title: 'Credit Memo Record Created',
	    			details: creditMemoRecordID
	    		});
	    	}
	    catch(e)
	    	{
	    		log.error({
	    			title: 'Error Creating Credit Memo Record',
	    			details: e
	    		});
	    	}
	    
	    return creditMemoRecordID;
    }
    
    // =================================
    // FUNCTION TO UPDATE THE RMA RECORD
    // =================================
    
    function closeRMA(recordID, creditMemoID) {
    	
    	try
			{
		    	// reload the RMA record
    			var rmaRecord = record.load({
    				type: record.Type.RETURN_AUTHORIZATION,
			    	id: recordID,
			    	isDynamic: true
    			});
    			
    			// set the credit note field and approval status
    			rmaRecord.setValue({
    				fieldId: 'custbody_bbs_related_credit_note',
    				value: creditMemoID
    			});
    			
    			rmaRecord.setValue({
    				fieldId: 'custbody_bbs_approval_status',
    				value: 6 // 6 = Approved
    			});
    			
    			// get count of item lines
    			var lineCount = rmaRecord.getLineCount({
    				sublistId: 'item'
    			});
    			
    			// loop through items
    	    	for (var i = 0; i < lineCount; i++)
    	    		{
    	    			// select the line
    	    			rmaRecord.selectLine({
    	    				sublistId: 'item',
    	    				line: i
    	    			});
    	    			
    	    			// set the closed checkbox
    	    			rmaRecord.setCurrentSublistValue({
    	    				sublistId: 'item',
    	    				fieldId: 'isclosed',
    	    				value: true
    	    			});
    	    			
    	    			// commit the new line
    	    			rmaRecord.commitLine({
    						sublistId: 'item'
    					});
    	    		}
    	    	
    	    	// save the RMA record
    	    	rmaRecord.save({
    	    		ignoreMandatoryFields: true
    	    	});
			}
		catch(e)
			{
				log.error({
					title: 'Error Updating RMA Record',
					details: 'ID: ' + recordID + '<br>Error: ' + e
				});
			}
    	
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
