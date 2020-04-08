/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/email', 'N/render', 'N/record'],
function(runtime, search, email, render, record) {
   
    // retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	invoices = currentScript.getParameter({
		name: 'custscript_bbs_invoice_array'
	});
	
	emailTemplate = currentScript.getParameter({
		name: 'custscript_bbs_invoice_email_template'
	});
	
	/**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
    	
    	log.audit({
    		title: '*** BEGINNING OF SCRIPT ***'
    	});
    	
    	// replace characters in the string
    	invoices = invoices.replace('[', '');
    	invoices = invoices.replace(/"/g, ''); // replace ALL instances
    	invoices = invoices.replace(']', '');

    	// return array containing invoice IDs
    	return invoices.split(',');

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// get the invoice ID
    	var invoiceID = parseInt(context.value);
    	
    	log.audit({
    		title: 'Processing Invoice ID',
    		details: invoiceID
    	});
    	
    	// call function to return the customer's email address. Pass invoiceID
    	var customerEmail = getCustomerEmail(invoiceID);
    	
    	// call function to send the email. Pass invoiceID and customerEmail
    	var emailSent = sendEmail(invoiceID, customerEmail);
    	
    	// check emailSent returns true
    	if (emailSent == true)
    		{
		    	// call function to update the invoice
		    	updateInvoiceRecord(invoiceID);
    		}

    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {

    }
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function getCustomerEmail(invoiceID)
    	{
    		// lookup fields on the invoice record
    		var invoiceLookup = search.lookupFields({
    			type: search.Type.INVOICE,
    			id: invoiceID,
    			columns: ['.entity']
    		});
    		
    		// get the customer ID from the invoiceLookup object
    		var customerID = invoiceLookup.entity[0].value;
    		
    		// lookup fields on the customer record
    		var customerLookup = search.lookupFields({
    			type: search.Type.CUSTOMER,
    			id: customerID,
    			columns: ['email']
    		});
    		
    		return customerLookup.email;   
    	}
    
    function sendEmail(invoiceID, customerEmail)
    	{
    		try
    			{
    				// create an email merger
					var mergeResult = render.mergeEmail({
						templateId: emailTemplate,
						transactionId: invoiceID
					});
					
					// get the subject and body of the email merger
					var emailSubject = mergeResult.subject;
					var emailBody = mergeResult.body;
					
					// get the invoice PDF
					var invoicePDF = render.transaction({
					    entityId: invoiceID,
					    printMode: render.PrintMode.PDF,
					    inCustLocale: true
					});
    			
					// send an email to the customer
    				email.send({
    					author: 3, // 3 = BrightBridge Solutions
    					recipients: customerEmail,
    					subject: emailSubject,
    					body: emailBody,
    					attachments: [invoicePDF],
    					relatedRecords: {
    						transactionId: invoiceID
    					}
    				});
    				
    				log.audit({
    					title: 'Email Sent',
    					details: 'Invoice ID: ' + invoiceID
    				});
    				
    				return true;
    			}
    		catch(e)
    			{
    				log.error({
    					title: 'Unable to Send Email',
    					details: 'Invoice ID: ' + invoiceID + '<br>Error: ' + e
    				});
    				
    				return false;
    			}
    	}
    
    function updateInvoiceRecord(invoiceID)
    	{
    		try
	    		{
	    			record.submitFields({
	    				type: record.Type.INVOICE,
	    				id: invoiceID,
	    				values: {
	    					custbody_bbs_email_sent: true,
	    					custbody_bbs_date_email_sent: new Date() // today's date
	    				}
	    			});
	    			
	    			log.audit({
	    				title: 'Invoice Record Updated',
	    				details: 'Invoice ID: ' + invoiceID
	    			});
	    		}
    		catch(e)
    			{
    				log.error({
    					title: 'Unable to Update Invoice Record',
    					details: 'Invoice ID: ' + invoiceID + '<br>Error: ' + e
    				});
    			}
    	}

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
