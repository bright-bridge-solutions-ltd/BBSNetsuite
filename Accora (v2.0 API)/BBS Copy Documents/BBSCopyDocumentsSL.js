/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/ui/serverWidget', 'N/ui/message', 'N/search', 'N/render', 'N/email', 'N/url', 'N/redirect'],
function(runtime, ui, message, search, render, email, url, redirect) {
   
    // retrieve script parameters. Parameters are global variables so can be accessed throughout the script
	emailTemplate = runtime.getCurrentScript().getParameter({
		name: 'custscript_acc_copy_documents_email_temp'
	});
	
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
    			// retrieve script parameters
    			var documentsSent	= context.request.parameters.documentssent;
    			var customerID 		= context.request.parameters.customerid;
    			var tranType		= context.request.parameters.transactiontype;
    		
    			// create form
				var form = ui.createForm({
	                title: 'ACC Copy Documents',
	                hideNavBar: false
	            });
				
				// set client script to run on the page
				form.clientScriptFileId = 5676733;
				
				// check if documentsSent return a value
				if (documentsSent)
					{
						// display a message at the top of the page
						form.addPageInitMessage({
				            type: message.Type.CONFIRMATION,
							title: 'Email Sent',
							message: 'An email has been successfully sent with the <b>' + documentsSent + '</b> selected documents attached.<br><br>You can now close the page, or select another customer to send further documents.'
						});
					}
				
				// add fields to the form
				var pageLogo = form.addField({
				    id: 'pagelogo',
				    type: ui.FieldType.INLINEHTML,
				    label: 'HTML Image'
				});
				
				var customerName = form.addField({
					id: 'customername',
					type: ui.FieldType.SELECT,
					label: 'Customer Name',
					source: 'customer'
				});
				
				// update field break types
				customerName.updateBreakType({
				    breakType: ui.FieldBreakType.STARTCOL
				});
				
				// set field default values
				pageLogo.defaultValue = "<br><img src='https://4810497-sb1.app.netsuite.com/core/media/media.nl?id=5549264&c=4810497_SB1&h=dc37ea3fb9e4c8c339bd' alt='Accora Logo' style='width: 200px; height: 50px;'>";
				
				// do we have a customer ID
				if (customerID)
					{
						// add transaction type select field to the form and add select options
						var transactionType = form.addField({
							id: 'transactiontype',
							type: ui.FieldType.SELECT,
							label: 'Transaction Type'
						});
						
						transactionType.addSelectOption({
							value: 0,
							text: 'All'
						});
						
						transactionType.addSelectOption({
							value: 'CustCred',
							text: 'Credit Memo'
						});
						
						transactionType.addSelectOption({
							value: 'Estimate',
							text: 'Quote'
						});
						
						transactionType.addSelectOption({
							value: 'SalesOrd',
							text: 'Sales Order'
						});
						
						transactionType.addSelectOption({
							value: 'CustInvc',
							text: 'Invoice'
						});
						
						// have we got a transaction type pre-selected
						if (tranType)
							{
								// set the default value of the transaction type field
								transactionType.defaultValue = tranType;
							}
						
						// add a field to the form to allow the user to enter the email address to send the transactions to
						var emailAddress = form.addField({
							id: 'emailaddress',
							type: ui.FieldType.EMAIL,
							label: 'Email Address'
						});
						
						// set the email address field's break type
						emailAddress.updateBreakType({
						    breakType: ui.FieldBreakType.STARTCOL
						});
						
						// set the email address field to be mandatory
						emailAddress.isMandatory = true;
						
						// set the default value of the email address field
						emailAddress.defaultValue = getCustomerEmailAddress(customerID); // call function to return the customer's email address
						
						// add field to display the number of documents selected
						form.addField({
							id: 'documentsselected',
							type: ui.FieldType.INTEGER,
							label: 'Documents Selected',
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.INLINE
						});
					
						// set the default value of the customer name field
						customerName.defaultValue = customerID;
						
						// add a sublist to the form
						var transactionSublist = form.addSublist({
							type: ui.SublistType.LIST,
							id: 'transactionsublist',
							label: 'Transactions'
						});
						
						// add fields to the sublist
						transactionSublist.addField({
							type: ui.FieldType.CHECKBOX,
							id: 'email',
							label: 'Email'
						});
						
						transactionSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'internalid',
							label: 'Internal ID'
						}).updateDisplayType({
							displayType: ui.FieldDisplayType.HIDDEN
						});
						
						transactionSublist.addField({
							type: ui.FieldType.DATE,
							id: 'transactiondate',
							label: 'Date'
						});
						
						transactionSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'documentnumber',
							label: 'Document Number'
						});
						
						transactionSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'transactiontype',
							label: 'Type'
						});
						
						transactionSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'transactionstatus',
							label: 'Status'
						});
						
						transactionSublist.addField({
							type: ui.FieldType.TEXT,
							id: 'customername',
							label: 'Customer'
						});
						
						transactionSublist.addField({
							type: ui.FieldType.CURRENCY,
							id: 'transactionamount',
							label: 'Amount'
						});
						
						// call function to create search for transactions for this customer
						var transactionSearch = searchTransactions(customerID, tranType);
						
						// initiate line variable
						var line = 0;
								
						// run search process search results
						transactionSearch.run().each(function(result){
									
							// retrieve search results
							var internalID = result.id;
									
							var transactionDate = result.getValue({
								name: 'trandate'
							});
							
							var documentNumber = result.getValue({
								name: 'tranid'
							});
									
							var transactionType = result.getText({
								name: 'type'
							});
							
							var transactionStatus = result.getText({
								name: 'statusref'
							});
							
							var customerName = result.getText({
								name: 'mainname'
							});
							
							var amount = result.getValue({
								name: 'fxamount'
							});
									
							// set sublist fields
							transactionSublist.setSublistValue({
								id: 'internalid',
								line: line,
								value: internalID
							});
									
							transactionSublist.setSublistValue({
								id: 'transactiondate',
								line: line,
								value: transactionDate
							});
							
							transactionSublist.setSublistValue({
								id: 'documentnumber',
								line: line,
								value: documentNumber
							});
							
							transactionSublist.setSublistValue({
								id: 'transactiontype',
								line: line,
								value: transactionType
							});
							
							transactionSublist.setSublistValue({
								id: 'transactionstatus',
								line: line,
								value: transactionStatus
							});
							
							transactionSublist.setSublistValue({
								id: 'customername',
								line: line,
								value: customerName
							});
							
							transactionSublist.setSublistValue({
								id: 'transactionamount',
								line: line,
								value: amount
							});
									
							// increase line variable
							line ++;
									
							// continue processing additional results
							return true;
									
						});
						
						// add submit button to the form
				   		form.addSubmitButton({
				   			label: 'Send Documents'
				   		});
						
					}
   		 		
   		 		// write the response to the page
				context.response.writePage(form);  	
			}
    	else if (context.request.method === 'POST') // on POST
    		{
    			// declare and initialize variables
    			var files = new Array();
    			var documentsSent = 0;
    		
    			// retrieve values from the form
    			var customerID		= parseInt(context.request.parameters.customername); // use parseInt to convert to integer number
    			var emailAddress	= context.request.parameters.emailaddress;
    		
    			// get count of lines on the sublist
    			var lineCount = context.request.getLineCount('transactionsublist');
    			
    			// loop through line count
    			for (var i = 0; i < lineCount; i++)
    				{
    					// get the value of the 'Email' checkbox
    					var email = context.request.getSublistValue({
    						group: 'transactionsublist',
    						name: 'email',
    						line: i
    					});
    					
    					// only process lines where the email checkbox is ticked
    					if (email == 'T')
    						{
	    						// get the internal ID of the transaction
    							var transactionID = parseInt(context.request.getSublistValue({
    	    						group: 'transactionsublist',
    	    						name: 'internalid',
    	    						line: i
    	    					})); // use parseInt to convert to integer number
    							
    							try
    								{
	    								// generate the transaction PDF
	    				    			var file = render.transaction({
	    				    				entityId: transactionID,
	    				    				printMode: render.PrintMode.PDF
	    				    			});
	    				    			
	    				    			// push the file to the files array
	    				    			files.push(file);
    								}
    							catch(e)
    								{
    									log.error({
    										title: 'Error Generating PDF',
    										details: 'Transaction ID: ' + transactionID + '<br>Error: ' + e
    									});
    								}
    							
    							// increase documentsSent by 1
    							documentsSent++;
    						}
    				}
    			
    			// call function to send the email to the customer
    			sendEmail(files, customerID, emailAddress);
    			
    			// get the URL of the Suitelet
    			var suiteletURL = url.resolveScript({
    				scriptId: 'customscript_bbs_copy_documents_sl',
    				deploymentId: 'customdeploy_bbs_copy_documents_sl',
    				params: {
    					documentssent: documentsSent
    				}
    			});
    			
    			// redirect user to the Suitelet
				redirect.redirect({
				    url: suiteletURL
				});
    			
    		}

    }
    
    // ============================================
    // FUNCTION TO GET THE CUSTOMER'S EMAIL ADDRESS
    // ============================================
    
    function getCustomerEmailAddress(customerID) {
    	
    	// get the customer's email address and return to the main script function
    	return search.lookupFields({
    		type: search.Type.CUSTOMER,
    		id: customerID,
    		columns: ['email']
    	}).email;
    	
    }
    
    // ==========================================================
    // FUNCTION TO SEARCH FOR TRANSACTION RECORDS TO BE PROCESSED
    // ==========================================================
    
    function searchTransactions(customerID, tranType) {
    		
    	// create search to find customer records to be processed and return search results
    	var transactionSearch = search.create({
    		type: search.Type.TRANSACTION,
    			
    		filters: [
	            		['mainline', search.Operator.IS, 'T'],
	            			'AND',
	            		['status', search.Operator.ANYOF, 'CustCred:A', 'CustInvc:A', 'SalesOrd:D', 'SalesOrd:F', 'SalesOrd:E',	'SalesOrd:B', 'Estimate:A'], // Credit Memo:Open, Invoice:Open, Sales Order:Partially Fulfilled, Sales Order:Pending Billing, Sales Order:Pending Billing/Partially Fulfilled, Sales Order:Pending Fulfilled, Quote:Open
	            			'AND',
	            		[
	            			['mainname', search.Operator.ANYOF, customerID],
	            				'OR',
	            			['customer.parent', search.Operator.ANYOF, customerID] // Include subcustomers
	            		]
	            	],
    			
    		columns: [{
    			name: 'trandate'
    		},
    				{
    			name: 'mainname',
    			sort: search.Sort.ASC
    		},	
    				{
    			name: 'tranid'
    		},
    				{
    			name: 'type',
    			sort: search.Sort.ASC
    		},
    				{
    			name: 'statusref',
        		sort: search.Sort.ASC
    		},
    				{
    			name: 'fxamount'
    		}],

    	});
    	
    	// if tranType returns a value and is not equal to 0
    	if (tranType && tranType != 0)
    		{
	    		// add a new filter to the search to filter by the selected transaction type
				transactionSearch.filters.push(
												search.createFilter({
													name: 'type',
													operator: search.Operator.ANYOF,
													values: [tranType]
												})
											);
    		}
    	else
    		{
    			// add a new filter to the search to display all transaction types
				transactionSearch.filters.push(
												search.createFilter({
													name: 'type',
													operator: search.Operator.ANYOF,
													values: ['CustCred','CustInvc','Estimate','SalesOrd']
												})
											);
		    }
    	
    	// return the created search to the main script function
    	return transactionSearch;
    		
    }
    
    // ==========================================
    // FUNCTION TO SEND THE EMAIL TO THE CUSTOMER
    // ==========================================
    
    function sendEmail(files, customerID, emailAddress) {
    	
    	try
    		{
	    		// compile email content
	    	    var mergeResult = render.mergeEmail({
	    	    	templateId: emailTemplate,
	    	    	entity: 		{
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
	    	    	recipients:		emailAddress,
	    	    	subject:		emailSubject,
	    	    	body:			emailBody,
	    	    	attachments:	files,
	    	    	relatedRecords: {
	    	    		entityId: customerID
	    	    	}
	    	    });
    		}
    	catch(e)
    		{
	    		log.error({
					title: 'Error Sending Email',
					details: e
				});
    		}

    }

    return {
        onRequest: onRequest
    };
    
});
