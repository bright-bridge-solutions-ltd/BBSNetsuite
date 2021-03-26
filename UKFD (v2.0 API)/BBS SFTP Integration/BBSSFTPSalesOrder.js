/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/https'],
function(url, https) {
   
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
    	
    	// check if the record is being edited
    	if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
	    		// get the old/new images of the record
    			var oldRecord = scriptContext.oldRecord;
    			var newRecord = scriptContext.newRecord;
    			
    			// get the ship date from the old/new images of the record
    			var oldDate = oldRecord.getValue({
    				fieldId: 'shipdate'
    			});
    			
    			var newDate = newRecord.getValue({
    				fieldId: 'shipdate'
    			});
    			
    			// if the ship date has been changed
    			if (oldDate.getTime() != newDate.getTime())
    				{
    					// declare and initialize variables
    					var purchaseOrders = new Array();
    					
    					// get count of related records
    					var relatedRecords = newRecord.getLineCount({
    						sublistId: 'links'
    					});
    					
    					// loop through related records
    					for (var i = 0; i < relatedRecords; i++)
    						{
    							// get the link URL
    							var linkURL = newRecord.getSublistValue({
    								sublistId: 'links',
    								fieldId: 'linkurl',
    								line: i
    							});
    							
    							// keep the part of the link URL after the last ? and split on the text ".nl" to keep the first part of the returned string
    							var linkType = linkURL.substring(linkURL.lastIndexOf("/") +1).split(".nl").shift();
    							
    							// if this is a purchase order
    							if (linkType == 'purchord')
    								{
    									// get the ID of the purchase order and push it to the purchaseOrders array
    									purchaseOrders.push(
    															newRecord.getSublistValue({
    																sublistId: 'links',
    																fieldId: 'id',
    																line: i
    															})
    														);
    								}
    						}
    					
    					// if we have any purchase orders to update
    					if (purchaseOrders.length > 0)
    						{
    							try
		    						{
		    							// ==========================================================================================
		    							// CALL A SUITELET TO UPDATE THE RECALCULATE THE REQUIRED DELIVERY DATE ON THE PURCHASE ORDER
		    							// ==========================================================================================
		    						
		    							// get the URL of the Suitelet
		    							var suiteletURL = url.resolveScript({
		    							    scriptId: 'customscript_bbs_sftp_purchase_order_sl',
		    							    deploymentId: 'customdeploy_bbs_sftp_purchase_order_sl',
		    							    returnExternalUrl: true
		    							});
		    							
		    							// call the Suitelet
		    							https.post({
		    								url: suiteletURL,
		    								body: '{' + purchaseOrders + '}'
		    							});
		    						}
		    					catch(e)
		    						{
		    							log.error({
		    								title: 'Error Calling Suitelet',
		    								details: e
		    							});
		    						}
    						}
    					
    				}
    		}
    	
    }

    return {
        afterSubmit: afterSubmit
    };
    
});
