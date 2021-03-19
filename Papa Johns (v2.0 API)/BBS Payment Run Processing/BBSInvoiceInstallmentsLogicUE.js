/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime','N/record'],
function(runtime, record) 
{
   
    
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) 
	    {
	    	if (scriptContext.type == 'create')
				{
		    		//Get the current record
	    			//
			    	var currentRecord 		= scriptContext.newRecord;
			    	var currentRecordType	= currentRecord.type;
			    	var currentRecordId		= currentRecord.id;
			    	
			    	//Get the total value of the invoice
			    	//
			    	var invoiceTotal = Number(currentRecord.getValue({fieldId: 'total'}));
			    	
			    	//Get the number of installments to use
			    	//
			    	var currentScript 		= runtime.getCurrentScript();
			    	var installmentCount	= Number(currentScript.getParameter({name: 'custscript_bbs_installment_count'}));
			    	
			    	//Work out the installment value
			    	//
			    	var installmentValue = Number((invoiceTotal / installmentCount).toFixed(2));
			    	
			    	//Update the installment value
			    	//
			    	record.submitFields({
			    						type:					currentRecordType,
			    						id:						currentRecordId,
			    						enableSourcing:			false,
			    						ignoreMandatoryFields:	true,
			    						values:					{
			    												custbody_bbs_install_amount:	installmentValue
			    												}
			    						});
			    	
				}
	    }

    return 	{
	        afterSubmit: 	afterSubmit
    		};
    
});
