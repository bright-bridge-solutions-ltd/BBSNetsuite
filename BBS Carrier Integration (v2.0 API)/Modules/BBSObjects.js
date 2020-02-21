define(
function() 
{
	function _configuration(_primaryCarrier, _username, _passsword, _url, _majorId, _minorId, _intermediateId)
		{
			this.primaryCarrier	= _primaryCarrier;
			this.username		= _username;
			this.password		= _passsword;
			this.url			= _url;
			this.majorId		= _majorId;
			this.minorId		= _minorId;
			this.intermediateId	= _intermediateId;
		}
	
	
	function _shippingItemInfo(_primaryCarrier, _packCodeReq, _name, _carrierCode, _carrierId)
		{
			this.primaryCarrier			= _primaryCarrier;
			this.packageCodeRequired	= _packCodeReq;
			this.subcarrierName			= _name;
			this.carrierCode			= _carrierCode;
			this.carrierCodeId			= _carrierId;
			this.serviceCodes 			= [];
			this.packageCodes			= [];
			
			this.addServiceCode			= function (_serviceCode, _serviceDescription, _servicePalletParcel, _servicePalletParcelText)
				{
					this.serviceCodes.push(new serviceCodeObj(_serviceCode, _serviceDescription, _servicePalletParcel, _servicePalletParcelText));
				};
		}
	
	function serviceCodeObj(_serviceCode, _serviceDescription, _servicePalletParcel, _servicePalletParcelText)
		{
			this.serviceCode 				= _serviceCode;
			this.serviceDesacription		= _serviceDescription;
			this.servicePalletParcel		= _servicePalletParcel;
			this.servicePalletParcelText	= _servicePalletParcelText;
		}
	
	
	//Return functions
	//
    return 	{
        		carrierConfiguration:		_configuration,
        		shippingItemInfo:			_shippingItemInfo
    		};
    
});
