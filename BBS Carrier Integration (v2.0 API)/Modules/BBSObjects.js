define(
function() 
{
	//=========================================================================
	//Top level objects
	//=========================================================================
	//
	
	//Object to hold the connection configuration
	//
	function _configuration(_primaryCarrier, _username, _passsword, _url, _majorId, _minorId, _intermediateId)
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
		}
	
	//Object to hold the basic carrier info, service codes & packaging codes
	//
	function _shippingItemInfo(_primaryCarrier, _packCodeReq, _name, _carrierCode, _carrierId)
		{
			//Constructor
			//
			this.primaryCarrier			= _primaryCarrier;
			this.packageCodeRequired	= _packCodeReq;
			this.subcarrierName			= _name;
			this.subCarrierCode			= _carrierCode;
			this.subCarrierCodeId		= _carrierId;
			this.serviceCodes 			= [];
			this.packageCodes			= [];
			
			//Method - add service codes
			//
			this.addServiceCode			= function (_serviceCode, _serviceDescription, _servicePalletParcel, _servicePalletParcelText)
				{
					this.serviceCodes.push(new serviceCodeObj(_serviceCode, _serviceDescription, _servicePalletParcel, _servicePalletParcelText));
				};
			
			//Method - add packaging codes
			//
			this.addPackageCode			= function (_packageCode, _packageDescription)
				{
					this.packageCodes.push(new packageCodeObj(_packageCode, _packageDescription));
				};
		}
	
	//=========================================================================
	//Lower level objects
	//=========================================================================
	//
	function serviceCodeObj(_serviceCode, _serviceDescription, _servicePalletParcel, _servicePalletParcelText)
		{
			this.serviceCode 				= _serviceCode;
			this.serviceDescription			= _serviceDescription;
			this.servicePalletParcel		= _servicePalletParcel;
			this.servicePalletParcelText	= _servicePalletParcelText;
		}
	
	function packageCodeObj(_packageCode, _packageDescription)
		{
			this.packageCode 				= _packageCode;
			this.packageDescription			= _packageDescription;
		}

	
	//=========================================================================
	//Return objects that are available in this module 
	//=========================================================================
	//
    return 	{
        		carrierConfiguration:		_configuration,
        		shippingItemInfo:			_shippingItemInfo
    		};
    
});
