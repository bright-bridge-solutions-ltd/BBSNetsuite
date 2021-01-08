/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/format'],
function(record, format) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	var recordID = 165664;
    	
    	try
			{
	    		// load the sales order
				var soRecord = record.load({
					type: record.Type.SALES_ORDER,
					id: recordID,
					isDynamic: true
				});
				
				// get count of item lines
				var lineCount = soRecord.getLineCount({
					sublistId: 'item'
				});
				
				// loop through item lines
				for (var i = lineCount; i > 0; i--)
					{
						// select the line item
						soRecord.selectLine({
							sublistId: 'item',
							line: i
						});
						
						// get the value of the 'Usage Consolidated' checkbox for the line
						var usageConsolidated = soRecord.getCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_bbs_usage_consolidated'
						});
						
						// check the 'Usage Consolidated' checkbox is unchecked
						if (usageConsolidated == false)
							{
								// remove the line from the sales order
								soRecord.removeLine({
								    sublistId: 'item',
								    line: i-1,
								    ignoreRecalc: true
								});
							}
					}
				
				// call function to search and return consolidated lines to be added to the sales order
		    	/*var consolidatedLines = consolidateSOLines(recordID);
		    	
		    	// run search and process results
		    	consolidatedLines.run().each(function(result){
		    		
		    		// retrieve search results
		    		var item = result.getValue({
		    			name: 'item',
		    			summary: 'GROUP'
		    		});
		    		
		    		var searchDate = result.getValue({
		    			name: 'formuladate',
		    			summary: 'GROUP'
		    		});
		    		
		    		// do we have a search date
		    		if (searchDate)
		    			{
		    	    		// format searchDate as a date object
							searchDate = format.parse({
								type: format.Type.DATE,
								value: searchDate
							});
		    			}
		    		
		    		var rate = result.getValue({
		    			name: 'fxrate',
		    			summary: 'GROUP'
		    		});
		    		
		    		var quantity = result.getValue({
		    			name: 'quantity',
		    			summary: 'SUM'
		    		});
		    		
		    		var contractRecord = result.getValue({
		    			name: 'internalid',
		    			join: 'custcol_bbs_contract_record',
		    			summary: 'MAX'
		    		});
		    		
		    		// select a new line on the sublist
		    		soRecord.selectNewLine({
		    			sublistId: 'item'
		    		});
		    		
		    		// set fields on the new line
		    		soRecord.setCurrentSublistValue({
		    			sublistId: 'item',
		    			fieldId: 'item',
		    			value: item
		    		});
		    		
		    		soRecord.setCurrentSublistValue({
		    			sublistId: 'item',
		    			fieldId: 'quantity',
		    			value: quantity
		    		});
		    		
		    		soRecord.setCurrentSublistValue({
		    			sublistId: 'item',
		    			fieldId: 'rate',
		    			value: rate
		    		});
		    		
		    		soRecord.setCurrentSublistValue({
		    			sublistId: 'item',
		    			fieldId: 'custcol_bbs_contract_record',
		    			value: contractRecord
		    		});
		    		
		    		soRecord.setCurrentSublistValue({
		    			sublistId: 'item',
		    			fieldId: 'custcol_bbs_so_search_date',
		    			value: searchDate
		    		});
		    		
		    		soRecord.setCurrentSublistValue({
		    			sublistId: 'item',
		    			fieldId: 'custcol_bbs_usage_updated',
		    			value: true
		    		});
		    		
		    		soRecord.setCurrentSublistValue({
		    			sublistId: 'item',
		    			fieldId: 'custcol_bbs_usage_consolidated',
		    			value: true
		    		});
		    		
		    		// commit the line
		    		soRecord.commitLine({
		    			sublistId: 'item'
		    		});
		    		
		    		// continue processing search results
		    		return true;
		    		
		    	});*/
				
				// get count of item lines
				var lineCount = soRecord.getLineCount({
					sublistId: 'item'
				});
				
				// save the sales order
		    	soRecord.save();
		    	
		    	log.audit({
		    		title: 'Sales Order Updated',
		    		details: recordID
		    	});
	
			}
		catch(e)
			{
				log.error({
					title: 'Error Updating Record',
					details: e
				});
			}

    }

    return {
        execute: execute
    };
    
});
