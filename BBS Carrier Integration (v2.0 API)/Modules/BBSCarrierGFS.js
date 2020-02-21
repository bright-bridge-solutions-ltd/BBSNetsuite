define(['N/encode', 'N/format', 'N/https', 'N/record', 'N/runtime', 'N/search', 'N/xml'],
/**
 * @param {encode} encode
 * @param {format} format
 * @param {https} https
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 * @param {xml} xml
 */
function(encode, format, https, record, runtime, search, xml) 
{
	//Instance variables / properties
	//
	
	//Methods
	//
	function gfsCommitShipments()
		{
			var status = true;
		
			
			return status;
		}
	
	function gfsProcessShipments()
		{
		
		
		}

	function gfsDeleteShipments()
		{
		
		
		}

	function gfsPrintManifest()
		{
		
		
		
		}
	
	
	
	//Return functions
	//
    return 	{
        		carrierCommitShipments:		gfsCommitShipments,
        		carrierProcessShipments:	gfsProcessShipments,
        		carrierDeleteShipments:		gfsDeleteShipments,
        		carrierPrintManifest:		gfsPrintManifest
    		};
    
});
