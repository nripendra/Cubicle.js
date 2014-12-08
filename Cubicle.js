(function (global) {
	//Use register to 'register' a cubical, and require to retrieve a module.
	//Nested namespacing is supported
	//      register("MyCompany.ClassName", {init: function(){ ... }, add: function(a,b){ .. }}); 
	// and inside other modules to use MyCompany.ClassName do:
	//      var myCubicle = require("MyCompany.ClassName");
	//      myCubicle.add(1,2).. etc

	var cubicles = {}

	var isFunction = function (variable) {
		return (typeof variable === "function");
	};

	var register = function (cubicleName, cubicle, reigsterToGlobal) {

		var namespaceParts = cubicleName.split('.');

		var rootObject = (reigsterToGlobal === true) ? global : cubicles;

		for (var j = 0; j < namespaceParts.length - 1; j++) {
			var currentPart = namespaceParts[j];

			var ns = rootObject[currentPart];
			if (!ns) {
				ns = rootObject[currentPart] = {};
			}
			rootObject = ns;
		}

		rootObject[namespaceParts[namespaceParts.length - 1]] = cubicle;

		return cubicle;
	};

	var require = function (cubicleName) {
		var namespaceParts = cubicleName.split('.');
		var rootObject = cubicles;

		for (var j = 0; j < namespaceParts.length; j++) {
			var currentPart = namespaceParts[j];

			var ns = rootObject[currentPart];

			rootObject = ns;

			if (!ns) {
				break;
			}
		}
		return rootObject;
	};

	//#nrip - "Cubicle" still clutters the global namespace :P
	global["Cubicle"] = function () {
		var args = arguments;
		var len = args.length;
		var i = 0;

		for (i = 0; i < len; i++) {
			var callback = args[i];
			if (isFunction(callback)) {
				var f = function () { }
				var cubicle = callback.apply(global, [register, require]);
				if (cubicle) {
					if (cubicle.init && isFunction(cubicle.init)) {
						cubicle.init();
					}
				}
			}
		}
	};
})(this);

