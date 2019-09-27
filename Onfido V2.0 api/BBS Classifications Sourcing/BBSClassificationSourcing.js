/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/runtime', 'N/ui/dialog', 'N/ui/message'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {dialog} dialog
 * @param {message} message
 */
function(currentRecord, runtime, dialog, message) {
    
    
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
    function classSourcingFieldChanged(scriptContext) 
    {
    	debugger;
    	
    	//Get the field id
    	//
    	var fieldId = scriptContext.fieldId;
    	var sublistId = scriptContext.sublistId;
    	var formIds = [];
    	
    	//Get script param that holds the list of form id's to apply to
    	//
    	var currentScript = runtime.getCurrentScript();
    	var applyToForms = currentScript.getParameter({name: 'custscript_bbs_forms_to_appy_to'});
    	
    	//Are we applying to specific forms?
    	//
    	if(applyToForms != null && applyToForms != '')
    		{
    			formIds = applyToForms.split(',');
    		}
    	
    	//Get the current record
    	//
    	var thisRecord = currentRecord.get();
    	var itemLines = thisRecord.getLineCount({sublistId: 'item'});
    	var expenseLines = thisRecord.getLineCount({sublistId: 'expense'});
    	var formId = thisRecord.getValue({fieldId: 'customform'});
    	
    	//Only process if there are no specific forms listed to apply to, or the current form is in the list of forms to apply to
    	//
    	if(formIds.length == 0 || formIds.indexOf(formId) != -1)
    		{
    			//Check to see if we are changing the body fields
    			//
		    	if((sublistId == '' || sublistId == null) && (fieldId == 'department' || fieldId == 'class'))
		    		{
		    			//Get the data out of the current field
		    			//
		    			var fieldData = thisRecord.getValue({fieldId: fieldId});
		    			
		    			//Update the sublist fields
		    			//
		    			for (var int = 0; int < itemLines; int++) 
					    	{
		    					thisRecord.selectLine({
		    											sublistId: 'item',
		    											line: int
		    											});
		    					
		    					thisRecord.setCurrentSublistValue({
										    						sublistId: 'item',
										    						fieldId: fieldId,
										    						value: fieldData
										    						});
		    					
		    					thisRecord.commitLine({
		    											sublistId: 'item'
		    										});
								
							}
		    			
		    			for (var int = 0; int < expenseLines; int++) 
					    	{
		    					thisRecord.selectLine({
		    											sublistId: 'expense',
		    											line: int
		    											});
		    					
		    					thisRecord.setCurrentSublistValue({
										    						sublistId: 'expense',
										    						fieldId: fieldId,
										    						value: fieldData
										    						});
		    					
		    					thisRecord.commitLine({
		    											sublistId: 'expense'
		    										});
								
							}
		    		}
		    	
		    	//Check to see if we are changing the line fields
    			//
		    	if((sublistId == 'item' || sublistId == 'expense') && (fieldId == 'item' || fieldId == 'category'))
		    		{
			    		var classData = thisRecord.getValue({fieldId: 'class'});
			    		var deptData = thisRecord.getValue({fieldId: 'department'});
			    		
			    		if(classData != null && classData != '')
			    			{
				    			thisRecord.setCurrentSublistValue({
																sublistId: sublistId,
																fieldId: 'class',
																value: classData
																});
			    			}
			    		
			    		if(deptData != null && deptData != '')
			    			{
				    			thisRecord.setCurrentSublistValue({
																sublistId: sublistId,
																fieldId: 'department',
																value: deptData
																});
			    			}
		    		}
    		}
    }

    
    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function classSourcingLineInit(scriptContext) 
    {
    	var formIds = [];
    	
    	//Get script param that holds the list of form id's to apply to
    	//
    	var currentScript = runtime.getCurrentScript();
    	var applyToForms = currentScript.getParameter({name: 'custscript_bbs_forms_to_appy_to'});
    	
    	//Are we applying to specific forms?
    	//
    	if(applyToForms != null && applyToForms != '')
    		{
    			formIds = applyToForms.split(',');
    		}
    	
    	//Get the current record
    	//
    	var thisRecord = currentRecord.get();
    	var formId = thisRecord.getValue({fieldId: 'customform'});
    	var sublistId = scriptContext.sublistId;
    	
    	//Only process if there are no specific forms listed to apply to, or the current form is in the list of forms to apply to
    	//
    	if(formIds.length == 0 || formIds.indexOf(formId) != -1)
    		{
	    		var classData = thisRecord.getValue({fieldId: 'class'});
	    		var deptData = thisRecord.getValue({fieldId: 'department'});
	    		
	    		if(classData != null && classData != '')
	    			{
		    			thisRecord.setCurrentSublistValue({
														sublistId: sublistId,
														fieldId: 'class',
														value: classData
														});
	    			}
	    		
	    		if(deptData != null && deptData != '')
	    			{
		    			thisRecord.setCurrentSublistValue({
														sublistId: sublistId,
														fieldId: 'department',
														value: deptData
														});
	    			}
    		}
    }

    return {
        fieldChanged: classSourcingFieldChanged,
        lineInit: classSourcingLineInit
    };
    
});
