/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/runtime', 'N/render', 'N/email'],
function(search, runtime, render, email) {
   
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
    	
    	// check the record is being viewed
    	if (scriptContext.type == scriptContext.UserEventType.VIEW)
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the status of the transaction
    			var transactionStatus = currentRecord.getValue({
    				fieldId: 'status'
    			});
    			
    			// if transactionStatus = Pending Approval
    			if (transactionStatus == 'Pending Approval')
    				{
		    			// get the internal ID of the customer
		    			var customerID = currentRecord.getValue({
		    				fieldId: 'entity'
		    			});
		    			
		    			// call function to check if the customer has exceeded their credit limit OR has an overdue balance
						var creditControlApproval = checkCreditControlApproval(customerID);
						
						// get the internal ID of the current user's role
		    			var userRole = runtime.getCurrentUser().role;
		    			
		    			// retrieve script parameters
		    			var approvalRole = runtime.getCurrentScript().getParameter({
		    				name: 'custscript_bbs_so_approval_role'
		    			});
		    			
		    			// check the user's role is not 3 (Administrator) OR approvalRole AND creditControlApproval returns true
		    			if (userRole != 3 && userRole != approvalRole && creditControlApproval == true)
		    				{
		    					// hidden the approval button
		    					scriptContext.form.getButton({
						    		id: 'approve'
						    	}).isHidden = true;
		    				}
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
    	
    	// check the record is being created
    	if (scriptContext.type == scriptContext.UserEventType.CREATE)
    		{
	    		// get the current record
				var currentRecord = scriptContext.newRecord;
				
				// get the internal ID of the current record
				var recordID = currentRecord.id;
			
				// get the internal ID of the customer
				var customerID = currentRecord.getValue({
					fieldId: 'entity'
				});
				
				// call function to check if the customer has exceeded their credit limit OR has an overdue balance
				var creditControlApproval = checkCreditControlApproval(customerID);
				
				// if creditControlApproval returns true
				if (creditControlApproval == true)
					{
						// call function to send email to office admin
						sendEmail(recordID);
					}
    		}

    }
    
    // ===========================================================================================
    // FUNCTION TO CHECK IF THE CUSTOMER HAS EXCEEDED THEIR CREDIT LIMIT OR HAS AN OVERDUE BALANCE
    // ===========================================================================================
    
    function checkCreditControlApproval(customerID) {
    	
    	// declare and initialize variables
    	var creditControlApproval = false;
    	
    	// lookup fields on the customer record
    	var customerLookup = search.lookupFields({
    		type: search.Type.CUSTOMER,
    		id: customerID,
    		columns: ['creditlimit', 'balance', 'unbilledorders', 'overduebalance']
    	});
    	
    	// retrieve values from the customerLookup object
		var creditLimit = customerLookup.creditlimit;
		var balance		= customerLookup.balance;
		var unbilled	= customerLookup.unbilledorders;
		var overdue		= customerLookup.overduebalance;
		
		// do we have a credit limit
		if (creditLimit)
			{
				// use parseFloat to convert to number
				creditLimit = parseFloat(creditLimit);
			}
		
		// do we have a balance
		if (balance)
			{
				// use parseFloat to convert to number
				balance = parseFloat(balance);
			}
		else
			{
				// set balance to 0
				balance = 0;
			}
		
		// do we have an unbilled balance
		if (unbilled)
			{
				// use parseFloat to conver to number
				unbilled = parseFloat(unbilled);
			}
		else
			{
				// set unbilled to 0
				unbilled = 0;
			}
		
		// do we have an overdue balance
		if (overdue)
			{
				// use parseFloat to convert to number
				overdue = parseFloat(overdue);
			}
		else
			{
				// set overdue to 0
				overdue = 0;
			}
		
		// add unbilled and balance together
		balance = balance + unbilled;
		
		// if we have a creditLimit AND the customer exceeded their credit limit OR has an overdue balance
		if ((creditLimit && balance > creditLimit) || overdue > 0)
			{
				// set creditControlApproval variable to true
				creditControlApproval = true;
			}
		
		// return creditControlApproval variable to main script function
		return creditControlApproval;
    	
    }
    
    // ======================================
    // FUNCTION TO SEND EMAIL TO OFFICE ADMIN
    // ======================================
    
    function sendEmail(recordID) {
    	
    	// retrieve script parameters
    	var currentScript = runtime.getCurrentScript();
    	
    	var emailSender = currentScript.getParameter({
    		name: 'custscript_bbs_so_approval_email_sender'
    	});
    	
    	var emailRecipient = currentScript.getParameter({
    		name: 'custscript_bbs_so_approval_email_recip'
    	});
    	
    	var emailTemplate = currentScript.getParameter({
    		name: 'custscript_bbs_so_approval_email_temp'
    	});
    	
    	try
			{
	    		// compile email content
	    	    var mergeResult = render.mergeEmail({
	    	    	templateId: 	emailTemplate,
	    	    	transactionId:	recordID
	    	    });
	    	    
	    	    // get the email subject and body from the mergeResult object
	    	    var emailSubject = mergeResult.subject;
	    	    var emailBody = mergeResult.body;
	    	    	
	    	    // send the statement to the customer with the PDF statement attached
	    	    email.send({
	    	    	author: 		emailSender,
	    	    	recipients:		emailRecipient,
	    	    	subject:		emailSubject,
	    	    	body:			emailBody,
	    	    	relatedRecords: {
	    	    		transactionId: recordID
	    	    	}
	    	    });
			}
		catch(e)
			{
	    		log.error({
					title: 'Error Sending Email',
					details: e
				});
			}
    }

    return {
        beforeLoad: beforeLoad,
        afterSubmit: afterSubmit
    };
    
});
