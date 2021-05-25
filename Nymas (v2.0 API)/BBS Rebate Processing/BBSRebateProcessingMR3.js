/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search', './BBSRebateProcessingLibrary', 'N/format', 'N/task'],

function(record, runtime, search, BBSRebateProcessingLibrary, format, task)
{
   
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
	
	//Map reduce script #3 for rebate processing
	//Calculates the rebates for each individual customer rebate record
	//
    function getInputData() 
	    {
    		try
    			{
		    		//Search for all individual rebate records that are active for this year
		    		//
		    		var today 				= new Date();
		    		var startOfYear			= new Date(today.getFullYear(), 0, 1);
		    		var endOfYear			= new Date(today.getFullYear(), 11, 31);
		    		var startOfYearString	= format.format({value: startOfYear, type: format.Type.DATE});
		    		var endOfYearString		= format.format({value: endOfYear, type: format.Type.DATE});
		    		
		    		return	BBSRebateProcessingLibrary.getResults(search.create({
															    			   type: 		"customrecord_bbs_cust_individ_rebate",
															    			   filters:
																		    			   [
																		    			      ["isinactive","is","F"], 														//Not inactive
																		    			      "AND", 
																		    			      ["custrecord_individual_rebate_start_date","onorafter",startOfYearString],	//Start of rebate in on or after the start of this current year
																		    			      "AND", 
																		    			      ["custrecord_individual_rebate_end_date","onorbefore",endOfYearString],		//End of rebate is on or before the end of this year
																		    			      "AND",
																		    			      ["custrecord_bbs_parent_group_rebate","anyof","@NONE@"],						//There is no link to a group rebate record
																		    			      "AND",
																		    			      ["custrecord_bbs_rebate_i_status","anyof","1"]											//Status = In Progress
																		    			   ],
															    			   columns:
																		    			   [
																		    			      search.createColumn({name: "name",sort: search.Sort.ASC,  label: "ID"}),
																		    			      search.createColumn({name: "internalid", label: "Internal Id"}),
																		    			      search.createColumn({name: "custrecord_bbs_ind_customer", label: "Customer"})
																		    			   ]
															    			}));
    			}
    		catch(err)
    			{
	    			log.error({
								title: 		'Unexpexcted error in getInputData section',
								details: 	err
								});
    			}
	    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) 
	    {
    		try
    			{
	    			//Rehydrate the search result & get values
		    		//
		    		var searchResult 			= JSON.parse(context.value);
		    		var searchId	 			= searchResult.values['internalid'][0].value;	//Internal id of individual rebate record
		    		var now						= new Date();
		    		var today					= new Date(now.getFullYear(), now.getMonth(), now.getDate());
		    		
		    		//Load the rebate record
		    		//
		    		var rebateRecord = record.load({
		    										type:		"customrecord_bbs_cust_individ_rebate",
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
									    															BBSRebateProcessingLibrary.getIndividualRebateTargets(rebateRecord),					//Target Rebate Percentages Key=Target Amount, Value=Rebate Percentage
									    															rebateRecord.getValue({fieldId: 'custrecord_bbs_ind_target_frequency'}), 				//Target Rebate Frequency 	1=Quarterly 2=Annually 3=Monthly
									    															Number(rebateRecord.getValue({fieldId: 'custrecord_group_rebate_guaranteed_perc'})),	//Guaranteed Rebate Percentage
									    															rebateRecord.getValue({fieldId: 'custrecord_group_rebate_guaranteed_freq'}),			//Guaranteed Rebate Frequency 1=Quarterly 2=Annually 3=Monthly
									    															Number(rebateRecord.getValue({fieldId: 'custrecord_bbs_market_percent_ind'})),			//Marketing Rebate Percentage
									    															rebateRecord.getValue({fieldId: 'custrecord_bbs_market_percent_freq_ind'}),				//Marketing Rebate Frequency 1=Quarterly 2=Annually 3=Monthly
									    															rebateRecord.getValue({fieldId: 'custrecord_bbs_rebate_i_guaranteed_type'}),			//Guaranteed Rebate Item Types
									    															rebateRecord.getValue({fieldId: 'custrecord_bbs_rebate_i_marketing_type'}),				//Marketing Rebate Item Types
									    															rebateRecord.getValue({fieldId: 'custrecord_bbs_rebate_i_targeted_type'}),				//Target Rebate Item Type
									    															Number(rebateRecord.getValue({fieldId: 'custrecord_bbs_rebate_i_marketing_fixed'}))		//Marketing fixed amount
		    																						);
		    				//Get rebate dates
		    				//
		    				var rebateDateInfo	= new BBSRebateProcessingLibrary.rebateDateInfoObj(
																		    						rebateRecord.getValue({fieldId: 'custrecord_individual_rebate_start_date'}), 	//Start date		
																									rebateRecord.getValue({fieldId: 'custrecord_bbs_end_q1_ind'}),					//End of Q1
																									rebateRecord.getValue({fieldId: 'custrecord_bbs_end_q2_ind'}),					//End of Q2
																									rebateRecord.getValue({fieldId: 'custrecord_bbs_end_q3_ind'}),					//End of Q3		
																									rebateRecord.getValue({fieldId: 'custrecord_individual_rebate_end_date'}),		//End date / End of Q4
																									today																			//Today's date (no time component)
		    																						);
		    				
		    				//Get sundry info from the rebate record
		    				//
		    				var rebateCustomer		= rebateRecord.getValue({fieldId: 'custrecord_bbs_ind_customer'});
		    				var rebateRebateValue	= Number(rebateRecord.getValue({fieldId: 'custrecord_bbs_rebate_value_ind'}));
		    				var rebateSalesValue	= Number(rebateRecord.getValue({fieldId: 'custrecord_bbs_actual_sales_value_ind'}));
		    				
		    				
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
		    						var customerArray 	= [rebateCustomer];		//In the case of an individual rebate record, there will only be one customer
		    						
		    						//Now get a value of all the invoices that match the customers
		    						//
		    						var invoiceValue 	= BBSRebateProcessingLibrary.findInvoiceValue(customerArray, rebateTargetInfo.rebateGuaranteedItemTypes, startDateString, endDateString);
		    						
		    						//Calculate the rebate value
		    						//
		    						//var rebateValue = (invoiceValue / 100.0) * rebateProcessingInfo.percentage;
		    						var rebateValue = Number(((invoiceValue / 100.0) * rebateProcessingInfo.percentage).toFixed(2));
		    						
		    						//Rebate/Accrual is applied to the individual customer
		    						//
			    					BBSRebateProcessingLibrary.createIndividualRebateOrAccrual(
			    																			rebateCustomer,				//Individual customer
					    																	rebateValue,				//Value of rebate
					    																	rebateProcessingInfo,		//Rebate processing info object
					    																	searchId					//Id of rebate record
					    																	);

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
			    					var customerArray 	= [rebateCustomer];		//In the case of an individual rebate record, there will only be one customer
		    						
		    						//Now get a value of all the invoices that match the customers
		    						//
		    						var invoiceValue 	= BBSRebateProcessingLibrary.findInvoiceValue(customerArray, rebateTargetInfo.rebateItemTypes, startDateString, endDateString);
		    						
		    						//Calculate the rebate value
		    						//
		    						var rebateValue = Number(0);
		    						
		    						if(rebateProcessingInfo.rebateMarketingFixedAmt != null && rebateMarketingFixedAmt != '')
		    							{
		    								rebateValue = Number(rebateProcessingInfo.rebateMarketingFixedAmt);
		    							}
		    						else
		    							{
		    								//rebateValue = (invoiceValue / 100.0) * rebateProcessingInfo.percentage;
		    								rebateValue = Number(((invoiceValue / 100.0) * rebateProcessingInfo.percentage).toFixed(2));
				    						
		    							}
		    						
		    						
		    						//Rebate/Accrual is applied to the group customer
		    						//
			    					BBSRebateProcessingLibrary.createIndividualRebateOrAccrual(
			    																			rebateCustomer,		//Group customer
					    																	rebateValue,				//Value of rebate
					    																	rebateProcessingInfo,		//Rebate processing info object
					    																	searchId					//Id of rebate record
					    																	);
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
									var customerArray 	= [rebateCustomer];		//In the case of an individual rebate record, there will only be one customer
		    						
									//Now get a value of all the invoices that match the customers
									//
									var invoiceValue 	= BBSRebateProcessingLibrary.findInvoiceValue(customerArray, rebateTargetInfo.rebateItemTypes, startDateString, endDateString);
									
									//Calculate the rebate value
									//
									//var rebateValue = (invoiceValue / 100.0) * rebateProcessingInfo.percentage;
									var rebateValue = Number(((invoiceValue / 100.0) * rebateProcessingInfo.percentage).toFixed(2));
		    						
									//Rebate/Accrual is applied to the group customer
									//
									BBSRebateProcessingLibrary.createIndividualRebateOrAccrual(
																							rebateCustomer,		//Group customer
																							rebateValue,				//Value of rebate
																							rebateProcessingInfo,		//Rebate processing info object
																							searchId					//Id of rebate record
																							);
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

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) 
	    {
	
	    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) 
	    {
	    	//Submit the next map/reduce job 
			//
			
			try
				{
					var mrTask = task.create({
											taskType:		task.TaskType.MAP_REDUCE,
											scriptId:		'customscript_bbs_rebate_processing_4',	
											deploymentid:	null
											});
					
					mrTask.submit();
				}
			catch(err)
				{
					log.error({
								title: 		'Error submitting mr 4 script',
								details: 	err
								});	
				}
	    }

    return {
	        getInputData: 	getInputData,
	        map: 			map,
	        reduce: 		reduce,
	        summarize: 		summarize
    		};
    
});
