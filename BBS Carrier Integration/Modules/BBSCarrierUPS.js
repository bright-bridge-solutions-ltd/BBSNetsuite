define(['N/encode', 'N/format', 'N/http', 'N/record', 'N/runtime', 'N/search', 'N/xml',
        '/SuiteScripts/BBS Carrier Integration/Modules/BBSObjects',								//Objects used to pass info back & forth
        '/SuiteScripts/BBS Carrier Integration/Modules/BBSCommon'								//Common code
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
	//Main functions - This module implements the integration to UPS
	//=========================================================================
	//
	
	
	//Function to send a shipment request to UPS
	//
	function upsShipmentRequest(_processShipmentRequest)
		{

		}

	
	//Function to cancel a shipment from UPS
	//
	function upsVoidShipmentRequest(_cancelShipmentRequest)
		{
			try
				{
					//Create a JSON object that represents the structure of the UPS void shipment request
					//
					var voidShipmentRequestObj = new _voidShipmentRequest();
					
					//Populate the object with the data from the incoming standard message
					//
					voidShipmentRequestObj.VoidShipmentRequest.Request.TransactionReference.CustomerContext = '';
					voidShipmentRequestObj.VoidShipmentRequest.VoidShipment.ShipmentIdentificationNumber 	= _cancelShipmentRequest.consignmentNumber;
					
					//Create a JSON object that represents the structure of the UPS Security part of the message
					//
					var securityObj = new _upsSecurity();
					
					//Populate the object with the data from the incoming standard message
					//
					securityObj.UPSSecurity.UsernameToken.Username 					= _cancelShipmentRequest.configuration.username;
					securityObj.UPSSecurity.UsernameToken.Password 					= _cancelShipmentRequest.configuration.password;
					securityObj.UPSSecurity.ServiceAccessToken.AccessLicenseNumber 	= '';
					
					//Declare xmlRequest variable and set SOAP envelope
					//
					var xmlRequest = '<envr:Envelope xmlns:auth="http://www.ups.com/schema/xpci/1.0/auth" xmlns:envr="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:upss="http://www.ups.com/XMLSchema/XOLTWS/UPSS/v1.0" xmlns:common="http://www.ups.com/XMLSchema/XOLTWS/Common/v1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
					xmlRequest += '<envr:Header>';
					
					//Convert the security header into xml
					//
					xmlRequest += BBSCommon.json2xml(securityObj,'','upss:');
					
					xmlRequest += '</envr:Header>';
					xmlRequest += '<envr:Body>';
					
					//Convert the UPS request object into xml.
					//
					var voidXml  = BBSCommon.json2xml(voidShipmentRequestObj,'','void:');
					
					voidXml = voidXml.replace('<void:VoidShipmentRequest>','<void:VoidShipmentRequest xmlns:void="http://www.ups.com/XMLSchema/XOLTWS/Void/v1.1">');
					voidXml = voidXml.replace('<void:Request>','<common:Request>');
					voidXml = voidXml.replace('<void:TransactionReference>','<common:TransactionReference>');
					voidXml = voidXml.replace('<void:CustomerContext>','<common:CustomerContext>');
					voidXml = voidXml.replace('</void:CustomerContext>','</common:CustomerContext>');
					voidXml = voidXml.replace('</void:TransactionReference>','</common:TransactionReference>');
					voidXml = voidXml.replace('</void:Request>','</common:Request>');
					
					xmlRequest += voidXml;
					
					//Add closing SOAP envelope tags
					//
					xmlRequest += '</envr:Body>';
					xmlRequest += '</envr:Envelope>';
					
					//Send the request to UPS
					//
					var xmlResponse = http.post({
											     url: 	_cancelShipmentRequest.configuration.url,
											     body: 	xmlRequest
												});
					
					//Parse the xmlResponse string and convert it to XML
					//
					xmlResponse = xml.Parser.fromString({
														text: xmlResponse.body
														});
					
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
							//Convert the UPS response object to the standard commit shipments response object
							//
							var cancelShipmentResponse = new BBSObjects.cancelShipmentResponse(responseStatus, null);
						}
					else if (responseStatus == 'ERROR' || responseStatus == 'FAILURE')
						{
							//Get the error message from the responseObject
							var responseMessage = responseObject['soap:Envelope']['soap:Body']['ProcessedDeleteShipments']['DeleteShipmentsResult']['Shipments']['Status']['StatusDescription']['#text'];
							
							//Convert the UPS response object to the standard commit shipments response object
							//
							var cancelShipmentResponse = new BBSObjects.cancelShipmentResponse(responseStatus, responseMessage);
						}
					
					//Return the response
					//
					return cancelShipmentResponse;
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

	//=========================================================================
	//Helper functions
	//=========================================================================
	//
	
	
	//=========================================================================
	//FedEx Specific Objects
	//=========================================================================
	//
	function _shipmentRequest()
		{
			this.ShipmentRequest = {};
			this.ShipmentRequest.Request = {};
			this.ShipmentRequest.Request.TransactionReference = {};
			this.ShipmentRequest.Request.TransactionReference.CustomerContext = '';
			
			this.ShipmentRequest.Shipment = {};
			this.ShipmentRequest.Shipment.Description = '';
			
			this.ShipmentRequest.Shipment.Shipper = {};
			this.ShipmentRequest.Shipment.Shipper.Name = '';
			this.ShipmentRequest.Shipment.Shipper.AttentionName = '';
			
			this.ShipmentRequest.Shipment.Shipper.Phone = {};
			this.ShipmentRequest.Shipment.Shipper.Phone.Number = '';
			
			this.ShipmentRequest.Shipment.Shipper.ShipperNumber = '';
			
			this.ShipmentRequest.Shipment.Shipper.Address = {};
			this.ShipmentRequest.Shipment.Shipper.Address.AddressLine = '';
			this.ShipmentRequest.Shipment.Shipper.Address.City = '';
			this.ShipmentRequest.Shipment.Shipper.Address.StateProvinceCode = '';
			this.ShipmentRequest.Shipment.Shipper.Address.PostalCode = '';
			this.ShipmentRequest.Shipment.Shipper.Address.CountryCode = '';
			
			this.ShipmentRequest.Shipment.ShipTo = {};
			this.ShipmentRequest.Shipment.ShipTo.Name = '';
			this.ShipmentRequest.Shipment.ShipTo.AttentionName = '';
			
			this.ShipmentRequest.Shipment.ShipTo.Phone = {};
			this.ShipmentRequest.Shipment.ShipTo.Phone.Number = '';
			
			this.ShipmentRequest.Shipment.ShipTo.Address = {};
			this.ShipmentRequest.Shipment.ShipTo.Address.AddressLine = '';
			this.ShipmentRequest.Shipment.ShipTo.Address.City = '';
			this.ShipmentRequest.Shipment.ShipTo.Address.StateProvinceCode = '';
			this.ShipmentRequest.Shipment.ShipTo.Address.PostalCode = '';
			this.ShipmentRequest.Shipment.ShipTo.Address.CountryCode = '';
			
			this.ShipmentRequest.Shipment.ShipFrom = {};
			this.ShipmentRequest.Shipment.ShipFrom.Name = '';
			this.ShipmentRequest.Shipment.ShipFrom.AttentionName = '';
			
			this.ShipmentRequest.Shipment.ShipFrom.Phone = {};
			this.ShipmentRequest.Shipment.ShipFrom.Phone.Number = '';
			
			this.ShipmentRequest.Shipment.ShipFrom.Address = {};
			this.ShipmentRequest.Shipment.ShipFrom.Address.AddressLine = '';
			this.ShipmentRequest.Shipment.ShipFrom.Address.City = '';
			this.ShipmentRequest.Shipment.ShipFrom.Address.StateProvinceCode = '';
			this.ShipmentRequest.Shipment.ShipFrom.Address.PostalCode = '';
			this.ShipmentRequest.Shipment.ShipFrom.Address.CountryCode = '';
			
			this.ShipmentRequest.Shipment.PaymentInformation = {};
			this.ShipmentRequest.Shipment.PaymentInformation.ShipmentCharge = {};
			this.ShipmentRequest.Shipment.PaymentInformation.ShipmentCharge.Type = '';
			
			this.ShipmentRequest.Shipment.PaymentInformation.ShipmentCharge.BillShipper = {};
			this.ShipmentRequest.Shipment.PaymentInformation.ShipmentCharge.BillShipper.AccountNumber = '';
			
			this.ShipmentRequest.Shipment.Service = {};
			this.ShipmentRequest.Shipment.Service.Code = '';
			this.ShipmentRequest.Shipment.Service.Description = '';
			
			this.ShipmentRequest.Shipment.Package = {};
			this.ShipmentRequest.Shipment.Package.Description = '';
			
			this.ShipmentRequest.Shipment.Package.Packaging = {};
			this.ShipmentRequest.Shipment.Package.Packaging.Code = '';
			this.ShipmentRequest.Shipment.Package.Packaging.Description = '';
			
			this.ShipmentRequest.Shipment.Package.Dimensions = {};
			this.ShipmentRequest.Shipment.Package.Dimensions.UnitOfMeasurement = {};
			this.ShipmentRequest.Shipment.Package.Dimensions.UnitOfMeasurement.Code = '';
			this.ShipmentRequest.Shipment.Package.Dimensions.UnitOfMeasurement.Description = '';
			this.ShipmentRequest.Shipment.Package.Dimensions.Length = '';
			this.ShipmentRequest.Shipment.Package.Dimensions.Width = '';
			this.ShipmentRequest.Shipment.Package.Dimensions.Height = '';
			
			this.ShipmentRequest.Shipment.Package.PackageWeight = {};
			this.ShipmentRequest.Shipment.Package.PackageWeight.UnitOfMeasurement = {};
			this.ShipmentRequest.Shipment.Package.PackageWeight.UnitOfMeasurement.Code = '';
			this.ShipmentRequest.Shipment.Package.PackageWeight.UnitOfMeasurement.Description = '';
			this.ShipmentRequest.Shipment.Package.PackageWeight.Weight = '';
			
			this.ShipmentRequest.LabelSpecification = {};
			this.ShipmentRequest.LabelSpecification.LabelImageFormat = {};
			this.ShipmentRequest.LabelSpecification.LabelImageFormat.Code = '';
			this.ShipmentRequest.LabelSpecification.LabelImageFormat.Description = '';
			this.ShipmentRequest.LabelSpecification.HTTPUserAgent = '';
		}
	
	function _voidShipmentRequest()
		{
			this.VoidShipmentRequest = {};
			this.VoidShipmentRequest.Request = {};
			this.VoidShipmentRequest.Request.TransactionReference = {};
			this.VoidShipmentRequest.Request.TransactionReference.CustomerContext = '';
			
			this.VoidShipmentRequest.VoidShipment = {};
			this.VoidShipmentRequest.VoidShipment.ShipmentIdentificationNumber = '';
		}
	
	function _upsSecurity()
		{
			this.UPSSecurity = {}
			this.UPSSecurity.UsernameToken = {};
			this.UPSSecurity.UsernameToken.Username = '';
			this.UPSSecurity.UsernameToken.Password = '';
			this.UPSSecurity.ServiceAccessToken = {};
			this.UPSSecurity.ServiceAccessToken.AccessLicenseNumber = '';
		}
	

	//=========================================================================
	//Return functions that are available in this module 
	//=========================================================================
	//
   return 	{
        		carrierCommitShipments:		null,
        		carrierProcessShipments:	upsShipmentRequest,
        		carrierCancelShipments:		upsVoidShipmentRequest
    		};
    
});
