/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget','N/http', 'N/search', 'N/record', 'N/runtime', 'N/redirect'],
/**
 * @param {ui} ui
 * @param {serverWidget} serverWidget
 */
function(serverWidget, http, search, record, runtime, redirect) 
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
    			var allowedDomain = '';
    		
    			//Get script parameters
    			//
    			var currentScript = runtime.getCurrentScript();
    		
    			//Find the integration record
    			//
    			var customrecord_bbs_comet_integrationSearchObj = getResults(search.create({
    				   type: 	"customrecord_bbs_comet_integration",
    				   filters:		[
    				           	 		["isinactive","is","F"]
    				           	 	],
    				   columns:
			    				   [
			    				      search.createColumn({name: "custrecord_bbs_comet_url", label: "SFTP Site URL Or IP Address"})
			    				   ]
    				}));
    			
    			if(customrecord_bbs_comet_integrationSearchObj != null && customrecord_bbs_comet_integrationSearchObj.length == 1)
    				{
    					allowedDomain = customrecord_bbs_comet_integrationSearchObj[0].getValue({name: "custrecord_bbs_comet_url"});
    				}

    			
	    		//Create a form
				//
	            var form = serverWidget.createForm({title: 'SFTP Site Credentials'});
	            
	            //Store the current stage in a field in the form so that it can be retrieved in the POST section of the code
				//
	            var passwordField = form.addCredentialField({
										                id: 					'custpage_password',
										                label: 					'SFTP Password',
										                restrictToDomains: 		allowedDomain,
										                restrictToCurrentUser: 	false,
										                restrictToScriptIds: 	'customscript_bbs_comet_ftp'
	            										});

	            //Add a submit button
	            //
	            form.addSubmitButton({
						                label: 'Save & Update Integration'
						            });
	            
	            //Return the form to the user
	            //
	            context.response.writePage(form);
	    	}
    	else
	    	{
	    		var request = context.request;
	    		var guid = request.parameters['custpage_password'];
	    		
	    		//Save the returned guid to a custom record to be retrieved later
	    		//
	    		
	    		var customrecord_bbs_comet_integrationSearchObj = getResults(search.create({
	    			   type: 	"customrecord_bbs_comet_integration",
	    			   filters:	[
	    			           	 ["isinactive","is","F"]
	    			           	 ],
	    			   columns:
	    			   [
	    			      search.createColumn({name: "name", sort: search.Sort.ASC, label: "Name"})
	    			   ]
	    			}));
	    			
	    		if(customrecord_bbs_comet_integrationSearchObj != null && customrecord_bbs_comet_integrationSearchObj.length == 1)
	    			{
	    				var integrationId = customrecord_bbs_comet_integrationSearchObj[0].id;
	    				
	    				//Update the integration record
	    				//
	    				try
	    					{
	    						record.submitFields({
	    											type:		'customrecord_bbs_comet_integration',
	    											id:			integrationId,
	    											values:		{
	    														'custrecord_bbs_comet_password': guid
	    														},
	    											options:	{
	    														ignoreMandatoryFields:	true
	    														}
	    											});
	    					}
	    				catch(err)
	    					{
	    						log.error({
	    									title: 'Error saving password token to configuration record',
	    									details: err
	    									});
	    					}
	    			}

	    		redirect.toTaskLink({
	    							id:	'CARD_-29'
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

    
    return {
        onRequest: onRequest
    };
    
});
