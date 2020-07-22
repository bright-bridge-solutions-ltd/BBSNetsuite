/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/message'],
function(search, message) {
    
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
    function fieldChanged(scriptContext) {

    }

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
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
    	
    	// get the current record object
    	var currentRecord = scriptContext.currentRecord;
    	
    	// get the ID of the current record
    	var currentRecordID = currentRecord.id;
    	
    	// get the value of the Sales Force Account ID field
    	var sfAccID = currentRecord.getValue({
    		fieldId: 'accountnumber'
    	});
    	
    	// check we have a Sales Force Account ID
    	if (sfAccID)
    		{
    			// call function to check if the Sales Force Account ID has been used on an existing customer. If found, customer name will be returned
    			var accountNumberInUse = searchSFAccountID(currentRecordID, sfAccID);
    			
    			// has this Sales Force Account ID already been used
    			if (accountNumberInUse)
    				{
	    				// display an alert to the user
	            		message.create({
	                        title: 'Error', 
	                        message: 'The Sales Force Account ID <b>' + sfAccID + '</b> has already been used for <b>' + accountNumberInUse + '</b>.<br><br>Sales Force Account IDs <b>must</b> be unique.<br><br>Please change the Sales Force Account ID and try saving the record again.',
	                        type: message.Type.ERROR,
	                        duration: 5000 // show message for 5000 milliseconds/5 seconds
	                    }).show(); // show message
	                    
	            		// do not allow the record to be submitted
	        			return false;
    				}
    			else // Sales Force Account ID is unique
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
    
    // =====================================================================
    // FUNCTION TO SEARCH FOR CUSTOMERS WITH THE SAME SALES FORCE ACCOUNT ID
    // =====================================================================
    
    function searchSFAccountID(currentRecordID, sfAccID) {
    	
    	// declare and initialize variables
    	var customerName = null;
    	
    	// create search to find customers where this Sales Force Account ID has been used (excluding the current customer)
    	var customerSearch = search.create({
    		type: search.Type.CUSTOMER,
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'accountnumber',
    			operator: 'is',
    			values: [sfAccID]
    		}],
    		
    		columns: [{
    			name: 'entityid'
    		}],
    		
    	});
    	
    	// is this an existing customer record that is being edited
    	if (currentRecordID)
    		{
	    		// create new search filter
				var newSearchFilter = search.createFilter({
	    			name: 'internalid',
	    			operator: 'noneof',
	    			values: [currentRecordID] // exclude the current customer
	    		});
	
				// add the filter to the search using .push() method
				customerSearch.filters.push(newSearchFilter);
    		}
    	
    	// run search and process results
    	customerSearch.run().each(function(result){
    		
    		// get the customer name from the search
    		customerName = result.getValue({
    			name: 'entityid'
    		});
    		
    	});
    	
    	// return customerName variable to main script function
    	return customerName;

    }

    return {
        saveRecord: saveRecord
    };
    
});
