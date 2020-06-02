/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/ui/serverWidget', 'N/record', 'N/url', 'N/redirect'],
function(runtime, ui, record, url, redirect) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
    	// retrieve script parameters
    	var currentScript = runtime.getCurrentScript();
    	
    	var folderID = currentScript.getParameter({
    		name: 'custscript_bbs_ad_hoc_folder'
    	});

    	// if the request method is 'GET'
    	if (context.request.method == 'GET')
			{
				// retrieve script parameters that have been passed to the Suitelet
    			var recordID = context.request.parameters.record;   			
    		
    			// create form
				var form = ui.createForm({
	                title: 'Upload Documents',
	                hideNavBar: true
	            });
				
				// set client script to run on the form
				form.clientScriptFileId = 406927;
				
				// add a file field to the form
				form.addField({
					type: ui.FieldType.FILE,
					id: 'custpage_file',
					label: 'Please Select a File' 
				});
				
				// check we have a record ID
				if (recordID)
					{
						// add a field to the form to store the record ID
						var recordIDField = form.addField({
							type: ui.FieldType.TEXT,
							id: 'custpage_record_id',
							label: 'Record ID'
						});
						
						// set the field to be inline
						recordIDField.updateDisplayType({
							displayType: ui.FieldDisplayType.INLINE
						});
						
						// set the default value of the field
						recordIDField.defaultValue = recordID;
						
						// add a 'Return to Record' button to the form
						form.addButton({
		   		 			id: 'custpage_return_to_record',
		   		 			label: 'Return to Record',
		   		 			functionName: 'returnToRecord(' + recordID + ')'
		   		 		});
					}
				
				// add submit button to the form
   		 		form.addSubmitButton({
   		 			label: 'Upload File'
   		 		});
				
				// create the page that the user will see
				context.response.writePage(form);
			}
    	// else if the request method is 'POST'
    	else if (context.request.method == 'POST')
	    	{
    			// declare and initialize variables
    			var fileID = null;
    		
    			// create form
				var form = ui.createForm({
					title: 'Upload Documents',
					hideNavBar: true
				});
				
				// add an Inline HTML field to the form
				var htmlField = form.addField({
					type: ui.FieldType.INLINEHTML,
					id: 'custpage_message',
					label: 'Message' 
				});
				
				// retrieve values from the Suitelet as entered by the user
				var file = context.request.files.custpage_file;
				var recordID = context.request.parameters.custpage_record_id;
				
				try
					{
		    			// set the folder where the file will be uploaded to
		    			file.folder = folderID;
		    			
		    			// save the file in the file cabinet
		    			fileID = file.save();
		    			
		    			// attach the file to the record
		    			record.attach({
		    				record: {
		    			        type: 'file',
		    			        id: fileID
		    			    },
		    			    to: {
		    			        type: 'customrecord_bbs_ad_hoc_site',
		    			        id: recordID
		    			    }
		    			});  			
					}
				catch(e)
					{
						// set default value of the htmlField field with an unsuccessful message
						htmlField.defaultValue = '<p><strong><span style="color:#FF0000;"><span style="font-size:20px;">An error occured uploading your file:</span></span></strong></p><br><p>' + e + '</p><br><p><strong><span style="color:#FF0000;"><span style="font-size:20px;">Please refresh the portlet and try again, and contact support if the problem persists.</span></span></strong></p>';		
					}
				
				// have we been able to upload the file?
				if (fileID)
					{
						// retrieve the URL of the record
			    		var recordURL = url.resolveRecord({
			    			recordType: 'customrecord_bbs_ad_hoc_site',
			    			recordId: recordID
			    		});
					
						// redirect the user back to the record
						redirect.redirect({
						    url: recordURL
						});
					}
				else
					{
						// create the page that the user will see (to display an error message)
						context.response.writePage(form);
					}		
	    	}
    }

    return {
        onRequest: onRequest
    };
    
});
