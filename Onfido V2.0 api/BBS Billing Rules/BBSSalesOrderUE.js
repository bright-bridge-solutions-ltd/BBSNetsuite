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
    	
    	// check if the record is being copied
    	if (scriptContext.type == 'copy')
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    		
    			// get a count of item lines on the record
		    	var lineCount = currentRecord.getLineCount({
		    		sublistId: 'item'
		    	});
		    	
		    	// loop through item lines
		    	for (var x = 0; x < lineCount; x++)
		    		{
			    		// untick the 'Usage Updated' checkbox on the line
		        		currentRecord.setSublistValue({
		        			sublistId: 'item',
		        			fieldId: 'custcol_bbs_usage_updated',
		        			value: false,
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
    			// get the ID of the current record
    			var recordID = scriptContext.newRecord.id;
    			
    			// reload the record
    			var soRecord = record.load({
    				type: record.Type.SALES_ORDER,
    				id: recordID,
    				isDynamic: true
    			});
    	
		    	// get count of item lines
		    	var lineCount = soRecord.getLineCount({
		    		sublistId: 'item'
		    	});
		    	
		    	// loop through line count
		    	for (var i = 0; i < lineCount; i++)
		    		{
			    		// select the line
		    			soRecord.selectLine({
		    				sublistId: 'item',
		    				line: i
		    			});
		    		
		    			// get the value of the 'Usage Updated' checkbox for the line
		    			var usageUpdated = soRecord.getSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'custcol_bbs_usage_updated',
		    				line: i
		    			});
		    			
		    			// get the search date for the line
		    			var searchDate = soRecord.getCurrentSublistValue({
		    				sublistId: 'item',
		    				fieldId: 'custcol_bbs_so_search_date'
		    			});
		    			
		    			// check that the usageUpdated variable returns false (checkbox is NOT ticked) and the searchDate variable returns a value
		    			if (usageUpdated == false && searchDate != '')
		    				{
		    					// get the internal ID of the item for the line
				    			var itemID = soRecord.getCurrentSublistValue({
				    				sublistId: 'item',
				    				fieldId: 'item'
				    			});
		    			
				    			// get the internal ID of the contract record for the line
				    			var contractRecord = soRecord.getCurrentSublistValue({
				    				sublistId: 'item',
				    				fieldId: 'custcol_bbs_contract_record'
				    			});
				    			
				    			// format searchDate as a date object
				            	var searchDate = format.parse({
				        				value: searchDate,
				        				type: format.Type.DATE
				        		});
				            	
				            	// set the startDate to be the first day of the searchDate month
				    			var startDate = new Date(searchDate.getFullYear(), searchDate.getMonth(), 1);
				    			
				    			// set the endDate to be the last day of the startDate month
				    			var endDate = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0);
				    			
				    			// format startDate so it can be used as a search filter
				    			startDate = format.format({
				    				value: startDate,
				    				type: format.Type.DATE
				    			});
				    			
				    			// format endDate so it can be used as a search filter
				    			endDate = format.format({
				    				value: endDate,
				    				type: format.Type.DATE
				    			});
				    			
				    			// run search to find period detail records to be updated
				    			var periodDetailSearch = search.create({
				        			type: 'customrecord_bbs_contract_period',
				        			
				        			columns: [{
				        				name: 'internalid'
				        			},
				        					{
				        				name: 'custrecord_bbs_contract_period_prod_use'
				        			},
				        					{
				        				name: 'custrecord_bbs_contract_period_quantity'
				        			}],
				        			
				        			filters: [{
				        				name: 'custrecord_bbs_contract_period_contract',
				        				operator: 'anyof',
				        				values: [contractRecord]
				        			},
				        					{
				        				name: 'custrecord_bbs_contract_period_product',
				        				operator: 'anyof',
				        				values: [itemID]
				        			},
				        					{
				        				name: 'custrecord_bbs_contract_period_start',
				        				operator: 'onorafter',
				        				values: [startDate]
				        			},
				        					{
				        				name: 'custrecord_bbs_contract_period_end',
				        				operator: 'onorbefore',
				        				values: [endDate]
				            		}],
				        		});
				    			
				    			// process search results
				        		periodDetailSearch.run().each(function(result) {
				        			
				        			// get the record ID from the search results
				    	    		var recordID = result.getValue({
				    	    			name: 'internalid'
				    	    		});
				    	    		
				    	    		// get the product usage from the search results
				    	    		var currentUsage = result.getValue({
				    	    			name: 'custrecord_bbs_contract_period_prod_use'
				    	    		});
				    	    		
				    	    		// check if the currentUsage variable returns a value
				    	    		if (currentUsage)
				    	    			{
				    	    				// use parseFloat to convert to floating point number
				    	    				currentUsage = parseFloat(currentUsage);
				    	    			}
				    	    		else
				    	    			{
				    	    				// set the currentUsage variable to 0.00
				    	    				currentUsage = 0.00;
				    	    			}
				    	    		
				    	    		// get the current quantity from the search results
				    	    		var currentQuantity = result.getValue({
				    	    			name: 'custrecord_bbs_contract_period_quantity'
				    	    		});
				    	    		
				    	    		// check if the currentQuantity variable returns a value
				    	    		if (currentQuantity)
				    	    			{
				    	    				// use parseInt to convert to an integer number
				    	    				currentQuantity = parseInt(currentQuantity);
				    	    			}
				    	    		else
				    	    			{
				    	    				// set the currentQuantity variable to 0
				    	    				currentQuantity = 0;
				    	    			}
				    	    		
				    	    		// get the unit price for the line
				    	    		var unitPrice = soRecord.getCurrentSublistValue({
				        				sublistId: 'item',
				        				fieldId: 'rate'
				        			});
				        			
				        			// get the quantity for the line
				    	    		var quantity = soRecord.getCurrentSublistValue({
				        				sublistId: 'item',
				        				fieldId: 'quantity'
				        			});
				        			
				        			// multiply the unitPrice by the quantity to calculate the usage
				    	    		var usage = unitPrice * quantity;
				    	    		
				    	    		// add the usage to the currentUsage to calculate the updatedUsage
				    	    		var updatedUsage = currentUsage + usage;
				    	    		
				    	    		// add the quantity to the currentQuantity to calculate the updatedQuantity
				    	    		var updatedQuantity = currentQuantity + quantity;
				        			
				        			// update the usage on the period detail record
				        			record.submitFields({
				        				type: 'customrecord_bbs_contract_period',
				        				id: recordID,
				        				values: {
				        					custrecord_bbs_contract_period_prod_use: updatedUsage,
				        					custrecord_bbs_contract_period_quantity: updatedQuantity,
				        					custrecord_bbs_contract_period_rate: unitPrice
				        				}
				        			});
				
				        		});
				        		
				        		// tick the 'Usage Updated' checkbox on the line
				        		soRecord.setCurrentSublistValue({
				        			sublistId: 'item',
				        			fieldId: 'custcol_bbs_usage_updated',
				        			value: true
				        		});
				        		
				        		// commit the line
				        		soRecord.commitLine({
									sublistId: 'item'
								});
		    				}
		    		}
		    	
		    	// save the record
		    	soRecord.save();
    		}
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
