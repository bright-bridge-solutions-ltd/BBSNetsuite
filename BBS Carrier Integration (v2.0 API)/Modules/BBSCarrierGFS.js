define(['N/encode', 'N/format', 'N/https', 'N/record', 'N/runtime', 'N/search', 'N/xml',
        '/SuiteScripts/BBS Carrier Integration/Modules/BBSObjects',
        '/SuiteScripts/BBS Carrier Integration/Modules/BBSCommon'],
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
	function gfsCommitShipments()
		{
			var status = true;
		
			
			return status;
		}
	
	//Function to send a shipment request to GFS
	//
	function gfsProcessShipments()
		{
		
		
		}

	
	//Function to delete a shipment from GFS
	//
	function gfsDeleteShipments()
		{
		
		
		}

	
	//Function to get a copy of the current manifest
	//
	function gfsPrintManifest()
		{
		
		
		
		}
	
	
	//=========================================================================
	//Helper functions
	//=========================================================================
	//
	
	
	//=========================================================================
	//Return functions that are available in this module 
	//=========================================================================
	//
   return 	{
        		carrierCommitShipments:		gfsCommitShipments,
        		carrierProcessShipments:	gfsProcessShipments,
        		carrierDeleteShipments:		gfsDeleteShipments,
        		carrierPrintManifest:		gfsPrintManifest
    		};
    
});
