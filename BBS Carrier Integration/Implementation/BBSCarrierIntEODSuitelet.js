/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/task', 'N/ui/serverWidget', 'N/ui/dialog', 'N/ui/message','N/format', 'N/http','N/record','N/xml','N/render','N/file',
        '../Modules/BBSObjects',		//Objects used to pass info back & forth
        '../Modules/BBSCommon',			//Common code
        '../Modules/BBSCarrierGFS'		//GFS integration module
        ],
/**
 * @param {runtime} runtime
 * @param {search} search
 * @param {task} task
 * @param {ui} ui
 * @param {dialog} dialog
 * @param {message} message
 */
function(runtime, search, task, serverWidget, dialog, message, format, http, record, xml, render, file, BBSObjects, BBSCommon, BBSCarrierGFS) 
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
					                						title: 	'Carrier End Of Day - Commit Shipments'
					            						});
		            
		            form.clientScriptFileId = 5422;
		            
		            var tab = form.addTab({
											id:		'custpage_tab_items',
											label:	'Carriers to Commit'
											});
								
								
					var subList = form.addSublist({
													id:		'custpage_sublist_items', 
													type:	serverWidget.SublistType.LIST, 
													label:	'Select a Carrier to Process End Of Day',
													tab:	'custpage_tab_items'
													});
								
					//Add columns to sublist
					//
					subList.addField({
									id:		'custpage_sl_ticked',
									label:	'Select',
									type:	serverWidget.FieldType.CHECKBOX
									});		
								
					subList.addField({
									id:		'custpage_sl_integrator_id',
									label:	'Integrator Id',
									type:	serverWidget.FieldType.INTEGER
									}).updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});		

					subList.addField({
									id:		'custpage_sl_integrator_name',
									label:	'Integrator/Primary Carrier',
									type:	serverWidget.FieldType.TEXT
									});		

					subList.addField({
									id:		'custpage_sl_carrier_name',
									label:	'Carrier',
									type:	serverWidget.FieldType.TEXT
									});		

								
					//Add a submit button
					//
					form.addSubmitButton({
										label: 'Process End Of Day'
										});
					            

					var customrecord_bbs_carrier_service_codesSearchObj = getResults(search.create({
						   type:	"customrecord_bbs_carrier_service_codes",
						   filters:
							   		[
									      ["custrecord_bbs_sc_shipping_item","noneof","@NONE@"]
									],
						   columns:
								   [
								      search.createColumn({name: "custrecord_bbs_primary_carrier",join: "CUSTRECORD_BBS_SC_CARRIER",label: "Primary Carrier/Integrator"}),
								      search.createColumn({name: "custrecord_bbs_carrier_code",join: "CUSTRECORD_BBS_SC_CARRIER",label: "Carrier Code"})
								   ]
						}));
						
			          	
					//Process search results
					//
					if(customrecord_bbs_carrier_service_codesSearchObj != null && customrecord_bbs_carrier_service_codesSearchObj.length > 0)
						{
							for (var int = 0; int < customrecord_bbs_carrier_service_codesSearchObj.length; int++) 
								{
						            	subList.setSublistValue({
																id:		'custpage_sl_ticked',
																line:	int,
																value:	(customrecord_bbs_carrier_service_codesSearchObj.length == 1 ? 'T' : 'F')
																});	
						
										subList.setSublistValue({
																id:		'custpage_sl_integrator_id',
																line:	int,
																value:	customrecord_bbs_carrier_service_codesSearchObj[int].getValue({name: "custrecord_bbs_primary_carrier",join: "CUSTRECORD_BBS_SC_CARRIER"})
																});	
												
										subList.setSublistValue({
																id:		'custpage_sl_integrator_name',
																line:	int,
																value:	customrecord_bbs_carrier_service_codesSearchObj[int].getText({name: "custrecord_bbs_primary_carrier",join: "CUSTRECORD_BBS_SC_CARRIER"})
																});	
												
										subList.setSublistValue({
																id:		'custpage_sl_carrier_name',
																line:	int,
																value:	customrecord_bbs_carrier_service_codesSearchObj[int].getValue({name: "custrecord_bbs_carrier_code",join: "CUSTRECORD_BBS_SC_CARRIER"})
																});	
								}
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
					
					//Find all of the lines that are ticked 
					//
					var lineCount = context.request.getLineCount({
																group:	'custpage_sublist_items'
																});
								
					for (var int2 = 0; int2 < lineCount; int2++) 
						{
							var ticked = context.request.getSublistValue({
																		group:	'custpage_sublist_items',
																		name:	'custpage_sl_ticked',
																		line:	int2
																		});
										
							if(ticked == 'T')
								{
									var integratorId = context.request.getSublistValue({
																						group:	'custpage_sublist_items',
																						name:	'custpage_sl_integrator_id',
																						line:	int2
																						});
	
									var integratorName = context.request.getSublistValue({
																						group:	'custpage_sublist_items',
																						name:	'custpage_sl_integrator_name',
																						line:	int2
																						});

									var carrierName = context.request.getSublistValue({
																						group:	'custpage_sublist_items',
																						name:	'custpage_sl_carrier_name',
																						line:	int2
																						});

									//If line is ticked find the integration record & then call the relevant routine
									//
									var integrationObject = BBSCommon.getConfig(integratorId);
									
									if(integrationObject)
										{
											var commitShipmentRequest = new BBSObjects.commitShipmentRequest(integrationObject, carrierName, 'ANY', '1', 'PDF');
										
											switch(integratorName)
		    									{
				    								case 'GFS':
				    								
				    									//Send the request to the specific carrier
				    									//
				    									var commitShipmentResponse = BBSCarrierGFS.carrierCommitShipments(commitShipmentRequest);	
				    									
				    									//Process the response from the carrier
				    									//
				    									if(commitShipmentResponse.status == 'SUCCESS')
				    										{
				    											//Do something with the manifest file
				    											//
				    											var manifestFile = file.create({
				    																			name:			'manifest.pdf',
				    																			fileType:		file.Type.PDF,
				    																			contents:		commitShipmentResponse.manifest,
				    																			description:	'Manifest File',
				    																			folder:			-4,
				    																			isOnline:		true
				    																			});
				    											
				    											context.response.writeFile({	
				    																		file:		manifestFile,
				    																		isInline:	true
				    																		});
				    										}
				    									else
				    										{
				    											//Show the warning / error message
				    											//
				    											var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
				    											xml += "<pdf>"
				    											xml += "<head>";
				    											xml += "</head>";
				    											xml += "<body padding=\"0.5in 0.5in 0.5in 0.5in\" size=\"A4\">";
				    											xml += "<p>" + commitShipmentResponse.status + ' : ' + commitShipmentResponse.message + "</p>";
				    											xml += "</body>";
				    											xml += "</pdf>";
				    											
				    											//Return the pdf to the user
				    											//
				    											context.response.renderPdf(xml);
				    										}
				    									
				    									
				    									break;
				    									
				    								//Other integration implementations go here
				    								//
		    									}
										}
								}
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


    
    return {onRequest: onRequest};
});
