/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/record', 'N/search', 'N/ui/dialog'],
/**
 * @param {currentRecord} currentRecord
 * @param {record} record
 * @param {search} search
 */
function(currentRecord, record, search, dialog) 
{   

     /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) 
	    {
    		if(scriptContext.sublistId == 'item' && scriptContext.fieldId == 'item')
    			{
	    			debugger;
					
	    			//Get the item that has been added to the line
	    			//
					var currentRecord 	= scriptContext.currentRecord;
					var currentItem 	= currentRecord.getCurrentSublistValue({sublistId: 'item', fieldId: 'item'});
					var currentItemText	= currentRecord.getCurrentSublistText({sublistId: 'item', fieldId: 'item'});
					var poSupplier		= currentRecord.getValue({fieldId: 'entity'});
					var poSupplierName	= currentRecord.getText({fieldId: 'entity'});
					var poSubsidiary	= currentRecord.getValue({fieldId: 'subsidiary'});
					var itemSuppliers	= {};
					
					//Only carry on if we have an item & the subsidiary is OK UK
					//
					if(currentItem != null && currentItem != '' && poSubsidiary == 12)	
						{
							//Find the suppliers associated with that item
							//
							var itemSearchObj = getResults(search.create({
																		   type:		"item",
																		   filters:
																					   	[
																					   	 	["internalid","anyof",currentItem]
																					    ],
																		   columns:
																					   [
																					      search.createColumn({name: "othervendor", label: "Supplier"})
																					   ]
																			}));
								
							//Add the suppliers to the itemSuppliers object
							//
							if(itemSearchObj != null && itemSearchObj.length > 0)
								{
									for (var int = 0; int < itemSearchObj.length; int++) 
										{
											itemSuppliers[itemSearchObj[int].getValue({name: "othervendor"})] = itemSearchObj[int].getText({name: "othervendor"});
										}
								}
							
							//See if the current PO supplier is in the list of suppliers for this item
							//
							if(!itemSuppliers.hasOwnProperty(poSupplier))
								{
									//Issue a warning if supplier not found
									//
									var options = 	{
								            		title: 		'Supplier Not Valid for Item',
								            		message: 	'Supplier "' + poSupplierName + '" is not listed as a as supplier for item "' + currentItemText + '"<br/><br/>Press OK to continue or Cancel to reset line'
								         			};
									
									function success(result) 
										{
											//If the user pressed 'cancel' then cancel/reste the current line
											//
								            if(!result)
								            	{
								            		currentRecord.cancelLine({sublistId: 'item'});
								            	}
								        }
									
								    function failure(reason) 
								    	{
								            console.log('Failure: ' + reason);
								        }
	
								    dialog.confirm(options).then(success).catch(failure);
								}
						}
    			}
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
    
    return 	{
	        postSourcing: 	postSourcing
    		};
    
});
