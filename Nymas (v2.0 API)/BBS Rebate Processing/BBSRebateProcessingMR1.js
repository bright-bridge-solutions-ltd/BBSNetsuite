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
	
	//Map reduce script #1 for rebate processing
	//Calculates the amount of spend for each individual customer rebate record
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
		    		var searchDateString 		= searchResult.values['custrecord_bbs_end_q1_ind'];
		    		var searchDate				= format.parse({type: format.Type.DATE, value: searchDateString});
		    		var searchDateStart			= new Date(searchDate.getFullYear(), 0, 1);
		    		var searchDateEnd			= new Date(searchDate.getFullYear(), 11, 31);
		    		var searchDateStartString	= format.format({value: searchDateStart, type: format.Type.DATE});
		    		var searchDateEndString		= format.format({value: searchDateEnd, type: format.Type.DATE});

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
