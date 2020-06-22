/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */
define(['N/record', 'N/search', 'N/plugin'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search, plugin) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function pcodeMappingAS(scriptContext) 
	    {
    		if(scriptContext.type = 'create')
    			{
    				var currentRecord 	= scriptContext.newRecord;
    				var configObj		= null;
    				
    				//Get the plugin implementation
					//
					var  tfcPlugin = plugin.loadImplementation({
																type: 'customscript_bbstfc_plugin'
																});
					
					//Call the plugin to get the tfc config 
					//
					if(tfcPlugin != null)
						{
							try
								{
									configObj = tfcPlugin.getTFCConfiguration();
									
								}
							catch(err)
								{
									configObj = null;
								
									log.error({
    											title:		'Error calling plugin',
    											details:	err
    											});
								}
							
								//Did we get the config?
								//
								if(configObj != null)
									{
										//Get the script id of the lookup script from the config
										//
										var lookupScriptId = configObj.pcodeLookupScript;
											
										//Find out how many deployments we already have
										//
										var deploymentsCount = countExistingDeployments(lookupScriptId);
											
										//Get the script id of the lookup script
										//
										var scriptId = getScriptIdFromInternalId(lookupScriptId).replace('CUSTOMSCRIPT','').toLowerCase();
									
										//Combine the script id with the number of deployments
										//
										deploymentsCount++;
											
										scriptId = scriptId + '_' + deploymentsCount.toString();
											
										//Create a new deployment for the pcode lookup script for the record type in question
										//
										var deploymentRecordId 	= null;
										var deploymentRecord 	= null;
										var mappingRecordType 	= currentRecord.getValue({fieldId: 'custrecord_bbstfc_pmap_rec_type'}).toUpperCase();
											
										try
											{	
												deploymentRecord = record.create({
																					type:			record.Type.SCRIPT_DEPLOYMENT,
																					isDynamic:		true,
																					defaultValues:	{script: lookupScriptId}
																					});
													
												deploymentRecord.setValue({	
																			fieldId:	'type',
																			value:		'scriptrecord'
																			});
						
												deploymentRecord.setValue({	
																			fieldId:	'allroles',
																			value:		true
																			});
												
												deploymentRecord.setValue({	
																			fieldId:	'isdeployed',
																			value:		true
																			});
												
												deploymentRecord.setValue({	
																			fieldId:	'recordtype',
																			value:		mappingRecordType
																			});
						
												deploymentRecord.setValue({	
																			fieldId:	'loglevel',
																			value:		'ERROR'
																			});
						
												deploymentRecord.setValue({	
																			fieldId:	'runasrole',
																			value:		'3'
																			});
						
												deploymentRecord.setValue({	
																			fieldId:	'status',
																			value:		'RELEASED'
																			});
						
												deploymentRecord.setValue({	
																			fieldId:	'scriptid',
																			value:		scriptId
																			});

												deploymentRecord.save();
								
											}
										catch(err)
											{
												log.error({
				    										title:		'Error creating script deployment',
				    										details:	err
				    										});
											}
									}
						}
    			}
    		
    		if(scriptContext.type == 'delete')
				{
					var currentRecord 	= scriptContext.oldRecord;
					var configObj		= null;
					
					//Get the plugin implementation
					//
					var  tfcPlugin = plugin.loadImplementation({
																type: 'customscript_bbstfc_plugin'
																});
					
					//Call the plugin to get the tfc config 
					//
					if(tfcPlugin != null)
						{
							try
								{
									configObj = tfcPlugin.getTFCConfiguration();
									
								}
							catch(err)
								{
									log.error({
												title:		'Error calling plugin',
												details:	err
												});
								}
							
							//Did we get the config?
							//
							if(configObj != null)
								{
									//Get the script id of the lookup script from the config
									//
									var lookupScriptId = configObj.pcodeLookupScript;
									
									//Get the record type from the mapping record we are deleting
									//
									var mappingRecordType 	= currentRecord.getValue({fieldId: 'custrecord_bbstfc_pmap_rec_type'}).toUpperCase();
									
									//Find an existing deployment record
									//
									var deploymentId = findExistingDeployment(lookupScriptId, mappingRecordType);
									
									if(deploymentId != null)
										{
											try
												{
													record.delete({
																	type:	record.Type.SCRIPT_DEPLOYMENT,
																	id:		deploymentId
																	});
												}
											catch(err)
												{
													log.error({
																title:		'Error deleting script deployment',
																details:	err
																});
												}
										}
									
								}
						}
				}
	    }

    function findExistingDeployment(_lookupScriptId, _mappingRecordType)
    	{
    		var deploymentId = null;
    		
    		try	
				{
			    	var scriptdeploymentSearchObj = getResults(search.create({
			    		   type: "scriptdeployment",
			    		   filters:
			    		   [
			    		      ["script","anyof",_lookupScriptId], 
			    		      "AND", 
			    		      ["recordtype","anyof",_mappingRecordType.toUpperCase()]
			    		   ],
			    		   columns:
			    		   [
			    		      search.createColumn({name: "scriptid", label: "Custom ID"})
			    		   ]
			    		}));
			    	
			    	if(scriptdeploymentSearchObj != null && scriptdeploymentSearchObj.length > 0)
			    		{
			    			deploymentId = scriptdeploymentSearchObj[0].id;
			    		}
				}
    		catch(err)
    			{
    				deploymentId = null;
    			}
    		
    		return deploymentId;
    	
    	}
    
    function getScriptIdFromInternalId(_scriptId)
    	{
    		var scriptId = '';
    		
    		try	
    			{
			    	var scriptSearchObj = getResults(search.create({
			    		   type: "script",
			    		   filters:
			    		   [
			    		      ["internalid","anyof",_scriptId]
			    		   ],
			    		   columns:
			    		   [
			    		      search.createColumn({name: "scriptid", label: "Script ID"})
			    		   ]
			    		}));
			    	
			    	if(scriptSearchObj != null && scriptSearchObj.length > 0)
			    		{
			    			scriptId = scriptSearchObj[0].getValue({name: "scriptid"});
			    		}
    			}
    		catch(err)
    			{
    				scriptId = '';
    			}
    		
    		return scriptId;
    	}
    
    
    function countExistingDeployments(_scriptId)
    	{
    		var searchResultCount = Number(0);
    		
    		try
    			{
			    	var scriptdeploymentSearchObj = search.create({
			    		   type: "scriptdeployment",
			    		   filters:
			    		   [
			    		      ["script","anyof",_scriptId]
			    		   ],
			    		   columns:
			    		   [
			    		      search.createColumn({name: "scriptid", label: "Custom ID"})
			    		   ]
			    		});
			    	
			    		searchResultCount = scriptdeploymentSearchObj.runPaged().count;
    			}
    		catch(err)
    			{
    				searchResultCount = Number(0);
    			}
    		
	    		return searchResultCount;
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
	        afterSubmit: pcodeMappingAS
    		};
    
});
