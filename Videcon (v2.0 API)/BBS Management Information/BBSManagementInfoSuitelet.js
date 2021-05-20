/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/task', 'N/ui/serverWidget', 'N/ui/dialog', 'N/ui/message','N/format', 'N/http','N/record', 'N/url'],
/**
 * @param {runtime} runtime
 * @param {search} search
 * @param {task} task
 * @param {ui} ui
 * @param {dialog} dialog
 * @param {message} message
 */
function(runtime, search, task, serverWidget, dialog, message, format, http, record, url) 
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
		    			
	    		
	    			var paramLocation 		= context.request.parameters['location'];	
	    			var paramCustomer 		= context.request.parameters['customer'];	
	    			var title				= 'Sales Order Status Overview';
	    			
		    		//Create a form
	    			//
		    		if((paramLocation != null && paramLocation != '') || (paramCustomer != null && paramCustomer != ''))
						{
							title = 'Sales Order Status Overview (**Filtered**)';
						}
				
		            var form = serverWidget.createForm({title: 	title});
		            
		            //Add a submit button
		            //
		            form.addSubmitButton({
							            	label: 'Refresh'
							            	});
								
								//Add a tab
								//
								var tab = form.addTab({
													id:		'custpage_tab_items',
													label:	'Results'
													});
							
								
								var fieldGroupFilters = form.addFieldGroup({
																			id:		'custpage_group_filters',
																			label:	'Available Filters'
																			});
/*								
								var fieldGroupSelectedFilters = form.addFieldGroup({
																			id:		'custpage_group_selected_filters',
																			label:	'Selected Filters'
																			});
*/
								var fieldFilterLocation = form.addField({
																		id:			'custpage_field_location',
																		label:		'Inventory Location',
																		type:		serverWidget.FieldType.SELECT,
																		source:		record.Type.LOCATION,
																		container:	'custpage_group_filters'
																		});
								
								var fieldFilterLocation = form.addField({
																		id:			'custpage_field_customer',
																		label:		'Customer',
																		type:		serverWidget.FieldType.SELECT,
																		source:		record.Type.CUSTOMER,
																		container:	'custpage_group_filters'
																		});
