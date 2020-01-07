/**
 * Module Description
 * 
 * Version    	Date            Author           	Remarks
 * 1.00       	14 Feb 2017     cedricgriffiths		Initial version
 * 1.10			07 Jan 2020		sambatten			Added code to pass record type to library script
 *
 */
function SalesOrderFieldChanged(type, name, linenum)
	{
		// get the record type
		var recordType = nlapiGetRecordType();
		
		LibProcessFieldChanges(type, name, linenum, 'custcol_bbs_quote_cost', recordType);
	}