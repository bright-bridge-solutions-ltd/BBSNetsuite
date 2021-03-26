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
    function fieldChanged(scriptContext) {
    	
    	// if the Department field has been changed
    	if (scriptContext.fieldId == 'department')
    		{
    			// get the value of the Department field
    			var department = scriptContext.currentRecord.getValue({
    				fieldId: 'department'
    			});
    			
    			// get the value of the Subsidiary field
    			var subsidiary = scriptContext.currentRecord.getValue({
    				fieldId: 'subsidiary'
    			});
    			
    			// call function to return the approval table
    			var approvalTable = getApprovalTable(department, subsidiary);
    			
    			// set the Approval Table field
    			scriptContext.currentRecord.setValue({
    				fieldId: 'custbody_bbs_po_approval_table',
    				value: approvalTable
    			});		
    		}

    }
	
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
    
    // =====================================
    // FUNCTION TO RETURN THE APPROVAL TABLE
    // =====================================
    
    function getApprovalTable(department, subsidiary) {
    	
    	// declare and initialize variables
    	var approvalTable = '';
    	
    	// check we have a department and a subsidiary
    	if (department && subsidiary)
    		{
		    	// run search to find the approval table
		    	search.create({
		    		type: 'customrecord_bbs_bill_approval_table',
		    		
		    		filters: [{
		    			name: 'isinactive',
		    			operator: search.Operator.IS,
		    			values: ['F']
		    		},
		    				{
		    			name: 'custrecord_bbs_department',
		    			operator: search.Operator.ANYOF,
		    			values: [department]
		    		},
		    				{
		    			name: 'custrecord_bbs_subsidiary',
		    			operator: search.Operator.ANYOF,
		    			values: [subsidiary]
		    		}],
		    		
		    		columns: [{
		    			name: 'name'
		    		}],
		    		
		    	}).run().each(function(result){
		    		
		    		// get the internal ID of the approval table
		    		approvalTable = result.id;
		    		
		    	});
    		}
    	
    	// return values to the main script function
    	return approvalTable;
    	
    }
    
    return 	{
	        	fieldChanged:	fieldChanged,
    			postSourcing: 	postSourcing
    		};
    
});
