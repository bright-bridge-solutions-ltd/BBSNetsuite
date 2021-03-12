/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
function(search, record) {
   
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

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
    	
    	// check the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
	    		// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the postcode from the shipping address subrecord
    			var postcode = currentRecord.getSubrecord({
    				fieldId: 'shippingaddress'
    			}).getValue({
    				fieldId: 'zip'
    			}).toUpperCase().replace(' ', ''); // convert to upper case and remove spaces
    			
    			// check we have a postcode
    			if (postcode)
    				{
		    			// call function to return the menzies depot
		    			var menziesDepot = getMenziesDepot(postcode);
		    			
		    			// set the Menzies Depot field on the record
		    			currentRecord.setValue({
		    				fieldId: 'custbody_bbs_menzies_depot',
		    				value: menziesDepot
		    			});
    				}
    		}

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {

    }
    
    // ====================================
    // FUNCTION TO RETURN THE MENZIES DEPOT
    // ====================================
    
    function getMenziesDepot(postcode) {
    	
    	// declare and initialize variables
    	var menziesDepot = null;
    	
    	if (postcode.length == 7) // if postcode contains 7 characters
    		{
    			// get the first 4 characters of the postcode
    			postcode = postcode.substr(0, 4);
    		}
    	else if (postcode.length == 6) // if postcode contains 6 characters
    		{
	    		// get the first 3 characters of the postcode
				postcode = postcode.substr(0, 3);
    		}
    	else if (postcode.length == 5) // if postcode contains 5 characters
			{
	    		// get the first 2 characters of the postcode
				postcode = postcode.substr(0, 2);
			}
    	
    	// run search to return the menzies depot
    	search.create({
    		type: 'customrecord_bbs_menzies_depot',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
    				{
    			name: 'name',
    			operator: search.Operator.IS,
    			values: [postcode]
    		}],
    		
    		columns: [{
    			name: 'name'
    		}],
    	
    	}).run().each(function(result){
    		
    		// retrieve search results
    		menziesDepot = result.id;
    		
    	});
    	
    	// return values to the main script function
    	return menziesDepot;
    	
    }

    return {
    	beforeSubmit: beforeSubmit
    };
    
});
