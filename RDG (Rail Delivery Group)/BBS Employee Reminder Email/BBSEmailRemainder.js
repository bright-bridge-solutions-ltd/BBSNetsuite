/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       18 Oct 2019     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) 
{
	var today 			= new Date();
	var endDateString 	= nlapiDateToString(today);
	var startDateString = nlapiDateToString(nlapiAddDays(today, -4));
	var sender			= 7287;
	
	
	//Find all employees that are job resources
	//
	var employeeSearch = nlapiSearchRecord("employee",null,
			[
			   ["isjobresource","is","T"],
			   "AND",
			   ["isinactive","is","F"],
			   "AND",
			   ["timeapprover","noneof","@NONE@"]
			], 
			[
			   new nlobjSearchColumn("entityid").setSort(false), 
			   new nlobjSearchColumn("email")
			]
			);
	
	var vendorSearch = nlapiSearchRecord("vendor",null,
			[
			   ["timeapprover","noneof","@NONE@"], 
			   "AND", 
			   ["isinactive","is","F"], 
			   "AND", 
			   ["email","isnotempty",""], 
			   "AND", 
			   ["isjobresourcevend","is","T"]
			], 
			[
			   new nlobjSearchColumn("entityid").setSort(false), 
			   new nlobjSearchColumn("email")
			]
			);
	
	var resultsOfSearch = [];
	
	if(employeeSearch != null && employeeSearch.length > 0)
		{
			resultsOfSearch = resultsOfSearch.concat(employeeSearch);
		}
	
	if(vendorSearch != null && vendorSearch.length > 0)
		{
			resultsOfSearch = resultsOfSearch.concat(vendorSearch);
		}
	
	//Do we have a list of employees?
	//
	if(resultsOfSearch != null && resultsOfSearch.length > 0)
		{
			//Loop through the list of employees
			//
			for (var int = 0; int < resultsOfSearch.length; int++) 
				{
					var employeeId = resultsOfSearch[int].getId();
					var employeeEmail = resultsOfSearch[int].getValue('email');
					var employeeName = resultsOfSearch[int].getValue('entityid');
					
					//Search for any time sheet entries
					//
					var timebillSearch = nlapiSearchRecord("timebill",null,
							[
							   ["employee","anyof",employeeId], 
							   "AND", 
							   ["date","within",startDateString,endDateString],
							   "AND", 
							   ["formulanumeric: CASE  WHEN  {date} >= {employee.custentity_bbs_date_pm_resource} THEN 1 ELSE 0 END","equalto","1"],
							   "AND",
							   ["type","anyof","A"]
							], 
							[
							   new nlobjSearchColumn("date").setSort(false)
							]
							);
					
					//If we can't find any results then we need to email the employee
					//
					if(timebillSearch == null || timebillSearch.length == 0)
						{
							var emailText = '';
							
							emailText += 'Dear ' + employeeName + '\n\n';
							emailText += 'You do not have any timesheet entries for the week ' + startDateString + ' to ' + endDateString + '\n';
							emailText += 'If you have any data to enter, please enter it before the end of the day, thanks.\n\n';
							emailText += 'Regards,\n\n';
							emailText += 'Netsuite\n';
							
							
							//Send email
							//
							try
								{
									nlapiSendEmail(sender, employeeEmail, 'Timesheet Entry Reminder', emailText, null, null, null, null, false, false, null);
								}
							catch(err)
								{
									nlapiLogExecution('ERROR', 'Failed to send email', err.message);
								}
						}
				}
			
		}
}
