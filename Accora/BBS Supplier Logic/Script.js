/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Jun 2019     cedricgriffiths
 *
 */
var vendorSearch = nlapiSearchRecord("vendor",null,
[
 []
], 
[
   new nlobjSearchColumn("entityid").setSort(false)
]
);

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
			nlapiLogExecution('DEBUG', 'Supplier needs fixing - ' + record.getFieldValue('entityid'), '');
		}
}