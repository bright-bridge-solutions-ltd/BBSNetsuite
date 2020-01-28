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
    	
    	// create search to find revenue arrangement records to be processed
    	return search.create({
    		type: search.Type.REVENUE_ARRANGEMENT,
    		
    		filters: [{
    			name: 'mainline',
    			operator: 'is',
    			values: ['T']
    		}],
    		
    		columns: [{
    			name: 'entity',
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
    	
    	// get the internal ID of the revenue arrangement record
    	var recordID = searchResult.id;
    	
    	log.audit({
    		title: 'Processing Record',
    		details: recordID
    	});
    	
    	// load the revenue arrangement record
    	var revArrRecord = record.load({
    		type: record.Type.REVENUE_ARRANGEMENT,
    		id: recordID,
    		isDynamic: true
    	});
    	
    	// get count of revenue element lines on the revenue arrangement record
    	var lineCount = revArrRecord.getLineCount({
    		sublistId: 'revenueelement'
    	});
    	
    	// loop through line count
    	for (var i = 0; i < lineCount; i++)
    		{
    			// select the sublist line
    			revArrRecord.selectLine({
    			    sublistId: 'revenueelement',
    			    line: i
    			});
    		
    			// get the source transaction
    			var sourceTransaction = revArrRecord.getCurrentSublistValue({
    				sublistId: 'revenueelement',
    				fieldId: 'referenceid'
    			});
    			
    			// remove 'SalesOrd_' from the sourceTransaction variable
    			sourceTransaction = sourceTransaction.replace("SalesOrd_", "");
    			
    			// load the sales order record
    			var salesOrderRecord = record.load({
    				type: record.Type.SALES_ORDER,
    				id: sourceTransaction,
    				isDynamic: true
    			});
    			
    			// get the revenue start and end dates from the first line of the item sublist
    			var revenueStart = salesOrderRecord.getSublistValue({
    				sublistId: 'item',
    				fieldId: 'custcol_bbs_revenue_rec_start_date',
    				line: 0
    			});
    			
    			var revenueEnd = salesOrderRecord.getSublistValue({
    				sublistId: 'item',
    				fieldId: 'custcol_bbs_revenue_rec_end_date',
    				line: 0
    			});
    			
    			// set start/end date and forecast start/end date fields on the revenue arrangement record
    			revArrRecord.setCurrentSublistValue({
    				sublistId: 'revenueelement',
        			fieldId: 'revrecstartdate',
        			value: revenueStart
        		});
    			
    			revArrRecord.setCurrentSublistValue({
    				sublistId: 'revenueelement',
    				fieldId: 'revrecenddate',
    				value: revenueEnd
    			});
    			
    			revArrRecord.setCurrentSublistValue({
    				sublistId: 'revenueelement',
    				fieldId: 'forecaststartdate',
    				value: revenueStart
    			});
    			
    			revArrRecord.setCurrentSublistValue({
    				sublistId: 'revenueelement',
    				fieldId: 'forecastenddate',
    				value: revenueEnd
    			});
    			
    			// commit the changes to the line
    			revArrRecord.commitLine({
    			    sublistId: 'revenueelement'
    			});
    		}
    	
    	try
    		{
    			// save the revenue arrangement record
    			revArrRecord.save();
    			
    			log.audit({
    				title: 'Revenue Arrangement Record Updated',
    				details: recordID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Revenue Arrangement Record',
    				details: 'Record ID: ' + recordID + '<br>Error: ' + e
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


    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
