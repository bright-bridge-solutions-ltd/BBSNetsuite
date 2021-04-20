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
																		    			      ["isinactive","is","F"], 														//Not inactive
																		    			      "AND", 
																		    			      ["custrecord_bbs_start_date","onorafter",startOfYearString],					//Start of rebate in on or after the start of this current year
																		    			      "AND", 
																		    			      ["custrecord_bbs_end_date","onorbefore",endOfYearString],						//End of rebate is on or before the end of this year
																		    			      "AND",
																		    			      ["custrecord_bbs_status","anyof","1"]											//Status = In Progress
																		    			   ],
															    			   columns:
																		    			   [
																		    			      search.createColumn({name: "name",sort: search.Sort.ASC,  label: "ID"}),
																		    			      search.createColumn({name: "internalid", label: "Internal Id"}),
																		    			      search.createColumn({name: "custrecord_bbs_customer", label: "Customer"}),
																		    			      search.createColumn({name: "custrecord_bbs_rebate_item_type", label: "Guaranteed Rebate Item Type"}),
																		    			      search.createColumn({name: "custrecord_bbs_rebate_item_type_g_market", label: "Marketing Rebate Item Type"}),
																		    			      search.createColumn({name: "custrecord_bbs_rebate_item_type_g_target", label: "Target Rebate Item Type"}),
																		    			      search.createColumn({name: "custrecord_bbs_start_date", label: "Start Date"}),
																		    			      search.createColumn({name: "custrecord_bbs_end_date", label: "End Date"})
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
		    		var searchResult 				= JSON.parse(context.value);
		    		var searchDateStartString		= searchResult.values['custrecord_bbs_start_date'];
		    		var searchDateEndString			= searchResult.values['custrecord_bbs_end_date'];
		    		var searchId	 				= searchResult.values['internalid'][0].value;
		    		var searchGuaranteedItemTypes	= searchResult.values['custrecord_bbs_rebate_item_type'];
		    		var searchMarketingItemTypes	= searchResult.values['custrecord_bbs_rebate_item_type'];
		    		var searchTargetItemTypes		= searchResult.values['custrecord_bbs_rebate_item_type'];
		    		var itemTypesArray 				= null;
		    		var invoiceValue				= Number(0);
		    		
		    		//Now find all of the individual rebate records that have this particular group record linked to them
		    		//
		    		var customerArray = BBSRebateProcessingLibrary.findGroupMembers(searchDateStartString, searchDateEndString, searchId);
		    		
		    		
					//Get the total of the invoices for the guaranteed item types
		    		//
		    		itemTypesArray		= [];
		    		
		    		for (var int = 0; int < searchGuaranteedItemTypes.length; int++) 
			    		{
		    				itemTypesArray.push(searchGuaranteedItemTypes[int].value);
						}
	    		
		    		invoiceValue += BBSRebateProcessingLibrary.findInvoiceValue(customerArray, itemTypesArray, searchDateStartString, searchDateEndString);
					
		    		//Get the total of the invoices for the marketing item types
		    		//
		    		itemTypesArray		= [];
		    		
		    		for (var int = 0; int < searchMarketingItemTypes.length; int++) 
			    		{
		    				itemTypesArray.push(searchMarketingItemTypes[int].value);
						}
	    		
		    		invoiceValue += BBSRebateProcessingLibrary.findInvoiceValue(customerArray, itemTypesArray, searchDateStartString, searchDateEndString);
					
		    		//Get the total of the invoices for the marketing item types
		    		//
		    		itemTypesArray		= [];
		    		
		    		for (var int = 0; int < searchTargetItemTypes.length; int++) 
			    		{
		    				itemTypesArray.push(searchTargetItemTypes[int].value);
						}
	    		
		    		invoiceValue += BBSRebateProcessingLibrary.findInvoiceValue(customerArray, itemTypesArray, searchDateStartString, searchDateEndString);
					
		    		//Update the group rebate record
		    		//
		    		totalInvoiceValue = parseFloat(totalInvoiceValue);
		    		
		    		log.debug({title: 'totalInvoiceValue', details: totalInvoiceValue});
		    		
		    		record.submitFields({
		    							type:		'customrecord_bbs_cust_group_rebate',
		    							id:			searchId,
		    							values:		{
		    										custrecord_bbs_actual_sales_value: 	invoiceValue
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
	    }

    return {
	        getInputData: 	getInputData,
	        map: 			map,
	        reduce: 		reduce,
	        summarize: 		summarize
    		};
    
});
