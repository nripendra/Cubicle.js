(function (global, globalName) {
    'use strict';
    var workers = {},
        isFunction = function (variable) {
            return (typeof variable === "function");
        },
        announceWorker = function (cubicleName, worker, reigsterToGlobal) {

            var j,
                namespaceParts = cubicleName.split('.'),
                rootObject = (reigsterToGlobal === true) ? global : workers,
                currentPart,
                ns;

            for (j = 0; j < namespaceParts.length - 1; j++) {
                currentPart = namespaceParts[j];
                ns = rootObject[currentPart];
                if (!ns) {
                    ns = rootObject[currentPart] = {};
                }
                rootObject = ns;
            }

            rootObject[namespaceParts[namespaceParts.length - 1]] = worker;

            return worker;
        },
        inviteWorker = function (cubicleName) {
            var j,
                namespaceParts = cubicleName.split('.'),
                rootObject = workers,
                currentPart,
                ns;

            for (j = 0; j < namespaceParts.length; j++) {
                currentPart = namespaceParts[j];
                ns = rootObject[currentPart];

                rootObject = ns;

                if (!ns) {
                    break;
                }
            }
            return rootObject;
        },
        cubicle = function () {
            var args = arguments,
                len = args.length,
                i = 0,
                callback,
                worker,
                processActualWorker = function (actualWorker) {
                    if (actualWorker) {
                        if (actualWorker.init && isFunction(actualWorker.init)) {
                            actualWorker.init();
                        }
                    }
                };

            for (i = 0; i < len; i++) {
                callback = args[i];
                if (isFunction(callback)) {
                    worker = callback.apply(global, [inviteWorker, announceWorker]);
                    if (worker) {
                        if (worker.init && isFunction(worker.init)) {
                            worker.init();
                        } else if (worker.constructor.name === "Promise") {
                            worker.then(processActualWorker);
                        }
                    }
                }
            }
        };
    /*jslint unparam: true, node: true */
    cubicle(function (invite, announce) {
        return announce("messaging", {
            init: function () {
                this.list = [];
            },
            listen: function (channel, obj, callback) {
                this.list.push({"channel": channel, "context": obj, "callback": callback});
            },
            unlisten: function (channel, obj) {
                var listener, i, len;
                for (i = 0, len = this.list.length; i < len; i++) {
                    listener = this.list[i];
                    if (listener.channel === channel && listener.context === obj) {
                        this.list.splice(i, 1);
                        return true;
                    }
                }
                return false;
            },
            publish: function (channel, message) {
                var listener, i, len;
                for (i = 0, len = this.list.length; i < len; i++) {
                    listener = this.list[i];
                    if (listener.channel === channel) {
                        listener.callback.apply(listener.context, [message]);
                    }
                }
            }
        });
    });
    //#nrip - "cubicle" still clutters the global namespace :P
    global[globalName] = cubicle;
}(this, "cubicle"));

