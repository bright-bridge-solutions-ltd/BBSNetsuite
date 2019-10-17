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
	if(type == 'create')
		{
			var newRecord 		= nlapiGetNewRecord();
			var employee 		= newRecord.getFieldText('allocationresource');
			var employeeId 		= newRecord.getFieldValue('allocationresource');
			var projectTask 	= newRecord.getFieldText('projecttask');
			var notes 			= newRecord.getFieldValue('notes');
			var startDate 		= newRecord.getFieldValue('startdate');
			var endDate 		= newRecord.getFieldValue('enddate');
			var allocAmount 	= newRecord.getFieldValue('allocationamount');
			var project 		= newRecord.getFieldValue('companyname');
			var projectId 		= newRecord.getFieldValue('project');
			var allocUnit 		= newRecord.getFieldValue('allocationunit');
			var projectLink		= nlapiResolveURL('RECORD', 'resourceallocation', projectId, 'VIEW');
			var employeeEmail 	= '';
			var context 		= nlapiGetContext();
			var sender			= context.getUser();
			var companyConfig 	= null;
			allocUnit			= (allocUnit == 'H' ? 'Hours' : 'Percentage of Time');
			
			try 
				{
					companyConfig = nlapiLoadConfiguration('companyinformation');
				} 
			catch (err) 
				{
					companyConfig 	= null;
				}
			
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
			
			//Have we got an email address?
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
					try
						{
							nlapiSendEmail(sender, employeeEmail, 'Resource Allocation To Project', emailText, null, null, null, null, false, false, null);
						}
					catch(err)
						{
							nlapiLogExecution('ERROR', 'Failed to send email', err.message);
						}
				}
		}
}
