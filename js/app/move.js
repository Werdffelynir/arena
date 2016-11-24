
var App = new NamespaceApplication({
    constructsType: false,
    debug: true,
    url: '/',
    node: {}
});

App.require('libs', [
        App.url + 'js/lib/clicker.js',
        App.url + 'js/lib/animate.js',
        App.url + 'js/lib/timer.js',
        App.url + 'js/lib/util.js'
    ], initLibrary, initError)
    .requireStart('libs');

function initError(error) {
    console.error('initError', error);
}

function initLibrary(list) {
    console.log('Application start!');

    App.Controller.initialize();
}

App.namespace('Controller', Controller);
function Controller () {
    var ctr = {};
    /** @namespace App.Controller.initialize */
    ctr.initialize = function () {
        App.domLoaded(function () {

        })
    };

    return ctr
}
