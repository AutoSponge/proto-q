/**
* The UI module
* This code was validated with <a href="http://jslint.com">JSLint</a> using
* options: jslint white: true, onevar: true, undef: true,
*           eqeqeq: true, plusplus: true, bitwise: true,
*           regexp: true, newcap: true, immed: true
* @module UI
*/
"use strict";
/**
*
* @class UI
* @static
*/
var UI = (function () {
    /**
    * Reference to the window object
    * @property win
    * @type {DOMWindow}
    */
    var win = this,
    /**
    * Reference to the window.document object
    * @property doc
    * @type {Document}
    */
    doc = win.document,
    /**
    * Utility function mixes the properties of objects
    * resolving conflicts through overwrites.  The objects
    * passed last have the highest priority.
    * @method mixin
    * @param object {Object} any number of objects
    * @return {Object} the modified first object parameter
    */
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
/**
* The core class for UI.  This constructor can be
* called like a function with an optional options parameter
* which overrides default configuration.
* @class Class
* @param options {Object} the options parameter
* overrides default configuration
* @namespace UI
* @for UI
* @constructor
*/
UI.Class = function (options) {
    /**
    * The configuration for this instance.
    * @property config
    * @type {Object}
    * @private
    */
    var config = {};
    if (!(this instanceof UI.Class)) {
        return new UI.Class(options);
    }
    /**
    * Returns a copy of the current config
    * @method getConfig
    * @for Class
    * @return {Object}
    */
    this.getConfig = function () {
        return UI.mixin({}, config);
    };
    /**
    * The name of this class.  Useful for identifying
    * constructors and parents of objects by class name
    * @property name
    * @type {String}
    */
    this.name = "UI.Class";
    UI.mixin(config, options);
    if (typeof config.init === "function") {
        config.init.apply(this, [config]);
    }
    if (typeof config.callback === "function") {
        config.callback.apply(this, [config]);
    }
};
/**
* Creates a new instance with the same configuration
* or a mix of this configuration and the options parameter.
* @method clone
* @parameter options {Object}
* @for Class
* @return {Object} instance of Class
*/
UI.Class.prototype.clone = function (options) {
    return new this.constructor(UI.mixin(this.getConfig(), options));
};
/**
* This class factory creates a subclass constructor with this instance
* as a __super__ property of the new class, inheriting this instance's
* prototype and configuration.
*
* The new class constructor can be invoked like a function and will
* accept an options parameter which can override default configuration.
* @method subClass
* @param name {String} the reference to the new class
* @param defaults {Object} the default configuration for new
* instances of the new class
* @param pattern {String} [factory], singleton, or multiton
* @constructor
* @for Class
*/
UI.Class.prototype.subClass = function (name, defaults, pattern) {
    var parent = this,
    ns = name.split(".").slice(1),
    n = UI;
    while (ns.length > 1) {
        n = n[ns.shift()];
    }
    n[ns[0]] = function (options) {
        var that, config = {},
        instance = this.constructor.instance;
        if (pattern === "singleton") {
            if ((this instanceof n[ns[0]]) && instance) {
                return instance;
            }
        }
        if (!(this instanceof n[ns[0]])) {
            return new n[ns[0]](options);
        }
        that = this;
        /**
        * Returns a copy of the current config
        * @method getConfig
        * @for Class
        * @return {Object}
        */
        this.getConfig = function () {
            return UI.mixin({}, config);
        };
        /**
        * The name of this subClass.  Useful for identifying
        * constructors and parents of objects by class name
        * @property name
        * @type {String}
        */
        this.name = name;
        /**
        * The parent object (prototype)
        * @property __super__
        * @type {Object}
        */
        this.__super__ = parent;
        UI.mixin(config, parent.getConfig(), defaults, options);
        if (typeof config.init === "function") {
            config.init.apply(this, [config]);
        }
        if (pattern === "singleton") {
            this.constructor.instance = that;
        }
        if (pattern === "multiton") {
            if (!this.constructor.instance) {
                this.constructor.instance = [];
            }
            this.constructor.instance.push(that);
        }
        if (typeof config.callback === "function") {
            config.callback.apply(this, [config]);
        }
    };
    UI.mixin(n[ns[0]].prototype, parent.constructor.prototype);
};