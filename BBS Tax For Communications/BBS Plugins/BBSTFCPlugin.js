/**
 * @NApiVersion 2.x
 * @NScriptType plugintypeimpl
 * @NModuleScope Public
 */
define(['N/email', 'N/encode', 'N/file', 'N/https', 'N/record', 'N/runtime', 'N/search', './libraryModule'],
/**
 * @param {email} email
 * @param {encode} encode
 * @param {file} file
 * @param {https} https
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(email, encode, file, https, record, runtime, search, libraryModule) 
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
	
	    //Get tax calculation results
	    //
	    function getTaxCalculation(_calcTaxesRequest)
	    	{
		    	var headerObj 			= {};
				var getTaxesObj 		= new libraryModule.libGenericResponseObj();
				var responseBodyObj 	= null;
				var configurationObj	= null;
				
				//Get the current configuration
				//
				configurationObj = getConfiguration();
				
				if(configurationObj != null)
					{
						//Build up the headers for the get request
						//
						headerObj['Authorization'] 		= configurationObj.credentialsEncoded;
						headerObj['Accept']				= '*/*';
						headerObj['client_id']			= configurationObj.clientId;
						headerObj['Content-Type']		= 'application/json-patch+json';
						
						//Execute the request 
						//  
						try
							{
								var response = https.post({	
															url:		configurationObj.endpointGetTaxCalulation,
															headers:	headerObj,
															body:		JSON.stringify(_calcTaxesRequest)
															});
						
								//Extract the http response code	
								//
								getTaxesObj.httpResponseCode = response.code;
								
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
												getTaxesObj.apiResponse 		= responseBodyObj;
											}
									}
							}
						catch(err)
							{
								getTaxesObj.responseMessage = err.message;
							}
					}
				else
					{
						getTaxesObj.responseMessage = 'No valid configuration found';
					}
				
				return getTaxesObj;
	    	}
	    
	    //Get a list of all the transaction/service pairs
		//
		function getTSPairs()
			{
				var headerObj 			= {};
				var getTSPairsObj 		= new libraryModule.libGenericResponseObj();
				var responseBodyObj 	= null;
				var configurationObj	= null;
				
				//Get the current configuration
				//
				configurationObj = getConfiguration();
				
				if(configurationObj != null)
					{
						//Build up the headers for the get request
						//
						headerObj['Authorization'] 		= configurationObj.credentialsEncoded;
						headerObj['Accept']				= '*/*';
						headerObj['client_id']			= configurationObj.clientId;
						headerObj['Content-Type']		= 'application/json';
						
						//Execute the request 
						//  
						try
							{
								var response = https.get({	
															url:		configurationObj.endpointGetTxServicePairs,
															headers:	headerObj,
															});
						
								//Extract the http response code	
								//
								getTSPairsObj.httpResponseCode = response.code;
								
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
												getTSPairsObj.apiResponse 		= responseBodyObj;
											}
									}
							}
						catch(err)
							{
								getTSPairsObj.responseMessage = err.message;
							}
					}
				else
					{
						getTSPairsObj.responseMessage = 'No valid configuration found';
					}
				
				return getTSPairsObj;
		}
		
		
		//Get a specific, or all tax types
		//
		function getTaxType(_taxType)
			{
				var headerObj 			= {};
				var getTaxTypeObj 		= new libraryModule.libGenericResponseObj();
				var responseBodyObj 	= null;
				var configurationObj	= null;
				
				//Get the current configuration
				//
				configurationObj = getConfiguration();
				
				if(configurationObj != null)
					{
						//Build up the headers for the get request
						//
						headerObj['Authorization'] 		= configurationObj.credentialsEncoded;
						headerObj['Accept']				= '*/*';
						headerObj['client_id']			= configurationObj.clientId;
						headerObj['Content-Type']		= 'application/json';
						
						//Execute the request - adding * to the end of the url returns all tax types
						//  
						try
							{
								var response = https.get({	
															url:		configurationObj.endpointGetTaxTypes +  '/' + (_taxType == '' || _taxType == null ? '*' : _taxType),
															headers:	headerObj,
															});
						
								//Extract the http response code	
								//
								getTaxTypeObj.httpResponseCode = response.code;
								
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
												getTaxTypeObj.apiResponse 		= responseBodyObj;
											}
									}
							}
						catch(err)
							{
								getTaxTypeObj.responseMessage = err.message;
							}
					}
				else
					{
						getTaxTypeObj.responseMessage = 'No valid configuration found';
					}
				
				return getTaxTypeObj;
		}
		

		//Get the current configuration
		//
		function getConfiguration()
			{
				var config = null;
				
				//Search for an active configuration
				//
				var customrecord_bbstfc_configSearchObj = getResults(search.create({
					   type: "customrecord_bbstfc_config",
					   filters:
					   [
					      ["isinactive","is","F"]
					   ],
					   columns:
					   [
					      search.createColumn({name: "custrecord_bbstfc_conf_proc_mode", label: "API Processing Mode"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_client_id", label: "Client Id"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_prod_ep", label: "Endpoint Prefix (Production)"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_sb_ep", label: "Endpoint Prefix (Sandbox)"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_calc_tax", label: "Endpoint – Calculate Taxes"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_commit", label: "Endpoint – Commit"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_ep_gcode", label: "Endpoint – Get GeoCode"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_ep_loc", label: "Endpoint – Get Location"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_ep_pcode", label: "Endpoint – Get PCode"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_ep_pr_loc", label: "Endpoint – Get Primary Location"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_ep_tax_types", label: "Endpoint – Get Tax Types"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_ep_tx_svc", label: "Endpoint – Get Tx/Service Pairs"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_ep_health", label: "Endpoint – Health Check"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_ep_svc_info", label: "Endpoint – Service Info"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_pcl_script", label: "PCode Lookup Script"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_password", label: "Password"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_profile_id", label: "Profile Id"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_username", label: "Username"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_non_bill_tax", label: "Non Billable Taxes"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_extended_tax", label: "Extended Tax Info"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_reporting_info", label: "Reporting Info"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_own_facilities", label: "Own Facilities"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_franchise", label: "Franchise"}),
					      search.createColumn({name: "custrecord_bbstfc_conf_regulated", label: "Regulated"}),
					      search.createColumn({name: "custrecord_bbstfc_bus_class_code",join: "CUSTRECORD_BBSTFC_CONF_BUS_CLASS",label: "Class Code"}),
					      search.createColumn({name: "custrecord_bbstfc_svc_class_code",join: "CUSTRECORD_BBSTFC_CONF_SVC_CLASS",label: "Class Code"})
					   ]
					}));
				
				//Found one?
				//
				if(customrecord_bbstfc_configSearchObj != null && customrecord_bbstfc_configSearchObj.length > 0)
					{
						config 						= new libraryModule.libConfigObj();
						var processingMode 			= Number(customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_proc_mode'}));
						var username 				= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_username'});
						var password 				= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_password'});
						var combinedCredentials		= username + ':' + password;
						var urlPrefix 				= '';
						
						//Construct full url based on api mode
						//
						switch(processingMode)
							{
								case 1:	//Production
									urlPrefix = customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_prod_ep'});
									break;
									
								case 2: //Sandbox
									urlPrefix = customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_sb_ep'});
									break;
							}
						
						config.businessClass				= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_bus_class_code', join: "CUSTRECORD_BBSTFC_CONF_BUS_CLASS"});
						config.serviceClass					= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_svc_class_code', join: "CUSTRECORD_BBSTFC_CONF_SVC_CLASS"});
						config.ownFacilities				= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_own_facilities'});
						config.franchise					= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_franchise'});
						config.regulated					= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_regulated'});
						config.nonBillableTaxes				= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_non_bill_tax'});
						config.extendedTaxInfo				= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_extended_tax'});
						config.reportingInfo				= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_reporting_info'});
						config.pcodeLookupScript 			= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_pcl_script'});
						config.clientId 					= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_client_id'});
						config.profileId 					= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_profile_id'});
						config.endpointGetTaxCalulation 	= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_calc_tax'});
						config.endpointCommit 				= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_commit'});
						config.endpointGetGeocode 			= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_ep_gcode'});
						config.endpointGetLocation 			= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_ep_loc'});
						config.endpointGetPcode 			= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_ep_pcode'});
						config.endpointGetPrimaryLocation 	= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_ep_pr_loc'});
						config.endpointGetTaxTypes 			= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_ep_tax_types'});
						config.endpointGetTxServicePairs 	= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_ep_tx_svc'});
						config.endpointGetHealthCheck 		= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_ep_health'});
						config.endpointGetServiceInfo 		= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_ep_svc_info'});
						config.credentialsEncoded			= 'Basic ' + encode.convert({
																						string:			combinedCredentials,
																						inputEncoding:	encode.Encoding.UTF_8,
																						outputEncoding:	encode.Encoding.BASE_64
																						});

					}
				
				return config;
			}
	
	
		//Get a PCode from an address
		//
		function getPCode(_addressObj)
			{
				var headerObj 			= {};
				var getPCodeObj 		= new libraryModule.libGenericResponseObj();
				var responseBodyObj 	= null;
				var configurationObj	= null;
				
				//Get the current configuration
				//
				configurationObj = getConfiguration();
				
				if(configurationObj != null)
					{
						//Build up the headers for the get request
						//
						headerObj['Authorization'] 		= configurationObj.credentialsEncoded;
						headerObj['Accept']				= '*/*';
						headerObj['client_id']			= configurationObj.clientId;
						headerObj['Content-Type']		= 'application/json';
						
						//Execute the request
						//
						try
							{
								var response = https.post({	
															url:		configurationObj.endpointGetPcode,
															headers:	headerObj,
															body:		JSON.stringify(_addressObj)
															});
						
								//Extract the http response code	
								//
								getPCodeObj.httpResponseCode = response.code;
								
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
												getPCodeObj.apiResponse 		= responseBodyObj;
											}
									}
							}
						catch(err)
							{
								getPCodeObj.responseMessage = err.message;
							}
					}
				else
					{
						getPCodeObj.responseMessage = 'No valid configuration found';
					}
				
				return getPCodeObj;
			}
		
		
		//Get general service info from the api
		//
		function getServiceInfo()
			{
				var headerObj 			= {};
				var serviveInfoObj 		= new libraryModule.libGenericResponseObj();
				var responseBodyObj 	= null;
				var configurationObj	= null;
				
				//Get the current configuration
				//
				configurationObj = getConfiguration();
				
				if(configurationObj != null)
					{
						//Build up the headers for the get request
						//
						headerObj['Authorization'] 		= configurationObj.credentialsEncoded;
						headerObj['Accept']				= '*/*';
						headerObj['client_id']			= configurationObj.clientId;
						headerObj['Content-Type']		= 'application/json';
						
						//Execute the request
						//
						try
							{
								var response = https.get({	
															url:		configurationObj.endpointGetServiceInfo,
															headers:	headerObj
															});
						
								//Extract the http response code	
								//
								serviveInfoObj.httpResponseCode = response.code;
								
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
												serviveInfoObj.apiResponse 		= responseBodyObj;
											}
									}
							}
						catch(err)
							{
								serviveInfoObj.responseMessage = err.message;
							}
					}
				else
					{
						serviveInfoObj.responseMessage = 'No valid configuration found';
					}
				
				return serviveInfoObj;
				
			}
		
		
		//Perform a basic health check on the api end point
		//
		function healthcheck()
			{
				var headerObj 			= {};
				var healthCheckObj 		= new libraryModule.libGenericResponseObj();
				var responseBodyObj 	= null;
				var configurationObj	= null;
				
				//Get the current configuration
				//
				configurationObj = getConfiguration();
				
				if(configurationObj != null)
					{
						//Build up the headers for the get request
						//
						headerObj['Authorization'] 		= configurationObj.credentialsEncoded;
						headerObj['Accept']				= '*/*';
						headerObj['client_id']			= configurationObj.clientId;
						headerObj['Content-Type']		= 'application/json';
						
						//Execute the request
						//
						try
							{
								var response = https.get({	
															url:		configurationObj.endpointGetHealthCheck,
															headers:	headerObj
															});
						
								//Extract the http response code	
								//
								healthCheckObj.httpResponseCode = response.code;
								
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
												healthCheckObj.apiResponse 		= responseBodyObj;
											}
									}
							}
						catch(err)
							{
								healthCheckObj.responseMessage = err.message;
							}
					}
				else
					{
						healthCheckObj.responseMessage = 'No valid configuration found';
					}
				
				return healthCheckObj;
			}
	    
		//Return exposed functions
		//
		return {
	        		getHealthCheck:			healthcheck,
	        		getServiceInfo:			getServiceInfo,
	        		getPCode:				getPCode,
	        		getTFCConfiguration:	getConfiguration,
	        		getTaxType:				getTaxType,
	        		getTSPairs:				getTSPairs,
	        		getTaxCalculation:		getTaxCalculation
	    		};
	    
	});
