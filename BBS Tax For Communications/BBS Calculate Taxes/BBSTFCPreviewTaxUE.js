/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */
define(['N/search'],
/**
 * @param {record} record
 * @param {search} search
 */
function(search)
	{
		/**
	     * Function definition to be triggered before record is loaded.
	     *
	     * @param {Object} scriptContext
	     * @param {Record} scriptContext.newRecord - New record
	     * @param {string} scriptContext.type - Trigger type
	     * @param {Form} scriptContext.form - Current form
	     * @Since 2015.2
	     */
	    function taxPreviewBL(scriptContext) 
		    {
				//Add in the calc tax preview button
	            //
	            if(scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
	            	{
		            	//Find the client script
		    			//
		    			var fileSearchObj = getResults(search.create({
													    			   type: 	"file",
													    			   filters:
																    			   [
																    			      ["name","is","BBSTFCPreviewTaxClient.js"]
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
		    		
		    			//Add the button to the form
		    			//
	            		scriptContext.form.addButton({
				                                    id:         	'custpage_bbstfc_calculate_tax',
				                                    label:         	'Preview AFC Tax',
				                                    functionName:  	'previewTax()'
				                                 });
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
	    
	    
		    return 	{
		    			beforeLoad:		taxPreviewBL
		    		};
	});
