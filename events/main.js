NamespaceApplication.domLoaded(function(){

    var clicker = new Clicker();
    var observer = new ObserverManager(true);

    var Scenes = {};
    Scenes.display = document.querySelector('#display');
    Scenes.html = {main:'',menu:'',world:''};

    Scenes.main = function () {
        console.log('main', this.display);
        this.display.innerHTML = '<p>Main Scenes</p>';
    };

    Scenes.menu = function () {
        console.log('menu', this.display);
        this.display.innerHTML = '<p>Menu Scenes</p>';
    };

    Scenes.world = function () {
        console.log('world', this.display);
        this.display.innerHTML = '<p>World Scenes</p>';
    };



/*
    clicker.click('navigation', function (k, v) {
        if (v == 'main') observer.dispatch('main');
        if (v == 'menu') observer.dispatch('menu');
        if (v == 'world') observer.dispatch('world');
    });

    observer.add('main' , Scenes.main, Scenes);
    observer.add('menu' , Scenes.menu, Scenes);
    observer.add('world' , Scenes.world, Scenes);

    observer.dispatch('main');*/







});

