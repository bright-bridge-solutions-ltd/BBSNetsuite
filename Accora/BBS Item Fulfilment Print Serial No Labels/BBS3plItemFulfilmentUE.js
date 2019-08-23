/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Aug 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function itemFulfilment3plAS(type)
{
  if(type == 'create' || type == 'edit')
	  {
	  	var recordId = nlapiGetRecordId();
	  	
	  	var fulfilmentRecord = null;
	  	
	  	try
		  	{
		  		fulfilmentRecord = nlapiLoadRecord('itemfulfillment', recordId);
		  	}
	  	catch(err)
	  		{
	  			fulfilmentRecord = null;
	  		}
	  	
	  	if(fulfilmentRecord != null)
	  		{
	  			var lines = fulfilmentRecord.getLineItemCount('item');
	  			
	  			for (var int = 1; int <= lines; int++) 
		  			{
						var kitLevel = fulfilmentRecord.getLineItemValue('item', 'kitlevel', int);
						var lineNo = fulfilmentRecord.getLineItemValue('item', 'line', int);
						
						if(kitLevel == null || kitLevel == '')
							{
								fulfilmentRecord.setLineItemValue('item', 'custcol_bbs_fulfil_line_no', int, lineNo);
							}
						else
							{
								fulfilmentRecord.setLineItemValue('item', 'custcol_bbs_fulfil_line_no', int, '');
							}
					}
	  			
	  			nlapiSubmitRecord(fulfilmentRecord, false, true);
	  		}
	  }
}
