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
					      search.createColumn({name: "custrecord_bbs_paypal_config_auth_field", 	label: "Transaction Field For Authorization Id"}),
					      search.createColumn({name: "custrecord_bbs_paypal_config_cap_field", 		label: "Transaction Field For Capture Id"}),
					      search.createColumn({name: "custrecord_bbs_paypal_config_refun_field", 	label: "Transaction Field For Refund Id"}),
					      search.createColumn({name: "custrecord_bbs_paypal_config_get_token", 		label: "Get Access Token"})
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
						config.fieldAuthorizationId			= customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_auth_field'});
						config.fieldCaptureId				= customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_cap_field'});
						config.fieldRefundId				= customrecord_bbs_paypal_configSearchObj[0].getValue({name: 'custrecord_bbs_paypal_config_refun_field'});
						
					}
				
				return config;
			}

		//Get account information
		//
		function getPaymnentDetails()
			{
				var headerObj 			= {};
				var serviceInfoObj 		= new genericResponseObj();
				var responseBodyObj 	= null;
				var configurationObj	= null;
				
				//Get the current configuration
				//
				configurationObj = getConfiguration();
				
				if(configurationObj != null)
					{
						//Get an access token
						//
						getAccessToken(configurationObj);
						
						//Build up the headers for the get request
						//
						headerObj['Accept']				= '*/*';
						headerObj['Authorization'] 		= configurationObj.credentialsEncoded;
						
						//Execute the request
						//
						try
							{
								var response = https.get({	
															url:		configurationObj.endpointWhoAmI,
															headers:	headerObj
															});
						
								//Extract the http response code	
								//
								serviceInfoObj.httpResponseCode = response.code;
								
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
												serviceInfoObj.apiResponse 		= responseBodyObj;
											}
									}
							}
						catch(err)
							{
								serviceInfoObj.responseMessage = err.message;
							}
					}
				else
					{
						serviceInfoObj.responseMessage = 'No valid configuration found';
					}
				
				return serviceInfoObj;
				
			}
		
	
		//Get list of printers available
		//
		function getPrinters()
			{
				var headerObj 			= {};
				var serviceInfoObj 		= new BBSPrintNodeLibraryModule.libGenericResponseObj();
				var responseBodyObj 	= null;
				var configurationObj	= null;
				
				//Get the current configuration
				//
				configurationObj = getConfiguration();
				
				if(configurationObj != null)
					{
						//Build up the headers for the get request
						//
						headerObj['Accept']				= '*/*';
						headerObj['Authorization'] 		= configurationObj.credentialsEncoded;
						
						//Execute the request
						//
						try
							{
								var response = https.get({	
															url:		configurationObj.endpointGetPrinters,
															headers:	headerObj
															});
						
								//Extract the http response code	
								//
								serviceInfoObj.httpResponseCode = response.code;
								
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
												serviceInfoObj.apiResponse 		= responseBodyObj;
											}
									}
							}
						catch(err)
							{
								serviceInfoObj.responseMessage = err.message;
							}
					}
				else
					{
						serviceInfoObj.responseMessage = 'No valid configuration found';
					}
				
				return serviceInfoObj;
				
			}

		//Send a print to the api
		//
		function sendPrint(_printRequest)
			{
				var headerObj 			= {};
				var serviceInfoObj 		= new BBSPrintNodeLibraryModule.libGenericResponseObj();
				var responseBodyObj 	= null;
				var configurationObj	= null;
				
				//Get the current configuration
				//
				configurationObj = getConfiguration();
				
				if(configurationObj != null)
					{
						//Build up the headers for the get request
						//
						headerObj['Accept']				= '*/*';
						headerObj['Authorization'] 		= configurationObj.credentialsEncoded;
						
						//Execute the request
						//
						try
							{
								var response = https.post({	
															url:		configurationObj.endpointPrintJob,
															headers:	headerObj
															
															});
						
								//Extract the http response code	
								//
								serviceInfoObj.httpResponseCode = response.code;
								
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
												serviceInfoObj.apiResponse 		= responseBodyObj;
											}
									}
							}
						catch(err)
							{
								serviceInfoObj.responseMessage = err.message;
							}
					}
				else
					{
						serviceInfoObj.responseMessage = 'No valid configuration found';
					}
				
				return serviceInfoObj;
				
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
				this.fieldAuthorizationId		= '';
				this.fieldCaptureId				= '';
				this.fieldRefundId				= '';				
			}
		
		//Return exposed functions
		//
		return {
	        		doPing:					doPing,
	        		getAccountInfo:			getAccountInfo,
	        		getPrinters:			getPrinters,
	        		sendPrint:				sendPrint
	    		};
	    
	});
