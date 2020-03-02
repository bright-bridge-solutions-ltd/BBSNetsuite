/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],

function() 
{

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
    		var lineCount = scriptContext.currentRecord.getLineCount({sublistId: 'custpage_sublist_items'});
    		var returnStatus = true;
    		var message = 'Please select a line to continue';
    		var tickCount = Number(0);
			
    		for (var int = 0; int < lineCount; int++) 
				{
					var tick =  scriptContext.currentRecord.getSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_ticked', line:  int});  
					
					if(tick)
						{
							tickCount++;
							break;
						}
				}
		
		if(tickCount != 1)
			{	
				Ext.Msg.minWidth = 100;
				Ext.Msg.alert('❗Alert', 'Please select a single line in order to be able to continue', Ext.emptyFn);
	
				returnStatus = false;
			}
    		
    		return returnStatus;
	    }

    
    return 	{
        	saveRecord: 	saveRecord
    		};
    
});
