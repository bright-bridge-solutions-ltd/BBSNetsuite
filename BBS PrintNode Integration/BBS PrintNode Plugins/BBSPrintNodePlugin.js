/**
 * @NApiVersion 2.x
 * @NScriptType plugintypeimpl
 * @NModuleScope Public
 */
define(['N/email', 'N/encode', 'N/file', 'N/https', 'N/record', 'N/runtime', 'N/search', '../BBS PrintNode Modules/BBSPrintNodeLibraryModule'],
/**
 * @param {email} email
 * @param {encode} encode
 * @param {file} file
 * @param {https} https
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(email, encode, file, https, record, runtime, search, BBSPrintNodeLibraryModule) 
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
				var customrecord_bbs_printnode_configSearchObj = getResults(search.create({
					   type: "customrecord_bbs_printnode_config",
					   filters:
					   [
					      ["isinactive","is","F"]
					   ],
					   columns:
					   [
					      search.createColumn({name: "custrecord_bbs_printnode_conf_api_key", label: "API Key"}),
					      search.createColumn({name: "custrecord_bbs_printnode_conf_ep_comps", label: "End Point - Get Computers"}),
					      search.createColumn({name: "custrecord_bbs_printnode_conf_ep_prns", label: "End Point - Get Printers"}),
					      search.createColumn({name: "custrecord_bbs_printnode_conf_ep_ping", label: "End Point - Ping"}),
					      search.createColumn({name: "custrecord_bbs_printnode_conf_ep_pjob", label: "End Point - Print Job"}),
					      search.createColumn({name: "custrecord_bbs_printnode_conf_ep_whoami", label: "End Point - Whoami"}),
					      search.createColumn({name: "custrecord_bbs_printnode_conf_endpoint", label: "End Point Prefix"})
					   ]
					}));
					
				
				//Found one?
				//
				if(customrecord_bbs_printnode_configSearchObj != null && customrecord_bbs_printnode_configSearchObj.length > 0)
					{
						config 						= new BBSPrintNodeLibraryModule.libConfigObj();
						var apiKey	 				= customrecord_bbs_printnode_configSearchObj[0].getValue({name: 'custrecord_bbs_printnode_conf_api_key'});
						var endpointPrefix			= customrecord_bbs_printnode_configSearchObj[0].getValue({name: 'custrecord_bbs_printnode_conf_endpoint'});
						var endpointComputers		= customrecord_bbs_printnode_configSearchObj[0].getValue({name: 'custrecord_bbs_printnode_conf_ep_comps'});
						var endpointPrinters		= customrecord_bbs_printnode_configSearchObj[0].getValue({name: 'custrecord_bbs_printnode_conf_ep_prns'});
						var endpointPing			= customrecord_bbs_printnode_configSearchObj[0].getValue({name: 'custrecord_bbs_printnode_conf_ep_ping'});
						var endpointPrintJob		= customrecord_bbs_printnode_configSearchObj[0].getValue({name: 'custrecord_bbs_printnode_conf_ep_pjob'});
						var endpointWhoami			= customrecord_bbs_printnode_configSearchObj[0].getValue({name: 'custrecord_bbs_printnode_conf_ep_whoami'});
						
						config.apiKey				 	= apiKey;
						config.endpointDoPing			= endpointPrefix + endpointPing;
						config.endpointGetPrinters		= endpointPrefix + endpointPrinters;
						config.endpointGetComputers		= endpointPrefix + endpointComputers;
						config.endpointWhoAmI			= endpointPrefix + endpointWhoami;
						config.endpointPrintJob			= endpointPrefix + endpointPrintJob;
						config.credentialsEncoded		= 'Basic ' + encode.convert({
																					string:			apiKey,
																					inputEncoding:	encode.Encoding.UTF_8,
																					outputEncoding:	encode.Encoding.BASE_64
																					});
					}
				
				return config;
			}
	
	
				
		//Get account information
		//
		function getAccountInfo()
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
															headers:	headerObj,
															body:		JSON.stringify(_printRequest)
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

		
		//Perform a basic ping on the api end point
		//
		function doPing()
			{
				var headerObj 			= {};
				var pingObj		 		= new BBSPrintNodeLibraryModule.libGenericResponseObj();
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
						
						//Execute the request
						//
						try
							{
								var response = https.get({	
															url:		configurationObj.endpointDoPing,
															headers:	headerObj
															});
						
								//Extract the http response code	
								//
								pingObj.httpResponseCode = response.code;
								
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
												pingObj.apiResponse 		= responseBodyObj;
											}
									}
							}
						catch(err)
							{
								pingObj.responseMessage = err.message;
							}
					}
				else
					{
						pingObj.responseMessage = 'No valid configuration found';
					}
				
				return pingObj;
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
