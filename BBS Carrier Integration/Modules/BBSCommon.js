define(['N/record', 'N/search', 'N/xml', 
        '/SuiteScripts/BBS Carrier Integration/Modules/BBSObjects'
        ],
function(record, search, xml, BBSObjects) 
{
	//=========================================================================
	//Main functions
	//=========================================================================
	//
	
	
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
				
					carrierConfig = new BBSObjects.carrierConfiguration(configCarrier, configUser, configPassword, configUrl, configMajor, configMinor, configIntermediate);
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
				      search.createColumn({name: "custrecord_bbs_primary_carrier", join: "CUSTRECORD_BBS_SC_CARRIER", label: "Primary Carrier/Integrator"})
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
					
					//Create a shipping item info object
					//
					shippingCarrierInfo = new BBSObjects.shippingItemInfo(primaryCarrier, primaryCarrierName, packCodeReq, name, carrierCode, carrierId, carrierContractNo, serviceCode);
					
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
	function _json2xml(o, tab) 
	{
		var toXml = function(v, name, ind) 
	      	{
				var xml = "";

				if (v instanceof Array) 
	            	{
						for (var i=0, n=v.length; i<n; i++)
							{
	            	   			xml += ind + toXml(v[i], name, ind+"\t") + "\n";
							}
	            	}
				else if (typeof(v) == "object") 
	            	{
						var hasChild = false;
	               
						xml += ind + "<v5:" + name;

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
	                        	   		xml += toXml(v[m], m, ind+"\t");
	                        	   }
	                        }
	                     
	                     xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</v5:" + name + ">";
	                  }
	            }
	         else 
	            {
	               xml += ind + "<v5:" + name + ">" + v.toString() +  "</v5:" + name + ">";
	            }

	         return xml;
	      }

	      var xml="";

	   for (var m in o)
		   {
		   	xml += toXml(o[m], m, "");
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
	    		getConfig:				_getConfig,
	    		lookupShippingItem:		_lookupShippingItem,
	    		isNullOrEmpty:			_isNullOrEmpty,
	    		isNull:					_isNull,
	    		xmlToJson:				_xmlToJson,
	    		json2xml:				_json2xml
    		};
    
});
