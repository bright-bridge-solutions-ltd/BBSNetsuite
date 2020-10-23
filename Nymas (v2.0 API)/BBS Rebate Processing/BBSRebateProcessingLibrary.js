
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search) {

	
	//Process the rebate for the group customer 
	//Create a credit memo or an accrual
	//
	function createCustomerRebateOrAccrual(_rebateGroupCustomer, _rebateValue, _rebateProcessingInfo, _rebateRecordId)
		{
			//Process based on frequency
			//
			switch(_rebateProcessingInfo.frequency)
				{
					case 1:		//Quarterly
						
						break;
						
					case 2:		//Annually
									
						break;
									
					case 3:		//Monthly
						
						//Create the credit memo for the group customer
						//
						try
							{
								var creditRecord = record.create({
																type:			record.Type.CREDIT_MEMO,
																isDynamic:		true,
																defaultValues:	{
																				entity:	_rebateGroupCustomer
																				}
																});		
								
								creditRecord.setValue({
														fieldId:		'location',
														value:			1				//Nymas Warehouse		
													});	
								
								
								creditRecord.selectNewLine({
										    				sublistId: 'item'
										    				});
								
								
								
								creditRecord.setCurrentSublistValue({
												    				sublistId: 	'item',
												    				fieldId: 	'item',
												    				value: 		itemId
												    				});

								creditRecord.setCurrentSublistValue({
												    				sublistId: 	'item',
												    				fieldId: 	'quantity',
												    				value: 		1
												    				});

								creditRecord.setCurrentSublistValue({
												    				sublistId: 	'item',
												    				fieldId: 	'rate',
												    				value: 		rebateValue
												    				});

								creditRecord.setCurrentSublistValue({
												    				sublistId: 	'item',
												    				fieldId: 	'amount',
												    				value: 		rebateValue
												    				});
								
								creditRecord.commitLine({
														sublistId: 	'item'
														});
								
								creditRecord.save({
													ignoreMandatoryFields:	true
												});	
				
								
							}
						catch(err)
							{
								log.error({
											title: 		'Error creating credit memo for customer id ' + _rebateGroupCustomer + ' on rebate id ' + _rebateRecordId,
											details: 	err
											});
							}
						
						
						break;

				}
		}
	
	//See if we need to process the rebate based on percentage, frequency & type
	//
	function checkRebateProcessing(_rebateTargetInfo, _rebateDateInfo, _type)
		{
			var processingInfo = new rebateProcessingInfoObj(false,'','','','','');	//Initialise returned info object with a status of false (nothing to process)
			
			switch(_type)
				{
					case 'G':	//Guaranteed
						
						//See if we have a percentage
						//
						if(_rebateTargetInfo.rebateGuarenteedPercent != null & _rebateTargetInfo.rebateGuarenteedPercent != '')
							{
								//See if we have a frequency
								//
								if(_rebateTargetInfo.rebateGuarenteedFreq != null & _rebateTargetInfo.rebateGuarenteedFreq != '')
									{
										//Check frequency against today's date
										//
										switch(Number(_rebateTargetInfo.rebateGuarenteedFreq))
											{
												case 1:	//Quarterly - see if today is the end of any quarter
													
													if(_rebateDateInfo.isQ1End() || _rebateDateInfo.isQ2End() || _rebateDateInfo.isQ3End() || _rebateDateInfo.isQ4End())
														{
															var startOfQuarter 				= _rebateDateInfo.getStartOfQuarter();					//Work out the start of the quarter
															var endOfQuarter 				= _rebateDateInfo.today;								//End of quarter will be today
															processingInfo.status			= true;													//We have data to processs
															processingInfo.startDate		= startOfQuarter;										//Start of date range to find invoices for
															processingInfo.endDate			= endOfQuarter;											//End of date range to find invoices for
															processingInfo.percentage		= Number(_rebateTargetInfo.rebateGuarenteedPercent);	//Percentage rebate to apply
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateItemTypes						//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateMarketingFreq)			//Return the frequency used
														}
													
													break;
													
												case 2:	//Annually - see if today is the end of the year
													
													if(_rebateDateInfo.isEndOfYear())
														{
															var startOfYear 				= _rebateDateInfo.startDate;							//Get the start of the year
															var endOfYear	 				= _rebateDateInfo.today;								//End of year will be today
															processingInfo.status			= true;													//We have data to processs
															processingInfo.startDate		= startOfYear;											//Start of date range to find invoices for
															processingInfo.endDate			= endOfYear;											//End of date range to find invoices for
															processingInfo.percentage		= Number(_rebateTargetInfo.rebateGuarenteedPercent);	//Percentage rebate to apply
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateItemTypes						//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateMarketingFreq)			//Return the frequency used
														}
													
													break;
													
												case 3:	//Monthly - see if today is the end of a month
													
													if(_rebateDateInfo.isEndOfMonth())
														{
															var startOfMonth 				= _rebateDateInfo.getStartOfMonth();					//Get the start of the month
															var endOfMonth	 				= _rebateDateInfo.today;								//End of month will be today
															processingInfo.status			= true;													//We have data to processs
															processingInfo.startDate		= startOfMonth;											//Start of date range to find invoices for
															processingInfo.endDate			= endOfMonth;											//End of date range to find invoices for
															processingInfo.percentage		= Number(_rebateTargetInfo.rebateGuarenteedPercent);	//Percentage rebate to apply
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateItemTypes						//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateMarketingFreq)			//Return the frequency used
														}
													
													break;
											}
									}
							}
						
						break;
			
					case 'M':	//Marketing
						
						//See if we have a percentage
						//
						if(_rebateTargetInfo.rebateMarketingPercent != null & _rebateTargetInfo.rebateMarketingPercent != '')
							{
								//See if we have a frequency
								//
								if(_rebateTargetInfo.rebateMarketingFreq != null & _rebateTargetInfo.rebateMarketingFreq != '')
									{
										//Check frequency against today's date
										//
										switch(Number(_rebateTargetInfo.rebateMarketingFreq))
											{
												case 1:	//Quarterly - see if today is the end of any quarter
													
													if(_rebateDateInfo.isQ1End() || _rebateDateInfo.isQ2End() || _rebateDateInfo.isQ3End() || _rebateDateInfo.isQ4End())
														{
															var startOfQuarter 				= _rebateDateInfo.getStartOfQuarter();					//Work out the start of the quarter
															var endOfQuarter 				= _rebateDateInfo.today;								//End of quarter will be today
															processingInfo.status			= true;													//We have data to processs
															processingInfo.startDate		= startOfQuarter;										//Start of date range to find invoices for
															processingInfo.endDate			= endOfQuarter;											//End of date range to find invoices for
															processingInfo.percentage		= Number(_rebateTargetInfo.rebateMarketingPercent);		//Percentage rebate to apply
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateItemTypes						//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateMarketingFreq)			//Return the frequency used
														}
													
													break;
													
												case 2:	//Annually - see if today is the end of the year
													
													if(_rebateDateInfo.isEndOfYear())
														{
															var startOfYear 				= _rebateDateInfo.startDate;							//Get the start of the year
															var endOfYear	 				= _rebateDateInfo.today;								//End of year will be today
															processingInfo.status			= true;													//We have data to processs
															processingInfo.startDate		= startOfYear;											//Start of date range to find invoices for
															processingInfo.endDate			= endOfYear;											//End of date range to find invoices for
															processingInfo.percentage		= Number(_rebateTargetInfo.rebateMarketingPercent);		//Percentage rebate to apply
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateItemTypes						//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateMarketingFreq)			//Return the frequency used
														}
													
													break;
													
												case 3:	//Monthly - see if today is the end of a month
													
													if(_rebateDateInfo.isEndOfMonth())
														{
															var startOfMonth 				= _rebateDateInfo.getStartOfMonth();					//Get the start of the month
															var endOfMonth	 				= _rebateDateInfo.today;								//End of month will be today
															processingInfo.status			= true;													//We have data to processs
															processingInfo.startDate		= startOfMonth;											//Start of date range to find invoices for
															processingInfo.endDate			= endOfMonth;											//End of date range to find invoices for
															processingInfo.percentage		= Number(_rebateTargetInfo.rebateMarketingPercent);		//Percentage rebate to apply
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateItemTypes						//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateMarketingFreq)			//Return the frequency used
														}
													
													break;
											}
									}
							}
						
						break;
						
					case 'T':	//Targets
						
						//See if we have any targets
						//
						if(Object.keys(_rebateTargetInfo.rebateTargets).length > 0)
							{
								//See if we have a frequency
								//
								if(_rebateTargetInfo.rebateTargetFrequency != null & _rebateTargetInfo.rebateTargetFrequency != '')
									{
										//Check frequency against today's date
										//
										switch(Number(_rebateTargetInfo.rebateTargetFrequency))
											{
												case 1:	//Quarterly - see if today is the end of any quarter
													
													if(_rebateDateInfo.isQ1End() || _rebateDateInfo.isQ2End() || _rebateDateInfo.isQ3End() || _rebateDateInfo.isQ4End())
														{
															var startOfQuarter 				= _rebateDateInfo.getStartOfQuarter();					//Work out the start of the quarter
															var endOfQuarter 				= _rebateDateInfo.today;								//End of quarter will be today
															processingInfo.status			= true;													//We have data to processs
															processingInfo.startDate		= startOfQuarter;										//Start of date range to find invoices for
															processingInfo.endDate			= endOfQuarter;											//End of date range to find invoices for
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateItemTypes						//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateMarketingFreq)			//Return the frequency used
														}
													
													break;
													
												case 2:	//Annually - see if today is the end of the year
													
													if(_rebateDateInfo.isEndOfYear())
														{
															var startOfYear 				= _rebateDateInfo.startDate;							//Get the start of the year
															var endOfYear	 				= _rebateDateInfo.today;								//End of year will be today
															processingInfo.status			= true;													//We have data to processs
															processingInfo.startDate		= startOfYear;											//Start of date range to find invoices for
															processingInfo.endDate			= endOfYear;											//End of date range to find invoices for
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateItemTypes						//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateMarketingFreq)			//Return the frequency used
														}
													
													break;
													
												case 3:	//Monthly - see if today is the end of a month
													
													if(_rebateDateInfo.isEndOfMonth())
														{
															var startOfMonth 				= _rebateDateInfo.getStartOfMonth();					//Get the start of the month
															var endOfMonth	 				= _rebateDateInfo.today;								//End of month will be today
															processingInfo.status			= true;													//We have data to processs
															processingInfo.startDate		= startOfMonth;											//Start of date range to find invoices for
															processingInfo.endDate			= endOfMonth;											//End of date range to find invoices for
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateItemTypes						//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateMarketingFreq)			//Return the frequency used
														}
													
													break;
											}
									}
							}
						
						break;
				}
		
			return processingInfo;
		}
	
	
	//Get the list of all customers that belong to a specific rebate group by finding all of the individual rebate records that are linked to the group record
	//
	function findGroupMembers(_startDate, _endDate, _groupId)
		{
			//Now find all of the individual rebate records that have this particular group record linked to them
			//
			var individualRebates = BBSRebateProcessingLibrary.getResults(search.create({
																	    			   type: 		"customrecord_bbs_cust_individ_rebate",
																	    			   filters:
																				    			   [
																				    			      ["isinactive","is","F"], 
																				    			      "AND", 
																				    			      ["custrecord_bbs_end_q1_ind","onorafter",_startDate],
																				    			      "AND", 
																				    			      ["custrecord_bbs_end_q1_ind","onorbefore",_endDate],
																				    			      "AND",
																				    			      ["custrecord_bbs_parent_group_rebate","anyof",_groupId]
																				    			   ],
																	    			   columns:
																				    			   [
																				    			      search.createColumn({name: "name",sort: search.Sort.ASC,  label: "ID"}),
																				    			      search.createColumn({name: "internalid", label: "Internal Id"}),
																				    			      search.createColumn({name: "custrecord_bbs_ind_customer", label: "Customer"}),
																				    			      search.createColumn({name: "custrecord_bbs_end_q1_ind", label: "End of Q1"}),
																				    			      search.createColumn({name: "custrecord_bbs_end_q2_ind", label: "End of Q2"}),
																				    			      search.createColumn({name: "custrecord_bbs_end_q3_ind", label: "End of Q3"})
																				    			   ]
																	    			}));
			
			//Sum up all of the invoice values for each customer that belongs to the group
			//
			var customerArray		= [];
			
			//Gather all of the customer id's into an array
			//
			if(individualRebates != null && individualRebates.length > 0)
				{
					for (var int = 0; int < individualRebates.length; int++) 
	    				{
							var individualCustomer = individualRebates[int].getValue({name: "custrecord_bbs_ind_customer"});
	
							customerArray.push(individualCustomer);
						}
				}
			
			return customerArray;
		}
	
	//Get the list of all customers that belong to a specific rebate group by finding all of the individual rebate records that are linked to the group record
	//Also taking into account whether or not they have been flagged as having left the buying group
	//
	function findCurrentGroupMembers(_startDate, _endDate, _groupId)
		{
			//Now find all of the individual rebate records that have this particular group record linked to them
			//
			var individualRebates = BBSRebateProcessingLibrary.getResults(search.create({
																	    			   type: 		"customrecord_bbs_cust_individ_rebate",
																	    			   filters:
																				    			   [
																				    			      ["isinactive","is","F"], 
																				    			      "AND", 
																				    			      ["custrecord_bbs_end_q1_ind","onorafter",_startDate],
																				    			      "AND", 
																				    			      ["custrecord_bbs_end_q1_ind","onorbefore",_endDate],
																				    			      "AND",
																				    			      ["custrecord_bbs_parent_group_rebate","anyof",_groupId],
																				    			      "AND"
																				    			      ["custrecord_bbs_left_buying_group","is","F"]
																				    			   ],
																	    			   columns:
																				    			   [
																				    			      search.createColumn({name: "name",sort: search.Sort.ASC,  label: "ID"}),
																				    			      search.createColumn({name: "internalid", label: "Internal Id"}),
																				    			      search.createColumn({name: "custrecord_bbs_ind_customer", label: "Customer"}),
																				    			      search.createColumn({name: "custrecord_bbs_end_q1_ind", label: "End of Q1"}),
																				    			      search.createColumn({name: "custrecord_bbs_end_q2_ind", label: "End of Q2"}),
																				    			      search.createColumn({name: "custrecord_bbs_end_q3_ind", label: "End of Q3"})
																				    			   ]
																	    			}));
			
			//Sum up all of the invoice values for each customer that belongs to the group
			//
			var customerArray		= [];
			
			//Gather all of the customer id's into an array
			//
			if(individualRebates != null && individualRebates.length > 0)
				{
					for (var int = 0; int < individualRebates.length; int++) 
	    				{
							var individualCustomer = individualRebates[int].getValue({name: "custrecord_bbs_ind_customer"});
	
							customerArray.push(individualCustomer);
						}
				}
			
			return customerArray;
		}
	
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
	
	//Get sum of invoices based grouped by customer and optionally rebate type
	//
	function findInvoiceValueByCustomer(_customerIdArray, _itemRebateTypes, _startDate, _endDate)
		{
			var invoiceValues = {};
			
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
																	      search.createColumn({name: "entity",summary: "GROUP",label: "Name"}),
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
					for (var int = 0; int < invoiceSearchObj.length; int++) 
						{	
							var invoiceValue 				= Number(invoiceSearchObj[0].getValue({name: "amount",summary: "SUM"}));
							var invoiceCustomer				= invoiceSearchObj[0].getValue({name: "entity",summary: "GROUP"});
							invoiceValues[invoiceCustomer]	= invoiceValue;
						}
				}
			
			return invoiceValues;
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

    function rebateProcessingInfoObj(_status, _startDate, _endDate, _percentage, _rebateItemTypes, _frequency)
		{
	    	this.status				= _status;
    		this.startDate 			= _startDate;			
	    	this.endDate			= _endDate;	
	    	this.percentage			= _percentage;
	    	this.rebateItemTypes	= _rebateItemTypes;
	    	this.frequency			= _frequency;
		}

    function rebateTargetInfoObj(_rebateTargets, _rebateTargetFrequency, _rebateGuarenteedPercent, _rebateGuarenteedFreq, _rebateMarketingPercent, _rebateMarketingFreq, _rebateItemTypes)
    	{
	    	this.rebateTargets 				= _rebateTargets;			
	    	this.rebateTargetFrequency		= _rebateTargetFrequency;	
	    	this.rebateGuarenteedPercent	= _rebateGuarenteedPercent;
	    	this.rebateGuarenteedFreq		= _rebateGuarenteedFreq;	
	    	this.rebateMarketingPercent		= _rebateMarketingPercent;	
	    	this.rebateMarketingFreq		= _rebateMarketingFreq;	
	    	this.rebateItemTypes			= _rebateItemTypes;
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
    								
    		this.getStartOfMonth = function()	//Returns the start date of the current month
    								{
    									return new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    								};
    								
    		this.getEndOfMonth	= function()	//Returns the end date of the current month
    								{
    									return new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0);
    								};
    								
    		this.getStartOfQuarter	= function()
    								{
    									//Is todays date inside the Q1 end date?
    									//
    									if(this.today.getTime() <= this.q1EndDate.getTime())
    										{
    											//Work out the first day of the quarter end month
    											//
    											var startOfLastMonthInQuarter = new Date(this.q1EndDate.getFullYear(), this.q1EndDate.getMonth(), 1);
    											
    											//Now subtract 3 months from it to get the start of the first month in the quarter
    											//
    											startOfLastMonthInQuarter.setMonth(startOfLastMonthInQuarter.getMonth() - 2);
    											
    											return new Date(startOfLastMonthInQuarter.getFullYear(), startOfLastMonthInQuarter.getMonth(), startOfLastMonthInQuarter.getDate());
    										}
    			
    									//Is todays date inside the Q2 end date?
    									//
    									if(this.today.getTime() <= this.q2EndDate.getTime())
    										{
    											//Work out the first day of the quarter end month
    											//
    											var startOfLastMonthInQuarter = new Date(this.q2EndDate.getFullYear(), this.q2EndDate.getMonth(), 1);
    											
    											//Now subtract 3 months from it to get the start of the first month in the quarter
    											//
    											startOfLastMonthInQuarter.setMonth(startOfLastMonthInQuarter.getMonth() - 2);
    											
    											return new Date(startOfLastMonthInQuarter.getFullYear(), startOfLastMonthInQuarter.getMonth(), startOfLastMonthInQuarter.getDate());
    										}
    			
    									//Is todays date inside the Q3 end date?
    									//
    									if(this.today.getTime() <= this.q3EndDate.getTime())
    										{
    											//Work out the first day of the quarter end month
    											//
    											var startOfLastMonthInQuarter = new Date(this.q3EndDate.getFullYear(), this.q3EndDate.getMonth(), 1);
    											
    											//Now subtract 3 months from it to get the start of the first month in the quarter
    											//
    											startOfLastMonthInQuarter.setMonth(startOfLastMonthInQuarter.getMonth() - 2);
    											
    											return new Date(startOfLastMonthInQuarter.getFullYear(), startOfLastMonthInQuarter.getMonth(), startOfLastMonthInQuarter.getDate());
    										}
    			
    									//Is todays date inside the Q4 end date?
    									//
    									if(this.today.getTime() <= this.endDate.getTime())
    										{
    											//Work out the first day of the quarter end month
    											//
    											var startOfLastMonthInQuarter = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), 1);
    											
    											//Now subtract 3 months from it to get the start of the first month in the quarter
    											//
    											startOfLastMonthInQuarter.setMonth(startOfLastMonthInQuarter.getMonth() - 2);
    											
    											return new Date(startOfLastMonthInQuarter.getFullYear(), startOfLastMonthInQuarter.getMonth(), startOfLastMonthInQuarter.getDate());
    										}
    			
    									return returnedDate;
    								}

    	}
    
	return 	{
			getResults:				getResults,
			findInvoiceValue:		findInvoiceValue,
			getGroupRebateTargets:	getGroupRebateTargets,
			rebateTargetInfoObj:	rebateTargetInfoObj,
			rebateDateInfoObj:		rebateDateInfoObj
			};	
});
