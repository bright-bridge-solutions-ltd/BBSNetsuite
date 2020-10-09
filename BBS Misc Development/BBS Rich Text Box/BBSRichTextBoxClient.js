/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Oct 2020     cedricgriffiths
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type)
{
	var d = document;
	var sc2=d.createElement('script');
	            
	//<script src="https://cdn.tiny.cloud/1/kqdf15ccpr21jj9v56c5845m1h1m1dn9kpjv1qwp6ryd9v3t/tinymce/5/tinymce.min.js" referrerpolicy="origin"></script>
	//sc2.src = 'https://cloud.tinymce.com/stable/tinymce.min.js';
	//api key kqdf15ccpr21jj9v56c5845m1h1m1dn9kpjv1qwp6ryd9v3t
	
	sc2.src = 'https://cdn.tiny.cloud/1/kqdf15ccpr21jj9v56c5845m1h1m1dn9kpjv1qwp6ryd9v3t/tinymce/5/tinymce.min.js';
	d.getElementsByTagName('*')[1].appendChild(sc2);                       

	// unfortunately, the above happens asynchronously, so we need a mechanism for waiting until the library is loaded/processed
	// before we can begin using it; we use JavaScript’s setInterval() method, executing it every 10 milliseconds until we have success
	// and then clear it

	
	var t = setInterval(function() {
		try {
			  if (tinymce) {
					clearInterval(t);

					// initialize tinymce and tell it to target an existing text field
			 
					tinymce.init({selector: "textarea#custpage_text_box",
						  branding: false,
						  resize: 'both',
						  width: 600,
						  height: 300,
						  menubar: true,
						  plugins: 'a11ychecker advcode casechange formatpainter linkchecker autolink lists checklist media mediaembed pageembed permanentpen powerpaste table advtable tinymcespellchecker',
					      toolbar: 'a11ycheck addcomment showcomments casechange checklist code formatpainter pageembed permanentpen table'
					});
			  }
		} catch (e1) {
			  ;
		}
	},10);
}
