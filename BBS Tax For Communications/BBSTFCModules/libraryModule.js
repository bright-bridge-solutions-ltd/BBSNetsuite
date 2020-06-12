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
	
	//Request body for tax calculation API
	//
	function libCalcTaxesRequestObj()
		{
			this.cfg 	= new libRequestConfigObj();	
			this.cmpn	= new libCompanyDataObj();
			this.inv	= [];						//array		List of invoices to process
			this.ovr	= [];						//array 	Tax rate overrides.
			this.sover	= [];						//array 	Safe harbour overrides for USF taxes.
		}
	
	//Container class for json properties associated with v2.CalcTaxes request configuration options
	//
	function libRequestConfigObj()
		{
			this.retnb		= null;						//boolean 	Flag indicating non-billable taxes should be returned. If set, will override account setting Default if not provided is account setting value
			this.retext		= null;						//boolean 	Flag indicating extended tax information should be returned. Reference online documentation for more details
			this.incrf		= null;						//boolean 	Flag indicating reporting information should be returned. Reference online documentation for more details
		}
	
	//Container class for json properties associated with v2.CalcTaxes company data
	//
	function libCompanyDataObj()
		{
			this.bscl		= null;						//integer 	Business class. 0 = ILEC, 1 = CLEC
			this.svcl		= null;						//integer 	Service class. 0 = Primary Local, 1 = Primary Long Distance.
			this.fclt		= null;						//boolean 	Specifies if the carrier delivering the service has company owned facilities to provide the service.
			this.frch		= null;						//boolean 	Indicates if the company provides services sold pursuant to a franchise agreement between the carrier and jurisdiction.
			this.reg		= null;						//boolean 	Indicates if company is regulated.
			this.excl		= [];						//array 	Exclusion list
			this.idnt		= null;						//string 	An optional company identifier for reporting
		}
	
	//Contains information about an invoice or quote.
	//
	function libInvoicesObj()
		{
			this.doc		= null;						//string	Document code.
			this.cmmt		= null;						//boolean	Indicates if invoice should be committed as soon as it is processed
			this.bill		= new libLocationObj();		//object	Location data used to determine taxing jurisdiction.
			this.cust		= null;						//integer	Customer type.
			this.lfln		= null;						//boolean	Indicates if customer is a Lifeline participant
			this.date		= null;						//string	Invoice date.
			this.exms		= [];						//array		Tax exemptions - array of libTaxExemptionsObj
			this.itms		= [];						//array 	Line items. - array of libLineItemObj
			this.invm		= null;						//boolean	Indicates if all line items within invoice should be processed in invoice mode
			this.dtl		= null;						//boolean	Indicates if individual line item taxes should be included in response.
			this.summ		= null;						//boolean	Indicates if the summarized taxes for the invoice should be included in the resonse
			this.opt		= [];						//array		Optional values for invoice. Maximum of 5. Keys must be numeric from 1 to 5.
			this.acct		= null;						//string	Account reference for reporting
			this.custref	= null;						//string	Customer Reference for reporting
			this.invn		= null;						//string	Invoice Number reference for reporting
			this.bcyc		= null;						//string	Bill Cycle reference for reporting
			this.bpd		= null;						//object	Optional object for passing in billing period
			this.ccycd		= null;						//string	Currency code for invoice. Example: CAD = Canadian Dollar
		}
	
	//Data for an invoice or quote line item.
	//
	function libLineItemObj()
		{
			this.ref		= null;						//string	Reference ID for line item
			this.from		= new libLocationObj();		//object	Location data used to determine taxing jurisdiction.
			this.to			= new libLocationObj();		//object	Location data used to determine taxing jurisdiction.
			this.chg		= null;						//number	Charge amount. 
			this.line		= null;						//integer	Number of lines
			this.loc		= null;						//integer	Number of locations
			this.min		= null;						//number	Number of minutes
			this.sale		= null;						//integer	0 - Wholesale : Indicates that the item was sold to a wholeseller. 1 - Retail : Indicates that the item was sold to an end user - a retail sale. 2 - Consumed : Indicates that the item was consumed directly (SAU products only). 3 - VendorUse : Indicates that the item is subject to vendor use tax (SAU products only).
			this.plsp		= null;						//number	Split for private-line transactions.
			this.incl		= null;						//boolean	Indicates if the charge for this line item is tax-inclusive.
			this.pror		= null;						//number	For pro-rated tax calculations. Percentage to pro-rate.
			this.proadj		= null;						//integer	For pro-rated credit or adjustment calculations. 0 = default 1 = do not return non-proratable fixed taxes in response 2 = return non-proratable fixed taxes in response
			this.tran		= null;						//integer	Transaction type ID.
			this.serv		= null;						//boolean	Service type ID.
			this.dbt		= null;						//boolean	Indicates if this line item is a debit card transaction.
			this.adj		= null;						//boolean	Indicates if this line item is an adjustment.
			this.adjm		= null;						//integer	Adjustment method.
			this.disc		= null;						//integer	Discount type for adjustments.
			this.opt		= [];						//array		Optional values for line item. Maximum of 5. Keys must be numeric from 5 to 10
			this.prop		= null;						//integer	Attribute/property value for sales and use transaction/service pairs.
			this.bill		= new libLocationObj();		//object	Location data used to determine taxing jurisdiction.
			this.cust		= null;						//integer	Customer type
			this.lfln		= null;						//boolean	Indicates if customer is a Lifeline participant.
			this.date		= null;						//string	Invoice date.
			this.qty		= null;						//integer	Quantity to be applied to the item - taxation is equivalent to repeating the item the number of times of the quantity
			this.glref		= null;						//string	General Ledger reference to be used in reporting
		}
	
	//Tax exemption data.
	//
	function libTaxExemptionsObj()
		{
			this.frc		= null;						//boolean	Override level exempt flag on wildcard tax type exemptions	
			this.loc		= new libLocationObj()		//object	Location data used to determine taxing jurisdiction.		
			this.tpe		= null;						//integer	Tax type to exempt. Tax type exemptions and Category exemptions are mutually exclusive.	
			this.lvl		= null;						//integer	Tax level ID.
			this.cat		= null;						//integer	Tax category to exempt. Tax type exemptions and Category exemptions are mutually exclusive.	
			this.dom		= null;						//integer	Exemption Domain. This is the jurisdiction level in which the exemption jurisdiction must match the taxing jurisdiction.
			this.scp		= null;						//integer	Exemption Scope. This defines the tax levels in which the taxes will be considered as candidates for exemption.	
			this.exnb		= null;						//boolean	Exempt non-billable flag. Determines if non-billable taxes are to be considered as candidates for exemption.	
		}
	
	//Location data used to determine taxing jurisdiction.
	//
	function libLocationObj()
		{
			this.cnty		= null;						//string	County name.
			this.ctry		= null;						//string	Country ISO code.
			this.int		= null;						//boolean	Indicates if the location is within city limits.
			this.geo		= null;						//boolean	Indicates if this address should be geocoded in order to obtain taxing jurisdiction
			this.pcd		= null;						//integer	PCode for taxing jurisdiction.
			this.npa		= null;						//integer	NPANXX number.
			this.fips		= null;						//string	FIPS code for taxing jurisdiction.
			this.addr		= null;						//string	Street address.
			this.city		= null;						//string	City name.
			this.st			= null;						//string	State name or abbreviation.
			this.zip		= null;						//string	Postal code.
		}
	
	
	//Internal api configuration object
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
	
	//Generic response from api object
	//
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
    		libGenericResponseObj:	libGenericResponseObj,
    		libCalcTaxesRequestObj:	libCalcTaxesRequestObj,
    		libLocationObj:			libLocationObj,
    		libTaxExemptionsObj:	libTaxExemptionsObj,
    		libLineItemObj:			libLineItemObj,
    		libInvoicesObj:			libInvoicesObj
    		};
    
});
