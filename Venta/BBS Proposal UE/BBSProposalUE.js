/**
 * Module Description
 * 
 * Version    	Date            	Author           Remarks
 * 1.00       	08 Jan 2018     	krish
 * 1.01       	30 Jan 2018     	suceen          // Add Copy Image URL before submit
 * 1.02			22 Jul 2019			sambatten		replaced before submit function and renamed script to BBSProposalUE
 * 1.03			26 Jul 2019			sambatten		removed function to set product images as this is handled by script BBS Sales Order Line Image
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
	}