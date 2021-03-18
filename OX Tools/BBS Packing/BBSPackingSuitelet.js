/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/task', 'N/ui/serverWidget', 'N/ui/dialog', 'N/ui/message','N/format', 'N/http','N/record', './BBSPackingLibrary', 'N/render', 'N/xml'],
/**
 * @param {runtime} runtime
 * @param {search} search
 * @param {task} task
 * @param {ui} ui
 * @param {dialog} dialog
 * @param {message} message
 */
function(runtime, search, task, serverWidget, dialog, message, format, http, record, BBSPackingLibrary, render, xml) 
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
		    		var parameterFieldsDisplayMode = serverWidget.FieldDisplayType.HIDDEN;
			    			
		    		if(runtime.getCurrentScript().logLevel == 'DEBUG')
		    				{
		    					parameterFieldsDisplayMode = serverWidget.FieldDisplayType.NORMAL;
		    				}
			    		
		    		//Get parameters
					//
	    			var paramStage 				= Number(context.request.parameters['stage']);		//The stage the suitelet is in
	    			//var paramSession			= context.request.parameters['session'];			//The session id
	    			var paramSelectSoIf			= context.request.parameters['soif'];				//The sales order number or item fulfillment number
	    			var paramCartonId			= context.request.parameters['cartonid'];			//The carton id
	    			var paramCartonNumber		= context.request.parameters['cartonnumber'];		//The carton number
	    			var paramIfId				= context.request.parameters['ifid'];				//The IF id
	    			var paramWstnId				= context.request.parameters['wsid'];				//The workstation id
	    			
					var stage 					= (paramStage == null || paramStage == '' || isNaN(paramStage) ? 0 : paramStage);
					
					//if(paramSession == null || paramSession == '')
					//	{
					//		paramSession = BBSPackingLibrary.libCreateSession();
					//	}
					
					//Create a form
	    			//
		            var form = serverWidget.createForm({title: 	'Packing'});
		            
		            //Find the client script
	    			//
	    			var fileSearchObj = getResults(search.create({
												    			   type: 	"file",
												    			   filters:
															    			   [
															    			      ["name","is","BBSPackingClient.js"]
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
		    		
	    			//Add a field group for the hidden fields
					//
					var filtersGroup = form.addFieldGroup({
															id:		'custpage_hidden_group',
															label:	'Hidden'
															});
					
		            //Store the current stage in a field in the form so that it can be retrieved in the POST section of the code
					//
					var stageParamField = form.addField({
											                id: 	'custpage_param_stage',
											                type: 	serverWidget.FieldType.INTEGER,
											                label: 	'Stage',
											                container:	'custpage_hidden_group'
										            	});

					stageParamField.updateDisplayType({	displayType: parameterFieldsDisplayMode});
					stageParamField.defaultValue = stage;
					
					//Store the current session in a field in the form so that it can be retrieved in the POST section of the code
					//
					//var sessionParamField = form.addField({
					//						                id: 	'custpage_param_session',
					//						                type: 	serverWidget.FieldType.TEXT,
					//						                label: 	'Session',
					//						                container:	'custpage_hidden_group'
					//					            	});

					//sessionParamField.updateDisplayType({displayType: parameterFieldsDisplayMode});
					//sessionParamField.defaultValue = paramSession;
					
					//Store the workstation in a field in the form so that it can be retrieved in the POST section of the code
					//
					var wstnParamField = form.addField({
											                id: 	'custpage_param_wstn',
											                type: 	serverWidget.FieldType.TEXT,
											                label: 	'Workstation Id',
											                container:	'custpage_hidden_group'
										            	});

					wstnParamField.updateDisplayType({displayType: parameterFieldsDisplayMode});
					wstnParamField.defaultValue = paramWstnId;
					
					
					
					//Work out what the form layout should look like based on the stage number
					//
					switch(stage)
						{
							case 0:	
								
								
								//Add a field group for the selection
								//
								var filtersGroup = form.addFieldGroup({
																		id:		'custpage_selection_group',
																		label:	'Workstation'
																		});
								
								//Add a field for the workstation
								//
								var selectTierField = form.addField({
													                id: 		'custpage_entry_wkstn',
													                type: 		serverWidget.FieldType.SELECT,
													                label: 		'SelectWorkstation',
													                source:		'customrecord_bbs_printnode_workstation',
													                container:	'custpage_selection_group'
												            		}).isMandatory = true;
								
								
								
								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Continue'
										            });
					            
								break;
								
							case 1:	
								
								
								//Add a field group for the selection
								//
								var filtersGroup = form.addFieldGroup({
																		id:		'custpage_selection_group',
																		label:	'Selection'
																		});
								
								//Add a field for the so / if number
								//
								var selectSoIfField = form.addField({
													                id: 		'custpage_entry_so_if',
													                type: 		serverWidget.FieldType.TEXT,
													                label: 		'Sales Order/Fulfillment',
													                container:	'custpage_selection_group'
												            		});
								
								var selectSoIfField = form.addField({
													                id: 		'custpage_entry_dummy',
													                type: 		serverWidget.FieldType.RADIO,
													                label: 		' ',
													                source:		'dummy',
													                container:	'custpage_selection_group'
												            		});

								
								
								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Continue'
										            });
					            
								break;
								
							case 2:
								
								
								//Add hidden fields to hold the passed in parameters
								//
								var selectSoIfField = form.addField({
													                id: 		'custpage_entry_so_if',
													                type: 		serverWidget.FieldType.TEXT,
													                label: 		'Sales Order/Item Fulfillment',
													                container:	'custpage_hidden_group'
												            		});
								selectSoIfField.defaultValue 	= paramSelectSoIf;
								selectSoIfField.updateDisplayType({displayType: parameterFieldsDisplayMode});
								
								var selectCartonIdField = form.addField({
													                id: 		'custpage_entry_carton_id',
													                type: 		serverWidget.FieldType.TEXT,
													                label: 		'Carton Id',
													                container:	'custpage_hidden_group'
												            		});
								selectCartonIdField.defaultValue 	= paramCartonId;
								selectCartonIdField.updateDisplayType({displayType: parameterFieldsDisplayMode});

								var selectIfField = form.addField({
														                id: 		'custpage_entry_if_id',
														                type: 		serverWidget.FieldType.TEXT,
														                label: 		'Item Fulfillment Id',
														                container:	'custpage_hidden_group'
													            		});
								selectIfField.defaultValue 	= paramIfId;
								selectIfField.updateDisplayType({displayType: parameterFieldsDisplayMode});

								
								//Add a field group for the filters
								//
								var filtersGroup = form.addFieldGroup({
																		id:		'custpage_processing_group',
																		label:	'Processing'
																		});
								
								//Add a field to display the customer info
								//
								var customerNameField = form.addField({
														                id: 		'custpage_entry_cust_name',
														                type: 		serverWidget.FieldType.TEXT,
														                label: 		'Customer Name',
														                container:	'custpage_processing_group'
													            		});
								customerNameField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								
								var customerIdField = form.addField({
														                id: 		'custpage_entry_cust_id',
														                type: 		serverWidget.FieldType.TEXT,
														                label: 		'Customer Id',
														                container:	'custpage_processing_group'
													            		});
								customerIdField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

								var itemFulfimentField = form.addField({
														                id: 		'custpage_entry_if_name',
														                type: 		serverWidget.FieldType.TEXT,
														                label: 		'Fulfilment Id',
														                container:	'custpage_processing_group'
													            		});
								itemFulfimentField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								
								
								//Add a subtab
								//
								var tab = form.addTab({
														id:		'custpage_tab_items',
														label:	'Item Lines'
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
																label:	'Item Lines',
																tab:	'custpage_tab_items'
															});
								
								//Add a field to display the carton number
								//
								var selectCartonNumberField = form.addField({
														                id: 		'custpage_entry_carton_number',
														                type: 		serverWidget.FieldType.TEXT,
														                label: 		'Carton Number',
														                container:	'custpage_tab_items'
													            		});
								selectCartonNumberField.defaultValue 	= paramCartonNumber;
								selectCartonNumberField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								
								//Add a field to the tab
								//
								var reverseField = form.addField({
														      id: 			'custpage_entry_reverse',
														      type: 		serverWidget.FieldType.CHECKBOX,
														      label: 		'Reverse',
														      container:	'custpage_tab_items'
													          }).updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});	//.updateLayoutType({layoutType: serverWidget.FieldLayoutType.OUTSIDEABOVE});
								
								var qtyOverrideField = form.addField({
															      id: 			'custpage_entry_qty_override',
															      type: 		serverWidget.FieldType.INTEGER,
															      label: 		'Quantity Scanned',
															      container:	'custpage_tab_items'
														          });
								
								var itemField = form.addField({
														      id: 			'custpage_entry_item',
														      type: 		serverWidget.FieldType.TEXT,
														      label: 		'Item Code',
														      container:	'custpage_tab_items'
													          });
								
		
								//Add line count fields to the subtab
								//
								var lineCountField = form.addField({
													                id: 		'custpage_entry_line_count',
													                type: 		serverWidget.FieldType.INTEGER,
													                label: 		'Total Items',
													                container:	'custpage_tab_items'
												            		});
								lineCountField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								lineCountField.updateBreakType({breakType: serverWidget.FieldBreakType.STARTCOL});

								var completedLinesField = form.addField({
													                id: 		'custpage_entry_lines_complete',
													                type: 		serverWidget.FieldType.INTEGER,
													                label: 		'Completed Items',
													                container:	'custpage_tab_items'
												            		});
								completedLinesField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});

								
		
								//Add columns to sublist
								//
								subList.addField({
													id:		'custpage_sl_line_no',
													label:	'Line #',
													type:	serverWidget.FieldType.INTEGER
												});		
								
								subList.addField({
													id:		'custpage_sl_item_text',
													label:	'Item Name',
													type:	serverWidget.FieldType.TEXT
												});		
				
								subList.addField({
													id:		'custpage_sl_item_description',
													label:	'Item Description',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_item_qty_req',
													label:	'Required Quantity',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_item_qty_pack',
													label:	'Packed Quantity',
													type:	serverWidget.FieldType.TEXT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});		

								var cartonlistField = subList.addField({
																		id:		'custpage_sl_item_carton',
																		label:	'Cartons',
																		type:	serverWidget.FieldType.TEXT
																	});		

								cartonlistField.updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});
								cartonlistField.updateDisplaySize({height: 10, width: 80});
								
								/*
								var cartonWeightField = subList.addField({
																		id:		'custpage_sl_item_weight',
																		label:	'Weight Per Carton',
																		type:	serverWidget.FieldType.TEXT
																		});		

								cartonWeightField.updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});
								cartonWeightField.updateDisplaySize({height: 10, width: 30});
								
								var cartonQuantityField = subList.addField({
																			id:		'custpage_sl_item_qty',
																			label:	'Quantity Per Carton',
																			type:	serverWidget.FieldType.TEXT
																			});
								
								cartonQuantityField.updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});
								cartonQuantityField.updateDisplaySize({height: 10, width: 20});
								*/
				
								//Field to show the combined carton quantity & weight
								//
								var cartonQuantityWeightField = subList.addField({
																			id:		'custpage_sl_item_qty_weight',
																			label:	'Quantity(Weight) Per Carton',
																			type:	serverWidget.FieldType.TEXT
																			});

								cartonQuantityWeightField.updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});
								cartonQuantityWeightField.updateDisplaySize({height: 10, width: 80});

								
								subList.addField({
													id:		'custpage_sl_remove',
													label:	'Remove Last Carton',
													type:	serverWidget.FieldType.CHECKBOX
												});		

								subList.addField({
													id:		'custpage_sl_item_carton_id',
													label:	'Carton Id',
													type:	serverWidget.FieldType.TEXT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});		

								subList.addField({
													id:		'custpage_sl_item_id',
													label:	'Item Id',
													type:	serverWidget.FieldType.TEXT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});		

								var cartonWeightField = subList.addField({
																		id:		'custpage_sl_item_weight',
																		label:	'Weight Per Carton',
																		type:	serverWidget.FieldType.TEXT
																		});		

								cartonWeightField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
								
								var cartonQuantityField = subList.addField({
																		id:		'custpage_sl_item_qty',
																		label:	'Quantity Per Carton',
																		type:	serverWidget.FieldType.TEXT
																		});

								cartonQuantityField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

								
								//Add a next carton button
								//
								subList.addButton({id: 'custbutton_new_carton', label: 'New Carton', functionName: 'newCarton()'});
								
								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Fully Packed'
										            });
					            
					            //Add an abandon button
					            //
					            form.addButton({
					            				id:				'custbutton_button_abandon',
										        label: 			'Abandon',
										        functionName:	"abandonButton('" + paramWstnId + "','" + runtime.getCurrentScript().id + "','" + runtime.getCurrentScript().deploymentId + "')"
						 				        });
					            
					            //Find data for the sublist
					            //
					            
					            //var sessionData 	= BBSPackingLibrary.libGetSessionData(paramSession);
								
					            //Load the IF record
					            //
					            var ifRecord 	= BBSPackingLibrary.loadItemFulfillment(paramIfId);
					            
					            if(ifRecord != null)
					            	{
					            		var ifStatus 	= ifRecord.getValue({fieldId: 'status'});
					            		
					            		if(ifStatus == 'Picked')
					            			{
									            var ifLines							= ifRecord.getLineCount({sublistId: 'item'});
									            lineCountField.defaultValue 		= ifLines;
									            completedLinesField.defaultValue 	= Number(0);
												itemFulfimentField.defaultValue 	= ifRecord.getValue({fieldId: 'tranid'});;
												
									            //Get the customer info
									            //
									            var customerId		= ifRecord.getValue({fieldId: 'entity'});
									            
									            var customerInfo 	= search.lookupFields({
										            										type:		search.Type.CUSTOMER,
										            										id:			customerId,
										            										columns:	['entityid','companyname']
									            											});
									            
									            customerNameField.defaultValue 	= customerInfo.companyname;
									            customerIdField.defaultValue 	= customerInfo.entityid;
									            
									            //Process the IF lines
									            //
									            for (var ifLine = 0; ifLine < ifLines; ifLine++) 
										            {
										            	var ifLineItemId		= ifRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: ifLine});
										            	var ifLineItem			= ifRecord.getSublistValue({sublistId: 'item', fieldId: 'itemname', line: ifLine});
										            	var ifLineItemQty		= Number(ifRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: ifLine}));
										            	var ifLineItemDesc		= ifRecord.getSublistValue({sublistId: 'item', fieldId: 'description', line: ifLine});
										            	var ifLineItemLine		= ifRecord.getSublistValue({sublistId: 'item', fieldId: 'line', line: ifLine});
										            	var ifLineItemWeight	= ifRecord.getSublistValue({sublistId: 'item', fieldId: 'itemweight', line: ifLine});
										            	
										            	subList.setSublistValue({
																					id:		'custpage_sl_line_no',
																					line:	ifLine,
																					value:	ifLineItemLine
																					});	
										            	subList.setSublistValue({
																					id:		'custpage_sl_item_id',
																					line:	ifLine,
																					value:	ifLineItemId
																					});	
										            	
										            	subList.setSublistValue({
																					id:		'custpage_sl_item_text',
																					line:	ifLine,
																					value:	BBSPackingLibrary.isNullorBlank(ifLineItem,' ')
																					});	
										            	
										            	subList.setSublistValue({
																					id:		'custpage_sl_item_description',
																					line:	ifLine,
																					value:	BBSPackingLibrary.isNullorBlank(ifLineItemDesc,' ')
																					});	
										            	
										            //	subList.setSublistValue({
													//								id:		'custpage_sl_item_weight',
													//								line:	ifLine,
													//								value:	format.parse({value: 0, type: format.Type.FLOAT})
													//								});	
										            	
										            	subList.setSublistValue({
																					id:		'custpage_sl_item_qty_req',
																					line:	ifLine,
																					value:	ifLineItemQty.toFixed(0)
																					});	
										            	
										            	subList.setSublistValue({
																					id:		'custpage_sl_item_qty_pack',
																					line:	ifLine,
																					value:	'0'
																					});	
				            	
													}
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
		    		//var session 	= request.parameters['custpage_param_session'];
					var workstn		= request.parameters['custpage_param_wstn'];
					
					//Process based on stage
					//
					switch(stage)
						{
							case 0:
								
								//Get the entered workstation
								//
								workstn		= request.parameters['custpage_entry_wkstn'];
								
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
																			stage: 			stage,						//Stage
																			//session:		session,					//Session id
																			wsid:			workstn						//Internal id of the workstation
																		}
														});
								
								break;
								
							case 1:
								
								//Get user entered parameters
								//
								var salesOrderItemFulfillment = request.parameters['custpage_entry_so_if'];
								
								//Find the IF record based on the SO or IF number
								//
								var itemFulfillmentId = BBSPackingLibrary.libFindIfRecord(salesOrderItemFulfillment);
								
								//Create a new Carton record
								//
								var cartonDetails = BBSPackingLibrary.libCreateNewCarton();
								
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
																			stage: 			stage,						//Stage
																			//session:		session,					//Session id
																			soif:			salesOrderItemFulfillment,	//Sales order or IF number
																			ifid:			itemFulfillmentId,			//Internal id of IF record to process
																			cartonid:		cartonDetails.cartonId,		//Internal id of the carton to use
																			cartonnumber:	cartonDetails.cartonNumber,	//Carton number
																			wsid:			workstn						//Internal id of the workstation
																		}
														});
								
								break;
								
							case 2:
								
								//Delete the session data
								//
								//BBSPackingLibrary.libClearSessionData(session);
								
								//Get the fulfillment id from the field 
								//
								var fulfillmentId = request.parameters['custpage_entry_if_id'];
								
								//Load the IF record
								//
								var ifRecord = BBSPackingLibrary.loadItemFulfillment(fulfillmentId);
					            
								//Did we get the IF record ok?
								//
								if(ifRecord != null)
									{
										var cartonSummary = {};
										
										//Loop through all of the lines in the sublist
										//
										var sublistLineCount = request.getLineCount({group: 'custpage_sublist_items'});
										
										for (var int = 0; int < sublistLineCount; int++) 
								    		{
								    			var itemLineNumber = request.getSublistValue({
																		    			    group: 	'custpage_sublist_items',
																		    			    name: 	'custpage_sl_line_no',
																		    			    line: 	int
																	    					});
								    			
								    			var itemLinePacked = Number(request.getSublistValue({
																		    			    group: 	'custpage_sublist_items',
																		    			    name: 	'custpage_sl_item_qty_pack',
																		    			    line: 	int
																	    					}));
		
								    			var itemLineWeight = request.getSublistValue({
																		    			    group: 	'custpage_sublist_items',
																		    			    name: 	'custpage_sl_item_weight',
																		    			    line: 	int
																	    					});
		
								    			var itemLineCarton = request.getSublistValue({
																		    			    group: 	'custpage_sublist_items',
																		    			    name: 	'custpage_sl_item_carton',
																		    			    line: 	int
																	    					});
		
								    			var itemLineCartonId = request.getSublistValue({
																		    			    group: 	'custpage_sublist_items',
																		    			    name: 	'custpage_sl_item_carton_id',
																		    			    line: 	int
																	    					});
		
								    			//Update the IF line
								    			//Find the relevant line & update the carton to it as well as the quantity
								    			//
								    			var ifLines		= ifRecord.getLineCount({sublistId: 'item'});
									            
									            for (var ifLine = 0; ifLine < ifLines; ifLine++) 
										            {
										            	var ifLineItemQty		= Number(ifRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: ifLine}));
										            	var ifLineItemLine		= ifRecord.getSublistValue({sublistId: 'item', fieldId: 'line', line: ifLine});
										            	
										            	//Have we found the correct line number
										            	//
										            	if(ifLineItemLine == itemLineNumber)
										            		{
										            			//Select the line
										            			//
										            			ifRecord.selectLine({sublistId: 'item', line: ifLine});
										            		
										            			//Set the carton(s) on the line
										            			//
										            			ifRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_packing_carton', value: itemLineCarton});
										            			
										            			//Is the quantity packed different - if so change the line
										            			//
										            			if(ifLineItemQty != itemLinePacked)
										            				{
										            					if(itemLinePacked != 0)
										            						{
												            					//Set the line quantity
												            					//
												            					ifRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: itemLinePacked});
												            					
												            					//Set the inventory status sub-record
												            					//
												            					var inventoryDetail = ifRecord.getCurrentSublistSubrecord({sublistId: 'item',fieldId: 'inventorydetail'});
																				
												            					if(inventoryDetail != null)
																					{
																						var inventoryAssignments = inventoryDetail.getLineCount({sublistId: 'inventoryassignment'});
																							    			
																						for (var inventoryAssignment = 0; inventoryAssignment < inventoryAssignments; inventoryAssignment++) 
																							{		
																								inventoryDetail.selectLine({sublistId: 'inventoryassignment', line: inventoryAssignment});
																								inventoryDetail.setCurrentSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity', value: itemLinePacked});	
																								inventoryDetail.commitLine({sublistId: 'inventoryassignment', ignoreRecalc: false});
																							}
																					}
												            					
												            					//Commit the line
														            			//
														            			ifRecord.commitLine({sublistId: 'item', ignoreRecalc: false});
														            			
										            						}
										            					else
										            						{
										            							//Zero quantity packed, so remove the line from the IF
										            							//
										            							ifRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'itemreceive', value: false});
										            						}
										            				}
										            			
										            			
										            			break;
										            		}
										            }

									            //Extract the carton ids from the sublist field
									            //
									            if(itemLineCartonId != null)
									            	{
											            var cartonIdArray 		= itemLineCartonId.split(',');
											            var cartonNameArray 	= itemLineCarton.split(',');
											            var cartonWeightArray 	= itemLineWeight.split(',');
											            
											            for (var cartonIndex = 0; cartonIndex < cartonIdArray.length; cartonIndex++) 
												            {
												            	//Accumulate the carton info
												    			//
												    			if(!(cartonIdArray[cartonIndex] in cartonSummary))
												    				{
												    					cartonSummary[cartonIdArray[cartonIndex]] = new cartonSummaryObj(cartonIdArray[cartonIndex], cartonNameArray[cartonIndex], Number(cartonWeightArray[cartonIndex]));
												    				}
												    			else
												    				{
												    					cartonSummary[cartonIdArray[cartonIndex]].cartonWeight += Number(cartonWeightArray[cartonIndex]);
												    				}
															}
									            	}
								    		}
								
										//Mark as packed
										//
										ifRecord.setValue({fieldId: 'shipstatus', value: 'B'});		//Mark as packed
										
										//Update the printnode workstation id on the IF for use in the carrier integration
										//
										ifRecord.setValue({fieldId: 'custbody_bbs_printnode_workstation', value: workstn});
											
										//Remove the default package lines
										//
										var ifPackages = ifRecord.getLineCount({sublistId: 'package'});
							            
										for(var packLine = ifPackages - 1; packLine >= 0; packLine--)
											{
												ifRecord.removeLine({sublistId: 'package', line: 0});
											}
										
										//Add the cartons to the IF
										//
										for ( var cartonId in cartonSummary) 
											{
												ifRecord.selectNewLine({sublistId: 'package'});
												ifRecord.setCurrentSublistValue({sublistId: 'package', fieldId: 'packagedescr', value: cartonSummary[cartonId].cartonName});
												
												var packageWeight 	= Number(cartonSummary[cartonId].cartonWeight);
												packageWeight		= (packageWeight <= 0 ? 0.1 : packageWeight);
													
												ifRecord.setCurrentSublistValue({sublistId: 'package', fieldId: 'packageweight', value: packageWeight});
												ifRecord.commitLine({sublistId: 'package', ignoreRecalc: false});
											}
										
										//Save the IF record
										//
										try
											{
												ifRecord.save({enableSourcing: true, ignoreMandatoryFields: true});
											}
										catch(err)
											{
												
											}
										
										//Update the cartons
										//
										for ( var cartonId in cartonSummary) 
											{
												try
													{
														record.submitFields({
																			type:		'customrecord_bbs_carton',
																			id:			cartonId,
																			values:		{
																						custrecord_bbs_carton_weight: 			cartonSummary[cartonId].cartonWeight,
																						custrecord_bbs_carton_item_fulfillment:	fulfillmentId
																						},
																			options:	{
																						ignoreMandatoryFields:	true
																						}
																			});
													}
												catch(err)
													{
													
													}
											}
									}

								
								//Call the suitelet again
								//
								context.response.sendRedirect({
														type: 			http.RedirectType.SUITELET, 
														identifier: 	runtime.getCurrentScript().id, 
														id: 			runtime.getCurrentScript().deploymentId, 
														parameters:		{
																			stage: 			1,
																			wsid:			workstn						//Internal id of the workstation
																		}
														});
								
								
								break;
						}
		        }
	    }
    
    
    function cartonSummaryObj(_cartonId, _cartonName, _cartonWeight)
    	{
    		this.cartonId 		= _cartonId;
    		this.cartonName 	= _cartonName;
    		this.cartonWeight	= _cartonWeight;
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

