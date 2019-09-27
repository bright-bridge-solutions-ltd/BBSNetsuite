/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/dialog', 'N/ui/message','N/currentRecord','N/runtime'],
/**
 * @param {dialog} dialog
 * @param {message} message
 */
function(dialog, message, currentRecord, runtime) {
    

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function mandatorySaveRecord(scriptContext) 
    {
    	debugger;
    	var returnStatus = true;
    	var formIds = [];
    	
    	//Get script param that holds the list of form id's to apply to
    	//
    	var currentScript = runtime.getCurrentScript();
    	var applyToForms = currentScript.getParameter({name: 'custscript_bbs_forms_to_appy'});
    	
    	//Are we applying to specific forms?
    	//
    	if(applyToForms != null && applyToForms != '')
    		{
    			formIds = applyToForms.split(',');
    		}
    	
    	//Get the current record
    	//
    	var poRecord = currentRecord.get();
    	var itemLines = poRecord.getLineCount({sublistId: 'item'});
    	var expenseLines = poRecord.getLineCount({sublistId: 'expense'});
    	var formId = poRecord.getValue({fieldId: 'customform'});
    	
    	//Only process if there are no specific forms listed to apply to, or the current form is in the list of forms to apply to
    	//
    	if(formIds.length == 0 || formIds.indexOf(formId) != -1)
    		{
		    	//Loop through the item lines
		    	//
		    	for (var int = 0; int < itemLines; int++) 
			    	{
						var costCenter = poRecord.getSublistValue({
																    sublistId: 'item',
																    fieldId: 'class',
																    line: int
																});
						
						var department = poRecord.getSublistValue({
																    sublistId: 'item',
																    fieldId: 'department',
																    line: int
																});

						if(costCenter == null || costCenter == '' || department == null || department == '')
							{
								returnStatus = false;
								break;
							}
					}
		    	
		    	//Loop through the expense lines
		    	//
		    	for (var int = 0; int < expenseLines; int++) 
			    	{
			    		var costCenter = poRecord.getSublistValue({
																    sublistId: 'expense',
																    fieldId: 'class',
																    line: int
																});
	
						var department = poRecord.getSublistValue({
																	    sublistId: 'expense',
																	    fieldId: 'department',
																	    line: int
																	});
	
						if(costCenter == null || costCenter == '' || department == null || department == '')
							{
								returnStatus = false;
								break;
							}
					}
		    	
		    	//Have we got an error to report
		    	//
		    	if(!returnStatus)
		    		{
		    			var msg = message.create({
		    										title: 'Error Saving Record', 
		    										message: 'Department & Cost Center are required on all lines of this transaction',
		    										type: message.Type.ERROR
		    										});
		    			msg.show();
		    		}
    		}

    	return returnStatus;
    }

    return 	{
        	saveRecord: mandatorySaveRecord
    		};
    
});
