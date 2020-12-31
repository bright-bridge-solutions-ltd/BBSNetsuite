/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/encode', 'N/format', 'N/https', 'N/record', 'N/runtime', 'N/search', 'N/xml',
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
function(encode, format, https, record, runtime, search, xml, BBSObjects, BBSCommon) 
{
	//=========================================================================
	//Main functions - This module implements the integration to FedEx
	//=========================================================================
	//
	
	//Function to commit the shipments to the FedEx core systems at the end of day
	//
	function fedExCloseShipment(_commitShipmentRequest)
		{
			//
			//Not Implemented
			//
		}

	
	
	//Function to send a shipment request to FedEx
	//
	function fedExProcessShipments(_processShipmentRequest)
		{
			try
				{		
					//Create a JSON object that represents the structure of the FedEx specific request
					//
					var processShipmentRequestFedEx = new _processShipmentRequestFedEx(_processShipmentRequest);
					
					processShipmentRequestFedEx.ProcessShipmentRequest.RequestedShipment.RequestedPackageLineItems.push(new _lineItemsFedEx(1, 'KG', _processShipmentRequest.weight))
					
					// Declare xmlRequest variable and set SOAP envelope
					var xmlRequest = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v26="http://fedex.com/ws/ship/v26"><soapenv:Header/><soapenv:Body>';
					
					//Convert the gfs request object into xml. Add to xmlRequest variable
					//
					xmlRequest += BBSCommon.json2xml(processShipmentRequestFedEx, '', 'v26:');
					
					//Add closing SOAP envelope tags
					//
					xmlRequest += '</soapenv:Body></soapenv:Envelope>';
					
					//Send the request to FedEx
					//
					var xmlResponse = https.post({
											     url: 	_processShipmentRequest.configuration.url,
											     body: 	xmlRequest
												});
					
					log.debug({title: 'xmlResponse.body', details: xmlResponse.body});
					
					
					//Parse the xmlResponse string and convert it to XML
					//
					xmlResponse = xml.Parser.fromString({text: xmlResponse.body});
					
					log.debug({title: 'xmlResponse', details: xmlResponse});
					
					//Convert the xml response back into a JSON object so that it is easier to manipulate
					//
					var responseObject = BBSCommon.xml2Json(xmlResponse);
					
					log.debug({title: 'response object', details: responseObject});
					
					// check if we have a soap fault
					if (responseObject['soap:Envelope']['soap:Body']['soap:Fault'])
						{
							// get the soap fault
							var responseMessage = responseObject['soap:Envelope']['soap:Body']['soap:Fault']['faultstring']['#text'];
							
							//Convert the GFS response object to the standard process shipments response object
							//
							var processShipmentResponse = new BBSObjects.processShipmentResponse(null, responseMessage);
						}
					else
						{
							//Get the status of the response from the responseObject
							//
							var responseStatus = responseObject['soap:Envelope']['soap:Body']['ProcessedShipments']['ProcessShipmentsResult']['ResponseStatus']['#text'];
							
							//Check the responseObject to see whether a success or error/failure message was returned
							//
							if (responseStatus == 'SUCCESS')
								{
									//Get the consignment number from the responseObject
									//
									var consignmentNumber = responseObject['soap:Envelope']['soap:Body']['ProcessedShipments']['ProcessShipmentsResult']['Shipments']['ProcessedShipment']['ConsignmentNo']['#text']
								
									//Get the packages from the responseObject
									var packages = responseObject['soap:Envelope']['soap:Body']['ProcessedShipments']['ProcessShipmentsResult']['Shipments']['ProcessedShipment']['Packages'];
									
									//Convert the GFS response object to the standard process shipments response object
									//
									var processShipmentResponse = new BBSObjects.processShipmentResponse(responseStatus, null, consignmentNumber);
									
									// check if we have more than one package
									if (packages.length)
										{
											// loop through packages
											for (var i = 0; i < packages.length; i++)
												{
													// add packages to processShipmentResponse
													processShipmentResponse.addPackage(packages[i]['SequenceID']['#text'],packages[i]['PackageNo']['#text'],packages[i]['Labels']['Image']['#text'],packages[i]['Labels']['DocumentType']['#text']);
												}
										}
									else // only one package
										{
											// add packages to processShipmentResponse
											processShipmentResponse.addPackage(packages['SequenceID']['#text'],packages['PackageNo']['#text'],packages['Labels']['Image']['#text'],packages['Labels']['DocumentType']['#text']);
										}
								}
							else
								{
									//Get the message from the responseObject
									//
									var responseMessage = responseObject['soap:Envelope']['soap:Body']['ProcessedShipments']['ProcessShipmentsResult']['Shipments']['ProcessedShipment']['ShipmentStatus']['StatusDescription']['#text'];
								
									//Convert the FedEx response object to the standard process shipments response object
									//
									var processShipmentResponse = new BBSObjects.processShipmentResponse(responseStatus, responseMessage);
								}
						}
							
					//Return the response
					//
					return processShipmentResponse;
				}
			catch(e)
				{
					//Set the shipment response using the error caught
					//
					var processShipmentResponse = new BBSObjects.processShipmentResponse('ERROR', e);
					
					//Return the response
					//
					return processShipmentResponse;
				}
		}

	
	//Function to cancel a shipment from FedEx
	//
	function fedExCancelPickup(_cancelShipmentRequest)
		{
			try
				{
					//Create a JSON object that represents the structure of the FedEx specific request
					//
					var cancelShipmentRequestFedEx = new _deleteShipmentRequestFedEx(_cancelShipmentRequest);
					
					//Populate the object with the data from the incoming standard message
					//
					
					// Declare xmlRequest variable and set SOAP envelope
					var xmlRequest = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v26="http://fedex.com/ws/ship/v26"><soapenv:Header/><soapenv:Body>';
					
					//Convert the gfs request object into xml. Add to xmlRequest variable
					//
					xmlRequest += BBSCommon.json2xml(cancelShipmentRequestFedEx, '', 'v26:');
					
					//Add closing SOAP envelope tags
					//
					xmlRequest += '</soapenv:Body></soapenv:Envelope>';
					
					//Send the request to FedEx
					//
					var xmlResponse = https.post({
												     url: 	_cancelShipmentRequest.configuration.url,
												     body: 	xmlRequest
												});
					
					//Parse the xmlResponse string and convert it to XML
					//
					xmlResponse = xml.Parser.fromString({text: xmlResponse.body});
					
					//Convert the xml response back into a JSON object so that it is easier to manipulate
					//
					var responseObject = BBSCommon.xml2Json(xmlResponse);
					
					//Get the status of the response from the responseObject
					//
					var responseStatus = responseObject['soap:Envelope']['soap:Body']['ProcessedDeleteShipments']['DeleteShipmentsResult']['Shipments']['Status']['Status']['#text'];
					
					//Check responseStatus to see whether a success or error/failure message was returned
					//
					if (responseStatus == 'SUCCESS')
						{
							//Convert the FedEx response object to the standard commit shipments response object
							//
							var cancelShipmentResponse = new BBSObjects.cancelShipmentResponse(responseStatus, null);
						}
					else if (responseStatus == 'ERROR' || responseStatus == 'FAILURE')
						{
							//Get the error message from the responseObject
							var responseMessage = responseObject['soap:Envelope']['soap:Body']['ProcessedDeleteShipments']['DeleteShipmentsResult']['Shipments']['Status']['StatusDescription']['#text'];
							
							//Convert the FedEx response object to the standard commit shipments response object
							//
							var cancelShipmentResponse = new BBSObjects.cancelShipmentResponse(responseStatus, responseMessage);
						}
					
					//Return the response
					//
					return cancelShipmentResponse;
				}
			catch(err)
				{
					//Set the shipment response using the error caught
					//
					var processShipmentResponse = new BBSObjects.processShipmentResponse('ERROR', err);
					
					//Return the response
					//
					return processShipmentResponse;
				}
		}

	
	
	//=========================================================================
	//Helper functions
	//=========================================================================
	//
	
	
	//=========================================================================
	//FedEx Specific Objects
	//=========================================================================
	//
	function _deleteShipmentRequestFedEx(shippingRequestData)
		{
			this.DeleteShipmentRequest 													= {};
			this.DeleteShipmentRequest.WebAuthenticationDetail 							= {};
			this.DeleteShipmentRequest.WebAuthenticationDetail.UserCredential 			= {};
			this.DeleteShipmentRequest.WebAuthenticationDetail.UserCredential.Key 		= shippingRequestData.configuration.username;
			this.DeleteShipmentRequest.WebAuthenticationDetail.UserCredential.Password 	= shippingRequestData.configuration.password;
			this.DeleteShipmentRequest.ClientDetail 									= {};
			this.DeleteShipmentRequest.ClientDetail.AccountNumber 						= shippingRequestData.shippingItemInfo.carrierContractNo;
			this.DeleteShipmentRequest.ClientDetail.MeterNumber 						= shippingRequestData.shippingItemInfo.meterNumber;	
			this.DeleteShipmentRequest.TransactionDetail 								= {};
			this.DeleteShipmentRequest.TransactionDetail.CustomerTransactionId 			= 'DeleteShipmentRequest_v26';
			this.DeleteShipmentRequest.Version 											= {};
			this.DeleteShipmentRequest.Version.ServiceId 								= 'ship';	
			this.DeleteShipmentRequest.Version.Major 									= shippingRequestData.configuration.majorId;
			this.DeleteShipmentRequest.Version.Intermediate 							= shippingRequestData.configuration.intermediateId;
			this.DeleteShipmentRequest.Version.Minor 									= shippingRequestData.configuration.minorId;
			this.DeleteShipmentRequest.TrackingId 										= {};
			this.DeleteShipmentRequest.TrackingId.TrackingIdType 						= 'EXPRESS';
			this.DeleteShipmentRequest.TrackingId.TrackingNumber 						= shippingRequestData.consignmentNumber;
			this.DeleteShipmentRequest.DeletionControl 									= 'DELETE_ALL_PACKAGES';	
		}
	
	function _processShipmentRequestFedEx(shippingRequestData)
		{
			this.ProcessShipmentRequest 																				= {};
			this.ProcessShipmentRequest.WebAuthenticationDetail 														= {};
			this.ProcessShipmentRequest.WebAuthenticationDetail.UserCredential 											= {};
			this.ProcessShipmentRequest.WebAuthenticationDetail.UserCredential.Key 										= shippingRequestData.configuration.username;
			this.ProcessShipmentRequest.WebAuthenticationDetail.UserCredential.Password 								= shippingRequestData.configuration.password;			
			this.ProcessShipmentRequest.ClientDetail 																	= {};
			this.ProcessShipmentRequest.ClientDetail.AccountNumber 														= shippingRequestData.shippingItemInfo.carrierContractNo;
			this.ProcessShipmentRequest.ClientDetail.MeterNumber 														= shippingRequestData.shippingItemInfo.meterNumber;			
			this.ProcessShipmentRequest.TransactionDetail 																= {};
			this.ProcessShipmentRequest.TransactionDetail.CustomerTransactionId 										= shippingRequestData.shippingReference;		
			this.ProcessShipmentRequest.Version 																		= {};
			this.ProcessShipmentRequest.Version.ServiceId 																= 'ship';
			this.ProcessShipmentRequest.Version.Major 																	= shippingRequestData.configuration.majorId;
			this.ProcessShipmentRequest.Version.Intermediate 															= shippingRequestData.configuration.intermediateId;
			this.ProcessShipmentRequest.Version.Minor 																	= shippingRequestData.configuration.minorId;			
			this.ProcessShipmentRequest.RequestedShipment 																= {};
			this.ProcessShipmentRequest.RequestedShipment.ShipTimestamp 												= shippingRequestData.shippingDate + 'T17:00:00';
			this.ProcessShipmentRequest.RequestedShipment.DropoffType 													= 'REGULAR_PICKUP';
			this.ProcessShipmentRequest.RequestedShipment.ServiceType 													= shippingRequestData.shippingItemInfo.serviceCode;
			this.ProcessShipmentRequest.RequestedShipment.PackagingType 												= 'YOUR_PACKAGING';		
			this.ProcessShipmentRequest.RequestedShipment.TotalWeight 													= {};
			this.ProcessShipmentRequest.RequestedShipment.TotalWeight.Units 											= 'KG';
			this.ProcessShipmentRequest.RequestedShipment.TotalWeight.Value 											= shippingRequestData.weight;			
			this.ProcessShipmentRequest.RequestedShipment.Shipper 														= {};
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Contact 												= {};
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Contact.PersonName 									= shippingRequestData.senderAddress.addresse;
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Contact.CompanyName 									= shippingRequestData.senderAddress.addresse;
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Contact.PhoneNumber 									= shippingRequestData.senderContact.mobileNumber;
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Contact.EMailAddress 									= shippingRequestData.senderContact.emailAddress;		
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address 												= {};
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.StreetLines 									= shippingRequestData.senderAddress.line1;
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.StreetLines 									= shippingRequestData.senderAddress.line2;
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.City 											= shippingRequestData.senderAddress.town;
			//this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.StateOrProvinceCode 							= shippingRequestData.senderAddress.county;
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.PostalCode 									= shippingRequestData.senderAddress.postCode.toUpperCase();
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.CountryCode 									= shippingRequestData.senderAddress.countryCode;	
			this.ProcessShipmentRequest.RequestedShipment.Recipient 													= {};
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Contact 											= {};
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Contact.PersonName 									= shippingRequestData.address.addresse;
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Contact.CompanyName 								= shippingRequestData.address.addresse;
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Contact.PhoneNumber 								= shippingRequestData.contact.mobileNumber;	
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address 											= {};
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.StreetLines 								= shippingRequestData.address.line1;
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.StreetLines 								= shippingRequestData.address.line2;
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.City 										= shippingRequestData.address.town;
			//this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.StateOrProvinceCode 						= shippingRequestData.address.county;
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.PostalCode 									= shippingRequestData.address.postCode.toUpperCase();
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.CountryCode 								= shippingRequestData.address.countryCode;
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment 										= {};
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment.PaymentType 							= 'SENDER';			
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment.Payor 									= {};
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment.Payor.ResponsibleParty 				= {};
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment.Payor.ResponsibleParty.AccountNumber 	= shippingRequestData.shippingItemInfo.carrierContractNo;
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification 											= {};
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification.LabelFormatType 							= 'COMMON2D';
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification.ImageType 									= shippingRequestData.configuration.labelFormat;
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification.LabelStockType 							= 'PAPER_4X6';
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification.LabelPrintingOrientation 					= 'TOP_EDGE_OF_TEXT_FIRST';		
			this.ProcessShipmentRequest.RequestedShipment.RateRequestTypes 												= 'PREFERRED';			
			this.ProcessShipmentRequest.RequestedShipment.MasterTrackingId 												= {};
			this.ProcessShipmentRequest.RequestedShipment.MasterTrackingId.TrackingNumber 								= '';
			this.ProcessShipmentRequest.RequestedShipment.PackageCount 													= 1; 		//shippingRequestData.packageCount;
			this.ProcessShipmentRequest.RequestedShipment.RequestedPackageLineItems 									= [];
			
	//		this.addLineItems = function (_sequenceNumber, _weightUnits, _weightValue, _dimensionsLength, _dimensionsWidth, _dimensionsHeight, _dimensionsUnits)
	//			{
	//				this.ProcessShipmentRequest.RequestedShipment.RequestedPackageLineItems.push(new _lineItemsFedEx(_sequenceNumber, _weightUnits, _weightValue, _dimensionsLength, _dimensionsWidth, _dimensionsHeight, _dimensionsUnits))
	//			}
		}
	
	function _lineItemsFedEx(_sequenceNumber, _weightUnits, _weightValue)
		{
			this.SequenceNumber = _sequenceNumber;	
			
			this.Weight 			= {};
			this.Weight.Units 		= _weightUnits;
			this.Weight.Value 		= _weightValue;
		}
	
	//=========================================================================
	//Return functions that are available in this module 
	//=========================================================================
	//
   return 	{
        		carrierCommitShipments:		fedExCloseShipment,
        		carrierProcessShipments:	fedExProcessShipments,
        		carrierCancelShipments:		fedExCancelPickup
    		};
    
});
