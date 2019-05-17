/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/config', 'N/email', 'N/error', 'N/file', 'N/record', 'N/render', 'N/runtime', 'N/search', 'N/ui/dialog', 'N/ui/message', 'N/ui/serverWidget'],
/**
 * @param {log} log
 * @param {config} config
 * @param {email} email
 * @param {error} error
 * @param {file} file
 * @param {record} record
 * @param {render} render
 * @param {runtime} runtime
 * @param {search} search
 * @param {dialog} dialog
 * @param {message} message
 * @param {serverWidget} serverWidget
 */
function(log, config, email, error, file, record, render, runtime, search, dialog, message, serverWidget) 
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
    		if (context.request.method === 'GET') 
    			{
    				
    			}
    		else 
    			{
                	var request = context.request;
    			}
	    }

    return 
	    {
	        onRequest: onRequest
	    };
    
});

