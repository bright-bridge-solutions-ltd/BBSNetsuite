/**
* Copyright (c) 1998-2017 NetSuite, Inc. 2955 Campus Drive, Suite 100, San
* Mateo, CA, USA 94403-2511 All Rights Reserved.
* 
* This software is the confidential and proprietary information of NetSuite,
* Inc. ("Confidential Information"). You shall not disclose such Confidential
* Information and shall use it only in accordance with the terms of the license
* agreement you entered into with NetSuite.
*/

/**
* Module Description:
* 
* 
* 
* 
* Module Name
* 
* 
* Version Date Author Remarks 1.00 DEC 14, 2017 klatinak
* 
*/

/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/ui/serverWidget', 'N/search', 'N/format', 'N/task'],
/**
 * @param {runtime} runtime
 * @param {serverWidget} serverWidget
 * @param {search} search
 * @param {format} format
 */
function(runtime, ui, search, format, task) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	var request  = context.request;
	 	var response = context.response;
//get method of suitelet
//loading first form with class field to select	 	
	 	
	 	if (request.method == 'GET') {
            var form = ui.createForm({
                title: 'SELECT CLASS FOR PAYMENT RUN(S)'
            });
//add field with classification for invoices            
            var objInvoiceClass = form.addField({
                id: 'custpage_invoice_class', type: ui.FieldType.SELECT,
                source: 'classification', label: 'Invoice class'});
            objInvoiceClass.isMandatory = true;
            
            form.addField({
                id: 'custpage_customer', type: ui.FieldType.SELECT,
                source: 'customer', label: 'Store Name'});
            
            form.addField({id: 'custpage_epos', type: ui.FieldType.CHECKBOX, label: 'EPOS'});
            
//field for post method decision            
            var objFirstRun = form.addField({
                id: 'custpage_first_run', type: ui.FieldType.CHECKBOX, label: 'First run' });
            objFirstRun.updateDisplayType({ displayType: ui.FieldDisplayType.HIDDEN});
            objFirstRun.defaultValue = "T";
            
//submit button            
            form.addSubmitButton({
            	id: "custpage_newpayment_runsuitlet",
                label: 'Process',
            });      
            
            response.writePage(form);          
	 	}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//second stage of suitelet
	 	
	 	else if(request.parameters.custpage_first_run == "T"){
	 		
	 		var classConst = request.parameters.custpage_invoice_class;
	 		var eposConst = request.parameters.custpage_epos;
	 		var custConst = request.parameters.custpage_customer;

//creating second form with invoices to edit on sublist	 		
	 		var form = ui.createForm({
                title: 'CREATE PAYMENT RUN(S)'
            });
	 		
	 		var scriptSearchObj = search.create({
	 		   type: "file",
	 		   filters: [
	 		      ["name","is","runPaymentRun_ppj_cs_custRec.js"]
	 		   ],
	 		   columns: [
	 		      "internalid"
	 		   ]
	 		});
	 		
	 		var objMySearch = {};
	 		scriptSearchObj.run().each(function(result){
	 			objMySearch.stEmpID = result.getValue('internalid');
	 		});
	 		
	 		form.clientScriptFileId = objMySearch.stEmpID;//1881
	 		
	 //field for post method decision 2 	 		
            var objSecondRun = form.addField({
                id: 'custpage_first_run_two',
                type: ui.FieldType.CHECKBOX,	
                label: 'First run2'
            });
            objSecondRun.defaultValue = "T";
            objSecondRun.updateDisplayType({
                displayType: ui.FieldDisplayType.HIDDEN
            });
//fields for informing about selected class and customer on suitelet     
            var objInvoiceClass = form.addField({
                id: 'custpage_invoice_class',
                type: ui.FieldType.SELECT,		
                label: 'Invoice class',
                source: "classification"
            });
            
            objInvoiceClass.defaultValue = classConst;
            objInvoiceClass.updateDisplayType({
                displayType: ui.FieldDisplayType.DISABLED
            });
            
            var objCustomerField = form.addField({
                id: 'custpage_customer',
                type: ui.FieldType.SELECT,
                source: 'customer',
                label: 'Store Name'
            });
            objCustomerField.defaultValue = custConst;
            objCustomerField.updateDisplayType({
                displayType: ui.FieldDisplayType.DISABLED
            });
            
// Creating sublist on suitelet          
            
            var sublist = form.addSublist({id : 'custpage_invoices_sublist',type : ui.SublistType.INLINEEDITOR,label : 'Invoices'});
            
            sublist.addField({id : 'custpage_id',label : 'Transaction Id',type : ui.FieldType.TEXT});
            
            id = form.getSublist('custpage_invoices_sublist').getField('custpage_id');
            id.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
            
            sublist.addField({id : 'transaction_number',label : 'Transaction number',type : ui.FieldType.TEXT});
            sublist.addField({id : 'trandate',label : 'Date',type : ui.FieldType.DATE}).updateDisplayType({
                displayType : ui.FieldDisplayType.DISABLED
            });
            sublist.addField({id : 'duedate',label : 'Duedate',type : ui.FieldType.DATE}).updateDisplayType({
                displayType : ui.FieldDisplayType.DISABLED
            });
            
            tranNum = form.getSublist('custpage_invoices_sublist').getField('transaction_number');
            tranNum.updateDisplayType({
                displayType : ui.FieldDisplayType.DISABLED
            });
            
            sublist.addField({id : 'transaction_memo',label : 'Memo',type : ui.FieldType.TEXT}).updateDisplayType({
                displayType : ui.FieldDisplayType.DISABLED
            });;
            
            
            sublist.addField({id : 'customer',label : 'Store Name',type : ui.FieldType.TEXT});

            customer = form.getSublist('custpage_invoices_sublist').getField('customer');
            customer.updateDisplayType({
                displayType : ui.FieldDisplayType.DISABLED
            });
            
            sublist.addField({id : 'company',label : 'Company Name',type : ui.FieldType.TEXT}).updateDisplayType({
                displayType : ui.FieldDisplayType.DISABLED
            });;

            sublist.addField({id : 'orig_amount',label : 'Original Amount',type : ui.FieldType.CURRENCY}).updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});;;
            sublist.addField({id : 'amount_max',label : 'Max.Payable Amount',type : ui.FieldType.CURRENCY
            }).updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});;
            sublist.addField({id : 'amount',label : 'Payable Amount',type : ui.FieldType.CURRENCY});
            
            
            
            sublist.addField({id : 'inquery',label : 'In Query',type : ui.FieldType.CHECKBOX});
            
            sublist.addField({id : 'payment_run_date',label : 'Payment Run Date',type : ui.FieldType.DATE});
            
            form.addSubmitButton({id: "custpage_createPaymentRun",label: 'Create New Payment run(s)',});
            
            
