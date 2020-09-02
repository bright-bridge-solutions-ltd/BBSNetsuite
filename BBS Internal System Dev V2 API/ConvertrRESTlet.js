/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/record'],
function(record) {
   
    /**
     * Function called upon sending a GET request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.1
     */
    function doGet(requestParams){
    	
    	log.debug({
    		title: 'Script Check',
    		details: requestParams
    	});
    	
    	// declare and initialize variables
    	var returnMessage = null;
    	
    	// retrieve script parameters
    	var firstName 		= 	requestParams.firstname;
    	var lastName		=	requestParams.lastname;
    	var jobTitle		=	requestParams.jobtitle;
    	var companyName		=	requestParams.companyname;
    	var email			=	requestParams.email;
    	var phone			=	requestParams.phone;
    	var postcode		=	requestParams.postcode;
    	
    	try
    		{
    			// create a new lead record
    			var leadRecord = record.create({
    				type: record.Type.LEAD,
    				isDynamic: true
    			});
    			
    			// set fields on the lead record
    			leadRecord.setValue({
    				fieldId: 'subsidiary',
    				value: 6 // 6 = UK
    			});
    			
    			leadRecord.setValue({
    				fieldId: 'firstname',
    				value: firstName
    			});
    			
    			leadRecord.setValue({
    				fieldId: 'lastname',
    				value: lastName
    			});
    			
    			leadRecord.setValue({
    				fieldId: 'title',
    				value: jobTitle
    			});
    			
    			leadRecord.setValue({
    				fieldId: 'companyname',
    				value: companyName
    			});
    			
    			leadRecord.setValue({
    				fieldId: 'email',
    				value: email
    			});
    			
    			leadRecord.setValue({
    				fieldId: 'phone',
    				value: phone
    			});
    			
    			// create a new line in the addressbook
    			leadRecord.selectNewLine({
    				sublistId: 'addressbook'
    			});
    			
    			// set fields on the new line
    			leadRecord.setCurrentSublistValue({
    				sublistId: 'addressbook',
    				fieldId: 'defaultshipping',
    				value: true
    			});
    			
    			leadRecord.setCurrentSublistValue({
    				sublistId: 'addressbook',
    				fieldId: 'defaultbilling',
    				value: true
    			});
    			
    			// create address subrecord
    			var addressSubrecord = leadRecord.getCurrentSublistSubrecord({
    			    sublistId: 'addressbook',
    			    fieldId: 'addressbookaddress'
    			});
    			
    			// set fields on the address subrecord
    			addressSubrecord.setValue({
    				fieldId: 'zip',
    				value: postcode
    			});
    			
    			// save the changes to the address subrecord and sublist line
    			leadRecord.commitLine({
    				sublistId: 'addressbook'
    			});
    			
    			// save the lead record
    			var leadID = leadRecord.save();
    			
    			// set returnMessage
    			returnMessage = 'Lead Successfully Created - ' + leadID;
    			
    		}
    	catch(e)
    		{
    			// set value of returnMessage
    			returnMessage = e.message;
    		}				
    	
    	return returnMessage;

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
    	
    	// get the request body and convert to a JSON object
    	requestBody = JSON.parse(JSON.stringify(requestBody));
    	
    	// declare and initialize variables
    	var returnMessage = null;
    	
    	// retrieve values from the requestBody object
    	var firstName 		= 	requestBody.firstname;
    	var lastName		=	requestBody.lastname;
    	var jobTitle		=	requestBody.jobtitle;
    	var companyName		=	requestBody.companyname;
    	var email			=	requestBody.email;
    	var phone			=	requestBody.phone;
    	var postcode		=	requestBody.postcode;
    	
    	try
    		{
    			// create a new lead record
    			var leadRecord = record.create({
    				type: record.Type.LEAD,
    				isDynamic: true
    			});
    			
    			// set fields on the lead record
    			leadRecord.setValue({
    				fieldId: 'subsidiary',
    				value: 6 // 6 = UK
    			});
    			
    			leadRecord.setValue({
    				fieldId: 'firstname',
    				value: firstName
    			});
    			
    			leadRecord.setValue({
    				fieldId: 'lastname',
    				value: lastName
    			});
    			
    			leadRecord.setValue({
    				fieldId: 'title',
    				value: jobTitle
    			});
    			
    			leadRecord.setValue({
    				fieldId: 'companyname',
    				value: companyName
    			});
    			
    			leadRecord.setValue({
    				fieldId: 'email',
    				value: email
    			});
    			
    			leadRecord.setValue({
    				fieldId: 'phone',
    				value: phone
    			});
    			
    			// create a new line in the addressbook
    			leadRecord.selectNewLine({
    				sublistId: 'addressbook'
    			});
    			
    			// set fields on the new line
    			leadRecord.setCurrentSublistValue({
    				sublistId: 'addressbook',
    				fieldId: 'defaultshipping',
    				value: true
    			});
    			
    			leadRecord.setCurrentSublistValue({
    				sublistId: 'addressbook',
    				fieldId: 'defaultbilling',
    				value: true
    			});
    			
    			// create address subrecord
    			var addressSubrecord = leadRecord.getCurrentSublistSubrecord({
    			    sublistId: 'addressbook',
    			    fieldId: 'addressbookaddress'
    			});
    			
    			// set fields on the address subrecord
    			addressSubrecord.setValue({
    				fieldId: 'zip',
    				value: postcode
    			});
    			
    			// save the changes to the address subrecord and sublist line
    			leadRecord.commitLine({
    				sublistId: 'addressbook'
    			});
    			
    			// save the lead record
    			var leadID = leadRecord.save();
    			
    			// set returnMessage
    			returnMessage = 'Lead Successfully Created - ' + leadID;
    			
    		}
    	catch(e)
    		{
    			// set value of returnMessage
    			returnMessage = e.message;
    		}				
    	
    	return returnMessage;

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
        'put': doPut,
        'post': doPost,
        'delete': doDelete
    };
    
});
