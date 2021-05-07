/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['./BBSEOMTermsLibrary'],
function(libraryScript) {
    
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
    	
    	// get the current record
		var currentRecord = scriptContext.currentRecord;
	
		// get the value of the entity and override due date fields
		var entityID = currentRecord.getValue({
			fieldId: 'entity'
		});
		
		var overrideDueDate = currentRecord.getValue({
			fieldId: 'custbody_bbs_override_due_date'
		});
		
		// if we have an entity and override checkbox is unticked
		if (overrideDueDate == false)
			{
				// disable the due date field
				currentRecord.getField('duedate').isDisabled = true;
			
				// if we have a customer selected
				if (entityID)
					{
						// call library script function to recalculate the due date
						libraryScript.recalculateDueDate(currentRecord);
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
    	
    	if (scriptContext.fieldId == 'entity' || scriptContext.fieldId == 'trandate' || scriptContext.fieldId == 'custbody_bbs_shipment_date' || scriptContext.fieldId == 'terms') // if the entity, trandate, shipment date or terms fields has been changed
			{
	    		// get the current record
	    		var currentRecord = scriptContext.currentRecord;
	    	
	    		// get the value of the entity and override due date fields
	    		var entityID = currentRecord.getValue({
	    			fieldId: 'entity'
	    		});
	    		
	    		var overrideDueDate = currentRecord.getValue({
	    			fieldId: 'custbody_bbs_override_due_date'
	    		});
	    		
	    		// if we have an entity and override checkbox is unticked
	    		if (entityID && overrideDueDate == false)
	    			{
	    				// call library script function to recalculate the due date
	    				libraryScript.recalculateDueDate(currentRecord);
	    			}
			}
		else if (scriptContext.fieldId == 'custbody_bbs_override_due_date') // if the override due date checkbox has been changed
			{
				// get the current record
				var currentRecord = scriptContext.currentRecord;
			
				// get the value of the entity and override due date fields
				var entityID = currentRecord.getValue({
					fieldId: 'entity'
				});
				
				var overrideDueDate = currentRecord.getValue({
					fieldId: 'custbody_bbs_override_due_date'
				});
				
				// if we have an entity and override checkbox is unticked
				if (entityID && overrideDueDate == false)
					{
						// disable the due date field
						currentRecord.getField('duedate').isDisabled = true;
					
						// call library script function to recalculate the due date
						libraryScript.recalculateDueDate(currentRecord);
					}
				else if (overrideDueDate == true) // if override checkbox is ticked
					{
						// disable the due date field
						currentRecord.getField('duedate').isDisabled = false;
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
