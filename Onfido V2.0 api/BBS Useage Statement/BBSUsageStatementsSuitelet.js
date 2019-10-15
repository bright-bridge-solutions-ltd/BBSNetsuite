/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/task', 'N/ui/serverWidget', 'N/ui/dialog', 'N/ui/message','N/format', 'N/http','N/record'],
/**
 * @param {runtime} runtime
 * @param {search} search
 * @param {task} task
 * @param {ui} ui
 * @param {dialog} dialog
 * @param {message} message
 */
function(runtime, search, task, serverWidget, dialog, message, format, http, record) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) 
	    {
	    	if (context.request.method === http.Method.GET) 
		    	{
		    		//Get parameters
					//
	    			var paramStatus = context.request.parameters['status'];						//The contract sttaus
	    			var paramBillType = context.request.parameters['type'];						//The billing type
	    			var paramStatementDate = context.request.parameters['statementdate'];		//The statement date
	    			var paramCustomer = context.request.parameters['customer'];					//The customer
					
		    		var paramStage = Number(context.request.parameters['stage']);				//The stage the suitelet is in
					var stage = (paramStage == null || paramStage == '' || isNaN(paramStage) ? 1 : paramStage);
			
	    			//Create a form
	    			//
		            var form = serverWidget.createForm({
					                						title: 	'Create Usage Statements'
					            						});
		            
		            //Store the current stage in a field in the form so that it can be retrieved in the POST section of the code
					//
					var stageParamField = form.addField({
											                id: 	'custpage_param_stage',
											                type: 	serverWidget.FieldType.INTEGER,
											                label: 	'Stage'
										            	});

					stageParamField.updateDisplayType({
														displayType: 	serverWidget.FieldDisplayType.HIDDEN
														});
					
					stageParamField.defaultValue = stage;
					
					
					//Store the statement date in a field in the form so that it can be retrieved in the POST section of the code
					//
					var dateParamField = form.addField({
											                id: 	'custpage_param_date',
											                type: 	serverWidget.FieldType.TEXT,
											                label: 	'Date'
										            	});

					dateParamField.updateDisplayType({
														displayType: 	serverWidget.FieldDisplayType.HIDDEN
														});
					
					dateParamField.defaultValue = paramStatementDate;
					
					
					//Work out what the form layout should look like based on the stage number
					//
					switch(stage)
						{
							case 1:	
								
								//Add a field for the statement date
								//
								var statementDateField = form.addField({
													                id: 	'custpage_entry_stmt_date',
													                type: 	serverWidget.FieldType.DATE,
													                label: 	'Satement Date'
												            		});

								statementDateField.defaultValue = format.format({
																				value: 	new Date(), 
																				type: 	format.Type.DATE
																				});
								statementDateField.isMandatory = true;
								
								//Add a field to filter by customer
								//
								var contractStatusField = form.addField({
														                id: 	'custpage_entry_cont_cust',
														                type: 	serverWidget.FieldType.MULTISELECT,
														                label: 	'Customer',
														                source:	record.Type.CUSTOMER
													            		});
						
								//Add a field to filter by contract status
								//
								var contractStatusField = form.addField({
														                id: 	'custpage_entry_cont_status',
														                type: 	serverWidget.FieldType.MULTISELECT,
														                label: 	'Contract Status',
														                source:	'customlist_bbs_contract_status'
													            		});

								//Add a field to filter by contract billing type
								//
								var contractBillingTypeField = form.addField({
														                id: 	'custpage_entry_cont_bill_type',
														                type: 	serverWidget.FieldType.MULTISELECT,
														                label: 	'Billing Type',
														                source:	'customlist_bbs_contract_billing_type'
													            		});

								
								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Select Contracts'
										            });
					            
								break;
								
							case 2:
								
								var tab = form.addTab({
														id:		'custpage_tab_items',
														label:	'Contracts To Select For Usage Statements'
													});
								
								
								var subList = form.addSublist({
																id:		'custpage_sublist_items', 
																type:	serverWidget.SublistType.LIST, 
																label:	'Contracts',
																tab:	'custpage_tab_items'
															});
								
								//Add columns to sublist
								//
								subList.addField({
													id:		'custpage_sl_items_ticked',
													label:	'Select',
													type:	serverWidget.FieldType.CHECKBOX
												});		
								
								subList.addField({
													id:		'custpage_sl_items_con_id',
													label:	'Internal Id',
													type:	serverWidget.FieldType.INTEGER
												});		

								subList.addField({
													id:		'custpage_sl_items_name',
													label:	'Contract Id',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_items_status',
													label:	'Status',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_items_cust',
													label:	'Customer',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_items_start',
													label:	'Start Date',
													type:	serverWidget.FieldType.DATE
												});		

								subList.addField({
													id:		'custpage_sl_items_end',
													label:	'End Date',
													type:	serverWidget.FieldType.DATE
												});		

								subList.addField({
													id:		'custpage_sl_items_bill_type',
													label:	'Billing Type',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_items_term',
													label:	'Contract Term',
													type:	serverWidget.FieldType.INTEGER
												});		

								
								
								//Add required buttons to sublist 
								//
								subList.addMarkAllButtons();

								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Generate Statements'
										            });
					            
					            //Search the contracts & add filters if required
					            //
					            var filters = [];
					            
					            if(paramBillType != null && paramBillType != '')
					            	{
					            		filters.push(["custrecord_bbs_contract_billing_type","anyof",paramBillType.split('\x05')]);
					            	}
					            
					            if(paramStatus != null && paramStatus != '')
					            	{	
					            		if(filters.length > 0)
					            			{
					            				filters.push("AND");
					            			}
					            		
					            		filters.push(["custrecord_bbs_contract_status","anyof",paramStatus.split('\x05')]);
					            	}
				            
					            if(paramCustomer != null && paramCustomer != '')
					            	{	
					            		if(filters.length > 0)
					            			{
					            				filters.push("AND");
					            			}
					            		
					            		filters.push(["custrecord_bbs_contract_customer","anyof",paramCustomer.split('\x05')]);
					            	}
			            
					            var customrecord_bbs_contractSearchObj = getResults(search.create({
					            	   type: 	"customrecord_bbs_contract",
					            	   filters:	filters,
					            	   columns:
					            	   [
					            	      search.createColumn({name: "name", sort: search.Sort.ASC, label: "ID"}),
					            	      search.createColumn({name: "custrecord_bbs_contract_status", label: "Status"}),
					            	      search.createColumn({name: "custrecord_bbs_contract_customer", label: "Customer"}),
					            	      search.createColumn({name: "custrecord_bbs_contract_start_date", label: "Contract Start Date"}),
					            	      search.createColumn({name: "custrecord_bbs_contract_end_date", label: "Contract End Date"}),
					            	      search.createColumn({name: "custrecord_bbs_contract_billing_type", label: "Billing Type"}),
					            	      search.createColumn({name: "custrecord_bbs_contract_term", label: "Contract Term in Months"})
					            	   ]
					            	}));
					            	
					            //Process search results
					            //
					            if(customrecord_bbs_contractSearchObj != null && customrecord_bbs_contractSearchObj.length > 0)
					            	{
					            		for (var int = 0; int < customrecord_bbs_contractSearchObj.length; int++) 
						            		{
						            			subList.setSublistValue({
																		id:		'custpage_sl_items_con_id',
																		line:	int,
																		value:	customrecord_bbs_contractSearchObj[int].id
																		});	
						
												subList.setSublistValue({
																		id:		'custpage_sl_items_name',
																		line:	int,
																		value:	customrecord_bbs_contractSearchObj[int].getValue({name: "name"})
																		});	
												
												subList.setSublistValue({
																		id:		'custpage_sl_items_status',
																		line:	int,
																		value:	customrecord_bbs_contractSearchObj[int].getText({name: "custrecord_bbs_contract_status"})
																		});	
												
												subList.setSublistValue({
																		id:		'custpage_sl_items_cust',
																		line:	int,
																		value:	customrecord_bbs_contractSearchObj[int].getText({name: "custrecord_bbs_contract_customer"})
																		});	
												
												subList.setSublistValue({
																		id:		'custpage_sl_items_start',
																		line:	int,
																		value:	customrecord_bbs_contractSearchObj[int].getValue({name: "custrecord_bbs_contract_start_date"})
																		});	
												
												subList.setSublistValue({
																		id:		'custpage_sl_items_end',
																		line:	int,
																		value:	customrecord_bbs_contractSearchObj[int].getValue({name: "custrecord_bbs_contract_end_date"})
																		});	
												
												subList.setSublistValue({
																		id:		'custpage_sl_items_bill_type',
																		line:	int,
																		value:	customrecord_bbs_contractSearchObj[int].getText({name: "custrecord_bbs_contract_billing_type"})
																		});	
												
												subList.setSublistValue({
																		id:		'custpage_sl_items_term',
																		line:	int,
																		value:	customrecord_bbs_contractSearchObj[int].getValue({name: "custrecord_bbs_contract_term"})
																		});	
											}
					            	}
					            
								break;
						}
		            
		            //Return the form to the user
		            //
		            context.response.writePage(form);
		        } 
		    else 
		    	{
		    		var request = context.request;
		    		
		            //Post request - so process the returned form
					//
					
					//Get the stage of the processing we are at
					//
					var stage = Number(request.parameters['custpage_param_stage']);
					
					//Process based on stage
					//
					switch(stage)
						{
							case 1:
								
								//Get user entered parameters
								//
								var statmentDate = request.parameters['custpage_entry_stmt_date']
								var contractStatus = request.parameters['custpage_entry_cont_status']
								var billingType = request.parameters['custpage_entry_cont_bill_type']
								var customer = request.parameters['custpage_entry_cont_cust']
								
								//Increment the stage
								//
								stage++;
								
								//Call the suitelet again
								//
								context.response.sendRedirect({
														type: 			http.RedirectType.SUITELET, 
														identifier: 	runtime.getCurrentScript().id, 
														id: 			runtime.getCurrentScript().deploymentId, 
														parameters:		{
																			stage: 			stage,
																			statementdate: 	statmentDate,
																			status:			contractStatus,
																			type:			billingType,
																			customer:		customer
																		}
														});
								
								break;
								
							case 2:
								
								var contractIds = [];
								var statementDate = context.request.parameters['custpage_param_date'];
								
								//Find all of the lines that are ticked 
								//
								var lineCount = context.request.getLineCount({
																			group:	'custpage_sublist_items'
																			});
								
								for (var int2 = 0; int2 < lineCount; int2++) 
									{
										var ticked = context.request.getSublistValue({
																					group:	'custpage_sublist_items',
																					name:	'custpage_sl_items_ticked',
																					line:	int2
																					});
										
										if(ticked == 'T')
											{
												var id = context.request.getSublistValue({
																							group:	'custpage_sublist_items',
																							name:	'custpage_sl_items_con_id',
																							line:	int2
																							});
	
												contractIds.push(id);
											}
									}
								 
								//Submit the scheduled job to produce usage statements
								//
								var mrTask = task.create({
														taskType:		task.TaskType.MAP_REDUCE,
														scriptId:		'customscript_bbs_usage_stmts_sched',	
														deploymentid:	null,
														params:			{
																			custscript_contract_array:	JSON.stringify(contractIds),
																			custscript_statement_date: statementDate
																		}
								});
								
								mrTask.submit();
								
								//Return to the main dashboard
								//
								context.response.sendRedirect({
																type: 			http.RedirectType.TASK_LINK, 
																identifier: 	'CARD_-29' 
																});
			
								
								break;
					
						}
		        }
	    }
    
    //Page through results set from search
    //
    function getResults(_searchObject)
	    {
	    	var results = [];
	
	    	var pageData = _searchObject.runPaged({pageSize: 1000});
	
	    	for (var int = 0; int < pageData.pageRanges.length; int++) 
	    		{
	    			var searchPage = pageData.fetch({index: int});
	    			var data = searchPage.data;
	    			
	    			results = results.concat(data);
	    		}
	
	    	return results;
	    }

    return {onRequest: onRequest};
});
