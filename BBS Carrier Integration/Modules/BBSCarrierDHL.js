/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/encode', 'N/format', 'N/encode', 'N/https', 'N/record', 'N/runtime', 'N/search', 'N/xml',
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
function(encode, format, encode, https, record, runtime, search, xml, BBSObjects, BBSCommon) 
{
	//=========================================================================
	//Main functions - This module implements the integration to DHL
	//=========================================================================
	//
	
	//Function to send a shipment request to DHL
	//
	function dhlShipmentRequest(_processShipmentRequest)
		{
			//Declare and initialize variables
			//
			var headerObj 				= {};
			var credentialObj			= {};
			var responseStatus			= '';
			var responseBodyObj			= {};
			var processShipmentResponse	= {};
			var declaredValue			= 0;
			
			try
				{				
					//Set the headers for the request
					//
					headerObj['Content-Type']		= 'application/json';
					headerObj['Accept']				= '*/*';
					headerObj['Authorization']		= 'Basic ' + encode.convert({
						string:			_processShipmentRequest.configuration.username + ':' + _processShipmentRequest.configuration.password,
						inputEncoding:	encode.Encoding.UTF_8,
						outputEncoding:	encode.Encoding.BASE_64
					});
				
					//Create a JSON object that represents the structure of the DHL shipment request
					//
					var shipmentRequestObj = new _shipmentRequest();
					
					//Populate the object with the data from the incoming standard message
					//
					shipmentRequestObj.plannedShippingDateAndTime 	= _processShipmentRequest.shippingDate + 'T17:00:00 GMT+00:00';
					shipmentRequestObj.pickup.isRequested			= false;
					shipmentRequestObj.productCode					= _processShipmentRequest.shippingItemInfo.serviceCode;
					
					shipmentRequestObj.accounts.push(new _dhlAccountObj(_processShipmentRequest.shippingItemInfo.carrierContractNo, 'shipper'));
					
					shipmentRequestObj.customerDetails.shipperDetails.postalAddress.addressLine1 		= _processShipmentRequest.senderAddress.line1;
					
					if (_processShipmentRequest.senderAddress.line2)
						{
							shipmentRequestObj.customerDetails.shipperDetails.postalAddress.addressLine2 = _processShipmentRequest.senderAddress.line2;
						}
					
					shipmentRequestObj.customerDetails.shipperDetails.postalAddress.cityName	 		= _processShipmentRequest.senderAddress.town;
					shipmentRequestObj.customerDetails.shipperDetails.postalAddress.postalCode	 		= _processShipmentRequest.senderAddress.postCode;
					shipmentRequestObj.customerDetails.shipperDetails.postalAddress.countryCode	 		= _processShipmentRequest.senderAddress.countryCode;
					shipmentRequestObj.customerDetails.shipperDetails.contactInformation.companyName	= _processShipmentRequest.senderAddress.addresse;		
					shipmentRequestObj.customerDetails.shipperDetails.contactInformation.fullName		= _processShipmentRequest.senderAddress.addresse;
					//shipmentRequestObj.customerDetails.shipperDetails.contactInformation.email		= '';
					shipmentRequestObj.customerDetails.shipperDetails.contactInformation.phone			= _processShipmentRequest.senderContact.mobileNumber;
					
					shipmentRequestObj.customerDetails.receiverDetails.postalAddress.addressLine1 		= _processShipmentRequest.address.line1;
					
					if (_processShipmentRequest.address.line2)
						{
							shipmentRequestObj.customerDetails.shipperDetails.postalAddress.addressLine2 = _processShipmentRequest.address.line2;
						}
					
					shipmentRequestObj.customerDetails.receiverDetails.postalAddress.cityName	 		= _processShipmentRequest.address.town;
					shipmentRequestObj.customerDetails.receiverDetails.postalAddress.postalCode	 		= _processShipmentRequest.address.postCode;
					shipmentRequestObj.customerDetails.receiverDetails.postalAddress.countryCode	 	= _processShipmentRequest.address.countryCode;
					shipmentRequestObj.customerDetails.receiverDetails.contactInformation.companyName	= _processShipmentRequest.address.addresse;
					shipmentRequestObj.customerDetails.receiverDetails.contactInformation.fullName		= _processShipmentRequest.address.addresse;
					//shipmentRequestObj.customerDetails.receiverDetails.contactInformation.email		= '';
					shipmentRequestObj.customerDetails.receiverDetails.contactInformation.phone			= _processShipmentRequest.address.phone;
					
					shipmentRequestObj.customerReferences.push(new _dhlReferenceObj(_processShipmentRequest.shippingReference));
					
					shipmentRequestObj.outputImageProperties.encodingFormat = _processShipmentRequest.configuration.labelFormat.toLowerCase();
					
					var shippingLabel = new _dhlImageOptionsObj();;
					shippingLabel.typeCode 		= 'label';
					shippingLabel.templateName	= 'ECOM26_A6_002';
					shipmentRequestObj.outputImageProperties.imageOptions.push(shippingLabel);
					
					shipmentRequestObj.content.unitOfMeasurement		= 'metric';
					shipmentRequestObj.content.incoterm					= 'DAP';
					shipmentRequestObj.content.description				= _processShipmentRequest.shippingReference;
					
					//Get count of packages from the incoming message
					//
					var packageCount = _processShipmentRequest.packages.length;
					
					//Loop through packages
					//
					for (var i = 0; i < packageCount; i++)
						{
							//Create a new package object
							//
							var packageObj = new _dhlPackageObj();
							
							//Populate the package details
							//
							packageObj.customerReferences.push(new _dhlReferenceObj(_processShipmentRequest.shippingReference));
							packageObj.weight 				= Number(_processShipmentRequest.packages[i].weight);
							packageObj.dimensions.length	= 15;
							packageObj.dimensions.width		= 15;
							packageObj.dimensions.height	= 40;
							
							//Push a new package object to the shipmentRequestObj
							//
							shipmentRequestObj.content.packages.push(packageObj);
						}
					
					if (shipmentRequestObj.customerDetails.receiverDetails.postalAddress.countryCode != 'GB')
						{
							shipmentRequestObj.content.isCustomsDeclarable = true;
							
							var commercialInvoice 			= new _dhlImageOptionsObj();
							commercialInvoice.invoiceType 	= 'commercial';
							commercialInvoice.templateName	= 'COMMERCIAL_INVOICE_P_10';
							commercialInvoice.isRequested	= true;
							commercialInvoice.typeCode		= 'invoice';
							shipmentRequestObj.outputImageProperties.imageOptions.push(commercialInvoice);
							
							shipmentRequestObj.content.exportDeclaration = {};
							shipmentRequestObj.content.exportDeclaration.lineItems = [];
							
							//Loop through line items
							for (var i = 0; i < _processShipmentRequest.itemDetails.length; i++)
								{
									var itemObj 						= new _dhlLineItemObj();
									itemObj.number 						= i+1;
									itemObj.description 				= _processShipmentRequest.itemDetails[0].itemDesc;
									itemObj.price						= _processShipmentRequest.itemDetails[0].itemUnitRate;
									itemObj.priceCurrency				= _processShipmentRequest.currencyISOCode;
									itemObj.quantity.value				= _processShipmentRequest.itemDetails[0].itemQty;
									itemObj.quantity.unitOfMeasurement	= 'BOX';
									itemObj.commodityCodes.push(new _dhlCommodityCodeObj('outbound', _processShipmentRequest.itemDetails[0].itemCommodity));
									itemObj.exportReasonType			= 'permanent';
									itemObj.manufacturerCountry			= _processShipmentRequest.itemDetails[0].itemCountry;
									itemObj.weight.netValue				= Number(_processShipmentRequest.itemDetails[0].itemUnitWeight);
									itemObj.weight.grossValue			= Number(_processShipmentRequest.itemDetails[0].itemUnitWeight);
									
									shipmentRequestObj.content.exportDeclaration.lineItems.push(itemObj);
									
									declaredValue += _processShipmentRequest.itemDetails[0].itemValue;
								}
							
							shipmentRequestObj.content.exportDeclaration.invoice 				= {};
							shipmentRequestObj.content.exportDeclaration.invoice.number 		= _processShipmentRequest.shippingReference;
							shipmentRequestObj.content.exportDeclaration.invoice.date			= _processShipmentRequest.shippingDate;
							
							shipmentRequestObj.content.exportDeclaration.exportReason			= 'Sold To Receiver';
							shipmentRequestObj.content.exportDeclaration.placeOfIncoterm		= _processShipmentRequest.senderAddress.town;
							shipmentRequestObj.content.exportDeclaration.shipmentType			= 'commercial';
							
							shipmentRequestObj.content.declaredValue 			= declaredValue;
							shipmentRequestObj.content.declaredValueCurrency	= _processShipmentRequest.currencyISOCode;
							
							shipmentRequestObj.valueAddedServices.push(new _dhlValueAddedService('WY'));
							
							if (_processShipmentRequest.senderContact.vatNo)
								{
									shipmentRequestObj.customerDetails.shipperDetails.registrationNumbers.push(new _dhlRegistrationNumberObj(_processShipmentRequest.senderContact.vatNo, _processShipmentRequest.senderAddress.countryCode, 'VAT'));
								}
							
							if (_processShipmentRequest.senderContact.eori)
								{
									shipmentRequestObj.customerDetails.shipperDetails.registrationNumbers.push(new _dhlRegistrationNumberObj(_processShipmentRequest.senderContact.eori, _processShipmentRequest.senderAddress.countryCode, 'EOR'));
								}
						}
					else
						{
							shipmentRequestObj.content.isCustomsDeclarable = false;
						}
					
					log.debug({
						title: 'Shipment Request Obj',
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
					
					//Check the responseObject to see whether a success or error/failure message was returned
					//
					if (responseStatus == '201')
						{
							//Declare and initialize variables
							//
							var consignmentNumber 	= '';
							var shipmentId		 	= '';
							var message 			= '';
							
							//Get the consignment number
							//
							consignmentNumber = responseBodyObj.shipmentTrackingNumber;
									
							//Convert the UPS response object to the standard process shipments response object
							//
							processShipmentResponse = new BBSObjects.processShipmentResponse(responseStatus, null, consignmentNumber);
									
							//Get the package results
							//
							var packageResults = responseBodyObj.packages;
							
							//If we have an array of packages
							//
							if (packageResults.length > 0)
								{
									//Loop through packages
									//
									for (var i = 0; i < packageResults.length; i++)
										{
											//Get the tracking number, label image and label type
											//
											var trackingNumber = packageResults[i].trackingNumber;
											
											//If this is the first label
											//
											if (i == 0)
												{
													//Get the label from the documents array
													//
													var labelImage 	= responseBodyObj.documents[0].content;
													var labelType	= 'txt';
													
													// convert the label image to UTF-8 format
													labelImage = encode.convert({
														string: labelImage,
														inputEncoding: encode.Encoding.BASE_64,
														outputEncoding: encode.Encoding.UTF_8
													});
												}
											else
												{
													//Set the label image and type to null
													//
													var labelImage 	= '';
													var labelType	= '';
												}
												
											//Add packages to processShipmentResponse
											//
											processShipmentResponse.addPackage(i, trackingNumber, labelImage, labelType);
										}
								}
						}
					else
						{
							//Get the error message
							//
							var message = responseBodyObj.detail;
							
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

	//=========================================================================
	//DHL Specific Objects
	//=========================================================================
	//
	
	function _shipmentRequest()
		{
			this.plannedShippingDateAndTime 									= '';
			
			this.pickup 														= {};
			this.pickup.isRequested 											= '';
			
			this.productCode													= '';
			
			this.accounts														= [];
			
			this.customerDetails												= {};
			
			this.customerDetails.shipperDetails 								= {};
			this.customerDetails.shipperDetails.postalAddress					= {};
			this.customerDetails.shipperDetails.postalAddress.addressLine1		= '';
			//this.customerDetails.shipperDetails.postalAddress.addressLine2	= '';
			this.customerDetails.shipperDetails.postalAddress.cityName			= '';
			this.customerDetails.shipperDetails.postalAddress.postalCode		= '';
			this.customerDetails.shipperDetails.postalAddress.countryCode		= '';
			this.customerDetails.shipperDetails.contactInformation				= {};
			this.customerDetails.shipperDetails.contactInformation.companyName	= '';
			this.customerDetails.shipperDetails.contactInformation.fullName		= '';
			//this.customerDetails.shipperDetails.contactInformation.email		= '';
			this.customerDetails.shipperDetails.contactInformation.phone		= '';
			this.customerDetails.shipperDetails.registrationNumbers				= [];
			
			this.customerDetails.receiverDetails 								= {};
			this.customerDetails.receiverDetails.postalAddress					= {};
			this.customerDetails.receiverDetails.postalAddress.addressLine1		= '';
			//this.customerDetails.receiverDetails.postalAddress.addressLine2	= '';
			this.customerDetails.receiverDetails.postalAddress.cityName			= '';
			this.customerDetails.receiverDetails.postalAddress.postalCode		= '';
			this.customerDetails.receiverDetails.postalAddress.countryCode		= '';
			this.customerDetails.receiverDetails.contactInformation				= {};
			this.customerDetails.receiverDetails.contactInformation.companyName	= '';
			this.customerDetails.receiverDetails.contactInformation.fullName	= '';
			//this.customerDetails.receiverDetails.contactInformation.email		= '';
			this.customerDetails.receiverDetails.contactInformation.phone		= '';
			this.customerDetails.receiverDetails.registrationNumbers			= [];
			
			this.customerReferences												= [];
			
			this.outputImageProperties											= {};
			this.outputImageProperties.encodingFormat							= '';
			this.outputImageProperties.imageOptions								= [];
			
			this.valueAddedServices												= [];
			
			this.content														= {};
			this.content.unitOfMeasurement										= '';
			this.content.isCustomsDeclarable									= '';
			this.content.incoterm												= '';
			this.content.description											= '';
			this.content.packages												= [];
		}
	
	function _dhlAccountObj(_accountNumber, _accountType)
		{
			this.number 	= _accountNumber;
			this.typeCode	= _accountType;
		}
	
	function _dhlReferenceObj(_reference)
		{
			this.value	= _reference;
		}
	
	function _dhlImageOptionsObj()
		{
			this.typeCode 		= '';
			this.templateName 	= '';
		}
	
	function _dhlPackageObj()
		{
			this.customerReferences	= [];
			
			this.weight				= '';
			
			this.dimensions			= {};
			this.dimensions.length	= '';
			this.dimensions.width	= '';
			this.dimensions.height	= '';		
		}
	
	function _dhlLineItemObj()
		{
			this.number						= '';
			this.description				= '';
			this.price						= '';
			this.priceCurrency				= '';
			this.quantity					= {};
			this.quantity.value				= '';
			this.quantity.unitOfMeasurement	= '';
			this.commodityCodes				= [];
			this.exportReasonType			= '';
			this.manufacturerCountry		= '';
			this.weight						= {};
			this.weight.netValue			= '';
			this.weight.grossValue			= '';
		}
	
	function _dhlCommodityCodeObj(_typeCode, _value)
		{
			this.typeCode 	= _typeCode;
			this.value		= _value;
		}
	
	function _dhlValueAddedService(_serviceCode)
		{
			this.serviceCode = _serviceCode;
		}
	
	function _dhlRegistrationNumberObj(_number, _issuerCountryCode, _typeCode)
		{
			this.number				= _number;
			this.issuerCountryCode	= _issuerCountryCode;
			this.typeCode			= _typeCode;
		}

	//=========================================================================
	//Return functions that are available in this module 
	//=========================================================================
	//
   
	return 	{
        		carrierCommitShipments:		null,
        		carrierProcessShipments:	dhlShipmentRequest,
        		carrierCancelShipments:		null
    		};
    
});
