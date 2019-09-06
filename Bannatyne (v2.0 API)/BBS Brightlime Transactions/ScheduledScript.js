/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
function(search, record) {
    
    function execute(context) {
    	
    	// create search
    	var lineSearch = search.create({
			type: 'customrecord_bbs_bl_trans',
			
			columns: [{
				name: 'internalid'
			}],
			
			filters: [
			
			],
		});
    	
    	// process search results
    	lineSearch.run().each(function(result) {
    		
    		// get the internal ID of the record
    		var recordID = result.getValue({
				name: 'internalid'
			});
    		
    		try
    			{
    				// delete the record
		    		record.delete({
		    			type: 'customrecord_bbs_bl_trans',
		    			id: recordID
		    		});
		    		
		    		log.debug({
		    			title: 'Record Deleted',
		    			details: 'Record ' + recordID + ' has been deleted'
		    		});
    			}
    		catch(e)
    			{
    				log.debug({
    					title: 'Record Deleted',
    					details: 'An error occured deleting record ' + recordID + '. Error: ' + e
    				});
    			}
    		
    		// continue processing search results
    		return true;
    	});
    	
    }

    return {
        execute: execute
    };
    
});
