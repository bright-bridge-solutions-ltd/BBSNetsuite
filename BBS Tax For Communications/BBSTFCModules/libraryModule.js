define(['N/record', 'N/runtime', 'N/search', 'N/plugin'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, runtime, search, plugin) 
{

	//=====================================================================
	//Objects
	//=====================================================================
	//
	function libConfigObj()
		{
			this.credentialsEncoded 		= '';
			this.clientId					= '';
			this.profileId					= '';
			this.endpointGetHealthCheck		= '';
			this.endpointGetServiceInfo		= '';
			this.endpointGetPcode			= '';
			this.endpointGetGeocode			= '';
			this.endpointGetTaxTypes		= '';
			this.endpointGetTxServicePairs	= '';
			this.endpointGetLocation		= '';
			this.endpointGetPrimaryLocation	= '';
			this.endpointGetTaxCalulation	= '';
			this.endpointCommit				= '';	
			this.pcodeLookupScript			= '';
			this.nonBillableTaxes			= '';
			this.extendedTaxInfo			= '';
			this.reportingInfo				= '';
			this.ownFacilities				= '';
			this.franchise					= '';
			this.regulated					= '';
			this.businessClass				= '';
			this.serviceClass				= '';
		}
	
	function libGenericResponseObj()
		{
			this.httpResponseCode	= '';
			this.responseMessage 	= '';
			this.apiResponse		= {};
		}

	//=====================================================================
	//Methods
	//=====================================================================
	//
	function libLookupPCode(currentRecord, overrideFlag)
		{
			var currentRecordId 	= currentRecord.id;
			var currentRecordType 	= currentRecord.type;
			
			//Lookup the current record type in the PCode mapping table
			//
			var customrecord_bbstfc_pcode_mapSearchObj = getResults(search.create({
				   type: "customrecord_bbstfc_pcode_map",
				   filters:
				   [
				      ["custrecord_bbstfc_pmap_rec_type","is",currentRecordType]
				   ],
				   columns:
				   [
				      search.createColumn({name: "custrecord_bbstfc_pmap_rec_type", label: "Record Type"}),
				      search.createColumn({name: "custrecord_bbstfc_pmap_iso", label: "Source Field Id - Country ISO"}),
				      search.createColumn({name: "custrecord_bbstfc_pmap_state", label: "Source Field Id - State"}),
				      search.createColumn({name: "custrecord_bbstfc_pmap_county", label: "Source Field Id - County"}),
				      search.createColumn({name: "custrecord_bbstfc_pmap_city", label: "Source Field Id - City"}),
				      search.createColumn({name: "custrecord_bbstfc_pmap_zip", label: "Source Field Id - ZipCode"}),
				      search.createColumn({name: "custrecord_bbstfc_pmap_pcode", label: "Destination Field Id - PCode"})
				   ]
				}));
				
			//Did we get any results
			//
			if(customrecord_bbstfc_pcode_mapSearchObj != null && customrecord_bbstfc_pcode_mapSearchObj.length > 0)
				{
					//Get the field mappings
					//
					var sourceCountryCode 	= customrecord_bbstfc_pcode_mapSearchObj[0].getValue({name: "custrecord_bbstfc_pmap_iso"});
					var sourceStateCode 	= customrecord_bbstfc_pcode_mapSearchObj[0].getValue({name: "custrecord_bbstfc_pmap_state"});
					var sourceCountyCode 	= customrecord_bbstfc_pcode_mapSearchObj[0].getValue({name: "custrecord_bbstfc_pmap_county"});
					var sourceCityCode 		= customrecord_bbstfc_pcode_mapSearchObj[0].getValue({name: "custrecord_bbstfc_pmap_city"});
					var sourceZipCode 		= customrecord_bbstfc_pcode_mapSearchObj[0].getValue({name: "custrecord_bbstfc_pmap_zip"});
					var destinationPCode	= customrecord_bbstfc_pcode_mapSearchObj[0].getValue({name: "custrecord_bbstfc_pmap_pcode"});
					var recordToProcess		= null;
					var recordUpdated		= false;
					
					//Get the plugin implementation
					//
					var  tfcPlugin = plugin.loadImplementation({
																type: 'customscript_bbstfc_plugin'
																});
	
					//If the current record type is "customer" or "vendor" then we have to process the address subrecord, otherwise process as-is
					//
					switch(currentRecordType)
						{
	    					case 'customer':
	    					case 'vendor':
	    						
	    						try
	    							{
			    						recordToProcess = record.load({
											    						type:		currentRecordType,
											    						id:			currentRecordId,
											    						isDynamic:	false
											    						});
	    							}
	    						catch(err)
	    							{
	    								recordToProcess	= null;
	    								log.error({
	    											title:		'Error loading record of type ' + currentRecordType + ' id = ' + currentRecordId,
	    											details:	err
	    											});
	    							}
	    						
	    						//Did the record load ok?
	    						//
	    						if(recordToProcess != null)
	    							{
	    								//Find the address lines to process
	    								//
	    								var addressLines = recordToProcess.getLineCount({sublistId: 'addressbook'});
	    							
	    								//Loop through each sublist line & get the subrecord
	    								//
	    								for (var addressLine = 0; addressLine < addressLines; addressLine++) 
		    								{
		    									var addressSubRecord = recordToProcess.getSublistSubrecord({
																    									    sublistId: 	'addressbook',
																    									    fieldId: 	'addressbookaddress',
																    									    line: 		addressLine
																    										});
		    									
		    									//Retrieve all the mapped columns
		    									//
		    									var currentCountryCode 	= (sourceCountryCode != '' && sourceCountryCode != null ? addressSubRecord.getValue({fieldId: sourceCountryCode}) : '');
		    									var currentStateCode 	= (sourceStateCode != '' && sourceStateCode != null ? addressSubRecord.getValue({fieldId: sourceStateCode}) : '');
		    									var currentCountyCode 	= (sourceCountyCode != '' && sourceCountyCode != null ? addressSubRecord.getValue({fieldId: sourceCountyCode}) : '');
		    									var currentCityCode 	= (sourceCityCode != '' && sourceCityCode != null ? addressSubRecord.getValue({fieldId: sourceCityCode}) : '');
		    									var currentZipCode 		= (sourceZipCode != '' && sourceZipCode != null ? addressSubRecord.getValue({fieldId: sourceZipCode}) : '');
		    									var currentPCode 		= (destinationPCode != '' && destinationPCode != null ? addressSubRecord.getValue({fieldId: destinationPCode}) : '');
		    									
		    									//Does the PCode have a value & do we have a field to map the pcode to?
		    									//If not then we need to get one
		    									//
		    									if((currentPCode == '' || currentPCode == null || overrideFlag) && (destinationPCode != null && destinationPCode != ''))
		    										{
		    											//Construct the request object
		    											//
			    										var pcodeRequest 		= {};
			    										pcodeRequest['BestMatch']		= true;
			    										pcodeRequest['LimitResults']	= 10;
		    										
		    											if(currentCountryCode != '' && currentCountryCode != null)
		    												{
		    													pcodeRequest['CountryIso']	= currentCountryCode;
		    												}
	    											
		    											if(currentStateCode != '' && currentStateCode != null)
		    												{
		    													pcodeRequest['State']	= currentStateCode;
		    												}
	    											
		    											if(currentCountyCode != '' && currentCountyCode != null)
		    												{
		    													pcodeRequest['County']	= currentCountyCode;
		    												}
	    											
		    											if(currentCityCode != '' && currentCityCode != null)
		    												{
		    													pcodeRequest['City']	= currentCityCode;
		    												}
	    											
		    											if(currentZipCode != '' && currentZipCode != null)
		    												{
		    													pcodeRequest['ZipCode']	= currentZipCode;
		    												}
		    										}	
		    									
		    									//Call the plugin
		    									//
		    									if(tfcPlugin != null)
			    									{
		    											try
		    												{
					    										var pcodeResult = tfcPlugin.getPCode(pcodeRequest);
					    										
					    										//Check the result of the call to the plugin
					    										//
					    										if(pcodeResult != null && pcodeResult.httpResponseCode == '200')
					    											{
					    												//Did we find any matches?
					    												//
					    												if(pcodeResult.apiResponse.MatchCount > 0)
					    													{
					    														//Get the pcode
					    														//
					    														var pcode = pcodeResult.apiResponse.LocationData[0].PCode;
					    														
					    														addressSubRecord.setValue({
					    																					fieldId: 	destinationPCode, 
					    																					value: 		pcode
					    																				});
					    														
					    														recordUpdated = true;
					    													}
					    											}
		    												}
		    											catch(err)
		    												{
			    												log.error({
							    											title:		'Error calling plugin',
							    											details:	err
							    											});
		    												}
			    									}
											}	
	    								
	    								if(recordUpdated)
	    									{
	    										try
	    											{
	    												recordToProcess.save();
	    											}
	    										catch(err)
	    											{
		    											log.error({
					    											title:		'Error saving record of type ' + currentRecordType + ' id = ' + currentRecordId,
					    											details:	err
					    											});
	    											}
	    									}
	    							}
	    						
	    						break;
	    					
	    					case 'subsidiary':
	    						
	    						try
	    							{
			    						recordToProcess = record.load({
											    						type:		currentRecordType,
											    						id:			currentRecordId,
											    						isDynamic:	false
											    						});
	    							}
	    						catch(err)
	    							{
	    								recordToProcess	= null;
	    								log.error({
	    											title:		'Error loading record of type ' + currentRecordType + ' id = ' + currentRecordId,
	    											details:	err
	    											});
	    							}
    						
	    						//Did the record load ok?
	    						//
	    						if(recordToProcess != null)
	    							{
	    								var addressTypes = ['mainaddress', 'shippingaddress', 'returnaddress'];
	    								
	    								for (var addressCounter = 0; addressCounter < addressTypes.length; addressCounter++) 
		    								{
	    										var addressSubRecord = recordToProcess.getSubrecord({fieldId: addressTypes[addressCounter]});
	    										
	    										//Retrieve all the mapped columns
		    									//
		    									var currentCountryCode 	= (sourceCountryCode != '' && sourceCountryCode != null ? addressSubRecord.getValue({fieldId: sourceCountryCode}) : '');
		    									var currentStateCode 	= (sourceStateCode != '' && sourceStateCode != null ? addressSubRecord.getValue({fieldId: sourceStateCode}) : '');
		    									var currentCountyCode 	= (sourceCountyCode != '' && sourceCountyCode != null ? addressSubRecord.getValue({fieldId: sourceCountyCode}) : '');
		    									var currentCityCode 	= (sourceCityCode != '' && sourceCityCode != null ? addressSubRecord.getValue({fieldId: sourceCityCode}) : '');
		    									var currentZipCode 		= (sourceZipCode != '' && sourceZipCode != null ? addressSubRecord.getValue({fieldId: sourceZipCode}) : '');
		    									var currentPCode 		= (destinationPCode != '' && destinationPCode != null ? addressSubRecord.getValue({fieldId: destinationPCode}) : '');
		    									
		    									//Does the PCode have a value & do we have a field to map the pcode to?
		    									//If not then we need to get one
		    									//
		    									if((currentPCode == '' || currentPCode == null || overrideFlag) && (destinationPCode != null && destinationPCode != ''))
		    										{
		    											//Construct the request object
		    											//
			    										var pcodeRequest 		= {};
			    										pcodeRequest['BestMatch']		= true;
			    										pcodeRequest['LimitResults']	= 10;
		    										
		    											if(currentCountryCode != '' && currentCountryCode != null)
		    												{
		    													pcodeRequest['CountryIso']	= currentCountryCode;
		    												}
	    											
		    											if(currentStateCode != '' && currentStateCode != null)
		    												{
		    													pcodeRequest['State']	= currentStateCode;
		    												}
	    											
		    											if(currentCountyCode != '' && currentCountyCode != null)
		    												{
		    													pcodeRequest['County']	= currentCountyCode;
		    												}
	    											
		    											if(currentCityCode != '' && currentCityCode != null)
		    												{
		    													pcodeRequest['City']	= currentCityCode;
		    												}
	    											
		    											if(currentZipCode != '' && currentZipCode != null)
		    												{
		    													pcodeRequest['ZipCode']	= currentZipCode;
		    												}
		    										}	
		    									
		    									//Call the plugin
		    									//
		    									if(tfcPlugin != null)
			    									{
		    											try
		    												{
					    										var pcodeResult = tfcPlugin.getPCode(pcodeRequest);
					    										
					    										//Check the result of the call to the plugin
					    										//
					    										if(pcodeResult != null && pcodeResult.httpResponseCode == '200')
					    											{
					    												//Did we find any matches?
					    												//
					    												if(pcodeResult.apiResponse.MatchCount > 0)
					    													{
					    														//Get the pcode
					    														//
					    														var pcode = pcodeResult.apiResponse.LocationData[0].PCode;
					    														
					    														addressSubRecord.setValue({
					    																					fieldId: 	destinationPCode, 
					    																					value: 		pcode
					    																				});
					    														
					    														recordUpdated = true;
					    													}
					    											}
		    												}
		    											catch(err)
		    												{
			    												log.error({
							    											title:		'Error calling plugin',
							    											details:	err
							    											});
		    												}
			    									}
											}
	    							}
	    						
	    						if(recordUpdated)
									{
										try
											{
												recordToProcess.save();
											}
										catch(err)
											{
												log.error({
			    											title:		'Error saving record of type ' + currentRecordType + ' id = ' + currentRecordId,
			    											details:	err
			    											});
											}
									}
	    						
	    						break;
	    						
	    					default:
	    						//Processing for record types other than customer or vendor
	    						//"currentRecord" will be used to retrieve the mapped fields
	    						//
	    						
	    						//Retrieve all the mapped columns
								//
								var currentCountryCode 	= (sourceCountryCode != '' && sourceCountryCode != null ? currentRecord.getValue({fieldId: sourceCountryCode}) : '');
								var currentStateCode 	= (sourceStateCode != '' && sourceStateCode != null ? currentRecord.getValue({fieldId: sourceStateCode}) : '');
								var currentCountyCode 	= (sourceCountyCode != '' && sourceCountyCode != null ? currentRecord.getValue({fieldId: sourceCountyCode}) : '');
								var currentCityCode 	= (sourceCityCode != '' && sourceCityCode != null ? currentRecord.getValue({fieldId: sourceCityCode}) : '');
								var currentZipCode 		= (sourceZipCode != '' && sourceZipCode != null ? currentRecord.getValue({fieldId: sourceZipCode}) : '');
								var currentPCode 		= (destinationPCode != '' && destinationPCode != null ? currentRecord.getValue({fieldId: destinationPCode}) : '');
								
								//Does the PCode have a value & do we have a field to map the pcode to?
								//If not then we need to get one
								//
								if((currentPCode == '' || currentPCode == null || overrideFlag) && (destinationPCode != null && destinationPCode != ''))
									{
										//Construct the request object
										//
										var pcodeRequest 		= {};
										pcodeRequest['BestMatch']		= true;
										pcodeRequest['LimitResults']	= 10;
									
										if(currentCountryCode != '' && currentCountryCode != null)
											{
												pcodeRequest['CountryIso']	= currentCountryCode;
											}
									
										if(currentStateCode != '' && currentStateCode != null)
											{
												pcodeRequest['State']	= currentStateCode;
											}
									
										if(currentCountyCode != '' && currentCountyCode != null)
											{
												pcodeRequest['County']	= currentCountyCode;
											}
									
										if(currentCityCode != '' && currentCityCode != null)
											{
												pcodeRequest['City']	= currentCityCode;
											}
									
										if(currentZipCode != '' && currentZipCode != null)
											{
												pcodeRequest['ZipCode']	= currentZipCode;
											}
									}	
								
								//Call the plugin
								//
								if(tfcPlugin != null)
									{
										try
											{
	    										var pcodeResult = tfcPlugin.getPCode(pcodeRequest);
	    										
	    										//Check the result of the call to the plugin
	    										//
	    										if(pcodeResult != null && pcodeResult.httpResponseCode == '200')
	    											{
	    												//Did we find any matches?
	    												//
	    												if(pcodeResult.apiResponse.MatchCount > 0)
	    													{
	    														//Get the pcode
	    														//
	    														var pcode = pcodeResult.apiResponse.LocationData[0].PCode;
	    														
	    														//Update the record with the new pcode
	    														//
	    														var valuesObj = {};
	    														valuesObj[destinationPCode] = pcode;
	    														
	    														record.submitFields({
							    													type:		currentRecordType,
							    													id:			currentRecordId,
							    													values:		valuesObj,
							    													options:	{
							    																enablesourcing:			true,
							    																ignoreMandatoryFields:	true
							    																}
							    													});
	    													}
	    											}
											}
										catch(err)
											{
												log.error({
			    											title:		'Error calling plugin',
			    											details:	err
			    											});
											}
									}
	    						
	    						break;
						}
				}
		}
	
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
    
    
    return {
    		libLookupPCode:			libLookupPCode,
    		libConfigObj:			libConfigObj,
    		libGenericResponseObj:	libGenericResponseObj
    		};
    
});
