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
	if(type == 'delete')
		{
			var oldRecord 		= nlapiGetOldRecord();
			var oldEmployeeId 	= oldRecord.getFieldValue('allocationresource');
			var projectTaskId 	= oldRecord.getFieldValue('projecttask');
			var projectId 		= oldRecord.getFieldValue('project');
			
			//Load the task record
			//
			var taskRecord = null;
			
			try
				{
					taskRecord = nlapiLoadRecord('projecttask', projectTaskId);
				}
			catch(err)
				{
					taskRecord = null;
				}
			
			if(taskRecord != null)
				{
					try
						{
							var lines = taskRecord.getLineItemCount('assignee');
									
							for (var int = 1; int <= lines; int++) 
								{
									var lineResourceId = taskRecord.getLineItemValue('assignee', 'resource', int);
										
									if(lineResourceId == oldEmployeeId)
										{
											taskRecord.removeLineItem('assignee', int);
											break;
										}
								}

							nlapiSubmitRecord(taskRecord, true, true);
						}
					catch(err)
						{
						
						}
				}
		}
	
	if(type == 'create' || type == 'edit')
		{
			var newRecord 		= nlapiGetNewRecord();
			var employee 		= newRecord.getFieldText('allocationresource');
			var employeeId 		= newRecord.getFieldValue('allocationresource');
			var projectTask 	= newRecord.getFieldText('projecttask');
			var projectTaskId 	= newRecord.getFieldValue('projecttask');
			var notes 			= newRecord.getFieldValue('notes');
			var startDate 		= newRecord.getFieldValue('startdate');
			var endDate 		= newRecord.getFieldValue('enddate');
			var allocAmount 	= newRecord.getFieldValue('allocationamount');
			var project 		= newRecord.getFieldText('project');
			var projectId 		= newRecord.getFieldValue('project');
			var allocUnit 		= newRecord.getFieldValue('allocationunit');
			var pmoId 			= '';
			var pmo 			= '';
			var projectManagerId = '';
			var projectManager 	= '';
			var objective 		= '';
			
			try
				{
					pmoId 			= nlapiLookupField('job', projectId, 'custentity_bbs_pmo_project', false);
					pmo 			= nlapiLookupField('job', projectId, 'custentity_bbs_pmo_project', true);
					projectManagerId = nlapiLookupField('job', projectId, 'custentity_bbs_projectmanager_project', false);
					projectManager 	= nlapiLookupField('job', projectId, 'custentity_bbs_projectmanager_project', true);
					objective 		= nlapiLookupField('job', projectId, 'custentity_bbs_objective_project', false);
				}
			catch(err)
				{
				
				}
			
			var projectLink		= nlapiResolveURL('RECORD', 'job', projectId, 'VIEW');
			var employeeEmail 	= '';
			var projectManagerEmail = '';
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
					//Add the resource to the task assignees if we are in create mode
					//
					//if(type == 'create')
					//	{
							//Load the task record
							//
							var taskRecord = null;
							
							try
								{
									taskRecord = nlapiLoadRecord('projecttask', projectTaskId);
								}
							catch(err)
								{
									taskRecord = null;
								}
							
							if(taskRecord != null)
								{
									try
										{
											if(employeeChanged)
												{
													var lines = taskRecord.getLineItemCount('assignee');
													
													for (var int = 1; int <= lines; int++) 
														{
															var lineResourceId = taskRecord.getLineItemValue('assignee', 'resource', int);
															
															if(lineResourceId == oldEmployeeId)
																{
																	taskRecord.removeLineItem('assignee', int);
																	break;
																}
														}
												}
											
											taskRecord.selectNewLineItem('assignee');
											taskRecord.setCurrentLineItemValue('assignee', 'resource', employeeId);
											taskRecord.setCurrentLineItemValue('assignee', 'plannedwork', allocAmount);
											taskRecord.commitLineItem('assignee');
											nlapiSubmitRecord(taskRecord, true, true);
										}
									catch(err)
										{
										
										}
								}
					//	}
					
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
					
					//Try to read the email address from the project manager
					//
					try
						{
							projectManagerEmail = nlapiLookupField('employee', projectManagerId, 'email', false);
						}
					catch(err)
						{
							projectManagerEmail = '';
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
					
					//Try to see if the allocated resource is actually a generic resource
					//If it is, then we actually want to sent the email to the PMO, not the pm
					//
					var dynamicWording = 'allocated';
						
					try 
						{
							var genericRecord = nlapiLoadRecord('genericresource', employeeId);
							
							//Swap the pm details for that of the pmo
							//
							projectManagerEmail = pmoEmail;
							projectManager = pmo;
							dynamicWording = 'requested';
						} 
					catch(err) 
						{
						
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
							emailText +=	'Project Managers\n\n';
							emailText +=	'If you are a Project Manager, please ensure you are logged in to your Project Manager Role then use the following link to access the project record; ' + projectLink + '\n\n\n';
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
					
					//Have we got a project manager email address?
					//
					if(projectManagerEmail != '')
						{
							//Build up the email text
							//
							var emailText = '';
							emailText +=	'Dear ' + projectManager + ',\n\n\n';
							emailText +=	'This is to inform you that the following resource has been ' + dynamicWording + ' to project "' + project + '"\n\n';
							emailText +=	'Resource - ' + employee + '\n';
							emailText +=	'Project Task - "' + projectTask + '"\n';
							emailText +=	'Start Date - ' + startDate + '\n';
							emailText +=	'End Date - ' + endDate + '\n';
							emailText +=	'Allocation - ' + allocAmount + ' ' + allocUnit + '\n\n';
							emailText +=	'Additional Notes - ' + notes + '\n\n';
							emailText +=	'Objective - ' + objective + '\n\n';
							emailText +=	'Project Managers\n\n';
							emailText +=	'If you are a Project Manager, please ensure you are logged in to your Project Manager Role then use the following link to access the project record; ' + projectLink + '\n\n\n';
							emailText +=	'Regards,\n\n';
							emailText +=	'Netsuite';
							
							var linkedRecords = {};
							linkedRecords['entity'] = projectId;
							
							//Send email
							//
							try
								{
									nlapiSendEmail(sender, projectManagerEmail, 'Resource Allocation To Project', emailText, null, null, linkedRecords, null, false, false, null);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Failed to send email', err.message);
								}
						}
				}
		}
}
