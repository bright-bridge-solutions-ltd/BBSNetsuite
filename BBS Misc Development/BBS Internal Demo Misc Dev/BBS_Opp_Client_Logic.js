/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 29 Mar 2016 cedric
 * 
 */
function OpportunityFieldChanged(type, name, linenum) {
	LibProcessFieldChanges(type, name, linenum, 'custcol_bbs_opp_linecost');
}
