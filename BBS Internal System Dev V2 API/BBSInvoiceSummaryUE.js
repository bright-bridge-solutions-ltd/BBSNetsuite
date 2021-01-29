/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/format', 'N/search'],
function(runtime, record, format, search) 
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
	    			summaryInfo.timeDetail		= [];
	    			summaryInfo.expenseDetail	= [];
	    			
	    			//Get line counts from the sublists
	    			//
	    			var timeLines 		= currentRecord.getLineCount({sublistId: 'time'});
	    			var expensesLines 	= currentRecord.getLineCount({sublistId: 'expcost'});
	    			var itemLines 		= currentRecord.getLineCount({sublistId: 'item'});
	    			var itemCostLines 	= currentRecord.getLineCount({sublistId: 'itemcost'});
	    			
	    			//
	    			//Process the time lines
	    			//
	    			var tempTimeObj 		= {};
	    			var tempTimeDetailObj	= {};
	    			
	    			for (var timeLine = 0; timeLine < timeLines; timeLine++) 
		    			{
		    				var timeAmount 		= Number(isNullorBlank(currentRecord.getSublistValue({sublistId: 'time', fieldId: 'amount', line: timeLine}),0));
		    				var timeQuantity 	= Number(isNullorBlank(currentRecord.getSublistValue({sublistId: 'time', fieldId: 'qty', line: timeLine}),0));
		    				var timeRate 		= Number(isNullorBlank(currentRecord.getSublistValue({sublistId: 'time', fieldId: 'rate', line: timeLine}),0));
		    				var timeItemName	= isNullorBlank(currentRecord.getSublistValue({sublistId: 'time', fieldId: 'itemdisp', line: timeLine}),'');
		    				var timeItemId		= currentRecord.getSublistValue({sublistId: 'time', fieldId: 'item', line: timeLine});
		    				var timeBillDate	= currentRecord.getSublistValue({sublistId: 'time', fieldId: 'billeddate', line: timeLine});
		    				var timeEmployee	= isNullorBlank(currentRecord.getSublistValue({sublistId: 'time', fieldId: 'employeedisp', line: timeLine}),'');
		    				var timeMemo		= isNullorBlank(currentRecord.getSublistValue({sublistId: 'time', fieldId: 'memo', line: timeLine}),'');
		    				var timeApply		= currentRecord.getSublistValue({sublistId: 'time', fieldId: 'apply', line: timeLine});
		    				
		    				if(timeApply)
		    					{
				    				//Add to the temp detail object
				    				//
				    				var keyValue = timeEmployee + '|' + padding_left(timeBillDate.getTime(),'0',20) + '|' + timeLine;		//Create a key to sort by later
				    				
				    				tempTimeDetailObj[keyValue] = new timeDetailObj(format.format({value: timeBillDate, type: format.Type.DATE}), timeEmployee, timeItemName, timeMemo, timeQuantity, timeRate, timeAmount);
				    					
				    				//Does the item exist in the temp summary object
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
	    				}
	    			
	    			//Sort the detail and then add to the summary
	    			//
	    			const sortedTimeDetail = {};
				    Object.keys(tempTimeDetailObj).sort().forEach(function(key) {sortedTimeDetail[key] = tempTimeDetailObj[key];});
	    			
	    			for ( var key in sortedTimeDetail) 
		    			{
	    					summaryInfo.timeDetail.push(sortedTimeDetail[key])
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
	    			var tempExpenseObj 			= {};
	    			var tempExpenseDetailObj	= {};
	    			
	    			for (var expenseLine = 0; expenseLine < expensesLines; expenseLine++) 
		    			{
		    				var expenseAmount 	= Number(isNullorBlank(currentRecord.getSublistValue({sublistId: 'expcost', fieldId: 'amount', line: expenseLine}),0));
		    				var expenseItemName	= isNullorBlank(currentRecord.getSublistValue({sublistId: 'expcost', fieldId: 'categorydisp', line: expenseLine}),'');
		    				var expenseItemId	= currentRecord.getSublistValue({sublistId: 'expcost', fieldId: 'category', line: expenseLine});
		    				var expenseBillDate	= currentRecord.getSublistValue({sublistId: 'expcost', fieldId: 'billeddate', line: expenseLine});
		    				var expenseEmployee	= isNullorBlank(currentRecord.getSublistValue({sublistId: 'expcost', fieldId: 'employeedisp', line: expenseLine}),'');
		    				var expenseMemo		= isNullorBlank(currentRecord.getSublistValue({sublistId: 'expcost', fieldId: 'memo', line: expenseLine}),'');
		    				var expenseLineNo	= isNullorBlank(currentRecord.getSublistValue({sublistId: 'expcost', fieldId: 'line', line: expenseLine}),'');
		    				var expenseApply	= currentRecord.getSublistValue({sublistId: 'expcost', fieldId: 'apply', line: timeLine});
		    				
		    				if(expenseApply)
		    					{
				    				//Add to the temp detail object
				    				//
				    				var keyValue = expenseEmployee + '|' + padding_left(expenseBillDate.getTime(),'0',20) + '|' + expenseLineNo;		//Create a key to sort by later
				    				
				    				tempExpenseDetailObj[keyValue] = new expenseDetailObj(format.format({value: expenseBillDate, type: format.Type.DATE}), expenseEmployee, expenseItemName, expenseMemo, expenseAmount);
				    				
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
	    				}
	    			
	    			//Sort the detail and then add to the summary
	    			//
	    			const sortedExpenseDetail = {};
				    Object.keys(tempExpenseDetailObj).sort().forEach(function(key) {sortedExpenseDetail[key] = tempExpenseDetailObj[key];});
	    			
	    			for ( var key in sortedExpenseDetail) 
		    			{
	    					summaryInfo.expenseDetail.push(sortedExpenseDetail[key])
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
		    				var itemQuantity 	= Number(isNullorBlank(currentRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: itemLine}),0));
		    				var itemRate 		= Number(isNullorBlank(currentRecord.getSublistValue({sublistId: 'item', fieldId: 'rate', line: itemLine}),0));
		    				var itemItemName	= isNullorBlank(currentRecord.getSublistValue({sublistId: 'item', fieldId: 'description', line: itemLine}),'');
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
	    			
	    			
	    			//Update the PO numner on the invoice with the "invoice reference" field from the project, if there is one.....
	    			//
	    			var projectId 	= currentRecord.getValue({fieldId: 'job'});
	    			var poNumber	= currentRecord.getValue({fieldId: 'otherrefnum'});
	    			
	    			if(projectId != null && projectId != '' && (poNumber == null || poNumber == ''))
	    				{
	    					poNumber = search.lookupFields({
	    													type:		search.Type.JOB,
	    													id:			projectId,
	    													columns:	'custentity_bbs_inv_ref'
	    													}).custentity_bbs_inv_ref;
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
	    													custbody_bbs_item_summary_json:			JSON.stringify(summaryInfo.itemSummary),
	    													custbody_bbs_time_detail_json:			JSON.stringify(summaryInfo.timeDetail),
	    													custbody_bbs_expenses_detail_json:		JSON.stringify(summaryInfo.expenseDetail),
	    													otherrefnum:							poNumber
	    													}
	    										});			
	    				}
	    			catch(err)
	    				{
	    					log.error({title: 'Error updating invoice id = ' + recordId, details: err});
	    				}
    		}

    }

    //Time detail object 
    //
    function timeDetailObj(_timeBillDate, _timeEmployee, _timeItemName, _timeMemo, _timeQuantity, _timeRate, _timeAmount)
    	{
    		this.timeBillDate	= _timeBillDate;
    		this.timeEmployee	= _timeEmployee;
    		this.timeItemName	= _timeItemName;
    		this.timeMemo		= _timeMemo;
    		this.timeQuantity	= _timeQuantity;
    		this.timeRate		= _timeRate;
    		this.timeAmount		= _timeAmount;
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
   
    //Expense detail object
    //
    function expenseDetailObj(_expenseBillDate, _expenseEmployee, _expenseItemName, _expenseMemo, _expenseAmount)
    	{
    		this.expenseBillDate	= _expenseBillDate;
    		this.expenseEmployee	= _expenseEmployee;
    		this.expenseItemName	= _expenseItemName;
    		this.expenseMemo		= _expenseMemo;
    		this.expenseAmount		= _expenseAmount;
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
   
    //Left padding s with c to a total of n chars
    //
    function padding_left(s, c, n) 
	    {
	    	if (! s || ! c || s.length >= n) 
		    	{
		    		return s;
		    	}
	    	
	    	var max = (n - s.length)/c.length;
	    	
	    	for (var i = 0; i < max; i++) 
		    	{
		    		s = c + s;
		    	}
	    	
	    	return s;
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
