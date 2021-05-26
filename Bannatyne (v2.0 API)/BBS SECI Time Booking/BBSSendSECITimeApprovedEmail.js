/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/runtime', 'N/format', 'N/email'],
function(runtime, format, email) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
    	
    	// call function to retrieve script parameters
    	var scriptParameters = getScriptParameters();
    	
    	// get the current record
    	var currentRecord = scriptContext.newRecord;
    	
    	// start off the email body
    	var emailBody	 = 	'<img alt="" src="https://4537381-sb1.app.netsuite.com/core/media/media.nl?id=915&amp;c=4537381_SB1&amp;h=7a14b6798dff769d5845" style="width: 226px; height: 48px;" />';
    		emailBody	+=	'<br /><br />';
    		emailBody	+=	'The following time entries have been approved and will be paid in our next payment run.'
    		emailBody	+=	'<br /><br />';
    		emailBody	+=	'<table border="1" cellpadding="1" cellspacing="1">';
    		emailBody	+=	'<tr>';
    		emailBody 	+= 	'<td align="center"><b>Date</b></td>';
    		emailBody 	+= 	'<td align="center"><b>Class</b></td>';
    		emailBody 	+= 	'<td align="center"><b>Number of Hours</b></td>';
    		emailBody 	+= 	'<td align="center"><b>Hourly Rate</b></td>';
    		emailBody	+= 	'<td align="center"><b>Total</b></td>';
    		emailBody 	+= 	'</tr>';
    	
    	// get count of time entries
    	var timeEntryCount = currentRecord.getLineCount({
    		sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent'
    	});
    	
    	// loop through time entries
    	for (var i = 0; i < timeEntryCount; i++)
    		{
    			// add the time entry to the emailBody string
    			emailBody	+=	'<tr>';
    			emailBody	+=	'<td align="center">' + format.format({type: format.Type.DATE, value: currentRecord.getSublistValue({sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent', fieldId: 'custrecord_bbs_seci_time_entry_li_date', line: i})}) + '</td>';
    			emailBody	+=	'<td align="center">' + currentRecord.getSublistValue({sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent', fieldId: 'custrecord_bbs_seci_time_entry_li_class', line: i}) + '</td>';
    			emailBody	+=	'<td align="center">' + currentRecord.getSublistValue({sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent', fieldId: 'custrecord_bbs_seci_time_entry_li_length', line: i}) + '</td>';
    			emailBody	+=	'<td align="center">£' + currentRecord.getSublistValue({sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent', fieldId: 'custrecord_bbs_seci_time_entry_li_rate', line: i}).toFixed(2) + '</td>';
    			emailBody	+=	'<td align="center">£' + currentRecord.getSublistValue({sublistId: 'recmachcustrecord_bbs_seci_time_entry_li_parent', fieldId: 'custrecord_bbs_seci_time_entry_li_total', line: i}).toFixed(2) + '</td>';
    			emailBody 	+= 	'</tr>';
    		}
    	
    	// add closing tags to the emailBody string
    	emailBody 	+=	'</table>';
    	emailBody	+=	'<br />';
    	emailBody	+= 'With Thanks<br/>Bannatyne Fitness Ltd'
    	
    	try
    		{
    			// send the email to the SECI
    			email.send({
    				author: scriptParameters.emailSender,
    				recipients: currentRecord.getValue({fieldId: 'custrecord_bbs_seci_time_entry_supplier'}),
    				subject: 'Your Time Entries Have Been Approved',
    				body: emailBody,
    				relatedRecords: {
    					customrecord_bbs_seci_time_entry: currentRecord.id
    				}
    			});
    		}
    	catch(e)
    		{
	    		log.error({
	        		title: 'Error Sending Email',
	        		details: e.message
	        	});
    		}

    }
    
    // ======================================
    // FUNCTION TO RETRIEVE SCRIPT PARAMETERS
    // ======================================
    
    function getScriptParameters() {
    	
    	// retrieve script parameters
    	var currentScript = runtime.getCurrentScript();
    	
    	var emailSender = currentScript.getParameter({
    		name: 'custscript_bbs_seci_approval_wf_em_send'
    	});
    	
    	// return values to main script function
    	return {
    		emailSender: emailSender
    	}
    	
    }

    return {
        onAction : onAction
    };
    
});
