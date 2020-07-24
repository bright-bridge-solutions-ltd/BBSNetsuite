/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/ui/message', 'N/search', 'N/task', 'N/url', 'N/redirect'],
function(ui, message, search, task, url, redirect) {
   
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
    			// get today's date
    			var today = new Date();
    			
    			// retrieve script parameters
    			var statementsSent		= context.request.parameters.statementssent;
    			var statementsNotSent 	= context.request.parameters.statementsnotsent;
    		
    			// create form
				var form = ui.createForm({
	                title: 'ACC Send Customer Statements',
	                hideNavBar: false
	            });
				
				// check if statementsSent or statementsNotSent return a value
				if (statementsSent)
					{
						// display a message at the top of the page
						form.addPageInitMessage({
				            type: message.Type.INFORMATION,
							title: 'Information',
							message: 'A job has been scheduled to send <b>' + statementsSent + '</b> statements to customers.'
						});
					}
				
				// add fields to the form
				var pageLogo = form.addField({
				    id: 'pagelogo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'HTML Image'
				});
				
				var startDate = form.addField({
					id: 'startdate',
					type: ui.FieldType.DATE,
					label: 'Start Date'
				});
				
				var statementDate = form.addField({
					id: 'statementdate',
					type: ui.FieldType.DATE,
					label: 'Statement Date'
				});
				
				var openTransactionsOnly = form.addField({
					id: 'opentransactionsonly',
					type: ui.FieldType.CHECKBOX,
					label: 'Open Transactions Only'
				});
				
				var inCustomerLocale = form.addField({
					id: 'incustomerlocale',
					type: ui.FieldType.CHECKBOX,
					label: 'Print In Customer Locale'
				});
				
				var consolidateStatements = form.addField({
					id: 'consolidatestatements',
					type: ui.FieldType.CHECKBOX,
					label: 'Consolidate Statements'
				});
				
				// update field break types
				startDate.updateBreakType({
				    breakType : ui.FieldBreakType.STARTCOL
				});
				
				openTransactionsOnly.updateBreakType({
				    breakType : ui.FieldBreakType.STARTCOL
				});
				
				// update field default values
				pageLogo.defaultValue				= "<br><img src='https://4810497-sb1.app.netsuite.com/core/media/media.nl?id=5549264&c=4810497_SB1&h=dc37ea3fb9e4c8c339bd' alt='Accora Logo' style='width: 200px; height: 50px;'>";
				startDate.defaultValue				= new Date(today.getFullYear(), today.getMonth(), 1); // first date of current month
				statementDate.defaultValue			= new Date(today.getFullYear(), today.getMonth()+1, 0); // last day of current month
				openTransactionsOnly.defaultValue	= 'T';
				inCustomerLocale.defaultValue		= 'T';
				
				// add a sublist to the form
				var customerSublist = form.addSublist({
					type: ui.SublistType.LIST,
					id: 'customersublist',
					label: 'Customers'
				});
				
				// add fields to the sublist
				customerSublist.addField({
					type: ui.FieldType.CHECKBOX,
					id: 'email',
					label: 'Email'
				});
				
				customerSublist.addField({
					type: ui.FieldType.TEXT,
					id: 'internalid',
					label: 'Internal ID'
				}).updateDisplayType({
					displayType: ui.FieldDisplayType.HIDDEN
				});
				
				customerSublist.addField({
					type: ui.FieldType.TEXT,
					id: 'entityid',
					label: 'Customer ID'
				});
						
				customerSublist.addField({
					type: ui.FieldType.TEXT,
					id: 'customername',
					label: 'Customer'
				});
				
				customerSublist.addField({
					type: ui.FieldType.SELECT,
					id: 'currency',
					label: 'Currency',
					source: 'currency'
				}).updateDisplayType({
					displayType: ui.FieldDisplayType.INLINE
				});
				
				customerSublist.addField({
					type: ui.FieldType.CURRENCY,
					id: 'balance',
					label: 'Balance'
				});
				
				// call function to search for customer records
				var searchResults = searchCustomers();
				
				// initiate line variable
				var line = 0;
						
				// run search and process results
				searchResults.each(function(result){
							
					// retrieve search results
					var internalID = result.id;
							
					var entityID = result.getValue({
						name: 'entityid'
					});
							
					var customerName = result.getValue({
						name: 'altname'
					});
					
					var currency = result.getValue({
						name: 'currency'
					});
					
					var balance = result.getValue({
						name: 'fxbalance'
					});
							
					// set sublist fields
					customerSublist.setSublistValue({
						id: 'internalid',
						line: line,
						value: internalID
					});
							
					customerSublist.setSublistValue({
						id: 'entityid',
						line: line,
						value: entityID
					});
					
					customerSublist.setSublistValue({
						id: 'customername',
						line: line,
						value: customerName
					});
					
					customerSublist.setSublistValue({
						id: 'currency',
						line: line,
						value: currency
					});
					
					customerSublist.setSublistValue({
						id: 'balance',
						line: line,
						value: balance
					});
							
					// increase line variable
					line ++;
							
					// continue processing additional results
					return true;
							
				});
						
				// add mark/unmark all buttons to the sublist
				customerSublist.addMarkAllButtons();
						
				// add submit button to the form
		   		form.addSubmitButton({
		   			label: 'Send Statements'
		   		});
   		 		
   		 		// write the response to the page
				context.response.writePage(form);  	
			}
    	else if (context.request.method === 'POST') // on POST
    		{
    			// declare and initialize variables
    			var customersArray = new Array();
    			var statementsSent = 0;
    		
    			// retrieve values from the form
    			var startDate 				= 	context.request.parameters.startdate;
    			var statementDate			= 	context.request.parameters.statementdate;
    			var openTransactionsOnly	=	context.request.parameters.opentransactionsonly;
    			var inCustomerLocale		=	context.request.parameters.opentransactionsonly; 	
    			var consolidateStatements	=	context.request.parameters.consolidatestatements;
    		
    			// get count of lines on the sublist
    			var lineCount = context.request.getLineCount('customersublist');
    			
    			// loop through line count
    			for (var i = 0; i < lineCount; i++)
    				{
    					// get the value of the 'Email' checkbox
    					var email = context.request.getSublistValue({
    						group: 'customersublist',
    						name: 'email',
    						line: i
    					});
    					
    					// only process lines where the email checkbox is ticked
    					if (email == 'T')
    						{
	    						// get the internal ID of the customer, the customer name and the statement email address
    							var customerID = context.request.getSublistValue({
    	    						group: 'customersublist',
    	    						name: 'internalid',
    	    						line: i
    	    					});
    							
    							// push customerID to the customersArray
    							customersArray.push(customerID);
    							
    							// increase statementsSent by 1
								statementsSent++;
    						}
    				}
    			
    			// call function to schedule a map/reduce script to send the statements
    			sendStatements(customersArray, startDate, statementDate, openTransactionsOnly, inCustomerLocale, consolidateStatements);
    			
    			// get the URL of the Suitelet
    			var suiteletURL = url.resolveScript({
    				scriptId: 'customscript_bbs_customer_statements_sl',
    				deploymentId: 'customdeploy_bbs_customer_statements_sl',
    				params: {
    					statementssent: statementsSent
    				}
    			});
    			
    			// redirect user to the Suitelet
				redirect.redirect({
				    url: suiteletURL
				});
    			
    		}

    }
    
    // =======================================================
    // FUNCTION TO SEARCH FOR CUSTOMER RECORDS TO BE PROCESSED
    // =======================================================
    
    function searchCustomers() {
    		
    	// run search to find customer records to be processed and return search results
    	return search.create({
    		type: search.Type.CUSTOMER,
    			
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
    				{
    			name: 'custentity_acc_customer_statement_email',
    			operator: search.Operator.ISNOTEMPTY,
    			values: []
    		},
    				{
    			name: 'balance',
    			operator: search.Operator.GREATERTHAN,
    			values: [0.00]
    		}],
    			
    		columns: [{
    			name: 'entityid',
    			sort: search.Sort.ASC
    		},
    				{
    			name: 'altname'
    		},
    				{
    			name: 'custentity_acc_customer_statement_email'
    		},
    				{
    			name: 'currency'
    		},
    				{
    			name: 'fxbalance'
    		}],

    	}).run();
    		
    }
    
    // ==================================================================
    // FUNCTION TO SCHEDULE MAP/REDUCE SCRIPT TO SEND CUSTOMER STATEMENTS
    // ==================================================================
    
    function sendStatements(customerArray, startDate, statementDate, openTransactionsOnly, inCustomerLocale, consolidateStatements) {
    	
    	// submit a new map/reduce task
    	var mapReduceTaskID = task.create({
    	    taskType: task.TaskType.MAP_REDUCE,
    	    scriptId: 'customscript_bbs_customer_statements_mr',
    	    deploymentId: 'customdeploy_bbs_customer_statements_mr',
    	    params: {
    	    	custscript_acc_send_statement_cust_array: 	customerArray,
    	    	custscript_acc_send_statement_start_date:	startDate,
    	    	custscript_acc_send_statement_date:			statementDate,
    	    	custscript_acc_send_statement_open_only:	openTransactionsOnly,
    	    	custscript_acc_send_statement_cust_local:	inCustomerLocale,
    	    	custscript_acc_send_statement_consolidat:	consolidateStatements
    	    }
    	}).submit();
    	
    	log.audit({
    		title: 'Script Scheduled',
    		details: mapReduceTaskID
    	});
    	
    }

    return {
        onRequest: onRequest
    };
    
});
