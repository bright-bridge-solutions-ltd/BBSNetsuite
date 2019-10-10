/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/config', 'N/email', 'N/error', 'N/file', 'N/record', 'N/render', 'N/runtime', 'N/search'],
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
function(config, email, error, file, record, render, runtime, search) {
   
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
	    	
	    	//Only continue if we have a pdf template
	    	//
	    	if(pdfTemplateId != null && pdfTemplateId != '')
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
					    	var jsonSummary = buildJson();
					    	
					    	//Merge data with the template
					    	//
					    	var pdfFile = mergeTemplate(resultContractId, pdfTemplateId, jsonSummary);
					    	
					    	//Email the pdf to the customer
					    	//
					    	emailPdf(pdfFile, resultContractEmailAddress);
					    	
			    		}
			    	
	    		}
	    }


    //Function to email the pdf
    //
    function emailPdf(_pdfFile, _emailAddress)
    	{
    	
    	}
    
    //Function to search for prepayment invoices
    //
    function findPrePaymentInvoices(_contractId)
	    {
	    	var returnedResultSet = null;
	    	
	    	return returnedResultSet;
	    }
    
    //Function to find the total value of overage invoices
    //
    function findOverageInvoiceValue(_contractId)
	    {
	    	var returnedOverageValue = Number(0);
	    	
	    	return returnedOverageValue;
	    }
    
    //Function to find the contract period usage records
    //
    function findPeriodRecords(_contractId)
	    {
	    	var customrecord_bbs_contract_periodSearchObj = getResults(search.create({
	    		   type: "customrecord_bbs_contract_period",
	    		   filters:
	    		   [
	    		      ["custrecord_bbs_contract_period_contract","anyof",_contractId]
	    		   ],
	    		   columns:
	    		   [
	    		      search.createColumn({name: "custrecord_bbs_contract_period_period", label: "Contract Period"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_period_quarter", label: "Contract Quarter"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_period_end", label: "End Date"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_period_product", label: "Product"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_period_prod_use", label: "Product Usage"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_period_quantity", label: "Quantity Used"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_period_qu_end", label: "Quarterly Period - End Date"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_period_rate", label: "Rate"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_period_start", label: "Start Date"})
	    		   ]
	    		}));
    		
	    	
	    }
    
    //Merge the pdf template with the data elements
    //
    function mergeTemplate(_contractId, _pdfTemplateId, _jsonSummary)
    	{
    		var contractRecord = null;
    		var pdfFile = null;
    		
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
    										value:				JSON.stringify(_jsonSummary),
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

    
    //Return the function definitions back to Netsuite
    //
    return {
        	getInputData: 	getInputData,
        	map: 			map
    		};
    
});
