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
		    			
		    		//Get parameters
					//
	    			var paramStage 	= Number(context.request.parameters['stage']);										//The stage the suitelet is in
					var stage 		= (paramStage == null || paramStage == '' || isNaN(paramStage) ? 1 : paramStage);	//Default to stage 1
					var createdData	= context.request.parameters['createddata'];

	    			//Create a form
	    			//
		            var form = serverWidget.createForm({title: 	'NYMAS - Outsourced PO Workbench'});
		            
		            //Find the client script
	    			//
	    			var fileSearchObj = getResults(search.create({
												    			   type: 	"file",
												    			   filters:
															    			   [
															    			      ["name","is","BBSOutsourcePoClient.js"]
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
					
					//Work out what the form layout should look like based on the stage number
					//
					switch(stage)
						{
							case 1:	
								
								//Add a tab
								//
								var tab = form.addTab({
													id:		'custpage_tab_items',
													label:	'Items To Process'
													});
							
								//Add a sublist
								//
								var subList = form.addSublist({
																id:		'custpage_sublist_items', 
																type:	serverWidget.SublistType.LIST, 
																label:	'Items To Process',
																tab:	'custpage_tab_items'
																});
								
								form.addSublist({
												id:		'custpage_sublist_dummy', 
												type:	serverWidget.SublistType.LIST, 
												label:	'_',
												tab:	'custpage_tab_items'
												});
								
								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Create Purchase Orders'
										            });
					            
					            
								//Add columns to sublist
								//
								subList.addField({
													id:		'custpage_sl_items_tick',
													label:	'Select',
													type:	serverWidget.FieldType.CHECKBOX
												});													//Checkbox to select the line
					
								subList.addField({
													id:		'custpage_sl_items_item',
													label:	'Item',
													type:	serverWidget.FieldType.TEXT
												});													//Item Name
					
								var linkField = subList.addField({
													id:		'custpage_sl_items_item_link',
													label:	'View',
													type:	serverWidget.FieldType.URL
												});													//Item url link
					
								linkField.linkText = 'View';
								
								subList.addField({
													id:		'custpage_sl_items_item_id',
													label:	'Item',
													type:	serverWidget.FieldType.TEXT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});		//Item Id
	
								subList.addField({
													id:		'custpage_sl_items_description',
													label:	'Description',
													type:	serverWidget.FieldType.TEXT				//Item Description
												});		
					
								subList.addField({
													id:		'custpage_sl_items_location',
													label:	'Location',
													type:	serverWidget.FieldType.TEXT
												});													//Item Location
					
								subList.addField({
													id:		'custpage_sl_items_lead_time',
													label:	'PO Lead Time',
													type:	serverWidget.FieldType.TEXT
												});													//Manufacturing lead time
								
								subList.addField({
													id:		'custpage_sl_items_pref_supplier',
													label:	'Preferred Supplier',
													type:	serverWidget.FieldType.TEXT
												});													//Preferred supplier
				
								subList.addField({
													id:		'custpage_sl_items_backorder',
													label:	'Qty Back Ordered',
													type:	serverWidget.FieldType.FLOAT
												});													//Quantity back ordered
					
								subList.addField({
													id:		'custpage_sl_items_onorder',
													label:	'Qty On Order',
													type:	serverWidget.FieldType.FLOAT
												});													//Quantity on order
								
								subList.addField({
													id:		'custpage_sl_items_required',
													label:	'Qty Required',
													type:	serverWidget.FieldType.FLOAT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});		//Quantity required
						
								var supplierField = subList.addField({
												id:		'custpage_sl_items_supplier',
												label:	'Supplier',
												type:	serverWidget.FieldType.SELECT
												//source:	record.Type.VENDOR
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});		//Item Supplier
	
								//Populate supplier field with only out source suppliers
								//
								var outsourceSuppliers = getOutsourceSuppliers();
								
								supplierField.addSelectOption({
																value: 			'', 
																text: 			'', 
																isSelected: 	true
																});
								
								if(outsourceSuppliers != null && outsourceSuppliers.length > 0)
									{
										for (var outsup = 0; outsup < outsourceSuppliers.length; outsup++) 
											{
												var outsupId 		= outsourceSuppliers[outsup].getValue({name: "internalid"});
												var outsupName 		= outsourceSuppliers[outsup].getValue({name: "entityid"});
												var outsupAltName 	= outsourceSuppliers[outsup].getValue({name: "altname"});
											
												supplierField.addSelectOption({
																				value: 			outsupId, 
																				text: 			outsupName + ' ' + outsupAltName, 
																				isSelected: 	false
																				});
											}
									}
								
								subList.addField({
												id:		'custpage_sl_items_p_start',
												label:	'Production Start',
												type:	serverWidget.FieldType.DATE,
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});		//Production Start Date

								subList.addField({
												id:		'custpage_sl_items_p_end',
												label:	'Production End',
												type:	serverWidget.FieldType.DATE,
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});		//Production End Date

	

								//Add Mark All button
								//
								subList.addMarkAllButtons();
								
								//Find any items to process & populate the sublist
								//
								var assemblyitemSearchObj = getResults(search.create({
																					type: 		"assemblyitem",
																					filters:
																								[
																								      ["type","anyof","Assembly"], 
																								      "AND", 
																								      ["quantitybackordered","greaterthan","0"], 
																								      "AND", 
																								      ["inventorylocation.name","startswith","Nymas Warehouse"], 
																								      "AND", 
																								      ["formulanumeric: NVL({quantitybackordered},0) - NVL({quantityonorder}, 0)","greaterthan","0"], 
																								      "AND", 
																								      ["custitem_bbs_requires_outsource","is","T"]
																								],
																				   columns:
																					   			[
																								      search.createColumn({name: "itemid",sort: search.Sort.ASC,label: "Name"}),
																								      search.createColumn({name: "internalid",sort: search.Sort.ASC,label: "Internal Id"}),
																								      search.createColumn({name: "salesdescription", label: "Description"}),
																								      search.createColumn({name: "vendor", label: "Preferred Supplier"}),
																								      search.createColumn({name: "name",join: "inventoryLocation",label: "Name"}),
																								      search.createColumn({name: "quantitybackordered", label: "Back Ordered"}),
																								      search.createColumn({name: "quantityonorder", label: "On Order"}),
																								      search.createColumn({name: "formulanumeric",formula: "NVL({quantitybackordered},0) - NVL({quantityonorder}, 0)",label: "Needed"}),
																								      search.createColumn({name: "internalid",join: "preferredVendor",label: "Internal ID"}),
																								      search.createColumn({name: "leadtime", label: "Lead Time"})
																				      			]
																				}));
								
								if(assemblyitemSearchObj != null && assemblyitemSearchObj.length > 0)
									{
										for (var int = 0; int < assemblyitemSearchObj.length; int++) 
						    				{ 	
												var itemName 			= assemblyitemSearchObj[int].getValue({name: "itemid"});
												var itemId				= assemblyitemSearchObj[int].getValue({name: "internalid"});
												var itemDescription 	= assemblyitemSearchObj[int].getValue({name: "salesdescription"});
												var itemSupplier 		= assemblyitemSearchObj[int].getValue({name: "vendor"});
												var itemSupplierText	= assemblyitemSearchObj[int].getText({name: "vendor"});
												var itemLocation 		= assemblyitemSearchObj[int].getValue({name: "name",join: "inventoryLocation"});
												var itemQtyBackOrdered 	= isNullorBlank(assemblyitemSearchObj[int].getValue({name: "quantitybackordered"}),'0');
												var itemQtyOnOrder 		= isNullorBlank(assemblyitemSearchObj[int].getValue({name: "quantityonorder"}),'0');
												var itemQtyRequired		= isNullorBlank(assemblyitemSearchObj[int].getValue({name: "formulanumeric"}),'0');
												var itemLeadTime		= isNullorBlank(assemblyitemSearchObj[int].getValue({name: "leadtime"}),'0');
												
												var itemUrl				= url.resolveRecord({
																							isEditMode:		false,
																							recordId:		itemId,
																							recordType:		record.Type.ASSEMBLY_ITEM
																							});
													
						    					 if(itemId != '' && itemId != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_item_id',
																				line:	int,
																				value:	itemId
																				});	
						    						 }
						    					 
						    					 if(itemName != '' && itemName != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_item',
																				line:	int,
																				value:	itemName
																				});	
						    						 }
					    					 
						    					 if(itemUrl != '' && itemUrl != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_item_link',
																				line:	int,
																				value:	itemUrl
																				});	
						    						 }
						    					 
						    					 if(itemDescription != '' && itemDescription != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_description',
																				line:	int,
																				value:	itemDescription
																				});	
							    						 }
						    					 
						    					 if(itemSupplier != '' && itemSupplier != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_supplier',
																				line:	int,
																				value:	itemSupplier
																				});	
						    						 }
						    					 
						    					 if(itemSupplierText != '' && itemSupplierText != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_pref_supplier',
																				line:	int,
																				value:	itemSupplierText
																				});	
						    						 }
					    					 
						    					 if(itemLocation != '' && itemLocation != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_location',
																				line:	int,
																				value:	itemLocation
																				});	
						    						 }
						    					 
						    					 if(itemQtyBackOrdered != '' && itemQtyBackOrdered != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_backorder',
																				line:	int,
																				value:	format.parse({value: itemQtyBackOrdered, type: format.Type.FLOAT})
																				});	
						    						 }
						    					 
						    					 if(itemQtyOnOrder != '' && itemQtyOnOrder != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_onorder',
																				line:	int,
																				value:	format.parse({value: itemQtyOnOrder, type: format.Type.FLOAT})
																				});	
						    						 }
					    					 
						    					 if(itemQtyRequired != '' && itemQtyRequired != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_required',
																				line:	int,
																				value:	format.parse({value: itemQtyRequired, type: format.Type.FLOAT})
																				});	
						    						 }
						    					 
						    					 if(itemLeadTime != '' && itemLeadTime != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_lead_time',
																				line:	int,
																				value:	itemLeadTime
																				});	
						    						 }
						    				}
									}
					            
								break;
								
							case 2:
								
								//Add a tab
								//
								var tab = form.addTab({
														id:		'custpage_tab_items',
														label:	'Results'
														});
			
								//Add a sublist
								//
								var subList = form.addSublist({
																id:		'custpage_sublist_items', 
																type:	serverWidget.SublistType.LIST, 
																label:	'Created Records',
																tab:	'custpage_tab_items'
																});
								
								form.addSublist({
													id:		'custpage_sublist_dummy', 
													type:	serverWidget.SublistType.LIST, 
													label:	'_',
													tab:	'custpage_tab_items'
												});
													            		
								subList.addField({
													id:		'custpage_sl_items_po_name',
													label:	'PO Number',
													type:	serverWidget.FieldType.TEXT
												});													//PO Name
	
								subList.addField({
													id:		'custpage_sl_items_po_entity',
													label:	'PO Supplier',
													type:	serverWidget.FieldType.TEXT
												});													//PO Entity

								var poLinkField = subList.addField({
																	id:		'custpage_sl_items_po_link',
																	label:	'View',
																	type:	serverWidget.FieldType.URL
																});									//PO url link
					
								poLinkField.linkText = 'View';
								
								subList.addField({
													id:		'custpage_sl_items_to_name',
													label:	'TO Number',
													type:	serverWidget.FieldType.TEXT
												});													//TO Name

								subList.addField({
													id:		'custpage_sl_items_to_loc',
													label:	'TO Location',
													type:	serverWidget.FieldType.TEXT
												});													//TO location

								subList.addField({
													id:		'custpage_sl_items_to_trfloc',
													label:	'TO Transfer Location',
													type:	serverWidget.FieldType.TEXT
												});													//TO tranmsfer location

								var toLinkField = subList.addField({
																		id:		'custpage_sl_items_to_link',
																		label:	'View',
																		type:	serverWidget.FieldType.URL
																	});								//TO url link

								toLinkField.linkText = 'View';
								
								//Process the created data
								//
								createdDataArray = JSON.parse(createdData);
								
								if(createdDataArray != null && createdDataArray.length > 0)
									{
										for (var dataCounter = 0; dataCounter < createdDataArray.length; dataCounter++) 
											{
												var poRecordId			= createdDataArray[dataCounter].poRecordId;
												var poTranid 			= createdDataArray[dataCounter].poTranid;
												var poEntity 			= createdDataArray[dataCounter].poEntity;
												var poUrl				= createdDataArray[dataCounter].poUrl;
												var transferOrderId		= createdDataArray[dataCounter].transferOrderId;
												var toTranid			= createdDataArray[dataCounter].toTranid;
												var toLocation			= createdDataArray[dataCounter].toLocation;
												var toTransferLocation	= createdDataArray[dataCounter].toTransferLocation;
												var toUrl				= createdDataArray[dataCounter].toUrl;
												
												if(poTranid != null && poTranid != '')
													{
														subList.setSublistValue({
																					id:		'custpage_sl_items_po_name',
																					line:	dataCounter,
																					value:	poTranid
																					});	
													}
												
												if(poEntity != null && poEntity != '')
													{
														subList.setSublistValue({
																					id:		'custpage_sl_items_po_entity',
																					line:	dataCounter,
																					value:	poEntity
																					});	
													}
												
												if(poUrl != null && poUrl != '')
													{
														subList.setSublistValue({
																					id:		'custpage_sl_items_po_link',
																					line:	dataCounter,
																					value:	poUrl
																					});	
													}
												
												if(toTranid != null && toTranid != '')
													{
														subList.setSublistValue({
																					id:		'custpage_sl_items_to_name',
																					line:	dataCounter,
																					value:	toTranid
																					});	
													}
												
												if(toLocation != null && toLocation != '')
													{
														subList.setSublistValue({
																					id:		'custpage_sl_items_to_loc',
																					line:	dataCounter,
																					value:	toLocation
																					});	
													}
												
												if(toTransferLocation != null && toTransferLocation != '')
													{
														subList.setSublistValue({
																					id:		'custpage_sl_items_to_trfloc',
																					line:	dataCounter,
																					value:	toTransferLocation
																					});	
													}
											
												if(toUrl != null && toUrl != '')
													{
														subList.setSublistValue({
																					id:		'custpage_sl_items_to_link',
																					line:	dataCounter,
																					value:	toUrl
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
		    		var request 	= context.request;
		    		var createdData	= [];
		    		
					//Get the stage of the processing we are at
					//
					var stage = Number(request.parameters['custpage_param_stage']);
					
					//Process based on stage
					//
					switch(stage)
						{
							case 1:
								
								var outsourcedFormId 		= runtime.getCurrentScript().getParameter({name: 'custscript_bbs_outsourced_po_form_id'});
								var transferFromLocation 	= runtime.getCurrentScript().getParameter({name: 'custscript_bbs_outsourced_from_loc'});
								
								var suppliers = {};
								
								//Loop through all of the lines in the sublist
								//
								var sublistLineCount = request.getLineCount({group: 'custpage_sublist_items'});
								
								for (var int = 0; int < sublistLineCount; int++) 
						    		{
										var itemLineTicked = request.getSublistValue({
																    			    group: 	'custpage_sublist_items',
																    			    name: 	'custpage_sl_items_tick',
																    			    line: 	int
															    					});

										var itemLineItem = request.getSublistValue({
																		    	    group: 	'custpage_sublist_items',
																		    	    name: 	'custpage_sl_items_item_id',
																		    	    line: 	int
																	    			});
										
										var itemLineSupplier = request.getSublistValue({
																	    			    group: 	'custpage_sublist_items',
																	    			    name: 	'custpage_sl_items_supplier',
																	    			    line: 	int
																    					});
										
										var itemLineQuantity = Number(request.getSublistValue({
																			    			    group: 	'custpage_sublist_items',
																			    			    name: 	'custpage_sl_items_required',
																			    			    line: 	int
																		    					}));

										var itemLineStartDate = request.getSublistValue({
																					    group: 	'custpage_sublist_items',
																					    name: 	'custpage_sl_items_p_start',
																					    line: 	int
																						});

										var itemLineEndDate = request.getSublistValue({
																	    			    group: 	'custpage_sublist_items',
																	    			    name: 	'custpage_sl_items_p_end',
																	    			    line: 	int
																    					});
										
										var itemLineLeadTime = request.getSublistValue({
																	    			    group: 	'custpage_sublist_items',
																	    			    name: 	'custpage_sl_items_lead_time',
																	    			    line: 	int
																    					});
										

										//See if the line was ticked
										//
										if(itemLineTicked == 'T')
											{
												if(suppliers.hasOwnProperty(itemLineSupplier))
													{
														//If the suppliers object already has this supplier set up, then add the item to the array of items to process for that supplier
														//
														suppliers[itemLineSupplier].push(new itemObject(itemLineItem, itemLineQuantity, itemLineStartDate, itemLineEndDate, itemLineLeadTime));
													}
												else
													{
														//If not, create a new entry & setup an array to hold the items/quantities needed
														//
														suppliers[itemLineSupplier] = [new itemObject(itemLineItem, itemLineQuantity, itemLineStartDate, itemLineEndDate, itemLineLeadTime)];
													}
											}
										
									}
								
								//Now process the list of suppliers 
								//
								for ( var supplier in suppliers) 
									{
										//Load the supplier record
										//
										var supplierRecord = null;
										
										try
											{
												supplierRecord = record.load({
																			type:	record.Type.VENDOR,
																			id:		supplier
																			});		
											}
										catch(err)
											{
												supplierRecord = null;
												log.error({title: 'Error loading supplier record', details: err});
											}
											
										if(supplierRecord != null)
											{
												//Get the suppliers outsource location
												//
												var supplierOutsourceLocations = supplierRecord.getValue({fieldId: 'manufacturinglocations'});
												
												if(supplierOutsourceLocations != null && supplierOutsourceLocations.length > 0)
													{
														var supplierOutsourceLocation = supplierOutsourceLocations[0];
													
														//Get the array of item for this supplier
														//
														var itemArray = suppliers[supplier];
														
														//Create a new purchase order
														//
														var poRecord = null;
														
														try
															{
																poRecord = record.create({
																						type:			record.Type.PURCHASE_ORDER,
																						isDynamic:		true,
																						defaultValues:	{
																										customform: outsourcedFormId,
																										entity:		supplier
																										}
																						});
															}
														catch(err)
															{
																log.error({title: 'Error creating outsource po', details: err});
																poRecord = null;
															}
														
														if(poRecord != null)
															{
																//Header fields
																//
																//poRecord.setValue({fieldId: 'customform', value: outsourcedFormId});
																poRecord.setValue({fieldId: 'approvalstatus', value: 2});				//Approved
																
																
																//Item fields - loop through all of the items for this supplier
																//
																for (var int2 = 0; int2 < itemArray.length; int2++) 
																	{
																		var itemId 			= itemArray[int2].itemLineItem;
																		var itemQty			= itemArray[int2].itemLineQuantity;
																		var itemStartDate	= itemArray[int2].itemLineStartDate;
																		var itemEndDate		= itemArray[int2].itemLineEndDate;
																		var itemLeadTime	= itemArray[int2].itemLineLeadTime;
																		
																		//Find the bom & bom revision for the assembly
																		//
																		var bomResults = findBomFromAssembly(itemId);
																		
																		if(bomResults != null && bomResults.length > 0)
																			{
																				var bomId				= bomResults[0].getValue({name: "internalid"});
																				var bomRevisionId		= bomResults[0].getValue({name: "internalid",join: "revision"});
																				var componentResults	= findPrimaryComponent(bomRevisionId);
																				
																				if(componentResults != null && componentResults.length > 0)
																					{
																						var bomComponent = componentResults[0].getValue({name: "item",join: "component"});
																						
																						//Add a new line to the PO
																						//
																						poRecord.selectNewLine({sublistId: 'item'});
																						poRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'assembly', value: itemId});
																						poRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'location', value: supplierOutsourceLocation});
																						poRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'billofmaterials', value: bomId});
																						poRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'billofmaterialsrevision', value: bomRevisionId});
																						poRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: bomComponent});
																						
																						//Check the rate field to see if it is blank or zero, if so set it to value of 1
																						//
																						var currentRate = poRecord.getCurrentSublistValue({sublistId: 'item', fieldId: 'rate'});
																						
																						if(currentRate == null || currentRate == '' || currentRate == '0')
																							{
																								poRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: format.parse({value: 1, type: format.Type.CURRENCY})});
																							}
																						
																						//Set the quantity from the entered value
																						//
																						poRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: itemQty});
																						
																						//Work out the production start & end dates
																						//
																						var prodStartDate 	= new Date();
																						var prodEndDate 	= new Date();
																						
																						//If we have a specific start date, then set it
																						//
																						if(itemStartDate != null && itemStartDate != '')
																							{
																								prodStartDate 	= format.parse({value: itemStartDate, type: format.Type.DATE});
																								prodEndDate 	= format.parse({value: itemStartDate, type: format.Type.DATE});
																							}
																						
																						//End date will be start date plus manufacturing lead time
																						//
																						prodEndDate.setDate(Number(prodEndDate.getDate()) + Number(itemLeadTime));
																						
																						//If we have a specific end date, then set it
																						//
																						if(itemEndDate != null && itemEndDate != '')
																							{
																								prodEndDate	= format.parse({value: itemEndDate, type: format.Type.DATE});
																							}
																						
																						poRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'productionstartdate', value: prodStartDate});
																						poRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'productionenddate', value: prodEndDate});
																						
																						//Commit the line to the PO
																						//
																						poRecord.commitLine({sublistId: 'item', ignoreRecalc: false});
																					}
																			}
																	}
																
																//Save the PO record
																//
																var poRecordId = null;
																
																try
																	{
																		poRecordId = poRecord.save({
																									enableSourcing: 		true, 
																									ignoreMandatoryFields: 	true
																									});
																	}
																catch(err)
																	{
																		poRecordId = null;
																		log.error({title: 'Error saving outsource po', details: err});
																	}
																
																if(poRecordId != null)
																	{
																		//Having saved the PO, we now need to create a transfer order for items at the outsource location that are on back order
																		//
																		var transferOrderId = createTransferOrder(poRecordId, supplierOutsourceLocation, transferFromLocation);
																		
																		//Get info from the PO & TO to show on the next screen of the suitelet
																		//
																		var poEntity 			= '';
																		var poTranid 			= '';
																		var toTranid			= '';
																		var toLocation			= '';
																		var toTransferLocation 	= '';
																		var poUrl				= '';
																		var toUrl				= '';
																		
																		var poDetails = search.lookupFields({
																											type:		search.Type.PURCHASE_ORDER,
																											id:			poRecordId,
																											columns:	['entity', 'tranid']
																											});
																		
																		poEntity = poDetails.entity[0].text;
																		poTranid = poDetails.tranid;
																		
																		poUrl	= url.resolveRecord({
																										isEditMode:		false,
																										recordId:		poRecordId,
																										recordType:		record.Type.PURCHASE_ORDER
																										});
																		
																		if(transferOrderId != null)
																			{
																				var toDetails = search.lookupFields({
																													type:		search.Type.TRANSFER_ORDER,
																													id:			transferOrderId,
																													columns:	['location', 'transferlocation', 'tranid']
																													});
																				
																				toLocation 			= toDetails.location[0].text;
																				toTransferLocation 	= toDetails.transferlocation[0].text;
																				toTranid 			= toDetails.tranid;
																				
																				toUrl	= url.resolveRecord({
																												isEditMode:		false,
																												recordId:		transferOrderId,
																												recordType:		record.Type.TRANSFER_ORDER
																												});
																				
																				//Update the PO with the related TO
																				//
																				try
																					{
																						record.submitFields({
																											type:		record.Type.PURCHASE_ORDER,
																											id:			poRecordId,
																											options:	{
																														ignoreMandatoryFields:		true
																														},
																											values:		{
																														custbody_bbs_related_to:	transferOrderId
																														}
																						});
																					}
																				catch(err)
																					{
																						log.error({title: 'Error updating PO with TO link', details: err});
																					}
																			}
																		
																		createdData.push(new createdOrdersObj(poRecordId, poTranid, poEntity, poUrl, transferOrderId, toTranid, toLocation, toTransferLocation, toUrl));	
																	}
															}
													}
											}
									}
								
								
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
																			createddata:	JSON.stringify(createdData)	//Created data
																		}
														});
								
								break;
						}
		        }
	    }
   
    //Object to hold the created PO & TO details
    //
    function createdOrdersObj(_poId, _poTranid, _poEntity, _poUrl, _toId, _toTranid, _toLocation, _toTransferLocation, _toUrl)
    	{
	    	this.poId				= _poId;
	    	this.poTranid			= _poTranid;
	    	this.poEntity			= _poEntity;
	    	this.poUrl				= _poUrl;
	    	this.toId				= _toId;
	    	this.toTranid			= _toTranid;
	    	this.toLocation			= _toLocation;
	    	this.toTransferLocation	= _toTransferLocation;
	    	this.toUrl				= _toUrl;
    	}
    
    //Function to create a transfer order
    //
    function createTransferOrder(_poRecordId, _supplierOutsourceLocation, _transferFromLocation)
    	{
    		var transferOrderId = null;
    		
    		//Find all the items that are on back order at the trasfer location
    		//
    		var inventoryitemSearchObj = getResults(search.create({
									    			   type: 		"item",
									    			   filters:
												    			   [
												    			      ["inventorylocation","anyof",_supplierOutsourceLocation], 
												    			      "AND", 
												    			      ["formulanumeric: NVL({locationquantitybackordered},0) - NVL({locationquantityonorder},0)","greaterthan","0"]
												    			//      "AND", 
												    			//      ["type","anyof","InvtPart"]
												    			   ],
									    			   columns:
												    			   [
												    			      search.createColumn({name: "itemid",sort: search.Sort.ASC,label: "Name"}),
												    			      search.createColumn({name: "displayname", label: "Display Name"}),
												    			      search.createColumn({name: "internalid", label: "Internal Id"}),
												    			      search.createColumn({name: "salesdescription", label: "Description"}),
												    			      search.createColumn({name: "type", label: "Type"}),
												    			      search.createColumn({name: "formulanumeric",formula: "NVL({locationquantitybackordered},0) - NVL({locationquantityonorder},0)",label: "Qty Reuired"})
												    			   ]
									    			}));
    		
    		//Did we find any items?
    		//
    		if(inventoryitemSearchObj != null && inventoryitemSearchObj.length > 0)
    			{
    				//Create a transfer order
    				//
    				var transferOrderRecord = null;
    				
    				try
    					{
	    					transferOrderRecord = record.create({
	    														type:		record.Type.TRANSFER_ORDER,
	    														isDynamic:	true
	    														});
    					}
    				catch(err)
    					{
    						transferOrderRecord = null;
    						log.error({title: 'Error creating transfer order', details: err});
    					}

    				if(transferOrderRecord != null)
    					{
	    					//Set body field values
	        				//
    						transferOrderRecord.setValue({fieldId: 'location', value: _transferFromLocation});
    						transferOrderRecord.setValue({fieldId: 'transferlocation', value: _supplierOutsourceLocation});
    						transferOrderRecord.setValue({fieldId: 'custbody_bbs_related_po', value: _poRecordId});

    						//Loop through the items to add to the order
    						//
			    			for (var transferLines = 0; transferLines < inventoryitemSearchObj.length; transferLines++) 
			    				{
			    					var transferItemId			= inventoryitemSearchObj[transferLines].getValue({name: "internalid"});
			    					var transferItemQuantity	= inventoryitemSearchObj[transferLines].getValue({name: "formulanumeric"});
									
			    					//Add a new line to the TO
									//
			    					transferOrderRecord.selectNewLine({sublistId: 'item'});
			    					
			    					transferOrderRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: transferItemId});
			    					transferOrderRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: transferItemQuantity});
			    					
			    					//Commit the line to the TO
									//
			    					transferOrderRecord.commitLine({sublistId: 'item', ignoreRecalc: false});
			    				}
			    			
			    			//Save the TO record
							//
							try
								{
									transferOrderId = transferOrderRecord.save({
																				enableSourcing: 		true, 
																				ignoreMandatoryFields: 	true
																				});
								}
							catch(err)
								{
									transferOrderId = null;
									log.error({title: 'Error saving transfer order', details: err});
								}
    					}
    			}
    		
    		return transferOrderId;
    	}
    
    //Function to search for a bom from an assembly
    //
    function findBomFromAssembly(_assemblyId)
    	{
	    	return getResults(search.create({
												 		   type: "bom",
												 		   filters:
												 		   [
												 		      ["assemblyitem.assembly","anyof",_assemblyId], 
												 		      "AND", 
												 		      ["assemblyitem.default","is","T"], 
												 		      "AND", 
												 		      ["revision.isinactive","is","F"]
												 		   ],
												 		   columns:
												 		   [
												 		      search.createColumn({name: "name", label: "Name"}),
												 		      search.createColumn({name: "revisionname", label: "Revision : Name"}),
												 		      search.createColumn({name: "internalid",join: "revision",label: "Revision Internal ID"}),
												 		      search.createColumn({name: "internalid",label: "BOM Internal ID"}),
												 		      search.createColumn({name: "assembly",join: "assemblyItem",label: "Assembly"})
												 		   ]
												 		}));
    	}

    function findPrimaryComponent(_revisionId)
    	{
    		return getResults(search.create({
								    		   type: 		"bomrevision",
								    		   filters:
											    		   [
											    		      ["internalidnumber","equalto",_revisionId], 
											    		      "AND", 
											    		      ["component.itemsubtype","is","Purchase"],
											    		  //    "AND",
											    		  //    ["component.itemtype","is","OthCharge"]			//This does not work - bug in NS??
											    		   ],
								    		   columns:
								    		   [
								    		      search.createColumn({name: "internalid",sort: search.Sort.ASC,label: "Internal ID"}),
								    		      search.createColumn({name: "lineid",join: "component",label: "Line ID"}),
								    		      search.createColumn({name: "item",join: "component",label: "Item"}),
								    		      search.createColumn({name: "description",join: "component",label: "Description"}),
								    		      search.createColumn({name: "quantity",join: "component",label: "Quantity"}),
								    		      search.createColumn({name: "name", label: "Name"}),
								    		      search.createColumn({name: "itemtype",join: "component",label: "Item Type"}),
								    		      search.createColumn({name: "itemsubtype",join: "component",label: "Item Subtype"})
								    		   ]
    		}));
    		
    	}
    
    function getOutsourceSuppliers()
    	{
    		return getResults(search.create({
							    		   type: 	  "vendor",
							    		   filters:
										    		   [
										    		      ["formulatext: {manufacturinglocations}","isnotempty",""]
										    		   ],
							    		   columns:
										    		   [
										    		      search.createColumn({name: "entityid",sort: search.Sort.ASC,label: "ID"}),
										    		      search.createColumn({name: "altname", label: "Name"}),
										    		      search.createColumn({name: "internalid", label: "Internal Id"})
										    		   ]
							    		}));
    		
    	}
    
    function itemObject(_itemLineItem, _itemLineQuantity, _itemLineStartDate, _itemLineEndDate, _itemLineLeadTime)
    	{
    		this.itemLineItem		= _itemLineItem;
    		this.itemLineQuantity	= _itemLineQuantity;
    		this.itemLineStartDate	= _itemLineStartDate;
    		this.itemLineEndDate	= _itemLineEndDate;
    		this.itemLineLeadTime	= _itemLineLeadTime;
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

