/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/search'],
/**
 * @param {search} search
 */
function(search) {
   
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
	    	var output 				= [];
	    	var employeeDetailsArr 	= {};
	    	
	    	
	    	var employeeSearchObj = getResults(search.create({
	    		   type: "employee",
	    		   filters:
	    		   [
	    		   ],
	    		   columns:
	    		   [
	    		      search.createColumn({name: "entityid", sort: search.Sort.ASC,label: "Name"}),
	    		      search.createColumn({name: "internalid", label: "Internal ID"})
	    		   ]
	    		}));
	    		
	    	if(employeeSearchObj != null && employeeSearchObj.length > 0)
	    		{
	    			for (var int = 0; int < employeeSearchObj.length; int++) 
		    			{
							var employeeName 	= employeeSearchObj[int].getValue({name: "entityid"});
							var employeeId 		= employeeSearchObj[int].getValue({name: "internalid"});
							
							var rows 		= {};
							rows['id']		= employeeId;
							rows['name']	= employeeName;
							
							output.push(rows);
						}
	    		}
	    	
	    	employeeDetailsArr['employeeLst'] 	= output;
	    	employeeDetailsArr['isValid'] 		= true;
	        
	        return employeeDetailsArr;
	    	
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
