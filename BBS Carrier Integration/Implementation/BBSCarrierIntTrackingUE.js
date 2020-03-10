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
    			hideField(scriptContext.form);
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
    	if (scriptContext.type == 'create' && scriptContext.type == 'edit')
    		{
    			// get the current record
    			var currentRecord = scriptContext.newRecord();
    			
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
    					
    					var customField = currentRecord.getSublistValue({
    						sublistId: 'package',
    						fieldId: 'custompage_trackingurl',
    						line: i
    					});
    					
    					if (checkMVF(fulfilmentId, packageId))
    						{
    							record.submitFields({
    								type: 'customrecord_bbs_if_additional_fields',
    								id: myfid,
    								values: {
    									custrecord_bbs_custom_field_1: trackingURL
    								}
    							});
    						}
    					else
    						{
    							var rec = record.create({
    								type: 'customrecord_bbs_if_additional_fields'
    							});
    							
    							rec.setFieldValue({
    								fieldId: 'custrecord_bbs_if_fulfilment',
    								value: recordID
    							});
    							
    							rec.setFieldValue({
    								fieldId: 'custrecord_bbs_if_package_key',
    								value: packageId
    							});
    							
    							rec.setFieldValue({
    								fieldId: 'custrecord_bbs_custom_field_1',
    								value: customField
    							});
    							
    							rec.save();
    						}
    				}
    			
    		}

    }
    
    function addField(form, currentRecord)
    	{
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
    					label: 'Package Tracking Number'
    				});
    			
    				var trackingLinkField = packagesSublist.addField({
    					id: 'custpage_trackinglink',
    					type: ui.FieldType.URL,
    					label: 'Package Tracking Link'
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
    									columns: ['custrecord_bbs_custom_field_1', 'custrecord_bbs_if_package_key']
    								});
    								
    								var trackingNumber = fieldLookup.custrecord_bbs_if_package_key;
    								var trackingLink = fieldLookup.custrecord_bbs_custom_field_1;
    								
    								currentRecord.setSublistValue({
    									sublistId: 'package',
    									fieldId: 'custpage_trackingnumber',
    									value: trackingNumber,
    									line: i
    								});
    								
    								currentRecord.setSublistValue({
    									sublistId: 'package',
    									fieldId: 'custpage_trackinglink',
    									value: trackingLink,
    									line: i
    								});
    			        		}
    					}
    			}
    		
    	}
    
    function hideField(form)
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
    
    function checkMVF(_fulfilmentId, _packageId)
	    {
	    	if (_fulfilmentId != null && _fulfilmentId != '' && _packageId != null && _packageId != '')
	    		{
	    		    // declare and initialize variables
	    			mvfid = null;
	    		
	    			// create search
	    			var mySearch = search.create({
	    				type: 'customrecord_bbs_if_additional_fields',
	    				
	    				columns: [{
	    					name: 'internalid'
	    				}],
	    				
	    				filters: [{
	    					name: 'custrecord_bbs_if_fulfilment',
	    					operator: 'is',
	    					values: [_fulfilmentId]
	    				},
	    						{
	    					name: 'custrecord_bbs_if_package_key',
	    					operator: 'is',
	    					values: [_packageId]
	    				}],

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

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
