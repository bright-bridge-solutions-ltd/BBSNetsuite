/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search) 
{
   
     /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function activityAfterSubmit(scriptContext) 
	    {
    		var type					= scriptContext.type;
    		var currentRecord 			= scriptContext.newRecord;
    		var currentType 			= currentRecord.type;
    		var currentId 				= currentRecord.id;
    		var kpiScore				= Number(0);
    		var companyChannel			= null;
    		var activityCompany			= null;
    		var activityContact			= null;
    		var activityCategory		= null;
    		var contactJobTitle			= null;
    		var activityCategoryField	= null;
    		var updateRecordType		= null;
    		
    		//Only works in create or edit mode
			//
			if (type == scriptContext.UserEventType.CREATE || type == scriptContext.UserEventType.EDIT)
				{
					//Get the company & contact from the activity
					//
					activityCompany 	= currentRecord.getValue({fieldId: 'company'});
					activityContact 	= currentRecord.getValue({fieldId: 'assigned'});
					
					//Get the activity category based on the record type
					//
					switch(currentType)
						{
							case 'task':
								activityCategory 		= currentRecord.getValue({fieldId: 'custevent_bbs_task_cat'});
								activityCategoryField	= 'custrecord_bbs_task_cat';
								updateRecordType		= record.Type.TASK;
								break;
								
							case 'phonecall':
								activityCategory 		= currentRecord.getValue({fieldId: 'custevent_bbs_call_cat'});
								activityCategoryField	= 'custrecord_bbs_call_cat';
								updateRecordType		= record.Type.PHONE_CALL;
								break;
								
							case 'calendarevent':
								activityCategory 		= currentRecord.getValue({fieldId: 'custevent_bbs_event_category'});
								activityCategoryField	= 'custrecord_bbs_event_cat';
								updateRecordType		= record.Type.CALENDAR_EVENT;
								break;
						}
					
					//Did we get a company?
					//
					if(activityCompany != null && activityCompany != '')
						{
							//Get the channel from the company
							//
							companyChannel = search.lookupFields({
																type:		search.Type.CUSTOMER,
																id:			activityCompany,
																columns:	'custentity_bbs_channel'
																})['custentity_bbs_channel'];
							
							companyChannel = (companyChannel.length > 0 ? companyChannel[0].value : null);
							
							//Did we get a company channel?
							//
							if(companyChannel != null && companyChannel != '')
								{
									//Did we get a contact?
									//
									if(activityContact != null && activityContact != '')
										{
											//Get the contact's job title
											//
											contactJobTitle = search.lookupFields({
																					type:		search.Type.CONTACT,
																					id:			activityContact,
																					columns:	'custentity_bbs_nymas_job_title'
																					})['custentity_bbs_nymas_job_title'];
											
											contactJobTitle = (contactJobTitle.length > 0 ? contactJobTitle[0].value : null);
											
											//Did we get a job title?
											//
											if(contactJobTitle != null && contactJobTitle != '')
												{
													//Now see if we can find a kpi record based on company channel, contact job title & activity category
													//
													var customrecord_bbs_kpic_scoresSearchObj = getResults(search.create({
																														   type: 		"customrecord_bbs_kpic_scores",
																														   filters:		[
																														             	 	["custrecord_bbs_kpi_contact_link.custrecord_bbs_kpic_channel","anyof",companyChannel], 
																																			"AND", 
																																			["custrecord_bbs_kpi_contact_link.custrecord_bbs_kpic_jobtitle","anyof",contactJobTitle],
																																			"AND", 
																																		    [activityCategoryField,"anyof",activityCategory]
																														             	 ],
																														   columns:
																																	   [
																																	      search.createColumn({
																																					         name: "custrecord_bbs_kpic_channel",
																																					         join: "CUSTRECORD_BBS_KPI_CONTACT_LINK",
																																					         sort: search.Sort.ASC,
																																					         label: "Channel"
																																					      }),
																																	      search.createColumn({
																																					         name: "custrecord_bbs_kpic_jobtitle",
																																					         join: "CUSTRECORD_BBS_KPI_CONTACT_LINK",
																																					         sort: search.Sort.ASC,
																																					         label: "Job Title"
																																					      }),
																																	      search.createColumn({name: "custrecord_bbs_call_cat", label: "Call Category"}),
																																	      search.createColumn({name: "custrecord_bbs_event_cat", label: "Event Category"}),
																																	      search.createColumn({name: "custrecord_bbs_task_cat", label: "Task Category"}),
																																	      search.createColumn({name: "custrecord_bbs_kpis_score", label: "Score"})
																																	   ]
																																		}));
													
													if(customrecord_bbs_kpic_scoresSearchObj != null && customrecord_bbs_kpic_scoresSearchObj.length > 0)
														{
															kpiScore = Number(customrecord_bbs_kpic_scoresSearchObj[0].getValue({name: "custrecord_bbs_kpis_score"}));
														}
														
												}
										}
								}
						}
					
					try
						{
							record.submitFields({
									    		type: 					updateRecordType,
									    		id: 					currentId,
									    		values:					{
									    								custevent_bbs_kpi_score:	kpiScore
									    								},
									    		enableSourcing: 		false,
												ignoreMandatoryFields: 	true
									    		});
						}
					catch(err)
						{
							log.error({
										title: 		'Error updating activity with id = ' + contactId,
										details: 	err
										});
						}
				}
	    }

    
    //Page through results set from search
    //
    function getResults(_searchObject)
	    {
	    	var results = [];
	
	    	var pageData = _searchObject.runPaged({pageSize: 1000});
	
	    	for (var int = 0; int < pageData.pageRanges.length; int++) 
	    		{
	    			var searchPage = pageData.fetch({index: int});
	    			var data = searchPage.data;
	    			
	    			results = results.concat(data);
	    		}
	
	    	return results;
	    }

    
    return 	{
        	afterSubmit: 	activityAfterSubmit
    		};
});
