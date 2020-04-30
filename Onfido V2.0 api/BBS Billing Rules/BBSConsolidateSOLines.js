/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/format'],
function(search, record, format) {
   
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
    	
    	// return search of records to be processed
    	return search.create({
    		type: search.Type.SALES_ORDER,
    		
    		filters: [{
    			name: 'mainline',
    			operator: 'is',
    			values: ['T']
    		},
    				{
				name: 'status',
				operator: 'anyof',
				values: ['SalesOrd:F'] // SalesOrd:F = Pending Billing
			},
					{
				name: 'custbody_bbs_contract_record',
				operator: 'noneof',
				values: ['@NONE@']
			},
					{
				name: 'internalid',
				operator: 'anyof',
				values: [16356]
			}],
    		
			columns: [{
				name: 'tranid'
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
    	
    	// retrieve search results
    	var searchResult = JSON.parse(context.value);
    	var recordID = searchResult.id;
    	
    	log.audit({
    		title: 'Processing Sales Order',
    		details: recordID
    	});
    	
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
    	    	var consolidatedLines = consolidateSOLines(recordID);
    	    	
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
    	    		
    	    		// format searchDate as a date object
					searchDate = format.parse({
						type: format.Type.DATE,
						value: searchDate
					});
    	    		
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

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function consolidateSOLines(recordID)
    	{
    		// return search of consolidated lines
    		return search.create({
    			type: search.Type.SALES_ORDER,
    			
    			filters: [{
    				name: 'internalid',
    				operator: 'anyof',
    				values: [recordID]
    			},
    					{
    				name: 'mainline',
    				operator: 'is',
    				values: ['F']
    			},
    					{
    				name: 'cogs',
    				operator: 'is',
    				values: ['F']
    			},
    					{
    				name: 'shipping',
    				operator: 'is',
    				values: ['F']
    			},
    					{
    				name: 'taxline',
    				operator: 'is',
    				values: ['F']
    			},
    					{
    				name: 'custcol_bbs_usage_consolidated',
    				operator: 'is',
    				values: ['F']
    			}],
    			
    			columns: [{
    				name: 'item',
    				summary: 'GROUP'
    			},
    					{
    				name: 'formuladate',
    				summary: 'GROUP',
    				formula: 'LAST_DAY({custcol_bbs_so_search_date})'
    			},
    					{
    				name: 'fxrate',
    				summary: 'GROUP'
    			},
    					{
    				name: 'quantity',
    				summary: 'SUM'
    			},
    					{
    				name: 'internalid',
    				join: 'custcol_bbs_contract_record',
    				summary: 'MAX'
    			}],	
    			
    		});
    	}

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
