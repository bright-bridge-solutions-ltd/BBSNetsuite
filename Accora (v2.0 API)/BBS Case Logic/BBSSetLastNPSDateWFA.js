/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search', 'N/record'],
function(search, record) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
    	
    	// declare and initialize variables
    	var entityType = null;
    	
    	// get the current record
    	var currentRecord = scriptContext.newRecord;
    	
    	// get values from the case form
    	var companyID = currentRecord.getValue({
    		fieldId: 'company'
    	});
    	
    	var contactID = currentRecord.getValue({
    		fieldId: 'contact'
    	});
    	
    	if (contactID != '' && contactID != null)
			{
				// call function to get the entity type
				entityType = getEntityType(contactID);
				
				// call function to update the date of last NPS email field on the entity record
				updateLastNPSDate(contactID, entityType);
			}
    	else if (companyID != '' && companyID != null)
    		{
	    		// call function to get the entity type
		    	entityType = getEntityType(companyID);
		    			
		    	// call function to update the date of last NPS email field on the entity record
		    	updateLastNPSDate(companyID, entityType);
    		}

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getEntityType(entityID) {
    	
    	// declare and initialize variables
    	var entityType = null;
    	
    	// get the entity type
    	var entityLookup = search.lookupFields({
    		type: search.Type.ENTITY,
    		id: entityID,
    		columns: ['type']
    	}).type[0].value;
    	
    	switch(entityLookup) {
    	
    		case 'CustJob':
    			entityType = record.Type.CUSTOMER;
    			break;
    		
    		case 'Contact':
    			entityType = record.Type.CONTACT;
    			break;
    		
    		case 'Employee':
    			entityType = record.Type.EMPLOYEE;
    			break;
    	}
    	
    	// return values to main script function
    	return entityType;
    	
    }
    
    function updateLastNPSDate(entityID, entityType) {
    	
    	try
    		{
    			// set the date of last NPS email field on the entity record
    			record.submitFields({
    				type: 	entityType,
    				id: 	entityID,
    				values: {
    					custentity_acc_date_of_last_nps_email:	new Date() // today
    				},
    				ignoreMandatoryFields:	true
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Entity Record',
    				details: 'Entity Type: ' + entityType + '<br>Entity ID: ' + entityID + '<br>Error: ' + e.message
    			});
    		}
    	
    }

    return {
        onAction : onAction
    };
    
});
