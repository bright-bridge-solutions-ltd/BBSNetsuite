require([
         'N/record','N/search','N/xml',
         '/SuiteScripts/BBS Carrier Integration/Modules/BBSCarrierGFS',
         '/SuiteScripts/BBS Carrier Integration/Modules/BBSObjects',
         '/SuiteScripts/BBS Carrier Integration/Modules/BBSCommon'],
function(record, search, xml, BBSCarrierGFS, BBSObjects, BBSCommon)
{


var c = BBSCommon.lookupShippingItem(55);
var b = BBSCommon.getConfig(c.primaryCarrier);



var str = '<ProcessedShipments xmlns="http://justshoutgfs.com/Client/Ship/v5/"><ProcessShipmentsResult><ResponseStatus>SUCCESS</ResponseStatus><Shipments><ProcessedShipment><CarrService><ContractNo>123456</ContractNo><RouteMapCode/><Carrier>HERMES</Carrier><ServiceCode>NDAY</ServiceCode><Dropoff>REGULAR_PICKUP</Dropoff></CarrService><Consolidated>false</Consolidated><ShipmentStatus><Status>SUCCESS</Status><StatusDescription/></ShipmentStatus><Packages><ConsignmentNo>4120683000000600</ConsignmentNo><SequenceID>1</SequenceID><ItemID>1</ItemID><PackageNo>4120683000000600</PackageNo><Labels><SequenceID>1</SequenceID><Printed>false</Printed><NumberOfCopies>1</NumberOfCopies><DocumentType>PDF</DocumentType></Labels></Packages><Packages><ConsignmentNo>4120683000000600</ConsignmentNo><SequenceID>2</SequenceID><ItemID>2</ItemID><PackageNo>4120683000000709</PackageNo><Labels><SequenceID>1</SequenceID><Printed>false</Printed><NumberOfCopies>1</NumberOfCopies><DocumentType>PDF</DocumentType></Labels></Packages><ShipmentID>1</ShipmentID><ConsignmentNo>4120683000000600</ConsignmentNo></ProcessedShipment></Shipments></ProcessShipmentsResult></ProcessedShipments>';

var xmlObj = xml.Parser.fromString({text: str});
var jsonObj = BBSCommon.xml2Json(xmlObj.documentElement);

var a = {};

a.RequestedShipments = {};
a.RequestedShipments.ShipRequests = {};
a.RequestedShipments.ShipRequests.AuthenticationDetails = {};
a.RequestedShipments.ShipRequests.AuthenticationDetails.VersionId = {};
a.RequestedShipments.ShipRequests.AuthenticationDetails.VersionId.Major = '5';
a.RequestedShipments.ShipRequests.AuthenticationDetails.VersionId.Minor = '0';
a.RequestedShipments.ShipRequests.AuthenticationDetails.VersionId.Intermediate = '1';
a.RequestedShipments.ShipRequests.AuthenticationDetails.UserID = 'UKFLOOR';
a.RequestedShipments.ShipRequests.AuthenticationDetails.UserPassword = 'BRIGHT455';

a.RequestedShipments.ShipRequests.Shipments = {};
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment = {};
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient = {};
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.SequenceId = 1;
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.ShipmentReference = 'test';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.ConsigneeReference = '';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact = {};
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.Company = 'Peter Test';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactAddress = {};
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactAddress.Street = 'SOUTH STREET';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactAddress.District = '';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactAddress.County = 'WEST SUSSEX';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactAddress.Town = 'CHICHESTER';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactAddress.Postcode = 'LE10 3PG';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactAddress.CountryCode = 'GB';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactPerson = {};
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactPerson.PersonName = 'Fred Smith';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactPerson.Mobile = '';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Recipient.AddressAndContact.ContactPerson.E_Mail = '';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment = {}
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.SaveNotValid = 'false';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.DespatchDate = '2020-02-25';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.CarrierService = {};
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.CarrierService.ContractNo = '123456';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.CarrierService.Carrier = 'HERMES';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.CarrierService.RouteMapCode = '';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.CarrierService.ServiceCode = 'NDAY';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.SaturdayDeliv = 'false';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.ConsolidateShipment = 'false';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.Instructions = '';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.TotalWeight = '2';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.Packs = '2';
a.RequestedShipments.ShipRequests.Shipments.RequestedShipment.Shipment.ShipmentID = '1';
a.RequestedShipments.ShipRequests.PrintSpec = {};
a.RequestedShipments.ShipRequests.PrintSpec.MergeDocs = 'false';
a.RequestedShipments.ShipRequests.PrintSpec.PrintDocs = 'false';
a.RequestedShipments.ShipRequests.PrintSpec.LabelPrinter = '';
a.RequestedShipments.ShipRequests.PrintSpec.LabelSpecType = 'PDF';








var b = BBSCommon.json2xml(a, '') 
var z = '';


});
