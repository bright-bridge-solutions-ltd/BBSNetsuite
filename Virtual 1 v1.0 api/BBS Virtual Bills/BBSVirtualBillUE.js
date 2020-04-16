/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Feb 2020     cedricgriffiths
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
function virtualBillBL(type, form, request)
{
	if (type == 'view') 
		{
			var thisRecord = nlapiGetNewRecord();
			var recId = thisRecord.getId();

			var cmd ="try{";			
			cmd +=  "Ext.Ajax.timeout = (60000*5);";
			cmd += "var myMask = new Ext.LoadMask(Ext.getBody(), {msg:'Submitting Virtual Bill For Reconciliation...'});";
		    cmd += "myMask.show();";
		    cmd += "Ext.Ajax.request({";
		    cmd += "    url: '" + nlapiResolveURL('SUITELET', 'customscript_bbs_vbill_suitelet', 'customdeploy_bbs_vbill_suitelet') + "',";
		    cmd += "    method: 'GET',";
		    cmd += "    headers: {'Content-Type': 'application/json'},";
		    cmd += "    params: {";
		    cmd += "     record_id: '" + recId + "'";
		    cmd += "    },";
		    cmd += "    success: function (response, result) {";
		    cmd += "  myMask.hide();";
		    cmd += "  window.location = response.responseText";
		    cmd += "    },";
		    cmd += "    failure: function (response, result) {";
		    cmd += "  myMask.hide();";
		    cmd += "     alert(response.responseText);";
		    cmd += "    }";
		    cmd += "});";
		    cmd += "}";
		    cmd += "catch (e) {";
		    cmd += "        if (e instanceof nlobjError) {";
		    cmd += "            alert(e.getCode() + '\n' + e.getDetails());";
		    cmd += "        }";
		    cmd += "        else {";
		    cmd += "            alert(e.toString());";
		    cmd += "        }";
		    cmd += "    }";
		    
			form.addButton('custpage_bbs_but_recon','ReRun Reconciliation',cmd);
		}
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
function virtualBillAS(type)
{
	//Determine if we need to trigger the reconciliation of the virtual bill record
	//
	var newRecord 			= nlapiGetNewRecord();
	var triggerRecon 		= false;
	var allLinesAddedNew 	= '';
	var allLinesAddedOld 	= '';
	var newRecordId 		= newRecord.getId();
	
	if(type == 'create')
		{	
			allLinesAddedNew = newRecord.getFieldValue('custrecord_all_lines_added');
				
			//Record has been created with the all lines added flag set to true
			//
			if(allLinesAddedNew == 'T')
				{
					triggerRecon = true;
				}		
		}
				
	if(type == 'edit')
		{		
			var oldRecord = nlapiGetOldRecord();
			
			allLinesAddedOld = oldRecord.getFieldValue('custrecord_all_lines_added');
			allLinesAddedNew = newRecord.getFieldValue('custrecord_all_lines_added');
				
			//Record has been edited and the all lines added flag has been changed from false to true
			//
			if(allLinesAddedNew == 'T' && allLinesAddedOld != 'T')
				{
					triggerRecon = true;
				}
		}
	
	//Call a scheduled script to reconcile the virtual bill
	//
	if(triggerRecon)
		{
			nlapiScheduleScript('customscript_bbs_vbill_recon', null, {custscript_bbs_vbill_id: newRecordId})
		}
}
