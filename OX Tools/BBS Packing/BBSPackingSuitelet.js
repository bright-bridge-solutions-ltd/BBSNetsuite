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
	    			var paramSession			= context.request.parameters['session'];			//The session id
	    			var paramSelectSoIf			= context.request.parameters['soif'];				//The sales order number or item fulfillment number
	    			var paramCartonId			= context.request.parameters['cartonid'];			//The carton id
	    			var paramCartonNumber		= context.request.parameters['cartonnumber'];		//The carton number
	    			var paramIfId				= context.request.parameters['ifid'];				//The IF id
	    			
					var stage 					= (paramStage == null || paramStage == '' || isNaN(paramStage) ? 1 : paramStage);
					
					if(paramSession == null || paramSession == '')
						{
							paramSession = BBSPackingLibrary.libCreateSession();
						}
					
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
					var sessionParamField = form.addField({
											                id: 	'custpage_param_session',
											                type: 	serverWidget.FieldType.TEXT,
											                label: 	'Session',
											                container:	'custpage_hidden_group'
										            	});

					sessionParamField.updateDisplayType({displayType: parameterFieldsDisplayMode});
					sessionParamField.defaultValue = paramSession;
					
					
					//Work out what the form layout should look like based on the stage number
					//
					switch(stage)
						{
							case 1:	
								
								
								//Add a field group for the selection
								//
								var filtersGroup = form.addFieldGroup({
																		id:		'custpage_selection_group',
																		label:	'Selection'
																		});
								
								//Add a field for the customer tier
								//
								var selectTierField = form.addField({
													                id: 		'custpage_entry_so_if',
													                type: 		serverWidget.FieldType.TEXT,
													                label: 		'Sales Order/Fulfillment',
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
								
								//Add a field to display the carton number
								//
								var selectCartonNumberField = form.addField({
														                id: 		'custpage_entry_carton_number',
														                type: 		serverWidget.FieldType.TEXT,
														                label: 		'Carton Number',
														                container:	'custpage_processing_group'
													            		});
								selectCartonNumberField.defaultValue 	= paramCartonNumber;
								selectCartonNumberField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								
								
								
								//Add a subtab
								//
								var tab = form.addTab({
														id:		'custpage_tab_items',
														label:	'Item Lines'
													});

								//Add a sublist
								//
								var subList = form.addSublist({
																id:		'custpage_sublist_items', 
																type:	serverWidget.SublistType.LIST, 
																label:	'Item Lines',
																tab:	'custpage_tab_items'
															});
								
								//Add a field to the tab
								//
								var itemField = form.addField({
														      id: 			'custpage_entry_item',
														      type: 		serverWidget.FieldType.TEXT,
														      label: 		'Item Code',
														      container:	'custpage_tab_items'
													          });
								
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
													type:	serverWidget.FieldType.FLOAT
												});		

								subList.addField({
													id:		'custpage_sl_item_qty_pack',
													label:	'Packed Quantity',
													type:	serverWidget.FieldType.FLOAT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});		

								subList.addField({
													id:		'custpage_sl_item_carton',
													label:	'Carton',
													type:	serverWidget.FieldType.TEXT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});		

								subList.addField({
													id:		'custpage_sl_remove',
													label:	'Remove From Carton',
													type:	serverWidget.FieldType.CHECKBOX
												});		

								subList.addField({
													id:		'custpage_sl_item_weight',
													label:	'Weight',
													type:	serverWidget.FieldType.FLOAT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});		

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

								//Add a mark all button
					            //
								//subList.addMarkAllButtons();
								
								//Add a refresh button
								//
								//subList.addRefreshButton();
								
								//Add a next carton button
								//
								subList.addButton({id: 'custbutton_new_carton', label: 'New Carton', functionName: 'newCarton()'});
								
								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Fully Packed'
										            });
					            
					            //Find data for the sublist
					            //
					            
					            var sessionData 	= BBSPackingLibrary.libGetSessionData(paramSession);
								
					            //Load the IF record
					            //
					            var ifRecord 	= BBSPackingLibrary.loadItemFulfillment(paramIfId);
					            
					            if(ifRecord != null)
					            	{
							            var ifLines		= ifRecord.getLineCount({sublistId: 'item'});
							            
							            for (var ifLine = 0; ifLine < ifLines; ifLine++) 
								            {
								            	var ifLineItemId		= ifRecord.getSublistValue({sublistId: 'item', fieldId: 'item', line: ifLine});
								            	var ifLineItem			= ifRecord.getSublistValue({sublistId: 'item', fieldId: 'itemname', line: ifLine});
								            	var ifLineItemQty		= ifRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: ifLine});
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
								            	
								            	subList.setSublistValue({
																			id:		'custpage_sl_item_weight',
																			line:	ifLine,
																			value:	format.parse({value: BBSPackingLibrary.isNullorBlank(ifLineItemWeight, Number(0)), type: format.Type.INTEGER})
																			});	
								            	
								            	subList.setSublistValue({
																			id:		'custpage_sl_item_qty_req',
																			line:	ifLine,
																			value:	ifLineItemQty
																			});	
								            	
								            	subList.setSublistValue({
																			id:		'custpage_sl_item_qty_pack',
																			line:	ifLine,
																			value:	format.parse({value: 0, type: format.Type.FLOAT})
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
																			session:		session,					//Session id
																			soif:			salesOrderItemFulfillment,	//Sales order or IF number
																			ifid:			itemFulfillmentId,			//Internal id of IF record to process
																			cartonid:		cartonDetails.cartonId,		//Internal id of the carton to use
																			cartonnumber:	cartonDetails.cartonNumber	//Carton number
																		}
														});
								
								break;
								
							case 2:
								
								//Delete the session data
								//
								BBSPackingLibrary.libClearSessionData(session);
								
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
								    			
								    			var itemLinePacked = request.getSublistValue({
																		    			    group: 	'custpage_sublist_items',
																		    			    name: 	'custpage_sl_item_qty_pack',
																		    			    line: 	int
																	    					});
		
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
										            	var ifLineItemQty		= ifRecord.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: ifLine});
										            	var ifLineItemLine		= ifRecord.getSublistValue({sublistId: 'item', fieldId: 'line', line: ifLine});
										            	
										            	//Have we found the correct line number
										            	//
										            	if(ifLineItemLine == itemLineNumber)
										            		{
										            			//Set the carton id on the line
										            			//
										            			ifRecord.setSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_packing_carton', line: ifLine, value: itemLineCartonId});
										            			
										            			//Is the quantity packed different - if so change the line
										            			//
										            			if(ifLineItemQty != itemLinePacked)
										            				{
										            					//Set the line quantity
										            					//
										            					ifRecord.setSublistValue({sublistId: 'item', fieldId: 'quantity', line: ifLine, value: itemLinePacked});
										            					
										            					//Set the inventory status sub-record
										            					//
										            					var inventoryDetail = ifRecord.getSublistSubrecord({sublistId: 'item',fieldId: 'inventorydetail',line: ifLine});
																		
										            					if(inventoryDetail != null)
																			{
																				var inventoryAssignments = inventoryDetail.getLineCount({sublistId: 'inventoryassignment'});
																					    			
																				for (var inventoryAssignment = 0; inventoryAssignment < inventoryAssignments; inventoryAssignment++) 
																					{		
																						inventoryDetail.setSublistValue({sublistId: 'inventoryassignment', fieldId: 'quantity', line: inventoryAssignment, value: itemLinePacked});						
																					}
																			}
										            					
										            				
											            			
										            				}
										            			
										            			break;
										            		}
										            }

								    			//Accumulate the carton info
								    			//
								    			if(!(itemLineCartonId in cartonSummary))
								    				{
								    					cartonSummary[itemLineCartonId] = new cartonSummaryObj(itemLineCartonId, itemLineCarton, Number(itemLineWeight));
								    				}
								    			else
								    				{
								    					cartonSummary[itemLineCartonId].cartonWeight += Number(itemLineWeight);
								    				}
								    		}
								
										//Add the cartons to the IF & mark as packed
										//
										var packagesLine = Number(0);
										
										ifRecord.setValue({fieldId: 'shipstatus', value: 'B'});		//Mark as packed
										
										for ( var cartonId in cartonSummary) 
											{
												ifRecord.setSublistValue({sublistId: 'package', fieldId: 'packagedescr', line: packagesLine, value: cartonSummary[cartonId].cartonName});
												ifRecord.setSublistValue({sublistId: 'package', fieldId: 'packageweight', line: packagesLine, value: cartonSummary[cartonId].cartonWeight});

												packagesLine++;
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
																			stage: 			1
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

