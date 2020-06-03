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
function(record, search) {
   
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
									
									//Did we get the config?
									//
									if(configObj != null)
										{
											var lookupScriptId = configObj.pcodeLookupScript;
											
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
																				value:		'TESTING'
																				});
						
													deploymentRecord.save();
												}
											catch(err)
												{
												
												}
										}
								}
							catch(err)
								{
									log.error({
    											title:		'Error calling plugin',
    											details:	err
    											});
								}
						}
    			}
	    }

    return 	{
	        afterSubmit: pcodeMappingAS
    		};
    
});
