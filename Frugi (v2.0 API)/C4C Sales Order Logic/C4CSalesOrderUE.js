/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
function(record) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
    	
    	

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {

    }

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
	    	if(scriptContext.type == 'create' || scriptContext.type == 'edit')
	    		{
	    			var salesChannel = scriptContext.newRecord.getValue({fieldId: 'custbody_c4c_sales_channel'});
	    			
	    			if(salesChannel != null & salesChannel != '')
	    				{
	    					try
	    						{
			    					record.submitFields({
			    										type:	record.Type.SALES_ORDER,
			    										id:		scriptContext.newRecord.id,
			    										values:	{
			    												saleschannel:	salesChannel
			    												}
			    										});	
	    						}
	    					catch(err)
	    						{
	    							log.error({title: 'Error updating sales channel on order, id = ' + scriptContext.newRecord.id, details: err});
	    						}
	    				}
	    		}
	    	
	    }

    return {
    	afterSubmit: afterSubmit
    };
    
});
