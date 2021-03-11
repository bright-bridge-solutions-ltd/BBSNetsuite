/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/record','N/search'],
function(record, search) {
   
	/*
 		CONSUMER KEY / CLIENT ID		46cab4a95bbbe05d2acddfc536c42d36287f1a6a1af1daaa6bc7bdaa87e91a83
		CONSUMER SECRET / CLIENT SECRET	55030aa1223515fd9785b6cca9b918f3b08382635907483324116755354b2ba7

		TOKEN ID						a5df6373e545c858fe0f3e552503c06dd580a37522ba2329262e67b782f6a666
		TOKEN SECRET					15a6ff7405e2c057094e7ad90b7efdd5757e9b9ce56bab2f81b849817ba77332
	 */
	
	
    /**
     * Function called upon sending a POST request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPost(requestBody) 
    	{
	    	//Response will be an array of response objects (one per order)
			//
			var RestletResponseObj = [];

			
    		/*
    		Expected format of request object is as follows:
    			{
    				customerAlias: 	'',
    				orderAlias:		'',
    				filter:			{
    									page:		0,
    									pageCount:	0,
    									pageSize:	0
    								}
    			}
    		 */
    	
    		try
    			{
		    		//Extract the info from the incoming request
		    		//
		    		var customerAlias 	= (requestBody.hasOwnProperty('customerAlias') ? requestBody.customerAlias : null);		//Get the customer alias
		    		var orderAlias 		= (requestBody.hasOwnProperty('orderAlias') ? requestBody.orderAlias : null);			//Get the order alias
		    		var requestFilter	= (requestBody.hasOwnProperty('filter') ? requestBody.filter : {});						//Get the filter object 
		    		var rowsPerPage		= Number((requestFilter.hasOwnProperty('pageSize') ? requestFilter.pageSize : 50));		//Default page size to 50 if not specified
		    		var startPage		= Number((requestFilter.hasOwnProperty('page') ? requestFilter.page : 1));				//Default start page to 1 if not specified
		    		var numberOfPages	= Number((requestFilter.hasOwnProperty('pageCount') ? requestFilter.pageCount : 1));	//Default number of pages to 1 if not specified
		    		
		    		//Make sure we do not specify less than the minimum page size (5)
		    		//
		    		rowsPerPage = (rowsPerPage < 5 ? Number(5) : rowsPerPage);
		    		
		    		//Define the basic filter
		    		//
		    		var filterArray		= [
						    			      ["type","anyof","SalesOrd"], 
						    			      "AND", 
						    			      ["mainline","is","T"]
						    			 ];
		    		
		    		//Add the customer alias as a filter if required
		    		//
		    		if(customerAlias != null && customerAlias != '')
		    			{
		    				filterArray.push("AND", ["customer.custentity_celigo_etail_cust_id","is",customerAlias]);
		    			}
		    		
		    		//Add the order alias as a filter if required
		    		//
		    		if(orderAlias != null && orderAlias != '')
						{
							filterArray.push("AND", ["custbody_celigo_mag2_order_number","is",orderAlias]);
						}
		    		
		    		//Create the search
		    		//
		    		var salesorderSearchObj = search.create({
		    												type: 		"salesorder",
		    												filters:	filterArray,
														    columns:
														    			[
														    			 	search.createColumn({name: "trandate", label: "Date", sort: search.Sort.DESC}),
														    			 	search.createColumn({name: "tranid",   label: "Document Number"}),
														    			 	search.createColumn({name: "entity",   label: "Name"}),
														    			 	search.createColumn({name: "amount",   label: "Amount"}),
														    			    search.createColumn({name: "trantaxtotal", label: "Tax Total"}),
														    			    search.createColumn({name: "discountamount", label: "Amount Discount"}),
														    			    search.createColumn({name: "grossamount", label: "Amount (Gross)"}),
														    			    search.createColumn({name: "netamountnotax", label: "Amount (Net of Tax)"}),
														    			    search.createColumn({name: "currency", label: "Currency"}),
														    			    search.createColumn({name: "statusref", label: "Status"}),
														    			    search.createColumn({name: "shipmethod", label: "Ship Via"}),
														    			    search.createColumn({name: "paymentmethod", label: "Payment Method"}),
														    			    search.createColumn({name: "shippingcost", label: "Shipping Cost"}),
														    			    search.createColumn({name: "discountamount", label: "Amount Discount"}),
														    			    search.createColumn({name: "shipaddress1", label: "Shipping Address 1"}),
														    			    search.createColumn({name: "shipaddress2", label: "Shipping Address 2"}),
														    			    search.createColumn({name: "shipaddress3", label: "Shipping Address 3"}),
														    			    search.createColumn({name: "shipaddressee", label: "Shipping Addressee"}),
														    			    search.createColumn({name: "shippingattention", label: "Shipping Attention"}),
														    			    search.createColumn({name: "shipcity", label: "Shipping City"}),
														    			    search.createColumn({name: "shipcountry", label: "Shipping Country"}),
														    			    search.createColumn({name: "shipphone", label: "Shipping Phone"}),
														    			    search.createColumn({name: "shipstate", label: "Shipping State/Province"}),
														    			    search.createColumn({name: "shipzip", label: "Shipping Zip"}),
														    			    search.createColumn({name: "shipcountrycode", label: "Shipping Country Code"}),
														    			    search.createColumn({name: "billaddress1", label: "Billing Address 1"}),
														    			    search.createColumn({name: "billaddress2", label: "Billing Address 2"}),
														    			    search.createColumn({name: "billaddress3", label: "Billing Address 3"}),
														    			    search.createColumn({name: "billaddressee", label: "Billing Addressee"}),
														    			    search.createColumn({name: "billattention", label: "Billing Attention"}),
														    			    search.createColumn({name: "billcity", label: "Billing City"}),
														    			    search.createColumn({name: "billcountry", label: "Billing Country"}),
														    			    search.createColumn({name: "billcountrycode", label: "Billing Country Code"}),
														    			    search.createColumn({name: "billphone", label: "Billing Phone"}),
														    			    search.createColumn({name: "billstate", label: "Billing State/Province"}),
														    			    search.createColumn({name: "billzip", label: "Billing Zip"})
														    			 ]
											    			});
		    		
		    		//Get the total number of result lines
		    		//
		    		var searchResultCount = salesorderSearchObj.runPaged().count;
		    			
		    		//Get the results as paged data of "rowsPerPage" size
		    		//
		    		var pageData = salesorderSearchObj.runPaged({pageSize: rowsPerPage});
		
		    		var salesorderSearchResults 	= [];
		    		var pageNumber 					= startPage - 1;		//Pages are zero indexed
		    		
		    		//Loop to get the "numberOfPages" pages from the results
		    		//
		    		for (var pageCounter = 0; pageCounter < numberOfPages; pageCounter++) 
			    		{
		    				//Prevent us from going off the end of the page array
		    				//
		    				if(pageNumber < pageData.pageRanges.length)
		    					{
				    				var searchPage = pageData.fetch({index: pageNumber});	//Get the specific page number
				    				pageNumber++;											//Increment the page number
				    				
				    				salesorderSearchResults = salesorderSearchResults.concat(searchPage.data);	//Add the page data to the results array
		    					}
						}
		    		
		    		//We should now have all of the sales order data in the salesorderSearchResults array
		    		//
		    		for (var resultCounter = 0; resultCounter < salesorderSearchResults.length; resultCounter++) 
			    		{
			    			//Create a new response object to hold the 'header' data
		    				//
		    				var magentoResponse = new magentoResponseObj();
			    			
		    				//Populate the object fields
		    				//
		    				var shippingAdressee = salesorderSearchResults[resultCounter].getValue({name: "shipaddressee"});
		    				var saParts = shippingAdressee.split(' ');
		    				
		    				var billingAdressee = salesorderSearchResults[resultCounter].getValue({name: "billaddressee"});
		    				var baParts = billingAdressee.split(' ');
		    				
		    				magentoResponse.orderNumber				= salesorderSearchResults[resultCounter].getValue({name: "tranid"});
		    				magentoResponse.orderDate				= salesorderSearchResults[resultCounter].getValue({name: "trandate"});
		    				magentoResponse.shipToName				= '';
		    				magentoResponse.orderGrossValue			= Number(salesorderSearchResults[resultCounter].getValue({name: "grossamount"}));
		    				magentoResponse.currency				= salesorderSearchResults[resultCounter].getText({name: "currency"});
		    				magentoResponse.orderStatusMajorString	= salesorderSearchResults[resultCounter].getValue({name: "statusref"});
		    				magentoResponse.order_items				= [];
		    				magentoResponse.discountValue 			= Number(salesorderSearchResults[resultCounter].getValue({name: "discountamount"}));
		    				magentoResponse.billingAddress			= new addressObj(
																					'', 
																					salesorderSearchResults[resultCounter].getValue({name: "billaddress1"}), 
																					salesorderSearchResults[resultCounter].getValue({name: "billcity"}), 
																					salesorderSearchResults[resultCounter].getValue({name: "billcountrycode"}), 
																					salesorderSearchResults[resultCounter].getValue({name: "billzip"}), 
																					(baParts.length > 0 ? baParts[0] : ''), 
																					(baParts.length > 1 ? baParts[1] : ''), 
																					salesorderSearchResults[resultCounter].getValue({name: "billphone"})
																					);
		    				magentoResponse.shippingAddress			= new addressObj(
		    																		'', 
		    																		salesorderSearchResults[resultCounter].getValue({name: "shipaddress1"}), 
		    																		salesorderSearchResults[resultCounter].getValue({name: "shipcity"}), 
		    																		salesorderSearchResults[resultCounter].getValue({name: "shipcountrycode"}), 
		    																		salesorderSearchResults[resultCounter].getValue({name: "shipzip"}), 
		    																		(saParts.length > 0 ? saParts[0] : ''), 
		    																		(saParts.length > 1 ? saParts[1] : ''), 
		    																		salesorderSearchResults[resultCounter].getValue({name: "shipphone"})
		    																		);
		    				magentoResponse.deliveryGrossValue		= Number(salesorderSearchResults[resultCounter].getValue({name: "shippingcost"}));
		    				magentoResponse.orderNetValue			= Number(salesorderSearchResults[resultCounter].getValue({name: "netamountnotax"}));
		    				magentoResponse.orderTaxValue			= Number(salesorderSearchResults[resultCounter].getValue({name: "trantaxtotal"}));
		    				magentoResponse.shippingMethod			= salesorderSearchResults[resultCounter].getText({name: "shipmethod"});
		    				magentoResponse.paymentMethod			= salesorderSearchResults[resultCounter].getText({name: "paymentmethod"});
		    				
		    				//Get the sales order line data
		    				//
		    				var salesOrderId = salesorderSearchResults[resultCounter].id;
		    				
		    				var salesorderLineSearchObj = getResults(search.create({
														    					   type: 		"salesorder",
														    					   filters:
																	    					   [
																	    					      ["type","anyof","SalesOrd"], 
																	    					      "AND", 
																	    					      ["mainline","is","F"], 
																	    					      "AND", 
																	    					      ["taxline","is","F"], 
																	    					      "AND", 
																	    					      ["cogs","is","F"], 
																	    					      "AND", 
																	    					      ["shipping","is","F"], 
																	    					      "AND", 
																	    					      ["internalid","anyof",salesOrderId]
																	    					   ],
														    					   columns:
																	    					   [
																	    					      search.createColumn({name: "item", label: "Item"}),
																	    					      search.createColumn({name: "quantity", label: "Quantity"}),
																	    					      search.createColumn({name: "quantityshiprecv", label: "Quantity Fulfilled/Received"}),
																	    					      search.createColumn({name: "amount", label: "Amount"}),
																	    					      search.createColumn({name: "taxamount", label: "Amount (Tax)"}),
																	    					      search.createColumn({name: "salesdescription",join: "item",label: "Description"}),
																	    					      search.createColumn({name: "line", label: "Line ID"})
																	    					   ]
			    																	}));
		    					
		    				if(salesorderLineSearchObj != null && salesorderLineSearchObj.length > 0)
		    					{
		    						for (var soLine = 0; soLine < salesorderLineSearchObj.length; soLine++) 
			    						{
		    								var soLineItem 			= salesorderLineSearchObj[soLine].getText({name: "item"});
		    								var soLineNumber		= Number(salesorderLineSearchObj[soLine].getValue({name: "line"}));
		    								var soLineItemmDesc 	= salesorderLineSearchObj[soLine].getValue({name: "salesdescription",join: "item"});
			    							var soLineQty 			= Number(salesorderLineSearchObj[soLine].getValue({name: "quantity"}));
			    							var soLineShipped 		= Number(salesorderLineSearchObj[soLine].getValue({name: "quantityshiprecv"}));
			    							var soLineAmount 		= Number(salesorderLineSearchObj[soLine].getValue({name: "amount"}));
			    							var soLineTaxAmount		= Number(salesorderLineSearchObj[soLine].getValue({name: "taxamount"}));
											
			    							magentoResponse.order_items.push(new orderItemsObj(
			    																				soLineNumber, 
			    																				soLineItem, 
			    																				soLineItemmDesc, 
			    																				soLineQty, 
			    																				soLineShipped, 
			    																				Number(0), 
			    																				soLineAmount + soLineTaxAmount
			    																			));
										}
		    					}
		    				
		    				//Push the response object onto the return array
		    				//
		    				RestletResponseObj.push(magentoResponse);
			    		}
    			}
    		catch(err)
    			{
    				log.error({title: 'Unexpected error occured', details: err});
    			}
    	
    		return RestletResponseObj;
    	}

    
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
    
    
    //
    //Local object definitions
    //
    function magentoResponseObj()
    	{
    		this.orderNumber			= '';
    		this.orderDate				= null;
    		this.shipToName				= '';
    		this.orderGrossValue		= Number(0);
    		this.currency				= '';
    		this.orderStatusMajorString	= '';
    		this.order_items			= [];
    		this.discountValue 			= Number(0);
    		this.billingAddress			= new addressObj();
    		this.shippingAddress		= new addressObj();
    		this.deliveryGrossValue		= Number(0);
    		this.orderNetValue			= Number(0);
    		this.orderTaxValue			= Number(0);
    		this.shippingMethod			= '';
    		this.paymentMethod			= ''
    	}
    
    function addressObj(_addressType, _address1, _town, _countryCode, _postCode, _foreNames, _surname, _personalTel)
    	{
    		this.addressType			= _addressType;
    		this.address1				= _address1;
    		this.town					= _town;
    		this.countryCode			= _countryCode;
    		this.postCode				= _postCode;
    		this.foreNames				= _foreNames;
    		this.surname				= _surname;
    		this.personalTel			= _personalTel;
    	}
    
    function orderItemsObj(_itemNumber, _sku, _description, _quantity, _quantityDespatched, _discountValue, _grossValue)
	    {
	    	this.itemNumber				= _itemNumber;
	    	this.sku					= _sku;
	    	this.description			= _description;
	    	this.quantity				= _quantity;
	    	this.quantityDespatched		= _quantityDespatched;
	    	this.discountValue			= _discountValue;
	    	this.grossValue				= _grossValue;
	    }
    
    
    return {
	        'post': 	doPost
    		};
    
});
