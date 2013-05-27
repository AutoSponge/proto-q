/**
 * The Q module provides a way to use asynchronous features sequentially.
 * This code was validated with <a href="http://jslint.com">JSLint</a> using
 * options: jslint white: true, devel: true, onevar: true, undef: true,
 *      eqeqeq: true, plusplus: true, bitwise: true, regexp: true,
 *      newcap: true, immed: true, strict: true
 *      Predefined: sessionStorage, localStorage, Worker
 * @module Q
 */
"use strict";

/**
 * The easing module provides methods for customizing
 * how an animation behaves during each run.
 * @class Q
 * @static
 */
var Q = (function () {
    /**
     * Reference to the window object
     * @property win
     * @type {DOMWindow}
     */
    var win = this,
    /**
     * Variable used to determine if setTimeout will be used.
     * Chrome does not release the call stack between triggering
     * events, so useSetTimeout = TRUE for Chrome by default
     * @property useSetTimeout
     * @type {Boolean}
     */
    useSetTimeout = (win.navigator.userAgent.indexOf("Chrome") > -1),
    /**
     * Reference to the window.document object
     * @property doc
     * @type {Document}
     */
    doc = win.document,
    /**
     * Queue of objects
     * @property requests
     * @type {Array}
     */
    requests = [],
    /**
     * Returns the current state of the queue
     * @property running
     * @type {Boolean}
     * @private
     */
    running = false,
    /**
     * Returns the current state of the DOM
     * @property DOMloaded
     * @type {Boolean}
     * @private
     */
    DOMloaded = false,
    /**
     * Returns the current state of the queue
     * @method setDOMloaded
     * @param bool {Boolean}
     * @return {Boolean}
     */
    setDOMloaded = function (bool) {
        return (DOMloaded = bool);
    },
    /**
     * Returns array of requests
     * @method getRequests
     * @return {Array}
     */
    getRequests = function () {
        return requests;
    },
    /**
     * Pushes an object into the requests array
     * @method push
     * @return {Q}
     */
    push = function (r) {
        requests.push(r);
        return this;
    },
    /**
     * Removes and invokes the execute method of
     * the first requests object
     * @method shift
     * @return {Q}
     */
    shift = function () {
        requests.shift().execute();
        return this;
    },
    /**
     * Removes all objects from the requests array
     * @method clear
     * @return {Q}
     */
    clear = function () {
        requests = [];
        return this;
    },
    /**
     * Returns the value of running
     * @method getRunning
     * @return {Boolean}
     */
    getRunning = function () {
        return running;
    },
    /**
     * Sets the value of running
     * @method setRunning
     * @param bool {Boolean}
     * @return {Boolean}
     */
    setRunning = function (bool) {
        return (running = bool);
    },
    /**
     * Utility function creates and dispatches an event
     * @method event
     * @param type {String}
     * @param context {Object} the event requestor
     * @return {Object} the event requestor
     */
    event = function (type, context) {
        var e = doc.createEvent("UIEvents");
        e.initEvent(type, false, false);
        e.requestor = context || null;
        doc.dispatchEvent(e);
        return context;
    },
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
    },
    /**
     * Sets running to true and creates an execute event
     * @method start
     * @return {Q}
     */
    start = function () {
        if (DOMloaded && !running) {
            running = true;
            event("Q.request.execute");
        } else {
            win.addEventListener("DOMContentLoaded", function () {
                Q.start();
            }, false);
        }
        return this;
    },
    /**
     * Stops execution of queue request objects
     * @method stop
     * @return {Q}
     */
    stop = function () {
        running = false;
        return this;
    },
    /**
     * Returns the length of the requests array
     * @method length
     * @return {Number}
     */
    length = function () {
        return requests.length;
    };

    setDOMloaded((doc.readyState === "complete"));

    win.addEventListener("DOMContentLoaded", function () {
        Q.setDOMloaded(true);
    }, false);

    doc.addEventListener("Q.request", function (e) {
        Q.push(e.requestor);
    }, false);

    doc.addEventListener("Q.request.execute", function (e) {
        if (Q.length() > 0 && Q.isRunning()) {
            if (useSetTimeout) {
                setTimeout(Q.shift, 0);
            } else {
                Q.shift();
            }
        } else {
            Q.setRunning(false);
        }
    }, false);
    
    return {
        push: push,
        clear: clear,
        doc: doc,
        event: event,
        mixin: mixin,
        isRunning: getRunning,
        length: length,
        start: start,
        requests: getRequests,
        setDOMloaded: setDOMloaded,
        setRunning: setRunning,
        shift: shift,
        stop: stop,
        win: win
    };
}());

