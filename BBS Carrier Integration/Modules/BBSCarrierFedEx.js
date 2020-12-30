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
function(encode, format, http, record, runtime, search, xml, BBSObjects, BBSCommon) 
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
			this.ProcessShipmentRequest = {};
			this.ProcessShipmentRequest.WebAuthenticationDetail = {};
			this.ProcessShipmentRequest.WebAuthenticationDetail.UserCredential = {};
			this.ProcessShipmentRequest.WebAuthenticationDetail.UserCredential.Key = '';
			this.ProcessShipmentRequest.WebAuthenticationDetail.UserCredential.Password = '';
			
			this.ProcessShipmentRequest.ClientDetail = {};
			this.ProcessShipmentRequest.ClientDetail.AccountNumber = '';	
			this.ProcessShipmentRequest.ClientDetail.MeterNumber = '';
			
			this.ProcessShipmentRequest.TransactionDetail = {};
			this.ProcessShipmentRequest.TransactionDetail.CustomerTransactionId =	'';
			
			this.ProcessShipmentRequest.Version = {};
			this.ProcessShipmentRequest.Version.ServiceId = 'ship';
			this.ProcessShipmentRequest.Version.Major = '';
			this.ProcessShipmentRequest.Version.Intermediate = '';
			this.ProcessShipmentRequest.Version.Minor = '';
			
			this.ProcessShipmentRequest.RequestedShipment = {};
			this.ProcessShipmentRequest.RequestedShipment.ShipTimestamp =	'';
			this.ProcessShipmentRequest.RequestedShipment.DropoffType = 'REGULAR_PICKUP';
			this.ProcessShipmentRequest.RequestedShipment.ServiceType =	'';
			this.ProcessShipmentRequest.RequestedShipment.PackagingType = 'YOUR_PACKAGING';
			
			this.ProcessShipmentRequest.RequestedShipment.TotalWeight = {};
			this.ProcessShipmentRequest.RequestedShipment.TotalWeight.Units = 'KG';
			this.ProcessShipmentRequest.RequestedShipment.TotalWeight.Value =	'';
			
			this.ProcessShipmentRequest.RequestedShipment.Shipper = {};
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Contact = {};
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Contact.PersonName =	'';
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Contact.CompanyName =	'';
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Contact.PhoneNumber =	'';
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Contact.EMailAddress = '';
			
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address = {};
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.StreetLines =	'';
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.StreetLines =	'';
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.City =	'';
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.StateOrProvinceCode =	'';
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.PostalCode =	'';
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.CountryCode =	'';
			
			this.ProcessShipmentRequest.RequestedShipment.Recipient = {};
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Contact = {};
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Contact.PersonName =	'';
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Contact.CompanyName =	'';
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Contact.PhoneNumber =	'';
			
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address = {};
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.StreetLines =	'';
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.StreetLines =	'';
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.City =	'';
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.StateOrProvinceCode =	'';
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.PostalCode =	'';
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.CountryCode =	'';
			
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment = {};
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment.PaymentType = 'SENDER';
			
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment.Payor = {};
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment.Payor.ResponsibleParty = {};
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment.Payor.ResponsibleParty.AccountNumber =	'';
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment.Payor.ResponsibleParty.Contact =	'';
			
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification = {};
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification.LabelFormatType = 'COMMON2D';
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification.ImageType = '';
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification.LabelStockType =	'';
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification.LabelPrintingOrientation = 'TOP_EDGE_OF_TEXT_FIRST';
			
			this.ProcessShipmentRequest.RequestedShipment.RateRequestTypes = 'PREFERRED';
			
			this.ProcessShipmentRequest.RequestedShipment.MasterTrackingId = {};
			this.ProcessShipmentRequest.RequestedShipment.MasterTrackingId.TrackingNumber =	'';
			this.ProcessShipmentRequest.RequestedShipment.PackageCount = '';
			
			this.ProcessShipmentRequest.RequestedShipment.RequestedPackageLineItems = [];
			
			this.addLineItems = function (_sequenceNumber, _weightUnits, _weightValue, _dimensionsLength, _dimensionsWidth, _dimensionsHeight, _dimensionsUnits)
				{
					this.ProcessShipmentRequest.RequestedShipment.RequestedPackageLineItems.push(new _lineItemsFedEx(_sequenceNumber, _weightUnits, _weightValue, _dimensionsLength, _dimensionsWidth, _dimensionsHeight, _dimensionsUnits))
				}
		}
	
	function _lineItemsFedEx(_sequenceNumber, _weightUnits, _weightValue, _dimensionsLength, _dimensionsWidth, _dimensionsHeight, _dimensionsUnits)
		{
			this.SequenceNumber = _sequenceNumber;	
			
			this.Weight 			= {};
			this.Weight.Units 		= _weightUnits;
			this.Weight.Value 		= _weightValue;
			
			this.Dimensions 		= {};
			this.Dimensions.Length 	= _dimensionsLength;
			this.Dimensions.Width 	= _dimensionsWidth;
			this.Dimensions.Height 	= _dimensionsHeight;
			this.Dimensions.Units 	= _dimensionsUnits;
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
