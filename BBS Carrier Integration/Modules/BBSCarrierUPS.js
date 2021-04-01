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
	//Main functions - This module implements the integration to UPS
	//=========================================================================
	//
	
	
	//Function to send a shipment request to UPS
	//
	function upsShipmentRequest(_processShipmentRequest)
		{
			//Declare and initialize variables
			//
			var headerObj 				= {};
			var responseStatus			= '';
			var responseBodyObj			= {};
			var processShipmentResponse	= {};
		
			try
				{				
					//Set the headers for the request
					//
					headerObj['Content-Type']			= 'text/json';
					headerObj['Accept']					= '*/*';
					headerObj['Username']				= _processShipmentRequest.configuration.username;
					headerObj['Password']				= _processShipmentRequest.configuration.password;
					headerObj['AccessLicenseNumber']	= _processShipmentRequest.configuration.clientId;
				
					//Create a JSON object that represents the structure of the UPS shipment request
					//
					var shipmentRequestObj = new _shipmentRequest();
					
					//Populate the object with the data from the incoming standard message
					//
					shipmentRequestObj.ShipmentRequest.Shipment.Description 												= "Goods"; // TODO					
					shipmentRequestObj.ShipmentRequest.Shipment.Shipper.Name 												= _processShipmentRequest.senderAddress.addresse;
					shipmentRequestObj.ShipmentRequest.Shipment.Shipper.AttentionName 										= _processShipmentRequest.senderAddress.addresse;
					shipmentRequestObj.ShipmentRequest.Shipment.Shipper.Phone.Number 										= _processShipmentRequest.senderContact.mobileNumber;
					shipmentRequestObj.ShipmentRequest.Shipment.Shipper.ShipperNumber										= _processShipmentRequest.shippingItemInfo.carrierContractNo;
					shipmentRequestObj.ShipmentRequest.Shipment.Shipper.Address.AddressLine									= _processShipmentRequest.senderAddress.line1;
					shipmentRequestObj.ShipmentRequest.Shipment.Shipper.Address.City										= _processShipmentRequest.senderAddress.town;
					//shipmentRequestObj.ShipmentRequest.Shipment.Shipper.Address.StateProvinceCode							= _processShipmentRequest.senderAddress.county;
					shipmentRequestObj.ShipmentRequest.Shipment.Shipper.Address.PostalCode									= _processShipmentRequest.senderAddress.postCode;
					shipmentRequestObj.ShipmentRequest.Shipment.Shipper.Address.CountryCode									= _processShipmentRequest.senderAddress.countryCode;					
					shipmentRequestObj.ShipmentRequest.Shipment.ShipTo.Name													= _processShipmentRequest.address.addresse;
					shipmentRequestObj.ShipmentRequest.Shipment.ShipTo.AttentionName										= _processShipmentRequest.address.addresse;
					shipmentRequestObj.ShipmentRequest.Shipment.ShipTo.Phone.Number 										= _processShipmentRequest.address.phone;
					shipmentRequestObj.ShipmentRequest.Shipment.ShipTo.Address.AddressLine									= _processShipmentRequest.address.line1;
					shipmentRequestObj.ShipmentRequest.Shipment.ShipTo.Address.City											= _processShipmentRequest.address.town;
					//shipmentRequestObj.ShipmentRequest.Shipment.ShipTo.Address.StateProvinceCode							= _processShipmentRequest.address.county;
					shipmentRequestObj.ShipmentRequest.Shipment.ShipTo.Address.PostalCode									= _processShipmentRequest.address.postCode;
					shipmentRequestObj.ShipmentRequest.Shipment.ShipTo.Address.CountryCode									= _processShipmentRequest.address.countryCode;					
					shipmentRequestObj.ShipmentRequest.Shipment.ShipFrom.Name 												= _processShipmentRequest.senderAddress.addresse;
					shipmentRequestObj.ShipmentRequest.Shipment.ShipFrom.AttentionName 										= _processShipmentRequest.senderAddress.addresse;
					shipmentRequestObj.ShipmentRequest.Shipment.ShipFrom.Phone.Number 										= _processShipmentRequest.senderContact.mobileNumber;
					shipmentRequestObj.ShipmentRequest.Shipment.ShipFrom.Address.AddressLine								= _processShipmentRequest.senderAddress.line1;
					shipmentRequestObj.ShipmentRequest.Shipment.ShipFrom.Address.City										= _processShipmentRequest.senderAddress.town;
					//shipmentRequestObj.ShipmentRequest.Shipment.ShipFrom.Address.StateProvinceCode							= _processShipmentRequest.senderAddress.county;
					shipmentRequestObj.ShipmentRequest.Shipment.ShipFrom.Address.PostalCode									= _processShipmentRequest.senderAddress.postCode;
					shipmentRequestObj.ShipmentRequest.Shipment.ShipFrom.Address.CountryCode								= _processShipmentRequest.senderAddress.countryCode;					
					shipmentRequestObj.ShipmentRequest.Shipment.PaymentInformation.ShipmentCharge.Type						= "01"; // 01 = Transportation
					shipmentRequestObj.ShipmentRequest.Shipment.PaymentInformation.ShipmentCharge.BillShipper.AccountNumber	= _processShipmentRequest.shippingItemInfo.carrierContractNo;					
					shipmentRequestObj.ShipmentRequest.Shipment.Service.Code												= _processShipmentRequest.shippingItemInfo.serviceCodes[0].serviceCode;
					shipmentRequestObj.ShipmentRequest.Shipment.Service.Description											= _processShipmentRequest.shippingItemInfo.serviceCodes[0].serviceDescription;									
					shipmentRequestObj.ShipmentRequest.Shipment.LabelSpecification.LabelImageFormat.Code					= _processShipmentRequest.configuration.labelFormat;
					shipmentRequestObj.ShipmentRequest.Shipment.LabelSpecification.LabelImageFormat.Description				= _processShipmentRequest.configuration.labelFormat;
					
					//Get count of packages from the incoming message
					//
					var packageCount = _processShipmentRequest.packages.length;
					
					//Loop through packages
					for (var i = 0; i < packageCount; i++)
						{
							//Push a new package object to the shipmentRequestObj
							//
							shipmentRequestObj.ShipmentRequest.Shipment.Package.push(new _upsPackageObj(_processShipmentRequest.packages[i].weight));
						}
					
					log.debug({
						title: 'Shipment Request',
						details: JSON.stringify(shipmentRequestObj)
					});
					
					try
						{
							//Make the request to UPS
							//
							var response = https.post({
								url:		_processShipmentRequest.configuration.url,
								headers:	headerObj,
								body:		JSON.stringify(shipmentRequestObj)
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
										}
								}
						}
					catch(err)
						{
							responseStatus = err.message;
						}
					
					log.debug({
						title: 'Shipment Response',
						details: responseBodyObj
					});
					
					//Check the responseObject to see whether a success or error/failure message was returned
					//
					if (responseStatus == '200')
						{
							//Declare and initialize variables
							//
							var consignmentNumber 	= '';
							var shipmentId		 	= '';
							var message 			= '';
							var labelImage 			= '';
							var labelType			= '';
							
							//Get the UPS response status
							//
							var upsResponseStatus = responseBodyObj['ShipmentResponse']['Response']['ResponseStatus']['Description'];
							
							//If we have a successful response
							//
							if (upsResponseStatus == 'Success')
								{
									//Get the consignment number
									//
									consignmentNumber = responseBodyObj['ShipmentResponse']['ShipmentResults']['ShipmentIdentificationNumber'];
									
									//Convert the UPS response object to the standard process shipments response object
									//
									processShipmentResponse = new BBSObjects.processShipmentResponse(responseStatus, null, consignmentNumber);
									
									//Get the package results
									//
									var packageResults = responseBodyObj['ShipmentResponse']['ShipmentResults']['PackageResults'];
									
									if (typeof packageResults == 'array')
										{
											//Loop through packages
											//
											for (var i = 0; i < packageResults.length; i++)
												{
													//Get the tracking number
													//
													var trackingNumber = packageResults[i].TrackingNumber;
													
													//Call function to return the label image
													var labelRecoveryRequest = upsLabelRecoveryRequest(headerObj, _processShipmentRequest.configuration.urlLabelRecovery, _processShipmentRequest.configuration.labelFormat, trackingNumber);
													
													//Check the labelRecoveryRequest response to see whether a success or error/failure message was returned
													//
													if (labelRecoveryRequest.responseStatus == '200')
														{
															//Get the label image and type
															//
															labelImage 	= labelRecoveryRequest['responseBody']['LabelRecoveryResponse']['LabelResults']['LabelImage']['GraphicImage'];
															labelType	= _processShipmentRequest.configuration.labelFormat;
															
															//Add packages to processShipmentResponse
															//
															processShipmentResponse.addPackage(i, trackingNumber, labelImage, labelType);
														}
													else
														{
															//Convert the UPS response object to the standard process shipments response object
															//
															processShipmentResponse = new BBSObjects.processShipmentResponse(labelRecoveryRequest.responseStatus, labelRecoveryRequest.responseBody.response.errors[0].message, consignmentNumber);
															
															//Don't make any further label recovery requests
															//
															break;
														}												
												}
										}
									else if (typeof packageResults == 'object')
										{
											//Get the tracking number
											//
											var trackingNumber = packageResults.TrackingNumber;
											
											//Call function to return the label image
											//
											var labelRecoveryRequest = upsLabelRecoveryRequest(headerObj, _processShipmentRequest.configuration.urlLabelRecovery, _processShipmentRequest.configuration.labelFormat, trackingNumber);
											
											//Check the labelRecoveryRequest response to see whether a success or error/failure message was returned
											//
											if (labelRecoveryRequest.responseStatus == '200')
												{
													//Get the label image and type
													//
													labelImage 	= labelRecoveryRequest['responseBody']['LabelRecoveryResponse']['LabelResults']['LabelImage']['GraphicImage'];
													labelType	= _processShipmentRequest.configuration.labelFormat;
													
													//Add packages to processShipmentResponse
													//
													processShipmentResponse.addPackage(i, trackingNumber, labelImage, labelType);
												}
											else
												{
													//Convert the UPS response object to the standard process shipments response object
													//
													processShipmentResponse = new BBSObjects.processShipmentResponse(labelRecoveryRequest.responseStatus, labelRecoveryRequest.responseBody.response.errors[0].message, consignmentNumber);
												}											
										}
								}
						}
					else
						{
							//Get the error message
							//
							var message = responseBodyObj.response.errors[0].message;
							
							//Convert the UPS response object to the standard process shipments response object
							//
							processShipmentResponse = new BBSObjects.processShipmentResponse(responseStatus, message, '');
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
	
	//Function to return the UPS shipping label
	//
	function upsLabelRecoveryRequest(_headerObj, _labelRecoveryURL, _labelFormat, _trackingNumber)
		{
			//Declare and initialize variables
			//
			var responseStatus 			= '';
			var responseBodyObj			= {};
		
			//Create a JSON object that represents the structure of the UPS label recovery request
			//
			var labelRecoveryRequestObj = new _labelRecoveryRequest();
			
			//Populate the object with the data from the incoming standard message
			//
			labelRecoveryRequestObj.LabelRecoveryRequest.LabelSpecification.LabelImageFormat.Code 			= _labelFormat;
			labelRecoveryRequestObj.LabelRecoveryRequest.LabelSpecification.LabelImageFormat.Description	= _labelFormat;
			labelRecoveryRequestObj.LabelRecoveryRequest.LabelSpecification.LabelStockSize.Height			= "6";
			labelRecoveryRequestObj.LabelRecoveryRequest.LabelSpecification.LabelStockSize.Width 			= "4";
			labelRecoveryRequestObj.LabelRecoveryRequest.TrackingNumber										= _trackingNumber;
			
			try
				{
					//Make the request to UPS
					//
					var response = https.post({
						url:		_labelRecoveryURL,
						headers:	_headerObj,
						body:		JSON.stringify(labelRecoveryRequestObj)
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
								}
						}
				}
			catch(err)
				{
					responseStatus = err.message;
				}
			
			// return values to the main script function
			return {
				responseStatus:	responseStatus,
				responseBody:	responseBodyObj
			}
			
		}
	
	//Function to cancel a shipment from UPS
	//
	function upsVoidShipmentRequest(_cancelShipmentRequest)
		{
			//Declare and initialize variables
			//
			var headerObj 				= {};
			var responseStatus			= '';
			var responseBodyObj			= {};
			var cancelShipmentResponse	= {};
			
			try
				{
					//Set the headers for the request
					//
					headerObj['Content-Type']			= 'text/json';
					headerObj['Accept']					= '*/*';
					headerObj['Username']				= _cancelShipmentRequest.configuration.username;
					headerObj['Password']				= _cancelShipmentRequest.configuration.password;
					headerObj['AccessLicenseNumber']	= _cancelShipmentRequest.configuration.clientId;
					
					try
						{
							//Make the request to UPS
							//
							var response = https.delete({
								url:		_cancelShipmentRequest.configuration.urlDelete + '/' + _cancelShipmentRequest.consignmentNumber,
								headers:	headerObj
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
										}
								}							
						}
					catch(err)
						{
							responseStatus = err.message;	
						}
					
					//Check the responseObject to see whether a success or error/failure message was returned
					//
					if (responseStatus == '200')
						{
							//Declare and initialize variables
							//
							var message = '';
						
							//Convert the UPS response object to the standard process shipments response object
							//
							cancelShipmentResponse = new BBSObjects.cancelShipmentResponse(responseStatus, message, '');
						}
					else
						{
							//Get the error message
							//
							var message = responseBodyObj.response.errors[0].message;
							
							//Convert the UPS response object to the standard process shipments response object
							//
							cancelShipmentResponse = new BBSObjects.cancelShipmentResponse(responseStatus, message, '');
						}
					
					//Return the response
					//
					return cancelShipmentResponse;
					
				}
			catch(e)
				{
					//Set the cancel shipment response using the error caught
					//
					var cancelShipmentResponse = new BBSObjects.cancelShipmentResponse('ERROR', e);
					
					//Return the response
					//
					return cancelShipmentResponse;
				}

		}

	//=========================================================================
	//Helper functions
	//=========================================================================
	//
	
	
	//=========================================================================
	//UPS Specific Objects
	//=========================================================================
	//
	function _shipmentRequest()
		{
			this.ShipmentRequest = {};
			
			/*this.ShipmentRequest.Request = {};
			this.ShipmentRequest.Request.TransactionReference = {};
			this.ShipmentRequest.Request.TransactionReference.CustomerContext = '';*/
			
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
			//this.ShipmentRequest.Shipment.Shipper.Address.StateProvinceCode = '';
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
			//this.ShipmentRequest.Shipment.ShipTo.Address.StateProvinceCode = '';
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
			//this.ShipmentRequest.Shipment.ShipFrom.Address.StateProvinceCode = '';
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
			
			this.ShipmentRequest.Shipment.Package = [];
			
			this.ShipmentRequest.Shipment.LabelSpecification = {};
			this.ShipmentRequest.Shipment.LabelSpecification.LabelImageFormat = {};
			this.ShipmentRequest.Shipment.LabelSpecification.LabelImageFormat.Code = '';
			this.ShipmentRequest.Shipment.LabelSpecification.LabelImageFormat.Description = '';
			//this.ShipmentRequest.LabelSpecification.HTTPUserAgent = '';
		}
	
	function _labelRecoveryRequest()
		{
			this.LabelRecoveryRequest = {};
			
			this.LabelRecoveryRequest.LabelSpecification = {};
			this.LabelRecoveryRequest.LabelSpecification.LabelImageFormat = {};
			this.LabelRecoveryRequest.LabelSpecification.LabelImageFormat.Code = '';
			this.LabelRecoveryRequest.LabelSpecification.LabelImageFormat.Description = '';
			this.LabelRecoveryRequest.LabelSpecification.LabelStockSize = {};
			this.LabelRecoveryRequest.LabelSpecification.LabelStockSize.Height = '';
			this.LabelRecoveryRequest.LabelSpecification.LabelStockSize.Width = '';
			
			this.LabelRecoveryRequest.TrackingNumber = '';
			
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
	
	function _upsPackageObj(_packageWeight)
		{
			this.Packaging = {};
			this.Packaging.Code = "02"; // 02 = Customer Supplied Package
			this.PackageWeight = {};
			this.PackageWeight.UnitOfMeasurement = {};
			this.PackageWeight.UnitOfMeasurement.Code = "KGS";
			this.PackageWeight.Weight = _packageWeight;
			
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
