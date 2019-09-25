/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/format'],
/**
 * @param {record} record
*/		
function(search, record, format) {
   
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
    	
    	// declare variables
    	var itemID;
    	var unitPrice;
    	var quantity;
    	var usage;
    	var searchItem;
    	
    	// get the current record
    	var currentRecord = scriptContext.newRecord;
    	
    	// get the ID of the associated contract record
    	var contractRecord = currentRecord.getValue({
    		fieldId: 'custbody_bbs_contract_record'
    	});
    	
    	// get the transaction date
    	var tranDate = currentRecord.getValue({
    		fieldId: 'trandate'
    	});
    	
    	// create a new Date object and set it's value to be the tranDate
    	tranDate = new Date(tranDate);
    	
    	// create a new Date object
    	var startDate = new Date();
    	
    	// set the date of the startDate object
    	startDate.setMonth(tranDate.getMonth()+1);
    	startDate.setDate(0);
    	startDate.setFullYear(tranDate.getFullYear());
    	
    	// format startDate so it can be used as a search filter
    	startDate = format.format({
				value: startDate,
				type: format.Type.DATE
		});
    	
    	log.debug({
    		title: 'Start Date',
    		details: startDate
    	});
    	
    	// create a new Date object
    	var endDate = new Date();
    	
    	// set the date of the endDate object
    	endDate.setMonth(tranDate.getMonth()+2);
    	endDate.setDate(0);
    	endDate.setFullYear(tranDate.getFullYear());   	
    	
    	// format endDate so it can be used as a search filter
    	endDate = format.format({
				value: endDate,
				type: format.Type.DATE
		});
    	
    	log.debug({
    		title: 'End Date',
    		details: endDate
    	});
    	
    	// get count of item lines
    	var lineCount = currentRecord.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// run search to find contract period detail records to be updated
    	var periodDetailSearch = search.create({
			type: 'customrecord_bbs_contract_period',
			
			columns: [{
				name: 'internalid'
			},
					{
				name: 'custrecord_bbs_contract_period_product'
			}],
			
			filters: [{
				name: 'custrecord_bbs_contract_period_contract',
				operator: 'anyof',
				values: [contractRecord]
			},
					{
				name: 'custrecord_bbs_contract_period_start',
				operator: 'on',
				values: [startDate]
			},
					{
				name: 'custrecord_bbs_contract_period_end',
				operator: 'on',
				values: [endDate]
    		}],
		});
    	
    	// process search results
		periodDetailSearch.run().each(function(result) {
			
			// get the internal ID of the item from the search results
			searchItem = result.getValue({
				name: 'custrecord_bbs_contract_period_product'
			});
			
			// loop through line count
	    	for (var i = 0; i < lineCount; i++)
	    		{
		    		// get the internal ID of the item for the line
	    			itemID = currentRecord.getSublistValue({
	    				sublistId: 'item',
	    				fieldId: 'item',
	    				line: i
	    			});
	    			
	    			// check if the itemID and searchItem variables are the same
	    			if (itemID == searchItem)
	    				{
		    				// get the record ID from the search results
		    	    		recordID = result.getValue({
		    	    			name: 'internalid'
		    	    		});
		    	    		
		    	    		// get the unit price for the line
		        			unitPrice = currentRecord.getSublistValue({
		        				sublistId: 'item',
		        				fieldId: 'rate',
		        				line: i
		        			});
		        			
		        			// get the quantity for the line
		        			quantity = currentRecord.getSublistValue({
		        				sublistId: 'item',
		        				fieldId: 'quantity',
		        				line: i	
		        			});
		        			
		        			// multiply the unitPrice by the quantity to calculate the usage
		        			usage = unitPrice * quantity;
		        			
		        			// update the usage on the period detail record
		        			record.submitFields({
		        				type: 'customrecord_bbs_contract_period',
		        				id: recordID,
		        				values: {
		        					custrecord_bbs_contract_period_prod_use: usage
		        				}
		        			});
		        			
		        			// break the loop
		        			break;		    	    		
	    				}
	    		}
	    	
	    	// continue processing search results
	    	return true;
		});
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
