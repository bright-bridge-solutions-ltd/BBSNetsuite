/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/dialog', 'N/search', 'N/record', 'N/url'],
function(dialog, search, record, url) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {

    }
    
    function showAlert(recordID) {
    			
    			// display dialog asking user if they wish to continue
    			dialog.confirm({
    				title: 'Confirm Deletion',
    				message: 'Please confirm that you wish to delete this contract record and any associated product lines.'
    			}).then(success).catch(failure);

    			// helper function called when user selects OK or cancel on confirm dialog
    			function success(result)
    				{
    				 	// check if the user clicked ok
    					if (result == true)
    						{
	    						// call helper functions to delete records
	        					deleteProductDetailRecords(recordID);
	        					deleteProductRecords(recordID);
	        					deleteMinimumUsageRecords(recordID);
	        					deleteContractRecord(recordID);
	        					
	        					// return the URL of the home page
	        					var reloadURL = url.resolveTaskLink({
	        						id: 'CARD_-29'
	        					});
	        					
	        					// redirect the user to the home page
	        					window.onbeforeunload = null;
	        					window.location.href = reloadURL;
    						}
    				}
    			
    			function failure()
    				{

    				}
    			
    		}
    
		    //===================================================
			// FUNCTION TO DELETE CONTRACT PRODUCT DETAIL RECORDS
			//===================================================
    		
    		function deleteProductDetailRecords(recordID)
	    		{
	    			// declare and initialize variables
	    			var periodDetailRecord;
	    			
	    			// run search to find customrecord_bbs_contract_period records linked to this contract
	    			var periodDetailSearch = search.create({
	    				type: 'customrecord_bbs_contract_period',
	    				
	    				columns: [{
	    					name: 'internalid'
	    	    		}],
	    	    		
	    	    		filters: [{
	    	    			join: 'custrecord_bbs_contract_period_contract',
	    	    			name: 'internalid',
	    	    			operator: 'is',
	    	    			values: [recordID]
	    	    		}],
	    	    	});
	    			
	    			// run search and process search results
	    	    	periodDetailSearch.run().each(function(result) {
	    	    		
	    	    		// get the internal ID of the record
	    	    		periodDetailRecord = result.getValue({
	    	    			name: 'internalid'
	    	    		});
	    	    		
	    	    		try
	    	    			{
	    	    				// delete the record
	    	    				record.delete({
	    	    					type: 'customrecord_bbs_contract_period',
	    	    					id: periodDetailRecord
	    	    				});
	    	    			}
	    	    		catch(error)
	    	    			{

	    	    			}
	    	    		
	    	    		// continue processing search results
	    	    		return true
	    	    	});	    			
	    		}
    		
    		//============================================
			// FUNCTION TO DELETE CONTRACT PRODUCT RECORDS
			//============================================
    		
    		function deleteProductRecords(recordID)
	    		{
    				// declare and initialize variables
    				var productRecord;
    				
    				// run search to find customrecord_bbs_contract_product records linked to this contract
    	    		var productSearch = search.create({
    	    			type: 'customrecord_bbs_contract_product',
    	    		
    	    			columns: [{
        					name: 'internalid'
        	    		}],
        	    		
        	    		filters: [{
        	    			join: 'custrecord_contract_product_parent',
        	    			name: 'internalid',
        	    			operator: 'is',
        	    			values: [recordID]
        	    		}],
        	    	});
    	    		
    	    		// run search and process search results
    	    		productSearch.run().each(function(result) {
        	    		
        	    		// get the internal ID of the record
    	    			productRecord = result.getValue({
        	    			name: 'internalid'
        	    		});
        	    		
        	    		try
        	    			{
        	    				// delete the record
        	    				record.delete({
        	    					type: 'customrecord_bbs_contract_product',
        	    					id: productRecord
        	    				});
        	    			}
        	    		catch(error)
        	    			{
        	    			
        	    			}
        	    		
        	    		// continue processing search results
        	    		return true;
    	    		});
	    		}
    		
    		// ========================================
    		// FUNCTION TO DELETE MINIMUM USAGE RECORDS
    		// ========================================
    		
    		function deleteMinimumUsageRecords(recordID)
	    		{
	    			// declare and initialize variables
    				var minimumUsageRecord;
    				
    				// create search to find minimum usage records for this contract
    				var minimumUsageSearch = search.create({
    					type: 'customrecord_bbs_contract_minimum_usage',
    					
    					filters: [{
    						name: 'custrecord_bbs_contract_min_usage_parent',
    						operator: 'anyof',
    						values: [recordID]
    					}],
    					
    					columns: [{
    						name: 'internalid'
    					}],
    		
    				});
    				
    				// run search and process results
    				minimumUsageSearch.run().each(function(result){
    					
    					// get the internal ID of the record
    					minimumUsageRecord = result.getValue({
    						name: 'internalid'
    					});
    					
    					try
	    	    			{
	    	    				// delete the record
	    	    				record.delete({
	    	    					type: 'customrecord_bbs_contract_minimum_usage',
	    	    					id: minimumUsageRecord
	    	    				});
	    	    			}
    					catch(error)
	    	    			{
	    	    			
	    	    			}
    	    		
    					// continue processing search results
    					return true;
    					
    				});
    				
	    		}
    		
    		//=======================================
			// FUNCTION TO DELETE THE CONTRACT RECORD
			//=======================================
    		
    		function deleteContractRecord(recordID)
	    		{
	    			// delete the contract record
		    		try
	    	    		{
	    	    			record.delete({
	    	    				type: 'customrecord_bbs_contract',
	    	    				id: recordID
	    	    			});
	    	    		}
		    		catch(error)
	    	    		{
	    	    			
	    	    		}
	    		}

    return {
        pageInit: pageInit,
        showAlert: showAlert        
    };
    
});
