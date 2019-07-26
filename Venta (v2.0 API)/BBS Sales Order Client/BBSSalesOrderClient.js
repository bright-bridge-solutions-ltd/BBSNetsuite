/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define(['N/currentRecord', 'N/search', 'N/ui/dialog'],
	function(currentRecord, search, dialog) {

	function fieldChanged(context) {
		
		var record = currentRecord.get();
		
		// check if the item field has been changed
		if (context.sublistId == 'item' && context.fieldId == 'item')
			{
				// get the value of the available line field
				var available = record.getCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'quantityavailable'
				});
				
				// check if the available variable is not 0
				if (available != 0)
					{
						// set the value of the delivery date field to today
						record.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'expectedshipdate',
							value: new Date()
						});
					}
			}
		
	}
	
	function validateLine() {

		var record = currentRecord.get();
		
		// get the value of the delivery date field for the current line
		var delDate = record.getCurrentSublistValue({
			sublistId: 'item',
			fieldId: 'expectedshipdate'
		});
		
		// check if the delDate variable returns a value
		if (delDate)
			{
				// set the 'BBS Delivery Date' field for the current line using the delDate variable
				record.setCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_bbs_deliverydate',
					value: delDate
				});
				
				// get the value of the customer from the record
				var custID = record.getValue({
					fieldId: 'entity'
				});
				
				// get the internal ID of the item for the current line
				var itemID = record.getCurrentSublistValue({
					sublistId: 'item',
					fieldId: 'item'
				});
				
				// create search to find customer part code
				var mySearch = search.create({
					type: 'customrecord_scm_customerpartnumber',
					
					columns: [{
						name: 'internalid'
					}],
					
					filters: [{
						name: 'custrecord_scm_cpn_item',
						operator: 'anyof',
						values: itemID	
					},
							{
						name: 'custrecord_scm_cpn_customer',
						operator: 'anyof',
						values: custID
					}],
				});
				
				// run the search
				var searchResult = mySearch.run().getRange({
		            start: 0,
		            end: 1
		        });
				
				// check that the search has returned results
				if (searchResult.length > 0)
					{
						// get the value of the name field from the first search result
						var CPN = searchResult[0].getValue({
				            name: 'internalid'
				        });
			
						// set the 'Customer Part Number' field for the current line using the CPN variable
						record.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_scm_customerpartnumber',
							value: CPN
						});
					}
				
				// save the line
				return true;
			}
		else // delDate variable does NOT return a value (field is empty)
			{
				dialog.alert({
					title: 'Error',
					message: 'The despatch date field is empty. Please ensure this field is populated and try again'
				});
			
				// do not allow the line to be saved
				return false;
			
			}
    }

    return {
    	fieldChanged: fieldChanged,
    	validateLine: validateLine
    };
    
});