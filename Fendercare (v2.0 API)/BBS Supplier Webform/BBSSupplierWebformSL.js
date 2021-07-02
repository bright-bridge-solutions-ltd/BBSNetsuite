/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/record'],
function(ui, search, record) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	if (context.request.method == 'GET')
			{
				// retrieve parameters that have been passed to the Suitelet
				var supplierID 	= context.request.parameters.supplier;
			
				// create form that will be displayed to the user
				var form = ui.createForm({
	                title: 'Fendercare - Supplier Webform',
	                hideNavBar: true
	            });
				
				// set client script to run on the form
				//form.clientScriptFileId = ;
				
				// add field groups to the form
			 	form.addFieldGroup({
			 		id: 'header',
			 		label: 'Header'
			 	}).isBorderHidden = true;
			 		
	   		 	form.addFieldGroup({
		 			id: 'general',
		 			label: 'General'
		 		});
			 	
			 	// add a page logo field to the form
				form.addField({
				    id: 'custpage_page_logo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'Page Logo',
				    container: 'header'
				}).defaultValue = "<br/><img src='https://5181378-sb1.app.netsuite.com/core/media/media.nl?id=4302&amp;c=5181378_SB1&amp;h=QWBHl26ZYjuudlb0QkvwC9o_1XgVBEyhFDjL4-C2aHJ9UH5S' alt='Fendercare Logo' style='width: 250px; height: 50px;'>";
			
				// if we have been passed a supplier ID in the URL
				if (supplierID)
					{
						// call function to lookup fields on the supplier record
						var supplierInfo = getSupplierInfo(supplierID);
						
						// has the webform already been submitted?
						if (supplierInfo.webformSubmitted == true)
							{
								// add a help text field to the form
								form.addField({
								    id: 'custpage_help_text',
								    type: ui.FieldType.INLINEHTML,
								    label: 'Help Text',
								    container: 'header'
								}).defaultValue = '<br/><p><span style="font-size: 20px; font-weight: bold; color:#FF0000;">You may not submit the form as it has already been submitted previously.</span></p><p><span style="font-size: 20px; font-weight: bold; color:#FF0000;">Please contact Fendercare for further info.</span></p>';
							}
						else
							{
								// add fields to the form
								var supplier = form.addField({
									id: 'custpage_supplier_id',
								    type: ui.FieldType.TEXT,
								    label: 'Supplier ID',
								    container: 'general'
								});
								
								supplier.defaultValue = supplierID;
								
								supplier.updateDisplayType({
									displayType: ui.FieldDisplayType.HIDDEN
								});
								
								var companyName = form.addField({
									id: 'custpage_company_name',
								    type: ui.FieldType.TEXT,
								    label: 'Company Name',
								    container: 'general'
								});
								
								companyName.defaultValue = supplierInfo.companyName;
								
								companyName.updateDisplayType({
									displayType: ui.FieldDisplayType.INLINE
								});
								
								var phoneNumber = form.addField({
									id: 'custpage_phone_number',
								    type: ui.FieldType.PHONE,
								    label: 'Phone Number',
								    container: 'general'
								});
								
								phoneNumber.isMandatory = true;
								
								phoneNumber.updateBreakType({
									breakType: ui.FieldBreakType.STARTCOL
								});
								
								var emailAddress = form.addField({
									id: 'custpage_email_address',
								    type: ui.FieldType.EMAIL,
								    label: 'Email Address',
								    container: 'general'
								});
								
								emailAddress.isMandatory = true;
								
								// add submit button to the form
					    		form.addSubmitButton({
				   		 			label: 'Submit Form'
				   		 		});
							}
					}
				else
					{
						// add a help text field to the form
						form.addField({
						    id: 'custpage_help_text',
						    type: ui.FieldType.INLINEHTML,
						    label: 'Help Text',
						    container: 'header_fields'
						}).defaultValue = '<br/><p><span style="font-size: 20px; font-weight: bold; color:#FF0000;">You may not submit the form as a valid supplier ID has not been provided.</span></p><p><span style="font-size: 20px; font-weight: bold; color:#FF0000;">Please contact Fendercare for further info.</span></p>';
					}
				
				// write the response to the page
				context.response.writePage(form);
			}
    	else if (context.request.method == 'POST')
    		{
	    		// create form that will be displayed to the user
				var form = ui.createForm({
	                title: 'Fendercare - Supplier Webform',
	                hideNavBar: true
	            });
				
				// add fields to the form
				form.addField({
				    id: 'custpage_page_logo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'Page Logo',
				}).defaultValue = "<br/><img src='https://5181378-sb1.app.netsuite.com/core/media/media.nl?id=4302&amp;c=5181378_SB1&amp;h=QWBHl26ZYjuudlb0QkvwC9o_1XgVBEyhFDjL4-C2aHJ9UH5S' alt='Fendercare Logo' style='width: 250px; height: 50px;'>";
				
				form.addField({
				    id: 'custpage_help_text',
				    type: ui.FieldType.INLINEHTML,
				    label: 'Help Text',
				}).defaultValue = '<br/><p><span style="font-size:20px; color:#008000; font-weight: bold;">Thankyou, the form has been submitted successfully.</span></p><p><span style="font-size:20px; color:#008000; font-weight: bold;">You may now close the page.</span></p>';
    		
				try
					{
						// update fields on the supplier record
						record.submitFields({
							type: record.Type.VENDOR,
							id: context.request.parameters.custpage_supplier_id,
							values: {
								custentity_bbs_supp_webform_submitted:	true,
								phone:	context.request.parameters.custpage_phone_number,
								email:	context.request.parameters.custpage_email_address
							},
							ignoreMandatoryFields: true
						});
					}
				catch(e)
					{
						log.error({
							title: 'Error Updating Supplier ' + context.request.parameters.custpage_supplier_id,
							details: e.message
						});
					}
				
				// write the response to the page
				context.response.writePage(form);
    		}

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getSupplierInfo(supplierID) {
    	
    	// lookup fields on the supplier record
    	var supplierLookup = search.lookupFields({
    		type: search.Type.VENDOR,
    		id: supplierID,
    		columns: ['custentity_bbs_supp_webform_submitted', 'companyname']
    	});
    	
    	// return values to main script function
    	return {
    		webformSubmitted:	supplierLookup.custentity_bbs_supp_webform_submitted,
    		companyName:		supplierLookup.companyname
    	}
    	
    }

    return {
        onRequest: onRequest
    };
    
});
