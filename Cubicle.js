(function (global, globalName) {
    var workers = {};

    var isFunction = function (variable) {
        return (typeof variable === "function");
    };

    var announceWorker = function (cubicleName, worker, reigsterToGlobal) {

        var namespaceParts = cubicleName.split('.'),
            rootObject = (reigsterToGlobal === true) ? global : workers;

        for (var j = 0; j < namespaceParts.length - 1; j++) {
            var currentPart = namespaceParts[j],
                ns = rootObject[currentPart];
            if (!ns) {
                ns = rootObject[currentPart] = {};
            }
            rootObject = ns;
        }

        rootObject[namespaceParts[namespaceParts.length - 1]] = worker;

        return worker;
    };

    var inviteWorker = function (cubicleName) {
        var namespaceParts = cubicleName.split('.'),
            rootObject = workers;

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

    var Cubicle = function () {
        var args = arguments,
            len = args.length,
            i = 0;

        for (i = 0; i < len; i++) {
            var callback = args[i];
            if (isFunction(callback)) {
                var f = function () { },
                    worker = callback.apply(global, [inviteWorker, announceWorker]);
                    
                if (worker) {
                    if (worker.init && isFunction(worker.init)) {
                        worker.init();
                    }
                    else if(worker.constructor.name == "Promise"){
                        worker.then(function(actualWorker){
                            if(actualWorker){
                                if(actualWorker.init && isFunction(actualWorker.init)){
                                    actualWorker.init();
                                }
                            }
                        });
                    }
                }
            }
        }
    };

    Cubicle(function(invite, announce){
        return announce("messaging", {
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
    
    //#nrip - "Cubicle" still clutters the global namespace :P
    global[globalName] = Cubicle;
})(this, "Cubicle");

