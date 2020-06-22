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
		    		var txSvcPairsResult = null;
		    	
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
									txSvcPairsResult = tfcPlugin.getTSPairs();
								}
							catch(err)
								{
									log.error({
												title:		'Error calling plugin',
												details:	err
												});
								}
							
							if(txSvcPairsResult != null)
								{
									return txSvcPairsResult.apiResponse;	//An array of objects
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
		    		var txSvcData 		= JSON.parse(context.value);
		    		var txSvcRecord 	= null;
		    		
		    		//Does the tx/service pair already exist?
		    		//
		    		var customrecord_bbstfc_tx_svc_pairsSearchObj = getResults(search.create({
		    			   type: "customrecord_bbstfc_tx_svc_pairs",
		    			   filters:
		    			   [
		    			      ["name","is",txSvcData.TSPairDescription]
		    			   ],
		    			   columns:
		    			   [
		    			      search.createColumn({name: "custrecord_txsvc_inp_type", label: "Input Type"})
		    			   ]
		    			}));
		    			
		    			
		    		if(customrecord_bbstfc_tx_svc_pairsSearchObj != null && customrecord_bbstfc_tx_svc_pairsSearchObj.length > 0)
		    			{
		    				//Record found, so load it
		    				//
		    				txSvcRecord = record.load({
								    					type:		'customrecord_bbstfc_tx_svc_pairs',
														id:			customrecord_bbstfc_tx_svc_pairsSearchObj[0].id,
														isDynamic:	true
								    					});
		    			
		    			}
		    		else
		    			{
		    				//No record found so create a new one
		    				//
		    				txSvcRecord = record.create({
		    												type:		'customrecord_bbstfc_tx_svc_pairs',
		    												isDynamic:	true
		    												});
		    			}
		    		
		    		if(txSvcRecord != null)
		    			{
		    				txSvcRecord.setValue({
			    									fieldId:		'custrecord_bbstfc_txsvc_tx_type',
			    									value:			txSvcData.TransactionType
			    									});
			    			
		    				txSvcRecord.setValue({
													fieldId:		'custrecord_bbstfc_txsvc_svc_type',
													value:			txSvcData.ServiceType
													});
		
		    				txSvcRecord.setValue({
													fieldId:		'custrecord_bbstfc_txsvc_mrk_type',
													value:			txSvcData.MarketType
													});

		    				txSvcRecord.setValue({
													fieldId:		'custrecord_bbstfc_txsvc_if_type',
													value:			txSvcData.InterfaceType
													});

		    				txSvcRecord.setValue({
													fieldId:		'custrecord_txsvc_inp_type',
													value:			txSvcData.InputType
													});

		    				txSvcRecord.setValue({
													fieldId:		'custrecord_txsvc_is_bundle',
													value:			txSvcData.IsBundle
													});

		    				txSvcRecord.setValue({
													fieldId:		'custrecord_bbstfc_txsvc_tx_desc',
													value:			txSvcData.TransactionDescription
													});

		    				txSvcRecord.setValue({
													fieldId:		'custrecordbbstfc_txsvc_svc_desc',
													value:			txSvcData.ServiceDescription
													});

		    				txSvcRecord.setValue({
													fieldId:		'name',
													value:			txSvcData.TSPairDescription
													});

		    				txSvcRecord.save({
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
