/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search'],
/**
 * @param {serverWidget} serverWidget
 */
function(record, runtime, search) {
   
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
    			scriptContext.form.clientScriptFileId = 4643003;
    			
    			// add button to the form
	    		scriptContext.form.addButton({
	    			id: 'custpage_create_quote',
	    			label: 'Create Quote',
	    			functionName: 'createQuote(' + customer + ',' + recordID + ',' + contact + ')' // call client script when button is clicked. Pass company variable
	    		});
	    		
	    		var subject 	= currentRecord.getValue({fieldId: 'title'});
	    		var email		= currentRecord.getValue({fieldId: 'custevent_acc_contact_email'});
	    		var phone		= currentRecord.getValue({fieldId: 'custevent_acc_contact_phone'});
	    		var specialist	= currentRecord.getValue({fieldId: 'custevent_acc_product_specialist'});
	    		var user		= runtime.getCurrentUser().id;
	    		var isSupport	= false;
	    		
	    		var subsidiary	= search.lookupFields({
														type:		search.Type.CUSTOMER, 
														id:			customer,
														columns:	'subsidiary'
														}).subsidiary;
	    		
	    		try
	    			{
		    			isSupport	= search.lookupFields({
		    												type:		search.Type.EMPLOYEE, 
		    												id:			user,
		    												columns:	'issupportrep'
		    												}).issupportrep;
	    			}
	    		catch(err)
	    			{
	    				isSupport	= false;
	    			}
	    		
	    		user = (isSupport ? user : null);
	    		
	    		// add button to the form
	    		scriptContext.form.addButton({
	    			id: 'custpage_create_case',
	    			label: 'Create Case',
	    			functionName: "createCase('" + customer + "','" + subject + "','" + contact + "','" + user + "','" + email + "','" + phone + "','" + subsidiary + "','" + specialist + "','" + "')" 
	    		});
    		}   	
    }

    return {
        beforeLoad: beforeLoad
    };
    
});