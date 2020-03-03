/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
/**
 * @param {serverWidget} serverWidget
 */
function(record) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
    	
    	// check that the record is being viewed
    	if (scriptContext.type == 'view')
    		{
	    		// get the current record
	        	var currentRecord = scriptContext.newRecord;
	        	
	        	// get the internal id of the current record
	        	var recordID = currentRecord.id;
	        	
	    	    // get the value of the 'Company Name' field
	    	    var customer = currentRecord.getValue({
	    	    	fieldId: 'company'
	    	    });
	    	    
	    	    // get the value of the 'Contact' field
	    	    var contact = currentRecord.getValue({
	    	    	fieldId: 'contact'
	    	    });

    			// set a client script to run on the form
    			scriptContext.form.clientScriptFileId = 3407771;
    			
    			// add button to the form
	    		scriptContext.form.addButton({
	    			id: 'custpage_create_quote',
	    			label: 'Create Quote',
	    			functionName: 'createQuote(' + customer + ',' + recordID + ',' + contact + ')' // call client script when button is clicked. Pass company variable
	    		});
    		}   	
    }

    return {
        beforeLoad: beforeLoad
    };
    
});