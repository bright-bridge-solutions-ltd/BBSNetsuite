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
			var responseStatus			= '';
			var responseBodyObj			= {};
			var processShipmentResponse	= {};
			var totalWeight				= 0;
		
			try
				{				
					//Set the headers for the request
					//
					headerObj['Content-Type']			= 'text/json';
					headerObj['Accept']					= '*/*';
					//TODO
				
					//Create a JSON object that represents the structure of the DHL shipment request
					//
					var shipmentRequestObj = new _shipmentRequest();
					
					//Populate the object with the data from the incoming standard message
					//
					shipmentRequestObj.pickupAccount	= _processShipmentRequest.shippingItemInfo.carrierContractNo;
					shipmentRequestObj.dropoffType		= 'PICKUP';
					
					shipmentRequestObj.senderAddress.companyName	= _processShipmentRequest.senderAddress.addresse;
					shipmentRequestObj.senderAddress.address1		= _processShipmentRequest.senderAddress.line1;
					shipmentRequestObj.senderAddress.address2		= _processShipmentRequest.senderAddress.line2;
					shipmentRequestObj.senderAddress.city			= _processShipmentRequest.senderAddress.town;
					shipmentRequestObj.senderAddress.state			= _processShipmentRequest.senderAddress.county;
					shipmentRequestObj.senderAddress.postalCode		= _processShipmentRequest.senderAddress.postCode;
					shipmentRequestObj.senderAddress.country		= _processShipmentRequest.senderAddress.countryCode;
					shipmentRequestObj.senderAddress.phone			= _processShipmentRequest.senderAddress.phone;
					shipmentRequestObj.senderAddress.email			= ''; //TODO
					
					var shipmentObj = new _dhlShipmentObj();
					
					shipmentObj.consigneeAddress.companyName		= _processShipmentRequest.address.addresse;
					shipmentObj.consigneeAddress.address1			= _processShipmentRequest.address.line1;
					shipmentObj.consigneeAddress.address2			= _processShipmentRequest.address.line2;
					shipmentObj.consigneeAddress.city				= _processShipmentRequest.address.city;
					shipmentObj.consigneeAddress.state				= _processShipmentRequest.address.county;
					shipmentObj.consigneeAddress.postalCode			= _processShipmentRequest.address.postCode;
					shipmentObj.consigneeAddress.country			= _processShipmentRequest.address.countryCode;
					shipmentObj.consigneeAddress.phone				= _processShipmentRequest.address.phone;
					shipmentObj.consigneeAddress.email				= ''; // TODO
					
					shipmentObj.shipmentDetails.customerRef1		= _processShipmentRequest.shippingReference;
					shipmentObj.shipmentDetails.totalPieces			= _processShipmentRequest.packages.length;
					shipmentObj.shipmentDetails.carriageForward		= true;
					
					//Get count of packages from the incoming message
					//
					var packageCount = _processShipmentRequest.packages.length;
					
					//Loop through packages
					for (var i = 0; i < packageCount; i++)
						{
							//Add the package weight to the totalWeight variable
							//
							totalWeight += parseInt(_processShipmentRequest.packages[i].weight);
						
							//Push a new package object to the shipmentRequestObj
							//
							shipmentObj.pieces.push(new _dhlPackageObj(_processShipmentRequest.packages[i].weight))
						}
					
					shipmentObj.shipmentDetails.totalWeight	= totalWeight;
					
					shipmentRequestObj.shipments.push(shipmentObj);
					
					log.debug({
						title: 'Script Check',
						details: shipmentRequestObj
					});
					
					/*try
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
					if (responseStatus == '200')
						{
							//Declare and initialize variables
							//
							var consignmentNumber 	= '';
							var shipmentId		 	= '';
							var message 			= '';
							
							//Get the consignment number
							//
							consignmentNumber = responseBodyObj['ShipmentResponse']['ShipmentResults']['ShipmentIdentificationNumber'];
									
							//Convert the UPS response object to the standard process shipments response object
							//
							processShipmentResponse = new BBSObjects.processShipmentResponse(responseStatus, null, consignmentNumber);
									
							//Get the package results
							//
							var packageResults = responseBodyObj['ShipmentResponse']['ShipmentResults']['PackageResults'];
							
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
											var trackingNumber 	= packageResults[i].TrackingNumber;
											var labelImage		= packageResults[i].ShippingLabel.GraphicImage;
											var labelType		= 'txt';
													
											// convert the label image to UTF-8 format
											labelImage = encode.convert({
												string: labelImage,
												inputEncoding: encode.Encoding.BASE_64,
												outputEncoding: encode.Encoding.UTF_8
											});
												
											//Add packages to processShipmentResponse
											//
											processShipmentResponse.addPackage(0, trackingNumber, labelImage, labelType);
										}
								}
							else //We just have the one package returned
								{
									//Get the tracking number, label image and label type
									//
									var trackingNumber 	= packageResults.TrackingNumber;
									var labelImage		= packageResults.ShippingLabel.GraphicImage;
									var labelType		= 'txt';
											
									// convert the label image to UTF-8 format
									labelImage = encode.convert({
										string: labelImage,
										inputEncoding: encode.Encoding.BASE_64,
										outputEncoding: encode.Encoding.UTF_8
									});
											
									//Add packages to processShipmentResponse
									//
									processShipmentResponse.addPackage(0, trackingNumber, labelImage, labelType);										
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
					return processShipmentResponse;*/
					
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
			this.pickupAccount 	= '';
			this.dropoffType 	= '';
			
			this.senderAddress 				= {};
			this.senderAddress.companyName 	= '';
			this.senderAddress.address1		= '';
			this.senderAddress.address2		= '';
			this.senderAddress.city			= '';
			this.senderAddress.state 		= '';
			this.senderAddress.postalCode 	= '';
			this.senderAddress.country 		= '';
			this.senderAddress.phone 		= '';
			this.senderAddress.email 		= '';
			
			this.shipments = [];
		}
	
	function _dhlShipmentObj()
		{
			this.consigneeAddress 				= {};
			this.consigneeAddress.companyName	= '';
			this.consigneeAddress.address1 		= '';
			this.consigneeAddress.address2 		= '';
			this.consigneeAddress.city 			= '';
			this.consigneeAddress.state 		= '';
			this.consigneeAddress.postalCode 	= '';
			this.consigneeAddress.country		= '';
			this.consigneeAddress.phone 		= '';
			this.consigneeAddress.email 		= '';
			
			this.shipmentDetails 					= {};
			this.shipmentDetails.customerRef1		= '';
			this.shipmentDetails.totalPieces		= '';
			this.shipmentDetails.totalWeight		= '';
			this.shipmentDetails.carriageForward	= '';
			
			this.pieces = [];
		}
	
	function _dhlPackageObj(_packageWeight)
		{
			this.weight = _packageWeight;			
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
