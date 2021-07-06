/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['./clientLibraryModule','N/url', 'N/currentRecord', 'N/search','N/https', 'N/ui/message'],

function(clientLibraryModule, url, currentRecord, search, https, message) 
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

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function previewTaxSR(scriptContext) 
	    {
	
	    }
    
    function previewTax()
	    {
    		debugger;
    		
    		//Get the current record
			//
			var currRec = currentRecord.get();
			
			
    		//See if we are excluded from AFC taxes
    		//
    		var excludedFlag = currRec.getValue({fieldId: 'custbody_bbstfc_exclude_transaction'});
    		
    		if(excludedFlag)
    			{
	    			var userMessage = message.create({
													title: 		'Tax For Communications', 
													message: 	'This record is excluded from tax calculations',
													type:		message.Type.ERROR,
													duration:	3000
													});

	    			userMessage.show();
    			}
    		else
    			{
    			    	
		    		//Inform user that we are getting the taxes
					//
					var userMessage = message.create({
													title: 		'Tax For Communications', 
													message: 	'Retrieving Tax Total Calculation - Please Wait',
													type:		message.Type.INFORMATION
													});
					
					userMessage.show();
					
		    		try
		    			{	
		    				//=================================================
		    				//Get all the info needed to do the tax calculation
		    				//=================================================
		    				//
		    				var subsidiaryID		= currRec.getValue({fieldId: 'subsidiary'});
		    				var suiteletUrl 		= url.resolveScript({scriptId: 'customscript_bbstfc_tax_prev_suitelet', deploymentId: 'customdeploy_bbstfc_tax_prev_suitelet'});
		    				suiteletUrl 		   += '&action=getConfig';
		    				suiteletUrl 		   += '&subsidiaryID=' + subsidiaryID;
		    				
		    				var response = https.get.promise({
				    										url:		suiteletUrl,
				    										headers: 	{'Content-Type': 'application/json'}
				    										})
				    										.then(function(response){
				    											
				    											var configuration = null;
				    						    				
				    						    				try
				    						    					{	
				    						    						configuration = JSON.parse(response.body);
				    						    					}
				    						    				catch(err)
				    						    					{
				    						    						configuration = null;
				    						    					}
				    											
				    											//Have we got a configuration object
				    											//
				    											if (configuration != null)
				    												{
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
				    						    				
				    						    				
				    												    //============================================
				    								    				//Call the suitelet to get the tax calculation
				    								    				//============================================
				    								    				//
				    													var suiteletUrl = url.resolveScript({scriptId: 'customscript_bbstfc_tax_prev_suitelet', deploymentId: 'customdeploy_bbstfc_tax_prev_suitelet'});
				    								    				suiteletUrl 	+= '&action=calcTax';
				    								    				suiteletUrl 	+= '&subsidiaryClientProfileID=' + subsidiaryClientProfileID;
				    								    				
				    								    				
				    								    				var response = https.post.promise({
				    										    										url:		suiteletUrl,
				    										    										headers: 	{'Content-Type': 'application/json'},
				    										    										body:		JSON.stringify(taxReqObj)
				    										    										})
				    										    										.then(function(response){
				    										    											
				    										    											var respObj = null;
				    										    						    				
				    										    						    				try
				    										    						    					{	
				    										    						    						respObj = JSON.parse(response.body);
				    										    						    					}
				    										    						    				catch(err)
				    										    						    					{
				    										    						    						respObj = null;
				    										    						    					}
				    										    											
				    										    						    				if(respObj)
				    										    						    					{
				    										    							    					//Process the response
				    										    													//
				    										    													var AVA_TotalTax = Number(respObj.taxTotal);
				    										    													
				    										    													if(this.document)
				    										    														{
				    										    															 document.forms['main_form'].elements['taxamountoverride'].value = format_currency(AVA_TotalTax);  
				    										    															 setInlineTextValue(document.getElementById('taxamountoverride_val'),format_currency(AVA_TotalTax));
				    										    														}
				    										    													
				    										    													currRec.setValue({fieldId: 'taxamountoverride', value: AVA_TotalTax, ignoreFieldChange: false});
				    										    													
				    										    													var TaxTotal 		= Number(0);
				    										    													var Subtotal 		= Number(0);
				    										    													var discount 		= Number(0);
				    										    													var Shippingcost 	= Number(0);
				    										    													var Handlingcost 	= Number(0);
				    										    													var GiftCertCost 	= Number(0);
				    										    													
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
				    										    						    				
				    										    						    					userMessage.hide();
				    										    										});
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
	    }

	

    return {
        	pageInit: 			previewTaxPI,
        	previewTax:			previewTax,
        	saveRecord: 		previewTaxSR
    		};
    
});
