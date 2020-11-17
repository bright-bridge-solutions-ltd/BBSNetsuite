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
	//Main functions - This module implements the integration to GFS
	//=========================================================================
	//
	
	function pcCommitShipments(_commitShipmentRequest)
		{
		
		}
	
	//Function to send a shipment request to ProCarrier
	//
	function pcProcessShipments(_processShipmentRequest)
		{
			debugger;
			
			var headerObj 				= {};
			var responseStatus			= '';
			var responseBodyObj			= {};
			var processShipmentResponse	= {};
			
			try
				{		
					//Create a JSON object that represents the structure of the ProCarrier specific request
					//
					var processShipmentRequestPC = new _processShipmentRequestPC(_processShipmentRequest);
					
					//Populate the object with the data from the incoming standard message
					//i.e. populate processShipmentRequestPC with data from _processShipmentRequest
					//
					headerObj['Content-Type']		= 'text/json';
					
					//Send the request to ProCarrier
					//
					try
						{
							var response = https.post({	
														url:		_processShipmentRequest.configuration.url,
														headers:	headerObj,
														body:		JSON.stringify(processShipmentRequestPC)
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
							var consignmentNumber 	= '';
							var message 			= '';
							var errorLevel 			= '';
							var labelImage 			= '';
							var labelType			= '';
							
							//Get the Error Level
							//
							errorLevel 	= responseBodyObj.ErrorLevel;
							
							if(errorLevel != '10')	//Non fatal error
								{
									//Get the consignment number from the responseObject
									//
									consignmentNumber 	= responseBodyObj.Shipment.TrackingNumber;
										
									//Get the label image
									//
									labelImage = responseBodyObj.Shipment.LabelImage;
									
									//Get the label type
									//
									labelType = responseBodyObj.Shipment.LabelFormat;
									
									//Convert the ProCarrier response object to the standard process shipments response object
									//
									processShipmentResponse = new BBSObjects.processShipmentResponse(responseStatus, message, consignmentNumber);
									
									// add packages to processShipmentResponse
									processShipmentResponse.addPackage(1, consignmentNumber, labelImage, labelType);
								}
							else
								{
									message 	= responseBodyObj.Error;
									
									//Convert the ProCarrier response object to the standard process shipments response object
									//
									processShipmentResponse = new BBSObjects.processShipmentResponse(errorLevel, message, '');
								}
							
							
						}		
					else
						{
							processShipmentResponse = new BBSObjects.processShipmentResponse(responseStatus, '', '');
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

	
	//Function to cancel a shipment from GFS
	//
	function pcCancelShipments(_cancelShipmentRequest)
		{
			var headerObj 				= {};
			var responseStatus			= '';
			var responseBodyObj			= {};
			var cancelShipmentResponse	= {};
			
			try
				{
					//Create a JSON object that represents the structure of the GFS specific request
					//
					var cancelShipmentRequestPC = new _cancelShipmentRequestPC(_cancelShipmentRequest);
					
					//Populate the object with the data from the incoming standard message
					//
					headerObj['Content-Type']		= 'text/json';
					
					//Send the request to ProCarrier
					//
					try
						{
							var response = https.post({	
														url:		_cancelShipmentRequest.configuration.url,
														headers:	headerObj,
														body:		JSON.stringify(cancelShipmentRequestPC)
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
					
					if (responseStatus == '200')
						{
							var message 			= '';
							var errorLevel 			= '';
							var labelImage 			= '';
							var labelType			= '';
							
							//Get the Error Level
							//
							errorLevel 	= responseBodyObj.ErrorLevel;
							
							if(errorLevel != '10')	//Not a fatal error
								{
									
									//Convert the ProCarrier response object to the standard process shipments response object
									//
									cancelShipmentResponse = new BBSObjects.cancelShipmentResponse(responseStatus, null);
									
								
								}
							else
								{
									message 	= responseBodyObj.Error;
									
									//Convert the ProCarrier response object to the standard process shipments response object
									//
									cancelShipmentResponse = new BBSObjects.cancelShipmentResponse(errorLevel, message);
								}
							
							
						}		
					else
						{
							cancelShipmentResponse = new BBSObjects.cancelShipmentResponse(responseStatus, null);
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
	//ProCarrier Specific Objects
	//=========================================================================
	//
	function _processShipmentRequestPC(shippingRequestData)
		{
			this.Apikey 	= shippingRequestData.configuration.password;
			this.Command 	= 'OrderShipment';
			this.Shipment 	= {};
			this.Shipment.LabelOption 		= 'System';
			this.Shipment.LabelFormat 		= shippingRequestData.configuration.labelFormat;
			this.Shipment.TrackingNumber 	= '';
			this.Shipment.ShipperReference	= shippingRequestData.shippingReference;
			this.Shipment.DisplayId 		= shippingRequestData.shippingReference;
			this.Shipment.InvoiceNumber		= shippingRequestData.shippingReference;
			this.Shipment.Service			= shippingRequestData.shippingItemInfo.serviceCode;
			this.Shipment.SenderAddress		= {};
			this.Shipment.SenderAddress.Name				= shippingRequestData.senderAddress.addresse;
			this.Shipment.SenderAddress.Company				= shippingRequestData.address.addresse;
			this.Shipment.SenderAddress.AddressLine1		= shippingRequestData.address.line1;
			this.Shipment.SenderAddress.AddressLine2		= shippingRequestData.address.line2;
			this.Shipment.SenderAddress.AddressLine3		= '';
			this.Shipment.SenderAddress.City				= shippingRequestData.address.town;
			this.Shipment.SenderAddress.State				= shippingRequestData.address.county;
			this.Shipment.SenderAddress.Zip					= shippingRequestData.address.postCode;
			this.Shipment.SenderAddress.Country				= shippingRequestData.address.countryCode;
			this.Shipment.SenderAddress.Phone				= shippingRequestData.senderContact.mobileNumber;
			this.Shipment.SenderAddress.Email				= shippingRequestData.senderContact.emailAddress;
			this.Shipment.SenderAddress.Vat					= shippingRequestData.senderContact.vatNo;
			this.Shipment.SenderAddress.Eori				= shippingRequestData.senderContact.eori;
			this.Shipment.ConsigneeAddress	= {};
			this.Shipment.ConsigneeAddress.Name				= shippingRequestData.address.addresse;
			this.Shipment.ConsigneeAddress.Company			= shippingRequestData.address.addresse;
			this.Shipment.ConsigneeAddress.AddressLine1		= shippingRequestData.address.line1;
			this.Shipment.ConsigneeAddress.AddressLine2		= shippingRequestData.address.line2;
			this.Shipment.ConsigneeAddress.AddressLine3		= '';
			this.Shipment.ConsigneeAddress.City				= shippingRequestData.address.town;
			this.Shipment.ConsigneeAddress.State			= shippingRequestData.address.county;
			this.Shipment.ConsigneeAddress.Zip				= shippingRequestData.address.postCode;
			this.Shipment.ConsigneeAddress.Country			= shippingRequestData.address.countryCode;
			this.Shipment.ConsigneeAddress.Phone			= shippingRequestData.contact.mobileNumber;
			this.Shipment.ConsigneeAddress.Email			= shippingRequestData.contact.emailAddress;
			this.Shipment.ConsigneeAddress.Vat				= shippingRequestData.contact.vatNo;
			this.Shipment.ConsigneeAddress.PudoLocationId	= '';
			this.Shipment.Weight 			= shippingRequestData.weight;
			this.Shipment.WeightUnit		= 'kg';
			this.Shipment.Length 			= '1';
			this.Shipment.Width 			= '1';
			this.Shipment.Height 			= '1';
			this.Shipment.DimUnit 			= 'cm';
			this.Shipment.Value 			= '';
			this.Shipment.Currency 			= 'GBP';
			this.Shipment.CustomsDuty 		= 'DDU';
			this.Shipment.Description 		= 'Goods';
			this.Shipment.DeclarationType 	= 'SaleOfGoods';

			if(shippingRequestData.itemDetails != null && shippingRequestData.itemDetails.length > 0)
				{
					this.Shipment.Products 	= [];
					var totalValue			= Number(0);
					
					for (var int = 0; int < shippingRequestData.itemDetails.length; int++) 
						{
							var itemObj 			= {};
							itemObj.Description 	= shippingRequestData.itemDetails[int].itemDesc;
							itemObj.Sku 			= shippingRequestData.itemDetails[int].itemText;
							itemObj.HsCode 			= shippingRequestData.itemDetails[int].itemCommodity;
							itemObj.OriginCountry 	= shippingRequestData.itemDetails[int].itemCountry;
							itemObj.PurchaseUrl	 	= '';
							itemObj.Quantity 		= shippingRequestData.itemDetails[int].itemQty;
							itemObj.Value 			= shippingRequestData.itemDetails[int].itemValue;
							totalValue			   += Number(shippingRequestData.itemDetails[int].itemValue);
							
							this.Shipment.Products.push(itemObj);
						}
					
					this.Shipment.Value 			= totalValue;
				}
		}
	
	
	function _cancelShipmentRequestPC(shippingRequestData)
		{
			this.Apikey 	= shippingRequestData.configuration.password;
			this.Command 	= 'VoidShipment';
			this.Shipment 	= {};
			this.Shipment.TrackingNumber = shippingRequestData.consignmentNumber;
		}
	
	//=========================================================================
	//Return functions that are available in this module 
	//=========================================================================
	//
   return 	{
        		carrierCommitShipments:		pcCommitShipments,
        		carrierProcessShipments:	pcProcessShipments,
        		carrierCancelShipments:		pcCancelShipments
    		};
    
});
