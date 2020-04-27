/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/ui/dialog'],
/**
 * @param {runtime} runtime
 * @param {dialog} dialog
 */
function(runtime, dialog) {

	/**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function configurationPageInit(scriptContext) 
	    {
	    	var integrationType = scriptContext.currentRecord.getValue({fieldId: 'custrecord_bbs_comet_integration_type'});
			
			processFields(scriptContext, integrationType);
	    }
    
    
    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function condifurationFieldChanged(scriptContext) 
	    {
    		debugger;
    		
    		if(scriptContext.fieldId == 'custrecord_bbs_comet_integration_type')
    			{
    				var integrationType = scriptContext.currentRecord.getValue({fieldId: scriptContext.fieldId});
    				
    				processFields(scriptContext, integrationType);
    			}
	    }


    function processFields(_scriptContext, _integrationType)
    	{
	    	//Check to see if we are using a product integration
			//
			if(_integrationType == '3')
				{
					_scriptContext.currentRecord.getField({fieldId: 'custrecord_bbs_comet_cash_sale_cust'}).isDisplay = false;
					_scriptContext.currentRecord.getField({fieldId: 'custrecord_bbs_comet_so_form'}).isDisplay = false;
					_scriptContext.currentRecord.getField({fieldId: 'custrecord_bbs_comet_payment_type'}).isDisplay = false;
					_scriptContext.currentRecord.getField({fieldId: 'custrecord_bbs_comet_division'}).isDisplay = false;
				}
			else
				{
					_scriptContext.currentRecord.getField({fieldId: 'custrecord_bbs_comet_cash_sale_cust'}).isDisplay = true;
					_scriptContext.currentRecord.getField({fieldId: 'custrecord_bbs_comet_so_form'}).isDisplay = true;
					_scriptContext.currentRecord.getField({fieldId: 'custrecord_bbs_comet_payment_type'}).isDisplay = true;
					_scriptContext.currentRecord.getField({fieldId: 'custrecord_bbs_comet_division'}).isDisplay = true;
				}
    	}

    return {
    		pageInit: 		configurationPageInit,
        	fieldChanged: 	condifurationFieldChanged
    		};
    
});