/*
								var fieldFilterLocation = form.addField({
																		id:			'custpage_field_location',
																		label:		'Inventory Location',
																		type:		serverWidget.FieldType.TEXT,
																		container:	'custpage_group_selected_filters'
																		}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

								var fieldFilterLocation = form.addField({
																		id:			'custpage_field_customer',
																		label:		'Customer',
																		type:		serverWidget.FieldType.TEXT,
																		container:	'custpage_group_selected_filters'
																		}).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
*/
								
								
								
								
								
								//=====================================================================================================================
								//
								//	Overall Summary
								//
								//=====================================================================================================================
								
								var line = Number(-1)
								
								//Add a sub tab
								//
								var subtab0 = form.addSubtab({
															id: 	'custpage_subtab_summary',
															label:	'Overall Summary',
															tab:	'custpage_tab_items'
															})	
								
								//Add fields to sub tab
								//
								var fieldTotalBackOrder = form.addField({
												id:			'custpage_sl0_tot_bo',
												label:		'Back Order Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_summary'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
								
								var fieldTotalCommitted = form.addField({
												id:			'custpage_sl0_tot_com',
												label:		'Committed Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_summary'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
					
								var fieldTotalRequired = form.addField({
												id:			'custpage_sl0_tot_req',
												label:		'Required Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_summary'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalInProgress = form.addField({
												id:			'custpage_sl0_tot_ip',
												label:		'In Progress Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_summary'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalShip = form.addField({
												id:			'custpage_sl0_tot_ship',
												label:		'Ship Sales Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_summary'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
								
								var fieldTotalNonShip = form.addField({
												id:			'custpage_sl0_tot_no_ship',
												label:		'Non Ship Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_summary'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
					
								//Add a sublist to subtab
								//
								var subList0 = form.addSublist({
																id:		'custpage_sublist_summary', 
																type:	serverWidget.SublistType.LIST, 
																label:	'Overall Summary',
																tab:	'custpage_subtab_summary'
																});
								
								//Add columns to sublist
								//
								subList0.addField({
													id:		'custpage_sl0_type',
													label:	'Type',
													type:	serverWidget.FieldType.TEXT
												});													//Type
					
								subList0.addField({
													id:		'custpage_sl0_inv_loc',
													label:	'Inventory Location',
													type:	serverWidget.FieldType.TEXT
												});													//Inventory Location
					
								
								
								subList0.addField({
													id:		'custpage_sl0_doc_no',
													label:	'Document No',
													type:	serverWidget.FieldType.TEXT
												});													//Document No
					
												
								
								
								var linkField = subList0.addField({
													id:		'custpage_sl0_doc_link',
													label:	'View',
													type:	serverWidget.FieldType.URL
												});													//Item url link
					
								linkField.linkText = 'View';
								
								
								subList0.addField({
													id:		'custpage_sl0_ship_complete',
													label:	'Ship Complete',
													type:	serverWidget.FieldType.TEXT				//Ship Complete
												});		
														
				
								subList0.addField({
													id:		'custpage_sl0_ship_date',
													label:	'Ship Date',
													type:	serverWidget.FieldType.TEXT
												});													//Ship date
					
								
								subList0.addField({
													id:		'custpage_sl0_name',
													label:	'Name',
													type:	serverWidget.FieldType.TEXT
												});													//Name
	
				
								subList0.addField({
													id:		'custpage_sl0_back_order',
													label:	'Back Order Qty',
													type:	serverWidget.FieldType.FLOAT
												});													//Back Order qty
					
				
								subList0.addField({
													id:		'custpage_sl0_committed',
													label:	'Committed Stock',
													type:	serverWidget.FieldType.FLOAT
												});													//Committed
					
								subList0.addField({
													id:		'custpage_sl0_required',
													label:	'Required Stock',
													type:	serverWidget.FieldType.FLOAT
												});													//Required Stock
	
								subList0.addField({
													id:		'custpage_sl0_in_progress',
													label:	'In Progress',
													type:	serverWidget.FieldType.FLOAT
												});													//In Progress
	
								subList0.addField({
													id:		'custpage_sl0_ship_sales',
													label:	'Ship Sales Value',
													type:	serverWidget.FieldType.CURRENCY
												});													//Ship Sales Value
	
								subList0.addField({
													id:		'custpage_sl0_no_ship_sales',
													label:	'Non Ship Sales Value',
													type:	serverWidget.FieldType.CURRENCY
												});													//No Ship Sales VCalue
	
								
								var totalBackOrder			= Number(0);
								var totalCommitted			= Number(0);
								var totalRequired			= Number(0);
								var totalInProgress			= Number(0);
								var totalShip				= Number(0);
								var totalNonShip			= Number(0);
								
								var filters = [
											      ["type","anyof","SalesOrd"], 
											      "AND", 
											      ["mainline","is","F"], 
											      "AND", 
											      ["taxline","is","F"], 
											      "AND", 
											      ["shipping","is","F"], 
											      "AND", 
											      ["shipdate","onorbefore","today"], 
											      "AND", 
											      ["item.type","noneof","Discount"], 
											      "AND", 
											      ["status","anyof","SalesOrd:E","SalesOrd:B","SalesOrd:D"], 
											      "AND", 
											      ["shipcomplete","is","F"], 
											      "AND", 
											      ["memorized","is","F"],
											      "AND", 
											      ["sum(formulacurrency: (CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END) * {rate})","greaterthan","0.00"]
											   ];
								
								if(paramLocation != null && paramLocation != '')
									{
										filters.push("AND", ["inventorylocation", "anyof", paramLocation]);
									}
								
								if(paramCustomer != null && paramCustomer != '')
									{
										filters.push("AND", ["entity", "anyof", paramCustomer]);
									}
								
								
								//Find any items to process & populate the sublist non ship complete orders 
								//
								var searchObj =	search.create({
									   type: "salesorder",
									   filters:	filters,
									   columns:
									   [
									      search.createColumn({
									         name: "inventorylocation",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Inventory Location"
									      }),
									      search.createColumn({
									         name: "tranid",
									         summary: "GROUP",
									         label: "Document Number"
									      }),
									      search.createColumn({
										         name: "internalid",
										         summary: "GROUP",
										         label: "Document Number"
										      }),
									      search.createColumn({
									         name: "shipcomplete",
									         summary: "GROUP",
									         label: "Ship Complete"
									      }),
									      search.createColumn({
									         name: "shipdate",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Ship Date"
									      }),
									      search.createColumn({
									         name: "entity",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Name"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END",
									         label: "Back Order Qty"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END",
									         label: "Committed Stock"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantity}-{quantityshiprecv}",
									         label: "Required Stock"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantitypicked}-{quantityshiprecv}",
									         label: "In Progress"
									      }),
									      search.createColumn({
									         name: "formulacurrency",
									         summary: "SUM",
									         formula: "(CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END) * {rate}",
									         label: "Ship Sales Value"
									      }),
									      search.createColumn({
									         name: "formulacurrency",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END * {rate}",
									         label: "Non Ship Sales Value"
									      })
									   ]
									});
									
								var salesorderSearchObj 	= getResults(searchObj);
								var salesorderColumnsObj 	= searchObj.columns;

								if(salesorderSearchObj != null && salesorderSearchObj.length > 0)
									{
										for (var int = 0; int < salesorderSearchObj.length; int++) 
						    				{ 
												line++;
												
												subList0.setSublistValue({
																		id:		'custpage_sl0_type',
																		line:	line,
																		value:	'Non Ship Complete'
																		});	
	    				
												
												subList0.setSublistValue({
																			id:		'custpage_sl0_inv_loc',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[0]),'')
																			});	
							    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_doc_no',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[1]),'')
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_doc_link',
																			line:	line,
																			value:	url.resolveRecord({
																										isEditMode:		false,
																										recordId:		salesorderSearchObj[int].getValue(salesorderColumnsObj[2]),
																										recordType:		record.Type.SALES_ORDER
																										})
																			});	
							    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_complete',
																			line:	line,
																			value:	(salesorderSearchObj[int].getValue(salesorderColumnsObj[3]) == true ? 'Yes' : 'No')
																			});	
			    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_date',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[4]),'')
																			});	
			    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_name',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[5]),'')
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_back_order',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[6]),'0'), type: format.Type.FLOAT})
																			});	
							    					
												subList0.setSublistValue({
																			id:		'custpage_sl0_committed',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]),'0'), type: format.Type.FLOAT})
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_required',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]),'0'), type: format.Type.FLOAT})
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_in_progress',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]),'0'), type: format.Type.FLOAT})
																			});	
	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_sales',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]),'0'), type: format.Type.FLOAT})
																			});	
			    				
												subList0.setSublistValue({
																			id:		'custpage_sl0_no_ship_sales',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]),'0'), type: format.Type.FLOAT})
																			});	
			    				
						    					 
							    				totalBackOrder			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[6]));
												totalCommitted			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]));
												totalRequired			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]));
												totalInProgress			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]));
												totalShip				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]));
												totalNonShip			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]));
						    				}
									}
								
								
								//Find any items to process & populate the sublist ship complete orders which can be shipped
								//
								var filters = [
											      ["type","anyof","SalesOrd"], 
											      "AND", 
											      ["mainline","is","F"], 
											      "AND", 
											      ["taxline","is","F"], 
											      "AND", 
											      ["shipping","is","F"], 
											      "AND", 
											      ["shipdate","onorbefore","today"], 
											      "AND", 
											      ["status","anyof","SalesOrd:B","SalesOrd:D","SalesOrd:E","SalesOrd:F"], 
											      "AND", 
											      ["item.type","noneof","Discount"], 
											      "AND", 
											      ["formulanumeric: CASE WHEN {purchaseorder.shipto} = {name} THEN 0 ELSE 1 END","greaterthan","0"], 
											      "AND", 
											      ["formulanumeric: {quantity}-{quantityshiprecv}","notequalto","0"], 
											      "AND", 
											      ["memorized","is","F"], 
											      "AND", 
											      ["shipcomplete","is","T"], 
											      "AND", 
											      ["sum(formulanumeric: CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END)","equalto","0"]
											   ];
								
								if(paramLocation != null && paramLocation != '')
									{
										filters.push("AND", ["inventorylocation", "anyof", paramLocation]);
									}
							
								if(paramCustomer != null && paramCustomer != '')
									{
										filters.push("AND", ["entity", "anyof", paramCustomer]);
									}
							
								var searchObj =	search.create({
									   type: "salesorder",
									   filters: filters,
									   columns:
									   [
									      search.createColumn({
									         name: "inventorylocation",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Inventory Location"
									      }),
									      search.createColumn({
									         name: "tranid",
									         summary: "GROUP",
									         label: "Document Number"
									      }),
									      search.createColumn({
										         name: "internalid",
										         summary: "GROUP",
										         label: "Document Number"
										      }),
									      search.createColumn({
									         name: "shipcomplete",
									         summary: "GROUP",
									         label: "Ship Complete"
									      }),
									      search.createColumn({
									         name: "shipdate",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Ship Date"
									      }),
									      search.createColumn({
									         name: "entity",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Name"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END",
									         label: "Back Order Qty"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END",
									         label: "Committed Stock"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantity}-{quantityshiprecv}",
									         label: "Required Stock"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantitypicked}-{quantityshiprecv}",
									         label: "Qty in Progress"
									      }),
									      search.createColumn({
									         name: "formulacurrency",
									         summary: "SUM",
									         formula: "(CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END) * {rate}",
									         label: "Ship Sales Value"
									      }),
									      search.createColumn({
									         name: "formulacurrency",
									         summary: "SUM",
									         formula: "0",
									         label: "Non Ship Sales Value"
									      })
									   ]
									});
									
								var salesorderSearchObj 	= getResults(searchObj);
								var salesorderColumnsObj 	= searchObj.columns;

								if(salesorderSearchObj != null && salesorderSearchObj.length > 0)
									{
										for (var int = 0; int < salesorderSearchObj.length; int++) 
						    				{ 
												line++;
												
												subList0.setSublistValue({
																		id:		'custpage_sl0_type',
																		line:	line,
																		value:	'Ship Complete - Can Be Shipped'
																		});	
	    				
												
												subList0.setSublistValue({
																			id:		'custpage_sl0_inv_loc',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[0]),'')
																			});	
							    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_doc_no',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[1]),'')
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_doc_link',
																			line:	line,
																			value:	url.resolveRecord({
																										isEditMode:		false,
																										recordId:		salesorderSearchObj[int].getValue(salesorderColumnsObj[2]),
																										recordType:		record.Type.SALES_ORDER
																										})
																			});	
							    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_complete',
																			line:	line,
																			value:	(salesorderSearchObj[int].getValue(salesorderColumnsObj[3]) == true ? 'Yes' : 'No')
																			});	
			    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_date',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[4]),'')
																			});	
			    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_name',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[5]),'')
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_back_order',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[6]),'0'), type: format.Type.FLOAT})
																			});	
							    					
												subList0.setSublistValue({
																			id:		'custpage_sl0_committed',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]),'0'), type: format.Type.FLOAT})
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_required',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]),'0'), type: format.Type.FLOAT})
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_in_progress',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]),'0'), type: format.Type.FLOAT})
																			});	
	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_sales',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]),'0'), type: format.Type.FLOAT})
																			});	
			    				
												subList0.setSublistValue({
																			id:		'custpage_sl0_no_ship_sales',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]),'0'), type: format.Type.FLOAT})
																			});	
			    				
						    					 
							    				totalBackOrder			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[6]));
												totalCommitted			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]));
												totalRequired			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]));
												totalInProgress			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]));
												totalShip				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]));
												totalNonShip			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]));
						    				}
									}
								
								
								
								//Find any items to process & populate the sublist ship complete orders which cannot be shipped
								//
								var filters = [
											      ["type","anyof","SalesOrd"], 
											      "AND", 
											      ["mainline","is","F"], 
											      "AND", 
											      ["taxline","is","F"], 
											      "AND", 
											      ["shipping","is","F"], 
											      "AND", 
											      ["shipdate","onorbefore","today"], 
											      "AND", 
											      ["item.type","noneof","Discount","Description"], 
											      "AND", 
											      ["status","anyof","SalesOrd:E","SalesOrd:B","SalesOrd:D"], 
											      "AND", 
											      ["shipcomplete","is","T"], 
											      "AND", 
											      ["formulanumeric: CASE WHEN {purchaseorder.shipto} = {name} THEN 0 ELSE 1 END","greaterthan","0"], 
											      "AND", 
											      ["formulanumeric: {quantity}-{quantityshiprecv}","notequalto","0"], 
											      "AND", 
											      ["memorized","is","F"], 
											      "AND", 
											      ["sum(formulanumeric: CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantitypicked})-0 ELSE ({quantity}-{quantitypicked}) - {quantitycommitted}      END)","greaterthan","0"]
											   ];
									
								if(paramLocation != null && paramLocation != '')
									{
										filters.push("AND", ["inventorylocation", "anyof", paramLocation]);
									}
							
								if(paramCustomer != null && paramCustomer != '')
									{
										filters.push("AND", ["entity", "anyof", paramCustomer]);
									}
								
								var searchObj =	search.create({
									   type: "salesorder",
									   filters: filters,
									   columns:
									   [
									      search.createColumn({
									         name: "inventorylocation",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Inventory Location"
									      }),
									      search.createColumn({
									         name: "tranid",
									         summary: "GROUP",
									         label: "Document Number"
									      }),
									      search.createColumn({
									         name: "internalid",
									         summary: "GROUP",
									         label: "Internal ID"
									      }),
									      search.createColumn({
									         name: "shipcomplete",
									         summary: "GROUP",
									         label: "Ship Complete"
									      }),
									      search.createColumn({
									         name: "shipdate",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Ship Date"
									      }),
									      search.createColumn({
									         name: "entity",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Name"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END",
									         label: "Back Order Qty"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END",
									         label: "Committed Stock"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantity}-{quantityshiprecv}",
									         label: "Required Stock"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantitypicked}-{quantityshiprecv}",
									         label: "Qty in Progress"
									      }),
									      search.createColumn({
									         name: "formulacurrency",
									         summary: "SUM",
									         formula: "0",
									         label: "Ship Sales Value"
									      }),
									      search.createColumn({
									         name: "formulacurrency",
									         summary: "SUM",
									         formula: "(CASE WHEN {quantityshiprecv} IS NULL Then {quantity} ELSE {quantity}-{quantityshiprecv} END) * {rate}",
									         label: "Non Ship Sales Value"
									      })
									   ]
									});
									
								var salesorderSearchObj 	= getResults(searchObj);
								var salesorderColumnsObj 	= searchObj.columns;

								if(salesorderSearchObj != null && salesorderSearchObj.length > 0)
									{
										for (var int = 0; int < salesorderSearchObj.length; int++) 
						    				{ 
												line++;
											
												subList0.setSublistValue({
																		id:		'custpage_sl0_type',
																		line:	line,
																		value:	'Ship Complete - Cannot Be Shipped'
																		});	
	    				
												
												subList0.setSublistValue({
																			id:		'custpage_sl0_inv_loc',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[0]),'')
																			});	
							    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_doc_no',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[1]),'')
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_doc_link',
																			line:	line,
																			value:	url.resolveRecord({
																										isEditMode:		false,
																										recordId:		salesorderSearchObj[int].getValue(salesorderColumnsObj[2]),
																										recordType:		record.Type.SALES_ORDER
																										})
																			});	
							    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_complete',
																			line:	line,
																			value:	(salesorderSearchObj[int].getValue(salesorderColumnsObj[3]) == true ? 'Yes' : 'No')
																			});	
			    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_date',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[4]),'')
																			});	
			    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_name',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[5]),'')
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_back_order',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[6]),'0'), type: format.Type.FLOAT})
																			});	
							    					
												subList0.setSublistValue({
																			id:		'custpage_sl0_committed',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]),'0'), type: format.Type.FLOAT})
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_required',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]),'0'), type: format.Type.FLOAT})
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_in_progress',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]),'0'), type: format.Type.FLOAT})
																			});	
	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_sales',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]),'0'), type: format.Type.FLOAT})
																			});	
			    				
												subList0.setSublistValue({
																			id:		'custpage_sl0_no_ship_sales',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]),'0'), type: format.Type.FLOAT})
																			});	
			    				
						    					 
							    				totalBackOrder			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[6]));
												totalCommitted			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]));
												totalRequired			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]));
												totalInProgress			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]));
												totalShip				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]));
												totalNonShip			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]));
						    				}
									}
								
								fieldTotalBackOrder.defaultValue 	= totalBackOrder.toFixed(2);
								fieldTotalCommitted.defaultValue 	= totalCommitted.toFixed(2);
								fieldTotalRequired.defaultValue 	= totalRequired.toFixed(2);
								fieldTotalInProgress.defaultValue 	= totalInProgress.toFixed(2);
								fieldTotalShip.defaultValue 		= totalShip.toFixed(2);
								fieldTotalNonShip.defaultValue 		= totalNonShip.toFixed(2);
								
								
								
								//=====================================================================================================================
								//
								//	Not Ship Complete Orders
								//
								//=====================================================================================================================
								
								//Add a sub tab
								//
								var subtab1 = form.addSubtab({
															id: 	'custpage_subtab_not_sc',
															label:	'Not Ship Complete Orders',
															tab:	'custpage_tab_items'
															})	
								
								//Add fields to sub tab
								//
								var fieldTotalBackOrder = form.addField({
												id:			'custpage_sl1_tot_bo',
												label:		'Back Order Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_not_sc'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
								
								var fieldTotalCommitted = form.addField({
												id:			'custpage_sl1_tot_com',
												label:		'Committed Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_not_sc'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
					
								var fieldTotalRequired = form.addField({
												id:			'custpage_sl1_tot_req',
												label:		'Required Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_not_sc'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalInProgress = form.addField({
												id:			'custpage_sl1_tot_ip',
												label:		'In Progress Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_not_sc'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalShip = form.addField({
												id:			'custpage_sl1_tot_ship',
												label:		'Ship Sales Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_not_sc'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
								
								var fieldTotalNonShip = form.addField({
												id:			'custpage_sl1_tot_no_ship',
												label:		'Non Ship Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_not_sc'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
					
								//Add a sublist to subtab
								//
								var subList1 = form.addSublist({
																id:		'custpage_sublist_not_sc', 
																type:	serverWidget.SublistType.LIST, 
																label:	'Not Ship Complete Orders',
																tab:	'custpage_subtab_not_sc'
																});

								//Add columns to sublist
								//
								subList1.addField({
													id:		'custpage_sl1_inv_loc',
													label:	'Inventory Location',
													type:	serverWidget.FieldType.TEXT
												});													//Inventory Location
					
								
								
								subList1.addField({
													id:		'custpage_sl1_doc_no',
													label:	'Document No',
													type:	serverWidget.FieldType.TEXT
												});													//Document No

								var linkField = subList1.addField({
													id:		'custpage_sl1_doc_link',
													label:	'View',
													type:	serverWidget.FieldType.URL
												});													//Item url link
					
								linkField.linkText = 'View';
								
								
								subList1.addField({
													id:		'custpage_sl1_ship_complete',
													label:	'Ship Complete',
													type:	serverWidget.FieldType.TEXT				//Ship Complete
												});		
														
				
								subList1.addField({
													id:		'custpage_sl1_ship_date',
													label:	'Ship Date',
													type:	serverWidget.FieldType.TEXT
												});													//Ship date
					
								
								subList1.addField({
													id:		'custpage_sl1_name',
													label:	'Name',
													type:	serverWidget.FieldType.TEXT
												});													//Name
	
				
								subList1.addField({
													id:		'custpage_sl1_back_order',
													label:	'Back Order Qty',
													type:	serverWidget.FieldType.FLOAT
												});													//Back Order qty
					
				
								subList1.addField({
													id:		'custpage_sl1_committed',
													label:	'Committed Stock',
													type:	serverWidget.FieldType.FLOAT
												});													//Committed
					
								subList1.addField({
													id:		'custpage_sl1_required',
													label:	'Required Stock',
													type:	serverWidget.FieldType.FLOAT
												});													//Required Stock
	
								subList1.addField({
													id:		'custpage_sl1_in_progress',
													label:	'In Progress',
													type:	serverWidget.FieldType.FLOAT
												});													//In Progress
	
								subList1.addField({
													id:		'custpage_sl1_ship_sales',
													label:	'Ship Sales Value',
													type:	serverWidget.FieldType.CURRENCY
												});													//Ship Sales Value
	
								subList1.addField({
													id:		'custpage_sl1_no_ship_sales',
													label:	'Non Ship Sales Value',
													type:	serverWidget.FieldType.CURRENCY
												});													//No Ship Sales VCalue
	
								
								//Find any items to process & populate the sublist
								//
								var filters = [
											      ["type","anyof","SalesOrd"], 
											      "AND", 
											      ["mainline","is","F"], 
											      "AND", 
											      ["taxline","is","F"], 
											      "AND", 
											      ["shipping","is","F"], 
											      "AND", 
											      ["shipdate","onorbefore","today"], 
											      "AND", 
											      ["item.type","noneof","Discount"], 
											      "AND", 
											      ["status","anyof","SalesOrd:E","SalesOrd:B","SalesOrd:D"], 
											      "AND", 
											      ["shipcomplete","is","F"], 
											      "AND", 
											      ["memorized","is","F"], 
											      "AND", 
											      ["sum(formulacurrency: (CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END) * {rate})","greaterthan","0.00"]
											   ];
									
								if(paramLocation != null && paramLocation != '')
									{
										filters.push("AND", ["inventorylocation", "anyof", paramLocation]);
									}
							
								if(paramCustomer != null && paramCustomer != '')
									{
										filters.push("AND", ["entity", "anyof", paramCustomer]);
									}
								
								var searchObj =	search.create({
									   type: "salesorder",
									   filters: filters,
									   columns:
									   [
									      search.createColumn({
									         name: "inventorylocation",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Inventory Location"
									      }),
									      search.createColumn({
									         name: "tranid",
									         summary: "GROUP",
									         label: "Document Number"
									      }),
									      search.createColumn({
										         name: "internalid",
										         summary: "GROUP",
										         label: "Document Number"
										      }),
									      search.createColumn({
									         name: "shipcomplete",
									         summary: "GROUP",
									         label: "Ship Complete"
									      }),
									      search.createColumn({
									         name: "shipdate",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Ship Date"
									      }),
									      search.createColumn({
									         name: "entity",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Name"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END",
									         label: "Back Order Qty"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END",
									         label: "Committed Stock"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantity}-{quantityshiprecv}",
									         label: "Required Stock"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantitypicked}-{quantityshiprecv}",
									         label: "In Progress"
									      }),
									      search.createColumn({
									         name: "formulacurrency",
									         summary: "SUM",
									         formula: "(CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END) * {rate}",
									         label: "Ship Sales Value"
									      }),
									      search.createColumn({
									         name: "formulacurrency",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END * {rate}",
									         label: "Non Ship Sales Value"
									      })
									   ]
									});
										
								var salesorderSearchObj 	= getResults(searchObj);
								var salesorderColumnsObj 	= searchObj.columns;
								var totalBackOrder			= Number(0);
								var totalCommitted			= Number(0);
								var totalRequired			= Number(0);
								var totalInProgress			= Number(0);
								var totalShip				= Number(0);
								var totalNonShip			= Number(0);
								
								
								if(salesorderSearchObj != null && salesorderSearchObj.length > 0)
									{
										for (var int = 0; int < salesorderSearchObj.length; int++) 
						    				{ 	
												subList1.setSublistValue({
																		id:		'custpage_sl1_inv_loc',
																		line:	int,
																		value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[0]),'')
																		});	
						    						
							    				 subList1.setSublistValue({
																		id:		'custpage_sl1_doc_no',
																		line:	int,
																		value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[1]),'')
																		});	

							    				 subList1.setSublistValue({
																		id:		'custpage_sl1_doc_link',
																		line:	int,
																		value:	url.resolveRecord({
																									isEditMode:		false,
																									recordId:		salesorderSearchObj[int].getValue(salesorderColumnsObj[2]),
																									recordType:		record.Type.SALES_ORDER
																									})
																		});	
						    						
							    				 subList1.setSublistValue({
																		id:		'custpage_sl1_ship_complete',
																		line:	int,
																		value:	(salesorderSearchObj[int].getValue(salesorderColumnsObj[3]) == true ? 'Yes' : 'No')
																		});	
		    						
							    				 subList1.setSublistValue({
																		id:		'custpage_sl1_ship_date',
																		line:	int,
																		value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[4]),'')
																		});	
		    						
							    				 subList1.setSublistValue({
																		id:		'custpage_sl1_name',
																		line:	int,
																		value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[5]),'')
																		});	

							    				 subList1.setSublistValue({
																		id:		'custpage_sl1_back_order',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[6]),'0'), type: format.Type.FLOAT})
																		});	
						    					
							    				 subList1.setSublistValue({
																		id:		'custpage_sl1_committed',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]),'0'), type: format.Type.FLOAT})
																		});	

							    				 subList1.setSublistValue({
																		id:		'custpage_sl1_required',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]),'0'), type: format.Type.FLOAT})
																		});	

							    				 subList1.setSublistValue({
																		id:		'custpage_sl1_in_progress',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]),'0'), type: format.Type.FLOAT})
																		});	


							    				 subList1.setSublistValue({
																		id:		'custpage_sl1_ship_sales',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]),'0'), type: format.Type.FLOAT})
																		});	
		    				
							    				 subList1.setSublistValue({
																		id:		'custpage_sl1_no_ship_sales',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]),'0'), type: format.Type.FLOAT})
																		});	
		    				
						    					 
							    				totalBackOrder			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[6]));
												totalCommitted			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]));
												totalRequired			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]));
												totalInProgress			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]));
												totalShip				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]));
												totalNonShip			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]));
						    				}
									}
								
								fieldTotalBackOrder.defaultValue 	= totalBackOrder.toFixed(2);
								fieldTotalCommitted.defaultValue 	= totalCommitted.toFixed(2);
								fieldTotalRequired.defaultValue 	= totalRequired.toFixed(2);
								fieldTotalInProgress.defaultValue 	= totalInProgress.toFixed(2);
								fieldTotalShip.defaultValue 		= totalShip.toFixed(2);
								fieldTotalNonShip.defaultValue 		= totalNonShip.toFixed(2);
					        
								//=====================================================================================================================
								//
								//	Ship Complete Orders Which Can Be Shipped
								//
								//=====================================================================================================================
								
								//Add a sub tab
								//
								var subtab2 = form.addSubtab({
															id: 	'custpage_subtab_sc_ship',
															label:	'Ship Complete Orders Which Can Be Shipped',
															tab:	'custpage_tab_items'
															})	
								
								//Add fields to sub tab
								//
								var fieldTotalBackOrder = form.addField({
												id:			'custpage_sl2_tot_bo',
												label:		'Back Order Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_ship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
								
								var fieldTotalCommitted = form.addField({
												id:			'custpage_sl2_tot_com',
												label:		'Committed Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_ship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
					
								var fieldTotalRequired = form.addField({
												id:			'custpage_sl2_tot_req',
												label:		'Required Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_ship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalInProgress = form.addField({
												id:			'custpage_sl2_tot_ip',
												label:		'In Progress Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_ship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalShip = form.addField({
												id:			'custpage_sl2_tot_ship',
												label:		'Ship Sales Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_ship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
								
								var fieldTotalNonShip = form.addField({
												id:			'custpage_sl2_tot_no_ship',
												label:		'Non Ship Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_ship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
					
								//Add a sublist to subtab
								//
								var subList2 = form.addSublist({
																id:		'custpage_sublist_sc_ship', 
																type:	serverWidget.SublistType.LIST, 
																label:	'Not Ship Complete Orders',
																tab:	'custpage_subtab_sc_ship'
																});
								
								//Add columns to sublist
								//
								subList2.addField({
													id:		'custpage_sl2_inv_loc',
													label:	'Inventory Location',
													type:	serverWidget.FieldType.TEXT
												});													//Inventory Location
					
								
								
								subList2.addField({
													id:		'custpage_sl2_doc_no',
													label:	'Document No',
													type:	serverWidget.FieldType.TEXT
												});													//Document No
					
												
								
								
								var linkField = subList2.addField({
													id:		'custpage_sl2_doc_link',
													label:	'View',
													type:	serverWidget.FieldType.URL
												});													//Item url link
					
								linkField.linkText = 'View';
								
								
								subList2.addField({
													id:		'custpage_sl2_ship_complete',
													label:	'Ship Complete',
													type:	serverWidget.FieldType.TEXT				//Ship Complete
												});		
														
				
								subList2.addField({
													id:		'custpage_sl2_ship_date',
													label:	'Ship Date',
													type:	serverWidget.FieldType.TEXT
												});													//Ship date
					
								
								subList2.addField({
													id:		'custpage_sl2_name',
													label:	'Name',
													type:	serverWidget.FieldType.TEXT
												});													//Name
	
				
								subList2.addField({
													id:		'custpage_sl2_back_order',
													label:	'Back Order Qty',
													type:	serverWidget.FieldType.FLOAT
												});													//Back Order qty
					
				
								subList2.addField({
													id:		'custpage_sl2_committed',
													label:	'Committed Stock',
													type:	serverWidget.FieldType.FLOAT
												});													//Committed
					
								subList2.addField({
													id:		'custpage_sl2_required',
													label:	'Required Stock',
													type:	serverWidget.FieldType.FLOAT
												});													//Required Stock
	
								subList2.addField({
													id:		'custpage_sl2_in_progress',
													label:	'In Progress',
													type:	serverWidget.FieldType.FLOAT
												});													//In Progress
	
								subList2.addField({
													id:		'custpage_sl2_ship_sales',
													label:	'Ship Sales Value',
													type:	serverWidget.FieldType.CURRENCY
												});													//Ship Sales Value
	
								subList2.addField({
													id:		'custpage_sl2_no_ship_sales',
													label:	'Non Ship Sales Value',
													type:	serverWidget.FieldType.CURRENCY
												});													//No Ship Sales VCalue
	
								
								//Find any items to process & populate the sublist
								//
								var filters = [
											      ["type","anyof","SalesOrd"], 
											      "AND", 
											      ["mainline","is","F"], 
											      "AND", 
											      ["taxline","is","F"], 
											      "AND", 
											      ["shipping","is","F"], 
											      "AND", 
											      ["shipdate","onorbefore","today"], 
											      "AND", 
											      ["status","anyof","SalesOrd:B","SalesOrd:D","SalesOrd:E","SalesOrd:F"], 
											      "AND", 
											      ["item.type","noneof","Discount"], 
											      "AND", 
											      ["formulanumeric: CASE WHEN {purchaseorder.shipto} = {name} THEN 0 ELSE 1 END","greaterthan","0"], 
											      "AND", 
											      ["formulanumeric: {quantity}-{quantityshiprecv}","notequalto","0"], 
											      "AND", 
											      ["memorized","is","F"], 
											      "AND", 
											      ["shipcomplete","is","T"], 
											      "AND", 
											      ["sum(formulanumeric: CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END)","equalto","0"]
											   ];
									
									
								if(paramLocation != null && paramLocation != '')
									{
										filters.push("AND", ["inventorylocation", "anyof", paramLocation]);
									}
								
								if(paramCustomer != null && paramCustomer != '')
									{
										filters.push("AND", ["entity", "anyof", paramCustomer]);
									}
									
								var searchObj =	search.create({
									   type: "salesorder",
									   filters: filters,
									   columns:
									   [
									      search.createColumn({
									         name: "inventorylocation",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Inventory Location"
									      }),
									      search.createColumn({
									         name: "tranid",
									         summary: "GROUP",
									         label: "Document Number"
									      }),
									      search.createColumn({
										         name: "internalid",
										         summary: "GROUP",
										         label: "Document Number"
										      }),
									      search.createColumn({
									         name: "shipcomplete",
									         summary: "GROUP",
									         label: "Ship Complete"
									      }),
									      search.createColumn({
									         name: "shipdate",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Ship Date"
									      }),
									      search.createColumn({
									         name: "entity",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Name"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END",
									         label: "Back Order Qty"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END",
									         label: "Committed Stock"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantity}-{quantityshiprecv}",
									         label: "Required Stock"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantitypicked}-{quantityshiprecv}",
									         label: "Qty in Progress"
									      }),
									      search.createColumn({
									         name: "formulacurrency",
									         summary: "SUM",
									         formula: "(CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END) * {rate}",
									         label: "Ship Sales Value"
									      }),
									      search.createColumn({
									         name: "formulacurrency",
									         summary: "SUM",
									         formula: "0",
									         label: "Non Ship Sales Value"
									      })
									   ]
									});

										
								var salesorderSearchObj 	= getResults(searchObj);
								var salesorderColumnsObj 	= searchObj.columns;
								var totalBackOrder			= Number(0);
								var totalCommitted			= Number(0);
								var totalRequired			= Number(0);
								var totalInProgress			= Number(0);
								var totalShip				= Number(0);
								var totalNonShip			= Number(0);
								
								
								if(salesorderSearchObj != null && salesorderSearchObj.length > 0)
									{
										for (var int = 0; int < salesorderSearchObj.length; int++) 
						    				{ 	
											subList2.setSublistValue({
																		id:		'custpage_sl2_inv_loc',
																		line:	int,
																		value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[0]),'')
																		});	
						    						
											subList2.setSublistValue({
																		id:		'custpage_sl2_doc_no',
																		line:	int,
																		value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[1]),'')
																		});	

											subList2.setSublistValue({
																		id:		'custpage_sl2_doc_link',
																		line:	int,
																		value:	url.resolveRecord({
																									isEditMode:		false,
																									recordId:		salesorderSearchObj[int].getValue(salesorderColumnsObj[2]),
																									recordType:		record.Type.SALES_ORDER
																									})
																		});	
						    						
											subList2.setSublistValue({
																		id:		'custpage_sl2_ship_complete',
																		line:	int,
																		value:	(salesorderSearchObj[int].getValue(salesorderColumnsObj[3]) == true ? 'Yes' : 'No')
																		});	
		    						
											subList2.setSublistValue({
																		id:		'custpage_sl2_ship_date',
																		line:	int,
																		value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[4]),'')
																		});	
		    						
											subList2.setSublistValue({
																		id:		'custpage_sl2_name',
																		line:	int,
																		value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[5]),'')
																		});	

											subList2.setSublistValue({
																		id:		'custpage_sl2_back_order',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[6]),'0'), type: format.Type.FLOAT})
																		});	
						    					
											subList2.setSublistValue({
																		id:		'custpage_sl2_committed',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]),'0'), type: format.Type.FLOAT})
																		});	

											subList2.setSublistValue({
																		id:		'custpage_sl2_required',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]),'0'), type: format.Type.FLOAT})
																		});	

											subList2.setSublistValue({
																		id:		'custpage_sl2_in_progress',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]),'0'), type: format.Type.FLOAT})
																		});	


											subList2.setSublistValue({
																		id:		'custpage_sl2_ship_sales',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]),'0'), type: format.Type.FLOAT})
																		});	
		    				
											subList2.setSublistValue({
																		id:		'custpage_sl2_no_ship_sales',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]),'0'), type: format.Type.FLOAT})
																		});	
		    				
						    					 
							    				totalBackOrder			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[6]));
												totalCommitted			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]));
												totalRequired			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]));
												totalInProgress			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]));
												totalShip				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]));
												totalNonShip			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]));
						    				}
									}
					            	
								
								fieldTotalBackOrder.defaultValue 	= totalBackOrder.toFixed(2);
								fieldTotalCommitted.defaultValue 	= totalCommitted.toFixed(2);
								fieldTotalRequired.defaultValue 	= totalRequired.toFixed(2);
								fieldTotalInProgress.defaultValue 	= totalInProgress.toFixed(2);
								fieldTotalShip.defaultValue 		= totalShip.toFixed(2);
								fieldTotalNonShip.defaultValue 		= totalNonShip.toFixed(2);
								
								//=====================================================================================================================
								//
								//	Ship Complete Orders Which Cannot Be Shipped
								//
								//=====================================================================================================================
								
								//Add a sub tab
								//
								var subtab3 = form.addSubtab({
															id: 	'custpage_subtab_sc_noship',
															label:	'Ship Complete Orders Which Cannot Be Shipped',
															tab:	'custpage_tab_items'
															})	
								
								//Add fields to sub tab
								//
								var fieldTotalBackOrder = form.addField({
												id:			'custpage_sl3_tot_bo',
												label:		'Back Order Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_noship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
								
								var fieldTotalCommitted = form.addField({
												id:			'custpage_sl3_tot_com',
												label:		'Committed Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_noship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
					
								var fieldTotalRequired = form.addField({
												id:			'custpage_sl3_tot_req',
												label:		'Required Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_noship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalInProgress = form.addField({
												id:			'custpage_sl3_tot_ip',
												label:		'In Progress Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_noship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalShip = form.addField({
												id:			'custpage_sl3_tot_ship',
												label:		'Ship Sales Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_noship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
								
								var fieldTotalNonShip = form.addField({
												id:			'custpage_sl3_tot_no_ship',
												label:		'Non Ship Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_noship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
					
								//Add a sublist to subtab
								//
								var subList3 = form.addSublist({
																id:		'custpage_sublist_sc_noship', 
																type:	serverWidget.SublistType.LIST, 
																label:	'Not Ship Complete Orders',
																tab:	'custpage_subtab_sc_noship'
																});
								
								//Add columns to sublist
								//
								subList3.addField({
													id:		'custpage_sl3_inv_loc',
													label:	'Inventory Location',
													type:	serverWidget.FieldType.TEXT
												});													//Inventory Location
					
								
								
								subList3.addField({
													id:		'custpage_sl3_doc_no',
													label:	'Document No',
													type:	serverWidget.FieldType.TEXT
												});													//Document No
					
												
								
								
								var linkField = subList3.addField({
													id:		'custpage_sl3_doc_link',
													label:	'View',
													type:	serverWidget.FieldType.URL
												});													//Item url link
					
								linkField.linkText = 'View';
								
								
								subList3.addField({
													id:		'custpage_sl3_ship_complete',
													label:	'Ship Complete',
													type:	serverWidget.FieldType.TEXT				//Ship Complete
												});		
														
				
								subList3.addField({
													id:		'custpage_sl3_ship_date',
													label:	'Ship Date',
													type:	serverWidget.FieldType.TEXT
												});													//Ship date
					
								
								subList3.addField({
													id:		'custpage_sl3_name',
													label:	'Name',
													type:	serverWidget.FieldType.TEXT
												});													//Name
	
				
								subList3.addField({
													id:		'custpage_sl3_back_order',
													label:	'Back Order Qty',
													type:	serverWidget.FieldType.FLOAT
												});													//Back Order qty
					
				
								subList3.addField({
													id:		'custpage_sl3_committed',
													label:	'Committed Stock',
													type:	serverWidget.FieldType.FLOAT
												});													//Committed
					
								subList3.addField({
													id:		'custpage_sl3_required',
													label:	'Required Stock',
													type:	serverWidget.FieldType.FLOAT
												});													//Required Stock
	
								subList3.addField({
													id:		'custpage_sl3_in_progress',
													label:	'In Progress',
													type:	serverWidget.FieldType.FLOAT
												});													//In Progress
	
								subList3.addField({
													id:		'custpage_sl3_ship_sales',
													label:	'Ship Sales Value',
													type:	serverWidget.FieldType.CURRENCY
												});													//Ship Sales Value
	
								subList3.addField({
													id:		'custpage_sl3_no_ship_sales',
													label:	'Non Ship Sales Value',
													type:	serverWidget.FieldType.CURRENCY
												});													//No Ship Sales VCalue
	
								
								//Find any items to process & populate the sublist
								//
								var filters = [
											      ["type","anyof","SalesOrd"], 
											      "AND", 
											      ["mainline","is","F"], 
											      "AND", 
											      ["taxline","is","F"], 
											      "AND", 
											      ["shipping","is","F"], 
											      "AND", 
											      ["shipdate","onorbefore","today"], 
											      "AND", 
											      ["item.type","noneof","Discount","Description"], 
											      "AND", 
											      ["status","anyof","SalesOrd:E","SalesOrd:B","SalesOrd:D"], 
											      "AND", 
											      ["shipcomplete","is","T"], 
											      "AND", 
											      ["formulanumeric: CASE WHEN {purchaseorder.shipto} = {name} THEN 0 ELSE 1 END","greaterthan","0"], 
											      "AND", 
											      ["formulanumeric: {quantity}-{quantityshiprecv}","notequalto","0"], 
											      "AND", 
											      ["memorized","is","F"], 
											      "AND", 
											      ["sum(formulanumeric: CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantitypicked})-0 ELSE ({quantity}-{quantitypicked}) - {quantitycommitted}      END)","greaterthan","0"]
											   ];
									
								if(paramLocation != null && paramLocation != '')
									{
										filters.push("AND", ["inventorylocation", "anyof", paramLocation]);
									}
								
								if(paramCustomer != null && paramCustomer != '')
									{
										filters.push("AND", ["entity", "anyof", paramCustomer]);
									}
								
								var searchObj =	search.create({
									   type: "salesorder",
									   filters: filters,
									   columns:
									   [
									      search.createColumn({
									         name: "inventorylocation",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Inventory Location"
									      }),
									      search.createColumn({
									         name: "tranid",
									         summary: "GROUP",
									         label: "Document Number"
									      }),
									      search.createColumn({
									         name: "internalid",
									         summary: "GROUP",
									         label: "Internal ID"
									      }),
									      search.createColumn({
									         name: "shipcomplete",
									         summary: "GROUP",
									         label: "Ship Complete"
									      }),
									      search.createColumn({
									         name: "shipdate",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Ship Date"
									      }),
									      search.createColumn({
									         name: "entity",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Name"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END",
									         label: "Back Order Qty"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END",
									         label: "Committed Stock"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantity}-{quantityshiprecv}",
									         label: "Required Stock"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantitypicked}-{quantityshiprecv}",
									         label: "Qty in Progress"
									      }),
									      search.createColumn({
									         name: "formulacurrency",
									         summary: "SUM",
									         formula: "0",
									         label: "Ship Sales Value"
									      }),
									      search.createColumn({
									         name: "formulacurrency",
									         summary: "SUM",
									         formula: "(CASE WHEN {quantityshiprecv} IS NULL Then {quantity} ELSE {quantity}-{quantityshiprecv} END) * {rate}",
									         label: "Non Ship Sales Value"
									      })
									   ]
									});
									
									
								var salesorderSearchObj 	= getResults(searchObj);
								var salesorderColumnsObj 	= searchObj.columns;
								var totalBackOrder			= Number(0);
								var totalCommitted			= Number(0);
								var totalRequired			= Number(0);
								var totalInProgress			= Number(0);
								var totalShip				= Number(0);
								var totalNonShip			= Number(0);
								
								
								if(salesorderSearchObj != null && salesorderSearchObj.length > 0)
									{
										for (var int = 0; int < salesorderSearchObj.length; int++) 
						    				{ 	
											subList3.setSublistValue({
																		id:		'custpage_sl3_inv_loc',
																		line:	int,
																		value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[0]),'')
																		});	
						    						
											subList3.setSublistValue({
																		id:		'custpage_sl3_doc_no',
																		line:	int,
																		value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[1]),'')
																		});	

											subList3.setSublistValue({
																		id:		'custpage_sl3_doc_link',
																		line:	int,
																		value:	url.resolveRecord({
																									isEditMode:		false,
																									recordId:		salesorderSearchObj[int].getValue(salesorderColumnsObj[2]),
																									recordType:		record.Type.SALES_ORDER
																									})
																		});	
						    						
											subList3.setSublistValue({
																		id:		'custpage_sl3_ship_complete',
																		line:	int,
																		value:	(salesorderSearchObj[int].getValue(salesorderColumnsObj[3]) == true ? 'Yes' : 'No')
																		});	
		    						
											subList3.setSublistValue({
																		id:		'custpage_sl3_ship_date',
																		line:	int,
																		value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[4]),'')
																		});	
		    						
											subList3.setSublistValue({
																		id:		'custpage_sl3_name',
																		line:	int,
																		value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[5]),'')
																		});	

											subList3.setSublistValue({
																		id:		'custpage_sl3_back_order',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[6]),'0'), type: format.Type.FLOAT})
																		});	
						    					
											subList3.setSublistValue({
																		id:		'custpage_sl3_committed',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]),'0'), type: format.Type.FLOAT})
																		});	

											subList3.setSublistValue({
																		id:		'custpage_sl3_required',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]),'0'), type: format.Type.FLOAT})
																		});	

											subList3.setSublistValue({
																		id:		'custpage_sl3_in_progress',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]),'0'), type: format.Type.FLOAT})
																		});	


											subList3.setSublistValue({
																		id:		'custpage_sl3_ship_sales',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]),'0'), type: format.Type.FLOAT})
																		});	
		    				
											subList3.setSublistValue({
																		id:		'custpage_sl3_no_ship_sales',
																		line:	int,
																		value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]),'0'), type: format.Type.FLOAT})
																		});	
		    				
						    					 
							    				totalBackOrder			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[6]));
												totalCommitted			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]));
												totalRequired			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]));
												totalInProgress			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]));
												totalShip				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]));
												totalNonShip			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]));
						    				}
									}
								
								fieldTotalBackOrder.defaultValue 	= totalBackOrder.toFixed(2);
								fieldTotalCommitted.defaultValue 	= totalCommitted.toFixed(2);
								fieldTotalRequired.defaultValue 	= totalRequired.toFixed(2);
								fieldTotalInProgress.defaultValue 	= totalInProgress.toFixed(2);
								fieldTotalShip.defaultValue 		= totalShip.toFixed(2);
								fieldTotalNonShip.defaultValue 		= totalNonShip.toFixed(2);
								
		            //Return the form to the user
		            //
		            context.response.writePage(form);
		        } 
		    else 
		    	{
		    		var request 	= context.request;
	    				
			    	var paramLocation = request.parameters['custpage_field_location'];
			    	var paramCustomer = request.parameters['custpage_field_customer'];
					
					//Call the suitelet again
					//
					context.response.sendRedirect({
												type: 			http.RedirectType.SUITELET, 
												identifier: 	runtime.getCurrentScript().id, 
												id: 			runtime.getCurrentScript().deploymentId,
												parameters:		{
																	location: 	paramLocation,						
																	customer:	paramCustomer
																}
												});
								

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
    
    function isNullorBlank(_string, _replacer)
		{
			return (_string == null || _string == '' ? _replacer : _string);
		}
    
    function isNull(_string, _replacer)
    	{
    		return (_string == null ? _replacer : _string);
    	}
    
    return {onRequest: onRequest};
});

