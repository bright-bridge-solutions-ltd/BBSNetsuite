/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Sep 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum)
{
	if (name == 'custpage_product_type_select')
		{
			nlapiSetFieldValue('custpage_prod_type_text', nlapiGetFieldText(name), false, true);
			
			var productType = nlapiGetFieldValue(name);
			
			//If we change chosen a product type of 'glass spec' then show the glass spec field
			//
			if(productType == '5')
				{
					nlapiSetFieldDisplay('custpage_glass_spec_select', true);
				}
			else
				{
					nlapiSetFieldValue('custpage_glass_spec_select', '0', true, true);
					nlapiSetFieldDisplay('custpage_glass_spec_select', false);
				}
		}


}

function clientSaveRecord()
{
	var stage = nlapiGetFieldValue('custpage_stage');
	var returnStatus = false;
	var message = '';
	
	switch (Number(stage))
		{
			case 1:
				returnStatus = true;
				break;
				
			case 2:
				var count = nlapiGetLineItemCount('custpage_sublist_items');
				
				message = 'Please select one or more lines to continue';
				
				for (var int = 1; int <= count; int++) 
					{
						var tick = nlapiGetLineItemValue('custpage_sublist_items', 'custpage_sublist_tick', int);
						
						if(tick == 'T')
							{
								returnStatus = true;
								break;
							}
					}
				
				if(!returnStatus)
				{	
					alert(message);
				}
			
				break;
		}
	
    return returnStatus;
}














