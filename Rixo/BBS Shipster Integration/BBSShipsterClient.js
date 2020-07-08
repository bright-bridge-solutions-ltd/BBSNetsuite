/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/url','N/currentRecord'],

function(url, currentRecord) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function shipsterPI(scriptContext) 
	    {
	
	    }

    function exportShipster(_id)
	    {
    		debugger;
    		
    		try
    			{		
    				var scriptUrl = url.resolveScript({scriptId: 'customscript_bbs_shipster_download_su', deploymentId: 'customdeploy_bbs_shipster_download_su'});
    				scriptUrl += '&id=' + _id;
    				window.open(scriptUrl, '_self', 'Export To Shipster', 'toolbar=no, scrollbars=no, resizable=no');

    			}
		    catch(e) 
		    	{
		            if (e instanceof nlobjError) 
		            	{
		                	alert(e.getCode() + '\n' + e.getDetails());
		            	}
		            else 
		            	{
		                	alert(e.toString());
		            	}
		        }
	    }

    return {
        	pageInit: 			shipsterPI,
        	exportShipster:		exportShipster,
    		};
    
});
