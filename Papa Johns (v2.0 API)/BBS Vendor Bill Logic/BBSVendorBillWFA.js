/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search'],
function(search) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
    	
    	// get the current record
    	var currentRecord = scriptContext.newRecord;
    	
    	// get the supplier ID
    	var supplierID = currentRecord.getValue({
    		fieldId: 'entity'
    	});
    	
    	// call function to return the supplier subcategories
    	var supplierSubcategories = getSupplierSubcategories(supplierID);
    	
    	return supplierSubcategories;

    }
    
    // ================================================
    // FUNCTION TO LOOKUP FIELDS ON THE SUPPLIER RECORD
    // ================================================
    
    function getSupplierSubcategories(supplierID) {
    	
    	// declare and initialize variables
    	var returnString = '';
    	
    	// lookup fields on the supplier record
    	var supplierSubcategories = search.lookupFields({
    		type: search.Type.VENDOR,
    		id: supplierID,
    		columns: ['custentity_bbs_sup_sub_cat']
    	}).custentity_bbs_sup_sub_cat;
    	
    	// if the supplier has any subcategories selected
    	if (supplierSubcategories.length > 0)
    		{
    			// loop through supplier subcategories
    			for (var i = 0; i < supplierSubcategories.length; i++)
    				{
	    				// if this is NOT the first item in the array
						if (i > 0)
							{
								// add a comma to the returnString
								returnString += ',';
							}
    				
    					// get the subcategory name and add to the return string
    					returnString += supplierSubcategories[i].text;
    				}
    		}
    	
    	return returnString;
    	
    }

    return {
        onAction : onAction
    };
    
});
