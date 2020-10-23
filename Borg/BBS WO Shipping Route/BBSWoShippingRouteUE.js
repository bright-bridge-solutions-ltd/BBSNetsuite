/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Sep 2020     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function woShippingRouteAS(type)
	{
		//Needs to work in create or edit mode
		//
		if(type == 'create' || type == 'edit')
				{
					//Get the current record
					//
					var newRecord = nlapiGetNewRecord();
					
					if(newRecord != null)
						{
							var createdFrom		= newRecord.getFieldValue('createdfrom');
							var subsidiary		= newRecord.getFieldValue('subsidiary');
							
							//Check to make sure we are on Freshground & that the works order is created from a sales order
							//
							if(subsidiary == 7 && createdFrom != null && createdFrom != '')
								{
									//Find the shipping route on the works order
									//
									var worksOrderShippingRoute = newRecord.getFieldValue('custbody_fg_tran_shipping_route');
									
									try
										{
											//Get the value of the shipping route from the associated sales order
											//
											var salesOrderShippingRoute = nlapiLookupField('salesorder', createdFrom, 'custbody_fg_tran_shipping_route', false);
												
											//If the shipping route on the sales order is different from the one on the works order, we need to update it
											//
											if(salesOrderShippingRoute != worksOrderShippingRoute)
												{
													nlapiSubmitField('salesorder', createdFrom, 'custbody_fg_tran_shipping_route', worksOrderShippingRoute, false);
												}
										}
									catch(err)
										{
											nlapiLogExecution('ERROR', 'Unexpecetd error', err.message);
										}
									
									//Find the install date on the works order
									//
									var worksOrderInstallDate = newRecord.getFieldValue('custbody_fg_install_date');
									
									if(worksOrderInstallDate != null && worksOrderInstallDate != '')
										{
											try
												{
													var soShipDate 			= nlapiStringToDate(worksOrderInstallDate);
													var dayToSubstract 		= Number(2);

													while (dayToSubstract > 0)
														{
															soShipDate.setDate(soShipDate.getDate() - 1);
															
															var day = soShipDate.getDay();
	
															if(day != 0 && day != 6)
																{
																	dayToSubstract--;
																}
														}
													
													//soShipDate 				= nlapiAddDays(soShipDate, -2);
													
													var soShipDateString 	= nlapiDateToString(soShipDate);
													
													nlapiSubmitField('salesorder', createdFrom, 'shipdate', soShipDateString, false);
														
												}
											catch(err)
												{
													nlapiLogExecution('ERROR', 'Unexpecetd error', err.message);
												}
										}
								}
						}			
				}
	}
