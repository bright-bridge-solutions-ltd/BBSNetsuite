/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Oct 2019     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function priceIncreaseSuitelet(request, response)
{
	//=====================================================================
	// Get request - so return a form for the user to process
	//=====================================================================
	//
	
	if (request.getMethod() == 'GET') 
		{
			//=====================================================================
			// Parameters passed to the suitelet
			//=====================================================================
			//
			var stageParam = Number(request.getParameter('stage'));
			var custIdParam = request.getParameter('customerid');
			var sessionIdParam = request.getParameter('sessionid');
			var modeParam = request.getParameter('mode');
			var tierParam = request.getParameter('tier');
			
			stageParam = (stageParam == 0 ? 1 : stageParam);
			
			
			//=====================================================================
			// Form creation
			//=====================================================================
			//
			var form = nlapiCreateForm('Customer Item Pricing Mass Update', false);
			form.setScript('customscript_bbs_ip_update_client');
			form.setTitle('Customer Item Pricing Mass Update');
			
			
			//=====================================================================
			// Hidden fields to pass data to the POST section
			//=====================================================================
			//
			
			//Customer
			//
			var custIdField = form.addField('custpage_param_customer', 'text', 'customer id');
			custIdField.setDisplayType('hidden');
			custIdField.setDefaultValue(custIdParam);
			
			//Stage
			//
			var stageField = form.addField('custpage_param_stage', 'integer', 'stage');
			stageField.setDisplayType('hidden');
			stageField.setDefaultValue(stageParam);
			
			//Session
			//
			var sessionField = form.addField('custpage_param_session', 'integer', 'stage');
			sessionField.setDisplayType('hidden');
			sessionField.setDefaultValue(sessionIdParam);
			
			//Mode
			//
			var modeField = form.addField('custpage_param_mode', 'text', 'mode');
			modeField.setDisplayType('hidden');
			modeField.setDefaultValue(modeParam);
			
			//Tier
			//
			var tierField = form.addField('custpage_param_tier', 'text', 'mode');
			tierField.setDisplayType('hidden');
			tierField.setDefaultValue(tierParam);
			
			
			//=====================================================================
			// Field groups creation
			//=====================================================================
			//
			
			
			//=====================================================================
			// Form layout based on stage number
			//=====================================================================
			//
			switch(stageParam)
				{
					case 1:	
							//=====================================================================
							// Stage 1 - Get the mode
							//=====================================================================
							//
						
							//Add a select field to pick the mode from
							//
							var modeField = form.addField('custpage_select_mode', 'select', 'Mode', null, null);
							modeField.setMandatory(true);
							modeField.addSelectOption('','', false);
							modeField.addSelectOption('C','Update By Customer', false);
							modeField.addSelectOption('T','Update By Customer Tier', false);
							//modeField.addSelectOption('P','Update By Product', false);
							//modeField.addSelectOption('G','Update By Product Category', false);
							
							
							//Add a submit button to the form
							//
							form.addSubmitButton('Next');
			
							break;
					
					case 2:	
							//=====================================================================
							// Stage 2 - Get the customer or tier
							//=====================================================================
							//
						
							switch(modeParam)
								{
									case 'C':	//Customer
										
										//Add a select field to pick the customer from
										//
										var customerField = form.addField('custpage_select_customer', 'select', 'Customer', 'customer', null);
										customerField.setMandatory(true);
										
										//Add a submit button to the form
										//
										form.addSubmitButton('Next');
						
										break;
										
									case 'T': 	//Tier
										
										//Add a select field to pick the tier from
										//
										var tierField = form.addField('custpage_select_tier', 'select', 'Tier', 'customlist_bbs_cust_tier_list', null);
										tierField.setMandatory(true);
										
										//Add a select field to pick the price increase percentage
										//
										var increaseField = form.addField('custpage_select_increase', 'float', 'Increase/Decrease Percentage', null, null);
										increaseField.setMandatory(true);
										
										//Add a submit button to the form
										//
										form.addSubmitButton('Update Prices & Restart');
						
										break;
								}
							
							
							break;
				
					case 3:
							//=====================================================================
							// Stage 3 - Display sublists of child items for each parent
							//=====================================================================
							//
						
							//Add a select field to pick the price increase percentage
							//
							var increaseField = form.addField('custpage_select_increase', 'float', 'Increase/Decrease Percentage', null, null);
							increaseField.setMandatory(true);
							
							
							var infoField = form.addField('custpage_inline_message', 'inlinehtml', '', null, null);
							infoField.setDefaultValue('<p style="color: red; font-size: 14pt;">Selecting no items below will cause all items for the customer to updated</p>');
							infoField.setLayoutType('outsidebelow', 'startrow');
							

							//Create a tab for the sublist
							//
							var itemsTab = form.addTab('custpage_items_tab', 'Items To Update Price');
							itemsTab.setLabel('Items To Update Price');
							
							var dummyTab = form.addTab('custpage_dummy_tab', '');
							dummyTab.setLabel('');
							
							var dummyField = form.addField('custpage_dummy', 'text', 'Dummy', null, 'custpage_dummy_tab');
							
							//Create the sublist
							//
							var sublist = form.addSubList('custpage_sublist_items', 'list', 'Items To Update Price', 'custpage_items_tab');
							sublist.addMarkAllButtons();
							sublist.setLabel('Items To Update Price');
							sublist.addRefreshButton();
							
							//Add columns to the sublist
							//
							var sublistFieldTick = sublist.addField('custpage_items_tick', 'checkbox', 'Select', null);
							var sublistFieldId = sublist.addField('custpage_items_id', 'text', 'Internal Id', null);
							var sublistFieldType = sublist.addField('custpage_items_type', 'text', 'Type', null);
							var sublistFieldProduct = sublist.addField('custpage_items_product', 'text', 'Product', null);
							var sublistFieldDescription = sublist.addField('custpage_items_description', 'text', 'Description', null);
							var sublistFieldClass = sublist.addField('custpage_items_class', 'text', 'Category', null);
							
							//Get session data
							//
							var sessionData = libGetSessionData(sessionIdParam);
							
							
							//Add filters to the sublist
							//
							form.addField('custpage_filter_desc', 'text', 'Description (contains)', null, 'custpage_items_tab');
							form.addField('custpage_filter_product', 'text', 'Product Code (contains)', null, 'custpage_items_tab');
							form.addField('custpage_filter_class', 'select', 'Product Category', 'classification', 'custpage_items_tab');
							
							
							//Define the search filters
							//
							var userFiltersAdded = false;
							var filters = [];
							var userFilters = null;
							
							//Parse the session data
							//
							if(sessionData != null && sessionData != '')
								{
									userFilters = JSON.parse(sessionData);
								}
							
							//Start of with only active items & inventory items
							//
							filters.push(["isinactive","is","F"]);
							//filters.push("AND",[["type","anyof","InvtPart"],"AND",["matrix","is","F"]]);
							filters.push("AND",[[["type","anyof","InvtPart"],"AND",["matrix","is","F"]],"OR",[["type","anyof","Assembly"],"AND",["matrix","is","F"],"AND",["matrixchild","is","T"],"AND",["custitem_bbs_item_customer","anyof",custIdParam]]]);
							
							//Add a filter for the description
							//
							if(userFilters != null && userFilters['description'] != '')
								{
									filters.push("AND",["description","contains",userFilters['description']]);
									userFiltersAdded = true;
								}
							
							//Add a filter for the product code
							//
							if(userFilters != null && userFilters['product'] != '')
								{
									filters.push("AND",["itemid","contains",userFilters['product']]);
									userFiltersAdded = true;
								}
							
							//Add a filter for the product category
							//
							if(userFilters != null && userFilters['class'] != '')
								{
									filters.push("AND",["class","anyof",userFilters['class']]);
									userFiltersAdded = true;
								}
							
							
							//Populate the sublist
							//
							if(userFiltersAdded)
								{
									var itemSearch = getResults(nlapiCreateSearch("item",
											filters, 
											[
											   new nlobjSearchColumn("type"), 
											   new nlobjSearchColumn("class"), 
											   new nlobjSearchColumn("itemid").setSort(false), 
											   new nlobjSearchColumn("salesdescription")
											]
											));
				
									if(itemSearch != null && itemSearch.length > 0)
										{
											for (var int = 0; int < itemSearch.length; int++) 
												{
													var searchId = itemSearch[int].getId();
													var searchProduct = itemSearch[int].getValue("itemid");
													var searchDescription = itemSearch[int].getValue("salesdescription");
													var searchClass = itemSearch[int].getText("class");
													var searchType = itemSearch[int].getText("type");
													
													sublist.setLineItemValue('custpage_items_id', int + 1, searchId);
													sublist.setLineItemValue('custpage_items_product', int + 1, searchProduct);
													sublist.setLineItemValue('custpage_items_description', int + 1, searchDescription);
													sublist.setLineItemValue('custpage_items_class', int + 1, searchClass);
													sublist.setLineItemValue('custpage_items_type', int + 1, searchType);
													
												}
										}
								}

							//Add a submit button
							//
							form.addSubmitButton('Update Prices');
							
							break;
				}
				
			//Write the response
			//
			response.writePage(form);
		}
	else
		{
			//=====================================================================
			// Post request - so process the returned form
			//=====================================================================
			//
			
			//Get the stage 
			//
			var stage = Number(request.getParameter('custpage_param_stage'));
			
			switch(stage)
				{
					case 1:
						//=====================================================================
						// Stage 1 - Process the chosen mode
						//=====================================================================
						//
						
						//Retrieve the parameters from the form fields
						//
						var modeParam = request.getParameter('custpage_select_mode');

						//Create a session record
						//
						var sessionId = libCreateSession();
						
						//Build up the parameters so we can call this suitelet again, but move it on to the next stage
						//
						var params = new Array();
						params['mode'] = modeParam;
						params['stage'] = stage + 1;
						params['sessionid'] = sessionId;
						
						var context = nlapiGetContext();
						response.sendRedirect('SUITELET',context.getScriptId(), context.getDeploymentId(), null, params);
						
						break;
						
					case 2:
						//=====================================================================
						// Stage 2 - Process the chosen customer/tier
						//=====================================================================
						//
						
						//Retrieve the parameters from the form fields
						//
						var custIdParam = request.getParameter('custpage_select_customer');
						var sessionParam = request.getParameter('custpage_param_session');
						var modeParam = request.getParameter('custpage_param_mode');
						var tierParam = request.getParameter('custpage_select_tier');
						var increaseParam = request.getParameter('custpage_select_increase');

						if(modeParam == 'T')	//Customer Tier
							{
								//If we are selecting by tier then we just need to call the scheduled script here to go off and do the update
								//
								var paramsObject = {};
								paramsObject.mode = modeParam;
								paramsObject.tier = tierParam;
								paramsObject.increase = increaseParam;
								
								var scheduleParams = {custscript_bbs_ip_update_params: 	JSON.stringify(paramsObject)};
			
								nlapiScheduleScript('customscript_bbs_ip_update_sched', null, scheduleParams);

								//Build up the parameters so we can call this suitelet again, but move it back to the first stage
								//
								var params = new Array();
								params['stage'] = 1;
								
								var context = nlapiGetContext();
								response.sendRedirect('SUITELET',context.getScriptId(), context.getDeploymentId(), null, params);
							}
						else
							{
								//Build up the parameters so we can call this suitelet again, but move it on to the next stage
								//
								var params = new Array();
								params['customerid'] = custIdParam;
								params['stage'] = stage + 1;
								params['sessionid'] = sessionParam;
								params['mode'] = modeParam;
								params['tier'] = tierParam;
								
								var context = nlapiGetContext();
								response.sendRedirect('SUITELET',context.getScriptId(), context.getDeploymentId(), null, params);
							}
						break;
						
					case 3:
						//=====================================================================
						// Stage 3 - Process the chosen items
						//=====================================================================
						//
						
						//Get the other data needed from the parameters
						//
						var custIdParam = request.getParameter('custpage_param_customer');
						var lineCount = request.getLineItemCount('custpage_sublist_items');
						var sessionParam = request.getParameter('custpage_param_session');
						var modeParam = request.getParameter('custpage_param_mode');
						var tierParam = request.getParameter('custpage_select_tier');
						var increaseParam = request.getParameter('custpage_select_increase');

						var items = [];
						
						for (var int2 = 1; int2 <= lineCount; int2++) 
							{
								var ticked = request.getLineItemValue('custpage_sublist_items', 'custpage_items_tick', int2);
								
								//Look for ticked lines
								//
								if (ticked == 'T')
									{
										var id = request.getLineItemValue('custpage_sublist_items', 'custpage_items_id', int2);
										items.push(id);
									}
							}
						
						//Now we have the data we need to pass it to the scheduled script
						//
						var paramsObject = {};
						paramsObject.mode = modeParam;
						paramsObject.tier = tierParam;
						paramsObject.increase = increaseParam;
						paramsObject.customer = custIdParam;
						paramsObject.items = items;
						
						var scheduleParams = {custscript_bbs_ip_update_params: 	JSON.stringify(paramsObject)};
						
						nlapiScheduleScript('customscript_bbs_ip_update_sched', null, scheduleParams);

						//Delete the session data
						//
						libClearSessionData(sessionParam);
						
						//Call the next stage
						//
						var params = new Array();
						params['stage'] = 1;
						
						var context = nlapiGetContext();
						response.sendRedirect('SUITELET',context.getScriptId(), context.getDeploymentId(), null, params);
						
						break;
				}
		}
}

//=====================================================================
// Functions
//=====================================================================
//
function getResults(search)
{
	var searchResult = search.runSearch();
	
	//Get the initial set of results
	//
	var pageSize = 1000;
	var start = 0;
	var end = pageSize;
	var searchResultSet = searchResult.getResults(start, end);
	
	
	if(searchResultSet != null)
		{
			var resultlen = searchResultSet.length;
		
			//If there is more than 1000 results, page through them
			//
			while (resultlen == pageSize) 
				{
						start += pageSize;
						end += pageSize;
		
						var moreSearchResultSet = searchResult.getResults(start, end);
						resultlen = moreSearchResultSet.length;
		
						searchResultSet = searchResultSet.concat(moreSearchResultSet);
				}
		}
		
	
	return searchResultSet;
}
