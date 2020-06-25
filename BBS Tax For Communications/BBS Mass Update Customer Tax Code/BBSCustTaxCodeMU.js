/**
 * @NApiVersion 2.x
 * @NScriptType MassUpdateScript
 * @NModuleScope Public
 */
define(['N/record', './libraryModule', 'N/search'],
/**
 * @param {record} record
 */
function(record, libraryModule, search) 
{
    
    /**
     * Definition of Mass Update trigger point.
     *
     * @param {Object} params
     * @param {string} params.type - Record type of the record being processed by the mass update
     * @param {number} params.id - ID of the record being processed by the mass update
     *
     * @since 2016.1
     */
    function each(params) 
	    {
    		var customerRecord = null;
    		
    		//Try to load the customer record
    		//
    		try
    			{
    				customerRecord = record.load({
    												type:		params.type,
    												id:			params.id,
    												isDynamic:	true
    											});
    			}
    		catch(err)
    			{
    				customerRecord = null;
    				
    				log.error({
								title:		'Error loading customer record',
								details:	err
								});
    			}
    		
    		//Record loaded ok?
    		//
    		if(customerRecord != null)
    			{
    				var configObj =  null;
    			
    				configObj = getConfiguration();
    				

							if(configObj != null && configObj.taxCode != '' && configObj.taxCode != null)
								{
				    				//Update the taxable & taxitem fields
				    				//
				    				customerRecord.setValue({
				    										fieldId:	'taxable',
				    										value:		true
				    										});	
				    				
				    				customerRecord.setValue({
															fieldId:	'taxitem',
															value:		configObj.taxCode
															});	
				    				
				    				//Save the customer record
				    				//
				    				try
				    					{
				    						customerRecord.save({
				    											enableSourcing:			true,
				    											ignoreMandatoryFields:	true
				    											});
				    					}
				    				catch(err)
				    					{
					    					log.error({
														title:		'Error saving customer record',
														details:	err
														});
				    					}
								}
    			}
	    }

    function getConfiguration()
	{
		var config = null;
		
		//Search for an active configuration
		//
		var customrecord_bbstfc_configSearchObj = getResults(search.create({
			   type: "customrecord_bbstfc_config",
			   filters:
			   [
			      ["isinactive","is","F"]
			   ],
			   columns:
			   [
			      search.createColumn({name: "custrecord_bbstfc_conf_tax_code", label: "Tax Code"})
			   ]
			}));
		
		//Found one?
		//
		if(customrecord_bbstfc_configSearchObj != null && customrecord_bbstfc_configSearchObj.length > 0)
			{
				config 								= new libraryModule.libConfigObj();
				config.taxCode 						= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_tax_code'});
			}
		
		return config;
	}

	//Page through results set from search
    //
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

    
    return 	{
        	each: each
    		};
    
});
