/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search) {
   
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
		    		return search.create({
						    			   type: 		"inventoryitem",
						    			   filters:
									    			   [
									    			      ["type","anyof","InvtPart"], 
									    			      "AND", 
									    			      ["formulanumeric: case when NVL({averagecost}, 0) > 0 then 1 else 0 end","equalto","1"]
									    			   ],
						    			   columns:
									    			   [
									    			      search.createColumn({
									    			         name: "itemid",
									    			         sort: search.Sort.ASC,
									    			         label: "Name"
									    			      }),
									    			      search.createColumn({name: "averagecost", label: "Average Cost"})
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
			    	var searchResult 		= JSON.parse(context.value);
			    	var itemId 				= searchResult.id;
			    	var itemAverageCost 	= Math.round(Number(searchResult.values['averagecost']) * 100) / 100;
			    	var itemRecord 			= null;
			    	
			    	try
			    		{
				    		itemRecord = record.load({
														type:		record.Type.INVENTORY_ITEM,
														id:			itemId,
														isDynamic:	false
														});
			    		}
			    	catch(err)
			    		{
			    			itemRecord = null;
			    			
			    			log.error({
										title: 		'error loading inventory item id = ' + itemId,
										details: 	err
										});
			    		}
			    	
			    	if(itemRecord != null)
			    		{
			    			var locationCount = itemRecord.getLineCount({sublistId: 'locations'});
			    			
			    			for (var location = 0; location < locationCount; location++) 
	        					{
			    					itemRecord.setSublistValue({
			    												sublistId: 	'locations', 
			    												fieldId: 	'defaultreturncost', 
			    												line: 		location,
			    												value:		itemAverageCost
			    												});
	        					}
			    		
			    			try
					    		{
						    		itemRecord.save({
						    						enableSourcing:			true,
						    						ignoreMandatoryFields:	true
						    						});
					    		}
					    	catch(err)
					    		{
					    			log.error({
												title: 		'error saving inventory item id = ' + itemId,
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
    function reduce(context) {

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
