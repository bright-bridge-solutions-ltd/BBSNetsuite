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
    		var lineData = context.request.parameters['linedata'];
    	
    		var resultObj = {};
    		resultObj.message = '';
    		resultObj.taxTotal = '222.33';
    		
    		context.response.write(JSON.stringify(resultObj));
    		
    		/*
	    	var  tfcPlugin = plugin.loadImplementation({
														type: 'customscript_bbstfc_plugin'
														});
	    	
			if(tfcPlugin != null)
				{
					switch(paramRequestType)
						{
							case 'H':	//Health Check
								var healthCheckResult = tfcPlugin.getHealthCheck();
								
								context.response.write(JSON.stringify(healthCheckResult));
								
								break;
								
							case 'S':	//Service Info
								
								var serviceInfoResult = tfcPlugin.getServiceInfo();
								
								context.response.write(JSON.stringify(serviceInfoResult));
								
								break;
						}
				}
			else
				{
					context.response.write('API Health Check', 'Error : No plugin found');
				}
				*/
	    }

    return {
        	onRequest: onRequest
    		};
    
});
