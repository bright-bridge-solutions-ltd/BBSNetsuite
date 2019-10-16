/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Oct 2019     cedricgriffiths
 *
 */

/**
 * @returns {Void} Any or no return value
 */
function checkApprover(id, type, form) 
{
	var showButton = 'F';
	var context = nlapiGetContext();
	var userId = context.getSetting('SCRIPT', 'custscript_bbs_ca_user_id');
	var fieldId = context.getSetting('SCRIPT', 'custscript_bbs_ca_field_id');
	var poRecord = nlapiGetNewRecord();
	var capexMatrix = poRecord.getFieldValue('custbody_bbs_cap_app_mat');
	var opexMatrix = poRecord.getFieldValue('custbody_bbs_ope_app_mat');
	var matrixRecord = null;
	var matrixRecordId = '';
	
	//Process CAPEX approvals
	//
	if(capexMatrix != null && capexMatrix != '')
		{
			matrixRecordId = 'customrecord_capex_app_rout_grid';
		}
	
	if(opexMatrix != null && opexMatrix != '')
		{
			matrixRecordId = 'customrecord_bbs_opex_app_matrix';
		}

		//Read the matrix record
		//
		try
			{
				matrixRecord = nlapiLoadRecord(matrixRecordId, capexMatrix);
			}
		catch(err)
			{
				matrixRecord = null;
			}
		
		//Matrix record loaded ok?
		//
		if(matrixRecord != null)
			{
				//Make sure we have a field to lookup in the matrix
				//
				if(fieldId != null && fieldId != '')
					{
						//Get the multi-select field values
						//
						var approvers = matrixRecord.getFieldValues(fieldId);
						
						//Any values to check?
						//
						if(approvers != null && approvers.length > 0)
							{
								for (var int = 0; int < approvers.length; int++) 
									{
										if(approvers[int] == userId)
											{
												showButton = 'T';
												break;
											}
									}
							}
					}
			}
		
	return showButton;
}
