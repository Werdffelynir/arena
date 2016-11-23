(function () {

    /**
     *
     * @param _options  options Object or selector
     * @param width
     * @param height
     * @param fps
     * @returns {Animate}
     * @constructor
     */
    var Animate = function (_options, width, height, fps) {

        if (!(this instanceof Animate))
            return new Animate(_options, width, height, fps);

        if (arguments.length > 2 && arguments[1] > 0)
            _options = {selector: arguments[0], width: arguments[1], height: arguments[2], fps: arguments[3]};

        var pk, properties = {
            selector: null,
            width: 600,
            height: 400,
            fps: 30,
            loop: 'animation',
            autoClear: true,
            sorting: true,
            filtering: true
        };

        Util.defaultObject(properties, _options);

        for (pk in properties)
            this[pk] = properties[pk];

        this.isPlay = false;
        this.isFiltering = false;
        this.setTimeoutIterator = 0;
        this.requestAnimationFrameIterator = 0;
        this.frameCounter = 0;
        this.frameStorageList = {};
        this.frameName = 'default';
        this.onFrame = null;
        this.canvas = document.querySelector(this.selector);

        if (!(this.canvas instanceof HTMLCanvasElement)) {
            console.error('[Error]: Canvas element not find. selector: ' + this.selector);
        } else {
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.context = this.canvas.getContext('2d');
            if (!(this.context instanceof CanvasRenderingContext2D)) {
                console.error('[Error]: Canvas context 2d not query from element with selector: ' + this.selector);
            }
        }
    };

    Animate.LOOP_TIMER = 'timer';
    Animate.LOOP_ANIMATE = 'animation';
    Animate.prototype.internalDrawframe = function () {
        var i, frame;
        var frames = this.frameStorageList[this.frameName];
        this.frameCounter++;

        if (this.autoClear === true)
            this.clear();

        if (Array.isArray(frames)) {
            if (!this.isFiltering && frames.length > 0) {
                if (!!this.sorting)
                    frames = frames.sort(function (one, two) {
                        return one['index'] > two['index']
                    });
                if (!!this.filtering)
                    frames = frames.filter(function (val) {
                        return !val['hide']
                    });
                this.isFiltering = true;
            }
            for (i = 0; i < frames.length; i++) {
                frame = frames[i];
                if (typeof this.onFrame === 'function')
                    this.onFrame.call(this, this.context, this.frameCounter);
                frame.runner.call(frame, this.context, this.frameCounter);
            }
        }
    };


    /**
     * Clear canvas area
     */
    Animate.prototype.clear = function () {
        this.context.clearRect(0, 0, this.width, this.height);
    };

    /**
     *
     * @param name
     * @param sceneObject Object {index: 100, hide: false, name: 'scene', runner: null}
     * @returns {*}
     */
    Animate.prototype.frame = function (name, sceneObject) {
        if((typeof name === 'object' || typeof name === 'function') && arguments.length === 1){
            sceneObject = name;
            name = 'default';
        }

        sceneObject = this.createSceneObject(sceneObject);
        if (!Array.isArray(this.frameStorageList[name]))
            this.frameStorageList[name] = [];
        this.frameStorageList[name].push(sceneObject);
        return sceneObject;
    };

    /**
     *
     * @param sceneObject
     * @returns {{index: number, hide: boolean, name: string, runner: null}}
     */
    Animate.prototype.createSceneObject = function (sceneObject) {
        var sceneObjectDefault = {index: 100, hide: false, name: 'scene', runner: null};
        if (typeof sceneObject === 'function') sceneObject = {runner: sceneObject};
        Util.defaultObject(sceneObjectDefault, sceneObject);
        return sceneObjectDefault;
    };

    /**
     *
     * @param frameName
     */
    Animate.prototype.start = function (frameName) {
        this.play(frameName || 'default');
    };

    /**
     *
     * @param frameName
     */
    Animate.prototype.play = function (frameName) {
        if (!this.isPlay && this.context) {
            this.frameName = frameName;
            if (this.fps === 0 || this.fps === false) {
                this.internalDrawframe.call(this);
            } else if (this.loop === Animate.LOOP_ANIMATE) {
                this.loopAnimationFrame();
                this.isPlay = true;
            } else if (this.loop === Animate.LOOP_TIMER) {
                this.loopTimer();
                this.isPlay = true;
            }
        }
    };

    /**
     *
     */
    Animate.prototype.stop = function () {
        if (this.isPlay) {
            if (this.loop === Animate.LOOP_ANIMATE) {
                cancelAnimationFrame(this.requestAnimationFrameIterator);
                this.isPlay = false;
            } else if (this.loop === Animate.LOOP_TIMER) {
                clearTimeout(this.setTimeoutIterator);
                this.isPlay = false;
            }
        }
    };

    /**
     *
     */
    Animate.prototype.loopTimer = function () {
        var that = this;
        var fps = this.fps || 30;
        var interval = 1000 / fps;

        return (function loop(time) {
            that.setTimeoutIterator = setTimeout(loop, interval);
            // call the draw method
            that.internalDrawframe.call(that);
        }());
    };

    /**
     *
     */
    Animate.prototype.loopAnimationFrame = function () {
        var that = this;
        var then = new Date().getTime();
        var fps = this.fps || 30;
        var interval = 1000 / fps;

        return (function loop(time) {
            that.requestAnimationFrameIterator = requestAnimationFrame(loop);
            var now = new Date().getTime();
            var delta = now - then;
            if (delta > interval) {
                then = now - (delta % interval);
                that.internalDrawframe.call(that);
            }
        }(0));
    };

    /**
     *
     * @param properties
     * @param callback
     * @returns {clip}
     */
    Animate.prototype.clip = function (properties, callback) {
        var key, that = this,
            props = {x: 0, y: 0, width: null, height: null, radius: null, rotate: 0, id: 'clip_' + this.moveClip.count,};

        if (typeof properties === 'function') {
            callback = properties;
            properties = props;
        } else
            properties = Util.defaultObject(props, properties);

        var create = function (ctx) {
            var i, args = [];
            for (i = 0; i < arguments.length; i ++) {
                args.push(arguments[i]);
            }
            callback.apply(create, args);
        };

        for (key in properties)
            if (!create.hasOwnProperty(key)) create[key] = properties[key]

        this.clip.count ++;
        return create;
    };
    Animate.prototype.clip.count = 0;



    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Utilities static methods
    //

    var Util = {};


    /**
     *
     * @param defaultObject
     * @param object
     * @returns {*}
     */
    Util.defaultObject = function (defaultObject, object) {
        for (var key in object) {
            defaultObject[key] = object[key];
        }
        return defaultObject;
    };


    /**
     * Returns the coordinates of the mouse on canvas element
     * @param {Object} canvas
     * @param {Object} event
     * @returns {{x: number, y: number}}
     */
    Util.getMouseCanvas = function (canvas, event) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    };


    /**
     * Returns a random integer between min, max, unless specified from 0 to 100
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    Util.random = function (min, max) {
        min = min || 0;
        max = max || 100;
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    /**
     * Random color. Returns a string HEX format color.
     * @returns {string}
     */
    Util.randomColor = function () {
        var letters = '0123456789ABCDEF'.split(''),
            color = '#';
        for (var i = 0; i < 6; i++)
            color += letters[Math.floor(Math.random() * 16)];
        return color;
    };

    /**
     * Converts degrees to radians
     * @param {number} deg - degrees
     * @returns {number}
     */
    Util.degreesToRadians = function (deg) {
        return (deg * Math.PI) / 180;
    };

    /**
     * Converts radians to degrees
     * @param {number} rad - radians
     * @returns {number}
     */
    Util.radiansToDegrees = function (rad) {
        return (rad * 180) / Math.PI;
    };

    /**
     * Calculate the number of items in e "obj"
     * @param {Object} obj
     * @returns {number}
     */
    Util.objectLength = function (obj) {
        var it = 0;
        for (var k in obj) it++;
        return it;
    };

    /**
     * Cloned object
     * @param {Object} object
     * @returns {Object}
     */
    Util.cloneObject = function (object) {
        if (object === null || typeof object !== 'object') return obj;
        var temp = object.constructor();
        for (var key in object)
            temp[key] = Util.cloneObject(object[key]);
        return temp;
    };


    /**
     * Calculate the distance between points
     * @param {Object} p1
     * @param {number} p1.x
     * @param {number} p1.y
     * @param {Object} p2
     * @param {number} p2.x
     * @param {number} p2.y
     * @returns {number}
     */
    Util.distanceBetween = function (p1, p2) {
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    };


    window.Animate = Animate;
    window.Animate.Util = Util;

})();