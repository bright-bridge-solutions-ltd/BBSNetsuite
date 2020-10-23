/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/email'],
function(runtime, record, email) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	// declare and initialize variables
    	var recordUpdated = false;
    	
    	// retrieve parameters that were passed from the client script
    	var recordID = context.request.parameters.id;
    		recordID = parseInt(recordID); // use parseInt to convert to a number
    	
    	var rejectionReason = context.request.parameters.reason;
    	
    	try
    		{
		    	// load the Ad Hoc Site record
		    	var adHocSiteRecord = record.load({
		    		type: 'customrecord_bbs_ad_hoc_site',
		    		id: recordID,
		    		isDynamic: true
		    	});
		    	
		    	// retrieve values from the ad hoc site record
		    	var requestedByID = adHocSiteRecord.getValue({
		    		fieldId: 'custrecord_bbs_ad_hoc_site_requested_by'
		    	});
		    	
		    	var requestedByName = adHocSiteRecord.getText({
		    		fieldId: 'custrecord_bbs_ad_hoc_site_requested_by'
		    	});
		    	
		    	var siteName = adHocSiteRecord.getValue({
		    		fieldId: 'name'
		    	});
		    	
		    	// get the current user
		    	var currentUserID = runtime.getCurrentUser().id;
		    	var currentUserName = runtime.getCurrentUser().name;
		    	
		    	// set fields on the ad hoc site record
		    	adHocSiteRecord.setValue({
		    		fieldId: 'custrecord_bbs_ad_hoc_site_app_status',
		    		value: 3 // 3 = Rejected
		    	})
		    	
		    	adHocSiteRecord.setValue({
		    		fieldId: 'custrecord_bbs_ad_hoc_site_rejected_by',
		    		value: currentUserID
		    	});
		    	
		    	adHocSiteRecord.setValue({
		    		fieldId: 'custrecord_bbs_ad_hoc_site_reject_reason',
		    		value: rejectionReason
		    	});
		    	
		    	// save the ad hoc site record
		    	adHocSiteRecord.save({
		    		ignoreMandatoryFields: true
		    	});
    			
    			log.audit({
    				title: 'Ad Hoc Site Record Updated',
    				details: recordID
    			});
    			
    			// set recordUpdated variable to true
    			recordUpdated = true;
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Ad Hoc Site Record',
    				details: 'Record ID: ' + recordID + '<br>Error: ' + e
    			});
    		}
    	
    	// check that the recordUpdated variable is true
    	if (recordUpdated == true)
    		{
	    		// define email subject and body
	        	var emailSubject = 'Ad Hoc Site Record (' + siteName + ') Has Been Rejected';
	        	
	        	var emailBody = 'Dear ' + requestedByName;
	        	emailBody += '<br /><br />';
	        	emailBody += 'Your Ad Hoc Site record ' + siteName + ' has been rejected by ' + currentUserName + '.'
	        	emailBody += '<br /><br />';
	        	emailBody += '<b>Rejection Reason: </b>' + rejectionReason;
	        	emailBody += '<br /><br />';
	        	emailBody += 'Please make the necessary changes and resubmit for approval.'
	        	emailBody += '<br /><br />';	
	        	emailBody += '<font size="1">this alert has been generated by the script &#39;BBS Ad Hoc Rejection SL&#39;</font>';
	        	
	        	try
	        		{
	    	    		// send rejection email to the employee
	    	        	email.send({
	    	        		author: currentUserID,
	    	        		recipients: requestedByID,
	    	        		subject: emailSubject,
	    	        		body: emailBody,
	    	        		relatedRecords: {
	    	        			customRecord: {
	    	        				id: recordID,
	    	        				recordType: 829 // 829 = Ad Hoc Site
	    	        			}
	    	        		}
	    	        	});
	        		}
	        	catch(e)
	        		{
	    	    		log.error({
	    					title: 'Error Sending Email',
	    					details: 'PO Record ID: ' + recordID + '<br>Error: ' + e
	    				});
	        		}
    		}

    }

    return {
        onRequest: onRequest
    };
    
});
