/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/config', 'N/ui/serverWidget', 'N/ui/message', 'N/task', 'N/redirect'],
function(runtime, config, ui, message, task, redirect) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	var request = context.request;
    	
    	// get the ID of the current user
    	var currentUser = runtime.getCurrentUser().id;
    	
    	if (context.request.method === 'GET')
			{
    			// create form
				var form = ui.createForm({
	                title: 'Schedule Billing Process',
	                hideNavBar: true
	            });
				
				// retrieve parameters that have been passed to the Suitelet
				var billingType = request.parameters.billingtype;
				
				// set client script to run on the form
				form.clientScriptFileId = '55078';
				
				// check if the mapReduceTaskID variable contains a value
				if (billingType)
					{
						// add a message to the top of the page
						form.addPageInitMessage({
				            type: message.Type.CONFIRMATION,
				            title: 'Billing Process Scheduled',
				            message: 'The billing process for ' + billingType + ' contracts has been scheduled.<br><br>You may now close this page, or select another billing type to bill additional orders.<br><br>Click <a href="https://5554661-sb1.app.netsuite.com/app/common/scripting/mapreducescriptstatus.nl?daterange=TODAY" target="_blank">here</a> to view the map/reduce script status page (this will open in a new tab/window)'
				        });
					}
				
				// add logo inline HTML field to the form
				var pageLogo = form.addField({
				    id: 'pagelogo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'HTML Image'
				});
				
				// set default value of the pageLogo field
				pageLogo.defaultValue = "<img src='https://5554661-sb1.app.netsuite.com/core/media/media.nl?id=9544&c=5554661_SB1&h=3c1a74753ea9e8671a1c' alt='Onfido Logo' style='width: 250px; height: 102px;'>";
				
				// add help inline HTML field to the form
				var helpText = form.addField({
					id: 'helptext',
					type: ui.FieldType.INLINEHTML,
					label: 'Help Text'
				});
				
				// set default value of the helpText field
				helpText.defaultValue = "<p><span style='font-size:20px;'><span style='font-family:arial,helvetica,sans-serif;'>Select a billing type and click &#39;Submit&#39; to schedule the billing process.</span></span></p>";
				
				helpText.updateBreakType({
				    breakType : ui.FieldBreakType.STARTCOL
				});
				
				// add a field to the form to select a billing type
				var billingTypeSelect = form.addField({
					id: 'billingtypeselect',
					type: ui.FieldType.SELECT,
					source: 'customlist_bbs_contract_billing_type',
					label: 'Please Select a Billing Type'
				});
				
				// set the billingTypeSelect field to be mandatory
				billingTypeSelect.isMandatory = true;
				
				// add submit button to the form
   		 		form.addSubmitButton({
   		 			label : 'Submit'
   		 		});
   		 		
   		 		// add cancel button to the form
   		 		form.addButton({
   		 			id: 'custpage_cancel_button',
   		 			label: 'Close Page',
   		 			functionName: 'cancelButton()'
   		 		});
   		 		
   		 		// add a button to the form to schedule creation of QMP invoices
   		 		form.addButton({
   		 			id: 'custpage_create_qmp_invoices',
   		 			label: 'Create QMP Invoices',
   		 			functionName: 'createQMPInvoices()'
   		 		});
   		 		
   		 		// add a button to the form to create consolidated invoices
   		 		form.addButton({
   		 			id: 'custpage_create_consolidated_invoices',
   		 			label: 'Create Consolidated Invoices',
   		 			functionName: 'createConsolidatedInvoices()'
   		 		});
				
				// write the response to the page
				context.response.writePage(form);

			}
    	else if (context.request.method === 'POST')
			{
    			// call updateCompanyPreferences function
    			updateCompanyPreferences();
    		
    			// get the value of the billing type select field
    			var billingType = request.parameters.billingtypeselect;
    			
    			// get the text value of the billing type select field
    			var billingTypeText = request.parameters.inpt_billingtypeselect;
    			
    			// check if the billingType is 1 (PAYG)
    			if (billingType == '1')
    				{
	    				// =================================================================
	    		    	// SCHEDULE MAP/REDUCE SCRIPT TO BILL SALES ORDERS/RECOGNISE REVENUE
	    		    	// =================================================================
	    		    	
	    		    	// create a map/reduce task
	    		    	var mapReduceTask = task.create({
	    		    	    taskType: task.TaskType.MAP_REDUCE,
	    		    	    scriptId: 'customscript_bbs_billing_map_reduce',
	    		    	    deploymentId: 'customdeploy_bbs_billing_map_reduce',
	    		    	    params: {
	        	    	    	custscript_bbs_billing_type_select: billingType,
	        	    	    	custscript_bbs_billing_type_select_text: billingTypeText,
	        	    	    	custscript_bbs_billing_email_emp_alert: currentUser
	        	    	    }
	    		    	});
	    		    	
	    		    	// submit the map/reduce task
	    		    	var mapReduceTaskID = mapReduceTask.submit();
	    		    	
	    		    	log.audit({
	    		    		title: 'Script scheduled',
	    		    		details: 'BBS Billing Map/Reduce script has been scheduled. Job ID ' + mapReduceTaskID
	    		    	});
    				}
    			else // billingType array is NOT 1 (PAYG)
    				{
	    				// ======================================================================
	        	    	// SCHEDULE MAP/REDUCE SCRIPT TO CREATE SALES ORDERS FOR ZERO VALUE USAGE
	        	    	// ======================================================================
	        	    	
	        	    	// create a map/reduce task
	        	    	var mapReduceTask = task.create({
	        	    	    taskType: task.TaskType.MAP_REDUCE,
	        	    	    scriptId: 'customscript_bbs_process_zero_usage_mr',
	        	    	    deploymentId: 'customdeploy_bbs_process_zero_usage_mr',
	        	    	    params: {
	        	    	    	custscript_bbs_billing_type_select: billingType,
	        	    	    	custscript_bbs_billing_type_select_text: billingTypeText,
	        	    	    	custscript_bbs_billing_email_emp_alert: currentUser
	        	    	    }
	        	    	});
	        	    	
	        	    	// submit the map/reduce task
	        	    	var mapReduceTaskID = mapReduceTask.submit();
	        	    	
	        	    	log.audit({
	        	    		title: 'Script scheduled',
	        	    		details: 'BBS Process Zero Usage Map/Reduce script has been scheduled. Job ID ' + mapReduceTaskID
	        	    	});
    				}
    			
    			// redirect user to landing page
				redirect.redirect({
				    url: '/app/site/hosting/scriptlet.nl?script=643&deploy=1',
				    parameters: {
					   billingtype: billingTypeText
				    }
				});
			}

    }
    
    //=======================================
	// FUNCTION TO UPDATE COMPANY PREFERENCES
	//=======================================
    
    function updateCompanyPreferences()
	    {
	    	// load the company preferences
	    	var companyPreferences = config.load({
	            type: config.Type.COMPANY_PREFERENCES
	        });
	    	
	    	// get the value of the 'Billing Process Complete' checkbox
	    	var billingComplete = companyPreferences.getValue({
	    		fieldId: 'custscript_bbs_billing_process_complete'
	    	});
	    	
	    	// check if the billingComplete variable returns true (IE checkbox is ticked)
	    	if (billingComplete == true)
	    		{
	    			// unset the 'Billing Process Complete' checkbox
	    			companyPreferences.setValue({
	    				fieldId: 'custscript_bbs_billing_process_complete',
	    				value: false
	    			});
	    	
	    			// save the company preferences
	    			companyPreferences.save();
	    		}
	    }

    return {
        onRequest: onRequest
    };
    
});
