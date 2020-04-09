
/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord','N/record','N/runtime'], 
function(currentRecord, record, runtime) 
{

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
    function poBillValidateLine(scriptContext) 
	    {
    		debugger;
    	
   			//Get the required tolerance
			//
			var toleranceParam 	= runtime.getCurrentScript().getParameter({name: 'custscript_bbs_po_bill_tolerance'});
		    		
			//Get the current record
			//
			var currentRecord 	= scriptContext.currentRecord;
		    		
			//Get the current sublist id
			//
			var currentSublist = scriptContext.sublistId;
		   		
			//Get the current sublist line
			//
			var currentLine = currentRecord.getCurrentSublistIndex({sublistId: currentSublist});
		    		
			//Get the current value of the amount field
			//
			var currentAmount = currentRecord.getCurrentSublistValue({
													    		    sublistId: 	currentSublist,
													    		    fieldId: 	'amount'
													    			});
		    		
			//Get the original value of the amount field
			//
			var originalAmount = Number(0);
		    		
			try
				{
					originalAmount = currentRecord.getSublistValue({
															    	sublistId: 	currentSublist,
															    	fieldId: 	'amount',
															    	line:		currentLine
															    	});
		    	}
		   catch(err)
		    	{
		    		//Cater for the possibility of adding a new line, in which case there will be no original amount
		    		//
		    		originalAmount = currentAmount;
		    	}
		    		
		   var validationResult = validateLine(toleranceParam, originalAmount, currentAmount);
		    		
		   if(!validationResult)
		   		{
		   			Ext.Msg.alert('⛔️️ Error', 'Item amount exceeds the ' + toleranceParam.toString() + '% tolerance allowed.', Ext.emptyFn);
		   		}
		   		
		   	return validationResult;
	    }
    
    function validateLine(_tolerance, _oldValue, _newValue)
    	{
    		var validationResult = true;
    		
    		var percentageChange = Math.abs(((Number(_newValue) - Number(_oldValue)) / Number(_oldValue)) * Number(100.0));
    		
    		if(percentageChange > Number(_tolerance))
    			{
    				validationResult = false;
    			}
    		
    		return validationResult;
    	}
    
    return 	{
    		validateLine: 	poBillValidateLine
    		};
    
});
