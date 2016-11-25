(function (global) {

    /**
     *
     * @param config
     * @returns {Template}
     * @constructor
     */
    var Template = function (config) {
        if (!(this instanceof Template)) return new Template(config);
        this.path = '';
        if (typeof config === 'object')
            for (var prop in config)
                if (!this.hasOwnProperty(this[prop])) this[prop] = config[prop];
        this.ajax = Template.ajax;
        this.loadesCount = 0;
        this.loades = {};
    };

    /**
     *
     * @param selector
     * @param data
     * @param append
     * @returns {*}
     */
    Template.prototype.inject = function (selector, data, append) {
        if (typeof selector === 'string')
            selector = document.querySelector(selector);
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
     *
     * @param viewString
     * @param params
     * @returns {*}
     */
    Template.prototype.assign = function (viewString, params) {
        if (typeof params === 'object')
            for (var k in params)
                viewString = viewString.replace(new RegExp('{{' + k + '}}', 'gi'), params[k]);

        return viewString;
    };

    /**
     *
     * @param name
     * @returns {*}
     */
    Template.prototype.parseTemplateName = function (name) {
        if (name.lastIndexOf('/') !== -1)
            name = name.substr(name.lastIndexOf('/')+1);
        if (name.lastIndexOf('.') !== -1)
            name = name.substr(0, name.lastIndexOf('.'));
        return name
    };

    /**
     *
     * @param name
     * @returns {*}
     */
    Template.prototype.get = function (name) {
        if (this.loades[name])
            return this.loades[name];
        return ''
    };

    /**
     *
     * @param url
     * @param callback
     */
    Template.prototype.internalLoader = function (url, callback) {
        this.ajax({method:'GET', url: this.path + url}, function (status, data) {
            if (status === 200) {
                this.loadesCount --;
                this.loades[this.parseTemplateName(url)] = data;
                if (this.loadesCount === 0 && typeof callback === 'function')
                    callback.call(this, this.loades);
            } else
                console.error('Error of loading template. Status code ' + status);
        }, this);
    };

    /**
     *
     * @param urls
     * @param callback
     */
    Template.prototype.load = function (urls, callback) {
        if (Array.isArray(urls)) {
            this.loadesCount = urls.length;
            for (var i = 0; i < urls.length; i ++) {
                this.internalLoader(urls[i], callback);
            }
        } else if (typeof urls === 'string') {
            this.internalLoader(urls, callback);
        }
    };

    /**
     *
     * @param config
     * @param callback
     * @param thisInstance
     * @returns {XMLHttpRequest}
     */
    Template.ajax = function (config, callback, thisInstance) {
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
            if (typeof thisInstance !== 'object') thisInstance = {};
            thisInstance.XMLHttpRequest = xhr;
            if (typeof callback === 'function')
                callback.call(thisInstance, xhr.status, xhr.responseText);
        };
        xhr.send(fd);
        return xhr;
    };

    global.Template = Template;
    global.Template.version = '0.0.1';

})(this);