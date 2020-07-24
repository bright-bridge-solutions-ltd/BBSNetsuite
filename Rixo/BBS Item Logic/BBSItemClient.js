/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/message'],
/**
 * @param {search} search
 */
function(search, message) {
    
    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
    	
    	// get the current record
    	var currentRecord = scriptContext.currentRecord;
    	
    	// get the ID of the current record
    	var recordID = currentRecord.id;
    	
    	// get the value of the UPC field
    	var UPC = currentRecord.getValue({
    		fieldId: 'upccode'
    	});
    	
    	// have we got a UPC code
    	if (UPC)
    		{
		    	// call search to check for existing items with this UPC
		    	var existingItem = searchItems(recordID, UPC);
		    	
		    	// if existingItem returns a value (search found a result)
		    	if (existingItem)
		    		{
			    		// display an alert to the user
			    		message.create({
			                title: 'Error', 
			                message: 'The UPC code <b>' + UPC + '</b> has already been used for <b>' + existingItem + '</b>.<br><br>UPC codes <b>must</b> be unique.<br><br>Please change the UPC code and try saving the record again.',
			                type: message.Type.ERROR,
			                duration: 5000 // show message for 5000 milliseconds/5 seconds
			            }).show(); // show message
		    		
		    			// prevent the record from being saved
		    			return false;
		    		}
		    	else
		    		{
		    			// allow the record to be saved
		    			return true;
		    		}
    		}
    	else
    		{
    			// allow the record to be saved
    			return true;
    		}
    		
    }
    
    // ===================================================
    // FUNCTION TO SEARCH FOR EXISTING ITEMS WITH THIS UPC
    // ===================================================
    
    function searchItems(currentRecordID, UPC) {
    	
    	// declare and initialize variables
    	var existingItem = null;
    	
    	// create item search
    	var itemSearch = search.create({
    		type: search.Type.ITEM,
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
    				{
    			name: 'upccode',
    			operator: search.Operator.IS,
    			values: [UPC]
    		}],
    		
    		columns: [{
    			name: 'itemid'
    		}],
    		
    	});
    	
    	// is this an existing item record that is being edited
    	if (currentRecordID)
    		{
    			// create an additional filter to the search to exclude this item ID
    			var newSearchFilter = search.createFilter({
	    			name: 'internalid',
	    			operator: search.Operator.NONEOF,
	    			values: [currentRecordID] // exclude the current item
	    		});

    			// add the filter to the search using .push() method
    			itemSearch.filters.push(newSearchFilter);
    		}
    	
    	// run the search and process results
    	itemSearch.run().each(function(result){
    		
    		// get the item ID from the search results
    		existingItem = result.getValue({
    			name: 'itemid'
    		});
    		
    	});
    	
    	// return existingItem variable to main script function
    	return existingItem;
    	
    }


    return 	{
        		saveRecord: saveRecord
    		};
    
});
