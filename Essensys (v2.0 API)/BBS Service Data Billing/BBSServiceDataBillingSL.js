/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/ui/message', 'N/task', 'N/url', 'N/redirect', 'N/runtime'],

function(ui, message, task, url, redirect, runtime) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	// on GET
    	if (context.request.method === 'GET')
			{
	    		// create form
				var form = ui.createForm({
	                title: 'Schedule Connect Billing',
	                hideNavBar: false
	            });
				
				// set client script to run on the form
				form.clientScriptFileId = 24331;
				
				// retrieve parameters that have been passed to the Suitelet
				var subsidiary = context.request.parameters.subsidiary;
				
				// check if the subsidiary variable contains a value
				if (subsidiary)
					{
						// display a message at the top of the page
						form.addPageInitMessage({
				            type: message.Type.CONFIRMATION,
				            title: 'Billing Process Scheduled',
				            message: 'The billing process for ' + subsidiary + ' has been scheduled.<br><br>You may now close this page, or select another subsidiary to create additional invoices.<br><br>Click <a href="https://5423837.app.netsuite.com/app/common/scripting/mapreducescriptstatus.nl?daterange=TODAY" target="_blank">here</a> to view the map/reduce script status page (this will open in a new tab/window)'
				        });
					}
				
				// add logo inline HTML field to the form
				var pageLogo = form.addField({
				    id: 'pagelogo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'HTML Image'
				});
				
				// set default value of the pageLogo field
				pageLogo.defaultValue = "<br><img src='https://5423837-sb1.app.netsuite.com/core/media/media.nl?id=2851&c=5423837_SB1&h=263dbead5b271f496136' alt='essensys Logo' style='width: 175px; height: 50px;'>";
				
				// add help inline HTML field to the form
				var helpText = form.addField({
					id: 'helptext',
					type: ui.FieldType.INLINEHTML,
					label: 'Help Text'
				});
				
				// set default value of the helpText field
				helpText.defaultValue = "<p><span style='font-size:20px;'><span style='font-family:arial,helvetica,sans-serif;'>Select a subsidiary and click &#39;Submit&#39; to schedule the billing process.</span></span></p>";
				
				helpText.updateBreakType({
				    breakType : ui.FieldBreakType.STARTCOL
				});
				
				// add a field to the form to select a subsidiary
				form.addField({
					id: 'subsidiaryselect',
					type: ui.FieldType.SELECT,
					source: 'subsidiary',
					label: 'Please Select a Subsidiary'
				}).isMandatory = true;
				
				// add submit button to the form
   		 		form.addSubmitButton({
   		 			label : 'Submit'
   		 		});
   		 		
   		 		// add button to the form to call 'Email Invoices' Suitelet
   		 		form.addButton({
   		 			id: 'emailinvoices',
   		 			label: 'Email Invoices',
   		 			functionName: 'emailInvoices()'
   		 		});
   		 		
   		 		// add button to the form to call 'Connect Sync' Suitelet
   		 		form.addButton({
   		 			id: 'connectfilesync',
   		 			label: 'Connect File Sync',
   		 			functionName: 'connectFileSync()'
   		 		});
   		 		
   		 		// add button to the form to call 'Create Combined Reports' Map/Reduce
   		 		form.addButton({
   		 			id: 'createcombinedreports',
   		 			label: 'Create Combined Reports',
   		 			functionName: 'createCombinedReports()'
   		 		});
   		 		
   		 		// write the response to the page
				context.response.writePage(form);
			}
    	else if (context.request.method === 'POST') // on POST
    		{
	    		// get the value of the subsidiary select field
				var subsidiary = context.request.parameters.subsidiaryselect;
				
				// get the text value of the subsidiary select field
    			var subsidiaryText = context.request.parameters.inpt_subsidiaryselect;
    			
    			// get the internal ID of the current user
    			var currentUser = runtime.getCurrentUser().id;
				
				// =====================================================
		    	// SCHEDULE MAP/REDUCE SCRIPT TO CREATE ARREARS INVOICES
		    	// =====================================================
		    	
		    	// create a map/reduce task
		    	var mapReduceTask = task.create({
		    	    taskType: task.TaskType.MAP_REDUCE,
		    	    scriptId: 'customscript_bbs_service_data_billing_mr',
		    	    deploymentId: 'customdeploy_bbs_service_data_billing_mr',
		    	    params: {
    	    	    	custscript_bbs_subsidiary_select: subsidiary,
    	    	    	custscript_bbs_subsidiary_text: subsidiaryText,
    	    	    	custscript_bbs_service_data_billing_user: currentUser
    	    	    }
		    	});
		    	
		    	// submit the map/reduce task
		    	var mapReduceTaskID = mapReduceTask.submit();
		    	
		    	log.audit({
		    		title: 'Script Scheduled',
		    		details: 'BBS Service Data Billing Map/Reduce script has been scheduled.<br>Subsidiary: ' + subsidiary + '<br>Job ID ' + mapReduceTaskID
		    	});
		    	
		    	// get the URL of the Suitelet
		    	var suiteletURL = url.resolveScript({
		    		scriptId: 'customscript_bbs_service_data_billing_sl',
		    		deploymentId: 'customdeploy_bbs_service_data_billing_sl',
		    		params: {
		    			subsidiary: subsidiaryText
		    		}
		    	});
		    	
		    	// redirect user back to the Suitelet
				redirect.redirect({
				    url: suiteletURL
				});	
				
    		}

    }

    return {
        onRequest: onRequest
    };
    
});
