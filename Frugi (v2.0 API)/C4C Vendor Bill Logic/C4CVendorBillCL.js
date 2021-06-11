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
    	
    	// if the Department field has been changed
    	if (scriptContext.fieldId == 'custbody_c4c_department')
    		{
    			// get the value Department field
    			var department = scriptContext.currentRecord.getValue({
    				fieldId: 'custbody_c4c_department'
    			});
    			
    			// call function to return the approval department
    			var approvalDepartment = getApprovalDepartment(department);
    			
    			// set the Approval Department field
    			scriptContext.currentRecord.setValue({
    				fieldId: 'custbody_c4c_approval_department',
    				value: approvalDepartment
    			});		
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
    	
    	// get the value Department field
		var department = scriptContext.currentRecord.getValue({
			fieldId: 'custbody_c4c_department'
		});
		
		// call function to return the approval department
		var approvalDepartment = getApprovalDepartment(department);
		
		// set the Approval Department field
		scriptContext.currentRecord.setValue({
			fieldId: 'custbody_c4c_approval_department',
			value: approvalDepartment
		});
		
		// allow the record to be saved
		return true;

    }
    
    // ==========================================
    // FUNCTION TO RETURN THE APPROVAL DEPARTMENT
    // ==========================================
    
    function getApprovalDepartment(department) {
    	
    	// declare and initialize variables
    	var approvalDepartment = '';
    	
    	// check we have a department
    	if (department)
    		{
		    	// run search to find the approval department
		    	search.create({
		    		type: 'customrecord_c4c_bill_approval_table',
		    		
		    		filters: [{
		    			name: 'isinactive',
		    			operator: search.Operator.IS,
		    			values: ['F']
		    		},
		    				{
		    			name: 'custrecord_c4c_department',
		    			operator: search.Operator.ANYOF,
		    			values: [department]
		    		}],
		    		
		    		columns: [{
		    			name: 'name'
		    		}],
		    		
		    	}).run().each(function(result){
		    		
		    		// get the internal ID of the approval department
		    		approvalDepartment = result.id;
		    		
		    	});
    		}
    	
    	// return values to the main script function
    	return approvalDepartment;
    	
    }

    return {
        fieldChanged: fieldChanged,
        saveRecord: saveRecord
    };
    
});
