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
	    			var paramSubsidiary			= context.request.parameters['subsidiary'];			//The subsidiary
	    			var paramLocation			= context.request.parameters['location'];			//The location
	    			var paramSalesChannel		= context.request.parameters['channel'];			//The sales channel
	    			var paramItem				= context.request.parameters['item'];				//The item
	    			
	    			var paramSubsidiaryText		= context.request.parameters['subsidiarytext'];			//The subsidiary
	    			var paramLocationText		= context.request.parameters['locationtext'];			//The location
	    			var paramSalesChannelText	= context.request.parameters['channeltext'];			//The sales channel
	    			var paramItemText			= context.request.parameters['itemtext'];				//The item
	    			
					var stage 					= (paramStage == null || paramStage == '' || isNaN(paramStage) ? 1 : paramStage);
					
					//Create a form
	    			//
		            var form = serverWidget.createForm({title: 	'Delete Order Reservations'});
		            
		            //Find the client script
	    			//
	    			var fileSearchObj = getResults(search.create({
												    			   type: 	"file",
												    			   filters:
															    			   [
															    			      ["name","is","C4COrderReservationDeleteCL.js"]
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
					
					var subsidiaryParamField = form.addField({
											                id: 		'custpage_param_subsidiary',
											                type: 		serverWidget.FieldType.TEXT,
											                label: 		'Subsidiary',
											                container:	'custpage_hidden_group'
										            		});
					subsidiaryParamField.defaultValue 	= paramSubsidiary;
					subsidiaryParamField.updateDisplayType({displayType: parameterFieldsDisplayMode});
					
					var locationParamField = form.addField({
											                id: 		'custpage_param_location',
											                type: 		serverWidget.FieldType.TEXT,
											                label: 		'Location',
											                container:	'custpage_hidden_group'
										            		});
					locationParamField.defaultValue 	= paramLocation;
					locationParamField.updateDisplayType({displayType: parameterFieldsDisplayMode});
					
					var channelParamField = form.addField({
											                id: 		'custpage_param_channel',
											                type: 		serverWidget.FieldType.TEXT,
											                label: 		'Sales Channel',
											                container:	'custpage_hidden_group'
										            		});
					channelParamField.defaultValue 	= paramSalesChannel;
					channelParamField.updateDisplayType({displayType: parameterFieldsDisplayMode});
					
					var itemParamField = form.addField({
											                id: 		'custpage_param_item',
											                type: 		serverWidget.FieldType.TEXT,
											                label: 		'Item',
											                container:	'custpage_hidden_group'
										            		});
					itemParamField.defaultValue 	= paramItem;
					itemParamField.updateDisplayType({displayType: parameterFieldsDisplayMode});

					var subsidiaryParamField = form.addField({
											                id: 		'custpage_param_subsidiary_text',
											                type: 		serverWidget.FieldType.TEXT,
											                label: 		'Subsidiary',
											                container:	'custpage_hidden_group'
										            		});
					subsidiaryParamField.defaultValue 	= paramSubsidiaryText;
					subsidiaryParamField.updateDisplayType({displayType: parameterFieldsDisplayMode});
					
					var locationParamField = form.addField({
											                id: 		'custpage_param_location_text',
											                type: 		serverWidget.FieldType.TEXT,
											                label: 		'Location',
											                container:	'custpage_hidden_group'
										            		});
					locationParamField.defaultValue 	= paramLocationText;
					locationParamField.updateDisplayType({displayType: parameterFieldsDisplayMode});
					
					var channelParamField = form.addField({
											                id: 		'custpage_param_channel_text',
											                type: 		serverWidget.FieldType.TEXT,
											                label: 		'Sales Channel',
											                container:	'custpage_hidden_group'
										            		});
					channelParamField.defaultValue 	= paramSalesChannelText;
					channelParamField.updateDisplayType({displayType: parameterFieldsDisplayMode});
					
					var itemParamField = form.addField({
											                id: 		'custpage_param_item_text',
											                type: 		serverWidget.FieldType.TEXT,
											                label: 		'Item',
											                container:	'custpage_hidden_group'
										            		});
					itemParamField.defaultValue 	= paramItemText;
					itemParamField.updateDisplayType({displayType: parameterFieldsDisplayMode});


					
					//Work out what the form layout should look like based on the stage number
					//
					switch(stage)
						{
							case 1:	
								
								//Find all order reservation records
								//
								var subsidiariesObj = {};
								var locationsObj 	= {};
								var channelsObj 	= {};
								var itemsObj 		= {};
								
								var orderreservationSearchObj = getResults(search.create({
																					   type: "orderreservation",
																					   filters:
																					   [
																					      ["type","anyof","OrdResv"], 
																					      "AND", 
																					      ["mainline","is","F"]
																					   ],
																					   columns:
																					   [
																					      search.createColumn({name: "type", label: "Type"}),
																					      search.createColumn({name: "tranid", label: "Document Number"}),
																					      search.createColumn({name: "entity", label: "Name"}),
																					      search.createColumn({name: "amount", label: "Amount"}),
																					      search.createColumn({name: "saleschannel", label: "Sales Channel"}),
																					      search.createColumn({name: "orderpriority", label: "Order Priority"}),
																					      search.createColumn({name: "item", label: "Item"}),
																					      search.createColumn({name: "location", label: "Location"}),
																					      search.createColumn({name: "subsidiary", label: "Subsidiary"}),
																					      search.createColumn({name: "quantity", label: "Quantity"}),
																					      search.createColumn({name: "startdate", label: "Start Date"}),
																					      search.createColumn({name: "enddate", label: "End Date"}),
																					      search.createColumn({name: "orderallocationstrategy", label: "Order Allocation Strategy"}),
																					      search.createColumn({name: "trandate", label: "Date"})
																					   ]
																					}));
								
								//Summarise all available subsidiaries, locations, sales channels & items
								//
								if(orderreservationSearchObj != null && orderreservationSearchObj.length > 0)
									{
										for (var searchLines = 0; searchLines < orderreservationSearchObj.length; searchLines++) 
											{
												var subsidiaryId 		= orderreservationSearchObj[searchLines].getValue({name: "subsidiary"});
												var subsidiaryName 		= orderreservationSearchObj[searchLines].getText({name: "subsidiary"});
												var locationId 			= orderreservationSearchObj[searchLines].getValue({name: "location"});
												var locationName 		= orderreservationSearchObj[searchLines].getText({name: "location"});
												var channelId 			= orderreservationSearchObj[searchLines].getValue({name: "saleschannel"});
												var channelName 		= orderreservationSearchObj[searchLines].getText({name: "saleschannel"});
												var itemId 				= orderreservationSearchObj[searchLines].getValue({name: "item"});
												var itemName 			= orderreservationSearchObj[searchLines].getText({name: "item"});
												
												subsidiariesObj[subsidiaryId] 	= subsidiaryName;
												locationsObj[locationId]		= locationName;
												channelsObj[channelId]			= channelName;
												itemsObj[itemId]				= itemName;
											}
									}
								
								
								//Add a field group for the selection
								//
								var filtersGroup = form.addFieldGroup({
																		id:		'custpage_selection_group',
																		label:	'Filters'
																		});
								
								//Add a field for the picking carton number / if number / so number
								//
								var selectSubsidField = form.addField({
													                id: 		'custpage_entry_subsidiary',
													                type: 		serverWidget.FieldType.SELECT,
													                label: 		'Subsidiary',
													                container:	'custpage_selection_group'
												            		});
								
								var selectLocationField = form.addField({
													                id: 		'custpage_entry_location',
													                type: 		serverWidget.FieldType.SELECT,
													                label: 		'Location',
													                container:	'custpage_selection_group'
												            		});

								var selectChannelField = form.addField({
													                id: 		'custpage_entry_channel',
													                type: 		serverWidget.FieldType.SELECT,
													                label: 		'Sales Channel',
													                container:	'custpage_selection_group'
												            		});

								var selectItemField = form.addField({
													                id: 		'custpage_entry_item',
													                type: 		serverWidget.FieldType.SELECT,
													                label: 		'Item',
													                container:	'custpage_selection_group'
												            		});

								
								//Update the select fields with available options
								//
								selectSubsidField.addSelectOption({value: '', text: '', isSelected: true});
								for (var subsidsKey in subsidiariesObj) 
									{
										selectSubsidField.addSelectOption({value: subsidsKey, text: subsidiariesObj[subsidsKey]});
									}
								
								selectLocationField.addSelectOption({value: '', text: '', isSelected: true});
								for (var locationKey in locationsObj) 
									{
										selectLocationField.addSelectOption({value: locationKey, text: locationsObj[locationKey]});
									}
							
								selectChannelField.addSelectOption({value: '', text: '', isSelected: true});
								for (var channelKey in channelsObj) 
									{
										selectChannelField.addSelectOption({value: channelKey, text: channelsObj[channelKey]});
									}
							
								selectItemField.addSelectOption({value: '', text: '', isSelected: true});
								for (var itemKey in itemsObj) 
									{
										selectItemField.addSelectOption({value: itemKey, text: itemsObj[itemKey]});
									}
								
								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Continue'
										            });
					            
								break;
								
							case 2:

								//Add a field group for the filters
								//
								var filtersGroup = form.addFieldGroup({
																		id:		'custpage_processing_group',
																		label:	'Filters'
																		});
								
								//Add a field to display the customer info
								//
								var subsidiaryDisplayField = form.addField({
														                id: 		'custpage_display_subsidiary',
														                type: 		serverWidget.FieldType.TEXT,
														                label: 		'Subsidiary',
														                container:	'custpage_processing_group'
													            		});
								subsidiaryDisplayField.defaultValue 	= paramSubsidiaryText;
								subsidiaryDisplayField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								
								var locationDisplayField = form.addField({
													                id: 		'custpage_display_location',
													                type: 		serverWidget.FieldType.TEXT,
													                label: 		'Location',
													                container:	'custpage_processing_group'
												            		});
								locationDisplayField.defaultValue 	= paramLocationText;
								locationDisplayField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								
								var channelDisplayField = form.addField({
													                id: 		'custpage_display_channel',
													                type: 		serverWidget.FieldType.TEXT,
													                label: 		'Sales Channel',
													                container:	'custpage_processing_group'
												            		});
								channelDisplayField.defaultValue 	= paramSalesChannelText;
								channelDisplayField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								
								var itemDisplayField = form.addField({
													                id: 		'custpage_display_item',
													                type: 		serverWidget.FieldType.TEXT,
													                label: 		'Item',
													                container:	'custpage_processing_group'
												            		});
								itemDisplayField.defaultValue 	= paramItemText;
								itemDisplayField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								
								//Add a subtab
								//
								var tab = form.addTab({
														id:		'custpage_tab_items',
														label:	'Order Reservations'
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
																label:	'Order Reservations',
																tab:	'custpage_tab_items'
															});
								
								//Add columns to sublist
								//
								subList.addField({
													id:		'custpage_line_ticked',
													label:	'Select',
													type:	serverWidget.FieldType.CHECKBOX
												});		

								subList.addField({
													id:		'custpage_line_id',
													label:	'Internal Id',
													type:	serverWidget.FieldType.TEXT
												});		
								
								subList.addField({
													id:		'custpage_line_subsidiary',
													label:	'Subsidiary',
													type:	serverWidget.FieldType.TEXT
												});		
				
								subList.addField({
													id:		'custpage_line_location',
													label:	'Location',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_line_channel',
													label:	'Sales Channel',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_line_item',
													label:	'Item',
													type:	serverWidget.FieldType.TEXT
												});	

								subList.addField({
													id:		'custpage_line_quantity',
													label:	'Quantity',
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_line_trandate',
													label:	'Transaction Date',
													type:	serverWidget.FieldType.TEXT
												});	
								
								subList.addField({
													id:		'custpage_line_start',
													label:	'Start Date',
													type:	serverWidget.FieldType.TEXT
												});	
				
								subList.addField({
													id:		'custpage_line_end',
													label:	'End Date',
													type:	serverWidget.FieldType.TEXT
												});	
				
								

								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Delete Selected Records'
										            });
					            
					            //Add a mark all
					            //
					            subList.addMarkAllButtons();
					            
					            //Find data for the sublist
					            //
					            var filtersArray	= [
													      ["type","anyof","OrdResv"], 
													      "AND", 
													      ["mainline","is","F"]
													   ];
					            
					            if(paramSubsidiary != null && paramSubsidiary != '')
					            	{
					            		filtersArray.push("AND");
					            		filtersArray.push(["subsidiary", "anyof", paramSubsidiary]);
					            	}
					            
					            if(paramLocation != null && paramLocation != '')
					            	{
					            		filtersArray.push("AND");
					            		filtersArray.push(["location", "anyof", paramLocation]);
					            	}
					            
					            if(paramSalesChannel != null && paramSalesChannel != '')
					            	{
					            		filtersArray.push("AND");
					            		filtersArray.push(["saleschannel", "anyof", paramSalesChannel]);
					            	}
					            
					            if(paramItem != null && paramItem != '')
					            	{
					            		filtersArray.push("AND");
					            		filtersArray.push(["item", "anyof", paramItem]);
					            	}
					            
					            var orderreservationSearchObj = getResults(search.create({
									   type: 	"orderreservation",
									   filters:	filtersArray,
									   columns:
									   [
									      search.createColumn({name: "internalid", label: "Internal Id"}),
									      search.createColumn({name: "tranid", label: "Document Number"}),
									      search.createColumn({name: "entity", label: "Name"}),
									      search.createColumn({name: "amount", label: "Amount"}),
									      search.createColumn({name: "saleschannel", label: "Sales Channel"}),
									      search.createColumn({name: "orderpriority", label: "Order Priority"}),
									      search.createColumn({name: "item", label: "Item"}),
									      search.createColumn({name: "location", label: "Location"}),
									      search.createColumn({name: "subsidiary", label: "Subsidiary"}),
									      search.createColumn({name: "quantity", label: "Quantity"}),
									      search.createColumn({name: "startdate", label: "Start Date"}),
									      search.createColumn({name: "enddate", label: "End Date"}),
									      search.createColumn({name: "orderallocationstrategy", label: "Order Allocation Strategy"}),
									      search.createColumn({name: "trandate", label: "Date"})
									   ]
									}));

								//Summarise all available subsidiaries, locations, sales channels & items
								//
								if(orderreservationSearchObj != null && orderreservationSearchObj.length > 0)
									{
										for (var searchLines = 0; searchLines < orderreservationSearchObj.length; searchLines++) 
											{
					            
					                     		subList.setSublistValue({
																		id:		'custpage_line_id',
																		line:	searchLines,
																		value:	orderreservationSearchObj[searchLines].getValue({name: "internalid"})
																		});	
										            	
					                     		subList.setSublistValue({
																		id:		'custpage_line_subsidiary',
																		line:	searchLines,
																		value:	orderreservationSearchObj[searchLines].getText({name: "subsidiary"})
																		});	

					                     		subList.setSublistValue({
																		id:		'custpage_line_location',
																		line:	searchLines,
																		value:	orderreservationSearchObj[searchLines].getText({name: "location"})
																		});	
					                     		
					                     		subList.setSublistValue({
																		id:		'custpage_line_channel',
																		line:	searchLines,
																		value:	orderreservationSearchObj[searchLines].getText({name: "saleschannel"})
																		});	
					                     		
					                     		subList.setSublistValue({
																		id:		'custpage_line_item',
																		line:	searchLines,
																		value:	orderreservationSearchObj[searchLines].getText({name: "item"})
																		});	
					                     		
					                     		subList.setSublistValue({
																		id:		'custpage_line_quantity',
																		line:	searchLines,
																		value:	orderreservationSearchObj[searchLines].getValue({name: "quantity"})
																		});	
					                     		
					                     		subList.setSublistValue({
																		id:		'custpage_line_trandate',
																		line:	searchLines,
																		value:	orderreservationSearchObj[searchLines].getValue({name: "trandate"})
																		});	
					                     		
					                     		subList.setSublistValue({
																		id:		'custpage_line_start',
																		line:	searchLines,
																		value:	orderreservationSearchObj[searchLines].getValue({name: "startdate"})
																		});	
					                     		
					                     		subList.setSublistValue({
																		id:		'custpage_line_end',
																		line:	searchLines,
																		value:	orderreservationSearchObj[searchLines].getValue({name: "enddate"})
																		});	
											}
									}

					            
								break;
							
							case 3:
								
								var infoField = form.addField({
													                id: 		'custpage_info_message',
													                type: 		serverWidget.FieldType.INLINEHTML,
													                label: 		'Information'
												            		});
								
								//infoField.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});
								//infoField.updateDisplaySize({height: 10, width: 100});
								
								var userEmail = runtime.getCurrentUser().email;
								infoField.defaultValue = '<p style="font-size: 12pt;">An email will be sent to <b>' + userEmail + '</b> with the results of the deletion process</p>';
								
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
		    		
					//Process based on stage
					//
					switch(stage)
						{
							case 1:
								
								//Get user entered parameters
								//
								var paramSubsidiary = request.parameters['custpage_param_subsidiary'];
								var paramLocation 	= request.parameters['custpage_param_location'];
								var paramChannel 	= request.parameters['custpage_param_channel'];
								var paramItem 		= request.parameters['custpage_param_item'];
								
								var paramSubsidiaryText = request.parameters['custpage_param_subsidiary_text'];
								var paramLocationText 	= request.parameters['custpage_param_location_text'];
								var paramChannelText 	= request.parameters['custpage_param_channel_text'];
								var paramItemText 		= request.parameters['custpage_param_item_text'];
								
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
																				subsidiary:		paramSubsidiary,			
																				location:		paramLocation,			
																				channel:		paramChannel,		
																				item:			paramItem,
																				subsidiarytext:	paramSubsidiaryText,			
																				locationtext:	paramLocationText,			
																				channeltext:	paramChannelText,		
																				itemtext:		paramItemText
																			}
															});
								
								break;
								
							case 2:
								
								var orderIds = [];
								
								//Loop through all of the lines in the sublist
								//
								var sublistLineCount = request.getLineCount({group: 'custpage_sublist_items'});
										
								for (var int = 0; int < sublistLineCount; int++) 
									{
										var itemLineTicked = request.getSublistValue({
																    			    group: 	'custpage_sublist_items',
																    			    name: 	'custpage_line_ticked',
																		    		line: 	int
																	    			});
								    			
								    	var itemLineId = Number(request.getSublistValue({
								    												group: 	'custpage_sublist_items',
																		    		name: 	'custpage_line_id',
																		    		line: 	int
																	    			}));
								    	
								    	if(itemLineTicked == 'T')
								    		{
								    			//Build up the list of orders to delete
								    			//
								    			orderIds.push(itemLineId);
								    		}   			
									}
								
							
								//Submit the MR script to process the deletions
								//
								var userEmail 	= runtime.getCurrentUser().email;
								var userId 		= runtime.getCurrentUser().id;
								
								try
									{
										var mrTask = task.create({
																taskType:		task.TaskType.MAP_REDUCE,
																scriptId:		'customscript_c4c_order_reservation_mr',	
																deploymentid:	null,
																params:			{
																				custscript_c4c_order_res_email_rec:	userEmail,
																				custscript_c4c_order_res_email_snd:	userId,
																				custscript_c4c_order_res_orders:	JSON.stringify(orderIds)
																				}
																});
										
										mrTask.submit();
									}
								catch(err)
									{
										log.error({
													title: 		'Error submitting mr delete script',
													details: 	err
													});	
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
																			stage: 			stage
																		}
														});
								
								
								break;
						}
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
    
    return {onRequest: onRequest};
});

