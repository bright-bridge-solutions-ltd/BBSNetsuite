/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Feb 2020     sambatten
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
	
	// check that the record is being created
	if (type == 'create')
		{
			// get the current URL
			var URL = location;
			
			// create a search object of the URL
			var URLSearch = URL.search;
			var URLSearchParameters = new URLSearchParams(URLSearch); 
			
			// get the contact and event IDs from the URL
			var contactID = URLSearchParameters.get('custbody_acc_tran_contact');
			var eventID = URLSearchParameters.get('custbody_bbs_related_event');

			// set the contact and event fields on the quote record
			nlapiSetFieldValue('custbody_acc_tran_contact', contactID);
			nlapiSetFieldValue('custbody_bbs_related_event', eventID);
		}
   
}
