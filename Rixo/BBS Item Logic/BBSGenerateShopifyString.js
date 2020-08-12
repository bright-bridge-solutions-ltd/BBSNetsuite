/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record'],
function(runtime, search, record) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	// retrieve script parameters
    	var integrationItem = runtime.getCurrentScript().getParameter({
    		name: 'custscript_bbs_shopify_string_int_item'
    	});
    	
    	// start off the shopifyString
    	var shopifyString = '"[';
    	
    	// run search to find records to be processed
    	search.create({
    		type: search.Type.INVENTORY_ITEM,
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
    				{
    			name: 'parent',
    			operator: search.Operator.NONEOF,
    			values: ['@NONE@']
    		},
    				{
    			name: 'matrix',
    			operator: search.Operator.IS,
    			values: ['T']
    		},
    				{
    			name: 'custitem_fa_shopify_flag',
    			operator: search.Operator.ANYOF,
    			values: [1, 4] // 1 = Add/Update Item, 4 = Post Children as Stand-Alone
    		}],
    		
    		columns: [{
    			name: 'parent',
    			summary: 'GROUP',
    			sort: search.Sort.ASC
    		},
    				{
    			name: 'formulatext',
    			summary: 'MAX',
    			formula: "REPLACE(NS_CONCAT(REPLACE({displayname}, ' ', '-')), ',','|')"
    		}],
    		
    	}).run().each(function(result){
    		
    		// add opening tag to the shopifyString
    		shopifyString += '\\"';

    		// retrieve the search result
    		var itemString = result.getValue({
    			name: 'formulatext',
    			summary: 'MAX'
    		});
    		
    		// add the itemString to the shopifyString
    		shopifyString += itemString;
    		
    		// add closing tags to the shopifyString
    		shopifyString += '\\"';
    		shopifyString += ',';
    		
    		// continue processing search results
    		return true;
    		
    	});
    	
    	// remove the last character from shopifyString
    	shopifyString = shopifyString.slice(0, -1);
    	
    	// finish off the shopifyString
    	shopifyString += ']';
    	
    	try
    		{
    			// update fields on the integration item record
    			record.submitFields({
    				type: record.Type.NON_INVENTORY_ITEM,
    				id: integrationItem,
    				values: {
    					custitem_bbs_shopify_string: shopifyString
    				}
    			});
    			
    			log.audit({
    				title: 'Integration Item Updated',
    				details: integrationItem
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Integration Item',
    				details: e
    			});
    		}

    }

    return {
        execute: execute
    };
    
});
