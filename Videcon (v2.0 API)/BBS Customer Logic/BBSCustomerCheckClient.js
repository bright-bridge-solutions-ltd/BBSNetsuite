/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/ui/dialog'],
function(runtime, search, dialog) {
    
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
    	
    	// check the record is being created
    	if (scriptContext.mode == 'create')
    		{
	    		// get the record type
	    		var recordType = scriptContext.currentRecord.type;
    		
    			// get the value of the customer field
		    	var customerID = scriptContext.currentRecord.getValue({
		    		fieldId: 'entity'
		    	});
		    			
		    	// if we have a customer ID
		    	if (customerID)
		    		{
		    			// call function to get customer info
		    			var customerInfo = getCustomerInfo(customerID);
		    					
		    			// if the customer is a Prospect or Lead, OR they are a Customer and the legacyCustomer checkbox is NOT ticked
		    			if (customerInfo.stage != 'CUSTOMER' || (customerInfo.stage == 'CUSTOMER' && customerInfo.legacyCustomer == false))
		    				{
		    					// call function to check if the customer fields have been populated
		    					var customerOK = checkCustomer(customerID, recordType);
		    					
				    			// if the customerOK variable returns false
				    			if (customerOK == false)
				    				{
				    					// display an alert to the user
				    					dialog.alert({
				    						title: '⚠️ Error',
				    						message: 'The customer you have selected has not been fully setup and cannot be transacted with'
				    					});
				    						
				    					// clear the customer field
					    				scriptContext.currentRecord.setValue({
					    		    		fieldId: 'entity',
					    		    		value: null
					    		    	});
				    				}
		    				}
		    		}
    		}

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
    	
    	// if the customer field has been changed
    	if (scriptContext.fieldId == 'entity')
    		{
	    		// get the record type
    			var recordType = scriptContext.currentRecord.type;
    		
    			// get the value of the customer field
    			var customerID = scriptContext.currentRecord.getValue({
    				fieldId: 'entity'
    			});
    			
    			// if we have a customer ID
    			if (customerID)
    				{
	    				// call function to get customer info
		    			var customerInfo = getCustomerInfo(customerID);
		    					
		    			// if the customer is a Prospect or Lead, OR they are a Customer and the legacyCustomer checkbox is NOT ticked
		    			if (customerInfo.stage != 'CUSTOMER' || (customerInfo.stage == 'CUSTOMER' && customerInfo.legacyCustomer == false))
		    				{
    							// call function to check if the customer fields have been populated
    							var customerOK = checkCustomer(customerID, recordType);
    					
		    					// if the customerOK variable returns false
		    					if (customerOK == false)
		    						{
		    							// display an alert to the user
		    							dialog.alert({
		    								title: '⚠️ Error',
		    								message: 'The customer you have selected has not been fully setup and cannot be transacted with'
		    							});
		    						
		    							// clear the customer field
			    						scriptContext.currentRecord.setValue({
			    		    				fieldId: 'entity',
			    		    				value: null
			    		    			});
		    						}
    						}
    				}
    		}
    	
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

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getCustomerInfo(customerID) {
    	
    	// declare and initialize variables
    	var stage = null;
    	var legacyCustomer = null;
    	
    	// lookup fields on the customer record
    	var customerLookup = search.lookupFields({
    		type: search.Type.CUSTOMER,
    		id: customerID,
    		columns: ['stage', 'custentity_bbs_legacy_customer']
    	});
    	
    	// return values to the main script function
    	return {
    		stage: customerLookup.stage[0].value,
    		legacyCustomer:	customerLookup.custentity_bbs_legacy_customer
    	};
    	
    }
    
    function checkCustomer(customerID, recordType) {
    	
    	// declare and initialise variables
    	var customerOK = false;
    	
    	// if the record type is salesorder
    	if (recordType == 'salesorder')
    		{
	    		// retrieve script parameters
	        	var savedSearchID = runtime.getCurrentScript().getParameter({
	        		name: 'custscript_bbs_cust_client_ss_sales_ord'
	        	});
    		}
    	else
    		{
	    		// retrieve script parameters
	        	var savedSearchID = runtime.getCurrentScript().getParameter({
	        		name: 'custscript_bbs_cust_client_ss_quote_opp'
	        	});
    		}
    	
    	// run search to see if the customer meets the criteria
    	var customerSearch = search.load({
    		type: search.Type.CUSTOMER,
    		id: savedSearchID
    	});
    	
    	// get the current search filters
		var searchFilters = customerSearch.filters;
		
		// create new filter
		var newSearchFilter = search.createFilter({
			name: 'internalid',
			operator: search.Operator.ANYOF,
			values: [customerID]
	    });
	
		// add the filter using .push() method
		searchFilters.push(newSearchFilter);
		
		// run the search
		customerSearch.run().each(function(result){
			
			// set customerOK variable to false
			customerOK = true;
			
		});
		
		// return customerOK variable to main script function
		return customerOK;
    	
    }

    return {
    	pageInit: pageInit,
        fieldChanged: fieldChanged
    };
    
});
