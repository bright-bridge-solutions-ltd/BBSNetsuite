/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
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
    	
    	// declare and initialize variables
		var postcode = null;
    	
    	// get the current record
    	var currentRecord = scriptContext.newRecord;
		
		// get count of addresses
		var addressCount = currentRecord.getLineCount({
			sublistId: 'addressbook'
		});
		
		// loop through addresses
		for (var i = 0; i < addressCount; i++)
			{
				// get the value of the 'Default Billing' checkbox for the line
				var defaultBilling = currentRecord.getSublistValue({
					sublistId: 'addressbook',
					fieldId: 'defaultbilling',
					line: i
				});
				
				// if defaultBilling is true
				if (defaultBilling == true)
					{
						// get the postcode from the address subrecord
						postcode = currentRecord.getSublistSubrecord({
						    sublistId: 'addressbook',
						    fieldId: 'addressbookaddress',
						    line: i
						}).getValue({
							fieldId: 'zip'
						});
						
						// break the loop
						break;
					}
			}
		
		// set the 'Postcode Searchable' field on the record
		currentRecord.setValue({
			fieldId: 'custentity_bbs_postcode_searchable',
			value: postcode
		});

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
    	
    	// check the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
	    		// get the ID of the current record
		    	var recordID = scriptContext.newRecord.id;
		    	
		    	// load the current record
		    	var currentRecord = record.load({
		    		type: record.Type.CUSTOMER,
		    		id: recordID,
		    		isDynamic: true
		    	});
		    	
		    	// get count of tax registrations
		    	var taxRegistrations = currentRecord.getLineCount({
		    		sublistId: 'taxregistration'
		    	});
		    	
		    	// check we have at least one tax registration
		    	if (taxRegistrations > 0)
		    		{
			    		// get the ID of the tax registration from the first line
			    		var taxRegistrationID = currentRecord.getSublistValue({
			    			sublistId: 'taxregistration',
			    			fieldId: 'id',
			    			line: 0
			    		});
			    		
			    		// set the default tax reg field on the record
			    		currentRecord.setValue({
			    			fieldId: 'defaulttaxreg',
			    			value: taxRegistrationID
			    		});
		    		}
    		
				try
			        {
			        	// submit the record
			        	currentRecord.save({
			        		ignoreMandatoryFields: true
			        	});
			        			
			        	log.audit({
			        		title: 'Customer Record Updated',
			        		details: 'Record ID: ' + recordID
			        	});
			        }
		    	catch(error)
			    	{
			        	log.error({
			        		title: 'Error Updating Customer Record ' + recordID,
			        		details: error
			        	});
			        }
    		}

    }

    return {
    	beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
