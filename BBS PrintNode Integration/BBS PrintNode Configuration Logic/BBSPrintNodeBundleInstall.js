/**
 * @NApiVersion 2.x
 * @NScriptType BundleInstallationScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
function(record, search) {
   
    /**
     * Executes before a bundle is installed for the first time in a target account.
     *
     * @param {Object} params
     * @param {number} params.version - Version of the bundle being installed
     *
     * @since 2016.1
     */
    function beforeInstall(params) {

    }

    /**
     * Executes after a bundle is installed for the first time in a target account.
     *
     * @param {Object} params
     * @param {number} params.version - Version of the bundle being installed
     *
     * @since 2016.1
     */
    function afterInstall(params) {
    	
    	// call function to update the config record
    	updateConfigRecord();

    }

    /**
     * Executes before a bundle in a target account is updated.
     *
     * @param {Object} params
     * @param {number} params.fromVersion - Version currently installed
     * @param {number} params.toVersion -  New version of the bundle being installed
     *
     * @since 2016.1
     */
    function beforeUpdate(params) {

    }

    /**
     * Executes after a bundle in a target account is updated.
     *
     * @param {Object} params
     * @param {number} params.fromVersion - Version currently installed
     * @param {number} params.toVersion -  New version of the bundle being installed
     *
     * @since 2016.1
     */
    function afterUpdate(params) {

    }

    /**
     * Executes before a bundle is uninstalled from a target account.
     *
     * @param {Object} params
     * @param {number} params.version - Version of the bundle being unistalled
     *
     * @since 2016.1
     */
    function beforeUninstall(params) {

    }
    
    function updateConfigRecord() {
    	
    	// declare and initialize variables
    	var configRecordID = null;
    	
    	// run search to find the config record to be updated
    	search.create({
    		type: 'customrecord_bbs_printnode_config',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		}],
    		
    		columns: [{
    			name: 'internalid'
    		}],
    	
    	}).run().each(function(result){
    		
    		// get the internal ID of the config record
    		configRecordID = result.getValue({
    			name: 'internalid'
    		});
    	});
    	
    	// if we have a config record ID
    	if (configRecordID)
    		{   			
    			try
    				{
    					// update fields on the config record
    					record.submitFields({
    										type: 		'customrecord_bbs_printnode_config',
    										id: 		configRecordID,
    										values: 	{
    													custrecord_bbs_printnode_conf_api_key:	null		//Remove api key
    													},
    										options:	{
    													ignoreMandatoryFields:				true
    													}
    					});
    					
    					log.audit({
    						title: 'Config Record Updated',
    						details: configRecordID
    					});
    				}
    			catch(e)
    				{
    					log.error({
    						title: 'Error Updating Config Record ' + configRecordID,
    						details: e
    					});
    				}
    		}
    	
    }
    
 
    return {
        	afterInstall: afterInstall
    		};
    
});
