/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/task'],
/**
 * @param {record} record
 * @param {search} search
 * @param {task} task
 */
function(runtime, search, record, task) {
	
	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script
	adjustmentItem = currentScript.getParameter({
    	name: 'custscript_bbs_min_usage_adj_item'
    });
	
	soForm = currentScript.getParameter({
		name: 'custscript_bbs_sales_order_form'
	});
	
	billingType = currentScript.getParameter({
		name: 'custscript_bbs_billing_type_select'
	});
	
	billingTypeText = currentScript.getParameter({
		name: 'custscript_bbs_billing_type_select_text'
	});
	
	subsidiary = currentScript.getParameter({
		name: 'custscript_bbs_subsidiary_select'
	});
	
	subsidiaryText = currentScript.getParameter({
		name: 'custscript_bbs_subsidiary_select_text'
	});
	
	initiatingUser = currentScript.getParameter({
		name: 'custscript_bbs_billing_email_emp_alert'
	});
	
	// declare new date object. Global variable so can be accessed throughout the script
	processDate = new Date();
	processDate.setDate(0); // set date to be the last day of the previous month
	
	processDate = new Date(processDate.getFullYear(), processDate.getMonth(), processDate.getDate());
	
   
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
    function getInputData() {
    	
    	// create search to find contract records for this billing type/subsidiary
    	return search.create({
    		type: 'customrecord_bbs_contract',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_contract_exc_auto_bill',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_contract_start_date',
    			operator: 'notafter',
    			values: ['today']
    		},
    				{
    			name: 'custrecord_bbs_contract_status',
    			operator: 'anyof',
    			values: [1] // 1 = Approved
    		},
    				{
    			name: 'custrecord_bbs_contract_billing_type',
    			operator: 'anyof',
    			values: [billingType]
    		},
    				{
    			name: 'custrecord_bbs_contract_subsidiary',
    			operator: 'anyof',
    			values: [subsidiary]
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_contract_customer'
    		},
    				{
    			name: 'custrecord_bbs_contract_currency'
    		}],

    	});

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// retrieve search results
    	var searchResult 		= 	JSON.parse(context.value);
    	var contractRecordID 	= 	searchResult.id;
    	var customer			=	searchResult.values['custrecord_bbs_contract_customer'].value;
    	var currency			=	searchResult.values['custrecord_bbs_contract_currency'].value;
    	
    	log.audit({
    		title: 'Processing Contract',
    		details: contractRecordID
    	});
    	
    	// call function to check for open sales orders for this contract
    	var openSalesOrder = searchSalesOrders(contractRecordID);
    	
    	// check if we DO NOT have an open sales order
    	if (openSalesOrder == false)
    		{
    			// call function to create a zero value sales order. Pass contractRecordID, customer and currency
    			createSalesOrder(contractRecordID, customer, currency);
    		}
    }
    
    // ======================================
    // FUNCTION TO CHECK FOR OPEN SALES ORDER
    // ======================================
    
    function searchSalesOrders(contractRecordID) {
    
    	// declare and initialize variables
    	var openSalesOrder = false;
	    
    	// run search to check if there are any open sales orders for this contract
		search.create({
			type: search.Type.SALES_ORDER,
			
			filters: [{
				name: 'mainline',
				operator: 'is',
				values: ['T']
			},
					{
				name: 'status',
				operator: 'anyof',
				values: ['SalesOrd:F'] // SalesOrd:F = Pending Billing
			},
					{
				name: 'custbody_bbs_contract_record',
				operator: 'anyof',
				values: [contractRecordID]
			}],
			
			columns: [{
				name: 'tranid'
			}],	
					
		}).run().each(function(result) {
			
			// set openSalesOrder variable to true
			openSalesOrder = true;
			
		});
		
		// return openSalesOrder variable to main script function
		return openSalesOrder;
	
    }
    
    // ================================
    // FUNCTION TO CREATE A SALES ORDER
    // ================================
    
    function createSalesOrder(contractRecordID, customer, currency) {
	    	
    	// build up the external ID for the sales order
    	var externalID 	= 'so_';
    	externalID += customer;
    	externalID += contractRecordID;
    	externalID += processDate.format('c'); // format date in the following format: yyyy-mm-dd

    	try
    		{
		    	// create a new sales order record
				var soRecord = record.transform({
					fromType: record.Type.CUSTOMER,
					fromId: customer,
					toType: record.Type.SALES_ORDER,
					isDynamic: true,
					defaultValues: {
						customform: soForm
					}
				});
	    		
				// set header fields on the soRecord
    			soRecord.setValue({
    				fieldId: 'externalid',
    				value: externalID
    			});
					
				soRecord.setValue({
    				fieldId: 'trandate',
    				value: processDate
    			});
    				
    			soRecord.setValue({
    				fieldId: 'currency',
    				value: currency
    			});
    				
    			soRecord.setValue({
    				fieldId: 'custbody_bbs_contract_record',
    				value: contractRecordID
    			});
    				
    			// add a new line to the soRecord
    			soRecord.selectNewLine({
	    			sublistId: 'item'
	    		});
	    			
	    		// set the item on the new line using the adjustmentItem
    			soRecord.setCurrentSublistValue({
	    			sublistId: 'item',
	    			fieldId: 'item',
	    			value: adjustmentItem
	    		});
    				
    			// set fields on the new line
    			soRecord.setCurrentSublistValue({
	    			sublistId: 'item',
	    			fieldId: 'quantity',
	    			value: 1
	    		});
	    			
    			soRecord.setCurrentSublistValue({
	    			sublistId: 'item',
	    			fieldId: 'rate',
	    			value: 0
	    		});
	    			
    			soRecord.setCurrentSublistValue({
	    			sublistId: 'item',
	    			fieldId: 'custcol_bbs_contract_record',
	    			value: contractRecordID
	    		});
    				
    			// commit the line
    			soRecord.commitLine({
					sublistId: 'item'
				});
	    			
	    		// submit the soRecord record
	    		var soID = soRecord.save({
	    			enableSourcing: false,
			    	ignoreMandatoryFields: true
	    		});
	    			
	    		log.audit({
	    			title: 'Sales Order Created',
	    			details: 'Sales Order ID: ' + soID + ' | Contract ID: ' + contractRecordID
	    		});   				
			}
		catch(error)
			{
				log.error({
					title: 'Error Creating Sales Order for Contract ID: ' + contractRecordID,
					details: error
				});
			}
	}
    
    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {
    	
    	// ================================================================================
    	// NOW SCHEDULE ADDITIONAL MAP/REDUCE SCRIPT TO BILL SALES ORDERS/RECOGNISE REVENUE
    	// ================================================================================
    	
    	// create a map/reduce task
    	var mapReduceTask = task.create({
    	    taskType: task.TaskType.MAP_REDUCE,
    	    scriptId: 'customscript_bbs_billing_map_reduce',
    	    deploymentId: 'customdeploy_bbs_billing_map_reduce',
    	    params: {
    	    	custscript_bbs_billing_type_select: billingType,
    	    	custscript_bbs_billing_type_select_text: billingTypeText,
    	    	custscript_bbs_subsidiary_select: subsidiary,
    	    	custscript_bbs_subsidiary_select_text: subsidiaryText,
    	    	custscript_bbs_billing_email_emp_alert: initiatingUser
    	    }
    	});
    	
    	// submit the map/reduce task
    	var mapReduceTaskID = mapReduceTask.submit();
    	
    	log.audit({
    		title: 'Script scheduled',
    		details: 'BBS Billing Map/Reduce script has been scheduled. Job ID ' + mapReduceTaskID
    	});	

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
		// Full Date
		c : function() {
			return this.format("Y-m-d");
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
        getInputData: getInputData,
       	map: map,
        summarize: summarize
    };
    
});
