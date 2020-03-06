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
function carrierIfBL(type, form, request)
{
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
function carrierIfAS(type)
{

	if(type == 'create' || type == 'edit')
		{
			var packages = nlapiGetLineItemCount('package'); 
		    var fulfilmentId = nlapiGetRecordId();
		    
				    for (var i = 0; packages != null && i < packages; i++) 
				    	{
					        var packageId = nlapiGetLineItemValue('package','packagetrackingnumber',i+1);
					        var customfield = nlapiGetLineItemValue('package','custpagecustom',i+1);    
				
					        if (checkMVF(fulfilmentId, packageId))
						        {
						            nlapiSubmitField('customrecord_bbs_if_additional_fields',mvfid,'custrecord_bbs_custom_field_1',customfield);
						        }
					        else
					        	{
						            var rec = nlapiCreateRecord('customrecord_bbs_if_additional_fields');
						            rec.setFieldValue('custrecord_bbs_if_fulfilment', fulfilmentId);
						            rec.setFieldValue('custrecord_bbs_if_package_key', packageId);
						            rec.setFieldValue('custrecord_bbs_custom_field_1', customfield);
						            nlapiSubmitRecord(rec);
					        	}
				    	}
		}
}

function addField(form){
	
	//nlapiLogExecution('DEBUG', 'Progress', 'In addField');
	
    var sublist = form.getSubList('package');
    
    if(sublist != null )
    	{
		    sublist.addField('custpagecustom','text','Package Tracking Link');
		    var packages = nlapiGetLineItemCount('package');
		    var fulfilmentId = nlapiGetRecordId();
		
		    for (var i = 0; packages != null && i < packages; i++) {
		        var packageId = nlapiGetLineItemValue('package','packagetrackingnumber',i+1);
		
		        if (checkMVF(fulfilmentId, packageId)) {
		            var customfield = nlapiLookupField('customrecord_bbs_if_additional_fields',mvfid,'custrecord_bbs_custom_field_1');
		            nlapiSetLineItemValue('package','custpagecustom',i+1,customfield);
		        }
		    }
    	}
}

function hideSubtlist(form) { 
	
	//nlapiLogExecution('DEBUG', 'Progress', 'In hideSublist');
	
	var sl = form.getSubList('package');
	
	if (sl != null)
		{
			sl.getField('packagetrackingnumber').setDisplayType('hidden'); 
		}
	
}

function disableField(form){
	
	//nlapiLogExecution('DEBUG', 'Progress', 'In disableField');
	
}


function checkMVF(item, vendor){
	
	//nlapiLogExecution('DEBUG', 'Progress', 'In checkMVF');
	
    var itemFilters = new Array();
    itemFilters[0] = new nlobjSearchFilter('custrecord_bbs_if_fulfilment', null, 'is', item);
    itemFilters[1] = new nlobjSearchFilter('custrecord_bbs_if_package_key', null, 'is', vendor);
    var itemColumns = new Array();
    itemColumns[0] = new nlobjSearchColumn('internalid', null, null);
    var searchresults = nlapiSearchRecord('customrecord_bbs_if_additional_fields', null, itemFilters, itemColumns);

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

