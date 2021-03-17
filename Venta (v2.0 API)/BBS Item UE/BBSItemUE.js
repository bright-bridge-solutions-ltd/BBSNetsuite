/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime'],
function(runtime) {
	
	// ========================================
	// GLOBAL PARAMETER FOR NEXT COUNT INTERVAL
	// ========================================
	
	nextCountInterval = parseInt(runtime.getCurrentScript().getParameter({
		name: 'custscript_bbs_def_next_count_interval'
	}));
	
	// ==============================
	// CALCULATION OF NEXT COUNT DATE
	// ==============================
	
	nextCountDate = new Date(); // today
	nextCountDate.setDate(nextCountDate.getDate() + nextCountInterval);
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
    	
    	// check the record is being created
    	if (scriptContext.type == scriptContext.UserEventType.CREATE)
    		{
		    	// get the current record
		    	var currentRecord = scriptContext.newRecord;
		    	
		    	// get count of lines in the locations sublist
		    	var locations = currentRecord.getLineCount({
		    		sublistId: 'locations'
		    	});
		    	
		    	// loop through locations sublist
		    	for (var i = 0; i < locations; i++)
		    		{
		    			// set the next count date and count interval fields
		    			currentRecord.setSublistValue({
		    				sublistId: 'locations',
		    				fieldId: 'nextinvtcountdate',
		    				value: nextCountDate,
		    				line: i
		    			});
		    		
		    			currentRecord.setSublistValue({
		    				sublistId: 'locations',
		    				fieldId: 'invtcountinterval',
		    				value: nextCountInterval,
		    				line: i
		    			});
		    		}
    		}

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {

    }

    return {
        beforeLoad: beforeLoad
    };
    
});
