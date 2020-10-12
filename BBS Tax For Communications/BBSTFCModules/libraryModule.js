/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/record', 'N/config', 'N/runtime', 'N/search', 'N/plugin', 'N/format'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, config, runtime, search, plugin, format) 
{

	//=====================================================================
	//Objects
	//=====================================================================
	//
	
	//Request body for tax calculation API
	//
	function libCalcTaxesRequestObj()
		{
			this.cfg 	= new libRequestConfigObj();	
			this.cmpn	= new libCompanyDataObj();
			this.inv	= [];						//array		List of invoices to process
			this.ovr	= [];						//array 	Tax rate overrides.
			this.sover	= [];						//array 	Safe harbour overrides for USF taxes.
		}
	
	//Container class for json properties associated with v2.CalcTaxes request configuration options
	//
	function libRequestConfigObj()
		{
			this.retnb		= null;						//boolean 	Flag indicating non-billable taxes should be returned. If set, will override account setting Default if not provided is account setting value
			this.retext		= null;						//boolean 	Flag indicating extended tax information should be returned. Reference online documentation for more details
			this.incrf		= null;						//boolean 	Flag indicating reporting information should be returned. Reference online documentation for more details
		}
	
	//Container class for json properties associated with v2.CalcTaxes company data
	//
	function libCompanyDataObj()
		{
			this.bscl		= null;						//integer 	Business class. 0 = ILEC, 1 = CLEC
			this.svcl		= null;						//integer 	Service class. 0 = Primary Local, 1 = Primary Long Distance.
			this.fclt		= null;						//boolean 	Specifies if the carrier delivering the service has company owned facilities to provide the service.
			this.frch		= null;						//boolean 	Indicates if the company provides services sold pursuant to a franchise agreement between the carrier and jurisdiction.
			this.reg		= null;						//boolean 	Indicates if company is regulated.
			this.excl		= [];						//array 	Exclusion list
			this.idnt		= null;						//string 	An optional company identifier for reporting
		}
	
	//Contains information about an invoice or quote.
	//
	function libInvoicesObj()
		{
			this.doc		= null;						//string	Document code.
			this.cmmt		= null;						//boolean	Indicates if invoice should be committed as soon as it is processed
			this.bill		= new libLocationObj();		//object	Location data used to determine taxing jurisdiction.
			this.cust		= null;						//integer	Customer type.
			this.lfln		= null;						//boolean	Indicates if customer is a Lifeline participant
			this.date		= null;						//string	Invoice date.
			this.exms		= [];						//array		Tax exemptions - array of libTaxExemptionsObj
			this.itms		= [];						//array 	Line items. - array of libLineItemObj
			this.invm		= null;						//boolean	Indicates if all line items within invoice should be processed in invoice mode
			this.dtl		= null;						//boolean	Indicates if individual line item taxes should be included in response.
			this.summ		= null;						//boolean	Indicates if the summarized taxes for the invoice should be included in the resonse
			this.opt		= [];						//array		Optional values for invoice. Maximum of 5. Keys must be numeric from 1 to 5.
			this.acct		= null;						//string	Account reference for reporting
			this.custref	= null;						//string	Customer Reference for reporting
			this.invn		= null;						//string	Invoice Number reference for reporting
			this.bcyc		= null;						//string	Bill Cycle reference for reporting
			this.bpd		= new libBillingPeriod();	//object	Optional object for passing in billing period
			this.ccycd		= null;						//string	Currency code for invoice. Example: CAD = Canadian Dollar
		}
	
	//Data for an invoice or quote line item.
	//
	function libLineItemObj()
		{
			this.ref		= null;						//string	Reference ID for line item
			this.from		= new libLocationObj();		//object	Location data used to determine taxing jurisdiction.
			this.to			= new libLocationObj();		//object	Location data used to determine taxing jurisdiction.
			this.chg		= null;						//number	Charge amount. 
			this.line		= null;						//integer	Number of lines
			this.loc		= null;						//integer	Number of locations
			this.min		= null;						//number	Number of minutes
			this.sale		= null;						//integer	0 - Wholesale : Indicates that the item was sold to a wholeseller. 1 - Retail : Indicates that the item was sold to an end user - a retail sale. 2 - Consumed : Indicates that the item was consumed directly (SAU products only). 3 - VendorUse : Indicates that the item is subject to vendor use tax (SAU products only).
			this.plsp		= null;						//number	Split for private-line transactions. Remove the key from the line item if you don't want to use the Private Line functionality.
			this.incl		= null;						//boolean	Indicates if the charge for this line item is tax-inclusive.
			this.pror		= null;						//number	For pro-rated tax calculations. Percentage to pro-rate.
			this.proadj		= null;						//integer	For pro-rated credit or adjustment calculations. 0 = default 1 = do not return non-proratable fixed taxes in response 2 = return non-proratable fixed taxes in response
			this.tran		= null;						//integer	Transaction type ID.
			this.serv		= null;						//boolean	Service type ID.
			this.dbt		= null;						//boolean	Indicates if this line item is a debit card transaction.
			this.adj		= null;						//boolean	Indicates if this line item is an adjustment.
			this.adjm		= null;						//integer	Adjustment method.
			this.disc		= null;						//integer	Discount type for adjustments.
			this.opt		= [];						//array		Optional values for line item. Maximum of 5. Keys must be numeric from 5 to 10
			this.prop		= null;						//integer	Attribute/property value for sales and use transaction/service pairs.
			this.bill		= new libLocationObj();		//object	Location data used to determine taxing jurisdiction.
			this.cust		= null;						//integer	Customer type
			this.lfln		= null;						//boolean	Indicates if customer is a Lifeline participant.
			this.date		= null;						//string	Invoice date.
			this.qty		= null;						//integer	Quantity to be applied to the item - taxation is equivalent to repeating the item the number of times of the quantity
			this.glref		= null;						//string	General Ledger reference to be used in reporting
		}
	
	//Tax exemption data.
	//
	function libTaxExemptionsObj()
		{
			this.frc		= null;						//boolean	Override level exempt flag on wildcard tax type exemptions	
			this.loc		= new libLocationObj()		//object	Location data used to determine taxing jurisdiction.		
			this.tpe		= null;						//integer	Tax type to exempt. Tax type exemptions and Category exemptions are mutually exclusive.
			this.cat		= null;						//integer	Tax category to exempt. Tax type exemptions and Category exemptions are mutually exclusive.	
			this.dom		= null;						//integer	Exemption Domain. This is the jurisdiction level in which the exemption jurisdiction must match the taxing jurisdiction.
			this.scp		= null;						//integer	Exemption Scope. This defines the tax levels in which the taxes will be considered as candidates for exemption.	
			this.exnb		= null;						//boolean	Exempt non-billable flag. Determines if non-billable taxes are to be considered as candidates for exemption.	
		}
	
	//Location data used to determine taxing jurisdiction.
	//
	function libLocationObj()
		{
			this.cnty		= null;						//string	County name.
			this.ctry		= null;						//string	Country ISO code.
			this.int		= null;						//boolean	Indicates if the location is within city limits.
			this.geo		= null;						//boolean	Indicates if this address should be geocoded in order to obtain taxing jurisdiction
			this.pcd		= null;						//integer	PCode for taxing jurisdiction.
			this.npa		= null;						//integer	NPANXX number.
			this.fips		= null;						//string	FIPS code for taxing jurisdiction.
			this.addr		= null;						//string	Street address.
			this.city		= null;						//string	City name.
			this.st			= null;						//string	State name or abbreviation.
			this.zip		= null;						//string	Postal code.
		}
	
	//Billing period data
	//
	function libBillingPeriod()
		{
			this.month		= null;						//integer	Billing Period Month
			this.year		= null;						//integer	Billing Period Year
		}
	
	
	//Internal api configuration object
	//
	function libConfigObj()
		{
			this.credentialsEncoded 		= '';
			this.clientId					= '';
			this.profileId					= '';
			this.endpointGetHealthCheck		= '';
			this.endpointGetServiceInfo		= '';
			this.endpointGetPcode			= '';
			this.endpointGetGeocode			= '';
			this.endpointGetTaxTypes		= '';
			this.endpointGetTxServicePairs	= '';
			this.endpointGetLocation		= '';
			this.endpointGetPrimaryLocation	= '';
			this.endpointGetTaxCalulation	= '';
			this.endpointCommit				= '';	
			this.pcodeLookupScript			= '';
			this.nonBillableTaxes			= '';
			this.extendedTaxInfo			= '';
			this.reportingInfo				= '';
			this.ownFacilities				= '';
			this.franchise					= '';
			this.regulated					= '';
			this.businessClass				= '';
			this.serviceClass				= '';
			this.taxCode					= '';
			this.taxCalculationAddress		= '';
			this.taxCustomAddressRecType	= '';
			this.taxCustomAddressIdFrom		= '';
			this.subsidiariesEnabled		= [];
			this.pCode						= '';
			this.maxTaxLinesToProcess		= '';
		}
	
	//Generic response from api object
	//
	function libGenericResponseObj()
		{
			this.httpResponseCode	= '';
			this.responseMessage 	= '';
			this.apiResponse		= {};
		}
		
	function libTaxSummaryObj(taxName, taxLevel)
		{
			this.taxName 	= 	taxName;
			this.taxLevel	=	taxLevel;
			this.taxAmount	= 	0;
		}
		
	function libOutputSummary(taxName, taxLevel, taxAmount)
		{
			this.taxName	=	taxName;
			this.taxLevel	=	taxLevel;
			this.taxAmount	=	taxAmount;
		}
	
	function libTaxCategoryObj(name, avalaraID, internalID)
		{
			this.name =	name;
			this.avalaraID = avalaraID;
			this.internalID = internalID;
		}
	
	function libTaxLevelObj(name, avalaraID, internalID)
		{
			this.name =	name;
			this.avalaraID = avalaraID;
			this.internalID = internalID;
		}
	
	function libTaxTypeObj(name, avalaraID, internalID)
		{
			this.name =	name;
			this.avalaraID = avalaraID;
			this.internalID = internalID;
		}

	//=====================================================================
	//Methods
	//=====================================================================
	//
	
	//Gets the destination pcode based on the configuration record.
	//The pcode can be got from the billing address, shipping address or a custom record so long as there is a link to it from the tranbsaction record
	//
	function getDestinationPcode(_transactionRecord)
		{
			var returnedPcode = null;
			
			try
				{
					//Get the plugin implementation
					//
					var  tfcPlugin = plugin.loadImplementation({
																type: 'customscript_bbstfc_plugin'
																});
					
					if(tfcPlugin != null)
						{
							//Get the current config 
							//
							var configObject = tfcPlugin.getTFCConfiguration();
							
							if(configObject != null)
								{
									switch(Number(configObject.taxCalculationAddress))
										{
											case 1:		//Billing
												
												returnedPcode = getStandardAddress(_transactionRecord, 'billingaddress');
												
												break;
												
											case 2:		//Shipping
												
												returnedPcode = getStandardAddress(_transactionRecord, 'shippingaddress');
												
												break;
												
											case 3:		//Custom
												
												var customRecordType = configObject.taxCustomAddressRecType;
												var customSourcField = configObject.taxCustomAddressIdFrom;
												
												//Get the value of the custom record source field from the current transaction record
												//
												var customRecordId = _transactionRecord.getValue({
																								fieldId: customSourcField
																								});
												
												if(customRecordId != null && customRecordId != '')
													{
														//Get the mapping record for this record type
														//
														var customrecord_bbstfc_pcode_mapSearchObj = getResults(search.create({
																															   type: "customrecord_bbstfc_pcode_map",
																															   filters:
																															   [
																															      ["custrecord_bbstfc_pmap_rec_type","is",customRecordType]
																															   ],
																															   columns:
																															   [
																															      search.createColumn({name: "custrecord_bbstfc_pmap_rec_type", label: "Record Type"}),
																															      search.createColumn({name: "custrecord_bbstfc_pmap_pcode", label: "Field Id - PCode"})
																															   ]
																															}));
														
														if(customrecord_bbstfc_pcode_mapSearchObj != null && customrecord_bbstfc_pcode_mapSearchObj.length > 0)
															{
																var mappedPcodeField = customrecord_bbstfc_pcode_mapSearchObj[0].getValue({
																																			name: 'custrecord_bbstfc_pmap_pcode'
																																			});
																if(mappedPcodeField != null && mappedPcodeField != '')
																	{
																		//Get the contents of the pcode field based on the mapping
																		//
																		var customRecordSearch = search.lookupFields({
																													type: 		customRecordType,
																													id: 		customRecordId,
																													columns: 	mappedPcodeField
																													});
																		
																		returnedPcode = customRecordSearch[mappedPcodeField];
																	}
															}
													}
												
												break;	
										}
								}
						}
				}
			catch(err)
				{
					log.error({
								title:		'Unexpected error when trying to get destination pcode',
								details:	err
								});
				}
			finally
				{
					return returnedPcode;
				}
		}
	
	function getStandardAddress(_transactionRecord, _addressType)
		{
			var returnedPcode = null;
			
			try
				{
					//Get the standard address subrecord (billing or shipping)
					//
					var addressSubrecord = _transactionRecord.getSubrecord({fieldId: _addressType});
					
					if(addressSubrecord != null)
						{
							//Get the mapping for "customer" as this will be ok for the standard built-in addresses
							//
							var customrecord_bbstfc_pcode_mapSearchObj = getResults(search.create({
								   type: "customrecord_bbstfc_pcode_map",
								   filters:
								   [
								      ["custrecord_bbstfc_pmap_rec_type","is",'customer']
								   ],
								   columns:
								   [
								      search.createColumn({name: "custrecord_bbstfc_pmap_rec_type", label: "Record Type"}),
								      search.createColumn({name: "custrecord_bbstfc_pmap_pcode", label: "Field Id - PCode"})
								   ]
								}));
	
							if(customrecord_bbstfc_pcode_mapSearchObj != null && customrecord_bbstfc_pcode_mapSearchObj.length > 0)
								{
									var mappedPcodeField = customrecord_bbstfc_pcode_mapSearchObj[0].getValue({
																				name: 'custrecord_bbstfc_pmap_pcode'
																				});
									
									if(mappedPcodeField != null && mappedPcodeField != '')
										{
											//Get the contents of the pcode field based on the mapping
											//
											returnedPcode = addressSubrecord.getValue({fieldId: mappedPcodeField});
										}
								}
						}		
				}
			catch(err)
				{
					log.error({
								title:		'Unexpected error when trying to get destination pcode',
								details:	err
								});
				}
			finally
				{
					return returnedPcode;
				}
		}
	
	function getCreatedFromTransactionInfo(transactionID) {
		
		// lookup the trandate on the transaction
		var transactionLookup = search.lookupFields({
			type: search.Type.TRANSACTION,
			id: transactionID,
			columns: ['trandate']
		});
		
		// format the transaction date as a date object and return to the main script
		return format.parse({
			type: format.Type.DATE,
			value: transactionLookup.trandate
		});
		
	}
	
	function getCustomerInfo(customerID) {
		
		// declare and initialize variables
		var returnArray 	= new Array();
		var customerName	= null;
		var customerType	= null;
		var lifeLine		= null;
		var salesType		= null;
		
		// lookup fields on the customer record
		var customerLookup = search.lookupFields({
			type: search.Type.CUSTOMER,
			id: customerID,
			columns: ['entityid', 'custentity_bbs_tfc_customer_type', 'custentity_bbs_tfc_lifeline', 'custentity_bbstfc_sales_type']
		});
		
		// get the customer name
		customerName = customerLookup.entityid;
		
		// check we have a customer type
		if (customerLookup.custentity_bbs_tfc_customer_type.length > 0)
			{
				// get the customer type
				customerType = customerLookup.custentity_bbs_tfc_customer_type[0].value;
				
				// call function to return the AFC customer type code
				customerType = getCustomerTypeCode(customerType);
			}
			
		// check we have a sales type
		if (customerLookup.custentity_bbstfc_sales_type.length > 0)
			{
				// get the sales type
				salesType = customerLookup.custentity_bbstfc_sales_type[0].value;
				
				// call function to return the AFC sales type code
				salesType = getSalesTypeCode(salesType);
			}
		
		// get the value of the 'Lifeline' checkbox
		lifeLine = customerLookup.custentity_bbs_tfc_lifeline;
		
		// push values to the returnArray
		returnArray.push(customerName);
		returnArray.push(customerType);
		returnArray.push(salesType);
		returnArray.push(lifeLine);
		
		return returnArray;
		
	}
	
	function getCustomerExemptions(customerID, tranDate) {
		
		// declare new array to hold customer exemptions
		var customerExemptions = new Array();
		
		// format tranDate as a date string
		tranDate = format.format({
			type: format.Type.DATE,
			value: tranDate
		});
		
		// run search to check for exemptions for this customer
		search.create({
			type: 'customrecord_bbstfc_expeptions',
			
			filters: [{
				name: 'isinactive',
				operator: 'is',
				values: ['F']
			},
					{
				name: 'custrecord_bbstfc_ex_customer',
				operator: 'anyof',
				values: [customerID]
			},
					{
				name: 'custrecord_bbstfc_ex_start',
				operator: 'notafter',
				values: [tranDate]
			},
					{
				name: 'custrecord_bbstfc_ex_end',
				operator: 'notbefore',
				values: [tranDate]
			},
					{
				name: 'custrecord_bbstfc_ex_p_code',
				operator: 'isnotempty'
			}],
			
			columns: [{
				name: 'custrecord_bbstfc_ex_ttype'
			},
					{
				name: 'custrecord_bbstfc_ex_tcat'
			},
					{
				name: 'custrecord_bbstfc_ex_domain'
			},
					{
				name: 'custrecord_bbstfc_ex_sc_federal'
			},
					{
				name: 'custrecord_bbstfc_ex_sc_county',
			},
					{
				name: 'custrecord_bbstfc_ex_sc_state',
			},
					{
				name: 'custrecord_bbstfc_ex_sc_local'
			},
					{
				name: 'custrecord_bbstfc_ex_p_code'
			}],
			
		}).run().each(function(result){
			
			// declare and initialize variables
			var taxScope = 0;
			
			// retrieve search results
			var taxType = result.getValue({
				name: 'custrecord_bbstfc_ex_ttype'
			});
			
			var taxCategory = result.getValue({
				name: 'custrecord_bbstfc_ex_tcat'
			});
			
			var taxDomain = result.getValue({
				name: 'custrecord_bbstfc_ex_domain'
			});
			
			var federal = result.getValue({
				name: 'custrecord_bbstfc_ex_sc_federal'
			});
			
			var state = result.getValue({
				name: 'custrecord_bbstfc_ex_sc_state'
			});
			
			var county = result.getValue({
				name: 'custrecord_bbstfc_ex_sc_county'
			});
			
			var local = result.getValue({
				name: 'custrecord_bbstfc_ex_sc_local'
			});
			
			var pCode = result.getValue({
				name: 'custrecord_bbstfc_ex_p_code'
			});
			
			// does federal return true
			if (federal == true)
				{
					// increase taxScope variable by 128
					taxScope += 128;
				}
				
			// does state return true
			if (state == true)
				{
					// increase taxScope variable by 256
					taxScope += 256;
				}
				
			// does county return true
			if (county == true)
				{
					// increase taxScope variable by 512
					taxScope += 512;
				}
			
			// does local return true
			if (local == true)
				{
					// increase taxScope variable by 1024
					taxScope += 1024;
				}
				
			// call functions to return the Avalara code for the tax type/category/domain
			taxType = getTaxTypeCode(taxType);
			taxCategory	= getTaxCategoryCode(taxCategory);
			taxDomain = getTaxDomainCode(taxDomain);
			
			// construct a tax exemptions object
			var taxExemptionsObj = new libTaxExemptionsObj();
			
			// fill in the tax exemptions object
			taxExemptionsObj.frc 		= false;
			taxExemptionsObj.loc.pcd 	= pCode;
			taxExemptionsObj.tpe 		= taxType;
			taxExemptionsObj.cat 		= taxCategory;
			taxExemptionsObj.dom 		= taxDomain;
			taxExemptionsObj.scp 		= taxScope;
			taxExemptionsObj.exnb		= false;
			
			// push the taxExemptionsObj to the customerExemptions array
			customerExemptions.push(taxExemptionsObj);
			
			// continue processing search results
			return true;
			
		});
		
		// return customerExemptions array
		return customerExemptions;
		
	}
	
	function getTransactionServicePair(itemType, itemID) {
		
		// declare and initialize variables
		var returnArray 		= new Array();
		var transactionType		= null;
		var serviceType			= null;
		
		// if the itemType is 'InvtPart'
		if (itemType == 'InvtPart')
			{
				// lookup fields on the item record
	    		var itemLookup = search.lookupFields({
	    			type: search.Type.INVENTORY_ITEM,
	    			id: itemID,
	    			columns: ['custitem_bbstfc_tx_svc_pair.custrecord_bbstfc_txsvc_tx_type', 'custitem_bbstfc_tx_svc_pair.custrecord_bbstfc_txsvc_svc_type']
	    		});
	    		
	    		// retrieve values from the itemLookup
	    		transactionType = itemLookup["custitem_bbstfc_tx_svc_pair.custrecord_bbstfc_txsvc_tx_type"];
	    		serviceType		= itemLookup["custitem_bbstfc_tx_svc_pair.custrecord_bbstfc_txsvc_svc_type"];
			}
		else if (itemType == 'NonInvtPart') // if the itemType is 'NonInvtPart'
			{
				// lookup fields on the item record
	    		var itemLookup = search.lookupFields({
	    			type: search.Type.NON_INVENTORY_ITEM,
	    			id: itemID,
	    			columns: ['custitem_bbstfc_tx_svc_pair.custrecord_bbstfc_txsvc_tx_type', 'custitem_bbstfc_tx_svc_pair.custrecord_bbstfc_txsvc_svc_type']
	    		});
	    		
	    		// retrieve values from the itemLookup
	    		transactionType = itemLookup["custitem_bbstfc_tx_svc_pair.custrecord_bbstfc_txsvc_tx_type"];
	    		serviceType		= itemLookup["custitem_bbstfc_tx_svc_pair.custrecord_bbstfc_txsvc_svc_type"];
			}
		
		// push values to the returnArray
		returnArray.push(transactionType);
		returnArray.push(serviceType);
		
		return returnArray;
		
	}
	
	function getSubsidiaryInfo(subsidiaryID) {
		
		// declare array to hold return values
		var returnArray 	= new Array();
		var clientProfileID = null;
		var pCode 			= null;
		
		try
			{
				// load the subsidiary record
				var subsidiaryRecord = record.load({
					type: record.Type.SUBSIDIARY,
					id: subsidiaryID
				});
				
				// get the client profile ID
				clientProfileID = subsidiaryRecord.getValue({
					fieldId: 'custrecord_bbstfc_subsid_profile_id'
				});
				
				// get the address subrecord
				var addressSubrecord = subsidiaryRecord.getSubrecord({
					fieldId: 'mainaddress'
				});
				
				// get the P Code
				pCode = addressSubrecord.getValue({
					fieldId: 'custrecord_bbstfc_address_pcode'
				});
			}
		catch(e) // error because of Non-OneWorld account
			{
				log.error({
					title: 'Error Retrieving Subsdiary Info',
					details: e
				});
			}
		
		// push values to the returnArray
		returnArray.push(clientProfileID);
		returnArray.push(pCode);
		
		return returnArray;
		
	}
	
	function getSiteInfo(siteID) {
		
		// do we have a site ID
		if (siteID)
			{
				return search.lookupFields({
					type: 'customrecord_bbs_site',
					id: siteID,
					columns: ['custrecord_bbs_site_pcode']
				}).custrecord_bbs_site_pcode;
			}
		else
			{
				return null;
			}
		
	}
	
	function getISOCode(currencyID) {
		
		// get the ISO code from the currency record
		return search.lookupFields({
			type: search.Type.CURRENCY,
			id: currencyID,
			columns: ['symbol']
		}).symbol;
		
	}
	
	function getCustomerTypeCode(customerTypeID) {
		
		// do we have a customer type ID
		if (customerTypeID)
			{
				return search.lookupFields({
					type: 'customrecord_bbstfc_customer_type',
					id: customerTypeID,
					columns: ['custrecord_bbstfc_customer_type_code']
				}).custrecord_bbstfc_customer_type_code;
			}
		else
			{
				return null;
			}
		
	}
	
	function getSalesTypeCode(salesTypeID) {
		
		// do we have a sales type ID
		if (salesTypeID)
			{
				return search.lookupFields({
					type: 'customrecord_bbstfc_sale_type',
					id: salesTypeID,
					columns: ['custrecord_bbstfc_sale_type_code']
				}).custrecord_bbstfc_sale_type_code;
			}
		else
			{
				return null;
			}
		
	}
	
	function getDiscountTypeCode(discountTypeID) {
		
		// do we have a discount type ID
		if (discountTypeID)
			{
				return search.lookupFields({
					type: 'customrecord_bbstfc_discount_type',
					id: discountTypeID,
					columns: ['custrecord_bbstfc_discount_type_id']
				}).custrecord_bbstfc_discount_type_id;
			}
		else
			{
				return null;
			}
		
	}
	
	function createCalculatedTaxes(transactionID, lineNumber, taxObject, taxCategory, taxLevel, taxType) {
		
		try
			{
				// create a new Calculated Taxes record
				var calculatedTaxesRecord = record.create({
					type: 'customrecord_bbstfc_taxes'
				});
				
				// set fields on the record
				calculatedTaxesRecord.setValue({
					fieldId: 'custrecord_bbstfc_taxes_tran_id',
					value: transactionID
				});
				
				calculatedTaxesRecord.setValue({
					fieldId: 'custrecord_bbstfc_taxes_tran_line',
					value: lineNumber
				});
				
				calculatedTaxesRecord.setValue({
					fieldId: 'custrecord_bbstfc_taxes_tax_name',
					value: taxObject.name
				});
				
				calculatedTaxesRecord.setValue({
					fieldId: 'custrecord_bbstfc_taxes_no_lines',
					value: taxObject.lns
				});
				
				calculatedTaxesRecord.setValue({
					fieldId: 'custrecord_bbstfc_taxes_minutes',
					value: taxObject.min
				});
				
				calculatedTaxesRecord.setValue({
					fieldId: 'custrecord_bbstfc_taxes_measure',
					value: taxObject.tm
				});
				
				calculatedTaxesRecord.setValue({
					fieldId: 'custrecord_bbstfc_taxes_calc_type',
					value: taxObject.calc
				})
				
				calculatedTaxesRecord.setValue({
					fieldId: 'custrecordcustrecord_bbstfc_taxes_rep_pc',
					value: taxObject.pcd
				});
				
				calculatedTaxesRecord.setValue({
					fieldId: 'custrecordbbstfc_taxes_tax_pc',
					value: taxObject.taxpcd
				});
				
				calculatedTaxesRecord.setValue({
					fieldId: 'custrecord_bbstfc_taxes_tax_rate',
					value: taxObject.rate
				});
				
				calculatedTaxesRecord.setValue({
					fieldId: 'custrecord_bbstfc_taxes_tax_amount',
					value: taxObject.tax
				});
				
				// do we have the billable flag
				if (taxObject.bill)
					{
						calculatedTaxesRecord.setValue({
							fieldId: 'custrecord_bbstfc_taxes_billable',
							value: taxObject.bill
						});
					}
				
				// do we have the compliance flag
				if (taxObject.cmpl)
					{
						calculatedTaxesRecord.setValue({
							fieldId: 'custrecord_bbstfc_taxes_compliance',
							value: taxObject.cmpl
						});
					}
				
				// do we have the exempt flag
				if (taxObject.exm)
					{
						calculatedTaxesRecord.setValue({
							fieldId: 'custrecordcustrecord_bbstfc_taxes_exempt',
							value: taxObject.exm
						});
					}
				
				// do we have the surcharge flag
				if (taxObject.sur)
					{
						calculatedTaxesRecord.setValue({
							fieldId: 'custrecord_taxes_surcharge',
							value: taxObject.sur
						});
					}

				calculatedTaxesRecord.setValue({
					fieldId: 'custrecord_bbstfc_taxes_tax_cat',
					value: taxCategory
				});
				
				calculatedTaxesRecord.setValue({
					fieldId: 'custrecord_bbstfc_taxes_tax_level',
					value: taxLevel
				});
				
				calculatedTaxesRecord.setValue({
					fieldId: 'custrecord_bbstfc_taxes_tax_type',
					value: taxType
				});
				
				// save the record
				var recordID = calculatedTaxesRecord.save();
			}
		catch(e)
			{
				log.error({
					title: 'Error Creating Calculated Taxes Record',
					details: e
				});
			}
		
	}
	
	function deleteCalculatedTaxes(transactionID) {
		
		// search for Calculated Taxes records linked to this transaction
		search.create({
			type: 'customrecord_bbstfc_taxes',
			
			filters: [{
				name: 'custrecord_bbstfc_taxes_tran_id',
				operator: 'anyof',
				values: [transactionID]
			}],
			
			columns: [{
				name: 'internalid'
			}],
			
		}).run().each(function(result){
			
			try
				{
					// delete the Calculated Taxes record
					record.delete({
						type: 'customrecord_bbstfc_taxes',
						id: result.id
					});
				}
			catch(e)
				{
					log.error({
						title: 'Error Deleting Calculated Taxes Record ' + result.id,
						details: e
					});
				}
			
			// process additional search results
			return true;
			
		});
		
	}
	
	function createAFCCallLogRecords(transactionID, requestObject, responseObject) {
		
		try
			{
				// ===========================
				// REQUEST AFC CALL LOG RECORD
				// ===========================
				
				var afcCallLogRec = record.create({
					type: 'customrecord_bbstfc_call_log'
				});
				
				afcCallLogRec.setValue({
					fieldId: 'custrecord_bbstfc_call_log_transaction',
					value: transactionID
				});
				
				afcCallLogRec.setValue({
					fieldId: 'custrecord_bbstfc_call_log_call_type',
					value: 1 // 1 = Request
				});
				
				afcCallLogRec.setValue({
					fieldId: 'custrecord_bbstfc_call_log_json',
					value: JSON.stringify(requestObject, null, 4)
				});
				
				afcCallLogRec.save();
				
				// ============================
				// RESPONSE AFC CALL LOG RECORD
				// ============================
				
				var afcCallLogRec = record.create({
					type: 'customrecord_bbstfc_call_log'
				});
				
				afcCallLogRec.setValue({
					fieldId: 'custrecord_bbstfc_call_log_transaction',
					value: transactionID
				});
				
				afcCallLogRec.setValue({
					fieldId: 'custrecord_bbstfc_call_log_call_type',
					value: 2 // 2 = Response
				});
				
				afcCallLogRec.setValue({
					fieldId: 'custrecord_bbstfc_call_log_json',
					value: JSON.stringify(responseObject, null, 4)
				});
				
				afcCallLogRec.save();
			}
		catch(e)
			{
				log.error({
					title: 'Error Creating AFC Call Log Record',
					details: e
				});
			}
		
	}
	
	function getTaxCategories() {
		
		// declare and initialize variables
		var taxCategories = new Array();
		
		// run search to find the the tax category
		search.create({
			type: 'customrecord_bbstfc_tax_type_cat',
			
			filters: [{
				name: 'isinactive',
				operator: 'is',
				values: ['F']	
			}],
			
			columns: [{
				name: 'name'
			},
					{
				name: 'custrecord_bbstfc_tax_type_cat_id'
			}],
			
		}).run().each(function(result){
			
			// push a new libTaxCategoryObj to the taxCategories array
			taxCategories.push(new libTaxCategoryObj(
														result.getValue({name: 'name'}),
														result.getValue({name: 'custrecord_bbstfc_tax_type_cat_id'}),
														result.id
													)
							);
			
			// continue processing search results
			return true;
			
		});

		// return taxCategories array
		return taxCategories;
		
	}
	
	function getTaxLevels() {
		
		// declare and initialize variables
		var taxLevels = new Array();
		
		// run search to find the internal ID of the tax level
		search.create({
			type: 'customrecord_bbstfc_tax_level',
			
			filters: [{
				name: 'isinactive',
				operator: 'is',
				values: ['F']
			}],
			
			columns: [{
				name: 'name'
			},
					{
				name: 'custrecord_bbstfc_tax_level_id'
			}],

		}).run().each(function(result){
			
			// push a new libTaxLevelObj to the taxLevels array
			taxLevels.push(new libTaxLevelObj(
												result.getValue({name: 'name'}),
												result.getValue({name: 'custrecord_bbstfc_tax_level_id'}),
												result.id
											)
						);
			
			// continue processing search results
			return true;
			
		});
		
		// return taxLevels array
		return taxLevels;
		
	}
	
	function getTaxTypes() {
		
		// declare and intialize variables
		var taxTypes = new Array();
		
		// run search to find the internal ID of the tax type
		search.create({
			type: 'customrecord_bbstfc_item_tax_types',
			
			filters: [{
				name: 'isinactive',
				operator: 'is',
				values: ['F']
			}],
			
			columns: [{
				name: 'name'
			},
					{
				name: 'custrecord_bbstfc_ttype_code'
			}],
			
		}).run().each(function(result){
			
			// push a new libTaxTypeObj to the taxLevels array
			taxTypes.push(new libTaxTypeObj(
												result.getValue({name: 'name'}),
												result.getValue({name: 'custrecord_bbstfc_ttype_code'}),
												result.id
											)
						);
			
			// continue processing search results
			return true;
			
		});
		
		// return taxTypes array
		return taxTypes;
		
	}
	
	function getTaxCategory(taxCategoryArray, taxCategoryID) {
		
		// declare and initialize variables
		var taxCategoryObj = null;
		
		// loop through taxCategoryArray
		for (var i = 0; i < taxCategoryArray.length; i++)
			{
				// get the Avalara ID from the taxCategoryArray array
				var avalaraID = taxCategoryArray[i].avalaraID;
				
				// check if avalaraID is equal to taxCategoryID
				if (avalaraID == taxCategoryID)
					{
						// create a new tax category obj
						taxCategoryObj = new libTaxCategoryObj(
																taxCategoryArray[i].name,
																taxCategoryArray[i].avalaraID,
																taxCategoryArray[i].internalID
															);
						// break the loop
						break;
					}
			}
		
		// if we have been unable to find a matching tax category
		if (taxCategoryObj == null)
			{
				// create an empty tax category obj
				taxCategoryObj = new libTaxCategoryObj('', '', '');
			}
			
		// return taxCategoryObj
		return taxCategoryObj;
		
	}
	
	function getTaxLevel(taxLevelArray, taxLevelID) {
		
		// declare and initialize variables
		var taxLevelObj = null;
		
		// loop through taxLevelArray
		for (var i = 0; i < taxLevelArray.length; i++)
			{
				// get the Avalara ID from the taxLevelArray array
				var avalaraID = taxLevelArray[i].avalaraID;
				
				// check if avalaraID is equal to taxLevelID
				if (avalaraID == taxLevelID)
					{
						// create a new tax level obj
						taxLevelObj = new libTaxLevelObj(
																taxLevelArray[i].name,
																taxLevelArray[i].avalaraID,
																taxLevelArray[i].internalID
															);
						// break the loop
						break;
					}
			}
		
		// if we have been unable to find a matching tax level
		if (taxLevelObj == null)
			{
				// create an empty tax level obj
				taxLevelObj = new libTaxLevelObj('', '', '');
			}
			
		// return taxLevelObj
		return taxLevelObj;
		
	}
	
	function getTaxType(taxTypeArray, taxTypeID) {
		
		// declare and initialize variables
		var taxTypeObj = null;
		
		// loop through taxTypeArray
		for (var i = 0; i < taxTypeArray.length; i++)
			{
				// get the Avalara ID from the taxTypeArray array
				var avalaraID = taxTypeArray[i].avalaraID;
				
				// check if avalaraID is equal to taxTypeID
				if (avalaraID == taxTypeID)
					{
						// create a new tax type obj
						taxTypeObj = new libTaxTypeObj(
																taxTypeArray[i].name,
																taxTypeArray[i].avalaraID,
																taxTypeArray[i].internalID
															);
						// break the loop
						break;
					}
			}
		
		// if we have been unable to find a matching tax type
		if (taxTypeObj == null)
			{
				// create an empty tax type obj
				taxTypeObj = new libTaxTypeObj('', '', '');
			}
			
		// return taxTypeObj
		return taxTypeObj;
		
	}
	
	
	function getTaxTypeCode(taxTypeID) {
		
		// do we have a tax type ID
		if (taxTypeID)
			{
				return search.lookupFields({
					type: 'customrecord_bbstfc_item_tax_types',
					id: taxTypeID,
					columns: ['custrecord_bbstfc_ttype_code']
				}).custrecord_bbstfc_ttype_code;
			}
		else
			{
				return null;
			}
		
	}
	
	function getTaxCategoryCode(taxCategoryID) {
		
		// do we have a tax category ID
		if (taxCategoryID)
			{
				return search.lookupFields({
					type: 'customrecord_bbstfc_tax_type_cat',
					id: taxCategoryID,
					columns: ['custrecord_bbstfc_tax_type_cat_id']
				}).custrecord_bbstfc_tax_type_cat_id;
			}
		else
			{
				return null;
			}
		
	}
	
	function getTaxDomainCode(taxDomainID) {
		
		// do we have a tax domain ID
		if (taxDomainID)
			{
				return search.lookupFields({
					type: 'customrecord_bbstfc_tax_level',
					id: taxDomainID,
					columns: ['custrecord_bbstfc_tax_level_id']
				}).custrecord_bbstfc_tax_level_id;	
			}
		else
			{
				return null;
			}
		
	}
	
	function updateTaxTotal(recordType, recordID, linesToUpdate, errorMessages, taxSummary, taxTotal) {
		
		// is taxTotal a negative number
		if (taxTotal < 0)
			{
				// convert taxTotal to a positive number
				taxTotal = (taxTotal * -1); 
			}
		
		try
			{
				// load the transaction record
				var tranRec = record.load({
					type: recordType,
					id: recordID,
					isDynamic: true
				});
				
				// update the error messages field on the record
				tranRec.setValue({
					fieldId: 'custbody_bbs_tfc_errors',
					value: errorMessages
				});
				
				// loop through linesToUpdate array
				for (var i = 0; i < linesToUpdate.length; i++)
					{
						// select the relevant line on the transaction
						tranRec.selectLine({
							sublistId: 'item',
							line: linesToUpdate[i]
						});
						
						// tick the 'Taxable' checkbox on the line
						tranRec.setCurrentSublistValue({
							sublistId: 'item',
							fieldId: 'istaxable',
							value: true
						});
						
						// commit the changes to the line
						tranRec.commitLine({
							sublistId: 'item'
						});
					}
				
				// update the tax amount on the record
				tranRec.setValue({
					fieldId: 'taxamountoverride',
					value: taxTotal
				});
				
				// set the Tax Summary JSON field
				tranRec.setValue({
					fieldId: 'custbody_bbs_tfc_tax_summ_json',
					value: JSON.stringify(taxSummary)
				});
				
				// save the changes to the transaction
				tranRec.save({
					enableSourcing: false,
					ignoreMandatoryFields: true
				});
				
				log.audit({
					title: recordType + 'Updated',
					details: recordID
				});
			}
		catch(e)
			{
				log.error({
					title: 'Error Updating ' + recordType + ' ' + recordID,
					details: e
				});
			}

	}
	
	function libLookupPCode(currentRecord, overrideFlag)
		{
			var currentRecordId 	= currentRecord.id;
			var currentRecordType 	= currentRecord.type;
			
			//Lookup the current record type in the PCode mapping table
			//
			var customrecord_bbstfc_pcode_mapSearchObj = getResults(search.create({
				   type: "customrecord_bbstfc_pcode_map",
				   filters:
				   [
				      ["custrecord_bbstfc_pmap_rec_type","is",currentRecordType]
				   ],
				   columns:
				   [
				      search.createColumn({name: "custrecord_bbstfc_pmap_rec_type", label: "Record Type"}),
				      search.createColumn({name: "custrecord_bbstfc_pmap_iso", label: "Source Field Id - Country ISO"}),
				      search.createColumn({name: "custrecord_bbstfc_pmap_state", label: "Source Field Id - State"}),
				      search.createColumn({name: "custrecord_bbstfc_pmap_county", label: "Source Field Id - County"}),
				      search.createColumn({name: "custrecord_bbstfc_pmap_city", label: "Source Field Id - City"}),
				      search.createColumn({name: "custrecord_bbstfc_pmap_zip", label: "Source Field Id - ZipCode"}),
				      search.createColumn({name: "custrecord_bbstfc_pmap_pcode", label: "Destination Field Id - PCode"}),
				      search.createColumn({name: "custrecord_bbstfc_pmap_npan", label: "NPANXX Code"}),
				      search.createColumn({name: "custrecord_bbstfc_pmap_fips", label: "FIPS Code"}),
				   ]
				}));
				
			//Did we get any results
			//
			if(customrecord_bbstfc_pcode_mapSearchObj != null && customrecord_bbstfc_pcode_mapSearchObj.length > 0)
				{
					//Get the field mappings
					//
					var sourceCountryCode 	= customrecord_bbstfc_pcode_mapSearchObj[0].getValue({name: "custrecord_bbstfc_pmap_iso"});
					var sourceStateCode 	= customrecord_bbstfc_pcode_mapSearchObj[0].getValue({name: "custrecord_bbstfc_pmap_state"});
					var sourceCountyCode 	= customrecord_bbstfc_pcode_mapSearchObj[0].getValue({name: "custrecord_bbstfc_pmap_county"});
					var sourceCityCode 		= customrecord_bbstfc_pcode_mapSearchObj[0].getValue({name: "custrecord_bbstfc_pmap_city"});
					var sourceZipCode 		= customrecord_bbstfc_pcode_mapSearchObj[0].getValue({name: "custrecord_bbstfc_pmap_zip"});
					var sourceNpanxxCode 	= customrecord_bbstfc_pcode_mapSearchObj[0].getValue({name: "custrecord_bbstfc_pmap_npan"});
					var sourceFipsCode 		= customrecord_bbstfc_pcode_mapSearchObj[0].getValue({name: "custrecord_bbstfc_pmap_fips"});
					var destinationPCode	= customrecord_bbstfc_pcode_mapSearchObj[0].getValue({name: "custrecord_bbstfc_pmap_pcode"});
					var recordToProcess		= null;
					var recordUpdated		= false;
					
					//Get the plugin implementation
					//
					var  tfcPlugin = plugin.loadImplementation({
																type: 'customscript_bbstfc_plugin'
																});
	
					//If the current record type is "customer" or "vendor" then we have to process the address subrecord, otherwise process as-is
					//
					switch(currentRecordType)
						{
	    					case 'customer':
	    					case 'vendor':
	    						
	    						try
	    							{
			    						recordToProcess = record.load({
											    						type:		currentRecordType,
											    						id:			currentRecordId,
											    						isDynamic:	false
											    						});
	    							}
	    						catch(err)
	    							{
	    								recordToProcess	= null;
	    								log.error({
	    											title:		'Error loading record of type ' + currentRecordType + ' id = ' + currentRecordId,
	    											details:	err
	    											});
	    							}
	    						
	    						//Did the record load ok?
	    						//
	    						if(recordToProcess != null)
	    							{
	    								//Find the address lines to process
	    								//
	    								var addressLines = recordToProcess.getLineCount({sublistId: 'addressbook'});
	    							
	    								//Loop through each sublist line & get the subrecord
	    								//
	    								for (var addressLine = 0; addressLine < addressLines; addressLine++) 
		    								{
		    									var addressSubRecord = recordToProcess.getSublistSubrecord({
																    									    sublistId: 	'addressbook',
																    									    fieldId: 	'addressbookaddress',
																    									    line: 		addressLine
																    										});
		    									
		    									//Retrieve all the mapped columns
		    									//
		    									var currentCountryCode 	= (sourceCountryCode != '' && sourceCountryCode != null ? addressSubRecord.getValue({fieldId: sourceCountryCode}) : '');
		    									var currentStateCode 	= (sourceStateCode != '' && sourceStateCode != null ? addressSubRecord.getValue({fieldId: sourceStateCode}) : '');
		    									var currentCountyCode 	= (sourceCountyCode != '' && sourceCountyCode != null ? addressSubRecord.getValue({fieldId: sourceCountyCode}) : '');
		    									var currentCityCode 	= (sourceCityCode != '' && sourceCityCode != null ? addressSubRecord.getValue({fieldId: sourceCityCode}) : '');
		    									var currentZipCode 		= (sourceZipCode != '' && sourceZipCode != null ? addressSubRecord.getValue({fieldId: sourceZipCode}) : '');
		    									var currentNpanxxCode 	= (sourceNpanxxCode != '' && sourceNpanxxCode != null ? addressSubRecord.getValue({fieldId: sourceNpanxxCode}) : '');
		    									var currentFipsCode 	= (sourceFipsCode != '' && sourceFipsCode != null ? addressSubRecord.getValue({fieldId: sourceFipsCode}) : '');
		    									var currentPCode 		= (destinationPCode != '' && destinationPCode != null ? addressSubRecord.getValue({fieldId: destinationPCode}) : '');
		    									
		    									//Does the PCode have a value & do we have a field to map the pcode to?
		    									//If not then we need to get one
		    									//
		    									if((currentPCode == '' || currentPCode == null || overrideFlag) && (destinationPCode != null && destinationPCode != ''))
		    										{
		    											//Construct the request object
		    											//
			    										var pcodeRequest 		= {};
			    										pcodeRequest['BestMatch']		= true;
			    										pcodeRequest['LimitResults']	= 10;
		    										
		    											if(currentCountryCode != '' && currentCountryCode != null)
		    												{
		    													pcodeRequest['CountryIso']	= currentCountryCode;
		    												}
	    											
		    											if(currentStateCode != '' && currentStateCode != null)
		    												{
		    													pcodeRequest['State']	= currentStateCode;
		    												}
	    											
		    											if(currentCountyCode != '' && currentCountyCode != null)
		    												{
		    													pcodeRequest['County']	= currentCountyCode;
		    												}
	    											
		    											if(currentCityCode != '' && currentCityCode != null)
		    												{
		    													pcodeRequest['City']	= currentCityCode;
		    												}
	    											
		    											if(currentZipCode != '' && currentZipCode != null)
		    												{
		    													pcodeRequest['ZipCode']	= currentZipCode;
		    												}
		    											
		    											if(currentFipsCode != '' && currentFipsCode != null)
		    												{
		    													pcodeRequest['Fips']	= currentFipsCode;
		    												}
		    											
		    											if(currentNpanxxCode != '' && currentNpanxxCode != null)
		    												{
		    													pcodeRequest['NpaNxx']	= currentNpanxxCode;
		    												}
		    										}	
		    									
		    									//Call the plugin
		    									//
		    									if(tfcPlugin != null)
			    									{
		    											try
		    												{
					    										var pcodeResult = tfcPlugin.getPCode(pcodeRequest);
					    										
					    										//Check the result of the call to the plugin
					    										//
					    										if(pcodeResult != null && pcodeResult.httpResponseCode == '200')
					    											{
					    												//Did we find any matches?
					    												//
					    												if(pcodeResult.apiResponse.MatchCount > 0)
					    													{
					    														//Get the pcode
					    														//
					    														var pcode = pcodeResult.apiResponse.LocationData[0].PCode;
					    														
					    														addressSubRecord.setValue({
					    																					fieldId: 	destinationPCode, 
					    																					value: 		pcode
					    																				});
					    														
					    														recordUpdated = true;
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
	    								
	    								if(recordUpdated)
	    									{
	    										try
	    											{
	    												recordToProcess.save({
	    																	enableSourcing: 		false,
	    																	ignoreMandatoryFields: 	true
	    																	});
	    											}
	    										catch(err)
	    											{
		    											log.error({
					    											title:		'Error saving record of type ' + currentRecordType + ' id = ' + currentRecordId,
					    											details:	err
					    											});
	    											}
	    									}
	    							}
	    						
	    						break;
	    					
	    					case 'subsidiary':
	    						
	    						try
	    							{
			    						recordToProcess = record.load({
											    						type:		currentRecordType,
											    						id:			currentRecordId,
											    						isDynamic:	false
											    						});
	    							}
	    						catch(err)
	    							{
	    								recordToProcess	= null;
	    								log.error({
	    											title:		'Error loading record of type ' + currentRecordType + ' id = ' + currentRecordId,
	    											details:	err
	    											});
	    							}
    						
	    						//Did the record load ok?
	    						//
	    						if(recordToProcess != null)
	    							{
	    								var addressTypes = ['mainaddress', 'shippingaddress', 'returnaddress'];
	    								
	    								for (var addressCounter = 0; addressCounter < addressTypes.length; addressCounter++) 
		    								{
	    										var addressSubRecord = recordToProcess.getSubrecord({fieldId: addressTypes[addressCounter]});
	    										
	    										//Retrieve all the mapped columns
		    									//
		    									var currentCountryCode 	= (sourceCountryCode != '' && sourceCountryCode != null ? addressSubRecord.getValue({fieldId: sourceCountryCode}) : '');
		    									var currentStateCode 	= (sourceStateCode != '' && sourceStateCode != null ? addressSubRecord.getValue({fieldId: sourceStateCode}) : '');
		    									var currentCountyCode 	= (sourceCountyCode != '' && sourceCountyCode != null ? addressSubRecord.getValue({fieldId: sourceCountyCode}) : '');
		    									var currentCityCode 	= (sourceCityCode != '' && sourceCityCode != null ? addressSubRecord.getValue({fieldId: sourceCityCode}) : '');
		    									var currentZipCode 		= (sourceZipCode != '' && sourceZipCode != null ? addressSubRecord.getValue({fieldId: sourceZipCode}) : '');
		    									var currentPCode 		= (destinationPCode != '' && destinationPCode != null ? addressSubRecord.getValue({fieldId: destinationPCode}) : '');
		    									
		    									//Does the PCode have a value & do we have a field to map the pcode to?
		    									//If not then we need to get one
		    									//
		    									if((currentPCode == '' || currentPCode == null || overrideFlag) && (destinationPCode != null && destinationPCode != ''))
		    										{
		    											//Construct the request object
		    											//
			    										var pcodeRequest 		= {};
			    										pcodeRequest['BestMatch']		= true;
			    										pcodeRequest['LimitResults']	= 10;
		    										
		    											if(currentCountryCode != '' && currentCountryCode != null)
		    												{
		    													pcodeRequest['CountryIso']	= currentCountryCode;
		    												}
	    											
		    											if(currentStateCode != '' && currentStateCode != null)
		    												{
		    													pcodeRequest['State']	= currentStateCode;
		    												}
	    											
		    											if(currentCountyCode != '' && currentCountyCode != null)
		    												{
		    													pcodeRequest['County']	= currentCountyCode;
		    												}
	    											
		    											if(currentCityCode != '' && currentCityCode != null)
		    												{
		    													pcodeRequest['City']	= currentCityCode;
		    												}
	    											
		    											if(currentZipCode != '' && currentZipCode != null)
		    												{
		    													pcodeRequest['ZipCode']	= currentZipCode;
		    												}
		    										}	
		    									
		    									//Call the plugin
		    									//
		    									if(tfcPlugin != null)
			    									{
		    											try
		    												{
					    										var pcodeResult = tfcPlugin.getPCode(pcodeRequest);
					    										
					    										//Check the result of the call to the plugin
					    										//
					    										if(pcodeResult != null && pcodeResult.httpResponseCode == '200')
					    											{
					    												//Did we find any matches?
					    												//
					    												if(pcodeResult.apiResponse.MatchCount > 0)
					    													{
					    														//Get the pcode
					    														//
					    														var pcode = pcodeResult.apiResponse.LocationData[0].PCode;
					    														
					    														addressSubRecord.setValue({
					    																					fieldId: 	destinationPCode, 
					    																					value: 		pcode
					    																				});
					    														
					    														recordUpdated = true;
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
	    						
	    						if(recordUpdated)
									{
										try
											{
												recordToProcess.save({
																	enableSourcing: 		false,
																	ignoreMandatoryFields: 	true
																	});
											}
										catch(err)
											{
												log.error({
			    											title:		'Error saving record of type ' + currentRecordType + ' id = ' + currentRecordId,
			    											details:	err
			    											});
											}
									}
	    						
	    						break;
	    						
	    					default:
	    						//Processing for record types other than customer or vendor
	    						//"currentRecord" will be used to retrieve the mapped fields
	    						//
	    						
	    						//Retrieve all the mapped columns
								//
								var currentCountryCode 	= (sourceCountryCode != '' && sourceCountryCode != null ? currentRecord.getValue({fieldId: sourceCountryCode}) : '');
								var currentStateCode 	= (sourceStateCode != '' && sourceStateCode != null ? currentRecord.getValue({fieldId: sourceStateCode}) : '');
								var currentCountyCode 	= (sourceCountyCode != '' && sourceCountyCode != null ? currentRecord.getValue({fieldId: sourceCountyCode}) : '');
								var currentCityCode 	= (sourceCityCode != '' && sourceCityCode != null ? currentRecord.getValue({fieldId: sourceCityCode}) : '');
								var currentZipCode 		= (sourceZipCode != '' && sourceZipCode != null ? currentRecord.getValue({fieldId: sourceZipCode}) : '');
								var currentPCode 		= (destinationPCode != '' && destinationPCode != null ? currentRecord.getValue({fieldId: destinationPCode}) : '');
								
								//Does the PCode have a value & do we have a field to map the pcode to?
								//If not then we need to get one
								//
								if((currentPCode == '' || currentPCode == null || overrideFlag) && (destinationPCode != null && destinationPCode != ''))
									{
										//Construct the request object
										//
										var pcodeRequest 		= {};
										pcodeRequest['BestMatch']		= true;
										pcodeRequest['LimitResults']	= 10;
									
										if(currentCountryCode != '' && currentCountryCode != null)
											{
												pcodeRequest['CountryIso']	= currentCountryCode;
											}
									
										if(currentStateCode != '' && currentStateCode != null)
											{
												pcodeRequest['State']	= currentStateCode;
											}
									
										if(currentCountyCode != '' && currentCountyCode != null)
											{
												pcodeRequest['County']	= currentCountyCode;
											}
									
										if(currentCityCode != '' && currentCityCode != null)
											{
												pcodeRequest['City']	= currentCityCode;
											}
									
										if(currentZipCode != '' && currentZipCode != null)
											{
												pcodeRequest['ZipCode']	= currentZipCode;
											}
									}	
								
								//Call the plugin
								//
								if(tfcPlugin != null)
									{
										try
											{
	    										var pcodeResult = tfcPlugin.getPCode(pcodeRequest);
	    										
	    										//Check the result of the call to the plugin
	    										//
	    										if(pcodeResult != null && pcodeResult.httpResponseCode == '200')
	    											{
	    												//Did we find any matches?
	    												//
	    												if(pcodeResult.apiResponse.MatchCount > 0)
	    													{
	    														//Get the pcode
	    														//
	    														var pcode = pcodeResult.apiResponse.LocationData[0].PCode;
	    														
	    														//Update the record with the new pcode
	    														//
	    														var valuesObj = {};
	    														valuesObj[destinationPCode] = pcode;
	    														
	    														record.submitFields({
							    													type:		currentRecordType,
							    													id:			currentRecordId,
							    													values:		valuesObj,
							    													options:	{
							    																enablesourcing:			true,
							    																ignoreMandatoryFields:	true
							    																}
							    													});
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
	    						
	    						break;
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

	//Left padding s with c to a total of n chars
	//
	function padding_left(s, c, n) 
		{
			if (! s || ! c || s.length >= n) 
				{
					return s;
				}
			
			var max = (n - s.length)/c.length;
			
			for (var i = 0; i < max; i++) 
				{
					s = c + s;
				}
			
			return s;
		}
    
    return {
    		libLookupPCode:					libLookupPCode,
    		libConfigObj:					libConfigObj,
    		libGenericResponseObj:			libGenericResponseObj,
    		libGetDestinationPcode:			getDestinationPcode,
    		getCreatedFromTransactionInfo:	getCreatedFromTransactionInfo,
			getCustomerInfo:				getCustomerInfo,
    		getCustomerExemptions:			getCustomerExemptions,
			getTransactionServicePair:		getTransactionServicePair,
    		getSubsidiaryInfo:				getSubsidiaryInfo,
    		getSiteInfo:					getSiteInfo,
    		getSalesTypeCode:				getSalesTypeCode,
    		getDiscountTypeCode:			getDiscountTypeCode,
    		getISOCode:						getISOCode,
    		getTaxCategories:				getTaxCategories,
			getTaxLevels:					getTaxLevels,
			getTaxTypes:					getTaxTypes,
			getTaxCategory:					getTaxCategory,
			getTaxLevel:					getTaxLevel,
			getTaxType:						getTaxType,
			createCalculatedTaxes:			createCalculatedTaxes,
			deleteCalculatedTaxes:			deleteCalculatedTaxes,
			createAFCCallLogRecords:		createAFCCallLogRecords,
    		updateTaxTotal:					updateTaxTotal,
    		libCalcTaxesRequestObj:			libCalcTaxesRequestObj,
    		libLocationObj:					libLocationObj,
    		libBillingPeriod:				libBillingPeriod,
    		libTaxExemptionsObj:			libTaxExemptionsObj,
    		libLineItemObj:					libLineItemObj,
    		libInvoicesObj:					libInvoicesObj,
			libTaxSummaryObj:				libTaxSummaryObj,
			libOutputSummary:				libOutputSummary,
			padding_left:					padding_left
    		};
    
});
