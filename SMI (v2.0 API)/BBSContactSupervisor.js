/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
/**
 * @param {search} record
 */
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
    function pageInit(scriptContext) 
    {
    	setFieldMandatory(scriptContext);
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
    function fieldChanged(scriptContext) 
    {
    	if(scriptContext.fieldId == 'custentity_cbc_contact_login_type')
    		{
    			setFieldMandatory(scriptContext);
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

    function setFieldMandatory(scriptContext)
    {
    	var currentRec = scriptContext.currentRecord;
    	
    	var customer = currentRec.getValue({fieldId: 'company'});
    	var loginType = currentRec.getValue({fieldId: 'custentity_cbc_contact_login_type'});
    	
    	if(customer != null && customer != '' && loginType != null && loginType != '')
    		{
	    		var customrecord_bbs_cust_role_accessSearchObj = search.create({
	    			   type: "customrecord_bbs_cust_role_access",
	    			   filters:
	    			   [
	    			      ["custrecord_bbs_orders_authorised","is","T"], 
	    			      "AND", 
	    			      ["custrecord_bbs_customer","anyof",customer], 
	    			      "AND", 
	    			      ["custrecord_bbs_role","anyof",loginType]
	    			   ],
	    			   columns:
	    			   [
	    			      search.createColumn({name: "custrecord_bbs_customer", label: "Customer"}),
	    			      search.createColumn({name: "custrecord_bbs_role", label: "Role"})
	    			   ]
	    			});
	    		
	    			var searchResultCount = customrecord_bbs_cust_role_accessSearchObj.runPaged().count;
	    			
	    			var field = currentRec.getField({fieldId: 'custentity_cbc_contact_supervisor'});
    		    	
	    			if(searchResultCount > 0)
	    				{
		    				field.isMandatory = true;
	    				}
	    			else
	    				{
	    					field.isMandatory = false;
	    				}
    		}
    	else
    		{
    			currentRec.getField({fieldId: 'custentity_cbc_contact_supervisor'}).isMandatory = false;
    		}
    }
    
    
    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged
        //postSourcing: postSourcing
        //sublistChanged: sublistChanged,
        //lineInit: lineInit,
        //validateField: validateField,
        //validateLine: validateLine,
        //validateInsert: validateInsert,
        //validateDelete: validateDelete,
        //saveRecord: saveRecord
    };
    
});



