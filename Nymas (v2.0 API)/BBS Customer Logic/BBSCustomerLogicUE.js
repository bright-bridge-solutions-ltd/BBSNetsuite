/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', './BBSCustomerLogicLibrary'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search, BBSCustomerLogicLibrary) {
   
	/**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function customerBeforeLoad(scriptContext) { 
    	
    	if (scriptContext.type == scriptContext.UserEventType.CREATE)
    		{
    			// default email preference to "PDF"
    			scriptContext.newRecord.setValue({
    				fieldId: 'emailpreference',
    				value: 'PDF'
    			});
    		}
    	
    }
	
	/**
     * Function definition to be triggered after record is submitted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function customerAfterSubmit(scriptContext) 
	    {
    		var type			= scriptContext.type;
    		var currentRecord 	= scriptContext.newRecord;
    		
    		//Only works in create or edit mode
			//
			if (type == scriptContext.UserEventType.CREATE || type == scriptContext.UserEventType.EDIT)
				{
					BBSCustomerLogicLibrary.customerLogic(currentRecord);
				}
	    }

    return 	{
    	beforeLoad:		customerBeforeLoad,		
    	afterSubmit: 	customerAfterSubmit
    };
    
});
