/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', 'N/sftp'],
/**
 * @param {record} record
 * @param {search} search
 */
function(search, sftp) {
	
	function getSftpDetails(supplierID) {
    	
    	// declare and initialize variables
    	var endpoint 		= null;
    	var username 		= null;
    	var password 		= null;
    	var hostKey			= null;
    	var portNumber		= null;
    	var outDirectory	= null;
    	var inDirectory		= null;
    	
    	// search for Supplier SFTP Detail records
    	search.create({
    		type: 'customrecord_bbs_supplier_sftp',
    		
    		filters: [{
    			name: 'isinactive',
    			operator: search.Operator.IS,
    			values: ['F']
    		},
    				{
    			name: 'custrecord_bbs_supplier_sftp_supplier',
    			operator: search.Operator.ANYOF,
    			values: [supplierID]
    		}],
    		
    		columns: [{
    			name: 'custrecord_bbs_supplier_sftp_endpoint'
    		},
    				{
    			name: 'custrecord_bbs_supplier_sftp_username'
    		},
    				{
    			name: 'custrecord_bbs_supplier_sftp_password'
    		},
    				{
    			name: 'custrecord_bbs_supplier_sftp_host_key'
    		},
    				{
    			name: 'custrecord_bbs_supplier_sftp_port_number'
    		},
    				{
    			name: 'custrecord_bbs_supplier_sftp_out_folder'
    		},
    				{
    			name: 'custrecord_bbs_supplier_sftp_in_folder'
    		}],
    		
    	}).run().each(function(result){
    		
    		// get the SFTP details from the search result
    		endpoint = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_endpoint'
    		});
    		
    		username = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_username'
    		});
    		
    		password = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_password'
    		});
    		
    		hostKey = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_host_key'
    		});
    		
    		portNumber = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_port_number'
    		});
    		
    		outDirectory = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_out_folder'
    		});
    		
    		inDirectory = result.getValue({
    			name: 'custrecord_bbs_supplier_sftp_in_folder'
    		});
    		
    	});
    	
    	// return values to the main script function
    	return {
    		endpoint:		endpoint,
    		username:		username,
    		password:		password,
    		hostKey:		hostKey,
    		portNumber:		portNumber,
    		outDirectory:	outDirectory,
    		inDirectory:	inDirectory
    	}
    	
    }
    
    return {
    	getSftpDetails:	getSftpDetails
    };
    
});
