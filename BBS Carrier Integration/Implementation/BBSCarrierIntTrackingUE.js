/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/ui/serverWidget', 'N/search'],
function(record, ui, search) {
   
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
    	
    	// check the record is being viewed
    	if (scriptContext.type == 'view' || scriptContext.type == 'edit')
    		{
    			addField(scriptContext.form, scriptContext.newRecord);
    			hideField(scriptContext.form, scriptContext.newRecord);
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
    	
    	// check that the record is being created or edited
    	if (scriptContext.type == 'create' || scriptContext.type == 'edit')
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord;
    			
    			// get internal ID of the current record
    			var recordID = currentRecord.id;
    			
    			// get count of package sublist lines
    			var packageCount = currentRecord.getLineCount({
    				sublistId: 'package'
    			});
    			
    			// loop through package count
    			for (var i = 0; i < packageCount; i++)
    				{
    					// get field values from the line
    					var packageId = currentRecord.getSublistValue({
    						sublistId: 'package',
    						fieldId: 'packagetrackingnumber',
    						line: i
    					});
    					
    					if (!checkMVF(recordID, packageId))
    						{
    							var rec = record.create({
    								type: 'customrecord_bbs_if_additional_fields'
    							});
    							
    							rec.setValue({
    								fieldId: 'custrecord_bbs_if_fulfilment',
    								value: recordID
    							});
    							
    							rec.setValue({
    								fieldId: 'custrecord_bbs_if_package_key',
    								value: packageId
    							});

    							rec.save();
    						}
    				}
    			
    		}

    }
    
    function addField(form, currentRecord)
    	{
	    	// get the value of the [BBS CI] Shipping Carrier field
			var shippingCarrier = currentRecord.getValue({
				fieldId: 'custbody_bbs_ci_shipping_carrier'
			});
			
			// check we have a shipping carrier
			if (shippingCarrier)
				{
					// call function to get the carrier's tracking URL
					var carrierTrackingURL = getTrackingURL(shippingCarrier);
				
					// get the package sublist
		    		var packagesSublist = form.getSublist({
		    			id: 'package'
		    		});
    		
		    		// check we can get the sublist
		    		if (packagesSublist != null)
		    			{
		    				// add new fields to the package sublist
		    				var packageNumberField = packagesSublist.addField({
		    					id: 'custpage_trackingnumber',
		    					type: ui.FieldType.TEXT,
		    					label: '[CI]Package Tracking Number'
		    				});
		    			
		    				var trackingLinkField = packagesSublist.addField({
		    					id: 'custpage_trackinglink',
		    					type: ui.FieldType.URL,
		    					label: '[CI]Package Tracking Link'
		    				});
		    				
		    				// set the link text and display type
		    				packageNumberField.updateDisplayType({
		    					displayType: ui.FieldDisplayType.DISABLED
		    				});
		    				
		    				trackingLinkField.updateDisplayType({
		    				    displayType: ui.FieldDisplayType.DISABLED
		    				});
		    				
		    				trackingLinkField.linkText = 'Click Here to Track';
		    				
		    				// get count of package sublist lines
		    				var packageCount = currentRecord.getLineCount({
		    					sublistId: 'package'
		    				});
		    				
		    				// get the internal ID of the current record
		    				var fulfilmentId = currentRecord.id;
		    				
		    				// loop through package count
		    				for (var i = 0; packageCount != null && i < packageCount; i++)
		    					{
		    						// get the package tracking number
		    						var packageId = currentRecord.getSublistValue({
		    							sublistId: 'package',
		    							fieldId: 'packagetrackingnumber',
		    							line: i
		    						});
		    						
		    						if (checkMVF(fulfilmentId, packageId)) 
		    			        		{
		    								var fieldLookup = search.lookupFields({
		    									type: 'customrecord_bbs_if_additional_fields',
		    									id: mvfid,
		    									columns: ['custrecord_bbs_if_package_track_no']
		    								});
		    								
		    								var trackingNumber = fieldLookup.custrecord_bbs_if_package_track_no;
		    								
		    								currentRecord.setSublistValue({
		    									sublistId: 'package',
		    									fieldId: 'custpage_trackingnumber',
		    									value: trackingNumber,
		    									line: i
		    								});
		    								
		    								currentRecord.setSublistValue({
		    									sublistId: 'package',
		    									fieldId: 'custpage_trackinglink',
		    									value: carrierTrackingURL + trackingNumber,
		    									line: i
		    								});
		    			        		}
		    					}
		    			}
				}
    		
    	}
    
    function hideField(form, currentRecord)
	    {
	    	// get the value of the [BBS CI] Shipping Carrier field
			var shippingCarrier = currentRecord.getValue({
				fieldId: 'custbody_bbs_ci_shipping_carrier'
			});
			
			// check we have a shipping carrier
			if (shippingCarrier)
				{
		    		// get the packages sublist
		    		var packagesSublist = form.getSublist({
		    			id: 'package'
		    		});
		    		
		    		// check we can get the sublist
		    		if (packagesSublist != null)
		    			{
		    				// get the package tracking number field
		    				var trackingNumberField = packagesSublist.getField({
		    					id: 'packagetrackingnumber'
		    				});
		    				
		    				// set the field to hidden
		    				trackingNumberField.updateDisplayType({
		    					displayType: ui.FieldDisplayType.HIDDEN
		    				});
		    			}
				}
	    }
    
    function checkMVF(_fulfilmentId, _packageId)
	    {
	    	if (_fulfilmentId != null && _fulfilmentId != '' && _packageId != null && _packageId != '')
	    		{
	    		    // declare and initialize variables
	    			mvfid = null;
	    		
	    			// create search
	    			var mySearch = search.create({
							    				type: 		'customrecord_bbs_if_additional_fields',
							    				columns: 	[
							    				         	 {name: 'internalid'}
							    				         	 ],
							    				filters: 	[
							    				         	 {name: 'custrecord_bbs_if_fulfilment',operator: 'is',values: [_fulfilmentId]},
							    				         	 {name: 'custrecord_bbs_if_package_key',operator: 'is',values: [_packageId]}],
						
							    				});
	    			
	    			// run search and process results
	    			mySearch.run().each(function(result){
	    				
	    				mvfid = result.getValue({
	    					name: 'internalid'
	    				});
	    				
	    			});
	    			
	    			// check the mvfid variable returns a value
	    			if (mvfid != null)
	    				{
	    					return true;
	    				}
	    			else
	    				{
	    					return false;
	    				}
	    		}
	    	else
	    		{
	    			return false;
	    		}
	    }
    
    function getTrackingURL(carrier)
    	{
    		// lookup fields on the carrier codes record
    		var carrierLookup = search.lookupFields({
    			type: 'customrecord_bbs_carriers',
    			id: carrier,
    			columns: ['custrecord_bbs_carrier_code_track_url']
    		});
    		
    		// return the tracking URL to the main script function
    		return carrierLookup.custrecord_bbs_carrier_code_track_url;
    	}

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
