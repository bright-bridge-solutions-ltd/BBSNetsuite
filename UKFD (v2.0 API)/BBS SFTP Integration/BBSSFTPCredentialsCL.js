/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url', 'N/https'],
function(url, https) {
    
	/**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
	function fieldChanged(scriptContext) {
    	
    	// if the supplier select field has been changed
    	if (scriptContext.fieldId == 'supplierselect')
    		{
    			// get the ID of the selected supplier
    			var supplierID = scriptContext.currentRecord.getValue({
    				fieldId: 'supplierselect'
    			});
    			
    			// reload the Suitelet and pass the supplierID as a parameter
    			var suiteletURL = url.resolveScript({
					scriptId: 'customscript_bbs_sftp_credentials_sl',
					deploymentId: 'customdeploy_bbs_sftp_credentials_sl',
					params: {
						supplier: supplierID
					}
				});
    			
    			window.onbeforeunload = null;
				window.location.href = suiteletURL;
    			
    		}
    	
    }

    return {
    	fieldChanged: fieldChanged
    };
    
});
