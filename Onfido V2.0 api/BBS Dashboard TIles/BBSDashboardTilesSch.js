/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/format'],
function(search, format) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	// declare array of searches to be updated
    	var searchesToUpdate = [
    	                        	{
    	                        		type: 'customrecord_bbs_ims_usage_data',
    	                        		id: 'customsearch3455'
    	                        	},
    	                        	{
    	                        		type: 'customrecord_bbs_ims_usage_data',
    	                        		id: 'customsearch3245'
    	                        	},
    	                        	{
    	                        		type: 'salesorder',
    	                        		id: 'customsearch3246'
    	                        	},
    	                        	{
    	                        		type: 'customrecord_bbs_contract_period',
    	                        		id: 'customsearch3247'
    	                        	},
    	                        ];
    	
    	// loop through searches to be updated
    	for (var i = 0; i < searchesToUpdate.length; i++)
    		{
		    	// get the search type and ID
    			var searchType 	= searchesToUpdate[i].type;
    			var searchID	= searchesToUpdate[i].id;
    		
    			try
		    		{
				    	// load the search
				    	var searchObj = search.load({
				    		type: searchType,
				    		id: searchID
				    	});
				    	
				    	// get today's date
				    	var today = new Date();
				    	
				    	// set the date filters to be this month
				    	var fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
				    	var toDate = new Date(today.getFullYear(), today.getMonth()+1, 0);
				    	
				    	// format fromDate/toDate objects as date strings
				    	fromDate = format.format({
				    		type: format.Type.DATE,
				    		value: fromDate
				    	});
				    	
				    	toDate = format.format({
				    		type: format.Type.DATE,
				    		value: toDate
				    	});
				    	
				    	if (searchType == 'customrecord_bbs_ims_usage_data') // if this is an IMS Usage Data search
				    		{
				    			// remove the last search filter
					    		searchObj.filters.pop();
					    		
					    		// add a new date filter to the search
						    	searchObj.filters.push(search.createFilter({
									name: 'custrecord_bbs_ims_usage_data_date',
									operator: search.Operator.WITHIN,
									values: [fromDate, toDate]
								}));
				    		}
				    	else if (searchType == 'salesorder') // if this is a sales order search
				    		{
				    			// remove the last search filter
				    			searchObj.filters.pop();
				    			
				    			// add a new date filter to the search
						    	searchObj.filters.push(search.createFilter({
									name: 'custcol_bbs_so_search_date',
									operator: search.Operator.WITHIN,
									values: [fromDate, toDate]
								}));
				    		}
				    	else if (searchType == 'customrecord_bbs_contract_period') // if this is a contract period detail search
				    		{
				    			// remove the first and last search filter
				    			searchObj.filters.shift();
				    			searchObj.filters.pop();
				    			
				    			// add new date filters to the search
						    	searchObj.filters.push(search.createFilter({
									name: 'custrecord_bbs_contract_period_start',
									operator: search.Operator.WITHIN,
									values: [fromDate, toDate]
								}));
						    	
						    	searchObj.filters.push(search.createFilter({
									name: 'custrecord_bbs_contract_period_end',
									operator: search.Operator.WITHIN,
									values: [fromDate, toDate]
								}));
				    		}
				    	
				    	// save the changes to the search
				    	searchObj.save();
				    	
				    	log.audit({
				    		title: 'Search Dates Updated',
				    		details: searchID
				    	});
				    }
		    	catch(e)
		    		{
		    			log.error({
		    				title: 'Error Updating Search ' + searchID,
		    				details: e
		    			});
		    		}
    		}

    }

    return {
        execute: execute
    };
    
});
