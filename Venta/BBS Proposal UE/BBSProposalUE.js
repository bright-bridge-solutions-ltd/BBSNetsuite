/**
 * Module Description
 * 
 * Version    	Date            	Author           Remarks
 * 1.00       	08 Jan 2018     	krish
 * 1.01       	30 Jan 2018     	suceen          // Add Copy Image URL before submit
 * 1.02			22 Jul 2019			sambatten		replaced before submit function and renamed script to BBSProposalUE
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord Proposal
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request)
	{
	 
	}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord Proposal
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, tskRec)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function proposalBeforeSubmit(type)
	{
		// check if the record is being edited
		if (type == 'edit')
			{
				// update the current version field on the record
				var curVer = parseInt(nlapiGetFieldValue('custbody_cle_pro_version'))+1;
				nlapiSetFieldValue('custbody_cle_pro_version', curVer);
			}

/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 Jan 2018     suceen
 *
 */		
		// get line item count
		var itemCount = nlapiGetLineItemCount('item');	
		
		// get line item count
		var itemCount = nlapiGetLineItemCount('item');
		
		// loop through line count
		for (var i = 1;i <= itemCount;i++)
			{
				// get Item Id
				var itemId = nlapiGetLineItemValue('item','item',i);
		
				// get item type
				var itemType = nlapiGetLineItemValue('item', 'itemtype', i);
				var recordType = '';	
		  	        
		        switch (itemType) // Compare item type to its record type counterpart
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
			            case 'GiftCert':
			            	recordType = 'giftcertificateitem';
			                break;
			            default:
		        	}		
        
		        nlapiLogExecution('DEBUG', 'Inventory Type-', recordType);
		
		        // load item record and get image file from Item Display Thumbnail
		        var item = nlapiLoadRecord(recordType,itemId);		
		
		        var imgFileId = item.getFieldValue('custitem2');
		
		        // if it has image - continue
		        if (!isNullOrEmpty(imgFileId))
		        	{
		        		var file = nlapiLoadFile(imgFileId);
			
		        		// printed file must be available without login, otherwise you get error on printing 
		        		if (file.isOnline())
		        			{
		        				// get the file's URL
		        				var imageUrl = file.getURL();
		        				
		        				// compile URL
		        				var completeUrl = 'https://system.eu1.netsuite.com' + imageUrl;
				
		        				// set completed url to your custom field of type free-form-text
		        				nlapiSetLineItemValue('item','custcol_cle_image_url',i,completeUrl);
		        			}
		        	}
			}

	}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord Proposal
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function proposalAfterSubmit(type)
	{
	
		if (type == 'create')
			{
				var thisProID = nlapiGetRecordId();
				var proRec   = nlapiLoadRecord(nlapiGetRecordType(), thisProID);
				var entity   = proRec.getFieldValue('entity');
				var salesrep = proRec.getFieldValue('salesrep');
				var trandate = proRec.getFieldValue('trandate');
				var tranid   = proRec.getFieldValue('tranid');
		
				var tskRec = nlapiCreateRecord('task');
				tskRec.setFieldValue('startdate', nlapiDateToString(nlapiAddDays(nlapiStringToDate(trandate), 1)));
				tskRec.setFieldValue('duedate', nlapiDateToString(nlapiAddDays(nlapiStringToDate(trandate), 1)));
				tskRec.setFieldValue('company', entity);
				tskRec.setFieldValue('transaction', thisProID);
				tskRec.setFieldValue('assigned', salesrep);
				tskRec.setFieldValue('title', 'Follow up Proposal');
				tskRec.setFieldText('status', 'Not Started');
				tskRec.setFieldText('priority', 'Medium');
				var tskRecId = nlapiSubmitRecord(tskRec);
				nlapiLogExecution('DEBUG', 'Task entity-', entity+', salesrep-'+salesrep+', trandate-'+trandate+', tranid-'+tranid);
			}
	}

function isNullOrEmpty(strVal)
	{
		return(strVal == undefined || strVal == null || strVal === "");
	}