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
		    		var taxData 		= JSON.parse(context.value);
		    		var taxTypeRecord 	= null;
		    		
		    		//Does the tax type already exist?
		    		//
		    		var customrecord_bbstfc_item_tax_typesSearchObj = getResults(search.create({
		    			   type: "customrecord_bbstfc_item_tax_types",
		    			   filters:
		    			   [
		    			      ["custrecord_bbstfc_ttype_code","is",taxData.TaxType]
		    			   ],
		    			   columns:
		    			   [
		    			      search.createColumn({name: "name", label: "Tax Type Description"})
		    			   ]
		    			}));
		    			
		    		if(customrecord_bbstfc_item_tax_typesSearchObj != null && customrecord_bbstfc_item_tax_typesSearchObj.length > 0)
		    			{
		    				//Record found, so load it
		    				//
		    				taxTypeRecord = record.load({
								    					type:		'customrecord_bbstfc_item_tax_types',
														id:			customrecord_bbstfc_item_tax_typesSearchObj[0].id,
														isDynamic:	true
								    					});
		    			
		    			}
		    		else
		    			{
		    				//No record found so create a new one
		    				//
		    				taxTypeRecord = record.create({
		    												type:		'customrecord_bbstfc_item_tax_types',
		    												isDynamic:	true
		    												});
		    			}
		    		
		    		if(taxTypeRecord != null)
		    			{
			    			taxTypeRecord.setValue({
			    									fieldId:		'custrecord_bbstfc_ttype_code',
			    									value:			taxData.TaxType
			    									});
			    			
			    			taxTypeRecord.setValue({
													fieldId:		'name',
													value:			taxData.TaxDescription
													});
			    			
			    			//Lookup the tax category
			    			//
			    			var customrecord_bbstfc_tax_type_catSearchObj = getResults(search.create({
			    				   type: "customrecord_bbstfc_tax_type_cat",
			    				   filters:
			    				   [
			    				      ["custrecord_bbstfc_tax_type_id","equalto",taxData.CategoryType]
			    				   ],
			    				   columns:
			    				   [
			    				      search.createColumn({name: "custrecord_bbstfc_tax_type_id", label: "Tax Type Id"}),
			    				      search.createColumn({
								    				         name: 	"name",
								    				         sort: 	search.Sort.ASC,
								    				         label: "Name"
			    				      						})
			    				   ]
			    				}));
			    				
			    			if(customrecord_bbstfc_tax_type_catSearchObj != null && customrecord_bbstfc_tax_type_catSearchObj.length > 0)
			    				{
					    			taxTypeRecord.setValue({
															fieldId:		'custrecord_bbstfc_ttype_cat',
															value:			customrecord_bbstfc_tax_type_catSearchObj[0].id
															});
			    				}
			    			
			    			taxTypeRecord.save({
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
