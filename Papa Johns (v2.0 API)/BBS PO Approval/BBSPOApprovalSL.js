/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search', 'N/render', 'N/email'],
function(record, runtime, search, render, email) {
   
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
    		name: 'custscript_bbs_po_approval_sl_email_temp'
    	});
    	
    	// retrieve parameters that were passed from the client script
    	var recordID = context.request.parameters.id;
    		recordID = parseInt(recordID); // use parseInt to convert to a number
    	var rejectionReason = context.request.parameters.reason;
    	
    	try
    		{
		    	// set the 'BBS - REJECTION REASON' and 'BBS APPROVAL STATUS' fields on the purchase order
		    	record.submitFields({
		    		type: record.Type.PURCHASE_ORDER,
		    		id: recordID,
		    		values:	{
		    			custbody_bbs_rejection_reason: rejectionReason,
		    			custbody_bbs_appr_status: '3' // 3 = Rejected
		    		}
		    	});
    		}
    	catch(error)
	    	{
	    		log.error({
	    			title: 'Error Updating Record',
	    			details: 'Record ID: ' + recordID + ' | Error: ' + error
	    		});
	    	}
    	
    	// get the internal ID of the current user
    	var currentUser = runtime.getCurrentUser().id;
    	
    	// lookup fields on the purchase order record
    	var poLookup = search.lookupFields({
    		type: search.Type.PURCHASE_ORDER,
    		id: recordID,
    		columns: ['custbody_bbs_po_requestor']
    	});
    	
    	// retrieve values from the poLookup
    	var poRequestor = poLookup.custbody_bbs_po_requestor[0].value;
    	
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
	        		recipients: poRequestor,
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

    return {
        onRequest: onRequest
    };
    
});
