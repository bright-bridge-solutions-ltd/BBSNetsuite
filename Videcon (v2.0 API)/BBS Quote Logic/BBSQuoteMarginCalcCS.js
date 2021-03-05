/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
/**
 * @param {currentRecord} currentRecord
 * @param {record} record
 * @param {search} search
 */
function(search) {
    
    
    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) 
	    {
    		if(scriptContext.sublistId == 'item' && ['quantity','rate','amount'].indexOf(scriptContext.fieldId) != -1)
    			{	
    				debugger;
    				
    				calculateMargin(scriptContext);
    			}
	    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) 
	    {
    		if(scriptContext.sublistId == 'item' && ['quantity','rate','amount'].indexOf(scriptContext.fieldId) != -1)
    			{
    				debugger;
    				
    				calculateMargin(scriptContext);
    			}
	    }

    
    function calculateMargin(scriptContext)
    	{
    		//Calculate the margin based on average cost or purchase price if avg not set
    		//
    		var itemId 		= null;
    		var amount 		= null;
    		var rate 		= null;
    		var quantity	= null;
    		
    		//Get values from the sublist line
    		//
			itemId 		= scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'item', fieldId: 'item'});
			amount 		= Number(scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'item', fieldId: 'amount'}));
			rate 		= Number(scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'item', fieldId: 'rate'}));
			quantity 	= Number(scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'item', fieldId: 'quantity'}));

    		
    		if(itemId != null)
    			{
    				var itemData = search.lookupFields({
    													type:		search.Type.ITEM,
    													id:			itemId,
    													columns:	['averagecost','cost']
    													});
    				
    				var itemAverageCost = Number(itemData.averagecost);
    				var itemCost 		= Number(itemData.cost);
    				var lineCost 		= (itemAverageCost === 0 ? itemCost : itemAverageCost);	//If average cost is 0 then use purchase price
    				
    				lineCost 			= lineCost * quantity;
    				
    				var lineMargin 		= amount - lineCost;
    				var lineMarginPc	= Number(((lineMargin / (amount == 0 ? 0.01 : amount)) * 100.00).toFixed(2));
    				
    				scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_line_cost_net',     value: lineCost, ignoreFieldChange: true});
    				scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_line_profit_net',   value: lineMargin, ignoreFieldChange: true});
    				scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_lineprofitpercent', value: lineMarginPc, ignoreFieldChange: true});
    				
    			}
    	}

    return {
	        fieldChanged: fieldChanged,
	        postSourcing: postSourcing
    		};
    
});
