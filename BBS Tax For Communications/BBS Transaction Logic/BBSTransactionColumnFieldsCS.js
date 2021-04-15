/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search'],

function(search) {


    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) 
	    {
	    	debugger;
	    	
	    	if(scriptContext.sublistId == 'item' && (scriptContext.fieldId == 'custpage_bbstfc_endpoint_from' || scriptContext.fieldId == 'custpage_bbstfc_endpoint_to'))
	    		{
		    		//Read the AFC config record
		    		//
		    		var customrecord_bbstfc_configSearchObj = getResults(search.create({
						   type: "customrecord_bbstfc_config",
						   filters:
						   [
						      ["isinactive","is","F"]
						   ],
						   columns:
						   [
						      search.createColumn({name: "custrecord_bbstfc_from_address_field"}),
						      search.createColumn({name: "custrecord_bbstfc_to_address_field"})
						   ]
						}));
		    		
		    		if (customrecord_bbstfc_configSearchObj != null && customrecord_bbstfc_configSearchObj.length > 0)
						{
		    				//Get the 'real' fields from the config object
		    				//
			    			var realFromAddress = customrecord_bbstfc_configSearchObj[0].getValue({name: "custrecord_bbstfc_from_address_field"});
			    			var realToAddress 	= customrecord_bbstfc_configSearchObj[0].getValue({name: "custrecord_bbstfc_to_address_field"});
							
				    		var fromAddress = scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'item', fieldId: 'custpage_bbstfc_endpoint_from'});
				    		var toAddress = scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'item', fieldId: 'custpage_bbstfc_endpoint_to'});
			    			
			    			scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'item', fieldId: realFromAddress, value: fromAddress, ignoreFieldChange: true});
			    			scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'item', fieldId: realToAddress, value: toAddress, ignoreFieldChange: true});
						}
	    		}
	
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
        fieldChanged: fieldChanged
    };
    
});
