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
    		type: 'customrecord_bbstfc_config',
    		
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
    			// call function to return the ID for the Tax For Communications PCode Lookup UE script
    			var scriptID = getScriptID();
    			
    			try
    				{
    					// update fields on the config record
    					record.submitFields({
    						type: 'customrecord_bbstfc_config',
    						id: configRecordID,
    						values: {
    							custrecord_bbstfc_conf_pcl_script: scriptID
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
    
    function getScriptID() {
    	
    	// declare and initialize variables
    	var scriptID = null;
    	
    	// run search to find the script ID for the Tax For Communications PCode Lookup UE script
    	search.create({
    		type: search.Type.USEREVENT_SCRIPT,
    		
    		filters: [{
    			name: 'name',
    			operator: search.Operator.IS,
    			values: ['Tax For Communications PCode Lookup UE']
    		}],
    		
    		columns: [{
    			name: 'internalid'
    		}],
    		
    	}).run().each(function(result){
    		
    		// get the script ID from the search results
    		scriptID = result.getValue({
    			name: 'internalid'
    		});
    		
    	});
    	
    	return scriptID;
    	
    }
    
    return {
        afterInstall: afterInstall
    };
    
});
