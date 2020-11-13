/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record'],
function(runtime, search, record) {
   
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script
	adjustmentItem = currentScript.getParameter({
    	name: 'custscript_bbs_min_usage_adj_item'
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
    	
    	// create search to find sales orders to be processed
    	return search.create({
    		type: search.Type.SALES_ORDER,
			
			filters: [{
				name: 'status',
				operator: search.Operator.ANYOF,
				values: ['SalesOrd:F'] // SalesOrd:F = Pending Billing
			},
    				{
				name: 'mainline',
				operator: search.Operator.IS,
				values: ['T']
			},
					{
				name: 'amount',
				operator: search.Operator.EQUALTO,
				values: [0]
			}],
			
			columns: [{
				name: 'custbody_bbs_contract_record'
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
    	var searchResult 		= JSON.parse(context.value);
    	var contractRecordID	= searchResult.values['custbody_bbs_contract_record'].value;
    	
    	log.audit({
    		title: 'Processing Contract Record',
    		details: contractRecordID
    	});
    	
    	// call function to check if the contract has any products
    	var numberOfProducts = searchContractProducts(contractRecordID);
    	
    	// if we DO NOT have any products on the contract
    	if (numberOfProducts == 0)
    		{
    			// call function to create a product on the contract. Pass contractRecordID
    			createContractProduct(contractRecordID);
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
    function summarize(context) {
    	
    	log.audit({
    		title: 'Units Used',
    		details: context.usage
    	});
    	
    	log.audit({
    		title: 'Number of Yields',
    		details: context.yields
    	});

    }
    
    // =============================================
    // FUNCTION TO CHECK NUMBER OF CONTRACT PRODUCTS
    // =============================================
    
    function searchContractProducts(contractRecordID) {
    	
    	// declare and initialize variables
    	var numberOfProducts = 0;
    	
    	// run search to check how many products exist on the contract
    	search.create({
    		type: 'customrecord_bbs_contract_product',
    		
    		filters: [{
    			name: 'custrecord_contract_product_parent',
    			operator: search.Operator.ANYOF,
    			values: [contractRecordID]
    		}],
    		
    		columns: [{
    			name: 'internalid',
    			summary: search.Summary.COUNT
    		}],
    	
    	}).run().each(function(result){
    		
    		// get the number of products from the search
    		numberOfProducts = result.getValue({
    			name: 'internalid',
    			summary: search.Summary.COUNT
    		});
    		
    	});
    	
    	// return numberOfProducts variable to main script function
    	return numberOfProducts;
    	
    }
    
    // ===================================================
    // FUNCTION TO CREATE A PRODUCT ON THE CONTRACT RECORD
    // ===================================================
    
    function createContractProduct(contractRecordID) {
    	
    	try
    		{
    			// create a new contract item
    			var newContractItem = record.create({
    				type: 'customrecord_bbs_contract_product'
    			});
    			
    			newContractItem.setValue({
    				fieldId: 'custrecord_contract_product_parent',
    				value: contractRecordID
    			});
    			
    			newContractItem.setValue({
    				fieldId: 'custrecord_contract_product_product',
    				value: adjustmentItem
    			});
    			
    			var newContractItemID = newContractItem.save();
    			
    			log.audit({
    				title: 'Contract Item Created',
    				details: 'Item ID: ' + newContractItemID + '<br>Contract ID: ' + contractRecordID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Creating Contract Item',
    				details: 'Contract ID: ' + contractRecordID + '<br>Error: ' + e
     			});
    		}
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
