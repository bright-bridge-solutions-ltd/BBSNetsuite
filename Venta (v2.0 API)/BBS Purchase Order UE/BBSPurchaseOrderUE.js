/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
function(search) {
   
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
    	
    	// get the new record
    	var currentRecord = scriptContext.newRecord;
    	
    	// get the value of the currency field from the record
    	var currency = currentRecord.getValue({
    		fieldId: 'currency'
    	});
    	
    	// if statement to check the currency variable does not return 1 (GBP)
    	if (currency != 1)
    		{
	    		// get the internal ID of the supplier
    			var supplierID = currentRecord.getValue({
    				fieldId: 'entity'
    			});
    			
    			// lookup fields on the supplier record
    			var supplierLookup = search.lookupFields({
    				type: search.Type.VENDOR,
    				id: supplierID,
    				columns: ['custentity_bbs_default_taxcode']
    			});
    			
    			// get the default tax code from the supplierLookup
    			var defaultTaxCode = supplierLookup.custentity_bbs_default_taxcode[0].value;
    			
    			// get a count of item lines on the record
	        	var lineCount = currentRecord.getLineCount({
	        		sublistId: 'item'
	        	});
	        	
	        	// loop through line count
	        	for (var x = 0; x < lineCount; x++)
	        		{
		        		// set the tax code line field using the taxCode variable
		    			currentRecord.setSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'taxcode',
		    				value: defaultTaxCode,
		    				line: x
		    			});
	        		}
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
