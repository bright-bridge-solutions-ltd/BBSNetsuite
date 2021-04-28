/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/record', 'N/search', 'N/ui/dialog'],
/**
 * @param {currentRecord} currentRecord
 * @param {record} record
 * @param {search} search
 */
function(currentRecord, record, search, dialog) 
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
    	
    	//See if the fields we are interested in have changed
    	//
    	if (scriptContext.fieldId == 'custrecord32' || scriptContext.fieldId == 'custrecord33')
    		{
	    		var initialServ = Number(scriptContext.currentRecord.getValue({fieldId: 'custrecord32'}));
				var initialProb	= Number(scriptContext.currentRecord.getValue({fieldId: 'custrecord33'}));
				var result 		= initialServ * initialProb;
				var outcome		= null;
				
				//Work out if the result is acceptable or unacceptable
				//
				if(result > 10)
					{
						outcome = 2;
					}
				else
					{
						outcome = 1;
					}
				
				//Update the outcome field
				//
				scriptContext.currentRecord.setValue({
								    				fieldId: 	'custrecord34',
								    				value: 		outcome
								    				});		
				
    		}

    }
	
    
    return 	{
	        	fieldChanged:	fieldChanged
    		};
    
});
