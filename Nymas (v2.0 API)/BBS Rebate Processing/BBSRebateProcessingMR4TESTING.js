/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */


define(['N/record', 'N/runtime', 'N/search', './BBSRebateProcessingLibrary', 'N/format', 'N/task'],

function(record, runtime, search, BBSRebateProcessingLibrary, format, task)
{
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) 
	    {

    		try
    			{
		    		//Rehydrate the search result & get values
		    		//
		    		var searchId	 			= '';	//Internal id of group rebate record
		    		var now						= new Date();
		    		var today					= new Date(now.getFullYear(), now.getMonth(), now.getDate());
		    		
		    		//Load the rebate record
		    		//
		    		var rebateRecord = record.load({
		    										type:		"customrecord_bbs_cust_group_rebate",
		    										id:			searchId,
		    										isDynamic:	false
		    										});
		    		
		    		//Record loaded ok?
		    		//
		    		if(rebateRecord != null)
		    			{
		    				//Get rebate targets & values
		    				//
		    				var rebateTargetInfo = new BBSRebateProcessingLibrary.rebateTargetInfoObj(
									    															BBSRebateProcessingLibrary.getGroupRebateTargets(rebateRecord),							//Target Rebate Percentages Key=Target Amount, Value=Rebate Percentage
									    															rebateRecord.getValue({fieldId: 'custrecord_bbs_target_frequency'}), 					//Target Rebate Frequency 	1=Quarterly 2=Annually 3=Monthly
									    															Number(rebateRecord.getValue({fieldId: 'custrecord_guaranteed_percentage'})),			//Guaranteed Rebate Percentage
									    															rebateRecord.getValue({fieldId: 'custrecord_bbs_pay_frequency'}),						//Guaranteed Rebate Frequency 1=Quarterly 2=Annually 3=Monthly
									    															Number(rebateRecord.getValue({fieldId: 'custrecord_bbs_marketing_percent'})),			//Marketing Rebate Percentage
									    															rebateRecord.getValue({fieldId: 'custrecord_bbs_market_percent_frequency'}),			//Marketing Rebate Frequency 1=Quarterly 2=Annually 3=Monthly
									    															rebateRecord.getValue({fieldId: 'custrecord_bbs_rebate_item_type'}),					//Guaranteed Rebate Item Types
									    															rebateRecord.getValue({fieldId: 'custrecord_bbs_rebate_item_type_g_market'}),			//Marketing Rebate Item Types
									    															rebateRecord.getValue({fieldId: 'custrecord_bbs_rebate_item_type_g_target'}),			//Target Rebate Item Type
									    															Number(rebateRecord.getValue({fieldId: 'custrecord_bbs_rebate_g_fixed_marketing'}))		//Marketing fixed amount
		    																						);
		    				//Get rebate dates
		    				//
		    				var rebateDateInfo	= new BBSRebateProcessingLibrary.rebateDateInfoObj(
																		    						rebateRecord.getValue({fieldId: 'custrecord_bbs_start_date'}), 					//Start date		
																									rebateRecord.getValue({fieldId: 'custrecord_bbs_end_q1'}),						//End of Q1
																									rebateRecord.getValue({fieldId: 'custrecord_bbs_end_q2'}),						//End of Q2
																									rebateRecord.getValue({fieldId: 'custrecord_bbs_end_q3'}),						//End of Q3		
																									rebateRecord.getValue({fieldId: 'custrecord_bbs_end_date'}),					//End date / End of Q4
																									today																			//Today's date (no time component)
		    																						);
		    				
		    				//Get sundry info from the rebate record
		    				//
		    				var rebateBuyingGroup	= rebateRecord.getValue({fieldId: 'custrecord_bbs_buying_group'});
		    				var rebateGroupCustomer	= rebateRecord.getValue({fieldId: 'custrecord_bbs_customer'});
		    				var rebateRebateValue	= Number(rebateRecord.getValue({fieldId: 'custrecord_bbs_rebate_value'}));
		    				var rebateSalesValue	= Number(rebateRecord.getValue({fieldId: 'custrecord_bbs_actual_sales_value'}));
		    				
		    				
		    				//=====================================================================================
		    				//Main rebate processing
		    				//=====================================================================================
		    				//
		    				
		    				//============================================
		    				//Do we need to process any Guaranteed Rebate?
		    				//============================================
		    				//
		    				var rebateProcessingInfo = BBSRebateProcessingLibrary.checkRebateProcessing(
		    																							rebateTargetInfo,	//Target info
		    																							rebateDateInfo,		//Date info
		    																							'G',				//Guaranteed rebate
		    																							searchId			//Current rebate record id
																			    						);
		    				
		    				//Check to see if there is anything to process
		    				//Object properties are status, startDate, endDate, percentage, item types, frequency, type
		    				//
		    				if(rebateProcessingInfo.status)
		    					{
		    						//Convert the date ranges to strings for the searches
		    						//
			    					var startDateString = format.format({value: rebateProcessingInfo.startDate, type: format.Type.DATE});
			    					var endDateString 	= format.format({value: rebateProcessingInfo.endDate, type: format.Type.DATE});
		    						
			    					//Find all the customers that are linked to this rebate group
			    					//
		    						var customerArray 			= BBSRebateProcessingLibrary.findGroupMembers(startDateString, endDateString, searchId);
		    						
		    						//Find all the customers that are linked to this rebate group, that have not been flagged as having left the buying group
			    					//
		    						var currentCustomerArray 	= BBSRebateProcessingLibrary.findCurrentGroupMembers(startDateString, endDateString, searchId);
		    						
		    						//Now get a value of all the invoices that match the customers
		    						//
		    						var invoiceValue 	= BBSRebateProcessingLibrary.findInvoiceValue(customerArray, rebateTargetInfo.rebateGuaranteedItemTypes, startDateString, endDateString);
		    						
		    						//Now get the breakdown of invoice values by customer, but only for the customers that are still in the buying group
		    						//
		    						var invoiceValueByCustomer = BBSRebateProcessingLibrary.findInvoiceValueByCustomer(currentCustomerArray, rebateTargetInfo.rebateGuaranteedItemTypes, startDateString, endDateString);
		    						
		    						//Calculate the rebate value
		    						//
		    						var rebateValue = (invoiceValue / 100.0) * rebateProcessingInfo.percentage;
		    						
		    						//Now work out how we apply the rebate
		    						//
		    						if(rebateGroupCustomer != null && rebateGroupCustomer != '')
		    							{
		    								//Rebate/Accrual is applied to the group customer
		    								//
			    							BBSRebateProcessingLibrary.createCustomerRebateOrAccrual(
					    																			rebateGroupCustomer,		//Group customer
					    																			rebateValue,				//Value of rebate
					    																			rebateProcessingInfo,		//Rebate processing info object
					    																			searchId					//Id of rebate record
					    																			);
		    							}
		    						
		    						if(rebateBuyingGroup != null && rebateBuyingGroup != '')
		    							{
		    								//Rebate/Accrual is applied to the customers in the buying group
		    								//
			    							BBSRebateProcessingLibrary.createBuyingGroupRebateOrAccrual(
			    																						currentCustomerArray,		//List of customers that are still in the buying group
																										rebateValue,				//Value of rebate
																										rebateProcessingInfo,		//Rebate processing info object
						    																			searchId,					//Id of rebate record
						    																			invoiceValueByCustomer		//Value of incoice by customer
																										);
		    							}
		    					}
		    				
		    				
		    				//============================================
		    				//Do we need to process any Marketing Rebate?
		    				//============================================
		    				//
		    				var rebateProcessingInfo = BBSRebateProcessingLibrary.checkRebateProcessing(
		    																							rebateTargetInfo,	//Target info
		    																							rebateDateInfo,		//Date info
		    																							'M',				//Marketing rebate
		    																							searchId			//Current rebate record id
																			    						);
		    				
		    				//Check to see if there is anything to process
		    				//Object properties are status, startDate, endDate, percentage, item types, frequency, type
		    				//
		    				if(rebateProcessingInfo.status)
		    					{
		    						//Convert the date ranges to strings for the searches
		    						//
			    					var startDateString = format.format({value: rebateProcessingInfo.startDate, type: format.Type.DATE});
			    					var endDateString 	= format.format({value: rebateProcessingInfo.endDate, type: format.Type.DATE});
		    						
			    					//Find all the customers that are linked to this rebate group
			    					//
		    						var customerArray 			= BBSRebateProcessingLibrary.findGroupMembers(startDateString, endDateString, searchId);
		    						
		    						//Find all the customers that are linked to this rebate group, that have not been flagged as having left the buying group
			    					//
		    						var currentCustomerArray 	= BBSRebateProcessingLibrary.findCurrentGroupMembers(startDateString, endDateString, searchId);
		    						
		    						//Now get a value of all the invoices that match the customers
		    						//
		    						var invoiceValue 	= BBSRebateProcessingLibrary.findInvoiceValue(customerArray, rebateTargetInfo.rebateMarketingItemTypes, startDateString, endDateString);
		    						
		    						//Now get the breakdown of invoice values by customer, but only for the customers that are still in the buying group
		    						//
		    						var invoiceValueByCustomer = BBSRebateProcessingLibrary.findInvoiceValueByCustomer(currentCustomerArray, rebateTargetInfo.rebateMarketingItemTypes, startDateString, endDateString);
		    						
		    						//Calculate the rebate value
		    						//
		    						var rebateValue = Number(((invoiceValue / 100.0) * rebateProcessingInfo.percentage).toFixed(2));
		    						
		    						//Now work out how we apply the rebate
		    						//
		    						if(rebateGroupCustomer != null && rebateGroupCustomer != '')
		    							{
		    								//Rebate/Accrual is applied to the group customer
		    								//
			    							BBSRebateProcessingLibrary.createCustomerRebateOrAccrual(
					    																			rebateGroupCustomer,		//Group customer
					    																			rebateValue,				//Value of rebate
					    																			rebateProcessingInfo,		//Rebate processing info object
					    																			searchId					//Id of rebate record
					    																			);
		    							}
		    						
		    						if(rebateBuyingGroup != null && rebateBuyingGroup != '')
		    							{
		    								//Rebate/Accrual is applied to the customers in the buying group
		    								//
			    							BBSRebateProcessingLibrary.createBuyingGroupRebateOrAccrual(
			    																						currentCustomerArray,		//List of customers that are still in the buying group
																										rebateValue,				//Value of rebate
																										rebateProcessingInfo,		//Rebate processing info object
						    																			searchId,					//Id of rebate record
						    																			invoiceValueByCustomer		//Value of incoice by customer
																										);
		    							}
		    					}
		    				
		    				//============================================
		    				//Do we need to process any Target Rebate?
		    				//============================================
		    				//
		    				var rebateProcessingInfo = BBSRebateProcessingLibrary.checkRebateProcessing(
																										rebateTargetInfo,	//Target info
																										rebateDateInfo,		//Date info
																										'T',				//Target rebate
																										searchId			//Current rebate record id
																			    						);

							//Check to see if there is anything to process
							//Object properties are status, startDate, endDate, percentage, item types, frequency, type ('A'ccrual or 'R'ebate)
							//
							if(rebateProcessingInfo.status)
								{
									//Convert the date ranges to strings for the searches
									//
									var startDateString = format.format({value: rebateProcessingInfo.startDate, type: format.Type.DATE});
									var endDateString 	= format.format({value: rebateProcessingInfo.endDate, type: format.Type.DATE});
									
									//Find all the customers that are linked to this rebate group
									//
									var customerArray 			= BBSRebateProcessingLibrary.findGroupMembers(startDateString, endDateString, searchId);
									
									//Find all the customers that are linked to this rebate group, that have not been flagged as having left the buying group
									//
									var currentCustomerArray 	= BBSRebateProcessingLibrary.findCurrentGroupMembers(startDateString, endDateString, searchId);
									
									//Now get a value of all the invoices that match the customers
									//
									var invoiceValue 	= BBSRebateProcessingLibrary.findInvoiceValue(customerArray, rebateTargetInfo.rebateTargetItemTypes, startDateString, endDateString);
									
									//Now get the breakdown of invoice values by customer, but only for the customers that are still in the buying group
									//
									var invoiceValueByCustomer = BBSRebateProcessingLibrary.findInvoiceValueByCustomer(currentCustomerArray, rebateTargetInfo.rebateTargetItemTypes, startDateString, endDateString);
									
									//Calculate the rebate value
									//
									var rebateValue = Number(((invoiceValue / 100.0) * rebateProcessingInfo.percentage).toFixed(2));
		    						
									//Now work out how we apply the rebate
									//
									if(rebateGroupCustomer != null && rebateGroupCustomer != '')
										{
											//Rebate/Accrual is applied to the group customer
											//
											BBSRebateProcessingLibrary.createCustomerRebateOrAccrual(
																									rebateGroupCustomer,		//Group customer
																									rebateValue,				//Value of rebate
																									rebateProcessingInfo,		//Rebate processing info object
																									searchId					//Id of rebate record
																									);
										}
									
									if(rebateBuyingGroup != null && rebateBuyingGroup != '')
										{
											//Rebate/Accrual is applied to the customers in the buying group
											//
											BBSRebateProcessingLibrary.createBuyingGroupRebateOrAccrual(
																										currentCustomerArray,		//List of customers that are still in the buying group
																										rebateValue,				//Value of rebate
																										rebateProcessingInfo,		//Rebate processing info object
																										searchId,					//Id of rebate record
																										invoiceValueByCustomer		//Value of incoice by customer
																										);
										}
								}
		    			}
    			}
    		catch(err)
				{
	    			log.error({
								title: 		'Unexpexcted error in map section',
								details: 	err
								});
				}
	    }

   

    return {execute: execute};
    
});
