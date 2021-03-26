/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/render', 'N/record', 'N/email'],
function(render, record, email) {
   
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
    function afterSubmit(scriptContext) {
    	
    	// check the record is being created
    	if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// get ID of the current record
    			var recordID = parseInt(scriptContext.newRecord.id);
    			
    			// create a template renderer
    			/*var renderer = render.create();
    			
    			// set the renderer's template
    			renderer.setTemplateById(104);
    			
    			// add the bill payment to the renderer
    			renderer.addRecord('record', record.load({
    			    type: record.Type.VENDOR_PAYMENT,
    			    id: recordID
    			}));

    			// render the template as a PDF
    			var PDF = renderer.renderAsPdf();*/
    			
    			var PDF = render.transaction({
    			    entityId: recordID,
    			    printMode: render.PrintMode.PDF
    			});
    			
    			try
    				{
    					// send an email to the supplier
    					email.send({
    						author: 5929,
    						recipients: 5929,
    						subject: 'Test Sample Email Module',
    						body: 'email body',
    						attachments: [PDF],
    						relatedRecords: {
    							transactionId: recordID
    						}
    					});
    				}
    			catch(e)
    				{
    					log.error({
    						title: 'Error Sending Email',
    						details: e
    					});
    				}
    		}

    }

    return {
        afterSubmit: afterSubmit
    };
    
});
