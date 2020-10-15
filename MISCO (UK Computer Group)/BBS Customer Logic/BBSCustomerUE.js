/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([],
function() {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
    	
    	// check the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// declare and initialize variables
    			var postcode = null;
    		
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get count of addresses
    			var addressCount = currentRecord.getLineCount({
    				sublistId: 'addressbook'
    			});
    			
    			// loop through addresses
    			for (var i = 0; i < addressCount; i++)
    				{
    					// get the value of the 'Default Billing' checkbox for the line
    					var defaultBilling = currentRecord.getSublistValue({
    						sublistId: 'addressbook',
    						fieldId: 'defaultbilling',
    						line: i
    					});
    					
    					// if defaultBilling is true
    					if (defaultBilling == true)
    						{
    							// get the postcode from the address subrecord
    							postcode = currentRecord.getSublistSubrecord({
    							    sublistId: 'addressbook',
    							    fieldId: 'addressbookaddress',
    							    line: i
    							}).getValue({
    								fieldId: 'zip'
    							});
    							
    							// break the loop
    							break;
    						}
    				}
    			
    			// set the 'Postcode Searchable' field on the record
    			currentRecord.setValue({
    				fieldId: 'custentity_bbs_postcode_searchable',
    				value: postcode
    			});
    			
    		}

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
