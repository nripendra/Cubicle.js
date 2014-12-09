(function (global) {
    var cubicles = {};

    var isFunction = function (variable) {
        return (typeof variable === "function");
    };

    var exportCubicle = function (cubicleName, cubicle, reigsterToGlobal) {

        var namespaceParts = cubicleName.split('.'),
            rootObject = (reigsterToGlobal === true) ? global : cubicles;

        for (var j = 0; j < namespaceParts.length - 1; j++) {
            var currentPart = namespaceParts[j],
                ns = rootObject[currentPart];
            if (!ns) {
                ns = rootObject[currentPart] = {};
            }
            rootObject = ns;
        }

        rootObject[namespaceParts[namespaceParts.length - 1]] = cubicle;

        return cubicle;
    };

    var importCubicle = function (cubicleName) {
        var namespaceParts = cubicleName.split('.'),
            rootObject = cubicles;

        for (var j = 0; j < namespaceParts.length; j++) {
            var currentPart = namespaceParts[j],
                ns = rootObject[currentPart];

            rootObject = ns;

            if (!ns) {
                break;
            }
        }
        return rootObject;
    };

    //#nrip - "Cubicle" still clutters the global namespace :P
    global["Cubicle"] = function () {
        var args = arguments,
            len = args.length,
            i = 0;

        for (i = 0; i < len; i++) {
            var callback = args[i];
            if (isFunction(callback)) {
                var f = function () { },
                    cubicle = callback.apply(global, [importCubicle, exportCubicle]);
                    
                if (cubicle) {
                    if (cubicle.init && isFunction(cubicle.init)) {
                        cubicle.init();
                    }
                }
            }
        }
    };

    Cubicle(function(Import, Export){
        return Export("messaging", {
            init: function () {
                this._list = [];
            },
            listen: function(channel, obj, callback) {
                this._list.push({"channel": channel, "context": obj, "callback": callback});
            },
            unlisten: function(channel, obj ) {
                for( var i = 0, len = this._list.length; i < len; i++ ) {
                    var listener = this._list[i];
                    if(listener.channel === channel && listener.context === obj){
                        this._list.splice( i, 1 );
                        return true;
                    }
                }
                return false;
            },
            publish: function(channel, message) {
                for( var i = 0, len = this._list.length; i < len; i++ ) {
                    var listener = this._list[i];
                    if(listener.channel === channel){
                        listener.callback.apply(listener.context, [message]);
                    }
                }
            }
        });
    });	
})(this);

