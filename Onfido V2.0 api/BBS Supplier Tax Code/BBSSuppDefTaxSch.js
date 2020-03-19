/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/record', 'N/search'],
/**
 * @param {file} file
 * @param {record} record
 * @param {search} search
 */
function(file, record, search) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	// start the CSV file
    	var CSV = '"Supplier Name","Supplier ID","Subsidiary Name","Subsidiary ID","Default Tax Code"\r\n';
    	
    	// create search to find suppliers
    	var supplierSearch = search.create({
    		type: search.Type.VENDOR,
    		
    		filters: [{
    			name: 'isinactive',
    			operator: 'is',
    			values: ['F']
    		},
    				{
    			name: 'subsidiary',
    			operator: 'noneof',
    			values: ['5'] // 5 = UK
    		}],
    		
    		columns: [{
    			name: 'companyname'
    		},
    				{
    			name: 'subsidiary'
    		}],
    			
    	});
    	
    	// run search and process results
    	supplierSearch.run().each(function(result){
    		
    		// retrieve search results
    		var supplierID = result.id;
        	
    		var supplierName = result.getValue({
        		name: 'companyname'
        	});
    		
    		var subsidiaryID = result.getValue({
        		name: 'subsidiary'
    		});
    		
    		var subsidiaryName = result.getText({
        		name: 'subsidiary'
    		});
        	
        	log.audit({
        		title: 'Processing Supplier',
        		details: 'Name: ' + supplierName + '<br>ID: ' + supplierID + '<br>Subsidiary Name: ' + subsidiaryName + '<br>Subsidiary ID: ' + subsidiaryID
        	});
        	
        	try
        		{
        			// load the supplier record
	    			var supplierRecord = record.load({
	    				type: record.Type.VENDOR,
	    				id: supplierID
	    			});
	    			
	    			// get the default tax code from line 1 of the 'Tax Registrations' sublist
	    			var defaultTaxCode = supplierRecord.getSublistValue({
	    				sublistId: 'taxregistration',
	    				fieldId: 'custpage_taxreg_entitydeftaxcode',
	    				line: 0 // Line 1 of Sublist
	    			});
	    			
	    			// add the supplier details to the CSV
	    			CSV += supplierName + ',' + supplierID + ',' + subsidiaryName + ',' + subsidiaryID + ',' + defaultTaxCode;
	    			CSV += '\r\n';
        		}
        	catch(e)
        		{
        			log.error({
        				title: 'An error occured',
        				details: e
        			});
        		}
        	
        	// continue processing search results
        	return true;
    		
    	});
    	
    	// create a CSV file
    	var csvFile = file.create({
    		fileType: file.Type.CSV,
    		name: 'Supplier Default Tax Codes [Other Subs].csv',
    		contents: CSV,
    		folder: 21289
    	});
    	
    	// save the file
    	var fileID = csvFile.save();
    	
    	log.audit({
    		title: 'CSV File Saved',
    		details: fileID
    	});

    }

    return {
        execute: execute
    };
    
});
