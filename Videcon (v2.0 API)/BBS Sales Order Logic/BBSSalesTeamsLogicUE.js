/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/search', 'N/file', 'N/config'],
/**
 * @param {record} record
 * @param {search} search
 */
function(runtime, record, search, file, config) 
{
	
	function salesteamAfterSubmit(scriptContext) 
	    {
    		if(scriptContext.type == 'create' || scriptContext.type == 'edit')
    			{
    				var currentRecord 		= scriptContext.newRecord;
    				var currentRecordType 	= currentRecord.type;
    				var currentRecordId 	= currentRecord.id;
    				var recordUpdated		= false;
    				
    				//Get the logged in user
    				//
    				var currentUser			= runtime.getCurrentUser().id;
    				
    				
    				if(currentUser != null && currentUser != '')
    					{
    						//See if the employee is a sales rep
    						//
    						var salesRoleObj = search.lookupFields({
    															type: 		search.Type.EMPLOYEE,
    															id:			currentUser,
    															columns:	'issalesrep'
    															});	
    						
    						//Are they a sales rep?
    						//
    						if(salesRoleObj.issalesrep)
    							{
	    							currentRecord 			= record.load({
																			type:		currentRecordType,
																			id:			currentRecordId,
																			isDynamic:	true
																			});
	    							
	    							var teamCount 			= currentRecord.getLineCount({sublistId: 'salesteam'});
	    				    		
	    							//Loop through the sales team lines
	    							//
	    				    		for (var int = 0; int < teamCount; int++) 
	    					    		{
	    									var teamEmployee = currentRecord.getSublistValue({
	    																					sublistId:		'salesteam',
	    																					fieldId:		'employee',
	    																					line:			int
	    																					});
	    									
	    									if(teamEmployee == currentUser)
	    										{
	    											//Set the employee's contribution to be 100%
	    											//
		    										currentRecord.selectLine({sublistId: 'salesteam', line: int});
		    										
		    										currentRecord.setCurrentSublistValue({
		    																			sublistId:		'salesteam',
		    																			fieldId:		'contribution',
		    																			value:			100
		    																			});
		    										
		    										currentRecord.commitLine({sublistId: 'salesteam', ignoreRecalc: false});
		    										
		    										recordUpdated = true;	//Only mark the record as updated if we have found the current user on the salesteam sublist
	    										}
	    									else
	    										{
	    											//Set everybody else to be 0
	    											//
		    										currentRecord.selectLine({sublistId: 'salesteam', line: int});
		    										
		    										currentRecord.setCurrentSublistValue({
		    																			sublistId:		'salesteam',
		    																			fieldId:		'contribution',
		    																			value:			0
		    																			});
		    										
		    										currentRecord.commitLine({sublistId: 'salesteam', ignoreRecalc: false});
	    										}
	    					    		}
	    				    		
	    				    		
	    				    		if(recordUpdated)
										{
	    				    				//Also set the sales rep on the header
	    				    				//
	    				    				currentRecord.setValue({fieldId: 'salesrep', value: currentUser, ignoreFieldChange: false});
	    				    				
											try
						    					{
									    			currentRecord.save({
									    								doSourcing:				true,
									    								ignoreMandatoryFields:	true
									    								});
						    					}
						    				catch(err)
						    					{
							    					log.error({
																title:		'Error saving sales order record',
																details:	err
																});
						    					}
										}
    							}
    					}
    			}
	    }

    return 	{
        		afterSubmit: 	salesteamAfterSubmit
    		};
    
});
