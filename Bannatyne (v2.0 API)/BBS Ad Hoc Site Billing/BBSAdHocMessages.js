/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record'],
function(search, record) {
   
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
    	
    	// check that the record is being created
    	if (scriptContext.type == scriptContext.UserEventType.CREATE)
    		{
		    	// get the current record
		    	var currentRecord = scriptContext.newRecord;
		    	
		    	// get the record type that the email message is attached to
		    	var recordType = currentRecord.getValue({
		    		fieldId: 'recordtype'
		    	});
		    	
		    	// check the record type is 406 (Ad Hoc Site Record)
		    	if (recordType == 406)
		    		{
		    			// get the internal ID of the message
		    			var messageID = currentRecord.id;
		
		    			// get the internal ID of the ad hoc site record
		    			var adHocSiteRecordID = currentRecord.getValue({
		    				fieldId: 'record'
		    			});
		    			
		    			// run search to find IDs of files attached to the message
		    			var files = searchFiles(messageID);
		    			
		    			// check that we have some files
		    			if (files.length > 0)
		    				{
		    					// call function to attach the files to the ad hoc site record
		    					attachFiles(adHocSiteRecordID, files);
		    				}	
		    		}
    		}

    }
    
    // ================================================
    // FUNCTION TO SEARCH FILES ATTACHED TO THE MESSAGE
    // ================================================
    
    function searchFiles(messageID)
	    {
	    	// create array to hold file IDs
			var files = new Array();
			
			// create search to find file IDs for the given messages
			var fileSearch = search.create({
				type: search.Type.MESSAGE,
				
				filters: [{
					name: 'internalid',
					operator: 'anyof',
					values: [messageID]
				}],
				
				columns: [{
					name: 'internalid',
					join: 'attachments'
				}],
				
			});
			
			// run search and process results
			fileSearch.run().each(function(result){
				
				// get the file ID
				var fileID = result.getValue({
					name: 'internalid',
					join: 'attachments'
				});
				
				// push the file ID to the files array
				files.push(fileID);
				
				// continue processing search results
				return true;
				
			});
			
			// return files array
			return files;
	    }
    
    // ==================================================
    // FUNCTION TO ATTACH FILES TO THE AD HOC SITE RECORD
    // ==================================================
    
    function attachFiles(adHocSiteRecordID, files)
		{
			// loop through files array
			for (var i = 0; i < files.length; i++)
				{
					try
						{
							// attach the file to the ad hoc site record
	    					record.attach({
								record: {
									type: 'file',
									id: files[i]
								},
								to: {
									type: 'customrecord_bbs_ad_hoc_site',
									id: adHocSiteRecordID
								}
							});
						}
					catch(e)
						{
							log.error({
								title: 'Unable to Attach File',
								details: 'Record ID: ' + adHocSiteRecordID + '<br>Error: ' + e
							});
						}
				}
		}

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
