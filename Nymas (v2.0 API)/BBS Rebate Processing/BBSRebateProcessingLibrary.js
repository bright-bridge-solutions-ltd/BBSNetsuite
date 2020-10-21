
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search) {

	
	//Get sum of invoices based on customer and optionally rebate type
	//
	function findInvoiceValue(_customerIdArray, _itemRebateTypes, _startDate, _endDate)
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
						      ["name","anyof",_customerIdArray]
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
	
	function getGroupRebateTargets(_rebateRecord)
		{
			var rebateTargets = {};
			
			//Lump all of the rebate targets together in one object
			//
			for (var int = 1; int < 15; int++) 
				{
					var targetValueField 	= String('custrecord_bbs_grp_level' + int.toString());
					var targetPercentField 	= String('custrecord_bbs_grp_lev' + int.toString() + 'percent');
				
					var targetValue 	= Number(_rebateRecord.getValue({fieldId: targetValueField}));
					var targetPercent 	= Number(_rebateRecord.getValue({fieldId: targetPercentField}));
					
					if(targetValue > 0)
						{
							rebateTargets[targetValue] = targetPercent;
						}
				}
			
			//Now sort into order
			//
			const orderedTargets = {};
			Object.keys(rebateTargets).sort().forEach(function(key) {
																	orderedTargets[key] = rebateTargets[key];
																	});
			
			return orderedTargets;
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

    function rebateTargetInfoObj(_rebateTargets, _rebateTargetFrequency, _rebateGuarenteedPercent, _rebateGuarenteedFreq, _rebateMarketingPercent, _rebateMarketingFreq)
    	{
	    	this.rebateTargets 				= _rebateTargets;			
	    	this.rebateTargetFrequency		= _rebateTargetFrequency;	
	    	this.rebateGuarenteedPercent	= _rebateGuarenteedPercent;
	    	this.rebateGuarenteedFreq		= _rebateGuarenteedFreq;	
	    	this.rebateMarketingPercent		= _rebateMarketingPercent;	
	    	this.rebateMarketingFreq		= _rebateMarketingFreq;	
    	}
    
    function rebateDateInfoObj(_startDate, _q1EndDate, _q2EndDate, _q3EndDate, _endDate, _today)
    	{
    		this.startDate		= _startDate;
    		this.q1EndDate		= _q1EndDate;
    		this.q2EndDate		= _q2EndDate;
    		this.q3EndDate		= _q3EndDate;
    		this.endDate		= _endDate;
    		this.today 			= _today;
    		
    		this.isQ1End		= function()	//Returns true if today is Q1 end date
    								{
    									return this.q1EndDate.getTime() === this.today.getTime();
    								};
    		
    		this.isQ2End		= function()	//Returns true if today is Q2 end date
    								{
    									return this.q2EndDate.getTime() === this.today.getTime();
    								};
    		
    		this.isQ3End		= function()	//Returns true if today is Q3 end date
    								{
    									return this.q3EndDate.getTime() === this.today.getTime();
    								};
    		
    		this.isQ4End		= function()	//Returns true if today is Q4 end date
    								{
    									return this.endDate.getTime() === this.today.getTime();
    								};
    		
    		this.isEndOfYear	= function()	//Returns true if today is year end date
    								{
    									return this.endDate.getTime() === this.today.getTime();
    								};
    								
    		this.isEndOfMonth	= function()	//Returns true if today is the end of the current month
    								{
    									return new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0).getTime() === this.today.getTime();
    								};
    								
    		this.startOfMonth	= function()	//Returns the start date of the current month
    								{
    									return new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    								};
    								
    		this.endOfMonth	= function()	//Returns the end date of the current month
    								{
    									return new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0);
    								};
    								

    	}
    
	return 	{
			getResults:				getResults,
			findInvoiceValue:		findInvoiceValue,
			getGroupRebateTargets:	getGroupRebateTargets,
			rebateTargetInfoObj:	rebateTargetInfoObj,
			rebateDateInfoObj:		rebateDateInfoObj
			};	
});
