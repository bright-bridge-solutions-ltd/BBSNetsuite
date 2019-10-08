/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/config', 'N/email', 'N/error', 'N/file', 'N/record', 'N/render', 'N/runtime', 'N/search'],
/**
 * @param {config} config
 * @param {email} email
 * @param {error} error
 * @param {file} file
 * @param {record} record
 * @param {render} render
 * @param {runtime} runtime
 * @param {search} search
 */
function(config, email, error, file, record, render, runtime, search) {
   
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
    	//Get script parameter
    	var contracts = runtime.getCurrentScript().getParameter({
	    															name: 'custscript_contract_array'
	    															});
    	
    	log.debug({
					title: 		'JSON String',
					details: 	contracts
					});
		    	
    	var contractArray = JSON.parse(contracts);
    	
    	return search.create({
    		   type: "customrecord_bbs_contract",
    		   filters:
    		   [
    		      ["internalid","anyof",contractArray]
    		   ],
    		   columns:
    		   [
    		      search.createColumn({name: "custrecord_bbs_contract_billing_level", label: "Billing Level"}),
    		      search.createColumn({name: "custrecord_bbs_contract_billing_type", label: "Billing Type"}),
    		      search.createColumn({name: "custrecord_bbs_contract_end_date", label: "Contract End Date"}),
    		      search.createColumn({name: "custrecord_bbs_contract_start_date", label: "Contract Start Date"}),
    		      search.createColumn({name: "custrecord_bbs_contract_term", label: "Contract Term in Months"}),
    		      search.createColumn({name: "custrecord_bbs_contract_currency", label: "Currency"}),
    		      search.createColumn({name: "custrecord_bbs_contract_customer", label: "Customer"}),
    		      search.createColumn({name: "created", label: "Date Created"}),
    		      search.createColumn({name: "custrecord_bbs_contract_min_ann_use", label: "Minimum Annual Usage"}),
    		      search.createColumn({name: "custrecord_bbs_contract_mon_min_use", label: "Minimum Monthly Usage"}),
    		      search.createColumn({name: "custrecord_bbs_contract_qu_min_use", label: "Minimum Quarterly Usage"}),
    		      search.createColumn({name: "custrecord_bbs_contract_mgmt_fee_amt", label: "Monthly Management Fee Amount"}),
    		      search.createColumn({name: "custrecord_bbs_contract_setup_fee_amount", label: "Setup Fee Amount"}),
    		      search.createColumn({name: "custrecord_bbs_contract_status", label: "Status"}),
    		      search.createColumn({name: "custrecord_bbs_contract_total_usage", label: "Total Contract Usage - To Date"})
    		   ]
    		});
    		
    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) 
    {

    }



    return {
        	getInputData: 	getInputData,
        	map: 			map
    		};
    
});
