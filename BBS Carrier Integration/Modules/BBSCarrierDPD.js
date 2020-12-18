/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/encode', 'N/format', 'N/http', 'N/record', 'N/runtime', 'N/search', 'N/xml', 'N/cache',
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
function(encode, format, http, record, runtime, search, xml, BBSObjects, BBSCommon) 
{
	//=========================================================================
	//Main functions - This module implements the integration to FedEx
	//=========================================================================
	//
	
	const CACHE_NAME	= 'DPD';
	const CACHE_KEY		= 'DPD_GEO_SESSION';
	const CACHE_TTL		= 36000;				//Ten hours
	var configObj		= {};
	
	//Function to commit the shipments to the DPD core systems at the end of day
	//
	function dpdCloseShipment(_commitShipmentRequest)
		{
	
		}

	
	
	//Function to send a shipment request to DPD
	//
	function dpdProcessShipments(_processShipmentRequest)
		{
			debugger;
			
			var headerObj 				= {};
			var responseStatus			= '';
			var responseBodyObj			= {};
			var processShipmentResponse	= {};
			
			try
				{		
					//Create a JSON object that represents the structure of the DPD specific request
					//
					var processShipmentRequestDPD = new _processShipmentRequestDP(_processShipmentRequest);
					
					log.debug({
								title: 'Shipment request',
								details: processShipmentRequestPC
							});
					
					//Populate the object with the data from the incoming standard message
					//i.e. populate processShipmentRequestDPD with data from _processShipmentRequest
					//
					headerObj['Content-Type']		= 'application/json';
					headerObj['Accept']				= 'application/json';
					headerObj['GeoSession']			= dpdGetGeoSession(_processShipmentRequest.configuration);
					
					//Send the request to DPD
					//
					try
						{
							var response = https.post({	
														url:		_processShipmentRequest.configuration.url,
														headers:	headerObj,
														body:		JSON.stringify(processShipmentRequestDPD)
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
							var consignmentNumber 	= '';
							var message 			= '';
							var errorLevel 			= '';
							var labelImage 			= '';
							var labelType			= '';
							
							//Get the Error Level
							//
							errorLevel 	= responseBodyObj.ErrorLevel;
							
							if(errorLevel != '10')	//Non fatal error
								{
									//Get the consignment number from the responseObject
									//
									consignmentNumber 	= responseBodyObj.Shipment.TrackingNumber;
										
									//Get the label image
									//
									labelImage = responseBodyObj.Shipment.LabelImage;
									
									//Get the label type
									//
									labelType = responseBodyObj.Shipment.LabelFormat;
									
									//Convert the ProCarrier response object to the standard process shipments response object
									//
									processShipmentResponse = new BBSObjects.processShipmentResponse(responseStatus, message, consignmentNumber);
									
									// add packages to processShipmentResponse
									processShipmentResponse.addPackage(1, consignmentNumber, labelImage, labelType);
								}
							else
								{
									message 	= responseBodyObj.Error;
									
									//Convert the ProCarrier response object to the standard process shipments response object
									//
									processShipmentResponse = new BBSObjects.processShipmentResponse(errorLevel, message, '');
								}
							
							
						}		
					else
						{
							processShipmentResponse = new BBSObjects.processShipmentResponse(responseStatus, '', '');
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

	
	//Function to cancel a shipment from DPD
	//
	function dpdCancelPickup(_cancelShipmentRequest)
		{

		}

	//Function to cancel a shipment from DPD
	//
	function dpdLogin(_loginRequest)
		{

		}

	
	//=========================================================================
	//Helper functions
	//=========================================================================
	//
	
	//See if we have a cached geo session, if not request a new one
	//
	function dpdGetGeoSession(configuration)
		{
			var dpdGeoSession = null;
			configObj = configuration;		//set the configObj variable (which has global scope) to be the passed in configuration
			
			//Get the cache instance or create one if it does not exist
			//
			var dpdCache = cache.getCache({
										    name:	CACHE_NAME,
										    scope: 	cache.Scope.PRIVATE
											});
			
			//Get the geosession from the cache, or create a new entry if the cache is empty or is new
			//
			dpdGeoSession = dpdCache.get({
											key:	CACHE_KEY,
											ttl:	CACHE_TTL,
											loader:	dpdLoader
										});
		}
	
	function dpdLoader(context)
		{
			//Get the username & password from the configuration 
			//
			var cacheDataObj			= {};
			var headerObj 				= {};
			var responseStatus			= '';
			var responseBodyObj			= {};
			var combinedCredentials 	= configObj.username + ':' + configObj.password;
			
			var authorisation 			= 'Basic ' + encode.convert({
																	string:			combinedCredentials,
																	inputEncoding:	encode.Encoding.UTF_8,
																	outputEncoding:	encode.Encoding.BASE_64
																	});
			headerObj['Content-Type']	= 'application/json';
			headerObj['Accept']			= 'application/json';
			headerObj['Authorization']	= authorisation;
			
			
			try
				{
					//Attempt to login
					//
					var response = https.post({	
												url:		configObj.url + 'user?action=login',
												headers:	headerObj,
												body:		''
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
									responseBodyObj 		= JSON.parse(response.body);
									cacheDataObj[CACHE_KEY] = responseBodyObj.data.geoSession;
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
			
			//Return the data to add to the cache
			//
			return cacheDataObj;
		}
	
	//=========================================================================
	//DPD Specific Objects
	//=========================================================================
	//
	function _closeShipmentRequestDPD()
		{

		}
	
	function _deleteShipmentRequestDPD()
		{
			
		}
	
	function _processShipmentRequestDPD(_processShipmentRequest)
		{
			this.jobId						= null;
			this.collectionOnDelivery		= false;
			this.invoice					= null;
			this.collectionDate				= "2020-12-12T09:00:00";
			this.consolidate				= false;
			this.consignment				= [
			{
			"consignmentNumber": null,
			"consignmentRef": null,
			"parcel": [],
			"collectionDetails": {
								"contactDetails": 	{
													"contactName": "My Contact",
													"telephone": "0121 500 2500"
													},
								"address": 			{
													"organisation": "DPD Group Ltd",
													"countryCode": "GB",
													"postcode": "B66 1BY",
													"street": "Roebuck Lane",
													"locality": "Smethwick",
													"town": "Birmingham",
													"county": "West Midlands"
													}
								},
			"deliveryDetails": {
								"contactDetails": {
													"contactName": "My Contact",
													"telephone": "0121 500 2500"
													},
								"address": 			{
													"organisation": "DPD Group Ltd",
													"countryCode": "GB",
													"postcode": "B66 1BY",
													"street": "Roebuck Lane",
													"locality": "Smethwick",
													"town": "Birmingham",
													"county": "West Midlands"
													},
								"notificationDetails": {
													"email": "my.email@dpdgroup.co.uk",
													"mobile": "07921000001"
													}
								},
			"networkCode": "1^12",
			"numberOfParcels": 2,
			"totalWeight": 5,
			"shippingRef1": "My Ref 1",
			"shippingRef2": "My Ref 2",
			"shippingRef3": "My Ref 3",
			"customsValue": null,
			"deliveryInstructions": "Please deliver with neighbour",
			"parcelDescription": "",
			"liabilityValue": null,
			"liability": false
			}
			]
		}
	
	
	//=========================================================================
	//Return functions that are available in this module 
	//=========================================================================
	//
   return 	{
        		carrierCommitShipments:		dpdCloseShipment,
        		carrierProcessShipments:	dpdProcessShipments,
        		carrierCancelShipments:		dpdCancelPickup,
        		carrierAuthenticate:		dpdLogin
    		};
    
});
