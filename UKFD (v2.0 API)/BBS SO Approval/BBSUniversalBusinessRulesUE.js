/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([],
function() {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
    	
    	// check the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
		    	// declare and initialize variables
    			var ifStatement = '';
    			
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// return values from the currentRecord object
    			var startsWith = currentRecord.getValue({
    				fieldId: 'custrecord_uni_business_rules_startswith'
    			});
    			
    			var partCodes = currentRecord.getValue({
    				fieldId: 'custrecord_uni_business_rules_prod_codes'
    			});
    			
    			var containsOne = currentRecord.getValue({
    				fieldId: 'custrecord_uni_business_rules_contains_1'
    			});
    			
    			var containsTwo = currentRecord.getValue({
    				fieldId: 'custrecord_uni_business_rules_contains_2'
    			});
    			
    			// build up the if statement
    			ifStatement += 'itemName.indexOf(' + startsWith + ') > -1';
    			ifStatement += ' && (';
    			
    			// loop through part codes
    			for (var i = 0; i < partCodes.length; i++)
    				{
    					// add the part code to the if statement
    					ifStatement += 'itemID == ' + partCodes[i];
    					
    					// if this is not the last part code
    					if (i != partCodes.length)
    						{
    							// add a closing tag to the ifStatement string
    							ifStatement += ' || ';
    						}
    				}
    			
    			// if containsOne and containsTwo both contain values
    			if (containsOne && containsTwo)
    				{
    					// add to the if statement
    					ifStatement += 'itemName.indexOf(' + containsOne + ') > -1';
    					ifStatement += ' || ';
    					ifStatement += 'itemName.indexOf(' + containsTwo + ') > -1';
    				}
    			else if (containsOne && containsTwo == '') // if containsOne contains a value but containsTwo does NOT
    				{
	    				// add to the if statement
						ifStatement += 'itemName.indexOf(' + containsOne + ') > -1';
    				}
    			else if (containsOne == '' && containsTwo) // if containsOne does NOT contain a value but containsTwo does
    				{
	    				// add to the if statement
						ifStatement += 'itemName.indexOf(' + containsTwo + ') > -1';
    				}
    			
    			// add closing tags to the if statement
    			ifStatement += ')';
    			
    			// populate the IF Statement field on the record
    			currentRecord.setValue({
    				fieldId: 'custrecord_uni_business_rules_if_state',
    				value: ifStatement
    			});
    		}

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {

    }
    

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
