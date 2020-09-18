/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['./BBSHelloSignLibrary', 'N/record'],
function(helloSignLibrary, record) {
   
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
    	
    	// check the record is being edited
    	if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
		    	// get the old and new record objects
		    	var oldRecord 		= scriptContext.oldRecord;
		    	var currentRecord 	= scriptContext.newRecord;
		    	
		    	// get the approval status from the old/new record objects
		    	var oldStatus = oldRecord.getValue({
		    		fieldId: 'custbody_bbs_approval_status'
		    	});
		    	
		    	var newStatus = currentRecord.getValue({
		    		fieldId: 'custbody_bbs_approval_status'
		    	});
		    	
		    	// if the status has changed from 2 (Finance Approval) to 4 (Approved - Pending Signatures)
		    	if (oldStatus == 2 && newStatus == 4)
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
		    							
		    							// construct a send signature request object
										var sendSignatureRequestObj 			= new helloSignLibrary.libSendSignatureRequest();
										sendSignatureRequestObj.test_mode		= configuration.testMode;
										sendSignatureRequestObj.allow_decline	= configuration.allowDecline;
										sendSignatureRequestObj.allow_reassign	= configuration.allowReassign;
										sendSignatureRequestObj.subject			= configuration.subject;
										sendSignatureRequestObj.message			= configuration.message;
										
										// call function to generate the PDF and return it's URL. Push it to the file_url array
		    							sendSignatureRequestObj.file_url.push(helloSignLibrary.generatePDF(currentRecord.id, configuration.fileCabinetFolderID));
										
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
										
										// declare and initialize variables
										var signatureRequestID 	= 	null;
										var errorMessages		=	'';
										
										// check the result of the API call
										if (sendSignatureRequest != null && sendSignatureRequest.httpResponseCode == '200')
											{
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
														custbody_bbs_hellosign_is_declined:		false
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
		    								title: 'Error Occured Making Send Signature Request',
		    								details: e
		    							})
		    						}
		    				}
		    		}
    		}

    }

    return {
        afterSubmit: afterSubmit
    };
    
});
