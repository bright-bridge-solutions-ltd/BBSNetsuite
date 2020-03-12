/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/format', 'N/search'],
/**
 * @param {search} search
 */
function(format, search) {
   
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
    	
    	// declare and initialize variables
    	contractRecord = null;
    	itemRecord = null;
    	errorMessages = null;
    	
    	// get the current record object
    	var currentRecord = scriptContext.newRecord;
    	
    	// get the item
    	var item = currentRecord.getValue({
    		fieldId: 'custrecord_bbs_ims_usage_data_item'
    	});
    	
    	// create search to find product for this item id
    	var itemSearch = search.create({
    		type: search.Type.ITEM,
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    			{
    			name: 'internalid',
    			operator: 'anyof',
    			values: [item]
    		}],
    		
    		columns: [{
    			name: 'internalid'
    		}],
    	});
    	
    	// run search and process results
    	itemSearch.run().each(function(result){
    		
    		itemRecord = result.getValue({
    			name: 'internalid'
    		});
    		
    	});
    	
    	// get the sales force ID
    	var salesForceID = currentRecord.getValue({
    		fieldId: 'custrecord_bbs_ims_usage_data_sf_id'
		});
		    	
		// get the date of the search
		var searchDate = currentRecord.getValue({
		    fieldId: 'custrecord_bbs_ims_usage_data_date'
		});
		    	
		// format searchDate as a date string
		searchDate = format.format({
			type: format.Type.DATE,
		    value: searchDate
		});
		    	
		// create search to find contract record for this sales force id
		var contractSearch = search.create({
			type: 'customrecord_bbs_contract',
		    		
		    filters: [
		    			["isinactive","is","F"],
		    			"AND",
		    			["custrecord_bbs_contract_status","anyof","1"], // 1 = Approved
		    			"AND",
		    			["custrecord_bbs_contract_sales_force_id","is",salesForceID],
		    			"AND",
		    			["custrecord_bbs_contract_start_date","onorbefore",searchDate],
		    			"AND",
		    			["custrecord_bbs_contract_end_date","onorafter",searchDate],
		    			"AND",
		    			[["custrecord_bbs_contract_early_end_date","isempty",""],"OR",["custrecord_bbs_contract_early_end_date","onorafter",searchDate]],
		    		],
		    				
		    columns: [{
		    		name: 'internalid'
		    	}],
		    		
		});
		    	
		// run search and process results
		contractSearch.run().each(function(result){
		    		
			// get the internal id of the contract record
		    contractRecord = result.getValue({
		    	name: 'internalid'
		    });
		    		
		});
		
		// check if we have a contract and item record
		if (contractRecord != null && itemRecord != null)
			{
				// set the contract record field on the current record
				currentRecord.setValue({
					fieldId: 'custrecord_bbs_ims_usage_data_contract',
					value: contractRecord
				});
				
				// set the item record field on the current record
				currentRecord.setValue({
					fieldId: 'custrecord_bbs_ims_usage_data_item_rec',
					value: itemRecord
				});
				
				// set the error messages field on the current record to null
				currentRecord.setValue({
					fieldId: 'custrecord_bbs_ims_usage_data_errors',
					value: null
				});
			}
		else if (contractRecord == null && itemRecord != null) // if we have got an item record but we don't have a contract record
			{
				// set the contract record field on the current record to null
				currentRecord.setValue({
					fieldId: 'custrecord_bbs_ims_usage_data_contract',
					value: null
				});
				
				// set the item record field on the current record
				currentRecord.setValue({
					fieldId: 'custrecord_bbs_ims_usage_data_item_rec',
					value: itemRecord
				});
				
				// set the error messages field on the current record
				currentRecord.setValue({
					fieldId: 'custrecord_bbs_ims_usage_data_errors',
					value: 'No matching contract record found'
				});
			}
		else if (contractRecord != null && itemRecord == null) // if we have got a contract record but we don't have an item record
			{
				// set the contract record field on the current record
				currentRecord.setValue({
					fieldId: 'custrecord_bbs_ims_usage_data_contract',
					value: contractRecord
				});
				
				// set the item record field on the current record to null
				currentRecord.setValue({
					fieldId: 'custrecord_bbs_ims_usage_data_item_rec',
					value: null
				});
				
				// set the error messages field on the current record
				currentRecord.setValue({
					fieldId: 'custrecord_bbs_ims_usage_data_errors',
					value: 'No matching item record found'
				});
			}
		else if (contractRecord == null && itemRecord == null) // if we have neither got an item record or a contract record
			{
				// set the contract record field on the current record to null
				currentRecord.setValue({
					fieldId: 'custrecord_bbs_ims_usage_data_contract',
					value: null
				});
				
				// set the item record field on the current record to null
				currentRecord.setValue({
					fieldId: 'custrecord_bbs_ims_usage_data_item_rec',
					value: null
				});
				
				// set the error messages field on the current record
				currentRecord.setValue({
					fieldId: 'custrecord_bbs_ims_usage_data_errors',
					value: 'No matching contract record found<br>No matching item record found'
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
