/**
 * @NApiVersion 2.x
 * @NScriptType plugintypeimpl
 * @NModuleScope Public
 */
define(['N/email', 'N/encode', 'N/file', 'N/https', 'N/record', 'N/runtime', 'N/search'],
/**
 * @param {email} email
 * @param {encode} encode
 * @param {file} file
 * @param {https} https
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(email, encode, file, https, record, runtime, search) 
	{
	
		//=====================================================================
		//Helper functions
		//=====================================================================
		//
	
		//Page through results set from search
	    //
	    function getResults(_searchObject)
		    {
		    	var results = [];
		
		    	var pageData = _searchObject.runPaged({pageSize: 1000});
		
		    	for (var int = 0; int < pageData.pageRanges.length; int++) 
		    		{
		    			var searchPage = pageData.fetch({index: int});
		    			var data = searchPage.data;
		    			
		    			results = results.concat(data);
		    		}
		
		    	return results;
		    }

	    
		//=====================================================================
		//Exposed functions
		//=====================================================================
		//
	
	    
		//Get the current configuration
		//
		function getConfiguration()
			{
				var config = null;
				
				//Search for an active configuration
				//
				var customrecord_bbs_paypal_configSearchObj = getResults(search.create({
					   type: "customrecord_bbs_paypal_config",
					   filters:
					   [
					      ["isinactive","is","F"]
					   ],
					   columns:
					   [
					      search.createColumn({name: "custrecord_bbs_paypal_config_mode", 			label: "Integration Mode"}),
					      search.createColumn({name: "custrecord_bbs_paypal_config_live_url", 		label: "Live URL"}),
					      search.createColumn({name: "custrecord_bbs_paypal_config_sb_url", 		label: "SandBox URL"}),
					      search.createColumn({name: "custrecord_bbs_paypal_config_username", 		label: "User Name"}),
					      search.createColumn({name: "custrecord_bbs_paypal_config_password", 		label: "Password"}),
					      search.createColumn({name: "custrecord_bbs_paypal_config_capture_pay", 	label: "Capture Authorized Payment"}),
					      search.createColumn({name: "custrecord_bbs_paypal_config_reauthorize", 	label: "Reauthorize Payment"}),
					      search.createColumn({name: "custrecord_bbs_paypal_config_refrund", 		label: "Refund Captured Payment"}),
					      search.createColumn({name: "custrecord_bbs_paypal_config_show_captur", 	label: "Show Captured Payment Details"}),
					      search.createColumn({name: "custrecord_bbs_paypal_config_auth_pay", 		label: "Show Details For Authorized Payments"}),
					      search.createColumn({name: "custrecord_bbs_paypal_config_show_refund", 	label: "Show Refunded Details"}),
					      search.createColumn({name: "custrecord_bbs_paypal_config_tran_field", 	label: "Transaction Field Id"}),
					      search.createColumn({name: "custrecord_bbs_paypal_config_get_token", 		label: "Get Access Token"}),
					      search.createColumn({name: "custrecord_bbs_paypal_config_msg_field", 		label: "Message Field Id"})
					   ]
					}));

				//Found one?
				//
				if(customrecord_bbs_paypal_configSearchObj != null && customrecord_bbs_paypal_configSearchObj.length > 0)
					{
						var config 					= new paypalConfigObj();
						var urlPrefix 				= '';
						var processingMode 			= Number(customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_mode'}));
						
						//Construct full url based on api mode
						//
						switch(processingMode)
							{
								case 1:	//Sandbox
									urlPrefix = customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_sb_url'});
									break;
									
								case 2: //Production
									urlPrefix = customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_live_url'});
									break;
							}
						
						//Credentials
						//
						config.username				 		= customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_username'});
						config.password				 		= customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_password'});
						var combinedCredentials				= config.username + ':' + config.password;
						
						config.credentialsEncoded			= 'Basic ' + encode.convert({
																						string:			combinedCredentials,
																						inputEncoding:	encode.Encoding.UTF_8,
																						outputEncoding:	encode.Encoding.BASE_64
																						});
						//Endpoints
						//
						config.endpointGetAccessToken		= urlPrefix + customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_get_token'});
						config.endpointGetAuthDetails		= urlPrefix + customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_auth_pay'});
						config.endpointCapturePayment		= urlPrefix + customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_capture_pay'});
						config.endpointReauthorizePayment	= urlPrefix + customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_reauthorize'});
						config.endpointGetCatureDetails		= urlPrefix + customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_show_captur'});
						config.endpointRefundPayment		= urlPrefix + customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_refrund'});
						config.endpointGetRefundDetails		= urlPrefix + customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_show_refund'});
						
						//Transaction Fields
						//
						config.fieldTransactionId			= customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_tran_field'});
						config.fieldMessage					= customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_msg_field'});
					}
				
				return config;
			}

		
		//Get information about a payment authorisation
		//Parameters;
		//	_transactionId		The transaction id of the PayPal authorisation 
		//
		function getPaymnentDetails(_transactionId)
			{
				var headerObj 			= {};
				var paymentDetailsObj 	= new genericResponseObj();
				var responseBodyObj 	= null;
				var configurationObj	= null;
				var tokenObj			= null;
				
				//Get the current configuration
				//
				configurationObj = getConfiguration();
				
				if(configurationObj != null)
					{
						//Get an access token
						//
						tokenObj = getAccessToken(configurationObj);
						
						if(tokenObj.httpResponseCode == '200')
							{
								if(tokenObj.apiResponse.hasOwnProperty('access_token') && tokenObj.apiResponse.hasOwnProperty('token_type'))
									{
										var accessToken = tokenObj.apiResponse.access_token;
										var tokenType	= tokenObj.apiResponse.token_type;

										//Build up the headers for the get request
										//
										headerObj['Accept']				= '*/*';
										headerObj['Content-Type'] 		= 'application/json';
										headerObj['Authorization'] 		= tokenType + ' ' + accessToken;
										
										var actualUrl = configurationObj.endpointGetAuthDetails.replace('{authorization_id}',_transactionId);
										
										//Execute the request
										//
										try
											{
												var response = https.get({	
																			url:		actualUrl,
																			headers:	headerObj
																			});
										
												//Extract the http response code	
												//
												paymentDetailsObj.httpResponseCode = response.code;
												
												//Extract the http response body
												//
												if(response.body != null && response.body != '')
													{
														//Try to parse the response body into a JSON object
														//
														try
															{
																responseBodyObj = JSON.parse(response.body);
															}
														catch(err)
															{
																responseBodyObj = null;
															}
														
														//Process the converted JSON object
														//
														if(responseBodyObj != null)
															{
																paymentDetailsObj.apiResponse 		= responseBodyObj;
															}
													}
											}
										catch(err)
											{
												paymentDetailsObj.responseMessage = err.message;
											}
									}
								else
									{
										paymentDetailsObj.responseMessage = 'No valid configuration found';
									}
								
							}
					}
				
				return paymentDetailsObj;
			}
		
		
		//Get information about a payment capture
		//Parameters;
		//	_transactionId		The transaction id of the PayPal capture 
		//
		function getCaptureDetails(_transactionId)
			{
				var headerObj 			= {};
				var captureDetailsObj 	= new genericResponseObj();
				var responseBodyObj 	= null;
				var configurationObj	= null;
				var tokenObj			= null;
				
				//Get the current configuration
				//
				configurationObj = getConfiguration();
				
				if(configurationObj != null)
					{
						//Get an access token
						//
						tokenObj = getAccessToken(configurationObj);
						
						if(tokenObj.httpResponseCode == '200')
							{
								if(tokenObj.apiResponse.hasOwnProperty('access_token') && tokenObj.apiResponse.hasOwnProperty('token_type'))
									{
										var accessToken = tokenObj.apiResponse.access_token;
										var tokenType	= tokenObj.apiResponse.token_type;

										//Build up the headers for the get request
										//
										headerObj['Accept']				= '*/*';
										headerObj['Content-Type'] 		= 'application/json';
										headerObj['Authorization'] 		= tokenType + ' ' + accessToken;
										
										var actualUrl = configurationObj.endpointGetCatureDetails.replace('{capture_id}',_transactionId);
										
										//Execute the request
										//
										try
											{
												var response = https.get({	
																			url:		actualUrl,
																			headers:	headerObj
																			});
										
												//Extract the http response code	
												//
												captureDetailsObj.httpResponseCode = response.code;
												
												//Extract the http response body
												//
												if(response.body != null && response.body != '')
													{
														//Try to parse the response body into a JSON object
														//
														try
															{
																responseBodyObj = JSON.parse(response.body);
															}
														catch(err)
															{
																responseBodyObj = null;
															}
														
														//Process the converted JSON object
														//
														if(responseBodyObj != null)
															{
																captureDetailsObj.apiResponse 		= responseBodyObj;
															}
													}
											}
										catch(err)
											{
												captureDetailsObj.responseMessage = err.message;
											}
									}
								else
									{
										captureDetailsObj.responseMessage = 'No valid configuration found';
									}
								
							}
					}
				
				return captureDetailsObj;
			}
		
	
		//Get information about a payment refund
		//Parameters;
		//	_transactionId		The transaction id of the PayPal refund 
		//
		function getRefundDetails(_transactionId)
			{
				var headerObj 			= {};
				var refundDetailsObj 	= new genericResponseObj();
				var responseBodyObj 	= null;
				var configurationObj	= null;
				var tokenObj			= null;
				
				//Get the current configuration
				//
				configurationObj = getConfiguration();
				
				if(configurationObj != null)
					{
						//Get an access token
						//
						tokenObj = getAccessToken(configurationObj);
						
						if(tokenObj.httpResponseCode == '200')
							{
								if(tokenObj.apiResponse.hasOwnProperty('access_token') && tokenObj.apiResponse.hasOwnProperty('token_type'))
									{
										var accessToken = tokenObj.apiResponse.access_token;
										var tokenType	= tokenObj.apiResponse.token_type;

										//Build up the headers for the get request
										//
										headerObj['Accept']				= '*/*';
										headerObj['Content-Type'] 		= 'application/json';
										headerObj['Authorization'] 		= tokenType + ' ' + accessToken;
										
										var actualUrl = configurationObj.endpointGetRefundDetails.replace('{refund_id}',_transactionId);
										
										//Execute the request
										//
										try
											{
												var response = https.get({	
																			url:		actualUrl,
																			headers:	headerObj
																			});
										
												//Extract the http response code	
												//
												refundDetailsObj.httpResponseCode = response.code;
												
												//Extract the http response body
												//
												if(response.body != null && response.body != '')
													{
														//Try to parse the response body into a JSON object
														//
														try
															{
																responseBodyObj = JSON.parse(response.body);
															}
														catch(err)
															{
																responseBodyObj = null;
															}
														
														//Process the converted JSON object
														//
														if(responseBodyObj != null)
															{
																refundDetailsObj.apiResponse 		= responseBodyObj;
															}
													}
											}
										catch(err)
											{
												refundDetailsObj.responseMessage = err.message;
											}
									}
								else
									{
										refundDetailsObj.responseMessage = 'No valid configuration found';
									}
								
							}
					}
				
				return refundDetailsObj;
			}
	
		
		//Capture a payment
		//
		//Parameters;
		//	_transactionId		The transaction id of the PayPal authorisation 
		//	_nsTransactionId	The transaction id of the associated NetSuite transaction e.g. the cash sale record
		//	_amountObj			The amount object from the response of the getPaymnentDetails call e.g.
		//						"amount": 	{
        //									"currency_code": "GBP",
		//									"value": "16.90"
    	//									}
		//
		function capturePayment(_transactionId, _nsTransactionId, _amountObj)	
			{
				var headerObj 			= {};
				var captureObj 			= new genericResponseObj();
				var responseBodyObj 	= null;
				var configurationObj	= null;
				var tokenObj			= null;
				
				//Get the current configuration
				//
				configurationObj = getConfiguration();
				
				if(configurationObj != null)
					{
						//Get an access token
						//
						tokenObj = getAccessToken(configurationObj);
						
						if(tokenObj.httpResponseCode == '200')
							{
								if(tokenObj.apiResponse.hasOwnProperty('access_token') && tokenObj.apiResponse.hasOwnProperty('token_type'))
									{
										var accessToken = tokenObj.apiResponse.access_token;
										var tokenType	= tokenObj.apiResponse.token_type;

										//Build up the headers for the get request
										//
										headerObj['Accept']				= '*/*';
										headerObj['Content-Type'] 		= 'application/json';
										headerObj['Authorization'] 		= tokenType + ' ' + accessToken;
										headerObj['Prefer'] 			= 'return=representation';
										
										var bodyObj 					= {};
										bodyObj.amount					= _amountObj;
										bodyObj.final_capture			= false;
										bodyObj.invoice_id				= _nsTransactionId;
										
										var actualUrl = configurationObj.endpointCapturePayment.replace('{authorization_id}',_transactionId);
										
										//Execute the request
										//
										try
											{
												var response = https.post({	
																			url:		actualUrl,
																			headers:	headerObj,
																			body:		JSON.stringify(bodyObj)
																			});
										
												//Extract the http response code	
												//
												captureObj.httpResponseCode = response.code;
												
												//Extract the http response body
												//
												if(response.body != null && response.body != '')
													{
														//Try to parse the response body into a JSON object
														//
														try
															{
																responseBodyObj = JSON.parse(response.body);
															}
														catch(err)
															{
																responseBodyObj = null;
															}
														
														//Process the converted JSON object
														//
														if(responseBodyObj != null)
															{
																captureObj.apiResponse 		= responseBodyObj;
															}
													}
											}
										catch(err)
											{
												captureObj.responseMessage = err.message;
											}
									}
								else
									{
										captureObj.responseMessage = 'No valid configuration found';
									}
								
							}
					}
				
				return captureObj;
			}
	
		
		//Re-authorise a payment
		//
		//Parameters;
		//	_transactionId		The transaction id of the PayPal authorisation 
		//	_amountObj			The amount object from the response of the getPaymnentDetails call e.g.
		//						"amount": 	{
        //									"currency_code": "GBP",
		//									"value": "16.90"
    	//									}
		//
		function reauthorisePayment(_transactionId, _amountObj)	
			{
				var headerObj 			= {};
				var reauthoriseObj 		= new genericResponseObj();
				var responseBodyObj 	= null;
				var configurationObj	= null;
				var tokenObj			= null;
				
				//Get the current configuration
				//
				configurationObj = getConfiguration();
				
				if(configurationObj != null)
					{
						//Get an access token
						//
						tokenObj = getAccessToken(configurationObj);
						
						if(tokenObj.httpResponseCode == '200')
							{
								if(tokenObj.apiResponse.hasOwnProperty('access_token') && tokenObj.apiResponse.hasOwnProperty('token_type'))
									{
										var accessToken = tokenObj.apiResponse.access_token;
										var tokenType	= tokenObj.apiResponse.token_type;

										//Build up the headers for the get request
										//
										headerObj['Accept']				= '*/*';
										headerObj['Content-Type'] 		= 'application/json';
										headerObj['Authorization'] 		= tokenType + ' ' + accessToken;
										
										var actualUrl 	= configurationObj.endpointReauthorizePayment.replace('{authorization_id}',_transactionId);
										var bodyObj 	= {};
										bodyObj.amount	= _amountObj;
										
										//Execute the request
										//
										try
											{
												var response = https.post({	
																			url:		actualUrl,
																			headers:	headerObj,
																			body:		JSON.stringify(bodyObj)
																			});
										
												//Extract the http response code	
												//
												reauthoriseObj.httpResponseCode = response.code;
												
												//Extract the http response body
												//
												if(response.body != null && response.body != '')
													{
														//Try to parse the response body into a JSON object
														//
														try
															{
																responseBodyObj = JSON.parse(response.body);
															}
														catch(err)
															{
																responseBodyObj = null;
															}
														
														//Process the converted JSON object
														//
														if(responseBodyObj != null)
															{
																reauthoriseObj.apiResponse 		= responseBodyObj;
															}
													}
											}
										catch(err)
											{
												reauthoriseObj.responseMessage = err.message;
											}
									}
								else
									{
										reauthoriseObj.responseMessage = 'No valid configuration found';
									}
								
							}
					}
				
				return reauthoriseObj;
			}


		//Refund a captured payment
		//
		//	_transactionId		The transaction id of the PayPal authorisation 
		//	_nsTransactionId	The transaction id of the associated NetSuite transaction e.g. the refund record
		//	_amountObj			The amount object from the response of the getPaymnentDetails call e.g.
		//						"amount": 	{
        //									"currency_code": "GBP",
		//									"value": "16.90"
    	//									}
		//
		function refundPayment(_transactionId, _nsTransactionId, _amountObj)	
			{
				var headerObj 			= {};
				var refundObj 			= new genericResponseObj();
				var responseBodyObj 	= null;
				var configurationObj	= null;
				var tokenObj			= null;
				
				//Get the current configuration
				//
				configurationObj = getConfiguration();
				
				if(configurationObj != null)
					{
						//Get an access token
						//
						tokenObj = getAccessToken(configurationObj);
						
						if(tokenObj.httpResponseCode == '200')
							{
								if(tokenObj.apiResponse.hasOwnProperty('access_token') && tokenObj.apiResponse.hasOwnProperty('token_type'))
									{
										var accessToken = tokenObj.apiResponse.access_token;
										var tokenType	= tokenObj.apiResponse.token_type;

										//Build up the headers for the get request
										//
										headerObj['Accept']				= '*/*';
										headerObj['Content-Type'] 		= 'application/json';
										headerObj['Authorization'] 		= tokenType + ' ' + accessToken;
										
										var bodyObj 					= {};
										bodyObj.amount					= _amountObj;
										bodyObj.invoice_id				= _nsTransactionId;
										
										var actualUrl = configurationObj.endpointRefundPayment.replace('{capture_id}',_transactionId);
										
										//Execute the request
										//
										try
											{
												var response = https.post({	
																			url:		actualUrl,
																			headers:	headerObj,
																			body:		JSON.stringify(bodyObj)
																			});
										
												//Extract the http response code	
												//
												refundObj.httpResponseCode = response.code;
												
												//Extract the http response body
												//
												if(response.body != null && response.body != '')
													{
														//Try to parse the response body into a JSON object
														//
														try
															{
																responseBodyObj = JSON.parse(response.body);
															}
														catch(err)
															{
																responseBodyObj = null;
															}
														
														//Process the converted JSON object
														//
														if(responseBodyObj != null)
															{
																refundObj.apiResponse 		= responseBodyObj;
															}
													}
											}
										catch(err)
											{
												refundObj.responseMessage = err.message;
											}
									}
								else
									{
										refundObj.responseMessage = 'No valid configuration found';
									}
								
							}
					}
				
				return refundObj;
			}
		
		
		//Get an access token based on the user name & password
		//
		function getAccessToken(configurationObj)
			{
				var headerObj 			= {};
				var responseBodyObj 	= null;
				var tokenResponseObj 	= new genericResponseObj();
				
				if(configurationObj != null)
					{
						//Build up the headers for the get request
						//
						headerObj['Accept']				= '*/*';
						headerObj['Authorization'] 		= configurationObj.credentialsEncoded;
						headerObj['Content-Type'] 		= 'application/x-www-form-urlencoded';
						
						//Execute the request
						//
						try
							{
								var response = https.post({	
															url:		configurationObj.endpointGetAccessToken,
															headers:	headerObj,
															body:		'grant_type=client_credentials'
															});
						
								//Extract the http response code	
								//
								tokenResponseObj.httpResponseCode = response.code;
								
								//Extract the http response body
								//
								if(response.body != null && response.body != '')
									{
										//Try to parse the response body into a JSON object
										//
										try
											{
												responseBodyObj = JSON.parse(response.body);
											}
										catch(err)
											{
												responseBodyObj = null;
											}
										
										//Process the converted JSON object
										//
										if(responseBodyObj != null)
											{
												tokenResponseObj.apiResponse 		= responseBodyObj;
											}
									}
							}
						catch(err)
							{
								tokenResponseObj.responseMessage = err.message;
							}
					}
				else
					{
						tokenResponseObj.responseMessage = 'No valid configuration found';
					}
				
				return tokenResponseObj;
			}

		function genericResponseObj()
			{
				this.httpResponseCode	= '';
				this.responseMessage 	= '';
				this.apiResponse		= {};
			}
		
		function paypalConfigObj()
			{
				this.username				 	= '';
				this.password				 	= '';
				this.credentialsEncoded			= '';
				this.token						= '';
				this.endpointGetAccessToken		= '';
				this.endpointGetAuthDetails		= '';
				this.endpointCapturePayment		= '';
				this.endpointReauthorizePayment	= '';
				this.endpointGetCatureDetails	= '';
				this.endpointRefundPayment		= '';
				this.endpointGetRefundDetails	= '';
				this.fieldTransactionId			= '';
				this.fieldMessage				= '';
			}
		
		//Return exposed functions
		//
		return {
					getAccessToken:			getAccessToken,
					getConfiguration:		getConfiguration,
					getPaymnentDetails:		getPaymnentDetails,
					getCaptureDetails:		getCaptureDetails,
					getRefundDetails:		getRefundDetails,
					capturePayment:			capturePayment,
					reauthorisePayment:		reauthorisePayment,
					refundPayment:			refundPayment
	    		};
	    
	});
