/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/dialog'],
function(search, dialog) {

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
    	
    	// if the entity or transaction date fields have been changed
    	if (scriptContext.fieldId == 'entity' || scriptContext.fieldId == 'trandate')
    		{
    			// get the value of the trandate and entity fields
    			var tranDate = scriptContext.currentRecord.getValue({
    				fieldId: 'trandate'
    			});
    			
    			var supplierID = scriptContext.currentRecord.getValue({
    				fieldId: 'entity'
    			});
    			
    			// check we have a supplier ID
    			if (supplierID)
    				{
		    			// call function to calculate the due date
						var dueDate = calculateDueDate(tranDate, supplierID);
						
						// set the due date on the record
						scriptContext.currentRecord.setValue({
							fieldId: 'duedate',
							value: dueDate
						});
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
    
    // ==============================
    // FUNCTION TO CALCULATE DUE DATE
    // ==============================
    
    function calculateDueDate(dueDate, supplierID) {
    	
    	// call function to get the terms from the supplier record
		var paymentTerms = getPaymentTerms(supplierID);
		
		// if the supplier has payment terms set
		if (paymentTerms.paymentTerms)
			{
				// if the payment terms contains 'End Of Month'
				if (paymentTerms.paymentTerms.indexOf('End Of Month') > -1)
					{
						// set the due date to be the end of the month
						dueDate = new Date(dueDate.getFullYear(), dueDate.getMonth()+1, 0);
					}

				// calculate the due date
				dueDate.setDate(dueDate.getDate() + paymentTerms.daysToAdd);
				
			}
		else // supplier does not have payment terms set
			{
				dialog.alert({
					title: '⚠️ Error Calculating Due Date',
					message: 'Unable to calculate due date as no payment terms are set on the supplier record'
				});
			}
		
		// return values to the main script function
		return dueDate;
    	
    }
    
    // =================================
    // FUNCTION TO GET THE PAYMENT TERMS
    // =================================
    
    function getPaymentTerms(supplierID) {
    	
    	// declare and initialize variables
    	var paymentTerms = null;
    	var daysToAdd = null;
    	
    	// get the payment terms from the supplier record
    	var supplierLookup = search.lookupFields({
    		type: search.Type.VENDOR,
    		id: supplierID,
    		columns: ['terms']
    	});
    	
    	// if we have payment terms on the supplier
    	if (supplierLookup.terms.length > 0)
			{
    			// get the name of the payment terms
    			paymentTerms = supplierLookup.terms[0].text;
    			
    			var paymentTermsLookup = search.lookupFields({
    				type: search.Type.TERM,
    				id: supplierLookup.terms[0].value,
    				columns: ['daysuntilnetdue', 'dayofmonthnetdue']
    			});
    			
    			// if we have a daysuntilnetdue
    			if (paymentTermsLookup.daysuntilnetdue)
    				{
    					// get the daysuntilnetdue
    					daysToAdd = parseInt(paymentTermsLookup.daysuntilnetdue);
    				}
    			else
    				{
    					// get the dayofmonthnetdue
						daysToAdd = parseInt(paymentTermsLookup.dayofmonthnetdue);
    				}
			}
    	
    	// return values to the main script function
    	return {
    		paymentTerms:	paymentTerms,
    		daysToAdd:		daysToAdd
    	}
    	
    }

    return {
        fieldChanged: fieldChanged
    };
    
});
