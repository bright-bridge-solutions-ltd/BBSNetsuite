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
    	
    	// check the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the value of the manufacturer routing field
    			var manufacturerRouting = currentRecord.getValue({
    				fieldId: 'manufacturingrouting'
    			});
    			
    			// if we have a manufacturer routing
    			if (manufacturerRouting)
    				{
    					// declare and initialize variables
    					var routingStepsSummary = new Array();
    				
    					try
    						{
    							// load the manufacturer routing record
    							manufacturerRouting = record.load({
    								type: record.Type.MANUFACTURING_ROUTING,
    								id: manufacturerRouting
    							});
    							
    							// get count of routing steps
    							var routingSteps = manufacturerRouting.getLineCount({
    								sublistId: 'routingstep'
    							});
    							
    							// loop through routing steps
    							for (var i = 0; i < routingSteps; i++)
    								{
    									// get the operation sequence, name and run rate
    									var operationSequence = manufacturerRouting.getSublistValue({
    										sublistId: 'routingstep',
    										fieldId: 'operationsequence',
    										line: i
    									});
    									
    									var operationName = manufacturerRouting.getSublistValue({
    										sublistId: 'routingstep',
    										fieldId: 'operationname',
    										line: i
    									});
    									
    									var runRate = manufacturerRouting.getSublistValue({
    										sublistId: 'routingstep',
    										fieldId: 'runrate',
    										line: i
    									});
    									
    									// push the routing steps into the routingStepsSummary array
    									routingStepsSummary.push(
    											new routingStep(
    													operationSequence,
    													operationName,
    													runRate
    													)
    											);
    								}
    							
    							// populate the manufacturer routing steps JSON field on the work order
    							currentRecord.setValue({
    								fieldId: 'custbody_bbs_manufactuer_routing_steps',
    								value: JSON.stringify(routingStepsSummary)
    							});
    							
    						}
    					catch(e)
    						{
    							log.error({
    								title: 'Error Loading Manufacturer Routing',
    								details: e
    							});
    						}
    				}
    		}

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
    function afterSubmit(scriptContext) {

    }
    
    // =======
    // OBJECTS
    // =======
    
    function routingStep(operationSequence, operationName, runRate)
    	{
	    	this.operationSequence	=	operationSequence;
			this.operationName		=	operationName;
			this.runRate			=	runRate;	
    	}

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