/**
 * The core class for Q.  This constructor can be
 * called like a function with an optional options parameter
 * which overrides default configuration.
 * @class Class
 * @param options {Object} the options parameter
 * overrides default configuration
 * @namespace Q
 * @for Q
 * @constructor
 */
Q.Class = function (options) {
    if (!(this instanceof Q.Class)) {
        return new Q.Class(options);
    }
    /**
     * The name of this class.  Useful for identifying
     * constructors and parents of objects by class name
     * @property name
     * @type {String}
     * @protected
     */
    this.name = "Q.Class";
    /**
     * The configuration for this instance.
     * Config is universally a mixin of defaults and
     * the options parameter.
     * @property name
     * @type {String}
     * @protected
     */
    this.config = options;
    /**
     * This event invokes the instance's request method
     * upon instantiation
     * @event request
     * @type Event.UIEvents
     */
    this.request();
};

/**
 * Configures an object before execution
 * @method configure
 * @for Class
 * @return {Object} dynamically bound configuration
 */
Q.Class.prototype.configure = function () {
    var that = this,
    /**
     * Copies properties from obj to c except functions that
     * are not values of an "fn" property.  Non-"fn" functions
     * are invoked with the Class instance's context.
     * @param c {Object} base config object
     * @param obj {Object} properties to copy/invoke
     * @return {Object} returns the modified base object
     * @private
     */
    expand = function (c, obj) {
        var o;
        for (o in obj) {
            if (obj.hasOwnProperty(o)) {
                switch (typeof obj[o]) {
                    case "object":
                        if (obj[o].nodeType || obj[o].config) {
                            c[o] = obj[o];
                        } else {
                            if (obj[o].constructor.name === "Array") {
                                c[o] = expand([], obj[o]);
                            } else {
                                c[o] = expand({}, obj[o]);
                            }
                        }
                        break;
                    case "function":
                        if (o === "fn") {
                            c[o] = obj[o];
                        } else {
                            c[o] = obj[o].apply(that);
                        }
                        break;
                    default:
                        c[o] = obj[o];
                        break;
                }
            }
        }
        return c;
    };
    return expand({}, this.config);
};

/**
 * Add the instance to the requests queue
 * @method request
 * @for Class
 * @return {Object} instance
 */
Q.Class.prototype.request = function () {
    Q.event("Q.request", this);
    return this;
};

/**
 * Starts executing the queue requests
 * @method start
 * @for Class
 * @return {Q}
 */
Q.Class.prototype.start = function () {
    Q.start();
};

/**
 * Adds this instance to the request queue
 * and executes the first request in the queue.
 * @method fire
 * @for Class
 */
Q.Class.prototype.fire = function () {
    this.request().start();
};

/**
 * Creates a new instance with the same configuration
 * or a mix of this configuration and the options parameter.
 * @method clone
 * @parameter options {Object}
 * @for Class
 * @return {Object} instance of Class
 */
Q.Class.prototype.clone = function (options) {
    return new this.constructor(Q.mixin({}, this.config, options));
};

/**
 * Removes the first request from the queue
 * @method execute
 * @for Class
 */
