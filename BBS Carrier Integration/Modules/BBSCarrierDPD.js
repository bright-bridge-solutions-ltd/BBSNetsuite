/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/encode', 'N/format', 'N/https', 'N/record', 'N/runtime', 'N/search', 'N/xml', 'N/cache',
        './BBSObjects',								//Objects used to pass info back & forth
        './BBSCommon'								//Common code
        ],
/**
 * @param {encode} encode
 * @param {format} format
 * @param {https} https
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 * @param {xml} xml
 * @param {BBSObjects} BBSObjects
 * @param {BBSCommon} BBSCommon
 */
function(encode, format, https, record, runtime, search, xml, cache, BBSObjects, BBSCommon) 
{
	//=========================================================================
	//Main functions - This module implements the integration to DPD
	//=========================================================================
	//
	
	const CACHE_NAME	= 'DPDCACHE';
	const CACHE_KEY		= 'DPD_GEO_SESSION';
	const CACHE_TTL		= 28800;				//Eight hours
	const CACHE_SCOPE	= cache.Scope.PUBLIC;
	var configObj		= {};
	
	//Function to commit the shipments to the DPD core systems at the end of day
	//
	function dpdCloseShipment(_commitShipmentRequest)
		{
			//
			//Not implemented
			//
		}

	
	
	//Function to send a shipment request to DPD
	//
	function dpdProcessShipments(_processShipmentRequest)
		{
			debugger;
			
			var headerObj 				= {};
			var responseStatus			= '';
			var responseBodyObj			= {};
			var processShipmentResponse	= {};
			
			try
				{		
					//Create a JSON object that represents the structure of the DPD specific request
					//
					var processShipmentRequestDPD = new _processShipmentRequestDPD(_processShipmentRequest);
					
					//log.debug({title: 'Shipment request',details: processShipmentRequestDPD});
					
					//Populate the object with the data from the incoming standard message
					//i.e. populate processShipmentRequestDPD with data from _processShipmentRequest
					//
					headerObj['Content-Type']		= 'application/json';
					headerObj['Accept']				= 'application/json';
					headerObj['GeoSession']			= dpdGetGeoSession(_processShipmentRequest.configuration)[CACHE_KEY];
					
					//Send the request to DPD
					//
					try
						{
							var response = https.post({	
														url:		_processShipmentRequest.configuration.url + 'shipping/shipment',
														headers:	headerObj,
														body:		JSON.stringify(processShipmentRequestDPD)
														});
							
							//Extract the http response code	
							//
							responseStatus = response.code;
							
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
											log.error({title: 'Error during DPD processing',details: err});
										}
								}
						}
					catch(err)
						{
							responseStatus = err.message;
							log.error({title: 'Error during DPD processing',details: err});
						}
					
					//Check the responseObject to see whether a success or error/failure message was returned
					//
					if (responseStatus == '200')
						{
							var consignmentNumber 	= '';
							var shipmentId		 	= '';
							var message 			= '';
							var labelImage 			= '';
							var labelType			= '';
							
							if(responseBodyObj.error == null)	//No error
								{
									//Get the details from the responseObject
									//
									if(responseBodyObj.hasOwnProperty('data'))
										{
											if(responseBodyObj.data.hasOwnProperty('shipmentId'))
												{
													//Get the shipment id, this will be used to get the labels
													//
													shipmentId 	= responseBodyObj.data.shipmentId;
												}
											
											if(responseBodyObj.data.hasOwnProperty('consignmentDetail'))
												{
													if(responseBodyObj.data.consignmentDetail.length > 0)
														{
															var consignmentDetail = responseBodyObj.data.consignmentDetail[0];
															
															if(consignmentDetail.hasOwnProperty('consignmentNumber'))
																{
																	//Get the consignment number
																	//
																	consignmentNumber = consignmentDetail.consignmentNumber;
																	
																	//Convert the DPD response object to the standard process shipments response object
																	//
																	processShipmentResponse = new BBSObjects.processShipmentResponse(responseStatus, message, consignmentNumber);
																	
																	//If we have got this far, we need to make a seperate call to get the label(s)
																	//
																	var labelsArray = dpdGetLabels(_processShipmentRequest, shipmentId);
																	
																	if(consignmentDetail.hasOwnProperty('parcelNumbers'))
																		{
																			if(consignmentDetail.parcelNumbers.length > 0)
																				{
																					for (var parcels = 0; parcels < consignmentDetail.parcelNumbers.length; parcels++) 
																						{
																							//Add packages to processShipmentResponse
																							//
																							var sequence 	= parcels + 1;
																							var labelFormat = '';
																							
																							switch(_processShipmentRequest.configuration.labelFormat)
																								{
																									case 'text/html':	//HTML labels will have been converted to PNG by a call to pdfcrowd
																										
																										labelFormat = 'PNG';
																										
																										break;
																										
																									case 'text/vnd.eltron-epl;':	//EPL format will be saved as a text file TXT
																										
																										labelFormat = 'TXT';
																										
																										break;
																										
																									case 'text/vnd.citizen-clp;':	//CPL format will be saved as a text file TXT
																										
																										labelFormat = 'TXT';
																										
																										break;
																								}
																							
																							processShipmentResponse.addPackage(
																																sequence, 
																																consignmentDetail.parcelNumbers[parcels], 
																																labelsArray[parcels], 
																																labelFormat
																																);
																						}
																				}
																		}
																}
														}
												}
										}
								}
							else
								{
									if(responseBodyObj.error != null && responseBodyObj.error.length > 0)
										{
											for (var errline = 0; errline < responseBodyObj.error.length; errline++) 
												{
													message += responseBodyObj.error[errline].errorCode + '\n';
													message += responseBodyObj.error[errline].obj + '\n';
													message += responseBodyObj.error[errline].errorType + '\n';
													message += responseBodyObj.error[errline].errorMessage + '\n';
												}
										}
									else
										{
											message += responseBodyObj.error.errorCode + '\n';
											message += responseBodyObj.error.obj + '\n';
											message += responseBodyObj.error.errorType + '\n';
											message += responseBodyObj.error.errorMessage;
										}
									
								
									//Convert the ProCarrier response object to the standard process shipments response object
									//
									processShipmentResponse = new BBSObjects.processShipmentResponse(
																									responseBodyObj.error.errorCode, 
																									message, 
																									''
																									);
								}
							
							
						}		
					else
						{
							processShipmentResponse = new BBSObjects.processShipmentResponse(responseStatus, responseStatus, '');
						}
							
					//Return the response
					//
					return processShipmentResponse;
				}
			catch(err)
				{
					log.error({title: 'Error during DPD processing',details: err});
					
					//Set the shipment response using the error caught
					//
					var processShipmentResponse = new BBSObjects.processShipmentResponse('ERROR', e);
					
					//Return the response
					//
					return processShipmentResponse;
				}
		}

	
	//Function to cancel a shipment from DPD
	//
	function dpdCancelPickup(_cancelShipmentRequest)
		{
			//
			//Not Implemented
			//
		}


	//=========================================================================
	//Helper functions
	//=========================================================================
	//
	
	//Get the labels from the shipment id & convert from html
	//
	function dpdGetLabels(_processShipmentRequest, _shipmentId)
		{
			var headerObj 	= {};
			var labelsArray	= [];
			
			headerObj['Content-Type']		= 'application/json';
			headerObj['Accept']				= _processShipmentRequest.configuration.labelFormat;
			headerObj['GeoSession']			= dpdGetGeoSession(_processShipmentRequest.configuration)[CACHE_KEY];
		
			//Send the request to DPD to get the label(s)
			//
			try
				{
					var response = https.get({	
												url:		_processShipmentRequest.configuration.url + 'shipping/shipment/' + _shipmentId + '/label',
												headers:	headerObj,
												body:		''
												});
					
					//Extract the http response code	
					//
					responseStatus = response.code;
				}
			catch(err)
				{
					responseStatus = err.message;
					log.error({title: 'Error during DPD processing',details: err});
				}
			
			//Was the call ok?
			//
			if (responseStatus == '200')
				{
					//Extract the http response body
					//
					if(response.body != null && response.body != '')
						{
							//Process the returned labels based on format requested
							//
							switch(_processShipmentRequest.configuration.labelFormat)
								{
									case 'text/html':	//HTML format
		
										var labelHtmlText 	= response.body.replace(/"/g, "'");		//Replace any double quotes with single quotes
										var splitter		= "<div style='position: relative; margin-top: 25px; height: 800px;page-break-after: always;margin:0;padding:0;'>";
										var labelHtmlArray	= labelHtmlText.split(splitter);
										
										//Remove the first element from the array as it will be blank
										//
										labelHtmlArray.shift();
										
										//Now add the splitter text back on to the start of the text in each element of the array
										//
										for (var arrayElement = 0; arrayElement < labelHtmlArray.length; arrayElement++) 
											{
												labelHtmlArray[arrayElement] = splitter + labelHtmlArray[arrayElement];
											}
									
										//Now convert the html to the required label format by calling pdfcrowd if the "use image converter" flag is set
										//
										for (var arrayElement = 0; arrayElement < labelHtmlArray.length; arrayElement++) 
											{
												if(_processShipmentRequest.configuration.imageConvert)
													{
														//Convert html image to png
														//
														var pngImage = BBSCommon.convertHtmlToPng(labelHtmlArray[arrayElement]);
														
														if(pngImage != null)
															{
																labelsArray.push(pngImage);
															}
													}
												else
													{
														//Otherwise, just put the html data into the labels array
														//
														labelsArray.push(labelHtmlArray[arrayElement]);
													}
											}
										
										break;
										
									case 'text/vnd.eltron-epl;':	//EPL format
										
										var labelDataText 	= response.body;
										var labelDataArray 	= labelDataText.split('N\r');
										
										for(var int=0; int < labelDataArray.length; int++)
											{
												if(labelDataArray[int].length > 4)
													{
														labelsArray.push('N\r' + labelDataArray[int] + 'N\r');
													}
											}
										
										break;
										
									case 'text/vnd.citizen-clp;':	//CPL format
										
										var labelDataText 	= response.body;
										var splitter 		= String.fromCharCode(2) + 'M';

										var labelDataArray = labelDataText.split(splitter);

										//Remove the first element from the array as it will be blank
										//
										labelDataArray.shift();

										//Now add the splitter text back on to the start of the text in each element of the array
										//
										for (var arrayElement = 0; arrayElement < labelDataArray.length; arrayElement++) 
											{
												labelDataArray[arrayElement] = splitter + labelDataArray[arrayElement];
											}

										//Copy the label data to the returned labels array
										//
										for (var arrayElement = 0; arrayElement < labelDataArray.length; arrayElement++) 
											{
												labelsArray.push(labelDataArray[arrayElement]);
											}

										break;
								}
						}
				}
			
			return labelsArray;
		}
	
	
	
	//See if we have a cached geo session, if not request a new one
	//
	function dpdGetGeoSession(configuration)
		{
			var dpdGeoSession 	= null;
			configObj 			= configuration;		//set the configObj variable (which has global scope) to be the passed in configuration
			
			//Get the cache instance or create one if it does not exist
			//
			var dpdCache = cache.getCache({
										    name:	CACHE_NAME,
										    scope: 	CACHE_SCOPE
											});
			
			//Get the geosession from the cache, or create a new entry if the cache is empty or is new
			//
			dpdGeoSession = dpdCache.get({
											key:	CACHE_KEY,
											ttl:	CACHE_TTL,
											loader:	dpdLoader
										});
			
			//Check to see if any data has been returned, if not try to remove the key from the cache & re-create it
			//
			if(dpdGeoSession == null || dpdGeoSession == '' || dpdGeoSession == '{}')
				{
					dpdCache.remove({
									key:	CACHE_KEY
									});
					
					dpdGeoSession = dpdCache.get({
													key:	CACHE_KEY,
													ttl:	CACHE_TTL,
													loader:	dpdLoader
												});
					
				}
			
			return JSON.parse(dpdGeoSession);
		}
	
	function dpdLoader(context)
		{
			//Get the username & password from the configuration 
			//
			var cacheDataObj			= {};
			var headerObj 				= {};
			var responseStatus			= '';
			var responseBodyObj			= {};
			var combinedCredentials 	= configObj.username + ':' + configObj.password;
			
			var authorisation 			= 'Basic ' + encode.convert({
																	string:			combinedCredentials,
																	inputEncoding:	encode.Encoding.UTF_8,
																	outputEncoding:	encode.Encoding.BASE_64
																	});
			headerObj['Content-Type']	= 'application/json';
			headerObj['Accept']			= 'application/json';
			headerObj['Authorization']	= authorisation;
			
			try
				{
					//Attempt to login
					//
					var response = https.post({	
												url:		configObj.url + 'user?action=login',
												headers:	headerObj,
												body:		''
												});
					
					//Extract the http response code	
					//
					responseStatus = response.code;
					
					//Extract the http response body
					//
					if(responseStatus == '200' && response.body != null && response.body != '')
						{
							//Try to parse the response body into a JSON object
							//
							try
								{
									responseBodyObj 		= JSON.parse(response.body);
									cacheDataObj[CACHE_KEY] = responseBodyObj.data.geoSession;
								}
							catch(err)
								{
									log.error({title: 'Error during DPD geosession get',details: err});
								}
						}
					else
						{
							log.error({title: 'Error during DPD geosession get, response status = ' + responseStatus, details: response.body});
						}
				}
			catch(err)
				{
					responseStatus = err.message;
					log.error({title: 'Error during DPD geosession get',details: err});
				}
			
			//Return the data to add to the cache
			//
			return cacheDataObj;
		}
	
	//=========================================================================
	//DPD Specific Objects
	//=========================================================================
	//
	function _closeShipmentRequestDPD()
		{
			//
			//Not Implemented
			//
		}
	
	function _deleteShipmentRequestDPD()
		{
			//
			//Not Implemented
			//
		}
	
	function _processShipmentRequestDPD(shippingRequestData)
		{
			this.jobId						= null;
			this.collectionOnDelivery		= false;
			this.invoice					= null;
			this.collectionDate				= shippingRequestData.shippingDate + 'T17:00:00'; 
			this.consolidate				= false;
			this.consignment				= [];
			
			this.consignment.push(new _consignmentDPD(shippingRequestData));
			
			/* For international use
			 * 
			this.generateCustomsData		= true;
			this.invoice 					= new _invoiceDPD(shippingRequestData);
			*
			*/
			
		}

	function _invoiceDPD(_shippingRequestData)
		{
			this.countryOfOrigin			= 'GB';
			this.invoiceCustomsNumber		= '';
			this.invoiceDeliveryDetails		= new _invoiceDeliveryDetailsDPD(_shippingRequestData);
			this.invoiceExportReason		= '01';													//Sales
			this.invoiceTermsOfDelivery		= 'DAP';												//Duties and taxes for unpaid parcels where the receiver is to pay those charges
			this.invoiceReference			= '';
			this.invoiceShipperDetails		= new _invoiceShipperDetailsDPD(_shippingRequestData);
			this.invoiceType				= '2';													//Commercial Invoice
			this.shippingCost				= '';
		}
	
	function _invoiceDeliveryDetailsDPD(_shippingRequestData)
		{
			this.address					= new _addressDPD(
															_shippingRequestData.address.addresse.substring(0,35), 
															_shippingRequestData.address.countryCode, 
															_shippingRequestData.address.postCode.toUpperCase().substring(0,8), 
															_shippingRequestData.address.line1.substring(0,35), 
															_shippingRequestData.address.line2.substring(0,35), 
															_shippingRequestData.address.town.substring(0,35), 
															_shippingRequestData.address.county.substring(0,35)
															);
			this.contactDetails				= new _invoiceContactDetailsDPD(
																			_shippingRequestData.senderAddress.addresse.substring(0,25), 
																			_shippingRequestData.senderContact.mobileNumber.substring(0,15),
																			_shippingRequestData.contact.emailAddress
																			);
			this.vatNumber					= _shippingRequestData.senderContact.eori;
		}
	
	function _invoiceShipperDetailsDPD(_shippingRequestData)
		{
			this.address					= new _addressDPD(
																_shippingRequestData.senderAddress.addresse.substring(0,35), 
																_shippingRequestData.senderAddress.countryCode, 
																_shippingRequestData.senderAddress.postCode.toUpperCase().substring(0,8), 
																_shippingRequestData.senderAddress.line1.substring(0,35), 
																_shippingRequestData.senderAddress.line2.substring(0,35), 
																_shippingRequestData.senderAddress.town.substring(0,35), 
																_shippingRequestData.senderAddress.county.substring(0,35)
																);
			this.contactDetails				= new _invoiceContactDetailsDPD(
																			_shippingRequestData.senderAddress.addresse.substring(0,25), 
																			_shippingRequestData.senderContact.mobileNumber.substring(0,15),
																			_shippingRequestData.senderContact.emailAddress
																			);
			this.vatNumber					= _shippingRequestData.senderContact.eori;
		}

	function _invoiceContactDetailsDPD(_contactName, _telephone, _email)
		{
			this.contactName	= _contactName;
			this.telephone		= _telephone;
			this.email			= _email;
		}
	
	function _contactDetailsDPD(_contactName, _telephone)
		{
			this.contactName	= _contactName;
			this.telephone		= _telephone;
		}

	function _notificationDetailsDPD(_email, _mobile)
		{
			this.email			= _email;
			this.mobile			= _mobile;
		}

	function _addressDPD(_organisation, _countryCode, _postcode, _street, _locality, _town, _county)
		{
			this.organisation	= _organisation;
			this.countryCode	= _countryCode;
			this.postcode		= _postcode;
			this.street			= _street;
			this.locality		= _locality;
			this.town			= _town;
			this.county			= _county;
		}
	
	function _parcelDPD(_shippingRequestData)
		{
			this.packageNumber			= '';
			this.parcelProduct			= [];
		}
	
	function _parcelProductDPD(_shippingRequestData)
		{
			this.countryOfOrigin			= '';
			this.numberOfItems				= 0;
			this.productCode				= '';
			this.productFabricContent		= '';
			this.productHarmonisedCode		= '';
			this.productItemsDescription	= '';
			this.productTypeDescription		= '';
			this.unitValue					= 0.0;
			this.unitWeight					= 0;
			this.productUrl					= '';
		}
		
	function _consignmentDPD(_shippingRequestData)
		{
			this.consignmentNumber						= null;
			this.consignmentRef							= null;
			this.collectionDetails						= {};
			this.collectionDetails.contactDetails		= new _contactDetailsDPD(
																				_shippingRequestData.senderAddress.addresse.substring(0,25), 
																				_shippingRequestData.senderContact.mobileNumber.substring(0,15)
																				);
			this.collectionDetails.address				= new _addressDPD(
																			_shippingRequestData.senderAddress.addresse.substring(0,35), 
																			_shippingRequestData.senderAddress.countryCode, 
																			_shippingRequestData.senderAddress.postCode.toUpperCase().substring(0,8), 
																			_shippingRequestData.senderAddress.line1.substring(0,35), 
																			_shippingRequestData.senderAddress.line2.substring(0,35), 
																			_shippingRequestData.senderAddress.town.substring(0,35), 
																			_shippingRequestData.senderAddress.county.substring(0,35)
																			);
			this.deliveryDetails						= {};
			this.deliveryDetails.contactDetails			= new _contactDetailsDPD(
																			_shippingRequestData.address.addresse.substring(0,25), 
																			_shippingRequestData.contact.mobileNumber.substring(0,15)
																				);
			this.deliveryDetails.address				= new _addressDPD(
																			_shippingRequestData.address.addresse.substring(0,35), 
																			_shippingRequestData.address.countryCode, 
																			_shippingRequestData.address.postCode.toUpperCase().substring(0,8), 
																			_shippingRequestData.address.line1.substring(0,35), 
																			_shippingRequestData.address.line2.substring(0,35), 
																			_shippingRequestData.address.town.substring(0,35), 
																			_shippingRequestData.address.county.substring(0,35)
																			);
			
			this.deliveryDetails.notificationDetails	= new _notificationDetailsDPD(
																						_shippingRequestData.contact.emailAddress, 
																						_shippingRequestData.contact.mobileNumber
																						);
			this.networkCode							= _shippingRequestData.shippingItemInfo.serviceCode;
			this.numberOfParcels						= _shippingRequestData.packageCount;
			this.totalWeight							= _shippingRequestData.weight;
			this.shippingRef1							= _shippingRequestData.shippingReference.substring(0,25);
			this.shippingRef2							= _shippingRequestData.shippingReference2.substring(0,25);
			this.shippingRef3							= _shippingRequestData.shippingReference3.substring(0,25);
			this.customsValue							= null;
			this.deliveryInstructions					= '';
			this.parcelDescription						= "";
			this.liabilityValue							= null;
			this.liability								= false;
			this.parcel									= [];
			this.shipperDestinationTaxId				= null;		//Australian destinations only
			this.vatPaid								= null;		//Australian destinations only
		}
	
	
	
	//=========================================================================
	//Return functions that are available in this module 
	//=========================================================================
	//
   return 	{
        		carrierCommitShipments:		dpdCloseShipment,
        		carrierProcessShipments:	dpdProcessShipments,
        		carrierCancelShipments:		dpdCancelPickup
    		};
    
});
