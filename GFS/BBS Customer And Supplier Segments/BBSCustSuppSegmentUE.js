/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Aug 2019     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
var CUSTOMER_CATEGORY = '5';
var SUPPLIER_CATEGORY = '5';
var APPLICABLE_SUBSIDIARY = '16';

function custSuppSegmentAS(type)
{
	if(type == 'create')
		{
			var record = nlapiGetNewRecord();
			var recordType = record.getRecordType();
			var recordId = record.getId();
			
			var name = record.getFieldValue('companyname');
			var subsidiary = record.getFieldValue('subsidiary');
			var category = record.getFieldValue('category');
			var customSegmentId = '';
			var entitySegmentField = '';
			
			switch(recordType)
			{
				case 'customer':
					customSegmentId = 'customrecord_cseg_bbs_customer';
					entitySegmentField = 'custentity_bbs_customer_segment';
					break;
					
				case 'vendor':
					customSegmentId = 'customrecord_cseg_bbs_supplier';
					entitySegmentField = 'custentity_bbs_supplier_segment';
					break;
			}
		
			if(subsidiary == APPLICABLE_SUBSIDIARY && ((recordType == 'customer' && category == CUSTOMER_CATEGORY) || (recordType == 'vendor' && category == SUPPLIER_CATEGORY))) //Subsidiary = Global Freight Solutions & Category = Tech Only
				{
					createSegment(recordType, recordId, entitySegmentField, name, customSegmentId);
				}
		}
	
	if(type == 'edit')
		{
			var oldRecord = nlapiGetOldRecord();
			var newRecord = nlapiGetNewRecord();
			
			var recordType = newRecord.getRecordType();
			var recordId = newRecord.getId();
			var subsidiary = newRecord.getFieldValue('subsidiary');
			
			var customSegmentId = '';
			var entitySegmentField = '';
			
			switch(recordType)
			{
				case 'customer':
					customSegmentId = 'customrecord_cseg_bbs_customer';
					entitySegmentField = 'custentity_bbs_customer_segment';
					break;
					
				case 'vendor':
					customSegmentId = 'customrecord_cseg_bbs_supplier';
					entitySegmentField = 'custentity_bbs_supplier_segment';
					break;
			}
			
			var oldSegment = oldRecord.getFieldValue(entitySegmentField);
			var newSegment = newRecord.getFieldValue(entitySegmentField);
			
			var oldName = oldRecord.getFieldValue('companyname');
			var newName = newRecord.getFieldValue('companyname');
			
			var oldCategory = oldRecord.getFieldValue('category');
			var newCategory = newRecord.getFieldValue('category');
			
			//If we have a segment associated to the entity & we have changed the name, then we need to update the segment
			//
			if(subsidiary == APPLICABLE_SUBSIDIARY && newSegment != null && newSegment != '' && oldName != newName)
				{
					updateSegment(customSegmentId, newSegment, newName);
				}
			
			//If we have a segment associated to the entity, but the category is no longer relevant, then remove the segment from the entity
			//
			if(subsidiary == APPLICABLE_SUBSIDIARY && newSegment != null && newSegment != '' && ((recordType == 'customer' && category != CUSTOMER_CATEGORY) || (recordType == 'vendor' && category != SUPPLIER_CATEGORY)))
				{
					removeSegment(recordType, recordId, entitySegmentField);
				}
			
			//If we don't have a segment associated to the entity, but the category is now relevant, then create a segment from the entity
			//
			if(subsidiary == APPLICABLE_SUBSIDIARY && newSegment == null || newSegment == '' && ((recordType == 'customer' && newCategory == CUSTOMER_CATEGORY) || (recordType == 'vendor' && newCategory == SUPPLIER_CATEGORY)))
				{
					createSegment(recordType, recordId, entitySegmentField, newName, customSegmentId);
				}
		}
}

//Create a segment & link it to the entity record
//
function createSegment(_recordType, _recordId, _entitySegmentField, _name, _customSegmentId)
{
	var segmentId = null;
	var segmentRecord = nlapiCreateRecord(_customSegmentId);
	segmentRecord.setFieldValue('name', _name);
	
	try
		{
			segmentId = nlapiSubmitRecord(segmentRecord, false, true);
		}
	catch(err)
		{
			segmentId = null;
			nlapiLogExecution('ERROR', 'Error creating segment for ' + name , err.message);
		}
	
	if(segmentId)
		{
			nlapiSubmitField(_recordType, _recordId, _entitySegmentField, segmentId, false);
		}
}

//Remove a segment value from an entity record
//
function removeSegment(_recordType, _recordId, _entitySegmentField)
{
	try
		{
			nlapiSubmitField(_recordType, _recordId, _entitySegmentField, '', false);
		}
	catch(err)
		{
			nlapiLogExecution('ERROR', 'Error removing segment for ' + _recordType + ' ' +  _recordId, err.message);
		}
}

//Update a related segment with a change of entity name
//
function updateSegment(_segmentEntityName, _segment, _name)
{
	try
		{
			nlapiSubmitField(_segmentEntityName, _segment, 'name', _name, false);
		}
	catch(err)
		{
			nlapiLogExecution('ERROR', 'Error updating segment for ' + _name , err.message);
		}
}