// Create formated date to sublist
            var dateToday = new Date();
        	
            dateToday.setDate(dateToday.getDate() + 16);
        	
            var dateFormatedToday = format.format({
        	    value: dateToday,
        	    type: format.Type.DATE
        	    });
             
            
/* Adding invoices to sublist, 2 categories:
 * 					 
 * 					TURNKEY, PROPERTY, MISCELLANEOUS
 * 									Search returning all invoices by class and customer with all credit memos
 * 					FOOD EPOS && FOOD non EPOS && LOAN || ROYALTY 
 * 									1. search for all customer with suitable invoices
 * 									2. search for suitable invoices, get number of them (limit) dependent on class and put them to array
 * 									3. search for suitable credit memos, dependent on class (or epos) and put them to array
 * 									4. Sort invoices in array and put to sublist on suitelet
 * 									
*/            						
          
          // classes: TURNKEY, PROPERTY, MISCELLANEOUS
            if ((classConst == '4' || classConst == "5")/* || (classConst == '6')*/){
            	
     //creating new search returning all invoices by class and customer       	
            	var invoiceSearchObj = search.create({
            		type: "transaction",
     		   		filters: [
     		   	          ["type","anyof","CustInvc","CustCred"], 
     		   	          "AND", 
	         		      ["mainline","is","T"], 
	         		      "AND", 
	         		      ["status","anyof","CustInvc:A", "CustCred:A"], 
	         		      "AND", 
	         		      ["class","anyof",classConst],
	     		   	      "AND", 
	     		   	      ["customer.custentity_2663_direct_debit","is","T"],
	     		   	      "AND", 
	     		   	      ["sum(formulanumeric: ABS({amountremaining})-ABS(SUM(NVL({custrecord_dd_invoice.custrecord_dd_payable_amount_remaining},0))))","greaterthan","0"]
 		   	         ],
 		   	          	columns: [
	   	                    search.createColumn({name: "tranid",summary: "GROUP",}),
	   	                    search.createColumn({name: "trandate",summary: "GROUP",}),
	   	                    search.createColumn({name: "altname",join: "customer",summary: "GROUP",}),
	   	                    search.createColumn({name: "internalId",summary: "GROUP",}),
	   	                    search.createColumn({name: "amount",summary: "GROUP",}),
	   	                    search.createColumn({name: "memo",summary: "GROUP",}),
	   	                    search.createColumn({name: "type",summary: "GROUP",}),
	   	                    search.createColumn({name: "entityid",join: "customer",summary: "GROUP",}),
	   	                    search.createColumn({name: "companyname",join: "customer",summary: "GROUP",sort: search.Sort.ASC}),
	   	                    search.createColumn({name: "amountremaining", summary: "GROUP"}),
	   	                    search.createColumn({name: "formulanumeric",summary: "SUM",
	   	                    	formula: "ABS({amountremaining})-ABS(SUM(NVL({custrecord_dd_invoice.custrecord_dd_payable_amount_remaining},0)))"})
   	                    ]
            	});
//            	ABS({amountremaining})-ABS(SUM(NVL({custrecord_dd_invoice.custrecord_dd_payable_amount_remaining},0)));
//            	ABS({amountremaining})-ABS(SUM(NVL({custrecord_dd_invoice.custrecord_dd_payable_amount_remaining},0)));
//            	sum(formulanumeric: ABS({amountremaining})-ABS((SUM(NVL({custrecord_dd_invoice.custrecord_dd_payable_amount_remaining},0))))
//            	Filter for customer
            	if (custConst){
    	 			var customerFilter = search.createFilter({name: 'entity',operator: search.Operator.ANYOF,values: custConst});
    	 			invoiceSearchObj.filters.push(customerFilter);
    	 		}
            	
            	var line = 0;
            	

           //   classes: TURNKEY, PROPERTY, MISCELLANEOUS - getting values from search
            	var invSearchResult = invoiceSearchObj.runPaged();
            	invSearchResult.pageRanges.forEach(function(pageRange){
            		var myPage = invSearchResult.fetch({index: pageRange.index});
            		myPage.data.forEach(function(result){
            	
		            	var internalId = result.getValue({name: 'internalId',summary: "GROUP"});
		            	var tranNumb = result.getValue({name: 'tranid',summary: "GROUP"});
		            	var tranMemo = result.getValue({name: 'memo',summary: "GROUP"});
		            	var entity = result.getValue({name: 'entityid',join: 'customer',summary: search.Summary.GROUP});
		            	var type = result.getValue({name: 'type',summary: "GROUP"});
		            	var total = result.getValue({name: 'formulanumeric',summary: "SUM",}) * (type=="CustCred"?-1:1);
		            	var company = result.getValue({name: 'companyname', join: 'customer', summary:'GROUP'});
		            	
		  //   classes: TURNKEY, PROPERTY, MISCELLANEOUS - setting values to custom sublist on suitelet
		                 sublist.setSublistValue({id : 'custpage_id',line : line,value : internalId,});
		                 sublist.setSublistValue({id : 'transaction_number',line : line,value : tranNumb});
		                 sublist.setSublistValue({id : 'amount',value : total,line : line,});
		                 sublist.setSublistValue({id : 'orig_amount',value :  result.getValue({name: 'amount',summary: "GROUP"}),line : line,});
		                 sublist.setSublistValue({id : 'trandate',value :  result.getValue({name: 'trandate',summary: "GROUP"}),line : line,});
		                 sublist.setSublistValue({id : 'amount_max',value : total,line : line,});
		                 sublist.setSublistValue({id : 'transaction_memo',value : tranMemo,line : line,});
		                 sublist.setSublistValue({id : 'payment_run_date',value : dateFormatedToday,line : line,});
		                 sublist.setSublistValue({id : 'customer',value : entity,line : line,});
		                 sublist.setSublistValue({id : 'company',line : line,value : company});
		              
	                 	line = line+1;
            		});
            	});	   

            	var fldTotal = form.addField({
                    id: 'custpage_total_transaction', type: ui.FieldType.TEXT,
                    label: 'Number of transactions'});
                
                fldTotal.updateDisplayType({ displayType: ui.FieldDisplayType.INLINE});
                fldTotal.defaultValue = line;
            }
            
