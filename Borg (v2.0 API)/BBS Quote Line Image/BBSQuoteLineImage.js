/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/file'],
function(record, file) {
   
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
    	
    	// get the new record object
    	var currentRecord = scriptContext.newRecord;
    	
    	// get count of item lines from the currentRecord object
    	var lineCount = currentRecord.getLineCount({
    		sublistId: 'item'
    	});
    	
    	// loop through item lines
    	for (var i = 0; i < lineCount; i++)
    		{
    			// get the internal ID of the item
    			var itemID = currentRecord.getSublistValue({
    				sublistId: 'item',
    				fieldId: 'item',
    				line: i
    			});
    			
    			// get the item type
    			var itemType = currentRecord.getSublistValue({
    				sublistId: 'item',
    				fieldId: 'itemtype',
    				line: i
    			});
    			
    			log.debug({
    				title: 'Item Type',
    				details: itemType
    			});
    			
    			var recordType = '';
    			
    			// only interested in non description items
    			if (itemType != 'Description')
    				{
    					// switch itemType so it can be used in API calls
    					switch (itemType)
    						{
    							case 'InvtPart':
    								recordType = 'inventoryitem';
    								break;
    					
    							case 'NonInvtPart':
    				            	recordType = 'noninventoryitem';
    				                break;
    				            
    							case 'Service':
    				            	recordType = 'serviceitem';
    				                break;
    				            
    							case 'Assembly':
    				            	recordType = 'assemblyitem';
    				                break;
    				                
    							case 'OthCharge':
    								recordType = 'otherchargeitem';
    								break;
    				            
    							case 'GiftCert':
    				            	recordType = 'giftcertificateitem';
    				                break;
    				                
    							case 'Kit':
    								recordType = 'kititem';
    								break;
    						}
    					
    					// load the item record
    					var itemRecord = record.load({
    						type: recordType,
    						id: itemID
    					});
    					
    					// get the image from the item record
    					var itemImageID = itemRecord.getValue({
    						fieldId: 'custitem_bbs_image'
    					});
    					
    					// check we have an image on the item record
    					if (itemImageID)
    						{
    							// load the image file
    							var imageRecord = file.load({
    								id: itemImageID
    							});
    							
    							// check that the file is available online
    							if (imageRecord.isOnline == true)
    								{
    									// get the URL of the image. Prefix this with 'https://system.netsuite.com' to create a full URL
    									var imageURL = 'https://system.netsuite.com' + imageRecord.url;
    									
    									// set the image field on the line using the imageURL variable
    									currentRecord.setSublistValue({
    										sublistId: 'item',
    										fieldId: 'custcol_bbs_item_image',
    										value: imageURL,
    										line: i
    									});
    								}
    							else // file is NOT available online
    								{
    									// clear the image field on the line
	    								currentRecord.setSublistValue({
											sublistId: 'item',
											fieldId: 'custcol_bbs_item_image',
											value: null,
											line: i
										});
    								}
    						}
    					else // item does not have an image
    						{
	    						// clear the image field on the line
								currentRecord.setSublistValue({
									sublistId: 'item',
									fieldId: 'custcol_bbs_item_image',
									value: null,
									line: i
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

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
