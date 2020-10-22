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
	//Calculates the rebate for each group customer rebate record
	//
    function getInputData() 
	    {
    		try
    			{
		    		//Search for all group rebate records that are active for this year
		    		//
		    		var today 				= new Date();
		    		var startOfYear			= new Date(today.getFullYear(), 0, 1);
		    		var endOfYear			= new Date(today.getFullYear(), 11, 31);
		    		var startOfYearString	= format.format({value: startOfYear, type: format.Type.DATE});
		    		var endOfYearString		= format.format({value: endOfYear, type: format.Type.DATE});
		    		
		    		var searchResults =	BBSRebateProcessingLibrary.getResults(search.create({
															    			   type: 		"customrecord_bbs_cust_group_rebate",
															    			   filters:
																		    			   [
																		    			      ["isinactive","is","F"], 
																		    			      "AND", 
																		    			      ["custrecord_bbs_end_q1","onorafter",startOfYearString],
																		    			      "AND", 
																		    			      ["custrecord_bbs_end_q1","onorbefore",endOfYearString],
																		    			      "AND",
																		    			      ["custrecord_bbs_status","anyof","1"]		//Status = In Progress
																		    			   ],
															    			   columns:
																		    			   [
																		    			      search.createColumn({name: "name",sort: search.Sort.ASC,  label: "ID"}),
																		    			      search.createColumn({name: "internalid", label: "Internal Id"}),
																		    			      search.createColumn({name: "custrecord_bbs_customer", label: "Customer"}),
																		    			      search.createColumn({name: "custrecord_bbs_end_q1", label: "End of Q1"}),
																		    			      search.createColumn({name: "custrecord_bbs_end_q2", label: "End of Q2"}),
																		    			      search.createColumn({name: "custrecord_bbs_end_q3", label: "End of Q3"}),
																		    			      search.createColumn({name: "custrecord_bbs_rebate_item_type", label: "Rebate Item Types"})
																		    			   ]
															    			}));
		    		
		    		//log.debug({title: 'search results for group rebates', details: searchResults});
		    		
		    		return searchResults;
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
		    		var searchId	 			= searchResult.values['internalid'][0].value;	//Internal id of group rebate record
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
									    															BBSRebateProcessingLibrary.getGroupRebateTargets(rebateRecord),					//Key=Target Amount, Value=Rebate Percentage
									    															rebateRecord.getValue({fieldId: 'custrecord_bbs_target_frequency'}), 			//1=Quarterly 2=Annually 3=Monthly
									    															rebateRecord.getValue({fieldId: 'custrecord_guaranteed_percentage'}),
									    															rebateRecord.getValue({fieldId: 'custrecord_bbs_pay_frequency'}),				//1=Quarterly 2=Annually 3=Monthly
									    															rebateRecord.getValue({fieldId: 'custrecord_bbs_marketing_percent'}),
									    															rebateRecord.getValue({fieldId: 'custrecord_bbs_market_percent_frequency'}),	//1=Quarterly 2=Annually 3=Monthly
									    															rebateRecord.getValue({fieldId: 'custrecord_bbs_rebate_item_type'})
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
		    																							'G'					//Guaranteed rebate
																			    						);
		    				//Check to see if there is anything to process
		    				//Object properties are status, startDate, endDate, percentage, item types
		    				//
		    				if(rebateProcessingInfo.status)
		    					{
		    						//Find a list of all the customers that are under this rebate group
		    						//
			    					var startDateString = format.format({value: rebateProcessingInfo.startDate, type: format.Type.DATE});
			    					var endDateString 	= format.format({value: rebateProcessingInfo.endDate, type: format.Type.DATE});
		    						
		    						var customerArray = findGroupMembers(startDateString, endDateString, searchId);
		    						
		    						//Now get a value of all the invoices that match the customers
		    						//
		    						var invoiceValue = findInvoiceValue(customerArray, rebateTargetInfo.rebateItemTypes, startDateString, endDateString);
		    						
		    						//Apply the rebate percentage
		    						//
		    						var rebateValue = (invoiceValue / 100.0) * rebateProcessingInfo.percentage;
		    						
		    						//Now work out how we apply the rebate
		    						//
		    						if(rebateGroupCustomer != null && rebateGroupCustomer != '')
		    							{
		    								//Rebate is applied to the group customer
		    								//
		    							
		    							
		    							}
		    						
		    						if(rebateGroupCustomer != null && rebateGroupCustomer != '')
		    							{
		    								//Rebate is applied to the customers in the buying group
		    								//
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
    	
			/*
			try
				{
					var mrTask = task.create({
											taskType:		task.TaskType.MAP_REDUCE,
											scriptId:		'customscript_bbs_rebate_processing_3',	
											deploymentid:	null
											});
					
					mrTask.submit();
				}
			catch(err)
				{
					log.error({
								title: 		'Error submitting mr 3 script',
								details: 	err
								});	
				}
			*/
	    }

    return {
	        getInputData: 	getInputData,
	        map: 			map,
	        reduce: 		reduce,
	        summarize: 		summarize
    		};
    
});
