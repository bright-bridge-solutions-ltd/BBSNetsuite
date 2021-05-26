
define(['N/record', 'N/search', 'N/runtime'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search, runtime) {

	//
	//=========================================================================
	//Functions
	//=========================================================================
	//
	
	//Process to create a rebate for each customer in the buying group
	//
	function createBuyingGroupRebateOrAccrual(_currentCustomerArray, _rebateValue, _rebateProcessingInfo, _rebateRecordId, _invoiceValueByCustomer)
		{
			if(Number(_rebateValue) > 0)
				{
					//Work out what field to use for the accrual value
					//
					var accuraField = '';
					
					switch(_rebateProcessingInfo.rebateType)
						{
							case 'G':	//Guaranteed
								
								accuraField = 'custrecord_bbs_accrual_guaranteed';
								break;
								
							case 'M': 	//Marketing
								
								accuraField = 'custrecord_bbs_acc_value_marketing';
								break;
								
							case 'T':	//Target
								
								accuraField = 'custrecord_bbs_accrual_targeted';
								break;
						}
				
					//Process based on frequency
					//
					switch(_rebateProcessingInfo.frequency)
						{  
							case 1:		//Quarterly
								
								switch(_rebateProcessingInfo.rebateOrAccrual)
									{
										case 'R':	//Rebate
											
											var totalInvoiceValue = Number(0);
											
											for ( var customer in _invoiceValueByCustomer) 
												{
													totalInvoiceValue += Number(_invoiceValueByCustomer[customer]);
												}
											
											//Loop through each customer & work out the apportionment of the rebate due
											//
											for ( var customer in _invoiceValueByCustomer) 
												{
													var customerInvoiceValue 	= Number(_invoiceValueByCustomer[customer]);
													var rebateUnitValue 		= Number(_rebateValue) / Number(totalInvoiceValue);
													var customerRebate			= Number(customerInvoiceValue) * Number(rebateUnitValue);
													
													createCreditMemo(customer, customerRebate, 'Buying group rebate - quarterly');
												}
											
											//Reset the accrual value & update the rebate value
											//
											var totalRebate = Number(isNullorBlank(search.lookupFields({
																									type: 		'customrecord_bbs_cust_group_rebate', 
																									id: 		_rebateRecordId,
																									columns:	'custrecord_bbs_rebate_value'
																								}).customrecord_bbs_cust_individ_rebate, '0')) + rebateValue;
															
											var fieldsAndValues = {};
											fieldsAndValues[accuraField] = 0;
											fieldsAndValues['custrecord_bbs_rebate_value'] = totalRebate;
											
											record.submitFields({
								    							type:		'customrecord_bbs_cust_group_rebate',
								    							id:			_rebateRecordId,
								    							values:		fieldsAndValues,
								    							options:	{
								    										ignoreMandatoryFields: 	true
								    										}
								    							});
											
											break;
											
										case 'A':	//Accrual
											
											//Update the accrual value
											//
											var fieldsAndValues = {};
											fieldsAndValues[accuraField] = _rebateValue;
											
											record.submitFields({
								    							type:		'customrecord_bbs_cust_group_rebate',
								    							id:			_rebateRecordId,
								    							values:		fieldsAndValues,
								    							options:	{
								    										ignoreMandatoryFields: 	true
								    										}
								    							});
											
											break;
									}
								
								break;
								
							case 2:		//Annually
								
								switch(_rebateProcessingInfo.rebateOrAccrual)
									{
										case 'R':	//Rebate
											
											var totalInvoiceValue = Number(0);
											
											for ( var customer in _invoiceValueByCustomer) 
												{
													totalInvoiceValue += Number(_invoiceValueByCustomer[customer]);
												}
											
											//Loop through each customer & work out the apportionment of the rebate due
											//
											for ( var customer in _invoiceValueByCustomer) 
												{
													var customerInvoiceValue 	= Number(_invoiceValueByCustomer[customer]);
													var rebateUnitValue 		= Number(_rebateValue) / Number(totalInvoiceValue);
													var customerRebate			= Number(customerInvoiceValue) * Number(rebateUnitValue);
													
													createCreditMemo(customer, customerRebate, 'Buying group rebate - annualy');
												}
											
											//Reset the accrual value & update the rebate value
											//
											var totalRebate = Number(isNullorBlank(search.lookupFields({
																									type: 		'customrecord_bbs_cust_group_rebate', 
																									id: 		_rebateRecordId,
																									columns:	'custrecord_bbs_rebate_value'
																								}).customrecord_bbs_cust_individ_rebate, '0')) + rebateValue;
															
											var fieldsAndValues = {};
											fieldsAndValues[accuraField] = 0;
											fieldsAndValues['custrecord_bbs_rebate_value'] = totalRebate;
											
											record.submitFields({
								    							type:		'customrecord_bbs_cust_group_rebate',
								    							id:			_rebateRecordId,
								    							values:		fieldsAndValues,
								    							options:	{
								    										ignoreMandatoryFields: 	true
								    										}
								    							});
											
											break;
											
										case 'A':	//Accrual
											
											//Update the accrual value
											//
											var fieldsAndValues = {};
											fieldsAndValues[accuraField] = _rebateValue;
											
											record.submitFields({
								    							type:		'customrecord_bbs_cust_group_rebate',
								    							id:			_rebateRecordId,
								    							values:		fieldsAndValues,
								    							options:	{
								    										ignoreMandatoryFields: 	true
								    										}
								    							});
											
											break;
									}			
								break;
											
							case 3:		//Monthly
								
								//Work out the total invoice value to work with by adding up the invoice values per customer
								//
								var totalInvoiceValue = Number(0);
								
								for ( var customer in _invoiceValueByCustomer) 
									{
										totalInvoiceValue += Number(_invoiceValueByCustomer[customer]);
									}
								
								//Loop through each customer & work out the apportionment of the rebate due
								//
								for ( var customer in _invoiceValueByCustomer) 
									{
										var customerInvoiceValue 	= Number(_invoiceValueByCustomer[customer]);
										var rebateUnitValue 		= Number(_rebateValue) / Number(totalInvoiceValue);
										var customerRebate			= Number(customerInvoiceValue) * Number(rebateUnitValue);
										
										createCreditMemo(customer, customerRebate, 'Buying group rebate - monthly');
										
										//Reset the accrual value & update the rebate value
										//
										var totalRebate = Number(isNullorBlank(search.lookupFields({
																								type: 		'customrecord_bbs_cust_group_rebate', 
																								id: 		_rebateRecordId,
																								columns:	'custrecord_bbs_rebate_value'
																							}).customrecord_bbs_cust_individ_rebate, '0')) + rebateValue;
														
										var fieldsAndValues = {};
										fieldsAndValues[accuraField] = 0;
										fieldsAndValues['custrecord_bbs_rebate_value'] = totalRebate;
										
										record.submitFields({
							    							type:		'customrecord_bbs_cust_group_rebate',
							    							id:			_rebateRecordId,
							    							values:		fieldsAndValues,
							    							options:	{
							    										ignoreMandatoryFields: 	true
							    										}
							    							});
									}
								
								break;
						}
				}
		}
	
	//Process the rebate for the group customer 
	//Create a credit memo or an accrual
	//
	function createCustomerRebateOrAccrual(_rebateGroupCustomer, _rebateValue, _rebateProcessingInfo, _rebateRecordId)
		{
			if(Number(_rebateValue) > 0)
				{
					//Work out what field to use for the accrual value
					//
					var accuraField = '';
					
					switch(_rebateProcessingInfo.rebateType)
						{
							case 'G':	//Guaranteed
								
								accuraField = 'custrecord_bbs_accrual_guaranteed';
								break;
								
							case 'M': 	//Marketing
								
								accuraField = 'custrecord_bbs_acc_value_marketing';
								break;
								
							case 'T':	//Target
								
								accuraField = 'custrecord_bbs_accrual_targeted';
								break;
						}
					
					//Process based on frequency
					//
					switch(_rebateProcessingInfo.frequency)
						{
							case 1:		//Quarterly
								
								switch(_rebateProcessingInfo.rebateOrAccrual)
									{
										case 'R':	//Rebate
											
											//Create the credit memo for the group customer
											//
											createCreditMemo(_rebateGroupCustomer, rebateValue, 'Group customer rebate - quarterly');
											
											//Reset the accrual value & update the rebate value
											//
											var totalRebate = Number(isNullorBlank(search.lookupFields({
																									type: 		'customrecord_bbs_cust_group_rebate', 
																									id: 		_rebateRecordId,
																									columns:	'custrecord_bbs_rebate_value'
																								}).customrecord_bbs_cust_individ_rebate, '0')) + rebateValue;
															
											var fieldsAndValues = {};
											fieldsAndValues[accuraField] = 0;
											fieldsAndValues['custrecord_bbs_rebate_value'] = totalRebate;
											
											record.submitFields({
								    							type:		'customrecord_bbs_cust_group_rebate',
								    							id:			_rebateRecordId,
								    							values:		fieldsAndValues,
								    							options:	{
								    										ignoreMandatoryFields: 	true
								    										}
								    							});
											
											
											break;
											
										case 'A':	//Accrual
											
											//Update the accrual value
											//
											var fieldsAndValues = {};
											fieldsAndValues[accuraField] = _rebateValue;
											
											record.submitFields({
								    							type:		'customrecord_bbs_cust_group_rebate',
								    							id:			_rebateRecordId,
								    							values:		fieldsAndValues,
								    							options:	{
								    										ignoreMandatoryFields: 	true
								    										}
								    							});
											
											break;
									}
								
								break;
								
							case 2:		//Annually
								
								switch(_rebateProcessingInfo.rebateOrAccrual)
									{
										case 'R':	//Rebate
											
											//Create the credit memo for the group customer
											//
											createCreditMemo(_rebateGroupCustomer, rebateValue, 'Group customer rebate - annual');
											
											//Reset the accrual value & update the rebate value
											//
											var totalRebate = Number(isNullorBlank(search.lookupFields({
																									type: 		'customrecord_bbs_cust_group_rebate', 
																									id: 		_rebateRecordId,
																									columns:	'custrecord_bbs_rebate_value'
																								}).customrecord_bbs_cust_individ_rebate, '0')) + rebateValue;
															
											var fieldsAndValues = {};
											fieldsAndValues[accuraField] = 0;
											fieldsAndValues['custrecord_bbs_rebate_value'] = totalRebate;
											
											record.submitFields({
								    							type:		'customrecord_bbs_cust_group_rebate',
								    							id:			_rebateRecordId,
								    							values:		fieldsAndValues,
								    							options:	{
								    										ignoreMandatoryFields: 	true
								    										}
								    							});
											
											break;
											
										case 'A':	//Accrual
											
											//Update the accrual value
											//
											var fieldsAndValues = {};
											fieldsAndValues[accuraField] = _rebateValue;
											
											record.submitFields({
								    							type:		'customrecord_bbs_cust_group_rebate',
								    							id:			_rebateRecordId,
								    							values:		fieldsAndValues,
								    							options:	{
								    										ignoreMandatoryFields: 	true
								    										}
								    							});
											
											break;
									}
								
								break;
											
							case 3:		//Monthly
								
								//Create the credit memo for the group customer
								//
								createCreditMemo(_rebateGroupCustomer, rebateValue, 'Group customer rebate - monthly');
								
								//Reset the accrual value & update the rebate value
								//
								var totalRebate = Number(isNullorBlank(search.lookupFields({
																						type: 		'customrecord_bbs_cust_group_rebate', 
																						id: 		_rebateRecordId,
																						columns:	'custrecord_bbs_rebate_value'
																					}).customrecord_bbs_cust_individ_rebate, '0')) + rebateValue;
												
								var fieldsAndValues = {};
								fieldsAndValues[accuraField] = 0;
								fieldsAndValues['custrecord_bbs_rebate_value'] = totalRebate;
								
								record.submitFields({
					    							type:		'customrecord_bbs_cust_group_rebate',
					    							id:			_rebateRecordId,
					    							values:		fieldsAndValues,
					    							options:	{
					    										ignoreMandatoryFields: 	true
					    										}
					    							});
								break;
		
						}
				}
		}
	
	
	
	//Process the rebate for the individual customer 
	//Create a credit memo or an accrual
	//
	function createIndividualRebateOrAccrual(_rebateIndividualCustomer, _rebateValue, _rebateProcessingInfo, _rebateRecordId)
		{
			if(Number(_rebateValue) > 0)
				{
					//Work out what field to use for the accrual value
					//
					var accuraField = '';
					
					switch(_rebateProcessingInfo.rebateType)
						{
							case 'G':	//Guaranteed
								
								accuraField = 'custrecord_bbs_rebate_i_accr_guranteed';
								break;
								
							case 'M': 	//Marketing
								
								accuraField = 'custrecord_bbs_rebate_i_accr_marketing';
								break;
								
							case 'T':	//Target
								
								accuraField = 'custrecord_bbs_rebate_i_accr_targeted';
								break;
						}
					
					//Process based on frequency
					//
					switch(_rebateProcessingInfo.frequency)
						{
							case 1:		//Quarterly
								
								switch(_rebateProcessingInfo.rebateOrAccrual)
									{
										case 'R':	//Rebate
											
											//Create the credit memo for the group customer
											//
											createCreditMemo(_rebateIndividualCustomer, rebateValue, 'Individual customer rebate - quarterly');
											
											//Reset the accrual value & update the rebate value
											//
											var totalRebate = Number(isNullorBlank(search.lookupFields({
																					type: 		'customrecord_bbs_cust_individ_rebate', 
																					id: 		_rebateRecordId,
																					columns:	'custrecord_bbs_rebate_value_ind'
																				}).customrecord_bbs_cust_individ_rebate, '0')) + rebateValue;
											
											var fieldsAndValues = {};
											fieldsAndValues[accuraField] = 0;
											fieldsAndValues['custrecord_bbs_rebate_value_ind'] = totalRebate;
												
											record.submitFields({
								    							type:		'customrecord_bbs_cust_individ_rebate',
								    							id:			_rebateRecordId,
								    							values:		fieldsAndValues,
								    							options:	{
								    										ignoreMandatoryFields: 	true
								    										}
								    							});
											
											break;
											
										case 'A':	//Accrual
											
											//Update the accrual value
											//
											var fieldsAndValues = {};
											fieldsAndValues[accuraField] = _rebateValue;
											
											record.submitFields({
								    							type:		'customrecord_bbs_cust_individ_rebate',
								    							id:			_rebateRecordId,
								    							values:		fieldsAndValues,
								    							options:	{
								    										ignoreMandatoryFields: 	true
								    										}
								    							});
											
											break;
									}
								
								break;
								
							case 2:		//Annually
								
								switch(_rebateProcessingInfo.rebateOrAccrual)
									{
										case 'R':	//Rebate
											
											//Create the credit memo for the group customer
											//
											createCreditMemo(_rebateIndividualCustomer, rebateValue, 'Individual customer rebate - annual');
											
											//Reset the accrual value & update the rebate value
											//
											var totalRebate = Number(isNullorBlank(search.lookupFields({
																					type: 		'customrecord_bbs_cust_individ_rebate', 
																					id: 		_rebateRecordId,
																					columns:	'custrecord_bbs_rebate_value_ind'
																				}).customrecord_bbs_cust_individ_rebate, '0')) + rebateValue;
											
											var fieldsAndValues = {};
											fieldsAndValues[accuraField] = 0;
											fieldsAndValues['custrecord_bbs_rebate_value_ind'] = totalRebate;
												
											record.submitFields({
								    							type:		'customrecord_bbs_cust_individ_rebate',
								    							id:			_rebateRecordId,
								    							values:		fieldsAndValues,
								    							options:	{
								    										ignoreMandatoryFields: 	true
								    										}
								    							});
											
											break;
											
										case 'A':	//Accrual
											
											//Update the accrual value
											//
											var fieldsAndValues = {};
											fieldsAndValues[accuraField] = _rebateValue;
											
											record.submitFields({
								    							type:		'customrecord_bbs_cust_individ_rebate',
								    							id:			_rebateRecordId,
								    							values:		fieldsAndValues,
								    							options:	{
								    										ignoreMandatoryFields: 	true
								    										}
								    							});
											
											break;
									}
								
								break;
											
							case 3:		//Monthly
								
								//Create the credit memo for the group customer
								//
								createCreditMemo(_rebateIndividualCustomer, rebateValue, 'Individual customer rebate - monthly');
								
								//Reset the accrual value & update the rebate value
								//
								var totalRebate = Number(isNullorBlank(search.lookupFields({
																		type: 		'customrecord_bbs_cust_individ_rebate', 
																		id: 		_rebateRecordId,
																		columns:	'custrecord_bbs_rebate_value_ind'
																	}).customrecord_bbs_cust_individ_rebate, '0')) + rebateValue;
								
								var fieldsAndValues = {};
								fieldsAndValues[accuraField] = 0;
								fieldsAndValues['custrecord_bbs_rebate_value_ind'] = totalRebate;
									
								record.submitFields({
					    							type:		'customrecord_bbs_cust_individ_rebate',
					    							id:			_rebateRecordId,
					    							values:		fieldsAndValues,
					    							options:	{
					    										ignoreMandatoryFields: 	true
					    										}
					    							});
								break;
		
						}
				}
		}

	//Create a credit memo record
	//
	function createCreditMemo(_customer, _value, _memo)
		{
			try
				{
					//Get the rebate item from the company preferences
					//
			    	var rebateItemId = runtime.getCurrentScript().getParameter({name: 'custscript_bbs_rebate_item_4_cn'});;
			    	
					var creditRecord = record.create({
													type:			record.Type.CREDIT_MEMO,
													isDynamic:		true,
													defaultValues:	{
																	entity:	_customer
																	}
													});		
					
					creditRecord.setValue({
											fieldId:		'location',
											value:			1				//Nymas Warehouse		
											});	
					
					creditRecord.setValue({
											fieldId:		'memo',
											value:			_memo	
											});	


					creditRecord.selectNewLine({
							    				sublistId: 'item'
							    				});
					
					
					
					creditRecord.setCurrentSublistValue({
									    				sublistId: 	'item',
									    				fieldId: 	'item',
									    				value: 		rebateItemId
									    				});
		
					creditRecord.setCurrentSublistValue({
									    				sublistId: 	'item',
									    				fieldId: 	'quantity',
									    				value: 		1
									    				});
		
					creditRecord.setCurrentSublistValue({
									    				sublistId: 	'item',
									    				fieldId: 	'rate',
									    				value: 		_value
									    				});
		
					creditRecord.setCurrentSublistValue({
									    				sublistId: 	'item',
									    				fieldId: 	'amount',
									    				value: 		_value
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
		}
	
	//See if we need to process the rebate based on percentage, frequency & type
	//
	function checkRebateProcessing(_rebateTargetInfo, _rebateDateInfo, _type, _rebateRecordId)
		{
			var processingInfo = new rebateProcessingInfoObj(false,'','','','','','', _type);	//Initialise returned info object with a status of false (nothing to process)
			
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
												case 1:	//Quarterly - see if today is the end of any quarter or today is the end of a month as we will accrue on a monthly basis
													
												//	if(_rebateDateInfo.isQ1End() || _rebateDateInfo.isQ2End() || _rebateDateInfo.isQ3End() || _rebateDateInfo.isQ4End() || _rebateDateInfo.isEndOfMonth())
												//		{
															var startOfQuarter 				= _rebateDateInfo.getStartOfQuarter();					//Work out the start of the quarter
															var endOfQuarter 				= _rebateDateInfo.getEndOfQuarter();					//Work out the end of the quarter
															processingInfo.status			= true;													//We have data to process
															processingInfo.startDate		= startOfQuarter;										//Start of date range to find invoices for
															processingInfo.endDate			= endOfQuarter;											//End of date range to find invoices for
															processingInfo.percentage		= Number(_rebateTargetInfo.rebateGuarenteedPercent);	//Percentage rebate to apply
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateGuaranteedItemTypes			//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateGuarenteedFreq)			//Return the frequency used
															processingInfo.rebateOrAccrual	= (	_rebateDateInfo.isQ1End() || 
																								_rebateDateInfo.isQ2End() || 
																								_rebateDateInfo.isQ3End() || 
																								_rebateDateInfo.isQ4End() ? 'R' : 'A');				//Say if we need to create a rebate or an accrual
												//		}
													
													break;
													
												case 2:	//Annually - see if today is the end of the year or today is the end of a month as we will accrue on a monthly basis
													
												//	if(_rebateDateInfo.isEndOfYear() || _rebateDateInfo.isEndOfMonth())
												//		{
															var startOfYear 				= _rebateDateInfo.startDate;							//Get the start of the year
															var endOfYear	 				= _rebateDateInfo.endDate;								//Get the end of the year
															processingInfo.status			= true;													//We have data to process
															processingInfo.startDate		= startOfYear;											//Start of date range to find invoices for
															processingInfo.endDate			= endOfYear;											//End of date range to find invoices for
															processingInfo.percentage		= Number(_rebateTargetInfo.rebateGuarenteedPercent);	//Percentage rebate to apply
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateGuaranteedItemTypes			//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateGuarenteedFreq)			//Return the frequency used
															processingInfo.rebateOrAccrual	= (_rebateDateInfo.isEndOfYear() ? 'R' : 'A');			//Say if we need to create a rebate or an accrual
												//		}
													
													break;
													
												case 3:	//Monthly - see if today is the end of a month
													
												//	if(_rebateDateInfo.isEndOfMonth())
												//		{
															var startOfMonth 				= _rebateDateInfo.getStartOfMonth();					//Get the start of the month
															var endOfMonth	 				= _rebateDateInfo.getEndOfMonth();						//Get the end of month
															processingInfo.status			= true;													//We have data to process
															processingInfo.startDate		= startOfMonth;											//Start of date range to find invoices for
															processingInfo.endDate			= endOfMonth;											//End of date range to find invoices for
															processingInfo.percentage		= Number(_rebateTargetInfo.rebateGuarenteedPercent);	//Percentage rebate to apply
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateGuaranteedItemTypes			//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateGuarenteedFreq)			//Return the frequency used
															processingInfo.rebateOrAccrual	= (_rebateDateInfo.isEndOfMonth() ? 'R' : 'A');			//Say if we need to create a rebate or an accrual
												//		}
													
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
												case 1:	//Quarterly - see if today is the end of any quarter or today is the end of a month as we will accrue on a monthly basis
													
											//		if(_rebateDateInfo.isQ1End() || _rebateDateInfo.isQ2End() || _rebateDateInfo.isQ3End() || _rebateDateInfo.isQ4End() || _rebateDateInfo.isEndOfMonth())
											//			{
															var startOfQuarter 				= _rebateDateInfo.getStartOfQuarter();					//Work out the start of the quarter
															var endOfQuarter 				= _rebateDateInfo.getEndOfQuarter();					//Work out the end of the quarter
															processingInfo.status			= true;													//We have data to process
															processingInfo.startDate		= startOfQuarter;										//Start of date range to find invoices for
															processingInfo.endDate			= endOfQuarter;											//End of date range to find invoices for
															processingInfo.percentage		= Number(_rebateTargetInfo.rebateMarketingPercent);		//Percentage rebate to apply
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateMarketingItemTypes			//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateMarketingFreq)			//Return the frequency used
															processingInfo.rebateOrAccrual	= (	_rebateDateInfo.isQ1End() || 
																								_rebateDateInfo.isQ2End() || 
																								_rebateDateInfo.isQ3End() || 
																								_rebateDateInfo.isQ4End() ? 'R' : 'A');				//Say if we need to create a rebate or an accrual
											//			}
													
													break;
													
												case 2:	//Annually - see if today is the end of the year or today is the end of a month as we will accrue on a monthly basis
													
												//	if(_rebateDateInfo.isEndOfYear() || _rebateDateInfo.isEndOfMonth())
												//		{
															var startOfYear 				= _rebateDateInfo.startDate;							//Get the start of the year
															var endOfYear	 				= _rebateDateInfo.endDate;								//Get the end of the year
															processingInfo.status			= true;													//We have data to process
															processingInfo.startDate		= startOfYear;											//Start of date range to find invoices for
															processingInfo.endDate			= endOfYear;											//End of date range to find invoices for
															processingInfo.percentage		= Number(_rebateTargetInfo.rebateMarketingPercent);		//Percentage rebate to apply
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateMarketingItemTypes			//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateMarketingFreq)			//Return the frequency used
															processingInfo.rebateOrAccrual	= (_rebateDateInfo.isEndOfYear() ? 'R' : 'A');			//Say if we need to create a rebate or an accrual
												//		}
													
													break;
													
												case 3:	//Monthly - see if today is the end of a month
													
												//	if(_rebateDateInfo.isEndOfMonth())
												//		{
															var startOfMonth 				= _rebateDateInfo.getStartOfMonth();					//Get the start of the month
															var endOfMonth	 				= _rebateDateInfo.getEndOfMonth();						//Get the end of the month
															processingInfo.status			= true;													//We have data to process
															processingInfo.startDate		= startOfMonth;											//Start of date range to find invoices for
															processingInfo.endDate			= endOfMonth;											//End of date range to find invoices for
															processingInfo.percentage		= Number(_rebateTargetInfo.rebateMarketingPercent);		//Percentage rebate to apply
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateMarketingItemTypes			//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateMarketingFreq)			//Return the frequency used
															processingInfo.rebateOrAccrual	= (_rebateDateInfo.isEndOfMonth() ? 'R' : 'A');			//Say if we need to create a rebate or an accrual
												//		}
													
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
												case 1:	//Quarterly - see if today is the end of any quarter or today is the end of a month as we will accrue on a monthly basis
													
												//	if(_rebateDateInfo.isQ1End() || _rebateDateInfo.isQ2End() || _rebateDateInfo.isQ3End() || _rebateDateInfo.isQ4End() || _rebateDateInfo.isEndOfMonth())
												//		{
															var startOfQuarter 				= _rebateDateInfo.getStartOfQuarter();					//Work out the start of the quarter
															var endOfQuarter 				= _rebateDateInfo.getEndOfQuarter();					//Work out the end of the quarter
															processingInfo.status			= true;													//We have data to process
															processingInfo.startDate		= startOfQuarter;										//Start of date range to find invoices for
															processingInfo.endDate			= endOfQuarter;											//End of date range to find invoices for
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateTargetItemTypes				//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateTargetFrequency)		//Return the frequency used
															processingInfo.rebateOrAccrual	= (	_rebateDateInfo.isQ1End() || 
																								_rebateDateInfo.isQ2End() || 
																								_rebateDateInfo.isQ3End() || 
																								_rebateDateInfo.isQ4End() ? 'R' : 'A');				//Say if we need to create a rebate or an accrual
												//		}
													
													break;
													
												case 2:	//Annually - see if today is the end of the year or today is the end of a month as we will accrue on a monthly basis
													
												//	if(_rebateDateInfo.isEndOfYear() || _rebateDateInfo.isEndOfMonth())
												//		{
															var startOfYear 				= _rebateDateInfo.startDate;							//Get the start of the year
															var endOfYear	 				= _rebateDateInfo.endDate;								//Get the end of the year
															processingInfo.status			= true;													//We have data to processs
															processingInfo.startDate		= startOfYear;											//Start of date range to find invoices for
															processingInfo.endDate			= endOfYear;											//End of date range to find invoices for
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateTargetItemTypes				//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateTargetFrequency)		//Return the frequency used
															processingInfo.rebateOrAccrual	= (_rebateDateInfo.isEndOfYear() ? 'R' : 'A');			//Say if we need to create a rebate or an accrual
												//		}
													
													break;
													
												case 3:	//Monthly - see if today is the end of a month
													
												//	if(_rebateDateInfo.isEndOfMonth())
												//		{
															var startOfMonth 				= _rebateDateInfo.getStartOfMonth();					//Get the start of the month
															var endOfMonth	 				= _rebateDateInfo.getEndOfMonth();						//Get the end of the month
															processingInfo.status			= true;													//We have data to processs
															processingInfo.startDate		= startOfMonth;											//Start of date range to find invoices for
															processingInfo.endDate			= endOfMonth;											//End of date range to find invoices for
															processingInfo.rebateItemTypes	= _rebateTargetInfo.rebateTargetItemTypes				//Item types
															processingInfo.frequency 		= Number(_rebateTargetInfo.rebateTargetFrequency)		//Return the frequency used
															processingInfo.rebateOrAccrual	= (_rebateDateInfo.isEndOfMonth() ? 'R' : 'A');			//Say if we need to create a rebate or an accrual
															
															//Convert the date ranges to strings for the searches
								    						//
									    					var startDateString = format.format({value: startOfMonth, type: format.Type.DATE});
									    					var endDateString 	= format.format({value: endOfMonth, type: format.Type.DATE});

															//Find all the customers that are linked to this rebate group
									    					//
								    						var customerArray 	= findGroupMembers(startDateString, endDateString, _rebateRecordId);
								    						
								    						//Now get a value of all the invoices that match the customers
								    						//
								    						var invoiceValue 	= findInvoiceValue(customerArray, _rebateTargetInfo.rebateItemTypes, startDateString, endDateString);
								    						
															
															//Loop through the target values to find out which one is valid
															//Rebate targets are in ascending value, so keep going until we overshoot
								    						//
															var tempRebatePercent = Number(0);
															
															for ( var targetValue in _rebateTargetInfo.rebateTargets) 
																{
																	if(Number(invoiceValue) >= Number(targetValue))
																		{
																			tempRebatePercent = Number(_rebateTargetInfo.rebateTargets[targetValue]);
																		}
																	else
																		{
																			break;
																		}
																}
															
															processingInfo.percentage = Number(tempRebatePercent);		//Percentage rebate to apply
												//		}
													
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
			var individualRebates = getResults(search.create({
															   type: 		"customrecord_bbs_cust_individ_rebate",
															   filters:
														    			   [
														    			      ["isinactive","is","F"], 
														    			      "AND",
														    			      ["custrecord_bbs_parent_group_rebate","anyof",_groupId]
														    			   ],
															   columns:
															   			   [
															   			      search.createColumn({name: "custrecord_bbs_ind_customer", label: "Customer"})
															   			   ]
															}));
			
			
			//Gather all of the customer id's into an array
			//
			var customerArray		= [];
			
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
			var individualRebates = getResults(search.create({
																	    			   type: 		"customrecord_bbs_cust_individ_rebate",
																	    			   filters:
																				    			   [
																				    			      ["isinactive","is","F"], 
																				    			     "AND",
																				    			      ["custrecord_bbs_parent_group_rebate","anyof",_groupId],
																				    			      "AND",
																				    			      ["custrecord_bbs_left_buying_group","is","F"]
																				    			   ],
																	    			   columns:
																				    			   [
																				    			      search.createColumn({name: "name",sort: search.Sort.ASC,  label: "ID"}),
																				    			      search.createColumn({name: "internalid", label: "Internal Id"}),
																				    			      search.createColumn({name: "custrecord_bbs_ind_customer", label: "Customer"})
																				    			   ]
																	    			}));
			
			//Gather all of the customer id's into an array
			//
			var customerArray		= [];
			
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
	
	//Get sum of invoices grouped by customer
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
							var invoiceValue 				= Number(invoiceSearchObj[int].getValue({name: "amount",summary: "SUM"}));
							var invoiceCustomer				= invoiceSearchObj[int].getValue({name: "entity",summary: "GROUP"});
							invoiceValues[invoiceCustomer]	= invoiceValue;
						}
				}
			
			return invoiceValues;
		}
	
	//Get all of the valid rebate target values & percentages
	//
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
			
			//Now sort into ascending order
			//
			const orderedTargets = {};
			Object.keys(rebateTargets).sort().forEach(function(key) {
																	orderedTargets[key] = rebateTargets[key];
																	});
			
			return orderedTargets;
		}
	
	//Get all of the valid rebate target values & percentages
	//
	function getIndividualRebateTargets(_rebateRecord)
		{
			var rebateTargets = {};
			
			//Lump all of the rebate targets together in one object
			//
			for (var int = 1; int < 15; int++) 
				{
					var targetValueField 	= String('custrecord_bbs_ind_level' + int.toString());
					var targetPercentField 	= String('custrecord_bbs_ind_lev' + int.toString() + 'percent');
				
					var targetValue 	= Number(_rebateRecord.getValue({fieldId: targetValueField}));
					var targetPercent 	= Number(_rebateRecord.getValue({fieldId: targetPercentField}));
					
					if(targetValue > 0)
						{
							rebateTargets[targetValue] = targetPercent;
						}
				}
			
			//Now sort into ascending order
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

    
    
    //
	//=========================================================================
	//Objects
	//=========================================================================
	//
	
    
    
    function rebateProcessingInfoObj(_status, _startDate, _endDate, _percentage, _rebateItemTypes, _frequency, _rebateOrAccrual, _rebateType)
		{
	    	this.status				= _status;
    		this.startDate 			= _startDate;			
	    	this.endDate			= _endDate;	
	    	this.percentage			= _percentage;
	    	this.rebateItemTypes	= _rebateItemTypes;
	    	this.frequency			= _frequency;
	    	this.rebateOrAccrual	= _rebateOrAccrual;
	    	this.rebateType			= _rebateType;
		}

    function rebateTargetInfoObj(_rebateTargets, _rebateTargetFrequency, _rebateGuarenteedPercent, _rebateGuarenteedFreq, _rebateMarketingPercent, _rebateMarketingFreq, _rebateGuaranteedItemTypes, _rebateMarketingItemTypes, _rebateTargetItemTypes, _rebateMarketingFixedAmt)
    	{
	    	this.rebateTargets 				= _rebateTargets;			
	    	this.rebateTargetFrequency		= _rebateTargetFrequency;	
	    	this.rebateGuarenteedPercent	= _rebateGuarenteedPercent;
	    	this.rebateGuarenteedFreq		= _rebateGuarenteedFreq;	
	    	this.rebateMarketingPercent		= _rebateMarketingPercent;	
	    	this.rebateMarketingFreq		= _rebateMarketingFreq;	
	    	this.rebateGuaranteedItemTypes	= _rebateGuaranteedItemTypes;
	    	this.rebateMarketingItemTypes	= _rebateMarketingItemTypes;
	    	this.rebateTargetItemTypes		= _rebateTargetItemTypes;
	    	this.rebateMarketingFixedAmt	= _rebateMarketingFixedAmt;
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
    		
	       		this.getEndOfQuarter	= function()
									{
										//Is todays date inside the Q1 end date?
										//
										if(this.today.getTime() <= this.q1EndDate.getTime())
											{
												return this.q1EndDate;
											}
						
										//Is todays date inside the Q2 end date?
										//
										if(this.today.getTime() <= this.q2EndDate.getTime())
											{
												return this.q2EndDate;
											}
						
										//Is todays date inside the Q3 end date?
										//
										if(this.today.getTime() <= this.q3EndDate.getTime())
											{
												return this.q3EndDate;
											}
						
										//Is todays date inside the Q4 end date?
										//
										if(this.today.getTime() <= this.endDate.getTime())
											{
												return this.q4EndDate;
											}
						
										return returnedDate;
									}

    	}
    
    function isNullorBlank(_string, _replacer)
		{
			return (_string == null || _string == '' ? _replacer : _string);
		}
    
	return 	{
			getResults:							getResults,
			findInvoiceValue:					findInvoiceValue,
			getGroupRebateTargets:				getGroupRebateTargets,
			getIndividualRebateTargets:			getIndividualRebateTargets,
			rebateTargetInfoObj:				rebateTargetInfoObj,
			rebateDateInfoObj:					rebateDateInfoObj,
			createBuyingGroupRebateOrAccrual:	createBuyingGroupRebateOrAccrual,
			createCustomerRebateOrAccrual:		createCustomerRebateOrAccrual,
			checkRebateProcessing:				checkRebateProcessing,
			findGroupMembers:					findGroupMembers,
			findCurrentGroupMembers:			findCurrentGroupMembers,
			findInvoiceValueByCustomer:			findInvoiceValueByCustomer,
			createIndividualRebateOrAccrual:	createIndividualRebateOrAccrual
			};	
});
