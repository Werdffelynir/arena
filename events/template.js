var App = NamespaceApplication({
    url: '/',
    name: 'NamespaceApplication',
    debug: true,
    constructsType: false,

    // Custom
    node: {}
});

App.require('dependence', [

    App.url + 'js/lib/animate.js',
    App.url + 'js/lib/clicker.js',
    App.url + 'js/lib/event.manager.js'

], onLibraryLoaded, onRequireError).requireStart('dependence');

function onRequireError(error){
    console.error('onRequireError', error);
}

function onLibraryLoaded(list){
    console.log('Application start!');
    App.Controller.initialize();
}

App.namespace('Controller', Controller);


function Controller(){
    var ctr = {};

    /** @namespace App.Controller.initialize */
    ctr.initialize = function () {
        App.domLoaded(function () {
            App.node['header'] = App.query('#header');
            App.node['navigation'] = App.query('#navigation');
            App.node['sidebar'] = App.query('#sidebar');
            App.node['content'] = App.query('#content');
            App.node['footer'] = App.query('#footer');

            var template = new Template();

            var loadList = [
                '/events/templates/header.html',
                '/events/templates/navigation.html',
                '/events/templates/sidebar.html',
                '/events/templates/content.html',
                '/events/templates/footer.html'
            ];

            function templatesLoaded(list) {
                list['header'];
                list['navigation'];
                list['sidebar'];
                list['content'];
                list['footer'];

                template.inject(App.node['header'], 'header');
                template.inject(App.node['navigation'], 'navigation', {items: 'navigation items data'});
            }

            template.load(loadList, templatesLoaded);

        })
    };

    return ctr
}




var Template = function (config) {
    if (!(this instanceof Template)) return new Template(config);
    if (typeof config === 'object')
        for (var prop in config)
            if (!this.hasOwnProperty(this[prop])) this[prop] = config[prop];

    this.ajax = Template.ajax;
    this.loades = {};
};
/*
Template.prototype.view = function (name, data) {
    if (data === undefined) {
        return this.views[name];
    } else {
        this.views[name] = this.createViewObject(name, data);
    }
};

Template.prototype.createViewObject = function (name, data) {
    if (typeof data === 'object' && data.name === name && data.type === 'view')
        return data;
    return {name: name, data: data, type: 'view', parent: null,
        events: {}
    }
};*/

Template.prototype.inject = function (to, data, append) {

};

Template.prototype.load = function (url, callback) {
    if (Array.isArray(url)) {

    } else if (typeof url === 'string') {




    }
};

Template.ajax = function (config, callback) {
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

Template.prototype.assign = function (string, data) {

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
