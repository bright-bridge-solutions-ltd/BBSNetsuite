/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url'],

function(url) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function configurationPI(scriptContext) 
	    {
	
	    }

    function clientHealthCheck()
	    {
    		debugger;
    		
    		try
    			{		
    				Ext.Ajax.timeout = (60000*5);
    				
    				var myMask = new Ext.LoadMask(Ext.getBody(), {msg:'Performing API health check...'});
    				myMask.show();
    				
    				Ext.Ajax.request({
    									url: 		url.resolveScript({scriptId: 'customscript_bbstfc_config_suitelet', deploymentId: 'customdeploy_bbstfc_config_suitelet'}),
    									method: 	'GET',
    									headers: 	{'Content-Type': 'application/json'},
    									params: 	{requesttype: 'H'},
    									success: 	function (response, result) 	{
	    																				myMask.hide();
	    																				try
	    																					{
	    																						var respObj = JSON.parse(response.responseText);
	    																						
	    																						Ext.MessageBox.show ({
						    																	                        title: 	'Details',
						    																	                        msg: 	'HTTP Code : ' 			+ respObj.httpResponseCode + 
						    																	                        		'<br/>Status : ' 		+ respObj.apiResponse.Status + 
						    																	                        		'<br/>Server Time : ' 	+ respObj.apiResponse.ServerTime,
						    																	                        width:	500,
						    																	                        buttons: Ext.MessageBox.OK
	    																	                     					});
	    																					}
	    																				catch(err)
	    																					{
	    																					
	    																					}
    																				},
    									failure: 	function (response, result) 	{
	    																				myMask.hide();
	    																				alert(response.responseText);
    																				}
    								});
    			}
		    catch(e) 
		    	{
		            if (e instanceof nlobjError) 
		            	{
		                	alert(e.getCode() + '\n' + e.getDetails());
		            	}
		            else 
		            	{
		                	alert(e.toString());
		            	}
		        }
	    }

    function clientServiceInfo()
	    {
			debugger;
			
			try
				{		
					Ext.Ajax.timeout = (60000*5);
					
					var myMask = new Ext.LoadMask(Ext.getBody(), {msg:'Getting Service Information...'});
					myMask.show();
					
					Ext.Ajax.request({
										url: 		url.resolveScript({scriptId: 'customscript_bbstfc_config_suitelet', deploymentId: 'customdeploy_bbstfc_config_suitelet'}),
										method: 	'GET',
										headers: 	{'Content-Type': 'application/json'},
										params: 	{requesttype: 'S'},
    									success: 	function (response, result) 	{
																						myMask.hide();
																						try
																							{
																								var respObj = JSON.parse(response.responseText);
																								
																								Ext.MessageBox.show ({
						    																	                        title: 	'Details',
						    																	                        msg: 	'HTTP Code : ' 					+ respObj.httpResponseCode + 
						    																	                        		'<br/>Server Time : ' 			+ respObj.apiResponse.ServerTime +
						    																	                        		'<br/>Engine Version : ' 		+ respObj.apiResponse.Versions.AfcEngineVersion +
						    																	                        		'<br/>Build Version : ' 		+ respObj.apiResponse.Versions.BuildVersion,
						    																	                        width:	500,
						    																	                        buttons: Ext.MessageBox.OK
																			                     					});
																							}
																						catch(err)
																							{
																							
																							}
																					},
										failure: function (response, result) 		{
																						myMask.hide();
																						alert(response.responseText);
																					}
									});
				}
		    catch(e) 
		    	{
		            if (e instanceof nlobjError) 
		            	{
		                	alert(e.getCode() + '\n' + e.getDetails());
		            	}
		            else 
		            	{
		                	alert(e.toString());
		            	}
		        }
	    }

    return {
        	pageInit: 			configurationPI,
        	clientHealthCheck:	clientHealthCheck,
        	clientServiceInfo:	clientServiceInfo
    		};
    
});
