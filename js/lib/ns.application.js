(function () {


    var version = '0.1.2';


    /**
     * Constructor
     * @param properties
     * @returns {app|NamespaceApplication}
     */
    var app = function (properties) {
        if (!(this instanceof NamespaceApplication))
            return new NamespaceApplication(properties);

        this.setProperties(properties);

        this.domLoaded = app.domLoaded;
        this.redirect = app.redirect;
        this.request = app.request;
        this.ajax =  app.ajax;
        this.ajaxPostForm =  app.ajaxPostForm;
        this.script = app.script;
        this.style = app.style;
        this.file = app.file;
        this.extend = app.extend;
        this.storage = app.storage;
        this.stack = app.stack;
        this.route = app.route;
        this.routePath = app.routePath;
        this.assign = app.assign;
        this.inject = app.inject;
        this.query = app.query;
        this.queryAll = app.queryAll;
        this.queryUp = app.queryUp;
        this.on = app.on;
        this.each = app.each;

    };

    /**
     * Execute callback function if or when DOM is loaded
     *
     * @param callback
     */
    app.domLoaded = function (callback) {
        if (document.querySelector('body')) {
            callback.call({});
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                callback.call({})
            }, false);
        }
    };


    /**
     * Simple url request
     *
     * @param method
     * @param url
     * @param callback
     * @param callbackError
     * @returns {XMLHttpRequest}
     * @deprecated
     */
    app.request = function (method, url, callback, callbackError) {

        var xhr = new XMLHttpRequest();
        method = method || 'POST';
        url = url || '/';

        xhr.open(method, url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        if (typeof callback === 'function')
            xhr.onloadend = callback;

        if (typeof callbackError === 'function')
            xhr.onerror = callbackError;

        xhr.send();
        return xhr;
    };

    /**
     * Base AJAX request. Example:
     *  app.ajax({
     *      method: 'POST',
     *      url: '/server.php',
     *      data: {id:123, name:'UserName'}
     *  }, function (status, data) {
     *      console.log(status, data);
     *  });
     * @param {*} config        {method: 'POST', data: {}, headers: {}, action: '/index'}
     * @param callback          executing event - onloadend. function (status, responseText)
     * @returns {XMLHttpRequest}
     */
    app.ajax = function (config, callback) {
        var conf = {
            method:     config.method || 'GET',
            data:       config.data || {},
            headers:    config.headers || {},
            action:     config.action || config.url || document.location
        };
        var xhr = new XMLHttpRequest();
        var kd, kh, fd = new FormData();

        if (conf.method.toUpperCase() !== 'POST') {
            conf.action += conf.action.indexOf('?') === -1 ? '?' : '';
            for (kd in conf.data)
                conf.action += '&' + kd + '=' + encodeURIComponent(conf.data[kd])
        } else
            for (kd in conf.data)
                fd.append(kd, encodeURIComponent(conf.data[kd]));

        xhr.open (conf.method, conf.action, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        for (kd in conf.headers) {
            xhr.setRequestHeader(kd, conf.headers[kd]);
        }
        xhr.onloadend = function () {
            if (typeof callback === 'function')
                callback.call(xhr, xhr.status, xhr.responseText);
        };
        xhr.send(fd);
        return xhr;
    };

    /**
     * Send Form Data on AJAX request. Example:
     *  app.ajaxPostForm(FORM_ELEMENT, {
     *      action: '/server.php',
     *      data: {id:123, name:'UserName'}
     *  }, function (status, data) {
     *      console.log(status, data);
     *  });
     * @param form              FORM_ELEMENT
     * @param {*} config        {data: {}, headers: {}, action: '/index'}
     * @param callback          executing event - onloadend. function (status, responseText)
     * @returns {XMLHttpRequest}
     */
    app.ajaxPostForm = function (form, config, callback) {
        if (typeof config === 'function') {
            callback = config;
            config = false;
        }
        else if (typeof config === 'object')
            form.action = config.url || config.action || form.action;

        form.method = 'POST';
        form.onsubmit = function (event) {
            event.preventDefault();
            var formData = new FormData(this);
            var kd, xhr = new XMLHttpRequest();
            xhr.open(this.method, this.action, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            if (config && typeof config.headers === 'object') {
                for (kd in config.headers)
                    xhr.setRequestHeader(kd, config.headers[kd]);
            }
            if (config && typeof config.data === 'object') {
                for (kd in config.data)
                    formData.append(kd, config.data[kd]);
            }
            xhr.onloadend = function () {
                if (typeof callback === 'function')
                    callback.call(xhr, xhr.status, xhr.responseText);
            };
            xhr.send(formData);
        };
        return form;
    };

    /**
     * Loads the script element
     *
     * @param src
     * @param onload
     * @param onerror
     * @returns {*}
     */
    app.script = function (src, onload, onerror) {

        if (!src) return null;

        var script = document.createElement('script'),
            id = "src-" + Math.random().toString(32).slice(2);

        script.src = (src.substr(-3) === '.js') ? src : src + '.js';
        script.type = 'application/javascript';
        script.id = id;
        script.onload = onload;
        script.onerror = onerror;

        document.head.appendChild(script);

        return script;
    };


    /**
     *
     * Loads the CSS link element
     *
     * @param url
     * @param onload
     * @param onerror
     * @returns {Element}
     */
    app.style = function (url, onload, onerror) {
        var link = document.createElement('link'),
            id = "src-" + Math.random().toString(32).slice(2);

        link.href = (url.substr(-4) === '.css') ? url : url + '.css';
        link.rel = 'stylesheet';
        link.id = id;
        link.onload = onload;
        link.onerror = onerror;
        document.head.appendChild(link);
        return link;
    };


    /**
     * Loads the file
     *
     * @param url
     * @param onload
     * @param onerror
     * @deprecated
     */
    app.file = function (url, onload, onerror) {
        app.request('GET', url, function (event) {
            if (event.target.status === 200)
                onload.call(this, event.target.responseText, event);
            else
                onerror.call(this, event);
        }, onerror)
    };

    /**
     * Merge objects
     *
     * @param obj objectBase
     * @param src
     * @param callback
     * @returns {*}
     */
    app.extend = function (obj, src, callback) {
        for (var key in src) {
            var free, entry = src[key];
            if (typeof callback === 'function')
                free = callback(key, obj[key], src[key]);
            if (src.hasOwnProperty(key) && !!free) obj[key] = entry;
        }
        return obj;
    };


    /**
     * Storage in memory
     *
     * if `object` is a Object - set new objects
     * if `object` is a String - return object by name
     * if `object` is a not set - return all objects
     *
     * @param object
     * @param keyWithValue
     * @returns {*}
     */
    app.stack = function (object, keyWithValue) {

        if(typeof object === 'string' && keyWithValue !== undefined) {
            var _object = {};
            _object[object] = keyWithValue;
            return this.stack(_object);
        }

        if (typeof object === 'object') {
            for (var key in object)
                this._stackStorage[key] = object[key];
            return this._stackStorage;
        }
        else if (typeof object === 'string')
            return this._stackStorage[object] ? this._stackStorage[object] : null;

        else if (object === undefined)
            return this._stackStorage;
    };

    /**
     * Storage of local
     *
     * @param name
     * @param value
     * @returns {boolean}
     */
    app.storage = function(name, value){
        if(!name){
            return false;
        }else if(value === undefined){
            return Util.Storage.get(name);
        }else if(!value){
            return Util.Storage.remove(name);
        }else{
            return Util.Storage.set(name, value);
        }
    };
    app.storage.set = function (name, value) {
        try{value = JSON.stringify(value)}catch(error){}
        return window.localStorage.setItem(name, value);
    };
    app.storage.get = function (name) {
        var value = window.localStorage.getItem(name);
        if(value)
            try{value = JSON.parse(value)}catch(error){}
        return value;
    };
    app.storage.remove = function (name) {
        return window.localStorage.removeItem(name);
    };
    app.storage.key = function (name) {
        return window.localStorage.key(key);
    };
    // when invoked, will empty all keys out of the storage.
    app.storage.clear = function () {
        return window.localStorage.clear();
    };
    // returns an integer representing the number of data items stored in the Storage object.
    app.storage.length = function () {
        return window.localStorage.length;
    };



    /**
     * Storage for static calls
     * @type {{}}
     * @private
     */
    app._stackStorage = {};


    /**
     * Simple router
     *
     * @param uri
     * @param callback
     */
    app.route = function (uri, callback, hash, query) {
        uri = uri || '';
        var reg = new RegExp('^' + uri + '$', 'i'),
            path = app.routePath.call(this, hash, query);

        if (reg.test(path)) {
            callback.call(this);
            return true;
        }
        return false;
    };


    /**
     * Get route - URI Path
     *
     * @returns {string}
     */
    app.routePath = function (hash, query) {
        var path = window.location.pathname;
        if (hash) path += window.location.hash;
        if (query) path += window.location.search;
        if (this.url && path.indexOf(this.url) === 0) {
            path = path.substr(this.url.length);
            if (path.slice(0, 1) !== '/') path = '/' + path;
        }
        return path;
    };


    /**
     * Simple redirect
     *
     * @param to
     */
    app.redirect = function (to) {
        window.location.href = to || window.location.href;
    };


    /**
     * Simple template builder
     *
     * @param stringData    source string data with marks "{{key1}}"
     * @param params        object {key1 : 'value'}
     * @returns {*}
     */
    app.assign = function (stringData, params) {
        if (typeof params === 'object')
            for (var k in params)
                stringData = stringData.replace(new RegExp('{{' + k + '}}', 'gi'), params[k]);

        return stringData;
    };


    /**
     * Simple inject data to HTMLElement [by selector]
     *
     * @param selector
     * @param data
     * @param append
     * @returns {*}
     */
    app.inject = function (selector, data, append) {

        if (typeof selector === 'string')
            selector = this.query(selector);

        if (typeof selector === 'object' && selector.nodeType === Node.ELEMENT_NODE) {

            if (typeof data === 'string') {
                selector.innerHTML = (!append) ? data : selector.innerHTML + data;
            }
            else if (typeof data === 'object' && data.nodeType === Node.ELEMENT_NODE) {
                if (!append)
                    selector.textContent = '';
                selector.appendChild(data);
            }

            return selector;
        }
        return null;
    };


    /**
     * Query DOM Element by selector
     *
     * @param selector
     * @param parent|callback
     * @returns {Element}
     */
    app.query = function (selector, parent) {
        var elems = this.queryAll(selector, parent);
        if (elems && elems.length > 0)
            return elems[0];
        return null;
    };


    /**
     * Query DOM Elements by selector
     *
     * @param selector
     * @param parent    callback
     * @returns {*}
     */
    app.queryAll = function (selector, parent) {
        var callback, _elemsList, elems, from = document;

        if (typeof parent === 'function')
            callback = parent;
        else if (typeof parent === 'string')
            from = document.querySelector(parent);
        else if (typeof parent === 'object' && parent.nodeType === Node.ELEMENT_NODE)
            from = parent;

        if (from) {
            if (typeof selector === 'object' &&
                (selector.nodeType === Node.ELEMENT_NODE || selector.nodeType === Node.DOCUMENT_NODE))
                elems = [selector];
            else
                elems = [].slice.call(from.querySelectorAll(selector));
        }

        if (elems.length > 0 && typeof callback == 'function')
            callback.call(this, elems);

        // debug
        if (this.debug && !elems)
            console.error("Error queryAll DOM Elements by selector ", selector);

        return elems;
    };

    /**
     * Query DOM Element by selector to up in tree
     *
     * @param selector
     * @param from
     * @param loops
     * @returns {*}
     */
    app.queryUp = function(selector, from, loops) {
        var item = null;
        if(loops === undefined) loops = 20;
        if(typeof from === 'string') from = document.querySelector(from);
        if(from.nodeType !== Node.ELEMENT_NODE) {
            from = document;
            loops = 0;
        }

        if(typeof selector === 'string')
            item = from.querySelector(selector);

        if(!item && loops > 0) {
            if(from.parentNode)
                return app.queryUp(selector, from.parentNode, --loops);
        }

        return item;
    };

    /**
     * Execute callback for each element in list
     *
     * @param list
     * @param callback
     * @param tmp
     */
    app.each = function (list, callback, tmp) {
        var i = 0;
        if (list instanceof Array)
            for (i = 0; i < list.length; i++) callback.call({}, list[i], i, tmp);
        else
            for (i in list) callback.call({}, list[i], i, tmp);
    };


    /**
     * Simple add event listener
     * @param eventName
     * @param selector
     * @param callback
     * @param bubble
     */
    app.on = function (eventName, selector, callback, bubble) {
        var elements = null;

        if (typeof selector === 'string')
            elements = app.queryAll(selector);
        else if (typeof selector === 'object' && selector.nodeType == Node.ELEMENT_NODE)
            elements = [selector];

        if(elements) {
            app.each(elements, function (item) {
                if(typeof item === 'object')
                    item.addEventListener(eventName, callback, !!bubble);
            });
        }
    };


    /**
     *
     * @type {{url: string, debug: boolean, constructsType: string, _lastKey: null, _stackRequires: {}, _stackStorage: {}, _stackConstructs: Array}}
     */
    app.prototype._properties = {

        /**
         * Base url
         */
        path: '/',

        /**
         * Current script version
         */
        version: version,

        /**
         * Debug mod
         */
        debug: true,

        /**
         * Startup type of constructor for modules
         * Type: false - off constructor
         *      'runtime' - perform during the assignment of namespace
         *      'gather' - save in the stack,
         *          for call and execute all constructor methods, use .constructsStart()
         */
        constructsType: 'runtime',

        _lastKey: null,
        _stackRequires: {},
        _stackStorage: {},
        _stackConstructs: []
    };


    /**
     * Create namespace for module-script
     *
     * @param namespace     namespace. Ex: "Module.Name" - global address is "App.Module.Name"
     * @param callback      must return Object or Function
     * @param args          arguments for a method Object.construct.
     * @returns {{}}
     */
    app.prototype.namespace = function (namespace, callback, args) {
        var
            name,
            path = namespace.split('.'),
            tmp = this || {},
            len = path.length;

        for (var i = 0; i < len; i++) {
            name = path[i].trim();
            if (typeof tmp[name] !== 'object') {
                tmp[name] = (i + 1 >= len) ? (callback ? callback.call(tmp, this, {}) : {}) : {};
                tmp = tmp[name];
            } else
                tmp = tmp[name];
        }

        if (typeof tmp === "object" && tmp.construct) {
            args = Array.isArray(args) ? args : [];
            if (this.constructsType == 'runtime') {
                tmp.construct.apply(tmp, args);
            }
            else if (this.constructsType == 'gather')
                this._stackConstructs.push(tmp);
        }

        return tmp;
    };


    /**
     * Run all modules constructs
     * @param args
     * @returns {app|NamespaceApplication}
     */
    app.prototype.constructsStart = function (args) {
        app.each(this._stackConstructs, function (item, index) {
            item.construct.apply(item, args);
        }, args);
        this._stackConstructs = [];
        return this;
    };


    /**
     * Designate a list of scripts for loading
     * @param key           list key (identifier)
     * @param path          array with scripts url
     * @param oncomplete    executing when all scripts are loaded
     * @param onerror
     * @returns {app|NamespaceApplication}
     */
    app.prototype.require = function (key, path, oncomplete, onerror) {
        this._lastKey = key;

        this._stackRequires[key] = {
            src: Array.isArray(path) ? path : [path],
            oncomplete: oncomplete,
            onerror: onerror
        };
        return this;
    };


    /**
     * Start loading the list of scripts by key (identifier)
     *
     * @param key
     * @returns {app|NamespaceApplication}
     */
    app.prototype.requireStart = function (key) {
        var source;
        key = key || this._lastKey;
        if (this._stackRequires[key]) {
            this._recursive_load_script(0, key);
        } else {
            console.error("Require source not found! Key: " + key + " not exist!");
        }
        return this;
    };


    /**
     *
     * @param i
     * @param key
     * @private
     */
    app.prototype._recursive_load_script = function (i, key) {
        var self = this,
            source = this._stackRequires[key];

        if (source.src[i]) {
            if (!Array.isArray(source.node)) source.node = [];

            source.node.push(app.script(source.src[i], function () {
                self._recursive_load_script(++i, key);
            }, source.onerror));

        } else if (i === source.src.length)
            source.oncomplete.call(self, source.node);
        else
            self._recursive_load_script(++i, key);
    };


    /**
     * Apply properties object to instance properties
     * @param properties
     * @returns {app|NamespaceApplication}
     */
    app.prototype.setProperties = function (properties) {

        if (typeof properties !== 'object') properties = {};

        var key, props = app.extend(this._properties, properties, function (key, obj, src) {
            return key.slice(0, 1) !== '_';
        });

        for (key in props)
            if (this[key] === undefined)
                this[key] = props[key];

        return this;
    };


    /**
     * Get uri
     * @param uri
     * @returns {string}
     */
    app.prototype.uri = function (uri) {
        var _uri = uri ? this.path + '/' + uri : this.path;
        _uri = _uri.replace(/\/+/ig,'/');
        return _uri.length > 1 && _uri.slice(0,1) != '/' ? '/' + _uri : _uri;
    };

    /**
     * @type {app}
     */
    window.NamespaceApplication = app;

})();