/**
 * Module Description
 * 
 * Version    Date            Author           	Remarks
 * 1.00       12 Apr 2019     cedricgriffiths	
 * 1.10		  29 Jul 2019	  sambatten			added code to set image column to blank if no item image
 * 1.20		  22 Aug 2019	  sambatten       	added if statement to check if item type is not description to prevent script error
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function itemImageBS(type)
	{
		// get line item count
		var itemCount = nlapiGetLineItemCount('item');	
	
		// loop through item count
		for (var i=1;i<=itemCount;i++)
			{
				// get Item Id
				var itemId = nlapiGetLineItemValue('item','item',i);
				
		        // get item type
				var itemType = nlapiGetLineItemValue('item', 'itemtype', i);
				var recordType = '';
				
				// only interested in non description items
				if (itemType != 'Description')
					{				  	        
	 
						switch (itemType) {   // Compare item type to its record type counterpart
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
				            case 'GiftCert':
				            	recordType = 'giftcertificateitem';
				                break;
				            default:
						}	

						// load item and get image file from Item Display Thumbnail
						var item = nlapiLoadRecord(recordType,itemId);		
						
						var imgFileId = item.getFieldValue('custitem2'); //storedisplaythumbnail
				      	
						nlapiLogExecution('DEBUG', 'Item is ' + item, 'File ID is ' + imgFileId);
						
						// if it has image - continue
						if (imgFileId)
							{
								var file = nlapiLoadFile(imgFileId);
								// printed file must be available without login, otherwise you get error on printing 
								if (file.isOnline())
									{
										var imageUrl = file.getURL();
										// complete url
										var completeUrl = 'https://system.netsuite.com' + imageUrl;
										
										// set completed url to your custom field of type free-form-text
										nlapiSetLineItemValue('item','custcol_bbs_item_image',i,completeUrl);
									}
							}
						else // item does not have an image
							{
								// set image column to empty value
								nlapiSetLineItemValue('item','custcol_bbs_item_image',i,null);
							}
						}
			}
	}
