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
function resourceAllocAS(type)
{
	if(type == 'create' || type == 'edit')
		{
			var newRecord 		= nlapiGetNewRecord();
			var employee 		= newRecord.getFieldText('allocationresource');
			var employeeId 		= newRecord.getFieldValue('allocationresource');
			var projectTask 	= newRecord.getFieldText('projecttask');
			var notes 			= newRecord.getFieldValue('notes');
			var startDate 		= newRecord.getFieldValue('startdate');
			var endDate 		= newRecord.getFieldValue('enddate');
			var allocAmount 	= newRecord.getFieldValue('allocationamount');
			var project 		= newRecord.getFieldText('project');
			var projectId 		= newRecord.getFieldValue('project');
			var allocUnit 		= newRecord.getFieldValue('allocationunit');
			var pmoId 			= nlapiLookupField('job', projectId, 'custentity_bbs_pmo_project', false);
			var pmo 			= nlapiLookupField('job', projectId, 'custentity_bbs_pmo_project', true);
			var objective 		= nlapiLookupField('job', projectId, 'custentity_bbs_objective_project', false);
			var projectLink		= nlapiResolveURL('RECORD', 'job', projectId, 'VIEW');
			var employeeEmail 	= '';
			var pmoEmail 		= '';
			var context 		= nlapiGetContext();
			var sender			= context.getUser();
			var companyConfig 	= null;
			var employeeChanged = false;
			allocUnit			= (allocUnit == 'H' ? 'Hours' : 'Percentage of Time');
			
			//If editing, see if the resource (employee) has changed
			//
			if(type == 'edit')
				{
					var oldRecord 		= nlapiGetOldRecord();
					var oldEmployeeId 	= oldRecord.getFieldValue('allocationresource');
					
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
					
					//Try to read the email address from the pmo
					//
					try
						{
							pmoEmail = nlapiLookupField('employee', pmoId, 'email', false);
						}
					catch(err)
						{
							pmoEmail = '';
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
							emailText +=	'This is to inform you that you have been allocated to project "' + project + '"\n\n';
							emailText +=	'Project Task - "' + projectTask + '"\n';
							emailText +=	'Start Date - ' + startDate + '\n';
							emailText +=	'End Date - ' + endDate + '\n';
							emailText +=	'Allocation - ' + allocAmount + ' ' + allocUnit + '\n\n';
							emailText +=	'Additional Notes - ' + notes + '\n\n';
							emailText +=	'To see the project record in Netsuite, please click on the following link; ' + projectLink + '\n\n\n';
							emailText +=	'Regards,\n\n';
							emailText +=	'Netsuite';
							
							//Send email
							//
							var linkedRecords = {};
							linkedRecords['entity'] = projectId;
							
							try
								{
									nlapiSendEmail(sender, employeeEmail, 'Resource Allocation To Project', emailText, null, null, linkedRecords, null, false, false, null);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Failed to send email', err.message);
								}
						}
					
					//Have we got a pmo email address?
					//
					if(pmoEmail != '')
						{
							//Build up the email text
							//
							var emailText = '';
							emailText +=	'Dear ' + pmo + ',\n\n\n';
							emailText +=	'This is to inform you that the following resource has been allocated to project "' + project + '"\n\n';
							emailText +=	'Resource - ' + employee + '\n';
							emailText +=	'Project Task - "' + projectTask + '"\n';
							emailText +=	'Start Date - ' + startDate + '\n';
							emailText +=	'End Date - ' + endDate + '\n';
							emailText +=	'Allocation - ' + allocAmount + ' ' + allocUnit + '\n\n';
							emailText +=	'Additional Notes - ' + notes + '\n\n';
							emailText +=	'Objective - ' + objective + '\n\n';
							emailText +=	'To see the project record in Netsuite, please click on the following link; ' + projectLink + '\n\n\n';
							emailText +=	'Regards,\n\n';
							emailText +=	'Netsuite';
							
							//Send email
							//
							try
								{
									nlapiSendEmail(sender, pmoEmail, 'Resource Allocation To Project', emailText, null, null, linkedRecords, null, false, false, null);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Failed to send email', err.message);
								}
						}
				}
		}
}
