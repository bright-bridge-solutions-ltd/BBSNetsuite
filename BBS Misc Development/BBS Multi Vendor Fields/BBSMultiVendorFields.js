/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Jan 2017     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request){

	//nlapiLogExecution('DEBUG', 'Progress', 'In userEventBeforeLoad');
	
    addField(form);
    hideSubtlist(form);
    disableField(form);
}

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
function userEventAfterSubmit(type){

	//nlapiLogExecution('DEBUG', 'Progress', 'In userEventAfterSubmit');
	
    var vendors = nlapiGetLineItemCount('itemvendor'); 
    var itemid = nlapiGetRecordId();

    for (var i = 0; vendors != null && i < vendors; i++) {
        var vendorid = nlapiGetLineItemValue('itemvendor','vendor',i+1);
        var customfield = nlapiGetLineItemValue('itemvendor','custpagecustom',i+1);    

        if (checkMVF(itemid, vendorid)){
            nlapiSubmitField('customrecord_bbs_multi_vendor_fields',mvfid,'custrecord_bbs_custom_field_1',customfield);
        }
        else{
            var rec = nlapiCreateRecord('customrecord_bbs_multi_vendor_fields');
            rec.setFieldValue('custrecord_bbs_multi_item', itemid);
            rec.setFieldValue('custrecord_bbs_multi_vendor', vendorid);
            rec.setFieldValue('custrecord_bbs_custom_field_1', customfield);
            nlapiSubmitRecord(rec);
        }
    }
}

function addField(form){
	
	//nlapiLogExecution('DEBUG', 'Progress', 'In addField');
	
    var sublist = form.getSubList('itemvendor');
    
    if(sublist != null )
    	{
		    sublist.addField('custpagecustom','text','Supplier Reference');
		    var vendors = nlapiGetLineItemCount('itemvendor');
		    var itemid = nlapiGetRecordId();
		
		    for (var i = 0; vendors != null && i < vendors; i++) {
		        var vendorid = nlapiGetLineItemValue('itemvendor','vendor',i+1);
		
		        if (checkMVF(itemid, vendorid)) {
		            var customfield = nlapiLookupField('customrecord_bbs_multi_vendor_fields',mvfid,'custrecord_bbs_custom_field_1');
		            nlapiSetLineItemValue('itemvendor','custpagecustom',i+1,customfield);
		        }
		    }
    	}
}

function hideSubtlist(form) { 
	
	//nlapiLogExecution('DEBUG', 'Progress', 'In hideSublist');
	
	var sl = form.getSubList('itemvendor');
	
	if (sl != null)
		{
			sl.getField('vendorcode').setDisplayType('hidden'); 
		}
	
}

function disableField(form){
	
	//nlapiLogExecution('DEBUG', 'Progress', 'In disableField');
	
}


function checkMVF(item, vendor){
	
	//nlapiLogExecution('DEBUG', 'Progress', 'In checkMVF');
	
    var itemFilters = new Array();
    itemFilters[0] = new nlobjSearchFilter('custrecord_bbs_multi_item', null, 'is', item);
    itemFilters[1] = new nlobjSearchFilter('custrecord_bbs_multi_vendor', null, 'is', vendor);
    var itemColumns = new Array();
    itemColumns[0] = new nlobjSearchColumn('internalid', null, null);
    var searchresults = nlapiSearchRecord('customrecord_bbs_multi_vendor_fields', null, itemFilters, itemColumns);

    if (numRows(searchresults) > 0) {
        mvfid = searchresults[0].getValue('internalid');
        return true;
    }
    else{
        return false;
    }
}

function numRows(obj){
    var ctr = 0;

    for (var k in obj){
        if (obj.hasOwnProperty(k)){
            ctr++;
        }
    }
    return ctr;
}

