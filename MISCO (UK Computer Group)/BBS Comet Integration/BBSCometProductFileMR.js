/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/file'],

function(runtime, file) 
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
	    	//Get script parameter
	    	//
	    	var productFileId = '31865'; //runtime.getCurrentScript().getParameter({name: 'custscript_bbs_sftp_product_file_id'});
	    	
	    	//Debug logging
	    	//
	    	log.debug({
						title: 		'Product File Id',
						details: 	productFileId
						});
		   
	    	//Read each line of the input file & add to the key/value pairs passed to the map stage
	    	//
	    	var fileObject = null;
	    	
	    	try
	    		{
	    			fileObject = file.load({id: productFileId});
	    		}
	    	catch(err)
	    		{
	    			fileObject = null;
	    			
	    			log.error({
								title: 	'Error loading file id =  ' + productFileId,
								details: err
								});
	    		}
	    	
	    	return fileObject;
	    	
	    	/*
	    	if(fileObject != null)
	    		{
	    			var iterator = fileObject.lines.iterator();
	    				
	    			//Skip the first line (CSV header)
	    			//
	    	        iterator.each(function () 
	    	        	{
	    	        		return false;
	    	        	});
	    	        
	    	        //Process the rest of the lines
	    	        //
	    	        iterator.each(function (line)
		    	        {
		    	            var lineValues = line.value;
		    	            
		    	            return true;
		    	          });
	    		}
	    	*/
	    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) 
	    {
	    	log.debug({
				title: 		'File line',
				details: 	context.value
				});
	    	
	    	var rawLine = context.value;
	    	var columns = rawLine.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
	    	//var arr = rawLine.match(/(?<=")[^"]+?(?="(?:\s*?,|\s*?$))|(?<=(?:^|,)\s*?)(?:[^,"\s][^,"]*[^,"\s])|(?:[^,"\s])(?![^"]*?"(?:\s*?,|\s*?$))(?=\s*?(?:,|$))/g);
	    	
	    	for (var int = 0; int < columns.length; int++) 
		    	{
	    			columns[int] = columns[int].replace(/"/g,"");
				}
	    	
	    	log.debug({
				title: 		'Processed Line',
				details: 	columns
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

    }

    return {
	        getInputData: 	getInputData,
	        map: 			map,
	        reduce: 		reduce,
	        summarize: 		summarize
    };
    
});
