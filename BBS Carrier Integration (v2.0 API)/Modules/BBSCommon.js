define(['N/record', 'N/search', '/SuiteScripts/BBS Carrier Integration/Modules/BBSObjects'],
function(record, search, BBSObjects) 
{
	//Function to get the configuration info from the config record id
	//
	function _getConfig(_configId)
		{
			var configRecord = null;
			var carrierConfig = null;
			
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
			
			var customrecord_bbs_carriersSearchObj = getResults(search.create({
				   type: "customrecord_bbs_carriers",
				   filters:
				   [
				      ["custrecord_bbs_carrier_shippintg_item","anyof",_shippingItemId], 
				      "AND", 
				      ["isinactive","is","F"]
				   ],
				   columns:
				   [
				      search.createColumn({name: "custrecord_bbs_carrier_code", label: "Carrier Code"}),
				      search.createColumn({name: "name",label: "Name"}),
				      search.createColumn({name: "custrecord_bbs_carrier_pack_code_req", label: "Package Code Required"}),
				      search.createColumn({name: "custrecord_bbs_primary_carrier", label: "Primary Carrier/Integrator"})
				   ]
				}));
				
			if(customrecord_bbs_carriersSearchObj != null && customrecord_bbs_carriersSearchObj.length == 1)
				{
					var primaryCarrier 	= customrecord_bbs_carriersSearchObj[0].getValue({name: 'custrecord_bbs_primary_carrier'});
					var packCodeReq 	= customrecord_bbs_carriersSearchObj[0].getValue({name: 'custrecord_bbs_carrier_pack_code_req'});
					var name 			= customrecord_bbs_carriersSearchObj[0].getValue({name: 'name'});
					var carrierCode 	= customrecord_bbs_carriersSearchObj[0].getValue({name: 'custrecord_bbs_carrier_code'});
					var carrierId 		= customrecord_bbs_carriersSearchObj[0].id;
					
					shippingCarrierInfo = new BBSObjects.shippingItemInfo(primaryCarrier, packCodeReq, name, carrierCode, carrierId);
					
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
						
					if(customrecord_bbs_carrier_service_codesSearchObj != null && customrecord_bbs_carrier_service_codesSearchObj.length > 0)
						{
							for (var int = 0; int < customrecord_bbs_carrier_service_codesSearchObj.length; int++) 
								{
									var serviceCode 			= customrecord_bbs_carrier_service_codesSearchObj[int].getValue({name: 'custrecord_bbs_sc_code'});
									var serviceDescription 		= customrecord_bbs_carrier_service_codesSearchObj[int].getValue({name: 'custrecord_bbs_sc_desc'});
									var servicePalletParcel 	= customrecord_bbs_carrier_service_codesSearchObj[int].getValue({name: 'custrecord_bbs_sc_pp'});
									var servicePalletParcelText = customrecord_bbs_carrier_service_codesSearchObj[int].getText({name: 'custrecord_bbs_sc_pp'});
									
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
					
					if(customrecord_bbs_carrier_package_codesSearchObj != null && customrecord_bbs_carrier_package_codesSearchObj.length > 0)
						{
							for (var int = 0; int < customrecord_bbs_carrier_package_codesSearchObj.length; int++) 
								{
									var packageCode 			= customrecord_bbs_carrier_package_codesSearchObj[int].getValue({name: 'custrecord_bbs_car_pack_code'});
									var packageDescription 		= customrecord_bbs_carrier_package_codesSearchObj[int].getValue({name: 'custrecord_bbs_car_pack_desc'});
									
									shippingCarrierInfo.addPackageCode(packageCode, packageDescription);
								}
						}					
				}
			
			return shippingCarrierInfo;
		}
	
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
	
	//Return functions
	//
    return 	{
	    		getConfig:				_getConfig,
	    		lookupShippingItem:		_lookupShippingItem
    		};
    
});
