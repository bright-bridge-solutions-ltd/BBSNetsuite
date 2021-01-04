/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['./BBSPackingLibrary', 'N/currentRecord','N/format','N/ui/dialog'],

function(BBSPackingLibrary, currentRecord, format, dialog) 
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
    		
    		var stage 					= Number(scriptContext.currentRecord.getValue({fieldId: 'custpage_param_stage'}));
    		var validationCondition 	= true;
    		
    		if(stage == 1)
    			{
		    		var lines = scriptContext.currentRecord.getLineCount({sublistId: 'custpage_sublist_items'});
		    		
		    		for (var int = 0; int < lines; int++) 
			    		{
							var isTicked = scriptContext.currentRecord.getSublistValue({
																						sublistId: 'custpage_sublist_items',
																						fieldId:	'custpage_sl_items_tick',
																						line:		int
																						});	
							
							var supplierId = scriptContext.currentRecord.getSublistValue({
																						sublistId: 'custpage_sublist_items',
																						fieldId:	'custpage_sl_items_supplier',
																						line:		int
																						});	

							if(isTicked && (supplierId == null || supplierId == ''))
								{
									validationCondition = false;
									break;
								}
						}
		    		
		    		if(!validationCondition)
		    			{
			    			var warnings 	= 	'All selected lines must have a supplier allocated';
		        			var titleText 	= 	'❗Alert';
		    	      		var options 	= 	{
			    		      					title: 		titleText,
			    		      					message: 	warnings
			    		      					};
	
		    		      	//Display the dialogue box
		    		      	//
		    		      	dialog.alert(options);
		    			}
		    		
		    		return validationCondition;
    			}
    		else
    			{
    				return true;
    			}
	    }
    

    return 	{
    		saveRecord:		saveRecord
    		};
    
});
