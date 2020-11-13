/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/file'],
function(search, file) {
	
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
    	
    	// run search to find files to be updated
    	return search.create({
			type: search.Type.FOLDER,
			
    		filters: [{
    			name: 'internalid',
    			operator: search.Operator.ANYOF,
    			values: [12401]
    		},
    				{
    			name: 'name',
    			join: 'file',
    			operator: search.Operator.CONTAINS,
    			values: ['advance_invoice_report']
    		}],
	    	
	    	columns: [{
	    		name: 'internalid',
	    		join: 'file'
	    	},
	    			{
	    		name: 'name',
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
    	
    	// retrieve search results
    	var searchResult 	= JSON.parse(context.value);
    	var fileID 			= searchResult.values['internalid.file'].value;
    	var fileName 		= searchResult.values['name.file'];
    	
    	log.audit({
    		title: 'Processing File',
    		details: 'File ID: ' + fileID + '<br>File Name: ' + fileName
    	});
    	
    	// replace parts of the file name
    	fileName = fileName.replace('20201101', '201101');
		fileName = fileName.replace('_advance_invoice_report', '-advance_invoice_report');
    	
    	try
    		{
    			// load the file
    			var fileObj = file.load({
    				id: fileID
    			});
    			
    			// set the name of the file
    			fileObj.name = fileName;
    			
    			// save the changes to the file
    			fileObj.save();
    			
    			log.audit({
    				title: 'File Updated',
    				details: fileID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating File with ID ' + fileID,
    				details: e
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
        reduce: reduce,
        summarize: summarize
    };
    
});
