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
var PROJECT_MANAGER_FIELD = 'custentity_bbs_projectmanager_project';

function projectAS(type)
{
	//Processing on create of a project record
	//
	if(type == 'create')
		{
			var newRecord = nlapiGetNewRecord();
			var projectManager = newRecord.getFieldValue(PROJECT_MANAGER_FIELD);
			
			//Do we have a PM set?
			//
			if(projectManager != null && projectManager != '')
				{
					createTask(newRecord);
				}
		}
	
	//Processing on edit of a project record
	//
	if(type == 'edit')
		{
			var oldRecord = nlapiGetOldRecord();
			var newRecord = nlapiGetNewRecord();
			
			//Get old & new pm field values
			//
			var oldProjectManager = oldRecord.getFieldValue(PROJECT_MANAGER_FIELD);
			var newProjectManager = newRecord.getFieldValue(PROJECT_MANAGER_FIELD);
			
			//If the new pm is not blank & its different from the old version, then create a task
			//
			if(newProjectManager != null && newProjectManager != '' && newProjectManager != oldProjectManager)
				{
					createTask(newRecord);
				}
		}
}

function createTask(_projectRecord)
{
	var pm 			= _projectRecord.getFieldValue(PROJECT_MANAGER_FIELD);
	var objective 	= _projectRecord.getFieldValue('custentity_bbs_objective_project');
	var projectId 	= _projectRecord.getId();
	var taskRecord 	= null;
	var taskDate 	= nlapiDateToString(new Date());
	
	try
		{
			taskRecord = nlapiCreateRecord('task', {recordmode: 'dynamic'});
		}
	catch(err)
		{
			taskRecord = null;
			nlapiLogExecution('ERROR', 'Error creating task record', err.message);
		}
	
	if(taskRecord != null)
		{
			//Set the task fields
			//
			taskRecord.setFieldValue('company', projectId);
			taskRecord.setFieldValue('assigned', pm);
			taskRecord.setFieldValue('title', objective);
			taskRecord.setFieldValue('sendemail', 'T');
			taskRecord.setFieldValue('message', objective);
			//taskRecord.setFieldValue('startdate', taskDate);
			//taskRecord.setFieldValue('duedate', taskDate);
			
			//Save the task record
			//
			try
				{
					nlapiSubmitRecord(taskRecord, true, true);
				}
			catch(err)
				{
					nlapiLogExecution('ERROR', 'Error saving task record', err.message);
				}
		}
}
