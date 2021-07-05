/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url'],
function(url) {
    
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
    	
    	if (scriptContext.fieldId == 'custpage_customer_select' || scriptContext.fieldId == 'custpage_brand_select')
    		{
    			// get the customer and brand select fields
    			var customer = scriptContext.currentRecord.getValue({
    				fieldId: 'custpage_customer_select'
    			});
    			
    			var brands = scriptContext.currentRecord.getValue({
    				fieldId: 'custpage_brand_select'
    			});
    			
    			// if the user has selected a customer and some brands
    			if (customer != '' && customer != null && brands != '' && brands != null)
    				{
    					// reload the Suitelet
						var suiteletURL = url.resolveScript({
						    scriptId: 'customscript_bbs_price_list_sl',
						    deploymentId: 'customdeploy_bbs_price_list_sl',
						    params: {
						    	customer: 	customer,
						    	brands:		brands.toString()
						    }
						});
					
						window.onbeforeunload = null;
						window.location.href = suiteletURL;
    				}
    		}
    	else if (scriptContext.fieldId == 'custpage_select_all_brands')
    		{
	    		// get the customer and select all fields
				var customer = scriptContext.currentRecord.getValue({
					fieldId: 'custpage_customer_select'
				});
				
				var selectAll = scriptContext.currentRecord.getValue({
					fieldId: 'custpage_select_all_brands'
				});
				
				if (selectAll == false)
					{
						// enable the brand select field
						scriptContext.currentRecord.getField({
						    fieldId: 'custpage_brand_select'
						}).isDiabled = false;
						
						// set the value of the select all field
						scriptContext.currentRecord.setValue({
						    fieldId: 'custpage_select_all_brands',
						    value: false
						});
					}
				else if (selectAll == true && customer != '' && customer != null)
					{
						// disable the brand select field
						scriptContext.currentRecord.getField({
						    fieldId: 'custpage_brand_select'
						}).isDiabled = true;
					
						// reload the Suitelet
						var suiteletURL = url.resolveScript({
						    scriptId: 'customscript_bbs_price_list_sl',
						    deploymentId: 'customdeploy_bbs_price_list_sl',
						    params: {
						    	customer: 	customer,
						    	selectall:	selectAll
						    }
						});
					
						window.onbeforeunload = null;
						window.location.href = suiteletURL;
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
        fieldChanged: fieldChanged
    };
    
});
