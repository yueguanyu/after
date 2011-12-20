!function _anonymousWrapper() {
    "use strict";   

    var slice = [].slice;

    after.forEach = forEach;
    after.each = forEach;
    after.map = map;

    if (typeof module !== "undefined" && module.exports) {
        module.exports = after;
    } else {
        window.after = after;
    }

    function after(count, callback) {
        var counter = 0,
            results = [];

        if (count <= 0)  {
            return callback();
        }

        return afterProxy;

        function afterProxy(arg) {
            if (arguments.length === 1) {
                results.push(arg);
            } else if (arguments.length > 1) {
                results.push(slice.call(arguments));
            }

            counter++;

            if (counter >= count) {
                callback.apply(this, results);
            }
        }
    }

    function forEach(set, iterator, context, callback) {
        if (typeof context === "function") {
            callback = context;
            context = undefined;
        }
        var keys = Object.keys(set),
            next = after(keys.length, callCallback);

        keys.forEach(proxyIterator);
        
        function proxyIterator(keyName) {
            iterator.call(context, set[keyName], keyName, proxyCallback);
        }

        function proxyCallback(err) {
            err ? next(err) : next();
        }

        function callCallback(err) {
            err ? callback(err) : callback(null);
        }
    }

    function map(set, iterator, context, callback) {
        if (typeof context === "function") {
            callback = context;
            context = undefined;
        }

        var keys = Object.keys(set),
            result = Array.isArray(set) ? [] : {},
            next = after(keys.length, callCallback);

        keys.forEach(proxyIterator);

        function proxyIterator(keyName) {
            iterator.call(context, set[keyName], keyName, proxyCallback);

            function proxyCallback(err, value) {
                if (err) {
                    return next(err);
                }
                result[keyName] = value;
                next();
            }
        }

        function callCallback(err) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        }
    }

}();
