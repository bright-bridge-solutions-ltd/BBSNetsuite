/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Oct 2019     cedricgriffiths
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
function updateWeightsAS(type)
{
	var newRecord = nlapiGetNewRecord();
	var newRecordId = newRecord.getId();
	var newRecordType = newRecord.getRecordType();
	var thisRecord = null;
	
	try
		{
			thisRecord = nlapiLoadRecord(newRecordType, newRecordId);
		}
	catch(err)
		{
			thisRecord = null;
		}
	
	if(thisRecord != null)
		{
			var lines = thisRecord.getLineItemCount('item');
		    var totalWeight = Number(0) ;
		    var totalItems = Number(0) ;
	
	
		    for(var i=1; i< lines+1 ; i++)
		    	{   
			         var weight = Number(thisRecord.getLineItemValue('item', 'custcol_bbs_item_weight', i));
			         var quantity = Number(thisRecord.getLineItemValue('item', 'quantity', i));
			         var weightTimesQuantity = weight * quantity;
		
			         if(weight != NaN && quantity != NaN)
			         	{
			        	 	totalWeight += weightTimesQuantity ;
			        	 	totalItems += quantity;
			         	}
		    	}
		    
		    thisRecord.setFieldValue('custbody_bbs_items_total_weight', totalWeight);
		    thisRecord.setFieldValue('custbody_bbs_total_no_items', totalItems);

		    nlapiSubmitRecord(thisRecord, false, true);
		}
	
    
}
