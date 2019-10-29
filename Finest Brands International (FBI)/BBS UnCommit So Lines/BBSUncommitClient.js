/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Oct 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function uncommitPI(type)
{
   
}

function uncommitButton()
{
	var lines = nlapiGetLineItemCount('item');
	
	for (var int = 1; int <= lines; int++) 
		{
			try
				{
					nlapiSelectLineItem('item', int);
					nlapiSetCurrentLineItemValue('item', 'commitinventory', '3', true, true);
					nlapiCommitLineItem('item');
				}
			catch(err)
				{
				
				}
			
		}

}