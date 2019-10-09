/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],

function(record, search) {
   
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
    	
    	// only run script when the record is being created or edited
    	if (scriptContext.type == 'create' || scriptContext.type == 'edit')
    		{
		    	// declare variables
		    	var lineCurrency;
		    	var addCurrency = true;
		    	
		    	// get the ID of the current record
		    	var recordID = scriptContext.newRecord.id;
		    	
		    	// load the current record
		    	var currentRecord = record.load({
		    		type: record.Type.CUSTOMER,
		    		id: recordID,
		    		isDynamic: true
		    	});
		    	
		    	// get the value of the subsidiary field from the current record
		    	var subsidiary = currentRecord.getValue({
		    		fieldId: 'subsidiary'
		    	});
		    	
		    	// lookup fields on the subsidiary record
		    	var subsidiaryLookup = search.lookupFields({
		    		type: search.Type.SUBSIDIARY,
		    		id: subsidiary,
		    		columns: ['currency']
		    	});
		    	
		    	// retrieve the base currency from the subsidiary record
		    	var baseCurrency = subsidiaryLookup.currency[0].value;
		    	
		    	// get count of lines in the 'Currencies' sublist
		    	var lineCount = currentRecord.getLineCount({
		    		sublistId: 'currency'
		    	});
		    	
		    	// loop through lineCount
		    	for (var i = 0; i < lineCount; i++)
		    		{
		    			// get the currency from the line
		    			lineCurrency = currentRecord.getSublistValue({
		    				sublistId: 'currency',
		    				fieldId: 'currency',
		    				line: i
		    			});
		    			
		    			// check if the baseCurrency and lineCurrency variables are the same
		    			if (baseCurrency == lineCurrency)
		    				{
		    					// set addCurrency variable to false
		    					addCurrency = false;
		    					
		    					// break the loop
		    					break;
		    				}
		    		}
		    	
		    	// check value of addCurrency variable returns true
		    	if (addCurrency == true)
		    		{
		    			// select a new line in the 'Currencies' sublist
		    			currentRecord.selectNewLine({
		    				sublistId: 'currency'
		    			});
		    			
		    			// set currency field on the new line
		    			currentRecord.setCurrentSublistValue({
		    				sublistId: 'currency',
		    				fieldId: 'currency',
		    				value: baseCurrency
		    			});
		    			
		    			// commit the new line
		    			currentRecord.commitLine({
		    				sublistId: 'currency'
		    			});
		    			
		    			try
			        		{
			        			// submit the record
			        			currentRecord.save();
			        			
			        			log.audit({
			        				title: 'Currency Added to Customer Record',
			        				details: 'Record ID: ' + recordID
			        			});
			        		}
			        	catch(error)
			        		{
			        			log.error({
			        				title: 'Error Updating Customer Record ' + recordID,
			        				details: error
			        			});
			        		}
		    		}
    		}
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
