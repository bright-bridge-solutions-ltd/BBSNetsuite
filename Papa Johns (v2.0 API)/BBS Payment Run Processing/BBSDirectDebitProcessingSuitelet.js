/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/task', 'N/ui/serverWidget', 'N/ui/dialog', 'N/ui/message','N/format', 'N/http','N/record', 'N/render', 'N/xml'],
/**
 * @param {runtime} runtime
 * @param {search} search
 * @param {task} task
 * @param {ui} ui
 * @param {dialog} dialog
 * @param {message} message
 */
function(runtime, search, task, serverWidget, dialog, message, format, http, record, render, xml) 
{
   
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
		    		//=============================================================================================
		    		//Prototypes
		    		//=============================================================================================
		    		//

	    		  
		    		//=============================================================================================
			    	//Main Code
			    	//=============================================================================================
			    	//
		    		var parameterFieldsDisplayMode = serverWidget.FieldDisplayType.HIDDEN;
					
					if(runtime.getCurrentScript().logLevel == 'DEBUG')
							{
								parameterFieldsDisplayMode = serverWidget.FieldDisplayType.NORMAL;
							}
	    		
					var today 					= new Date();
					var defaultCollectionDate 	= new Date();
					defaultCollectionDate.setDate(today.getDate() + 16);
					
		    		//Get parameters
					//
	    			var paramStage 				= Number(context.request.parameters['stage']);		//The stage the suitelet is in
	    			var paramClass				= context.request.parameters['class'];				
	    			var paramClassName			= context.request.parameters['classname'];			
	    			var paramEpos				= context.request.parameters['epos'];		
	    			var paramCustomer			= context.request.parameters['customer'];				
	    			var paramCustomerName		= context.request.parameters['customername'];				
	    			var paramAsOfDate			= context.request.parameters['asofdate'];				
	    			var paramCollectionDate		= context.request.parameters['collectiondate'];				
	    			var paramFranchisee			= context.request.parameters['franchisee'];				
	    			var paramFranchiseeName		= context.request.parameters['franchiseename'];				
	    			var paramCollectionQty		= context.request.parameters['collectionqty'];				
	    			
	    			paramStage 					= (paramStage == null || paramStage == '' || isNaN(paramStage) ? 1 : paramStage);
	    			paramCollectionDate			= (paramCollectionDate == null || paramCollectionDate == '' ? format.format({value: defaultCollectionDate, type: format.Type.DATE}) : paramCollectionDate);
	    			paramCollectionQty			= (paramCollectionQty == null || paramCollectionQty == '' ? 1 : paramCollectionQty);
	    			
					//Create a form
	    			//
		            var form = serverWidget.createForm({title: 	'Direct Debit Processing'});
		            
		            //Find the client script
	    			//
	    			var fileSearchObj = getResults(search.create({
												    			   type: 	"file",
												    			   filters:
															    			   [
															    			      ["name","is","BBSDirectDebitProcessingClient.js"]
															    			   ],
												    			   columns:
															    			   [
															    			      search.createColumn({
																				    			    	 name: "name",
																				    			         sort: search.Sort.ASC,
																				    			         label: "Name"
															    			      })
															    			   ]
												    			}));
	    			
	    			//Add the client side file to the form
	    			//
	    			if(fileSearchObj != null && fileSearchObj.length > 0)
	    				{
	    					form.clientScriptFileId = fileSearchObj[0].id;
	    				}
		    		
	    			//Add a field group for the parameter fields
					//
					var filtersGroup = form.addFieldGroup({
															id:		'custpage_parameter_group',
															label:	'Hidden'
															});
					
					//Add fields for the parameters
					//
					createField(form, 'custpage_param_stage', 		'Stage', 			parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramStage);					//Stage
					createField(form, 'custpage_param_class', 		'Class', 			parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramClass);					//Class
					createField(form, 'custpage_param_classname', 	'Class Name',		parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramClassName);				//Class name
					createField(form, 'custpage_param_epos', 		'EPOS',  			parameterFieldsDisplayMode,	serverWidget.FieldType.CHECKBOX,'custpage_parameter_group', paramEpos);						//EPOS
					createField(form, 'custpage_param_customer', 	'Customer', 		parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramCustomer);					//Customer
					createField(form, 'custpage_param_customername','Customer Name', 	parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramCustomerName);				//Customer name
					createField(form, 'custpage_param_asofdate', 	'As Of Date', 		parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramAsOfDate);					//As of date
					createField(form, 'custpage_param_franchisee', 	'Franchisee', 		parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramFranchisee);				//Franchisee
					createField(form, 'custpage_param_franchiseename','Franchisee Name',parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramFranchiseeName);			//Franchisee name
					createField(form, 'custpage_param_collectiondate','Collection Date',parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramCollectionDate);			//Collection date
					createField(form, 'custpage_param_collectionqty','Collection Qty',	parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramCollectionQty);			//Collection date
					
					
					
					//Work out what the form layout should look like based on the stage number
					//
					switch(paramStage)
						{	
							case 1:	
								
								
								//Add a field group for the selection
								//
								var filtersGroup = form.addFieldGroup({
																		id:		'custpage_selection_group',
																		label:	'Selection'
																		});
								
								//Add fields
								//
								var formField = form.addField({
													                id: 		'custpage_entry_collection_date',
													                type: 		serverWidget.FieldType.DATE,
													                label: 		'Collection Date',
													                container:	'custpage_selection_group'
												            		});
								formField.defaultValue 	= format.format({value: defaultCollectionDate, type: format.Type.DATE});
								formField.isMandatory 	= true;
								
								var formField = form.addField({
													                id: 		'custpage_entry_class',
													                type: 		serverWidget.FieldType.SELECT,
													                label: 		'Invoice Class',
													                source:		'classification',
													                container:	'custpage_selection_group'
												            		}).isMandatory = true;
								
								var formField = form.addField({
													                id: 		'custpage_entry_collect_qty',
													                type: 		serverWidget.FieldType.INTEGER,
													                label: 		'# Invoice To Collect',
													                container:	'custpage_selection_group'
												            		});
								formField.defaultValue 	= 1;
								
								var formField = form.addField({
													                id: 		'custpage_entry_epos',
													                type: 		serverWidget.FieldType.CHECKBOX,
													                label: 		'EPOS Invoices',
													                container:	'custpage_selection_group'
												            		});

								var formField = form.addField({
													                id: 		'custpage_entry_customer',
													                type: 		serverWidget.FieldType.SELECT,
													                label: 		'Store Name',
													                source:		record.Type.CUSTOMER,
													                container:	'custpage_selection_group'
												            		});

								var formField = form.addField({
													                id: 		'custpage_entry_franchisee',
													                type: 		serverWidget.FieldType.SELECT,
													                label: 		'Franchise Owner',
													                source:		'customlist_bbs_franchise_owner',
													                container:	'custpage_selection_group'
												            		});
								
								var formField = form.addField({
													                id: 		'custpage_entry_asofdate',
													                type: 		serverWidget.FieldType.DATE,
													                label: 		'As Of Due Date',
													                container:	'custpage_selection_group'
												            		});

								
								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Next'
										            });
					            
								break;
								
							case 2:
																
								//Add a field group for the filters
								//
								var filtersGroup = form.addFieldGroup({
																		id:		'custpage_selection_group',
																		label:	'Selection'
																		});
								var formField = form.addField({
																	    id: 		'custpage_entry_collection_date',
																	    type: 		serverWidget.FieldType.DATE,
																	    label: 		'Collection Date',
																	    container:	'custpage_selection_group'
																		});
								formField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								formField.defaultValue = format.parse({value: paramCollectionDate, type: format.Type.DATE});

								
								var formField = form.addField({
														                id: 		'custpage_entry_classname',
														                type: 		serverWidget.FieldType.TEXT,
														                label: 		'Invoice Class',
														                container:	'custpage_selection_group'
													            		});
								formField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								formField.defaultValue = paramClassName;
								
								
								
								var formField = form.addField({
														                id: 		'custpage_entry_eops',
														                type: 		serverWidget.FieldType.CHECKBOX,
														                label: 		'EPOS',
														                container:	'custpage_selection_group'
													            		});
								formField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								formField.defaultValue = paramEpos;

								var formField = form.addField({
														                id: 		'custpage_entry_collect_qty',
														                type: 		serverWidget.FieldType.TEXT,
														                label: 		'Invoices To Collect',
														                container:	'custpage_selection_group'
													            		});
								formField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								formField.defaultValue = paramCollectionQty;

								var formField = form.addField({
																	    id: 		'custpage_entry_customername',
																	    type: 		serverWidget.FieldType.TEXT,
																	    label: 		'Store Name',
																	    container:	'custpage_selection_group'
																		});
								formField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								formField.defaultValue = paramCustomerName;


								var formField = form.addField({
																	    id: 		'custpage_entry_franchiseename',
																	    type: 		serverWidget.FieldType.TEXT,
																	    label: 		'Franchise Owner',
																	    container:	'custpage_selection_group'
																		});
								formField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								formField.defaultValue = paramFranchiseeName;

								var formField = form.addField({
																	    id: 		'custpage_entry_asofdate',
																	    type: 		serverWidget.FieldType.DATE,
																	    label: 		'As Of Due Date',
																	    container:	'custpage_selection_group'
																		});
								formField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								
								if(paramAsOfDate != null && paramAsOfDate != '')
									{
										formField.defaultValue = format.parse({value: paramAsOfDate, type: format.Type.DATE});
									}

								//Add a subtab
								//
								var tab = form.addTab({
														id:		'custpage_tab_items',
														label:	'Transactions'
													});

								var tab2 = form.addTab({
														id:		'custpage_tab_dummy',
														label:	'.'
													});

								var dummyField = form.addField({
												                id: 		'custpage_entry_dummy',
												                type: 		serverWidget.FieldType.INLINEHTML,
												                label: 		'.',
												                container:	'custpage_tab_dummy'
											            		});
								
								//Add a sublist
								//
								var subList = form.addSublist({
																id:		'custpage_sublist_items', 
																type:	serverWidget.SublistType.LIST, 
																label:	'Transactions',
																tab:	'custpage_tab_items',
																type:	serverWidget.SublistType.INLINEEDITOR
															});
								
								
								
		
								//Add columns to sublist
								//
								//subList.addField({
								//					id:		'custpage_line_select',
								//					label:	'Select',
								//					type:	serverWidget.FieldType.CHECKBOX
								//				});		
				
								subList.addField({
													id:		'custpage_line_store_name',
													label:	'Store Name',
													type:	serverWidget.FieldType.TEXT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});		
								
								subList.addField({
													id:		'custpage_line_company_namne',
													label:	'Company Name',
													type:	serverWidget.FieldType.TEXT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});		
				
								subList.addField({
													id:		'custpage_line_franchisee',
													label:	'Franchisee',
													type:	serverWidget.FieldType.TEXT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});		

								subList.addField({
													id:		'custpage_line_doc_no',
													label:	'Document Number',
													type:	serverWidget.FieldType.TEXT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});		

								subList.addField({
													id:		'custpage_line_type',
													label:	'Type',
													type:	serverWidget.FieldType.TEXT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});		

								subList.addField({
													id:		'custpage_line_class',
													label:	'Invoice Class',
													type:	serverWidget.FieldType.TEXT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});		

								subList.addField({
													id:		'custpage_line_date',
													label:	'Date',
													type:	serverWidget.FieldType.DATE
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});		

								subList.addField({
													id:		'custpage_line_due_date',
													label:	'Due Date',
													type:	serverWidget.FieldType.DATE
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});		

								subList.addField({
													id:		'custpage_line_memo',
													label:	'Memo',
													type:	serverWidget.FieldType.TEXT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});		

								subList.addField({
													id:		'custpage_line_amount',
													label:	'Total Amount',
													type:	serverWidget.FieldType.CURRENCY
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});		
								
								subList.addField({
													id:		'custpage_line_paid_amount',
													label:	'Amount Paid',
													type:	serverWidget.FieldType.CURRENCY
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});		

								subList.addField({
													id:		'custpage_line_future_amount',
													label:	'Future Payment Amount',
													type:	serverWidget.FieldType.CURRENCY
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});		

								subList.addField({
													id:		'custpage_line_remaining_amount',
													label:	'Remaining Amount',
													type:	serverWidget.FieldType.CURRENCY
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});		

								subList.addField({
													id:		'custpage_line_installment_amount',
													label:	'Installment Amount',
													type:	serverWidget.FieldType.CURRENCY
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});		

								subList.addField({
													id:		'custpage_line_claim_amount',
													label:	'Amount To Claim',
													type:	serverWidget.FieldType.CURRENCY
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});		

								subList.addField({
													id:		'custpage_line_internalid',
													label:	'Internal Id',
													type:	serverWidget.FieldType.TEXT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});		

								
								//Add the mark all buttons
								//
								//subList.addMarkAllButtons();
								
								//Add a submit button
					            //
					            form.addSubmitButton({label: 'Process'});
					            

					            
					            //Find data for the sublist
					            //
					            var filterObj = 	[
					                            	 	["type","anyof","CustCred","CustInvc"], 			//Credit Note or Invoice
					                            	 	"AND", 
					                            	 	["mainline","is","T"], 								//Mainline
					                            	 	"AND", 
					                            	 	["status","anyof","CustCred:A","CustInvc:A"], 		//Open credit note or open invoice
					                            	 	"AND", 
					                            	 	["customer.custentity_2663_direct_debit","is","T"],	//Customer is a direct debit customer
					                            	 	"AND", 
					                            	    ["custbody_dd_in_query","is","F"],					//Transaction is not in query
					                            	    "AND", 
					                            	    ["formulanumeric: NVL({amountremaining},0) - NVL({custbody_dd_future_payments},0)","greaterthan","0"]	//Amount remaining minus amount on future payment runs > 0
							            	      	];
					            
					            if(paramClass != null && paramClass != '')
					            	{
					            		filterObj.push("AND", ["class","anyof",paramClass]);
					            		
					            		if(paramClass == 2)		//Food
					            			{
					            				if(paramEpos == 'T')
					            					{
					            						filterObj.push("AND", ["memo","contains","EPOS"]);
					            					}
					            				else
					            					{
					            						filterObj.push("AND", ["memo","doesnotcontain","EPOS"]);
					            					}
					            			}
					            	}
					            
					            if(paramCustomer != null && paramCustomer != '')
					            	{
					            		filterObj.push("AND", ["name","anyof",paramCustomer]);
					            	}
					            
					            if(paramFranchisee != null && paramFranchisee != '')
					            	{
					            		filterObj.push("AND", ["customer.custentity_bbs_franchise_owner","anyof",paramFranchisee]);
					            	}
			            
					            if(paramAsOfDate != null && paramAsOfDate != '')
					            	{
					            		filterObj.push("AND", ["duedate","onorbefore",paramAsOfDate]);
					            	}
		            
							            	     
							            	   
							            	
					            
					            var transactionSearchObj = getResults(search.create({
					            	   									type:			"transaction",
					            	   									filters:		filterObj,
					            	   									columns:
					            	   													[
					            	   													search.createColumn({name: "entity",sort: search.Sort.ASC,label: "Name"}),
					            	   													search.createColumn({name: "trandate",sort: search.Sort.ASC,label: "Date"}),
					            	   													search.createColumn({name: "type", label: "Type"}),
					            	   													search.createColumn({name: "tranid", label: "Document Number"}),
					            	   													search.createColumn({name: "memo", label: "Memo"}),
					            	   													search.createColumn({name: "amount", label: "Amount"}),
					            	   													search.createColumn({name: "companyname", join: "customer", label: "Comapny Name"}),
					            	   													search.createColumn({name: "entityid", join: "customer", label: "Company Id"}),
					            	   													search.createColumn({name: "custentity_bbs_franchise_owner", join: "customer", label: "Franchisee"}),
					            	   													search.createColumn({name: "duedate", label: "Due Date"}),
					            	   													search.createColumn({name: "internalid", label: "Internal Id"}),
					            	   													search.createColumn({name: "class", label: "Class"}),
					            	   													search.createColumn({name: "custbody_dd_future_payments", label: "Future Payment Run"}),
					            	   													search.createColumn({name: "amountpaid", label: "Amount Paid"}),
					            	   													search.createColumn({name: "amountremaining", label: "Amount Remaining"}),
					            	   													search.createColumn({name: "custbody_bbs_install_amount", label: "Installment Amount"})
					            	   													]
					            										}));
					            	
					            if(transactionSearchObj != null && transactionSearchObj.length > 0)
					            	{
					            		var sublistLineNo 			= -1;
					            		var currentCustomer			= transactionSearchObj[0].getValue({name: "entity"});
					            		var invoiceCount			= Number(0);
					            		var periodData				= getPeriodData(format.format({value: new Date(), type: format.Type.DATE}));		//What should this be?
					            		var invoiceCountFirstWeek	= Number(0);
					            		var invoiceCountLastWeek	= Number(0);
					            		var invoiceCountMiddleWeek	= Number(0);
					            		
					            		for (var searchLine = 0; searchLine < transactionSearchObj.length; searchLine++) 
						            		{
					            				//Get values from search
					            				//
					            				var lineEntityId			= transactionSearchObj[searchLine].getValue({name: "entity"});
												var lineInternalId			= transactionSearchObj[searchLine].getValue({name: "internalid"});
												var lineCompanyId			= transactionSearchObj[searchLine].getValue({name: "entityid", join: "customer"});
												var lineCompanyName			= transactionSearchObj[searchLine].getValue({name: "companyname", join: "customer"});
												var lineFranchisee			= transactionSearchObj[searchLine].getText({ name: "custentity_bbs_franchise_owner", join: "customer"});
												var lineDate				= transactionSearchObj[searchLine].getValue({name: "trandate"});
												var lineDueDate				= transactionSearchObj[searchLine].getValue({name: "duedate"});
												var lineType				= transactionSearchObj[searchLine].getText({ name: "type"});
												var lineClass				= transactionSearchObj[searchLine].getText({ name: "class"});
												var lineClassId				= transactionSearchObj[searchLine].getValue({name: "class"});
												var lineMemo				= transactionSearchObj[searchLine].getValue({name: "memo"});
												var lineDocumentNo			= transactionSearchObj[searchLine].getValue({name: "tranid"});
												var lineAmount				= transactionSearchObj[searchLine].getValue({name: "amount"});
												var lineFuturePaymentValue	= transactionSearchObj[searchLine].getValue({name: "custbody_dd_future_payments"});
												var lineAmountPaid			= transactionSearchObj[searchLine].getValue({name: "amountpaid"});
												var lineAmountRemaining		= transactionSearchObj[searchLine].getValue({name: "amountremaining"});
												var lineInstallmentAmount	= transactionSearchObj[searchLine].getValue({name: "custbody_bbs_install_amount"});
												
												//Set amount remaining to include amount on future payment runs
												//
												lineAmountRemaining = Number(lineAmountRemaining) - Number(lineFuturePaymentValue)
												lineAmountRemaining = lineAmountRemaining * (lineType == 'Credit Memo' ? -1.0 : 1.0);
												
												//
												//Work out if we want to display an invoice based on class & quantity to display
												//
												
												//Changed customer?
												//
												if(lineEntityId != currentCustomer)
													{
														currentCustomer 		= lineEntityId;		//Save the current customer
														invoiceCount			= Number(0);		//Reset the count of invoices displayed
														invoiceCountFirstWeek	= Number(0);
									            		invoiceCountLastWeek	= Number(0);
									            		invoiceCountMiddleWeek	= Number(0);
									            		
													}
												
												//Only concerned with invoices
												//
												if(lineType == 'Invoice')
													{
														//If the remaining amount is less than zero, we need to skip it
														//
														if(lineAmountRemaining < 0)
															{
																continue;
															}
														
														//Royalty (1), Food - EPOS (2), Loan (3)
														//
														if(lineClassId == 1 || (lineClassId == 2 && paramEpos == 'T')  || lineClassId == 3)
															{
																//Have we reached the limit?
																//
																if(invoiceCount == Number(paramCollectionQty))
																	{
																		continue;	//Skip on to the next iteration of the loop
																	}
																else
																	{
																		invoiceCount++;
																	}
															}
														
														//Property (5), Misc (6), Turnkey (4)
														//
														if(lineClassId == 5 || lineClassId == 6 || lineClassId == 4)
															{
																//Do nothing, no limit on these classes of invoices
																//
															}
														
														//Food - NOT EPOS (2)
														//
														if(lineClassId == 2 && paramEpos != 'T')
															{
																//Have we reached the limit for the invoices from the first week of the period
																//
																if(isDateBetween(format.parse({value: lineDate, type: format.Type.DATE}), periodData.periodFirstWeekStart, periodData.periodFirstWeekEnd))
																	{
																		if(invoiceCountFirstWeek == 2)
																			{
																				continue;	//Skip on to the next iteration of the loop
																			}
																		else
																			{
																				invoiceCountFirstWeek++;
																			}
																	}
																
																//Have we reached the limit for the invoices from the middle weeks of the period
																//
																if(isDateBetween(format.parse({value: lineDate, type: format.Type.DATE}), periodData.periodMiddleWeeksStart, periodData.periodMiddleWeeksEnd))
																	{
																		if(invoiceCountMiddleWeek == 3)
																			{
																				continue;	//Skip on to the next iteration of the loop
																			}
																		else
																			{
																			invoiceCountMiddleWeek++;
																			}
																	}
																
																//Have we reached the limit for the invoices from the last week of the period
																//
																if(isDateBetween(format.parse({value: lineDate, type: format.Type.DATE}), periodData.periodLastWeekStart, periodData.periodLastWeekEnd))
																	{
																		if(invoiceCountLastWeek == 2)
																			{
																				continue;	//Skip on to the next iteration of the loop
																			}
																		else
																			{
																				invoiceCountLastWeek++;
																			}
																	}
																
															}
													}
												
												
												
												//Populate sublist
												//
												sublistLineNo++;
												
												if(lineCompanyId != null && lineCompanyId != '')
													{
														subList.setSublistValue({id : 'custpage_line_store_name', line : sublistLineNo, value : lineCompanyId});
													}
											
												if(lineCompanyName != null && lineCompanyName != '')
													{
														subList.setSublistValue({id : 'custpage_line_company_namne', line : sublistLineNo, value : lineCompanyName});
													}
											
												if(lineFranchisee != null && lineFranchisee != '')
													{
														subList.setSublistValue({id : 'custpage_line_franchisee', line : sublistLineNo, value : lineFranchisee});
													}
												
												if(lineType != null && lineType != '')
													{
														subList.setSublistValue({id : 'custpage_line_type', line : sublistLineNo, value : lineType});
													}
											
												if(lineDocumentNo != null && lineDocumentNo != '')
													{
														subList.setSublistValue({id : 'custpage_line_doc_no', line : sublistLineNo, value : lineDocumentNo});
													}
												
												if(lineClass != null && lineClass != '')
													{
														subList.setSublistValue({id : 'custpage_line_class', line : sublistLineNo, value : lineClass});
													}
												
												if(lineDate != null && lineDate != '')
													{
														subList.setSublistValue({id : 'custpage_line_date', line : sublistLineNo, value : lineDate});
													}
												
												if(lineDueDate != null && lineDueDate != '')
													{
														subList.setSublistValue({id : 'custpage_line_due_date', line : sublistLineNo, value : lineDueDate});
													}
												
												if(lineMemo != null && lineMemo != '')
													{
														subList.setSublistValue({id : 'custpage_line_memo', line : sublistLineNo, value : lineMemo});
													}
												
												if(lineAmount != null && lineAmount != '')
													{
														subList.setSublistValue({id : 'custpage_line_amount', line : sublistLineNo, value : format.parse({value: lineAmount, type: format.Type.CURRENCY}) });
													}
												
												if(lineFuturePaymentValue != null && lineFuturePaymentValue != '')
													{
														subList.setSublistValue({id : 'custpage_line_future_amount', line : sublistLineNo, value : format.parse({value: lineFuturePaymentValue, type: format.Type.CURRENCY}) });
													}
												else
													{
														subList.setSublistValue({id : 'custpage_line_future_amount', line : sublistLineNo, value : format.parse({value: '0', type: format.Type.CURRENCY}) });
													}
											
												if(lineAmountPaid != null && lineAmountPaid != '')
													{
														subList.setSublistValue({id : 'custpage_line_paid_amount', line : sublistLineNo, value : format.parse({value: lineAmountPaid, type: format.Type.CURRENCY}) });
													}
												
												if(lineAmountRemaining != null && lineAmountRemaining != '')
													{
														subList.setSublistValue({id : 'custpage_line_remaining_amount', line : sublistLineNo, value : format.parse({value: lineAmountRemaining, type: format.Type.CURRENCY}) });
													}
												
												if(lineInstallmentAmount != null && lineInstallmentAmount != '')
													{
														subList.setSublistValue({id : 'custpage_line_installment_amount', line : sublistLineNo, value : format.parse({value: lineInstallmentAmount, type: format.Type.CURRENCY}) });
													}
												else
													{
														subList.setSublistValue({id : 'custpage_line_installment_amount', line : sublistLineNo, value : format.parse({value: '0', type: format.Type.CURRENCY}) });
													}
											
												if(lineInternalId != null && lineInternalId != '')
													{
														subList.setSublistValue({id : 'custpage_line_internalid', line : sublistLineNo, value : lineInternalId});
													}
											
												//Work out how much to claim
												//
												var claimAmount 		= Number(0);
												var installmentAmount 	= Number(lineInstallmentAmount);
												var remainingAmount 	= Number(lineAmountRemaining);
												
												if(lineType == 'Invoice')
													{
														//If the installment is zero then we need to use the remaining amount
														//
														if(installmentAmount == 0)
															{
																claimAmount = remainingAmount;
															}
													
														//If the installment is more than the remaining amount then we need to use the remaining amount, so as not to over claim
														//
														if(installmentAmount > remainingAmount)
															{
																claimAmount = remainingAmount;
															}
														
														//If the installment is not zero & less than the remaining amount, the use the installment amount
														//
														if(installmentAmount != 0 && installmentAmount < remainingAmount)
															{
																claimAmount = installmentAmount;
															}
														
														//If the installment is not zero & the difference between the installment amount & the remaining amount is less than 1, then use the remaining amount
														//
														if(installmentAmount != 0 && Math.abs(installmentAmount - remainingAmount) <= 1.0) 
															{
																claimAmount = remainingAmount;
															}
														
														subList.setSublistValue({id : 'custpage_line_claim_amount', line : sublistLineNo, value : format.parse({value: claimAmount, type: format.Type.CURRENCY}) });
													}
												else
													{	
														//Credit notes - claim amount will always be the amount remaining
														//
														subList.setSublistValue({id : 'custpage_line_claim_amount', line : sublistLineNo, value : format.parse({value: remainingAmount, type: format.Type.CURRENCY}) });
													}
											}
					            	}

								break;
								
							case 3:
								//Add a message field 
								//
								var formField = form.addField({
															    id: 		'custpage_message',
															    type: 		serverWidget.FieldType.TEXTAREA,
															    label: 		'Message'
																});
								
								formField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								formField.defaultValue = 'Payment Run Creation In Progress';
								formField.updateDisplaySize({height: 10, width: 120});
								
								break;
						}
		            
		            //Return the form to the user
		            //
		            context.response.writePage(form);
		        } 
		    else 
		    	{
		    		var request = context.request;

					//Get the stage of the processing we are at
					//
		    		var paramStage        	= Number(request.parameters['custpage_param_stage']); 
		    		var paramClass        	= request.parameters['custpage_param_class'];        
		    		var paramClassName    	= request.parameters['custpage_param_classname'];      
		    		var paramEpos       	= request.parameters['custpage_param_epos'];   
		    		var paramCustomer     	= request.parameters['custpage_param_customer'];       
		    		var paramCustomerName	= request.parameters['custpage_param_customername'];       
		    		var paramAsOfDate     	= request.parameters['custpage_param_asofdate'];       
		    		var paramCollectionDate = request.parameters['custpage_param_collectiondate'];       
		    		var paramFranchisee     = request.parameters['custpage_param_franchisee'];       
		    		var paramFranchiseeName	= request.parameters['custpage_param_franchiseename']; 
		    		var paramCollectionQty	= request.parameters['custpage_param_collectionqty']; 
		    		
					//Process based on stage
					//
					switch(paramStage)
						{
							case 1:
								//Increment the stage
								//
								paramStage++;
								
								//Call the suitelet again
								//
								context.response.sendRedirect({
														type: 			http.RedirectType.SUITELET, 
														identifier: 	runtime.getCurrentScript().id, 
														id: 			runtime.getCurrentScript().deploymentId, 
														parameters:		{
																			stage: 			paramStage,					
																			class:			paramClass,
																			classname:		paramClassName,
																			epos:			paramEpos,
																			customer:		paramCustomer,
																			customername:	paramCustomerName,
																			asofdate:		paramAsOfDate,
																			collectiondate:	paramCollectionDate,
																			franchisee:		paramFranchisee,
																			franchiseename:	paramFranchiseeName,
																			collectionqty:	paramCollectionQty
																		}
														});
								
								break;
								
							case 2:
								
								
								//Loop through all of the lines in the sublist
								//
								var invoices 			= [];
								var paymentDate 		= request.parameters['custpage_entry_if_id'];
								
								var sublistLineCount 	= request.getLineCount({group: 'custpage_sublist_items'});
										
								for (var int = 0; int < sublistLineCount; int++) 
									{
										var itemLineClaim = request.getSublistValue({
								  														group: 	'custpage_sublist_items',
								  														name: 	'custpage_line_claim_amount',
																		    		    line: 	int
																	    			});

										var itemLineId = request.getSublistValue({
																						group: 	'custpage_sublist_items',
																						name: 	'custpage_line_internalid',
																						line: 	int
																    				});
	
								  		var invoice 			= new Object();
								 		invoice.line 			= int;
								 		invoice.data 			= {};
								 		invoice.data.invoiceID 	= itemLineId;
								 		invoice.data.amount 	= itemLineClaim;
								 		invoice.data.inquery 	= 'F';
								 		invoice.data.date 		= paramCollectionDate;
								 		invoice.data.sender 	= runtime.getCurrentUser().id;
								 		invoices.push(invoice);     
									}

								//Call the map/reduce script to process the data
								//
								var invoicesData 			= JSON.stringify(invoices);
						 		var mapReduceTask 			= task.create({taskType: task.TaskType.MAP_REDUCE});
						 		
						 		mapReduceTask.scriptId 		= 'customscript_mr_create_payment_run';
						 		mapReduceTask.deploymentId 	= 'customdeploy_mr_create_payment_run';
						 		mapReduceTask.params 		= {custscript_invoice_data: invoicesData};
						 		
						// 		var mapReduceTaskId 		= mapReduceTask.submit();
						 		
								//Increment the stage
								//
								paramStage++;
								
								//Call the suitelet again
								//
								context.response.sendRedirect({
														type: 			http.RedirectType.SUITELET, 
														identifier: 	runtime.getCurrentScript().id, 
														id: 			runtime.getCurrentScript().deploymentId, 
														parameters:		{
																			stage: 			paramStage
																		}
														});
								
								
								break;
						}
		        }
	    }
    
    //Is a date between two other dates
    //
    function isDateBetween(_date, _startDate, _endDate)
    	{
    		var result = false;
    		
    		if(_date.getTime() >= _startDate.getTime() && _date.getTime() <= _endDate.getTime())
    			{
    				result = true;
    			}
    		
    		return result;
    	}
    
    //Find the relevant period info
    //
    function getPeriodData(_periodDate)
    	{
    		var periodData = {};
    		
    		//Find the period record for the passed in date
    		//
    		var accountingperiodSearchObj = getResults(search.create({
    																	type: 		"accountingperiod",
    																	filters:
    																				[
    																				 	["isinactive","is","F"], 
    																				 	"AND", 
    																				 	["isquarter","is","F"], 
    																				 	"AND", 
    																				 	["isyear","is","F"], 
    																				 	"AND", 
    																				 	["startdate","onorbefore",_periodDate], 
    																				 	"AND", 
    																				 	["enddate","onorafter",_periodDate]
    																				 ],
    																	columns:
    																				[
    																				 	search.createColumn({name: "periodname", sort: search.Sort.ASC,label: "Name"}),
    																				 	search.createColumn({name: "startdate", label: "Start Date"}),
    																				 	search.createColumn({name: "enddate", label: "End Date"})
    																				 ]
    																	}));
    			
    		if(accountingperiodSearchObj != null && accountingperiodSearchObj.length > 0)
    			{
    				var periodStart	= format.parse({value: accountingperiodSearchObj[0].getValue({name: "startdate"}), type: format.Type.DATE});
    				var periodEnd	= format.parse({value: accountingperiodSearchObj[0].getValue({name: "enddate"}), type: format.Type.DATE});
    				
    				var periodFirstWeekStart	= new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate());
    				var periodFirstWeekEnd		= new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate());
    				periodFirstWeekEnd.setDate(periodFirstWeekEnd.getDate() + 6);
    				
    				var periodMiddleWeeksStart	= new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate());
    				periodMiddleWeeksStart.setDate(periodMiddleWeeksStart.getDate() + 7);
    				
    				var periodMiddleWeeksEnd	= new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate());
    				periodMiddleWeeksEnd.setDate(periodMiddleWeeksEnd.getDate() + 20);
    				
    				var periodLastWeekStart	= new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate());
    				periodLastWeekStart.setDate(periodLastWeekStart.getDate() + 21);
    				
    				var periodLastWeekEnd	= new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate());
    				periodLastWeekEnd.setDate(periodLastWeekEnd.getDate() + 27);
    				
    				periodData.periodStart 				= periodStart;
    				periodData.periodEnd 				= periodEnd;
    				periodData.periodFirstWeekStart 	= periodFirstWeekStart;
    				periodData.periodFirstWeekEnd 		= periodFirstWeekEnd;
    				periodData.periodMiddleWeeksStart 	= periodMiddleWeeksStart;
    				periodData.periodMiddleWeeksEnd 	= periodMiddleWeeksEnd;
    				periodData.periodLastWeekStart		= periodLastWeekStart;
    				periodData.periodLastWeekEnd		= periodLastWeekEnd;
    			}
    		
    		return periodData;
    	}
    
    //Create a field on the form
    //
    function createField(_form, _fieldName, _label, _displayMode, _dataType, _container, _defaultValue)
    	{
	    	
			var parameterField = _form.addField({
								                id: 		_fieldName,
								                type: 		_dataType,
								                label: 		_label,
								                container:	_container
								        		});

			if(_displayMode)
				{
					parameterField.updateDisplayType({displayType: _displayMode});
				}
			
			parameterField.defaultValue = _defaultValue;
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

    function isNullorBlank(_string, _replacer)
    	{
    		return (_string == null || _string == '' ? _replacer : _string);
    	}
    
    return {onRequest: onRequest};
});

