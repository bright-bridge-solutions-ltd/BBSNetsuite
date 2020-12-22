/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
function(search, record) {
   
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
    function getInputData() {
    	
    	// run search to find records to be processed
    	return search.create({
    		type: 'customrecord_circuits',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		}],
    		
    		columns: [{
    			name: 'externalid'
    		}],
    		
    	});

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// process search results
    	var searchResult	= JSON.parse(context.value);
    	var recordID		= searchResult.id;
    	var externalID		= searchResult.values.externalid;
    	
    	log.audit({
    		title: 'Processing Circuit Record',
    		details: 'Record ID: ' + recordID + '<br>External ID: ' + externalID
    	});
    	
    	// run search to find files for this document number
    	search.create({
    		type: search.Type.FOLDER,
    		
    		filters: [{
    			name: 'name',
    			join: 'file',
    			operator: search.Operator.CONTAINS,
    			values: [externalID]
    		}],
    		
    		columns: [{
    			name: 'internalid',
    			join: 'file'
    		}],
    		
    	}).run().each(function(result){
    		
    		// retrieve the internal ID of the file
    		var fileID = result.getValue({
    			name: 'internalid',
    			join: 'file'
    		});
    		
    		try
    			{
    				// attach the file to the circuit record
	    			record.attach({
	    			    record: {
	    			        type: 'file',
	    			        id: fileID
	    			    },
	    			    to: {
	    			        type: 'customrecord_circuits',
	    			        id: recordID
	    			    }
	    			});
	    			
	    			log.audit({
	    				title: 'File Attached to Circuit Record',
	    				details: 'Record ID: ' + recordID
	    			})
    			}
    		catch(e)
    			{
    				log.error({
    					title: 'Error Attaching File to Circuit Record',
    					details: 'Record ID: ' + recordID + '<br>Error: ' + e.message
    				});
    			}
    		
    		// continue processing search results
    		return true;
    		
    	});

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
    	
    	log.audit({
    		title: '*** END OF SCRIPT ***',
    		details: 'Duration: ' + summary.seconds + ' seconds<br>Units Used: ' + summary.usage + '<br>Yields: ' + summary.yields
    	});

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
