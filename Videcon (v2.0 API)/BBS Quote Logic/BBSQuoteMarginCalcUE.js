/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/search', 'N/file', 'N/config'],
/**
 * @param {record} record
 * @param {search} search
 */
function(runtime, record, search, file, config) 
{
	
	function quoteAfterSubmit(scriptContext) 
	    {
    		if(scriptContext.type == 'create' || scriptContext.type == 'edit')
    			{
    				var currentRecord 		= scriptContext.newRecord;
    				var currentRecordType 	= currentRecord.type;
    				var currentRecordId 	= currentRecord.id;
    				

    				currentRecord = record.load({
		    									type:		currentRecordType,
		    									id:			currentRecordId
		    									});
		    				
		    				
		    		var itemCount = currentRecord.getLineCount({sublistId:	'item'});
		    				
		    		for (var int = 0; int < itemCount; int++) 
			    		{
			    			//Calculate the margin based on average cost or purchase price if avg not set
			        		//
			        		var itemId 		= null;
			        		var amount 		= null;
			        		var rate 		= null;
			        		var quantity	= null;
			        		
			        		//Get values from the sublist line
			        		//
			    			itemId 		= 		 currentRecord.getSublistValue({sublistId: 'item', fieldId: 'item',     line: int});
			    			amount 		= Number(currentRecord.getSublistValue({sublistId: 'item', fieldId: 'amount',   line: int}));
			    			rate 		= Number(currentRecord.getSublistValue({sublistId: 'item', fieldId: 'rate',     line: int}));
			    			quantity 	= Number(currentRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: int}));
			        		
			        		if(itemId)
			        			{
			        				var itemData = search.lookupFields({
			        													type:		search.Type.ITEM,
			        													id:			itemId,
			        													columns:	['averagecost','cost','costestimatetype','costestimate']
			        													});
			        				
			        				var costEstimateType	= itemData.costestimatetype;
			        				var itemAverageCost 	= Number(0);
			        				var itemCost 			= Number(0);
			        				var lineCost 			= Number(0);
			        				var itemCostEstimate	= Number(0);
			        				
			        				if(costEstimateType == 'Item Defined Cost')
			        					{
			    	    					itemCostEstimate = Number(itemData.costestimate);
			    							itemCost 		= Number(itemData.cost);
			    							lineCost 		= (itemCostEstimate === 0 ? itemCost : itemCostEstimate);	//If cost estimate is 0 then use purchase price
			        					}
			        				else
			        					{
			        						itemAverageCost = Number(itemData.averagecost);
			        						itemCost 		= Number(itemData.cost);
			        						lineCost 		= (itemAverageCost === 0 ? itemCost : itemAverageCost);	//If average cost is 0 then use purchase price
			        					}
			        				
			        				var newLineCost 		= lineCost * quantity;
			        				var lineMargin 		= amount - newLineCost;
			        				var lineMarginPc	= Number(((lineMargin / (amount == 0 ? 0.01 : amount)) * 100.00).toFixed(2));
			        				
			        				currentRecord.setSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_line_cost_net',     value: newLineCost, line: int});
			        				currentRecord.setSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_line_profit_net',   value: lineMargin, line: int});
			        				currentRecord.setSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_lineprofitpercent', value: lineMarginPc, line: int});
			        				
			        				currentRecord.setSublistValue({sublistId: 'item', fieldId: 'costestimaterate', value: lineCost, line: int});
			        				currentRecord.setSublistValue({sublistId: 'item', fieldId: 'costestimate', value: newLineCost, line: int});
			        			}

						}
		    				
		  			try
		   				{
				   			currentRecord.save({
				   								doSourcing:				true,
				   								ignoreMandatoryFields:	true
				   								});
		    			}
		    		catch(err)
		    			{
			    			log.error({
										title:		'Error saving sales order record',
										details:	err
										});
		    			}
    			}
	    }

	//Page through results set from search
    //
    function getResults(_searchObject)
	    {
	    	var results = [];
	
	    	var pageData = _searchObject.runPaged({pageSize: 1000});
	
	    	for (var int = 0; int < pageData.pageRanges.length; int++) 
	    		{
	    			var searchPage = pageData.fetch({index: int});
	    			var data = searchPage.data;
	    			
	    			results = results.concat(data);
	    		}
	
	    	return results;
	    }
    
    return 	{
        		afterSubmit: 	quoteAfterSubmit
    		};
    
});
