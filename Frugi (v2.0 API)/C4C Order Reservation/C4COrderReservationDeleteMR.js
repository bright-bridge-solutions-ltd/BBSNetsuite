/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/search', 'N/record', 'N/email'],
		
/**
 * @param {record} record
 * @param {search} search
 */
function(runtime, search, record, email) 
{

	// retrieve script parameters
	var currentScript = runtime.getCurrentScript();
	
	// script parameters are global variables so can be accessed throughout the script
	emailRecipient 	= currentScript.getParameter({name: 'custscript_c4c_order_res_email_rec'});
	emailSender 	= currentScript.getParameter({name: 'custscript_c4c_order_res_email_snd'});
	recordIds 		= JSON.parse(currentScript.getParameter({name: 'custscript_c4c_order_res_orders'}));

	
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
	    	try
	    		{
		    	//	log.debug({title: 'emailRecipient', details: emailRecipient});
		    	//	log.debug({title: 'emailSender', details: emailSender});
		    	//	log.debug({title: 'recordIds', details: recordIds});
	    		
			    	return search.create({
									   type: "orderreservation",
									   filters:
											   [
											      ["type","anyof","OrdResv"], 
											      "AND", 
											      ["mainline","is","F"],
											      "AND",
											      ["internalid","anyof", recordIds]
											   ],
									   columns:
											   [
											      search.createColumn({name: "internalid", label: "Internal Id"})
											   ]
										});
	    		}
	    	catch(err)
	    		{
	    			log.error({title: 'Unexpected error in getInputData section', details: err});
	    		}
    	}

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) 
    	{
	    	try
				{
			    	// retrieve search results
			    	var searchResult = JSON.parse(context.value);
			    	
			    	// get the internal ID of the record from the search results
					var recordID = searchResult.id;
				
					try
						{
							record.delete({type: 'orderreservation', id: recordID});
							
							context.write({
											key: 	recordID,
											value: 	'Order Reservation (Internal Id ' + recordID + ') Deleted Ok'
											});
			
						}
					catch (err)
						{
							//log.error({title: 'Failed to Delete Order Reservation with id = ' + recordID, details: err});
							
							context.write({
											key: 	recordID,
											value: 'Order Reservation (Internal Id ' + recordID + ') Failed to delete - ' + err.message
											});
						}
				}
	    	catch(err)
	    		{
	    			log.error({title: 'Unexpected error in map section', details: err});
	    		}
    	}

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) 
	    {
	
	    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) 
    	{
	    	try
				{
			    	var emailBody 		= 'Results of deletion request for Order Reservations\n\n\n';
			    	var emailSubject 	= 'Order Reservations Delete Status Report';
			    	
			    	// use summary.output which will contain list of key/value pairs that we have entered at end of map() function
			    	summary.output.iterator().each(function(key, value) 
			    			{	    		
					    		// add the value to the ended contracts table
			    				emailBody += value + '\n';
		    		
					    		// continue processing additional key/value pairs
					    		return true;
			    			});

				    try
				    	{
				        	// send email with a list of ended contracts
				    	  	email.send({
						    	  		author: 		emailSender,
						    	  		recipients: 	emailRecipient,
						    	  		subject: 		emailSubject,
						    	  		body: 			emailBody,
						    	  		});
				    	}
				    catch(err)
				    	{
				    		log.error({title: 'Error sending email', details: err});
				    	}
				}
	    	catch(err)
	    		{
	    			log.error({title: 'Unexpected error in summarize section', details: err});
	    		}
    	}
    
   

    return {
	        getInputData: 	getInputData,
	        map: 			map,
	        summarize: 		summarize
    		};
    
});
