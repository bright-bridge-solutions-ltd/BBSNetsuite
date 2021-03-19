/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord','N/format','N/ui/dialog', 'N/url', 'N/runtime'],

function(currentRecord, format, dialog, url, runtime) 
{
	function pageInit(scriptContext) 
	    {
			debugger;
			
			scriptContext.currentRecord.getField({fieldId: 'custpage_entry_collect_qty'}).isDisplay = false;
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
    function fieldChanged(scriptContext) 
	    {
    		debugger;
    		
    		var fieldValue 	= scriptContext.currentRecord.getValue({fieldId: scriptContext.fieldId});
    		var fieldText 	= scriptContext.currentRecord.getText({fieldId: scriptContext.fieldId});
    		
	    	switch(scriptContext.fieldId)
	    		{
			    	case 'custpage_entry_collection_date':
			    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_collectiondate', value: format.format({value: fieldValue, type: format.Type.DATE})});
			    		break;
			    		
			    	case 'custpage_entry_class':
			    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_class', value: fieldValue});
			    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_classname', value: fieldText});
			    		
			    		switch(Number(fieldValue))
			    			{
					    		case 1:
					    		case 2:
					    		case 3:
					    			scriptContext.currentRecord.getField({fieldId: 'custpage_entry_collect_qty'}).isDisplay = true;
					    			break;
					    	
					    		default:
					    			scriptContext.currentRecord.getField({fieldId: 'custpage_entry_collect_qty'}).isDisplay = false;
					    			break;
			    			}
			    		break;

			    	case 'custpage_entry_epos':
			    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_epos', value: fieldValue});
			    		break;

			    	case 'custpage_entry_customer':
			    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_customer', value: fieldValue});
			    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_customername', value: fieldText});
			    		break;

			    	case 'custpage_entry_franchisee':
			    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_franchisee', value: fieldValue});
			    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_franchiseename', value: fieldText});
			    		break;

			    	case 'custpage_entry_asofdate':
			    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_asofdate', value: format.format({value: fieldValue, type: format.Type.DATE})});
			    		break;
			    		
			    	case 'custpage_entry_collect_qty':
			    		scriptContext.currentRecord.setValue({fieldId: 'custpage_param_collection_qty', value: fieldValue});
			    		break;

	    		}
	    }

    return 	{
    		fieldChanged: 	fieldChanged,
    		pageInit:		pageInit
    		};
});
