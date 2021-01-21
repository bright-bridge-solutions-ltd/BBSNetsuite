/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record'],
function(runtime, record) 
{
   
     /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function invoiceSummaryAS(scriptContext) 
    	{
    	
	    	//Check the record is being edited or created
	    	//
	    	if (scriptContext.type == scriptContext.UserEventType.EDIT || scriptContext.type == scriptContext.UserEventType.CREATE)
	    		{
	    			//Get the current record
	    			//
	    			var recordId 		= scriptContext.newRecord.id;
	    			var currentRecord 	= record.load({type: record.Type.INVOICE, id: recordId, isDynamic: false});
	    			
	    			//Initialise summary info
	    			//
	    			var summaryInfo				= {};
	    			summaryInfo.timeSummary		= [];
	    			summaryInfo.expenseSummary	= [];
	    			summaryInfo.itemSummary		= [];
	    			summaryInfo.totalSummary	= [];
	    			
	    			//Get line counts from the sublists
	    			//
	    			var timeLines 		= currentRecord.getLineCount({sublistId: 'time'});
	    			var expensesLines 	= currentRecord.getLineCount({sublistId: 'expcost'});
	    			var itemLines 		= currentRecord.getLineCount({sublistId: 'item'});
	    			var itemCostLines 	= currentRecord.getLineCount({sublistId: 'itemcost'});
	    			
	    			//
	    			//Process the time lines
	    			//
	    			var tempTimeObj = {};
	    			
	    			for (var timeLine = 0; timeLine < timeLines; timeLine++) 
		    			{
		    				var timeAmount 		= Number(isNullorBlank(currentRecord.getSublistValue({sublistId: 'time', fieldId: 'amount', line: timeLine}),0));
		    				var timeQuantity 	= Number(isNullorBlank(currentRecord.getSublistValue({sublistId: 'time', fieldId: 'qty', line: timeLine}),0));
		    				var timeRate 		= Number(isNullorBlank(currentRecord.getSublistValue({sublistId: 'time', fieldId: 'rate', line: timeLine}),0));
		    				var timeItemName	= isNullorBlank(currentRecord.getSublistValue({sublistId: 'time', fieldId: 'itemdisp', line: timeLine}),'');
		    				var timeItemId		= currentRecord.getSublistValue({sublistId: 'time', fieldId: 'item', line: timeLine});
						
		    				//Does the item exist in the temp object
		    				//
		    				if(tempTimeObj.hasOwnProperty(timeItemId))
		    					{
		    						//Update the temp objects
		    						//
		    						tempTimeObj[timeItemId].timeQuantity 	+= timeQuantity;
		    						tempTimeObj[timeItemId].timeAmount 		+= timeAmount;
		    					}
		    				else
		    					{
		    						//Create a new entry
		    						//
		    						tempTimeObj[timeItemId] = new timeSummaryObj(timeItemId, timeItemName, timeQuantity, timeRate, timeAmount);
		    					}
	    				}
	    			
	    			//Add the time data to the time summary
	    			//
	    			for ( var key in tempTimeObj) 
		    			{
	    					summaryInfo.timeSummary.push(tempTimeObj[key])
						}
	    			
	    			
	    			//
	    			//Process the expense lines
	    			//
	    			var tempExpenseObj = {};
	    			
	    			for (var expenseLine = 0; expenseLine < expensesLines; expenseLine++) 
		    			{
		    				var expenseAmount 	= Number(isNullorBlank(currentRecord.getSublistValue({sublistId: 'expcost', fieldId: 'amount', line: expenseLine}),0));
		    				var expenseItemName	= isNullorBlank(currentRecord.getSublistValue({sublistId: 'expcost', fieldId: 'categorydisp', line: expenseLine}),'');
		    				var expenseItemId	= currentRecord.getSublistValue({sublistId: 'expcost', fieldId: 'category', line: expenseLine});
						
		    				//Does the item exist in the temp object
		    				//
		    				if(tempExpenseObj.hasOwnProperty(expenseItemId))
		    					{
		    						//Update the temp objects
		    						//
		    						tempExpenseObj[expenseItemId].expenseAmount 	+= expenseAmount;
		    					}
		    				else
		    					{
		    						//Create a new entry
		    						//
		    						tempExpenseObj[expenseItemId] = new expenseSummaryObj(expenseItemId, expenseItemName, expenseAmount);
		    					}
	    				}
	    			
	    			//Add the expense data to the expense summary
	    			//
	    			for ( var key in tempExpenseObj) 
		    			{
	    					summaryInfo.expenseSummary.push(tempExpenseObj[key])
						}
	    			
	    			
	    			//
	    			//Process the item lines
	    			//
	    			var tempItemObj = {};
	    			
	    			for (var itemLine = 0; itemLine < itemLines; itemLine++) 
		    			{
		    				var itemAmount 		= Number(isNullorBlank(currentRecord.getSublistValue({sublistId: 'item', fieldId: 'amount', line: itemLine}),0));
		    				var itemQuantity 	= Number(isNullorBlank(currentRecord.getSublistValue({sublistId: 'item', fieldId: 'qty', line: itemLine}),0));
		    				var itemRate 		= Number(isNullorBlank(currentRecord.getSublistValue({sublistId: 'item', fieldId: 'rate', line: itemLine}),0));
		    				var itemItemName	= isNullorBlank(currentRecord.getSublistValue({sublistId: 'item', fieldId: 'item_display', line: itemLine}),'');
		    				var itemItemId		= currentRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: itemLine});
						
		    				//Does the item exist in the temp object
		    				//
		    				if(tempItemObj.hasOwnProperty(itemItemId))
		    					{
		    						//Update the temp objects
		    						//
		    						tempItemObj[itemItemId].itemQuantity 	+= itemQuantity;
		    						tempItemObj[itemItemId].itemAmount 		+= itemAmount;
		    					}
		    				else
		    					{
		    						//Create a new entry
		    						//
		    						tempItemObj[itemItemId] = new itemSummaryObj(itemItemId, itemItemName, itemQuantity, itemRate, itemAmount);
		    					}
	    				}
	    			
	    			//Add the time data to the time summary
	    			//
	    			for ( var key in tempItemObj) 
		    			{
	    					summaryInfo.itemSummary.push(tempItemObj[key])
						}
	    			
	    			
	    			//
	    			//Save the summary to the invoice
	    			//
	    			try
	    				{
	    					record.submitFields({
	    										type: 		record.Type.INVOICE, 
	    										id: 		recordId, 
	    										values:		{
	    													custbody_bbs_time_summary_json:			JSON.stringify(summaryInfo.timeSummary),
	    													custbody_bbs_expenses_summary_json:		JSON.stringify(summaryInfo.expenseSummary),
	    													custbody_bbs_item_summary_json:			JSON.stringify(summaryInfo.itemSummary)
	    													}
	    										});			
	    				}
	    			catch(err)
	    				{
	    					log.error({title: 'Error updating invoice id = ' + recordId, details: err});
	    				}
    		}

    }

    //Time summary object
    //
    function timeSummaryObj(_timeItemId, _timeItemName, _timeQuantity, _timeRate, _timeAmount)
    	{
    		this.timeItemId		= _timeItemId;
    		this.timeItemName	= _timeItemName;
    		this.timeQuantity	= _timeQuantity;
    		this.timeRate		= _timeRate;
    		this.timeAmount		= _timeAmount;
    	}
   
    //Expense summary object
    //
    function expenseSummaryObj(_expenseItemId, _expenseItemName, _expenseAmount)
    	{
    		this.expenseItemId		= _expenseItemId;
    		this.expenseItemName	= _expenseItemName;
    		this.expenseAmount		= _expenseAmount;
    	}
    
    //Item summary object
    //
    function itemSummaryObj(_itemItemId, _itemItemName, _itemQuantity, _itemRate, _itemAmount)
    	{
    		this.itemItemId		= _itemItemId;
    		this.itemItemName	= _itemItemName;
    		this.itemQuantity	= _itemQuantity;
    		this.itemRate		= _itemRate;
    		this.itemAmount		= _itemAmount;
    	}
   
    
    function isNullorBlank(_string, _replacer)
		{
			return (_string == null || _string == '' ? _replacer : _string);
		}

	function isNull(_string, _replacer)
		{
			return (_string == null ? _replacer : _string);
		}
	
	
    return 	{
        	afterSubmit: invoiceSummaryAS
    		};
    
});
