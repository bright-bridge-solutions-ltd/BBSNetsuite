/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/url'],

function(url) {
   
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
		    		scriptContext.form.clientScriptFileId = 7650;
	    			
			    	scriptContext.form.addButton({
												id: 			'custpage_do_healthcheck',
												label: 			'API Health Check',
												functionName: 	'clientHealthCheck()'
												});
			    	
			    	scriptContext.form.addButton({
												id: 			'custpage_do_service_info',
												label: 			'Get Service Info',
												functionName: 	'clientServiceInfo()'
												});
			    }
	    }
 
    return 	{
        	beforeLoad: 	configurationBL
    		};
    
});
