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
	//Main functions - This module implements the integration to FedEx
	//=========================================================================
	//
	
	//Function to commit the shipments to the FedEx core systems at the end of day
	//
	function fedExCloseShipment(_commitShipmentRequest)
		{
	
		}

	
	
	//Function to send a shipment request to FedEx
	//
	function fedExProcessShipments(_processShipmentRequest)
		{

		}

	
	//Function to cancel a shipment from FedEx
	//
	function fedExCancelPickup(_cancelShipmentRequest)
		{

		}

	
	
	//=========================================================================
	//Helper functions
	//=========================================================================
	//
	
	
	//=========================================================================
	//FedEx Specific Objects
	//=========================================================================
	//
	function _closeShipmentRequestFedEx()
		{
			this.CloseWithDocumentsRequest = {};
			this.CloseWithDocumentsRequest.WebAuthenticationDetail = {};
			this.CloseWithDocumentsRequest.WebAuthenticationDetail.ParentCredential = {};
			this.CloseWithDocumentsRequest.WebAuthenticationDetail.ParentCredential.Key = '';	
			this.CloseWithDocumentsRequest.WebAuthenticationDetail.ParentCredential.Password = '';
			
			this.CloseWithDocumentsRequest.WebAuthenticationDetail.UserCredential = {};
			this.CloseWithDocumentsRequest.WebAuthenticationDetail.UserCredential.Key = '';
			this.CloseWithDocumentsRequest.WebAuthenticationDetail.UserCredential.Password = '';
			
			this.CloseWithDocumentsRequest.ClientDetail = {};
			this.CloseWithDocumentsRequest.ClientDetail.AccountNumber = '';	
			this.CloseWithDocumentsRequest.ClientDetail.MeterNumber = '';
			
			this.CloseWithDocumentsRequest.ClientDetail.Localization = {};
			this.CloseWithDocumentsRequest.ClientDetail.Localization.LanguageCode = '';	
			this.CloseWithDocumentsRequest.ClientDetail.Localization.LocaleCode = '';
			
			this.CloseWithDocumentsRequest.TransactionDetail = {};
			this.CloseWithDocumentsRequest.TransactionDetail.CustomerTransactionId = 'CloseWithDocumentsRequest_v5';
			
			this.CloseWithDocumentsRequest.TransactionDetail.Localization = {};
			this.CloseWithDocumentsRequest.TransactionDetail.Localization.LanguageCode = '';	
			this.CloseWithDocumentsRequest.TransactionDetail.Localization.LocaleCode = '';
			
			this.CloseWithDocumentsRequest.Version = {};
			this.CloseWithDocumentsRequest.Version.ServiceId = 'clos';	
			this.CloseWithDocumentsRequest.Version.Major = '';	
			this.CloseWithDocumentsRequest.Version.Intermediate = '';	
			this.CloseWithDocumentsRequest.Version.Minor = '';
			
			this.CloseWithDocumentsRequest.ActionType = 'CLOSE';	
			
			this.CloseWithDocumentsRequest.ProcessingOptions = {};
			this.CloseWithDocumentsRequest.ProcessingOptions.Options = 'ERROR_IF_OPEN_SHIPMENTS_FOUND';	
			this.CloseWithDocumentsRequest.CarrierCode = 'FDXE';
			this.CloseWithDocumentsRequest.ReprintCloseDate = '';
			
			this.CloseWithDocumentsRequest.ManifestReferenceDetail = {};
			this.CloseWithDocumentsRequest.ManifestReferenceDetail.Type = 'CUSTOMER_REFERENCE';	
			this.CloseWithDocumentsRequest.ManifestReferenceDetail.Value = '';
			
			this.CloseWithDocumentsRequest.CloseDocumentSpecification = {};
			this.CloseWithDocumentsRequest.CloseDocumentSpecification.CloseDocumentTypes = 'MANIFEST';	
		}
	
	function _deleteShipmentRequestFedEx()
		{
			this.DeleteShipmentRequest = {};
			this.DeleteShipmentRequest.WebAuthenticationDetail = {};
			this.DeleteShipmentRequest.WebAuthenticationDetail.ParentCredential = {};
			this.DeleteShipmentRequest.WebAuthenticationDetail.ParentCredential.Key = '';	
			this.DeleteShipmentRequest.WebAuthenticationDetail.ParentCredential.Password = '';
			
			this.DeleteShipmentRequest.WebAuthenticationDetail.UserCredential = {};
			this.DeleteShipmentRequest.WebAuthenticationDetail.UserCredential.Key = '';	
			this.DeleteShipmentRequest.WebAuthenticationDetail.UserCredential.Password = '';
			
			this.DeleteShipmentRequest.ClientDetail = {};
			this.DeleteShipmentRequest.ClientDetail.AccountNumber = '';	
			this.DeleteShipmentRequest.ClientDetail.MeterNumber = '';	
			this.DeleteShipmentRequest.ClientDetail.IntegratorId = '';
			
			this.DeleteShipmentRequest.ClientDetail.Localization = {};
			this.DeleteShipmentRequest.ClientDetail.Localization.LanguageCode = '';	
			this.DeleteShipmentRequest.ClientDetail.Localization.LocaleCode = '';
			
			this.DeleteShipmentRequest.TransactionDetail = {};
			this.DeleteShipmentRequest.TransactionDetail.CustomerTransactionId = 'DeleteShipmentRequest_v23.1';
			
			this.DeleteShipmentRequest.Version = {};
			this.DeleteShipmentRequest.Version.ServiceId = 'ship';	
			this.DeleteShipmentRequest.Version.Major = '';	
			this.DeleteShipmentRequest.Version.Intermediate = '';
			this.DeleteShipmentRequest.Version.Minor = '';
			
			this.DeleteShipmentRequest.ShipTimestamp = '';	
			
			this.DeleteShipmentRequest.TrackingId = {};
			this.DeleteShipmentRequest.TrackingId.TrackingIdType = '';	
			this.DeleteShipmentRequest.TrackingId.FormId = '';	
			this.DeleteShipmentRequest.TrackingId.TrackingNumber = '';	
			
			this.DeleteShipmentRequest.DeletionControl = 'DELETE_ALL_PACKAGES';	
		}
	
	function _processShipmentRequestFedEx()
		{
			this.ProcessShipmentRequest = {};
			this.ProcessShipmentRequest.WebAuthenticationDetail = {};
			this.ProcessShipmentRequest.WebAuthenticationDetail.UserCredential = {};
			this.ProcessShipmentRequest.WebAuthenticationDetail.UserCredential.Key = '';
			this.ProcessShipmentRequest.WebAuthenticationDetail.UserCredential.Password = '';
			
			this.ProcessShipmentRequest.ClientDetail = {};
			this.ProcessShipmentRequest.ClientDetail.AccountNumber = '';	
			this.ProcessShipmentRequest.ClientDetail.MeterNumber = '';
			
			this.ProcessShipmentRequest.TransactionDetail = {};
			this.ProcessShipmentRequest.TransactionDetail.CustomerTransactionId =	'';
			
			this.ProcessShipmentRequest.Version = {};
			this.ProcessShipmentRequest.Version.ServiceId = 'ship';
			this.ProcessShipmentRequest.Version.Major = '';
			this.ProcessShipmentRequest.Version.Intermediate = '';
			this.ProcessShipmentRequest.Version.Minor = '';
			
			this.ProcessShipmentRequest.RequestedShipment = {};
			this.ProcessShipmentRequest.RequestedShipment.ShipTimestamp =	'';
			this.ProcessShipmentRequest.RequestedShipment.DropoffType = 'REGULAR_PICKUP';
			this.ProcessShipmentRequest.RequestedShipment.ServiceType =	'';
			this.ProcessShipmentRequest.RequestedShipment.PackagingType = 'YOUR_PACKAGING';
			
			this.ProcessShipmentRequest.RequestedShipment.TotalWeight = {};
			this.ProcessShipmentRequest.RequestedShipment.TotalWeight.Units = 'KG';
			this.ProcessShipmentRequest.RequestedShipment.TotalWeight.Value =	'';
			
			this.ProcessShipmentRequest.RequestedShipment.Shipper = {};
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Contact = {};
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Contact.PersonName =	'';
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Contact.CompanyName =	'';
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Contact.PhoneNumber =	'';
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Contact.EMailAddress = '';
			
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address = {};
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.StreetLines =	'';
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.StreetLines =	'';
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.City =	'';
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.StateOrProvinceCode =	'';
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.PostalCode =	'';
			this.ProcessShipmentRequest.RequestedShipment.Shipper.Address.CountryCode =	'';
			
			this.ProcessShipmentRequest.RequestedShipment.Recipient = {};
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Contact = {};
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Contact.PersonName =	'';
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Contact.CompanyName =	'';
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Contact.PhoneNumber =	'';
			
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address = {};
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.StreetLines =	'';
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.StreetLines =	'';
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.City =	'';
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.StateOrProvinceCode =	'';
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.PostalCode =	'';
			this.ProcessShipmentRequest.RequestedShipment.Recipient.Address.CountryCode =	'';
			
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment = {};
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment.PaymentType = 'SENDER';
			
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment.Payor = {};
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment.Payor.ResponsibleParty = {};
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment.Payor.ResponsibleParty.AccountNumber =	'';
			this.ProcessShipmentRequest.RequestedShipment.ShippingChargesPayment.Payor.ResponsibleParty.Contact =	'';
			
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification = {};
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification.LabelFormatType = 'COMMON2D';
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification.ImageType = '';
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification.LabelStockType =	'';
			this.ProcessShipmentRequest.RequestedShipment.LabelSpecification.LabelPrintingOrientation = 'TOP_EDGE_OF_TEXT_FIRST';
			
			this.ProcessShipmentRequest.RequestedShipment.RateRequestTypes = 'PREFERRED';
			
			this.ProcessShipmentRequest.RequestedShipment.MasterTrackingId = {};
			this.ProcessShipmentRequest.RequestedShipment.MasterTrackingId.TrackingNumber =	'';
			this.ProcessShipmentRequest.RequestedShipment.PackageCount = '';
			
			this.ProcessShipmentRequest.RequestedShipment.RequestedPackageLineItems = [];
			
			this.addLineItems = function (_sequenceNumber, _weightUnits, _weightValue, _dimensionsLength, _dimensionsWidth, _dimensionsHeight, _dimensionsUnits)
				{
					this.ProcessShipmentRequest.RequestedShipment.RequestedPackageLineItems.push(new _lineItemsFedEx(_sequenceNumber, _weightUnits, _weightValue, _dimensionsLength, _dimensionsWidth, _dimensionsHeight, _dimensionsUnits))
				}
		}
	
	function _lineItemsFedEx(_sequenceNumber, _weightUnits, _weightValue, _dimensionsLength, _dimensionsWidth, _dimensionsHeight, _dimensionsUnits)
		{
			this.SequenceNumber = _sequenceNumber;	
			
			this.Weight 			= {};
			this.Weight.Units 		= _weightUnits;
			this.Weight.Value 		= _weightValue;
			
			this.Dimensions 		= {};
			this.Dimensions.Length 	= _dimensionsLength;
			this.Dimensions.Width 	= _dimensionsWidth;
			this.Dimensions.Height 	= _dimensionsHeight;
			this.Dimensions.Units 	= _dimensionsUnits;
		}
	
	//=========================================================================
	//Return functions that are available in this module 
	//=========================================================================
	//
   return 	{
        		carrierCommitShipments:		fedExCloseShipment,
        		carrierProcessShipments:	fedExProcessShipments,
        		carrierCancelShipments:		fedExCancelPickup
    		};
    
});
