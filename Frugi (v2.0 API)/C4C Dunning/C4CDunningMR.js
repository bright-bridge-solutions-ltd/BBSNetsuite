/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/render', 'N/email'],
function(runtime, search, record, render, email) {
   
    // call function to return script parameters. Parameters are global variables so can be accessed throughout the script
	scriptParameters = getScriptParameters();
	
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
    	
    	// run search to find customers to be sent dunning reminders
    	return search.create({
    		type: search.Type.INVOICE,
    		
    		filters: [{
    			name: 'mainline',
    			operator: search.Operator.IS,
    			values: ['T']
    		},
    				{
    			name: 'daysoverdue',
    			operator: search.Operator.GREATERTHAN,
    			values: [14]
    		},
    				{
    			name: 'category',
    			join: 'customer',
    			operator: search.Operator.ANYOF,
    			values: [1] // 1 = Key
    		},
    				{
    			name: 'terms',
    			join: 'customer',
    			operator: search.Operator.NONEOF,
    			values: [4] // 4 = Proforma
    		}],
    		
    		columns: [{
    			name: 'mainname',
    			summary: search.Summary.GROUP
    		},
    				{
    			name: 'daysoverdue',
    			summary: search.Summary.MAX
    		},
    				{
    			name: 'internalid',
    			join: 'salesrep',
    			summary: search.Summary.MAX
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
    	
    	// retrieve search result
    	var searchResult = JSON.parse(context.value);
    	
    	var customerID 	= parseInt(searchResult.values['GROUP(mainname)'].value);
    	var daysOverdue = searchResult.values['MAX(daysoverdue)'];
    	var salesRepID	= searchResult.values['MAX(internalid.salesrep)'];
    	
    	// determine the appropriate Dunning function that should be run, based upon daysOverdue
    	if (daysOverdue > 60)
    		{
    			dunningLevel5(customerID);
    		}
    	else if (daysOverdue > 53)
			{
    			dunningLevel4(customerID);
			}
    	else if (daysOverdue > 40)
			{
    			dunningLevel3(customerID);
			}
    	else if (daysOverdue > 28)
			{
    			dunningLevel2(customerID, salesRepID);
			}
    	else if (daysOverdue > 14)
			{
    			dunningLevel1(customerID);
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
    
    // ================================
    // FUNCTIONS FOR EACH DUNNING LEVEL
    // ================================
    
    function dunningLevel1(customerID) {
    	
    	// call function to send a reminder email to the customer
    	sendEmail(scriptParameters.dunningLevel1Template, customerID, null, null); // email template, customer, recipient, BCC
    	
    	// call function to update the customer record
    	updateCustomer(customerID, 1);
    	
    }
    
    function dunningLevel2(customerID) {
    	
    	// call function to send a reminder email to the customer
    	sendEmail(scriptParameters.dunningLevel2Template, customerID, null, null); // email template, customer, recipient, BCC
    	
    	// call function to update the customer record
    	updateCustomer(customerID, 2);
    	
    }
    
    function dunningLevel3(customerID) {
    	
    	// call function to send an email to AR to contact the customer
    	sendEmail(scriptParameters.dunningLevel3Template, customerID, scriptParameters.arEmailRecipient, null); // email template, customer, recipient, BCC
    	
    	// call function to update the customer record
    	updateCustomer(customerID, 3);
    	
    }
    
    function dunningLevel4(customerID, salesRepID) {
    	
    	// call function to send a reminder email to the customer
    	sendEmail(scriptParameters.dunningLevel4Template, customerID, null, salesRepID); // email template, customer, recipient, BCC
    	
    	// call function to update the customer record
    	updateCustomer(customerID, 4);
    	
    }
    
    function dunningLevel5(customerID) {
    	
    	// call function to send an email to AR to contact credit insurer
    	sendEmail(scriptParameters.dunningLevel5Template, customerID, scriptParameters.arEmailRecipient, null); // email template, customer, recipient, BCC
    	
    	// call function to update the customer record
    	updateCustomer(customerID, 5);
    	
    }
    
    // =========================================
    // FUNCTION TO SEND A DUNNING REMINDER EMAIL
    // =========================================
    
    function sendEmail(emailTemplateID, customerID, emailRecipient, BCC) {
    	
    	// if we do NOT have an email recipient
    	if (!emailRecipient)
    		{
    			// set the emailRecipient to be the customerID
    			emailRecipient = customerID;
    		}
    	
    	// compile email content
    	var emailTemplate = render.mergeEmail({
	    	templateId: emailTemplateID,
	    	entity: {
	    		type: 'customer',
	    		id:	customerID
	    	},
	    	recipient: 		null,
	    	customRecord: 	null,
	    	supportCaseId: 	null,
	    	transactionId:	null
    	});
    	
    	// if we have a BCC recipient
    	if (BCC)
    		{
    			try
    				{
		    			email.send({
		    				author: 	scriptParameters.dunningEmailSender,
		    				recipients:	emailRecipient,
		    				bcc:		BCC,
		    				subject:	emailTemplate.subject,
		    				body:		emailTemplate.body
		    			});
    				}
    			catch(e)
    				{
    					log.error({
    						title: 'Error Sending Reminder Email',
    						details: 'Customer ID: ' + customerID + '<br>' + e
    					});
    				}
    		}
    	else
    		{
	    		try
					{
		    			email.send({
		    				author: 	scriptParameters.dunningEmailSender,
		    				recipients: emailRecipient,
		    				subject:	emailTemplate.subject,
		    				body:		emailTemplate.body
		    			});
					}
				catch(e)
					{
						log.error({
							title: 'Error Sending Reminder Email',
							details: 'Customer ID: ' + customerID + '<br>' + e
						});
					}
    		}
    	
    }
    
    // ======================================
    // FUNCTION TO RETRIEVE SCRIPT PARAMETERS
    // ======================================
    
    function getScriptParameters() {
    	
    	// retrieve script parameters
    	var currentScript = runtime.getCurrentScript();
    	
    	var dunningLevel1Template = currentScript.getParameter({
    		name: 'custscript_c4c_dunning_level_1_email'
    	});
    	
    	var dunningLevel2Template = currentScript.getParameter({
    		name: 'custscript_c4c_dunning_level_2_email'
    	});
    	
    	var dunningLevel3Template = currentScript.getParameter({
    		name: 'custscript_c4c_dunning_level_3_email'
    	});
    	
    	var dunningLevel4Template = currentScript.getParameter({
    		name: 'custscript_c4c_dunning_level_4_email'
    	});
    	
    	var dunningLevel5Template = currentScript.getParameter({
    		name: 'custscript_c4c_dunning_level_5_email'
    	});
    	
    	var dunningEmailSender = currentScript.getParameter({
    		name: 'custscript_c4c_dunning_email_sender'
    	});
    	
    	var arEmailRecipient = currentScript.getParameter({
    		name: 'custscript_c4c_dunning_ar_recipient'
    	});
    	
    	// return values to main script function
    	return {
    		dunningEmailSender:		dunningEmailSender,
    		arEmailRecipient:		arEmailRecipient,
    		dunningLevel1Template:	dunningLevel1Template,
    		dunningLevel2Template:	dunningLevel2Template,
    		dunningLevel3Template:	dunningLevel3Template,
    		dunningLevel4Template:	dunningLevel4Template,
    		dunningLevel5Template:	dunningLevel5Template
    	}
    	
    }
    
    // ======================================
    // FUNCTION TO UPDATE THE CUSTOMER RECORD
    // ======================================
    
    function updateCustomer(customerID, dunningLevel) {
    	
    	try
    		{
    			// update the dunning fields on the customer
    			record.submitFields({
    				type: record.Type.CUSTOMER,
    				id: customerID,
    				values: {
    					custentity_c4c_dunning_level: dunningLevel,
    					custentity_c4c_last_reminder_email_date: new Date()
    				}
    			});
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Updating Customer',
    				details: 'Customer ID: ' + customerID + '<br>Error: ' + e
    			});
    		}
    	
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
