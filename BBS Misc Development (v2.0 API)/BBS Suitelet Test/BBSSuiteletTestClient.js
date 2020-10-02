/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],

function() 
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
    		if(scriptContext.fieldId == 'custpage_entry_bom_level' && scriptContext.sublistId == null)
    			{
			    	debugger;
			    	var selectionValue = scriptContext.currentRecord.getValue({fieldId: 'custpage_entry_bom_level'});
			    	
			    	if(selectionValue != null && selectionValue != '')
			    		{
			    			var selectionValueNumber = Number(selectionValue);
			    			
					    	scriptContext.currentRecord.selectLine({sublistId: 'custpage_sublist_items', line: selectionValueNumber});
					    	scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_items_tick', value: true, ignoreFieldChange: true});
					    	scriptContext.currentRecord.commitLine({sublistId: 'custpage_sublist_items'});
					    	
					    	var tdColor = '#B2FF33'; //(Light Green)
					    	var trDom = document.getElementById('custpage_sublist_itemsrow'+selectionValue);
					    	var trDomChild = trDom.children;
					    	
					    	for (var t=0; t < (trDomChild.length-1); t+=1)
						    	{
						    		//get the child TD DOM element
						    		var tdDom = trDomChild[t];
	
						    		//We are now going to override the style of THIS CELL 
						    		//	and change the background color
						    		//	by using setAttribute method of DOM object
	
						    		tdDom.setAttribute(
						    			'style',
						    			//This is the magic CSS that changes the color
						    			//	This is Same method used when NetSuite returns saved search results
						    			//	with user defined row high lighting logic!
						    			'background-color: '+tdColor+'!important;border-color: white '+tdColor+' '+tdColor+' '+tdColor+'!important;'
						    		);
						    	}
					    	
					    	
			    		}
    			}
	    	
    		if(scriptContext.fieldId == 'custpage_entry_item' && scriptContext.sublistId == null)
				{
			    	debugger;
			    	var selectionValue = scriptContext.currentRecord.getValue({fieldId: 'custpage_entry_item'});
			    	
			    	if(selectionValue != null && selectionValue != '')
			    		{
			    			var lines = scriptContext.currentRecord.getLineCount({sublistId: 'custpage_sublist_items'});
			    			
			    			for (var int = 0; int < lines; int++) 
				    			{
				    				var sublistItem = scriptContext.currentRecord.getSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_items_item', line: int});
				    				var sublistQty = Number(scriptContext.currentRecord.getSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_items_qty', line: int}));

				    				if(sublistItem == selectionValue)
				    					{
					    					scriptContext.currentRecord.selectLine({sublistId: 'custpage_sublist_items', line: int});
					    					
					    					sublistQty++;
					    					
					    					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_items_qty', value: sublistQty.toString(), ignoreFieldChange: true});
					    					scriptContext.currentRecord.setCurrentSublistValue({sublistId: 'custpage_sublist_items', fieldId: 'custpage_sl_items_tick', value: true, ignoreFieldChange: true});
									    	
									    	scriptContext.currentRecord.commitLine({sublistId: 'custpage_sublist_items'});
									    	
									    	scriptContext.currentRecord.setValue({fieldId: 'custpage_entry_item', value: null});
									    	
									    	break;
				    					}
				    			}
			    			
					    	
			    		}
				}
	    }

    return 	{
    		fieldChanged: 	fieldChanged
    		};
    
});
