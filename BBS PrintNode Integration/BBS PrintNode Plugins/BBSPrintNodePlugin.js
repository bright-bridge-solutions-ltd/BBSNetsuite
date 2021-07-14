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
					      search.createColumn({name: "custrecord_bbs_printnode_conf_endpoint", label: "End Point Prefix"}),
					      search.createColumn({name: "custrecord_bbs_printnode_conf_ad_script", label: "Commercial Invoice Script"}),
					      search.createColumn({name: "custrecord_bbs_printnode_conf_ad_deploy", label: "Commercial Invoice Deployment"}),
					      search.createColumn({name: "custrecord_bbs_printnode_conf_lab_type", label: "Label File Type"})
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
						var adScriptId				= customrecord_bbs_printnode_configSearchObj[0].getValue({name: 'custrecord_bbs_printnode_conf_ad_script'});
						var adDeploymentId			= customrecord_bbs_printnode_configSearchObj[0].getValue({name: 'custrecord_bbs_printnode_conf_ad_deploy'});
						var labelFileType			= customrecord_bbs_printnode_configSearchObj[0].getValue({name: 'custrecord_bbs_printnode_conf_lab_type'});
						
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
						config.adScriptId				= adScriptId;
						config.adDeploymentId			= adDeploymentId;
						
						var fileType = 'UNKNOWN';
						
						switch(Number(labelFileType))
							{
								case 50:
									fileType = 'APPCACHE '; 
									break;
								case 34:
									fileType = 'AUTOCAD'; 
									break;
								case 6:
									fileType = 'BMPIMAGE'; 
									break;
								case 51:
									fileType = 'CERTIFICATE'; 
									break;
								case 39:
									fileType = 'CONFIG'; 
									break;
								case 11:
									fileType = 'STYLESHEET'; 
									break;
								case 14:
									fileType = 'CSV'; 
									break;
								case 22:
									fileType = 'EXCEL'; 
									break;
								case 1:
									fileType = 'FLASH'; 
									break;
								case 41:
									fileType = 'FREEMARKER'; 
									break;
								case 4:
									fileType = 'GIFIMAGE'; 
									break;
								case 27:
									fileType = 'GZIP'; 
									break;
								case 9:
									fileType = 'HTMLDOC '; 
									break;
								case 8:
									fileType = 'ICON'; 
									break;
								case 13:
									fileType = 'JAVASCRIPT'; 
									break;
								case 2:
									fileType = 'JPGIMAGE'; 
									break;
								case 38:
									fileType = 'JSON'; 
									break;
								case 35:
									fileType = 'MESSAGERFC'; 
									break;
								case 30:
									fileType = 'MP3'; 
									break;
								case 29:
									fileType = 'MPEGMOVIE'; 
									break;
								case 17:
									fileType = 'PDF'; 
									break;
								case 3:
									fileType = 'PJPGIMAGE'; 
									break;
								case 10:
									fileType = 'PLAINTEXT'; 
									break;
								case 5:
									fileType = 'PNGIMAGE'; 
									break;
								case 21:
									fileType = 'POSTSCRIPT'; 
									break;
								case 23:
									fileType = 'POWERPOINT'; 
									break;
								case 25:
									fileType = 'MSPROJECT'; 
									break;
								case 28:
									fileType = 'QUICKTIME'; 
									break;
								case 20:
									fileType = 'RTF'; 
									break;
								case 52:
									fileType = 'SCSS'; 
									break;
								case 18:
									fileType = 'SMS'; 
									break;
								case 48:
									fileType = 'SVG '; 
									break;
								case 36:
									fileType = 'TAR'; 
									break;
								case 7:
									fileType = 'TIFFIMAGE'; 
									break;
								case 24:
									fileType = 'VISIO'; 
									break;
								case 19:
									fileType = 'WORD'; 
									break;
								case 12:
									fileType = 'XMLDOC'; 
									break;
								case 40:
									fileType = 'XSD'; 
									break;
								case 26:
									fileType = 'ZIP'; 
									break;
							}

						config.labelFileType			= fileType;
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
	        		sendPrint:				sendPrint,
	        		getConfiguration:		getConfiguration
	    		};
	    
	});
