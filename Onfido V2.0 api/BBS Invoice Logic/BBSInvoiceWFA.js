/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search'],
function(search) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
    	
    	// get the current record
    	var currentRecord = scriptContext.newRecord;
    	
    	// get the ID of the customer
    	var customerID = currentRecord.getValue({
    		fieldId: 'entity'
    	});
    	
    	// lookup fields on the customer record
    	var customerLookup = search.lookupFields({
    		type: search.Type.CUSTOMER,
    		id: customerID,
    		columns: ['custentity_bbs_invoice_email', 'custentity_bbs_invoice_email_cc_1', 'custentity_bbs_invoice_email_cc_2']
    	});
    	
    	// get the customer email addresses from the customerLookup
    	var emailAddress1 = customerLookup.custentity_bbs_invoice_email;
    	var emailAddress2 = customerLookup.custentity_bbs_invoice_email_cc_1;
    	var emailAddress3 = customerLookup.custentity_bbs_invoice_email_cc_2;
    	
    	// set the memo field on the current record
    	currentRecord.setValue({
    		fieldId: 'memo',
    		value: emailAddress1
    	});

    }

    return {
        onAction : onAction
    };
    
});
