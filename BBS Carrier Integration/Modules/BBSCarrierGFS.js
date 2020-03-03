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
	//Main functions - This module implements the integration to GFS
	//=========================================================================
	//
	
	//Function to commit the shipments to the GFS core systems at the end of day
	//
	function gfsCommitShipments(_commitShipmentRequest)
	{
		try
			{
				//Create a JSON object that represents the structure of the GFS specific request
				//
				var commitShipmentsRequestGFS = new _commitShipmentsRequestGFS();
				
				//Populate the object with the data from the incoming standard message
				//i.e. populate commitShipmentsRequestGFS with data from _commitShipmentRequest
				//
				
				commitShipmentsRequestGFS.RequestedCommitShipments.CarrierShipments.ManifestCopies 									= _commitShipmentRequest.manifestCopies;
				commitShipmentsRequestGFS.RequestedCommitShipments.CarrierShipments.PrintSpecification.MergeDocs 					= 'false';
				commitShipmentsRequestGFS.RequestedCommitShipments.CarrierShipments.PrintSpecification.PrintDocs 					= 'false';
				commitShipmentsRequestGFS.RequestedCommitShipments.CarrierShipments.PrintSpecification.ThermalPdf 					= 'false';
				commitShipmentsRequestGFS.RequestedCommitShipments.CarrierShipments.PrintSpecification.LabelSpecType 				= _commitShipmentRequest.manifestType;
				commitShipmentsRequestGFS.RequestedCommitShipments.CarrierShipments.CarrierServiceGroups.Carrier 					= _commitShipmentRequest.carrier;
				commitShipmentsRequestGFS.RequestedCommitShipments.CarrierShipments.CarrierServiceGroups.ServiceType 				= _commitShipmentRequest.serviceType;
				commitShipmentsRequestGFS.RequestedCommitShipments.CarrierShipments.AuthenticationDetails.VersionId.Major 			= _commitShipmentRequest.configuration.majorId;
				commitShipmentsRequestGFS.RequestedCommitShipments.CarrierShipments.AuthenticationDetails.VersionId.Minor 			= _commitShipmentRequest.configuration.minorId;
				commitShipmentsRequestGFS.RequestedCommitShipments.CarrierShipments.AuthenticationDetails.VersionId.Intermediate 	= _commitShipmentRequest.configuration.intermediateId;
				commitShipmentsRequestGFS.RequestedCommitShipments.CarrierShipments.AuthenticationDetails.UserID 					= _commitShipmentRequest.configuration.username;
				commitShipmentsRequestGFS.RequestedCommitShipments.CarrierShipments.AuthenticationDetails.UserPassword 				= _commitShipmentRequest.configuration.password;
				
				// Declare xmlRequest variable and set SOAP envelope
				var xmlRequest = '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:v5="http://justshoutgfs.com/Client/Ship/v5/"><SOAP-ENV:Body>';
				
				//Convert the gfs request object into xml
				//
				xmlRequest += BBSCommon.json2xml(commitShipmentsRequestGFS);
		
				//Add closing SOAP envelope tags
				//
				xmlRequest += '</SOAP-ENV:Body></SOAP-ENV:Envelope>';
		
				//Send the request to GFS
				//
				var xmlResponse = http.post({
				     							url: _commitShipmentRequest.configuration.url,
				     							body: xmlRequest
											});
				
				//Parse the xmlResponse string and convert it to XML
				//
				xmlResponse = xml.Parser.fromString({text: xmlResponse.body});
				
				//Convert the xml response back into a JSON object so that it is easier to manipulate
				//
				var responseObject = BBSCommon.xml2Json(xmlResponse);
				
				//Get the status of the response from the responseObject
				//
				var responseStatus = responseObject['soap:Envelope']['soap:Body']['ProcessedCommitShipments']['CommitShipmentsResult']['Status']['#text'];
				
				//Check the responseObject to see whether a success or error/failure message was returned
				//
				if (responseStatus == 'SUCCESS')
					{
						//Get the packages from the responseObject
						//
						var manifestImage = responseObject['soap:Envelope']['soap:Body']['ProcessedCommitShipments']['CommitShipmentsResult']['CarrierDocuments']['PrintDocument']['Image']['#text'];
						
						//Convert the GFS response object to the standard commit shipments response object
						//
						var commitShipmentResponse = new BBSObjects.commitShipmentResponse(responseStatus, '', manifestImage);
						
					}
				else if (responseStatus == 'ERROR' || responseStatus == 'FAILURE' || responseStatus == 'WARNING')
					{
						//Get the message from the responseObject
						//
						var responseMessage = responseObject['soap:Envelope']['soap:Body']['ProcessedCommitShipments']['CommitShipmentsResult']['CarrierDocuments']['ResponseDetails']['StatusMessage']['#text'];
					
						//Convert the GFS response object to the standard commit shipments response object
						//
						var commitShipmentResponse = new BBSObjects.commitShipmentResponse(responseStatus, responseMessage, null);	
					}
		
				//Return the response
				//
				return commitShipmentResponse;
			}
		catch(e)
			{
				//Set the shipment response using the error caught
				//
				var commitShipmentResponse = new BBSObjects.commitShipmentResponse('ERROR', e);
				
				//Return the response
				//
				return commitShipmentResponse;
			}
	}

	
	
	//Function to send a shipment request to GFS
	//
	function gfsProcessShipments(_processShipmentRequest)
		{
			try
				{		
					//Create a JSON object that represents the structure of the GFS specific request
					//
					var processShipmentRequestGFS = new _processShipmentRequestGFS(_processShipmentRequest);
					
					//Populate the object with the data from the incoming standard message
					//i.e. populate processShipmentRequestGFS with data from _processShipmentRequest
					//
					
					// Declare xmlRequest variable and set SOAP envelope
					var xmlRequest = '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><SOAP-ENV:Body xmlns:s0="http://justshoutgfs.com/Client/Ship/v5/" xmlns:s1="http://www.w3.org/2001/XMLSchema">';
					
					//Convert the gfs request object into xml. Add to xmlRequest variable
					//
					xmlRequest += BBSCommon.json2xml(processShipmentRequestGFS);
					
					//Fixup any missing bit of the xml e.g. xml namespaces and add envelope
					//
					xmlRequest = xmlRequest.replace('<v5:RequestedShipments>','<s0:RequestedShipments>');
					xmlRequest = xmlRequest.replace('<v5:ShipRequests>','<v5:ShipRequests xmlns:v5="http://justshoutgfs.com/Client/Ship/v5/">');
					xmlRequest = xmlRequest.replace('</v5:RequestedShipments>','</s0:RequestedShipments>');
					
					//Add closing SOAP envelope tags
					//
					xmlRequest += '</SOAP-ENV:Body></SOAP-ENV:Envelope>';
					
					//Send the request to GFS
					//
					var xmlResponse = http.post({
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
							
							// loop through packages
							for (var i=0; i < packages.length; i++)
								{
									// add packages to processShipmentResponse
									processShipmentResponse.addPackage(packages[i]['SequenceID']['#text'],packages[i]['PackageNo']['#text'],packages[i]['Labels']['Image']['#text'],packages[i]['Labels']['DocumentType']['#text']);
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
					var xmlRequest = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v5="http://justshoutgfs.com/Client/Ship/v5/"><soapenv:Body>';
					
					//Convert the gfs request object into xml. Add to xmlRequest variable
					//
					xmlRequest += BBSCommon.json2xml(cancelShipmentRequestGFS);
					
					//Add closing SOAP envelope tags
					//
					xmlRequest += '</soapenv:Body></soapenv:Envelope>';
					
					//Send the request to GFS
					//
					var xmlResponse = http.post({
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
	function _processShipmentRequestGFS(shippingRequestData)
		{
			this.RequestedShipments = {};
			this.RequestedShipments.ShipRequests = {};
			this.RequestedShipments.ShipRequests.AuthenticationDetails = {};
			this.RequestedShipments.ShipRequests.AuthenticationDetails.VersionId = {};
			this.RequestedShipments.ShipRequests.AuthenticationDetails.VersionId.Major = shippingRequestData.configuration.majorId;
			this.RequestedShipments.ShipRequests.AuthenticationDetails.VersionId.Minor = shippingRequestData.configuration.minorId;
			this.RequestedShipments.ShipRequests.AuthenticationDetails.VersionId.Intermediate = shippingRequestData.configuration.intermediateId;
			this.RequestedShipments.ShipRequests.AuthenticationDetails.UserID = shippingRequestData.configuration.username;
			this.RequestedShipments.ShipRequests.AuthenticationDetails.UserPassword = shippingRequestData.configuration.password;
			this.RequestedShipments.ShipRequests.Shipments = {};
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment = {};
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient = {};
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.SequenceId = '1';
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.ShipmentReference = shippingRequestData.shippingReference;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.ConsigneeReference = shippingRequestData.shippingReference;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact = {};
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.Company = shippingRequestData.address.addresse;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactAddress = {};
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactAddress.Street = shippingRequestData.address.line1;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactAddress.District = shippingRequestData.address.line2;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactAddress.County = shippingRequestData.address.county;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactAddress.Town = shippingRequestData.address.town;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactAddress.Postcode = shippingRequestData.address.postCode;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactAddress.CountryCode = shippingRequestData.address.countryCode;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactPerson = {};
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactPerson.PersonName = shippingRequestData.address.addresse;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactPerson.Mobile = shippingRequestData.contact.mobileNumber;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactPerson.E_Mail = shippingRequestData.contact.emailAddress;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment = {}
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.SaveNotValid = 'false';
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.DespatchDate = shippingRequestData.shippingDate;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.CarrierService = {};
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.CarrierService.ContractNo = shippingRequestData.shippingItemInfo.carrierContractNo;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.CarrierService.Carrier = shippingRequestData.shippingItemInfo.subCarrierCode;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.CarrierService.RouteMapCode = '';
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.CarrierService.ServiceCode = shippingRequestData.shippingItemInfo.serviceCode;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.SaturdayDeliv = 'false';
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.ConsolidateShipment = 'false';
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.Instructions = '';
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.TotalWeight = shippingRequestData.weight;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.Packs = shippingRequestData.packageCount;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.ShipmentID = '1';
			this.RequestedShipments.ShipRequests.PrintSpec = {};
			this.RequestedShipments.ShipRequests.PrintSpec.MergeDocs = 'false';
			this.RequestedShipments.ShipRequests.PrintSpec.PrintDocs = 'false';
			this.RequestedShipments.ShipRequests.PrintSpec.LabelPrinter = '';
			this.RequestedShipments.ShipRequests.PrintSpec.LabelSpecType = shippingRequestData.labelFormat;
		}
	
	function _commitShipmentsRequestGFS()
		{
			this.RequestedCommitShipments = {};
			this.RequestedCommitShipments.CarrierShipments = {};
			this.RequestedCommitShipments.CarrierShipments.ManifestCopies = '';
			this.RequestedCommitShipments.CarrierShipments.PrintSpecification = {};
			this.RequestedCommitShipments.CarrierShipments.PrintSpecification.MergeDocs = '';
			this.RequestedCommitShipments.CarrierShipments.PrintSpecification.PrintDocs = '';
			this.RequestedCommitShipments.CarrierShipments.PrintSpecification.ThermalPdf = '';
			this.RequestedCommitShipments.CarrierShipments.PrintSpecification.LabelSpecType = '';
			this.RequestedCommitShipments.CarrierShipments.AuthenticationDetails = {};
			this.RequestedCommitShipments.CarrierShipments.AuthenticationDetails.VersionId = {};
			this.RequestedCommitShipments.CarrierShipments.AuthenticationDetails.VersionId.Major = '';
			this.RequestedCommitShipments.CarrierShipments.AuthenticationDetails.VersionId.Minor = '';
			this.RequestedCommitShipments.CarrierShipments.AuthenticationDetails.VersionId.Intermediate = '';
			this.RequestedCommitShipments.CarrierShipments.AuthenticationDetails.UserID = '';
			this.RequestedCommitShipments.CarrierShipments.AuthenticationDetails.UserPassword = '';
			this.RequestedCommitShipments.CarrierShipments.CarrierServiceGroups = {};
			this.RequestedCommitShipments.CarrierShipments.CarrierServiceGroups.Carrier = '';
			this.RequestedCommitShipments.CarrierShipments.CarrierServiceGroups.ServiceType = '';
		}
		
	function _cancelShipmentRequestGFS(shippingRequestData)
		{
			this.RequestedDeleteShipments = {};
			this.RequestedDeleteShipments.Shipments = {};
			this.RequestedDeleteShipments.Shipments.AuthenticationDetails = {};
			this.RequestedDeleteShipments.Shipments.AuthenticationDetails.VersionId = {};
			this.RequestedDeleteShipments.Shipments.AuthenticationDetails.VersionId.Major = shippingRequestData.configuration.majorId;
			this.RequestedDeleteShipments.Shipments.AuthenticationDetails.VersionId.Minor = shippingRequestData.configuration.minorId;
			this.RequestedDeleteShipments.Shipments.AuthenticationDetails.VersionId.Intermediate = shippingRequestData.configuration.intermediateId;
			this.RequestedDeleteShipments.Shipments.AuthenticationDetails.UserID = shippingRequestData.configuration.username;
			this.RequestedDeleteShipments.Shipments.AuthenticationDetails.UserPassword = shippingRequestData.configuration.password;
			this.RequestedDeleteShipments.Shipments.RequestedShipments = {};
			this.RequestedDeleteShipments.Shipments.RequestedShipments.ConsignmentNo = shippingRequestData.consignmentNumber;
			this.RequestedDeleteShipments.Shipments.RequestedShipments.Carrier = shippingRequestData.carrier;
		}
	
	//=========================================================================
	//Return functions that are available in this module 
	//=========================================================================
	//
   return 	{
        		carrierCommitShipments:		gfsCommitShipments,
        		carrierProcessShipments:	gfsProcessShipments,
        		carrierCancelShipments:		gfsCancelShipments
    		};
    
});
