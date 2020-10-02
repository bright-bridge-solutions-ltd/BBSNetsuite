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
    	
    	// declare and initialize variables
    	var taxItemID = null;
    	
    	// call function to create a new vendor ID
    	var vendorID = createVendor();
    	
    	// if we have been able to create a vendor
    	if (vendorID)
    		{
    			// call function to create a new tax item
    			taxItemID = createTaxItem(vendorID);   			
    		}
    	
    	// call function to update the config record
    	updateConfigRecord(taxItemID);

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
    
    /*
     * HELPER FUNCTIONS
     */
    
    function createVendor() {
    	
    	// declare and initialize variables
    	var vendorID = null;
    	
    	try
    		{
    			// create a new vendor record
    			var vendorRec = record.create({
    				type: record.Type.VENDOR
    			});
    			
    			vendorRec.setValue({
    				fieldId: 'companyname',
    				value: 'Avalara'
    			});
    			
    			vendorRec.setValue({
    				fieldId: 'subsidiary',
    				value: 1
    			});
    			
    			vendorRec.setValue({
    				fieldId: 'category',
    				value: 3 // 3 = Tax Agency
    			});
    			
    			vendorID = vendorRec.save({
    				ignoreMandatoryFields: true
    			});
    			
    			log.audit({
    				title: 'Vendor Record Created',
    				details: vendorID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Creating Vendor Record',
    				details: e
    			});
    		}
    	
    	return vendorID;   	
    	
    }
    
    function createTaxItem(taxAgencyID) {
    	
    	// declare and initialize variables
    	var taxItemID = null;
    	
    	try
    		{
    			// create a new tax item record
    			var taxItemRec = record.create({
    				type: record.Type.SALES_TAX_ITEM
    			});
    			
    			taxItemRec.setValue({
    				fieldId: 'itemid',
    				value: 'Avalara'
    			});
    			
    			taxItemRec.setValue({
    				fieldId: 'displayname',
    				value: 'Avalara'
    			});
    			
    			taxItemRec.setValue({
    				fieldId: 'description',
    				value: 'Tax item for the Avalara for Communications bundle'
    			});
    			
    			taxItemRec.setValue({
    				fieldId: 'subsidiary',
    				value: 1
    			});
    			
    			taxItemRec.setValue({
    				fieldId: 'rate',
    				value: 0
    			});
    			
    			taxItemRec.setValue({
    				fieldId: 'taxagency',
    				value: taxAgencyID
    			});
    			
    			taxItemID = taxItemRec.save({
    				ignoreMandatoryFields: true
    			});
    			
    			log.audit({
    				title: 'Tax Item Created',
    				details: taxItemID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Creating Tax Item',
    				details: e
    			});
    		}
    	
    	return taxItemID;

    }
    
    function updateConfigRecord(taxCode) {
    	
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
    							custrecord_bbstfc_conf_tax_code: taxCode,
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
