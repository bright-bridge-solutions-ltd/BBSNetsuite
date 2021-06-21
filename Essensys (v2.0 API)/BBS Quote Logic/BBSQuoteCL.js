/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/dialog', 'N/url', 'N/search', 'N/runtime'],
function(dialog, url, search, runtime) {
    
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
    	
    	// check which field has been edited
    	if (scriptContext.fieldId == 'billingschedule' || scriptContext.fieldId == 'rate')
    		{
    			// tick the 'Non Standard Order' checkbox
    			scriptContext.currentRecord.setValue({
    				fieldId: 'custbody_bbs_non_standard_order',
    				value: true
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
    	
    	// retrieve script parameters
    	var ancillaryOrderLimit = runtime.getCurrentScript().getParameter({
    		name: 'custscript_bbs_ancillary_order_limit'
    	});
    	
    	// get the product type and order total
    	var productType = scriptContext.currentRecord.getValue({
    		fieldId: 'custbody_bbs_order_type'
    	});
    	
    	var orderTotal = scriptContext.currentRecord.getValue({
    		fieldId: 'total'
    	});
    	
    	// if productType = 4 (Ancillary) and orderTotal > ancillaryOrderLimit
    	if (productType == 4 && orderTotal > ancillaryOrderLimit)
    		{
    			// display a warning and don't let the user save the record
    			dialog.alert({
    				title: '⚠️ Error',
    				message: 'The estimate cannot be saved as the total is greater than the allowable amount for ancillary orders.<br><br>Please ensure the total is less than ' + ancillaryOrderLimit.toFixed(2) + ' or change the product type before saving the estimate'
    			});
    		}
    	else
    		{
    			// allow the record to be saved
    			return true;
    		}
    	
    }
    
    function reject(recordID) {
    	
    	// display dialog asking the user to enter a rejection reason
    	Ext.Msg.prompt('Reject', 'Please enter a reason for rejecting the Estimate/Quote', function(btn, text) {
    	    
    		// check if the user clicked the OK button
    		if (btn == 'ok')
    			{
	    	        // check if the user entered a rejection reason
    				if (text)
    					{
    						// define URL of Suitelet
    						var suiteletURL = url.resolveScript({
    							scriptId: 'customscript_bbs_quote_rejection_sl',
    							deploymentId: 'customdeploy_bbs_quote_rejection_sl',
    							params: {
    								'id': recordID,
    								'reason': text
    							}
    						});
    						
    						Ext.Ajax.timeout = (60000*5);
    						
    						var myMask = new Ext.LoadMask(Ext.getBody(), {msg:'<span style="font-size: 10pt;">The Estimate is being rejected<br><br>Please Wait...</span>'});
    						myMask.show();
    						
    						// call a backend Suitelet to update the PO with the rejection reason
    						Ext.Ajax.request({
    											url: suiteletURL,
    											method: 'GET',
    											success: function (response, result) {
    												myMask.hide();
    												location.reload();
    											},
    											failure: function (response, result) {
    												myMask.hide();
    												alert("Error Rejecting the Estimate");
    											}
    										});
    					}
    				else // user clicked ok but did not enter a rejection reason
    					{
    						// display an alert to the user asking them to try again
    						dialog.alert({
    							title: '⚠️ Error',
    							message: 'A rejection reason was not entered. Please click the Reject button and try again.'
    						});
    					}
	    	    }
    	});
    	
    }
    
    function transformToSalesOrder(recordID, orderType, productType, customerID, project) {
    	
    	console.log(arguments);
    	
    	// get the primary signer from the customer record
    	var primarySigner = search.lookupFields({
    		type: search.Type.CUSTOMER,
    		id: customerID,
    		columns: ['custentity_bbs_hellosign_primary_email']
    	}).custentity_bbs_hellosign_primary_email;
    	
    	console.log(primarySigner);
    	
    	// if we do NOT have a primary signer on the customer
    	if (!primarySigner)
    		{
    			// display an alert to the user
    			dialog.alert({
    				title: '⚠️ Error',
    				message: 'You may not convert this estimate to sales order as there is no authorised signer on the customer.<br><br>Please ensure an authorised signer has been selected on the customer before converting the estimate to a sales order.<br><br><a href="https://essensysuk.sharepoint.com/sites/businessoperations/SitePages/NS-Create-Customer,-Contact,-Site-&-Sales-Order-records.aspx" target="_blank">https://essensysuk.sharepoint.com/sites/businessoperations/SitePages/NS-Create-Customer,-Contact,-Site-&-Sales-Order-records.aspx</a>'
    			});
    		}
    	// if productType is Connect (1), Operate (2) or Onboarding(3), orderType is NOT Renewal (6) and a project has NOT been selected on the quote
    	else if ((productType == 1 || productType == 2 || productType == 3) && orderType != 6 && !project)
    		{
	    		// display an alert to the user
				dialog.alert({
					title: '⚠️ Error',
					message: 'A Project needs to be assigned to this record before it can be approved, prior to converting into a Sales Order.<br><br><a href="https://essensysuk.sharepoint.com/sites/businessoperations/SitePages/NS-Create-Customer,-Contact,-Site-&-Sales-Order-records.aspx" target="_blank">https://essensysuk.sharepoint.com/sites/businessoperations/SitePages/NS-Create-Customer,-Contact,-Site-&-Sales-Order-records.aspx</a>'
				});
    		}
    	else
    		{
    			// define URL of Suitelet
				var suiteletURL = url.resolveScript({
					scriptId: 'customscript_bbs_transform_quote_sl',
					deploymentId: 'customdeploy_bbs_transform_quote_sl',
					params: {
						'id': recordID
					}
				});
				
				Ext.Ajax.timeout = (60000*5);
				
				var myMask = new Ext.LoadMask(Ext.getBody(), {msg:'<span style="font-size: 10pt;">The Estimate is being transformed into a Sales Order<br><br>Please Wait...</span>'});
				myMask.show();
				
				// call a backend Suitelet to transform the quote into a sales order
				Ext.Ajax.request({
									url: suiteletURL,
									method: 'GET',
									success: function (response, result) {
										myMask.hide();
										location.reload();
									},
									failure: function (response, result) {
										myMask.hide();
										alert("Error Transforming the Estimate");
									}
								});
    		}
    	
    }

    return {
        fieldChanged: fieldChanged,
        saveRecord: saveRecord,
        reject: reject,
        transformToSalesOrder: transformToSalesOrder
    };
    
});
