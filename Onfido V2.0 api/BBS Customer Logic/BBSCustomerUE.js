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
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
		    	// get the ID of the current record
		    	var recordID = scriptContext.newRecord.id;
		    	
		    	// load the current record
		    	var currentRecord = record.load({
		    		type: record.Type.CUSTOMER,
		    		id: recordID,
		    		isDynamic: true
		    	});
		    	
		    	// call function to update currencies
		    	currentRecord = updateCurrencies(currentRecord);
		    	
		    	// call function to update the defaultTaxCode
		    	currentRecord = updateDefaultTaxCode(currentRecord);

		    	try
			        {
			        	// submit the record
			        	currentRecord.save({
			        		ignoreMandatoryFields: true
			        	});
			        			
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
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function updateCurrencies(currentRecord) {
    	
    	// get count of subsdiaries
    	var subsidiaries = currentRecord.getLineCount({
    		sublistId: 'submachine'
    	});
    	
    	// loop through subsidiaries
    	for (var i = 0; i < subsidiaries; i++)
    		{
	    		// declare variables
		    	var addCurrency = true;
    		
    			// get the internal ID of the subsidiary
    			var subsidiaryID = currentRecord.getSublistValue({
    				sublistId: 'submachine',
    				fieldId: 'subsidiary',
    				line: i
    			});
    			
    			// lookup fields on the subsidiary record
		    	var subsidiaryLookup = search.lookupFields({
		    		type: search.Type.SUBSIDIARY,
		    		id: subsidiaryID,
		    		columns: ['currency']
		    	});
		    	
		    	// retrieve the base currency from the subsidiary record
		    	var baseCurrency = subsidiaryLookup.currency[0].value;
		    	
		    	// get count of lines in the 'Currencies' sublist
		    	var currencies = currentRecord.getLineCount({
		    		sublistId: 'currency'
		    	});
		    	
		    	// loop through currencies
		    	for (var x = 0; x < currencies; x++)
		    		{
			    		// get the currency from the line
		    			var lineCurrency = currentRecord.getSublistValue({
		    				sublistId: 'currency',
		    				fieldId: 'currency',
		    				line: x
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
		    		}
    		}
    	
    	return currentRecord;
    	
    }
    
    function updateDefaultTaxCode(currentRecord) {
    	
    	// get count of tax registrations
    	var taxRegistrations = currentRecord.getLineCount({
    		sublistId: 'taxregistration'
    	});
    	
    	// check we have at least one tax registration
    	if (taxRegistrations > 0)
    		{
	    		// get the ID of the tax registration from the first line
	    		var taxRegistrationID = currentRecord.getSublistValue({
	    			sublistId: 'taxregistration',
	    			fieldId: 'id',
	    			line: 0
	    		});
	    		
	    		// set the default tax reg field on the record
	    		currentRecord.setValue({
	    			fieldId: 'defaulttaxreg',
	    			value: taxRegistrationID
	    		});
    		}
    	
    	return currentRecord;
    	
    }

    return {
        afterSubmit: afterSubmit
    };
    
});
