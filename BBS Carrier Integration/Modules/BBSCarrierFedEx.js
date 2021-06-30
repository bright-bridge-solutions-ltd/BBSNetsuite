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
					debugger;
					
					//New implementation
					//
					var masterTrackingId 		= '';
					var processShipmentResponse = new BBSObjects.processShipmentResponse('', '', '');	//status, message, consignment #
					
					//Loop through the packages on the incoming shipping request
					//
					for (var requestPackages = 0; requestPackages < _processShipmentRequest.packages.length; requestPackages++) 
						{
							//Call FedEx passing in the original shipment request, the loop counter for the packages & the master tracking id
							//Response object will contain status, consignmentNumber, responseMessage, labelSequence, labelTracking, labelImage & labelType, 
							//
							var fedExResponse = callFedEx(_processShipmentRequest, requestPackages, masterTrackingId);
							
							//If the master tracking id is empty, then fill it from the tracking id returned & also set the consignment number on the response message
							//
							if(masterTrackingId == '')
								{
									masterTrackingId 							= fedExResponse.consignmentNumber;
									processShipmentResponse.consignmentNumber 	= fedExResponse.consignmentNumber;
								}
							
							processShipmentResponse.status 	= fedExResponse.status;
							processShipmentResponse.message = fedExResponse.responseMessage;
							
							//Push the response into the return message
							//
							processShipmentResponse.addPackage(
																fedExResponse.labelSequence,
																fedExResponse.labelTracking,
																fedExResponse.labelImage,
																fedExResponse.labelType
																);
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
				
		
	function fedExResponseObj(_status, _consignmentNumber, _responseMessage, _labelSequence, _labelTracking, _labelImage, _labelType)
		{
			this.status				= _status; 
			this.consignmentNumber	= _consignmentNumber;
			this.responseMessage	= _responseMessage;
			this.labelSequence		= _labelSequence;
			this.labelTracking		= _labelTracking;
			this.labelImage			= _labelImage;
			this.labelType			= _labelType;
		}
	
	//Encapsulate the call to FedEx
	//
	function callFedEx(_processShipmentRequest, _requestPackages, _masterTrackingId)		
		{		
			//Create a JSON object that represents the structure of the FedEx specific request
			//
			var processShipmentRequestFedEx = new _processShipmentRequestFedEx(_processShipmentRequest);
					
			//Do we need to add in the master tracking id
			//
			if(_masterTrackingId != '')
				{
					processShipmentRequestFedEx.ProcessShipmentRequest.RequestedShipment.MasterTrackingId.TrackingNumber = _masterTrackingId;
				}
					
			//Add the package info to the request
			//
			processShipmentRequestFedEx.ProcessShipmentRequest.RequestedShipment.RequestedPackageLineItems.push(
																												new _lineItemsFedEx(	_requestPackages + 1, 
																																		'KG', 
																																		_processShipmentRequest.packages[_requestPackages].weight
																																	)
																												);
			
			log.debug({title: 'FedEx Request Object', details: processShipmentRequestFedEx});
			
			// Declare xmlRequest variable and set SOAP envelope
			var xmlRequest = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v26="http://fedex.com/ws/ship/v26"><soapenv:Header/><soapenv:Body>';
					
			//Convert the FedEx request object into xml. Add to xmlRequest variable
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
			if (responseObject['SOAP-ENV:Envelope']['SOAP-ENV:Body']['soap:Fault'])
				{
					// get the soap fault
					var responseMessage = responseObject['SOAP-ENV:Envelope']['SOAP-ENV:Body']['soap:Fault']['faultstring']['#text'];
							
					//Create a FedEx response object 
					//
					var fedExResponse = new fedExResponseObj('ERROR', '', responseMessage, '', '', '', '');
				}
			else
				{
					//Get the status of the response from the responseObject
					//
					var responseStatus = responseObject['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ProcessShipmentReply']['HighestSeverity']['#text'];
							
					//Check the responseObject to see whether a success or error/failure message was returned
					//
					if (responseStatus == 'SUCCESS' || responseStatus == 'WARNING' || responseStatus == 'NOTE')
						{
							//Get the consignment number from the responseObject
							//
							var consignmentNumber = responseObject['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ProcessShipmentReply']['CompletedShipmentDetail']['MasterTrackingId']['TrackingNumber']['#text']
								
							//Create a FedEx response object 
							//
							var labelSequence 	= responseObject['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ProcessShipmentReply']['CompletedShipmentDetail']['CompletedPackageDetails']['SequenceNumber']['#text'];
							var labelTracking 	= responseObject['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ProcessShipmentReply']['CompletedShipmentDetail']['CompletedPackageDetails']['TrackingIds']['TrackingNumber']['#text'];
							var labelImage 		= responseObject['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ProcessShipmentReply']['CompletedShipmentDetail']['CompletedPackageDetails']['Label']['Parts']['Image']['#text'];
							var labelType 		= responseObject['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ProcessShipmentReply']['CompletedShipmentDetail']['CompletedPackageDetails']['Label']['ImageType']['#text'];
							
							//If the label type is ZPL, then decode it
							//
							if(labelType = 'ZPLII')
								{
									labelImage = encode.convert({
																string: 		labelImage,
																inputEncoding: 	encode.Encoding.BASE_64,
																outputEncoding: encode.Encoding.UTF_8
															});
								}
							
							var fedExResponse = new fedExResponseObj(responseStatus, consignmentNumber, '', labelSequence, labelTracking, labelImage, labelType);	
						}
					else
						{
							//Get the message from the responseObject
							//
							var responseMessage  = responseObject['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ProcessShipmentReply']['HighestSeverity']['#text'];
							responseMessage		+= ' ';
							responseMessage 	+= responseObject['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ProcessShipmentReply']['Notifications']['Message']['#text'];
								
							//Create a FedEx response object 
							//
							var fedExResponse = new fedExResponseObj(responseStatus, '', responseMessage, '', '', '', '');
						}
				}
							
			//Return the response
			//
			return fedExResponse;
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
			//Calculate the total value
			//
			var totalValue = Number(0);
			
			for (var itemDetailCounter = 0; itemDetailCounter < shippingRequestData.itemDetails.length; itemDetailCounter++) 
				{
					totalValue += Number(shippingRequestData.itemDetails[itemDetailCounter].itemValue);
				}
		
			
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
			
			this.ProcessShipmentRequest.RequestedShipment.CustomsClearanceDetail   										= {};
			this.ProcessShipmentRequest.RequestedShipment.CustomsClearanceDetail.DutiesPayment            				= {};
			this.ProcessShipmentRequest.RequestedShipment.CustomsClearanceDetail.DutiesPayment.PaymentType              = 'SENDER';
			this.ProcessShipmentRequest.RequestedShipment.CustomsClearanceDetail.DutiesPayment.Payor                    = {};
			this.ProcessShipmentRequest.RequestedShipment.CustomsClearanceDetail.DutiesPayment.Payor.ResponsibleParty  	= {};
			this.ProcessShipmentRequest.RequestedShipment.CustomsClearanceDetail.DutiesPayment.Payor.ResponsibleParty.AccountNumber	= shippingRequestData.shippingItemInfo.carrierContractNo;
			this.ProcessShipmentRequest.RequestedShipment.CustomsClearanceDetail.CustomsValue             				= {};
			this.ProcessShipmentRequest.RequestedShipment.CustomsClearanceDetail.CustomsValue.Currency                 	= shippingRequestData.currencyISOCode;
			this.ProcessShipmentRequest.RequestedShipment.CustomsClearanceDetail.CustomsValue.Amount                   	= totalValue;
			this.ProcessShipmentRequest.RequestedShipment.CustomsClearanceDetail.Commodities              				= [];

			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification 											= {};
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification.LabelFormatType 							= 'COMMON2D';
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification.ImageType 									= shippingRequestData.configuration.labelFormat;
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification.LabelStockType 							= 'STOCK_4X6';
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification.LabelPrintingOrientation 					= 'TOP_EDGE_OF_TEXT_FIRST';		
			this.ProcessShipmentRequest.RequestedShipment.RateRequestTypes 												= 'NONE';			
			this.ProcessShipmentRequest.RequestedShipment.MasterTrackingId 												= {};
			this.ProcessShipmentRequest.RequestedShipment.MasterTrackingId.TrackingNumber 								= '';
			this.ProcessShipmentRequest.RequestedShipment.PackageCount 													= shippingRequestData.packageCount;
			this.ProcessShipmentRequest.RequestedShipment.RequestedPackageLineItems 									= [];
			
			//Add the commodity lines
			//
			for (var itemDetailCounter = 0; itemDetailCounter < shippingRequestData.itemDetails.length; itemDetailCounter++) 
				{
					this.ProcessShipmentRequest.RequestedShipment.CustomsClearanceDetail.Commodities.push(new _commodityFedEx(
																																Number(shippingRequestData.itemDetails[itemDetailCounter].itemQty), 
																																shippingRequestData.itemDetails[itemDetailCounter].itemDesc, 
																																shippingRequestData.itemDetails[itemDetailCounter].itemCountry, 
																																Number(shippingRequestData.itemDetails[itemDetailCounter].itemUnitWeight) * Number(shippingRequestData.itemDetails[itemDetailCounter].itemQty), 
																																Number(shippingRequestData.itemDetails[itemDetailCounter].itemUnitRate), 
																																Number(shippingRequestData.itemDetails[itemDetailCounter].itemValue), 
																																shippingRequestData.currencyISOCode
																																)
																											);
				}
			
	//		this.addLineItems = function (_sequenceNumber, _weightUnits, _weightValue, _dimensionsLength, _dimensionsWidth, _dimensionsHeight, _dimensionsUnits)
	//			{
	//				this.ProcessShipmentRequest.RequestedShipment.RequestedPackageLineItems.push(new _lineItemsFedEx(_sequenceNumber, _weightUnits, _weightValue, _dimensionsLength, _dimensionsWidth, _dimensionsHeight, _dimensionsUnits))
	//			}
		}
	
	function _commodityFedEx(_quantity, _description, _com, _weight, _rate, _amount, _currrency)
		{
			this.NumberOfPieces           = _quantity;
			this.Description              = _description;
			this.CountryOfManufacture     = _com;
			this.Weight                   = {};
			this.Weight.Units             = 'KG';
			this.Weight.Value             = _weight;
			this.Quantity                 = _quantity;
			this.QuantityUnits            = 'EA';
			this.UnitPrice                = {};
			this.UnitPrice.Currency       = _currrency;
			this.UnitPrice.Amount         = _amount;
			this.CustomsValue             = {};
			this.CustomsValue.Currency    = _currrency;
			this.CustomsValue.Amount      = _amount;
		}
	
	
	function _lineItemsFedEx(_sequenceNumber, _weightUnits, _weightValue)
		{
			this.SequenceNumber 	= _sequenceNumber;	
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
