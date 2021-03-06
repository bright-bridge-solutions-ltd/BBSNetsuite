/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/ui/dialog'],
function(search, dialog) {
    
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
    	
    	// get the current record so it can be manipulated
		var currentRecord = scriptContext.currentRecord;
    	
    	// get the value of the 'PO Type' field
    	var poType = currentRecord.getValue({
    		fieldId: 'custbody_po_type'
    	});
    	
    	// if the 'Capex Type', 'PO Type' or 'Cost Centre' (Class) fields have been changed
    	if (scriptContext.fieldId == 'custbody_bbs_cap_type' || scriptContext.fieldId == 'custbody_po_type' || scriptContext.fieldId == 'class')
    		{
    			// get the value of fields from the current record
				var subsidiary = currentRecord.getValue({
					fieldId: 'subsidiary'
				});

    			var capexType = currentRecord.getValue({
    				fieldId: 'custbody_bbs_cap_type'
    			});
    		
    			var poType = currentRecord.getValue({
    				fieldId: 'custbody_po_type'
    			});
    			
    			var costCentre = currentRecord.getValue({
    				fieldId: 'class'
    			});
    			
    			// if the Capex Type is not empty and PO Type returns 1 (Capex)
    			if (capexType != '' && poType == 1)
    				{
    					// run search to find correct 'CAPEX Approval Routing Grid' record
				    	var routingSearch = search.create({
				    		type: 'customrecord_capex_app_rout_grid',
				    								
				    		columns: [{
				    			name: 'internalid'
				    		}],
				    								
				    		filters: [{
				    			name: 'custrecord_cap_linked_sub',
				    			operator: 'anyof',
				    			values: [subsidiary]
				    		},
				    				{
				    			name: 'custrecord_bbs_capex_type',
				    			operator: 'anyof',
				    			values: [capexType]
				    		}],
				    	});
				    							
				    	// run search and process search results
				    	routingSearch.run().each(function(result) {
				    								
				    		// get the internal ID of the 'CAPEX Approval Routing Grid' record from the search results
				    		var internalID = result.getValue({
				    			name: 'internalid'
				    		});
				    								
				    		// use the internalID variable to set the 'Capex Approval Matrix' field on the current record
				    		currentRecord.setValue({
				    			fieldId: 'custbody_bbs_cap_app_mat',
				    			value: internalID
				    		});
				    	});
    				}
    			// if the Cost Centre is not empty and PO Type returns 2 (Opex)
    			if (costCentre != '' && poType == 2)
    				{
    					// run search to find correct 'Opex Approval Routing Grid' record
			    		var routingSearch = search.create({
			    			type: 'customrecord_bbs_opex_app_matrix',
			    								
			    			columns: [{
			    				name: 'internalid'
			    			}],
			    								
			    			filters: [{
			    				name: 'custrecord_opex_linked_sub',
			    				operator: 'anyof',
			    				values: [subsidiary]
			    			},
			    					{
			    				name: 'custrecord_ope_cost_centre',
			    				operator: 'anyof',
			    				values: [costCentre]
			    			}],
			    		});
		    							
			    		// run search and process search results
			    		routingSearch.run().each(function(result) {
			    								
			    			// get the internal ID of the 'CAPEX Approval Routing Grid' record from the search results
			    			var internalID = result.getValue({
			    				name: 'internalid'
			    			});
			    								
			    			// use the internalID variable to set the 'Opex Approval Matrix' field on the current record
			    			currentRecord.setValue({
			    				fieldId: 'custbody_bbs_ope_app_mat',
			    				value: internalID
			    			});
			    		});
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
	    	
	    	// check we are dealing with the item sublist
			if (scriptContext.sublistId == 'item')
				{
					// get the current record object
					var currentRecord = scriptContext.currentRecord;
	    	
			    	// get the value of the 'description' field for the current line
			    	var description = currentRecord.getCurrentSublistValue({
			    		sublistId: 'item',
			    		fieldId: 'description'
			    	});
			    	
			    	// check if a description was entered by the user
			    	if (description)
			    		{
			    			// allow the line to be saved
			    			return true;
			    		}
			    	else // a description was NOT entered
			    		{
			    			// show an alert to the user
			    			dialog.alert({
			    				title: '⚠️ Please enter a description',
			    				message: 'The line cannot be saved as a description has not been entered.<br><br>Please enter a description and try again.'
			    			});
			
			    			// do not allow the line to be saved
			    			return false;
			    		}
				}
			else
				{
					// allow the line to be saved
					return true;
				}
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
        fieldChanged: fieldChanged,
        validateLine: validateLine
    };
    
});
