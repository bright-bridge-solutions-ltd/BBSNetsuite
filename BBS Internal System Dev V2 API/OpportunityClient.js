/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],
function() {
    
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
    	
    	log.debug({
    		title: 'Script Check',
    		details:
    	});
    	
    	// check if the Subscription Margin OR Services Margin OR Support Margin fields have been changed
    	if (scriptContext.fieldId == 'custbody_bbs_subscription_margin' || scriptContext.fieldId == 'custbody_bbs_sservices_margin' || scriptContext.fieldId == 'custbody_bbs_support_margin')
    		{
    			// get the current record
    			var currentRecord = scriptContext.currentRecord;
    			
    			// retrieve values from the record
    			var subscriptionMargin = currentRecord.getValue({
    				fieldId: 'custbody_bbs_subscription_margin'
    			});
    			
    			var servicesMargin = currentRecord.getValue({
    				fieldId: 'custbody_bbs_sservices_margin'
    			});
    			
    			var supportMargin = currentRecord.getValue({
    				fieldId: 'custbody_bbs_support_margin'
    			});
    			
    			// if subscriptionMargin contains a value
    			if (subscriptionMargin)
    				{
    					// use parseFloat to convert to number
    					subscriptionMargin = parseFloat(subscriptionMargin);
    				}
    			else
    				{
    					// set subscriptionMargin to 0
    					subscriptionMargin = 0;
    				}
    			
    			// if servicesMargin contains a value
    			if (servicesMargin)
    				{
    					// use parseFloat to convert to number
    					servicesMargin = parseFloat(servicesMargin);
    				}
    			else
    				{
    					// set servicesMargin to 0
    					servicesMargin = 0;
    				}
    			
    			// if supportMargin contains a value
    			if (supportMargin)
    				{
    					// use parseFloat to convert to number
    					supportMargin = parseFloat(supportMargin);
    				}
    			else
    				{
    					// set supportMargin to 0
    					supportMargin = 0;
    				}
    			
    			// add margins together to calculate margin total
    			var marginTotal = subscriptionMargin + servicesMargin + supportMargin;
    			
    			// update the Projected Total field on the record
    			currentRecord.getValue({
    				fieldId: 'projectedtotal',
    				value: marginTotal
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

    }

    return {
        fieldChanged: fieldChanged
    };
    
});
