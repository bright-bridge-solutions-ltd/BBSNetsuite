
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search) {

	
	//Get sum of invoices based on customer and optionally rebate type
	//
	function findInvoiceValue(_customerId, _itemRebateTypes, _startDate, _endDate)
		{
			var invoiceValue = Number(0);
			var filters = [
						      ["type","anyof","CustInvc"], 
						      "AND", 
						      ["mainline","is","F"], 
						      "AND", 
						      ["shipping","is","F"], 
						      "AND", 
						      ["cogs","is","F"], 
						      "AND", 
						      ["taxline","is","F"], 
						      "AND", 
						      ["trandate","within",_startDate,_endDate], 
						      "AND", 
						      ["name","anyof",_customerId]
						   ];
			
			
			if(_itemRebateTypes != null && _itemRebateTypes.length > 0)
				{
					filters.push("AND");
					filters.push(["item.custitem_bbs_rebate_item_type","anyof",_itemRebateTypes])
				}
			
			
			var invoiceSearchObj = null;
			
			try
				{
					invoiceSearchObj = getResults(search.create({
															   type: 	"invoice",
															   filters:	filters,	
															   columns:
																	   [
																	      search.createColumn({name: "amount",summary: "SUM",label: "Amount"})
																	   ]
															}));
					
				}
			catch(err)
				{
					invoiceSearchObj = null;
				
					log.error({
								title: 		'Error searching for invoices',
								details: 	err
								});
				}
			
			if(invoiceSearchObj != null && invoiceSearchObj.length > 0)
				{
					invoiceValue = Number(invoiceSearchObj[0].getValue({name: "amount",summary: "SUM"}));
				}
			
			return invoiceValue;
		}
	
	
	
    //Page through results set from search
    //
    function getResults(_searchObject)
	    {
	    	var results = [];
	
	    	var pageData = _searchObject.runPaged({pageSize: 1000});
	
	    	for (var int = 0; int < pageData.pageRanges.length; int++) 
	    		{
	    			var searchPage = pageData.fetch({index: int});
	    			var data = searchPage.data;
	    			
	    			results = results.concat(data);
	    		}
	
	    	return results;
	    }

	return 	{
			getResults:				getResults,
			findInvoiceValue:		findInvoiceValue
			};	
});
