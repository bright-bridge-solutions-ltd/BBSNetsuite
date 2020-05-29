/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/format'],
function(search, format) {
   
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
    	
    	// check the record is being created
    	if (scriptContext.type == scriptContext.UserEventType.CREATE)
    		{
		    	// get the current record
		    	var currentRecord = scriptContext.newRecord;
		    	
		    	// get the value of the 'Contract Record' field
		    	var contractRecord = currentRecord.getValue({
		    		fieldId: 'custrecord_bbs_contract_mnth_items_cont'
		    	});
		    	
		    	// check we have a contract record
		    	if (contractRecord)
		    		{
		    			// lookup fields on the contract record
		    			var contractLookup = search.lookupFields({
		    				type: 'customrecord_bbs_contract',
		    				id: contractRecord,
		    				columns: ['custrecord_bbs_contract_start_date', 'custrecord_bbs_contract_end_date']
		    			});
		    			
		    			// get the start/end date of the contract
		    			var startDate = contractLookup.custrecord_bbs_contract_start_date;
		    			var endDate = contractLookup.custrecord_bbs_contract_end_date;
		    			
		    			// set the start/end date fields on the current record
		    			currentRecord.setValue({
		    				fieldId: 'custrecord_bbs_contract_mnth_items_start',
		    				value: startDate
		    			});
		    			
		    			currentRecord.setValue({
		    				fieldId: 'custrecord_bbs_contract_mnth_items_end',
		    				value: endDate
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

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
