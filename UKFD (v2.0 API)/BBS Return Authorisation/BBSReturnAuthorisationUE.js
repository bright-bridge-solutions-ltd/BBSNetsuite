/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/redirect', 'N/record', 'N/error'],
function(runtime, redirect, record, error) {
   
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
    	if (scriptContext.type == scriptContext.UserEventType.CREATE)
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get the value of the charge collection fee checkbox
    			var collectionFee = currentRecord.getValue({
    				fieldId: 'custbody_bbs_charge_collection_fee'
    			});
    			
    			// get the collection fee amount
				var collectionFeeAmount = parseFloat(currentRecord.getValue({
					fieldId: 'custbody_bbs_collection_fee_amount'
				}));
    			
    			// if collectionFee returns true and collectionFeeAmount > 0
    			if (collectionFee == true && collectionFeeAmount > 0)
    				{
    					// get the customer ID
    					var customerID = currentRecord.getValue({
    						fieldId: 'entity'
    					});
    					
    					// get the location ID
    					var locationID = currentRecord.getValue({
    						fieldId: 'location'
    					});
    					
    					// call function to create a new cash sale
    					var cashSaleID = createCashSale(customerID, collectionFeeAmount, currentRecord.id, locationID);
    					
    					// if we have been able to create a cash sale
    					if (cashSaleID)
    						{
	    						try
		    						{
		    							// update the RA with the cash sale ID
		    							record.submitFields({
		    								type: record.Type.RETURN_AUTHORIZATION,
		    								id: linkedRA,
		    								values: {
		    									custbody_bbs_collection_fee_cash_sale: currentRecord.id
		    								}
		    							});
		    						}
		    					catch(e)
		    						{
		    							log.error({
		    								title: 'Error Updating Return Authorisation',
		    								details: 'ID: ' + linkedRA + '<br>Error: ' + e
		    							});
		    						}
    						
    							// redirect the user to the created record in edit mode
	    						redirect.toRecord({
	    						    type: record.Type.CASH_SALE,
	    						    id: cashSaleID,
	    						    isEditMode: true
	    						});
    						}
    					else
    						{
	    						// throw an error
    							throw 'An error occured creating the cash sale.<br><br>Please contact support for assistance.';
    						}
    				}
    		}

    }
    
    // =====================================
    // FUNCTION TO CREATE A CASH SALE RECORD
    // =====================================
    
    function createCashSale(customerID, collectionFeeAmount, returnAuthorizationID, locationID) {
    	
    	// retrieve script parameters
		var currentScript = runtime.getCurrentScript();
	
		var collectionItem = currentScript.getParameter({
			name: 'custscript_bbs_collection_fee_item'
		});
    	
    	// declare and initialize variables
    	var cashSaleID = null;
    	
    	try
    		{
    			// create a new cash sale record
    			var cashSaleRec = record.transform({
    				fromId: 	customerID,
					fromType: 	record.Type.CUSTOMER,
					toType:		record.Type.CASH_SALE,
					isDynamic: true
    			});
    			
    			cashSaleRec.setValue({
    				fieldId: 'location',
    				value: locationID
    			});
    			
    			cashSaleRec.setValue({
    				fieldId: 'custbody_bbs_linked_ra',
    				value: returnAuthorizationID
    			});
    			
    			cashSaleRec.selectNewLine({
    				sublistId: 'item'
    			});
    			
    			cashSaleRec.setCurrentSublistValue({
    				sublistId: 'item',
    				fieldId: 'item',
    				value: collectionItem
    			});
    			
    			cashSaleRec.setCurrentSublistValue({
    				sublistId: 'item',
    				fieldId: 'quantity',
    				value: 1
    			});
    			
    			cashSaleRec.setCurrentSublistValue({
    				sublistId: 'item',
    				fieldId: 'rate',
    				value: collectionFeeAmount
    			});
    			
    			cashSaleRec.setCurrentSublistValue({
    				sublistId: 'item',
    				fieldId: 'location',
    				value: locationID
    			});

    			cashSaleRec.commitLine({
    				sublistId: 'item'
    			});
    			
    			cashSaleID = cashSaleRec.save({
	    			enableSourcing: false,
		    		ignoreMandatoryFields: true
	    		});
    			
    		}
    	catch(e)
    		{
    			log.error({
    				title: 'Error Creating Cash Sale',
    				details: e
    			});
    		}
    	
    	return cashSaleID;
    	
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
