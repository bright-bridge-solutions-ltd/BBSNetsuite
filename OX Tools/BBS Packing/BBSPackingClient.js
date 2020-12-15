/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['./BBSPackingLibrary', 'N/currentRecord','N/format','N/ui/dialog'],

function(BBSPackingLibrary, currentRecord, format, dialog) 
{
	var DIALOGMODULE = dialog;
	
	//This global is used to detect if user has pressed "OK" in the prompt box
	//
	var IS_CONFIRMED; 

	/**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) 
	    {
    		debugger;
    		
    		try
    			{
    				//document.getElementById("custpage_entry_item").focus();
    			}
    		catch(err)
    			{
    			
    			}
	    }

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
    		debugger;
    		
    		//Sales order or item fulfillment entered
    		//
	    	if(scriptContext.fieldId == 'custpage_entry_so_if')
	    		{
		    		//Spoof pressing the save button on the form
	  				//
	    			document.getElementById("custpage_entry_so_if").focus();
	    			document.getElementById('submitter').click();
	    		}
    	
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

			    	
			    	//Get the value of the entered item
			    	//
			    	var selectionValue = scriptContext.currentRecord.getValue({fieldId: 'custpage_entry_item'});
			    	
			    	//Get the reverse flag
			    	//
			    	var reverseValue = scriptContext.currentRecord.getValue({fieldId: 'custpage_entry_reverse'});

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
							    					sublistQty += (reverseValue ? itemInfo.itemUomFactor * -1.0 : itemInfo.itemUomFactor);
							    					
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
							    					scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_reverse', value: false});
											    	
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
					    					var warnings = 'Item code "' + selectionValue + '"not found on any line<br/><br/>';
						        			warnings += '<p style="color:Red;">Click \"Ok\" to Continue<p/>';
						        			var titleText = '❗Alert';
						    	      		var options = 	{
						    		      					title: 		titleText,
						    		      					message: 	warnings
						    		      					};
						    		  
						    	      		//Function that is called when the dialogue box completes
						    	      		//
						    		      	function success(result) 
							    		      	{ 
							    		      		//See if we have clicked ok in the dialogue
							    		      		//
							    		      		if (result)
							    		      			{
								    		      			scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_item', value: null});
								    		      			scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_reverse', value: false});
							    		      				document.getElementById("custpage_entry_item").focus();
							    		      			}
							    		      		
							    		      	}

						    		      	//Display the dialogue box
						    		      	//
						    		      	dialog.alert(options).then(success);
						    		      	scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_item', value: null});
						    		      	scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_reverse', value: false});
						    		      	document.getElementById("custpage_entry_item").focus();
					    			
					    				}
			    				}
			    			else
			    				{
				    				var warnings = 'Item code not found - ' + selectionValue + '<br/><br/>';
				        			warnings += '<p style="color:Red;">Click \"Ok\" to Continue<p/>';
				        			var titleText = '❗Alert';
				    	      		var options = 	{
				    		      					title: 		titleText,
				    		      					message: 	warnings
				    		      					};
				    		  
				    	      		//Function that is called when the dialogue box completes
				    	      		//
				    		      	function success(result) 
					    		      	{ 
					    		      		//See if we have clicked ok in the dialogue
					    		      		//
					    		      		if (result)
					    		      			{
						    		      			scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_item', value: null});
						    		      			scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_reverse', value: false});
					    		      				document.getElementById("custpage_entry_item").focus();
					    		      			}
					    		      	}
	
				    		      	//Display the dialogue box
				    		      	//
				    		      	dialog.alert(options).then(success);
				    		      	scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_item', value: null});
				    		      	scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_reverse', value: false});
				    		      	document.getElementById("custpage_entry_item").focus();
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
		    		
		    		//If we have clicked ok on the dialogue or there are no customer actions, then return true
		          	//
		        	if(IS_CONFIRMED || completedCount == lines)
		        	  	{
		        	  		return true;
		        	  	}
		        	else
		        	  	{
		        			//Set up the options for the dialogue box
		        			//
		        			var warnings = 'Not all lines have a carton allocated<br/><br/>'
		        			warnings += '<p style="color:Red;">Click \"Ok\" to Continue, \"Cancel\" to Amend<p/>';
		        			var titleText = '❗Alert';
		    	      		var options = 	{
		    		      					title: titleText,
		    		      					message: warnings
		    		      					};
		    		  
		    	      		//Function that is called when the dialogue box completes
		    	      		//
		    		      	function success(result) 
			    		      	{ 
			    		      		//See if we have clicked ok in the dialogue
			    		      		//
			    		      		if (result)
			    		      			{
			    		      				//Update the global variable to show that we have clicked ok
			    		      				//
			    		      				IS_CONFIRMED = true;
			    		      				
			    		      				//Spoof pressing the save button on the form
			    		      				//
			    		      				document.getElementById('submitter').click();
			    		      			}
			    		      		else
			    		      			{
			    		      				document.getElementById("custpage_entry_item").focus();
			    		      			}
			    		      	}

		  
		    		      	
		    		      	//Display the dialogue box
		    		      	//
		    		      	dialog.confirm(options).then(success);
		    		      	document.getElementById("custpage_entry_item").focus();
		    		      	
		        	  	}
    			}
    		else
    			{
    				return true;
    			}
	    }
    
    function newCarton()
    	{
    		var cartonDetails 	= BBSPackingLibrary.libCreateNewCarton();
    		var currRec 		= currentRecord.get();
    		
    		currRec.setValue({fieldId: 'custpage_entry_carton_id', value: cartonDetails.cartonId});
    		currRec.setValue({fieldId: 'custpage_entry_carton_number', value: cartonDetails.cartonNumber});
    	}
    
    function setRowColour(rowNumber, tdColor)
    	{
	    	//var tdColor = '#B2FF33'; //(Light Green)
	    	var trDom 		= document.getElementById('custpage_sublist_itemsrow' + rowNumber);
	    	var trDomChild 	= trDom.children;
	    	
	    	for (var t=0; t < (trDomChild.length - 3); t+=1)
		    	{
		    		//get the child TD DOM element
		    		var tdDom = trDomChild[t];
		    		
		    		tdDom.setAttribute('style','background-color: '+tdColor+'!important;border-color: white '+tdColor+' '+tdColor+' '+tdColor+'!important;');
		    	}
    	
    	}
    
    return 	{
    		fieldChanged: 	fieldChanged,
    		saveRecord:		saveRecord,
    		newCarton:		newCarton,
    		pageInit: 		pageInit,
    		};
    
});
