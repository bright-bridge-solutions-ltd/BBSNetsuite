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
 * @param {httpss} httpss
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 * @param {xml} xml
 * @param {BBSObjects} BBSObjects
 * @param {BBSCommon} BBSCommon
 */
function(encode, format, https, record, runtime, search, xml, BBSObjects, BBSCommon) 
{
	//==============================================================
	//Main functions - This module implements the integration to DX
	//==============================================================
	//
	
	//Function to send a shipment request to GFS
	//
	function dxCreateLabel(_processShipmentRequest)
		{
			try
				{		
					//Create a JSON object that represents the structure of the DX specific request
					//
					var processShipmentRequestDX = new _processShipmentRequestDX(_processShipmentRequest);
					
					//Populate the object with the data from the incoming standard message
					//i.e. populate processShipmentRequestGFS with data from _processShipmentRequest
					//
					
					// Declare xmlRequest variable and set SOAP envelope
					var xmlRequest = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v5="http://justshoutgfs.com/Client/Ship/v5/"><soapenv:Header/><soapenv:Body>';
					
					//Convert the gfs request object into xml. Add to xmlRequest variable
					//
					xmlRequest += BBSCommon.json2xml(processShipmentRequestGFS, '', 'v5:');
					
					//Add closing SOAP envelope tags
					//
					xmlRequest += '</soapenv:Body></soapenv:Envelope>';
					
					//Send the request to GFS
					//
					var xmlResponse = https.post({
					     url: _processShipmentRequest.configuration.url,
					     body: xmlRequest
					});
					
					//Parse the xmlResponse string and convert it to XML
					//
					xmlResponse = xml.Parser.fromString({
						text: xmlResponse.body
					});
					
					//Convert the xml response back into a JSON object so that it is easier to manipulate
					//
					var responseObject = BBSCommon.xml2Json(xmlResponse);
					
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
								
									//Convert the GFS response object to the standard process shipments response object
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

	
	//Function to cancel a shipment from GFS
	//
	function gfsCancelShipments(_cancelShipmentRequest)
		{
			try
				{
					//Create a JSON object that represents the structure of the GFS specific request
					//
					var cancelShipmentRequestGFS = new _cancelShipmentRequestGFS(_cancelShipmentRequest);
					
					//Populate the object with the data from the incoming standard message
					//i.e. populate cancelShipmentRequestGFS with data from _cancelShipmentRequest
					//
					
					// Declare xmlRequest variable and set SOAP envelope
					var xmlRequest = '<soapenv:Envelope xmlns:soapenv="https://schemas.xmlsoap.org/soap/envelope/" xmlns:v5="https://justshoutgfs.com/Client/Ship/v5/"><soapenv:Body>';
					
					//Convert the gfs request object into xml. Add to xmlRequest variable
					//
					xmlRequest += BBSCommon.json2xml(cancelShipmentRequestGFS, '', 'v5:');
					
					//Add closing SOAP envelope tags
					//
					xmlRequest += '</soapenv:Body></soapenv:Envelope>';
					
					//Send the request to GFS
					//
					var xmlResponse = https.post({
					     url: _cancelShipmentRequest.configuration.url,
					     body: xmlRequest
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
							//Convert the GFS response object to the standard commit shipments response object
							//
							var cancelShipmentResponse = new BBSObjects.cancelShipmentResponse(responseStatus, null);
						}
					else if (responseStatus == 'ERROR' || responseStatus == 'FAILURE')
						{
							//Get the error message from the responseObject
							var responseMessage = responseObject['soap:Envelope']['soap:Body']['ProcessedDeleteShipments']['DeleteShipmentsResult']['Shipments']['Status']['StatusDescription']['#text'];
							
							//Convert the GFS response object to the standard commit shipments response object
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
	//GFS Specific Objects
	//=========================================================================
	//
	function _processShipmentRequestDX(shippingRequestData)
		{
			this.createLabelRequest 															= {};
			
			this.createLabelRequest.serviceHeader 												= {};
			this.createLabelRequest.serviceHeader.userID 										= '';
			this.createLabelRequest.serviceHeader.password										= '';
			
			this.createLabelRequest.labelType 													= '';
			
			this.createLabelRequest.order 														= {};
			this.createLabelRequest.order.customerID 											= '';
			this.createLabelRequest.order.orderType												= 'cons';
			this.createLabelRequest.order.sourceSystem											= 'DXAPI';
			this.createLabelRequest.order.orderStatus											= {};
			this.createLabelRequest.order.orderStatus.attributeList								= [];
			this.createLabelRequest.order.dates													= {};
			this.createLabelRequest.order.date													= [];
			this.createLabelRequest.order.sourceSystemReference									= '';
			this.createLabelRequest.order.customerReference										= '';
			this.createLabelRequest.order.orderLines											= {};
			this.createLabelRequest.order.orderLines.consignment								= {};
			this.createLabelRequest.order.orderLines.consignment.pieces 						= {};
			this.createLabelRequest.order.orderLines.consignment.pieces.dimensions 				= [];
			this.createLabelRequest.order.orderLines.consignment.consignmentReferences 			= {};
			this.createLabelRequest.order.orderLines.consignment.consignmentReferences.name 	= '';
			this.createLabelRequest.order.orderLines.consignment.consignmentReferences.value 	= '';
			
			
		}
		
	function _cancelShipmentRequestDX(shippingRequestData)
		{
			
		}
	
	//=========================================================================
	//Return functions that are available in this module 
	//=========================================================================
	//
   return 	{
        		carrierCommitShipments:		null,
        		carrierProcessShipments:	dxCreateLabel,
        		carrierCancelShipments:		null
    		};
    
});
