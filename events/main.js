NamespaceApplication.domLoaded(function(){

    var clicker = new Clicker();
    var observer = new ObserverManager(true);

    var Scenes = {};
    Scenes.display = document.querySelector('#display');
    Scenes.html = {main:'',menu:'',world:''};

    Scenes.main = function () {
        console.log('main', this.display);
        this.display.innerHTML = '<h1>Main Scenes</h1>';
    };

    Scenes.menu = function () {
        console.log('menu', this.display);
        this.display.innerHTML = '<h1>Menu Scenes</h1>';
    };

    Scenes.world = function () {
        console.log('world', this.display);
        this.display.innerHTML = '<h1>World Scenes</h1>';
    };

    clicker.click('navigation', function (k, v) {
        if (v == 'main') observer.dispatch('main');
        if (v == 'menu') observer.dispatch('menu');
        if (v == 'world') observer.dispatch('world');
    });

    observer.add('main' , Scenes.main, Scenes);
    observer.add('menu' , Scenes.menu, Scenes);
    observer.add('world' , Scenes.world, Scenes);

    observer.dispatch('main');

});

