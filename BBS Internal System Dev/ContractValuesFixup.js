/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Oct 2019     cedricgriffiths
 *
 */

var customrecord_bbs_con_headerSearch = nlapiSearchRecord("customrecord_bbs_con_header",null,
[
   ["custrecord_bbs_con_total_sales_value","equalto","0.00"]
], 
[
   new nlobjSearchColumn("name").setSort(false), 
   new nlobjSearchColumn("id"), 
   
]
);

if(customrecord_bbs_con_headerSearch != null && customrecord_bbs_con_headerSearch.length > 0)
	{
		for (var int = 0; int < customrecord_bbs_con_headerSearch.length; int++) 
		{
			var contractId = customrecord_bbs_con_headerSearch[int].getId();
			
			var contractRecord = nlapiLoadRecord('customrecord_bbs_con_header', contractId);
			
			// Get the number of rows in the contract detail..
			var itemCount = contractRecord.getLineItemCount('recmachcustrecord_bbs_con_detail_contract');

			// Init totals
			var totalSale = Number(0);
			var totalCost = Number(0);
			var totalMargin = Number(0);
			var annualSale = Number(0);
			var annualCost = Number(0);

			// Loop through the lines in the contract details
			for (var lineNo = 1; lineNo <= itemCount; lineNo++) {
				// Get values for annual, prorata & cost
				var annual = Number(contractRecord.getLineItemValue('recmachcustrecord_bbs_con_detail_contract', 'custrecord_bbs_con_detail_annual_value', lineNo));
				var prorata = Number(contractRecord.getLineItemValue('recmachcustrecord_bbs_con_detail_contract', 'custrecord_bbs_con_detail_prorata_value', lineNo));
				var cost = Number(contractRecord.getLineItemValue('recmachcustrecord_bbs_con_detail_contract', 'custrecord_bbs_con_detail_supplier_cost', lineNo));
				var proRataCost = Number(contractRecord.getLineItemValue('recmachcustrecord_bbs_con_detail_contract', 'custrecord_bbs_con_detail_supp_prorata', lineNo));

				annualSale += annual;
				annualCost += cost;

				// Summ up the values
				if (proRataCost != NaN && proRataCost != 0) {

					totalCost += proRataCost;
				}
				else {
					if (cost != NaN && cost != 0) {

						totalCost += cost;
					}
				}

				if (prorata != NaN && prorata != 0) {
					totalSale += prorata;
				}
				else {
					if (annual != NaN && annual != 0) {
						totalSale += annual;
					}
				}
			}

			// Calculate the margin value
			totalMargin = totalSale - totalCost;

			// Set the field values on the contract header
			contractRecord.setFieldValue('custrecord_bbs_con_total_sales_value', totalSale);
			contractRecord.setFieldValue('custrecord_bbs_con_total_cost', totalCost);
			contractRecord.setFieldValue('custrecord_bbs_con_total_margin', totalMargin);
			contractRecord.setFieldValue('custrecord_bbs_con_annualised_value', annualSale);
			contractRecord.setFieldValue('custrecord_bbs_con_annualised_cost', annualCost);
			
			nlapiSubmitRecord(contractRecord, false, true);
		}
	
	}
	