Q.Class.prototype.execute = function () {
    Q.event("Q.request.execute");
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
 * @constructor
 * @for Class
 */
Q.Class.prototype.subClass = function (name, defaults) {
    var parent = this,
    ns = name.split(".").slice(1),
    n = Q;
    while (ns.length > 1) {
        n = n[ns.shift()];
    }
    n[ns[0]] = function (options) {
        if (!(this instanceof n[ns[0]])) {
            return new n[ns[0]](options);
        }
        this.config = Q.mixin({}, parent.config, defaults, options);
        this.__super__ = parent;
        this.name = name;
        this.request();
    };
    Q.mixin(n[ns[0]].prototype, parent.constructor.prototype);
};

/**
 * This class factory creates a subclass constructor with this instance
 * as a __super__ property of the new class, inheriting this instance's
 * prototype and configuration.
 * 
 * The new class will use a singleton pattern (only allowing one
 * instance to be created). The new class constructor can be invoked
 * like a function and will accept an options parameter which can
 * override default configuration.
 * 
 * Singletons are not added to the request queue.
 * @method singleton
 * @param name {String} the reference to the new class
 * @param defaults {Object} the default configuration for new
 * instances of the new class
 * @constructor
 * @for Class
 */
Q.Class.prototype.singleton = function (name, defaults) {
    var parent = this,
    ns = name.split(".").slice(1),
    n = Q;
    while (ns.length > 1) {
        n = n[ns.shift()];
    }
    n[ns[0]] = function (options) {
        var that,
        instance = this.constructor.instance;
        if ((this instanceof n[ns[0]]) && instance) {
            return instance;
        }
        if (!(this instanceof n[ns[0]])) {
            return new n[ns[0]](options);
        }
        that = this;
        this.__super__ = parent;
        this.name = name;
        this.config = Q.mixin({}, parent.config, defaults, options);
        this.constructor.instance = that;
    };
    Q.mixin(n[ns[0]].prototype, parent.constructor.prototype);
};

/**
 * This class factory creates a subclass constructor with this instance
 * as a __super__ property of the new class, inheriting this instance's
 * prototype and configuration.
 *
 * The new class will use a multiton pattern (allowing global access to
 * all instances). The new class constructor can be invoked
 * like a function and will accept an options parameter which can
 * override default configuration.
 *
 * To reference instances of a multiton, use the constructor.instance array.
 *
 * example: Q.Test.instance[0]
 * @method multiton
 * @param name {String} the reference to the new class
 * @param defaults {Object} the default configuration for new
 * instances of the new class
 * @constructor
 * @for Class
 */
Q.Class.prototype.multiton = function (name, defaults) {
    var parent = this,
    ns = name.split(".").slice(1),
    n = Q;
    while (ns.length > 1) {
        n = n[ns.shift()];
    }
    n[ns[0]] = function (options) {
        var that;
        if (!(this instanceof n[ns[0]])) {
            return new n[ns[0]](options);
        }
        that = this;
        this.__super__ = parent;
        this.name = name;
        this.config = Q.mixin({}, parent.config, defaults, options);
        if (!this.constructor.instance) {
            this.constructor.instance = [];
        }
        this.constructor.instance.push(that);
        this.request();
    };
    Q.mixin(n[ns[0]].prototype, parent.constructor.prototype);
};

/**
 * The Db class creates a singleton object to connect to
 * an HTML5 SQLite database.  This class does not inherit
 * the methods of Class.  Instead, other classes rely on the
 * Q.Db.instance and will instantiate the singleton as needed.
 * This class can be invoked like a function passing override
 * options as a parameter.
 * @class Db
 * @namespace Q
 * @constructor
 * @param options {Object} override any of the default database settings.
 *      An object containing the options attributes for
 *      a database. Members of this options object include:
 *      <ul>
 *      <li><strong>str shortName:</strong> Database one-word name.</li>
 *      <li><strong>str version:</strong> Database version.</li>
 *      <li><strong>str displayName:</strong> Database name.</li>
 *      <li><strong>number maxsize:</strong> Maximum size in byts.</li>
 *      </ul>
 */
Q.Class.prototype.singleton.apply({}, ["Q.Db", {
    shortName: "Q",
    version: "1.0",
    displayName: "Q Database",
    maxSize: 5 * 1024 * 1024
}]);

/**
 * Connects this instance to the SQLite database
 * described by the class defaults
 * @method connect
 * @for Db
 */
Q.Db.prototype.connect = function () {
    var db = Q.Db(), c = db.config;
    if (db.connection === undefined) {
        db.connection = Q.win.openDatabase(c.shortName, c.version, c.displayName, c.maxsize);
    }
    return db.connection;
};

/**
 * This class creates objects that will connect to a SQLite
 * database in thier execute method.  The stmt option can have
 * placeholders using {propertyName[:propertyName...]} notation.
 * Placeholders will resolve during execution and serve to allow
 * cloning with fewer property replacements.
 * @class Sql
 * @extends Q.Class
 * @namespace Q
 * @constructor
 * @param options {Object} override any of the default database settings.
 *      An object containing the options attributes for
 *      a SQL statement. Members of this options object include:
 *      <ul>
 *      <li><strong>str stmt:</strong> SQL statement with optional placeholders.
 *      Placeholders are replaced at execute time using the configuration (defaults
 *      overridden by this options object).  For instance, to use a statement like
 *      "SELECT * FROM {tableName}" add the tableName property to this options object
 *      with a string value of the table name to select from.  Nested parameters are
 *      resolved converting ":" to bracket notation.  For example, {table:1} will
 *      resolve to table[1] in the configuration.</li>
 *      <li><strong>array args:</strong> Arguments replace "?" in SQL statements
 *      during the database transaction.  See <a href="http://www.sqlite.org/">SQLite</a>
 *      documentation.</li>
 *      </ul>
 */
Q.Class().subClass("Q.Sql");

/**
 * Handles data returned from the SQLite database by
 * converting the results to an array and assigning the
 * array to the object's results property.
 * @method dataHandler
 * @for Sql
 * @return {Function}
 */
Q.Sql.prototype.dataHandler = function () {
    var that = this;
    return function (transaction, results) {
        var makeArray = function (results) {
            var r = results.rows || results,
            i = r.length,
            arr = [];
            while (i) {
                i -= 1;
                arr[i] = r.item ? r.item(i) : r[i];
            }
            return arr;
        };
        that.results = makeArray(results);
        that.__super__.execute();
    };
};

/**
 * Handles errors returned by the SQLite database
 * during bulk transactions sending the error information
 * to the console.
 * @method bulkErrorHandler
 * @for Sql
 * @return {Function}
 */
Q.Sql.prototype.bulkErrorHandler = function () {
    var that = this;
    return function (transaction, error) {
        console.error("Q.Sql", that, "Message:", error.message, "Code:", error.code);
        return false;
    };
};

/**
 * Handles errors returned by the SQLite database
 * sending the error information to the console
 * and moving to the next request item in the queue.
 * @method errorHandler
 * @for Sql
 * @return {Function}
 */
Q.Sql.prototype.errorHandler = function () {
    var that = this;
    return function (transaction, error) {
        that.bulkErrorHandler().apply(that, [transaction, error]);
        that.__super__.execute();
        return false;
    };
};

/**
 * Executes the SQL statement described by the object's
 * configuration.
 * @method execute
 * @for Sql
 */
Q.Sql.prototype.execute = function () {
    var config = this.configure(),
    stmt = config.stmt || "",
    args = config.args ? config.args.slice() : [],
    callback = this.dataHandler(),
    bulkErrorHandler = this.bulkErrorHandler(),
    errorHandler = this.errorHandler(),
    placeHolders = stmt.match(/\{(\w|:)+?\}/g) || [];
    placeHolders.forEach(function (ph) {
        var rx = new RegExp(ph),
        val = config,
        name = ph.substring(1, ph.length - 1);
        name = name.split(":");
        while (name.length) {
            val = val[name.shift()];
        }
        stmt = stmt.replace(rx, val);
    });

    if (stmt.length) {
        Q.Db().connect().transaction(function (t) {
            if (typeof args[0] === "object") {
                while (args.length > 1) {
                    t.executeSql(stmt, args.shift(), {}, bulkErrorHandler);
                }
                t.executeSql(stmt, args.shift(), callback, errorHandler);
            } else {
                t.executeSql(stmt, args, callback, errorHandler);
            }
        });
    } else {
        this.__super__.execute.apply(this);
    }
};

/**
 * This class creates objects with a fn property with
 * type {Function}.
 * @class Js
 * @extends Q.Class
 * @namespace Q
 * @constructor
 * @param options {Object} the options object overrides
 * default configuration.
 *      An object containing the options attributes.
 *      Members of this options object include:
 *      <ul>
 *      <li><strong>function fn:</strong> The function to execute.</li>
 *      <li><strong>array args:</strong> The arguments to pass to the
 *      function at time of execution.</li>
 *      </ul>
 */
Q.Class().subClass("Q.Js", {
    fn: function () {}
});

/**
 * Executes the fn function described by the object's
 * configuration using the configuration's args array
 * as the fn function's arguments.
 * @method execute
 * @for Js
 */
Q.Js.prototype.execute = function () {
    var c = this.configure();
    this.results = c.fn.apply(this, c.args);
    this.__super__.execute();
};

/**
 * This class creates objects that communicate with a storage
 * object converting all data to type {String} on setItem
 * and converting those strings to their natural primitive type
 * on getItem actions.  Other actions follow the HTML5 Storage
 * API specification.
 * @class Storage
 * @extends Q.Class
 * @namespace Q
 * @constructor
 * @param options {Object} the options object overrides
 * default configuration.  An action property is required.  The
 * properties key and value are needed for most actions.  Valid
 * actions are documented in the HTML5 Storage API.  The expects
 * property will be used as a default value if the store[key] value
 * is undefined.
 *      An object containing the options attributes.
 *      Members of this options object include:
 *      <ul>
 *      <li><strong>string action:</strong> The action execute: "setItem",
 *      "getItem", "clear", "key", "length", "removeItem".</li>
 *      <li><strong>string key:</strong> The key used by action.</li>
 *      <li><strong>any value:</strong> The value (for "setItem").</li>
 *      <li><strong>string expects:</strong> The default value used if no
 *      key or a falsey value is found in the storage object (for "getItem").</li>
 *      <li><strong>object store:</strong> The object to use for storage.</li>
 *      </ul>
 */
Q.Class().subClass("Q.Storage", {
    action: "",
    expects: "",
    store: {}
});

/**
 * Executes the configured action against the
 * configured store using the configured value as
 * a parameter if needed.
 *
 * @method execute
 * @for Storage
 */
Q.Storage.prototype.execute = function () {
    var c = this.config, r, str, s = c.store;
    if (typeof c.value === "function") {
        c.value = c.value.call();
    }
    switch (c.action) {
        case "setItem":
            switch (typeof c.value) {
                case "string":
                    str = c.value;
                    break;
                case "boolean":
                    str = (c.value) ? "b:true" : "b:false";
                    break;
                case "object":
                    str = "j:" + JSON.stringify(c.value);
                    break;
                case "number":
                    str = "n:" + c.value;
                    break;
            }
            s[c.key] = str;
            r = c.value;
            break;
        case "getItem":
            r = s[c.key] || c.expects;
            switch (r.substring(0, 2)) {
                case "j:":
                    r = JSON.parse(r.slice(2));
                    break;
                case "b:":
                    r = (r === "b:true");
                    break;
                case "n:":
                    if (r.indexOf(".") >= 0) {
                        r = parseFloat(r.slice(2));
                    } else {
                        r = parseInt(r.slice(2), 10);
                    }
                    break;
            }
            break;
        case "clear":
            s.clear();
            r = undefined;
            break;
        case "removeItem":
            r = delete s[c.key];
            break;
        case "key":
            r = s[c.key] || this.expects;
            break;
        case "length":
            r = s.length;
            break;
        default:
    }
    this.results = r;
    this.__super__.execute();
};

/**
 * This class creates objects that communicate using an
 * XMLHttpRequest object.
 * @class Ajax
 * @extends Q.Class
 * @namespace Q
 * @constructor
 * @param options {Object} the options object overrides
 * default configuration.  The type, contentType, url, and accepts
 * properties are required.
 *      An object containing the options attributes.
 *      Members of this options object include:
 *      <ul>
 *      <li><strong>string type:</strong> The request method.</li>
 *      <li><strong>string contentType:</strong> Request content type.</li>
 *      <li><strong>string accepts:</strong> Allowed response content types
 *      (separated by comma).</li>
 *      <li><strong>boolean cache:</strong> Use the browser's cache if
 *      available.  "False" appends a random string to the url requested.</li>
 *      <li><strong>string url:</strong> Url to request.</li>
 *      </ul>
 */
Q.Class().subClass("Q.Ajax", {
    type: "GET",
    contentType: "application/x-www-form-urlencoded",
    accepts: "*/*",
    cache: false,
    dataType: "json"
});

/**
 * Handles the response from an Ajax call
 * @method dataHandler
 * @for Ajax
 * @return {Function}
 */
Q.Ajax.prototype.dataHandler = function () {
    var that = this;
    return function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                that.status = "success";
                switch (that.config.dataType) {
                    case "json":
                        that.results = JSON.parse(this.responseText);
                        break;
                    case "xml":
                        that.results = this.responseXML;
                        break;
                    default:
                        that.results = this.responseText;
                }
            } else {
                that.status = "failure";
                console.warn("Q.Ajax failure", this);
            }
            that.__super__.execute();
        }
    };
};

