/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/render', 'N/email'],
/**
 * @param {record} record
 * @param {search} search
 */
function(search, record, render, email) {
   
	// declare new date object. Global variable so can be accessed throughout the script
	creditDate = new Date();
	creditDate = new Date(creditDate.getFullYear(), creditDate.getMonth(), 0); // set date to be the last day of the previous month
	
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
    	
    	// search for records to be processed
    	return search.create({
    		type: search.Type.INVOICE,
    		
    		filters: [{
    			name: 'mainline',
    			operator: search.Operator.IS,
    			values: ['T']
    		},
    				{
    			name: 'custbody_bbs_duplicate_invoice',
    			operator: search.Operator.IS,
    			values: ['T']
    		},
    				{
    			name: 'internalid',
    			operator: search.Operator.NONEOF,
    			values: [170842, 170522]
    		}],
    		
    		columns: [{
    			name: 'tranid'
    		},
    				{
    			name: 'email',
    			join: 'subsidiary'
    		},
    				{
    			name: 'custentity_bbs_cust_trans_email',
    			join: 'customermain'
    		},
    				{
    			name: 'custentity_bbs_cust_trans_cc',
    			join: 'customermain'
    		},
    				{
    			name: 'custentity_bbs_cust_trans_cc_2',
    			join: 'customermain'
    		}],   		
    		
    	});

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// declare and initialize variables
    	var emailSender = null;
    	var CCEmailAddresses = new Array();
    	
    	// retrieve search results
    	var searchResult = JSON.parse(context.value);
    	
    	// retrieve search results
    	var recordID 		= parseFloat(searchResult.id);
    	var invoiceID 		= searchResult.values["tranid"];
    	var subsidiaryEmail = searchResult.values["email.subsidiary"];
    	var customerEmail 	= searchResult.values["custentity_bbs_cust_trans_email.customermain"];
    	var customerCC1 	= searchResult.values["custentity_bbs_cust_trans_cc.customermain"];
    	var customerCC2		= searchResult.values["custentity_bbs_cust_trans_cc_2.customermain"];
    	
    	log.audit({
			title: 'Processing Invoice Record',
			details: recordID + '<br>' + invoiceID
		});
    	
    	if(customerCC1)
    		{
    			CCEmailAddresses.push(customerCC1);
    		}
    	
    	if (customerCC2)
    		{
    			CCEmailAddresses.push(customerCC2);
    		}
    	
    	switch(subsidiaryEmail) {
    	
    		case "ARUK@essensys.tech":
    			emailSender = 4045;
    			break;
    		
    		case "ARUS@essensys.tech":
				emailSender = 4046;
				break;	
    	
    	}
    	
    	try
			{
				// transform the invoice into a credit memo
				var creditMemo = record.transform({
					fromType: record.Type.INVOICE,
					fromId: recordID,
					toType: record.Type.CREDIT_MEMO
				});
				
				// set fields on the credit memo
				creditMemo.setValue({
					fieldId: 'trandate',
					value: creditDate
				});
				
				creditMemo.setValue({
					fieldId: 'memo',
					value: 'Credit for Invoice ' + invoiceID
				});
				
				// save the credit memo record
				var creditMemoID = creditMemo.save();
				
				log.audit({
					title: 'Credit Memo Created',
					details: 'Credit Memo ID: ' + creditMemoID + '<br>Invoice ID: ' + invoiceID
				});
				
				try
					{
						// get the email template contents
						var mergeResult = render.mergeEmail({
							templateId: 29,
							transactionId: parseInt(creditMemoID)
						});
						
						// create the PDF of the transaction
						var transactionPDF = render.transaction({
							entityId: parseInt(creditMemoID),
							printMode: render.PrintMode.PDF,
							formId: 111
						});
						
						// if we have any CC email addresses
						if (CCEmailAddresses.length > 0)
							{
								// email the credit memo to the customer
								email.send({
									author: emailSender,
									recipients: customerEmail,
									subject: mergeResult.subject,
									body: mergeResult.body,
									attachments: [transactionPDF],
									relatedRecords: {
										transactionId: creditMemoID
									}
								});
							}
						else // no CC email addresses
							{
								// email the credit memo to the customer
								email.send({
									author: emailSender,
									recipients: customerEmail,
									cc: CCEmailAddresses,
									subject: mergeResult.subject,
									body: mergeResult.body,
									attachments: [transactionPDF],
									relatedRecords: {
										transactionId: creditMemoID
									}
								});
							}
					}
				catch(e)
					{
						log.error({
							title: 'Error Sending Email',
							details: 'Credit Memo ID: ' + creditMemoID + '<br>Error: ' + e
						});
					}
			}
		catch(e)
			{
				log.error({
					title: 'Error Creating Credit Memo',
					details: 'Invoice ID: ' + invoiceID + '<br>Error: ' + e
				});
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
    	
    	log.audit({
    		title: '*** END OF SCRIPT ***',
    		details: 'Duration: ' + summary.seconds + ' seconds<br>Units Used: ' + summary.usage + '<br>Yields: ' + summary.yields
    	});

    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
