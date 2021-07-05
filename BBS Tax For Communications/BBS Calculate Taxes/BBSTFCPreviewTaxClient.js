/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['./clientLibraryModule','N/url', 'N/currentRecord', 'N/search'],

function(clientLibraryModule, url, currentRecord, search, encode) 
{
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function previewTaxPI(scriptContext) 
	    {

	    }

    function previewTax()
	    {
    		debugger;
    		
    		try
    			{	
    				//Get the current record
    				//
    				var currRec = currentRecord.get();
        		
    				//Set ajax parameters
    				//
    				Ext.Ajax.timeout = (60000*5);
    				
    				//Create a mask for the browser window
    				//
    				//var myMask = new Ext.LoadMask(Ext.getBody(), {msg:'Getting Tax Value'});
    				//myMask.show();
    				
    				//=================================================
    				//Get all the info needed to do the tax calculation
    				//=================================================
    				//
    				
    				//Get the configuration
					//
					var configuration = getConfiguration(subsidiaryID);
					
					
    				//Return values from the transaction record to gather required info to populate request
					//
					var tranDate			=	currRec.getValue({fieldId: 'trandate'});
					var createdFrom			=	currRec.getValue({fieldId: 'createdfrom'});
					var customerID			=	currRec.getValue({fieldId: 'entity'});
					var currency			=	currRec.getValue({fieldId: 'currency'});
					var subsidiaryID		=	currRec.getValue({fieldId: 'subsidiary'});
					var lineCount			=	currRec.getLineCount({sublistId: 'item'});
					
					//Check the record is not a standalone transaction
					//
					if (createdFrom)
						{
							//Call function to return/lookup the transaction date on the related transaction
							//
							tranDate = clientLibraryModule.getCreatedFromTransactionInfo(createdFrom);	
						}

					//Call function to return/lookup fields on the customer record
					//
					var customerLookup 		= 	clientLibraryModule.getCustomerInfo(customerID);
					var customerName		=	customerLookup[0];
					var customerType		=	customerLookup[1];
					var defaultSalesType	=	customerLookup[2];
					var lifeline			=	customerLookup[3];
					
					//Call function to return/lookup fields on the subsidiary record
					//
					var subsidiaryClientProfileID = clientLibraryModule.getSubsidiaryInfo(subsidiaryID);
					
					//Call function to return/lookup fields on the address record
					//
					var addressData	= clientLibraryModule.libGetDestinationPcode(currRec, configuration);
					
					//Call function to return any exemptions for the customer
					//
					var customerExemptions = clientLibraryModule.getCustomerExemptions(customerID, tranDate);
					
					//Call function to return/lookup fields on the currency record
					//
					var ISOCode = clientLibraryModule.getISOCode(currency);
					
					
					//Construct a tax request
					//
					var taxReqObj = new clientLibraryModule.libCalcTaxesRequestObj();
					
					//Have we got a configuration object
					//
					if (configuration != null)
						{
							//Fill in the request config & company data properties
							//
							taxReqObj.cfg.retnb 	= 	configuration.nonBillableTaxes;
							taxReqObj.cfg.retext	=	configuration.extendedTaxInfo;
							taxReqObj.cfg.incrf		=	configuration.reportingInfo;
							taxReqObj.cmpn.bscl		=	configuration.businessClass;
							taxReqObj.cmpn.svcl		=	configuration.serviceClass;
							taxReqObj.cmpn.fclt		=	configuration.ownFacilities;
							taxReqObj.cmpn.frch		=	configuration.franchise;
							taxReqObj.cmpn.reg		=	configuration.regulated;
					
							//Create a new invoice line object
							//
					        var taxReqInvObj = new clientLibraryModule.libInvoicesObj();
					        
					        
					        //Fill in the invoice line object properties (details about the invoice/sales order we are processing)
							//
							taxReqInvObj.cmmt			=	false;
							taxReqInvObj.bill.pcd		=	addressData.pcode;
							taxReqInvObj.bill.int		= 	addressData.incorporated;
							taxReqInvObj.cust			=	customerType;
							taxReqInvObj.lfln			=	lifeline;
							taxReqInvObj.date			=	tranDate;
							taxReqInvObj.exms			=	customerExemptions;
							taxReqInvObj.invm			=	true; 
							taxReqInvObj.dtl			=	true; // return Line Item level tax results
							taxReqInvObj.summ			=	true; // return summarized tax results
							taxReqInvObj.acct			=	customerName;
							taxReqInvObj.custref		=	customerName;
							taxReqInvObj.invn			=	'';
							taxReqInvObj.bcyc			=	tranDate.getMonth() + 1;
							taxReqInvObj.bpd.month		=	tranDate.getMonth() + 1;
							taxReqInvObj.bpd.year		=	tranDate.getFullYear();
							taxReqInvObj.ccycd			=	ISOCode;
							taxReqInvObj.doc 			= 	null;	
							
							//Loop through each item line to process
							//
							for (var i = 0; i < lineCount; i++)
								{
							        //Retrieve line item values
									//
									var itemID				=	currRec.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
									var itemType			=	currRec.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: i});
									var itemRate			=	currRec.getSublistValue({sublistId: 'item', fieldId: 'amount', line: i});
									var quantity			=	currRec.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
									var salesType			=	currRec.getSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_tfc_sales_type', line: i});
									var discountType		=	currRec.getSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_tfc_discount_type', line: i});
									var privateLineSplit	=	currRec.getSublistValue({sublistId: 'item', fieldId: 'custcol_bbs_tfc_private_line_split', line: i});
									var fromAddress			= 	currRec.getSublistValue({sublistId: 'item', fieldId: configuration.fromAddressFieldId, line: i});
									var toAddress			=	currRec.getSublistValue({sublistId: 'item', fieldId: configuration.toAddressFieldId, line: i});
									var llbAddress			=	'';
									
									//Do we have a line level billing address set up?
									//
									if(configuration.llbAddressFieldId != null && configuration.llbAddressFieldId != '')
										{
											llbAddress = currRec.getSublistValue({sublistId: 'item', fieldId: configuration.llbAddressFieldId, line: i});
										}
									
									
									//Do we have a salesType
									//
									if (salesType)
										{
											//Call function to return the AFC sales type code
											//
											salesType = clientLibraryModule.getSalesTypeCode(salesType);
										}
									else
										{
											//Set the salesType variable using defaultSalesType
											//
											salesType = defaultSalesType;
										}
									
									//Do we have a discountType
									//
									if (discountType)
										{
											//Call function to return the AFC discount type code
											//
											discountType = clientLibraryModule.getDiscountTypeCode(discountType);
										}
									else
										{
											//Set the discountType variable to 0 (None)
											//
											discountType = 0;
										}
									
									//Call function to return/lookup fields on the item record
									//
									var itemLookup 			= 	clientLibraryModule.getTransactionServicePair(itemType, itemID);
									var transactionType		=	itemLookup[0];
									var serviceType			=	itemLookup[1];
									
									//Check we have a transaction/service pair
									//
									if (transactionType != '' && serviceType != '' && transactionType != null && serviceType != null)
										{
											//Create a new invoice item object
									        //
									        var taxReqItemObj = new clientLibraryModule.libLineItemObj();
									        
									        //Fill in the invoice item object properties
											//
											taxReqItemObj.ref		=	i;
											taxReqItemObj.chg		=	itemRate;
											taxReqItemObj.line		=	Math.ceil(quantity); // round to nearest integer number
											taxReqItemObj.loc		=	1;
											taxReqItemObj.min		=	0;
											taxReqItemObj.sale		=	salesType;
											taxReqItemObj.incl		=	false;
											taxReqItemObj.proadj	=	0;
											taxReqItemObj.tran		=	transactionType;
											taxReqItemObj.serv		=	serviceType;
											taxReqItemObj.dbt		=	false;
											taxReqItemObj.adj		=	false;
											taxReqItemObj.adjm		=	0;
											taxReqItemObj.disc		=	discountType;
											taxReqItemObj.prop		=	0;
											taxReqItemObj.bill.pcd	=	addressData.pcode;
											taxReqItemObj.bill.int	=	addressData.incorporated;
											taxReqItemObj.cust		=	customerType;
											taxReqItemObj.lfln		=	lifeline;
											taxReqItemObj.date		=	tranDate;
											taxReqItemObj.qty		=	1;
											taxReqItemObj.glref		=	i;
											
											//Have we got a private line split
											//
											if (privateLineSplit)
												{
													//Fill in the private line split property in the item object
													//
													taxReqItemObj.plsp = privateLineSplit;
												}
											
											//Have we got a from address
											//
											if (fromAddress)
												{
													//Call library function to return data for the selected address
													//
													var fromAddressData = clientLibraryModule.getAddressData(fromAddress);
												
													//Fill in the from properties in the item object
													//
													taxReqItemObj.from		= new clientLibraryModule.libLocationObj();
													taxReqItemObj.from.pcd 	= fromAddressData.pCode;
													taxReqItemObj.from.int	= fromAddressData.incorporated;
													
													//If we are using VOIP services (trans type 19/59) we should put the from address in as the billing address
													//as these services a billed at point of primary use
													//
													if(transactionType == '19' || transactionType == '59')
														{
															taxReqItemObj.bill.pcd	=	fromAddressData.pCode;
															taxReqItemObj.bill.int	=	fromAddressData.incorporated;
														}
												}
											
											//Have we got a to address
											//
											if (toAddress)
												{
													//Call library function to return data for the selected address
													//
													var toAddressData = clientLibraryModule.getAddressData(toAddress);
												
													//Fill in the to properties in the item object
													//
													taxReqItemObj.to		= new clientLibraryModule.libLocationObj();
													taxReqItemObj.to.pcd	= toAddressData.pCode;
													taxReqItemObj.to.int 	= toAddressData.incorporated;
												}
									        
											//Have we got a line level billing address
											//
											if (llbAddress != '')
												{
													//Call library function to return data for the selected address
													//
													var llbAddressData = clientLibraryModule.getAddressData(llbAddress);
												
													//Fill in the to properties in the item object
													//
													taxReqItemObj.bill		= new clientLibraryModule.libLocationObj();
													taxReqItemObj.bill.pcd	= llbAddressData.pCode;
													taxReqItemObj.bill.int 	= llbAddressData.incorporated;
												}
											
									        //Add the item object to the invoice line object array
									        //
									        taxReqInvObj.itms.push(taxReqItemObj);
										}
								}

						    //End of loop
						    //
						      	
						    //Add the invoice line object to the request object
						    //
						    taxReqObj.inv.push(taxReqInvObj);
    				
    				
						}
    				

    				
    				//============================================
    				//Call the suitelet to get the tax calculation
    				//============================================
    				//
    				Ext.Ajax.request({
    									url: 		url.resolveScript({scriptId: 'customscript_bbstfc_tax_prev_suitelet', deploymentId: 'customdeploy_bbstfc_tax_prev_suitelet'}),
    									method: 	'GET',
    									headers: 	{'Content-Type': 'application/json'},
    									params: 	{
    													action:						'calcTax',
	    												taxReqObj: 					JSON.stringify(taxReqObj),
	    												subsidiaryClientProfileID:	subsidiaryClientProfileID
    												},
    									success: 	function (response, result) 	{
	    																				//myMask.hide();
	    																				try
	    																					{
	    																						//Extract the response
	    																						//
	    																						var respObj = JSON.parse(response.responseText);
	    																						
	    																						//Process the response
	    																						//
	    																						var AVA_TotalTax = Number(respObj.taxTotal);
	    																						
	    																						if(this.document)
	    																							{
	    																								 document.forms['main_form'].elements['taxamountoverride'].value = format_currency(AVA_TotalTax);  
	    																								 setInlineTextValue(document.getElementById('taxamountoverride_val'),format_currency(AVA_TotalTax));
	    																							}
	    																						
	    																						currRec.setValue({fieldId: 'taxamountoverride', value: AVA_TotalTax, ignoreFieldChange: false});
	    																						
	    																						var TaxTotal = Number(0);
	    																						var Subtotal = Number(0);
	    																						var discount = Number(0);
	    																						var Shippingcost = Number(0);
	    																						var Handlingcost = Number(0);
	    																						var GiftCertCost = Number(0);
	    																						
	    																						TaxTotal 	= (currRec.getValue({fieldId: 'taxamountoverride'}) != null && currRec.getValue({fieldId: 'taxamountoverride'}) != '' )? parseFloat(currRec.getValue({fieldId: 'taxamountoverride'})) : 0; 

	    																						Subtotal	= parseFloat(currRec.getValue({fieldId: 'subtotal'}));
	    																						
	    																						discount = parseFloat(currRec.getValue({fieldId: 'discounttotal'}));

	    																						if((currRec.getValue({fieldId: 'shippingcost'}) != null) && (currRec.getValue({fieldId: 'shippingcost'}) != ''))
	    																						     {
	    																						       	Shippingcost = parseFloat(currRec.getValue({fieldId: 'shippingcost'}));
	    																						     }
	    																						
	    																						if((currRec.getValue({fieldId: 'handlingcost'}) != null) && (currRec.getValue({fieldId: 'handlingcost'}) != ''))
	    																						     {
	    																						    	 Handlingcost = parseFloat(currRec.getValue({fieldId: 'handlingcost'}));
	    																						     }

	    																						if((currRec.getValue({fieldId: 'giftcertapplied'}) != null) && (currRec.getValue({fieldId: 'giftcertapplied'}) != ''))
	    																							{
	    																								GiftCertCost = parseFloat(currRec.getValue({fieldId: 'giftcertapplied'}));
	    																							}

	    																						var NetTotal = Subtotal + discount + TaxTotal + Shippingcost + Handlingcost + GiftCertCost;
	    																						
	    																						NetTotal = Math.round((NetTotal * 100.00)) / 100.00;
	    																						
	    																						currRec.setValue({fieldId: 'total', value: NetTotal, ignoreFieldChange: false});
	    																						
	    																						
	    																					}
	    																				catch(err)
	    																					{
	    																					
	    																					}
    																				},
    									failure: 	function (response, result) 	{
	    																				//myMask.hide();
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

	//Get the current configuration
	//
	function getConfiguration(subsidiaryID)
		{
			// declare and initialize variables
			var config = null;
			var subsidiaryRecord = null;
			
			//Create search to find an active configuration
			//
			var customrecord_bbstfc_configSearchObj = search.create({
				   type: "customrecord_bbstfc_config",
				   filters:
				   [
				      ["isinactive","is","F"]
				   ],
				   columns:
				   [
				      search.createColumn({name: "custrecord_bbstfc_conf_proc_mode", label: "API Processing Mode"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_client_id", label: "Client Id"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_prod_ep", label: "Endpoint Prefix (Production)"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_sb_ep", label: "Endpoint Prefix (Sandbox)"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_calc_tax", label: "Endpoint – Calculate Taxes"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_commit", label: "Endpoint – Commit"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_ep_gcode", label: "Endpoint – Get GeoCode"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_ep_loc", label: "Endpoint – Get Location"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_ep_pcode", label: "Endpoint – Get PCode"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_ep_pr_loc", label: "Endpoint – Get Primary Location"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_ep_tax_types", label: "Endpoint – Get Tax Types"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_ep_tx_svc", label: "Endpoint – Get Tx/Service Pairs"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_ep_health", label: "Endpoint – Health Check"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_ep_svc_info", label: "Endpoint – Service Info"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_pcl_script", label: "PCode Lookup Script"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_password", label: "Password"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_profile_id", label: "Profile Id"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_username", label: "Username"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_non_bill_tax", label: "Non Billable Taxes"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_extended_tax", label: "Extended Tax Info"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_reporting_info", label: "Reporting Info"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_own_facilities", label: "Own Facilities"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_franchise", label: "Franchise"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_regulated", label: "Regulated"}),
				      search.createColumn({name: "custrecord_bbstfc_bus_class_code", join: "CUSTRECORD_BBSTFC_CONF_BUS_CLASS", label: "Class Code"}),
				      search.createColumn({name: "custrecord_bbstfc_svc_class_code", join: "CUSTRECORD_BBSTFC_CONF_SVC_CLASS", label: "Class Code"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_tax_code", label: "Tax Code"}),
				      search.createColumn({name: "custrecord_bbstfc_conf_address_type", label: "Address Type"}),
				      search.createColumn({name: "custrecord_bbstfc_config_custom_type", label: "Custom Address Record Type"}),
				      search.createColumn({name: "custrecord_bbstfc_custom_source_from", label: "Source From"}),
				      search.createColumn({name: "custrecord_bbstfc_config_subsidiaries", label: "Subsidiaries"}),
				      search.createColumn({name: "custrecord_bbstfc_config_max_tax", label: "Max Tax Codes To Process"}),
				      search.createColumn({name: "custrecord_bbstfc_from_address_field", label: "From Address Field"}),
				      search.createColumn({name: "custrecord_bbstfc_to_address_field", label: "To Address Field"}),
				      search.createColumn({name: "custrecord_bbstfc_llb_address_field", label: "Line Level Billing"})
				   ]
				});
			
			//If we have a subsidiary ID
			//
			if (subsidiaryID != null && subsidiaryID != '')
				{
					try
						{
							//Load the subsidiary record
							//
							subsidiaryRecord = record.load({
								type: record.Type.SUBSIDIARY,
								id: subsidiaryID
							});
						}
					catch(e)
						{
							log.error({
								title: 'Error Loading Subsidiary Record',
								details: e
							});
						}
				}
			
			//If we have been able to load the subsidiary record
			//
			if (subsidiaryRecord)
				{
					//Get the current search filters
					//
					var searchFilters = customrecord_bbstfc_configSearchObj.filters;
    			
					//Add a new search filter using .push() method
	    			//
	    			searchFilters.push(
	    									search.createFilter({
	    										name: 'custrecord_bbstfc_config_subsidiaries',
	    										operator: search.Operator.ANYOF,
	    										values: [subsidiaryID]
	    									})
	    								
	    								);
				}
			
			//Run search and return results
			//
			customrecord_bbstfc_configSearchObj = getResults(customrecord_bbstfc_configSearchObj);
			
			//Found one?
			//
			if(customrecord_bbstfc_configSearchObj.length > 0)
				{
					config 						= new clientLibraryModule.libConfigObj();
					var processingMode 			= Number(customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_proc_mode'}));
					var username 				= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_username'});
					var password 				= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_password'});
					var combinedCredentials		= username + ':' + password;
					var urlPrefix 				= '';
					
					//Construct full url based on api mode
					//
					switch(processingMode)
						{
							case 1:	//Production
								urlPrefix = customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_prod_ep'});
								break;
								
							case 2: //Sandbox
								urlPrefix = customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_sb_ep'});
								break;
						}
					
					config.maxTaxLinesToProcess			= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_config_max_tax'});
					config.subsidiariesEnabled			= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_config_subsidiaries'}).split(',');
					config.taxCalculationAddress		= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_address_type'});
					config.taxCustomAddressRecType		= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_config_custom_type'});
					config.taxCustomAddressIdFrom		= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_custom_source_from'});
					config.fromAddressFieldId			= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_from_address_field'});
					config.toAddressFieldId				= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_to_address_field'});
					config.llbAddressFieldId			= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_llb_address_field'});
					config.businessClass				= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_bus_class_code', join: "CUSTRECORD_BBSTFC_CONF_BUS_CLASS"});
					config.serviceClass					= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_svc_class_code', join: "CUSTRECORD_BBSTFC_CONF_SVC_CLASS"});
					config.ownFacilities				= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_own_facilities'});
					config.franchise					= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_franchise'});
					config.regulated					= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_regulated'});
					config.nonBillableTaxes				= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_non_bill_tax'});
					config.extendedTaxInfo				= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_extended_tax'});
					config.reportingInfo				= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_reporting_info'});
					config.pcodeLookupScript 			= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_pcl_script'});
					config.clientId 					= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_client_id'});
					config.profileId 					= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_profile_id'});
					config.taxCode 						= customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_tax_code'});
					config.endpointGetTaxCalulation 	= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_calc_tax'});
					config.endpointCommit 				= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_commit'});
					config.endpointGetGeocode 			= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_ep_gcode'});
					config.endpointGetLocation 			= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_ep_loc'});
					config.endpointGetPcode 			= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_ep_pcode'});
					config.endpointGetPrimaryLocation 	= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_ep_pr_loc'});
					config.endpointGetTaxTypes 			= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_ep_tax_types'});
					config.endpointGetTxServicePairs 	= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_ep_tx_svc'});
					config.endpointGetHealthCheck 		= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_ep_health'});
					config.endpointGetServiceInfo 		= urlPrefix + customrecord_bbstfc_configSearchObj[0].getValue({name: 'custrecord_bbstfc_conf_ep_svc_info'});
					
				}
			
			return config;
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
        	pageInit: 			previewTaxPI,
        	previewTax:			previewTax
    		};
    
});
