/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope Public
 */
define(['N/record', 'N/runtime', 'N/search', './libraryModule'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(record, runtime, search, libraryModule) {
   
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
		    		var recordTypeToProcess = runtime.getCurrentScript().getParameter({name: 'custscript_bbstfc_bulk_rec_typ'});
		    		var forceOverwrite 		= runtime.getCurrentScript().getParameter({name: 'custscript_bbstfc_bulk_force'});
				
		    		var parameters = {
		    							recordTypeToProcess: 	recordTypeToProcess,
		    							forceOverwrite:			forceOverwrite
		    						};
		    		
		    		var parameterString = JSON.stringify(parameters);
		    		
		    		var searchObj = search.create({
		    			   type: 	recordTypeToProcess,
		    			   filters:	
		    			   [
		    			   ],
		    			   columns:
		    			   [
		    			      search.createColumn({name: "internalid", label: "Internal ID"}),
		    			      search.createColumn({
						    			         name: 		"formulatext",
						    			         formula: 	"'" + parameterString + "'",
						    			         label: 	"Parameters"
		    			      					})
		    			   ]
		    			});
		    			
		    		return searchObj;
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
		    		//Get the details of the type of record we are processing
		    		//
		    		var search 				= JSON.parse(context.value);
		    		var internalId			= search.values['internalid'].value;
		    		var parameters			= JSON.parse(search.values['formulatext']);
		    		var recordObj			= null;
		    		var recordTypeToProcess	= parameters['recordTypeToProcess'];
		    		var forceOverwrite		= (parameters['forceOverwrite'] == 'T' ? true : false);
		    			
		    		//Load up the record we need to process
		    		//
		    		try
		    			{
		    				recordObj	= record.load({
								    					type:		recordTypeToProcess,
														id:			internalId,
														isDynamic:	false
								    				});
		    			}
		    		catch(err)
		    			{
			    			log.error({
			    						title: 		'Error loading record, type = ' + recordTypeToProcess + ' id = ' + internalId,
			    						details: 	err
			    						});
			    			
			    			recordObj = null;
		    			}
		    		
		    		//Did we load the record ok?
		    		//
		    		if(recordObj != null)
		    			{
		    				//Process the record for PCode lookup
		    				//
		    				libraryModule.libLookupPCode(recordObj, forceOverwrite);
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

    return {
	        getInputData: 	getInputData,
	        map: 			map,
	        reduce: 		reduce,
	        summarize: 		summarize
    		};
    
});
