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
				var customrecord_bbs_adyen_configSearchObj = getResults(search.create({
					   type: "customrecord_bbs_adyen_config",
					   filters:
					   [
					      ["isinactive","is","F"]
					   ],
					   columns:
					   [
					      search.createColumn({name: "custrecord_bbs_adyen_config_mode", 			label: "Integration Mode"}),
					      search.createColumn({name: "custrecord_bbs_adyen_config_live_url", 		label: "Live URL"}),
					      search.createColumn({name: "custrecord_bbs_adyen_config_sb_url", 			label: "SandBox URL"}),
					      search.createColumn({name: "custrecord_bbs_adyen_config_api_key", 		label: "API Key"}),
					      search.createColumn({name: "custrecord_bbs_adyen_config_merch_acc", 		label: "Merchant Account"}),
					      search.createColumn({name: "custrecord_bbs_adyen_config_capture_pay", 	label: "Capture Authorized Payment"}),
					      search.createColumn({name: "custrecord_bbs_adyen_config_refund", 			label: "Refund Captured Payment"}),
					      search.createColumn({name: "custrecord_bbs_adyen_config_tran_field", 		label: "Transaction Field Id"}),
					      search.createColumn({name: "custrecord_bbs_adyen_config_msg_field", 		label: "Message Field Id"})
					   ]
					}));

				//Found one?
				//
				if(customrecord_bbs_adyen_configSearchObj != null && customrecord_bbs_adyen_configSearchObj.length > 0)
					{
						var config 					= new adyenConfigObj();
						var urlPrefix 				= '';
						var processingMode 			= Number(customrecord_bbs_adyen_configSearchObj[0].getValue({name: 'custrecord_bbs_adyen_config_mode'}));
						
						//Construct full url based on api mode
						//
						switch(processingMode)
							{
								case 1:	//Sandbox
									urlPrefix = customrecord_bbs_adyen_configSearchObj[0].getValue({name: 'custrecord_bbs_adyen_config_sb_url'});
									break;
									
								case 2: //Production
									urlPrefix = customrecord_bbs_adyen_configSearchObj[0].getValue({name: 'custrecord_bbs_adyen_config_live_url'});
									break;
							}
						
						//Credentials
						//
						config.apiKey				 		= customrecord_bbs_adyen_configSearchObj[0].getValue({name: 'custrecord_bbs_adyen_config_api_key'});
						config.merchant				 		= customrecord_bbs_adyen_configSearchObj[0].getValue({name: 'custrecord_bbs_adyen_config_merch_acc'});
						
						//Endpoints
						//
						config.endpointCapturePayment		= urlPrefix + customrecord_bbs_adyen_configSearchObj[0].getValue({name: 'custrecord_bbs_adyen_config_capture_pay'});
						config.endpointRefundPayment		= urlPrefix + customrecord_bbs_adyen_configSearchObj[0].getValue({name: 'custrecord_bbs_adyen_config_refund'});
						
						//Transaction Fields
						//
						config.fieldTransactionId			= customrecord_bbs_adyen_configSearchObj[0].getValue({name: 'custrecord_bbs_adyen_config_tran_field'});
						config.fieldMessage					= customrecord_bbs_adyen_configSearchObj[0].getValue({name: 'custrecord_bbs_adyen_config_msg_field'});
					}
				
				return config;
			}

		
		//Capture a payment
		//
		//Parameters;
		//	_transactionId		The Adyen PsP code 
		//	_nsTransactionId	The transaction id of the associated NetSuite transaction e.g. the cash sale record
		//	_amountObj			The amount object  e.g.
		//						"amount": 	{
        //									"currency": "GBP",
		//									"value": "1690"
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
						
						//Build up the headers for the get request
						//
						headerObj['Accept']				= '*/*';
						headerObj['Content-Type'] 		= 'application/json';
						headerObj['X-API-Key'] 			= configurationObj.apiKey;
										
						var bodyObj 					= {};
						bodyObj.amount					= _amountObj;
						bodyObj.merchantAccount			= configurationObj.merchant;
						bodyObj.reference				= _nsTransactionId;
										
						var actualUrl = configurationObj.endpointCapturePayment.replace('{paymentPspReference}',_transactionId);
										
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

				return captureObj;
			}
	
		
		
		//Refund a captured payment
		//
		//	_transactionId		The Adyen PsP code 
		//	_nsTransactionId	The transaction id of the associated NetSuite transaction e.g. the refund record
		//	_amountObj			The amount object e.g.
		//						"amount": 	{
        //									"currency": "GBP",
		//									"value": "1690"
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
						//Build up the headers for the get request
						//
						headerObj['Accept']				= '*/*';
						headerObj['Content-Type'] 		= 'application/json';
						headerObj['X-API-Key'] 			= configurationObj.apiKey;
										
						var bodyObj 					= {};
						bodyObj.amount					= _amountObj;
						bodyObj.merchantAccount			= configurationObj.merchant;
						bodyObj.reference				= _nsTransactionId;
										
						var actualUrl = configurationObj.endpointRefundPayment.replace('{paymentPspReference}',_transactionId);
										
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

				return refundObj;
			}
		
		
		
		function genericResponseObj()
			{
				this.httpResponseCode	= '';
				this.responseMessage 	= '';
				this.apiResponse		= {};
			}
		
		function adyenConfigObj()
			{
				this.apiKey				 		= '';
				this.merchant				 	= '';
				this.endpointCapturePayment		= '';
				this.endpointRefundPayment		= '';
				this.fieldTransactionId			= '';
				this.fieldMessage				= '';
			}
		
		//Return exposed functions
		//
		return {
					getConfiguration:		getConfiguration,
					capturePayment:			capturePayment,
					refundPayment:			refundPayment
	    		};
	    
	});
