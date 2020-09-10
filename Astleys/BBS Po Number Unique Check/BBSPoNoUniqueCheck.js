/**
 * Module Description
 * 
 * Version    	Date           	Author           Remarks
 * 1.00       	15 Nov 19     	sambatten
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
function poFieldChanged(type, name, linenum)
{
	if(name == 'otherrefnum' || name == 'custbody_bbs_weborderref')
		{
			//Get the current record id, the current po number and the customer
			//
			var currentId 	= nlapiGetRecordId();
			var currentPoNo = nlapiGetFieldValue(name);
			var currentType = '';
			var searchField = '';
			var warningMsg 	= '';
			
			switch(name)
				{
					case 'otherrefnum':
						searchField = 'poastext';
						warningMsg = 'WARNING - Purchase Order Number ';
						
						break;
						
					case 'custbody_bbs_weborderref':
						searchField = 'custbody_bbs_weborderref';
						warningMsg = 'WARNING - Web Order Ref  ';
						
						break;
				}
			
			switch(nlapiGetRecordType())
				{
					case 'salesorder':
						currentType = 'SalesOrd';
						break;
						
					case 'estimate':
						currentType = 'Estimate';
						break;
						
					case 'invoice':
						currentType = 'CustInvc';
						break;
						
				}
			
			//Check to see if we have a po number
			//
			if(currentPoNo != null && currentPoNo != '')
				{
					//Basic filter
					//
					var filters = [
								   ["type", "anyof", currentType], 
								   "AND", 
								   ["mainline", "is", "T"], 
								   "AND",
								   [searchField, "is", currentPoNo]
								];
					
					//If the current id is not -1 (new record) then exclude it from the serach
					//
					if(currentId != null && currentId != '' && currentId != '-1')
						{
							filters.push("AND", ["internalid","noneof",currentId]);
						}
					
					//Do the search
					//
					var transactionSearch = nlapiSearchRecord("transaction",null, filters, 
							[
							   new nlobjSearchColumn("tranid")
							]
							);
					
					//Have we found anything, if so it must be a duplicate
					//
					if(transactionSearch != null && transactionSearch.length > 0)
						{
							alert(warningMsg + currentPoNo + ' Has Already Been Used On Another Transaction');
						}
				}
		}
}
