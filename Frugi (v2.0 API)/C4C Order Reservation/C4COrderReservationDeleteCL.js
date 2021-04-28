/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord','N/format','N/ui/dialog', 'N/url', 'N/runtime'],

function(currentRecord, format, dialog, url, runtime) 
{
	
	
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
    function fieldChanged(scriptContext) 
	    {
    		debugger;
    		
    		var stage 	= Number(scriptContext.currentRecord.getValue({fieldId: 'custpage_param_stage'}));
			
			if(stage == 1)
				{
		    		var fieldValue 	= scriptContext.currentRecord.getValue({fieldId: scriptContext.fieldId});
		    		var fieldText 	= scriptContext.currentRecord.getText({fieldId: scriptContext.fieldId});
		    		
			    	switch(scriptContext.fieldId)
			    		{
					    	case 'custpage_entry_subsidiary':
					    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_subsidiary', value: fieldValue});
					    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_subsidiary_text', value: fieldText});
					    		break;
		
					    	case 'custpage_entry_location':
					    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_location', value: fieldValue});
					    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_location_text', value: fieldText});
					    		break;
		
					    	case 'custpage_entry_channel':
					    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_channel', value: fieldValue});
					    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_channel_text', value: fieldText});
					    		break;
		
					    	case 'custpage_entry_item':
					    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_item', value: fieldValue});
					    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_item_text', value: fieldText});
					    		break;
			    		}
				}
	    }

    return 	{
    		fieldChanged: 	fieldChanged
    		};
});
