/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/runtime'],
function(search, runtime) {
   
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
    	
    	if (scriptContext.type == scriptContext.UserEventType.VIEW)
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the approval status
    			var approvalStatus = currentRecord.getValue({
    				fieldId: 'custrecord_bbs_seci_time_entry_approval'
    			});
    			
    			// get the location ID
    			var locationID = currentRecord.getValue({
    				fieldId: 'custrecord_bbs_seci_time_entry_location'
    			});
    			
    			// call function to get the ID of the club manager for the location
    			var clubManager = getClubManager(locationID);
    			
    			// get the current user
    			var currentUser	= runtime.getCurrentUser();
    			
    			// if the approvalStatus = 2 (Pending Approval), the clubManager = currentUser OR userRole = 3 (Administrator)
    			if (approvalStatus == 2 && (clubManager == currentUser.id || currentUser.role == 3))
    				{
    					// set a client script to run on the form
    					scriptContext.form.clientScriptFileId = 415998;
    				
    					// add a button to the form and call a client script function when the button is clicked
    					scriptContext.form.addButton({
    						id: 'custpage_reject',
    						label: 'Rejected',
    						functionName: 'reject(' + currentRecord.id + ')' // pass internal ID of current record
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
    function beforeSubmit(scriptContext) {

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
    
    // =========================================================
    // FUNCTION TO GET THE CLUB MANAGER FROM THE LOCATION RECORD
    // =========================================================
    
    function getClubManager(locationID) {
    	
    	// declare and initialize variables
    	var clubManager = null;
    	
    	// lookup fields on the location record
    	var locationLookup = search.lookupFields({
    		type: search.Type.LOCATION,
    		id: locationID,
    		columns: ['custrecord161']
    	});
    	
    	// if we have a club manager selected on the location
    	if (locationLookup.custrecord161.length > 0)
    		{
    			// get the ID of the club manager
    			clubManager = locationLookup.custrecord161[0].value;
    		}
    	
    	// return values to the main script function
    	return clubManager;
    	
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
