/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Dec 2017     cedricgriffiths
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function myCatalogueScheduled(type) 
{
	
	//Read in the parameter containing the parent child object
	//
	var context = nlapiGetContext();
	var idString = context.getSetting('SCRIPT', 'custscript_bbs_add_my_cat_ids');
	var customerId = context.getSetting('SCRIPT', 'custscript_bbs_add_my_cat_cust');
	var ids = JSON.parse(idString);
	
	//Initialise local variables
	//
	var usersEmail = context.getUser();
	var emailText = 'The selected "My Catalogue" records have now been added\n';
	
	for (var int = 0; int < ids.length; int++) 
		{
			checkResources();
			
			var id = ids[int];
			
			try
				{
					var myCatRecord = nlapiCreateRecord('customrecord_bbs_customer_web_product');
					myCatRecord.setFieldValue('custrecord_bbs_web_product_item', id);
					myCatRecord.setFieldValue('custrecord_bbs_web_product_customer', customerId);
					
					nlapiSubmitRecord(myCatRecord, true, true);
				}
			catch(err)
				{
					nlapiLogExecution('ERROR', 'Error add My Catalogue record product id = ' + id, err.message);
				}
		}
	
	//Send the email to the user to say that we have finished
	//
	nlapiSendEmail(usersEmail, usersEmail, 'Add Items To My Catalogue', emailText);
}


//=====================================================================
//Functions
//=====================================================================
//
function checkResources()
{
	var remaining = parseInt(nlapiGetContext().getRemainingUsage());
	
	if(remaining < 100)
		{
			nlapiYieldScript();
		}
}


