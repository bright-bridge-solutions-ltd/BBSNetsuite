/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/search'],
function(runtime, record, search) {
   
   

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
    		//Works on create or edit
    		//
	    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
	    		{
	    			//Get info about current record
	    			//
	    			var currentRecord 	= scriptContext.newRecord;
	    			var recordID		= currentRecord.id;
	    			var recordType		= currentRecord.type;
	    			var thisRecord 		= null;
	    			
	    			//Try to load the full record
	    			//
	    			try
	    				{
	    					
	    					thisRecord = record.load({
							    						type: 		recordType,
							    						id: 		recordID,
							    						isDynamic: 	true
							    						});
	    				}
	    			catch(err)
	    				{
	    					thisRecord 	= null;
	    				}

	    			
	    			//Did it load ok?
	    			//
	    			if(thisRecord != null)
	    				{
	    					//Get the field values & multiply together
	    					//
	    					var initialServ = Number(thisRecord.getValue({fieldId: 'custrecord32'}));
	    					var initialProb	= Number(thisRecord.getValue({fieldId: 'custrecord33'}));
	    					var result 		= initialServ * initialProb;
	    					var outcome		= null;
	    					
	    					//Work out if the result is acceptable or unacceptable
	    					//
	    					if(result > 10)
	    						{
	    							outcome = 2;
	    						}
	    					else
	    						{
	    							outcome = 1;
	    						}
	    					
	    					//Update the outcome field
	    					//
	    					record.submitFields({
												type:		recordType,
												id:			recordID,
												values:		{
															custrecord34:	outcome
															},
												options:	{
															ignoreMandatoryFields:	true
															}
												});
	    				}
	    		}
    	}

    return {
        	afterSubmit: afterSubmit
    		};
});
