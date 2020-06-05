/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/plugin'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search, plugin) 
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
    function getInputData() 
	    {
    		try
    			{
		    		var taxTypesResult = null;
		    	
			    	//Get the plugin implementation
					//
					var  tfcPlugin = plugin.loadImplementation({
																type: 'customscript_bbstfc_plugin'
																});
					
					//Call the plugin
					//
					if(tfcPlugin != null)
						{
							try
								{
									taxTypesResult = tfcPlugin.getTaxType('');
								}
							catch(err)
								{
									log.error({
												title:		'Error calling plugin',
												details:	err
												});
								}
							
							if(taxTypesResult != null)
								{
									return taxTypesResult.apiResponse;	//An array of objects
								}
						}
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
		    		var taxData = JSON.parse(context.value);
		    		
		    		
		    		/*
		    		 {
					   TaxType: 581,
					   CategoryType: 13,
					   TaxDescription: "Consumption Tax",
					   CategoryDescription: "VALUE ADDED TAXES"
					 } 
		    		 
		    		 */
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

    return {
	        getInputData: 	getInputData,
	        map: 			map,
	        reduce: 		reduce,
	        summarize: 		summarize
    };
    
});
