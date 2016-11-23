var App = new NamespaceApplication({
    constructsType: false,
    debug: true,
    url: '/',
    node: {}
});

// Libs scripts
App.require('libs', [
    App.url + 'js/lib/clicker.js',
    App.url + 'js/lib/animate.js',
    App.url + 'js/lib/timer.js',
    App.url + 'js/lib/util.js'
], initLibrary, initError);

// Module scripts
App.require('module', [
    App.url + 'js/app/module/api.js',
    App.url + 'js/app/module/view.js',
    App.url + 'js/app/module/query.js',
    App.url + 'js/app/controller.js'

], initDependence, initError);

// Start loading the 'libs' scripts
App.requireStart('libs');

// Load error
function initError(error){
    console.error('initError' , error);
}

// After load 'libs' scripts. start loading the 'dependence' scripts
function initLibrary(list){
    App.requireStart('module');
}

// Start Application
function initDependence(list) {
    console.log('Application start!');
    App.Controller.initialize();
}


