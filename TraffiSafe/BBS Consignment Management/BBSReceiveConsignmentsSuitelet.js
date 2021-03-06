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

function receiveConsignmentSuitelet(request, response){

	if (request.getMethod() == 'GET') {
		
		//Get the consignment id from the parameter list
		//
		var paramConsId = request.getParameter('consignmentid');
		var paramStage = Number(request.getParameter('stage'));
		
		switch(paramStage)
		{
			case 0:
				//Find all consignments that are at a stage of in transit
				//
				
				//Create a form
				//
				var form = nlapiCreateForm('Receive Consignments');
				
				// Set the client side script to be used with this form
				//
				form.setScript('customscript_bbs_receive_cons_client');
				
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
				
				// Add a submit button
				//
				form.addSubmitButton('Continue');

				//Populate the po list based on the search criteria
				//
				libFindInTransitConsignments(list1);
				
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
						var form = nlapiCreateForm('Receive Consignment ' + consName);
						
						// Set the client side script to be used with this form
						//
						form.setScript('customscript_bbs_receive_cons_client');
						
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
						
						//Add a global location selection
						//
						form.addField('custpage_location', 'select', 'Location For All Lines', 'location');
						
						//Add the arrival date 
						//
						var aad = form.addField('custpage_arrival_date', 'date', 'Actual Arrival Date');
						aad.setDefaultValue(nlapiDateToString(new Date()));
						
						//Add a tab and a sublist
						//
						var tab1 = form.addTab('custpage_tab1', 'Consignment Detail Lines');
						var list1 = form.addSubList('custpage_sublist1', 'list', 'Consignment Detail Lines', 'custpage_tab1');
						
						list1.setLabel('Consignment Detail Lines');
						
						//Add a set location button to the tab
						//
						list1.addButton('custpage_set_location','Set Location For All Lines','setOverallLocation');
				
						//var listSelect = list1.addField('custpage_col1', 'checkbox', 'Select', null);
						var listSupplier = list1.addField('custpage_col7', 'text', 'Supplier', null);
						var listPoNumber = list1.addField('custpage_col2', 'text', 'Purchase Order', null);
						var listDocNum = list1.addField('custpage_col3', 'text', 'PO Line No', null);
						var listItem = list1.addField('custpage_col8', 'text', 'Item', null);
						var listAlloc = list1.addField('custpage_col4', 'float', 'On Consignment', null);
						var listDetId = list1.addField('custpage_col5', 'text', 'Detail Id', null);
						listDetId.setDisplayType('hidden');
						
						var listPOId = list1.addField('custpage_col6', 'text', 'PO Id', null);
						listPOId.setDisplayType('hidden');
						
						var listSupplierId = list1.addField('custpage_col9', 'text', 'Supplier Id', null);
						listSupplierId.setDisplayType('hidden');
						
						var listSublistLine = list1.addField('custpage_col10', 'text', 'Sublist Line No', null);
						listSublistLine.setDisplayType('hidden');
		
						var listLocation = list1.addField('custpage_col11', 'select', 'Location', 'location');
						listLocation.setDisplayType('entry');
						listLocation.setMandatory(true);
						
						var listQuantity = list1.addField('custpage_col12', 'float', 'Qty Received', null);
						listQuantity.setDisplayType('entry');
						listQuantity.setMandatory(true);
						
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
								
							list1.setLineItemValue('custpage_col2', linenum, linePoTxt);
							list1.setLineItemValue('custpage_col3', linenum, linePoLine);
							list1.setLineItemValue('custpage_col4', linenum, lineAllocated);
							list1.setLineItemValue('custpage_col5', linenum, lineDetailId);
							list1.setLineItemValue('custpage_col6', linenum, linePoId);
							list1.setLineItemValue('custpage_col7', linenum, lineSupplier);
							list1.setLineItemValue('custpage_col8', linenum, lineItem);
							list1.setLineItemValue('custpage_col9', linenum, lineSupplierId);
							list1.setLineItemValue('custpage_col10', linenum, linenum);
							list1.setLineItemValue('custpage_col12', linenum, lineAllocated);

						}
					
						// Add a submit button
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
				
				response.sendRedirect('SUITELET', 'customscript_bbs_receive_consignments', 'customdeploy_bbs_receive_consignments',null,params);
				
				break;
					
			case 1:

				//Now process the selected records
				//
				var purchaseOrdersArray = {};
				
				//Get the consignment id & the consignment record
				//
				var paramConsId = request.getParameter('custpage_consignment');
				var consignmentRecord = nlapiLoadRecord('customrecord_bbs_consignment', paramConsId);
				
				//Get the default item receipt location
				//
				var itemReceiptLoc = nlapiGetContext().getPreference('custscript_bbs_cons_rec_loc');
				
				//Get the arrival date of the consignment
				//
				var arrivalDate = request.getParameter('custpage_arrival_date');
				
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
					
					//Create a data elemnt that is the po id + the po line no + the line number from the consignment detail sublist
					//
					var poAndLine = poId.toString() + '|' + poLine.toString() + '|' + sublistLineNo.toString() + '|' + sublistLocation.toString() + '|' + sublistReceived.toString();
						
					//Build list of purchase orders/lines that are to processed
					//
					if(!purchaseOrdersArray[poId])
						{
							//If supplier not in array, then add 
							purchaseOrdersArray[poId] = [];
						}
						
					//Save the po & line into the relevant po row of the po array
					//
					purchaseOrdersArray[poId][purchaseOrdersArray[poId].length] = poAndLine;
							
				}
				
				//Now we have an array of po's/lines
				//We can generate the item receipts
				//
				
				//Loop round the po's
				//
				for ( var purchaseOrderId in purchaseOrdersArray) 
				{
					var linesForSupplier = {};
					var lastPoId = '';
					var poRecord = null;
					
					//Create a new fulfilment for each po, we do this by transforming the po into a fulfilment
					//
					var itemRecieptRecord = null;
					
					try
						{
							itemRecieptRecord = nlapiTransformRecord('purchaseorder', purchaseOrderId, 'itemreceipt', {recordmode: 'dynamic'});
						}
					catch(err)
						{
							itemRecieptRecord = null;
						}
					
					if(itemRecieptRecord != null)
						{
							itemRecieptRecord.setFieldValue('landedcostperline', 'T');
							
							var itemReceiptLines = itemRecieptRecord.getLineItemCount('item');
							
							//First set all the lines on the receipt to be not received
							//
							var receiptLineCount = itemRecieptRecord.getLineItemCount('item');
							
							for (var int3 = 1; int3 <= receiptLineCount; int3++) 
								{
									itemRecieptRecord.setLineItemValue('item', 'itemreceive', int3, 'F');
								}
		
							//Load up the original po record
							//
							poRecord = nlapiLoadRecord('purchaseorder', purchaseOrderId);
							
							//Get the po/line data for this po
							//
							var poData = purchaseOrdersArray[purchaseOrderId];
							
							//Loop round each of the pos/lines for this po
							//
							for (var int2 = 0; int2 < poData.length; int2++) 
								{
									var poAndLine = poData[int2];
									
									//Split the PO & line number out
									//
									var poAndLineArray = poAndLine.split('|');
									var poId = poAndLineArray[0];
									var poLine = poAndLineArray[1];
									var consignmentSublistLine = poAndLineArray[2];
									var consignmentLocation = poAndLineArray[3];
									var consignmentReceived = poAndLineArray[4];
									
									if (consignmentLocation == '')
										{
											consignmentLocation = itemReceiptLoc;
										}
									
									//Update the lines with the receipt value, location etc.
									//
									if(Number(consignmentReceived) > 0)
										{
											//Get the actual line number from the item sublist on the po
											//
											//var actualPoLineNo = poRecord.getLineItemValue('item', 'line', poLine);
											var actualPoLineNo = poLine;
											var poSublistLine = libFindLine(poRecord, 'item', poLine);
											
											//Update the po line to reduce the on consignment quantity
											//
											var onConsignment = Number(poRecord.getLineItemValue('item', 'custcol_bbs_consignment_allocated', poSublistLine));
											onConsignment = onConsignment - Number(consignmentReceived);
											
											poRecord.setLineItemValue('item', 'custcol_bbs_consignment_allocated', poSublistLine, onConsignment);
											
											//Now find the corresponding line no in the item receipt record
											//
											var itemReceiptLineNo = Number(0);
											
											for (var int4 = 1; int4 <= itemReceiptLines; int4++) 
												{
													var thisItemReceiptLineNo = itemRecieptRecord.getLineItemValue('item', 'line', int4);
													if(thisItemReceiptLineNo == actualPoLineNo)
														{
															itemReceiptLineNo = int4;
															break;
														}
												}
											
											if(itemReceiptLineNo != 0)
												{
													itemRecieptRecord.setLineItemValue('item', 'itemreceive', itemReceiptLineNo, 'T');
													itemRecieptRecord.setLineItemValue('item', 'location', itemReceiptLineNo, consignmentLocation);
													itemRecieptRecord.setLineItemValue('item', 'quantity', itemReceiptLineNo, consignmentReceived);
												}
											//itemRecieptRecord.setLineItemValue('item', 'itemreceive', poLine, 'T');
											//itemRecieptRecord.setLineItemValue('item', 'location', poLine, consignmentLocation);
											//itemRecieptRecord.setLineItemValue('item', 'quantity', poLine, consignmentReceived);
										}
								}
							
							//Save the po record
							//
							try
								{
									nlapiSubmitRecord(poRecord, false, true);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Error saving PO record', err.message);
								}
							
							//Save the item receipt
							//
							var itemReceiptId = null;
							
							try
								{
									itemReceiptId = nlapiSubmitRecord(itemRecieptRecord, true, false);
								}
							catch(err)
								{
									itemReceiptId = null;
									nlapiLogExecution('ERROR', 'Error saving Item Receipt record', err.message);
								}
							
							//Update the consignment detail sublist with the item receipt id
							//
							for (var int2 = 0; int2 < poData.length; int2++) 
								{
									var poAndLine = poData[int2];
									var poAndLineArray = poAndLine.split('|');
									
									//Split the consignment sublist line out
									//
									var consignmentSublistLine = poAndLineArray[2];
									var consignmentReceived = poAndLineArray[4];
									
									//Update the sublist line
									//
									consignmentRecord.setLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_cons_det_item_receipt', consignmentSublistLine, itemReceiptId);
									consignmentRecord.setLineItemValue('recmachcustrecord_bbs_consignment_header_id', 'custrecord_bbs_con_det_received', consignmentSublistLine, consignmentReceived);
									
								}
						}
				}
				
				//Mark consignment as received & update actual arrival date
				//
				consignmentRecord.setFieldValue('custrecord_bbs_consignment_status', 3);
				consignmentRecord.setFieldValue('custrecord_bbs_consignment_aad', arrivalDate);
				
				//Save the consignment record
				//
				try
					{
						nlapiSubmitRecord(consignmentRecord, false, true);
					}
				catch(err)
					{
						nlapiLogExecution('ERROR', 'Error saving Item Consignment record', err.message);
					}
				
				//Back out the inventory adjustment that we used while the goods were in transit
				//
				var useInTranLoc = nlapiGetContext().getPreference('custscript_bbs_cons_use_in_transit_loc');
				
				if (useInTranLoc == 'T')
				{
					InTranLoc = nlapiGetContext().getPreference('custscript_bbs_cons_in_transit_loc');
					InTranAcc = nlapiGetContext().getPreference('custscript_bbs_cons_in_transit_account');
					
					libStockAdjustInTransit(consignmentRecord.getId(), 'OUT', InTranLoc, InTranAcc);
				}
				
				//Redirect back to the consignment record
				//
				nlapiSetRedirectURL('RECORD', 'customrecord_bbs_consignment', paramConsId, false, null);
				
		}
	}

}
