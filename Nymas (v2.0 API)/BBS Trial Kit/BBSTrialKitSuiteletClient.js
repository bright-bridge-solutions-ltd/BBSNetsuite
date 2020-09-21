/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],

function() 
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
	    	var selectionType = Number(scriptContext.currentRecord.getValue({fieldId: 'custpage_entry_select_type'}));
	    	
	    	switch(selectionType)
	    		{
			    	case 1:		//assembly
			    		scriptContext.currentRecord.getField({fieldId: 'custpage_entry_assembly'}).isDisplay = true;
			    		scriptContext.currentRecord.getField({fieldId: 'custpage_entry_quantity'}).isDisplay = true;
			    		scriptContext.currentRecord.getField({fieldId: 'custpage_entry_assembly'}).isMandatory = true;
			    		scriptContext.currentRecord.getField({fieldId: 'custpage_entry_quantity'}).isMandatory = true;
			    		scriptContext.currentRecord.getField({fieldId: 'custpage_entry_sales_order'}).isDisplay = false;
			    		scriptContext.currentRecord.getField({fieldId: 'custpage_entry_works_order'}).isDisplay = false;
			    		
			    		break;
			    		
			    	case 2: 	//sales order
			    		scriptContext.currentRecord.getField({fieldId: 'custpage_entry_assembly'}).isDisplay = false;
			    		scriptContext.currentRecord.getField({fieldId: 'custpage_entry_quantity'}).isDisplay = false;
			    		scriptContext.currentRecord.getField({fieldId: 'custpage_entry_sales_order'}).isDisplay = true;
			    		scriptContext.currentRecord.getField({fieldId: 'custpage_entry_sales_order'}).isMandatory = true;
			    		scriptContext.currentRecord.getField({fieldId: 'custpage_entry_works_order'}).isDisplay = false;
			    		
			    		break;
			    		
			    	case 3:		//works order
			    		scriptContext.currentRecord.getField({fieldId: 'custpage_entry_assembly'}).isDisplay = false;
			    		scriptContext.currentRecord.getField({fieldId: 'custpage_entry_quantity'}).isDisplay = false;
			    		scriptContext.currentRecord.getField({fieldId: 'custpage_entry_sales_order'}).isDisplay = false;
			    		scriptContext.currentRecord.getField({fieldId: 'custpage_entry_works_order'}).isDisplay = true;
			    		scriptContext.currentRecord.getField({fieldId: 'custpage_entry_works_order'}).isMandatory = true;
			    		
			    		break;
	    		}
		
	    	var dummy = '';
	    	
	    }

    return 	{
    		fieldChanged: 	fieldChanged
    		};
    
});
