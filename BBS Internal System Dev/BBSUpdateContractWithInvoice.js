/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Sep 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var invoiceSearch = nlapiSearchRecord("invoice",null,
			[
			   ["type","anyof","CustInvc"], 
			   "AND", 
			   ["mainline","is","T"], 
			   "AND", 
			   ["custbody_bbs_contract_header","noneof","@NONE@"]
			], 
			[
			   new nlobjSearchColumn("entity").setSort(false), 
			   new nlobjSearchColumn("trandate").setSort(false), 
			   new nlobjSearchColumn("custbody_bbs_contract_header")
			]
			);
	
	if(invoiceSearch != null && invoiceSearch.length > 0)
		{
			for (var int = 0; int < invoiceSearch.length; int++) 
				{
					checkResources();
				
					var invoiceId = invoiceSearch[int].getId();
					var contractId = invoiceSearch[int].getValue("custbody_bbs_contract_header");
					var invoiceDate = invoiceSearch[int].getValue("trandate");
					
					nlapiSubmitField('customrecord_bbs_con_header', contractId, ['custrecord_bbs_contract_last_invoice','custrecord_bbs_contract_inv_date'], [invoiceId,invoiceDate], false);
				}
		}
}

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 50)
		{
			nlapiYieldScript();
		}
}
