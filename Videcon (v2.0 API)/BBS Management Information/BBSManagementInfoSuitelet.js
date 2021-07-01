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
	    			var paramArea			= context.request.parameters['area'];	
	    			var paramCreatedBy 		= context.request.parameters['createdby'];	
	    			var title				= 'Sales Order Status Overview';
	    			
		    		//Create a form
	    			//
		    		if((paramLocation != null && paramLocation != '') || (paramCustomer != null && paramCustomer != '') || (paramArea != null && paramArea != '') || (paramCreatedBy != null && paramCreatedBy != ''))
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

								var fieldFilterLocation = form.addField({
																		id:			'custpage_field_area',
																		label:		'Area',
																		type:		serverWidget.FieldType.SELECT,
																		source:		record.Type.DEPARTMENT,
																		container:	'custpage_group_filters'
																		});

								var fieldFilterLocation = form.addField({
																		id:			'custpage_field_createdby',
																		label:		'Created By',
																		type:		serverWidget.FieldType.SELECT,
																		source:		record.Type.EMPLOYEE,
																		container:	'custpage_group_filters'
																		});
				
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
														
								var fieldTotalRequired = form.addField({
												id:			'custpage_sl0_tot_req',
												label:		'Required Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_summary'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalCommitted = form.addField({
												id:			'custpage_sl0_tot_com',
												label:		'Committed Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_summary'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
		
								var fieldTotalBackOrder = form.addField({
												id:			'custpage_sl0_tot_bo',
												label:		'Back Order Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_summary'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	

								var fieldTotalPicked = form.addField({
												id:			'custpage_sl0_tot_picked',
												label:		'Picked Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_summary'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalPacked = form.addField({
												id:			'custpage_sl0_tot_packed',
												label:		'Packed Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_summary'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalShiped = form.addField({
												id:			'custpage_sl0_tot_shiped',
												label:		'Shipped Total',
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
						
								var fieldTotalMargin = form.addField({
			                                    id:         'custpage_sl0_tot_margin',
			                                    label:      'Average Margin',
			                                    type:    	serverWidget.FieldType.PERCENT,
			                                    container:  'custpage_subtab_summary'
			                                 }).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN}); 
								
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
													label:	'LOc',
													type:	serverWidget.FieldType.TEXT
												});													//Inventory Location
					
								
								
								subList0.addField({
													id:		'custpage_sl0_doc_no',
													label:	'SO #',
													type:	serverWidget.FieldType.TEXT
												});													//Document No
					
												
								
								
								var linkField = subList0.addField({
													id:		'custpage_sl0_doc_link',
													label:	'View',
													type:	serverWidget.FieldType.URL
												});													//Item url link
					
								linkField.linkText = 'View';
								
								subList0.addField({
													id:		'custpage_sl0_approved',
													label:	'Approved ?',
													type:	serverWidget.FieldType.TEXT				//Approved
												});		
									
								subList0.addField({
													id:		'custpage_sl0_cust_po',
													label:	'Cust PO',
													type:	serverWidget.FieldType.TEXT				//Cust PO
												});		
									
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
													label:	'Customer',
													type:	serverWidget.FieldType.TEXT
												});													//Name
	
								subList0.addField({
													id:		'custpage_sl0_area',
													label:	'Area',
													type:	serverWidget.FieldType.TEXT
												});													//Area

								subList0.addField({
													id:		'custpage_sl0_created',
													label:	'Created By',
													type:	serverWidget.FieldType.TEXT
												});													//CreatedBy

								subList0.addField({
													id:		'custpage_sl0_required',
													label:	'Required',
													type:	serverWidget.FieldType.FLOAT
												});													//Required Stock
								
								subList0.addField({
													id:		'custpage_sl0_po_lines',
													label:	'PO Lines',
													type:	serverWidget.FieldType.FLOAT
												});	
								
								subList0.addField({
													id:		'custpage_sl0_committed',
													label:	'Available To Pick',
													type:	serverWidget.FieldType.FLOAT
												});													//Committed

								subList0.addField({
													id:		'custpage_sl0_back_order',
													label:	'Back Ordered',
													type:	serverWidget.FieldType.FLOAT
												});													//Back Order qty
					
				
								
								subList0.addField({
													id:		'custpage_sl0_picked',
													label:	'Picked',
													type:	serverWidget.FieldType.FLOAT
												});													//Picked
	
								subList0.addField({
													id:		'custpage_sl0_packed',
													label:	'Packed',
													type:	serverWidget.FieldType.FLOAT
												});													//Packed

				
								subList0.addField({
													id:		'custpage_sl0_shipped',
													label:	'Shipped',
													type:	serverWidget.FieldType.FLOAT
												});													//Shipped

								subList0.addField({
													id:		'custpage_sl0_to_be_done',
													label:	'To Be Done',
													type:	serverWidget.FieldType.FLOAT			//To Be Done
												});		
								
								subList0.addField({
													id:		'custpage_sl0_ship_sales',
													label:	'Ship Value',
													type:	serverWidget.FieldType.CURRENCY
												});													//Ship Sales Value
	
								subList0.addField({
													id:		'custpage_sl0_no_ship_sales',
													label:	'Non Ship Value',
													type:	serverWidget.FieldType.CURRENCY
												});													//No Ship Sales Value
	
								subList0.addField({
													id:		'custpage_sl0_margin',
													label:	'Margin %',
													type:	serverWidget.FieldType.PERCENT
												});													//Margin
								
								var totalBackOrder			= Number(0);
								var totalCommitted			= Number(0);
								var totalRequired			= Number(0);
								var totalInProgress			= Number(0);
								var totalPicked				= Number(0);
								var totalPacked				= Number(0);
								var totalShiped				= Number(0);
								var totalShip				= Number(0);
								var totalNonShip			= Number(0);
								var totalMargin            = Number(0);
								var totalLines             = Number(0);
								
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
								               ["status","anyof","SalesOrd:A","SalesOrd:B","SalesOrd:D","SalesOrd:E","SalesOrd:F"], 
								               "AND", 
								               ["shipcomplete","is","F"], 
								               "AND", 
								               ["memorized","is","F"], 
								               "AND", 
								               ["formulanumeric: {quantity}-{quantitybilled}","greaterthan","0"]
								            ];
								
								if(paramLocation != null && paramLocation != '')
									{
										filters.push("AND", ["inventorylocation", "anyof", paramLocation]);
									}
								
								if(paramCustomer != null && paramCustomer != '')
									{
										filters.push("AND", ["entity", "anyof", paramCustomer]);
									}
								
								if(paramArea != null && paramArea != '')
									{
										filters.push("AND", ["customer.custentity_bbs_area", "anyof", paramArea]);
									}
							
								if(paramCreatedBy != null && paramCreatedBy != '')
									{
										filters.push("AND", ["createdby", "anyof", paramCreatedBy]);
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
										         label: "Loc"
										      }),
										      search.createColumn({
										         name: "tranid",
										         summary: "GROUP",
										         label: "SO#"
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
										         label: "Customer"
										      }),
										      search.createColumn({
										         name: "custentity_bbs_area",
										         join: "customer",
										         summary: "GROUP",
										         label: "Area"
										      }),
										      search.createColumn({
										         name: "createdby",
										         summary: "GROUP",
										         label: "Created by"
										      }),
										      search.createColumn({
										         name: "formulanumeric",
										         summary: "SUM",
										         formula: "{quantity}-{quantitybilled}",
										         label: "Required"
										      }),
										      search.createColumn({
										         name: "formulanumeric",
										         summary: "SUM",
										         formula: "CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END",
										         label: "Committed"
										      }),
										      search.createColumn({
										         name: "formulanumeric",
										         summary: "SUM",
										         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END",
										         label: "Back Ordered"
										      }),
										      search.createColumn({
										         name: "formulanumeric",
										         summary: "SUM",
										         formula: "{quantitypicked}-{quantitypacked}",
										         label: "Picked"
										      }),
										      search.createColumn({
										         name: "formulanumeric",
										         summary: "SUM",
										         formula: "{quantitypacked}-{quantityshiprecv}",
										         label: "Packed"
										      }),
										      search.createColumn({
										         name: "formulanumeric",
										         summary: "SUM",
										         formula: "{quantityshiprecv}-{quantitybilled}",
										         label: "Shipped"
										      }),
										      search.createColumn({
										         name: "formulacurrency",
										         summary: "SUM",
										         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantityshiprecv}-{quantitybilled})* {rate} ELSE ({quantitycommitted}+({quantityshiprecv}-{quantitybilled}))* {rate} END",
										         label: "Ship Value"
										      }),
										      search.createColumn({
										         name: "formulacurrency",
										         summary: "SUM",
										         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END * {rate}",
										         label: "Non Ship Value"
										      }),
										      search.createColumn({
										         name: "custbody_bbs_displaymarginpct",
										         summary: "AVG",
										         label: "Margin %"
										      }),
										      search.createColumn({
											         name: "internalid",
											         summary: "GROUP",
											         label: "Internal Id"
											      }),
											  search.createColumn({
											          name: "formulanumeric",
											          summary: "SUM",
											          formula: "CASE WHEN {purchaseorder.number} IS NULL THEN 0 ELSE 1 END",
											          label: "PO Lines"
											       }),
											       search.createColumn({
											           name: "formulatext",
											           summary: "GROUP",
											           formula: "CASE WHEN {status} = 'Pending Approval' THEN 'NO' ELSE 'YES' END",
											           label: "Approved ?"
											        }),
											        search.createColumn({
											           name: "otherrefnum",
											           summary: "GROUP",
											           label: "Cust PO"
											        }),
											        search.createColumn({
											           name: "formulanumeric",
											           summary: "SUM",
											           formula: "(CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE CASE WHEN ({quantitypacked}-{quantityshiprecv})>0 THEN{quantitycommitted}- ({quantitypacked}-{quantityshiprecv}) ELSE CASE WHEN ({quantitypicked}-{quantitypacked})>0 THEN {quantitycommitted}- ({quantitypicked}-{quantitypacked})  ELSE {quantitycommitted} END END END) + ({quantitypicked}-{quantitypacked}) + ({quantitypacked}-{quantityshiprecv})",
											           label: "To Be Done"
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
																										recordId:		salesorderSearchObj[int].getValue(salesorderColumnsObj[16]),
																										recordType:		record.Type.SALES_ORDER
																										})
																			});	
							    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_complete',
																			line:	line,
																			value:	(salesorderSearchObj[int].getValue(salesorderColumnsObj[2]) == true ? 'Yes' : 'No')
																			});	
			    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_date',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[3]),'')
																			});	
			    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_name',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[4]),'')
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_area',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[5]),'')
																			});	

			
												subList0.setSublistValue({
																			id:		'custpage_sl0_created',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[6]),'')
																			});	

												subList0.setSublistValue({
																			id:		'custpage_sl0_required',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]),'0'), type: format.Type.FLOAT})
																			});	
												
												subList0.setSublistValue({
																			id:		'custpage_sl0_committed',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]),'0'), type: format.Type.FLOAT})
																			});	

												subList0.setSublistValue({
																			id:		'custpage_sl0_back_order',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]),'0'), type: format.Type.FLOAT})
																			});	
							    					
													
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_picked',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]),'0'), type: format.Type.FLOAT})
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_packed',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]),'0'), type: format.Type.FLOAT})
																			});	

												subList0.setSublistValue({
																			id:		'custpage_sl0_shipped',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[12]),'0'), type: format.Type.FLOAT})
																			});	


												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_sales',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[13]),'0'), type: format.Type.FLOAT})
																			});	
			    				
												subList0.setSublistValue({
																			id:		'custpage_sl0_no_ship_sales',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[14]),'0'), type: format.Type.FLOAT})
																			});	
												
												subList0.setSublistValue({
																			id:		'custpage_sl0_margin',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[15]).replace('%','')).toFixed(2),'0'), type: format.Type.PERCENT})
																			});	
		
												subList0.setSublistValue({
																			id:		'custpage_sl0_po_lines',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[17]),'0'), type: format.Type.FLOAT})
																			});	
												subList0.setSublistValue({
																			id:		'custpage_sl0_approved',
																			line:	line,
																			value:	salesorderSearchObj[int].getValue(salesorderColumnsObj[18]) 
																			});	

												subList0.setSublistValue({
																			id:		'custpage_sl0_cust_po',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[19]),'')
																			});	
												
												subList0.setSublistValue({
																			id:		'custpage_sl0_to_be_done',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[20]),'0'), type: format.Type.FLOAT})
																			});	
												
												totalRequired			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]));
												totalCommitted			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]));
												totalBackOrder			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]));
												totalPicked				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]));
												totalPacked				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]));
												totalShiped				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[12]));
												totalShip				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[13]));
												totalNonShip			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[14]));
												totalMargin          	+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[15]).replace('%',''));
												totalLines++;
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
								               ["status","anyof","SalesOrd:B","SalesOrd:D","SalesOrd:E","SalesOrd:F","SalesOrd:A"], 
								               "AND", 
								               ["item.type","noneof","Discount"], 
								               "AND", 
								               ["formulanumeric: {quantity}-{quantitybilled}","notequalto","0"], 
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
								
								if(paramArea != null && paramArea != '')
									{
										filters.push("AND", ["customer.custentity_bbs_area", "anyof", paramArea]);
									}
							
								if(paramCreatedBy != null && paramCreatedBy != '')
									{
										filters.push("AND", ["createdby", "anyof", paramCreatedBy]);
									}
							
								
								//Find any items to process & populate the sublist non ship complete orders 
								//
								var searchObj =	search.create({
									   type: "salesorder",
									   filters: filters,
									   columns:
									   [
									      search.createColumn({
									         name: "inventorylocation",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Loc"
									      }),
									      search.createColumn({
									         name: "tranid",
									         summary: "GROUP",
									         label: "SO #"
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
									         label: "Customer"
									      }),
									      search.createColumn({
									         name: "custentity_bbs_area",
									         join: "customer",
									         summary: "GROUP",
									         label: "Area"
									      }),
									      search.createColumn({
									         name: "createdby",
									         summary: "GROUP",
									         label: "Created by"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantity}-{quantitybilled}",
									         label: "Required"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END",
									         label: "Committed"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END",
									         label: "Back Ordered"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantitypicked}-{quantitypacked}",
									         label: "Picked"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantitypacked}-{quantityshiprecv}",
									         label: "Packed"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantityshiprecv}-{quantitybilled}",
									         label: "Shipped"
									      }),
									      search.createColumn({
									         name: "formulacurrency",
									         summary: "SUM",
									         formula: "({quantitycommitted}+({quantityshiprecv}-{quantitybilled}))* {rate}",
									         label: "Ship Sales Value"
									      }),
									      search.createColumn({
									         name: "formulacurrency",
									         summary: "SUM",
									         formula: "0",
									         label: "Non Ship Sales Value"
									      }),
									      search.createColumn({
									         name: "custbody_bbs_displaymarginpct",
									         summary: "AVG",
									         label: "Margin"
									      }),
									      search.createColumn({
									         name: "internalid",
									         summary: "GROUP",
									         label: "Internal ID"
									      }),
										  search.createColumn({
									          name: "formulanumeric",
									          summary: "SUM",
									          formula: "CASE WHEN {purchaseorder.number} IS NULL THEN 0 ELSE 1 END",
									          label: "PO Lines"
									       }),
									       search.createColumn({
									           name: "formulatext",
									           summary: "GROUP",
									           formula: "CASE WHEN {status} = 'Pending Approval' THEN 'NO' ELSE 'YES' END",
									           label: "Approved ?"
									        }),
									        search.createColumn({
									           name: "otherrefnum",
									           summary: "GROUP",
									           label: "Cust PO"
									        }),
									        search.createColumn({
									           name: "formulanumeric",
									           summary: "SUM",
									           formula: "(CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE CASE WHEN ({quantitypacked}-{quantityshiprecv})>0 THEN{quantitycommitted}- ({quantitypacked}-{quantityshiprecv}) ELSE CASE WHEN ({quantitypicked}-{quantitypacked})>0 THEN {quantitycommitted}- ({quantitypicked}-{quantitypacked})  ELSE {quantitycommitted} END END END) + ({quantitypicked}-{quantitypacked}) + ({quantitypacked}-{quantityshiprecv})",
									           label: "To Be Done"
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
																										recordId:		salesorderSearchObj[int].getValue(salesorderColumnsObj[16]),
																										recordType:		record.Type.SALES_ORDER
																										})
																			});	
							    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_complete',
																			line:	line,
																			value:	(salesorderSearchObj[int].getValue(salesorderColumnsObj[2]) == true ? 'Yes' : 'No')
																			});	
			    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_date',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[3]),'')
																			});	
			    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_name',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[4]),'')
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_area',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[5]),'')
																			});	

			
												subList0.setSublistValue({
																			id:		'custpage_sl0_created',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[6]),'')
																			});	

												subList0.setSublistValue({
																			id:		'custpage_sl0_required',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]),'0'), type: format.Type.FLOAT})
																			});	
												
												subList0.setSublistValue({
																			id:		'custpage_sl0_committed',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]),'0'), type: format.Type.FLOAT})
																			});	

												subList0.setSublistValue({
																			id:		'custpage_sl0_back_order',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]),'0'), type: format.Type.FLOAT})
																			});	
							    					
													
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_picked',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]),'0'), type: format.Type.FLOAT})
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_packed',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]),'0'), type: format.Type.FLOAT})
																			});	

												subList0.setSublistValue({
																			id:		'custpage_sl0_shipped',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[12]),'0'), type: format.Type.FLOAT})
																			});	


												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_sales',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[13]),'0'), type: format.Type.FLOAT})
																			});	
			    				
												subList0.setSublistValue({
																			id:		'custpage_sl0_no_ship_sales',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[14]),'0'), type: format.Type.FLOAT})
																			});	
												
												subList0.setSublistValue({
																			id:		'custpage_sl0_margin',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[15]).replace('%','')).toFixed(2),'0'), type: format.Type.PERCENT})
																			});	
		
												subList0.setSublistValue({
																			id:		'custpage_sl0_po_lines',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[17]),'0'), type: format.Type.FLOAT})
																			});	
												subList0.setSublistValue({
																			id:		'custpage_sl0_approved',
																			line:	line,
																			value:	salesorderSearchObj[int].getValue(salesorderColumnsObj[18]) 
																			});	

												subList0.setSublistValue({
																			id:		'custpage_sl0_cust_po',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[19]),'')
																			});	
												
												subList0.setSublistValue({
																			id:		'custpage_sl0_to_be_done',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[20]),'0'), type: format.Type.FLOAT})
																			});	
												
												totalRequired			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]));
												totalCommitted			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]));
												totalBackOrder			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]));
												totalPicked				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]));
												totalPacked				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]));
												totalShiped				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[12]));
												totalShip				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[13]));
												totalNonShip			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[14]));
												totalMargin          	+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[15]).replace('%',''));
												totalLines++;
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
								               ["status","anyof","SalesOrd:A","SalesOrd:B","SalesOrd:D","SalesOrd:E","SalesOrd:F"], 
								               "AND", 
								               ["shipcomplete","is","T"], 
								               "AND", 
								               ["formulanumeric: {quantity}-{quantitybilled}","notequalto","0"], 
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
								
								if(paramArea != null && paramArea != '')
									{
										filters.push("AND", ["customer.custentity_bbs_area", "anyof", paramArea]);
									}
							
								if(paramCreatedBy != null && paramCreatedBy != '')
									{
										filters.push("AND", ["createdby", "anyof", paramCreatedBy]);
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
									         label: "Loc"
									      }),
									      search.createColumn({
									         name: "tranid",
									         summary: "GROUP",
									         label: "SO #"
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
									         label: "Customer"
									      }),
									      search.createColumn({
									         name: "custentity_bbs_area",
									         join: "customer",
									         summary: "GROUP",
									         label: "Area"
									      }),
									      search.createColumn({
									         name: "createdby",
									         summary: "GROUP",
									         label: "Created by"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantity}-{quantitybilled}",
									         label: "Required"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END",
									         label: "Committed"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END",
									         label: "Back Ordered"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantitypicked}-{quantitypacked}",
									         label: "Picked"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantitypacked}-{quantityshiprecv}",
									         label: "Packed"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantityshiprecv}-{quantitybilled}",
									         label: "Shipped"
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
									      }),
									      search.createColumn({
									         name: "custbody_bbs_displaymarginpct",
									         summary: "AVG",
									         label: "Margin"
									      }),
									      search.createColumn({
									         name: "internalid",
									         summary: "GROUP",
									         label: "Internal ID"
									      }),
										  search.createColumn({
									          name: "formulanumeric",
									          summary: "SUM",
									          formula: "CASE WHEN {purchaseorder.number} IS NULL THEN 0 ELSE 1 END",
									          label: "PO Lines"
									       }),
									       search.createColumn({
									           name: "formulatext",
									           summary: "GROUP",
									           formula: "CASE WHEN {status} = 'Pending Approval' THEN 'NO' ELSE 'YES' END",
									           label: "Approved ?"
									        }),
									        search.createColumn({
									           name: "otherrefnum",
									           summary: "GROUP",
									           label: "Cust PO"
									        }),
									        search.createColumn({
									           name: "formulanumeric",
									           summary: "SUM",
									           formula: "(CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE CASE WHEN ({quantitypacked}-{quantityshiprecv})>0 THEN{quantitycommitted}- ({quantitypacked}-{quantityshiprecv}) ELSE CASE WHEN ({quantitypicked}-{quantitypacked})>0 THEN {quantitycommitted}- ({quantitypicked}-{quantitypacked})  ELSE {quantitycommitted} END END END) + ({quantitypicked}-{quantitypacked}) + ({quantitypacked}-{quantityshiprecv})",
									           label: "To Be Done"
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
																										recordId:		salesorderSearchObj[int].getValue(salesorderColumnsObj[16]),
																										recordType:		record.Type.SALES_ORDER
																										})
																			});	
							    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_complete',
																			line:	line,
																			value:	(salesorderSearchObj[int].getValue(salesorderColumnsObj[2]) == true ? 'Yes' : 'No')
																			});	
			    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_date',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[3]),'')
																			});	
			    						
												subList0.setSublistValue({
																			id:		'custpage_sl0_name',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[4]),'')
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_area',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[5]),'')
																			});	

			
												subList0.setSublistValue({
																			id:		'custpage_sl0_created',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[6]),'')
																			});	

												subList0.setSublistValue({
																			id:		'custpage_sl0_required',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]),'0'), type: format.Type.FLOAT})
																			});	
												
												subList0.setSublistValue({
																			id:		'custpage_sl0_committed',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]),'0'), type: format.Type.FLOAT})
																			});	

												subList0.setSublistValue({
																			id:		'custpage_sl0_back_order',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]),'0'), type: format.Type.FLOAT})
																			});	
							    					
													
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_picked',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]),'0'), type: format.Type.FLOAT})
																			});	
	
												subList0.setSublistValue({
																			id:		'custpage_sl0_packed',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]),'0'), type: format.Type.FLOAT})
																			});	

												subList0.setSublistValue({
																			id:		'custpage_sl0_shipped',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[12]),'0'), type: format.Type.FLOAT})
																			});	


												subList0.setSublistValue({
																			id:		'custpage_sl0_ship_sales',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[13]),'0'), type: format.Type.FLOAT})
																			});	
			    				
												subList0.setSublistValue({
																			id:		'custpage_sl0_no_ship_sales',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[14]),'0'), type: format.Type.FLOAT})
																			});	
												
												subList0.setSublistValue({
																			id:		'custpage_sl0_margin',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[15]).replace('%','')).toFixed(2),'0'), type: format.Type.PERCENT})
																			});	
		
												subList0.setSublistValue({
																			id:		'custpage_sl0_po_lines',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[17]),'0'), type: format.Type.FLOAT})
																			});	
						
												subList0.setSublistValue({
																			id:		'custpage_sl0_approved',
																			line:	line,
																			value:	salesorderSearchObj[int].getValue(salesorderColumnsObj[18]) 
																			});	

												subList0.setSublistValue({
																			id:		'custpage_sl0_cust_po',
																			line:	line,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[19]),'')
																			});	
												
												subList0.setSublistValue({
																			id:		'custpage_sl0_to_be_done',
																			line:	line,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[20]),'0'), type: format.Type.FLOAT})
																			});	
												
												totalRequired			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]));
												totalCommitted			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]));
												totalBackOrder			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]));
												totalPicked				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]));
												totalPacked				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]));
												totalShiped				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[12]));
												totalShip				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[13]));
												totalNonShip			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[14]));
												totalMargin          	+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[15]).replace('%',''));
												totalLines++;

						    				}
									}	
							
								
								fieldTotalRequired.defaultValue 	= totalRequired.toFixed(2);
								fieldTotalCommitted.defaultValue 	= totalCommitted.toFixed(2);
								fieldTotalBackOrder.defaultValue 	= totalBackOrder.toFixed(2);
								fieldTotalPicked.defaultValue 		= totalPicked.toFixed(2);
								fieldTotalPacked.defaultValue 		= totalPacked.toFixed(2);
								fieldTotalShiped.defaultValue 		= totalShiped.toFixed(2);
								fieldTotalShip.defaultValue 		= totalShip.toFixed(2);
								fieldTotalNonShip.defaultValue 		= totalNonShip.toFixed(2);
						//		fieldTotalMargin.defaultValue       = (totalMargin/totalLines).toFixed(2);
								
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
														
								var fieldTotalRequired = form.addField({
												id:			'custpage_sl1_tot_req',
												label:		'Required Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_not_sc'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalCommitted = form.addField({
												id:			'custpage_sl1_tot_com',
												label:		'Committed Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_not_sc'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
		
								var fieldTotalBackOrder = form.addField({
												id:			'custpage_sl1_tot_bo',
												label:		'Back Order Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_not_sc'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	

								var fieldTotalPicked = form.addField({
												id:			'custpage_sl1_tot_picked',
												label:		'Picked Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_not_sc'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalPacked = form.addField({
												id:			'custpage_sl1_tot_packed',
												label:		'Packed Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_not_sc'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalShiped = form.addField({
												id:			'custpage_sl1_tot_shiped',
												label:		'Shipped Total',
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
						
								var fieldTotalMargin = form.addField({
			                                    id:         'custpage_sl1_tot_margin',
			                                    label:      'Average Margin',
			                                    type:    serverWidget.FieldType.PERCENT,
			                                    container:  'custpage_subtab_not_sc'
			                                 }).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN}); 
													
								//Add a sublist to subtab
								//
								var subList1 = form.addSublist({
																id:		'custpage_sublist_not_sc', 
																type:	serverWidget.SublistType.LIST, 
																label:	'Overall Summary',
																tab:	'custpage_subtab_not_sc'
																});
								
								//Add columns to sublist
								//
								subList1.addField({
													id:		'custpage_sl1_inv_loc',
													label:	'Loc',
													type:	serverWidget.FieldType.TEXT
												});													//Inventory Location
					
								
								
								subList1.addField({
													id:		'custpage_sl1_doc_no',
													label:	'SO #',
													type:	serverWidget.FieldType.TEXT
												});													//Document No
					
												
								
								
								var linkField = subList1.addField({
													id:		'custpage_sl1_doc_link',
													label:	'View',
													type:	serverWidget.FieldType.URL
												});													//Item url link
					
								linkField.linkText = 'View';
								
								subList1.addField({
				                                    id:      'custpage_sl1_approved',
				                                    label:   'Approved ?',
				                                    type: serverWidget.FieldType.TEXT            //Approved
				                                 });      
                        
								subList1.addField({
				                                    id:      'custpage_sl1_cust_po',
				                                    label:   'Cust PO',
				                                    type: serverWidget.FieldType.TEXT            //Cust PO
				                                 });    
								
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
													label:	'Customer',
													type:	serverWidget.FieldType.TEXT
												});													//Name
	
								subList1.addField({
													id:		'custpage_sl1_area',
													label:	'Area',
													type:	serverWidget.FieldType.TEXT
												});													//Area

								subList1.addField({
													id:		'custpage_sl1_created',
													label:	'Created By',
													type:	serverWidget.FieldType.TEXT
												});													//CreatedBy

								subList1.addField({
													id:		'custpage_sl1_required',
													label:	'Required',
													type:	serverWidget.FieldType.FLOAT
												});													//Required Stock
								
								subList1.addField({
													id:		'custpage_sl1_po_lines',
													label:	'PO Lines',
													type:	serverWidget.FieldType.FLOAT
												});													//PO Lines

								subList1.addField({
													id:		'custpage_sl1_committed',
													label:	'Available To Pick',
													type:	serverWidget.FieldType.FLOAT
												});													//Committed

								subList1.addField({
													id:		'custpage_sl1_back_order',
													label:	'Back Ordered',
													type:	serverWidget.FieldType.FLOAT
												});													//Back Order qty
					
				
								
								subList1.addField({
													id:		'custpage_sl1_picked',
													label:	'Picked',
													type:	serverWidget.FieldType.FLOAT
												});													//Picked
	
								subList1.addField({
													id:		'custpage_sl1_packed',
													label:	'Packed',
													type:	serverWidget.FieldType.FLOAT
												});													//Packed

				
								subList1.addField({
													id:		'custpage_sl1_shipped',
													label:	'Shipped',
													type:	serverWidget.FieldType.FLOAT
												});													//Shipped

								subList1.addField({
				                                    id:      'custpage_sl1_to_be_done',
				                                    label:   'To Be Done',
				                                    type: serverWidget.FieldType.FLOAT        //To Be Done
				                                 });   
								
								subList1.addField({
													id:		'custpage_sl1_ship_sales',
													label:	'Ship Value',
													type:	serverWidget.FieldType.CURRENCY
												});													//Ship Sales Value
	
								subList1.addField({
													id:		'custpage_sl1_no_ship_sales',
													label:	'Non Ship Value',
													type:	serverWidget.FieldType.CURRENCY
												});													//No Ship Sales Value
	
								subList1.addField({
													id:		'custpage_sl1_margin',
													label:	'Margin %',
													type:	serverWidget.FieldType.PERCENT
												});													//Margin
								
								var totalBackOrder			= Number(0);
								var totalCommitted			= Number(0);
								var totalRequired			= Number(0);
								var totalInProgress			= Number(0);
								var totalPicked				= Number(0);
								var totalPacked				= Number(0);
								var totalShiped				= Number(0);
								var totalShip				= Number(0);
								var totalNonShip			= Number(0);
								var totalMargin             = Number(0);
								var totalLines              = Number(0);
								
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
								               ["status","anyof","SalesOrd:A","SalesOrd:B","SalesOrd:D","SalesOrd:E","SalesOrd:F"], 
								               "AND", 
								               ["shipcomplete","is","F"], 
								               "AND", 
								               ["memorized","is","F"], 
								               "AND", 
								               ["formulanumeric: {quantity}-{quantitybilled}","greaterthan","0"]
								            ];
								
								if(paramLocation != null && paramLocation != '')
									{
										filters.push("AND", ["inventorylocation", "anyof", paramLocation]);
									}
								
								if(paramCustomer != null && paramCustomer != '')
									{
										filters.push("AND", ["entity", "anyof", paramCustomer]);
									}
								
								if(paramArea != null && paramArea != '')
									{
										filters.push("AND", ["customer.custentity_bbs_area", "anyof", paramArea]);
									}
							
								if(paramCreatedBy != null && paramCreatedBy != '')
									{
										filters.push("AND", ["createdby", "anyof", paramCreatedBy]);
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
										         label: "Loc"
										      }),
										      search.createColumn({
										         name: "tranid",
										         summary: "GROUP",
										         label: "SO#"
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
										         label: "Customer"
										      }),
										      search.createColumn({
										         name: "custentity_bbs_area",
										         join: "customer",
										         summary: "GROUP",
										         label: "Area"
										      }),
										      search.createColumn({
										         name: "createdby",
										         summary: "GROUP",
										         label: "Created by"
										      }),
										      search.createColumn({
										         name: "formulanumeric",
										         summary: "SUM",
										         formula: "{quantity}-{quantitybilled}",
										         label: "Required"
										      }),
										      search.createColumn({
										         name: "formulanumeric",
										         summary: "SUM",
										         formula: "CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END",
										         label: "Committed"
										      }),
										      search.createColumn({
										         name: "formulanumeric",
										         summary: "SUM",
										         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END",
										         label: "Back Ordered"
										      }),
										      search.createColumn({
										         name: "formulanumeric",
										         summary: "SUM",
										         formula: "{quantitypicked}-{quantitypacked}",
										         label: "Picked"
										      }),
										      search.createColumn({
										         name: "formulanumeric",
										         summary: "SUM",
										         formula: "{quantitypacked}-{quantityshiprecv}",
										         label: "Packed"
										      }),
										      search.createColumn({
										         name: "formulanumeric",
										         summary: "SUM",
										         formula: "{quantityshiprecv}-{quantitybilled}",
										         label: "Shipped"
										      }),
										      search.createColumn({
										         name: "formulacurrency",
										         summary: "SUM",
										         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantityshiprecv}-{quantitybilled})* {rate} ELSE ({quantitycommitted}+({quantityshiprecv}-{quantitybilled}))* {rate} END",
										         label: "Ship Value"
										      }),
										      search.createColumn({
										         name: "formulacurrency",
										         summary: "SUM",
										         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END * {rate}",
										         label: "Non Ship Value"
										      }),
										      search.createColumn({
										         name: "custbody_bbs_displaymarginpct",
										         summary: "AVG",
										         label: "Margin %"
										      }),
										      search.createColumn({
											         name: "internalid",
											         summary: "GROUP",
											         label: "Internal Id"
											      }) ,
											  search.createColumn({
											          name: "formulanumeric",
											          summary: "SUM",
											          formula: "CASE WHEN {purchaseorder.number} IS NULL THEN 0 ELSE 1 END",
											          label: "PO Lines"
											       }),
											       search.createColumn({
											           name: "formulatext",
											           summary: "GROUP",
											           formula: "CASE WHEN {status} = 'Pending Approval' THEN 'NO' ELSE 'YES' END",
											           label: "Approved ?"
											        }),
											        search.createColumn({
											           name: "otherrefnum",
											           summary: "GROUP",
											           label: "Cust PO"
											        }),
											        search.createColumn({
											           name: "formulanumeric",
											           summary: "SUM",
											           formula: "(CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE CASE WHEN ({quantitypacked}-{quantityshiprecv})>0 THEN{quantitycommitted}- ({quantitypacked}-{quantityshiprecv}) ELSE CASE WHEN ({quantitypicked}-{quantitypacked})>0 THEN {quantitycommitted}- ({quantitypicked}-{quantitypacked})  ELSE {quantitycommitted} END END END) + ({quantitypicked}-{quantitypacked}) + ({quantitypacked}-{quantityshiprecv})",
											           label: "To Be Done"
											        })
										   ]
									});
									
								var salesorderSearchObj 	= getResults(searchObj);
								var salesorderColumnsObj 	= searchObj.columns;
							
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
																										recordId:		salesorderSearchObj[int].getValue(salesorderColumnsObj[16]),
																										recordType:		record.Type.SALES_ORDER
																										})
																			});	
							    						
												subList1.setSublistValue({
																			id:		'custpage_sl1_ship_complete',
																			line:	int,
																			value:	(salesorderSearchObj[int].getValue(salesorderColumnsObj[2]) == true ? 'Yes' : 'No')
																			});	
			    						
												subList1.setSublistValue({
																			id:		'custpage_sl1_ship_date',
																			line:	int,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[3]),'')
																			});	
			    						
												subList1.setSublistValue({
																			id:		'custpage_sl1_name',
																			line:	int,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[4]),'')
																			});	
	
												subList1.setSublistValue({
																			id:		'custpage_sl1_area',
																			line:	int,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[5]),'')
																			});	

			
												subList1.setSublistValue({
																			id:		'custpage_sl1_created',
																			line:	int,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[6]),'')
																			});	

												subList1.setSublistValue({
																			id:		'custpage_sl1_required',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]),'0'), type: format.Type.FLOAT})
																			});	
												
												subList1.setSublistValue({
																			id:		'custpage_sl1_committed',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]),'0'), type: format.Type.FLOAT})
																			});	

												subList1.setSublistValue({
																			id:		'custpage_sl1_back_order',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]),'0'), type: format.Type.FLOAT})
																			});	
							    					
													
	
												subList1.setSublistValue({
																			id:		'custpage_sl1_picked',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]),'0'), type: format.Type.FLOAT})
																			});	
	
												subList1.setSublistValue({
																			id:		'custpage_sl1_packed',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]),'0'), type: format.Type.FLOAT})
																			});	

												subList1.setSublistValue({
																			id:		'custpage_sl1_shipped',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[12]),'0'), type: format.Type.FLOAT})
																			});	


												subList1.setSublistValue({
																			id:		'custpage_sl1_ship_sales',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[13]),'0'), type: format.Type.FLOAT})
																			});	
			    				
												subList1.setSublistValue({
																			id:		'custpage_sl1_no_ship_sales',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[14]),'0'), type: format.Type.FLOAT})
																			});	
												
												subList1.setSublistValue({
																			id:		'custpage_sl1_margin',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[15]).replace('%','')).toFixed(2),'0'), type: format.Type.PERCENT})
																			});	

												subList1.setSublistValue({
																			id:		'custpage_sl1_po_lines',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[17]),'0'), type: format.Type.FLOAT})
																			});	

												subList1.setSublistValue({
																			id:		'custpage_sl1_approved',
																			line:	int,
																			value:	salesorderSearchObj[int].getValue(salesorderColumnsObj[18]) 
																			});	

												subList1.setSublistValue({
																			id:		'custpage_sl1_cust_po',
																			line:	int,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[19]),'')
																			});	
												
												subList1.setSublistValue({
																			id:		'custpage_sl1_to_be_done',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[20]),'0'), type: format.Type.FLOAT})
																			});	
												
												totalRequired			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]));
												totalCommitted			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]));
												totalBackOrder			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]));
												totalPicked				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]));
												totalPacked				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]));
												totalShiped				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[12]));
												totalShip				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[13]));
												totalNonShip			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[14]));
												totalMargin          	+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[15]).replace('%',''));
												totalLines++;
						    				}
									}	
								
								fieldTotalRequired.defaultValue 	= totalRequired.toFixed(2);
								fieldTotalCommitted.defaultValue 	= totalCommitted.toFixed(2);
								fieldTotalBackOrder.defaultValue 	= totalBackOrder.toFixed(2);
								fieldTotalPicked.defaultValue 		= totalPicked.toFixed(2);
								fieldTotalPacked.defaultValue 		= totalPacked.toFixed(2);
								fieldTotalShiped.defaultValue 		= totalShiped.toFixed(2);
								fieldTotalShip.defaultValue 		= totalShip.toFixed(2);
								fieldTotalNonShip.defaultValue 		= totalNonShip.toFixed(2);
					//			fieldTotalMargin.defaultValue       = (totalMargin/totalLines).toFixed(2);
								
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
								var fieldTotalRequired = form.addField({
												id:			'custpage_sl2_tot_req',
												label:		'Required Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_ship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalCommitted = form.addField({
												id:			'custpage_sl2_tot_com',
												label:		'Committed Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_ship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
		
								var fieldTotalBackOrder = form.addField({
												id:			'custpage_sl2_tot_bo',
												label:		'Back Order Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_ship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	

								var fieldTotalPicked = form.addField({
												id:			'custpage_sl2_tot_picked',
												label:		'Picked Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_ship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalPacked = form.addField({
												id:			'custpage_sl2_tot_packed',
												label:		'Packed Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_ship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalShiped = form.addField({
												id:			'custpage_sl2_tot_shiped',
												label:		'Shipped Total',
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
						
								var fieldTotalMargin = form.addField({
												id:			'custpage_sl2_tot_margin',
												label:		'Average Margin',
												type:		serverWidget.FieldType.PERCENT,
												container:	'custpage_subtab_sc_ship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});	

								//Add a sublist to subtab
								//
								var subList2 = form.addSublist({
																id:		'custpage_sublist_sc_ship', 
																type:	serverWidget.SublistType.LIST, 
																label:	'Overall Summary',
																tab:	'custpage_subtab_sc_ship'
																});
								
								//Add columns to sublist
								//
								subList2.addField({
													id:		'custpage_sl2_inv_loc',
													label:	'Loc',
													type:	serverWidget.FieldType.TEXT
												});													//Inventory Location
					
								
								
								subList2.addField({
													id:		'custpage_sl2_doc_no',
													label:	'SO #',
													type:	serverWidget.FieldType.TEXT
												});													//Document No
					
												
								
								
								var linkField = subList2.addField({
													id:		'custpage_sl2_doc_link',
													label:	'View',
													type:	serverWidget.FieldType.URL
												});													//Item url link
					
								linkField.linkText = 'View';
								
								subList2.addField({
					                                    id:      'custpage_sl2_approved',
					                                    label:   'Approved ?',
					                                    type: serverWidget.FieldType.TEXT            //Approved
					                                 });      
                        
								subList2.addField({
				                                    id:      'custpage_sl2_cust_po',
				                                    label:   'Cust PO',
				                                    type: serverWidget.FieldType.TEXT            //Cust PO
				                                 });  
								
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
													label:	'Customer',
													type:	serverWidget.FieldType.TEXT
												});													//Name
	
								subList2.addField({
													id:		'custpage_sl2_area',
													label:	'Area',
													type:	serverWidget.FieldType.TEXT
												});													//Area

								subList2.addField({
													id:		'custpage_sl2_created',
													label:	'Created By',
													type:	serverWidget.FieldType.TEXT
												});													//CreatedBy

								subList2.addField({
													id:		'custpage_sl2_required',
													label:	'Required',
													type:	serverWidget.FieldType.FLOAT
												});													//Required Stock
								
								subList2.addField({
													id:		'custpage_sl2_po_lines',
													label:	'PO Lines',
													type:	serverWidget.FieldType.FLOAT
												});	
								
								subList2.addField({
													id:		'custpage_sl2_committed',
													label:	'Available To Pick',
													type:	serverWidget.FieldType.FLOAT
												});													//Committed

								subList2.addField({
													id:		'custpage_sl2_back_order',
													label:	'Back Ordered',
													type:	serverWidget.FieldType.FLOAT
												});													//Back Order qty
					
				
								
								subList2.addField({
													id:		'custpage_sl2_picked',
													label:	'Picked',
													type:	serverWidget.FieldType.FLOAT
												});													//Picked
	
								subList2.addField({
													id:		'custpage_sl2_packed',
													label:	'Packed',
													type:	serverWidget.FieldType.FLOAT
												});													//Packed

				
								subList2.addField({
													id:		'custpage_sl2_shipped',
													label:	'Shipped',
													type:	serverWidget.FieldType.FLOAT
												});													//Shipped

								subList2.addField({
				                                    id:      'custpage_sl2_to_be_done',
				                                    label:   'To Be Done',
				                                    type: serverWidget.FieldType.FLOAT        //To Be Done
				                                 }); 
								
								subList2.addField({
													id:		'custpage_sl2_ship_sales',
													label:	'Ship Value',
													type:	serverWidget.FieldType.CURRENCY
												});													//Ship Sales Value
	
								subList2.addField({
													id:		'custpage_sl2_no_ship_sales',
													label:	'Non Ship Value',
													type:	serverWidget.FieldType.CURRENCY
												});													//No Ship Sales Value
	
								subList2.addField({
													id:		'custpage_sl2_margin',
													label:	'Margin %',
													type:	serverWidget.FieldType.PERCENT
												});													//Margin
								
								var totalBackOrder			= Number(0);
								var totalCommitted			= Number(0);
								var totalRequired			= Number(0);
								var totalInProgress			= Number(0);
								var totalPicked				= Number(0);
								var totalPacked				= Number(0);
								var totalShiped				= Number(0);
								var totalShip				= Number(0);
								var totalNonShip			= Number(0);
								var totalMargin            = Number(0);
								var totalLines             = Number(0);
								
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
								               ["status","anyof","SalesOrd:B","SalesOrd:D","SalesOrd:E","SalesOrd:F","SalesOrd:A"], 
								               "AND", 
								               ["item.type","noneof","Discount"], 
								               "AND", 
								               ["formulanumeric: {quantity}-{quantitybilled}","notequalto","0"], 
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
								
								if(paramArea != null && paramArea != '')
									{
										filters.push("AND", ["customer.custentity_bbs_area", "anyof", paramArea]);
									}
							
								if(paramCreatedBy != null && paramCreatedBy != '')
									{
										filters.push("AND", ["createdby", "anyof", paramCreatedBy]);
									}
							
								
								//Find any items to process & populate the sublist non ship complete orders 
								//
								var searchObj =	search.create({
									   type: "salesorder",
									   filters: filters,
									   columns:
									   [
									      search.createColumn({
									         name: "inventorylocation",
									         summary: "GROUP",
									         sort: search.Sort.ASC,
									         label: "Loc"
									      }),
									      search.createColumn({
									         name: "tranid",
									         summary: "GROUP",
									         label: "SO #"
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
									         label: "Customer"
									      }),
									      search.createColumn({
									         name: "custentity_bbs_area",
									         join: "customer",
									         summary: "GROUP",
									         label: "Area"
									      }),
									      search.createColumn({
									         name: "createdby",
									         summary: "GROUP",
									         label: "Created by"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantity}-{quantitybilled}",
									         label: "Required"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END",
									         label: "Committed"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END",
									         label: "Back Ordered"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantitypicked}-{quantitypacked}",
									         label: "Picked"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantitypacked}-{quantityshiprecv}",
									         label: "Packed"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantityshiprecv}-{quantitybilled}",
									         label: "Shipped"
									      }),
									      search.createColumn({
									         name: "formulacurrency",
									         summary: "SUM",
									         formula: "({quantitycommitted}+({quantityshiprecv}-{quantitybilled}))* {rate}",
									         label: "Ship Sales Value"
									      }),
									      search.createColumn({
									         name: "formulacurrency",
									         summary: "SUM",
									         formula: "0",
									         label: "Non Ship Sales Value"
									      }),
									      search.createColumn({
									         name: "custbody_bbs_displaymarginpct",
									         summary: "AVG",
									         label: "Margin"
									      }),
									      search.createColumn({
									         name: "internalid",
									         summary: "GROUP",
									         label: "Internal ID"
									      }),
										  search.createColumn({
									          name: "formulanumeric",
									          summary: "SUM",
									          formula: "CASE WHEN {purchaseorder.number} IS NULL THEN 0 ELSE 1 END",
									          label: "PO Lines"
									       }),
									       search.createColumn({
									           name: "formulatext",
									           summary: "GROUP",
									           formula: "CASE WHEN {status} = 'Pending Approval' THEN 'NO' ELSE 'YES' END",
									           label: "Approved ?"
									        }),
									        search.createColumn({
									           name: "otherrefnum",
									           summary: "GROUP",
									           label: "Cust PO"
									        }),
									        search.createColumn({
									           name: "formulanumeric",
									           summary: "SUM",
									           formula: "(CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE CASE WHEN ({quantitypacked}-{quantityshiprecv})>0 THEN{quantitycommitted}- ({quantitypacked}-{quantityshiprecv}) ELSE CASE WHEN ({quantitypicked}-{quantitypacked})>0 THEN {quantitycommitted}- ({quantitypicked}-{quantitypacked})  ELSE {quantitycommitted} END END END) + ({quantitypicked}-{quantitypacked}) + ({quantitypacked}-{quantityshiprecv})",
									           label: "To Be Done"
									        })
									   ]
									});
									
								var salesorderSearchObj 	= getResults(searchObj);
								var salesorderColumnsObj 	= searchObj.columns;
							
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
																										recordId:		salesorderSearchObj[int].getValue(salesorderColumnsObj[16]),
																										recordType:		record.Type.SALES_ORDER
																										})
																			});	
							    						
												subList2.setSublistValue({
																			id:		'custpage_sl2_ship_complete',
																			line:	int,
																			value:	(salesorderSearchObj[int].getValue(salesorderColumnsObj[2]) == true ? 'Yes' : 'No')
																			});	
			    						
												subList2.setSublistValue({
																			id:		'custpage_sl2_ship_date',
																			line:	int,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[3]),'')
																			});	
			    						
												subList2.setSublistValue({
																			id:		'custpage_sl2_name',
																			line:	int,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[4]),'')
																			});	
	
												subList2.setSublistValue({
																			id:		'custpage_sl2_area',
																			line:	int,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[5]),'')
																			});	

			
												subList2.setSublistValue({
																			id:		'custpage_sl2_created',
																			line:	int,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[6]),'')
																			});	

												subList2.setSublistValue({
																			id:		'custpage_sl2_required',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]),'0'), type: format.Type.FLOAT})
																			});	
												
												subList2.setSublistValue({
																			id:		'custpage_sl2_committed',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]),'0'), type: format.Type.FLOAT})
																			});	

												subList2.setSublistValue({
																			id:		'custpage_sl2_back_order',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]),'0'), type: format.Type.FLOAT})
																			});	
							    					
													
	
												subList2.setSublistValue({
																			id:		'custpage_sl2_picked',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]),'0'), type: format.Type.FLOAT})
																			});	
	
												subList2.setSublistValue({
																			id:		'custpage_sl2_packed',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]),'0'), type: format.Type.FLOAT})
																			});	

												subList2.setSublistValue({
																			id:		'custpage_sl2_shipped',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[12]),'0'), type: format.Type.FLOAT})
																			});	


												subList2.setSublistValue({
																			id:		'custpage_sl2_ship_sales',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[13]),'0'), type: format.Type.FLOAT})
																			});	
			    				
												subList2.setSublistValue({
																			id:		'custpage_sl2_no_ship_sales',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[14]),'0'), type: format.Type.FLOAT})
																			});	
												
												subList2.setSublistValue({
																			id:		'custpage_sl2_margin',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[15]).replace('%','')).toFixed(2),'0'), type: format.Type.PERCENT})
																			});	
												
												subList2.setSublistValue({
																			id:		'custpage_sl2_po_lines',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[17]),'0'), type: format.Type.FLOAT})
																			});	
		
												subList2.setSublistValue({
																			id:		'custpage_sl2_approved',
																			line:	int,
																			value:	salesorderSearchObj[int].getValue(salesorderColumnsObj[18]) 
																			});	
						
												subList2.setSublistValue({
																			id:		'custpage_sl2_cust_po',
																			line:	int,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[19]),'')
																			});	
												
												subList2.setSublistValue({
																			id:		'custpage_sl2_to_be_done',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[20]),'0'), type: format.Type.FLOAT})
																			});	
												
												totalRequired			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]));
												totalCommitted			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]));
												totalBackOrder			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]));
												totalPicked				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]));
												totalPacked				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]));
												totalShiped				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[12]));
												totalShip				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[13]));
												totalNonShip			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[14]));
												totalMargin          	+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[15]).replace('%',''));
												totalLines++;
						    				}
									}	
								
								fieldTotalRequired.defaultValue 	= totalRequired.toFixed(2);
								fieldTotalCommitted.defaultValue 	= totalCommitted.toFixed(2);
								fieldTotalBackOrder.defaultValue 	= totalBackOrder.toFixed(2);
								fieldTotalPicked.defaultValue 		= totalPicked.toFixed(2);
								fieldTotalPacked.defaultValue 		= totalPacked.toFixed(2);
								fieldTotalShiped.defaultValue 		= totalShiped.toFixed(2);
								fieldTotalShip.defaultValue 		= totalShip.toFixed(2);
								fieldTotalNonShip.defaultValue 		= totalNonShip.toFixed(2);
					//			fieldTotalMargin.defaultValue       = (totalMargin/totalLines).toFixed(2);
			
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
								var fieldTotalRequired = form.addField({
												id:			'custpage_sl3_tot_req',
												label:		'Required Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_noship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalCommitted = form.addField({
												id:			'custpage_sl3_tot_com',
												label:		'Committed Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_noship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
		
								var fieldTotalBackOrder = form.addField({
												id:			'custpage_sl3_tot_bo',
												label:		'Back Order Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_noship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	

								var fieldTotalPicked = form.addField({
												id:			'custpage_sl3_tot_picked',
												label:		'Picked Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_noship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalPacked = form.addField({
												id:			'custpage_sl3_tot_packed',
												label:		'Packed Total',
												type:		serverWidget.FieldType.TEXT,
												container:	'custpage_subtab_sc_noship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});	
							
								var fieldTotalShiped = form.addField({
												id:			'custpage_sl3_tot_shiped',
												label:		'Shipped Total',
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
						
								var fieldTotalMargin = form.addField({
												id:			'custpage_sl3_tot_margin',
												label:		'Average Margin',
												type:		serverWidget.FieldType.PERCENT,
												container:	'custpage_subtab_sc_noship'
											}).updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});	
			
								//Add a sublist to subtab
								//
								var subList3 = form.addSublist({
																id:		'custpage_sublist_sc_noship', 
																type:	serverWidget.SublistType.LIST, 
																label:	'Overall Summary',
																tab:	'custpage_subtab_sc_noship'
																});
								
								//Add columns to sublist
								//
								subList3.addField({
													id:		'custpage_sl3_inv_loc',
													label:	'Loc',
													type:	serverWidget.FieldType.TEXT
												});													//Inventory Location
					
								
								
								subList3.addField({
													id:		'custpage_sl3_doc_no',
													label:	'SO #',
													type:	serverWidget.FieldType.TEXT
												});													//Document No
					
												
								
								
								var linkField = subList3.addField({
													id:		'custpage_sl3_doc_link',
													label:	'View',
													type:	serverWidget.FieldType.URL
												});													//Item url link
					
								linkField.linkText = 'View';
								
								subList3.addField({
				                                    id:      'custpage_sl3_approved',
				                                    label:   'Approved ?',
				                                    type: serverWidget.FieldType.TEXT            //Approved
				                                 });      
                        
			                     subList3.addField({
			                                    id:      'custpage_sl3_cust_po',
			                                    label:   'Cust PO',
			                                    type: serverWidget.FieldType.TEXT            //Cust PO
			                                 }); 
                     
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
													label:	'Customer',
													type:	serverWidget.FieldType.TEXT
												});													//Name
	
								subList3.addField({
													id:		'custpage_sl3_area',
													label:	'Area',
													type:	serverWidget.FieldType.TEXT
												});													//Area

								subList3.addField({
													id:		'custpage_sl3_created',
													label:	'Crerated By',
													type:	serverWidget.FieldType.TEXT
												});													//CreatedBy

								subList3.addField({
													id:		'custpage_sl3_required',
													label:	'Required',
													type:	serverWidget.FieldType.FLOAT
												});													//Required Stock
								
								subList3.addField({
													id:		'custpage_sl3_po_lines',
													label:	'PO Lines',
													type:	serverWidget.FieldType.FLOAT
												});	
								subList3.addField({
													id:		'custpage_sl3_committed',
													label:	'Available To Pick',
													type:	serverWidget.FieldType.FLOAT
												});													//Committed

								subList3.addField({
													id:		'custpage_sl3_back_order',
													label:	'Back Ordered',
													type:	serverWidget.FieldType.FLOAT
												});													//Back Order qty
					
				
								
								subList3.addField({
													id:		'custpage_sl3_picked',
													label:	'Picked',
													type:	serverWidget.FieldType.FLOAT
												});													//Picked
	
								subList3.addField({
													id:		'custpage_sl3_packed',
													label:	'Packed',
													type:	serverWidget.FieldType.FLOAT
												});													//Packed

				
								subList3.addField({
													id:		'custpage_sl3_shipped',
													label:	'Shipped',
													type:	serverWidget.FieldType.FLOAT
												});													//Shipped

								subList3.addField({
				                                    id:      'custpage_sl3_to_be_done',
				                                    label:   'To Be Done',
				                                    type: serverWidget.FieldType.FLOAT       		 //To Be Done
				                                 });   
								
								subList3.addField({
													id:		'custpage_sl3_ship_sales',
													label:	'Ship Value',
													type:	serverWidget.FieldType.CURRENCY
												});													//Ship Sales Value
	
								subList3.addField({
													id:		'custpage_sl3_no_ship_sales',
													label:	'Non Ship Value',
													type:	serverWidget.FieldType.CURRENCY
												});													//No Ship Sales Value
	
								subList3.addField({
													id:		'custpage_sl3_margin',
													label:	'Margin %',
													type:	serverWidget.FieldType.PERCENT
												});													//Margin
								
								var totalBackOrder			= Number(0);
								var totalCommitted			= Number(0);
								var totalRequired			= Number(0);
								var totalInProgress			= Number(0);
								var totalPicked				= Number(0);
								var totalPacked				= Number(0);
								var totalShiped				= Number(0);
								var totalShip				= Number(0);
								var totalNonShip			= Number(0);
								var totalMargin				= Number(0);
								var totalLines 				= Number(0);
								
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
								               ["status","anyof","SalesOrd:A","SalesOrd:B","SalesOrd:D","SalesOrd:E","SalesOrd:F"], 
								               "AND", 
								               ["shipcomplete","is","T"], 
								               "AND", 
								               ["formulanumeric: {quantity}-{quantitybilled}","notequalto","0"], 
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
								
								if(paramArea != null && paramArea != '')
									{
										filters.push("AND", ["customer.custentity_bbs_area", "anyof", paramArea]);
									}
							
								if(paramCreatedBy != null && paramCreatedBy != '')
									{
										filters.push("AND", ["createdby", "anyof", paramCreatedBy]);
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
									         label: "Loc"
									      }),
									      search.createColumn({
									         name: "tranid",
									         summary: "GROUP",
									         label: "SO #"
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
									         label: "Customer"
									      }),
									      search.createColumn({
									         name: "custentity_bbs_area",
									         join: "customer",
									         summary: "GROUP",
									         label: "Area"
									      }),
									      search.createColumn({
									         name: "createdby",
									         summary: "GROUP",
									         label: "Created by"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantity}-{quantitybilled}",
									         label: "Required"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE {quantitycommitted} END",
									         label: "Committed"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "CASE WHEN {quantitycommitted} IS NULL THEN ({quantity}-{quantityshiprecv})-0 ELSE  ({quantity}-{quantityshiprecv})-{quantitycommitted} END",
									         label: "Back Ordered"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantitypicked}-{quantitypacked}",
									         label: "Picked"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantitypacked}-{quantityshiprecv}",
									         label: "Packed"
									      }),
									      search.createColumn({
									         name: "formulanumeric",
									         summary: "SUM",
									         formula: "{quantityshiprecv}-{quantitybilled}",
									         label: "Shipped"
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
									      }),
									      search.createColumn({
									         name: "custbody_bbs_displaymarginpct",
									         summary: "AVG",
									         label: "Margin"
									      }),
									      search.createColumn({
									         name: "internalid",
									         summary: "GROUP",
									         label: "Internal ID"
									      }),
										  search.createColumn({
									          name: "formulanumeric",
									          summary: "SUM",
									          formula: "CASE WHEN {purchaseorder.number} IS NULL THEN 0 ELSE 1 END",
									          label: "PO Lines"
									       }),
									       search.createColumn({
									           name: "formulatext",
									           summary: "GROUP",
									           formula: "CASE WHEN {status} = 'Pending Approval' THEN 'NO' ELSE 'YES' END",
									           label: "Approved ?"
									        }),
									        search.createColumn({
									           name: "otherrefnum",
									           summary: "GROUP",
									           label: "Cust PO"
									        }),
									        search.createColumn({
									           name: "formulanumeric",
									           summary: "SUM",
									           formula: "(CASE WHEN {quantitycommitted} IS NULL Then 0 ELSE CASE WHEN ({quantitypacked}-{quantityshiprecv})>0 THEN{quantitycommitted}- ({quantitypacked}-{quantityshiprecv}) ELSE CASE WHEN ({quantitypicked}-{quantitypacked})>0 THEN {quantitycommitted}- ({quantitypicked}-{quantitypacked})  ELSE {quantitycommitted} END END END) + ({quantitypicked}-{quantitypacked}) + ({quantitypacked}-{quantityshiprecv})",
									           label: "To Be Done"
									        })
									   ]
									});
									
									
								var salesorderSearchObj 	= getResults(searchObj);
								var salesorderColumnsObj 	= searchObj.columns;
							
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
																										recordId:		salesorderSearchObj[int].getValue(salesorderColumnsObj[16]),
																										recordType:		record.Type.SALES_ORDER
																										})
																			});	
							    						
												subList3.setSublistValue({
																			id:		'custpage_sl3_ship_complete',
																			line:	int,
																			value:	(salesorderSearchObj[int].getValue(salesorderColumnsObj[2]) == true ? 'Yes' : 'No')
																			});	
			    						
												subList3.setSublistValue({
																			id:		'custpage_sl3_ship_date',
																			line:	int,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[3]),'')
																			});	
			    						
												subList3.setSublistValue({
																			id:		'custpage_sl3_name',
																			line:	int,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[4]),'')
																			});	
	
												subList3.setSublistValue({
																			id:		'custpage_sl3_area',
																			line:	int,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[5]),'')
																			});	

			
												subList3.setSublistValue({
																			id:		'custpage_sl3_created',
																			line:	int,
																			value:	isNullorBlank(salesorderSearchObj[int].getText(salesorderColumnsObj[6]),'')
																			});	

												subList3.setSublistValue({
																			id:		'custpage_sl3_required',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]),'0'), type: format.Type.FLOAT})
																			});	
												
												subList3.setSublistValue({
																			id:		'custpage_sl3_committed',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]),'0'), type: format.Type.FLOAT})
																			});	

												subList3.setSublistValue({
																			id:		'custpage_sl3_back_order',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]),'0'), type: format.Type.FLOAT})
																			});	
							    					
													
	
												subList3.setSublistValue({
																			id:		'custpage_sl3_picked',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]),'0'), type: format.Type.FLOAT})
																			});	
	
												subList3.setSublistValue({
																			id:		'custpage_sl3_packed',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]),'0'), type: format.Type.FLOAT})
																			});	

												subList3.setSublistValue({
																			id:		'custpage_sl3_shipped',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[12]),'0'), type: format.Type.FLOAT})
																			});	


												subList3.setSublistValue({
																			id:		'custpage_sl3_ship_sales',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[13]),'0'), type: format.Type.FLOAT})
																			});	
			    				
												subList3.setSublistValue({
																			id:		'custpage_sl3_no_ship_sales',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[14]),'0'), type: format.Type.FLOAT})
																			});	
												
												subList3.setSublistValue({
																			id:		'custpage_sl3_margin',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[15]).replace('%','')).toFixed(2),'0'), type: format.Type.PERCENT})
																			});	
												
												subList3.setSublistValue({
																			id:		'custpage_sl3_po_lines',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[17]),'0'), type: format.Type.FLOAT})
																			});	
		
												subList3.setSublistValue({
																			id:		'custpage_sl3_approved',
																			line:	int,
																			value:	salesorderSearchObj[int].getValue(salesorderColumnsObj[18]) 
																			});	
												
												subList3.setSublistValue({
																			id:		'custpage_sl3_cust_po',
																			line:	int,
																			value:	isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[19]),'')
																			});	
												
												subList3.setSublistValue({
																			id:		'custpage_sl3_to_be_done',
																			line:	int,
																			value:	format.parse({value: isNullorBlank(salesorderSearchObj[int].getValue(salesorderColumnsObj[20]),'0'), type: format.Type.FLOAT})
																			});	
												
												totalRequired			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[7]));
												totalCommitted			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[8]));
												totalBackOrder			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[9]));
												totalPicked				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[10]));
												totalPacked				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[11]));
												totalShiped				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[12]));
												totalShip				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[13]));
												totalNonShip			+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[14]));
												totalMargin				+= Number(salesorderSearchObj[int].getValue(salesorderColumnsObj[15]).replace('%',''));
												totalLines++;
												
						    				}
									}	
								
								fieldTotalRequired.defaultValue 	= totalRequired.toFixed(2);
								fieldTotalCommitted.defaultValue 	= totalCommitted.toFixed(2);
								fieldTotalBackOrder.defaultValue 	= totalBackOrder.toFixed(2);
								fieldTotalPicked.defaultValue 		= totalPicked.toFixed(2);
								fieldTotalPacked.defaultValue 		= totalPacked.toFixed(2);
								fieldTotalShiped.defaultValue 		= totalShiped.toFixed(2);
								fieldTotalShip.defaultValue 		= totalShip.toFixed(2);
								fieldTotalNonShip.defaultValue 		= totalNonShip.toFixed(2);
					//			fieldTotalMargin.defaultValue 		= (totalMargin/totalLines).toFixed(2);
								
		            //Return the form to the user
		            //
		            context.response.writePage(form);
		        } 
		    else 
		    	{
		    		var request 		= context.request;
	    				
			    	var paramLocation 	= request.parameters['custpage_field_location'];
			    	var paramCustomer 	= request.parameters['custpage_field_customer'];
			    	var paramArea	  	= request.parameters['custpage_field_area'];
			    	var paramCreatedBy 	= request.parameters['custpage_field_createdby'];
					
					//Call the suitelet again
					//
					context.response.sendRedirect({
												type: 			http.RedirectType.SUITELET, 
												identifier: 	runtime.getCurrentScript().id, 
												id: 			runtime.getCurrentScript().deploymentId,
												parameters:		{
																	location: 	paramLocation,						
																	customer:	paramCustomer,
																	area:		paramArea,
																	createdby:	paramCreatedBy
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

