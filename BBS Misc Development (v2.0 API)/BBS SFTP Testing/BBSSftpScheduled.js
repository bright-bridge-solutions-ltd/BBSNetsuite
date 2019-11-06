/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/sftp'],
/**
 * @param {https} sftp
 */
function(sftp) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) 
	    {
	    	var username = 'Jitterbit.User';
	    	var password = '170fd4eaa2bf4b23b7668bbd551aca5c';
	    	var url = 'tbgftp.hostedftp.com';
	    	var port = 22;
	    	var directory = '/bl_dir_BrBr-2/large files';
	    	var hostkey = 'AAAAB3NzaC1yc2EAAAADAQABAAABAQC4ZIMHa5GWDaRmXAxhG8rAU6VrSNSanEDVk2O+h22dJIPZsaNl9jc0kll4WeB4hbsjISiyjAKRpK6oHiGF8I2ImRFFjGS7/fUnoLMPEWF2asJ6YnsTZvOX+wR1aCJNAg9nwhJVH6uznVmQ/M2ZrkY64G7C2UHY+hQYHouLRRdY6KiQuM4R/Z5SdN5BKjJhKLYHU5p/GaU7n/JwzkUHrVazdvNEZaQhiQpIK+YmnHZZAbyzY9WHn/lsQ4KskFkkadhUUKws2J8D0uIlLJZW0XwG2mpjXt+sTUfQdL94jWo+/sdvGdjdL0cHXVxOUpO7K07moIxsPqNvCNzZYBugm/0v';
	
	    	var objConnection = sftp.createConnection({
	    	    username: username,
	    	    passwordGuid: password,
	    	    url: url, 
	    	    directory: directory,
	    	    hostKey: hostkey
	    	});
	
	    	/*
	    	 * 
	    	 * DATE: "DATE",
		       DATE_DESC: "DATE_DESC",
		       SIZE: "SIZE",
		       SIZE_DESC: "SIZE_DESC",
		       NAME: "NAME",
		       NAME_DESC: "NAME_DESC"
	    	 */
	    	
	    	var list = objConnection.list({path: '.', sort: sftp.Sort.DATE});
	    	var z = '';
	    }

    return {
        execute: execute
    };
    
});
