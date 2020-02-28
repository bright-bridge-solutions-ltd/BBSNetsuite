define(['N/encode', 'N/format', 'N/https', 'N/record', 'N/runtime', 'N/search', 'N/xml',
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
function(encode, format, https, record, runtime, search, xml, BBSObjects, BBSCommon) 
{
	//=========================================================================
	//Main functions - This module implements the integration to GFS
	//=========================================================================
	//
	
	//Function to commit the shipments to the GFS core systems at the end of day
	//
	function gfsCommitShipments(_commitShipmentRequest)
		{
			//Create a JSON object that represents the structure of the GFS specific request
			//
			var commitShipmentsRequestGFS = new _commitShipmentsRequestGFS();
			
			//Populate the object with the data from the incoming standard message
			//i.e. populate commitShipmentsRequestGFS with data from _commitShipmentRequest
			//
			
			//TODO
			
			//Convert the gfs request object into xml
			//
			var xmlRequest = BBSCommon.json2xml(commitShipmentGFS);
			
			//Fixup any missing bit of the xml e.g. xml namespaces
			//
			
			//TODO
			
			//Send the request to GFS
			//
			var xmlResponse = 'something goes here to send the request to gfs';  //TODO call the web service
			
			//Convert the xml response back into a JSON object so that it is easier to manipulate
			//
			var responseObject = BBSCommon.xml2Json(xmlResponse);
			
			//Convert the GFS response object to the standard commit shipments response object
			//
			var commitShipmentResponse = new BBSObjects.commitShipmentResponse();	//TODO fill in parameters to this call etc,
			
			//Return the response
			//
			return commitShipmentResponse;
		}
	
	
	//Function to send a shipment request to GFS
	//
	function gfsProcessShipments(_processShipmentRequest)
		{
			//Create a JSON object that represents the structure of the GFS specific request
			//
			var processShipmentRequestGFS = new _processShipmentRequestGFS(_processShipmentRequest);
			
			//Return the response
			//
			return processShipmentRequestGFS;
			
			//Populate the object with the data from the incoming standard message
			//i.e. populate processShipmentRequestGFS with data from _processShipmentRequest
			//
			
			//TODO
			
			//Convert the gfs request object into xml
			//
			var xmlRequest = BBSCommon.json2xml(processShipmentRequestGFS);
			
			//Fixup any missing bit of the xml e.g. xml namespaces
			//
			
			//TODO
			
			//Send the request to GFS
			//
			var xmlResponse = 'something goes here to send the request to gfs';  //TODO call the web service
			
			//Convert the xml response back into a JSON object so that it is easier to manipulate
			//
			var responseObject = BBSCommon.xml2Json(xmlResponse);
			
			//Convert the GFS response object to the standard commit shipments response object
			//
			var processShipmentResponse = new BBSObjects.processShipmentResponse();	//TODO fill in parameters to this call etc,
			
			//Return the response
			//
			return processShipmentRequestGFS;
		}

	
	//Function to cancel a shipment from GFS
	//
	function gfsCancelShipments(_cancelShipmentRequest)
		{
			//Create a JSON object that represents the structure of the GFS specific request
			//
			var cancelShipmentRequestGFS = new _cancelShipmentRequestGFS();
			
			//Populate the object with the data from the incoming standard message
			//i.e. populate cancelShipmentRequestGFS with data from _cancelShipmentRequest
			//
			
			//TODO
			
			//Convert the gfs request object into xml
			//
			var xmlRequest = BBSCommon.json2xml(cancelShipmentRequestGFS);
			
			
			
			//Fixup any missing bit of the xml e.g. xml namespaces
			//
			
			//TODO
			
			//Send the request to GFS
			//
			var xmlResponse = 'something goes here to send the request to gfs';  //TODO call the web service
			
			//Convert the xml response back into a JSON object so that it is easier to manipulate
			//
			var responseObject = BBSCommon.xml2Json(xmlResponse);
			
			//Convert the GFS response object to the standard commit shipments response object
			//
			var cancelShipmentResponse = new BBSObjects.cancelShipmentResponse();	//TODO fill in parameters to this call etc,
			
			//Return the response
			//
			return cancelShipmentResponse;
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
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactAddress.Postcode = shippingRequestData.address.postcode;
			this.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactAddress.CountryCode = shippingRequestData.address.country;
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
			this.RequestedShipments.ShipRequests.PrintSpec.LabelSpecType = 'PDF';
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
		
	function _cancelShipmentRequestGFS()
		{
			this.RequestedDeleteShipments = {};
			this.RequestedDeleteShipments.Shipments = {};
			this.RequestedDeleteShipments.Shipments.AuthenticationDetails = {};
			this.RequestedDeleteShipments.Shipments.AuthenticationDetails.VersionId = {};
			this.RequestedDeleteShipments.Shipments.AuthenticationDetails.VersionId.Major = '';
			this.RequestedDeleteShipments.Shipments.AuthenticationDetails.VersionId.Minor = '';
			this.RequestedDeleteShipments.Shipments.AuthenticationDetails.VersionId.Intermediate = '';
			this.RequestedDeleteShipments.Shipments.AuthenticationDetails.UserID = '';
			this.RequestedDeleteShipments.Shipments.AuthenticationDetails.UserPassword = '';
			this.RequestedDeleteShipments.Shipments.RequestedShipments = {};
			this.RequestedDeleteShipments.Shipments.RequestedShipments.ConsignmentNo = '';
			this.RequestedDeleteShipments.Shipments.RequestedShipments.Carrier = '';
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
