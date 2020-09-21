/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime'],
/**
 * @param {record} record
 */
function(record, search, runtime) {
	
    function poAfterSubmit(scriptContext) {
    		
    	if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.DROPSHIP || scriptContext.type == scriptContext.UserEventType.SPECIALORDER)
    		{
		    	// declare and initialize variables
    			var salesOrderDivision = null;
    				
    			// get the internal ID of the current record
		    	var currentRecordID	= scriptContext.newRecord.id;
		    	
		    	try
		    		{
		    			// reload the PO record
		    			var poRecord = record.load({
		    				type: record.Type.PURCHASE_ORDER,
		    				id: currentRecordID,
		    				isDynamic: true
		    			});
		    		
				    	// get the PO number from the first item line
			    		var poNumber = poRecord.getSublistValue({
			    			sublistId: 'item',
			    			fieldId: 'custcol_bbs_sales_trx_ponumber',
			    			line: 0
			    		});
		    		
				    	// get the value of the created from field
				    	var createdFrom = poRecord.getValue({
				    		fieldId: 'createdfrom'
				    	});
		    		
				    	// if we createdFrom returns a value
				    	if (createdFrom)
				    		{
					    		try
				    				{
							    		// lookup fields on the related sales order
					    				salesOrderDivision = search.lookupFields({
					    					type: search.Type.SALES_ORDER,
					    					id: createdFrom,
					    					columns: 'cseg_bbs_division'
					    				}).cseg_bbs_division[0].value;
							    			
				    				}
				    			catch(err)
				    				{
				    					// reset salesOrderDivision to hull
				    					salesOrderDivision = null;
				    						
				    					log.error({
									    	title: 	'Error getting division from sales order id = ' + createdFrom,
									    	details: err
									    });
				    				}
				    		}
		    	
				    	// get the internal ID of the supplier
				    	var supplierID = poRecord.getValue({
				    		fieldId: 'entity'
				    	});
		    	
				    	// lookup fields on the supplier record
				    	var suppDelCharge = search.lookupFields({
				    		type: search.Type.VENDOR,
				    		id: supplierID,
				    		columns: ['custentity_bbs_supplier_del_charge']
				    	}).custentity_bbs_supplier_del_charge;
		    	
				    	// if the delivery charge is greater than 0
				    	if (suppDelCharge > 0)
				    		{
				    			// retrieve script parameters
				    			var suppDelChargeItem = runtime.getCurrentScript().getParameter({
				    				name: 'custscript_bbs_supp_del_charge_item'
				    			});
				    			
				    			// select a new line on the PO record
				    			poRecord.selectNewLine({
				    				sublistId: 'item'
				    			});
				    			
				    			// set fields on the new line
				    			poRecord.setCurrentSublistValue({
				    				sublistId: 'item',
				    				fieldId: 'item',
				    				value: suppDelChargeItem
				    			});
				    			
				    			poRecord.setCurrentSublistValue({
				    				sublistId: 'item',
				    				fieldId: 'quantity',
				    				value: 1
				    			});
				    			
				    			poRecord.setCurrentSublistValue({
				    				sublistId: 'item',
				    				fieldId: 'rate',
				    				value: suppDelCharge
				    			});
				    			
				    			// commit the line
				    			poRecord.commitLine({
				    				sublistId: 'item'
				    			});
				    		}
				    	
				    	// update fields on the PO record
				    	poRecord.setValue({
				    		fieldId: 'cseg_bbs_division',
				    		value: salesOrderDivision
				    	});
				    	
				    	poRecord.setValue({
				    		fieldId: 'custbody_bbs_ponumber',
				    		value: poNumber
				    	});
				    	
				    	// re-save the PO record
				    	poRecord.save();
					}
				catch(err)
					{
						log.error({
							title: 'Error updating purchase order with id = ' + currentRecordID,
							details: err
						});
					}
    		}
    }

    return {
    	afterSubmit: poAfterSubmit
    };
    
});
