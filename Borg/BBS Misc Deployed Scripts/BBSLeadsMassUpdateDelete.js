/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Jul 2016     cedric           Customer : Borg
 *
 */

/**
 * @param {String} recType Record type internal id
 * @param {Number} recId Record internal id
 * @returns {Void}
 */
function leadsMassUpdate(recType, recId) 
{
	//See if there are any related contacts
	//
	var contactSearch = nlapiSearchRecord("contact",null,
			[
			   ["company","anyof",recId]
			], 
			[
			   new nlobjSearchColumn("entityid").setSort(false)
			]
			);
	
	if(contactSearch != null && contactSearch.length > 0)
		{
			for (var int = 0; int < contactSearch.length; int++) 
				{
					var contactId = contactSearch[int].getId();
					
					try 
						{
							nlapiDeleteRecord('contact', contactId);
						} 
					catch (err) 
						{
							nlapiLogExecution('ERROR', 'Error Deleting contact with id = ' + contactId, err.message);
						}
				}
		}
	
	//Now delete the lead
	//
	try
		{
			nlapiDeleteRecord(recType, recId);
		}
	catch(err)
		{
			nlapiLogExecution('ERROR', 'Error Deleting Lead with id = ' + recId, err.message);
		}
}
