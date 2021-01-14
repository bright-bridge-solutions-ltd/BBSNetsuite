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
	    			var paramPurchaseOrder 		= context.request.parameters['purchaseorder'];				//Selected purchase order
	    			var paramStage 				= Number(context.request.parameters['stage']);				//The stage the suitelet is in
	    			var paramQuantity 			= Number(context.request.parameters['quantity']);			//The assembly quantity
	    			var paramSelectType			= Number(context.request.parameters['type']);				//The selection type
	    			var paramMaxBomLevel		= Number(context.request.parameters['maxbomlevel']);		//Maximum bom explosion level
		    		
					var stage 	= (paramStage == null || paramStage == '' || isNaN(paramStage) ? 1 : paramStage);
					var bomList = {};
					var lineNo 	= Number(0);
					var level 	= Number(1);
					
	    			//Create a form
	    			//
		            var form = serverWidget.createForm({title: 	'Trial Kit'});
		            
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
																	value:			'1',
																	text:			'Assembly Item',
																	isSelected:		true
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

								selectTypeField.addSelectOption({
																	value:			'4',
																	text:			'Outsourced Purchase Order',
																	isSelected:		false
																	});	

								//Add a field for the assembly items
								//
								var assemblyItemField = form.addField({
													                id: 		'custpage_entry_assembly',
													                type: 		serverWidget.FieldType.SELECT,
													                label: 		'Assembly Item',
													                source:		record.Type.ASSEMBLY_ITEM,
													                container:	'custpage_filters_group'
												            		}).isMandatory;

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
													            		}).updateDisplayType({displayType : serverWidget.FieldDisplayType.NODISPLAY});
								
								
								//Add a field to filter by works orders
								//
								var worksOrderField = form.addField({
														                id: 		'custpage_entry_works_order',
														                type: 		serverWidget.FieldType.SELECT,
														                label: 		'Works Order',
														                container:	'custpage_filters_group'
													            		}).updateDisplayType({displayType : serverWidget.FieldDisplayType.NODISPLAY});

								//Add a field to filter by purchase orders
								//
								var purchaseOrderField = form.addField({
														                id: 		'custpage_entry_purchase_order',
														                type: 		serverWidget.FieldType.SELECT,
														                label: 		'Outsourced Purchase Order',
														                container:	'custpage_filters_group'
													            		}).updateDisplayType({displayType : serverWidget.FieldDisplayType.NODISPLAY});

								
								//Populate the select field - Sales Orders
								//
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
								
								
								//Populate the select field - Works Orders
								//
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
								
								
								//Populate the select field - Purchase Orders
								//
								var purchaseOrdersArray = getPurchaseOrders();
								
								purchaseOrderField.addSelectOption({
																value:			'',
																text:			'',
																isSelected:		false
																});	

								if(purchaseOrdersArray != null && purchaseOrdersArray.length > 0)
									{
										for (var int = 0; int < purchaseOrdersArray.length; int++) 
											{
												purchaseOrderField.addSelectOption({
																					value:			purchaseOrdersArray[int].getValue({name: "internalid"}),
																					text:			purchaseOrdersArray[int].getValue({name: "tranid"}),
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
								
								
								//Add a field to filter by purchase orders
								//
								var purchaseOrderField = form.addField({
														                id: 		'custpage_entry_purchase_order',
														                type: 		serverWidget.FieldType.TEXT,
														                label: 		'Works Order',
														                container:	'custpage_filters_group'
													            		});
								purchaseOrderField.defaultValue 	= paramPurchaseOrder;
								purchaseOrderField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

								
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
													id:		'custpage_sl_items_link',
													label:	'View',
													type:	serverWidget.FieldType.URL
													}).linkText = 'View';								
								
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

								var sourceField = subList.addField({
													id:		'custpage_sl_items_supply',
													label:	'Supply Source',
													type:	serverWidget.FieldType.TEXT
												});	
								
								//sourceField.updateDisplayType({displayType : serverWidget.FieldDisplayType.INLINE});
								
								subList.addField({
													id:		'custpage_sl_items_routing',
													label:	'Additional Routing (Days)',
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
							            	
							            case 4:		//purchase order
							            	
							            	var purchaseOrderItems = getResults(search.create({
							            		   type: "purchaseorder",
							            		   filters:
							            		   [
							            		      ["type","anyof","PurchOrd"], 
							            		      "AND", 
							            		      ["mainline","is","F"], 
							            		      "AND", 
							            		      ["cogs","is","F"], 
							            		      "AND", 
							            		      ["taxline","is","F"], 
							            		      "AND", 
							            		      ["shipping","is","F"], 
							            		      "AND", 
							            		      ["internalid","anyof",paramPurchaseOrder], 
							            		      "AND", 
							            		      ["assembly","noneof","@NONE@"]
							            		   ],
							            		   columns:
							            		   [
							            		      search.createColumn({name: "assembly", label: "Assembly"}),
							            		      search.createColumn({name: "quantity", label: "Quantity"})
							            		   ]
							            		}));
							            		
							            	if(purchaseOrderItems != null && purchaseOrderItems.length > 0)
							            		{
							            			for (var int2 = 0; int2 < purchaseOrderItems.length; int2++) 
								            			{
							            					assebliesToProcess.push(new assemblyItemData(purchaseOrderItems[int2].getValue({name: 'assembly'}), purchaseOrderItems[int2].getValue({name: 'quantity'})));
														}
							            		}
							            	
							            	break;
					            	}
					            
					            //See if we have any assemblies to process
					            //
					            if(assebliesToProcess.length > 0)
					            	{
					            		//Explode all of the BOM's
					            		//
					            		for (var int3 = 0; int3 < assebliesToProcess.length; int3++) 
						            		{
						            			level = Number(1);
						            			bomList[assebliesToProcess[int3].id] = new Array();

												explodeBom(assebliesToProcess[int3].id, bomList[assebliesToProcess[int3].id], level, assebliesToProcess[int3].quantity, true, assebliesToProcess[int3].id, assebliesToProcess[int3].quantity, paramMaxBomLevel);
											}
					            	
					            		//Roll up the latest date to the top so we can see when the whole assembly can be made
					            		//
					            		for ( var bomListKey in bomList) 
						            		{
						            			if(bomList[bomListKey].length > 0)
							            			{
						            					//Start off with today's date
						            					//
								            			var latestDate = new Date();
								            		
								            			//Loop through all of the data
								            			//
									            		for (var int = 1; int < bomList[bomListKey].length; int++) 
										    				{ 
									            				//Is the current date element more in the future that the date we currently have?
									            				//
									            				var tempObj = bomList[bomListKey][int];
									            			
										            			if(bomList[bomListKey][int].availDateDate != null && bomList[bomListKey][int].availDateDate.getTime() > latestDate.getTime())
										            				{
										            					latestDate = new Date(bomList[bomListKey][int].availDateDate.getFullYear(), bomList[bomListKey][int].availDateDate.getMonth(), bomList[bomListKey][int].availDateDate.getDate());
										            				}
										    				}
									            		
									            		//Add the routing days
									            		//
									            		var finalDate 				= new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate());
									            		finalDate.setDate(finalDate.getDate() + Number(bomList[bomListKey][0].routingDays));
									            		
									            		//Add the man hours to build
									            		//
									            		var manHours = Number(search.lookupFields({
									            											type:		search.Type.ITEM,
									            											id:			bomList[bomListKey][0].item,
									            											columns:	'custitem_bbs_hours_to_build'
									            											}).custitem_bbs_hours_to_build);
									            		
									            		var buildDays = Math.ceil(manHours / 8);
									            		finalDate.setDate(finalDate.getDate() + Number(buildDays));
									            		
									            		//Set the date in the output object that gets displayed in the sublist
									            		//
									            		bomList[bomListKey][0].availDateDate 	= finalDate
									            		bomList[bomListKey][0].availDate		= format.format({value: finalDate, type: format.Type.DATE});
							            			}
						            		}
					            		
					            		
					            		//Fill out the bom components sublist on the suitelet form
					    				//
					    				var linenum = 0;
					    				var filler = '…';
					    				
					    				for ( var bomListKey in bomList) 
						            		{
							    				for (var int = 0; int < bomList[bomListKey].length; int++) 
								    				{ 	
								    					 subList.setSublistValue({
																				id:		'custpage_sl_items_level',
																				line:	linenum,
																				value:	filler.repeat(Number(bomList[bomListKey][int].level)) + Number(bomList[bomListKey][int].level).toString()
																				});	
								    					 
								    					 if(bomList[bomListKey][int].itemText != '' && bomList[bomListKey][int].itemText != null)
								    						 {
									    						 subList.setSublistValue({
																						id:		'custpage_sl_items_item',
																						line:	linenum,
																						value:	bomList[bomListKey][int].itemText
																						});	
								    						 }
								    					 
								    					 if(bomList[bomListKey][int].itemUrl != '' && bomList[bomListKey][int].itemUrl != null)
								    						 {
									    						 subList.setSublistValue({
																						id:		'custpage_sl_items_link',
																						line:	linenum,
																						value:	bomList[bomListKey][int].itemUrl
																						});	
								    						 }
								    					 
								    					 if(bomList[bomListKey][int].itemDesc != '' && bomList[bomListKey][int].itemDesc != null)
								    						 {
									    						 subList.setSublistValue({
																						id:		'custpage_sl_items_description',
																						line:	linenum,
																						value:	bomList[bomListKey][int].itemDesc
																						});	
									    						 }
								    					 
								    					 if(bomList[bomListKey][int].itemType != '' && bomList[bomListKey][int].itemType != null)
								    						 {
									    						 subList.setSublistValue({
																						id:		'custpage_sl_items_type',
																						line:	linenum,
																						value:	bomList[bomListKey][int].itemType
																						});	
								    						 }
								    					 
								    					 if(bomList[bomListKey][int].itemSource != '' && bomList[bomListKey][int].itemSource != null)
								    						 {
									    						 subList.setSublistValue({
																						id:		'custpage_sl_items_source',
																						line:	linenum,
																						value:	bomList[bomListKey][int].itemSource
																						});	
								    						 }
								    					 
								    					 if(bomList[bomListKey][int].itemQty != '' && bomList[bomListKey][int].itemQty != null)
								    						 {
									    						 subList.setSublistValue({
																						id:		'custpage_sl_items_qty',
																						line:	linenum,
																						value:	bomList[bomListKey][int].itemQty.toString()
																						});	
								    						 }
								    					 
								    					 if(bomList[bomListKey][int].supplySource != '' && bomList[bomListKey][int].supplySource != null)
								    						 {
									    						 subList.setSublistValue({
																						id:		'custpage_sl_items_supply',
																						line:	linenum,
																						value:	bomList[bomListKey][int].supplySource
																						});	
								    						 }
							    					 
								    					 if(bomList[bomListKey][int].routingDays != '' && bomList[bomListKey][int].routingDays != null)
								    						 {
									    						 subList.setSublistValue({
																						id:		'custpage_sl_items_routing',
																						line:	linenum,
																						value:	bomList[bomListKey][int].routingDays
																						});	
								    						 }
								    					 
								    					 if(bomList[bomListKey][int].availDate != '' && bomList[bomListKey][int].availDate != null)
								    						 {
									    						 subList.setSublistValue({
																						id:		'custpage_sl_items_available',
																						line:	linenum,
																						value:	bomList[bomListKey][int].availDate
																						});	
								    						 }

								    					linenum++;
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
								var purchaseOrder			= request.parameters['custpage_entry_purchase_order'];
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
																			purchaseorder:	purchaseOrder,
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
								var purchaseOrder			= request.parameters['custpage_entry_purchase_order'];
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
																			purchaseorder:	purchaseOrder,
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
    
    function expolsionData(_level, _item, _itemText, _itemDesc, _itemUnit, _itemQty, _itemType, _itemSource, _supplySource, _availDate, _availDateDate, _routingDays, _itemUrl)
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
    		this.routingDays	= _routingDays;		//Days to add from routing information
    		this.itemUrl		= _itemUrl;			//Item url
    	}
    
    //Function to search for a bom from an assembly
    //
    function findBomFromAssembly(_assemblyId)
    	{
	    	return bomSearchObj = getResults(search.create({
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
    
    //Function to explode BOM
    //
    function explodeBom(topLevelAssemblyId, bomList, level, requiredQty, topLevel, itemId, itemQty, maxBomLevel)
	    {
    		var routingDaysToAdd = Number(0);
    		
    		//Find the bom for the assembly, then find the bom revision which will give us the components
    		//
    		var bomSearchObj = findBomFromAssembly(topLevelAssemblyId)
    		
    		if(bomSearchObj != null && bomSearchObj.length > 0)
    			{
	    			var bomId 				= bomSearchObj[0].getValue({name: "internalid"});
	    			var bomRevisionId 		= bomSearchObj[0].getValue({name: "internalid",join: "revision"});
	    			var assemblyName 		= bomSearchObj[0].getText({name: "assembly",join: "assemblyItem"});
	    			
	    			routingDaysToAdd 		= getRoutingDays(bomId);

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
			    			    		
			    			    			var assemblyUrl = url.resolveRecord({
																				isEditMode:		false,
																				recordId:		itemId,
																				recordType:		getItemRecordType('Assembly')
																				});
			    			    			
			    			    			bomList.push(new expolsionData(0,itemId,topLevelItemId,topLevelDescription,'',itemQty,'Assembly','','','', null, routingDaysToAdd,assemblyUrl));
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
			    				    		
			    				    		
			    				    		//If we have found another assembly, then explode that as well
			    				    		//
			    				    		if(memberType == 'Assembly' && level < maxBomLevel)
			    				    			{
				    				    			var bomSearchObj = findBomFromAssembly(memberItem)
				    				        		
				    				        		if(bomSearchObj != null && bomSearchObj.length > 0)
				    				        			{
				    				    	    			var bomId 			= bomSearchObj[0].getValue({name: "internalid"});
				    				    	    			routingDaysToAdd 	= getRoutingDays(bomId);
				    				        			}
				    				    			
				    				    			var memberUrl = url.resolveRecord({
																						isEditMode:		false,
																						recordId:		memberItem,
																						recordType:		getItemRecordType(memberType)
																						});
				    				    			
				    				    			//Add this item to the bom list
					    				    		//
					    				    		bomList.push(new expolsionData(level,memberItem,memberItemText,memberDesc,memberUnit,memberQty,memberType,memberSource, availabilityObj.supplySource, availabilityObj.availableDate, availabilityObj.availableDateDate, routingDaysToAdd, memberUrl));
						
			    				    				explodeBom(memberItem, bomList, level + 1, requiredQty, false, null, null, maxBomLevel);
			    				    			}
			    				    		else
			    				    			{
				    				    			var memberUrl = url.resolveRecord({
																						isEditMode:		false,
																						recordId:		memberItem,
																						recordType:		getItemRecordType(memberType)
																						});
			    				    			
				    				    			//Add this item to the bom list
					    				    		//
					    				    		bomList.push(new expolsionData(level,memberItem,memberItemText,memberDesc,memberUnit,memberQty,memberType,memberSource, availabilityObj.supplySource, availabilityObj.availableDate, availabilityObj.availableDateDate, Number(0), memberUrl));
			    				    			}
						            	}
			    				}
    					}
    			}
	    }
    
    function getItemRecordType(_itemType)
	    {
	    	var _itemRecordType = '';
	    	
	    	switch(_itemType)
	    	{
	    		case 'InvtPart':
	    			_itemRecordType = 'inventoryitem';
	    			break;
	    		
	    		case 'NonInvtPart':
	    			_itemRecordType = 'noninventoryitem';
	    			break;
	    		
	    		case 'Assembly':
	    			_itemRecordType = 'assemblyitem';
	    			break;
	    			
	    		case 'Kit':
	    			_itemRecordType = 'kititem';
	    			break;
	    			
	    		case 'Service':
	    			_itemRecordType = 'serviceitem';
	    			break;
	    			
	    		case 'Discount':
	    			_itemRecordType = 'discountitem';
	    			break;
	    		
	    		case 'Group':
	    			_itemRecordType = 'itemgroup';
	    			break;
	    		
	    		case 'OthCharge':
	    			_itemRecordType = 'otherchargeitem';
	    			break;
	    			
	    		default:
	    			_itemRecordType = _itemType;
	    			break;
	    	}
	
	    	return _itemRecordType;
	    }
    
    function getRoutingDays(_bomId)
    	{
    		var routingDays = Number(0);
    		
	    	//Find any routing info for this bom
			//
			var manufacturingroutingSearchObj = getResults(search.create({
													    				   type: "manufacturingrouting",
													    				   filters:
													    				   [
													    				      ["billofmaterials","anyof",_bomId]
													    				   ],
													    				   columns:
													    				   [
													    				      search.createColumn({name: "name",summary: "GROUP",label: "Name"}),
													    				      search.createColumn({name: "runrate", summary: "SUM",label: "Run Rate"}),
													    				      search.createColumn({name: "workcalendar",join: "manufacturingWorkCenter",summary: "GROUP",label: "Work Calendar"})
													    				   ]
													    				}));
			
			if(manufacturingroutingSearchObj != null && manufacturingroutingSearchObj.length > 0)
				{
					//Get the total routing time & the work calendar 
					//
					var totalRoutingTime 	= Number(manufacturingroutingSearchObj[0].getValue({name: "runrate", summary: "SUM"}));
					var workCalendarId 		= manufacturingroutingSearchObj[0].getValue({name: "workcalendar", join: "manufacturingWorkCenter", summary: "GROUP"});
					
					if(workCalendarId != null && workCalendarId != '')
						{
							var workcalendarSearchObj = getResults(search.create({
											    							   type: "workcalendar",
											    							   filters:
											    							   [
											    							      ["internalid","anyof",workCalendarId]
											    							   ],
											    							   columns:
											    							   [
											    							      search.createColumn({name: "name", label: "Name"}),
											    							      search.createColumn({name: "comments", label: "Comments"}),
											    							      search.createColumn({name: "workhoursperday", label: "Work Hours Per Day"}),
											    							      search.createColumn({name: "sunday", label: "Sunday"}),
											    							      search.createColumn({name: "monday", label: "Monday"}),
											    							      search.createColumn({name: "tuesday", label: "Tuesday"}),
											    							      search.createColumn({name: "wednesday", label: "Wednesday"}),
											    							      search.createColumn({name: "thursday", label: "Thursday"}),
											    							      search.createColumn({name: "friday", label: "Friday"}),
											    							      search.createColumn({name: "saturday", label: "Saturday"})
											    							   ]
											    							}));
							
							if(workcalendarSearchObj && workcalendarSearchObj.length > 0)
								{
									var workHours 	= Number(workcalendarSearchObj[0].getValue({name: "workhoursperday"}));
									routingDays = Math.ceil(((totalRoutingTime / 60) / workHours));
								}
						}
				}
			
			return routingDays;
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
			    		availData.availableDate		= '';
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
			    			      search.createColumn({name: "startdate", label: "Start Date"}),
			    			      search.createColumn({name: "enddate", label: "End Date"}),
			    			      search.createColumn({name: "quantity", label: "Quantity"}),
			    			      search.createColumn({name: "internalid", label: "Internal Id"})
			    			   ]
			    			}));
			    			
			    		if(workorderSearchObj != null && workorderSearchObj.length > 0)
			    			{
			    				availData.supplySource 	= '';
			    				availData.availableDate	= '';
			    				
			    				for(var woCount = 0; woCount < workorderSearchObj.length; woCount++)
			    					{
			    						var woId	 	= workorderSearchObj[woCount].getValue({name: "internalid"});
			    						var woNumber 	= workorderSearchObj[woCount].getValue({name: "tranid"});
					    				var woDueDate	= workorderSearchObj[woCount].getValue({name: "enddate"});
						    			var woStartDate	= workorderSearchObj[woCount].getValue({name: "startdate"});
										var woAmountDue	= Number(workorderSearchObj[woCount].getValue({name: "quantity"}));
										
										var woUrl = url.resolveRecord({
																		isEditMode:		false,
																		recordId:		woId,
																		recordType:		record.Type.WORK_ORDER
																		});
										
								//		var tempString = '<a href="' + woUrl + '">' + woNumber + '</a> (' +
								//						  woAmountDue.toString() + ') : ' + 
								//						  ' start ' + 
								//						  (woStartDate == null || woStartDate == '' ? '<n/a>' : woStartDate) +
								//						  ' end ' + 
								//						  (woDueDate == null || woDueDate == '' ? '<n/a>' : woDueDate) + '\n';
										
										var tempString =  woNumber + ' (' +
														  woAmountDue.toString() + ') : ' + 
														  ' start ' + 
														  (woStartDate == null || woStartDate == '' ? '<n/a>' : woStartDate) +
														  ' end ' + 
														  (woDueDate == null || woDueDate == '' ? '<n/a>' : woDueDate) + '\n';
						
										if(availData.supplySource.length + tempString.length <= 300)
											{
												availData.supplySource 		+= tempString;
											}
										
										if(woCount == 0)
											{
												availData.transactionFound	= true;
												availData.availableDate		= (woDueDate == null || woDueDate == '' ? '<n/a>' : woDueDate) + '\n';
												availData.availableDateDate	= (woDueDate == null || woDueDate == '' ? null : format.parse({value: woDueDate, type: format.Type.DATE}));
											}
			    					}
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
			    						var availableDate = new Date();
			    						
					    				availData.supplySource 		= 'Stock (' + itemSearchObj[0].getValue({name: "locationquantityonhand", summary: "SUM"}).toString() + ')';
					    				availData.availableDate		= format.format({value: availableDate, type: format.Type.DATE});	//'Now';
					    				availData.transactionFound	= true;
					    				availData.availableDateDate	= availableDate;
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
				      search.createColumn({name: "internalid", label: "Internal Id"}),
				      search.createColumn({name: "item", label: "Item"}),
				      search.createColumn({name: "quantity", label: "Quantity"}),
				      search.createColumn({name: "quantityshiprecv", label: "Quantity Fulfilled/Received"}),
				      search.createColumn({name: "formulanumeric",formula: "NVL({quantity},0) - NVL({quantityshiprecv},0)",label: "Outstanding"})
				   ]
				}));
    		
    		if(purchaseorderSearchObj != null && purchaseorderSearchObj.length > 0)
				{ 
	    			for(var poCount = 0; poCount < purchaseorderSearchObj.length; poCount++)
						{
							//Get the PO details
							//
		    				var poId	 	= purchaseorderSearchObj[poCount].getValue({name: "internalid"});
		    				var poNumber 	= purchaseorderSearchObj[poCount].getValue({name: "tranid"});
							var poDueDate	= purchaseorderSearchObj[poCount].getValue({name: "duedate"});
							var poAmountDue	= Number(purchaseorderSearchObj[poCount].getValue({name: "formulanumeric"}));
							
							//If the due date is not on the PO then use the lead time from the item record
							//
							if(poDueDate == null || poDueDate == '')
								{
									var itemLeadTime = getItemLeadTime(_item);
									var availableDate = new Date();
		    						
		    						availableDate.setDate(availableDate.getDate() + itemLeadTime);
		    						
		    						poDueDate = format.format({value: availableDate, type: format.Type.DATE});
								}
							
							var poUrl = url.resolveRecord({
															isEditMode:		false,
															recordId:		poId,
															recordType:		record.Type.PRCHASE_ORDER
															});

							var tempString = 	poNumber + ' (' + 
											  	poAmountDue.toString() + ') : due ' + 
											  	(poDueDate == null || poDueDate == '' ? '<n/a>' : poDueDate) + '\n';
											  
							if(availData.supplySource.length + tempString.length <= 300)
								{
									availData.supplySource 		+= tempString
								}
							
							if(poCount == 0)
								{
									availData.transactionFound	= true;
									availData.availableDate		= (poDueDate == null || poDueDate == '' ? '<n/a>' : poDueDate) + '\n';
									availData.availableDateDate	= (poDueDate == null || poDueDate == '' ? null : format.parse({value: poDueDate, type: format.Type.DATE}));
								}
						}
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
    
    //Function to search for outsourced purchase orders
    //
    function getPurchaseOrders()
    	{
    		return getResults(search.create({
						    			   type: "purchaseorder",
						    			   filters:
						    			   [
						    			      ["type","anyof","PurchOrd"], 
						    			      "AND", 
						    			      ["status","anyof","PurchOrd:P","PurchOrd:B","PurchOrd:E","PurchOrd:D"], 
						    			      "AND", 
						    			      ["mainline","is","T"], 
						    			      "AND", 
						    			      ["customform","anyof","111"]
						    			   ],
						    			   columns:
						    			   [
						    			      search.createColumn({name: "internalid", label: "Internal ID"}),
						    			      search.createColumn({name: "tranid", label: "Document Number"}),
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

