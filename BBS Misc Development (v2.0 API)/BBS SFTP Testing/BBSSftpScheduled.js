/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/sftp'],
/**
 * @param {sftp} 
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
	    	var username = 'comet';
	    	var password = '2ed57edb53974831846251ac264932ef';
	    	var url = 'sftp.comet.co.uk';
	    	var port = 22;
	    	var directory = '.';
	    	var hostkey = 'AAAAB3NzaC1yc2EAAAADAQABAAABgQC0a/Ts9kjg5V11bTGZc5q7Y4yM1tZH/mXbsAeS6E7WAo/LrR6oTSYVs5KKtPTz3lzEW0GnieT4tF+Vkg1k0zkhWw4nAvnlTfRzVZM7gWn56YuV0UIV0pdp/ZVzVF2FH9CUmn9vURTUohjI55cLVIQqGJQM5lGIKNk45Pg4G33trS+XlLBpPVkV2q3se96SiTghsP1/i0Ge4KwbbWNCaQLX44YHuS7wk67Ju3pZ16E1YCIhiWQocPo3yxoOhX2lxpxO333C7pUwWFUBgyft3cnihtwmcn/wuCmGVaA5pbJxZ1jwqnVrO2ZRe3n5XJlRpYJVRBHaLKa9ix1fxne21awZBoDxn/42oX8dynnh5FqXYj2V9bAPoTW/ScjWD9fytFMSkPu0yev1i1GAgagcDKFr4/FFCnSkIHQn5pw22rGq5hAduNizavZFOc5gXGgrw/maD4gQC5amCv/KYfKfiRWaPQkAJq544RheArzlQ/SyAxRC1NAUaqEXae3NfFrenec=';	
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
