/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/record'],
/**
 * @param {search} search
 */
function(record) {
   
    /**
     * Function called upon sending a GET request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.1
     */
    function doGet(requestParams) 
	    {
	    	
	    }

    /**
     * Function called upon sending a PUT request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPut(requestBody) 
	    {
	
	    }


    /**
     * Function called upon sending a POST request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPost(requestBody) 
	    {
    		
    		var dummyObject 	= {};
	    	var params			= null;
	    	var assemblybuildId	= null;
	    	var impactedRecords	= null;
	    	var recordsData		= null;
	    	var auxEmp			= null;
	    	var standardFields	= null;
	    	var assignedValue	= null;
	    	
	    	try
				{
			    	log.error({title: "Request", details: requestBody});
			    	
			    	if(requestBody.hasOwnProperty('params'))
			    		{
			    			params = requestBody.params;
			    			
			    			if(params.hasOwnProperty('impactedRecords'))
			    				{
			    					impactedRecords = params.impactedRecords;
			    				
					    			if(impactedRecords.hasOwnProperty('assemblybuild') && impactedRecords.assemblybuild.length > 0)
							    		{
					    					assemblybuildId = impactedRecords.assemblybuild[0];
							    		}
			    				}
			    			
			    			if(params.hasOwnProperty('recordsData'))
			    				{
			    					recordsData = params.recordsData;
			    				
					    			if(recordsData.hasOwnProperty('auxEmp'))
							    		{
					    					auxEmp = recordsData.auxEmp;
					    					
					    					if(auxEmp.hasOwnProperty('standardFields'))
									    		{
					    							standardFields = auxEmp.standardFields;
					    							
					    							if(standardFields.hasOwnProperty('woAssemblyenterQuantity_assignedToDropDown'))
											    		{
					    									assignedValue = standardFields.woAssemblyenterQuantity_assignedToDropDown.value;
					    									
					    									if(assemblybuildId != null && assignedValue != null)
					    										{
					    											try
					    												{
					    													record.submitFields({
					    																		type:		record.Type.ASSEMBLY_BUILD,
					    																		id:			assemblybuildId,
					    																		values:		{
					    																					custbody_fg_wo_assigned:	assignedValue
					    																					},
					    																		options:	{
					    																					ignoreMandatoryFields:		true,
					    																					enablesourcing:				false
					    																					}
					    													});
					    												}
					    											catch(err)
					    												{
					    													log.error({title: "error updating assembly build record id = " + assemblybuildId, details: err});
					    												}
					    										}
											    		}
									    		}
							    		}
			    				}
			    		}
				}
	    	catch(err)
	    		{
	    			log.error({title: "Error occured in restlet", details: err});
	    		}
	    	
	    	return dummyObject;
	    }

    /**
     * Function called upon sending a DELETE request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doDelete(requestParams) 
	    {
	
	    }

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
	        'get': 		doGet,
	        put: 		doPut,
	        post: 		doPost,
	        'delete': 	doDelete
    };
    
});
