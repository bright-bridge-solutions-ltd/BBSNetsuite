define(['N/record', 'N/search', 'N/xml', 'N/config', 'N/https','N/encode',
        './BBSObjects',
        './secret',
        './oauth',
        './cryptojs'
        ],
function(record, search, xml, config, https, encode, BBSObjects, secret, oauth, cryptojs) 
{
	//=========================================================================
	//Main functions
	//=========================================================================
	//
	
	//Convert html label to png using pdfcrowd
	//
	function _convertHtmlToPng(_htmlText)
		{
			var pngImage = '';
			
			//Get the config record for the converter
			//
			var customrecord_bbs_carrier_label_conv_confSearchObj = getResults(search.create({
				   type: "customrecord_bbs_carrier_label_conv_conf",
				   filters:
				   [
				      ["isinactive","is","F"]
				   ],
				   columns:
				   [
				      search.createColumn({name: "custrecord_bbs_carrier_label_conv_user", label: "Username"}),
				      search.createColumn({name: "custrecord_bbs_carrier_label_conv_key", label: "API Key"}),
				      search.createColumn({name: "custrecord_bbs_carrier_label_conv_url", label: "API Endpoint"})
				   ]
				}));
			
			//Did we find the record?
			//
			if(customrecord_bbs_carrier_label_conv_confSearchObj != null && customrecord_bbs_carrier_label_conv_confSearchObj.length > 0)
				{
					var username 	= customrecord_bbs_carrier_label_conv_confSearchObj[0].getValue({name: "custrecord_bbs_carrier_label_conv_user"});
					var apiKey 		= customrecord_bbs_carrier_label_conv_confSearchObj[0].getValue({name: "custrecord_bbs_carrier_label_conv_key"});
					var endpoint 	= customrecord_bbs_carrier_label_conv_confSearchObj[0].getValue({name: "custrecord_bbs_carrier_label_conv_url"});
					
					//Encode the credentials
					//
					var combinedCredentials 	= username + ':' + apiKey;
					var authorisation 			= 'Basic ' + encode.convert({
																			string:			combinedCredentials,
																			inputEncoding:	encode.Encoding.UTF_8,
																			outputEncoding:	encode.Encoding.BASE_64
																			});
					//Construct the header of the call
					//
					var headerObj 				= {};
					headerObj['Content-Type'] 	= 'application/x-www-form-urlencoded';
					headerObj['Authorization'] 	= authorisation;
			
					//Construct the body of the call
					//
					var bodyObj 				= {};
					bodyObj['output_format']	= 'png';
					bodyObj['text']				= _htmlText;
					
					//Attempt the call to the api
					//
					try
						{
							var response = https.post({	
														url:		endpoint,
														headers:	headerObj,
														body:		bodyObj
														});
							
							//Extract the http response code	
							//
							responseStatus = response.code;
							
							//Extract the http response body
							//
							if(response.body != null && response.body != '')
								{
									pngImage = response.body;
								}
						}
				catch(err)
						{
							responseStatus = err.message;
						}
				}
			
			return pngImage;
		}
	
	//Perform a licence check against our licence database
	//
	function _doLicenceCheck(_product)
		{
			var configRecord 	= null;
			var PRODUCT_NAME	= _product
			var LICENCE_MODE	= 'L';		//Licenced mode 
			var licenceResponse	= {};
			
			try
				{
					configRecord = config.load({
											type: config.Type.COMPANY_INFORMATION
											});
				}
			catch(err)
				{
					configRecord = null;
				}
			
			if(configRecord != null)
				{
					var companyId 	= configRecord.getValue({fieldId: 'companyid'});
					var companyName = configRecord.getValue({fieldId: 'legalname'});
	
					var licenceCheckResponse 	= _validateLicence(companyId, companyName, PRODUCT_NAME, LICENCE_MODE);
					
					//If the http response code is 200  the return the result of the call
					//
					if(licenceCheckResponse.httpResponseCode == '200')
						{	
							licenceResponse['status'] 	= licenceCheckResponse.apiResponse.status;
							licenceResponse['message'] 	= licenceCheckResponse.apiResponse.message;
							
							return licenceResponse;
						}
					
					//If the http response code is anything other than 200 we are ok
					//This is done to prevent the licence check from working if our end point is unavailable
					//
					if(licenceCheckResponse.httpResponseCode != '200')
						{
							licenceResponse['status'] 	= 'OK';
							licenceResponse['message'] 	= '';
							
							return licenceResponse;
						}
					
				}
			else
				{
					//Can't find the config record, so we will have to say everything is ok
					//
					licenceResponse['status'] 	= 'OK';
					licenceResponse['message'] 	= '';
					
					return licenceResponse;
				}
		}

	//
	//Licence helper function
	//
	function _validateLicence(_account, _name, _product, _mode)
		{
			var response		= null;
			var responseBodyObj	= null;
			var licenceResponse	= new licenceResponseObj();
			var fullUrl			= secret.url + '&account=' + xml.escape({xmlText: _account}) + '&name=' + xml.escape({xmlText: _name}) + '&product=' + xml.escape({xmlText: _product}) + '&mode=' + _mode;
			var headers 		= oauth.getHeaders({
											        url: 			fullUrl,
											        method: 		secret.method,
											        tokenKey: 		secret.token.public,
											        tokenSecret: 	secret.token.secret   
											        });
		
		    headers['Content-Type'] = 'application/json';
		
		    try
		    	{
		    		response = https.get({
										        url: 		fullUrl,
										        headers: 	headers
										    	});
				    
				    
				    //Extract the http response code	
					//
				    licenceResponse.httpResponseCode = response.code;
					
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
									licenceResponse.apiResponse 		= responseBodyObj;
								}
						}
				}
			catch(err)
				{
					licenceResponse.responseMessage = err.message;
				}
	
		    return licenceResponse
		}

	//
	//Licence Objects
	//
	function licenceResponseObj()
		{
			this.httpResponseCode	= '';
			this.responseMessage 	= '';
			this.apiResponse		= {};
		}

	
	//Function to get the subsidiary address or the company address if no subsidiary
	//
	function _getSenderAddress(_subsidiaryId)
		{
			var senderAddressObj = null;
			
			try
				{
					// load the subsidiary record
					var subsidiaryRecord = record.load({
														type: 	record.Type.SUBSIDIARY,
														id: 	_subsidiaryId
													});
					
					
					// get the address subrecord
					var addressSubrecord = subsidiaryRecord.getSubrecord({
																		fieldId: 'mainaddress'
																		});
					
					
					var addresse = addressSubrecord.getValue({
																		fieldId: 'addressee'
																	});
					
					var addressLine1 = addressSubrecord.getValue({
																			fieldId: 'addr1'
																		});
					
					var addressLine2 = addressSubrecord.getValue({
																			fieldId: 'addr2'
																		});
					
					var city = addressSubrecord.getValue({
																	fieldId: 'city'
																});
					
					var county = addressSubrecord.getValue({
																	fieldId: 'state'
																	});
					
					var postcode = addressSubrecord.getValue({
																		fieldId: 'zip'
																	});
					
					var country = addressSubrecord.getValue({
																	fieldId: 'country'
																});
					
					// create an address object
					//
					senderAddressObj = new BBSObjects.addressObject(addresse, addressLine1, addressLine2, city, county, postcode, country);
					
					
					
				}
			catch(err) // error because of Non-OneWorld account
				{
					//Will need to read the comapny config record here to get the correct data
					//
					//TODO
					//
				}
			
			return senderAddressObj;
		}
	
	
	
	//Function to get the configuration info from the config record id
	//
	function _getConfig(_configId)
		{
			var configRecord = null;
			var carrierConfig = null;
			
			//Read the configuration record
			//
			try
				{
					configRecord = record.load({
												type:	'customrecord_bbs_carrier_config',
												id:		_configId
												});
				}
			catch(err)
				{
					configRecord = null;
				}
		
			//Process the configuration record into a configuration object
			//
			if(configRecord != null)
				{
					var configCarrier 		= configRecord.getValue({fieldId: 'custrecord_bbs_config_carrier'});
					var configUser 			= configRecord.getValue({fieldId: 'custrecord_bbs_config_username'});
					var configPassword 		= configRecord.getValue({fieldId: 'custrecord_bbs_config_password'});
					var configUrl 			= configRecord.getValue({fieldId: 'custrecord_bbs_config_url'});
					var configMajor 		= configRecord.getValue({fieldId: 'custrecord_bbs_config_major'});
					var configMinor 		= configRecord.getValue({fieldId: 'custrecord_bbs_config_minor'});
					var configIntermediate 	= configRecord.getValue({fieldId: 'custrecord_bbs_config_intermediate'});
					var configLabelFormat	= configRecord.getValue({fieldId: 'custrecord_bbs_config_label_format'});
				
					carrierConfig = new BBSObjects.carrierConfiguration(configCarrier, configUser, configPassword, configUrl, configMajor, configMinor, configIntermediate, configLabelFormat);
				}
			
			return carrierConfig;
		}
	
	
	//Function to find the carrier integration that relates to a supplier shipping item id
	//
	function _lookupShippingItem(_shippingItemId)
		{
			var shippingCarrierInfo = null;
			
			//Search for carriers linked to the shipping item
			//
			var customrecord_bbs_carrier_service_codesSearchObj = getResults(search.create({
				type: "customrecord_bbs_carrier_service_codes",
				   filters:
				   [
				      ["custrecord_bbs_sc_shipping_item","anyof",_shippingItemId], 
				      "AND", 
				      ["isinactive","is","F"]
				   ],
				   columns:
				   [
				      search.createColumn({name: "custrecord_bbs_sc_carrier", label: "Carrier"}),
				      search.createColumn({name: "custrecord_bbs_sc_code", label: "Service Code"}),
				      search.createColumn({name: "custrecord_bbs_sc_desc", label: "Product Description"}),
				      search.createColumn({name: "custrecord_bbs_sc_pp", label: "Pallet / Parcel"}),
				      search.createColumn({name: "custrecord_bbs_sc_shipping_item", label: "Related Shipping Item"}),
				      search.createColumn({name: "custrecord_bbs_carrier_contract_no", join: "CUSTRECORD_BBS_SC_CARRIER", label: "Contract Number"}),
				      search.createColumn({name: "custrecord_bbs_carrier_code", join: "CUSTRECORD_BBS_SC_CARRIER", label: "Carrier Code"}),
				      search.createColumn({name: "custrecord_bbs_carrier_pack_code_req", join: "CUSTRECORD_BBS_SC_CARRIER", label: "Package Code Required"}),
				      search.createColumn({name: "custrecord_bbs_primary_carrier", join: "CUSTRECORD_BBS_SC_CARRIER", label: "Primary Carrier/Integrator"}),
				      search.createColumn({name: "custrecord_bbs_carrier_meter_no", join: "CUSTRECORD_BBS_SC_CARRIER", label: "Meter Number"})
				      
				   ]
				}));
				
			//Process the search results
			//
			if(customrecord_bbs_carrier_service_codesSearchObj != null && customrecord_bbs_carrier_service_codesSearchObj.length == 1)
				{
					var primaryCarrier 		= customrecord_bbs_carrier_service_codesSearchObj[0].getValue({name: 'custrecord_bbs_primary_carrier', join: "CUSTRECORD_BBS_SC_CARRIER"});
					var primaryCarrierName 	= customrecord_bbs_carrier_service_codesSearchObj[0].getText({name: 'custrecord_bbs_primary_carrier', join: "CUSTRECORD_BBS_SC_CARRIER"});
					var packCodeReq 		= customrecord_bbs_carrier_service_codesSearchObj[0].getValue({name: 'custrecord_bbs_carrier_pack_code_req', join: "CUSTRECORD_BBS_SC_CARRIER"});
					var name 				= customrecord_bbs_carrier_service_codesSearchObj[0].getText({name: 'custrecord_bbs_sc_carrier'});
					var carrierCode 		= customrecord_bbs_carrier_service_codesSearchObj[0].getValue({name: 'custrecord_bbs_carrier_code', join: "CUSTRECORD_BBS_SC_CARRIER"});
					var carrierContractNo	= customrecord_bbs_carrier_service_codesSearchObj[0].getValue({name: 'custrecord_bbs_carrier_contract_no', join: "CUSTRECORD_BBS_SC_CARRIER"});
					var carrierId 			= customrecord_bbs_carrier_service_codesSearchObj[0].getValue({name: 'custrecord_bbs_sc_carrier'})
					var serviceCode 		= customrecord_bbs_carrier_service_codesSearchObj[0].getValue({name: 'custrecord_bbs_sc_code'});
					var meterNumber			= customrecord_bbs_carrier_service_codesSearchObj[0].getValue({name: 'custrecord_bbs_carrier_meter_no', join: "CUSTRECORD_BBS_SC_CARRIER"});
					
					//Create a shipping item info object
					//
					shippingCarrierInfo = new BBSObjects.shippingItemInfo(primaryCarrier, primaryCarrierName, packCodeReq, name, carrierCode, carrierId, carrierContractNo, serviceCode, meterNumber);
					
					//Now get any related service codes
					//
					var customrecord_bbs_carrier_service_codesSearchObj = getResults(search.create({
						   type: "customrecord_bbs_carrier_service_codes",
						   filters:
						   [
						      ["custrecord_bbs_sc_carrier","anyof",carrierId], 
						      "AND", 
						      ["isinactive","is","F"]
						   ],
						   columns:
						   [
						      search.createColumn({name: "custrecord_bbs_sc_carrier", label: "Carrier"}),
						      search.createColumn({name: "custrecord_bbs_sc_code", label: "Service Code"}),
						      search.createColumn({name: "custrecord_bbs_sc_desc", label: "Product Description"}),
						      search.createColumn({name: "custrecord_bbs_sc_pp", label: "Pallet / Parcel"})
						   ]
						}));
						
					//Process the search of service codes
					//
					if(customrecord_bbs_carrier_service_codesSearchObj != null && customrecord_bbs_carrier_service_codesSearchObj.length > 0)
						{
							for (var int = 0; int < customrecord_bbs_carrier_service_codesSearchObj.length; int++) 
								{
									var serviceCode 			= customrecord_bbs_carrier_service_codesSearchObj[int].getValue({name: 'custrecord_bbs_sc_code'});
									var serviceDescription 		= customrecord_bbs_carrier_service_codesSearchObj[int].getValue({name: 'custrecord_bbs_sc_desc'});
									var servicePalletParcel 	= customrecord_bbs_carrier_service_codesSearchObj[int].getValue({name: 'custrecord_bbs_sc_pp'});
									var servicePalletParcelText = customrecord_bbs_carrier_service_codesSearchObj[int].getText({name: 'custrecord_bbs_sc_pp'});
									
									//Add service codes to the shipping item info object
									//
									shippingCarrierInfo.addServiceCode(serviceCode, serviceDescription, servicePalletParcel, servicePalletParcelText);
								}
						}
					
					//Now get any related package codes
					//
					var customrecord_bbs_carrier_package_codesSearchObj = getResults(search.create({
						   type: "customrecord_bbs_carrier_package_codes",
						   filters:
						   [
						      ["isinactive","is","F"], 
						      "AND", 
						      ["custrecord_bbs_car_pack_car","anyof",carrierId]
						   ],
						   columns:
						   [
						      search.createColumn({name: "custrecord_bbs_car_pack_code", label: "Package Code"}),
						      search.createColumn({name: "custrecord_bbs_car_pack_desc", label: "Package Description"})
						   ]
						}));
					
					//Process the search results
					//
					if(customrecord_bbs_carrier_package_codesSearchObj != null && customrecord_bbs_carrier_package_codesSearchObj.length > 0)
						{
							for (var int = 0; int < customrecord_bbs_carrier_package_codesSearchObj.length; int++) 
								{
									var packageCode 			= customrecord_bbs_carrier_package_codesSearchObj[int].getValue({name: 'custrecord_bbs_car_pack_code'});
									var packageDescription 		= customrecord_bbs_carrier_package_codesSearchObj[int].getValue({name: 'custrecord_bbs_car_pack_desc'});
									
									//Add the package codes to the shipping item info object
									//
									shippingCarrierInfo.addPackageCode(packageCode, packageDescription);
								}
						}					
				}
			
			return shippingCarrierInfo;
		}
	
	//Function to find contact details
	//
	function _findContactDetails(_customerID)
		{
			// lookup fields on the customer record
			var customerLookup = search.lookupFields({
													type: 		search.Type.CUSTOMER,
													id: 		_customerID,
													columns: 	['email', 'phone','vatregnumber','custentity_bbs_ci_eori']
													});
			
			// return values from the customerLookup object
			var customerEmail 	= customerLookup.email;
			var customerPhone 	= customerLookup.phone;
			var customerVat 	= customerLookup.vatregnumber;
			var customerEori 	= customerLookup.custentity_bbs_ci_eori;
			
			// create a contact object
			var contactInfo = new BBSObjects.contactObject(customerPhone, customerEmail, customerVat, customerEori);
			
			// return the contact object
			return contactInfo;
		}
	
	
	function _findSubsidiaryContactDetails(_subsidiaryId)
		{
			var contactInfo =  new BBSObjects.contactObject('', '', '', '');
			
			try
				{
					// load the subsidiary record
					var subsidiaryRecord = record.load({
														type: 	record.Type.SUBSIDIARY,
														id: 	_subsidiaryId
													});
					
					var subsidiaryEmail 	= subsidiaryRecord.getValue({fieldId: 'email'});
					var subsidiaryPhone 	= subsidiaryRecord.getValue({fieldId: 'custrecord_bbs_ci_phone'});
					var subsidiaryVat 		= subsidiaryRecord.getValue({fieldId: 'federalidnumber'});
					var subsidiaryEori 		= subsidiaryRecord.getValue({fieldId: 'custrecord_bbs_ci_eori'});
					
					// create a contact object
					contactInfo = new BBSObjects.contactObject(subsidiaryPhone, subsidiaryEmail, subsidiaryVat, subsidiaryEori);
					
				}
			catch(err)
				{
				
				}
			
			// return the contact object
			return contactInfo;
		}

	//Function to replace a null value with a specific value
	//
	function _isNull(_string, _replacer)
		{
			if(_string == null)
				{
					return _replacer;
				}
			else
				{
					return _string;
				}
		}

	
	//Function to work out if an object is null or blank
	//
	function _isNullOrEmpty(strVal)
		{
			return(strVal == undefined || strVal == null || strVal === "");
		}
	
	
	//Function to convert an xml string to a JSON object
	//
	function _xmlToJson(xmlNode) 
		{
		    //Create the return object
			//
		    var obj = Object.create(null);
	
		    if (xmlNode.nodeType == xml.NodeType.ELEMENT_NODE) 
		    	{ 	
		        	//Do attributes
		    		//
		        	if (xmlNode.hasAttributes()) 
		        		{
		        			obj['@attributes'] = Object.create(null);
		        			
				            for (var j in xmlNode.attributes) 
				            	{
				                	if(xmlNode.hasAttribute({name : j}))
				                		{
				                			obj['@attributes'][j] = xmlNode.getAttribute({name : j});
				                		}
				            	}
		        		}
		    	} 
		    else if (xmlNode.nodeType == xml.NodeType.TEXT_NODE) 
		    	{ 
		        	obj = xmlNode.nodeValue;
		    	}
	
		    //Do children
		    //
		    if (xmlNode.hasChildNodes()) 
		    	{
			        for (var i = 0, childLen = xmlNode.childNodes.length; i < childLen; i++) 
			        	{
			            	var childItem = xmlNode.childNodes[i];
			            	
			            	var nodeName = childItem.nodeName;
			            	
			            	if (nodeName in obj) 
			            		{
					                if (!Array.isArray(obj[nodeName])) 
					                	{
					                    	obj[nodeName] = [obj[nodeName]];
					                	}
					                
					                obj[nodeName].push(_xmlToJson(childItem));
			            		} 
			            	else 
			            		{
			            			obj[nodeName] = _xmlToJson(childItem);
			            		}
			        	}
		    	}
	
		    return obj;
		}

	
	//Function to convert a JSON object to an xml representation of that object
	//
	function _json2xml(o, tab, prefix) 
		{
	        prefix = (prefix == null ? '' : prefix);
	
	        var toXml = function(v, name, ind, prefix) 
		      	{
					var xml = "";
		
					if (v instanceof Array) 
		            	{
							for (var i=0, n=v.length; i<n; i++)
								{
		            	   			xml += ind + toXml(v[i], name, ind+"\t", prefix) + "\n";
								}
		            	}
					else if (typeof(v) == "object") 
		            	{
							var hasChild = false;
		               
							xml += ind + "<" + prefix + name;
		
							for (var m in v) 
								{
									if (m.charAt(0) == "@")
										{
											xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
										}
									else
										{
											hasChild = true;
										}
								}
		               
							xml += hasChild ? ">" : "/>";
		
							if (hasChild) 
				                  {
				                     for (var m in v) 
				                        {
				                           if (m == "#text")
				                        	   {
				                        	   		xml += v[m];
				                        	   }
				                           else if (m.charAt(0) != "@")
				                        	   {
				                        	   		xml += toXml(v[m], m, ind+"\t", prefix);
				                        	   }
				                        }
				                     
				                     xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + prefix + name + ">";
				                  }
			            }
			         else 
			            {
			        	 	xml += ind + "<" + prefix + name + ">" + v.toString() +  "</" + prefix + name + ">";
			            }
		
					return xml;
		      	}
	
	      var xml="";
	
	   for (var m in o)
		   {
		   		xml += toXml(o[m], m, "",prefix);
		   }
	   
	   		return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
		}


	
	//=========================================================================
	//Helper functions
	//=========================================================================
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
	
	
	//=========================================================================
	//Return functions that are available in this module 
	//=========================================================================
	//
   return 	{
	    		getConfig:						_getConfig,
	    		lookupShippingItem:				_lookupShippingItem,
	    		isNullOrEmpty:					_isNullOrEmpty,
	    		isNull:							_isNull,
	    		xml2Json:						_xmlToJson,
	    		json2xml:						_json2xml,
	    		findContactDetails:				_findContactDetails,
	    		getSenderAddress:				_getSenderAddress,
	    		findSubsidiaryContactDetails:	_findSubsidiaryContactDetails,
	    		doLicenceCheck:					_doLicenceCheck,
	    		convertHtmlToPng:				_convertHtmlToPng
    		};
    
});
