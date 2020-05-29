/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Jun 2019     cedricgriffiths
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
function partnerBL(type, form, request)
{
	if(type == 'view')
		{
			//form.addButton('custpage_statement_button', 'Email Statement To Partner', 'sendStatement()');
			//form.setScript('customscript_bbs_partner_client');
		
			var thisRecord = nlapiGetNewRecord();
			var recId = thisRecord.getId();
	
			var cmd ="try{";			
			cmd +=  "Ext.Ajax.timeout = (60000*5);";
			cmd += "var myMask = new Ext.LoadMask(Ext.getBody(), {msg:'Submitting Statement Generation For Partner...'});";
		    cmd += "myMask.show();";
		    cmd += "Ext.Ajax.request({";
		    cmd += "    url: '" + nlapiResolveURL('SUITELET', 'customscript_bbs_st_emailer_su', 'customdeploy_bbs_st_emailer_su') + "',";
		    cmd += "    method: 'GET',";
		    cmd += "    headers: {'Content-Type': 'application/json'},";
		    cmd += "    params: {";
		    cmd += "     partnerid: '" + recId + "'";
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
		    
			form.addButton('custpage_statement_button','Email Statement To Partner',cmd);
		}
}
