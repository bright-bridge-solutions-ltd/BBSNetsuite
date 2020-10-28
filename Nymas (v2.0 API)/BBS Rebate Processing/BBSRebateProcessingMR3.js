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
																		    			      ["isinactive","is","F"], 
																		    			      "AND", 
																		    			      ["custrecord_bbs_end_q1_ind","onorafter",startOfYearString],
																		    			      "AND", 
																		    			      ["custrecord_bbs_end_q1_ind","onorbefore",endOfYearString]
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
		    		var searchCustomer			= searchResult.values['custrecord_bbs_ind_customer'];
		    		var searchCustomerId		= searchCustomer[0].value;
		    		var searchId	 			= searchResult.values['internalid'][0].value;
		    		
		    		//Get the end of the first quarter
		    		//
		    		var q1EndDate				= format.parse({type: format.Type.DATE, value: searchResult.values['custrecord_bbs_end_q1_ind']});
		    		
		    		//Work out the first day of the quarter end month
					//
					var startOfLastMonthInQuarter = new Date(q1EndDate.getFullYear(), q1EndDate.getMonth(), 1);
					
					//Now subtract 3 months from it to get the start of the first month in the quarter
					//
					startOfLastMonthInQuarter.setMonth(startOfLastMonthInQuarter.getMonth() - 2);
					
					//Now construct the start date as a string
					//
					var searchDateStartString	= format.format({value: startOfLastMonthInQuarter, type: format.Type.DATE});
		    		
					//Get the end of the third quarter
					//
					var q3EndDate				= format.parse({type: format.Type.DATE, value: searchResult.values['custrecord_bbs_end_q3_ind']});
		    		
					//Add one day to this date to get the start of the fourth quarter
					//
					var q4StartDate				= new Date(q3EndDate.getFullYear(), q3EndDate.getMonth(), q3EndDate.getDate());
					q4StartDate.setDate(q4StartDate.getDate() + 1);
					
					//Now add two months to get us into the last month of the quarter
					//
					q4StartDate.setMonth(q4StartDate.getMonth() + 2);
					
					//Now move to the last day of this month
					//
					var q4EndDate = new Date(q4StartDate.getFullYear(), q4StartDate.getMonth() + 1, 0)
					
					//Now construct the end date as a string
					//
					var searchDateEndString	= format.format({value: q4EndDate, type: format.Type.DATE});
		    		
					
		    		//Get the total of the invoices
		    		//
		    		var customerArray			= [searchCustomerId];
		    		var invoiceValue			= BBSRebateProcessingLibrary.findInvoiceValue(customerArray, [], searchDateStartString, searchDateEndString);
		    		invoiceValue				= parseFloat(invoiceValue);

		    		//Update the rebate record
		    		//
		    		record.submitFields({
		    							type:		'customrecord_bbs_cust_individ_rebate',
		    							id:			searchId,
		    							values:		{
		    										custrecord_bbs_actual_sales_value_ind: 	invoiceValue
		    										},
		    							options:	{
		    										ignoreMandatoryFields: 	true
		    										}
		    							});
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
											scriptId:		'customscript_bbs_rebate_processing_2',	
											deploymentid:	null
											});
					
					mrTask.submit();
				}
			catch(err)
				{
					log.error({
								title: 		'Error submitting mr 2 script',
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
