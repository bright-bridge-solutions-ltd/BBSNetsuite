/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Feb 2017     cedricgriffiths
 *
 */


/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */

function allocateLandedCostsSuitelet(request, response){

	if (request.getMethod() == 'GET') {
		
		//Get the consignment id from the parameter list
		//
		var paramConsId = request.getParameter('consignmentid');
		var paramStage = Number(request.getParameter('stage'));
		
		switch(paramStage)
		{
			case 0:
				//Find all consignments that are at a stage of received
				//
				
				//Create a form
				//
				var form = nlapiCreateForm('Allocate Landed Costs To Consignment');
				
				// Set the client side script to be used with this form
				//
				form.setScript('customscript_bbs_allocate_costs_client');
				
				//Save the stage number
				//
				var stageField = form.addField('custpage_stage', 'integer', 'stage');
				stageField.setDisplayType('hidden');
				stageField.setDefaultValue(paramStage);
				
				//Add a tab and a sublist
				//
				var tab1 = form.addTab('custpage_tab1', 'Consignment Records');
				var list1 = form.addSubList('custpage_sublist1', 'list', 'Consignment Records Available', 'custpage_tab1');
				
				list1.setLabel('Consignment Records Available');
				
				var listSelect = list1.addField('custpage_col1', 'checkbox', 'Select', null);
				var listConRef = list1.addField('custpage_col2', 'text', 'Id', null);
				var listConName = list1.addField('custpage_col3', 'text', 'Shipment Reference', null);
				var listConNum = list1.addField('custpage_col4', 'text', 'Container Number', null);
				var listConId = list1.addField('custpage_col5', 'text', 'Int Id', null);
				listConId.setDisplayType('hidden');
				
				var listConEad = list1.addField('custpage_col6', 'date', 'Expected Arrival', null);
				var listConAad = list1.addField('custpage_col7', 'date', 'Actual Arrival', null);
				
				// Add a submit button
				//
				form.addSubmitButton('Continue');

				//Populate the po list based on the search criteria
				//
				libFindReceivedConsignments(list1);
				
				//Write the response
				//
				response.writePage(form);
				
				break;
				
			case 1:
				//Only carry on if we do have a consignment id
				//
				if (paramConsId)
					{
					
						//Read the consignment to get the description
						//
						var consRecord = nlapiLoadRecord('customrecord_bbs_consignment', paramConsId);
						var consName = consRecord.getFieldValue('name');
					
						// Create a form
						//
						var form = nlapiCreateForm('Allocate Landed Costs To Consignment ' + consName);
						
						// Set the client side script to be used with this form
						//
						form.setScript('customscript_bbs_allocate_costs_client');
						
						//Save the consignment id in a field on the form, but hide it
						//
						var fieldConsignment = form.addField('custpage_consignment', 'text', 'Consignment');
						fieldConsignment.setDefaultValue(paramConsId.toString());
						
						fieldConsignment.setDisplayType('hidden');
						
						//Save the stage number
						//
						var stageField = form.addField('custpage_stage', 'integer', 'stage');
						stageField.setDisplayType('hidden');
						stageField.setDefaultValue(paramStage);
						
						//Add a tab and a sublist
						//
						var tab1 = form.addTab('custpage_tab1', 'Consignment Detail Lines');
						tab1.setLabel('Consignment Detail Lines');
						
						var list1 = form.addSubList('custpage_sublist1', 'list', 'Consignment Detail Lines', 'custpage_tab1');
						list1.setLabel('Consignment Detail Lines');
						
						
						//var listSelect = list1.addField('custpage_col1', 'checkbox', 'Select', null);
						var listSupplier = list1.addField('custpage_col7', 'text', 'Supplier', null);
						var listPoNumber = list1.addField('custpage_col2', 'text', 'Purchase Order', null);
						var listDocNum = list1.addField('custpage_col3', 'text', 'PO Line No', null);
						var listItem = list1.addField('custpage_col8', 'text', 'Item', null);
						var listAlloc = list1.addField('custpage_col4', 'float', 'Qty On Consignment', null);
						var listDetId = list1.addField('custpage_col5', 'text', 'Detail Id', null);
						listDetId.setDisplayType('hidden');
						
						var listPOId = list1.addField('custpage_col6', 'text', 'PO Id', null);
						listPOId.setDisplayType('hidden');
						
						var listSupplierId = list1.addField('custpage_col9', 'text', 'Supplier Id', null);
						listSupplierId.setDisplayType('hidden');
						
						var listSublistLine = list1.addField('custpage_col10', 'text', 'Sublist Line No', null);
						listSublistLine.setDisplayType('hidden');
						
						var listQtyRec = list1.addField('custpage_col11', 'float', 'Qty Received', null);
						var listUnitWeight = list1.addField('custpage_col14', 'float', 'Unit Weight', null);
						var listUnitRate = list1.addField('custpage_col15', 'currency', 'Unit Rate', null);
						var listValue = list1.addField('custpage_col18', 'currency', 'Recv Value', null);
						var listUnitCurrency = list1.addField('custpage_col16', 'text', 'Currency', null);
						var listExchangeRate = list1.addField('custpage_col17', 'float', 'Exch Rate', null);
						var listItemRec = list1.addField('custpage_col12', 'text', 'Item receipt', null);
						
						var listItemRecId = list1.addField('custpage_col13', 'text', 'Item receipt Id', null);
						listItemRecId.setDisplayType('hidden');
						
						var listUnitCurrencyId = list1.addField('custpage_col19', 'text', 'Currency Id', null);
						listUnitCurrencyId.setDisplayType('hidden');
						
						//Add available landed costs
						//
						var landedCosts = libFindLandedCostCategories();
						
						var lcDataField = form.addField('custpage_lc_data', 'text', 'Landed Costs Data');
						lcDataField.setDisplayType('hidden');
						lcDataField.setDefaultValue(JSON.stringify(landedCosts));
						
						lcFieldGroup = form.addFieldGroup('custpage_lc_group', 'Landed Cost Types');
						
						var count = Number(0);
						
						var lcText = consRecord.getFieldValue('custrecord_bbs_cons_lc_array');
						var lcArray = JSON.parse(lcText);
						var first = true;
						
						
						for ( var key in landedCosts) 
							{
								var lcData = landedCosts[key];
								var lcId = lcData[0];
								var lcName = lcData[1];
								var lcAccountId = lcData[2];
								var lcAccountTxt = lcData[3];
								
								var lcField = form.addField('custpage_lc_value_' + count.toString(), 'currency', lcName, null, 'custpage_lc_group');
								var lcCurr = form.addField('custpage_lc_currency_' + count.toString(), 'select', lcName + ' Currency', 'currency', 'custpage_lc_group');
								
								if (first)
									{
										first = false;
									}
								else
									{
										lcField.setBreakType('startcol');
									}
								
								if (lcArray != null && count < lcArray.length)
								{
									try
									{
										var lcValues = lcArray[count];
										lcField.setDefaultValue(lcValues[0]);
										
										lcCurr.setDefaultValue(lcValues[1]);
									}
									catch(errr)
									{
										lcField.setDefaultValue(lcArray[count]);
									}
									
									//lcField.setDefaultValue(lcArray[count]);
								}
								
								var temp = list1.addField('custpage_col_lc_' + count.toString(), 'currency', lcName, null);
								temp.setDisplayType('entry');
								temp.setMandatory(true);
								
								count++;
							}
						
						//Add a calc landed costs button to the tab
						//
						list1.addButton('custpage_calc_lc','Calculate Landed Costs','calcLandedCosts');
				
						var method = form.addField('custpage_lc_method', 'select', 'Allocation Method', 'customlist_bbs_landed_costs_alloc_meth', 'custpage_lc_group');
						method.setLayoutType('normal', 'startcol');
						method.setMandatory(true);
						
						//Add a mark/unmark button
						//
						//list1.addMarkAllButtons();
				
						var lineCount = consRecord.getLineItemCount('recmachcustrecord_bbs_consignment_header_id');
						var suppliers = {};
						var sublistLine = Number(0);
						
						for (var linenum = 1; linenum <= lineCount; linenum++) 
						{
							var lineDetailId = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'id', linenum);
							var linePoTxt = consRecord.getLineItemText('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_po_id', linenum);
							var linePoId = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_po_id', linenum);
							var linePoLine = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_po_line', linenum);
							var lineAllocated = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_allocated', linenum);
							var lineSupplier = consRecord.getLineItemText('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_supplier', linenum);
							var lineSupplierId = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_supplier', linenum);
							var lineItem = consRecord.getLineItemText('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_item', linenum);
							var lineBill = consRecord.getLineItemText('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_cons_det_vendor_bill', linenum);
							var lineQtyRec = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_received', linenum);
							var lineItemRec = consRecord.getLineItemText('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_cons_det_item_receipt', linenum);
							var lineItemRecId = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_cons_det_item_receipt', linenum);
							var lineUnitWeight = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_item_weight', linenum);
							var lineUnitRate = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_item_rate', linenum);
							var lineUnitCurrency = consRecord.getLineItemText('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_currency', linenum);
							var lineUnitCurrencyId = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_currency', linenum);
							var lineUnitExchangeRate = consRecord.getLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_exch_rate', linenum);
								
							list1.setLineItemValue('custpage_col2', linenum, linePoTxt);
							list1.setLineItemValue('custpage_col3', linenum, linePoLine);
							list1.setLineItemValue('custpage_col4', linenum, lineAllocated);
							list1.setLineItemValue('custpage_col5', linenum, lineDetailId);
							list1.setLineItemValue('custpage_col6', linenum, linePoId);
							list1.setLineItemValue('custpage_col7', linenum, lineSupplier);
							list1.setLineItemValue('custpage_col8', linenum, lineItem);
							list1.setLineItemValue('custpage_col9', linenum, lineSupplierId);
							list1.setLineItemValue('custpage_col10', linenum, linenum);
							list1.setLineItemValue('custpage_col11', linenum, lineQtyRec);
							list1.setLineItemValue('custpage_col12', linenum, lineItemRec);
							list1.setLineItemValue('custpage_col13', linenum, lineItemRecId);
							list1.setLineItemValue('custpage_col14', linenum, lineUnitWeight);
							list1.setLineItemValue('custpage_col15', linenum, lineUnitRate);
							list1.setLineItemValue('custpage_col16', linenum, lineUnitCurrency);
							list1.setLineItemValue('custpage_col17', linenum, lineUnitExchangeRate);
							list1.setLineItemValue('custpage_col18', linenum, Number(lineUnitRate) * Number(lineQtyRec));
							list1.setLineItemValue('custpage_col19', linenum, lineUnitCurrencyId);
							
						}
					
						//
						form.addSubmitButton('Confirm');
		
						//Write the response
						//
						response.writePage(form);
					}
			}
		}
	else
		{
		//Get the stage
		//
		var stage = Number(request.getParameter('custpage_stage'));
		var consSelected = null;
		
		switch(stage)
		{
			case 0:
				
				//Count the number of lines in the sublist
				//
				var lineCount = request.getLineItemCount('custpage_sublist1');
			
				for (var int = 1; int <= lineCount; int++) 
				{
					//Get the details from the sublist
					//
					var consId = request.getLineItemValue('custpage_sublist1', 'custpage_col5', int);
					var consChecked = request.getLineItemValue('custpage_sublist1', 'custpage_col1', int);
					
					//Process only the checked lines
					//
					if (consChecked == 'T')
					{
						consSelected = consId;
					}
				}
				
				var params = new Array();
				
				if (consSelected)
					{
						params['stage'] = '1';
						params['consignmentid'] = consSelected;
					}
				else
					{
					params['stage'] = '0';
					}
				
				response.sendRedirect('SUITELET', 'customscript_bbs_allocate_landed_costs', 'customdeploy_bbs_allocate_landed_costs',null,params);
				
				break;
					
			case 1:

				//Now process the selected records
				//
				var itemReceiptsArray = {};
				
				//Get the consignment id & the consignment record
				//
				var paramConsId = request.getParameter('custpage_consignment');
				var consignmentRecord = nlapiLoadRecord('customrecord_bbs_consignment', paramConsId);
				
				//Get the landed costs data from the form
				//
				var lcDataField = request.getParameter('custpage_lc_data');
				var landedCosts = JSON.parse(lcDataField);
				
				
				//Count the number of lines in the sublist
				//
				var lineCount = request.getLineItemCount('custpage_sublist1');
			
				for (var int = 1; int <= lineCount; int++) 
				{
					//Get the po details from the sublist
					//
					var poChecked = request.getLineItemValue('custpage_sublist1', 'custpage_col1', int);
					var poLine = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col3', int));
					var poAllocated = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col4', int));
					var detailId = request.getLineItemValue('custpage_sublist1', 'custpage_col5', int);
					var poId = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col6', int));
					var poText = request.getLineItemValue('custpage_sublist1', 'custpage_col2', int);
					var supplierId = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col9', int));
					var sublistLineNo = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col10', int));
					var sublistLocation = request.getLineItemValue('custpage_sublist1', 'custpage_col11', int);
					var sublistReceived = Number(request.getLineItemValue('custpage_sublist1', 'custpage_col12', int));
					var sublistItemReceiptId = request.getLineItemValue('custpage_sublist1', 'custpage_col13', int);
					
					//Create a data element that is the item receipt id + po id + po line 
					//
					var irAndLine = sublistItemReceiptId.toString() + '|' + poId.toString() + '|' + poLine.toString() + '|' + sublistLineNo.toString();
						
					//Now add the dynamic landed costs columnns to the data
					//
					var count = Number(0);
					
					for ( var key in landedCosts) 
					{
						var lcData = landedCosts[key];
						var lcId = lcData[0];
						var sublistLandedCost = request.getLineItemValue('custpage_sublist1', 'custpage_col_lc_' + count.toString(), int);
						
						irAndLine = irAndLine + '|' + lcId.toString() + '|' + sublistLandedCost;
						
						count++;
					}
					
					//Build list of item receipts/lines that are to processed
					//
					if(!itemReceiptsArray[sublistItemReceiptId])
						{
							//If supplier not in array, then add 
							itemReceiptsArray[sublistItemReceiptId] = [];
						}
						
					//Save the ir & line into the relevant ir row of the ir array
					//
					itemReceiptsArray[sublistItemReceiptId][itemReceiptsArray[sublistItemReceiptId].length] = irAndLine;
							
				}
				
				//Now we have an array of ir's/lines
				//We can allocate the landed costs
				//
				
				//Loop round the ir's
				//
				for ( var itemReceiptId in itemReceiptsArray) 
				{
					
					//Read in the item receipt
					//
					var itemReceiptRecord = nlapiLoadRecord('itemreceipt', itemReceiptId);
					
					//Get the ir/line data for this ir
					//
					var irData = itemReceiptsArray[itemReceiptId];
					
					//Loop round each of the ir's/lines for this ir
					//
					for (var int2 = 0; int2 < irData.length; int2++) 
					{
						var irAndLine = irData[int2];
						
						//Split the data elements out
						//
						var irAndLineArray = irAndLine.split('|');
						var irId = irAndLineArray[0];
						var poId = irAndLineArray[1];
						var poLine = irAndLineArray[2];
						var consignmentSublistLine = irAndLineArray[3];

						//Loop through the items on the item receipt looking for a matching po & line id
						//
						var itemCount = itemReceiptRecord.getLineItemCount('item');
						
						for (var int3 = 1; int3 <= itemCount; int3++) 
						{
							var orderDoc = itemReceiptRecord.getLineItemValue('item', 'orderdoc', int3);
							var orderLine = itemReceiptRecord.getLineItemValue('item', 'orderline', int3);
							
							if(orderDoc == poId && orderLine == poLine)
								{
									//Select the ir line to work with
									//
									itemReceiptRecord.selectLineItem('item', int3);
								
									try
									{
										itemReceiptRecord.removeCurrentLineItemSubrecord('item', 'landedcost');
									}
									catch(err)
									{
										var errorTxt = '';
									}
									
									//Update the landed costs on this line
									//
									var landedCost = itemReceiptRecord.createCurrentLineItemSubrecord('item', 'landedcost');
									
									for (var int4 = 4; int4 < irAndLineArray.length; int4 += 2) 
									{
										var lcCategoryId = irAndLineArray[int4];
										var lcAmount = irAndLineArray[int4 + 1];
										
										if(lcAmount != 0)
											{
												landedCost.selectNewLineItem('landedcostdata');
												landedCost.setCurrentLineItemValue('landedcostdata', 'costcategory', lcCategoryId);
												landedCost.setCurrentLineItemValue('landedcostdata', 'amount', lcAmount);
												landedCost.commitLineItem('landedcostdata');
											}
									}
									landedCost.commit();
									
									itemReceiptRecord.commitLineItem('item');
									
									//Exit the loop
									//
									break;
								}
							
						}

					}
					
					//Save the item receipt
					//
					nlapiSubmitRecord(itemReceiptRecord, true, false);
				}
				
				//Mark consignment as closed
				//
				consignmentRecord.setFieldValue('custrecord_bbs_consignment_status', 4);

				//Update the consignment with the actual landed cost data used
				//
				var landedCosts = libFindLandedCostCategories();
				
				var count = Number(0);
				var lcArray = [];
				
				for ( var key in landedCosts) 
					{
						var lcValue = request.getParameter('custpage_lc_value_' + count.toString());
						var lcCurr = request.getParameter('custpage_lc_currency_' + count.toString());
						
						var lcData = [lcValue,lcCurr];
						
						if(lcValue != null)
							{
								//lcArray.push(lcValue);
								lcArray.push(lcData);
							}
						
						count++;
					}
				
				if(lcArray.length > 0)
					{
						var lcString = JSON.stringify(lcArray);
						
						consignmentRecord.setFieldValue('custrecord_bbs_cons_lc_array', lcString);
						
						var count = Number(0);
						
						for ( var lcKey in lcArray) 
						{
							
							try
							{
								var lcValues = lcArray[count];
								consignmentRecord.setFieldValue('custpage_lc_value_' + count.toString(),lcValues[0]);
								consignmentRecord.setFieldValue('custpage_lc_currency_' + count.toString(),lcValues[1]);
							}
							catch(errr)
							{
								consignmentRecord.setFieldValue('custpage_lc_value_' + count.toString(),lcArray[count]);
							}
							
							count++;
						}
						
					}
				
				//Save the consignment record
				//
				nlapiSubmitRecord(consignmentRecord, false, true);
				
				//Redirect back to the consignment record
				//
				nlapiSetRedirectURL('RECORD', 'customrecord_bbs_consignment', paramConsId, false, null);
				
		}
	}

}
