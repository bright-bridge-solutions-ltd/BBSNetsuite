/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record'],
function(runtime, search, record) {
   
    // retrieve script parameters. Parameters are global variables so can be accessed throughout the script
	var currentScript = runtime.getCurrentScript();
	
	savedSearchID = currentScript.getParameter({
		name: 'custscript_bbs_avg_sold_qty_saved_search'
	});
	
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
    	
    	// run search to find items to be processed
    	return search.create({
    		type: 'item',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		}],
    		
    		columns: [{
    			name: 'itemid'
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
    	var searchResult 	= 	JSON.parse(context.value);
    	var itemType		=	searchResult.recordType;
    	var itemName		=	searchResult.values['itemid'];
    	var itemID			=	searchResult.id;
    	
    	log.audit({
    		title: 'Processing Item',
    		details: 'Item Type: ' + itemType + '<br>Item Name: ' + itemName + '<br>Item ID: ' + itemID
    	});
    	
    	// call function to run search for this item to return average sold quantity. Pass itemID
    	var avgSoldQty = searchAvgSoldQty(itemID);
    	
    	try
    		{
    			// update the '7 DAY AVERAGE SOLD QUANTITY' field on the item record
    			record.submitFields({
    				type: itemType,
    				id: itemID,
    				values: {
    					custitem_bbs_7_day_avg_sales: avgSoldQty
    				}
    			});
    			
    			log.audit({
    				title: 'Item Record Updated',
    				details: itemID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Item Record ' + itemID,
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
    
    // ==========================================================
    // FUNCTION TO RUN SEARCH TO RETURN THE AVERAGE SOLD QUANTITY
    // ==========================================================
    
    function searchAvgSoldQty(itemID) {
    	
    	// declare and initialize variables
    	var soldQty = 0;
    	
    	// load search using script parameter
    	var avgQtySearch = search.load({
    		id: savedSearchID
    	});
    	
    	// add the itemID as a filter to the search
    	var filters = avgQtySearch.filters;
       
    	var itemFilter = search.createFilter({
    		name: 'item',
    		operator: search.Operator.ANYOF,
            values: itemID
    	});

        filters.push(itemFilter); //add the filter using .push() method
        
        // run search and process results
        avgQtySearch.run().each(function(result){
        	
        	// get the sold quantity from the search
        	soldQty = result.getValue({
        		name: 'formulanumeric',
        		summary: 'MAX'
        	});
        	
        });
        
        // return soldQty to main script function
        return soldQty;
    	
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
