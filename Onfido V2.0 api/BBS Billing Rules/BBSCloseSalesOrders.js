/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],

function(search, record) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	// declare variables
    	var recordID;
    	var soRecord;
    	var lineCount;
    	
    	// create search to find sales order records to be updated
    	var soSearch = search.create({
    		type: search.Type.SALES_ORDER,
    		
    		columns: [{
    			name: 'internalid'
    		}],
    	
    		filters: [{
    			name: 'mainline',
    			operator: 'is',
    			values: ['T']
    		},
    				{
    			name: 'status',
    			operator: 'noneof',
    			values: ['SalesOrd:G','SalesOrd:H'] // SalesOrd:G = Billed, SalesOrd:H = Closed
    		}],
    	});
    	
    	// run search and process results
    	soSearch.run().each(function(result) {
			
	    	// get the internal ID of the record from the search results
	    	recordID = result.getValue({
	    		name: 'internalid'
	    	});
	    	
	    	log.audit({
	    		title: 'Processing Sales Order',
	    		details: recordID
	    	});
	    	
	    	try
	    		{
	    			// load the sales order record
	    			soRecord = record.load({
	    				type: record.Type.SALES_ORDER,
	    				id: recordID,
	    				isDynamic: true
	    			});
	    	
	    			// get count of item lines
	    			lineCount = soRecord.getLineCount({
	    				sublistId: 'item'
	    			});
		
	    			// loop through line count
	    			for (var x = 0; x < lineCount; x++)
						{
							// select the line
							soRecord.selectLine({
								sublistId: 'item',
								line: x
							});
						
							// set the 'isclosed' flag to true
							soRecord.setCurrentSublistValue({
								sublistId: 'item',
								fieldId: 'isclosed',
								value: true
							});
						
							// commit the new line
							soRecord.commitLine({
								sublistId: 'item'
							});
						}
				
	    			// submit the sales order record
	    			var recordID = soRecord.save({
	    				enableSourcing: false,
	    				ignoreMandatoryFields: true
	    			});
				
	    			log.audit({
	    				title: 'Sales Order Closed',
	    				details: recordID
	    			});
	    		}
	    	catch(error)
	    		{
		    		log.error({
			    		title: 'Error Updating Sales Order ' + recordID,
			    		details: error
			    	});
	    		}
	    	
	    	// continue processing further search results
	    	return true;
    	});
    	
    }

    return {
        execute: execute
    };
    
});
