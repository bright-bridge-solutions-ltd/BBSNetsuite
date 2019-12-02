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

	//Number padding to the left prototype
	//
	Number.prototype.padLeft = function(base, chr) {
		var len = (String(base || 10).length - String(this).length) + 1;
		return len > 0 ? new Array(len).join(chr || '0') + this : this;
	};
	
	//Number formatting prototype
	//
	Number.formatFunctions={count:0};
	Number.prototype.numberFormat=function(format,context){if(isNaN(this)||this==+Infinity||this==-Infinity){return this.toString()}if(Number.formatFunctions[format]==null){Number.createNewFormat(format)}return this[Number.formatFunctions[format]](context)};Number.createNewFormat=function(format){var funcName="format"+Number.formatFunctions.count++;Number.formatFunctions[format]=funcName;var code="Number.prototype."+funcName+" = function(context){\n";var formats=format.split(";");switch(formats.length){case 1:code+=Number.createTerminalFormat(format);break;case 2:code+='return (this < 0) ? this.numberFormat("'+String.escape(formats[1])+'", 1) : this.numberFormat("'+String.escape(formats[0])+'", 2);';break;case 3:code+='return (this < 0) ? this.numberFormat("'+String.escape(formats[1])+'", 1) : ((this == 0) ? this.numberFormat("'+String.escape(formats[2])+'", 2) : this.numberFormat("'+String.escape(formats[0])+'", 3));';break;default:code+="throw 'Too many semicolons in format string';";break}eval(code+"}")};Number.createTerminalFormat=function(format){if(format.length>0&&format.search(/[0#?]/)==-1){return"return '"+String.escape(format)+"';\n"}var code="var val = (context == null) ? new Number(this) : Math.abs(this);\n";var thousands=false;var lodp=format;var rodp="";var ldigits=0;var rdigits=0;var scidigits=0;var scishowsign=false;var sciletter="";m=format.match(/\..*(e)([+-]?)(0+)/i);if(m){sciletter=m[1];scishowsign=m[2]=="+";scidigits=m[3].length;format=format.replace(/(e)([+-]?)(0+)/i,"")}var m=format.match(/^([^.]*)\.(.*)$/);if(m){lodp=m[1].replace(/\./g,"");rodp=m[2].replace(/\./g,"")}if(format.indexOf("%")>=0){code+="val *= 100;\n"}m=lodp.match(/(,+)(?:$|[^0#?,])/);if(m){code+="val /= "+Math.pow(1e3,m[1].length)+"\n;"}if(lodp.search(/[0#?],[0#?]/)>=0){thousands=true}if(m||thousands){lodp=lodp.replace(/,/g,"")}m=lodp.match(/0[0#?]*/);if(m){ldigits=m[0].length}m=rodp.match(/[0#?]*/);if(m){rdigits=m[0].length}if(scidigits>0){code+="var sci = Number.toScientific(val,"+ldigits+", "+rdigits+", "+scidigits+", "+scishowsign+");\n"+"var arr = [sci.l, sci.r];\n"}else{if(format.indexOf(".")<0){code+="val = (val > 0) ? Math.ceil(val) : Math.floor(val);\n"}code+="var arr = val.round("+rdigits+").toFixed("+rdigits+").split('.');\n";code+="arr[0] = (val < 0 ? '-' : '') + String.leftPad((val < 0 ? arr[0].substring(1) : arr[0]), "+ldigits+", '0');\n"}if(thousands){code+="arr[0] = Number.addSeparators(arr[0]);\n"}code+="arr[0] = Number.injectIntoFormat(arr[0].reverse(), '"+String.escape(lodp.reverse())+"', true).reverse();\n";if(rdigits>0){code+="arr[1] = Number.injectIntoFormat(arr[1], '"+String.escape(rodp)+"', false);\n"}if(scidigits>0){code+="arr[1] = arr[1].replace(/(\\d{"+rdigits+"})/, '$1"+sciletter+"' + sci.s);\n"}return code+"return arr.join('.');\n"};Number.toScientific=function(val,ldigits,rdigits,scidigits,showsign){var result={l:"",r:"",s:""};var ex="";var before=Math.abs(val).toFixed(ldigits+rdigits+1).trim("0");var after=Math.round(new Number(before.replace(".","").replace(new RegExp("(\\d{"+(ldigits+rdigits)+"})(.*)"),"$1.$2"))).toFixed(0);if(after.length>=ldigits){after=after.substring(0,ldigits)+"."+after.substring(ldigits)}else{after+="."}result.s=before.indexOf(".")-before.search(/[1-9]/)-after.indexOf(".");if(result.s<0){result.s++}result.l=(val<0?"-":"")+String.leftPad(after.substring(0,after.indexOf(".")),ldigits,"0");result.r=after.substring(after.indexOf(".")+1);if(result.s<0){ex="-"}else if(showsign){ex="+"}result.s=ex+String.leftPad(Math.abs(result.s).toFixed(0),scidigits,"0");return result};Number.prototype.round=function(decimals){if(decimals>0){var m=this.toFixed(decimals+1).match(new RegExp("(-?\\d*).(\\d{"+decimals+"})(\\d)\\d*$"));if(m&&m.length){return new Number(m[1]+"."+String.leftPad(Math.round(m[2]+"."+m[3]),decimals,"0"))}}return this};Number.injectIntoFormat=function(val,format,stuffExtras){var i=0;var j=0;var result="";var revneg=val.charAt(val.length-1)=="-";if(revneg){val=val.substring(0,val.length-1)}while(i<format.length&&j<val.length&&format.substring(i).search(/[0#?]/)>=0){if(format.charAt(i).match(/[0#?]/)){if(val.charAt(j)!="-"){result+=val.charAt(j)}else{result+="0"}j++}else{result+=format.charAt(i)}++i}if(revneg&&j==val.length){result+="-"}if(j<val.length){if(stuffExtras){result+=val.substring(j)}if(revneg){result+="-"}}if(i<format.length){result+=format.substring(i)}return result.replace(/#/g,"").replace(/\?/g," ")};Number.addSeparators=function(val){return val.reverse().replace(/(\d{3})/g,"$1,").reverse().replace(/^(-)?,/,"$1")};String.prototype.reverse=function(){var res="";for(var i=this.length;i>0;--i){res+=this.charAt(i-1)}return res};String.prototype.trim=function(ch){if(!ch)ch=" ";return this.replace(new RegExp("^"+ch+"+|"+ch+"+$","g"),"")};String.leftPad=function(val,size,ch){var result=new String(val);if(ch==null){ch=" "}while(result.length<size){result=ch+result}return result};String.escape=function(string){return string.replace(/('|\\)/g,"\\$1")};
	
	//=============================================================================================
	//Enumerations
	//=============================================================================================
	//
	var invoiceTypeEnum = {};
	invoiceTypeEnum.SETUP_FEE 				= 1;
	invoiceTypeEnum.MONTHLY_MANAGEMENT_FEE 	= 2;
	invoiceTypeEnum.PREPAYMENT 				= 3;
	invoiceTypeEnum.OVERAGE 				= 4;
	invoiceTypeEnum.USAGE 					= 5;
	
	var billingTypeEnum = {};
	billingTypeEnum.PAYG 	= 1;
	billingTypeEnum.UIOLI 	= 2;
	billingTypeEnum.QMP		= 3;
	billingTypeEnum.AMP		= 4;
	billingTypeEnum.QUR		= 5;
	billingTypeEnum.AMBMA	= 6;
	
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
	    		      search.createColumn({name: "custentity_bbs_usage_statement_email",join: "CUSTRECORD_BBS_CONTRACT_CUSTOMER",label: "Email Address For Usage Statement"}),
	    		      search.createColumn({name: "custrecord_bbs_contract_customer", label: "Customer"})	    		      
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
	    	var pdfTemplateId 		= runtime.getCurrentScript().getParameter({name: 'custscript_pdf_template_id'});
	    	var emailTemplateId 	= runtime.getCurrentScript().getParameter({name: 'custscript_bbs_usage_email_template'});
	    	var attachmentsFolderId = runtime.getCurrentScript().getParameter({name: 'custscript_bbs_attachments_folder'});
	    	var statementDate 		= runtime.getCurrentScript().getParameter({name: 'custscript_statement_date'});
	    	var emailFrom 			= runtime.getCurrentScript().getParameter({name: 'customscript_bbs_usage_email_from'});
	    	
	    	var today = new Date();
	    	
	    	//Only continue if we have a pdf & email template
	    	//
	    	if(pdfTemplateId != null && pdfTemplateId != '' && emailTemplateId != null && emailTemplateId != '')
	    		{
			    	//Convert the value to a result set
			    	//
			    	var result = JSON.parse(context.value);
			    	
			    	//Get the results
			    	//	
			    	var resultContractId					= result.id;
			    	var resultContractName					= result.values["name"];
			    	//var resultContractEmailAddress			= result.values["custentity_bbs_usage_statement_email.CUSTRECORD_BBS_CONTRACT_CUSTOMER"];
			    	var resultContractCustomer				= result.values["custrecord_bbs_contract_customer"].value;

			    	//Get the contract record
	    			//
	    			var contractRecord = getContract(resultContractId);
	    			
	    			//Having got the contract record, no get the subsidiary from the contract's customer
	    			//
	    			var subsidiaryRecord = getSubsidiary(contractRecord);
	    			
	    			//Work out the email address to use based on the billing level (Parent or Child)
	    			//
	    			var resultContractEmailAddress = getCorrectEmail(contractRecord);
	    			
			    	//Only carry on if we have an email address & the contract record
			    	//
			    	if(resultContractEmailAddress != null && resultContractEmailAddress != '' && contractRecord != null)
			    		{
					    	//Get the pre-payments
					    	//
					    	var prePayments = findPrePaymentInvoices(resultContractId);
					    	
					    	//Get the overage value
					    	//
					    	var overageValue = findOverageInvoiceValue(resultContractId);
					    	
					    	//Get the period usage data for the contract
					    	//
					    	var periodRecords = findPeriodRecords(resultContractId, today);
					    	
					    	//Build a JSON string to hold the summary data for the template
					    	//
					    	var jsonSummary = buildJson(periodRecords, prePayments, overageValue, contractRecord, today);
					    	
					    	//Merge data with the template
					    	//
					    	var pdfFile = mergeTemplate(resultContractId, pdfTemplateId, jsonSummary, contractRecord, subsidiaryRecord);
					    	
					    	//Save file to the filing cabinet 
					    	//
					    	var fileId = savePdf(pdfFile, resultContractId, attachmentsFolderId, resultContractName, today);
					    	
					    	//Email the pdf to the customer
					    	//
					    	emailPdf(pdfFile, resultContractEmailAddress, resultContractId, emailTemplateId, resultContractCustomer, emailFrom);
					    	
					    	//Attach the statement to the contract
					    	//
					    	if(fileId != null)
					    		{
					    			attachStatement(fileId, resultContractId);
					    		}
			    		}
	    		}
	    }
    
    //=============================================================================================
    //Function to work out the correct email address to use
    //=============================================================================================
    //
    function getCorrectEmail(_contractRecord)
    	{
    		var billingLevel = _contractRecord.getValue({fieldId: 'custrecord_bbs_contract_billing_level'})
    		var customerId = _contractRecord.getValue({fieldId: 'custrecord_bbs_contract_customer'})
    		var emailAddress = '';
    		
    		if(billingLevel == '1') 	//Parent
    			{
	    			emailAddress = search.lookupFields({
											            type: 		search.Type.CUSTOMER,
											            id: 		thisCustomerId,
											            columns: 	['parentcustomer.custentity_bbs_usage_statement_email']
											        	})['parentcustomer.custentity_bbs_usage_statement_email'];
    			}
    		else						//Child
    			{
	    			emailAddress = search.lookupFields({
											            type: 		search.Type.CUSTOMER,
											            id: 		thisCustomerId,
											            columns: 	['custentity_bbs_usage_statement_email']
											        	})['custentity_bbs_usage_statement_email'];
    			}
    	}
    
    //=============================================================================================
    //Function to get the contract record
    //=============================================================================================
    //
    function getContract(_contractId)
    	{
    		var contractRecord = null;
    		
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
	    			log.error({
								title: 	'Error loading the contract record id =  ' + _contractId,
								details: err
								});
    			}
    		
    		return contractRecord;
    	}

    //=============================================================================================
    //Function to get the subsidiary record
    //=============================================================================================
    //
    function getSubsidiary(_contractRecord)
    	{
    		var subsidiaryRecord = null;
    		
    		var customerId = _contractRecord.getValue({fieldId: 'custrecord_bbs_contract_customer'})
    		var subsidiaryId = search.lookupFields({
    												type:		search.Type.CUSTOMER,
    												id:			customerId,
    												columns:	'subsidiary'
    												}).subsidiary[0].value;
    		try
    			{
    			subsidiaryRecord = record.load({
											type: 		'subsidiary', 
											id: 		subsidiaryId, 
											isDynamic: 	true
											});	
    			}
    		catch(err)
    			{
	    			log.error({
								title: 	'Error loading the subsidiary record id =  ' + subsidiaryId,
								details: err
								});
    			}
    		
    		return subsidiaryRecord;
    	}


    //=============================================================================================
    //Function to attach the statement to the contract record
    //=============================================================================================
    //
    function attachStatement(_fileId, _contractId)
    	{
    		try
    			{
				    record.attach({
									record: {type: 'file', id: _fileId},
									to: 	{type: 'customrecord_bbs_contract', id: _contractId}
									});
    			}
    		catch(err)
    			{
	    			log.error({
								title: 	'Error attaching file to contract file id =  ' + _fileId + ' contract id = ' + _contractId,
								details: err
								});
    			}
    	}
    
    //=============================================================================================
    //Function to save the PDF to the filing cabinet
    //=============================================================================================
    //
    function savePdf(_pdfFile, _resultContractId, _attachmentsFolderId, _contractName, _today)
	    {
    		var fileId = null;
    		var dateString = _today.format('Ymd');
    		
    		//Set the folder
			//
    		_pdfFile.folder = _attachmentsFolderId;
    		
    		//Set the file name
    		//
    		_pdfFile.name = 'Usage_Statement_' + _contractName + '_' + dateString +'.pdf';
		
	    	//Try to save the file to the filing cabinet
			//
			try
				{
					fileId = _pdfFile.save();
				}
			catch(err)
				{
					log.error({
								title: 	'Error Saving PDF To File Cabinet ' + attachmentsFolder,
								details: error
								});
					
					fileId = null;
				}
			
			return fileId;
	    }
    
    //=============================================================================================
    //Function to build the JSON string from the period usage records
    //=============================================================================================
    //
    function buildJson(_periodRecords, _prePayments, _overageValue, _contractRecord, _today)
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
	    					//Get the amount of the pre-payment
	    					//
	    					var amount = Number(_prePayments[int].getValue({name: 'amount'}));
	    					
	    					//Update the summary value
	    					//
	    					summaryObject.invoiceSummary[int].value = format.format({value: amount, type: format.Type.CURRENCY});
	    					
	    					//Update the grand total
	    					//
	    					summaryTotal += amount;
	    					
	    					//Work out the status field - this is dependent on billing type
	    					//
	    					var billingType = _contractRecord.getValue({fieldId: 'custrecord_bbs_contract_billing_type'});
	    					
	    					//Processing for AMP
	    					//
	    					if(billingType == billingTypeEnum.AMP)
	    						{
	    							var totalContractUsage = Number(_contractRecord.getValue({fieldId: 'custrecord_bbs_contract_total_usage'}));
	    							var minimumAnnual = Number(_contractRecord.getValue({fieldId: 'custrecord_bbs_contract_min_ann_use'}));
	    							var statusText = 'Still available to use';
	    							
	    							//If the total contract usage exceeds the min annual value, then the pre-payment is expired
	    							//
	    							if(totalContractUsage > minimumAnnual)
	    								{
	    									statusText = 'Expired';
	    								}
	    							
	    							//Update the status text
	    							//
	    							summaryObject.invoiceSummary[int].status = statusText;
	    						}
	    					
	    					//Processing for QMP
	    					//
	    					if(billingType == billingTypeEnum.QMP)
	    						{
	    							var statusText = 'Still available to use';
    							
	    							//Get the date from the invoice
	    							//
	    							var invoiceDate = _prePayments[int].getValue({name: 'trandate'});
	    							
	    							//Find the quarterly usage based on the pre-payment invoice date
	    							//
	    							var quarterlyUsage = getUsageBasedOnDate(invoiceDate, _contractRecord);
	    							
	    							//Find the end date of the quarter that the pre-payment invoice belongs to by searching the usage data
	    							//
	    							var quarterEndDateString = getUsageQuarterEndBasedOnDate(invoiceDate, _contractRecord);
	    							var quarterEndDate = format.parse({
	    																value: quarterEndDateString, 
	    																type: format.Type.DATE
	    															});
	    							
	    							//If quarter usage exceeds pre-payment or the quarter has expired, then change to expired
	    							//
	    							if(quarterlyUsage > amount || _today.getTime() > quarterEndDate.getTime())
	    								{
	    									statusText = 'Expired';
	    								}
	    							
	    							//Update the status text
	    							//
	    							summaryObject.invoiceSummary[int].status = statusText;
	    						}
	    					
	    					//Processing for QUR
	    					//
	    					if(billingType == billingTypeEnum.QUR)
	    						{
	    							var statusText = 'Still available to use';
    							
	    							//Get the date from the invoice
	    							//
	    							var invoiceDate = _prePayments[int].getValue({name: 'trandate'});
	    							
	    							//Find the quarterly usage based on the pre-payment invoice date
	    							//
	    							var quarterlyUsage = getUsageBasedOnDate(invoiceDate, _contractRecord);
	    							
	    							//If quarter usage exceeds pre-payment then change to expired
	    							//
	    							if(quarterlyUsage > amount)
	    								{
	    									statusText = 'Expired';
	    								}
	    							
	    							//Update the status text
	    							//
	    							summaryObject.invoiceSummary[int].status = statusText;
	    						}
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
	    			var lastPeriod = '';
	    			var currentSummary = null;
	    			
	    			//Loop through the period usage data
	    			//
	    			for (var int = 0; int < _periodRecords.length; int++) 
		    			{
	    					var product 	= _periodRecords[int].getText({name: "custrecord_bbs_contract_period_product"});
	    					var endDate 	= _periodRecords[int].getValue({name: "custrecord_bbs_contract_period_end"});
	    					var startDate 	= _periodRecords[int].getValue({name: "custrecord_bbs_contract_period_start"});
	    					var usage 		= _periodRecords[int].getValue({name: "custrecord_bbs_contract_period_prod_use"});
	    					var quantity 	= _periodRecords[int].getValue({name: "custrecord_bbs_contract_period_quantity"});
	    					var rate 		= _periodRecords[int].getValue({name: "custrecord_bbs_contract_period_rate"});
	    					var period 		= _periodRecords[int].getValue({name: "custrecord_bbs_contract_period_period"});
	    					
	    					//Have we changed period number?
	    					//
	    					if(lastPeriod != period)
	    						{
	    							//If this is not the first time through, then push the period summary onto the output summary
	    							//
	    							if(lastPeriod != '')
	    								{
	    									currentSummary.productTotal = format.format({value: Number(currentSummary.productTotal), type: format.Type.CURRENCY});
	    									summaryObject.periodSummary.push(currentSummary);
	    								}
	    							
	    							//Create a new summary record
	    							//
	    							currentSummary = new periodSummaryObject(startDate, endDate);
	    							
		    						//Save the last period
	    							//
	    							lastPeriod = period;
	    						}

	    					//Add a new product summary to the current period summary
	    					//
	    					currentSummary.productArray.push(new productDetails(
	    																		product, 
	    																		(quantity == '' ? '' : format.format({value: quantity, type: format.Type.CURRENCY})), 
	    																		(rate == '' ? '' : format.format({value: rate, type: format.Type.CURRENCY})), 
	    																		(usage == '' ? '' : format.format({value: usage, type: format.Type.CURRENCY}))
	    																		));
	    					currentSummary.productTotal += Number(usage);
						}
	    			
	    			//Save the last summary to the output object
	    			//
	    			currentSummary.productTotal = format.format({value: Number(currentSummary.productTotal), type: format.Type.CURRENCY});
	    			summaryObject.periodSummary.push(currentSummary);
	    		}
	    	
	    	
	    	//Convert the object to a string
	    	//
	    	returnedJson = JSON.stringify(summaryObject);
	    	
	    	return returnedJson;
	    }

    //=============================================================================================
    //Function to find the quarter end date on the usage records based on the invoice date of 
    //the pre-payment invoice
    //=============================================================================================
    //
    function getUsageQuarterEndBasedOnDate(_invoiceDate, _contractRecord)
    	{
    		var quarterEndDate = null;
    		
    		//Get the contract id from the contract record
    		//
    		var contractId = _contractRecord.id;
    		
    		//First find a usage record that encompasses the invoice date
    		//
    		var customrecord_bbs_contract_periodSearch = getResults(search.create({
    			   type: "customrecord_bbs_contract_period",
    			   filters:
    			   [
    			      ["custrecord_bbs_contract_period_contract","anyof",contractId], 
    			      "AND", 
    			      ["custrecord_bbs_contract_period_start","onorbefore",_invoiceDate], 
    			      "AND", 
    			      ["custrecord_bbs_contract_period_end","onorafter",_invoiceDate]
    			   ],
    			   columns:
    			   [
    			      search.createColumn({name: "custrecord_bbs_contract_period_qu_end", label: "Quarter End Date"})
    			   ]
    			}));
    			
    		//Check to see if we have any results
    		//
    		if(customrecord_bbs_contract_periodSearch != null && customrecord_bbs_contract_periodSearch.length > 0)
				{
    				//Get the usage quarter end date
    				//
    				quarterEndDate = customrecord_bbs_contract_periodSearch[0].getValue({name: "custrecord_bbs_contract_period_qu_end"});
    				
				}
    		
    		return quarterEndDate;
    	}

    //=============================================================================================
    //Function to find the usage based on the invoice date of the pre-payment invoice
    //=============================================================================================
    //
    function getUsageBasedOnDate(_invoiceDate, _contractRecord)
    	{
    		var usageValue = Number(0);
    		
    		//Get the contract id from the contract record
    		//
    		var contractId = _contractRecord.id;
    		
    		//First find a usage record that encompasses the invoice date
    		//
    		var customrecord_bbs_contract_periodSearch = getResults(search.create({
    			   type: "customrecord_bbs_contract_period",
    			   filters:
    			   [
    			      ["custrecord_bbs_contract_period_contract","anyof",contractId], 
    			      "AND", 
    			      ["custrecord_bbs_contract_period_start","onorbefore",_invoiceDate], 
    			      "AND", 
    			      ["custrecord_bbs_contract_period_end","onorafter",_invoiceDate]
    			   ],
    			   columns:
    			   [
    			      search.createColumn({name: "custrecord_bbs_contract_period_quarter", label: "Contract Quarter"})
    			   ]
    			}));
    			
    		//Check to see if we have any results
    		//
    		if(customrecord_bbs_contract_periodSearch != null && customrecord_bbs_contract_periodSearch.length > 0)
				{
    				//Get the usage quarter
    				//
    				var usageQuarter = customrecord_bbs_contract_periodSearch[0].getValue({name: "custrecord_bbs_contract_period_quarter"});
    				
    				//Now get the total of the usage for all products for the specific quarter
    				//
    				var customrecord_bbs_contract_periodSearch = getResults(search.create({
    					   type: "customrecord_bbs_contract_period",
    					   filters:
    					   [
    					      ["custrecord_bbs_contract_period_contract","anyof",contractId], 
    					      "AND", 
    					      ["custrecord_bbs_contract_period_quarter","equalto",usageQuarter]
    					   ],
    					   columns:
    					   [
    					      search.createColumn({
    					         name: "custrecord_bbs_contract_period_prod_use",
    					         summary: "SUM",
    					         label: "Product Usage"
    					      })
    					   ]
    					}));
    					
    				if(customrecord_bbs_contract_periodSearch != null && customrecord_bbs_contract_periodSearch.length > 0)
	    				{
    						usageValue = Number(customrecord_bbs_contract_periodSearch[0].getValue({
    																							name: 		"custrecord_bbs_contract_period_prod_use",
    																							summary:	"SUM"
    																							}));
        				
	    				}
				}
    		
    		return usageValue;
    	}
    
    //=============================================================================================
    //Function to email the pdf
    //=============================================================================================
    //
    function emailPdf(_pdfFile, _emailAddress, _contractId, _emailTemplateId, _contractCustomer, _emailFrom)
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
										author: 		_emailFrom,
										recipients:		_emailAddress,
										subject:		emailSubject,
										body:			emailBody,
										attachments:	emailAttachments,
										relatedRecords: {
														entityId:	_contractCustomer
														}
										})		
							
						}
					catch(err)
						{
							log.error({
									    title: 'Error sending email', 
									    details: err
									    });
						}
				}
    	}
    
    //=============================================================================================
    //Function to search for prepayment invoices
    //=============================================================================================
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
	    		      ["custbody_bbs_invoice_type","anyof",invoiceTypeEnum.PREPAYMENT], 
	    		      "AND", 
	    		      ["custbody_bbs_contract_record","anyof",_contractId]
	    		   ],
	    		   columns:
	    		   [
	    		      search.createColumn({name: "datecreated", label: "Date Created", sort: search.Sort.ASC}),
	    		      search.createColumn({name: "tranid", 		label: "Document Number"}),
	    		      search.createColumn({name: "amount", 		label: "Amount"}),
	    		      search.createColumn({name: "trandate", 	label: "Date"})
	    		   ]
	    		}));
	    		
	    	return returnedResultSet = invoiceSearchObj;
	    }
    
    //=============================================================================================
    //Function to find the total value of overage invoices
    //=============================================================================================
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
	    		      ["custbody_bbs_invoice_type","anyof",invoiceTypeEnum.OVERAGE], 
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
    
    //=============================================================================================
    //Function to find the contract period usage records
    //=============================================================================================
    //
    function findPeriodRecords(_contractId, _today)
	    {
    		var returnedResultSet = null;
    		var todayString = format.format({value: _today, type: format.Type.DATE});
    		
	    	var customrecord_bbs_contract_periodSearchObj = getResults(search.create({
	    		   type: "customrecord_bbs_contract_period",
	    		   filters:
	    		   [
	    		      ["custrecord_bbs_contract_period_contract","anyof",_contractId],
	    		      "AND",
	    		      ["custrecord_bbs_contract_period_start", "onorbefore", todayString]
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
    
    //=============================================================================================
    //Function to merge the pdf template with the data elements
    //=============================================================================================
    //
    function mergeTemplate(_contractId, _pdfTemplateId, _jsonSummary, _contractRecord, _subsidiaryRecord)
    	{
    		var pdfFile = null;
    		
    		if(_contractRecord != null)
    			{
    				//Copy the json object into a temp field on the contract record
    				//
    				try
    					{
	    				_contractRecord.setValue({
	    										fieldId:			'custrecord_bbs_contract_usage_json',
	    										value:				_jsonSummary,
	    										ignoreFieldChange:	true
	    										});
    					}
    				catch(err)
    					{
    						log.error({
    									title: 'contract record',
    									details: err
    								});
    		    		
    					}

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
    						log.error({
									    title: 'Error loading pdf template file', 
									    details: err
									   });
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
    											record:			_contractRecord
    											});		
    						renderer.addRecord({
												templateName:	'subsidiary',
												record:			_subsidiaryRecord
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
    								log.error({
											    title: 'Error rendering', 
											    details: err
											   });
    							}
    					}
    			}
    		
    		return pdfFile;
    	}
    
    //=============================================================================================
    //Function to page through results set from search
    //=============================================================================================
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

    //=============================================================================================
    //Object to hold the summary info
    //=============================================================================================
    //
    function usageSummaryObject()
    	{
    		//Instantiate the invoice summary array
    		//
    		this.invoiceSummary = [];
    		this.invoiceSummary.push(new invoiceSummaryObject('Prepayment 1', 'N/A', ''));
    		this.invoiceSummary.push(new invoiceSummaryObject('Prepayment 2', 'N/A', ''));
    		this.invoiceSummary.push(new invoiceSummaryObject('Prepayment 3', 'N/A', ''));
    		this.invoiceSummary.push(new invoiceSummaryObject('Prepayment 4', 'N/A', ''));
    		this.invoiceSummary.push(new invoiceSummaryObject('Overages', 'N/A', ''));
    		this.invoiceSummary.push(new invoiceSummaryObject('Total', 'N/A', ''));
    		
    		//Instantiate the period summary
    		//
    		this.periodSummary = [];
    	}
    
    //=============================================================================================
    //Object to hold the period summary data
    //=============================================================================================
    //
    function periodSummaryObject(_start, _end)
    	{
    		this.periodStartDate 	= _start;
    		this.periodEndDate 		= _end;
    		this.productArray 		= [];
    		this.productTotal 		= Number(0);
    	}
    
    //=============================================================================================
    //Object to hold the product details
    //=============================================================================================
    //
    function productDetails(_description, _value, _rate, _amount)
    	{
    		this.description 	= _description;
    		this.value 			= _value;
    		this.rate 			= _rate;
    		this.amount 		= _amount;
    	}
    
    //=============================================================================================
    //Object to hold the invoice summary data
    //=============================================================================================
    //
    function invoiceSummaryObject(_description, _value, _status)
    	{
    		this.description 	= _description;
    		this.value 			=  _value;
    		this.status			= _status;
    	}
    
    //=============================================================================================
    //Return the function definitions back to Netsuite
    //=============================================================================================
    //
    return {
        	getInputData: 	getInputData,
        	map: 			map
    		};
    
});
