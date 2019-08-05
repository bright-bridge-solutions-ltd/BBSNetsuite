/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
function(record) {

    function beforeSubmit(context) {
    	
    	// check if record is being edited or deleted
    	if (context.type == 'edit' || context.type == 'delete')
    		{
    			var billRecord = context.newRecord;
    			
    			// get the internal ID of the related purchase order from the first line of the purchase orders sublist
				var poID = billRecord.getSublistValue({
				    sublistId: 'purchaseorders',
				    fieldId: 'id',
				    line: 0
				});
				
				// load the PO record
				var poRec = record.load({
				    type: record.Type.PURCHASE_ORDER,
				    id: poID,
				});
				    	
				// get count of lines on the bill record
				var lineCount = billRecord.getLineCount({
				    sublistId: 'item'
				});
				    	
				// loop through line count
				for (var i = 0; i < lineCount; i++)
				    {
				    	// get sublist fields from the bill record
				    	var poLine = billRecord.getSublistValue({
				    		sublistId: 'item',
				    		fieldId: 'orderline',
				    		line: i
				    	});
				    			
				    	poLine = (poLine - 1); // poLine needs to be 1 less than the value returned by the sublist call
				    			
				    	var rate = billRecord.getSublistValue({
				    		sublistId: 'item',
				    		fieldId: 'rate',
				    		line: i
				    	});
				    			
				    	var quantity = billRecord.getSublistValue({
				    		sublistId: 'item',
				    		fieldId: 'quantity',
				    		line: i
				    	});
				    			
				    	// multiply the rate and quantity variables to calculate the line total
				    	var lineTotal = parseFloat(quantity * rate);
				    			
				    	// get the current value of the billed column for the related line on the purchase order
				    	var billed = poRec.getSublistValue({
				    		sublistId: 'item',
				    		fieldId: 'custcol_bbs_bill_amount_received',
				    		line: poLine
				    	});
				    	
				    	billed = parseFloat(billed);
				    			
				    	// update the billed column for the related line on the purchase order using the newBilled variable
				    	poRec.setSublistValue({
				    		sublistId: 'item',
				    		fieldId: 'custcol_bbs_bill_amount_received',
				    		line: poLine,
				    		value: newBilled
				    	});
				
						if (context.type == 'delete') // if the record is being deleted
							{
								// subtract the lineTotal variable from the billed variable
								var newBilled = (billed - lineTotal);
								
								// populate the billed column on the purchase order record using the newBilled variable
    							poRec.setSublistValue({
    					    		sublistId: 'item',
    					    		fieldId: 'custcol_bbs_bill_amount_received',
    					    		line: poLine,
    					    		value: newBilled
    					    	});
							}
		    			else if (context.type == 'edit') // if the record is being edited
		    				{
		    					// get the old record object
		    					var oldRecord = context.oldRecord;
		    				
		    					// get line item values from old record
		    					var oldRecQuantity = oldRecord.getSublistValue({
						    		sublistId: 'item',
						    		fieldId: 'quantity',
						    		line: i
						    	});
		    					
		    					var oldRecRate = oldRecord.getSublistValue({
						    		sublistId: 'item',
						    		fieldId: 'rate',
						    		line: i
						    	});
		    					
		    					// check for differences between old and new values
		    					if (oldRecQuantity != quantity || oldRecRate != rate) // if the quantity or rate values are different
		    						{
		    							// multiply the quantity by the rate to calculate the old rec line total
		    							var oldLineTotal = parseFloat(oldRecQuantity * oldRecRate);
		    							
		    							// subtract the lineTotal variable from the oldLineTotal variable
		    							var lineDiff = (lineTotal - oldLineTotal);
		    							
		    							// add the lineDiff variable to the billed variable
		    							var newBilled = (billed + lineDiff);
		    							
		    							// populate the billed column on the purchase order record using the newBilled variable
										poRec.setSublistValue({
								    		sublistId: 'item',
								    		fieldId: 'custcol_bbs_bill_amount_received',
								    		line: poLine,
								    		value: newBilled
								    	});
		    						}
		    				}
				    }
    		
    			// save the changes to the PO record
				var savedRecord = poRec.save();
						
				log.debug({
					title: 'Record Saved',
					details: 'Record ' + savedRecord + ' has been saved'
				});
    		}
    }
	
	function afterSubmit(context) {
    	
    	// check if record is being created
    	if (context.type == 'create')
    		{
    			// get the internal ID of the newly created record
    			var billID = context.newRecord.id;
    					
				// load the bill record using the recID variable
    			var billRecord = record.load({
				    type: record.Type.VENDOR_BILL,
				    id: billID
				});
				    	
				// get the related purchase order from the first line of the purchase orders sublist
				var poID = billRecord.getSublistValue({
				    sublistId: 'purchaseorders',
				    fieldId: 'id',
				    line: 0
				});
				    	
				// load the PO record
				var poRec = record.load({
				    type: record.Type.PURCHASE_ORDER,
				    id: poID,
				});
				    	
				// get count of lines on the bill record
				var lineCount = billRecord.getLineCount({
				    sublistId: 'item'
				});
				    	
				// loop through line count
				for (var i = 0; i < lineCount; i++)
				    {
				    	// get sublist fields from the bill record
				    	var poLine = billRecord.getSublistValue({
				    		sublistId: 'item',
				    		fieldId: 'orderline',
				    		line: i
				    	});
				    			
				    	poLine = (poLine - 1); // poLine is 1 less than the value returned by the sublist call
				    			
				    	var rate = billRecord.getSublistValue({
				    		sublistId: 'item',
				    		fieldId: 'rate',
				    		line: i
				    	});
				    			
				    	var quantity = billRecord.getSublistValue({
				    		sublistId: 'item',
				    		fieldId: 'quantity',
				    		line: i
				    	});
				    			
				    	// multiply the rate and quantity variables to calculate the line total
				    	var lineTotal = parseFloat(quantity * rate);
				    			
				    	// get the current value of the billed column for the related line on the purchase order
				    	var billed = poRec.getSublistValue({
				    		sublistId: 'item',
				    		fieldId: 'custcol_bbs_bill_amount_received',
				    		line: poLine
				    	});
				    	
				    	billed = parseFloat(billed);
				    			
				    	// update the billed column for the related line on the purchase order using the newBilled variable
				    	poRec.setSublistValue({
				    		sublistId: 'item',
				    		fieldId: 'custcol_bbs_bill_amount_received',
				    		line: poLine,
				    		value: newBilled
				    	});
				
						// check that the billed variable returns a value
		    			if (billed)
		    				{
		    					// add the lineTotal variable to the billed variable
		    					var newBilled = (lineTotal + billed);
		    							
		    					// populate the billed column on the purchase order record using the newBilled variable
		    					poRec.setSublistValue({
		    					    sublistId: 'item',
		    					    fieldId: 'custcol_bbs_bill_amount_received',
		    					    line: poLine,
		    					    value: newBilled
		    					});
		    				}
		    			else // billed variable does not return a value
		    				{
			    				// populate the billed column on the purchase order record using the lineTotal variable
								poRec.setSublistValue({
								    sublistId: 'item',
								    fieldId: 'custcol_bbs_bill_amount_received',
								    line: poLine,
								    value: lineTotal
								});
		    				}
				    }
    		
    			// save the changes to the PO record
				var savedRecord = poRec.save();
						
				log.debug({
					title: 'Record Saved',
					details: 'Record ' + savedRecord + ' has been saved'
				});
				
		    }
    }

    return {
        beforeSubmit: beforeSubmit,
    	afterSubmit: afterSubmit
    };
    
});