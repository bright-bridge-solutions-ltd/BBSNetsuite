/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
function(search) {
    
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
    	
    	// check the record is being created or edited
    	if (scriptContext.mode == 'create' || scriptContext.mode == 'edit')
    		{
	    		// get the current record
	        	var currentRecord = scriptContext.currentRecord;
	        	
	        	// get the ID of the customer
	        	var customerID = currentRecord.getValue({
	        		fieldId: 'entity'
	        	});
	        	
	        	// check we have a customer
	        	if (customerID)
	        		{
			        	// lookup fields on the customer record
			        	var customerLookup = search.lookupFields({
			        		type: search.Type.CUSTOMER,
			        		id: customerID,
			        		columns: ['custentity_bbs_invoice_email', 'custentity_bbs_invoice_email_cc_1', 'custentity_bbs_invoice_email_cc_2']
			        	});
			        	
			        	// get the customer email addresses from the customerLookup
			        	var emailAddress = customerLookup.custentity_bbs_invoice_email;
			        	var emailAddress2 = customerLookup.custentity_bbs_invoice_email_cc_1;
			        	var emailAddress3 = customerLookup.custentity_bbs_invoice_email_cc_2;
			        	
			        	// check we have an emailAddress2
			        	if (emailAddress2)
			        		{
			        			// add the emailAddress2 to emailAddress, separated by a semi-colon
			        			emailAddress += ';';
			        			emailAddress += emailAddress2;
			        		}
			        	
			        	// check we have an emailAddress3
			        	if (emailAddress3)
			        		{
			        			// add the emailAddress3 to emailAddress, separated by a semi-colon
			        			emailAddress += ';';
			        			emailAddress += emailAddress3;
			        		}
			        	
			        	// set the email field on the current record
			        	currentRecord.setValue({
			        		fieldId: 'email',
			        		value: emailAddress
			        	});
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
    	
    	// check that the customer field has been edited
    	if (scriptContext.fieldId == 'entity')
    		{
	    		// get the current record
	        	var currentRecord = scriptContext.currentRecord;
	        	
	        	// get the ID of the customer
	        	var customerID = currentRecord.getValue({
	        		fieldId: 'entity'
	        	});
	        	
	        	// check we have a customer
	        	if (customerID)
	        		{
			        	// lookup fields on the customer record
			        	var customerLookup = search.lookupFields({
			        		type: search.Type.CUSTOMER,
			        		id: customerID,
			        		columns: ['custentity_bbs_invoice_email', 'custentity_bbs_invoice_email_cc_1', 'custentity_bbs_invoice_email_cc_2']
			        	});
			        	
			        	// get the customer email addresses from the customerLookup
			        	var emailAddress = customerLookup.custentity_bbs_invoice_email;
			        	var emailAddress2 = customerLookup.custentity_bbs_invoice_email_cc_1;
			        	var emailAddress3 = customerLookup.custentity_bbs_invoice_email_cc_2;
			        	
			        	// check we have an emailAddress2
			        	if (emailAddress2)
			        		{
			        			// add the emailAddress2 to emailAddress, separated by a semi-colon
			        			emailAddress += ';';
			        			emailAddress += emailAddress2;
			        		}
			        	
			        	// check we have an emailAddress3
			        	if (emailAddress3)
			        		{
			        			// add the emailAddress3 to emailAddress, separated by a semi-colon
			        			emailAddress += ';';
			        			emailAddress += emailAddress3;
			        		}
			        	
			        	// set the email field on the current record
			        	currentRecord.setValue({
			        		fieldId: 'email',
			        		value: emailAddress
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

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged
    };
    
});
