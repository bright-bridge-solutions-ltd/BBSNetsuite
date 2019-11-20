/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget','N/http'],
/**
 * @param {ui} ui
 * @param {serverWidget} serverWidget
 */
function(serverWidget, http) 
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
	    		//Create a form
				//
	            var form = serverWidget.createForm({
				                						title: 	'Credentials'
				            						});
	            
	            //Store the current stage in a field in the form so that it can be retrieved in the POST section of the code
				//
	            passwordField = form.addCredentialField({
										                id: 					'custpage_password',
										                label: 					'Password',
										                restrictToDomains: 		['tbgftp.hostedftp.com'],
										                restrictToCurrentUser: 	false,
										                restrictToScriptIds: 	'customscript_bbs_ftp_example'
	            										});

	            //Add a submit button
	            //
	            form.addSubmitButton({
						                label: 'Save'
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
	    		
	    		
				var dummy = '';
	    	}
    }

    return {
        onRequest: onRequest
    };
    
});
