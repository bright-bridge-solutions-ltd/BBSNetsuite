/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
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

    function clientPing()
	    {
    		debugger;
    		
    		try
    			{		
    				Ext.Ajax.timeout = (60000*5);
    				
    				var myMask = new Ext.LoadMask(Ext.getBody(), {msg:'Performing API ping...'});
    				myMask.show();
    				
    				Ext.Ajax.request({
    									url: 		url.resolveScript({scriptId: 'customscript_bbspn_config_suitelet', deploymentId: 'customdeploy_bbspn_config_suitelet'}),
    									method: 	'GET',
    									headers: 	{'Content-Type': 'application/json'},
    									params: 	{requesttype: 'P'},
    									success: 	function (response, result) 	{
	    																				myMask.hide();
	    																				try
	    																					{
	    																						var respObj = JSON.parse(response.responseText);
	    																						
	    																						Ext.MessageBox.show ({
						    																	                        title: 	'Details',
						    																	                        msg: 	'HTTP Code : ' 			+ respObj.httpResponseCode + 
						    																	                        		'<br/>Status : ' 		+ respObj.apiResponse,
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

    function clientAccountInfo()
	    {
			debugger;
			
			try
				{		
					Ext.Ajax.timeout = (60000*5);
					
					var myMask = new Ext.LoadMask(Ext.getBody(), {msg:'Getting Account Information...'});
					myMask.show();
					
					Ext.Ajax.request({
										url: 		url.resolveScript({scriptId: 'customscript_bbspn_config_suitelet', deploymentId: 'customdeploy_bbspn_config_suitelet'}),
										method: 	'GET',
										headers: 	{'Content-Type': 'application/json'},
										params: 	{requesttype: 'A'},
    									success: 	function (response, result) 	{
																						myMask.hide();
																						try
																							{
																								var respObj = JSON.parse(response.responseText);
																								
																								Ext.MessageBox.show ({
						    																	                        title: 	'Details',
						    																	                        msg: 	'HTTP Code : ' 					+ respObj.httpResponseCode + 
						    																	                        		'<br/>Email : ' 				+ respObj.apiResponse.email +
						    																	                        		'<br/>Computers: ' 				+ respObj.apiResponse.numComputers +
						    																	                        		'<br/>State : ' 				+ respObj.apiResponse.state +
						    																	                        		'<br/>Print Count : '			+ respObj.apiResponse.totalPrints,
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
        	clientPing:			clientPing,
        	clientAccountInfo:	clientAccountInfo
    		};
    
});
