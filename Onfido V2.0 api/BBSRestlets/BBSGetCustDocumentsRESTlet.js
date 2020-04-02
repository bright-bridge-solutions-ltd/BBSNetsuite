/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/search','N/config'],
/**
 * @param {search,config} search
 */
function(search,config) {
   
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

	
    /**
     * Function called upon sending a GET request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.1
     */
    function doGet(requestParams) 
    {
    	var configRecord = null;
    	var urlPrefix = null;
//    	var customer = requestParams.customerId;
    	var salesforceId = requestParams.salesforceId;
    	var resultSet = [];
    	
    	//Load the company config
    	//
    	try
    		{
    			configRecord = config.load({type: config.Type.COMPANY_INFORMATION});
    		}
    	catch(err)
    		{
    			configRecord = null;
    			
    			log.error({
							title: 'Error loading company config record',
							details: error
							});
    		}
    	
    	//If we got the config, then work out the url prefix & procede
    	//
    	if(configRecord != null)
    		{
    			if(salesforceId != null && salesforceId != '')
   					{
		    			var accountId = configRecord.getValue({fieldId: 'companyid'});
		    			urlPrefix = 'https://' + accountId.replace('_','-') + '.app.netsuite.com';
				    		
				    	//Search for contracts for the customer or custmomer's parent where there are files attached
				    	//
				    	var customrecord_bbs_contractSearchObj = search.create({
				    		   type: "customrecord_bbs_contract",
				    		   filters:
				    		   [
				    		      ["custrecord_bbs_contract_status","anyof","1"], 				//Approved
				    		      "AND", 
				    		      ["file.availablewithoutlogin","is","T"], 						//Available without login
				    		      "AND", 
				    		      ["custrecord_bbs_contract_customer.accountnumber","is",salesforceId]
//				    		      [["custrecord_bbs_contract_customer","anyof",customer], 		//Contract customer is the customer in question
//				    		      "OR", 
//				    		      ["custrecord_bbs_contract_customer.parent","anyof",customer]]	//Or the contract customer's parent is the customer in question
				    		   ],
				    		   columns:
				    		   [
				    		      search.createColumn({
								    		    	  name: "name", 
								    		    	  label: "ID"
				    		    		  			}),
				    		      search.createColumn({
				    		    	  					name: "custrecord_bbs_contract_status", 
				    		    	  					label: "Status"
				    		    	  				}),
				    		      search.createColumn({
									    				name: "name",
									    		        join: "file",
									    		        label: "Name"
				    		      					}),
				    		      search.createColumn({
									    		        name: "url",
									    		        join: "file",
									    		        label: "URL"
				    		      					}),
				    		      search.createColumn({
									    		        name: "description",
									    		        join: "file",
									    		        label: "Description"
				    		      					}),
				    		      search.createColumn({
									    		        name: "created",
									    		        join: "file",
									    		        sort: search.Sort.DESC,
									    		        label: "Date Created"
				    		      					})
				    		   ]
				    		});
				    	
				    		//Loop round the search results
				    		//
				    		customrecord_bbs_contractSearchObj.run().each(function(result)
				    			{
				    				var fileName = result.getValue({name: 'name', join: 'file'});
				    				var fileDescription = result.getValue({name: 'description', join: 'file'});
				    				var fileDate = result.getValue({name: 'created', join: 'file'});
				    				var fileUrl = urlPrefix + result.getValue({name: 'url', join: 'file'});
				    				
				    				//Extract the JSON data from the description if possible
				    				//
				    				try
				    					{
				    						var descriptionObj = JSON.parse(fileDescription);
				    						
				    						//Add an entry to the output array using the extended properties found in the description
						    				//
						    				resultSet.push(new fileDescriptor(fileName, descriptionObj.description, descriptionObj.tranDate, fileUrl, descriptionObj.startDate, descriptionObj.endDate, descriptionObj.amount, descriptionObj.currency));
						    				
				    					}
				    				catch(err)
				    					{
					    					//Add an entry to the output array assuming that the description is just the description (no extended properties)
						    				//
						    				resultSet.push(new fileDescriptor(fileName, fileDescription, fileDate, fileUrl, '', '', '', ''));
				    					}
				    				
				    				
				    				return true;
				    			});
    				}
    		}
    	
    		//Return the results
    		//
    		return JSON.stringify(resultSet);
    }

    //Object to hold the result data
    //
    function fileDescriptor(_name, _description, _date, _url, _startDate, _endDate, _amount, _currency)
    {
    	this.name 			= _name;
    	this.description 	= _description;
    	this.date 			= _date;
    	this.url 			= _url;    
    	this.startDate		= _startDate;
    	this.endDate		= _endDate;
    	this.amount			= _amount;
    	this.currency		= _currency;
    }
    
    
    /**
     * Function called upon sending a PUT request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPut(requestBody) {

    }


    /**
     * Function called upon sending a POST request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPost(requestBody) {

    }

    /**
     * Function called upon sending a DELETE request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doDelete(requestParams) {

    }

    return {
        'get': doGet,
        put: doPut,
        post: doPost,
        'delete': doDelete
    };
    
});
