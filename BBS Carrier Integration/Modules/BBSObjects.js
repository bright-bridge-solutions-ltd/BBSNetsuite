define(
function() 
{
	//=========================================================================
	//Top level objects
	//=========================================================================
	//
	
	//Object to hold the connection configuration
	//
	function _configuration(_primaryCarrier, _username, _passsword, _url, _majorId, _minorId, _intermediateId, _labelFormat)
		{
			//Constructor
			//
			this.primaryCarrier	= _primaryCarrier;
			this.username		= _username;
			this.password		= _passsword;
			this.url			= _url;
			this.majorId		= _majorId;
			this.minorId		= _minorId;
			this.intermediateId	= _intermediateId;
			this.labelFormat	= _labelFormat;
		}
	
	
	//Object to hold the basic carrier info, service codes & packaging codes
	//
	function _shippingItemInfo(_primaryCarrier, _primaryCarrierName, _packCodeReq, _name, _carrierCode, _carrierId, _carrierContractNo, _serviceCode, _meterNumber)
		{
			//Constructor
			//
			this.primaryCarrier			= _primaryCarrier;
			this.primaryCarrierName		= _primaryCarrierName;
			this.packageCodeRequired	= _packCodeReq;
			this.subcarrierName			= _name;
			this.subCarrierCode			= _carrierCode;
			this.subCarrierCodeId		= _carrierId;
			this.carrierContractNo		= _carrierContractNo;
			this.serviceCode 			= _serviceCode;
			this.meterNumber			= _meterNumber;
			this.serviceCodes 			= [];
			this.packageCodes			= [];
			
			//Method - add service codes
			//
			this.addServiceCode			= function (_serviceCode, _serviceDescription, _servicePalletParcel, _servicePalletParcelText)
				{
					this.serviceCodes.push(new _serviceCodeObj(_serviceCode, _serviceDescription, _servicePalletParcel, _servicePalletParcelText));
				};
			
			//Method - add packaging codes
			//
			this.addPackageCode			= function (_packageCode, _packageDescription)
				{
					this.packageCodes.push(new _packageCodeObj(_packageCode, _packageDescription));
				};
		}
	
	
	//Object to hold the request to create a shipment
	//
	function _processShipmentRequest(_configuration, _shippingItemInfo, _shippingReference, _address, _contact, _shippingDate, _weight, _packageCount, _isSaturday)
		{
			this.configuration		= _configuration;		//Configuration object
			this.shippingItemInfo	= _shippingItemInfo;	//Shipping info object
			this.shippingReference	= _shippingReference;
			this.shippingDate		= _shippingDate;
			this.weight				= _weight;
			this.packageCount		= _packageCount;
			this.address			= _address;				//Address object
			this.contact			= _contact;				//Contact object
			this.isSaturday			= _isSaturday;
		}
	
	
	//Object to hold the response from requesting a shipment
	//
	function _processShipmentResponse(_status, _message, _consignmentNumber)
		{
			//Constructor
			//
			this.status 				= _status;
			this.message				= _message;
			this.consignmentNumber		= _consignmentNumber;
			this.packages 				= [];
			
			//Methods
			//
			this.addPackage				= function (_sequence, _packageNumber, _labelImage, _labelType)
				{
					this.packages.push(new _packageObject(_sequence, _packageNumber, _labelImage, _labelType));
				};
		}
	
	
	//Object to hold the request to cancel a shipment
	//
	function _cancelShipmentRequest(_configuration, _consignmentNumber, _carrier)
		{
			//Constructor
			//
			this.configuration		= _configuration;
			this.consignmentNumber 	= _consignmentNumber;
			this.carrier			= _carrier;
		}
	
	
	//Object to hold the response from cancelling a shipment
	//
	function _cancelShipmentResponse(_status, _message)
		{
			//Constructor
			//
			this.status 	= _status;
			this.message	= _message;
		}

	
	//Object to hold the request to commit shipments
	//
	function _commitShipmentRequest(_configuration, _carrier, _serviceType, _manifestCopies, _manifestType)
		{
			this.configuration		= _configuration;
			this.carrier 			= _carrier;
			this.serviceType		= _serviceType;
			this.manifestCopies		= _manifestCopies;
			this.manifestType		= _manifestType;
		}


	//Object to hold the response from committing shipments
	//
	function _commitShipmentResponse(_status, _message, _manifest)
		{
			this.status 	= _status;
			this.message	= _message;
			this.manifest	= _manifest;
		}

	
	
	//=========================================================================
	//Lower level objects
	//=========================================================================
	//
	function _serviceCodeObj(_serviceCode, _serviceDescription, _servicePalletParcel, _servicePalletParcelText)
		{
			this.serviceCode 				= _serviceCode;
			this.serviceDescription			= _serviceDescription;
			this.servicePalletParcel		= _servicePalletParcel;
			this.servicePalletParcelText	= _servicePalletParcelText;
		}
	
	function _packageCodeObj(_packageCode, _packageDescription)
		{
			this.packageCode 				= _packageCode;
			this.packageDescription			= _packageDescription;
		}

	function _addressObject(_addresse, _line1, _line2, _town, _county, _postCode, _countryCode)
		{
			this.addresse		= _addresse;
			this.line1			= _line1;
			this.line2			= _line2;
			this.town			= _town;
			this.county			= _county;
			this.postCode		= _postCode;
			this.countryCode	= _countryCode;
		}
	
	function _contactObject(_mobileNumber, _emailaddress)
		{
			this.mobileNumber 	= _mobileNumber;
			this.emailAddress	= _emailaddress;
		}
	
	function _packageObject(_sequence, _packageNumber, _labelImage, _labelType)
		{
			this.sequence		= _sequence;
			this.packageNumber	= _packageNumber;
			this.labelImage		= _labelImage;
			this.labelType		= _labelType;
		}
	
	
	//=========================================================================
	//Return objects that are available in this module 
	//=========================================================================
	//
    return 	{
        		carrierConfiguration:		_configuration,
        		shippingItemInfo:			_shippingItemInfo,
        		cancelShipmentRequest:		_cancelShipmentRequest,
        		cancelShipmentResponse:		_cancelShipmentResponse,
        		commitShipmentRequest:		_commitShipmentRequest,
        		commitShipmentResponse:		_commitShipmentResponse,
        		processShipmentRequest:		_processShipmentRequest,
        		processShipmentResponse:	_processShipmentResponse,
        		addressObject:				_addressObject,
        		contactObject:				_contactObject
    		};
    
});
