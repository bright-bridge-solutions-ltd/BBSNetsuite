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
	var idString = context.getSetting('SCRIPT', 'custscript_bbs_deldete_my_cat_ids');
	var ids = JSON.parse(idString);
	
	//Initialise local variables
	//
	var usersEmail = context.getUser();
	var emailText = 'The selected "My Catalogue" records have now been deleted\n';
	
	for (var int = 0; int < ids.length; int++) 
		{
			checkResources();
			
			var myCatId = ids[int];
			
			try
				{
					nlapiDeleteRecord('customrecord_bbs_customer_web_product', myCatId);
				}
			catch(err)
				{
					nlapiLogExecution('ERROR', 'Error deleting My Catalogue record id = ' + myCatId, err.message);
				}
		}
	
	//Send the email to the user to say that we have finished
	//
	nlapiSendEmail(usersEmail, usersEmail, 'My Catalogue Items Deletion', emailText);
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


