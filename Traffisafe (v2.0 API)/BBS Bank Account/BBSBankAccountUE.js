/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
/**
 * @param {search} search
 */
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
    	
    	// only run the script when the script is being created or edited
    	if (scriptContext.type == 'create' || scriptContext.type == 'edit')
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    	
		    	// get the ID of the currency from the current record
		    	var currency = currentRecord.getValue({
		    		fieldId: 'currency'
		    	});
		    	
		    	// get the ID of the subsidiary from the current record
		    	var subsidiary = currentRecord.getValue({
		    		fieldId: 'subsidiary'
		    	});
		    	
		    	// create search to find appropriate 'Bank Account' record
		    	var bankAccSearch = search.create({
		    		type: 'customrecord_bbs_bank_list',
		    		
		    		columns: [{
		    			name: 'internalid'
		    		}],
		    		
		    		filters: [{
		    			name: 'custrecord_bbs_bank_currency',
		    			operator: 'anyof',
		    			values: [currency]
		    		},
		    				{
		    			name: 'custrecord_bbs_bank_subsidiary',
		    			operator: 'anyof',
		    			values: [subsidiary]
		    		}],
		    	});
		    	
		    	// run search and process results
		    	bankAccSearch.run().each(function(result) {
		    		
		    		// retrieve bank account ID from the search results
		    		var bankAccount = result.getValue({
		    			name: 'internalid'
		    		});
		    		
		    		// set 'account name' field on the current record using the bankAccount variable
		    		currentRecord.setValue({
		    			fieldId: 'custbody_bbs_bank_account',
		    			value: bankAccount
		    		});
		    		
		    		// only process the first search result
		    		return false;
		    		
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
