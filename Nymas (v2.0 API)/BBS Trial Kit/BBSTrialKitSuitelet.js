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
	    			var paramAssemblyItem 		= context.request.parameters['assemblyitem'];				//Selected assembly item
	    			var paramSalesOrder 		= context.request.parameters['salesorder'];					//Selected sales order
	    			var paramWorksOrder 		= context.request.parameters['worksorder'];					//Selected works order
	    			var paramStage 				= Number(context.request.parameters['stage']);				//The stage the suitelet is in
	    			var paramQuantity 			= Number(context.request.parameters['quantity']);			//The assembly quantity
	    			var paramSelectType			= Number(context.request.parameters['type']);				//The selection type
	    			var paramMaxBomLevel		= Number(context.request.parameters['maxbomlevel']);		//Maximum bom explosion level
		    		
					var stage 	= (paramStage == null || paramStage == '' || isNaN(paramStage) ? 1 : paramStage);
					var bomList = new Array();
					var lineNo 	= Number(0);
					var level 	= Number(1);
					
	    			//Create a form
	    			//
		            var form = serverWidget.createForm({
					                						title: 	'Trial Kit'
					            						});
		            
		            //Find the client script
	    			//
	    			var fileSearchObj = getResults(search.create({
		    			   type: 	"file",
		    			   filters:
		    			   [
		    			      ["name","is","BBSTrialKitSuiteletClient.js"]
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
								
								//Add a field group for the filters
								//
								var filtersGroup = form.addFieldGroup({
																		id:		'custpage_filters_group',
																		label:	'Filters'
																		});
								
								//Add a field for the bom level
								//
								var bomLevelField = form.addField({
													                id: 		'custpage_entry_bom_level',
													                type: 		serverWidget.FieldType.INTEGER,
													                label: 		'Max BOM Level',
													                container:	'custpage_filters_group'
												            		});
								
								bomLevelField.isMandatory = true;
								bomLevelField.defaultValue = 2;
								
								
								//Add a field for the selection type
								//
								var selectTypeField = form.addField({
													                id: 		'custpage_entry_select_type',
													                type: 		serverWidget.FieldType.SELECT,
													                label: 		'Select Type',
													                container:	'custpage_filters_group'
												            		});
								
								selectTypeField.isMandatory = true;
								
								selectTypeField.addSelectOption({
																	value:			'',
																	text:			'',
																	isSelected:		false
																	});	
								
								selectTypeField.addSelectOption({
																	value:			'1',
																	text:			'Assembly Item',
																	isSelected:		false
																	});	

								selectTypeField.addSelectOption({
																	value:			'2',
																	text:			'Sales Order',
																	isSelected:		false
																	});	

								selectTypeField.addSelectOption({
																	value:			'3',
																	text:			'Works Order',
																	isSelected:		false
																	});	



								//Add a field for the assembly items
								//
								var assemblyItemField = form.addField({
													                id: 		'custpage_entry_assembly',
													                type: 		serverWidget.FieldType.SELECT,
													                label: 		'Assembly Item',
													                container:	'custpage_filters_group'
												            		});

								//Add a field to filter by kit quantity
								//
								var quantityField = form.addField({
														                id: 		'custpage_entry_quantity',
														                type: 		serverWidget.FieldType.INTEGER,
														                label: 		'Assembly Item Quantity',
														                container:	'custpage_filters_group'
													            		});
								quantityField.defaultValue = 1;
								
								
								//Add a field to filter by sales orders
								//
								var salesOrderField = form.addField({
														                id: 		'custpage_entry_sales_order',
														                type: 		serverWidget.FieldType.SELECT,
														                label: 		'Sales Order',
														                container:	'custpage_filters_group'	
													            		});
						
								//Add a field to filter by works orders
								//
								var worksOrderField = form.addField({
														                id: 		'custpage_entry_works_order',
														                type: 		serverWidget.FieldType.SELECT,
														                label: 		'Works Order',
														                container:	'custpage_filters_group'
													            		});

								
								//Populate the select fields
								//
								var assembliesArray = getAssemblies();
								
								assemblyItemField.addSelectOption({
																	value:			'',
																	text:			'',
																	isSelected:		false
																	});	
								
								if(assembliesArray != null && assembliesArray.length > 0)
									{
										for (var int = 0; int < assembliesArray.length; int++) 
											{
												assemblyItemField.addSelectOption({
																					value:			assembliesArray[int].getValue({name: "internalid"}),
																					text:			assembliesArray[int].getValue({name: "itemid"}),
																					isSelected:		false
																					});	
											}
									}
								
								var salesOrdersArray = getSalesOrders();
								
								salesOrderField.addSelectOption({
																value:			'',
																text:			'',
																isSelected:		false
																});	


								if(salesOrdersArray != null && salesOrdersArray.length > 0)
									{
										for (var int = 0; int < salesOrdersArray.length; int++) 
											{
												salesOrderField.addSelectOption({
																					value:			salesOrdersArray[int].getValue({name: "internalid"}),
																					text:			salesOrdersArray[int].getValue({name: "tranid"}),
																					isSelected:		false
																					});	
											}
									}
								
								var worksOrdersArray = getWorksOrders();
								
								worksOrderField.addSelectOption({
																value:			'',
																text:			'',
																isSelected:		false
																});	

								if(worksOrdersArray != null && worksOrdersArray.length > 0)
									{
										for (var int = 0; int < worksOrdersArray.length; int++) 
											{
												worksOrderField.addSelectOption({
																					value:			worksOrdersArray[int].getValue({name: "internalid"}),
																					text:			worksOrdersArray[int].getValue({name: "tranid"}),
																					isSelected:		false
																					});	
											}
									}
								
								
								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Generate Trial Kit'
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
								var selectTypeField = form.addField({
													                id: 		'custpage_entry_select_type',
													                type: 		serverWidget.FieldType.TEXT,
													                label: 		'Select Type',
													                container:	'custpage_filters_group'
												            		});
								selectTypeField.defaultValue 	= paramSelectType;
								selectTypeField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
								
								//Add a field for the assembly items
								//
								var assemblyItemField = form.addField({
													                id: 		'custpage_entry_assembly',
													                type: 		serverWidget.FieldType.TEXT,
													                label: 		'Assembly Item',
													                container:	'custpage_filters_group'
												            		});
								assemblyItemField.defaultValue 	= paramAssemblyItem;
								assemblyItemField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
								
								//Add a field to filter by kit quantity
								//
								var quantityField = form.addField({
														                id: 		'custpage_entry_quantity',
														                type: 		serverWidget.FieldType.TEXT,
														                label: 		'Assembly Item Quantity',
														                container:	'custpage_filters_group'
													            		});
								quantityField.defaultValue 	= paramQuantity;
								
								//Add a field to filter by sales orders
								//
								var salesOrderField = form.addField({
														                id: 		'custpage_entry_sales_order',
														                type: 		serverWidget.FieldType.TEXT,
														                label: 		'Sales Order',
														                container:	'custpage_filters_group'	
													            		});
								salesOrderField.defaultValue 	= paramSalesOrder;
								salesOrderField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
								
								//Add a field to filter by works orders
								//
								var worksOrderField = form.addField({
														                id: 		'custpage_entry_works_order',
														                type: 		serverWidget.FieldType.TEXT,
														                label: 		'Works Order',
														                container:	'custpage_filters_group'
													            		});
								worksOrderField.defaultValue 	= paramWorksOrder;
								worksOrderField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
								
								

								
								//Allow the amendment of the bom level
								//
								var bomLevelField = form.addField({
												                id: 		'custpage_entry_bom_level',
												                type: 		serverWidget.FieldType.INTEGER,
												                label: 		'Max BOM Level',
												                container:	'custpage_filters_group'
											            		});
								
								bomLevelField.defaultValue 	= paramMaxBomLevel;
								bomLevelField.isMandatory 	= true;
								
								
								var tab = form.addTab({
														id:		'custpage_tab_items',
														label:	'Trial Kit Results'
													});
								
								
								var subList = form.addSublist({
																id:		'custpage_sublist_items', 
																type:	serverWidget.SublistType.LIST, 
																label:	'Trial Kit Results',
																tab:	'custpage_tab_items'
															});
								
								//Add columns to sublist
								//
								subList.addField({
													id:		'custpage_sl_items_level',
													label:	'Level',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_items_item',
													label:	'Item',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_items_description',
													label:	'Description',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_items_type',
													label:	'Type',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_items_source',
													label:	'Source',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_items_qty',
													label:	'Qty Required',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_items_supply',
													label:	'Supply Source',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
												id:		'custpage_sl_items_available',
												label:	'Available Date',
												type:	serverWidget.FieldType.TEXT
											});		

								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Regenerate Trial Kit'
										            });
					            
					            //Search based on type selected
					            //
								var assebliesToProcess = [];
								
					            switch(paramSelectType)
					            	{
							            case 1:		//assembly
							            	assebliesToProcess.push(new assemblyItemData(paramAssemblyItem, paramQuantity));
							            	
							            	break;
							            	
							            case 2:		//sales order
							            	
							            	var salesOrderItems = getResults(search.create({
							            		   type: "salesorder",
							            		   filters:
							            		   [
							            		      ["type","anyof","SalesOrd"], 
							            		      "AND", 
							            		      ["mainline","is","F"], 
							            		      "AND", 
							            		      ["cogs","is","F"], 
							            		      "AND", 
							            		      ["taxline","is","F"], 
							            		      "AND", 
							            		      ["shipping","is","F"], 
							            		      "AND", 
							            		      ["item.type","anyof","Assembly"], 
							            		      "AND", 
							            		      ["internalid","anyof",paramSalesOrder]
							            		   ],
							            		   columns:
							            		   [
							            		      search.createColumn({name: "item", label: "Item"}),
							            		      search.createColumn({name: "quantity", label: "Quantity"})
							            		   ]
							            		}));
							            	
							            	if(salesOrderItems != null && salesOrderItems.length > 0)
							            		{
							            			for (var int2 = 0; int2 < salesOrderItems.length; int2++) 
								            			{
							            					assebliesToProcess.push(new assemblyItemData(salesOrderItems[int2].getValue({name: 'item'}), salesOrderItems[int2].getValue({name: 'quantity'})));
														}
							            		}
							            	
							            case 3:		//works order
							            	
							            	var worksOrderItems = getResults(search.create({
							            		   type: "workorder",
							            		   filters:
							            		   [
							            		      ["type","anyof","WorkOrd"], 
							            		      "AND", 
							            		      ["mainline","is","F"], 
							            		      "AND", 
							            		      ["cogs","is","F"], 
							            		      "AND", 
							            		      ["taxline","is","F"], 
							            		      "AND", 
							            		      ["shipping","is","F"], 
							            		      "AND", 
							            		      ["item.type","anyof","Assembly"], 
							            		      "AND", 
							            		      ["internalid","anyof",paramWorksOrder]
							            		   ],
							            		   columns:
							            		   [
							            		      search.createColumn({name: "item", label: "Item"}),
							            		      search.createColumn({name: "quantity", label: "Quantity"})
							            		   ]
							            		}));
							            	
							            	if(worksOrderItems != null && worksOrderItems.length > 0)
							            		{
							            			for (var int2 = 0; int2 < worksOrderItems.length; int2++) 
								            			{
							            					assebliesToProcess.push(new assemblyItemData(worksOrderItems[int2].getValue({name: 'item'}), worksOrderItems[int2].getValue({name: 'quantity'})));
														}
							            		}
							            	
							            	break;
					            	}
					            
					            if(assebliesToProcess.length > 0)
					            	{
					            		//Explode all of the BOM's
					            		//
					            		for (var int3 = 0; int3 < assebliesToProcess.length; int3++) 
						            		{
						            			level = Number(1);
												explodeBom(assebliesToProcess[int3].id, bomList, level, assebliesToProcess[int3].quantity, true, assebliesToProcess[int3].id, assebliesToProcess[int3].quantity, paramMaxBomLevel);
											}
					            	
					            		//Roll up the latest date to the top so we can see when the whole assembly can be made
					            		//
					            		if(bomList.length > 0)
					            			{
						            			var latestDate = new Date();
						            		
							            		for (var int = 1; int < bomList.length; int++) 
								    				{ 
								            			if(bomList[int].availDateDate.getTime() > latestDate.getTime())
								            				{
								            					latestDate = new Date(bomList[int].availDateDate.getFullYear(), bomList[int].availDateDate.getMonth(), bomList[int].availDateDate.getDate());
								            				}
								    				}
							            		
							            		bomList[0].availDateDate 	= new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate());
							            		bomList[0].availDate		= format.format({value: latestDate, type: format.Type.DATE});
					            			}
					            		
					            		//Fill out the bom components sublist on the suitelet form
					    				//
					    				var linenum = 0;
					    				var filler = '…';
					    				
					    				for (var int = 0; int < bomList.length; int++) 
						    				{ 	
						    					 subList.setSublistValue({
																		id:		'custpage_sl_items_level',
																		line:	linenum,
																		value:	filler.repeat(Number(bomList[int].level)) + Number(bomList[int].level).toString()
																		});	
						    					 
						    					 if(bomList[int].itemText != '' && bomList[int].itemText != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_item',
																				line:	linenum,
																				value:	bomList[int].itemText
																				});	
						    						 }
						    					 
						    					 if(bomList[int].itemDesc != '' && bomList[int].itemDesc != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_description',
																				line:	linenum,
																				value:	bomList[int].itemDesc
																				});	
							    						 }
						    					 
						    					 if(bomList[int].itemType != '' && bomList[int].itemType != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_type',
																				line:	linenum,
																				value:	bomList[int].itemType
																				});	
						    						 }
						    					 
						    					 if(bomList[int].itemSource != '' && bomList[int].itemSource != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_source',
																				line:	linenum,
																				value:	bomList[int].itemSource
																				});	
						    						 }
						    					 
						    					 if(bomList[int].itemQty != '' && bomList[int].itemQty != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_qty',
																				line:	linenum,
																				value:	bomList[int].itemQty.toString()
																				});	
						    						 }
						    					 
						    					 if(bomList[int].supplySource != '' && bomList[int].supplySource != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_supply',
																				line:	linenum,
																				value:	bomList[int].supplySource
																				});	
						    						 }
					    					 
		    					 
						    					 if(bomList[int].availDate != '' && bomList[int].availDate != null)
						    						 {
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_available',
																				line:	linenum,
																				value:	bomList[int].availDate
																				});	
						    						 }
				    					 
	    					 
	    					 
						    					linenum++;
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
								var assemblyItem 			= request.parameters['custpage_entry_assembly'];
								var salesOrder 				= request.parameters['custpage_entry_sales_order'];
								var worksOrder 				= request.parameters['custpage_entry_works_order'];
								var quantity 				= request.parameters['custpage_entry_quantity'];
								var type 					= request.parameters['custpage_entry_select_type'];
								var maxBomLevel				= request.parameters['custpage_entry_bom_level'];
								         					                     
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
																			assemblyitem: 	assemblyItem,
																			salesorder:		salesOrder,
																			worksorder:		worksOrder,
																			quantity:		quantity,
																			type:			type,
																			maxbomlevel:	maxBomLevel
																		}
														});
								
								break;
								
							default:
							
								//Get user entered parameters
								//
								var assemblyItem 			= request.parameters['custpage_entry_assembly'];
								var salesOrder 				= request.parameters['custpage_entry_sales_order'];
								var worksOrder 				= request.parameters['custpage_entry_works_order'];
								var quantity 				= request.parameters['custpage_entry_quantity'];
								var type 					= request.parameters['custpage_entry_select_type'];
								var maxBomLevel				= request.parameters['custpage_entry_bom_level'];
								
								//Call the suitelet again
								//
								context.response.sendRedirect({
														type: 			http.RedirectType.SUITELET, 
														identifier: 	runtime.getCurrentScript().id, 
														id: 			runtime.getCurrentScript().deploymentId, 
														parameters:		{
																			stage: 			stage,
																			assemblyitem: 	assemblyItem,
																			salesorder:		salesOrder,
																			worksorder:		worksOrder,
																			quantity:		quantity,
																			type:			type,
																			maxbomlevel:	maxBomLevel
																		}
														});
								
								break;
						}
		        }
	    }
    
    function assemblyItemData(_id, _qty)
    	{
    		this.id			= _id;		//Assembly id
    		this.quantity	= _qty;		//Assembly quantity required
    	}
    
    function availabilityData(_supplySource, _availableDate, _transactionFound, _availableDateDate)
    	{
    		this.supplySource		= _supplySource;		//Supply source text
    		this.availableDate		= _availableDate;		//Available date as text
    		this.transactionFound	= _transactionFound;	//Flag to show that a transaction was actually found for this item
    		this.availableDateDate	= _availableDateDate;	//Available date as a date object
    		
    	}
    
    function expolsionData(_level, _item, _itemText, _itemDesc, _itemUnit, _itemQty, _itemType, _itemSource, _supplySource, _availDate, _availDateDate)
    	{
    		this.level			= _level;			//Bom explosion level
    		this.item			= _item;			//Item id
    		this.itemText		= _itemText;		//Item as text	
    		this.itemDesc		= _itemDesc;		//Item description
    		this.itemUnit		= _itemUnit;		//Item unit
    		this.itemQty		= _itemQty;			//Item quantity required
    		this.itemType		= _itemType;		//Item type InvtPart, Assembly, OthCharge etc.
    		this.itemSource		= _itemSource;		//Item source STOCK, WORK_ORDER etc
    		this.supplySource 	= _supplySource;	//Item supplied from source as text
    		this.availDate		= _availDate;		//Item availability as text
    		this.availDateDate	= _availDateDate;	//Item availability as date object
    	}
    
    //Function to explode BOM
    //
    function explodeBom(topLevelAssemblyId, bomList, level, requiredQty, topLevel, itemId, itemQty, maxBomLevel)
	    {
    		//Find the bom for the assembly, then find the bom revision which will give us the components
    		//
    		var bomSearchObj = getResults(search.create({
										    		   type: "bom",
										    		   filters:
										    		   [
										    		      ["assemblyitem.assembly","anyof",topLevelAssemblyId], 
										    		      "AND", 
										    		      ["assemblyitem.default","is","T"], 
										    		      "AND", 
										    		      ["revision.isinactive","is","F"]
										    		   ],
										    		   columns:
										    		   [
										    		      search.createColumn({name: "name", label: "Name"}),
										    		      search.createColumn({name: "revisionname", label: "Revision : Name"}),
										    		      search.createColumn({name: "internalid",join: "revision",label: "Internal ID"}),
										    		      search.createColumn({name: "assembly",join: "assemblyItem",label: "Assembly"})
										    		   ]
										    		}));
    		
    		if(bomSearchObj != null && bomSearchObj.length > 0)
    			{
	    			var bomRevisionId = bomSearchObj[0].getValue({name: "internalid",join: "revision"});
	    			var assemblyName = bomSearchObj[0].getText({name: "assembly",join: "assemblyItem"});
	    			
    				if(bomRevisionId != null && bomRevisionId != '')
    					{
    						//Find the components on the bom revision record
    						//
	    					var bomrevisionSearchObj = getResults(search.create({
	    						   type: "bomrevision",
	    						   filters:
	    						   [
	    						      ["internalidnumber","equalto",bomRevisionId]
	    						   ],
	    						   columns:
	    						   [
	    						      search.createColumn({
	    						         name: "internalid",
	    						         label: "Internal ID"
	    						      }),
	    						      search.createColumn({
	    						         name: "baseunits",
	    						         join: "component",
	    						         label: "Base Units"
	    						      }),
	    						      search.createColumn({
	    						         name: "bomquantity",
	    						         join: "component",
	    						         label: "Bom Quantity"
	    						      }),
	    						      search.createColumn({
	    						         name: "bombasequantity",
	    						         join: "component",
	    						         label: "Bom Quantity in Base Units"
	    						      }),
	    						      search.createColumn({
	    						         name: "componentyield",
	    						         join: "component",
	    						         label: "Component Yield"
	    						      }),
	    						      search.createColumn({
	    						         name: "description",
	    						         join: "component",
	    						         label: "Description"
	    						      }),
	    						      search.createColumn({
	    						         name: "internalid",
	    						         join: "component",
	    						         label: "Internal ID"
	    						      }),
	    						      search.createColumn({
	    						         name: "item",
	    						         join: "component",
	    						         label: "Item"
	    						      }),
	    						      search.createColumn({
	    						         name: "itemsource",
	    						         join: "component",
	    						         label: "Item Source"
	    						      }),
	    						      search.createColumn({
	    						         name: "itemsubtype",
	    						         join: "component",
	    						         label: "Item Subtype"
	    						      }),
	    						      search.createColumn({
	    						         name: "itemtype",
	    						         join: "component",
	    						         label: "Item Type"
	    						      }),
	    						      search.createColumn({
	    						         name: "lineid",
	    						         join: "component",
	    						         label: "Line ID",
	    						         sort: search.Sort.ASC
	    						      }),
	    						      search.createColumn({
	    						         name: "quantity",
	    						         join: "component",
	    						         label: "Quantity"
	    						      }),
	    						      search.createColumn({
	    						         name: "basequantity",
	    						         join: "component",
	    						         label: "Quantity in Base Units"
	    						      }),
	    						      search.createColumn({
	    						         name: "bomrevision",
	    						         join: "component",
	    						         label: "Revision Name"
	    						      }),
	    						      search.createColumn({
	    						         name: "units",
	    						         join: "component",
	    						         label: "Units"
	    						      }),
	    						      search.createColumn({
	    						         name: "weight",
	    						         join: "component",
	    						         label: "Weight"
	    						      })
	    						   ]
	    						}));
	    					
	    					if(bomrevisionSearchObj != null && bomrevisionSearchObj.length > 0)
	    						{
		    				    	if(topLevel)
			    			    		{
			    			    			var topLevelDescription = assemblyName;
			    			    			var topLevelItemId 		= assemblyName;
			    			    		
			    			    			bomList.push(new expolsionData(0,itemId,topLevelItemId,topLevelDescription,'',itemQty,'Assembly','','','', null));
			    			    		}
	    						
	    						
		    						for (var int4 = 0; int4 < bomrevisionSearchObj.length; int4++) 
					            		{
			    							var memberItem 		= bomrevisionSearchObj[int4].getValue({name: "item", join: "component"}); 
			    				    		var memberItemText 	= bomrevisionSearchObj[int4].getText({name: "item", join: "component"}); 
			    				    		var memberDesc 		= bomrevisionSearchObj[int4].getValue({name: "description", join: "component"}); 
			    				    		var memberUnit 		= bomrevisionSearchObj[int4].getValue({name: "units", join: "component"}); 
			    				    		var memberQty 		= Number(bomrevisionSearchObj[int4].getValue({name: "bomquantity", join: "component"})) * requiredQty; 
			    				    		var memberType 		= bomrevisionSearchObj[int4].getValue({name: "itemtype", join: "component"}); 
			    				    		var memberSource 	= bomrevisionSearchObj[int4].getValue({name: "itemsource", join: "component"}); 
			    				
			    				    		//Get availability of item
			    				    		//
			    				    		var availabilityObj = getItemAvailablity(memberItem, memberType, memberQty);
			    				    		
			    				    		//Add this item to the bom list
			    				    		//
			    				    		bomList.push(new expolsionData(level,memberItem,memberItemText,memberDesc,memberUnit,memberQty,memberType,memberSource, availabilityObj.supplySource, availabilityObj.availableDate, availabilityObj.availableDateDate));
		
			    				    		//If we have found another assembly, then explode that as well
			    				    		//
			    				    		if(memberType == 'Assembly' && level < maxBomLevel)
			    				    			{
			    				    				explodeBom(memberItem, bomList, level + 1, requiredQty, false, null, null, maxBomLevel);
			    				    			}
						            	}
			    				}
    					}
    			}
	    }
    
    //Function to get availability of item
    //
    function getItemAvailablity(_memberItem, _memberType, _memberQty)
	    {
    		var availData = new availabilityData('','');
    		
	    	switch(_memberType)
	    		{
			    	case 'OthCharge':	//Other Charge - no availability as such, but we need to look at the manufacturing routing to get the timing
			    		
			    		availData.supplySource 		= '';
			    		availData.availableDate		= 'Now';
			    		availData.transactionFound	= true;
			    		availData.availableDateDate	= new Date(new Date().toDateString());
			    		
			    		break;
	    	
			    	case 'Assembly':	//Assembly Item
			    		
			    		//Find any open WO's for the assembly item
			    		//
			    		var workorderSearchObj = getResults(search.create({
			    			   type: "workorder",
			    			   filters:
			    			   [
			    			      ["type","anyof","WorkOrd"], 
			    			      "AND", 
			    			      ["status","anyof","WorkOrd:D","WorkOrd:A","WorkOrd:B"], 
			    			      "AND", 
			    			      ["mainline","is","T"], 
			    			      "AND", 
			    			      ["item","anyof",_memberItem]
			    			   ],
			    			   columns:
			    			   [
			    			      search.createColumn({name: "trandate",sort: search.Sort.ASC,label: "Date"}),
			    			      search.createColumn({name: "tranid", label: "Document Number"}),
			    			      search.createColumn({name: "item", label: "Item"}),
			    			      search.createColumn({name: "enddate", label: "End Date"}),
			    			      search.createColumn({name: "quantity", label: "Quantity"})
			    			   ]
			    			}));
			    			
			    		if(workorderSearchObj != null && workorderSearchObj.length > 0)
			    			{
				    			var woNumber 	= workorderSearchObj[0].getValue({name: "tranid"});
								var woDueDate	= workorderSearchObj[0].getValue({name: "enddate"});
								var woAmountDue	= Number(workorderSearchObj[0].getValue({name: "quantity"}));
								
								availData.supplySource 		= 'Works Order (' + woNumber + '), ' + 
															  woAmountDue.toString() + ' due ' + 
															  (woDueDate == null || woDueDate == '' ? '<not known>' : woDueDate);
								availData.availableDate		= (woDueDate == null || woDueDate == '' ? '<not known>' : woDueDate);
								availData.transactionFound	= true;
								availData.availableDateDate	= format.parse({value: woDueDate, type: format.Type.DATE});
			    			}
			    		else
			    			{
			    				//See if there is a purchase order for the assembly
			    				//
			    				availData = getPurchaseOrderInfo(_memberItem);
			    				
			    				//If no WO or PO is found, then we will return with the fact that a new WO must be created
								//
			    				if(!availData.transactionFound)
			    					{
			    						//Get the works order lead time (in days) from the item record
			    						//
			    						var woLeadTime = Number(search.lookupFields({
			    																type: 		search.Type.ITEM,
			    																id: 		_memberItem,
			    																columns: 	['buildtime']
			    															}).buildtime);
			    						
			    						woLeadTime = (isNaN(woLeadTime) ? Number(0) : woLeadTime);
			    						
			    						var availableDate = new Date();
			    						
			    						availableDate.setDate(availableDate.getDate() + woLeadTime);
			    					
				    					availData.supplySource 		= 'New Works Order';
			    						availData.availableDate 	= format.format({value: availableDate, type: format.Type.DATE});
			    						availData.transactionFound	= false;
			    						availData.availableDateDate	= availableDate;
			    					}
			    			}
			    		
			    		break;
			    		
			    	case 'InvtPart':	//Inventory Item
			    		
			    		//Find info about the item record (quantity on hand)
			    		//
			    		var itemSearchObj = getResults(search.create({
										    			   type: "item",
										    			   filters:
										    			   [
										    			      ["internalid","anyof",_memberItem]
										    			   ],
										    			   columns:
										    			   [
										    			      search.createColumn({
										    			         name: "locationquantityonhand",
										    			         summary: "SUM",
										    			         label: "Location On Hand"
										    			      })
										    			   ]
										    			}));
			    		
			    		if(itemSearchObj != null && itemSearchObj.length > 0)
			    			{
			    				//Get the available quantity
			    				//
			    				var stockQty = Number(itemSearchObj[0].getValue({name: "locationquantityonhand", summary: "SUM"}));
			    				
			    				//Do we have enough in stock?
			    				//
			    				if(stockQty >= _memberQty)
			    					{
			    						//Yes - return quantity available
			    						//
					    				availData.supplySource 		= 'Stock ' + itemSearchObj[0].getValue({name: "locationquantityonhand", summary: "SUM"}).toString();
					    				availData.availableDate		= 'Now';
					    				availData.transactionFound	= true;
					    				availData.availableDateDate	= new Date(new Date().toDateString());
			    					}
			    				else
			    					{
			    						//No - find a PO if we can
			    						//
			    						availData = getPurchaseOrderInfo(_memberItem);
			    						
			    						//If no PO is found, then we will return with the fact that a new PO must be created
										//
					    				if(!availData.transactionFound)
					    					{
					    						//Get the lead time (in days) from the item record
					    						//
					    						var itemLeadTime = getItemLeadTime(_memberItem);
					    						
					    						var availableDate = new Date();
					    						
					    						availableDate.setDate(availableDate.getDate() + itemLeadTime);
					    					
						    					availData.supplySource 		= 'New Purchase Order';
					    						availData.availableDate 	= format.format({value: availableDate, type: format.Type.DATE});
					    						availData.transactionFound	= false;
					    						availData.availableDateDate	= availableDate;
					    					}
			    					}
			    			}
			    			
			    		break;
	    	
	    		}
	    	
	    	return availData;
	    }
    
    function getItemLeadTime(_itemId)
    	{
	    	var itemLeadTime = Number(search.lookupFields({
															type: 		search.Type.ITEM,
															id: 		_itemId,
															columns: 	['leadtime']
														}).leadtime);
	
	    	itemLeadTime = (isNaN(itemLeadTime) ? Number(0) : itemLeadTime);

	    	return itemLeadTime;
    	}
    		
    //Function to find purchase orders for a particular item & return the info about the earliest one
    //
    function getPurchaseOrderInfo(_item)
    	{
    		var availData = new availabilityData('','');
		
    		var purchaseorderSearchObj = getResults(search.create({
				   type: "purchaseorder",
				   filters:
				   [
				      ["type","anyof","PurchOrd"], 
				      "AND", 
				      ["cogs","is","F"], 
				      "AND", 
				      ["taxline","is","F"], 
				      "AND", 
				      ["shipping","is","F"], 
				      "AND", 
				      ["status","anyof","PurchOrd:E","PurchOrd:B"], 
				      "AND", 
				      ["mainline","is","F"], 
				      "AND", 
				      ["formulanumeric: NVL({quantity},0) - NVL({quantityshiprecv},0)","greaterthan","0"], 
				      "AND", 
				      ["item","anyof",_item]
				   ],
				   columns:
				   [
				      search.createColumn({name: "duedate",sort: search.Sort.ASC,label: "Due Date/Receive By"}),
				      search.createColumn({name: "trandate",sort: search.Sort.ASC,label: "Date"}),
				      search.createColumn({name: "tranid", label: "Document Number"}),
				      search.createColumn({name: "entity", label: "Name"}),
				      search.createColumn({name: "item", label: "Item"}),
				      search.createColumn({name: "quantity", label: "Quantity"}),
				      search.createColumn({name: "quantityshiprecv", label: "Quantity Fulfilled/Received"}),
				      search.createColumn({name: "formulanumeric",formula: "NVL({quantity},0) - NVL({quantityshiprecv},0)",label: "Outstanding"})
				   ]
				}));
    		
    		if(purchaseorderSearchObj != null && purchaseorderSearchObj.length > 0)
				{ 
					//Get the PO details
					//
					var poNumber 	= purchaseorderSearchObj[0].getValue({name: "tranid"});
					var poDueDate	= purchaseorderSearchObj[0].getValue({name: "duedate"});
					var poAmountDue	= Number(purchaseorderSearchObj[0].getValue({name: "formulanumeric"}));
					
					//If the due date is not on the PO then use the lead time from the item record
					//
					if(poDueDate == null || poDueDate == '')
						{
							var itemLeadTime = getItemLeadTime(_item);
							var availableDate = new Date();
    						
    						availableDate.setDate(availableDate.getDate() + itemLeadTime);
    						
    						poDueDate = format.format({value: availableDate, type: format.Type.DATE});
						}
					
					availData.supplySource 		= 'Purchase Order (' + poNumber + '), ' + 
												  poAmountDue.toString() + ' due ' + 
												  (poDueDate == null || poDueDate == '' ? '<not known>' : poDueDate);
					availData.availableDate		= (poDueDate == null || poDueDate == '' ? '<not known>' : poDueDate);
					availData.transactionFound	= true;
					availData.availableDateDate	= format.parse({value: poDueDate, type: format.Type.DATE});
				}
			else
				{
					//If no PO is found, then we will return with the fact that a new PO must be created
					//
					availData.supplySource 		= 'New Purchase Order';
					availData.availableDate 	= '';
					availData.transactionFound	= false;
					availData.availableDateDate	= null;
				}
    		
    		return availData;
    	}
    
    
    
    //Function to search for all assembly items
    //
    function getAssemblies()
    	{
    		return getResults(search.create({
						    			   type: "assemblyitem",
						    			   filters:
						    			   [
						    			      ["type","anyof","Assembly"]
						    			   ],
						    			   columns:
						    			   [
						    			      search.createColumn({name: "internalid", label: "Internal ID"}),
						    			      search.createColumn({name: "itemid", sort: search.Sort.ASC,label: "Name"}),
						    			      search.createColumn({name: "displayname", label: "Display Name"}),
						    			      search.createColumn({name: "salesdescription", label: "Description"})
						    			   ]
						    			}));
    	}
    
    //Function to search for sales orders that are awaiting fulfilment
    //
    function getSalesOrders()
    	{
    		return getResults(search.create({
										   type: "salesorder",
										   filters:
										   [
										      ["type","anyof","SalesOrd"], 
										      "AND", 
										      ["mainline","is","T"], 
										      "AND", 
										      ["status","anyof","SalesOrd:D","SalesOrd:A","SalesOrd:E","SalesOrd:B"]
										   ],
										   columns:
										   [
										      search.createColumn({name: "internalid", label: "Internal ID"}),
										      search.createColumn({name: "tranid",sort: search.Sort.ASC,label: "Document Number"
										      }),
										      search.createColumn({name: "entity", label: "Name"})
										   ]
										}));
    	}
    
    //Function to search for works orders
    //
    function getWorksOrders()
    	{
    		return getResults(search.create({
						    			   type: "workorder",
						    			   filters:
						    			   [
						    			      ["type","anyof","WorkOrd"], 
						    			      "AND", 
						    			      ["mainline","is","T"], 
						    			      "AND", 
						    			      ["status","anyof","WorkOrd:D","WorkOrd:A","WorkOrd:B"]
						    			   ],
						    			   columns:
						    			   [
						    			      search.createColumn({name: "internalid", label: "Internal ID"}),
						    			      search.createColumn({name: "tranid",sort: search.Sort.ASC,label: "Document Number"}),
						    			      search.createColumn({name: "entity", label: "Name"})
						    			   ]
						    			}));
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

    function isNull(_string, _replacer)
    	{
    		return (_string == null ? _replacer : _string);
    	}
    
    return {onRequest: onRequest};
});

