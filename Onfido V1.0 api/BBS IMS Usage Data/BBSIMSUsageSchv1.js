/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Mar 2020     sambatten
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
	
	try
		{
			// load the sales order
			var salesOrderRecord = nlapiLoadRecord('salesorder', 53800);
			
			nlapiLogExecution('DEBUG', 'Sales Order Loaded', '');
			
			// select a new line
			salesOrderRecord.selectNewLineItem('item');
			
			// set fields on the new line
			salesOrderRecord.setCurrentLineItemValue('item', 'item', 289);
			salesOrderRecord.setCurrentLineItemValue('item', 'quantity', 1);
			salesOrderRecord.setCurrentLineItemValue('item', 'rate', 1);
			salesOrderRecord.setCurrentLineItemValue('item', 'custcol_bbs_contract_record', 800);
			salesOrderRecord.setCurrentLineItemValue('item', 'custcol_bbs_so_search_date', new Date());
			
			// commit the line
			salesOrderRecord.commitLineItem('item');
			
			// save the sales order
			nlapiSubmitRecord(salesOrderRecord);
			
			nlapiLogExecution('DEBUG', 'Sales Order Saved', '');
		}
	catch(e)
		{
			nlapiLogExecution('DEBUG', 'Error Saving Sales Order', e);
		}

}
