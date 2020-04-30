/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/render', 'N/file'],
function(runtime, search, render, file) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
    	
    	// check the record is being created
    	if (scriptContext.type == scriptContext.UserEventType.EDIT)
    		{
	    		// retrieve script parameters
		    	var currentScript = runtime.getCurrentScript();
		    	
		    	// script parameters are global variables so can be accessed throughout the script
		    	fileCabinetFolder = currentScript.getParameter({
		        	name: 'custscript_bbs_service_data_bill_folder'
		        });
		    	
		    	// get the current record
		    	var currentRecord = scriptContext.newRecord;
		    	
		    	// get the internal ID of the current record
		    	var currentRecordID = currentRecord.id;
		    	
		    	// get the related sales order from the invoice record
		    	var salesOrder = currentRecord.getValue({
		    		fieldId: 'createdfrom'
		    	});
		    	
		    	// check that we have a sales order
		    	if (salesOrder)
		    		{
		    			// get the value of the site field from the invoice record
		    			var site = currentRecord.getValue({
		    				fieldId: 'custbody_bbs_site'
		    			});
		    			
		    			// check that we have a site
		    			if (site)
		    				{
		    					// lookup fields on the site record
		    					var siteLookup = search.lookupFields({
		    						type: 'customrecord_bbs_site',
		    						id: site,
		    						columns: ['custrecord_bbs_site_code']
		    					});
		    					
		    					// get the site alias
		    					var siteAlias = siteLookup.custrecord_bbs_site_code;
		    				}
		    			else // we don't have a site
		    				{
			    				// get the customer name from the invoice record
								siteAlias = currentRecord.getText({
									fieldId: 'entity'
								});
		    				}
		    					
		    			// get the subsidiary from the invoice record
			    		var subsidiary = currentRecord.getValue({
			    			fieldId: 'subsidiary'
			    		});
			    				    	
			    		// if subsidiary is 2 (UK)
			    		if (subsidiary == 2)
			    			{
			    				// set filePrefix variable to UK
			    				var filePrefix = 'UK';
			    			}
			    		else if (subsidiary == 3) // if subsidiary is 3 (US)
			    			{
			    				// set filePrefix variable to US
			    				var filePrefix = 'US';
			    			}
			    				    	
			    		// call function to create a PDF invoice and save to the file cabinet. Pass currentRecordID and filePrefix
			    		createPDFInvoice(currentRecordID, filePrefix, siteAlias);
		    		}
    		}

    }
    
    // ====================================================================
    // FUNCTION TO CREATE A PDF OF THE INVOICE AND SAVE TO THE FILE CABINET
    // ====================================================================
    
    function createPDFInvoice(invoiceID, filePrefix, siteAlias)
    	{
	    	// declare new date object
			var invoiceDate = new Date();
			invoiceDate.setDate(0); // set date to be the last day of the previous month
    	
    		// Generate the PDF
			var PDF_File = render.transaction({
				entityId: invoiceID,
				printMode: render.PrintMode.PDF,
				inCustLocale: false
		    });
			
			// get the invoice tran ID from the PDF_File object
			var invoiceTranID = PDF_File.name;
			invoiceTranID = invoiceTranID.replace("Invoice_", ""); // remove 'Invoice_' from string
			
			// format the invoice date in the following format YYMMDD
			var fileDate = invoiceDate.format('ymd');
			
			// set the file name
			PDF_File.name = filePrefix + '-' + fileDate + '-' + siteAlias + '-' + invoiceTranID;
			
			// set the attachments folder
			PDF_File.folder = fileCabinetFolder;
			
			try
				{
					var fileID = PDF_File.save();
					
					log.audit({
						title: 'PDF Created',
						details: 'Invoice ID: ' + invoiceID + '<br>File ID: ' + fileID
					});
				}
			catch(e)
				{
					log.error({
						title: 'Error Creating PDF',
						details: 'Invoice ID: ' + invoiceID + '<br>Error: ' + e
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
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
