/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record'],

function(record) {

    function beforeSubmit(context) {

    	// check if the record is being edited
		if (context.type == 'edit')
			{
				var soRec = context.newRecord;
			
				// update the current version field on the record
				var currVer = soRec.getValue({
					fieldId: 'custbody_cle_pro_version'
				});
				
				currVer = parseInt(currVer)+1;
				
				// set 
				soRec.setValue({
					fieldId: 'custbody_cle_pro_version',
					value: currVer
				});
			}
    }

    return {
        beforeSubmit: beforeSubmit,
    };
    
});