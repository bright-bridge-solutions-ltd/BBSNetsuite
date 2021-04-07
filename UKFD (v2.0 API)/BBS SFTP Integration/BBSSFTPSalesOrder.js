/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['./BBSSFTPLibrary', 'N/record', 'N/redirect'],
function(sftpLibrary, record, redirect) {
   
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
    	
    	// check if the record is being created or edited
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
    			// declare and intialize variables
    			var packDate = null;
    			var fulfilDate = null;
    		
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the expected delivery date
    			var expDelDate = currentRecord.getValue({
    				fieldId: 'custbody_expecteddeliverydate'
    			});
    			
    			// if we have an expected delivery date
    			if (expDelDate)
    				{
    					// get the Menzies depot
    					var menziesDepot = currentRecord.getValue({
    						fieldId: 'custbody_bbs_menzies_depot'
    					});
    					
    					// if we have a Menzies depot
    					if (menziesDepot)
    						{
    							// call library function to return the lead time from the Menzies depot record
    							var leadTime = sftpLibrary.getMenziesDepotLeadTime(menziesDepot);
    							
    							// if we have a lead time
    							if (leadTime)
    								{
	    								// get the subsidiary ID
	    		    					var subsidiaryID = currentRecord.getValue({
	    		    						fieldId: 'subsidiary'
	    		    					});
	    		    				
	    		    					// call library function to return the UKFD processing days
	    		    					var processingDays = sftpLibrary.getUKFDProcessingDays(subsidiaryID);
	    		    					
	    		    					// call library function to calculate the pack date
	    		    					packDate = sftpLibrary.calculateDate(expDelDate, leadTime, processingDays);
	    		    					
	    		    					// now we have calculated the pack date, call library function to calculate the pack date
	    		    					fulfilDate = sftpLibrary.calculateDate(new Date(packDate.getFullYear(), packDate.getMonth(), packDate.getDate()), 1, processingDays);
	 
    								}
    						}
    				}
    			
    			// update the pack/fulfil dates on the record
    			currentRecord.setValue({
    				fieldId: 'custbody_bbs_pack_date',
    				value: packDate
    			});
    			
    			currentRecord.setValue({
    				fieldId: 'custbody_bbs_fulfil_date',
    				value: fulfilDate
    			});  			
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
    	
    	// check if the record is being edited
    	if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
	    		// get the old/new images of the record
    			var oldRecord = scriptContext.oldRecord;
    			var newRecord = scriptContext.newRecord;
    			
    			// get the fulfil date from the old/new images of the record
    			var oldDate = oldRecord.getValue({
    				fieldId: 'custbody_bbs_fulfil_date'
    			});
    			
    			var newDate = newRecord.getValue({
    				fieldId: 'custbody_bbs_fulfil_date'
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
		    							// =======================================================================================
		    							// CALL A BACKEND SUITELET TO RECALCULATE THE REQUIRED DELIVERY DATE ON THE PURCHASE ORDER
		    							// =======================================================================================    						
	    								redirect.toSuitelet({
	    								    scriptId: 'customscript_bbs_sftp_purchase_order_sl',
	    								    deploymentId: 'customdeploy_bbs_sftp_purchase_order_sl',
	    								    parameters: {
	    								    	'salesorder': newRecord.id,
	    								        'purchaseorders': JSON.stringify(purchaseOrders)
	    								    }
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
    	beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
