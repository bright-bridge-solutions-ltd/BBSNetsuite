/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/ui/dialog'],
function(url, dialog) {
    
    function pageInit(scriptContext) {
    	
    }
	
	function createQuote(customer, event, contact) {
		
		// check if the customer parameter returns a value
		if (customer)
			{
				// get the URL to create a new quote record
				var newQuoteURL = url.resolveTaskLink({
					id: 'EDIT_TRAN_ESTIMATE',
					params: {
						entity: customer,
						custbody_acc_tran_contact: contact,
						custbody_bbs_related_event: event
					}
				});
				
				// open a new quote in a new tab/window
				window.open(newQuoteURL);
			}
		else // customer parameter is empty
			{
				// show an alert to the user
				dialog.alert({
					title: '⚠️ Error',
					message: 'A new quote cannot be created as this event record is not associated to a customer'
				});
			}
	}

function createCase(customer, subject, contact, user, email, phone, subsidiary, specialist) {
		
		// check if the customer parameter returns a value
		if (customer)
			{
				var params = {};

				params['record.company'] 									= 		customer;
				params['record.title'] 										=  		subject;
				params['record.contact'] 									=  		contact;
				params['record.profile'] 									= 		6;
				params['record.category'] 									= 		22;
				params['record.assigned'] 									= 		user;
				params['record.priority'] 									= 		2;
				params['record.status'] 									= 		5;
				params['record.custevent_acc_send_assessment_confirm'] 		= 		'T';
				params['record.custevent_acc_product_specialist'] 			= 		specialist;
				params['record.phone'] 										= 		phone;
				params['record.email'] 										= 		email;
				
				// get the URL to create a new quote record
				var newQuoteURL = url.resolveTaskLink({
														id: 		'EDIT_SUPPORTCASE',
														params: 	params
													});
				
				// open a new quote in a new tab/window
				window.open(newQuoteURL);
			}
		else // customer parameter is empty
			{
				// show an alert to the user
				dialog.alert({
					title: '⚠️ Error',
					message: 'A new case cannot be created as this event record is not associated to a customer'
				});
			}
	}

    return {
    	pageInit: 		pageInit,
    	createQuote: 	createQuote,
    	createCase:		createCase
    };
    
});