/**
 * Creates and sends the XMLHttpRequest using the object's
 * configuration information.
 * @method execute
 * @for Ajax
 */
Q.Ajax.prototype.execute = function () {
    var c = this.configure(),
    url = c.url,
    user = c.user || "",
    password = c.password || "",
    randomString = function (i) {
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",
        str = '';
        while (i) {
            i -= 1;
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return str;
    };
    if (!c.cache) {
        if (url.indexOf("?") !== -1) {
            url += "&_=";
        } else {
            url += "?_=";
        }
        url += randomString(8);
    }
    this.xhr = new Q.win.XMLHttpRequest();
    this.xhr.open(c.type, url, true, user, password);
    this.xhr.setRequestHeader("Content-Type", c.contentType);
    this.xhr.setRequestHeader("Accept", c.accepts);
    this.xhr.onreadystatechange = this.dataHandler();
    try {
        this.xhr.send();
    } catch (e) {
        this.result = e;
        console.error("Q.Ajax error", this);
    }

};

/**
 * This class creates a request object that will
 * become a DOM object during execution. The DOM object
 * will have a tag of the tagName property and the
 * attributes and events of the attribute and event properties.
 * @class Dom
 * @extends Q.Class
 * @namespace Q
 * @constructor
 * @param options {Object} the options object overrides
 * default configuration.
 *      An object containing the options attributes.
 *      Members of this options object include:
 *      <ul>
 *      <li><strong>string tagName:</strong> The HTML tag name to create.</li>
 *      <li><strong>HTMLDomElement parent:</strong> The parent of the object where
 *      it will be inserted into the DOM.  Functions that return
 *      elements will be resolved at time of execution.</li>
 *      <li><strong>object attribute:</strong> Attributes and their values to
 *      be applied to the new DOM object.</li>
 *      <li><strong>object event:</strong> Events to be bound to the new object.
 *      Events use their HTML property name (e.g., "onload") and have an "fn"
 *      property which is the bound function.  "fn" property functions will not
 *      be resolved at execution time but passed as a function value.</li>
 *      </ul>
 */
Q.Class().subClass("Q.Dom");

/**
 * Creates and sends the XMLHttpRequest using the object's
 * configuration information.
 * @method execute
 * @for Dom
 */
Q.Dom.prototype.execute = function () {
    var c = this.configure(), doc = Q.doc, o, elm;
    if (c.tagName) {
        elm = doc.createElement(c.tagName);
    }
    if (elm && c.attribute) {
        for (o in c.attribute) {
            if (c.attribute.hasOwnProperty(o)) {
                elm[o] = c.attribute[o];
            }
        }
    }
    if (elm && c.event) {
        for (o in c.event) {
            if (c.event.hasOwnProperty(o)) {
                elm[o] = c.event[o].fn.apply(this);
            }
        }
    }
    if (c.parent && elm) {
        c.parent.appendChild(elm);
    }
    if (!c.event) {
        this.__super__.execute();
    }
};

/**
 * This class creates a request object that will
 * become a SCRIPT tag during execution. The SCRIPT
 * will execute the next request object after the
 * load event.
 * @class Script
 * @extends Q.Dom
 * @param options {Object} the options object overrides
 * default configuration.
 * @namespace Q.Dom
 * @constructor
 */
Q.Dom().subClass("Q.Dom.Script", {
    parent: function () {
        return Q.doc.getElementsByTagName("HEAD")[0];
    },
    tagName: "SCRIPT",
    event: {
        onload: {
            fn: function () {
                return this.scriptHandler();
            }
        }
    }
});

/**
 * Advances the request queue once the script loads
 * @method scriptHandler
 * @for Script
 * @return {Fuction}
 */
Q.Dom.Script.prototype.scriptHandler = function () {
    var that = this;
    return function (e) {
        e.target.parentNode.removeChild(e.target);
        that.status = "success";
        that.__super__.execute();
    };
};

/**
 * This class creates a request object that will
 * communicate with an HTML5 web worker.
 * @class Worker
 * @extends Q.Class
 * @namespace Q
 * @constructor
 * @param options {Object} the options object overrides
 * default configuration.
 *      An object containing the options attributes.
 *      Members of this options object include:
 *      <ul>
 *      <li><strong>string url:</strong> The url to post a message to.</li>
 *      <li><strong>number wait:</strong> The number of replies the object
 *      receives before advancing the queue.</li>
 *      <li><strong>string message:</strong> The message sent to the url.</li>
 *      </ul>
 */
Q.Class().subClass("Q.Worker");

/**
 * Advances the request queue once the response message is
 * recieved wait number of times.  The reponse should be
 * valid JSON.
 * @method dataHandler
 * @for Script
 * @return {Fucntion}
 */
Q.Worker.prototype.dataHandler = function (context, config) {
    return function (e) {
        var wait = config.wait || 1;
        context.results.push(JSON.parse(e.data));
        if (context.results.length === wait) {
            context.__super__.execute();
        }
    };
};

/**
 * Creates the worker object and sends the configured
 * message to the configured url.
 * @method execute
 * @for Script
 */
Q.Worker.prototype.execute = function () {
    var c = this.configure();
    this.worker = new Worker(c.url);
    this.results = [];
    this.worker.onmessage = this.dataHandler(this, c);
    this.worker.postMessage(c.message);
};

/**
 * A class for constructing Test objects
 * @class Test
 * @extends Q.Class
 * @namespace Q
 * @constructor
 * @param options {Object} the options object overrides
 * default configuration.  The test {Object} property has
 * a fn {Function} property which is invoked during
 * execution.  The test.fn returns to the results property.
 * If the results property === the test.expects property,
 * the object's status property is "passed" otherwise the
 * status is "failed".
 *      An object containing the options attributes.
 *      Members of this options object include:
 *      <ul>
 *      <li><strong>object test: | array test:</strong> The test group.</li>
 *      </ul>
 *
 *      The test object's properties include:
 *      <ul>
 *      <li><strong>function fn:</strong> The function will evaluate at time of
 *      execution.</li>
 *      <li><strong>any expects:</strong> The value to compare (===) to the "fn"
 *      property function's return value.</li>
 *      </ul>
 *
 *      The test array is an array of objects like the one above with an fn property
 *      and an expects property.  The test status will be "passed" only if all tests
 *      pass.
 */
Q.Class().multiton("Q.Test");

/**
 * Invokes the configured test function, evaluates the
 * results, then advances the request queue.
 * @method execute
 * @for Test
 */
Q.Test.prototype.execute = function () {
    var r, that = this, c = that.configure();
    if (c.test.constructor.name === "Array") {
        that.results = [];
        c.test.some(function (e) {
            r = e.fn();
            that.results.push(r);
            if (r === e.expects) {
                that.status = "passed";
                return false;
            } else {
                that.status = "failed";
                return true;
            }
        });
    } else {
        r = c.test.fn();
        that.results = r;
        that.status = (r === c.test.expects) ? "passed" : "failed";
    }
    if (that.status === "failed") {
        console.warn("Q.Test failed", that);
    }
    this.__super__.execute();
};

/**
 * This class creates a SQL select * request object
 * @class Read
 * @extends Q.Sql
 * @param options {Object} the options object overrides
 * default configuration.  The tableName property is replaced
 * at execution time.
 * @namespace Q.Sql
 * @constructor
 */
Q.Sql().subClass("Q.Sql.Read", {
    stmt: "SELECT * FROM {tableName};"
});

/**
 * This class creates a SQL drop table request object
 * @class Drop
 * @extends Q.Sql
 * @param options {Object} the options object overrides
 * default configuration.  The tableName property is replaced
 * at execution time.
 * @namespace Q.Sql
 * @constructor
 */
Q.Sql().subClass("Q.Sql.Drop", {
    stmt: "DROP TABLE IF EXISTS {tableName};"
});

/**
 * This class creates a localStorage request object
 * @class Local
 * @extends Q.Storage
 * @param options {Object} the options object overrides
 * default configuration.
 * @namespace Q.Storage
 * @constructor
 */
Q.Storage().subClass("Q.Storage.Local", {
    store: localStorage
});

/**
 * This class creates a sessionStorage request object
 * Firefox will not use sessionStorage offline
 * @class Session
 * @extends Q.Storage
 * @param options {Object} the options object overrides
 * default configuration.
 * @namespace Q.Storage
 * @constructor
 */
if (Q.win.navigator.userAgent.indexOf("Firefox") > -1 &&
    Q.win.location.href.indexOf("file:///") === 0) {
} else {
    Q.Storage().subClass("Q.Storage.Session", {
        store: sessionStorage
    });
}

/**/
