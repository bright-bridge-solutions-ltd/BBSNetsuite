/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/ui/serverWidget', 'N/task', 'N/http', 'N/format'],
/**
 * @param {runtime} runtime
 * @param {search} search
 * @param {serverWidget} serverWidget
 */
function(runtime, search, serverWidget, task, http, format) 
{
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) 
	    {
	    	if (context.request.method === http.Method.GET) 
		    	{
		    		//Create a form
					//
		            var form = serverWidget.createForm({
					                					title: 	'Tax For Communications Address Bulk Update'
					            						});
		            
		            //Add a select field for the record type to update
		            //
		            var selectField = form.addField({
						            				id:			'custpage_type_select',
						            				label:		'Record Type To Update',
						            				type:		serverWidget.FieldType.SELECT
						            				});
		            
		            selectField.isMandatory = true;
		            
		            selectField.addSelectOption({
		            							value:			'',
		            							text:			'',
		            							isSelected:		true
		            							});
		            
		            //Populate the record type by reading the mapping record
		            //
		            var customrecord_bbstfc_pcode_mapSearchObj = getResults(search.create({
		            	   type: "customrecord_bbstfc_pcode_map",
		            	   filters:
		            	   [
		            	   ],
		            	   columns:
		            	   [
		            	      search.createColumn({
						            	         name: 	"custrecord_bbstfc_pmap_rec_type",
						            	         sort: 	search.Sort.ASC,
						            	         label: "Record Type"
		            	      					})
		            	   ]
		            	}));
		            	
		            if(customrecord_bbstfc_pcode_mapSearchObj != null && customrecord_bbstfc_pcode_mapSearchObj.length > 0)
		            	{
		            		for (var int = 0; int < customrecord_bbstfc_pcode_mapSearchObj.length; int++) 
			            		{
		            				var recType = customrecord_bbstfc_pcode_mapSearchObj[int].getValue("custrecord_bbstfc_pmap_rec_type");
		            				
			            			selectField.addSelectOption({
								         							value:			recType,
								         							text:			recType,
								         							isSelected:		false
								         							});
								}
		            	}
		            
		            
		            //Add a submit button
					//
					form.addSubmitButton({
										label: 'Submit Bulk Update'
										});
					            
		
							
		            //Return the form to the user
		            //
		            context.response.writePage(form);
		        } 
		    else 
		    	{
		    		var request = context.request;
		    		
		            //Post request - so process the returned form
					//
					var selectedRecordType = request.parameters['custpage_type_select'];
					
					//Submit the map/reduce task
					//
					try
						{
							var mrTask = task.create({
													taskType:		task.TaskType.MAP_REDUCE,
													scriptId:		'customscript_bbstfc_pcode_bulk_update_mr',	
													deploymentid:	null
										//			params:			{
										//								custscript_bbs_sftp_product_file_id:	fileId,
										//								custscript_bbs_sftp_config_id:			integrationId
										//							}
													});
							
							mrTask.submit();
						}
					catch(err)
						{
							log.error({
										title: 		'Error submitting mr script',
										details: 	err
										});	
						}

					//Redirect to the MR status page with parameters
					//
					var today = format.format({
												value: 	new Date(), 
												type: 	format.Type.DATE})
					
					context.response.sendRedirect({
													type:			http.RedirectType.TASK_LINK,
													identifier:		'LIST_MAPREDUCESCRIPTSTATUS',
													parameters:		{
																	scripttype:		getScriptId('customscript_bbstfc_pcode_bulk_update_mr'),
																	daterange:		'CUSTOM',
																	datefrom:		today,
																	dateto:			today
																	}
													});
		        }
	    }

    function getScriptId(_scriptName)
    	{
    		var scriptId = '';
    		
	    	var scriptSearchObj = getResults(search.create({
	    		   type: "script",
	    		   filters:
	    		   [
	    		      ["scriptid","is",_scriptName]
	    		   ],
	    		   columns:
	    		   [
	    		      search.createColumn({
					    		         name: 	"name",
					    		         sort: 	search.Sort.ASC,
					    		         label: "Name"
	    		      					})
	    		   ]
	    		}));
    		
	    	if(scriptSearchObj != null && scriptSearchObj.length > 0)
	    		{
	    			scriptId = scriptSearchObj[0].id;
	    		}
	    	
	    	return scriptId;
    	}
    
    
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
    
    return {
        	onRequest: onRequest
    		};
    
});
