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
	
	//Map reduce script #2 for rebate processing
	//Calculates the amount of spend for each group customer rebate record
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
		    		//var searchCustomer			= searchResult.values['custrecord_bbs_customer'];
		    		//var searchCustomerId		= searchCustomer[0].value;
		    		var searchId	 			= searchResult.values['internalid'][0].value;
		    		var searchDateString 		= searchResult.values['custrecord_bbs_end_q1'];
		    		var searchDate				= format.parse({type: format.Type.DATE, value: searchDateString});
		    		var searchDateStart			= new Date(searchDate.getFullYear(), 0, 1);
		    		var searchDateEnd			= new Date(searchDate.getFullYear(), 11, 31);
		    		var searchDateStartString	= format.format({value: searchDateStart, type: format.Type.DATE});
		    		var searchDateEndString		= format.format({value: searchDateEnd, type: format.Type.DATE});
		    		var searchItemTypes			= searchResult.values['custrecord_bbs_rebate_item_type'];
		    		var itemTypesArray 			= [];
		    		
		    		log.debug({title: 'searchId (Group rebate record)', details: searchId});
		    		
		    		for (var int = 0; int < searchItemTypes.length; int++) 
			    		{
		    				itemTypesArray.push(searchItemTypes[int].value);
						}
		    		
		    		
		    		//Now find all of the individual rebate records that have this particular group record linked to them
		    		//
		    		var customerArray = BBSRebateProcessingLibrary.findGroupMembers(searchDateStartString, searchDateEndString, searchId);
		    		
					//Get the total of the invoices
		    		//
					totalInvoiceValue = BBSRebateProcessingLibrary.findInvoiceValue(customerArray, itemTypesArray, searchDateStartString, searchDateEndString);
					
		    		//Update the group rebate record
		    		//
		    		totalInvoiceValue = parseFloat(totalInvoiceValue);
		    		
		    		log.debug({title: 'totalInvoiceValue', details: totalInvoiceValue});
		    		
		    		record.submitFields({
		    							type:		'customrecord_bbs_cust_group_rebate',
		    							id:			searchId,
		    							values:		{
		    										custrecord_bbs_actual_sales_value: 	totalInvoiceValue
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
