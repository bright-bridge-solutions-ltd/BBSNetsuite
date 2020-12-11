/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */
define(['N/url', 'N/search'],

function(url, search) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function configurationBL(scriptContext) 
	    {
	    	if (scriptContext.type == 'view')
				{
	    			//Find the client script
	    			//
	    			var fileSearchObj = getResults(search.create({
		    			   type: 	"file",
		    			   filters:
		    			   [
		    			      ["name","is","BBSPrintNodeConfigurationClient.js"]
		    			   ],
		    			   columns:
		    			   [
		    			      search.createColumn({
							    			    	 name: "name",
							    			         sort: search.Sort.ASC,
							    			         label: "Name"
		    			      })
		    			   ]
		    			}));
	    			
	    			//Add the client side file to the form
	    			//
	    			if(fileSearchObj != null && fileSearchObj.length > 0)
	    				{
	    					scriptContext.form.clientScriptFileId = fileSearchObj[0].id;
	    				}
		    		
	    		
		    		//Add buttons to test the api
		    		//
			    	scriptContext.form.addButton({
												id: 			'custpage_do_pig',
												label: 			'API Ping',
												functionName: 	'clientPing()'
												});
			    	
			    	scriptContext.form.addButton({
												id: 			'custpage_do_account_info',
												label: 			'Get Account Info',
												functionName: 	'clientAccountInfo()'
												});
			    }
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

    
    return 	{
        	beforeLoad: 	configurationBL
    		};
    
});
