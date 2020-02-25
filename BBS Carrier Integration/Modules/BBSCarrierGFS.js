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
			var commitShipmentResponse = {};
			
			//Convert incoming object into a GFS specific xml request
			//
			
			//Send the request to GFS
			//
			
			//Convert the GFS response to the standard commit shipments response object
			//
			commitShipmentResponse = new BBSObjects.commitShipmentResponse();
			
			//Return the response
			//
			return commitShipmentResponse;
		}
	
	//Function to send a shipment request to GFS
	//
	function gfsProcessShipments(_processShipmentRequest)
		{
			var processShipmentResponse = {};
			
			//Convert incoming object into a GFS specific xml request
			//
			
			//Send the request to GFS
			//
			
			//Convert the GFS response to the standard process shipments response object
			//
			processShipmentResponse = new BBSObjects.processShipmentResponse();
			
			//Return the response
			//
			return processShipmentResponse;
		}

	
	//Function to cancel a shipment from GFS
	//
	function gfsCancelShipments(_cancelShipmentRequest)
		{
			var cancelShipmentResponse = {};
			
			//Convert incoming object into a GFS specific xml request
			//
			
			//Send the request to GFS
			//
			
			//Convert the GFS response to the standard cancel shipments response object
			//
			commitShipmentResponse = new BBSObjects.cancelShipmentResponse();
			
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
