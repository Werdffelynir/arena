/**
 * Animation script
 */
(function () {

    "use strict";

    window.requestAnimationFrame = function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            function (f) {
                window.setTimeout(f, 1e3 / 60);
            }
    }();

    /**
     * Constructor, create one animation canvas
     *
     * @param props_selector
     * @param width
     * @param height
     * @param fps
     * @returns {An}
     * @constructor
     */
    var An = function (props_selector, width, height, fps) {

        if (!(this instanceof An))
            return new An(props_selector, width, height, fps);

        if (arguments.length > 2 && arguments[1] > 0)
            props_selector = {selector: arguments[0], width: arguments[1], height: arguments[2], fps: arguments[3]};

        if (!props_selector || !props_selector.selector || typeof props_selector !== 'object') {
            console.error('Error: selector not find');
            return;
        }

        var pk, propertiesDefault = {

            // canvas settings
            selector: null,
            width: 600,
            height: 400,
            fps: 30,

            // events
            onFrame: null,
            onFrameBefore: null,
            onFrameAfter: null,
            onClick: null,
            onMousemove: null,
            onKeyup: null,
            onKeydown: null,

            // functionality
            /**
             * An.LOOP_ANIMATE (animation) - use requestAnimationFrame
             * An.LOOP_TIMER (timer) - use setTimeout
             */
            loop: An.LOOP_ANIMATE,
            fullScreen: false,

            autoStart: true,
            autoClear: true,
            saveRestore: false,

            enableEventClick: true,
            enableEventMousemove: false,
            enableEventKeys: false,

            // else
            contextId: '2d',
            context: null,
            canvas: null
        };

        Util.mergeObject(propertiesDefault, props_selector);

        for (pk in propertiesDefault)
            this[pk] = propertiesDefault[pk];

        // dynamics

        this.canvas = document.querySelector(this.selector);

        if (!(this.canvas instanceof HTMLCanvasElement)) {
            console.error('[Error]: Canvas element not find. selector: ' + this.selector);
            return;
        }

        if (!!this.fullScreen) {
            this.resizeCanvas();
        }

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext(this.contextId);

        if (!(this.context instanceof CanvasRenderingContext2D)) {
            console.error('[Error]: Canvas context 2d not query from element with selector: ' + this.selector);
            return;
        }

        this.isPlaying = false;
        this.isFiltering = false;
        this.setTimeoutIterator = 0;
        this.requestAnimationFrameIterator = 0;
        this.errorDrawframe = false;
        this.frameCounter = 0;
        this.eventClick = {x: 0, y: 0};
        this.eventMousemove = {x: 0, y: 0};
        this.eventKeyup = null;
        this.eventKeydown = null;

        this.lists = {
            frames: [],
            scenes: [],
            stages: {},
            layers: {},
            events: {},
            images: {}
        };

        this.options = {
            sorting: true,
            filtering: true
        };

        Util.mergeObject(this.options, props_selector);

        var that = this;

        // initialize extensions
        if (An.internalExtensions.length > 0) {
            for (var ei = 0; ei < An.internalExtensions.length; ei++)
                if (typeof An.internalExtensions[ei] === 'function')
                    An.internalExtensions[ei].call(that, that);
        }

        // It catches the mouse movement on the canvas, and writes changes root.mouse
        if (that.enableEventMousemove) {
            that.canvas.addEventListener('mousemove', function (event) {
                that.eventMousemove = that.mouse = Util.getMouseCanvas(that.canvas, event);
                if (typeof that.onMousemove === 'function')
                    that.onMousemove.call(that, that.eventMousemove, that.context);
            });
        }

        // It catches the mouse clicks on the canvas, and writes changes root.eventClick
        if (that.enableEventClick) {
            that.canvas.addEventListener('click', function (event) {
                that.eventClick = Util.getMouseCanvas(that.canvas, event);
                if (typeof that.onClick === 'function')
                    that.onClick.call(that, that.eventClick, that.context);
            });
        }

        // It catches the mouse clicks on the canvas, and writes changes root.eventClick
        if (that.enableEventKeys) {
            that.canvas.addEventListener('keydown', function (event) {
                that.eventKeydown = event;
                if (typeof that.onKeydown === 'function')
                    that.onKeydown.call(that, event, that.context);
            });
            that.canvas.addEventListener('keyup', function (event) {
                that.eventKeyup = event;
                if (typeof that.onKeyup === 'function')
                    that.onKeyup.call(that, event, that.context);
            });
        }





    };



    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // An static methods
    //


    /**
     * Constant type of timer
     * @type {string} An.LOOP_TIMER setTimeout
     * @type {string} An.LOOP_ANIMATE requestAnimationFrame
     */
    An.LOOP_TIMER = 'timer';
    An.LOOP_ANIMATE = 'animation';

    /**
     * Storage of extensions
     * @private
     * @type {Array}
     */
    An.internalExtensions = [];

    /**
     * Add extensions in loader
     * @param func
     * @constructor
     */
    An.Extension = function (func) {
        An.internalExtensions.push(func);
    };


    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // An prototype methods
    //

    /**
     * toString
     * @returns {string}
     */
    An.prototype.toString = function () {
        return '[object An]'
    };

    /**
     * The main method of drawing on the canvas in a loop
     * Internal method
     * @private
     */
    An.prototype.internalDrawframe = function () {

        this.frameCounter++;
        this.scenesFiltering();

        var i, fi, scene, sceneFlag,
            scenes = this.lists.scenes;

        if (this.autoClear === true)
            this.clear();

        if (!this.errorDrawframe) {

            if (typeof this.onFrameBefore === 'function')
                this.onFrameBefore.call(this, this.context, this.frameCounter);

            if (this.lists.frames.length > 0) {
                for (fi = 0; fi < this.lists.frames.length; fi++) {
                    if (typeof this.lists.frames[fi] === 'function')
                        this.lists.frames[fi].call(this, this.context, this.frameCounter);
                }
            }

            if (scenes.length == 0 && !this.onFrameBefore && !this.onFrameBefore && typeof this.onFrame === 'function'){
                this.onFrame.call(this, this.context, this.frameCounter);
            }else {

                for (i = 0; i < scenes.length; i++) {
                    scene = scenes[i];

                    try {
                        if (this.saveRestore)
                            this.context.save();
                        if (typeof this.onFrame === 'function')
                            this.onFrame.call(this, this.context, this.frameCounter);

                        sceneFlag = scene.runner.call(scene, this.context, this.frameCounter);

                        // Stages chain
                        if (sceneFlag === true &&
                            typeof scene.nextStage === 'string' &&
                            typeof this.lists.stages[scene.nextStage] === 'object') {

                            this.renderStage(scene.nextStage);
                            break;

                        } else if (typeof sceneFlag === 'string' &&
                            typeof this.lists.stages[sceneFlag] === 'object') {

                            this.renderStage(sceneFlag);
                            break;
                        }

                        if (this.saveRestore)
                            this.context.restore();

                    } catch (error) {
                        /**
                         * @type ReferenceError error
                         */
                        this.errorDrawframe = 'Error message: ' + error.message;
                        this.errorDrawframe += '\nError file: ' + error.fileName;
                        this.errorDrawframe += '\nError line: ' + error.lineNumber;
                        break;
                    }
                }
            }

            if (typeof this.onFrameAfter === 'function')
                this.onFrameAfter.call(this, this.context, this.frameCounter);

        } else {
            this.stop();
            console.error(this.errorDrawframe);
        }

    };

    /**
     * It renders the scene assignments,
     * or if the specified parameter name - renders the stage by name
     * @param stageName - stage name
     */
    An.prototype.render = function (stageName) {
        var run = true;
        if (typeof stageName === 'string') {
            run = this.internalStagesToScenes(stageName);
        }

        if (run && this.autoStart)
            this.play();
    };

    /**
     * Change current stage
     * @param stageName
     */
    An.prototype.renderStage = function (stageName) {
        this.internalStagesToScenes(stageName);
    };

    /**
     * Start "play" animation
     */
    An.prototype.play = function () {
        if (!this.isPlaying) {
            this.internalDrawframe();

            if (this.fps && this.loop === An.LOOP_ANIMATE) {
                this.loopAnimationFrame();
            }
            else if (this.fps && this.loop === An.LOOP_TIMER) {
                this.loopTimer();
            }

            if (this.fps > 0)
                this.isPlaying = true;
        }
    };

    /**
     * Stop "play" animation
     */
    An.prototype.stop = function () {
        if (this.isPlaying) {
            if (this.loop === An.LOOP_ANIMATE) {
                cancelAnimationFrame(this.requestAnimationFrameIterator);
            } else if (this.loop === An.LOOP_TIMER) {
                clearTimeout(this.setTimeoutIterator);
            }
            this.isPlaying = false;
        }
    };

    /**
     * Loop for timer type of "timer"
     * Internal method
     * @private
     */
    An.prototype.loopTimer = function () {
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
     * Loop for timer type of "requestAnimationFrame"
     * Internal method
     * @private
     */
    An.prototype.loopAnimationFrame = function () {
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
                // call the draw method
                that.internalDrawframe.call(that);
            }
        }(0));
    };

    /**
     * Added scene
     * @param {{index: number, hide: boolean, name: string, runner: null}|function} sceneObject
     *      index - deep of scene, option march on z-index
     *      hide - bool
     *      name - name
     *      runner - function run every time relatively root.fps
     * @returns {{index: number, hide: boolean, name: string, runner: null}}
     */
    An.prototype.scene = function (sceneObject) {
        sceneObject = this.createSceneObject(sceneObject);
        this.lists.scenes.push(sceneObject);
        return sceneObject;
    };

    /**
     * Internal method
     * @private
     */
    An.prototype.scenesFiltering = function () {
        var lists = this.lists;

        if (!this.isFiltering && lists.scenes.length > 0) {

            if (!!this.options.sorting)
                lists.scenes = lists.scenes.sort(function (one, two) {
                    return one['index'] > two['index']
                });

            if (!!this.options.filtering)
                lists.scenes = lists.scenes.filter(function (val) {
                    return !val['hide']
                });

            this.isFiltering = true;
        }
    };

    /**
     * scene object uses as frame for animation
     * @param sceneObject
     * @returns {{index: number, hide: boolean, name: string, runner: null, nextStage: null}}
     */
    An.prototype.createSceneObject = function (sceneObject) {
        var sceneObjectDefault = {
            index: 100,
            hide: false,
            name: 'scene',
            runner: null,
            nextStage: null
        };
        if (typeof sceneObject === 'function') sceneObject = {runner: sceneObject};
        Util.mergeObject(sceneObjectDefault, sceneObject);
        return sceneObjectDefault;
    };

    /**
     * Added stage
     * @param {String} stageName - name of stage, rendering is defined by name
     * @param {{index: number, hide: boolean, name: string, runner: null}|function} sceneObject - Object. is scene object
     * @param nextStage
     */
    An.prototype.stage = function (stageName, sceneObject, nextStage) {
        if (this.lists.stages[stageName] == null)
            this.lists.stages[stageName] = [];

        sceneObject = this.createSceneObject(sceneObject);
        if (nextStage)
            sceneObject.nextStage = nextStage;
        this.lists.stages[stageName].push(sceneObject);
    };

    /**
     * Internal method
     * @private
     * @param stageName
     * @param clear
     * @returns {boolean}
     */
    An.prototype.internalStagesToScenes = function (stageName, clear) {
        var i, lists = this.lists;

        if (clear !== false) this.clearScene();

        if (Array.isArray(lists.stages[stageName])) {
            for (i = 0; i < lists.stages[stageName].length; i++) {
                this.scene(lists.stages[stageName][i]);
            }
            return true;
        } else
            return false;
    };

    /**
     * It clears the canvas to render the new stage
     */
    An.prototype.clearScene = function () {
        this.lists.scenes = [];
    };

    /**
     * Clear canvas area
     */
    An.prototype.clear = function () {
        this.context.clearRect(0, 0, this.width, this.height);
    };

    /**
     * Resize element Canvas on full page, or by params
     * @param {Number} width - default full window width
     * @param {Number} height - default full window height
     */
    An.prototype.resizeCanvas = function (width, height) {
        this.canvas.style.position = 'absolute';
        this.canvas.width = this.width = width || window.innerWidth;
        this.canvas.height = this.height = height || window.innerHeight;
    };

    /**
     * Simple point
     * @param x
     * @param y
     * @returns {{x: *, y: *}}
     */
    An.prototype.point = function (x, y) {
        return {x: x, y: y};
    };

    /**
     * Simple rectangle
     * @param x
     * @param y
     * @param width
     * @param height
     * @returns {*[]}
     */
    An.prototype.rectangle = function (x, y, width, height) {
        return [x, y, width, height];
    };

    /**
     *
     * @param properties
     * @param callback
     * @returns {clip}
     */
    An.prototype.moveClip = function (properties, callback) {
        var key, that = this,
            props = {x: 0, y: 0, width: null, height: null, radius: null, rotate: 0, id: 'clip_' + this.moveClip.count,};

        if (typeof properties === 'function') {
            callback = properties;
            properties = props;
        } else
            properties = Util.mergeObject(props, properties);

        var create = function (ctx) {
            var i, args = [];
            for (i = 0; i < arguments.length; i ++) {
                args.push(arguments[i]);
            }
            callback.apply(create, args);
        };

        for (key in properties)
            if (!create.hasOwnProperty(key)) create[key] = properties[key]

        this.moveClip.count ++;
        return create;
    };
    An.prototype.moveClip.count = 0;


    /**
     * Event mouse click hitTest in rectangle
     * @param rectangle
     */
    An.prototype.hitTest = function (rectangle) {
        return this.hitTestPoint(rectangle, this.eventClick)
    };

    /**
     * point hitTest in rectangle
     * @param rectangle
     * @param point
     * @returns {boolean}
     */
    An.prototype.hitTestPoint = function (rectangle, point) {
        if (typeof rectangle !== "object" || typeof rectangle !== "object") {
            console.error("rectangle - must be Array [x, y, w, h]; point - must be Object { x: , y: }");
            return false;
        }
        return  rectangle[0]                < point.x &&
                rectangle[1]                < point.y &&
                rectangle[0] + rectangle[2] > point.x &&
                rectangle[1] + rectangle[3] > point.y;
    };

    /**
     * Loading Resource Image.
     * Object imgs:
     * key - is the name for the access, assigned after loading
     * value - is the URL of the resource to load
     * @param {Object} imgs - { key : value, key : value, ...  }
     * @param {Function} callback
     */
    An.prototype.imageLoader = function (imgs, callback) {
        if (!imgs && typeof imgs !== 'object') return;
        var that = this;
        var length = Util.objectLength(imgs);
        var images = {};
        var iterator = 0;
        for (var name in imgs) {
            var eImg = document.createElement('img');
            eImg.src = imgs[name];
            eImg.name = name;
            eImg.onload = function (e) {
                images[this.name] = this;
                iterator++;
                if (iterator == length) {
                    that.lists.images = Util.mergeObject(that.lists.images, images);
                    callback.call(that, images);
                }
            };
        }
    };

    /**
     *
     * @param name
     * @returns {*}
     */
    An.prototype.image = function (name) {
        if (!name)
            return this.lists.images;
        if (this.lists.images[name])
            return this.lists.images[name];
    };

    /**
     * Set background color for canvas element;
     * @param color
     */
    An.prototype.backgroundColor = function (color) {
        this.canvas.style.backgroundColor = color;
    };

    An.prototype.backgroundImage = function (img) {
        this.canvas.style.backgroundImage = img;
    };

    /**
     *
     * @param callback
     * @param index
     * @returns {*}
     */
    An.prototype.addFrame = function (callback, index) {
        if (!this.lists.frames) this.lists.frames = [];
        if (index === undefined) return this.lists.frames.push(callback);
        else {
            index = parseInt(index);
            this.lists.frames[index] = callback;
            return index;
        }
    };

    /**
     *
     * @param index
     * @returns {*}
     */
    An.prototype.removeFrame = function (index) {
        if (this.lists.frames[index]) this.lists.frames[index] = null;
    };



    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Utilities static methods
    //

    var Util = {};

    /**
     * Cloned object
     * @param {Object} object
     * @returns {Object}
     */
    Util.cloneObject = function (object) {
        if (object === null || typeof object !== 'object') return object;
        var temp = object.constructor();
        for (var key in object)
            temp[key] = Util.cloneObject(object[key]);
        return temp;
    };

    /**
     * Merge object into objectBase. Object objectBase will be modified!
     * @param {Object} defaultObject
     * @param {Object} object
     * @returns {*}
     */
    Util.mergeObject = function (defaultObject, object) {
        for (var key in object) {
            defaultObject[key] = object[key];
        }
        return defaultObject;
    };

    /**
     * Returns a random integer between min, max, unless specified from 0 to 100
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    Util.rand = function (min, max) {
        min = min || 0;
        max = max || 100;
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    /**
     * Random color. Returns a string HEX format color.
     * @returns {string}
     */
    Util.randColor = function () {
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

    /**
     * Returns the coordinates of the mouse on any designated element
     * @param {Object} element
     * @param {Object} event
     * @returns {{x: number, y: number}}
     */
    Util.getMouseElement = function (element, event) {
        var x = event.pageX - element.offsetLeft;
        var y = event.pageY - element.offsetTop;
        return {x: x, y: y};
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


    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Internal Extensions
    //


    /**
     * Extension expands of current context (CanvasRenderingContext2D)
     */
    An.Extension(function (self) {

        /**
         * @type An self
         * @type CanvasRenderingContext2D self.context
         */

        if (!(this instanceof An) || !(self instanceof An))
            return;

        /**
         * Draw round rectangle
         * @param x
         * @param y
         * @param width
         * @param height
         * @param radius
         */
        self.context.rectRound = function (x, y, width, height, radius) {
            width = width || 100;
            height = height || 100;
            radius = radius || 5;
            self.context.beginPath();
            self.context.moveTo(x + radius, y);
            self.context.arcTo(x + width, y, x + width, y + height, radius);
            self.context.arcTo(x + width, y + height, x, y + height, radius);
            self.context.arcTo(x, y + height, x, y, radius);
            self.context.arcTo(x, y, x + width, y, radius);
        };

        /**
         * Draw shadow for all elements on scene
         * @param x
         * @param y
         * @param blur
         * @param color
         */
        self.context.shadow = function (x, y, blur, color) {
            self.context.shadowOffsetX = x;
            self.context.shadowOffsetY = y;
            self.context.shadowBlur = blur;
            self.context.shadowColor = color;
        };

        /**
         * Clear shadow params (shadowOffsetX,shadowOffsetY,shadowBlur)
         */
        self.context.clearShadow = function () {
            self.context.shadowOffsetX = self.context.shadowOffsetY = self.context.shadowBlur = 0;
        };

        if (!self.context.ellipse) {
            /**
             * Draw ellipse - cross-browser function
             * @param x
             * @param y
             * @param radiusX
             * @param radiusY
             * @param rotation
             * @param startAngle
             * @param endAngle
             * @param anticlockwise
             */
            self.context.ellipse = function (x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
                self.context.save();
                self.context.beginPath();
                self.context.translate(x, y);
                self.context.rotate(rotation);
                self.context.scale(radiusX / radiusY, 1);
                self.context.arc(0, 0, radiusY, startAngle, endAngle, (anticlockwise || true));
                self.context.restore();
                self.context.closePath();
                self.context.stroke();
            }
        }
    });


    /**
     * Extension of simple graphic shapes
     */
    An.Extension(function (self) {

        /**
         * @type An self
         * @type CanvasRenderingContext2D self.context
         */

        if (!(this instanceof An) || !(self instanceof An))
            return;

        var Graphic = {};

        /**
         *
         * @param points
         * @param color
         * @param fill
         * @param closePath
         * @param lineWidth
         */
        Graphic.shape = function (points, color, fill, closePath, lineWidth) {

            var positions = [];
            var i, temp = {};

            points.map(function (p) {
                if (temp.x === undefined) {
                    temp.x = p
                }
                else if (temp.y === undefined) {
                    temp.y = p
                }
                if (temp.x !== undefined && temp.y !== undefined) {
                    positions.push(temp);
                    temp = {};
                }
            });

            self.context.beginPath();

            for (i = 0; i < positions.length; i++) {
                self.context.lineTo(positions[i].x, positions[i].y);
            }

            if (fill) {
                if (typeof fill === 'string') {
                    Graphic.shape(points, color, true);
                    Graphic.shape(points, fill, false, closePath, lineWidth);
                } else {
                    self.context.closePath();
                    self.context.fillStyle = color || '#000';
                    self.context.fill();
                }
            }
            else {

                if (lineWidth)
                    self.context.lineWidth = lineWidth;

                if (closePath !== false)
                    self.context.closePath();

                self.context.strokeStyle = color || '#000';
                self.context.stroke();
            }

        };

        /**
         *
         * @param x
         * @param y
         * @param width
         * @param height
         * @param color
         * @param fill
         */
        Graphic.rect = function (x, y, width, height, color, fill) {
            self.context.beginPath();
            self.context.rect(x || 0, y || 0, width || 100, height || 100);

            if (fill) {
                self.context.fillStyle = color || '#000';
                self.context.fill();
                if (typeof fill === 'string') {
                    self.context.strokeStyle = fill || '#000';
                    self.context.strike();
                }
            }
            else {
                self.context.strokeStyle = color || '#000';
                self.context.stroke();
            }
            self.context.closePath();
        };

        /**
         *
         * @param x
         * @param y
         * @param width
         * @param height
         * @param radius
         * @param color
         * @param fill
         */
        Graphic.rectRound = function (x, y, width, height, radius, color, fill) {
            self.context.rectRound(x, y, width, height, radius);
            if (fill) {
                self.context.fillStyle = color || '#000';
                self.context.fill();
                if (typeof fill === 'string') {
                    self.context.strokeStyle = fill || '#000';
                    self.context.strike();
                }
            }
            else {
                self.context.strokeStyle = color || '#000';
                self.context.stroke();
            }
            self.context.closePath();
        };

        /**
         *
         * @param x
         * @param y
         * @param radius
         * @param color
         * @param fill
         */
        Graphic.circle = function (x, y, radius, color, fill) {
            Graphic.rectRound(x - (radius / 2), y - (radius / 2), radius, radius, radius / 2, color, fill);
        };

        // line.line(10, 10, 100, 2, 'blue');

        /**
         *
         * @param point1
         * @param point2
         * @param lineWidth
         * @param color
         */
        Graphic.line = Graphic.linePoints = function (point1, point2, lineWidth, color) {
            self.context.beginPath();
            self.context.lineWidth = lineWidth || 1;
            self.context.strokeStyle = color;
            self.context.moveTo(point1.x, point1.y);
            self.context.lineTo(point2.x, point2.y);
            self.context.stroke();

            self.context.beginPath();
            self.context.closePath();
        };

        /**
         *
         * @param x
         * @param y
         * @param width
         * @param lineWidth thickness
         * @param color
         */
        Graphic.lineWidth = function (x, y, width, lineWidth, color) {
            if (width < 0) {
                x -= Math.abs(width);
                width = Math.abs(width);
            }
            Graphic.linePoints(self.point(x, y), self.point(x + width, y), lineWidth, color);
        };

        Graphic.lineHeight = function (x, y, height, lineWidth, color) {
            if (height < 0) {
                y -= Math.abs(height);
                height = Math.abs(height);
            }
            Graphic.linePoints(self.point(x, y), self.point(x, y + height), lineWidth, color);
        };

        self.Graphic = Graphic;
    });


    /**
     * Extension of simple Text
     */
    An.Extension(function (self) {

        /**
         * @type An self
         * @type CanvasRenderingContext2D self.context
         */

        if (!(this instanceof An) || !(self instanceof An))
            return;

        /**
         * font             Настройки шрифта. Значение по умолчанию: 10px sans-serif.
         *                      font 12pt/10pt sans-serif
         *                      font bold italic 110% serif
         *                      font normal small-caps 12px/14px fantasy
         *                      font 400 24pt
         *                      font italic 900 14px/10px Arial
         * textAlign        Определяет выравнивание текста по горизонтали.
         *                      Возможные значения: start (по умолчанию), end, left, right или center.
         * textBaseline     Определяет выравнивание текста относительно базовой линии.
         *                      Возможные значения: top, hanging, middle, alphabetic (по умолчанию), ideographic, bottom.
         * direction        Направление текста.
         *                      Возможные значения: ltr, rtl, inherit (по умолчанию).
         * @type {{font: string, lineWidth: number, textBaseline: string}}
         */
        var Text = {
            font: '12px Arial, sans',
            textAlign: 'start',
            textBaseline: "top",
            direction: "inherit",
            lineWidth: 1,
            color: null
        };

        /**
         *
         * @param x
         * @param y
         * @param label
         * @param color
         * @param fill
         */
        Text.write = function (x, y, label, color, fill) {

            if (Text.font)
                self.context.font = Text.font;

            if (Text.textAlign)
                self.context.textAlign = Text.textAlign;

            if (Text.textBaseline)
                self.context.textBaseline = Text.textBaseline;

            if (Text.direction)
                self.context.direction = Text.direction;

            if (Text.lineWidth)
                self.context.lineWidth = Text.lineWidth;

            if (Text.color)
                color = Text.color;

            self.context.beginPath();

            if (fill === true || fill === undefined) {
                self.context.fillStyle = color || '#DDD';
                self.context.fillText(label, x, y);

                if (typeof fill === 'string') {
                    self.context.strokeStyle = fill || '#000';
                    self.context.strokeText(label, x, y);
                }
            }
            else {
                self.context.strokeStyle = color || '#000';
                self.context.strokeText(label, x, y);
            }

            self.context.closePath();
        };

        self.Text = Text;
    });


    /**
     * Extension of simple Event
     */
    An.Extension(function (self) {

        /**
         * @type An self
         * @type CanvasRenderingContext2D self.context
         */

        if (!(this instanceof An) || !(self instanceof An))
            return;

        var Event = {
            clicks : null, // [],
            rectclicks : null, // {},
            keyups : null, // {},
            keydowns : null // {},
        };

        Event.addClick = function (callback, index) {
            if (!this.clicks) this.clicks = [];
            if (index === undefined) return this.clicks.push(callback);
            else {
                index = parseInt(index);
                this.clicks[index] = callback;
                return index;
            }
        };
        Event.removeClick = function (index) {
            if (this.clicks[index]) this.clicks[index] = null;
        };

        Event.addRectClick = function (rectangle, callback) {
            if(this.rectclicks == null) this.rectclicks = {};
            var eventItem = rectangle.join('_');
            if(this.rectclicks[eventItem] == null)
                this.rectclicks[eventItem] = {rectangle: rectangle, callback: callback};
        };
        Event.removeRectClick = function (rectangle) {
            var item = rectangle.join('_');
            if(this.rectclicks != null && this.rectclicks[item] != null)
                delete this.rectclicks[item];
        };

        Event.addKeydown = function (keyCode, callback) {
            if(this.keydowns == null) this.keydowns = {};
            this.keydowns[keyCode] = {keyCode: keyCode, callback: callback};
        };
        Event.removeKeydown = function (keyCode) {
            if(this.keydowns[keyCode]) delete this.keydowns[keyCode];
        };

        Event.addKeyup = function (keyCode, callback) {
            if(this.keyups == null) this.keyups = {};
            this.keyups[keyCode] = {keyCode: keyCode, callback: callback};
        };
        Event.removeKeyup = function (keyCode) {
            delete this.keyups[keyCode];
        };

        Event.init = function (ctx, frameCounter) {
            var point, that = this;

            if (self.enableEventClick && (that.clicks || that.rectclicks)) {
                self.canvas.addEventListener('click', function(event){
                    point = Util.getMouseCanvas(self.canvas, event);

                    if (that.clicks && typeof that.clicks === 'object' && that.clicks.length > 0) {
                        that.clicks.map(function(cb){
                            if (typeof cb === 'function')
                                cb.call(self, point, self.context ,event);
                        });
                    }

                    if (that.rectclicks && typeof that.rectclicks === 'object') {
                        for (var kc in that.rectclicks) {
                            if (typeof that.rectclicks[kc] === 'object' && self.hitTestPoint(that.rectclicks[kc].rectangle, point)) {
                                that.rectclicks[kc].callback.call(self, point, self.context ,event);
                            }
                        }
                    }

                });
            }

            if (self.enableEventKeys) {
                window.document.addEventListener('keydown', function (event) {
                    if (that.keydowns && typeof that.keydowns === 'object') {
                        for (var kc in that.keydowns) {
                            if (event.keyCode == kc && typeof that.keydowns[kc] === 'object') {
                                that.keydowns[kc].callback.call(self, event, self.context);
                            }
                        }
                    }
                });
                window.document.addEventListener('keyup', function (event) {
                    if (that.keyups && typeof that.keyups === 'object') {
                        for (var kc in that.keyups) {
                            if (event.keyCode == kc && typeof that.keyups[kc] === 'object') {
                                that.keyups[kc].callback.call(self, event, self.context);
                            }
                        }
                    }
                });
            }
        };

        self.Event = Event;
        self.Event.init();
    });


    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // External out
    //

    window.An = An;
    window.An.Util = Util;
    window.An.version = '0.2.2';
    window.An.point = An.prototype.point;
    window.An.rectangle = An.prototype.rectangle;

})();