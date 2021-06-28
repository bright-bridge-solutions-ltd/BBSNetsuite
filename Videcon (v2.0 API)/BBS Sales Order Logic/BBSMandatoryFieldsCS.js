/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/ui/dialog'],

function(currentRecord, dialog) {

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext)
	    {
			var currentRecord = scriptContext.currentRecord;
					
			var invLocation = currentRecord.getCurrentSublistValue({
																sublistId: 	'item',
																fieldId: 	'inventorylocation'
																});
			
			var itemType = currentRecord.getCurrentSublistValue({
																sublistId: 	'item',
																fieldId: 	'itemtype'
																});

			if((invLocation == null || invLocation == '') && itemType != 'Discount')
				{
					dialog.alert({
									title: 		'Error',
									message: 	'Mandatory Field - Inventory location - please enter a value'
									});
					
					return false;
				}
			else
				{
					return true;
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
    		var currentRecord 	= scriptContext.currentRecord;
    		var lineCount		= currentRecord.getLineCount({sublistId: 'item'});
    		
    		for (var int = 0; int < lineCount; int++) 
	    		{
	    			var invLocation = currentRecord.getSublistValue({
																	sublistId: 	'item',
																	fieldId: 	'inventorylocation',
																	line:		int
																	});
	    			
	    			var itemType = currentRecord.getSublistValue({
																	sublistId: 	'item',
																	fieldId: 	'itemtype',
																	line:		int
																	});
	    			
	    			if((invLocation == null || invLocation == '') && itemType != 'Discount')
						{
							dialog.alert({
											title: 		'Error',
											message: 	'Mandatory Field - Inventory location - please enter a value'
											});
							
							return false;
						}
				}
    		
    		return true;
	    }

    return 	{
	        validateLine: 	validateLine,
	        saveRecord: 	saveRecord
    		};
    
});
