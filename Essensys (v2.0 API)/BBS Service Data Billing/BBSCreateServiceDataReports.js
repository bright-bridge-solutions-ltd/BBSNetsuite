/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/file'],
/**
 * @param {file} file
 * @param {search} search
 */
function(runtime, search, file) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	// retrieve script parameters
    	var currentScript = runtime.getCurrentScript();
    	
    	// script parameters are global variables so can be accessed throughout the script
    	fileCabinetFolder = currentScript.getParameter({
        	name: 'custscript_bbs_service_data_bill_folder'
        });
    	
    	subsidiary = currentScript.getParameter({
    		name: 'custscript_bbs_subsidiary_select'
    	});
    	
    	// set the date of the report
    	var reportDate = new Date();
    	reportDate.setDate(1); // set date to be the first day of the current month
    	
    	// format the report date in the following format YYYY-MM-DD
    	reportDate = reportDate.format('ymd');
    	
    	// call functions to create CSV reports
    	createSummaryTenantChargesReport(reportDate);
    	createTenantChargesReport(reportDate);
    	createConsolidatedTenantsReport(reportDate);
    	createConsolidatedSummaryTenantChargesReport(reportDate);
    	
    	log.audit({
    		title: '*** END OF SCRIPT ***'
    	});

    }

    
    // ===============================
    // FUNCTIONS TO CREATE CSV REPORTS
    // ===============================
    
    function createSummaryTenantChargesReport(reportDate)
    	{
	    	log.audit({
	    		title: 'CREATING SUMMARY TENANT CHARGES REPORT'
	    	});
    	
    		// specify the file name
			var fileName = reportDate + '_summarytenantcharges.csv';
    	
    		// start off the CSV
			var CSV = '"ClientID","ClientAmount","OperatorAmount","Margin","ClientName","StartDateTime","EndDateTime","Site","BillingRef","LinkInvoiceYear","LinkInvoiceMonth"\r\n';
			
			// create search to find service data records to be included in the report
			var serviceDataSearch = search.create({
				type: 'customrecord_bbs_service_data',
				
				filters: [{
	    			name: 'subsidiary',
	    			join: 'custrecord_bbs_service_data_customer_rec',
	    			operator: 'anyof',
	    			values: [subsidiary]
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_start_date',
	    			operator: 'notafter',
	    			values: ['lastmonth'] // lastmonth means end of last month
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_end_date',
	    			operator: 'notbefore',
	    			values: ['startoflastmonth']
	    		}],
	    		
	    		columns: [{
	    			name: 'custrecord_bbs_service_data_tenant_alias',
	    			label: 'ClientID'
	    		},
	    				{
	    			name: 'formulacurrency',
	    			formula: "ROUND(CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_sales_price} END END END, 2) * {custrecord_bbs_service_data_quantity}",
	    			label: 'ClientAmount'
	    		},
	    				{
	    			name: 'formulacurrency',
	    			formula: "ROUND(CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_op_cost} END END END, 2) * {custrecord_bbs_service_data_quantity}",
	    			label: 'OperatorAmount'
	    		},
	    				{
	    			name: 'formulacurrency',
	    			formula: "(ROUND(CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_sales_price} END END END, 2) * {custrecord_bbs_service_data_quantity}) - (ROUND(CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_op_cost} END END END, 2) * {custrecord_bbs_service_data_quantity})",
	    			label: 'Margin'
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_tenant_name',
	    			label: 'ClientName'
	    		},
	    				{
	    			name: 'formuladate',
	    			formula: "CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_start_date} ELSE LAST_DAY(ADD_MONTHS({today},-2))+1 END",
	    			label: 'StartDateTime'
	    		},
	    				{
	    			name: 'formuladate',
	    			formula: "CASE WHEN TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_end_date} ELSE LAST_DAY(ADD_MONTHS({today}, -1)) END",
	    			label: 'EndDateTime'
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_site_name',
	    			label: 'Site'
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_site_alias',
	    			label: 'BillingRef'
	    		},
	    				{
	    			name: 'formulatext',
	    			formula: "TO_CHAR({today},'YYYY')",
	    			label: 'LinkInvoiceYear'
	    		},
	    				{
	    			name: 'formulatext',
	    			formula: "TO_CHAR({today},'MM') - 1",
	    			label: 'LinkInvoiceMonth'
	    		}],
				
			});
			
			// run search and process results
			serviceDataSearch.run().each(function(result){
				
				// retrieve search results. Using column numbers to return formula values
				var clientID = result.getValue(result.columns[0]);
				var clientAmount = result.getValue(result.columns[1]);
				var operatorAmount = result.getValue(result.columns[2]);
				var margin = result.getValue(result.columns[3]);
				var clientName = result.getValue(result.columns[4]);			
				var startDateTime = result.getValue(result.columns[5]);
				var endDateTime = result.getValue(result.columns[6]);
				var site = result.getValue(result.columns[7]);
				var billingRef = result.getValue(result.columns[8]);
				var linkInvoiceYear = result.getValue(result.columns[9]);
				var linkInvoiceMonth = result.getValue(result.columns[10]);
				
				// add the service data record details to the CSV
    			CSV += clientID + ',' + clientAmount + ',' + operatorAmount + ',' + margin + ',' + clientName + ',' + startDateTime + ',' + endDateTime + ',' + site + ',' + billingRef + ',' + linkInvoiceYear + ',' + linkInvoiceMonth;
    			CSV += '\r\n';
    			
    			// continue processing search results
    			return true;
				
			});
			
			// call function to create the CSV file
			createCSV(fileName, CSV);
    	}
    
    function createTenantChargesReport(reportDate)
    	{
	    	log.audit({
	    		title: 'CREATING TENANT CHARGES REPORT'
	    	});
    	
    		// specify the file name
    		var fileName = reportDate + '_tenantcharges.csv';
    		
    		// start off the CSV
    		var CSV = '"Quantity","Telephone","AccountCode","Product","Type","Due","UnitCost","Discount","Cost"\r\n';
    		
    		// create search to find service data records to be included in the report
    		var serviceDataSearch = search.create({
    			type: 'customrecord_bbs_service_data',
    			
    			filters: [{
	    			name: 'subsidiary',
	    			join: 'custrecord_bbs_service_data_customer_rec',
	    			operator: 'anyof',
	    			values: [subsidiary]
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_start_date',
	    			operator: 'notafter',
	    			values: ['lastmonth'] // lastmonth means end of last month
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_end_date',
	    			operator: 'notbefore',
	    			values: ['startoflastmonth']
	    		}],
	    		
	    		columns: [{
	    			name: 'custrecord_bbs_service_data_quantity',
	    			summary: 'SUM'
	    		},
	    				{
	    			name: 'formulatext',
	    			formula: "CONCAT({custrecord_bbs_service_data_tenant_name},CONCAT('/',{custrecord_bbs_service_data_tenant_alias}))",
	    			summary: 'GROUP'
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_parent_prod',
	    			summary: 'GROUP'
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_sales_price',
	    			summary: 'MAX'
	    		},
	    				{
	    			name: 'formulacurrency',
	    			formula: "SUM({custrecord_bbs_service_data_quantity}) * MAX({custrecord_bbs_service_data_sales_price})",
	    			summary: 'MAX'
	    		}],
    			
    		});
    		
    		// run search and process results
    		serviceDataSearch.run().each(function(result){
    			
    			// retrieve search results
    			var quantity = result.getValue({
    				name: 'custrecord_bbs_service_data_quantity',
    				summary: 'SUM'
    			});
    			
    			var accountCode = result.getValue({
    				name: 'formulatext',
    				summary: 'GROUP'
    			});
    			
    			var product = result.getValue({
    				name: 'custrecord_bbs_service_data_parent_prod',
    				summary: 'GROUP'
    			});
    			
    			var unitCost = result.getValue({
    				name: 'custrecord_bbs_service_data_sales_price',
    				summary: 'MAX'
    			});
    			
    			var cost = result.getValue({
    				name: 'formulacurrency',
    				summary: 'MAX'
    			});
    			
    			// add the service data record details to the CSV
    			CSV += quantity + ',' + ',' + accountCode + ',' + product + ',' + ',' + ',' + unitCost + ',' + 0 + ',' + cost;
    			CSV += '\r\n';
    			
    			// continue processing search results
    			return true;
     			
    		});
    		
    		// call function to create the CSV file
			createCSV(fileName, CSV);
    		
    	}
    
    function createConsolidatedTenantsReport(reportDate)
    	{
	    	log.audit({
	    		title: 'CREATING CONSOLIDATED TENANTS REPORT'
	    	});
    		
    		// create search to find service data customers to create a report for
    		var serviceDataCustomerSearch = search.create({
    			type: 'customrecord_bbs_service_data',
    			
	    		filters: [{
	    			name: 'subsidiary',
	    			join: 'custrecord_bbs_service_data_customer_rec',
	    			operator: 'anyof',
	    			values: [subsidiary]
	    		},
		    			{
		    		name: 'custrecord_bbs_service_data_start_date',
		    		operator: 'notafter',
		    		values: ['lastmonth'] // lastmonth means end of last month
		    	},
		    			{
		    		name: 'custrecord_bbs_service_data_end_date',
		    		operator: 'notbefore',
		    		values: ['startoflastmonth']
		    	}],
		    	
		    	columns: [{
		    		name: 'custrecord_bbs_service_data_customer_rec',
		    		summary: 'GROUP'	
		    	}],
    		});
    		
    		// run search and process results
    		serviceDataCustomerSearch.run().each(function(result){
    			
    			// start off the CSV
        		var CSV = '"ClientID","ClientAmount","TenantAmount","Margin","ClientName","StartDateTime","EndDateTime","Site","BillingRef"\r\n';
    			
    			// get the customer name and ID from the search results
    			var customerID = result.getValue({
    				name: 'custrecord_bbs_service_data_customer_rec',
    				summary: 'GROUP'
    			});
    			
    			var customerName = result.getText({
    				name: 'custrecord_bbs_service_data_customer_rec',
    				summary: 'GROUP'
    			});
    			
    			// create search to find service data records to be included in the report
    			var serviceDataSearch = search.create({
    				type: 'customrecord_bbs_service_data',
    				
    				filters: [{
    		    		name: 'custrecord_bbs_service_data_customer_rec',
    		    		operator: 'anyof',
    		    		values: [customerID]
    		    	},
    		    			{
    		    		name: 'custrecord_bbs_service_data_start_date',
    		    		operator: 'notafter',
    		    		values: ['lastmonth'] // lastmonth means end of last month
    		    	},
    		    			{
    		    		name: 'custrecord_bbs_service_data_end_date',
    		    		operator: 'notbefore',
    		    		values: ['startoflastmonth']
    		    	}],
    		    	
    		    	columns: [{
    		    		name: 'custrecord_bbs_service_data_tenant_alias',
    		    		summary: 'GROUP'
    		    	},
    		    			{
    	    			name: 'formulacurrency',
    	    			formula: "ROUND(CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_sales_price} END END END, 2) * {custrecord_bbs_service_data_quantity}",
    	    			summary: 'SUM'
    	    		},
    	    				{
    	    			name: 'formulacurrency',
    	    			formula: "ROUND(CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_op_cost} END END END, 2) * {custrecord_bbs_service_data_quantity}",
    	    			summary: 'SUM'
    	    		},
    	    				{
    	    			name: 'formulacurrency',
    	    			formula: "(ROUND(CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_sales_price} END END END, 2) * {custrecord_bbs_service_data_quantity}) - (ROUND(CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_op_cost} END END END, 2) * {custrecord_bbs_service_data_quantity})",
    	    			summary: 'SUM'
    	    		},
    	    				{
    	    			name: 'custrecord_bbs_service_data_tenant_name',
    	    			summary: 'MAX'
    	    		},
    	    				{
    	    			name: 'formuladate',
    	    			formula: "LAST_DAY(ADD_MONTHS({today},-2))+1",
    	    			summary: 'MAX'
    	    		},
    	    				{
    	    			name: 'formuladate',
    	    			formula: "LAST_DAY(ADD_MONTHS({today},-1))",
    	    			summary: 'MAX'
    	    		},
    	    				{
    	    			name: 'custrecord_bbs_service_data_site_name',
    	    			summary: 'MAX',
        		    	sort: search.Sort.ASC
    	    		},
    	    				{
    	    			name: 'custrecord_bbs_service_data_billing_ref',
    	    			summary: 'MAX'
    	    		}],
    				
    			});
    			
    			// run search and process results
    			serviceDataSearch.run().each(function(result){
    				
    				// retrieve search results. Using column numbers to return formula values
    				var clientID = result.getValue(result.columns[0]);
    				var clientAmount = result.getValue(result.columns[1]);
    				var operatorAmount = result.getValue(result.columns[2]);
    				var margin = result.getValue(result.columns[3]);
    				var clientName = result.getValue(result.columns[4]);			
    				var startDateTime = result.getValue(result.columns[5]);
    				var endDateTime = result.getValue(result.columns[6]);
    				var site = result.getValue(result.columns[7]);
    				var billingRef = result.getValue(result.columns[8]);
    				
    				// add the service data record details to the CSV
        			CSV += clientID + ',' + clientAmount + ',' + operatorAmount + ',' + margin + ',' + clientName + ',' + startDateTime + ',' + endDateTime + ',' + site + ',' + billingRef;
        			CSV += '\r\n';
    				
    				// continue processing additional results
    				return true;
    				
    			});
    			
    			// specify the file name
    			var fileName = reportDate + '_consolidated_tenants_' + customerName + '.csv';
    			
    			// call function to create the CSV file
    			createCSV(fileName, CSV);
    			
    			// continue processing additional results
    			return true;
    			
    		});		
    		
    	}
    
    function createConsolidatedSummaryTenantChargesReport(reportDate)
		{
	    	log.audit({
	    		title: 'CREATING CONSOLIDATED SUMMARY TENANTS REPORT'
	    	});
    	
    		// specify the file name
    		var fileName = reportDate + '_consolidatedsummarytenantcharges.csv';
    	
    		// start off the CSV
			var CSV = '"ClientID","ClientAmount","OperatorAmount","Margin","ClientName","StartDateTime","EndDateTime","Site","BillingRef","LinkInvoiceYear","LinkInvoiceMonth"\r\n';
			
			// create search to find service data records to be included in the report
			var serviceDataSearch = search.create({
				type: 'customrecord_bbs_service_data',
				
				filters: [{
	    			name: 'subsidiary',
	    			join: 'custrecord_bbs_service_data_customer_rec',
	    			operator: 'anyof',
	    			values: [subsidiary]
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_start_date',
	    			operator: 'notafter',
	    			values: ['lastmonth'] // lastmonth means end of last month
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_end_date',
	    			operator: 'notbefore',
	    			values: ['startoflastmonth']
	    		}],
	    		
	    		columns: [{
	    			name: 'custrecord_bbs_service_data_tenant_alias',
	    			label: 'ClientID'
	    		},
	    				{
	    			name: 'formulacurrency',
	    			formula: "ROUND(CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_sales_price} END END END, 2) * {custrecord_bbs_service_data_quantity}",
	    			label: 'ClientAmount'
	    		},
	    				{
	    			name: 'formulacurrency',
	    			formula: "ROUND(CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_op_cost} END END END, 2) * {custrecord_bbs_service_data_quantity}",
	    			label: 'OperatorAmount'
	    		},
	    				{
	    			name: 'formulacurrency',
	    			formula: "(ROUND(CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_sales_price} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_sales_price} END END END, 2) * {custrecord_bbs_service_data_quantity}) - (ROUND(CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * (TO_CHAR({custrecord_bbs_service_data_end_date},'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD')) - 1 ELSE CASE WHEN {custrecord_bbs_service_data_end_date} IS NOT NULL AND TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_end_date}),'DD') * TO_CHAR({custrecord_bbs_service_data_end_date},'DD') ELSE CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') -1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN ({custrecord_bbs_service_data_op_cost} / TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD')) * (TO_CHAR(LAST_DAY({custrecord_bbs_service_data_start_date}),'DD') - TO_CHAR({custrecord_bbs_service_data_start_date},'DD') +1) ELSE {custrecord_bbs_service_data_op_cost} END END END, 2) * {custrecord_bbs_service_data_quantity})",
	    			label: 'Margin'
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_tenant_name',
	    			label: 'ClientName'
	    		},
	    				{
	    			name: 'formuladate',
	    			formula: "CASE WHEN TO_CHAR({custrecord_bbs_service_data_start_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_start_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_start_date} ELSE LAST_DAY(ADD_MONTHS({today},-2))+1 END",
	    			label: 'StartDateTime'
	    		},
	    				{
	    			name: 'formuladate',
	    			formula: "CASE WHEN TO_CHAR({custrecord_bbs_service_data_end_date},'MM') = TO_CHAR({today},'MM') - 1 AND TO_CHAR({custrecord_bbs_service_data_end_date},'YYYY') = TO_CHAR({today},'YYYY') THEN {custrecord_bbs_service_data_end_date} ELSE LAST_DAY(ADD_MONTHS({today}, -1)) END",
	    			label: 'EndDateTime'
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_site_name',
	    			label: 'Site'
	    		},
	    				{
	    			name: 'custrecord_bbs_service_data_site_alias',
	    			label: 'BillingRef'
	    		},
	    				{
	    			name: 'formulatext',
	    			formula: "TO_CHAR({today},'YYYY')",
	    			label: 'LinkInvoiceYear'
	    		},
	    				{
	    			name: 'formulatext',
	    			formula: "TO_CHAR({today},'MM') - 1",
	    			label: 'LinkInvoiceMonth'
	    		}],
				
			});
			
			// run search and process results
			serviceDataSearch.run().each(function(result){
				
				// retrieve search results. Using column numbers to return formula values
				var clientID = result.getValue(result.columns[0]);
				var clientAmount = result.getValue(result.columns[1]);
				var operatorAmount = result.getValue(result.columns[2]);
				var margin = result.getValue(result.columns[3]);
				var clientName = result.getValue(result.columns[4]);			
				var startDateTime = result.getValue(result.columns[5]);
				var endDateTime = result.getValue(result.columns[6]);
				var site = result.getValue(result.columns[7]);
				var billingRef = result.getValue(result.columns[8]);
				var linkInvoiceYear = result.getValue(result.columns[9]);
				var linkInvoiceMonth = result.getValue(result.columns[10]);
				
				// add the service data record details to the CSV
    			CSV += clientID + ',' + clientAmount + ',' + operatorAmount + ',' + margin + ',' + clientName + ',' + startDateTime + ',' + endDateTime + ',' + site + ',' + billingRef + ',' + linkInvoiceYear + ',' + linkInvoiceMonth;
    			CSV += '\r\n';
    			
    			// continue processing search results
    			return true;
				
			});
			
			// call function to create the CSV file
			createCSV(fileName, CSV);
			
		}
    
    // ===============================
    // FUNCTION TO CREATE THE CSV FILE
    // ===============================
    
    function createCSV(fileName, fileContents)
    	{
	    	try
	    		{
		    		// create a CSV file
			    	var csvFile = file.create({
			    		fileType: file.Type.CSV,
			    		name: fileName,
			    		contents: fileContents,
			    		folder: fileCabinetFolder
			    	});
			    	
			    	// save the file
			    	var fileID = csvFile.save();
	    	
			    	log.audit({
			    		title: 'CSV File Saved',
			    		details: 'File ID: ' + fileID
			    	});
	    		}
	    	catch(e)
	    		{
	    			log.error({
	    				title: 'Error Creating CSV',
	    				details: 'Error: ' + e
	    			});
	    		}
    	}
    
    //=============================================================================================
	//Prototypes
	//=============================================================================================
	//
	
	//Date & time formatting prototype 
	//
	(function() {

		Date.shortMonths = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
		Date.longMonths = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
		Date.shortDays = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
		Date.longDays = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];

		// defining patterns
		var replaceChars = {
		// Day
		d : function() {
			return (this.getDate() < 10 ? '0' : '') + this.getDate();
		},
		D : function() {
			return Date.shortDays[this.getDay()];
		},
		j : function() {
			return this.getDate();
		},
		l : function() {
			return Date.longDays[this.getDay()];
		},
		N : function() {
			return (this.getDay() == 0 ? 7 : this.getDay());
		},
		S : function() {
			return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 == 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() != 13 ? 'rd' : 'th')));
		},
		w : function() {
			return this.getDay();
		},
		z : function() {
			var d = new Date(this.getFullYear(), 0, 1);
			return Math.ceil((this - d) / 86400000);
		}, // Fixed now
		// Week
		W : function() {
			var target = new Date(this.valueOf());
			var dayNr = (this.getDay() + 6) % 7;
			target.setDate(target.getDate() - dayNr + 3);
			var firstThursday = target.valueOf();
			target.setMonth(0, 1);
			if (target.getDay() !== 4) {
				target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
			}
			var retVal = 1 + Math.ceil((firstThursday - target) / 604800000);

			return (retVal < 10 ? '0' + retVal : retVal);
		},
		// Month
		F : function() {
			return Date.longMonths[this.getMonth()];
		},
		m : function() {
			return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1);
		},
		M : function() {
			return Date.shortMonths[this.getMonth()];
		},
		n : function() {
			return this.getMonth() + 1;
		},
		t : function() {
			var year = this.getFullYear(), nextMonth = this.getMonth() + 1;
			if (nextMonth === 12) {
				year = year++;
				nextMonth = 0;
			}
			return new Date(year, nextMonth, 0).getDate();
		},
		// Year
		L : function() {
			var year = this.getFullYear();
			return (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0));
		}, // Fixed now
		o : function() {
			var d = new Date(this.valueOf());
			d.setDate(d.getDate() - ((this.getDay() + 6) % 7) + 3);
			return d.getFullYear();
		}, //Fixed now
		Y : function() {
			return this.getFullYear();
		},
		y : function() {
			return ('' + this.getFullYear()).substr(2);
		},
		// Time
		a : function() {
			return this.getHours() < 12 ? 'am' : 'pm';
		},
		A : function() {
			return this.getHours() < 12 ? 'AM' : 'PM';
		},
		B : function() {
			return Math.floor((((this.getUTCHours() + 1) % 24) + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24);
		}, // Fixed now
		g : function() {
			return this.getHours() % 12 || 12;
		},
		G : function() {
			return this.getHours();
		},
		h : function() {
			return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12);
		},
		H : function() {
			return (this.getHours() < 10 ? '0' : '') + this.getHours();
		},
		i : function() {
			return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes();
		},
		s : function() {
			return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds();
		},
		u : function() {
			var m = this.getMilliseconds();
			return (m < 10 ? '00' : (m < 100 ? '0' : '')) + m;
		},
		// Timezone
		e : function() {
			return /\((.*)\)/.exec(new Date().toString())[1];
		},
		I : function() {
			var DST = null;
			for (var i = 0; i < 12; ++i) {
				var d = new Date(this.getFullYear(), i, 1);
				var offset = d.getTimezoneOffset();

				if (DST === null)
					DST = offset;
				else
					if (offset < DST) {
						DST = offset;
						break;
					}
					else
						if (offset > DST)
							break;
			}
			return (this.getTimezoneOffset() == DST) | 0;
		},
		O : function() {
			return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + Math.floor(Math.abs(this.getTimezoneOffset() / 60)) + (Math.abs(this.getTimezoneOffset() % 60) == 0 ? '00' : ((Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '')) + (Math
					.abs(this.getTimezoneOffset() % 60)));
		},
		P : function() {
			return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + Math.floor(Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) == 0 ? '00' : ((Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '')) + (Math
					.abs(this.getTimezoneOffset() % 60)));
		}, // Fixed now
		T : function() {
			return this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1');
		},
		Z : function() {
			return -this.getTimezoneOffset() * 60;
		},
		// Full Date/Time
		c : function() {
			return this.format("Y-m-d\\TH:i:sP");
		}, // Fixed now
		r : function() {
			return this.toString();
		},
		U : function() {
			return this.getTime() / 1000;
		}
		};

		// Simulates PHP's date function
		Date.prototype.format = function(format) {
			var date = this;
			return format.replace(/(\\?)(.)/g, function(_, esc, chr) {
				return (esc === '' && replaceChars[chr]) ? replaceChars[chr].call(date) : chr;
			});
		};

	}).call(this);    
    
    return {
        execute: execute
    };
    
});
