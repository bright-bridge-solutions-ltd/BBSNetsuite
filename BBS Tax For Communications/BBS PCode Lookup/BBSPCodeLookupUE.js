/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search', 'N/plugin', '../BBSTFCModules/libraryModule'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(record, runtime, search, plugin, libraryModule) 
{
   
     /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function pcodeLookupAS(scriptContext) 
	    {
    		//Only works in create or edit mode
    		//
    		if(scriptContext.type == 'create' || scriptContext.type == 'edit')
    			{
    				//Get the current record type & id
    				//
    				var currentRecord = scriptContext.newRecord;
    				
    				//Call the library routine to get the pcode
    				//
    				libraryModule.libLookupPCode(currentRecord, false); 	//Record to process, force override of existing pcode
    				
    			}
	    }

    return 	{
	        afterSubmit: 	pcodeLookupAS
    		};
    
});
