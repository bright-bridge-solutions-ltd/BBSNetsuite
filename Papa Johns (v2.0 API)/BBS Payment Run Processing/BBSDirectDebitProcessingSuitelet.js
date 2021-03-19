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

	    		  
		    		//=============================================================================================
			    	//Main Code
			    	//=============================================================================================
			    	//
		    		var parameterFieldsDisplayMode = serverWidget.FieldDisplayType.HIDDEN;
					
					if(runtime.getCurrentScript().logLevel == 'DEBUG')
							{
								parameterFieldsDisplayMode = serverWidget.FieldDisplayType.NORMAL;
							}
	    		
					var today 					= new Date();
					var defaultCollectionDate 	= new Date();
					defaultCollectionDate.setDate(today.getDate() + 16);
					
		    		//Get parameters
					//
	    			var paramStage 				= Number(context.request.parameters['stage']);		//The stage the suitelet is in
	    			var paramClass				= context.request.parameters['class'];				
	    			var paramClassName			= context.request.parameters['classname'];			
	    			var paramEpos				= context.request.parameters['epos'];		
	    			var paramCustomer			= context.request.parameters['customer'];				
	    			var paramCustomerName		= context.request.parameters['customername'];				
	    			var paramAsOfDate			= context.request.parameters['asofdate'];				
	    			var paramCollectionDate		= context.request.parameters['collectiondate'];				
	    			var paramFranchisee			= context.request.parameters['franchisee'];				
	    			var paramFranchiseeName		= context.request.parameters['franchiseename'];				
	    			var paramCollectionQty		= context.request.parameters['collectionqty'];				
	    			
	    			paramStage 					= (paramStage == null || paramStage == '' || isNaN(paramStage) ? 1 : paramStage);
	    			paramCollectionDate			= (paramCollectionDate == null || paramCollectionDate == '' ? format.format({value: defaultCollectionDate, type: format.Type.DATE}) : paramCollectionDate);
	    			paramCollectionQty			= (paramCollectionQty == null || paramCollectionQty == '' ? 1 : paramCollectionQty);
	    			
					//Create a form
	    			//
		            var form = serverWidget.createForm({title: 	'Direct Debit Processing'});
		            
		            //Find the client script
	    			//
	    			var fileSearchObj = getResults(search.create({
												    			   type: 	"file",
												    			   filters:
															    			   [
															    			      ["name","is","BBSDirectDebitProcessingClient.js"]
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
		    		
	    			//Add a field group for the parameter fields
					//
					var filtersGroup = form.addFieldGroup({
															id:		'custpage_parameter_group',
															label:	'Hidden'
															});
					
					//Add fields for the parameters
					//
					createField(form, 'custpage_param_stage', 		'Stage', 			parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramStage);					//Stage
					createField(form, 'custpage_param_class', 		'Class', 			parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramClass);					//Class
					createField(form, 'custpage_param_classname', 	'Class Name',		parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramClassName);				//Class name
					createField(form, 'custpage_param_epos', 		'EPOS',  			parameterFieldsDisplayMode,	serverWidget.FieldType.CHECKBOX,'custpage_parameter_group', paramEpos);						//EPOS
					createField(form, 'custpage_param_customer', 	'Customer', 		parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramCustomer);					//Customer
					createField(form, 'custpage_param_customername','Customer Name', 	parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramCustomerName);				//Customer name
					createField(form, 'custpage_param_asofdate', 	'As Of Date', 		parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramAsOfDate);					//As of date
					createField(form, 'custpage_param_franchisee', 	'Franchisee', 		parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramFranchisee);				//Franchisee
					createField(form, 'custpage_param_franchiseename','Customer', 		parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramFranchiseeName);			//Franchisee name
					createField(form, 'custpage_param_collectiondate','Collection Date',parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramCollectionDate);			//Collection date
					createField(form, 'custpage_param_collectionqty','Collection Qty',	parameterFieldsDisplayMode,	serverWidget.FieldType.TEXT,	'custpage_parameter_group', paramCollectionQty);			//Collection date
					
					
					
					//Work out what the form layout should look like based on the stage number
					//
					switch(paramStage)
						{	
							case 1:	
								
								
								//Add a field group for the selection
								//
								var filtersGroup = form.addFieldGroup({
																		id:		'custpage_selection_group',
																		label:	'Selection'
																		});
								
								//Add fields
								//
								var formField = form.addField({
													                id: 		'custpage_entry_collection_date',
													                type: 		serverWidget.FieldType.DATE,
													                label: 		'Collection Date',
													                container:	'custpage_selection_group'
												            		});
								formField.defaultValue 	= format.format({value: defaultCollectionDate, type: format.Type.DATE});
								formField.isMandatory 	= true;
								
								var formField = form.addField({
													                id: 		'custpage_entry_class',
													                type: 		serverWidget.FieldType.SELECT,
													                label: 		'Invoice Class',
													                source:		'classification',
													                container:	'custpage_selection_group'
												            		}).isMandatory = true;
								
								var formField = form.addField({
													                id: 		'custpage_entry_collect_qty',
													                type: 		serverWidget.FieldType.INTEGER,
													                label: 		'# Invoice To Collect',
													                container:	'custpage_selection_group'
												            		});
								//formField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
								formField.defaultValue 	= 1;
								
								var formField = form.addField({
													                id: 		'custpage_entry_epos',
													                type: 		serverWidget.FieldType.CHECKBOX,
													                label: 		'Include EPOS',
													                container:	'custpage_selection_group'
												            		});

								var formField = form.addField({
													                id: 		'custpage_entry_customer',
													                type: 		serverWidget.FieldType.SELECT,
													                label: 		'Store Name',
													                source:		record.Type.CUSTOMER,
													                container:	'custpage_selection_group'
												            		});

								var formField = form.addField({
													                id: 		'custpage_entry_franchisee',
													                type: 		serverWidget.FieldType.SELECT,
													                label: 		'Franchise Owner',
													                source:		'customlist_bbs_franchise_owner',
													                container:	'custpage_selection_group'
												            		});
								
								var formField = form.addField({
													                id: 		'custpage_entry_asofdate',
													                type: 		serverWidget.FieldType.DATE,
													                label: 		'As Of Due Date',
													                container:	'custpage_selection_group'
												            		});

								
								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Next'
										            });
					            
								break;
								
							case 2:
																
								//Add a field group for the filters
								//
								var filtersGroup = form.addFieldGroup({
																		id:		'custpage_selection_group',
																		label:	'Selection'
																		});
								var formField = form.addField({
																	    id: 		'custpage_entry_collection_date',
																	    type: 		serverWidget.FieldType.DATE,
																	    label: 		'Collection Date',
																	    container:	'custpage_selection_group'
																		});
								formField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								formField.defaultValue = format.parse({value: paramCollectionDate, type: format.Type.DATE});

								
								var formField = form.addField({
														                id: 		'custpage_entry_classname',
														                type: 		serverWidget.FieldType.TEXT,
														                label: 		'Invoice Class',
														                container:	'custpage_selection_group'
													            		});
								formField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								formField.defaultValue = paramClassName;
								
								var formField = form.addField({
														                id: 		'custpage_entry_collect_qty',
														                type: 		serverWidget.FieldType.INTEGER,
														                label: 		'# Invoice To Collect',
														                container:	'custpage_selection_group'
													            		});
								formField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								formField.defaultValue = paramCollectionQty;
								
								var formField = form.addField({
														                id: 		'custpage_entry_eops',
														                type: 		serverWidget.FieldType.CHECKBOX,
														                label: 		'Include EPOS',
														                container:	'custpage_selection_group'
													            		});
								formField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								formField.defaultValue = paramEpos;


								var formField = form.addField({
																	    id: 		'custpage_entry_customername',
																	    type: 		serverWidget.FieldType.TEXT,
																	    label: 		'Store Name',
																	    container:	'custpage_selection_group'
																		});
								formField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								formField.defaultValue = paramCustomerName;


								var formField = form.addField({
																	    id: 		'custpage_entry_franchiseename',
																	    type: 		serverWidget.FieldType.TEXT,
																	    label: 		'Franchise Owner',
																	    container:	'custpage_selection_group'
																		});
								formField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								formField.defaultValue = paramFranchiseeName;

								var formField = form.addField({
																	    id: 		'custpage_entry_asofdate',
																	    type: 		serverWidget.FieldType.DATE,
																	    label: 		'As Of Due Date',
																	    container:	'custpage_selection_group'
																		});
								formField.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
								formField.defaultValue = format.parse({value: paramAsOfDate, type: format.Type.DATE});



								
								//Add a subtab
								//
								var tab = form.addTab({
														id:		'custpage_tab_items',
														label:	'Transactions'
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
																label:	'Transactions',
																tab:	'custpage_tab_items'
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
													type:	serverWidget.FieldType.TEXT
												});		

								subList.addField({
													id:		'custpage_sl_item_qty_pack',
													label:	'Packed Quantity',
													type:	serverWidget.FieldType.TEXT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY});		

								
								subList.addField({
													id:		'custpage_sl_item_id',
													label:	'Item Id',
													type:	serverWidget.FieldType.TEXT
												}).updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});		

								
								
								//Add a submit button
					            //
					            form.addSubmitButton({label: 'Process'});
					            

					            
					            //Find data for the sublist
					            //
					            
					            

					            
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
		    		var paramStage        	= Number(request.parameters['custpage_param_stage']); 
		    		var paramClass        	= request.parameters['custpage_param_class'];        
		    		var paramClassName    	= request.parameters['custpage_param_classname'];      
		    		var paramEpos       	= request.parameters['custpage_param_epos'];   
		    		var paramCustomer     	= request.parameters['custpage_param_customer'];       
		    		var paramCustomerName	= request.parameters['custpage_param_customername'];       
		    		var paramAsOfDate     	= request.parameters['custpage_param_asofdate'];       
		    		var paramCollectionDate = request.parameters['custpage_param_collectiondate'];       
		    		var paramFranchisee     = request.parameters['custpage_param_franchisee'];       
		    		var paramFranchiseeName	= request.parameters['custpage_param_franchiseename']; 
		    		var paramCollectionQty	= request.parameters['custpage_param_collection_qty']; 
		    		
					//Process based on stage
					//
					switch(paramStage)
						{
							case 1:
								//Increment the stage
								//
								paramStage++;
								
								//Call the suitelet again
								//
								context.response.sendRedirect({
														type: 			http.RedirectType.SUITELET, 
														identifier: 	runtime.getCurrentScript().id, 
														id: 			runtime.getCurrentScript().deploymentId, 
														parameters:		{
																			stage: 			paramStage,					
																			class:			paramClass,
																			classname:		paramClassName,
																			epos:			paramEpos,
																			customer:		paramCustomer,
																			customername:	paramCustomerName,
																			asofdate:		paramAsOfDate,
																			collectiondate:	paramCollectionDate,
																			franchisee:		paramFranchisee,
																			franchiseename:	paramFranchiseeName,
																			collectionqty:	paramCollectionQty
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
    
    
    //Create a field on the form
    //
    function createField(_form, _fieldName, _label, _displayMode, _dataType, _container, _defaultValue)
    	{
	    	
			var parameterField = _form.addField({
								                id: 		_fieldName,
								                type: 		_dataType,
								                label: 		_label,
								                container:	_container
								        		});

			if(_displayMode)
				{
					parameterField.updateDisplayType({displayType: _displayMode});
				}
			
			parameterField.defaultValue = _defaultValue;
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

