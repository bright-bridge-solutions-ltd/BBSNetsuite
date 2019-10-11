/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/config', 'N/email', 'N/error', 'N/file', 'N/record', 'N/render', 'N/runtime', 'N/search','N/format'],
/**
 * @param {config} config
 * @param {email} email
 * @param {error} error
 * @param {file} file
 * @param {record} record
 * @param {render} render
 * @param {runtime} runtime
 * @param {search} search
 */
function(config, email, error, file, record, render, runtime, search, format) {
   
	//Enumerations
	//
	var invoiceType = {};
	invoiceType.SETUP_FEE = 1;
	invoiceType.MONTHLY_MANAGEMENT_FEE = 2;
	invoiceType.PREPAYMENT = 3;
	invoiceType.OVERAGE = 4;
	invoiceType.USAGE = 5;
	
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() 
	    {
	    	//Get script parameter
	    	//
	    	var contracts = runtime.getCurrentScript().getParameter({name: 'custscript_contract_array'});
	    	
	    	//Debug logging
	    	//
	    	log.debug({
						title: 		'JSON String',
						details: 	contracts
						});
			   
	    	//Convert string to object
	    	//
	    	var contractArray = JSON.parse(contracts);
	    	
	    	//Search contracts based on passed in internal id's
	    	//
	    	return search.create({
	    		   type: "customrecord_bbs_contract",
	    		   filters:
	    		   [
	    		      ["internalid","anyof",contractArray]
	    		   ],
	    		   columns:
	    		   [
	    		      search.createColumn({name: "name", label: "Contract Name"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_billing_level", label: "Billing Level"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_billing_type", label: "Billing Type"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_end_date", label: "Contract End Date"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_start_date", label: "Contract Start Date"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_term", label: "Contract Term in Months"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_currency", label: "Currency"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_customer", label: "Customer"}),
	    		      search.createColumn({name: "created", label: "Date Created"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_min_ann_use", label: "Minimum Annual Usage"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_mon_min_use", label: "Minimum Monthly Usage"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_qu_min_use", label: "Minimum Quarterly Usage"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_mgmt_fee_amt", label: "Monthly Management Fee Amount"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_setup_fee_amount", label: "Setup Fee Amount"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_status", label: "Status"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_total_usage", label: "Total Contract Usage - To Date"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_annual_commit", label: "Annual Commitment"}),
	    		      search.createColumn({name: "custentity_bbs_usage_statement_email",join: "CUSTRECORD_BBS_CONTRACT_CUSTOMER",label: "Email Address For Usage Statement"})
	    		   ]
	    		});
	    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) 
	    {
	    	//Get the id of the pdf template for the usage statement
	    	//
	    	var pdfTemplateId = runtime.getCurrentScript().getParameter({name: 'custscript_pdf_template_id'});
	    	var emailTemplateId = runtime.getCurrentScript().getParameter({name: 'custscript_bbs_usage_email_template'});
	    	var attachmentsFolderId = runtime.getCurrentScript().getParameter({name: 'custscript_bbs_attachments_folder'});
	    	
	    	//Only continue if we have a pdf & email template
	    	//
	    	if(pdfTemplateId != null && pdfTemplateId != '' && emailTemplateId != null && emailTemplateId != '')
	    		{
			    	//Convert the value to a result set
			    	//
			    	result = JSON.parse(context.value);
			    	
			    	//Get the results
			    	//
			    	var resultBillingLevel 					= result.getText({name: "custrecord_bbs_contract_billing_level"});
			    	var resultBillingType					= result.getText({name: "custrecord_bbs_contract_billing_type"});
			    	var resultContractEndDate 				= result.getValue({name: "custrecord_bbs_contract_end_date"});
			    	var resultContractStartDate 			= result.getValue({name: "custrecord_bbs_contract_start_date"});
			    	var resultContractTerm 					= result.getValue({name: "custrecord_bbs_contract_term"});
			    	var resultContractCurrency 				= result.getText({name: "custrecord_bbs_contract_currency"});
			    	var resultContractCustomer 				= result.getText({name: "custrecord_bbs_contract_customer"});
			    	var resultContractMinAnnualUsage		= Number(result.getValue({name: "custrecord_bbs_contract_min_ann_use"}));
			    	var resultContractMinMonthlyUsage 		= Number(result.getValue({name: "custrecord_bbs_contract_mon_min_use"}));
			    	var resultContractMinQuarterlyUsage 	= Number(result.getValue({name: "custrecord_bbs_contract_qu_min_use"}));
			    	var resultContractManagementFee 		= Number(result.getValue({name: "custrecord_bbs_contract_mgmt_fee_amt"}));
			    	var resultContractSetupFee 				= Number(result.getValue({name: "custrecord_bbs_contract_setup_fee_amount"}));
			    	var resultContractStatus 				= result.getText({name: "custrecord_bbs_contract_status"});
			    	var resultContractTotalUsage 			= Number(result.getValue({name: "custrecord_bbs_contract_total_usage"}));
			    	var resultContractId					= result.id;
			    	var resultContractName					= result.getValue({name: "name"});
			    	var resultContractMinAnnualCommitment	= Number(result.getValue({name: "custrecord_bbs_contract_annual_commit"}));
			    	var resultContractEmailAddress			= result.getValue({name: "custentity_bbs_usage_statement_email", join: "CUSTRECORD_BBS_CONTRACT_CUSTOMER"});
			    	
			    	//Only carry on if we have an email address
			    	//
			    	if(resultContractEmailAddress != null && resultContractEmailAddress != '')
			    		{
					    	//Get the pre-payments
					    	//
					    	var prePayments = findPrePaymentInvoices(resultContractId);
					    	
					    	//Get the overage value
					    	//
					    	var overageValue = findOverageInvoiceValue(resultContractId);
					    	
					    	//Get the period usage data for the contract
					    	//
					    	var periodRecords = findPeriodRecords(resultContractId);
					    	
					    	//Build a JSON string to hold the summary data for the template
					    	//
					    	var jsonSummary = buildJson(periodRecords, prePayments, overageValue);
					    	
					    	//Merge data with the template
					    	//
					    	var pdfFile = mergeTemplate(resultContractId, pdfTemplateId, jsonSummary);
					    	
					    	//Email the pdf to the customer
					    	//
					    	emailPdf(pdfFile, resultContractEmailAddress, resultContractId, emailTemplateId);
					    	
					    	//Save file to the filing cabinet 
					    	//
					    	savePdf(pdfFile, resultContractId, attachmentsFolderId);
			    		}
	    		}
	    }


    //Function to save the PDF to the filking cabinet
    //
    function savePdf(_pdfFile, _resultContractId, _attachmentsFolderId)
	    {
    		var fileId = null;
    		
	    	//Set the folder
			//
    		_pdfFile.folder = _attachmentsFolderId;
		
	    	//Try to save the file to the filing cabinet
			//
			try
				{
					fileId = _pdfFile.save();
				}
			catch(err)
				{
					log.error({
								title: 'Error Saving PDF To File Cabinet ' + attachmentsFolder,
								details: error
								});
					
					fileId = null;
				}
	    }
    
    //Function to build the JSON string from the period usage records
    //
    function buildJson(_periodRecords, _prePayments, _overageValue)
	    {
	    	var returnedJson = '';
	    	var summaryTotal = Number(0);
	    	
	    	//Initialise the summary object
	    	//
	    	var summaryObject = new usageSummaryObject();
	    	
	    	//Process the prepayments
	    	//
	    	if(_prePayments != null && _prePayments.length > 0)
	    		{
	    			for(int = 0; int < _prePayments.length && int < 4; int++)
	    				{
	    					var amount = Number(_prePayments[int].getValue({name: 'amount'}));
	    					summaryObject.invoiceSummary[int].value = format.format({value: amount, type: format.Type.CURRENCY});
	    					summaryTotal += amount;
	    				}
	    		}
	    	
	    	//Process overages
	    	//
	    	if(_overageValue != null && _overageValue != '')
	    		{
	    			var ovarge = Number(_overageValue);
	    			summaryObject.invoiceSummary[4].value = format.format({value: ovarge, type: format.Type.CURRENCY});
	    			summaryTotal += overage;
	    		}
	    	
	    	//Process the overall total of prepayments & overages
	    	//
	    	summaryObject.invoiceSummary[5].value = format.format({value: summaryTotal, type: format.Type.CURRENCY});
	    	
	    	//Process the period records
	    	//
	    	if(_periodRecords != null && _periodRecords.length > 0)
	    		{
	    			for (var int = 0; int < array.length; int++) 
		    			{
	    					var product = _periodRecords[int]getText({name: "custrecord_bbs_contract_period_product"});
	    					var endDate = _periodRecords[int]getValue({name: "custrecord_bbs_contract_period_end"});
	    					var startDate = _periodRecords[int]getValue({name: "custrecord_bbs_contract_period_start"});
	    					var usage = _periodRecords[int]getValue({name: "custrecord_bbs_contract_period_prod_use"});
	    					var quantity = _periodRecords[int]getValue({name: "custrecord_bbs_contract_period_quantity"});
	    					var rate = _periodRecords[int]getValue({name: "custrecord_bbs_contract_period_rate"});
	    					
	    					summaryObject.periodSummary.push();
						}
	    		}
	    	
	    	
	    	//Convert the object to a string
	    	//
	    	returnedJson = JSON.stringify(summaryObject);
	    	
	    	return returnedJson;
	    }
    
    //Function to email the pdf
    //
    function emailPdf(_pdfFile, _emailAddress, _contractId, _emailTemplateId)
    	{
	    	//Build up the attachments array
			//
			var emailAttachments = [_pdfFile];

			//Create an email merger
			//
			var mergeResult = render.mergeEmail({
		    								    templateId: 	_emailTemplateId,
		    								    customRecord: 	{
					    								        	type: 'customrecord_bbs_contract',
					    								        	id: Number(_contractId)
					    								        }
		    								    });
			
			//Was the merge ok?
			//
			if(mergeResult != null)
				{
					//Get the body & subject from the merge to pass on to the email
					//
					var emailSubject = mergeResult.subject;
					var emailBody = mergeResult.body;
					
					//Send the email
					//
					try
						{
							email.send({
										author: 		runtime.getCurrentUser().id,
										recipients:		_emailAddress,
										subject:		emailSubject,
										body:			emailBody,
										attachments:	emailAttachments
										})		
							
						}
					catch(err)
						{
							log.debug({
									    title: 'Error sending email', 
									    details: err.message
									    });
						}
				}
	
    	}
    
    //Function to search for prepayment invoices
    //
    function findPrePaymentInvoices(_contractId)
	    {
	    	var returnedResultSet = null;
	    	
	    	var invoiceSearchObj = getResults(search.create({
	    		   type: "invoice",
	    		   filters:
	    		   [
	    		      ["type","anyof","CustInvc"], 
	    		      "AND", 
	    		      ["mainline","is","T"], 
	    		      "AND", 
	    		      ["custbody_bbs_invoice_type","anyof",invoiceType.PREPAYMENT], 
	    		      "AND", 
	    		      ["custbody_bbs_contract_record","anyof",_contractId]
	    		   ],
	    		   columns:
	    		   [
	    		      search.createColumn({name: "datecreated", label: "Date Created", sort: search.Sort.ASC}),
	    		      search.createColumn({name: "tranid", 		label: "Document Number"}),
	    		      search.createColumn({name: "amount", 		label: "Amount"})
	    		   ]
	    		}));
	    		
	    	return returnedResultSet = invoiceSearchObj;
	    }
    
    //Function to find the total value of overage invoices
    //
    function findOverageInvoiceValue(_contractId)
	    {
	    	var returnedOverageValue = Number(0);
	    	
	    	var searchResult = getResults(search.create({
	    		   type: "invoice",
	    		   filters:
	    		   [
	    		      ["type","anyof","CustInvc"], 
	    		      "AND", 
	    		      ["mainline","is","T"], 
	    		      "AND", 
	    		      ["custbody_bbs_invoice_type","anyof",invoiceType.OVERAGE], 
	    		      "AND", 
	    		      ["custbody_bbs_contract_record","anyof",_contractId]
	    		   ],
	    		   columns:
	    		   [
	    		      search.createColumn({
					    		         name: 		"amount",
					    		         summary: 	"SUM",
					    		         label: 	"Amount"
	    		      					})
	    		   ]
	    		}));
	    		
	    	if(searchResult != null && searchResult.length > 0)
	    		{
		    		returnedOverageValue = Number(searchResult[0].getValue({
		    														name: 		"amount",
		    														summary: 	"SUM"
		    														}));
	    		}
	    	
	    	return returnedOverageValue;
	    }
    
    //Function to find the contract period usage records
    //
    function findPeriodRecords(_contractId)
	    {
    		var returnedResultSet = null;
    	
	    	var customrecord_bbs_contract_periodSearchObj = getResults(search.create({
	    		   type: "customrecord_bbs_contract_period",
	    		   filters:
	    		   [
	    		      ["custrecord_bbs_contract_period_contract","anyof",_contractId]
	    		   ],
	    		   columns:
	    		   [
					  search.createColumn({name: "custrecord_bbs_contract_period_period", 	label: "Contract Period", sort: search.Sort.ASC}),
	    		      search.createColumn({name: "custrecord_bbs_contract_period_product", 	label: "Product", sort: search.Sort.ASC}),
	    		      search.createColumn({name: "custrecord_bbs_contract_period_quarter", 	label: "Contract Quarter"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_period_end", 		label: "End Date"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_period_prod_use", label: "Product Usage"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_period_quantity", label: "Quantity Used"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_period_qu_end", 	label: "Quarterly Period - End Date"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_period_rate", 	label: "Rate"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_period_start", 	label: "Start Date"})
	    		   ]
	    		}));
    		
	    	returnedResultSet = customrecord_bbs_contract_periodSearchObj;
	    	
	    	return returnedResultSet;
	    }
    
    //Merge the pdf template with the data elements
    //
    function mergeTemplate(_contractId, _pdfTemplateId, _jsonSummary)
    	{
    		var contractRecord = null;
    		var pdfFile = null;
    		
    		//Load the contract record
    		//
    		try
    			{
    				contractRecord = record.load({
    											type: 		'customrecord_bbs_contract', 
    											id: 		_contractId, 
    											isDynamic: 	true
    											});
    			}
    		catch(err)
    			{
    				contractRecord = null;
    			}
    		
    		if(contractRecord != null)
    			{
    				//Copy the json object into a temp field on the contract record
    				//
    				contractRecord.setValue({
    										fieldId:			'custrecord_bbs_contract_usage_json',
    										value:				_jsonSummary,
    										ignoreFieldChange:	true
    										});
    				
    				//Load the template file & get contents
    				//
    				var templateFile = null;
    				
    				try
    					{
    						templateFile = file.load({
    												id:		_pdfTemplateId
    												})	
    					}
    				catch(err)
    					{
    						templateFile = null;
    					}
    				
    				//Did the file load ok
    				//
    				if(templateFile != null)
    					{
    						//Get the contents
    						//
    						var templateContents = templateFile.getContents();
    						
    						//Create the renderer
    						//
    						var renderer = render.create();
    						renderer.templateContent = templateContents;
    						renderer.addRecord({
    											templateName:	'contract',
    											record:			contractRecord
    											});		
    						
    						//Render as PDF
    						//
    						try
    							{
    								pdfFile = renderer.renderAsPdf();
    							}
    						catch(err)
    							{
    								pdfFile = null;
    							}
    						
    					}
    			}
    		
    		return pdfFile;
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

    
    //Object to hold the summary info
    //
    function usageSummaryObject()
    	{
    		//Instantiate the invoice summary array
    		//
    		this.invoiceSummary = [];
    		this.invoiceSummary.push(new invoiceSummaryObject('Prepayment 1', 'N/A'));
    		this.invoiceSummary.push(new invoiceSummaryObject('Prepayment 2', 'N/A'));
    		this.invoiceSummary.push(new invoiceSummaryObject('Prepayment 3', 'N/A'));
    		this.invoiceSummary.push(new invoiceSummaryObject('Prepayment 4', 'N/A'));
    		this.invoiceSummary.push(new invoiceSummaryObject('Overages', 'N/A'));
    		this.invoiceSummary.push(new invoiceSummaryObject('Total', 'N/A'));
    		
    		//Instantiate the period summary
    		//
    		this.periodSummary = [];
    	}
    
    //Object to hold the period summary data
    //
    function periodSummaryObject(_start, _end)
    	{
    		this.periodStartDate = _start;
    		this.periodEndDate = _end;
    		this.productArray = [];
    	}
    //Object to hold the product details
    //
    function productDetails(_description, _value, _rate, _amount)
    	{
    		this.description = _description;
    		this.value = _value;
    		this.rate = _rate;
    		this.amount = _amout;
    	}
    
    //Object to hold the invoice summary data
    //
    function invoiceSummaryObject(_description, _value)
    	{
    		this.description = _description;
    		this.value =  _value;
    	}
    
    //Return the function definitions back to Netsuite
    //
    return {
        	getInputData: 	getInputData,
        	map: 			map
    		};
    
});
