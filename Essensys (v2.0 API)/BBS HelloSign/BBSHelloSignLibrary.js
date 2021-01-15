/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', 'N/encode', 'N/https', 'N/render', 'N/file', 'N/record', 'N/url'],
/**
 * @param {record} record
 * @param {search} search
 */
function(search, encode, https, render, file, record, url) 
{

	// =======
	// OBJECTS
	// =======
	
	function libSendSignatureRequest(){
		
		this.test_mode			= null;
		this.file_url			= [];
		this.subject			= null;
		this.message			= null;
		this.signers			= [];
		this.allow_decline		= null;
		this.allow_reassign		= null;

	}
	
	function libSignerObj(name, emailAddress, order){
		
		this.name			= name;
		this.email_address	= emailAddress;
		this.order			= order;
	
	}
	
	function libConfigObj() {
		
		this.credentialsEncoded 			= null;
		this.endpointSendSignatureRequest	= null;
		this.endpointGetSignatureRequest	= null;
		this.endpointCancelSignatureRequest	= null;
		this.endpointGetFiles				= null;
		this.emailTemplate					= null;
		this.testMode						= null;
		this.allowDecline					= null;
		this.allowReassign					= null;
		this.fileCabinetFolderID			= null;

	}
	
	function libGenericResponseObj(){
		
		this.httpResponseCode	= null;
		this.responseMessage 	= null;
		this.apiResponse		= {};
	
	}

	// =======
	// METHODS
	// =======
	
	function sendSignatureRequest(_sendSignatureRequest){
		
		// declare and initialize variables
		var headerObj 			= {};
		var responseObj 		= new libGenericResponseObj();
		var responseBodyObj 	= null;
		
		// get the current configuration
		var configurationObj = getConfiguration();
		
		// if we have got a configuration object
		if (configurationObj)
			{
				// build up the headers for the get request
				headerObj['Authorization'] 		= configurationObj.credentialsEncoded;
				headerObj['Accept']				= '*/*';
				headerObj['Content-Type']		= 'application/json';
				
				try
					{
						// execute the request
						var response = https.post({
							url: configurationObj.endpointSendSignatureRequest,
							headers: headerObj,
							body: JSON.stringify(_sendSignatureRequest)
						});
						
						// get the HTTP response code	
						responseObj.httpResponseCode = response.code;
						
						// if we have a HTTP response body
						if (response.body)
							{
								try
									{
										// parse the response body into a JSON object
										responseBodyObj = JSON.parse(response.body);
									}
								catch(e)
									{
										responseBodyObj = null;
									}
								
								// process the converted JSON object
								if (responseBodyObj)
									{
										responseObj.apiResponse = responseBodyObj;
									}
							}
					}
				catch(e)
					{
						responseObj.responseMessage = e.message;
					}
			}
		else
			{
				responseObj.responseMessage = 'No valid configuration found';
			}
		
		// return responseObj to main script function
		return responseObj;
		
	}
	
	function getSignatureRequest(signatureRequestID) {
		
		// declare and initialize variables
		var headerObj 			= {};
		var responseObj 		= new libGenericResponseObj();
		var responseBodyObj 	= null;
		
		// get the current configuration
		var configurationObj = getConfiguration();
		
		// if we have got a configuration object
		if (configurationObj)
			{
				// build up the headers for the get request
				headerObj['Authorization'] 		= configurationObj.credentialsEncoded;
				headerObj['Accept']				= '*/*';
				
				try
					{
						// execute the request
						var response = https.get({
							url: configurationObj.endpointGetSignatureRequest + '/' + signatureRequestID,
							headers: headerObj
						});
						
						// get the HTTP response code	
						responseObj.httpResponseCode = response.code;
						
						// if we have a HTTP response body
						if (response.body)
							{
								try
									{
										// parse the response body into a JSON object
										responseBodyObj = JSON.parse(response.body);
									}
								catch(e)
									{
										responseBodyObj = null;
									}
								
								// process the converted JSON object
								if (responseBodyObj)
									{
										responseObj.apiResponse = responseBodyObj;
									}
							}
					}
				catch(e)
					{
						responseObj.responseMessage = e.message;
					}
			}
		else
			{
				responseObj.responseMessage = 'No valid configuration found';
			}
		
		// return responseObj to main script function
		return responseObj;
		
	}
	
	function cancelSignatureRequest(signatureRequestID) {
		
		// declare and initialize variables
		var headerObj 			= {};
		var responseObj 		= new libGenericResponseObj();
		var responseBodyObj 	= null;
		
		// get the current configuration
		var configurationObj = getConfiguration();
		
		// if we have got a configuration object
		if (configurationObj)
			{
				// build up the headers for the get request
				headerObj['Authorization'] 		= configurationObj.credentialsEncoded;
				headerObj['Accept']				= '*/*';
				
				try
					{
						// execute the request
						var response = https.post({
							url: configurationObj.endpointCancelSignatureRequest + '/' + signatureRequestID,
							headers: headerObj
						});
						
						// get the HTTP response code	
						responseObj.httpResponseCode = response.code;
						
						// if we have a HTTP response body
						if (response.body)
							{
								try
									{
										// parse the response body into a JSON object
										responseBodyObj = JSON.parse(response.body);
									}
								catch(e)
									{
										responseBodyObj = null;
									}
								
								// process the converted JSON object
								if (responseBodyObj)
									{
										responseObj.apiResponse = responseBodyObj;
									}
							}
					}
				catch(e)
					{
						responseObj.responseMessage = e.message;
					}
			}
		else
			{
				responseObj.responseMessage = 'No valid configuration found';
			}
		
		// return responseObj to main script function
		return responseObj;
		
		
	}
	
	function getFiles(signatureRequestID){
		
		// declare and initialize variables
		var headerObj 			= {};
		var responseObj 		= new libGenericResponseObj();
		var responseBodyObj 	= null;
		
		// get the current configuration
		var configurationObj = getConfiguration();
		
		// if we have got a configuration object
		if (configurationObj)
			{
				// build up the headers for the get request
				headerObj['Authorization'] 		= configurationObj.credentialsEncoded;
				headerObj['Accept']				= '*/*';
				
				try
					{
						// execute the request
						var response = https.get({
							url: configurationObj.endpointGetFiles + '/' + signatureRequestID,
							headers: headerObj
						});
						
						// get the HTTP response code	
						responseObj.httpResponseCode = response.code;
						
						// if we have got a file object returned
						if (response.headers['Content-Type'] == 'application/pdf')
							{
								// process the response body
								responseObj.apiResponse = response.body;
							}
						else if (response.headers['Content-Type'] == 'application/json') // if we have got a JSON object returned
							{
								// convert the response body to a JSON object
								responseObj.apiResponse = JSON.parse(response.body);
							}
					}
				catch(e)
					{
						responseObj.responseMessage = e.message;
					}
			}
		else
			{
				responseObj.responseMessage = 'No valid configuration found';
			}
		
		// return responseObj to main script function
		return responseObj;
		
	}
	
	function getConfiguration(){
		
		// declare and initialize variables
		var configObj = null;
		
		// search for active configuration records
		search.create({
			type: 'customrecord_bbs_hellosign',
			
			filters: [{
				name: 'isinactive',
				operator: search.Operator.IS,
				values: ['F']
			}],
			
			columns: [{
				name: 'custrecord_bbs_hellosign_username'
			},
					{
				name: 'custrecord_bbs_hellosign_password'
			},
					{
				name: 'custrecord_bbs_hellosign_prod_prefix'
			},
					{
				name: 'custrecord_bbs_hellosign_send_signature'
			},
					{
				name: 'custrecord_bbs_hellosign_get_signature'
			},
					{
				name: 'custrecord_bbs_hellosign_cancel_request'
			},
					{
				name: 'custrecord_bbs_hellosign_get_files'
			},
					{
				name: 'custrecord_bbs_hellosign_email_template'
			},
					{
				name: 'custrecord_bbs_hellosign_test_mode'
			},
					{
				name: 'custrecord_bbs_hellosign_allow_decline'
			},
					{
				name: 'custrecord_bbs_hellosign_allow_reassign'
			},
					{
				name: 'custrecord_bbs_hellosign_folder_id'
			}],
			
		}).run().each(function(result){
			
			var username 			= result.getValue({name: 'custrecord_bbs_hellosign_username'});
			var password 			= result.getValue({name: 'custrecord_bbs_hellosign_password'});
			var combinedCredentials	= username + ':' + password;
			var urlPrefix			= result.getValue({name: 'custrecord_bbs_hellosign_prod_prefix'});
			
			configObj 									= new libConfigObj();
			configObj.endpointSendSignatureRequest		= urlPrefix + result.getValue({name: 'custrecord_bbs_hellosign_send_signature'});
			configObj.endpointGetSignatureRequest		= urlPrefix + result.getValue({name: 'custrecord_bbs_hellosign_get_signature'});
			configObj.endpointCancelSignatureRequest	= urlPrefix	+ result.getValue({name: 'custrecord_bbs_hellosign_cancel_request'});
			configObj.endpointGetFiles					= urlPrefix + result.getValue({name: 'custrecord_bbs_hellosign_get_files'});
			configObj.emailTemplate						= result.getValue({name: 'custrecord_bbs_hellosign_email_template'});
			configObj.testMode							= convertToInteger(result.getValue({name: 'custrecord_bbs_hellosign_test_mode'}));
			configObj.allowDecline						= convertToInteger(result.getValue({name: 'custrecord_bbs_hellosign_allow_decline'}));
			configObj.allowReassign						= convertToInteger(result.getValue({name: 'custrecord_bbs_hellosign_allow_reassign'}));
			configObj.fileCabinetFolderID				= result.getValue({name: 'custrecord_bbs_hellosign_folder_id'});
			configObj.credentialsEncoded				= 'Basic ' + encode.convert({
																string:			combinedCredentials,
																inputEncoding:	encode.Encoding.UTF_8,
																outputEncoding:	encode.Encoding.BASE_64
															});
			
		});
		
		// return configObj to main script function
		return configObj;
		
	}
	
	function generatePDF(recordID, folderID) {
    	
    	// declare and initialize variables
    	var fileURL = null;
    	var fileID	= null;
    	
    	try
    		{
    			// create the PDF file
    			var fileObj = render.transaction({
    				entityId: recordID,
    			    printMode: render.PrintMode.PDF,
    			    inCustomerLocale: true
    			});
    			
    			fileObj.isOnline 	= true;
    			fileObj.folder		= folderID;
    			
    			// save the file in the file cabinet
    			fileID = fileObj.save();
    			
    			// build up the file URL
    			fileURL = 'https://';
    			
    			fileURL += url.resolveDomain({
    				hostType: url.HostType.APPLICATION
    			}); // get the account domain
    			
    			fileURL += file.load({
    				id: fileID
    			}).url; // reload the file and retrieve it's URL
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Creating PDF',
    				details: e
    			});
    		}
    	
    	return {
    		url:	fileURL,
    		id:		fileID
    	}
    	
    }
	
	function deleteUnsignedFile(fileID) {
			
		try
			{
				file.delete({
					id: fileID
				});
			}
		catch(e)
			{
				log.error({
					title: 'Error Deleting File with ID: ' + fileID,
					details: e
				});
			}
	}
	
	function getHelloSignContacts(customerID) {
		
		// lookup fields on the customer record
		var customerLookup = search.lookupFields({
			type: search.Type.CUSTOMER,
			id: customerID,
			columns: ['custentity_bbs_hellosign_primary.entityid', 'custentity_bbs_hellosign_primary_email', 'custentity_bbs_hellosign_secondary.entityid', 'custentity_bbs_hellosign_secondary_email']
		});

		return {
			primaryName:	customerLookup['custentity_bbs_hellosign_primary.entityid'],
			primaryEmail:	customerLookup['custentity_bbs_hellosign_primary_email'],
			secondaryName:	customerLookup['custentity_bbs_hellosign_secondary.entityid'],
			secondaryEmail:	customerLookup['custentity_bbs_hellosign_secondary_email']
		}
		
	}
	
	function getEssensysSigner(subsidiaryID) {
		
		// declare and initialize variables
		var recipientName 	= null;
		var recipientEmail 	= null;
		
		// lookup fields on the subsidiary record
		var subsidiaryLookup = search.lookupFields({
			type: search.Type.SUBSIDIARY,
			id: subsidiaryID,
			columns: ['custrecord_bbs_hellosign_recipient_name', 'custrecord_bbs_hellosign_recipient_email']
		});
		
		// do we have a recipient
		if (subsidiaryLookup.custrecord_bbs_hellosign_recipient_name.length > 0)
			{
				// get the recipient name and email address
				recipientName	=	subsidiaryLookup.custrecord_bbs_hellosign_recipient_name[0].text,
				recipientEmail	=	subsidiaryLookup.custrecord_bbs_hellosign_recipient_email
			}
		
		return {
			name: 	recipientName,
			email:	recipientEmail
		}
		
	}
	
	function closeSalesOrder(recordID) {
		
		try
			{
				// load the sales order
				var soRecord = record.load({
					type: record.Type.SALES_ORDER,
					id: recordID,
					isDynamic: true
				});
				
				// get count of SO lines
				var lineCount = soRecord.getLineCount({
					sublistId: 'item'
				});
				
				// loop through lines
				for (var i = 0; i < lineCount; i++)
					{
						// mark the line as closed
						soRecord.selectLine({
							sublistId: 'item',
							line: i
						});
						
						soRecord.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'isclosed',
							value: true,
							line: i
						});
						
						soRecord.commitLine({
							sublistId: 'item'
						});
					}
				
				// save the changes to the sales order
				soRecord.save();
				
				log.audit({
					title: 'Sales Order Closed',
					details: recordID
				});
			}
		catch(e)
			{
				log.error({
					title: 'Error Closing Sales Order ' + recordID,
					details: e.message
				});
			}
	}
	
	function createHellosignRecipientRecords(transactionID, signersArray) {
		
		// loop through signers array
		for (var i = 0; i < signersArray.length; i++)
			{
				try
					{
						// create a new HelloSign recipients record
						var helloSignRecipientsRecord = record.create({
							type: 'customrecord_bbs_hellosign_recipients'
						});
						
						helloSignRecipientsRecord.setValue({
							fieldId: 'custrecord_bbs_hellosign_recipients_so',
							value: transactionID
						});
						
						helloSignRecipientsRecord.setValue({
							fieldId: 'custrecord_bbs_hellosign_recipients_name',
							value: signersArray[i].name
						});
						
						helloSignRecipientsRecord.setValue({
							fieldId: 'custrecord_bbs_hellosign_recipientsemail',
							value: signersArray[i].email_address
						});
						
						helloSignRecipientsRecord.setValue({
							fieldId: 'custrecord_bbs_hellosign_recipientsorder',
							value: signersArray[i].order
						});
						
						helloSignRecipientsRecord.setValue({
							fieldId: 'custrecord_bbs_hellosign_recipientstatus',
							value: 'awaiting_signature'
						});
						
						helloSignRecipientsRecord.save();
					}
				catch(e)
					{
						log.error({
							title: 'Error Creating HelloSign Recipients Record',
							details: e
						});
					}
			}
		
	}
	
	function updateHellosignRecipientRecords(transactionID, helloSignRecipients) {
		
		// run a search to find helloSign recipient records for this transaction
		search.create({
			type: 'customrecord_bbs_hellosign_recipients',
			
			filters: [{
				name: 'custrecord_bbs_hellosign_recipients_so',
				operator: search.Operator.ANYOF,
				values: [transactionID]
			}],
			
			columns: [{
				name: 'custrecord_bbs_hellosign_recipientsemail'
			}],
			
		}).run().each(function(result){
			
			// get the recipient's email address
			var recipientEmail = result.getValue({
				name: 'custrecord_bbs_hellosign_recipientsemail'
			}).toLowerCase();
			
			// loop through helloSignRecipients array
			for (var i = 0; i < helloSignRecipients.length; i++)
				{
					// get the email address from the helloSignRecipients array
					var arrayEmail = helloSignRecipients[i].signer_email_address.toLowerCase();
					
					// if recipientEmail = arrayEmail
					if (recipientEmail == arrayEmail)
						{
							// get the internal ID of the helloSign recipients record
							var recipientRecordID = result.id;
						
							// get the status from the helloSignRecipients array
							var recipientStatus = helloSignRecipients[i].status_code;
							
							// if the recipient has not yet signed
							if (recipientStatus == 'awaiting_signature')
								{
									// if the recipient has viewed but hasn't signed
									if (helloSignRecipients[i].last_viewed_at)
										{
											// set decline reason/date signed to null
											var declineReason = null;
											var dateSigned = null;
										
											// set recipient status field to viewed
											recipientStatus = 'viewed';
										}
								}
							// if the recipient has declined
							else if (recipientStatus == 'declined') // recipient has declined
								{
									// get the decline reason
									var declineReason = helloSignRecipients[i].decline_reason;
									
									// set dateSigned to null
									var dateSigned = null;
								}
							else if (recipientStatus == 'signed') // recipient has signed
								{
									// set decline reason to null
									var declineReason = null;
									
									// get the date signed
									var dateSigned = helloSignRecipients[i].signed_at;
									
									// if we have a signed date
									if (dateSigned)
										{
											// convert epoch to date object
											dateSigned = new Date(dateSigned * 1000);
										}
								}
							
							try
								{
									// update fields on the helloSign recipients record
									record.submitFields({
										type: 'customrecord_bbs_hellosign_recipients',
										id: recipientRecordID,
										values: {
											custrecord_bbs_hellosign_recipientstatus: 	recipientStatus,
											custrecord_bbshellosignrecipientdecline:	declineReason,
											custrecord_bbs_hellosign_date_signed:		dateSigned
										}
									});
								}
							catch(e)
								{
									log.error({
										title: 'Error Updating HelloSign Recipients Record with ID ' + recipientRecordID,
										details: e
									});
								}
						
							// break the loop
							break;
						}
				}
			
			// continue processing search results
			return true;
			
		});		
		
	}
	
	function convertToInteger(value) {
		
		// declare and initialize variables
		var returnValue = null;
		
		// if value is true
		if (value == true)
			{
				// set returnValue to 1
				returnValue = 1;
			}
		else if (value == false) // if value is false
			{
				// set returnValue to 0
				returnValue = 0;
			}
		
		// return returnValue to main script function
		return returnValue;
		
	}
	
	function getNextSigner(salesOrderID) {
		
		// declare and initialize variables
		var nextSigner = null;
		
		// run search to find the next signer
		search.create({
			type: 'customrecord_bbs_hellosign_recipients',
			
			filters: [
		    			["custrecord_bbs_hellosign_recipients_so", search.Operator.ANYOF, salesOrderID],
		    			"AND",
		    			[["custrecord_bbs_hellosign_recipientstatus", search.Operator.IS, "awaiting_signature"],"OR",["custrecord_bbs_hellosign_recipientstatus", search.Operator.IS, "viewed"]],
		    		],
			
			columns: [{
				name: 'custrecord_bbs_hellosign_recipientsorder',
				sort: search.Sort.ASC
			},
					{
				name: 'custrecord_bbs_hellosign_recipientsemail'
			}],	
			
		}).run().each(function(result){
			
			// get the next signer's email address
			nextSigner = result.getValue({
				name: 'custrecord_bbs_hellosign_recipientsemail'
			});
			
		});
		
		// return nextSigner to main script function
		return nextSigner;
		
	}

	//Left padding s with c to a total of n chars
	//
	function padding_left(s, c, n) 
		{
			if (! s || ! c || s.length >= n) 
				{
					return s;
				}
			
			var max = (n - s.length)/c.length;
			
			for (var i = 0; i < max; i++) 
				{
					s = c + s;
				}
			
			return s;
		}
    
    return {
    	
    	libSendSignatureRequest:			libSendSignatureRequest,
    	libSignerObj:						libSignerObj,
    	libConfigObj:						libConfigObj,
    	libGenericResponseObj:				libGenericResponseObj,
    	sendSignatureRequest:				sendSignatureRequest,
    	getSignatureRequest:				getSignatureRequest,
    	cancelSignatureRequest:				cancelSignatureRequest,
    	getFiles:							getFiles,
    	getConfiguration:					getConfiguration,
    	generatePDF:						generatePDF,
    	deleteUnsignedFile:					deleteUnsignedFile,
    	getHelloSignContacts:				getHelloSignContacts,
    	getEssensysSigner:					getEssensysSigner,
    	closeSalesOrder:					closeSalesOrder,
    	createHellosignRecipientRecords:	createHellosignRecipientRecords,
    	updateHellosignRecipientRecords:	updateHellosignRecipientRecords,
    	getNextSigner:						getNextSigner,
    	padding_left:						padding_left
    };
    
});
