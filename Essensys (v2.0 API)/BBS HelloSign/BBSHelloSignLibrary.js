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
		this.endpointGetFiles				= null;
		this.subject						= null;
		this.message						= null;
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
				name: 'custrecord_bbs_hellosign_get_files'
			},
					{
				name: 'custrecord_bbs_hellosign_email_subject'
			},
					{
				name: 'custrecord_bbs_hellosign_email_message'
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
			
			configObj 								= new libConfigObj();
			configObj.endpointSendSignatureRequest	= urlPrefix + result.getValue({name: 'custrecord_bbs_hellosign_send_signature'});
			configObj.endpointGetSignatureRequest	= urlPrefix + result.getValue({name: 'custrecord_bbs_hellosign_get_signature'});
			configObj.endpointGetFiles				= urlPrefix + result.getValue({name: 'custrecord_bbs_hellosign_get_files'});
			configObj.subject						= result.getValue({name: 'custrecord_bbs_hellosign_email_subject'});
			configObj.message						= result.getValue({name: 'custrecord_bbs_hellosign_email_message'});
			configObj.testMode						= result.getValue({name: 'custrecord_bbs_hellosign_test_mode'});
			configObj.allowDecline					= result.getValue({name: 'custrecord_bbs_hellosign_allow_decline'});
			configObj.allowReassign					= result.getValue({name: 'custrecord_bbs_hellosign_allow_reassign'});
			configObj.fileCabinetFolderID			= result.getValue({name: 'custrecord_bbs_hellosign_folder_id'});
			configObj.credentialsEncoded			= 'Basic ' + encode.convert({
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
    			var fileID = fileObj.save();
    			
    			// build up the file URL
    			fileURL = 'https://';
    			
    			fileURL += url.resolveDomain({
    				hostType: url.HostType.APPLICATION
    			}); // get the account domain
    			
    			fileURL += file.load({
    				id: fileID
    			}).url; // reload the file and retrieve it's URL
    			
    			// attach the PDF to the transaction
    			record.attach({
    				record: {
    			        type: 'file',
    			        id: fileID
    			    },
    			    to: {
    			        type: record.Type.SALES_ORDER,
    			        id: recordID
    			    }
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Creating PDF',
    				details: e
    			});
    		}
    	
    	// return fileURL to main script function
    	return fileURL;
    	
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
		
		// lookup fields on the subsidiary record
		var subsidiaryLookup = search.lookupFields({
			type: search.Type.SUBSIDIARY,
			id: subsidiaryID,
			columns: ['custrecord_bbs_hellosign_recipient_name', 'custrecord_bbs_hellosign_recipient_email']
		});
		
		return {
			name: 	subsidiaryLookup['custrecord_bbs_hellosign_recipient_name'],
			email:	subsidiaryLookup['custrecord_bbs_hellosign_recipient_email']
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
    	
    	libSendSignatureRequest:	libSendSignatureRequest,
    	libSignerObj:				libSignerObj,
    	libConfigObj:				libConfigObj,
    	libGenericResponseObj:		libGenericResponseObj,
    	sendSignatureRequest:		sendSignatureRequest,
    	getSignatureRequest:		getSignatureRequest,
    	getFiles:					getFiles,
    	getConfiguration:			getConfiguration,
    	generatePDF:				generatePDF,
    	getHelloSignContacts:		getHelloSignContacts,
    	getEssensysSigner:			getEssensysSigner,
    	closeSalesOrder:			closeSalesOrder,
    	padding_left:				padding_left
    };
    
});
