/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Oct 2019     cedricgriffiths
 *
 */

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
function projectManagerAS(type)
{
	if(type == 'create' || type == 'edit')
		{
			var newRecord 		= nlapiGetNewRecord();
			var project 		= newRecord.getFieldValue('companyname');
			var projectId 		= newRecord.getId();
			var pmoId 			= newRecord.getFieldValue('custentity_bbs_pmo_project');
			var pmo 			= newRecord.getFieldText('custentity_bbs_pmo_project');
			var objective 		= newRecord.getFieldValue('custentity_bbs_objective_project');
			var employeeId		= newRecord.getFieldValue('custentity_bbs_projectmanager_project');
			var employee		= newRecord.getFieldText('custentity_bbs_projectmanager_project');
			var projectLink		= nlapiResolveURL('RECORD', 'job', projectId, 'VIEW');
			var employeeEmail 	= '';
			var pmoEmail 		= '';
			var context 		= nlapiGetContext();
			var sender			= pmoId;
			var companyConfig 	= null;
			var employeeChanged = false;
			
			//If editing, see if the pm (employee) has changed
			//
			if(type == 'edit')
				{
					var oldRecord 		= nlapiGetOldRecord();
					var oldEmployeeId 	= oldRecord.getFieldValue('custentity_bbs_projectmanager_project');
					
					if(oldEmployeeId != employeeId)
						{
							employeeChanged = true;
						}
				}
			
			if(type == 'create' || employeeChanged)
				{
					//Read the company config
					//
					try 
						{
							companyConfig = nlapiLoadConfiguration('companyinformation');
						} 
					catch (err) 
						{
							companyConfig 	= null;
						}
					
					//Get the prefix to the url
					//
					if(companyConfig != null)
						{
							var accountNunber = companyConfig.getFieldValue('companyid');
							projectLink = 'https://' + accountNunber.replace('_','-') + '.app.netsuite.com' + projectLink;
						}
					
					
					//Try to read the email address from the employee
					//
					try
						{
							employeeEmail = nlapiLookupField('employee', employeeId, 'email', false);
						}
					catch(err)
						{
							employeeEmail = '';
						}
					
					//Have we got an employee email address?
					//
					if(employeeEmail != '')
						{
							//Build up the email text
							//
							var emailText = '';
							emailText +=	'Dear ' + employee + ',\n\n\n';
							emailText +=	'This is to inform you that you have been allocated as the project manager to project "' + project + '"\n\n';
							emailText +=	'Objective - ' + objective + '\n\n';
							emailText +=	'To see the project record in Netsuite, please click on the following link; ' + projectLink + '\n\n\n';
							emailText +=	'Regards,\n\n';
							emailText +=	'Netsuite';
							
							//Send email
							//
							var linkedRecords = {};
							linkedRecords['entity'] = projectId;
							
							try
								{
									nlapiSendEmail(sender, employeeEmail, 'Allocation Of Project Manager To Project', emailText, null, null, linkedRecords, null, false, false, null);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Failed to send email', err.message);
								}
						}
				}
		}
}
