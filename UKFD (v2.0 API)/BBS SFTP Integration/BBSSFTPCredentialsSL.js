/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/http', 'N/search', 'N/record', 'N/redirect'],
/**
 * @param {ui} ui
 * @param {serverWidget} serverWidget
 */
function(ui, http, search, record, redirect) 
{
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	if (context.request.method == http.Method.GET) 
	    	{
    			// retrieve parameters that have been passed to the script
    			var selectedSupplier = context.request.parameters.supplier;
    			
    			// create form which will be displayed to the user
    			var form = ui.createForm({
    				title: 'SFTP Site Credentials'
    			});
    			
    			// set client script to run on the form
    			form.clientScriptFileId = 10932351;
    			
    			// add a field to the form to select the supplier
    			var supplierSelect = form.addField({
    				type: ui.FieldType.SELECT,
    				id: 'supplierselect',
    				label: 'Supplier Select'
    			});
    			
    			// add a default select option
    			supplierSelect.addSelectOption({
    				value: 0,
    				text: '- Select -'
    			});
    			
    			// run search to find SFTP detail records
    			search.create({
    				type: 'customrecord_bbs_sftp',
    				
    				filters: [{
    					name: 'isinactive',
    					operator: search.Operator.IS,
    					values: ['F']
    				}],
    				
    				columns: [{
    					name: 'custrecord_bbs_sftp_supplier'
    				}],
    				
    			}).run().each(function(result){
    				
    				// get the supplier ID and name
    				var supplierID = result.getValue({
    					name: 'custrecord_bbs_sftp_supplier'
    				});
    				
    				var supplierName = result.getText({
    					name: 'custrecord_bbs_sftp_supplier'
    				});
    				
    				// add a select option for the supplier
    				supplierSelect.addSelectOption({
    					value: supplierID,
    					text: supplierName
    				});
    				
    				// continue processing search results
    				return true;
    				
    			});
    			
    			// if a supplier has been selected by the user
    			if (selectedSupplier && selectedSupplier != 0)
    				{
    					// declare and initialize variables
    					var endpoint = null;
    				
    					// set the supplier select field
    					supplierSelect.defaultValue = selectedSupplier;
    				
    					// add additional fields to the form
    					var endpointField = form.addField({
    						type: ui.FieldType.TEXT,
    						id: 'endpoint',
    						label: 'Endpoint'
    					});
    					
    					var recordIDField = form.addField({
    						type: ui.FieldType.INTEGER,
    						id: 'recordid',
    						label: 'Record ID'
    					});
    					
    					// update field break/display types
    					endpointField.updateBreakType({
    					    breakType: ui.FieldBreakType.STARTCOL
    					});
    					
    					endpointField.updateDisplayType({
    						displayType: ui.FieldDisplayType.INLINE
    					});
    					
    					recordIDField.updateDisplayType({
    						displayType: ui.FieldDisplayType.INLINE
    					});
    					
    					// get the SFTP details for the selected supplier
    					search.create({
    						type: 'customrecord_bbs_sftp',
    				
		    				filters: [{
		    					name: 'isinactive',
		    					operator: search.Operator.IS,
		    					values: ['F']
		    				},
		    						{
		    					name: 'custrecord_bbs_sftp_supplier',
		    					operator: search.Operator.ANYOF,
		    					values: [selectedSupplier]
		    				}],
		    				
		    				columns: [{
		    					name: 'custrecord_bbs_sftp_endpoint'
		    				}],
		    				
    					}).run().each(function(result){
    						
    						// get the endpoint from the search result
    						endpoint = result.getValue({
    							name: 'custrecord_bbs_sftp_endpoint'
    						});
    						
    						// set the endpoint/record ID fields from the search result
    						endpointField.defaultValue = endpoint;
    						recordIDField.defaultValue = result.id;
    						
    					});
    					
    					// add a credential field to the form
    					form.addCredentialField({
    					    id: 					'sftppassword',
    					    label: 					'SFTP Password',
    					    restrictToDomains: 		endpoint,
    					    restrictToScriptIds: 	['customscript_bbs_sftp_purchase_order', 'customscript_bbs_sftp_process_order_ack', 'customscript_bbs_sftp_process_stock_file'],
    					    restrictToCurrentUser: 	false
    					}).setMandatory = true;
    					
    					// add a submit button
    		            form.addSubmitButton({
    		            	label: 'Save & Update Password'
    		            });
    					
    				}
	            
	            // return the form to the user
	            context.response.writePage(form);
	    	}
    	else
	    	{
	    		// get the password and record ID
    			var sftpPassword 	= context.request.parameters['sftppassword'];
    			var recordID 		= context.request.parameters['recordid'];
    			
    			try
    				{
    					// update fields on the supplier SFTP details record
    					record.submitFields({
    						type: 'customrecord_bbs_sftp',
    						id: recordID,
    						values: {
    							custrecord_bbs_sftp_password:	sftpPassword
    						},
    						options: {
    							ignoreMandatoryFields:	true
							}
    					});
    					
    					log.audit({
    						title: 'Supplier SFTP Details Record Updated',
    						details: recordID
    					});
    				}
    			catch(e)
    				{
    					log.error({
    						title: 'Error Updating Supplier SFTP Details Record',
    						details: 'Record ID: ' + recordID + '<br>Error: ' + e
    					});
    				}

	    		// redirect the user to the home page
    			redirect.toTaskLink({
    				id:	'CARD_-29'
    			});
	    	}
    }
    
    return {
        onRequest: onRequest
    };
    
});
