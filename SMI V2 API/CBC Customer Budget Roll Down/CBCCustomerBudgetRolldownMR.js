/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/format', 'N/task'],

function(runtime, search, record, format, task) 
{
	//Retrieve script parameters
	//
	var currentScript = runtime.getCurrentScript();
	
	paramCustomerId 	= currentScript.getParameter({name: 'custscript_cbs_brd_customer'});
	paramGradeId 		= currentScript.getParameter({name: 'custscript_cbs_brd_grade'});
	paramBudgetId 		= currentScript.getParameter({name: 'custscript_cbs_brd_budget'});
	paramAllocTypeId 	= currentScript.getParameter({name: 'custscript_cbs_brd_alloc_type'});
	paramQuantity 		= currentScript.getParameter({name: 'custscript_cbs_brd_quantity'});
	paramResetDays 		= currentScript.getParameter({name: 'custscript_cbs_brd_reset_days'});
	
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
    function getInputData() 
	    {
	    	try
				{
			    	log.audit({
								title: 		'Get Input Data Params',
								details: 	'Customer Id: ' + paramCustomerId + ', Grade Id: ' + paramGradeId
								});
			    	
			    	var filters = [];
			    	
			    	filters.push(["company","anyof",paramCustomerId]);
			    	
			    	if(paramGradeId != null && paramGradeId != '')
			    		{
			    			filters.push("AND");
			    			filters.push(["custentity_cbc_contact_grade","anyof",paramGradeId]);
			    		}
			    	
		    		return search.create({
						    			   type: 		"contact",
						    			   filters:		filters,
						    			   columns:
									    			   [
									    			      search.createColumn({
														    			         name: "entityid",
														    			         sort: search.Sort.ASC,
														    			         label: "Name"
									    			      					})
									    			   ]
						    			});
				}
    		catch(err)
    			{
	    			log.error({
								title: 		'Unexpected error in getInputData section',
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
			    	//Retrieve search results
		    		//
			    	var searchResult = JSON.parse(context.value);
			    	
			    	var contactId = searchResult.id;
			    	
			    	log.audit({
								title: 		'Contact Id',
								details: 	contactId
								});
			    	
			    	//For the contact in question, see if we can find the required budget record
			    	//
			    	var filters = [];
			    	filters.push(["custrecord_cbc_contact_id","anyof",contactId]);
			    	
			    	if(paramBudgetId != null && paramBudgetId != '')
			    		{
				    		filters.push("AND");
				    		filters.push(["custrecord_cbc_contact_budget_type","anyof",paramBudgetId]);
			    		}
			    	
			    	if(paramAllocTypeId != null && paramAllocTypeId != '')
			    		{
				    		filters.push("AND");
				    		filters.push(["custrecord_cbc_contact_item_alloc_type","anyof",paramAllocTypeId]);
			    		}
		    	
			    	var customrecord_cbc_contact_recordSearchObj = getResults(search.create({
			    		   type: 		"customrecord_cbc_contact_record",
			    		   filters:		filters,
			    		   columns:
						    		   [
						    		      search.createColumn({name: "custrecord_cbc_contact_budget_type", label: "CBC Budget Management Type"}),
						    		      search.createColumn({name: "custrecord_cbc_contact_item_alloc_type", label: "CBC Item Allocation Type"}),
						    		      search.createColumn({name: "custrecord_cbc_contact_quantity", label: "CBC Allocation / Budget / Points"}),
						    		      search.createColumn({name: "custrecord_cbc_contact_id", label: "CBC Contact"})
						    		   ]
			    		}));
			    	
			    	//Did we find any data?
			    	//
			    	if(customrecord_cbc_contact_recordSearchObj != null && customrecord_cbc_contact_recordSearchObj.length > 0)
			    		{
			    			//Record found, so update it
			    			//
			    			var contactBudgetId = customrecord_cbc_contact_recordSearchObj[0].id;
			    			
			    			record.submitFields({
												type: 		'customrecord_cbc_contact_record',
												id: 		contactBudgetId,
												values: 	{
															custrecord_cbc_contact_quantity: 	paramQuantity
															}
												});
			    		}
			    	else
			    		{
			    			//Record not found so create a new one
			    			//
			    			var budgetRecord = null;
			    		
			    			try
			    				{
				    				budgetRecord = record.create({
																	type:		'customrecord_cbc_contact_record',
																	isDynamic:	true
																	});
				    				
				    				budgetRecord.setValue({
															fieldId:	'custrecord_cbc_contact_id',
															value:		contactId
															});	
				    				
				    				budgetRecord.setValue({
															fieldId:	'custrecord_cbc_contact_id',
															value:		contactId
															});	
				
				    				budgetRecord.setValue({
															fieldId:	'custrecord_cbc_contact_budget_type',
															value:		paramBudgetId
															});	
				
				    				budgetRecord.setValue({
															fieldId:	'custrecord_cbc_contact_item_alloc_type',
															value:		paramAllocTypeId
															});	
				
				    				budgetRecord.setValue({
															fieldId:	'custrecord_cbc_contact_quantity',
															value:		Number(paramQuantity)
															});	
				
				    				budgetRecord.setValue({
															fieldId:	'custrecord_cbc_contact_reset_days',
															value:		Number(paramResetDays)
															});	
		
				    				budgetRecord.setValue({
															fieldId:	'custrecord_cbc_contact_usage',
															value:		Number(0)
															});	
				
				    				
				    				var budgetId = budgetRecord.save({	
																	enableSourcing:			true,
																	ignoreMandatoryFields:	true
																	});
		
			    				}
			    			catch(err)
			    				{
				    				log.error({
												title: 		'Error creating new contact budget record',
												details: 	err
												});
			    				}
			    		}
    			}
			catch(err)
				{
	    			log.error({
								title: 		'Unexpected error in map section',
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
    
    return {
	        getInputData: 	getInputData,
	        map: 			map,
	        reduce: 		reduce,
	        summarize: 		summarize
    		};
    
});
