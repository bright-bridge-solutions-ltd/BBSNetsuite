/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Jun 2018     cedricgriffiths
 *
 */



/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function supplierValidateLine(type)
{
	var returnValue = true;
	
	if(type == 'submachine')
		{
			var taxCode = nlapiGetCurrentLineItemValue('submachine', 'taxitem');
			
			if(taxCode == null || taxCode == '')
				{
					alert("Please enter a value for Tax Code");
					returnValue = false;
				}
		}
	
	return returnValue;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function supplierSaveRecord()
{
	var validated = true;

	var lines = Number(nlapiGetLineItemCount('submachine'));
		 	
	if(lines != 0)
		 {
		 	for (var int = 1; int <= lines; int++) 
			 	{
		 			var taxCode = nlapiGetLineItemValue('submachine', 'taxitem', int)
							
		 			if(taxCode == null || taxCode == '')
		 				{
		 					validated = false;
		 					alert('Tax Code is required for all subsidiary lines');
		 					break;
		 				}
				}

		 }
	
    return validated;
}