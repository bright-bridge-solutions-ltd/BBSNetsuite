/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/config', 'N/search', 'N/record', 'N/email'],
/**
 * @param {record} record
 * @param {search} search
 */
function(runtime, config, search, record, email) {

	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script
	emailRecipient = currentScript.getParameter({
    	name: 'custscript_bbs_ended_contracts_alert_emp'
    });
	
	emailSender = currentScript.getParameter({
		name: 'custscript_bbs_billing_script_email_send'
	});
	
	billingType = currentScript.getParameter({
		name: 'custscript_bbs_billing_type_select'
	});
	
	billingTypeText = currentScript.getParameter({
		name: 'custscript_bbs_billing_type_select_text'
	});
	
	initiatingUser = currentScript.getParameter({
		name: 'custscript_bbs_billing_email_emp_alert'
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
    	
    	// create search to find contracts that have either an end date or early termination date of the previous month
    	return search.create({
    		type: 'customrecord_bbs_contract',
    		
    		filters:  [
    		            ['custrecord_bbs_contract_billing_type', 'anyof', billingType],
    		            	'AND',
    					['custrecord_bbs_contract_status', 'anyof', '1'], // 1 = Approved
    		             	'AND', 
    		             [
    		              	['custrecord_bbs_contract_end_date', 'within', 'lastmonth'],
    		              	'OR',
    		              	['custrecord_bbs_contract_early_end_date', 'within', 'lastmonth']
    		             ]
    		             
    		          ],
    		          
    		 columns:	[{
    			 name: 'name'
    		 },
    		 			{
    			 name: 'custrecord_bbs_contract_customer'
    		 },
    		 			{
    			 name: 'custrecord_bbs_contract_billing_type'
    		 },
    		 			{
    			 name: 'custrecord_bbs_contract_start_date'
    		 },
    		 			{
    			 name: 'custrecord_bbs_contract_end_date'
    		 },
    		 			{
    			 name: 'custrecord_bbs_contract_subsidiary'
    		 },
    		 			{
    			 name: 'formuladate',
    			 formula: 'CASE WHEN {custrecord_bbs_contract_early_end_date} < {custrecord_bbs_contract_end_date} THEN {custrecord_bbs_contract_early_end_date} ELSE {custrecord_bbs_contract_end_date} END'
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
    	
    	// retrieve search results
    	var searchResult = JSON.parse(context.value);
    	
    	// get the internal ID of the record from the search results
		var contractRecordID = searchResult.id;
		
		// get the ID of the contract record from the search results
		var contractRecord = searchResult.values['name'];
		
		// get the customer name from the search results
		var customerName = searchResult.values['custrecord_bbs_contract_customer'].text;
		
		// get the billing type from the search results
		var billingType = searchResult.values['custrecord_bbs_contract_billing_type'].text;
		
		// get the start date from the search results
		var startDate = searchResult.values['custrecord_bbs_contract_start_date'];
		
		// get the end date from the search results
		var endDate = searchResult.values['formuladate'];
		
		var subsidiary = searchResult.values['custrecord_bbs_contract_subsidiary'].value;
		
		log.audit({
			title: 'Processing Contract Record',
			details: contractRecord
		});
		
		try
			{
				// set the status field on the contract record to 4 (Ended) and tick the inactive checkbox
				record.submitFields({
					type: 'customrecord_bbs_contract',
					id: contractRecordID,
					values: {
						custrecord_bbs_contract_status: '4',
						isinactive: true
					}
				});
			
				log.audit({
					title: 'Contract Record Ended',
					details: contractRecord
				});
				
				// write the contractRecord and contract details to the context so that it can be retrieved in the summary stage
				context.write({
					key: contractRecord,
					value: '<tr><td>' + contractRecord + '</td><td>' + customerName + '</td><td>' + subsidiary + '</td><td>' + billingType + '</td><td>' + startDate + '</td><td>' + endDate + '</td></tr>'
				});

			}
		catch (error)
			{
				log.error({
					title: 'Error Updating Contract Record',
					details: 'Record: ' + recordID + ' | Error: ' + error
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
    	
    	// build HTML table to hold ended contracts
    	var endedContractsTable = '<table border="1">';
    	endedContractsTable += '<tr>';
    	endedContractsTable += '<td><b>Contract Record</b></td>';
    	endedContractsTable += '<td><b>Customer Name</b></td>';
    	endedContractsTable += '<td><b>Subsidiary</b></td>';
    	endedContractsTable += '<td><b>Billing Type</b></td>';
    	endedContractsTable += '<td><b>Start Date</b></td>';
    	endedContractsTable += '<td><b>End Date</b></td>';
    	endedContractsTable += '</tr>';

    	// use summary.output which will contain list of key/value pairs that we have entered at end of map() function
    	summary.output.iterator().each(function(key, value) {
    		
    		// add the value to the ended contracts table
    		endedContractsTable += value;
    		
    		// continue processing additional key/value pairs
    		return true;
    		
    	});
    	
    	// add ending HTML tags to the ended contracts table
    	endedContractsTable += '</table>';
    	
    	// define the subject and body of the email
    	var emailSubject = 'Contract Records Ended Today';
	    var emailBody = 'Below is a list of contract records which have been ended today:<br><br>' + endedContractsTable + '<br><span style="font-size:10px;">this alert has been generated by the script &#39;BBS End Contracts Map/Reduce&#39;</span>';
	
	    try
	    	{
	        	// send email with a list of ended contracts
	    	  	email.send({
	    	  		author: emailSender,
	    	  		recipients: emailRecipient,
	    	  		subject: emailSubject,
	    	  		body: emailBody,
	    	  	});
	    	}
	    catch(error)
	    	{
	    		log.error({
	    			title: 'Error Sending Ended Contracts Email',
	    			details: 'Error: ' + error
	    		});
	    	}
    	
    	// send email to the user who initiated the billing process to inform them that it is complete
    	emailSubject = 'Billing Process Complete for ' + billingTypeText;
    	emailBody = 'The billing process for ' + billingTypeText + ' has been completed.<br><br>You may now process additional billing types.<br><br><span style="font-size:10px;">this alert has been generated by the script &#39;BBS End Contracts Map/Reduce&#39;</span>';
    	
    	try
			{
				// send email with a list of ended contracts
	        	email.send({
	        		author: emailSender,
	        		recipients: initiatingUser,
	        		subject: emailSubject,
	        		body: emailBody,
	        	});
			}
		catch(error)
			{
				log.error({
					title: 'Error Sending Billing Process Contracts Email',
					details: 'Error: ' + error
				});
			}
		
		// check if the billingTypeText is QMP
		if (billingTypeText == 'QMP')
			{
				// call updateCompanyPreferences function
				updateCompanyPreferences();
			}
		
		log.audit({
    		title: '*** END OF BILLING RUN ***',
    		details: 'Billing Type: ' + billingTypeText
    	});
    }
    
    //=======================================
	// FUNCTION TO UPDATE COMPANY PREFERENCES
	//=======================================
    
    function updateCompanyPreferences()
	    {
	    	// load the company preferences
	    	var companyPreferences = config.load({
	            type: config.Type.COMPANY_PREFERENCES,
	            isDynamic: true
	        });
	    	
	    	// set the 'Billing Process Complete' checkbox
	    	companyPreferences.setValue({
	    		fieldId: 'custscript_bbs_billing_process_complete',
	    		value: true
	    	});
	    	
	    	// save the company preferences
	    	companyPreferences.save();
	    	
	    	log.debug({
	    		title: 'Company Preferences Updated',
	    		details: 'Billing Process Checkbox has been TICKED'
	    	});
	    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
    
});
