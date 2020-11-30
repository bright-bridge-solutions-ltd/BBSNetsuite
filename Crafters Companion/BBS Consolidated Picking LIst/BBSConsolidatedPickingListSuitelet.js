/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/task', 'N/ui/serverWidget', 'N/ui/dialog', 'N/ui/message','N/format', 'N/http','N/record', './BBSConsolidatedPickingListLibrary', 'N/render', 'N/xml'],
/**
 * @param {runtime} runtime
 * @param {search} search
 * @param {task} task
 * @param {ui} ui
 * @param {dialog} dialog
 * @param {message} message
 */
function(runtime, search, task, serverWidget, dialog, message, format, http, record, BBSConsolidatedPickingListLibrary, render, xml) 
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
		    		String.prototype.repeat = function(count) 
		    			{
		    		    	if (count < 1) return '';
		    		    	
		    		    	var result = '', pattern = this.valueOf();
		    		    	
		    		    	while (count > 1) 
		    		    	{
		    		    		if (count & 1) result += pattern;
		    		    		
		    		    		count >>>= 1, pattern += pattern;
		    		    	}
		    		    	
		    		    	return result + pattern;
		    			};
	    		  
		    		//=============================================================================================
			    	//Main Code
			    	//=============================================================================================
			    	//
		    			
		    		//Get parameters
					//
	    			var paramStage 				= Number(context.request.parameters['stage']);		//The stage the suitelet is in
	    			var paramSelectTier			= context.request.parameters['tier'];				//The selected tier
	    			var paramSelectTierText		= context.request.parameters['tiertext'];			//The selected tier as text
	    			var paramSession			= context.request.parameters['session'];			//The session id
	    			var paramMaxRecords			= context.request.parameters['maxrecs'];			//The max number of records to return
	    			var paramSelectShip			= context.request.parameters['ship'];				//The shipping method
	    			var paramSelectShipText		= context.request.parameters['shiptext'];			//The shipping method as text
	    			
					var stage 					= (paramStage == null || paramStage == '' || isNaN(paramStage) ? 1 : paramStage);
					
					if(paramSession == null || paramSession == '')
						{
							paramSession = BBSConsolidatedPickingListLibrary.libCreateSession();
						}
					
					//Create a form
	    			//
		            var form = serverWidget.createForm({title: 	'Consolidated Picking List'});
		            
		            //Find the client script
	    			//
	    			var fileSearchObj = getResults(search.create({
		    			   type: 	"file",
		    			   filters:
		    			   [
		    			      ["name","is","BBSConsolidatedPickingListClient.js"]
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
		    		
		            //Store the current stage in a field in the form so that it can be retrieved in the POST section of the code
					//
					var stageParamField = form.addField({
											                id: 	'custpage_param_stage',
											                type: 	serverWidget.FieldType.INTEGER,
											                label: 	'Stage'
										            	});

					stageParamField.updateDisplayType({	displayType: serverWidget.FieldDisplayType.HIDDEN});
					stageParamField.defaultValue = stage;
					
					//Store the current session in a field in the form so that it can be retrieved in the POST section of the code
					//
					var sessionParamField = form.addField({
											                id: 	'custpage_param_session',
											                type: 	serverWidget.FieldType.TEXT,
											                label: 	'Session'
										            	});

					sessionParamField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
					sessionParamField.defaultValue = paramSession;
					
					
					//Work out what the form layout should look like based on the stage number
					//
					switch(stage)
						{
							case 1:	
								
								
								//Add a field group for the filters
								//
								var filtersGroup = form.addFieldGroup({
																		id:		'custpage_filters_group',
																		label:	'Filters'
																		});
								
								//Add a field for the customer tier
								//
								var selectTierField = form.addField({
													                id: 		'custpage_entry_select_tier',
													                type: 		serverWidget.FieldType.SELECT,
													                label: 		'Customer Tier',
													                source:		'customlist_group_id',
													                container:	'custpage_filters_group'
												            		});
								
								//Add a field for the shipping method
								//
								var selectShipField = form.addField({
													                id: 		'custpage_entry_select_ship',
													                type: 		serverWidget.FieldType.SELECT,
													                label: 		'Shipping Method',
													                //source:		'shipitem',
													                container:	'custpage_filters_group'
												            		});
								
								var shipitemSearchObj = getResults(search.create({
																				   type: 	"shipitem",
																				   filters:	[
																							      ["isinactive","is","F"]
																							],
																				   columns:	
																							   [
																							      search.createColumn({name: "itemid", sort: search.Sort.ASC, label: "Name"}),
																							      search.createColumn({name: "internalid", label: "Internal Id"})
																							   ]
																				}));
								
								selectShipField.addSelectOption({
																value:			'',
																text:			'',
																isSelected:		false
																});	


								for (var int = 0; int < shipitemSearchObj.length; int++) 
									{
										selectShipField.addSelectOption({
																			value:			shipitemSearchObj[int].getValue({name: 'internalid'}),
																			text:			shipitemSearchObj[int].getValue({name: 'itemid'}),
																			isSelected:		false
																			});	
									}
								
								
								//Add a field for the max record count
								//
								var selectMaxRecs = form.addField({
													                id: 		'custpage_entry_select_max_rec',
													                type: 		serverWidget.FieldType.INTEGER,
													                label: 		'Maximum Records To Return',
													                container:	'custpage_filters_group'
												            		});
								selectMaxRecs.defaultValue 	= 50;
								
								
								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Select Sales Orders'
										            });
					            
								break;
								
							case 2:
								
								//Add a field group for the filters
								//
								var filtersGroup = form.addFieldGroup({
																		id:		'custpage_filters_group',
																		label:	'Filters'
																		});
								
								//Add hidden fields to hold the passed in parameters
								//
								var selectTierField = form.addField({
													                id: 		'custpage_entry_select_tier',
													                type: 		serverWidget.FieldType.TEXT,
													                label: 		'Customer Tier',
													                container:	'custpage_filters_group'
												            		});
								selectTierField.defaultValue 	= paramSelectTier;
								selectTierField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
								
								
								//Add a field to display the customer tier
								//
								var selectTierTxtField = form.addField({
														                id: 		'custpage_entry_select_tier_txt',
														                type: 		serverWidget.FieldType.TEXT,
														                label: 		'Customer Tier',
														                container:	'custpage_filters_group'
													            		});
								selectTierTxtField.defaultValue 	= paramSelectTierText;
								selectTierTxtField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								
								//Add a field to display the shipping method
								//
								var selectShipField = form.addField({
													                id: 		'custpage_entry_select_ship',
													                type: 		serverWidget.FieldType.TEXT,
													                label: 		'Shipping Method',
													                container:	'custpage_filters_group'
												            		});
								selectShipField.defaultValue 	= paramSelectShip;
								selectShipField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});


								var selectShipTxtField = form.addField({
														                id: 		'custpage_entry_select_ship_txt',
														                type: 		serverWidget.FieldType.TEXT,
														                label: 		'Shipping Method',
														                container:	'custpage_filters_group'
													            		});
								selectShipTxtField.defaultValue 	= paramSelectShipText;
								selectShipTxtField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

								
								//Add a field to display the max records
								//
								var selectMaxRecordsField = form.addField({
														                id: 		'custpage_entry_select_max_rec',
														                type: 		serverWidget.FieldType.INTEGER,
														                label: 		'Maximum Records To Return',
														                container:	'custpage_filters_group'
													            		});
								selectMaxRecordsField.defaultValue 	= paramMaxRecords;
								selectMaxRecordsField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								
								
								//Add a subtab
								//
								var tab = form.addTab({
														id:		'custpage_tab_orders',
														label:	'Select Sales Orders'
													});
								
								var customerFilterField = form.addField({
														                id: 		'custpage_entry_select_customer',
														                type: 		serverWidget.FieldType.SELECT,
														                label: 		'Customer',
														                container:	'custpage_tab_orders'
													            		});
								
								//Add a sublist
								//
								var subList = form.addSublist({
																id:		'custpage_sublist_orders', 
																type:	serverWidget.SublistType.LIST, 
																label:	'Select Sales Orders',
																tab:	'custpage_tab_orders'
															});
								
								//Add columns to sublist
								//
								subList.addField({
													id:		'custpage_sl_ticked',
													label:	'Select',
													type:	serverWidget.FieldType.CHECKBOX
												});		

								subList.addField({
													id:		'custpage_sl_order_id',
													label:	'Id',
													type:	serverWidget.FieldType.TEXT
												});		
								
								subList.addField({
													id:		'custpage_sl_order_no',
													label:	'Order Number',
													type:	serverWidget.FieldType.TEXT
												});		
				
								subList.addField({
													id:		'custpage_sl_order_date',
													label:	'Order Date',
													type:	serverWidget.FieldType.DATE
												});		

								subList.addField({
													id:		'custpage_sl_customer',
													label:	'Customer',
													source:	record.Type.CUSTOMER,
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_tier',
													label:	'Customer Tier',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_location',
													label:	'Location',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_ship',
													label:	'Shipping Method',
													type:	serverWidget.FieldType.TEXT
												});		

								//Add a mark all button
					            //
								subList.addMarkAllButtons();
								
								//Add a refresh button
								//
								subList.addRefreshButton();
								
								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Create Picking List'
										            });
					            
					            //Find data for the sublist
					            //
					            filters = [
						            	      ["type","anyof","SalesOrd"], 
						            	      "AND", 
						            	      ["mainline","is","T"], 
						            	      "AND", 
						            	      ["status","anyof","SalesOrd:B"], 
						            	      "AND", 
						            	      ["custbody_bbs_consol_pick_list","anyof","@NONE@"]
						            	   ];
					            
					            if(paramSelectTier != null && paramSelectTier != '')
					            	{
					            		filters.push("AND");
					            		filters.push(["custbodycustbody_customer_group","anyof",paramSelectTier]);
					            	}
					            
					            if(paramSelectShip != null && paramSelectShip != '')
					            	{
					            		filters.push("AND");
					            		filters.push(["shipmethod","anyof",paramSelectShip]);
					            	}
				            
					            var sessionData 	= BBSConsolidatedPickingListLibrary.libGetSessionData(paramSession);
								
								if(sessionData != null && sessionData != '')
									{
										var extraFilters = JSON.parse(sessionData);
										
										if(extraFilters.hasOwnProperty('customer'))
											{
												var filterValue = extraFilters['customer'];
												
												if(filterValue != null && filterValue != '')
													{
														filters.push("AND");
									            		filters.push(["name","anyof",filterValue]);
													}
											}
									}
								
					            var salesorderSearchObj = getResults(search.create({
																            	   type: 		"salesorder",
																            	   filters:		filters,
																            	   columns:
																			            	   [
																			            	      search.createColumn({name: "internalid", label: "Internal Id"}),
																			            	      search.createColumn({name: "tranid", label: "Document Number"}),
																			            	      search.createColumn({name: "trandate", sort: search.Sort.ASC, label: "Date"}),
																			            	      search.createColumn({name: "entity", label: "Name"}),
																			            	      search.createColumn({name: "custbodycustbody_customer_group", label: "Customer Tier"}),
																			            	      search.createColumn({name: "amount", label: "Amount"}),
																			            	      search.createColumn({name: "shipmethod", label: "Shipping Method"}),
																			            	      search.createColumn({name: "locationnohierarchy", label: "Location (no hierarchy)"})
																			            	   ]
																            	}));
					            	
					            if(salesorderSearchObj != null && salesorderSearchObj.length > 0)
					            	{
					            		var customers = {};
					            		
					            		var maxSearch = salesorderSearchObj.length;
					            		maxSearch = (paramMaxRecords != null && paramMaxRecords != '' && paramMaxRecords != '0'  && Number(paramMaxRecords) <= salesorderSearchObj.length ? paramMaxRecords : maxSearch);
					            			
					            		
					            		for (var int = 0; int < maxSearch; int++) 
						            		{
						            			subList.setSublistValue({
																		id:		'custpage_sl_order_id',
																		line:	int,
																		value:	salesorderSearchObj[int].getValue({name: 'internalid'})
																		});	
						            			
						            			subList.setSublistValue({
																		id:		'custpage_sl_order_no',
																		line:	int,
																		value:	salesorderSearchObj[int].getValue({name: 'tranid'})
																		});	
	            			
	            			
						            			subList.setSublistValue({
																		id:		'custpage_sl_order_date',
																		line:	int,
																		value:	salesorderSearchObj[int].getValue({name: 'trandate'})
																		});	
	            			
						            			subList.setSublistValue({
																		id:		'custpage_sl_customer',
																		line:	int,
																		value:	salesorderSearchObj[int].getText({name: 'entity'})
																		});	
		
						            			subList.setSublistValue({
																		id:		'custpage_sl_tier',
																		line:	int,
																	//	value:	isNullorBlank(salesorderSearchObj[int].getText({name: "custentity_ns_tiercust", join: "customer"}), ' ')
																		value:	isNullorBlank(salesorderSearchObj[int].getText({name: "custbodycustbody_customer_group"}), ' ')
																		});	

						            			subList.setSublistValue({
																		id:		'custpage_sl_location',
																		line:	int,
																		value:	isNullorBlank(salesorderSearchObj[int].getText({name: 'locationnohierarchy'}), ' ')
																		});	
						            			
						            			subList.setSublistValue({
																		id:		'custpage_sl_ship',
																		line:	int,
																		value:	isNullorBlank(salesorderSearchObj[int].getText({name: 'shipmethod'}), ' ')
																		});	

						            			customers[salesorderSearchObj[int].getText({name: 'entity'})] = salesorderSearchObj[int].getValue({name: 'entity'});
											}
					            		
					            		//Add the customers to the select filter
					            		//
					            		customerFilterField.addSelectOption({
																			value:			'',
																			text:			'',
																			isSelected:		false
																			});	

					            		const orderedCustomers = {};
					        			Object.keys(customers).sort().forEach(function(key) {
					        																	orderedCustomers[key] = customers[key];
					        																	});
					            		for ( var customer in orderedCustomers) 
						            		{
						            			customerFilterField.addSelectOption({
																					value:			orderedCustomers[customer],
																					text:			customer,
																					isSelected:		false
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

					//Get the stage of the processing we are at
					//
		    		var stage 		= Number(request.parameters['custpage_param_stage']);
		    		var session 	= request.parameters['custpage_param_session'];
					
					//Process based on stage
					//
					switch(stage)
						{
							case 1:
								
								//Get user entered parameters
								//
								var tier 					= request.parameters['custpage_entry_select_tier'];
								var tierText				= request.parameters['inpt_custpage_entry_select_tier'];
								var maxRecs					= request.parameters['custpage_entry_select_max_rec'];
								var ship 					= request.parameters['custpage_entry_select_ship'];
								var shipText				= request.parameters['inpt_custpage_entry_select_ship'];
								
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
																			tier:			tier,
																			tiertext:		tierText,
																			session:		session,
																			maxrecs:		maxRecs,
																			ship:			ship,
																			shiptext:		shipText
																		}
														});
								
								break;
								
							case 2:
								
								//Delete the session data
								//
								BBSConsolidatedPickingListLibrary.libClearSessionData(session);
								
								
								//Find all the sales orders that have been selected & put their id's into an array
								//
								var sublistLineCount = request.getLineCount({group: 'custpage_sublist_orders'});
								var salesOrdersArray = [];
								
								for (var int = 0; int < sublistLineCount; int++) 
						    		{
						    			var ticked = request.getSublistValue({
															    			    group: 	'custpage_sublist_orders',
															    			    name: 	'custpage_sl_ticked',
															    			    line: 	int
															    			});
						    			
						    			if(ticked== 'T')
						    				{
							    				var ticked = request.getSublistValue({
																	    			    group: 	'custpage_sublist_orders',
																	    			    name: 	'custpage_sl_ticked',
																	    			    line: 	int
																	    			});
						    					
							    				var soId = request.getSublistValue({
																    			    group: 	'custpage_sublist_orders',
																    			    name: 	'custpage_sl_order_id',
																    			    line: 	int
																    				});
			
							    				salesOrdersArray.push(soId);
						    				}
						    		}
								
								//Have we any orders to process
								//
								if(salesOrdersArray.length > 0)
									{
										var consolPickingRecord 	= null;
										var consolPickingRecordId 	= null;
										
										//Create a new consolidated picking note record to assign to the sales orders
										//
										try
											{
												consolPickingRecord = record.create({
																					type:		'customrecord_bbs_consolidated_picking',
																					isDynamic:	true
																					});
												
												
											}
										catch(err)
											{
												consolPickingRecord 	= null;
												
												log.error({
															title:		'Error creating/saving new consolidated picking record',
															details:	err
														});
											}
										
										//Have we created a new consolidated picking note record
										//
										if(consolPickingRecord != null)
											{
												//Get all the relevant order lines from the selected sales orders
												//
												var salesorderSearchObj = getResults(search.create({
																								   type: 		"salesorder",
																								   filters:
																											   [
																											      ["type","anyof","SalesOrd"], 
																											      "AND", 
																											      ["mainline","is","F"], 
																											      "AND", 
																											      ["taxline","is","F"], 
																											      "AND", 
																											      ["cogs","is","F"], 
																											      "AND", 
																											      ["shipping","is","F"], 
																											      "AND", 
																											      ["quantitycommitted","greaterthan","0"], 
																											      "AND", 
																											      ["internalid","anyof",salesOrdersArray]
																											   ],
																								   columns:
																											   [
																											      search.createColumn({name: "item",summary: "GROUP",sort: search.Sort.ASC,label: "Item"}),
																											      search.createColumn({name: "salesdescription",join: "item",summary: "GROUP",label: "Description"}),
																											      search.createColumn({name: "quantity",summary: "SUM",label: "Quantity"}),
																											      search.createColumn({name: "quantitycommitted",summary: "SUM",label: "Quantity Committed"}),
																											      search.createColumn({name: "amount",summary: "SUM",label: "Amount"})
																											   ]
																								}));
												
												//Have we got any results
												//
												var resultsArray = [];
												
												if(salesorderSearchObj != null && salesorderSearchObj.length > 0)
													{
														for (var int2 = 0; int2 < salesorderSearchObj.length; int2++) 
												    		{
																var searchItemId 		= salesorderSearchObj[int2].getValue({name: "item",summary: "GROUP"});
																var searchItemName 		= salesorderSearchObj[int2].getText({name: "item",summary: "GROUP"});
																var searchItemDesc 		= salesorderSearchObj[int2].getValue({name: "salesdescription",join: "item",summary: "GROUP"});
																var searchItemCommitted	= Number(salesorderSearchObj[int2].getValue({name: "quantitycommitted",summary: "SUM"}));
																var searchItemQuantity	= Number(salesorderSearchObj[int2].getValue({name: "quantity",summary: "SUM"}));
																
																var itemInfoObj 		= new itemInfo(searchItemId, searchItemName, searchItemDesc, searchItemCommitted, searchItemQuantity);
																
																resultsArray.push(itemInfoObj);
												    		}
													}
										
												//Convert the item array into a JSON string
												//
												var jsonString 	= JSON.stringify(resultsArray);
												var today		= new Date();
												
												consolPickingRecord.setValue({
																			fieldId:	'custrecord_bbs_consolidated_picking_json',
																			value:		jsonString
																			});	
												
												
						
												//Save the consolidated invoicing record
												//
												consolPickingRecordId = consolPickingRecord.save({ignoreMandatoryFields: true});
												
												//Update the sales orders with the link to the consolidated picking note
												//
												for (var int2 = 0; int2 < salesOrdersArray.length; int2++) 
										    		{
														try
															{
																record.submitFields({
																					type:		record.Type.SALES_ORDER,
																					id:			salesOrdersArray[int2],
																					values:		{
																								custbody_bbs_consol_pick_list:	consolPickingRecordId
																								},
																					options:	{
																								ignoreMandatoryFields:	true
																								}
																});
															}
														catch(err)
															{
																log.error({
																			title:		'Error updating sales order with consolidated picking list id = ' + salesOrdersArray[int2],
																			details:	err
																		});
															}
														
														//Check governance limits
														//
														var remainingUsage = runtime.getCurrentScript().getRemainingUsage();
														
														if(remainingUsage < 20)
															{
																break;
															}
										    		}
												
												//
												//Now generate the output document
												//
												
												//Get the template id
												//
												var templateId = runtime.getCurrentScript().getParameter({name: 'custscript_bbs_consol_template'});
									    		
												//Create template renderer
												//
										    	var renderer = render.create();
										    	
										    	//Add record to renderer
										    	//
										    	renderer.addRecord('record', record.load({type: 'customrecord_bbs_consolidated_picking', id: consolPickingRecordId}));
										    	
										    	//Set the template
										    	//
										    	renderer.setTemplateById(templateId);
										    	
										    	//Return the pdf file to the client
										    	//
										    	context.response.writeFile({
										    								file:		renderer.renderAsPdf(),
										    								isInline:	true
										    								});
										    	
											}
									}
								
								break;
						}
		        }
	    }
    
    //Item info object
    //
    function itemInfo(_itemId, _itemName, _itemDesc, _committed, _quantity)
    	{
    		this.itemId		= _itemId;
    		this.itemName	= _itemName;
    		this.itemDesc	= _itemDesc;
    		this.committed	= _committed;
    		this.quantity	= _quantity;
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

