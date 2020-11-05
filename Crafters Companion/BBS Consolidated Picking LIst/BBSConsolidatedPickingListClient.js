/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['./BBSConsolidatedPickingListLibrary'],

function(BBSConsolidatedPickingListLibrary) 
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
	    	
	    	if(scriptContext.fieldId == 'custpage_entry_select_customer')
	    		{
		    		var selectedCustomer 	= scriptContext.currentRecord.getValue({fieldId: 'custpage_entry_select_customer'});
	    			var filters 			= {};
	    			
	    			filters['customer'] 	= selectedCustomer;
	    			
	    			var filtersString		= JSON.stringify(filters);
	    			
	    			var session = scriptContext.currentRecord.getValue({fieldId: 'custpage_param_session'});
	    			
	    			BBSConsolidatedPickingListLibrary.libSetSessionData(session, filtersString);
	    			
	    		}	
	    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) 
	    {
    		debugger;
    		
    		var stage 		= Number(scriptContext.currentRecord.getValue({fieldId: 'custpage_param_stage'}));
    		
    		if(stage == 2)
    			{
		    		var lines 		= scriptContext.currentRecord.getLineCount({sublistId: 'custpage_sublist_orders'});
		    		var tickedLines	= false;
		    		
		    		for (var int = 0; int < lines; int++) 
			    		{
							var ticked = scriptContext.currentRecord.getSublistValue({
																					sublistId: 'custpage_sublist_orders',
																					fieldId:	'custpage_sl_ticked',
																					line:		int
																					});	
							
							if(ticked)
								{
									tickedLines = true;
									break;
								}
						}
		    		
		    		if(!tickedLines)
		    			{
			    			Ext.Msg.minWidth = 100;
							Ext.Msg.alert('❗Alert', 'Please select one or more lines in order to be able to continue', Ext.emptyFn);
		    			}
		    		
		    		return tickedLines;
    			}
    		else
    			{
    				return true;
    			}
	    }
    
    return 	{
    		fieldChanged: 	fieldChanged,
    		saveRecord:		saveRecord
    		};
    
});
