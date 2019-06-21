/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Jun 2019     cedricgriffiths
 *
 */
function scheduled(type) 
{
	var vendorSearch = nlapiSearchRecord("vendor",null,
	[
	    ["isinactive","is","F"]
	], 
	[
	   new nlobjSearchColumn("entityid").setSort(false)
	]
	);
	
	var email = '';
	
	for (var int = 0; int < vendorSearch.length; int++) 
		{
			var recordId = vendorSearch[int].getId();
			
			var record = nlapiLoadRecord('vendor', recordId);
			
			var lines = record.getLineItemCount('submachine');
			var failed = false;
			
			for (var int2 = 1; int2 <= lines; int2++) 
				{
					var taxCode = nlapiGetLineItemValue('submachine', 'taxitem', int2)
				
					if(taxCode == null || taxCode == '')
						{
							failed = true;
						}
				}
			
			if(failed)
				{
					nlapiLogExecution('DEBUG', record.getFieldValue('entityid'), '');
					email += record.getFieldValue('entityid') + '\n';
				}
		}
	
	nlapiSendEmail(3, 'cedric.griffiths@brightbridgesolutions.com', 'suppliers', email, null, null, null, null, false, false, null);
}