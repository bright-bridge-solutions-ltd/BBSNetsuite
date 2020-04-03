/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord','N/record','N/runtime'],
/**
 * @param {record} record
 */
function(currentRecord, record, runtime) {
   
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
    function pageInit(scriptContext) 
	    {
    		//Function to disable all fields on a purchase order except specific line item fields
    		//
    		var formParam 	= runtime.getCurrentScript().getParameter({name: 'custscript_bbs_po_fields_disable_form'});
    		var rolesParam 	= runtime.getCurrentScript().getParameter({name: 'custscript_bbs_po_fields_disable_roles'});
    		var rolesArray 	= rolesParam.split(',');
    		var formArray 	= formParam.split(',');
    		
    		//Only to work in edit mode
    		//
    		if(scriptContext.mode == 'edit')
    			{
    				debugger;
    				
    				//Specify which fields should be editable
    				//
    				var excludedSublistFieldsArray 	= ['custcol_bbs_receipt_date','custcol_bbs_receive_po','custcol_bbs_recive_qty'];
    				
			    	var currentRecord 				= scriptContext.currentRecord;
			    	var currentId 					= currentRecord.id;
			    	var currentType 				= currentRecord.type;
			    	var currentForm 				= currentRecord.getValue({fieldId: 'customform'}).toString();
			    	var currentRole					= runtime.getCurrentUser().role.toString();
			    	
			    	//Only apply the logic if the form is in the list of applied forms & the users role is not in the list of excluded roles
			    	//
			    	if(formArray.indexOf(currentForm) != -1 && rolesArray.indexOf(currentRole) == -1)
			    		{
					    	//Get the list of fields in the main record & the item sublist
					    	//
					    	var fieldArray 			= record.load({type: currentType, id: currentId}).getFields();
					    	var sublistFieldArray 	= record.load({type: currentType, id: currentId}).getSublistFields({sublistId: 'item'});
					    	
					    	//Loop through the body fields
					    	//
					    	for (var int = 0; int < fieldArray.length; int++) 
						    	{
									try
										{
											//Disable the body field
											//
											currentRecord.getField({fieldId: fieldArray[int]}).isDisabled = true;
										}
									catch(err)
										{
										
										}
								}
					    	
					    	//Loop through the item sublist fields
					    	//
					    	for (var int = 0; int < sublistFieldArray.length; int++) 
						    	{
									try
										{
											if(excludedSublistFieldsArray.indexOf(sublistFieldArray[int]) == -1)
												{
													//Disable the item sublist field if it is not in the list of excluded fields
													//
													eval("nlapiDisableLineItemField('item', '" + sublistFieldArray[int] + "', true)");
												}
										}
									catch(err)
										{
										
										}
								}
			    		}
    			}
	    }

    return {
    	pageInit: pageInit
    };
    
});
