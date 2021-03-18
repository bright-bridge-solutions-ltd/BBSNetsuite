/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['./BBSPackingLibrary', 'N/currentRecord','N/format','N/ui/dialog', 'N/url', 'N/runtime'],

function(BBSPackingLibrary, currentRecord, format, dialog, url, runtime) 
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
    				var stage 		= Number(scriptContext.currentRecord.getValue({fieldId: 'custpage_param_stage'}));
    				
    				if(stage == 2)
    					{
    			//			document.getElementById("tbl_submitter").style.visibility = "hidden"; 
    			//			document.getElementById("tbl_secondarysubmitter").style.visibility = "hidden"; 
    					
    						var lines = scriptContext.currentRecord.getLineCount({sublistId: 'custpage_sublist_items'});

	    		    		for (var int = 1; int <= lines; int++) 
	    			    		{
	    		    				document.getElementById('custpage_sl_item_carton' + int.toString()).disabled = true;
	    		    			//	document.getElementById('custpage_sl_item_weight' + int.toString()).disabled = true;
	    		    			//	document.getElementById('custpage_sl_item_qty' + int.toString()).disabled = true;
	    		    				document.getElementById('custpage_sl_item_qty_pack' + int.toString()).disabled = true;
	    		    				document.getElementById('custpage_sl_item_qty_weight' + int.toString()).disabled = true;
	    			    		}
	    		    		
	    		    		//Put the focus back on to the item input field
	    			    	//
	    			    	document.getElementById("custpage_entry_item").focus();
    					}
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
	    	//Number formatting prototype
	    	//
	    	Number.formatFunctions={count:0};
	    	Number.prototype.numberFormat=function(format,context){if(isNaN(this)||this==+Infinity||this==-Infinity){return this.toString()}if(Number.formatFunctions[format]==null){Number.createNewFormat(format)}return this[Number.formatFunctions[format]](context)};Number.createNewFormat=function(format){var funcName="format"+Number.formatFunctions.count++;Number.formatFunctions[format]=funcName;var code="Number.prototype."+funcName+" = function(context){\n";var formats=format.split(";");switch(formats.length){case 1:code+=Number.createTerminalFormat(format);break;case 2:code+='return (this < 0) ? this.numberFormat("'+String.escape(formats[1])+'", 1) : this.numberFormat("'+String.escape(formats[0])+'", 2);';break;case 3:code+='return (this < 0) ? this.numberFormat("'+String.escape(formats[1])+'", 1) : ((this == 0) ? this.numberFormat("'+String.escape(formats[2])+'", 2) : this.numberFormat("'+String.escape(formats[0])+'", 3));';break;default:code+="throw 'Too many semicolons in format string';";break}eval(code+"}")};Number.createTerminalFormat=function(format){if(format.length>0&&format.search(/[0#?]/)==-1){return"return '"+String.escape(format)+"';\n"}var code="var val = (context == null) ? new Number(this) : Math.abs(this);\n";var thousands=false;var lodp=format;var rodp="";var ldigits=0;var rdigits=0;var scidigits=0;var scishowsign=false;var sciletter="";m=format.match(/\..*(e)([+-]?)(0+)/i);if(m){sciletter=m[1];scishowsign=m[2]=="+";scidigits=m[3].length;format=format.replace(/(e)([+-]?)(0+)/i,"")}var m=format.match(/^([^.]*)\.(.*)$/);if(m){lodp=m[1].replace(/\./g,"");rodp=m[2].replace(/\./g,"")}if(format.indexOf("%")>=0){code+="val *= 100;\n"}m=lodp.match(/(,+)(?:$|[^0#?,])/);if(m){code+="val /= "+Math.pow(1e3,m[1].length)+"\n;"}if(lodp.search(/[0#?],[0#?]/)>=0){thousands=true}if(m||thousands){lodp=lodp.replace(/,/g,"")}m=lodp.match(/0[0#?]*/);if(m){ldigits=m[0].length}m=rodp.match(/[0#?]*/);if(m){rdigits=m[0].length}if(scidigits>0){code+="var sci = Number.toScientific(val,"+ldigits+", "+rdigits+", "+scidigits+", "+scishowsign+");\n"+"var arr = [sci.l, sci.r];\n"}else{if(format.indexOf(".")<0){code+="val = (val > 0) ? Math.ceil(val) : Math.floor(val);\n"}code+="var arr = val.round("+rdigits+").toFixed("+rdigits+").split('.');\n";code+="arr[0] = (val < 0 ? '-' : '') + String.leftPad((val < 0 ? arr[0].substring(1) : arr[0]), "+ldigits+", '0');\n"}if(thousands){code+="arr[0] = Number.addSeparators(arr[0]);\n"}code+="arr[0] = Number.injectIntoFormat(arr[0].reverse(), '"+String.escape(lodp.reverse())+"', true).reverse();\n";if(rdigits>0){code+="arr[1] = Number.injectIntoFormat(arr[1], '"+String.escape(rodp)+"', false);\n"}if(scidigits>0){code+="arr[1] = arr[1].replace(/(\\d{"+rdigits+"})/, '$1"+sciletter+"' + sci.s);\n"}return code+"return arr.join('.');\n"};Number.toScientific=function(val,ldigits,rdigits,scidigits,showsign){var result={l:"",r:"",s:""};var ex="";var before=Math.abs(val).toFixed(ldigits+rdigits+1).trim("0");var after=Math.round(new Number(before.replace(".","").replace(new RegExp("(\\d{"+(ldigits+rdigits)+"})(.*)"),"$1.$2"))).toFixed(0);if(after.length>=ldigits){after=after.substring(0,ldigits)+"."+after.substring(ldigits)}else{after+="."}result.s=before.indexOf(".")-before.search(/[1-9]/)-after.indexOf(".");if(result.s<0){result.s++}result.l=(val<0?"-":"")+String.leftPad(after.substring(0,after.indexOf(".")),ldigits,"0");result.r=after.substring(after.indexOf(".")+1);if(result.s<0){ex="-"}else if(showsign){ex="+"}result.s=ex+String.leftPad(Math.abs(result.s).toFixed(0),scidigits,"0");return result};Number.prototype.round=function(decimals){if(decimals>0){var m=this.toFixed(decimals+1).match(new RegExp("(-?\\d*).(\\d{"+decimals+"})(\\d)\\d*$"));if(m&&m.length){return new Number(m[1]+"."+String.leftPad(Math.round(m[2]+"."+m[3]),decimals,"0"))}}return this};Number.injectIntoFormat=function(val,format,stuffExtras){var i=0;var j=0;var result="";var revneg=val.charAt(val.length-1)=="-";if(revneg){val=val.substring(0,val.length-1)}while(i<format.length&&j<val.length&&format.substring(i).search(/[0#?]/)>=0){if(format.charAt(i).match(/[0#?]/)){if(val.charAt(j)!="-"){result+=val.charAt(j)}else{result+="0"}j++}else{result+=format.charAt(i)}++i}if(revneg&&j==val.length){result+="-"}if(j<val.length){if(stuffExtras){result+=val.substring(j)}if(revneg){result+="-"}}if(i<format.length){result+=format.substring(i)}return result.replace(/#/g,"").replace(/\?/g," ")};Number.addSeparators=function(val){return val.reverse().replace(/(\d{3})/g,"$1,").reverse().replace(/^(-)?,/,"$1")};String.prototype.reverse=function(){var res="";for(var i=this.length;i>0;--i){res+=this.charAt(i-1)}return res};String.prototype.trim=function(ch){if(!ch)ch=" ";return this.replace(new RegExp("^"+ch+"+|"+ch+"+$","g"),"")};String.leftPad=function(val,size,ch){var result=new String(val);if(ch==null){ch=" "}while(result.length<size){result=ch+result}return result};String.escape=function(string){return string.replace(/('|\\)/g,"\\$1")};
	    	
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
					
					//Get the quantity from the last carton
					//
					var packedQuantity = Number(scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty_pack'}));
					
					var qtyPerCarton 	= scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty'});
					var weightPerCarton = scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_weight'});
					var cartonNames 	= scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_carton'});
					var cartonIds	 	= scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_carton_id'});
					
					var qtyPerCartonArray 		= qtyPerCarton.split(',');
					var weightPerCartonArray 	= weightPerCarton.split(',');
					var cartonNamesArray 		= cartonNames.split(',');
					var cartonIdsArray 			= cartonIds.split(',');
					
					var lastQuantity = Number(qtyPerCartonArray[qtyPerCartonArray.length - 1]);
					var newPackedQuantity = packedQuantity - lastQuantity;
					
					qtyPerCartonArray.pop();
					weightPerCartonArray.pop();
					cartonNamesArray.pop();
					cartonIdsArray.pop();
					
					for (var weightIndex = 0; weightIndex < weightPerCartonArray.length; weightIndex++) 
						{
							weightPerCartonArray[weightIndex] = Number(weightPerCartonArray[weightIndex]).numberFormat("0.00");
						}
				
					for (var quantityIndex = 0; quantityIndex < qtyPerCartonArray.length; quantityIndex++) 
						{
							qtyPerCartonArray[quantityIndex] = Number(qtyPerCartonArray[quantityIndex]).numberFormat("0");
						}
					
					//Set values
					//
					//scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_weight', value: null, ignoreFieldChange: true});
					//scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty', value: null, ignoreFieldChange: true});
					//scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty_pack', value: format.parse({value: 0.0, type: format.Type.FLOAT}), ignoreFieldChange: true});						    					
					//scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_carton', value: null, ignoreFieldChange: true});						    					
					//scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_carton_id', value: null, ignoreFieldChange: true});						    					
					
					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty_pack', value: newPackedQuantity.numberFormat("0"), ignoreFieldChange: true});						    					
					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_weight', value: weightPerCartonArray.toString(), ignoreFieldChange: true});
					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty', value: qtyPerCartonArray.toString(), ignoreFieldChange: true});
					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_carton_id', value: cartonIdsArray.toString(), ignoreFieldChange: true});						    					
					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_carton', value: cartonNamesArray.toString(), ignoreFieldChange: true});						    					
					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_remove', value: false, ignoreFieldChange: true});						    					
			    	
					var displayString = '';
					
					for (var quantityIndex = 0; quantityIndex < qtyPerCartonArray.length; quantityIndex++) 
    					{
							displayString += Number(qtyPerCartonArray[quantityIndex]).numberFormat("0") + '(' + Number(weightPerCartonArray[quantityIndex]).numberFormat("0.00") + '), ';
						}
					
					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty_weight', value: displayString.slice(0,-2), ignoreFieldChange: true});						    					
					
					//Commit
					//
					scriptContext.currentRecord.commitLine({sublistId: 'custpage_sublist_items'});
			    	
					setRowColour(sublistLine, '#FFFFFF');
					
					recalculateCompletedLines(scriptContext);
					
					//Put the focus back on to the item input field
			    	//
			    	document.getElementById("custpage_entry_item").focus();
				}
	    	
	    	
    		//Selection of an item
    		//
	    	if(scriptContext.fieldId == 'custpage_entry_item' && scriptContext.sublistId == null)
				{
			    	//Get the value of the entered item
			    	//
			    	var selectionValue = scriptContext.currentRecord.getValue({fieldId: 'custpage_entry_item'});
			    	
			    	//Get the quantity override value
			    	//
			    	var overrideValue = Number(scriptContext.currentRecord.getValue({fieldId: 'custpage_entry_qty_override'}));

			    	//Check to see if we have entered something
			    	//
			    	if(selectionValue != null && selectionValue != '')
			    		{
			    			//Get the value of the current carton from the form
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
						    				if(sublistItem == itemInfo.itemId && sublistQty < sublistRequired)
						    					{
						    						//Select the line
						    						//
							    					scriptContext.currentRecord.selectLine({sublistId: 'custpage_sublist_items', line: int});
							    					
							    					//Increment the line quantity by the uom factor (defaults to 1)
							    					//
							    					sublistQty += (overrideValue > 0 ? overrideValue: itemInfo.itemUomFactor);
							    					
							    					//Update the values & commit
							    					//
							    					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty_pack', value: sublistQty.numberFormat("0"), ignoreFieldChange: true});						    					
							    					
							    					var lineCarton 		= scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_carton'});
							    					var lineCartonId 	= scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_carton_id'});
							    					var lineWeight 		= scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_weight'});
							    					var lineQuantity	= scriptContext.currentRecord.getCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty'});
								    				
							    					var cartonArray 		= (lineCarton == '' ? [] : lineCarton.split(','));
							    					var cartonArrayId 		= (lineCartonId == '' ? [] : lineCartonId.split(','));
							    					var cartonArrayWeight	= (lineWeight == '' ? [] : lineWeight.split(','));
							    					var cartonArrayQuantity	= (lineQuantity == '' ? [] : lineQuantity.split(','));
							    					
							    					if(cartonArray.indexOf(currentCartonName) == -1)
							    						{
							    							cartonArray.push(currentCartonName);
							    							cartonArrayId.push(currentCartonId);
							    							cartonArrayWeight.push((Number(itemInfo.itemWeight) * Number((overrideValue > 0 ? overrideValue: itemInfo.itemUomFactor))));
							    							cartonArrayQuantity.push((Number(1.0) * Number((overrideValue > 0 ? overrideValue: itemInfo.itemUomFactor))));
							    						}
							    					else
							    						{
							    							cartonArrayWeight[cartonArray.indexOf(currentCartonName)] = Number(cartonArrayWeight[cartonArray.indexOf(currentCartonName)]) + (Number(itemInfo.itemWeight) * Number((overrideValue > 0 ? overrideValue: itemInfo.itemUomFactor)));
							    							cartonArrayQuantity[cartonArray.indexOf(currentCartonName)] = Number(cartonArrayQuantity[cartonArray.indexOf(currentCartonName)]) + (Number(1.0) * Number((overrideValue > 0 ? overrideValue: itemInfo.itemUomFactor)));
							    						}
							    					
							    					for (var weightIndex = 0; weightIndex < cartonArrayWeight.length; weightIndex++) 
								    					{
							    							cartonArrayWeight[weightIndex] = Number(cartonArrayWeight[weightIndex]).numberFormat("0.00");
														}
							    					
							    					for (var quantityIndex = 0; quantityIndex < cartonArrayQuantity.length; quantityIndex++) 
								    					{
							    							cartonArrayQuantity[quantityIndex] = Number(cartonArrayQuantity[quantityIndex]).numberFormat("0");
														}
						    					
							    					var  newCarton 		= cartonArray.toString();
							    					var  newCartonId 	= cartonArrayId.toString();
							    					var  newWeight 		= cartonArrayWeight.toString();
							    					var  newQuantity	= cartonArrayQuantity.toString();
							    					
							    					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_carton', value: newCarton, ignoreFieldChange: true});						    					
							    					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_carton_id', value: newCartonId, ignoreFieldChange: true});						    					
							    					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_weight', value: newWeight, ignoreFieldChange: true});						    					
							    					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty', value: newQuantity, ignoreFieldChange: true});						    					
							    					
							    					//Display the quantity & weight together
							    					//
							    					var displayString = '';
							    					
							    					for (var quantityIndex = 0; quantityIndex < cartonArrayQuantity.length; quantityIndex++) 
								    					{
							    							displayString += Number(cartonArrayQuantity[quantityIndex]).numberFormat("0") + '(' + Number(cartonArrayWeight[quantityIndex]).numberFormat("0.00") + '), ';
														}
							    					
							    					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty_weight', value: displayString.slice(0,-2), ignoreFieldChange: true});						    					
							    					
							    					//Blank out the entry fields
							    					//
							    					scriptContext.currentRecord.commitLine({sublistId: 'custpage_sublist_items'});
							    					scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_item', value: null});
							    					scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_qty_override', value: ''});
							    					scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_qty_override', value: ''});
							    					
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
									    	
											    	recalculateCompletedLines(scriptContext);
													
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
					    					var warnings = 'Item code "' + selectionValue + '"not availaible on any line<br/><br/>';
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
								    		      			scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_qty_override', value: ''});
							    		      				document.getElementById("custpage_entry_item").focus();
							    		      			}
							    		      		
							    		      	}

						    		      	//Display the dialogue box
						    		      	//
						    		      	dialog.alert(options).then(success);
						    		      	scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_item', value: null});
						    		      	scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_qty_override', value: ''});
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
						    		      			scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_qty_override', value: ''});
					    		      				document.getElementById("custpage_entry_item").focus();
					    		      			}
					    		      	}
	
				    		      	//Display the dialogue box
				    		      	//
				    		      	dialog.alert(options).then(success);
				    		      	scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_item', value: null});
				    		      	scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_qty_override', value: ''});
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
		    		var missingProducts	= [];
		    		
		    		for (var int = 0; int < lines; int++) 
			    		{
							var qtyRequired = Number(scriptContext.currentRecord.getSublistValue({
																					sublistId: 'custpage_sublist_items',
																					fieldId:	'custpage_sl_item_qty_req',
																					line:		int
																					}));
							
							var qtyPacked = Number(scriptContext.currentRecord.getSublistValue({
																				sublistId: 'custpage_sublist_items',
																				fieldId:	'custpage_sl_item_qty_pack',
																				line:		int
																				}));

							var itemName = scriptContext.currentRecord.getSublistValue({
																				sublistId: 'custpage_sublist_items',
																				fieldId:	'custpage_sl_item_text',
																				line:		int
																				});
							if(qtyRequired == qtyPacked)
								{
									completedCount++;
								}
							else
								{
									missingProducts.push(itemName);
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
		        			var warnings = 'The following products have not been processed properly<br/><br/>';
		        			warnings += missingProducts.join('<br/>');
		        			
		        			//warnings += '<p style="color:Red;">Click \"Ok\" to Continue, \"Cancel\" to Amend<p/>';
		        			var titleText = '❗Alert';
		    	      		var options = 	{
		    		      					title: titleText,
		    		      					message: warnings
		    		      					};
		    		  
		    	      		//Function that is called when the dialogue box completes
		    	      		//
		    		      	function success(result) 
			    		      	{ 
			    		      		document.getElementById("custpage_entry_item").focus();
			    		      	}

		    		      	//Display the dialogue box
		    		      	//
		    		      	dialog.alert(options).then(success);
		    		      	document.getElementById("custpage_entry_item").focus();
		    		      	
		        	  	}
    			}
    		else
    			{
    				return true;
    			}
	    }
    
    function recalculateCompletedLines(scriptContext)
    	{
	    	//Get the line count of the sublist
			//
			var lines 		= scriptContext.currentRecord.getLineCount({sublistId: 'custpage_sublist_items'});
			var completed	= Number(0);
			
			//Loop through the sublist lines
			//
			for (var int = 0; int < lines; int++) 
				{
					//Get the quantities
					//
					var sublistRequired = Number(scriptContext.currentRecord.getSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty_req', line: int}));
					var sublistQty 		= Number(scriptContext.currentRecord.getSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_item_qty_pack', line: int}));
					
					if(sublistRequired == sublistQty)
						{
							completed++;
						}
				}
			
			var currRec = currentRecord.get();
    		
    		currRec.setValue({fieldId: 'custpage_entry_lines_complete', value: completed});
    	}
	
    function abandonButton(workstation, scriptId, deploymentId)
		{
    		debugger;
    		var redirect = url.resolveScript({
								scriptId: 		scriptId, 
								deploymentId:	deploymentId, 
								params:			{
													stage: 			1,
													wsid:			workstation						//Internal id of the workstation
												}
								});
    		
    		// Open the suitelet in the current window
    		//
    		window.open(redirect, '_self', 'Packing');
		}

    function newCarton()
    	{
    		var cartonDetails 	= BBSPackingLibrary.libCreateNewCarton();
    		var currRec 		= currentRecord.get();
    		
    		currRec.setValue({fieldId: 'custpage_entry_carton_id', value: cartonDetails.cartonId});
    		currRec.setValue({fieldId: 'custpage_entry_carton_number', value: cartonDetails.cartonNumber});
    		
    		//Put the focus back on to the item input field
	    	//
	    	document.getElementById("custpage_entry_item").focus();
    	}
    
    function setRowColour(rowNumber, tdColor)
    	{
	    	//var tdColor = '#B2FF33'; //(Light Green)
	    	var trDom 		= document.getElementById('custpage_sublist_itemsrow' + rowNumber);
	    	var trDomChild 	= trDom.children;
	    	
	    	for (var t=0; t < (trDomChild.length - 4); t+=1)
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
    		abandonButton:	abandonButton
    		};
    
});
