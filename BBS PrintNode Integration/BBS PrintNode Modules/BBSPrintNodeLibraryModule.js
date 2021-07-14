/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/record', 'N/config', 'N/runtime', 'N/search', 'N/plugin', 'N/format', 'N/xml', 'N/https'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, config, runtime, search, plugin, format, oauth, secret, xml, https) 
{

	//=====================================================================
	//Objects
	//=====================================================================
	//
	
		
	//Internal api configuration object
	//
	function libConfigObj()
		{
			this.apiKey				 		= '';
			this.endpointDoPing				= '';
			this.endpointGetPrinters		= '';
			this.endpointGetComputers		= '';
			this.endpointWhoAmI				= '';
			this.endpointPrintJob			= '';
			this.credentialsEncoded			= '';
			this.adScriptId					= '';
			this.adDeploymentId				= '';
			this.labelFileType				= '';
		}
	
	//Generic response from api object
	//
	function libGenericResponseObj()
		{
			this.httpResponseCode	= '';
			this.responseMessage 	= '';
			this.apiResponse		= {};
		}
		
	
	//Print request object
	//
	function libPrintRequestObj()
		{
			this.printerId		= '';
			this.title			= '';
			this.contentType	= '';	//pdf_uri, pdf_base64, raw_uri or raw_base64
			this.content		= '';
			this.source			= '';
			this.qty			= 1;	//print quantity
		}
		
	//=====================================================================
	//Methods
	//=====================================================================
	//
	
	
	
	
	//=====================================================================
	//Helper Functions
	//=====================================================================
	//
	
	//Page through results set from search
    //
    function getResults(_searchObject)
	    {
	    	var results = [];
	
	    	var pageData = _searchObject.runPaged({pageSize: 1000});
	
	    	for (var int = 0; int < pageData.pageRanges.length; int++) 
	    		{
	    			var searchPage = pageData.fetch({index: int});
	    			var data = searchPage.data;
	    			
	    			results = results.concat(data);
	    		}
	
	    	return results;
	    }


    
    return {
    		libConfigObj:					libConfigObj,
    		libGenericResponseObj:			libGenericResponseObj,
    		libPrintRequestObj:				libPrintRequestObj
    		};
    
});
