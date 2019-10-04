/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/task', 'N/ui/serverWidget', 'N/ui/dialog', 'N/ui/message','N/format', 'N/http'],
/**
 * @param {runtime} runtime
 * @param {search} search
 * @param {task} task
 * @param {ui} ui
 * @param {dialog} dialog
 * @param {message} message
 */
function(runtime, search, task, serverWidget, dialog, message, format, http) {
   
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
		    		//Get parameters
					//
					var stage = Number(context.request.parameters['stage']);		//The stage the suitelet is in
					stage = (stage == null || stage == '' || isNaN(stage) ? 1 : stage);
		
	    			//Create a form
	    			//
		            var form = serverWidget.createForm({
		                						title: 'Create Usage Statements'
		            						});
		            
		            //Store the current stage in a field in the form so that it can be retrieved in the POST section of the code
					//
					var stageParamField = form.addField({
											                id: 'custpage_param_stage',
											                type: serverWidget.FieldType.INTEGER,
											                label: 'Stage'
										            	});

					stageParamField.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
					stageParamField.defaultValue = stage;
					
					//Work out what the form layout should look like based on the stage number
					//
					switch(stage)
						{
							case 1:	
								
								//Add a field for the statement date
								//
								var statementDateField = form.addField({
													                id: 'custpage_entry_stmt_date',
													                type: serverWidget.FieldType.DATE,
													                label: 'Satement Date'
												            		});

								statementDateField.defaultValue = format.format({
																				value: new Date(), 
																				type: format.Type.DATE
																				});
								statementDateField.isMandatory = true;
								
								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Select Contracts'
										            });
					            
								break;
								
							case 2:
								
								var tab = form.addTab({
														id:		'custpage_tab_items',
														label:	'Contracts To Select For Usage Statements'
													});
								
								/*
								var tab2 = form.addTab({
														id: 	'custpage_tab_items2',
														label:	'test'
														});
								
								form.addField({
									         	id: 		'custpage_test',
									         	type: 		serverWidget.FieldType.TEXT,
									           	label: 		'test',
									           	container:	'custpage_tab_items2'
								            	});
								*/
								
								var subList = form.addSublist({
																id:		'custpage_sublist_items', 
																type:	serverWidget.SublistType.LIST, 
																label:	'Contracts',
																tab:	'custpage_tab_items'
															});
								
								//Add required buttons to sublist 
								//
								subList.addMarkAllButtons();
								
								
								
								//Add a submit button
					            //
					            form.addSubmitButton({
										                label: 'Generate Statements'
										            });
					            
								break;
						}
		            
		            //Return the form to the user
		            //
		            context.response.writePage(form);
		        } 
		    else 
		    	{
		    		var request = context.request;
		    		
		            //Post request - so process the returned form
					//
					
					//Get the stage of the processing we are at
					//
					var stage = Number(request.parameters['custpage_param_stage']);
					

					switch(stage)
						{
							case 1:
								
								//Get user entered parameters
								//
								var statmentDate = request.parameters['custpage_entry_stmt_date']
								
								stage++;
								
								context.response.sendRedirect({
														type: 			http.RedirectType.SUITELET, 
														identifier: 	runtime.getCurrentScript().id, 
														id: 			runtime.getCurrentScript().deploymentId, 
														parameters:		{
																		stage: stage,
																		statementdate: statmentDate
																		}
														});
								
								
								break;
					
						}
		        }
	    }

    return {onRequest: onRequest};
});
