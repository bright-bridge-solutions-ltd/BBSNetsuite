/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/plugin', './libraryModule', 'N/http'],
/**
 * @param {plugin} plugin
 */
function(plugin, libraryModule, http) 
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
    		//Get the incoming parameters
    		//
    		var action 						= context.request.parameters['action'];
    		var subsidiaryID 				= context.request.parameters['subsidiaryID'];
			var subsidiaryClientProfileID	= context.request.parameters['subsidiaryClientProfileID'];
    		var taxReqObj					= null;
    		var configuration 				= null;
    		var taxReq 						= null;
    		
    		if (context.request.method === http.Method.POST) 
		    	{
    				taxReq 					= context.request.body
		    	}
    		
    		switch(action)
    			{
		    		case 'getConfig':
		    			
		    			//See if we can load the plugin
			    		//
			    		var  tfcPlugin = plugin.loadImplementation({
																	type: 'customscript_bbstfc_secondary_plugin'
																	});
				    	
						if(tfcPlugin != null)
							{
								//Plugin loaded ok
								//
								configuration = tfcPlugin.getTFCConfiguration(subsidiaryID);
								
								context.response.write(JSON.stringify(configuration));
							}
						else
							{
								//Error loading the plugin
								//
								log.error({title: 'Error parsing request into an object', details: err});
								
								resultObj.taxTotal 	= Number(0);
								resultObj.message 	= 'Error parsing request into an object';
							}

		    			break;
		    			
		    		case 'calcTax':
		    			
		    			try
							{
			    				taxReqObj = JSON.parse(taxReq);
							}
						catch(err)	
							{
								taxReqObj	= null;
								log.error({title: 'Error parsing request into an object', details: err});
							}
					
			    		//Instantiate a response object
			    		//
			    		var resultObj 		= {};
			    		resultObj.message 	= '';
			    		resultObj.taxTotal 	= Number(0);
			    		
			    		//See if we can load the plugin
			    		//
			    		var  tfcPlugin = plugin.loadImplementation({
																	type: 'customscript_bbstfc_secondary_plugin'
																	});
				    	
						if(tfcPlugin != null)
							{
								//Plugin loaded ok
								//
								resultObj = calculateTaxTotal(taxReqObj, tfcPlugin, subsidiaryClientProfileID);
							}
						else
							{
								//Error loading the plugin
								//
								log.error({title: 'Error parsing request into an object', details: err});
								
								resultObj.taxTotal 	= Number(0);
								resultObj.message 	= 'Error parsing request into an object';
							}
						
						//Return the response object
						//
						context.response.write(JSON.stringify(resultObj));
						
		    			break
    			}
	    }

    function calculateTaxTotal(taxReqObj, tfcPlugin, subsidiaryClientProfileID)
    	{
	    	//Declare and initialize variables
			//
			var totalTaxes 		= 0;
			var errorMessages 	= '';
			var resultObj 		= {};
    		resultObj.message 	= '';
    		resultObj.taxTotal 	= Number(0);
			
			//LICENCE CHECK
			//
			var licenceResponse = libraryModule.doLicenceCheck();
			
			if(licenceResponse.status == 'OK')
				{
	    			//Call the plugin to get the taxes
					//
					var taxResult = tfcPlugin.getTaxCalculation(taxReqObj, subsidiaryClientProfileID);
					
					//Check the result of the call to the plugin
					//
					if(taxResult != null && taxResult.httpResponseCode == '200')
						{
							
							//Get the API response body
							//
							var taxResultDetails = taxResult.apiResponse;
							
							//Get the errors
							//
							var errors = taxResultDetails['err'];
							
							//Do we have any errors
							//
							if (errors)
								{
									//Process errors
									//
									for (var int9 = 0; int9 < errors.length; int9++)
										{
											log.error({
												title: 'Error Returned by Avalara',
												details: errors[int9].msg
											});
											
											//Add the error to the errorMessages string
											//
											errorMessages += errors[int9].msg;
											errorMessages += '<br>';
										}
									
									resultObj.message 	= errorMessages;
						    		resultObj.taxTotal 	= Number(0);
								}
							else
								{
									//Get the invoices
									//
									var invoices = taxResultDetails['inv'];
											
									//Loop through invoices
									//
									for (var i = 0; i < invoices.length; i++)
										{
											//Get the errors
											//
											var errors = invoices[i]['err'];
													
											//Have we got any errors?
											//
											if (errors)
												{
													//Process errors
													//
													for (var int2 = 0; int2 < errors.length; int2++)
														{
															log.error({
																title: 'Error Returned by Avalara',
																details: errors[int2].msg
															});
															
															//Add the error to the errorMessages string
															//
															errorMessages += errors[int2].msg;
															errorMessages += '<br>';
														}
													
													resultObj.message 	= errorMessages;
										    		resultObj.taxTotal 	= Number(0);
												}
											else
												{
													//Get the tax summary
													//
													var taxes = invoices[i]['summ'];
											
													//Do we have any taxes
													//
													if (taxes)
														{
															//Loop through taxes
															//
															for (var int3 = 0; int3 < taxes.length; int3++)
																{
																	//Get the errors
																	//
																	var errors = taxes[int3]['err'];
																				
																	//Have we got any errors
																	//
																	if (errors)
																		{
																			//Process errors
																			//
																			for (var int4 = 0; int4 < errors.length; int4++)
																				{
																					log.error({
																						title: 'Error Returned by Avalara',
																						details: errors[int4].msg
																					});
																								
																					//Add the error to the errorMessages string
																					//
																					errorMessages += errors[int4].msg;
																					errorMessages += '<br>';
																				}
																			
																			resultObj.message 	= errorMessages;
																    		resultObj.taxTotal 	= Number(0);
																		}
																	else
																		{
																			//Get the tax amount
																			//
																			var taxAmount	= 	parseFloat(taxes[int3].tax);
																			
																			//Add the tax amount to the totalTaxes variable
																			//
																			totalTaxes += taxAmount;
																			

																		}
																}
															
															resultObj.message 	= '';
												    		resultObj.taxTotal 	= Number(totalTaxes);
														}
													else
														{
															//Get the items
															//
															var items = invoices[i]['itms'];
																	
															//Do we have any items
															//
															if (items)
																{
																	//Loop through items
																	//
																	for (var int5 = 0; int5 < items.length; int5++)
																		{
																			//Get the errors
																			//
																			var errors = items[int5]['err'];
																						
																			//Have we got any errors
																			//
																			if (errors)
																				{
																					//Process errors
																					//
																					for (var int6 = 0; int6 < errors.length; int6++)
																						{
																							log.error({
																								title: 'Error Returned by Avalara',
																								details: errors[int6].msg
																							});
																										
																							//Add the error to the errorMessages string
																							//
																							errorMessages += errors[int6].msg;
																							errorMessages += '<br>';
																						}
																					
																					resultObj.message 	= errorMessages;
																		    		resultObj.taxTotal 	= Number(0);
																				}
																			else
																				{
																					//Get the taxes
																					//
																					var taxes = items[int5]['txs'];
																							
																					//Do we have any taxes
																					//
																					if (taxes)
																						{
																							//Loop through taxes
																							//
																							for (var int7 = 0; int7 < taxes.length; int7++)
																								{
																									//Get the tax amount
																									//
																									var taxAmount	= 	parseFloat(taxes[int7].tax);
																											
																									//Add the tax amount to the totalTaxes variable
																									//
																									totalTaxes += taxAmount;
																									
																								}
																						}
																				}
																		}
																	
																	resultObj.message 	= '';
														    		resultObj.taxTotal 	= Number(totalTaxes);
																}
														}
												}
										}
								}
						}
					else
						{	
							//Add the response code and API response to the error messages
							//
							errorMessages += 'httpResponseCode: ' + taxResult.httpResponseCode;
							errorMessages += '<br>';
							errorMessages += 'responseMessage: ' + taxResult.responseMessage;
							
							resultObj.message 	= errorMessages;
				    		resultObj.taxTotal 	= Number(0);
						}
				}
			else
				{
	    			errorMessages += 'Licence Check Status: ' + licenceResponse.status;
					errorMessages += '<br>';
					errorMessages += 'Licence Check Message: ' + licenceResponse.message;
					
					resultObj.message 	= errorMessages;
		    		resultObj.taxTotal 	= Number(0);
				}
    	
    		return resultObj;
    	}
    
    
    
    return 	{
        	onRequest: onRequest
    		};
    
});
