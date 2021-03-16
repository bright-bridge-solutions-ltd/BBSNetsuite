/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope Public
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
		    		var printersResult = null;
		    	
			    	//Get the plugin implementation
					//
					var  pnPlugin = plugin.loadImplementation({
																type: 'customscript_bbs_printnode_plugin'
																});
					
					//Call the plugin
					//
					if(pnPlugin != null)
						{
							try
								{
									printersResult = pnPlugin.getPrinters();
								}
							catch(err)
								{
									log.error({
												title:		'Error calling plugin',
												details:	err
												});
								}
							
							if(printersResult != null)
								{
									return printersResult.apiResponse;	//An array of objects
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
		    		var printerData 	= JSON.parse(context.value);
		    		var printerRecord 	= null;
		    		
		    		//Does the record already exist?
		    		//
		    		var customrecord_bbs_printnode_printersSearchObj = getResults(search.create({
		    			   type: "customrecord_bbs_printnode_printers",
		    			   filters:
		    			   [
		    			      ["custrecord_bbs_printnode_printer_id","is",printerData.id]
		    			   ],
		    			   columns:
		    			   [
		    			      search.createColumn({name: "name", label: "Printer Name"})
		    			   ]
		    			}));
		    			
		    			
		    		if(customrecord_bbs_printnode_printersSearchObj != null && customrecord_bbs_printnode_printersSearchObj.length > 0)
		    			{
		    				//Record found, so load it
		    				//
		    				printerRecord = record.load({
								    					type:		'customrecord_bbs_printnode_printers',
														id:			customrecord_bbs_printnode_printersSearchObj[0].id,
														isDynamic:	true
								    					});
		    			
		    			}
		    		else
		    			{
		    				//No record found so create a new one
		    				//
		    				printerRecord = record.create({
		    												type:		'customrecord_bbs_printnode_printers',
		    												isDynamic:	true
		    												});
		    			}
		    		
		    		if(printerRecord != null)
		    			{
		    				printerRecord.setValue({
			    									fieldId:		'custrecord_bbs_printnode_printer_id',
			    									value:			printerData.id
			    									});
			    			
		    				printerRecord.setValue({
													fieldId:		'name',
													value:			printerData.computer.name + ' : ' + printerData.name
													});
		
		    				printerRecord.setValue({
													fieldId:		'custrecord_bbs_printnode_printer_state',
													value:			printerData.state
													});

		    				printerRecord.setValue({
													fieldId:		'custrecord_bbs_printnode_printer_desc',
													value:			printerData.description
													});

		    				printerRecord.setValue({
													fieldId:		'custrecord_bbs_printnode_printer_cname',
													value:			printerData.computer.name
													});

		    				printerRecord.setValue({
													fieldId:		'custrecord_bbs_printnode_printer_cid',
													value:			printerData.computer.id
													});

		    				printerRecord.setValue({
													fieldId:		'custrecord_bbs_printnode_printer_cstate',
													value:			printerData.computer.state
													});

		    				printerRecord.setValue({
													fieldId:		'custrecord_bbs_printnode_printer_cip',
													value:			printerData.computer.inet
													});

		    				printerRecord.save({
			    								enableSourcing:			true,
			    								ignoreMandatoryFields:	true
			    								});
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
