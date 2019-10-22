/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
/**
 * @param {record} record
 * @param {search} search
 */
function(search, record) {
   
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
    	
    	// run search to find records to be updated
    	return search.create({
    		type: search.Type.SALES_ORDER,
    		
    		columns: [{
    			name: 'internalid'
    		}],
    		
    		filters: [{
    			name: 'mainline',
    			operator: 'is',
    			values: ['T']
    		}],
    	});

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// retrieve search result
    	var searchResult = JSON.parse(context.value);
    	
    	// retrieve ID of record from search
    	var recordID = searchResult.id;
    	
    	log.audit({
    		title: 'Processing Sales Order',
    		details: 'Record ID: ' + recordID
    	});
    	
    	// load the sales order record
    	var soRecord = record.load({
    		type: record.Type.SALES_ORDER,
    		id: recordID
    	});
    	
    	// get the internal ID of the currency from the soRecord
    	var currency = soRecord.getValue({
    		fieldId: 'currency'
    	});
    	
    	// check if the currency is 1 (GBP)
    	if (currency == '1')
    		{
    			// set the 'custbody_bbs_bank_account' field on the soRecord
    			soRecord.setValue({
    				fieldId: 'custbody_bbs_bank_account',
    				value: '1' // 1 = HSBC IF Sterling Bank Account
    			});
    		}
    	else // currency is NOT 1 (GBP)
    		{
	    		// set the 'custbody_bbs_bank_account' field on the soRecord
				soRecord.setValue({
					fieldId: 'custbody_bbs_bank_account',
					value: '4' // 4 = HSBC IF Euro Bank Account
				});
    		}
    	
    	// submit the soRecord
    	try
    		{
    			soRecord.save({
		    		enableSourcing: false,
		    		ignoreMandatoryFields: true
		    	});
    			
    			log.audit({
    				title: 'Record Updated',
    				details: 'Record ID: ' + recordID
    			});
    		}
    	catch(error)
    		{
    			log.error({
    				title: 'Error Updating Record',
    				details: 'Record ID: ' + recordID + ' | Error: ' + error
    			});
    		}
    }

    return {
        getInputData: getInputData,
        map: map
    };
    
});
