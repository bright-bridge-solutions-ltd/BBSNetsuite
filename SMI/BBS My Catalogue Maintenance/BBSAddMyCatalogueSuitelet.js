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
function myCatalogueAddSuitelet(request, response)
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
			
			stageParam = (stageParam == 0 ? 1 : stageParam);
			
			
			//=====================================================================
			// Form creation
			//=====================================================================
			//
			var form = nlapiCreateForm('My Catalogue Add', false);
			form.setScript('customscript_bbs_add_my_cat_client');
			form.setTitle('Add Records To My Catalogue');
			
			
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
							// Stage 1 - Get the customer
							//=====================================================================
							//
						
							//Add a select field to pick the customer from
							//
							var customerField = form.addField('custpage_select_customer', 'select', 'Customer', 'customer', null);
							customerField.setMandatory(true);
							
							//Add a submit button to the form
							//
							form.addSubmitButton('Select Records To Add');
			
							break;
					
					case 2:
							//=====================================================================
							// Stage 2 - Display sublists of child items for each parent
							//=====================================================================
							//
						
							//Create a tab for the sublist
							//
							var itemsTab = form.addTab('custpage_items_tab', 'Items To Add To My Catalogue');
							itemsTab.setLabel('Items To Add To My Catalogue');
							
							var dummyTab = form.addTab('custpage_dummy_tab', '');
							dummyTab.setLabel('');
							
							var dummyField = form.addField('custpage_dummy', 'text', 'Dummy', null, 'custpage_dummy_tab');
							
							//Create the sublist
							//
							var sublist = form.addSubList('custpage_sublist_items', 'list', 'Items To Add To My Catalogue', 'custpage_items_tab');
							sublist.addMarkAllButtons();
							sublist.setLabel('Items To Add To My Catalogue');
							sublist.addRefreshButton();
							
							//Add columns to the sublist
							//
							var sublistFieldTick = sublist.addField('custpage_items_tick', 'checkbox', 'Select', null);
							var sublistFieldId = sublist.addField('custpage_items_id', 'text', 'Internal Id', null);
							var sublistFieldType = sublist.addField('custpage_items_type', 'text', 'Type', null);
							var sublistFieldProduct = sublist.addField('custpage_items_product', 'text', 'Product', null);
							var sublistFieldDescription = sublist.addField('custpage_items_description', 'text', 'XDescription', null);
							var sublistFieldBrand = sublist.addField('custpage_items_brand', 'text', 'Brand', null);
							
							//Get session data
							//
							var sessionData = libGetSessionData(sessionIdParam);
							
							//Find the items that are already on the My Catalogue from the customer
							//
							var existingIds = [];
							var existingFilters = [];
							
							existingFilters.push(["custrecord_bbs_web_product_customer","anyof",custIdParam]);
							
							if(sessionData != null && sessionData != '')
								{
									var userFilters = JSON.parse(sessionData);
									
									//if(userFilters['brand'] != '')
									//	{
									//		existingFilters.push("AND",["custrecord_bbs_web_product_item.custitem_cseg_bbs_custseg_it","anyof",userFilters['brand']])
									//	}
									
									if(userFilters['description'] != '')
										{
											existingFilters.push("AND",["custrecord_bbs_web_product_item.description","contains",userFilters['description']])
										}
									
									if(userFilters['product'] != '')
										{
											existingFilters.push("AND",["custrecord_bbs_web_product_item.name","contains",userFilters['product']])
										}
								}
							
							var customrecord_bbs_customer_web_productSearch = getResults(nlapiCreateSearch("customrecord_bbs_customer_web_product",
									existingFilters, 
									[
									   new nlobjSearchColumn("custrecord_bbs_web_product_item")
									]
									));
		
							if(customrecord_bbs_customer_web_productSearch != null && customrecord_bbs_customer_web_productSearch.length > 0)
								{
									for (var int = 0; int < customrecord_bbs_customer_web_productSearch.length; int++) 
										{
											var mcId = customrecord_bbs_customer_web_productSearch[int].getValue("custrecord_bbs_web_product_item");
											existingIds.push(mcId);
										}
								}
							
							//Add filters to the sublist
							//
							//form.addField('custpage_filter_brand', 'select', 'Brand', 'customrecord_cseg_bbs_custseg_it', 'custpage_items_tab');
							var brandField = form.addField('custpage_filter_brand', 'select', 'Branded/Un-Branded', null, 'custpage_items_tab');
							brandField.addSelectOption('','', true);
							brandField.addSelectOption('A','--Any--', false);
							brandField.addSelectOption('B','Branded (Assemblies)', false);
							brandField.addSelectOption('U','Un-Branded (Inventory Items)', false);
							
							form.addField('custpage_filter_desc', 'text', 'Description (contains)', null, 'custpage_items_tab');
							form.addField('custpage_filter_product', 'text', 'Product Code (contains)', null, 'custpage_items_tab');
							
							
							//Define the search filters
							//
							var userFiltersAdded = false;
							var filters = [];
							filters.push(["isinactive","is","F"]);
							//filters.push("AND",["type","anyof","InvtPart","Assembly"]);
							filters.push("AND",[["matrix","is","F"],"OR",[["matrix","is","T"],"AND",["matrixchild","is","T"]]]);
							
							if(existingIds.length > 0)
								{
									filters.push("AND",["internalid","noneof",existingIds]);
								}
							
							if(sessionData != null && sessionData != '')
								{
									var userFilters = JSON.parse(sessionData);
									
								//	if(userFilters['brand'] != '')
								//		{
								//			filters.push("AND",["custitem_cseg_bbs_custseg_it","anyof",userFilters['brand']]);
								//			userFiltersAdded = true;
								//		}
									
									if(userFilters['brand'] == 'B')
										{
											filters.push("AND",["type","anyof","Assembly"]);
											userFiltersAdded = true;
										}
									
									if(userFilters['brand'] == 'U')
										{
											filters.push("AND",["type","anyof","InvtPart"]);
											userFiltersAdded = true;
										}
								
									if(userFilters['brand'] == 'A')
										{
											filters.push("AND",["type","anyof","InvtPart","Assembly"]);
											userFiltersAdded = true;
										}
								
									if(userFilters['description'] != '')
										{
											filters.push("AND",["description","contains",userFilters['description']]);
											userFiltersAdded = true;
										}
									
									if(userFilters['product'] != '')
										{
											filters.push("AND",["itemid","contains",userFilters['product']]);
											userFiltersAdded = true;
										}
								}
							
							//Populate the sublist
							//
							if(userFiltersAdded)
								{
									var itemSearch = getResults(nlapiCreateSearch("item",
											filters, 
											[
											   new nlobjSearchColumn("type"), 
											   new nlobjSearchColumn("custitem_cseg_bbs_custseg_it"), 
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
													var searchBrand = itemSearch[int].getText("custitem_cseg_bbs_custseg_it");
													var searchType = itemSearch[int].getText("type");
													
													sublist.setLineItemValue('custpage_items_id', int + 1, searchId);
													sublist.setLineItemValue('custpage_items_product', int + 1, searchProduct);
													sublist.setLineItemValue('custpage_items_description', int + 1, searchDescription);
													sublist.setLineItemValue('custpage_items_brand', int + 1, searchBrand);
													sublist.setLineItemValue('custpage_items_type', int + 1, searchType);
													
												}
										}
								}

							//Add a submit button
							//
							form.addSubmitButton('Add Selected Items To My Catalogue');
							
							break;
							
					case 3:
							//=====================================================================
							// Stage 3 - Display message about email to be received
							//=====================================================================
							//
						
							//Get the context & the users email address
							//
							var context = nlapiGetContext();
							var emailAddress = context.getEmail();
							
							//Add a message field 
							//
							var messageField = form.addField('custpage_message', 'textarea', 'Message', null, null);
							messageField.setDisplaySize(120, 4);
							messageField.setDisplayType('readonly');
							messageField.setDefaultValue('An email will be sent to ' + emailAddress + ' when the items have been added to My Catalogue.');
						
							//Add a submit button to the form
							//
							form.addSubmitButton('Restart');
			
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
						// Stage 1 - Process the chosen customer
						//=====================================================================
						//
						
						//Retrieve the parameters from the form fields
						//
						custIdParam = request.getParameter('custpage_select_customer');

						//Create a session record
						//
						var sessionId = libCreateSession();
						
						//Build up the parameters so we can call this suitelet again, but move it on to the next stage
						//
						var params = new Array();
						params['customerid'] = custIdParam;
						params['stage'] = stage + 1;
						params['sessionid'] = sessionId;
						
						var context = nlapiGetContext();
						response.sendRedirect('SUITELET',context.getScriptId(), context.getDeploymentId(), null, params);
						
						break;
						
					case 2:
						//=====================================================================
						// Stage 2 - Process the chosen items
						//=====================================================================
						//
						
						//Get the other data needed from the parameters
						//
						var custIdParam = request.getParameter('custpage_param_customer');
						var lineCount = request.getLineItemCount('custpage_sublist_items');
						var sessionParam = request.getParameter('custpage_param_session');
						
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
						var scheduleParams = {
												custscript_bbs_add_my_cat_ids: 	JSON.stringify(items),
												custscript_bbs_add_my_cat_cust:	custIdParam
											};
						
						nlapiScheduleScript('customscript_bbs_add_my_cat_sched', null, scheduleParams);
		
						//Delete the session data
						//
						libClearSessionData(sessionParam);
						
						//Call the next stage
						//
						var params = new Array();
						params['stage'] = stage + 1;
						
						var context = nlapiGetContext();
						response.sendRedirect('SUITELET',context.getScriptId(), context.getDeploymentId(), null, params);
						
						break;
						
					case 3:
						
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
	var pageSize = 500;
	var start = 0;
	var end = pageSize;
	var searchResultSet = searchResult.getResults(start, end);
	
	/*
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
		*/
	
	return searchResultSet;
}