// FOOD EPOS && FOOD non EPOS && LOAN || ROYALTY , loading first search with customers with any open invoice  + Misc       
            else if ((classConst == '1') || (classConst == '2') || (classConst == '3') || (classConst == '6')){
            	log.debug(classConst, eposConst);
            	var limit;
            	var eposFilter;
            	var classFilter = search.createFilter({name: 'class',operator: search.Operator.ANYOF,values: classConst});
            	
     //loading search and adding filter for customer, running and adding customers with invoices into array
            	
            	var customerSearchObj = search.load({
                    id: 'customsearch_ppj_food_customers',	
                });
            	
            	customerSearchObj.filters.push(classFilter);
            	            	
            	if ((classConst == '2') && (eposConst == "T")){
					eposFilter = search.createFilter({name: 'memomain',operator: search.Operator.CONTAINS,values: "EPOS"});
					limit = 1;
					customerSearchObj.filters.push(eposFilter);
        		}
        		
        		if ((classConst == '2') && (eposConst == "F")){
					eposFilter = search.createFilter({name: 'memomain',operator: search.Operator.DOESNOTCONTAIN,values: "EPOS"});
					limit = 2;
					customerSearchObj.filters.push(eposFilter);
        		}
            	
            	if ((classConst == '1') || (classConst == '3') || (classConst == '6')){
					limit = 1;
        		}
            	
            	if (custConst){
    	 			var customerFilter = search.createFilter({name: 'entity',operator: search.Operator.ANYOF,values: custConst});
    	 			customerSearchObj.filters.push(customerFilter);
    	 		}
            	
            	var objCustomerFound = {};
            	log.debug("running the customer search", customerSearchObj);
            	var custSearchResult = customerSearchObj.runPaged();
            	log.debug("custSearchResult",custSearchResult);
            	custSearchResult.pageRanges.forEach(function(pageRange){
            		var myPage = custSearchResult.fetch({index: pageRange.index});
            		myPage.data.forEach(function(result){
            			log.debug("customer result", result);
                		var customerId = result.getValue({name: 'internalid',join: 'customer',summary: search.Summary.GROUP});
                		objCustomerFound[customerId] = 0;
            		});
            		
        		});
            	log.debug("objCustomerFound", objCustomerFound);

       // FOOD EPOS && FOOD non EPOS && LOAN || ROYALTY , loading second search with all invoices for food       	
            	
            	
            	var invoiceSearchObj = search.load({id: 'customsearch_ppj_food_invoices',});
            	
            	if (classConst == '2'){
            		invoiceSearchObj.filters.push(eposFilter);
        		}
            	
            	invoiceSearchObj.filters.push(classFilter);
            	
            	if (custConst){
    	 			var customerFilter = search.createFilter({name: 'entity',operator: search.Operator.ANYOF,values: custConst
    	        	});
    	 			invoiceSearchObj.filters.push(customerFilter);
    	 		}
            	
            	  var arrInvoicesToSublist = [];

            	var arrCompaniesWithInvoices = [];
            	log.debug("running the invoice search");
            	var invSearchResult = invoiceSearchObj.runPaged(
            			{pageSize: 1000});
            	log.debug("invSearchResult", invSearchResult);
            	
            	var i = 0;
            	var ii = 0;
            	invSearchResult.pageRanges.forEach(function(pageRange){
            		var myPage = invSearchResult.fetch({index: pageRange.index});
        			i++;
        			log.debug("Page loop", i);
            		
        			myPage.data.forEach(function(result){
            			//log.debug("invoice searchResult", result);

            			
            			
         // getting customer id from invoice
                		var customerId = result.getValue({name: 'internalid',join: 'customer',summary: search.Summary.GROUP});
//                		log.debug("customerId", customerId);
                		ii++;  
        	 			var date = new Date();            	 			
        	 			log.debug("If Before", i + " | " + ii + " || " + date.getSeconds() + ":" + date.getMilliseconds());
                		if (objCustomerFound[customerId] < limit){
         //getting info and setting to array
            		        
                			var customer = result.getValue({name: 'entityid',join: 'customer',summary: search.Summary.GROUP});
                    		var tranNum = result.getValue({name: 'tranid',summary: search.Summary.GROUP});
                    		var tranAmount = result.getValue({name: 'formulanumeric',summary: search.Summary.SUM});
                    		var tranId = result.getValue({name: 'internalid',summary: search.Summary.GROUP});
                    		var memo = result.getValue({name: 'memo',summary: search.Summary.GROUP});
                    		var company = result.getValue({name: 'companyname',join: 'customer',summary: search.Summary.GROUP});
//                    		log.debug(objCustomerFound);
                    		
                    		objCustomerFound[customerId]++;
                    		
                    		arrInvoicesToAdd = new Object();
                    		arrInvoicesToAdd.invoiceID = tranId;
                    		arrInvoicesToAdd.transactionNum = tranNum;
                    		arrInvoicesToAdd.amount = tranAmount;
                    		arrInvoicesToAdd.customer = customer;
                    		arrInvoicesToAdd.company = company;
                    		arrInvoicesToAdd.memo = memo;
                    		arrInvoicesToAdd.orig_amount = result.getValue({name: 'amount',summary: search.Summary.GROUP});
                    		arrInvoicesToAdd.trandate = result.getValue({name: 'trandate',summary: search.Summary.GROUP});
                    		arrInvoicesToAdd.duedate = result.getValue({name: 'duedate',summary: search.Summary.GROUP});
//            	 			log.debug("arrInvoicesToAdd", arrInvoicesToAdd);
            	 			arrInvoicesToSublist.push(arrInvoicesToAdd);
            	 			arrCompaniesWithInvoices.push(customer);
                		}
        	 			var date = new Date();            	 			
        	 			log.debug("If After", i + " | " + ii + " || " + date.getSeconds() + ":" + date.getMilliseconds());
            		});
            	});
            	
            	log.debug("arrCompaniesWithInvoices", arrCompaniesWithInvoices);
//	            FOOD EPOS && FOOD non EPOS && LOAN || ROYALTY  - Loading search for CREDIT MEMOS with filters for CUSTOMER and CLASS
            	var cmSearch = search.load({id: 'customsearch_ppj_credit_memos',});
            	
            	if (classConst == '2'){
            		cmSearch.filters.push(eposFilter);
        		}
            	
            	if (custConst){
            		var customerFilter = search.createFilter({name: 'entity',operator: search.Operator.ANYOF,values: custConst});
            		cmSearch.filters.push(customerFilter);
            	}
            	
            	var classFilter = search.createFilter({name: 'class',operator: search.Operator.ANYOF,values: classConst});
            	
            	cmSearch.filters.push(classFilter);
            	
            	var memoSearchResult = cmSearch.runPaged();
            	
            	log.debug('Credit memos',memoSearchResult);
            	
            	memoSearchResult.pageRanges.forEach(function(pageRange){
            		var myPage = memoSearchResult.fetch({index: pageRange.index});
            		myPage.data.forEach(function(result){
            	
		            	var internalId = result.getValue({ name: 'internalId',summary: search.Summary.GROUP,});
		            	var tranNumb = result.getValue({ name: 'tranid',summary: search.Summary.GROUP,});
		            	var entity = result.getValue({name: 'entityid',join: 'customer',summary: search.Summary.GROUP,});
		            	var total = result.getValue({ name: 'formulanumeric',summary: search.Summary.SUM,});
		            	var company = result.getValue({name: 'companyname',join: 'customer',summary: search.Summary.GROUP,});
		            	var memo = result.getValue({name: 'memo',summary: search.Summary.GROUP,});
		            	

		            	if (arrCompaniesWithInvoices.indexOf(entity) != 1)
//		            	if(true)
						{
							arrInvoicesToAdd = new Object();
							arrInvoicesToAdd.invoiceID = internalId;
							arrInvoicesToAdd.transactionNum = tranNumb;
							arrInvoicesToAdd.orig_amount = result.getValue(
							{
								name : 'amount',
								summary : search.Summary.GROUP,
							});
							;
							arrInvoicesToAdd.trandate = result.getValue(
							{
								name : 'trandate',
								summary : search.Summary.GROUP
							});
							arrInvoicesToAdd.duedate = result.getValue(
							{
								name : 'duedate',
								summary : search.Summary.GROUP
							});
							arrInvoicesToAdd.amount = total;// -Math.abs(total);
							arrInvoicesToAdd.customer = entity;
							arrInvoicesToAdd.company = company;
							arrInvoicesToAdd.memo = memo;

							arrInvoicesToSublist.push(arrInvoicesToAdd);
						} else {
							log.debug("skipping " + entity);
						}
            		});
            	});


// 				FOOD EPOS && FOOD non EPOS && LOAN || ROYALTY - sorting and adding invoices to suitelet sublist
            	
            	log.debug({title: "arrInvoicesToSublist", details: arrInvoicesToSublist});
            	arrInvoicesToSublist.sort(function(a,b) {
            	    var x = a.company.toLowerCase();
            	    var y = b.company.toLowerCase();
            	    return x < y ? -1 : x > y ? 1 : 0;
            	});
            	log.debug({title: "arrInvoicesToSublist", details: arrInvoicesToSublist});
            	
            	for (var int2 = 0; int2 < arrInvoicesToSublist.length; int2++) {
            	  
            		var internalId = arrInvoicesToSublist[int2].invoiceID;
	            	var tranNumb = arrInvoicesToSublist[int2].transactionNum;
	            	var entity = arrInvoicesToSublist[int2].customer;
	            	var total = arrInvoicesToSublist[int2].amount;
	            	var company = arrInvoicesToSublist[int2].company;
	            	var memo = arrInvoicesToSublist[int2].memo;
	            	
            		
	              sublist.setSublistValue({id : 'custpage_id',line : int2, value : internalId});
	              
	              sublist.setSublistValue({id : 'transaction_number',line : int2,value : tranNumb});
	              sublist.setSublistValue({id : 'orig_amount',value :  arrInvoicesToSublist[int2].orig_amount,line : int2});
	              sublist.setSublistValue({id : 'trandate',value :  arrInvoicesToSublist[int2].trandate,line : int2});
	              if (arrInvoicesToSublist[int2].duedate) {
	              sublist.setSublistValue({id : 'duedate',value :  (arrInvoicesToSublist[int2].duedate)||"",line : int2});}
                  sublist.setSublistValue({id : 'amount',value : total,line : int2,});
                  sublist.setSublistValue({id : 'amount_max',value : total,line : int2,});
                  sublist.setSublistValue({id : 'transaction_memo',value : memo,line : int2,});
                  sublist.setSublistValue({id : 'payment_run_date',value : dateFormatedToday,line : int2,});
                  sublist.setSublistValue({id : 'customer',value : entity,line : int2,});
                  sublist.setSublistValue({id : 'company',value : company,line : int2,});
				}

            	var fldTotal = form.addField({
                    id: 'custpage_total_transaction', type: ui.FieldType.TEXT,
                    label: 'Number of transactions'});
                
                fldTotal.updateDisplayType({ displayType: ui.FieldDisplayType.INLINE});
                fldTotal.defaultValue = parseInt(arrInvoicesToSublist.length);
            }
            
            
            response.writePage(form);
    }
	 	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Third stage of suitelet - creating JSON with invoices object from sublist	 	
	 	else if(request.parameters.custpage_first_run_two == "T"){
	 		var form2 = ui.createForm({
                title: 'Creation of Payment Run(s) is scheduled, please be patient.'
            });
	 		
	 		var lineCount = request.getLineCount({
 			    group: 'custpage_invoices_sublist'
 			});
	 		var invoices = new Array();
	 		
	 		for(var k = 0; k < lineCount; k++){
	 			
	 			var invoiceIdInt = request.getSublistValue({group : 'custpage_invoices_sublist',name: 'custpage_id',line: k});
	 			var payableAmounInt = request.getSublistValue({group : 'custpage_invoices_sublist',name : 'amount',line: k});
	 			var inQueryCheckbox = request.getSublistValue({group : 'custpage_invoices_sublist',name : 'inquery',line: k});
	 			var paymentRunDate = request.getSublistValue({group:'custpage_invoices_sublist',name: 'payment_run_date',line: k});
	 			var invoice = new Object();
	 			
	 			invoice.line = k;
	 			invoice.data = {};
	 			invoice.data.invoiceID = invoiceIdInt;
	 			invoice.data.amount = payableAmounInt;
	 			invoice.data.inquery = inQueryCheckbox;
	 			invoice.data.date = paymentRunDate;
	 			invoice.data.sender = runtime.getCurrentUser().id;
	 			invoices.push(invoice);
	 		}
	 		
	 		log.debug({title:'JSON', details:JSON.stringify(invoices)});
	 		var invoicesData = JSON.stringify(invoices);

	 		var mapReduceTask = task.create({taskType: task.TaskType.MAP_REDUCE});
	 		mapReduceTask.scriptId = 'customscript_mr_create_payment_run';
	 		mapReduceTask.deploymentId = 'customdeploy_mr_create_payment_run';
	 		mapReduceTask.params = {custscript_invoice_data: invoicesData};
	 		
	 		var mapReduceTaskId = mapReduceTask.submit();
	 		
	 		response.writePage(form2);
	 	}	
    }
  
    return {
        onRequest: onRequest
    };
    
});