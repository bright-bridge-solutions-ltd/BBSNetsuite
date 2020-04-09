/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
function(search) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	log.audit({
	    		title: 'CREATING CONSOLIDATED TENANTS REPORT'
	    	});
    		
    		// create search to find service data customers to create a report for
    		var serviceDataCustomerSearch = search.create({
    			type: 'customrecord_bbs_service_data',
    			
	    		filters: [{
	    			name: 'isinactive',
	    			operator: 'is',
	    			values: ['F']
	    		},
	    				/*{
	    			name: 'subsidiary',
	    			join: 'custrecord_bbs_service_data_customer_rec',
	    			operator: 'anyof',
	    			values: [subsidiary]
	    		},*/
	    				{
	    			name: 'custrecord_bbs_service_data_customer_rec',
	    			operator: 'anyof',
	    			values: [2846]
	    		},
		    			{
		    		name: 'custrecord_bbs_service_data_start_date',
		    		operator: 'notafter',
		    		values: ['lastmonth'] // lastmonth means end of last month
		    	},
		    			{
		    		name: 'custrecord_bbs_service_data_end_date',
		    		operator: 'notbefore',
		    		values: ['startoflastmonth']
		    	}],
		    	
		    	columns: [{
		    		name: 'parent',
		    		join: 'custrecord_bbs_service_data_customer_rec',
		    		summary: 'GROUP'	
		    	},
		    			{
		    		name: 'formulatext',
		    		formula: "CASE WHEN {custrecord_bbs_service_data_customer_rec.custentity_code_accountalias} IS NOT NULL THEN {custrecord_bbs_service_data_customer_rec.custentity_code_accountalias} ELSE {custrecord_bbs_service_data_customer_rec} END",
		    		summary: 'MAX'
		    	}],
    		});
    		
    		// process search results
			serviceDataCustomerSearch.run().each(function(result){
				
				log.debug({
					title: 'Result',
					details: result
				});
				
				
			});

    }

    return {
        execute: execute
    };
    
});
