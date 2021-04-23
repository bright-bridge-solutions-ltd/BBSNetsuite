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
																		    			      search.createColumn({name: "custrecord_bbs_ind_customer", label: "Customer"}),
																		    			      search.createColumn({name: "custrecord_bbs_rebate_i_guaranteed_type", label: "Guaranteed Rebate Item Type"}),
																		    			      search.createColumn({name: "custrecord_bbs_rebate_i_marketing_type", label: "Marketing Rebate Item Type"}),
																		    			      search.createColumn({name: "custrecord_bbs_rebate_i_targeted_type", label: "Targeted Rebate Item Type"}),
																		    			      search.createColumn({name: "custrecord_individual_rebate_start_date", label: "Start Date"}),
																		    			      search.createColumn({name: "custrecord_individual_rebate_end_date", label: "End Date"})
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
		    		var searchResult 				= JSON.parse(context.value);
		    		var searchCustomer				= searchResult.values['custrecord_bbs_ind_customer'];
		    		var searchCustomerId			= searchCustomer[0].value;
		    		var searchId	 				= searchResult.values['internalid'][0].value;
		    		
		    		var searchDateStartString		= searchResult.values['custrecord_individual_rebate_start_date'];
		    		var searchDateEndString			= searchResult.values['custrecord_individual_rebate_end_date'];
		    		var searchGuaranteedItemTypes	= searchResult.values['custrecord_bbs_rebate_i_guaranteed_type'];
		    		var searchMarketingTypes		= searchResult.values['custrecord_bbs_rebate_i_marketing_type'];
		    		var searchTargetedItemTypes		= searchResult.values['custrecord_bbs_rebate_i_targeted_type'];
		    		
		    		var invoiceValue				= Number(0);
		    		var itemTypesArray 				= null;
		    		var customerArray				= [searchCustomerId];
		    		
		    		//Get the total of the invoices for the guaranteed item types
		    		//
		    		itemTypesArray 				= [];
		    		
		    		for (var int = 0; int < searchGuaranteedItemTypes.length; int++) 
			    		{
		    				itemTypesArray.push(searchGuaranteedItemTypes[int].value);
						}
		    		
		    		invoiceValue			+= parseFloat(BBSRebateProcessingLibrary.findInvoiceValue(customerArray, itemTypesArray, searchDateStartString, searchDateEndString));	//Customer, Array of item types, Start date, End date
		    		
		    		//Get the total of the invoices for the marketing item types
		    		//
		    		itemTypesArray 				= [];
		    		
		    		for (var int = 0; int < searchMarketingTypes.length; int++) 
			    		{
		    				itemTypesArray.push(searchMarketingTypes[int].value);
						}
		    		
		    		invoiceValue			+= parseFloat(BBSRebateProcessingLibrary.findInvoiceValue(customerArray, itemTypesArray, searchDateStartString, searchDateEndString));	//Customer, Array of item types, Start date, End date
		    		
		    		//Get the total of the invoices for the targeted item types
		    		//
		    		itemTypesArray 				= [];
		    		
		    		for (var int = 0; int < searchTargetedItemTypes.length; int++) 
			    		{
		    				itemTypesArray.push(searchTargetedItemTypes[int].value);
						}
		    		
		    		invoiceValue			+= parseFloat(BBSRebateProcessingLibrary.findInvoiceValue(customerArray, itemTypesArray, searchDateStartString, searchDateEndString));	//Customer, Array of item types, Start date, End date
		    		
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
