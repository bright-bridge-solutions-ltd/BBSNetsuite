/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/sftp', 'N/search'],
function(sftp, search) {
   
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
    	
    	// open SFTP connection
    	sftpConnection();
    	
    	// load search to find files to be processed
    	return search.load({
    	        id: 'customsearch199'
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
    	var searchResult = JSON.parse(context.value);
    	
    	// get the file ID
    	var fileID = result.getValue({
            name: 'internalid'
        });
        
    	// load the file
    	var fileRecord = FILEMODULE.load({
            id: fileID
        });
        
    	try
    		{		    	
    			// upload the file
    			var uploadedFile = sftpConnection.upload({
    				file : fileRecord
    			});
    			
    			log.audit({
    				title: 'File Uploaded',
    				detail: 'File ID: ' + fileID
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Uploading File',
    				details: 'File ID: ' + fileID + '<br>Error: ' + e
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
