/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/search', 'N/render', 'N/email'],
function(runtime, record, search, render, email) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	// retrieve script parameters
    	var templateID = runtime.getCurrentScript().getParameter({
    		name: 'custscript_bbs_so_approval_sl_email_temp'
    	});
    	
    	// retrieve parameters that were passed from the client script
    	var recordID = context.request.parameters.id;
    		recordID = parseInt(recordID); // use parseInt to convert to a number
    	var rejectionReason = context.request.parameters.reason;
    	
    	try
    		{
		    	// set the 'Rejection Reason' and 'Approval Status' fields on the sales order
		    	record.submitFields({
		    		type: record.Type.SALES_ORDER,
		    		id: recordID,
		    		values:	{
		    			custbody_bbs_rejected_reason: rejectionReason,
		    			custbody_bbs_approval_status: 5 // 5 = Rejected
		    		},
		    		enableSourcing: false,
					ignoreMandatoryFields: true
		    	});
		    	
		    	// get the internal ID of the current user
		    	var currentUser = runtime.getCurrentUser().id;
		    	
		    	// lookup fields on the sales order record
		    	var soLookup = search.lookupFields({
		    		type: search.Type.SALES_ORDER,
		    		id: recordID,
		    		columns: ['salesrep']
		    	});
		    	
		    	// retrieve values from the poLookup
		    	var salesRep = soLookup.salesrep[0].value;
		    	
		    	// compile email content
		    	var mergeResult = render.mergeEmail({
		    		templateId: templateID,
		    		entity: null,
		    		recipient: null,
		    		customRecord: null,
		    		supportCaseId: null,
		    		transactionId: recordID
		    	});
		    	
		    	var emailSubject = mergeResult.subject;
		    	var emailBody = mergeResult.body;
		    	
		    	try
		    		{
			    		// send email to the user listed in the 'BBS PO REQUESTOR' field on the PO
			        	email.send({
			        		author: currentUser,
			        		recipients: salesRep,
			        		subject: emailSubject,
			        		body: emailBody,
			        		relatedRecords:	{
			        			transactionId: recordID
			        		}
			        	});
		    		}
		    	catch(error)
		    		{
		    			log.error({
		    				title: 'Error Sending Email',
		    				details: 'Record ID: ' + recordID + ' | Error: ' + error
		    			});
		    		}		    	
		    	
    		}
    	catch(error)
	    	{
	    		log.error({
	    			title: 'Error Updating Record',
	    			details: 'Record ID: ' + recordID + ' | Error: ' + error
	    		});
	    	}

    }

    return {
        onRequest: onRequest
    };
    
});
