/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Aug 2019     cedricgriffiths	Script to create the relevant custom segment values from customers & suppliers
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
var APPLICABLE_SUBSIDIARY = '16';
var CUSTOMER_CATEGORY = '5';
var SUPPLIER_CATEGORY = '5';

function scheduled(type) 
{
	processCustomers();
	processSuppliers();
}

function processCustomers()
{
	var customerSearch = nlapiSearchRecord("customer",null,
			[
			   ["subsidiary","anyof",APPLICABLE_SUBSIDIARY], 
			   "AND", 
			   ["category","anyof",CUSTOMER_CATEGORY], 
			   "AND", 
			   ["custentity_bbs_customer_segment","anyof","@NONE@"]
			], 
			[
			   new nlobjSearchColumn("entityid").setSort(false)
			]
			);
	
	if(customerSearch != null && customerSearch.length > 0)
		{
			for (var int = 0; int < customerSearch.length; int++) 
				{
					checkResources();
					
					var customerId = customerSearch[int].getId();
					var customerName = customerSearch[int].getValue('entityid');
					
					createSegment('customer', customerId, 'custentity_bbs_customer_segment', customerName, 'customrecord_cseg_bbs_customer');
				}
		}
}

function processSuppliers()
{
	var vendorSearch = nlapiSearchRecord("vendor",null,
			[
			   ["subsidiary","anyof",APPLICABLE_SUBSIDIARY], 
			   "AND", 
			   ["category","anyof",SUPPLIER_CATEGORY], 
			   "AND", 
			   ["custentity_bbs_supplier_segment","anyof","@NONE@"]
			], 
			[
			   new nlobjSearchColumn("entityid").setSort(false)
			]
			);
	
	if(vendorSearch != null && vendorSearch.length > 0)
		{
			for (var int = 0; int < vendorSearch.length; int++) 
				{
					checkResources();
					
					var customerId = vendorSearch[int].getId();
					var customerName = vendorSearch[int].getValue('entityid');
					
					createSegment('vendor', customerId, 'custentity_bbs_supplier_segment', customerName, 'customrecord_cseg_bbs_supplier');
				}
		}
}

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

function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 200)
		{
			nlapiYieldScript();
		}
}