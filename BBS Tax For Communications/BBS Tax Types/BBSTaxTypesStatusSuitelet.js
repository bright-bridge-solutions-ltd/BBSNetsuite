/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/runtime', 'N/search', 'N/ui/serverWidget', 'N/task', 'N/http', 'N/format'],
/**
 * @param {runtime} runtime
 * @param {search} search
 * @param {serverWidget} serverWidget
 */
function(runtime, search, serverWidget, task, http, format) 
{
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) 
	    {
	    	if (context.request.method === http.Method.GET) 
		    	{
	    		
	    		context.response.sendRedirect({
												type:			http.RedirectType.TASK_LINK,
												identifier:		'LIST_MAPREDUCESCRIPTSTATUS',
												parameters:		{
																scripttype:		getScriptId('customscript_bbstfc_taxtypes_mr'),
																primarykey:		''
																}
												});
		        }
	    }

    function getScriptId(_scriptName)
		{
			var scriptId = '';
			
	    	var scriptSearchObj = getResults(search.create({
	    		   type: "script",
	    		   filters:
	    		   [
	    		      ["scriptid","is",_scriptName]
	    		   ],
	    		   columns:
	    		   [
	    		      search.createColumn({
					    		         name: 	"name",
					    		         sort: 	search.Sort.ASC,
					    		         label: "Name"
	    		      					})
	    		   ]
	    		}));
			
	    	if(scriptSearchObj != null && scriptSearchObj.length > 0)
	    		{
	    			scriptId = scriptSearchObj[0].id;
	    		}
	    	
	    	return scriptId;
		}


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
        	onRequest: onRequest
    		};
    
});
