/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/config', 'N/task'],

function(config, task) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	// load the company preferences
    	var companyPreferences = config.load({
            type: config.Type.COMPANY_PREFERENCES
        });
    	
    	// get the 'Billing Process Complete' value of the checkbox
    	var billingComplete = companyPreferences.getValue({
    		fieldId: 'custscript_bbs_billing_process_complete',
    	});
    	
    	// if billingComplete is false
    	if (billingComplete == false)
    		{
    			// return false to the client script
    			context.response.write('false');
    		}
    	// if billingComplete is true
    	else if (billingComplete == true)
    		{
	    		// ===========================================================
		    	// SCHEDULE ADDITIONAL SCHEDULED SCRIPT TO CREATE QMP INVOICES
		    	// ===========================================================
		    	
		    	// create a scheduled task
		    	var scheduledTask = task.create({
		    	    taskType: task.TaskType.SCHEDULED_SCRIPT,
		    	    scriptId: 'customscript_bbs_create_qmp_invoices',
		    	    deploymentId: 'customdeploy_bbs_create_qmp_invoices'
		    	});
		    	
		    	// submit the scheduled task
		    	var scheduledTaskID = scheduledTask.submit();
		    	
		    	log.audit({
		    		title: 'Script Scheduled',
		    		details: 'Create QMP Invoices script has been scheduled. Job ID ' + scheduledTaskID
		    	});
		    	
		    	// return true to the client script
    			context.response.write('true');		    	
    		}

    }

    return {
        onRequest: onRequest
    };
    
});
