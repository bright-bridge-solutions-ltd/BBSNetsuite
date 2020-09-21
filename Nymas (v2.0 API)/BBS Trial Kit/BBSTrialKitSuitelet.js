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

					stageParamField.updateDisplayType({
														displayType: 	serverWidget.FieldDisplayType.HIDDEN
														});
					
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
								
								//Add a field for the assembly items
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
													id:		'custpage_sl_items_unit',
													label:	'Unit',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_items_qty',
													label:	'Qty Required',
													type:	serverWidget.FieldType.FLOAT
												});		


					            
					            //Search based on type selected
					            //
								var assebliesToProcess = [];
								
					            switch(type)
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
					            		for (var int3 = 0; int3 < assebliesToProcess.length; int3++) 
						            		{
						            			level = Number(1);
												explodeBom(assebliesToProcess[int3].id, bomList, level, assebliesToProcess[int3].qty, true, assebliesToProcess[int3].id, assebliesToProcess[int3].qty);
											}
					            	
					            		//Fill out the bom components sublist on the suitelet form
					    				//
					    				var linenum = 1;
					    				var filler = '__';
					    				
					    				for (var int = 0; int < bomList.length; int++) 
						    				{ 	
						    					subList1.setLineItemValue('custpage_sl_items_level', linenum, filler.repeat(Number(bomList[int][0])) + Number(bomList[int][0]).toString());			
						    					subList1.setLineItemValue('custpage_sl_items_item', linenum, bomList[int][2]);
						    					subList1.setLineItemValue('custpage_sl_items_description', linenum, bomList[int][3]);
						    					subList1.setLineItemValue('custpage_sl_items_unit', linenum, bomList[int][4]);
						    					subList1.setLineItemValue('custpage_sl_items_type', linenum, bomList[int][6]);
						    					subList1.setLineItemValue('custpage_sl_items_qty', linenum, bomList[int][5]);
						    					
						    					/*
						    					 subList.setSublistValue({
																		id:		'custpage_sl_items_con_id',
																		line:	int,
																		value:	customrecord_bbs_contractSearchObj[int].id
																		});	
						    					 */
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
								var assemblyItem 			= request.parameters['custpage_entry_assembly']
								var salesOrder 				= request.parameters['custpage_entry_sales_order']
								var worksOrder 				= request.parameters['custpage_entry_works_order']
								var quantity 				= request.parameters['custpage_entry_quantity']
								var type 					= request.parameters['custpage_entry_select_type']
								
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
																			type:			type
																		}
														});
								
								break;

						}
		        }
	    }
    
    function assemblyItemData(_id, _qty)
    	{
    		this.id			= _id;
    		this.quantity	= _qty;
    	}
    
    function expolsionData(_level, _item, _itemText, _itemDesc, _itemUnit, _itemQty, _itemType, _itemSource)
    	{
    		this.level			= _level;
    		this.item			= _item;
    		this.itemText		= _itemText;
    		this.itemDesc		= _itemDesc;
    		this.itemUnit		= _itemUnit;
    		this.itemQty		= _itemQty;
    		this.itemType		= _itemType;
    		this.itemSource		= _itemSource;
    	}
    
    //Function to explode BOM
    //
    function explodeBom(topLevelAssemblyId, bomList, level, requiredQty, topLevel, itemId, itemQty)
	    {
	    	var assemblyRecord = nlapiLoadRecord('assemblyitem', topLevelAssemblyId);
	    	
	    	if(topLevel)
	    		{
	    			var topLevelDescription = assemblyRecord.getFieldValue('description');
	    			var topLevelItemId = assemblyRecord.getFieldValue('itemid');
	    		
	    			bomList.push(new expolsionData(0,itemId,topLevelItemId,topLevelDescription,'',itemQty,'Assembly',''));
	    		
	    		}
	    	
	    	var memberCount = assemblyRecord.getLineItemCount('member');
	    	
	    	for (var int = 1; int <= memberCount; int++) 
		    	{
		    		var memberItem = assemblyRecord.getLineItemValue('member', 'item', int);
		    		var memberItemText = assemblyRecord.getLineItemText('member', 'item', int);
		    		var memberDesc = assemblyRecord.getLineItemValue('member', 'memberdescr', int);
		    		var memberUnit = assemblyRecord.getLineItemValue('member', 'memberunit', int);
		    		var memberQty = Number(assemblyRecord.getLineItemValue('member', 'quantity', int)) * requiredQty;
		    		var memberType = assemblyRecord.getLineItemValue('member', 'sitemtype', int);
		    		var memberSource = assemblyRecord.getLineItemValue('member', 'itemsource', int);
		
		    		bomList.push(new expolsionData(level,memberItem,memberItemText,memberDesc,memberUnit,memberQty,memberType,memberSource));

		    		//If we have found another assembly, then explode that as well
		    		//
		    		if(memberType == 'Assembly')
		    			{
		    				explodeBom(memberItem, bomList, componentSummary, level + 1, requiredQty, false, null, null);
		    			}
		    	}
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

