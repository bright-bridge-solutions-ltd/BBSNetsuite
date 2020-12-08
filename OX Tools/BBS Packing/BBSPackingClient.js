/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['./BBSPackingLibrary', 'N/currentRecord','N/format'],

function(BBSPackingLibrary, currentRecord, format) 
{

	/**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) 
	    {
	    	//Remove from carton
			//
	    	if(scriptContext.fieldId == 'custpage_sl_remove' && scriptContext.sublistId == 'custpage_sublist_items')
				{
	    			var sublistLine = scriptContext.line;
	    			
	    			//Select the line
					//
					scriptContext.currentRecord.selectLine({sublistId: 'custpage_sublist_items', line: sublistLine});
					
					//Set values
					//
					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty_pack', value: format.parse({value: 0.0, type: format.Type.FLOAT}), ignoreFieldChange: true});						    					
					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_weight', value: null, ignoreFieldChange: true});						    					
					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_carton_id', value: null, ignoreFieldChange: true});						    					
					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_carton', value: null, ignoreFieldChange: true});						    					
					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_remove', value: false, ignoreFieldChange: true});						    					
			    	
					//Commit
					//
					scriptContext.currentRecord.commitLine({sublistId: 'custpage_sublist_items'});
			    	
					setRowColour(sublistLine, '#FFFFFF');
					
				}
    		//Selection of an item
    		//
	    	if(scriptContext.fieldId == 'custpage_entry_item' && scriptContext.sublistId == null)
				{
			    	debugger;
			    	
			    	//Get the value of the entered item
			    	//
			    	var selectionValue = scriptContext.currentRecord.getValue({fieldId: 'custpage_entry_item'});
			    	
			    	//Check to see if we have entered something
			    	//
			    	if(selectionValue != null && selectionValue != '')
			    		{
			    			//Get the value of the current cartpn from the form
			    			//
			    			var currentCartonName 	= scriptContext.currentRecord.getValue({fieldId: 'custpage_entry_carton_number'});
			    			var currentCartonId 	= scriptContext.currentRecord.getValue({fieldId: 'custpage_entry_carton_id'});
			    				
			    			//Find the item based on the item name, upc code or item alias
			    			//
			    			var itemInfo = BBSPackingLibrary.findItem(selectionValue);
			    			
			    			if(itemInfo != null)
			    				{
			    					var lineUpdated = false;
			    					
					    			//Get the line count of the sublist
					    			//
					    			var lines = scriptContext.currentRecord.getLineCount({sublistId: 'custpage_sublist_items'});
					    			
					    			//Loop through the sublist lines
					    			//
					    			for (var int = 0; int < lines; int++) 
						    			{
					    					//Get the item id & quantity
					    					//
						    				var sublistItem = scriptContext.currentRecord.getSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_id', line: int});
						    				var sublistRequired = Number(scriptContext.currentRecord.getSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty_req', line: int}));
						    				var sublistQty = Number(scriptContext.currentRecord.getSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty_pack', line: int}));
						    				
						    				//Does the item id on the line match the one we are searching for?
						    				//
						    				if(sublistItem == itemInfo.itemId)
						    					{
						    						//Select the line
						    						//
							    					scriptContext.currentRecord.selectLine({sublistId: 'custpage_sublist_items', line: int});
							    					
							    					//Increment the line quantity by the uom factor (defaults to 1)
							    					//
							    					//sublistQty++;
							    					sublistQty += itemInfo.itemUomFactor;
							    					
							    					//Increment the weight
							    					//
							    					//sublistWeight += (Number(itemInfo.itemWeight) * Number(itemInfo.itemUomFactor));
							    					
							    					//Update the values & commit
							    					//
							    					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty_pack', value: format.parse({value: sublistQty, type: format.Type.FLOAT}), ignoreFieldChange: true});						    					
							    					//scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_weight', value: format.parse({value: sublistWeight, type: format.Type.FLOAT}), ignoreFieldChange: true});						    					
							    					
							    					var lineCarton 		= scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_carton'});
							    					var lineCartonId 	= scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_carton_id'});
							    					var lineWeight 		= scriptContext.currentRecord.getSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_weight', line: int});
								    				
							    					var cartonArray 		= (lineCarton == '' ? [] : lineCarton.split(','));
							    					var cartonArrayId 		= (lineCartonId == '' ? [] : lineCartonId.split(','));
							    					var cartonArrayWeight	= (lineWeight == '' ? [] : lineWeight.split(','));
							    					
							    					if(cartonArray.indexOf(currentCartonName) == -1)
							    						{
							    							cartonArray.push(currentCartonName);
							    							cartonArrayId.push(currentCartonId);
							    							cartonArrayWeight.push((Number(itemInfo.itemWeight) * Number(itemInfo.itemUomFactor)));
							    						}
							    					else
							    						{
							    							cartonArrayWeight[cartonArray.indexOf(currentCartonName)] = Number(cartonArrayWeight[cartonArray.indexOf(currentCartonName)]) + (Number(itemInfo.itemWeight) * Number(itemInfo.itemUomFactor));
							    						}
							    					
							    					var  newCarton 		= cartonArray.toString();
							    					var  newCartonId 	= cartonArrayId.toString();
							    					var  newWeight 		= cartonArrayWeight.toString();
							    					
							    					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_carton', value: newCarton, ignoreFieldChange: true});						    					
							    					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_carton_id', value: newCartonId, ignoreFieldChange: true});						    					
							    					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_weight', value: newWeight, ignoreFieldChange: true});						    					
							    					
							    					scriptContext.currentRecord.commitLine({sublistId: 'custpage_sublist_items'});
											    	scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_item', value: null});
											    	
											    	//Set the colour
											    	//
											    	if(sublistQty == sublistRequired)
											    		{
											    			setRowColour(int, '#B2FF33');
											    		}
											    	
											    	if(sublistQty > sublistRequired)
											    		{
											    			setRowColour(int, '#ff9999');
											    		}
										    	
											    	if(sublistQty < sublistRequired)
											    		{
											    			setRowColour(int, '#FFFFFF');
											    		}
									    	
											    	//We have updated a line
											    	//
											    	lineUpdated = true;
											    	
											    	break;
						    					}
						    			}
					    			
					    			//Check to see if we found the item on the sublist, if not send a message
					    			//
					    			if(!lineUpdated)
					    				{
						    				Ext.Msg.minWidth = 500;
											Ext.Msg.alert('❗Alert', 'Item code "' + selectionValue + '"not found on any line', Ext.emptyFn)
											
											scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_item', value: null});
					    				}
			    				}
			    			else
			    				{
				    				Ext.Msg.minWidth = 500;
									Ext.Msg.alert('❗Alert', 'Item code not found - ' + selectionValue, Ext.emptyFn);
									
									scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_item', value: null});
			    				}
			    		}
			    	
			    	//Put the focus back on to the item input field
			    	//
			    	document.getElementById("custpage_entry_item").focus();
				}
	    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) 
	    {
    		debugger;
    		
    		var stage 		= Number(scriptContext.currentRecord.getValue({fieldId: 'custpage_param_stage'}));
    		
    		if(stage == 2)
    			{
		    		var lines 			= scriptContext.currentRecord.getLineCount({sublistId: 'custpage_sublist_items'});
		    		var completedCount	= Number(0);
		    		
		    		for (var int = 0; int < lines; int++) 
			    		{
							var cartonId = scriptContext.currentRecord.getSublistValue({
																					sublistId: 'custpage_sublist_items',
																					fieldId:	'custpage_sl_item_carton_id',
																					line:		int
																					});	
							if(cartonId != null && cartonId != '')
								{
									completedCount++;
								}
						}
		    		
		    		if(completedCount != lines)
		    			{
			    			Ext.Msg.minWidth = 500;
							Ext.Msg.alert('❗Alert', 'Not all lines have a carton allocated, please allocate all lines to cartons', Ext.emptyFn);
							
							return false;
		    			}

		    		return true;
    			}
    		else
    			{
    				return true;
    			}
	    }
    
    function newCarton()
    	{
    		var cartonDetails = BBSPackingLibrary.libCreateNewCarton();
    		
    		var currRec = currentRecord.get();
    		currRec.setValue({fieldId: 'custpage_entry_carton_id', value: cartonDetails.cartonId});
    		currRec.setValue({fieldId: 'custpage_entry_carton_number', value: cartonDetails.cartonNumber});
    	}
    
    function setRowColour(rowNumber, tdColor)
    	{
	    	//var tdColor = '#B2FF33'; //(Light Green)
	    	var trDom = document.getElementById('custpage_sublist_itemsrow' + rowNumber);
	    	var trDomChild = trDom.children;
	    	
	    	for (var t=0; t < (trDomChild.length - 1); t+=1)
		    	{
		    		//get the child TD DOM element
		    		var tdDom = trDomChild[t];
		    		
		    		tdDom.setAttribute('style','background-color: '+tdColor+'!important;border-color: white '+tdColor+' '+tdColor+' '+tdColor+'!important;');
		    			
		    	}
    	
    	}
    
    return 	{
    		fieldChanged: 	fieldChanged,
    		saveRecord:		saveRecord,
    		newCarton:		newCarton
    		};
    
});
