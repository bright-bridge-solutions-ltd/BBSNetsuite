

require(['N/xml', 'N/file'], function(xml, file) {

var xmlFileContent = file.load({id: 6937}).getContents();

var xmlDocument = xml.Parser.fromString({text: xmlFileContent});

var orderHeaderNode = xml.XPath.select({node: xmlDocument,xpath: '/*'});

var output = {};

processNodes(orderHeaderNode, '', output, false);

var z = '';

function processChildNodes(_childNodes)
{
	var retValue = false;

	for(var int2=0; int2< _childNodes.length; int2++)
		{
			if(_childNodes[int2].nodeType != 'TEXT_NODE')
				{
					retValue = true;
				}
		}

	return retValue;
}

function processNodes(_nodes, _prefix, _output, _isArray, _arrayIndex)
{


	for(var int=0; int< _nodes.length; int++)
	{
          var nodeType = _nodes[int].nodeType;

          if(nodeType != 'TEXT_NODE')
          {
				
				_arrayIndex++;
			  	var a = _nodes[int].nodeName;
			  	var b = _nodes[int].textContent;
			  	var c = _nodes[int].attributes;



			  var childNodes = _nodes[int].childNodes;

			  if(processChildNodes(childNodes))
				  {
				  	  if(_prefix == '')
				  	  	{
				  	  		_output[a] = {};
				  	  		processNodes(childNodes, a, _output, false, -1);
				  	  	}
				  	  else
				  	  	{
				  	  		var isArray = false;
				  	  		var arrayIndex = -1;

				  	  		if(_isArray)
				  	  			{
				  	  				var cmd = 'if(_output.' + _prefix + '.length <= ' + _arrayIndex + '){_output.' + _prefix + '.push(new Object())}';
				  	  				
				  	  				eval(cmd);
				  	  				var path =  _prefix + '[' + _arrayIndex + ']' + '.' + a;
				  	  			}
				  	  		else
				  	  			{
				  	  				var path = _prefix + '.' + a;
				  	  			}
				  	  		

				  	  		if(a == 'OrderLines' || a == 'Suppliers')
				  	  			{
				  	  				
									//var cmd = "_output." + path + " = Array.apply(null, Array(10)).map(function () {return new Object();})";
									var cmd = "_output." + path + " = []";
									isArray = true;
									//arrayIndex++;

									//path += '[0]';
				  	  			}
				  	  		else
					  	  		{

					  	  			var cmd = "_output." + path + " = {}";

					  	  			
					  	  		}
					  	  		
				  	  		eval(cmd);

					//  	  	for(var attribute in c)
					//		    {
					//		       var attributeValue = _nodes[int].getAttribute({name : attribute});
					//		       var attributeName = '@' + attribute;
					//		       var cmd = "_output." + path + "." + attributeName + " = {}" ;
					//		       eval(cmd);
					//		    }
				  	  	
				  	  		processNodes(childNodes, path, _output, isArray, arrayIndex);
				  	  	}
					
				  }
				else
					{
						var path = _prefix + '.' + a;
						var value = b;
						var pathParts = path.split('.');

						var cmd = "_output." + path + " = '" + value + "'";
						eval(cmd);

						log.debug({title: path + ' = ' + value});
					}

			  
	    }

	}


}

});
