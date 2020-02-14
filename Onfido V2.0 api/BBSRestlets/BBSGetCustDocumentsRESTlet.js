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
    	var customer = requestParams.customerId;
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
    			if(!isNaN(customer))
    				{
		    			var accountId = configRecord.getValue({fieldId: 'companyid'});
		    			urlPrefix = 'https://' + accountId.replace('_','-') + '.app.netsuite.com/';
				    		
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
				    		      [["custrecord_bbs_contract_customer","anyof",customer], 		//Contract customer is the customer in question
				    		      "OR", 
				    		      ["custrecord_bbs_contract_customer.parent","anyof",customer]]	//Or the contract customer's parent is the customer in question
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
				    	
				    		//Get the count of records
				    		//
				    		//var searchResultCount = customrecord_bbs_contractSearchObj.runPaged().count;
				
				    		//Loop round the search results
				    		//
				    		customrecord_bbs_contractSearchObj.run().each(function(result)
				    			{
				    				var fileName = result.getValue({name: 'name', join: 'file'});
				    				var fileDescription = result.getValue({name: 'description', join: 'file'});
				    				var fileDate = result.getValue({name: 'created', join: 'file'});
				    				var fileUrl = urlPrefix + result.getValue({name: 'url', join: 'file'});
				    				
				    				//Add an entry to the output array
				    				//
				    				resultSet.push(new fileDescriptor(fileName, fileDescription, fileDate, fileUrl));
				    				
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
    function fileDescriptor(_name, _description, _date, _url)
    {
    	this.name = _name;
    	this.description = _description;
    	this.date = _date;
    	this.url = _url;    	
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
