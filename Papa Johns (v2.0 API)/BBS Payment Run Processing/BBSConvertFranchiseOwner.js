/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/format',],
function(search, record, format) {
	
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
	    	return	search.create({
	    							type: 		"customer",
	    							filters:
	    										[
	    										],
	    							columns:
	    										[
	    										 	search.createColumn({name: "internalid", sort: search.Sort.ASC, label: "Internal ID"}),
	    										 	search.createColumn({name: "altname", label: "Name"}),
	    										 	search.createColumn({name: "custentitycustentity_pj_fo",label: "FO"})
	    										 ]
	    							});
	    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) 
    	{
    	
	    	// retrieve search results
    		//
	    	var searchResult 	= JSON.parse(context.value);
	    	var customerId		= searchResult.id;
	    	var franchiseOwner	= searchResult.values['custentitycustentity_pj_fo'];
	    	
    	
	    	//Find or create the franchise owner in the list
	    	//
	    	var franchiseId 	= findOrCreateFranchiseOwner(franchiseOwner);
	    	
	    	//Update the lookup field on the customer
	    	//
	    	if(franchiseId != null)
	    		{
			    	try
			    		{
			    			record.submitFields({
												type:					record.Type.CUSTOMER,
												id:						customerId,
												enableSourcing:			false,
												ignoreMandatoryFields:	true,
												values:					{
																		custentity_bbs_franchise_owner:	franchiseId
																		}
												});
			    		}
			    	catch(err)
			    		{
				    		log.error({title: 'Error Updating Customer id = ' + customerId + ' with franchise id = ' + franchiseId, details: err});
			    		}
	    		}
    	}	

    function findOrCreateFranchiseOwner(_franchiseOwner)
    	{	
    		var returnedId = null;
    		
    		var franchiseOwnerSearchObj	= getResults(search.create({
														    		type: 		"customlist_bbs_franchise_owner",
														    		filters:
														    					[
														    		                 ["name", "is", _franchiseOwner]
														    			    	],
														    		columns:
														    			    	[
														    			    	 	search.createColumn({name: "name"})
														    			    	]
														    		}));
    		
    		if(franchiseOwnerSearchObj != null && franchiseOwnerSearchObj.length > 0)
    			{
    				returnedId = franchiseOwnerSearchObj[0].id;
    			}
    		else
    			{
    				//Create a new record
    				//
    				var newRecord	= null;
    				
    				try
    					{
    						newRecord = record.create({
							    						type:		'customlist_bbs_franchise_owner',
														isDynamic:	true
							    						});
    						
    						newRecord.setValue({
    											fieldId:	'name',
    											value:		_franchiseOwner
    											});
    						
    						returnedId = newRecord.save();
    					}
    				catch(err)
    					{
    						newRecord	= null;
    						log.error({title: 'Error creating new franchise record = ' + _franchiseOwner, details: err});
    					}
    			}
    		
    		return returnedId;
    	}
    
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
    function summarize(context) 
    	{
    	}   

    return 	{
	        getInputData: 	getInputData,
	        map: 			map,
	        summarize: 		summarize
    		};
    
});
