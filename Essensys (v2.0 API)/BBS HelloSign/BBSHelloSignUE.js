/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['./BBSHelloSignLibrary', 'N/record', 'N/render'],
function(helloSignLibrary, record, render) {
   
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
    	
    	// check the record is being created
    	if (scriptContext.type == scriptContext.UserEventType.CREATE)
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// re-set HelloSign fields
    			currentRecord.setValue({
    				fieldId: 'custbody_bbs_hellosign_sig_request_id',
    				value: null
    			});
    			
    			currentRecord.setValue({
    				fieldId: 'custbody_bbs_hellosign_errors',
    				value: null
    			});
    			
    			currentRecord.setValue({
    				fieldId: 'custbody_bbs_hellosign_is_complete',
    				value: false
    			});
    			
    			currentRecord.setValue({
    				fieldId: 'custbody_bbs_hellosign_is_declined',
    				value: false
    			});
    			
    			currentRecord.setValue({
    				fieldId: 'custbody_bbs_hellosign_is_cancelled',
    				value: false
    			});
    			
    			currentRecord.setValue({
    				fieldId: 'custbody_bbs_hellosign_next_signer',
    				value: null
    			});
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
    function afterSubmit(scriptContext) {
    	
    	// declare and initialize variables
    	var runScript = false;
    	
    	// get the current record
    	var currentRecord 	= scriptContext.newRecord;
    	
    	// get the approval status from the current record
    	var approvalStatus = currentRecord.getValue({
    		fieldId: 'custbody_bbs_approval_status'
    	});
    	
    	// get the value of the HelloSign Is Complete checkbox
    	var helloSignIsComplete = currentRecord.getValue({
    		fieldId: 'custbody_bbs_hellosign_is_complete'
    	});
    	
    	// if the record is being created AND the approvalStatus is 4 (Approved - Pending Signatures AND helloSignIsComplete is false)
    	if (scriptContext.type == scriptContext.UserEventType.CREATE && approvalStatus == 4 && helloSignIsComplete == false)
    		{
    			// set runScript variable to true
    			runScript = true;
    		}
    	else if (scriptContext.type == scriptContext.UserEventType.EDIT) // if the record is being edited
    		{
    			// get the old approval status
	    		var oldApprovalStatus = scriptContext.oldRecord.getValue({
		    		fieldId: 'custbody_bbs_approval_status'
		    	});
	    		
	    		// if the status has changed from 2 (Finance Approval) to 4 (Approved - Pending Signatures) AND helloSignIsComplete = false
		    	if (oldApprovalStatus == 2 && approvalStatus == 4 && helloSignIsComplete == false)
		    		{
			    		// set runScript variable to true
		    			runScript = true;
		    		}
    		}
    	
    	// if runScript is true
    	if (runScript == true)
    		{
    			// get the configuration
	    		var configuration = helloSignLibrary.getConfiguration();
	    			
	    		// have we got managed to retrieve the configuration
	    		if (configuration)
	    			{
	    				try
		    				{
	    							
	    						// reload the current record
		    					currentRecord = record.load({
		    						type: record.Type.SALES_ORDER,
		    						id: currentRecord.id
		    					});
		    							
		    					// get the internal ID of the customer
		    					var customerID = currentRecord.getValue({
		    						fieldId: 'entity'
		    					});
		    							
		    					// render the email template
		    					var mergeResult = render.mergeEmail({
		    						templateId: configuration.emailTemplate,
		    						transactionId: currentRecord.id
		    					});
		    							
		    					// construct a send signature request object
								var sendSignatureRequestObj 			= new helloSignLibrary.libSendSignatureRequest();
								sendSignatureRequestObj.test_mode		= configuration.testMode;
								sendSignatureRequestObj.allow_decline	= configuration.allowDecline;
								sendSignatureRequestObj.allow_reassign	= configuration.allowReassign;
								sendSignatureRequestObj.subject			= mergeResult.subject;
								sendSignatureRequestObj.message			= mergeResult.body.replace(/(<([^>]+)>)/gi, ""); // strip HTML tags
										
								// call function to generate the PDF
								var contractPDF = helloSignLibrary.generatePDF(currentRecord.id, configuration.fileCabinetFolderID);
								var fileURL		= contractPDF.url;
								var fileID		= contractPDF.id;
										
								// push the file's URL to the request object
								sendSignatureRequestObj.file_url.push(fileURL);
										
								// call function to get the signers from the customer record
		    					var helloSignSigners = helloSignLibrary.getHelloSignContacts(customerID);
		    							
		    					// have we got a primary signer
		    					if (helloSignSigners.primaryName)
		    						{
		    							// create a new signers object and push it to the signers array
		    							sendSignatureRequestObj.signers.push(new helloSignLibrary.libSignerObj(helloSignSigners.primaryName, helloSignSigners.primaryEmail, sendSignatureRequestObj.signers.length));
		    						}
		    							
		    					// have we got a secondary signer
		    					if (helloSignSigners.secondaryName)
		    						{
			    						// create a new signers object and push it to the signers array
		    							sendSignatureRequestObj.signers.push(new helloSignLibrary.libSignerObj(helloSignSigners.secondaryName, helloSignSigners.secondaryEmail, sendSignatureRequestObj.signers.length));
		    						}
		    							
		    					// call function to return the essensys signers from the subsidiary record
		    					var essensysSigner = helloSignLibrary.getEssensysSigner(currentRecord.getValue({fieldId: 'subsidiary'}));
		    							
		    					// have we got an essensys signer
		    					if (essensysSigner.name)
		    						{
			    						// create a new signers object and push it to the signers array
		    							sendSignatureRequestObj.signers.push(new helloSignLibrary.libSignerObj(essensysSigner.name, essensysSigner.email, sendSignatureRequestObj.signers.length));
		    						}
		    							
		    					// call function to make the API call to send the signature request
								var sendSignatureRequest = helloSignLibrary.sendSignatureRequest(sendSignatureRequestObj);
										
								// call function to delete the unsigned contract file
								helloSignLibrary.deleteUnsignedFile(fileID);
										
								// declare and initialize variables
								var signatureRequestID 	= 	null;
								var errorMessages		=	'';
										
								// check the result of the API call
								if (sendSignatureRequest != null && sendSignatureRequest.httpResponseCode == '200')
									{
										// call function to create HelloSign recipients records
			    						helloSignLibrary.createHellosignRecipientRecords(currentRecord.id, sendSignatureRequestObj.signers);
											
										// get the signature request ID
										signatureRequestID = sendSignatureRequest.apiResponse.signature_request.signature_request_id;
									}
								else
									{
										// add the API response to the error messages
										errorMessages = sendSignatureRequest.apiResponse.error.error_msg;
									}
										
								try
									{
										record.submitFields({
											type: record.Type.SALES_ORDER,
											id: currentRecord.id,
											values: {
												custbody_bbs_hellosign_sig_request_id:	signatureRequestID,
												custbody_bbs_hellosign_errors:			errorMessages,
												custbody_bbs_hellosign_is_complete:		false,
												custbody_bbs_hellosign_is_declined:		false,
												custbody_bbs_hellosign_next_signer:		helloSignSigners.primaryEmail
											}
										});
									}
								catch(e)
									{
										log.error({
											title: 'Error Updating Transaction',
											details: e
										});
									}
		    				}
		    			catch(e)
		    				{
		    					log.error({
		    						title: 'Error Making Send Signature Request',
		    						details: e
		    					});
		    				}
		    		}
    		}
    	
    	if (scriptContext.type == scriptContext.UserEventType.CANCEL) // if the order has been cancelled
    		{
	    		// get the configuration
				var configuration = helloSignLibrary.getConfiguration();
				
				// have we got managed to retrieve the configuration
				if (configuration)
					{
		    			// get the signature request ID
						var signatureRequestID = scriptContext.newRecord.getValue({
							fieldId: 'custbody_bbs_hellosign_sig_request_id'
						});
						
						// if we have a signature request id
						if (signatureRequestID)
							{
								// make an API call to cancel the signature request
								var cancelSignatureRequest = helloSignLibrary.cancelSignatureRequest(signatureRequestID);
								
								// declare and initialize variables
								var isCancelled 	= false;
								var errorMessages	= null;
								
								// check the result of the API call
								if (cancelSignatureRequest != null && cancelSignatureRequest.httpResponseCode == '200')
									{
										// set isCancelled variable to true
										isCancelled = true;
									}
								else
									{
										// add the API response to the error messages
										errorMessages = cancelSignatureRequest.apiResponse.error.error_msg;
									}
								
								try
									{
										record.submitFields({
											type: record.Type.SALES_ORDER,
											id: scriptContext.newRecord.id,
											values: {
												custbody_bbs_hellosign_errors:			errorMessages,
												custbody_bbs_hellosign_is_cancelled:	isCancelled,
												custbody_bbs_hellosign_next_signer:		null
											}
										});
									}
								catch(e)
									{
										log.error({
											title: 'Error Updating Transaction',
											details: e
										});
									}
							}
					}
    		}

    }

    return {
        beforeSubmit: beforeSubmit,
    	afterSubmit: afterSubmit
    };
    
});
