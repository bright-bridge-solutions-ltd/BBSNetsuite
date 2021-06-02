/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search'],

function(search) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
    	
    	// check the record is being viewed
    	if (scriptContext.type == scriptContext.UserEventType.VIEW)
    		{
    		
	    		//Find the client script
				//
				var fileSearchObj = getResults(search.create({
	    			   type: 	"file",
	    			   filters:
	    			   [
	    			      ["name","is","BBSWaveLogicCL.js"]
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
						
						// add a button to the form and call a client script function when the button is clicked
		    			scriptContext.form.addButton({
								    				id: 			'custpage_print_docm',
								    				label: 			'Print DocM Picking List',
								    				functionName: 	'printDocm(' + scriptContext.newRecord.id + ')'
								    				});
					}
    			
    			
    		}

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
        beforeLoad: beforeLoad
    };
    
});
