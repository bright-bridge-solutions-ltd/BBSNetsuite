/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/render', 'N/email'],
function(search, render, email) {
   
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
    	
    	// create search to find customers that are overdue
    	return search.create({
    		type: search.Type.CUSTOMER,
    		
    		columns: [{
    			name: 'entityid'
    		},
    				{
    			name: 'email'
    		}],
    		
    		filters: [{
    			name: 'daysoverdue',
    			operator: 'greaterthan',
    			values: ['0']
    		},
    				{
    			name: 'custentity_ti_exempt_dunning_letter',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'internalid',
    			operator: 'anyof',
    			values: ['2886']
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
    	
    	// declare and initiate variables
    	var invoiceDate;
    	var invoiceNumber;
    	var invoiceAmount;
    	var invoiceDaysOverdue;
    	var emailAttachments = new Array;
    	
    	// build up the HTML of the email
    	emailBody = '<html>';
    	emailBody += '<p>Dear Customer</p>';
    	emailBody += '<br>';
    	emailBody += '<p>Please find below a list of your overdue invoices:</p>';
    	emailBody += '<br>';
    	emailBody += '<table border="1">';
    	emailBody += '<tr>';
    	emailBody += '<td align="center">Date</td>';
    	emailBody += '<td align="center">Document Number</td>';
    	emailBody += '<td align="right">Amount</td>';
    	emailBody += '<td align="right">Days Overdue</td>';
    	emailBody += '</tr>';
    	
    	// retrieve search results
    	var searchResult = JSON.parse(context.value);
    	
    	// get the internal ID, name and email address from the search results
    	var customerID = parseInt(searchResult.id);
    	
    	var customerName = searchResult.values['entityid'];
    	
    	var customerEmail = searchResult.values['email'];
    	
    	log.audit({
    		title: 'Processing Customer',
    		details: 'ID: ' + customerID + ' | Name: ' + customerName + ' | Email: ' + customerEmail
    	});
    	
    	// create search to find overdue invoices for the customer
    	var invoiceSearch = search.create({
    		type: search.Type.INVOICE,
    		
    		columns: [{
    			name: 'trandate'
    		},
    				{
    			name: 'tranid'
    		},
    				{
    			name: 'amount'
    		},
    				{
    			name: 'daysoverdue'
    		}],
    		
    		filters: [{
    			name: 'mainline',
    			operator: 'is',
    			values: ['T']
    		},
    				{
    			name: 'daysoverdue',
    			operator: 'greaterthan',
    			values: ['0']
    		},
    				{
    			name: 'status',
    			operator: 'anyof',
    			values: ['CustInvc:A'] // CustInvc:A = Invoice:Open
    		},
    				{
    			name: 'mainname',
    			operator: 'anyof',
    			values: [customerID]
    		}],

    	});
    	
    	// run search and process results
    	invoiceSearch.run().each(function(result) {
    		
    		// get invoice information from the search results
    		invoiceDate = result.getValue({
    			name: 'trandate'
    		});
    		
    		invoiceNumber = result.getValue({
    			name: 'tranid'
    		});
    		
    		invoiceAmount = result.getValue({
    			name: 'amount'
    		});
    		
    		invoiceDaysOverdue = result.getValue({
    			name: 'daysoverdue'
    		});
    		
    		// add a new line to the table
    		emailBody += '<tr>';
    		emailBody += '<td align="center">' + invoiceDate + '</td>';
    		emailBody += '<td align="center">' + invoiceNumber + '</td>';
    		emailBody += '<td align="right">' + invoiceAmount + '</td>';
    		emailBody += '<td align="right">' + invoiceDaysOverdue + '</td>';
    		emailBody += '</tr>';
    		
    		// continue processing additional results
    		return true;
    	});
    	
    	// close the table and finish the HTML content
    	emailBody += '</table>';
    	emailBody += '<br>';
    	emailBody += '<p>Kind Regards</p>';
    	emailBody += '<br>';
    	emailBody += '<p>Credit Control</p>';
    	emailBody += '</html>';
    	
    	// print the customer's statement
    	var statement = render.statement({
    		entityId: customerID
    	});
    	
    	// push the statement to the emailAttachments array
    	emailAttachments.push(statement);
    	
    	try
			{
				// send email with a list of overdue invoices and attach statement
	        	var sentEmail = email.send({
	        		author: '3', // 3 = BBS Employee
	        		recipients: customerEmail,
	        		subject: 'Overdue Invoices',
	        		body: emailBody,
	        		attachments: emailAttachments,
	        		relatedRecords: {
	        			entityId: customerID
	        		}
	        	});
	        	
	        	log.audit({
	        		title: 'Email has been sent',
	        		details: sentEmail
	        	});
			}
		catch(error)
			{
				log.error({
					title: 'Error Sending Email',
					details: 'Error: ' + error
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

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
