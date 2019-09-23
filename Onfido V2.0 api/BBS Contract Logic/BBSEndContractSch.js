/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
/**
 * @param {record} record
 * @param {search} search
 */
function(search, record) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	// initiate variables
    	var recordID;
    	
    	// create search to find Contract Records with an early termination date of Today
    	var contractSearch = search.create({
    		type: 'customrecord_bbs_contract',
    		   
    		columns: [{
    			name: 'internalid'
    		}],
    		
    		filters: [{
    			name: 'custrecord_bbs_contract_early_end_date',
    			operator: 'on',
    			values: ['today']
    		}],
    	});
    	
    	// run the search and process search results
    	contractSearch.run().each(function(result) {
    		
    		// get the internal ID of the record
    		recordID = result.getValue({
    			name: 'internalid'
    		});
    		
    		log.audit({
    			title: 'Processing Record',
    			details: recordID
    		});
    		
    		try
    			{
    				// set the status field on the contract record to 4 (Ended) and tick the inactive checkbox
	    			record.submitFields({
	    				type: 'customrecord_bbs_contract',
	    				id: recordID,
	    				values: {
	    					custrecord_bbs_contract_status: '4',
	    					isinactive: true
	    				}
	    			});
	    			
	    			log.audit({
	    				title: 'Record Updated',
	    				details: recordID
	    			});
    			}
    		catch (error)
    			{
    				log.error({
    					title: 'Error Updating Record',
    					details: 'Record: ' + recordID + ' | Error: ' + error
    				});
    			}
    		
    		// continue processing results
    		return true;
    		
    	});

    }

    return {
        execute: execute
    };
    
});
