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
var jsonObj = BBSCommon.xmlToJson(xmlObj.documentElement);


var a = {};

a.AuthenticationDetails = {};
a.AuthenticationDetails.VersionId = {};
a.AuthenticationDetails.VersionId.Major = '5';
a.AuthenticationDetails.VersionId.Minor = '0';
a.AuthenticationDetails.VersionId.Intermediate = '1';
a.AuthenticationDetails.UserID = 'cedric';
a.AuthenticationDetails.UserPassword = 'mypassword';

var RequestedShipment = {};
RequestedShipment.Recipient = 'aaa';
RequestedShipment.Shipment = 'ssssss';
RequestedShipment.Paypoint = 'ddddd';

a.Shipments = {};

a.Shipments.RequestedShipment = [];
a.Shipments.RequestedShipment[0] = RequestedShipment;
a.Shipments.RequestedShipment[1] = RequestedShipment;


var b = BBSCommon.json2xml(a, '') 


var z = '';


});
