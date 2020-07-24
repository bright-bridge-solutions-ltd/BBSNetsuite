/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/render', 'N/email'],
function(runtime, search, render, email) {
   
    // retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	customers = currentScript.getParameter({
		name: 'custscript_acc_send_statement_cust_array'
	});
	
	emailTemplate = currentScript.getParameter({
		name: 'custscript_acc_send_statement_email_temp'
	});
	
	transactionForm = parseInt(currentScript.getParameter({
		name: 'custscript_acc_send_statement_tran_form'
	})); // use parseInt to convert to integer number
	
	startDate = currentScript.getParameter({
		name: 'custscript_acc_send_statement_start_date'
	});
	
	statementDate = currentScript.getParameter({
		name: 'custscript_acc_send_statement_date'
	});
	
	openTransactionsOnly = convertToBoolean(currentScript.getParameter({
		name: 'custscript_acc_send_statement_open_only'
	})); // use function convertToBoolean to convert to boolean value as T or F is returned
	
	inCustomerLocale = convertToBoolean(currentScript.getParameter({
		name: 'custscript_acc_send_statement_cust_local'
	})); // use function convertToBoolean to convert to boolean value as T or F is returned
	
	consolidateStatements = convertToBoolean(currentScript.getParameter({
		name: 'custscript_acc_send_statement_consolidat'
	})); // use function convertToBoolean to convert to boolean value as T or F is returned
	
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
    	customers = customers.replace('[', '');
    	customers = customers.replace(/"/g, ''); // replace ALL instances
    	customers = customers.replace(']', '');

    	// return array containing customer IDs
    	return customers.split(',');

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// get the customer ID
    	var customerID = parseInt(context.value);
    	
    	log.audit({
    		title: 'Processing Customer',
    		details: customerID
    	});
    	
    	// call function to email the statement to the customer
		sendStatement(customerID);

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
    
    // ================
    // HELPER FUNCTIONS
    // ================
    
    function convertToBoolean(value) {
    	
    	// if value is 'T'
    	if (value == 'T')
    		{
    			// set value to true
    			value = true;
    		}
    	else if (value == 'F') // if value is 'F'
    		{
    			// set value to false
    			value = false;
    		}
    	
    	// return value to main script function
    	return value;
    }
    
    function sendStatement(customerID) {
    	
    	// call function to lookup fields on the customer record
    	var customerLookup 			= searchCustomer(customerID);
    	var companyName 			= customerLookup.companyName;
    	var statementEmailAddress 	= customerLookup.statementEmailAddress;
    	
    	try
	    	{
	    		// generate the statement PDF
	    		var statementFile = render.statement({
	    			entityId: 				customerID,
	    			printMode: 				render.PrintMode.PDF,
	    			formId: 				transactionForm,
	    			startDate: 				startDate,
	    			statementDate: 			statementDate,
	    			openTransactionsOnly: 	openTransactionsOnly,
	    			inCustLocale: 			inCustomerLocale,
	    			consolidateStatements: 	consolidateStatements
	    		});
	    			
	    		// set the statement PDF name
	    		statementFile.name = 'Accora Statement for ' + companyName + ' as of ' + statementDate;
	    			
	    		// build up the attachments array
				var emailAttachments = new Array();
				emailAttachments.push(statementFile); // push statementFile object to emailAttachments array
	    		
	    		// compile email content
	    	    var mergeResult = render.mergeEmail({
	    	    	templateId: 	emailTemplate,
	    	    	entity: {
	    	    				type: 	'customer',
	    	    				id:		customerID
	    	    			},
	    	    	recipient: 		null,
	    	    	customRecord: 	null,
	    	    	supportCaseId: 	null,
	    	    	transactionId:	null
	    	    });
	    	    	
	    	    // get the email subject and body from the mergeResult object
	    	    var emailSubject = mergeResult.subject;
	    	    var emailBody = mergeResult.body;
	    	    	
	    	    // send the statement to the customer with the PDF statement attached
	    	    email.send({
	    	    	author: 		runtime.getCurrentUser().id, // current user
	    	    	recipients:		statementEmailAddress,
	    	    	subject:		emailSubject,
	    	    	body:			emailBody,
	    	    	attachments:	emailAttachments,
	    	    	relatedRecords: {
	    	    		entityId: customerID
	    	    	}
	    	    });
	    	    
	    	    log.audit({
	    	    	title: 'Statement Sent Successfully',
	    	    	details: 'Customer ID: ' + customerID + '<br>Company Name: ' + companyName
	    	    });
	    	}
	    catch(e)
	    	{
	    		log.error({
	    			title: 'Error Sending Statement',
	    			details: 'Customer ID: ' + customerID + '<br>Company Name: ' + companyName + '<br>Error: ' + e
	    		});
	    	}
    }
    
    function searchCustomer(customerID) {
    	
    	// lookup fields on the customer record
    	var customerLookup = search.lookupFields({
    		type: search.Type.CUSTOMER,
    		id: customerID,
    		columns: ['companyname', 'custentity_acc_customer_statement_email']
    	});
    	
    	// return values to the main script finction
    	return {
    		companyName: customerLookup.companyname,
    		statementEmailAddress: customerLookup.custentity_acc_customer_statement_email
    	}
    	
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
