/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/file'],
function(runtime, search, file) {
   
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
    	
    	// retrieve script parameters
    	var folderID = runtime.getCurrentScript().getParameter({
    		name: 'custscript_bbs_proof_of_delivery_folder'
    	});
    	
    	// create search to find files to be processed
    	return search.create({
    		type: search.Type.FOLDER,
    		
    		filters: [{
    			name: 'availablewithoutlogin',
    			join: 'file',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
    				{
    			name: 'internalid',
    			operator: search.Operator.ANYOF,
    			values: [folderID]
    		}],
    		
    		columns: [{
    			name: 'name',
    			join: 'file'
    		},
    				{
    			name: 'internalid',
    			join: 'file'
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
    	
    	// retrieve the search result
    	var searchResult = JSON.parse(context.value);
    	
    	var fileName	= searchResult.values['name.file'];
    	var fileID		= searchResult.values['internalid.file'].value;
    	
    	log.audit({
    		title: 'Processing File',
    		details: 'File Name: ' + fileName + '<br>File ID: ' + fileID
    	});
    	
    	try
    		{
    			// load the file
    			var fileObj = file.load({
    				id: fileID
    			});
    			
    			// set the 'Available without Login' flag
    			fileObj.isOnline = true;
    			
    			// save the changes to the file
    			fileObj.save();
    			
    			log.audit({
    				title: 'File Updated',
    				details: 'File Name: ' + fileName + '<br>File ID: ' + fileID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating File',
    				details: 'File Name: ' + fileName + '<br>File ID: ' + fileID + '<br>Error: ' + e.message
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
    	
    	log.audit({
    		title: '*** END OF SCRIPT ***',
    		details: 'Duration: ' + summary.seconds + ' seconds<br>Units Used: ' + summary.usage + '<br>Yields: ' + summary.yields
    	});

    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
