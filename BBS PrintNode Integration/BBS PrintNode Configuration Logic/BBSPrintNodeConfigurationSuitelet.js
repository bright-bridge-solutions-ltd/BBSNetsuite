/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/plugin'],
/**
 * @param {plugin} plugin
 */
function(plugin) {
   
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
    		var paramRequestType = context.request.parameters['requesttype'];
    	
	    	var  pnPlugin = plugin.loadImplementation({
														type: 'customscript_bbs_printnode_plugin'
														});
	    	
			if(pnPlugin != null)
				{
					switch(paramRequestType)
						{
							case 'P':	//Ping
								var pingResult = pnPlugin.doPing();
								
								context.response.write(JSON.stringify(pingResult));
								
								break;
								
							case 'A':	//Account Info
								
								var accountInfoResult = pnPlugin.getAccountInfo();
								
								context.response.write(JSON.stringify(accountInfoResult));
								
								break;
						}
				}
			else
				{
					context.response.write('API Call', 'Error : No plugin found');
				}
	    }

    return {
        	onRequest: onRequest
    		};
    
});
