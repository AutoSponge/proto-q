/**
 * This object, App, is a basic rewrite of the proto-q inheritance
 * pattern.  The test below
 * (original by http://www.broofa.com/2009/02/javascript-inheritance-performance/)
 * uses the simplest form of the inheritance pattern
 */

var App = (function () {
    var win = this,
    doc = win.document,
    mixin = function (/* {Object}, {Object}, ... */) {
        var args = Array.prototype.slice.apply(arguments),
        r = args.shift(), o, m;
        while (args.length) {
            m = args.shift();
            for (o in m) {
                if (m.hasOwnProperty(o)) {
                    r[o] = m[o];
                }
            }
        }
        return r;
    };

    return {
        doc: doc,
        mixin: mixin,
        win: win
    };
}());

App.Class = function (options) {
    if (!(this instanceof App.Class)) {
        return new App.Class(options);
    }
    this.name = "App.Class";
    this.config = options;
};

App.Class.prototype.subClass = function (name, defaults) {
    var parent = this,
    ns = name.split(".").slice(1),
    n = App;
    while (ns.length > 1) {
        n = n[ns.shift()];
    }
    n[ns[0]] = function (options) {
        if (!(this instanceof n[ns[0]])) {
            return new n[ns[0]](options);
        }
        this.config = App.mixin({}, parent.config, defaults, options);
        this.__super__ = parent;
        this.name = name;
    };
    App.mixin(n[ns[0]].prototype, parent.constructor.prototype);
};