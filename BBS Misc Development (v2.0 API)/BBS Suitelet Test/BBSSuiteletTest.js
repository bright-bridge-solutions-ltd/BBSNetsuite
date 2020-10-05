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
	    			var paramStage 				= Number(context.request.parameters['stage']);				//The stage the suitelet is in
	    			
					var stage 	= (paramStage == null || paramStage == '' || isNaN(paramStage) ? 1 : paramStage);
					
	    			//Create a form
	    			//
		            var form = serverWidget.createForm({
					                						title: 	'Test'
					            						});
		            
		            //Find the client script
	    			//
	    			var fileSearchObj = getResults(search.create({
		    			   type: 	"file",
		    			   filters:
		    			   [
		    			      ["name","is","BBSSuiteletTestClient.js"]
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
								
								
								//Allow the amendment of the bom level
								//
								var bomLevelField = form.addField({
												                id: 		'custpage_entry_bom_level',
												                type: 		serverWidget.FieldType.INTEGER,
												                label: 		'Select Line Number',
												                container:	'custpage_filters_group'
											            		});
								
								var dummyField = form.addField({
												                id: 		'custpage_entry_item',
												                type: 		serverWidget.FieldType.TEXT,
												                label: 		'Item Code',
												                container:	'custpage_filters_group'
											            		});
								
	
								
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
													id:		'custpage_sl_items_tick',
													label:	'Level',
													type:	serverWidget.FieldType.CHECKBOX
												});	
								
								subList.addField({
													id:		'custpage_sl_items_level',
													label:	'Line #',
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

								var qtyField = subList.addField({
													id:		'custpage_sl_items_qty',
													label:	'Qty Required',
													type:	serverWidget.FieldType.INTEGER
												});		
								
								qtyField.updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});

								subList.addField({
													id:		'custpage_sl_items_supply',
													label:	'Progress',
													type:	serverWidget.FieldType.TEXT
												});		

								var availDateField = subList.addField({
												id:		'custpage_sl_items_available',
												label:	'Available Date',
												type:	serverWidget.FieldType.TEXT
											});		

								availDateField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});

								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Finish'
										            });
					            
					            
					            
					    				for (var int = 0; int < 5; int++) 
						    				{ 	
					    						
						    					 subList.setSublistValue({
																		id:		'custpage_sl_items_level',
																		line:	int,
																		value:	int.toString()
																		});	
						    					 
						    					 
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_item',
																				line:	int,
																				value:	'item' + int.toString()
																				});	
						    						 
						    					 
						    					 
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_description',
																				line:	int,
																				value:	'desc'
																				});	
							    						 
						    					 
						    					 
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_type',
																				line:	int,
																				value:	'type'
																				});	
						    						 
						    					 
						    					 
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_source',
																				line:	int,
																				value:	'source'
																				});	
						    						 
						    					 
						    					 
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_qty',
																				line:	int,
																				value:	'0'
																				});	
						    						 
						    					 
						    					 
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_supply',
																				line:	int,
																				value:	'supply'
																				});	
						    						 
					    					 
		    					 
						    					 
							    						 subList.setSublistValue({
																				id:		'custpage_sl_items_available',
																				line:	int,
																				value:	'avail'
																				});	
						    						 
				    					 
	    					 
	    					
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

