/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
function(search, record) {

    function execute() {
    	
    	// declare variables
    	var success = 0;
    	var failure = 0;
    	
    	// create search to find expense reports to be updated
    	var expenseSearch = search.create({
			type: search.Type.EXPENSE_REPORT,
			
			columns: [{
				name: 'internalid'
			}],
			
			filters: [{
				name: 'mainline',
				operator: 'is',
				values: ['T']	
			},
					{
				name: 'status',
				operator: 'anyof',
				values: ['ExpRept:C','ExpRept:F'] // status is 'Pending Accounting Approval' or 'Approved by Accounting'
			},
					{
				name: 'custbody_bbs_exp_app_stage',
				operator: 'noneof',
				values: 4 // expense approval stage is not 'Fully Approved'
			}],
		});
    	
    	// process search results
    	var searchResults = expenseSearch.run().getRange({
    		start: 0,
    		end: 1000
    	});
    	
    	log.debug({
    		title: 'Search Results',
    		details: 'Search found ' + searchResults.length + ' results'
    	});
    	
    	for (var i = 0; i < searchResults.length; i++)
    		{
	    		// get the internal ID of the expense report
	    		var expRptID = searchResults[i].getValue({
	    			name: 'internalid'
	    		});
	    		
	    		log.debug({
	    			title: 'Search Result ' + i,
	    			details: 'Expense Report ID is ' + expRptID
	    		});
	    		
	    		try
	    			{
			    		// load the expense report record
			    		var expRptRec = record.load({
			    			type: record.Type.EXPENSE_REPORT,
			    			id: expRptID
			    		});
			    		
			    		// get the value of the supervisor approval and accounting approval fields from the record
			    		var supApr = expRptRec.getValue({
			    			fieldId: 'supervisorapproval'
			    		});
			    		
			    		var accApr = expRptRec.getValue({
			    			fieldId: 'accountingapproval'
			    		});
			    		
			    		// check if the supApr returns true but the accApr returns false
			    		if (supApr == true && accApr == false)
			    			{
				    			// set the Expense Approval Stage field to 'Pending Accounting Approval' (int ID 3)
								expRptRec.setValue({
									fieldId: 'custbody_bbs_exp_app_stage',
									value: 3
								});
			    			}
			    		else if (supApr == true && accApr == true) // if supApr AND accApr both return true
			    			{
			    				// set the Expense Approval Stage field to 'Fully Approved' (int ID 4)
			    				expRptRec.setValue({
			    					fieldId: 'custbody_bbs_exp_app_stage',
			    					value: 4
			    				});
			    			}
			    		
			    		// save the expense report record
			    		var recID = expRptRec.save();
			    		
			    		log.debug({
			    			title: 'Record Updated',
			    			details: expRptID + ' has been updated. There are still ' + (searchResults.length - (i+1)) + ' records to be processed'
			    		});
			    		
			    		success++;
	    			}
	    		catch (e)
	    			{
		    			log.debug({
			    			title: 'An error occured',
			    			details: 'There was an error updating record ' + expRptID + '. Error: ' + e + '. There are still ' + searchResults.length-i + ' records to be processed'
			    		});
		    			
		    			failure ++;
	    			}
    		}
    	
    	log.debug({
    		title: 'Script Complete',
    		details: 'Records processed: ' + searchResults.length + ' | Success: ' + success + ' | Failure: ' + failure
    	});

    }

    return {
        execute: execute
    };
    
});
