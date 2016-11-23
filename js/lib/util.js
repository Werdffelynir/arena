/**
 * Module util.js
 * Its static common helpers methods
 * @version 0.2.2
 */

(function (window) {

    if (!Array.isArray) {
        Array.isArray = function (arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }

    var Util = {};

    /**
     * Deeply extends two objects
     * @param  {Object} destination The destination object, This object will change
     * @param  {Object} source      The custom options to extend destination by
     * @return {Object}             The desination object
     */
    Util.extend = function(destination, source) {
        var property;
        for (property in source) {
            if (source[property] && source[property].constructor && source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                Util.extend(destination[property], source[property]);
            } else {
                destination[property] = source[property];
            }
        }
        return destination;
    };

    /**
     * Clone object
     * @param   {Object} source
     * @returns {*}
     */
    Util.cloneObject = function (source) {
        if (source === null || typeof source !== 'object') return source;
        var temp = source.constructor();
        for (var key in source)
            temp[key] = Util.cloneObject(source[key]);
        return temp;
    };

    /**
     * Count object length
     * @param   {Object} source
     * @returns {number}
     */
    Util.objectLength = function (source) {
        var it = 0;
        for (var k in source) it++;
        return it;
    };

    /**
     * Merge an object `src` into the object `objectBase`
     * @param objectBase    main object of merge
     * @param src           the elements of this object will be added/replaced to main object `obj`
     * @returns {*}         object result
     */
    Util.objectMerge = function (objectBase, src) {
        if (typeof objectBase !== 'object' || typeof src !== 'object')
            return false;

        if (Object.key) {
            Object.keys(src).forEach(function (key) {
                objectBase[key] = src[key];
            });
            return objectBase;
        } else {
            for (var key in src)
                if (src.hasOwnProperty(key)) objectBase[key] = src[key];
            return objectBase;
        }
    };

    /**
     * Merge objects if `objectBase` key not exists
     * @param objectBase
     * @param src
     * @returns {*}
     */
    Util.objectMergeNotExists = function (objectBase, src) {
        for (var key in src)
            if (objectBase[key] === undefined)
                objectBase[key] = src[key];
        return objectBase;
    };

    /**
     * Merge objects if `objectBase` key is exists
     * @param objectBase
     * @param src
     * @returns {*}
     */
    Util.objectMergeOnlyExists = function (objectBase, src) {
        for (var key in src)
            if (objectBase[key] !== undefined)
                objectBase[key] = src[key];
        return objectBase;
    };

    /**
     * Merge an array `src` into the array `arrBase`
     * @param arrBase
     * @param src
     * @returns {*}
     */
    Util.arrayMerge = function (arrBase, src) {
        if( !Array.isArray(arrBase) || !Array.isArray(src) )
            return false;

        for (var i = 0; i < src.length; i++)
            arrBase.push(src[i])

        return arrBase;
    };

    /**
     * Computes the difference of arrays
     * Compares arr1 against one or more other arrays and returns the values in arr1
     * that are not present in any of the other arrays.
     * @param arr1
     * @param arr2
     * @returns {*}
     */
    Util.arrayDiff = function (arr1, arr2) {
        if (Util.inArray(arr1) && Util.inArray(arr2)) {
            return arr1.slice(0).filter(function (item) {
                return arr2.indexOf(item) === -1;
            })
        }
        return false;
    };

    /**
     *
     * @param needle
     * @param haystack
     * @returns {boolean}
     */
    Util.inArray = function (needle, haystack) {
        if(Array.isArray(haystack))
            return haystack.indexOf(needle) !== -1;
    };

    /**
     * 
     * @param obj
     * @returns {Array.<T>}
     */
    Util.objectToArray = function (obj) {
        return [].slice.call(obj);
    };

    /**
     * 
     * @param obj
     * @returns {Array}
     */
    Util.realObjectToArray = function (obj) {
        var arr = [];
        for(var key in obj)
            arr.push(obj[key])
        return arr;
    };

    /**
     *
     * @param func
     * @returns {temporary}
     */
    Util.cloneFunction = function(func) {
        var temp = function temporary() { return func.apply(this, arguments); };
        for(var key in this) {
            if (this.hasOwnProperty(key)) {
                temp[key] = this[key];
            }
        }
        return temp;
    };

    /**
     * Check on typeof is string a param
     * @param param
     * @returns {boolean}
     */
    Util.isString = function (param) {
        return typeof param === 'string';
    };

    /**
     * Check on typeof is array a param
     * @param param
     * @returns {boolean}
     */
    Util.isArray = function (param) {
        return Array.isArray(param);
    };

    /**
     * Check on typeof is object a param
     * @param param
     * @returns {boolean}
     */
    Util.isObject = function (param) {
        return (param !== null && typeof param == 'object');
    };

    /**
     * Determine param is a number or a numeric string
     * @param value
     * @returns {boolean}
     */
    Util.isNumeric = function (value) {
        //return parseFloat(value) !== NaN && isFinite(value)
        return !isNaN(parseFloat(value)) && isFinite(value);
    };

    Util.isInteger = Number.isInteger || function(value) {
        return typeof value === 'number' && !(value % 1);
    };

    Util.isIterated = function (data) {
        return typeof data === 'object';
    };

    // Determine whether a variable is empty
    Util.isEmpty = function (param) {
        return (param === "" || param === 0 || param === "0" || param === null || param === undefined || param === false || (Util.inArray(param) && param.length === 0));
    };

    Util.isHtml = function (param) {
        if(Util.isNode(param)) return true;
        return Util.isNode(Util.html2node(param));
    };
    
    Util.isNode = function (param) {
        var types = [1, 9, 11];
        if(typeof param === 'object' && types.indexOf(param.nodeType) !== -1) return true;
        else return false;
    };

    /**
     * Вернет тип передаваемого параметра value, или сравнит тип value с передаваемым type и вернет bool
     * ('String', 'Array', 'Date', 'Object', 'Number', 'Function', ...)
     * @param value
     * @param type
     * @returns {string|boolean}
     */
    Util.isType = function (value, type) {
        var toClass = {}.toString,
            toStringValue = toClass.call(value),
            toType = toStringValue.match(/\[object\s(\w+)\]/i)[1];
        if(typeof type === 'string')
            return toType.toLowerCase() === type.toLowerCase();
        else
            return toType;
    };
    
    /**
     * 
     * Node.ELEMENT_NODE - 1 - ELEMENT
     * Node.TEXT_NODE - 3 - TEXT
     * Node.PROCESSING_INSTRUCTION_NODE - 7 - PROCESSING
     * Node.COMMENT_NODE - 8 - COMMENT
     * Node.DOCUMENT_NODE - 9 - DOCUMENT
     * Node.DOCUMENT_TYPE_NODE - 10 - DOCUMENT_TYPE
     * Node.DOCUMENT_FRAGMENT_NODE - 11 - FRAGMENT
     * Uses: Util.isNodeType(elem, 'element')
     */
    Util.isNodeType = function (param, type) {
        type = String((type?type:1)).toUpperCase();
        if(typeof param === 'object') {
            switch(type){
                case '1':
                case 'ELEMENT':
                    return param.nodeType === Node.ELEMENT_NODE;
                    break;
                case '3':
                case 'TEXT':
                    return param.nodeType === Node.TEXT_NODE;
                    break;
                case '7':
                case 'PROCESSING':
                    return param.nodeType === Node.PROCESSING_INSTRUCTION_NODE;
                    break;
                case '8':
                case 'COMMENT':
                    return param.nodeType === Node.COMMENT_NODE;
                    break;
                case '9':
                case 'DOCUMENT':
                    return param.nodeType === Node.DOCUMENT_NODE;
                    break;
                case '10':
                case 'DOCUMENT_TYPE':
                    return param.nodeType === Node.DOCUMENT_TYPE_NODE;
                    break;
                case '11':
                case 'FRAGMENT':
                    return param.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
                    break;
                default: return false;
            }
        }
        else return false;
    };
    
    /**
     * Determine param to undefined type
     * @param param
     * @returns {boolean}
     */
    Util.defined = function (param) {
        return typeof(param) != 'undefined';
    };

    /**
     * Javascript object to JSON data
     * @param data
     */
    Util.objectToJson = function (data) {
        return JSON.stringify(data);
    };

    /**
     * JSON data to Javascript object
     * @param data
     */
    Util.jsonToObject = function (data) {
        return JSON.parse(data);
    };

    /**
     * Cleans the array of empty elements
     * @param src
     * @returns {Array}
     */
    Util.cleanArr = function (src) {
        var arr = [];
        for (var i = 0; i < src.length; i++)
            if (src[i]) arr.push(src[i]);
        return arr;
    };

    /**
     * Return type of data as name object "Array", "Object", "String", "Number", "Function"
     * @param data
     * @returns {string}
     */
    Util.typeOf = function (data) {
        return Object.prototype.toString.call(data).slice(8, -1);
    };

    /**
     * Convert HTML form to encode URI string
     * @param form
     * @param asObject
     * @returns {*}
     */
    Util.formData = function (form, asObject) {
        var obj = {}, str = '';
        for (var i = 0; i < form.length; i++) {
            var f = form[i];
            if (f.type == 'submit' || f.type == 'button') continue;
            if ((f.type == 'radio' || f.type == 'checkbox') && f.checked == false) continue;
            var fName = f.nodeName.toLowerCase();
            if (fName == 'input' || fName == 'select' || fName == 'textarea') {
                obj[f.name] = f.value;
                str += ((str == '') ? '' : '&') + f.name + '=' + encodeURIComponent(f.value);
            }
        }
        return (asObject === true) ? obj : str;
    };

    /**
     * HTML string convert to DOM Elements Object
     * @param data
     * @returns {*}
     */
    Util.toNode = function (data) {
        var parser = new DOMParser();
        var node = parser.parseFromString(data, "text/xml");
        console.log(node);
        if (typeof node == 'object' && node.firstChild.nodeType == Node.ELEMENT_NODE)
            return node.firstChild;
        else return false;
    };

    /**
     * Removes duplicate values from an array
     * @param arr
     * @returns {Array}
     */
    Util.uniqueArray = function (arr) {
        var tmp = [];
        for (var i = 0; i < arr.length; i++) {
            if (tmp.indexOf(arr[i]) == "-1") tmp.push(arr[i]);
        }
        return tmp;
    };

    /**
     * Reads entire file into a string, synchronously
     * This function uses XmlHttpRequest and cannot retrieve resource from different domain.
     * @param url
     * @returns {*|string|null|string}
     */
    Util.fileGetContents = function (url) {
        var req = null;
        try {
            req = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                req = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {
                try {
                    req = new XMLHttpRequest();
                } catch (e) {
                }
            }
        }
        if (req == null) throw new Error('XMLHttpRequest not supported');
        req.open("GET", url, false);
        req.send(null);
        return req.responseText;
    };

    /**
     * Calculates the position and size of elements.
     *
     * @param elem
     * @returns {{y: number, x: number, width: number, height: number}}
     */
    Util.getPosition = function (elem) {
        var top = 0, left = 0;
        if (elem.getBoundingClientRect) {
            var box = elem.getBoundingClientRect();
            var body = document.body;
            var docElem = document.documentElement;
            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
            var clientTop = docElem.clientTop || body.clientTop || 0;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;
            top = box.top + scrollTop - clientTop;
            left = box.left + scrollLeft - clientLeft;
            return {y: Math.round(top), x: Math.round(left), width: elem.offsetWidth, height: elem.offsetHeight};
        } else { //fallback to naive approach
            while (elem) {
                top = top + parseInt(elem.offsetTop, 10);
                left = left + parseInt(elem.offsetLeft, 10);
                elem = elem.offsetParent;
            }
            return {x: left, y: top, width: elem.offsetWidth, height: elem.offsetHeight};
        }
    };

    /**
     * Returns the coordinates of the mouse on any element
     * @param event
     * @param element
     * @returns {{x: number, y: number}}
     */
    Util.getMousePosition = function (event, element) {
        var positions = {x: 0, y: 0};
        element = element || document.body;
        if(element instanceof HTMLElement && event instanceof MouseEvent) {
            if(element.getBoundingClientRect) {
                var rect = element.getBoundingClientRect();
                positions.x = event.clientX - rect.left;
                positions.y = event.clientY - rect.top;
            }else {
                positions.x = event.pageX - element.offsetLeft;
                positions.y = event.pageY - element.offsetTop;
            }
        }
        return positions;
    };

    /**
     * Creator of styles, return style-element or style-text.
     *
     * <pre>var style = createStyle('body','font-size:10px');
     *style.add('body','font-size:10px')       // added style
     *style.add( {'background-color':'red'} )  // added style
     *style.getString()                        // style-text
     *style.getObject()                        // style-element</pre>
     *
     * @param selector      name of selector styles
     * @param property      string "display:object" or object {'background-color':'red'}
     * @returns {*}         return object with methods : getString(), getObject(), add()
     */
    Util.createStyle = function (selector, property) {
        var o = {
            content: '',
            getString: function () {
                return '<style rel="stylesheet">' + "\n" + o.content + "\n" + '</style>';
            },
            getObject: function () {
                var st = document.createElement('style');
                st.setAttribute('rel', 'stylesheet');
                st.textContent = o.content;
                return st;
            },
            add: function (select, prop) {
                if (typeof prop === 'string') {
                    o.content += select + "{" + ( (prop.substr(-1) == ';') ? prop : prop + ';' ) + "}";
                } else if (typeof prop === 'object') {
                    o.content += select + "{";
                    for (var key in prop)
                        o.content += key + ':' + prop[key] + ';';
                    o.content += "}";
                }
                return this;
            }
        };
        return o.add(selector, property);
    };

    /**
     * Create new NodeElement
     * @param tag       element tag name 'p, div, h3 ... other'
     * @param attrs     object with attributes key=value
     * @param inner     text, html or NodeElement
     * @returns {Element}
     */
    Util.createElement = function (tag, attrs, inner) {
        var elem = document.createElement(tag);
        if (typeof elem !== 'object') return null;

        if (typeof attrs === 'object') {
            for (var key in attrs)
                elem.setAttribute(key, attrs[key]);
        }

        if (typeof inner === 'string') {
            elem.innerHTML = inner;
        } else if (typeof inner === 'object') {
            elem.appendChild(inner);
        }
        return elem;
    };


    /**
     * Returns a random integer between min, max, if not specified the default of 0 to 100
     * @param min
     * @param max
     * @returns {number}
     */
    Util.rand = function (min, max) {
        min = min || 0;
        max = max || 100;
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    /**
     * Returns random string color, HEX format
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
     * @param deg
     * @returns {number}
     */
    Util.degreesToRadians = function (deg) {
        return (deg * Math.PI) / 180;
    };

    /**
     * Converts radians to degrees
     * @param rad
     * @returns {number}
     */
    Util.radiansToDegrees = function (rad) {
        return (rad * 180) / Math.PI;
    };

    /**
     * The calculation of the distance between points
     * The point is an object with properties `x` and `y` {x:100,y:100}
     * @param point1
     * @param point2
     * @returns {number}
     */
    Util.distanceBetween = function (point1, point2) {
        var dx = point2.x - point1.x;
        var dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    /**
     * Encode URI params
     * @param data      Object key=value
     * @returns {*}     query string
     */
    Util.encodeData = function(data){
        if(typeof data === 'string') return data;
        if(typeof data !== 'object') return '';
        var convertData = [];
        Object.keys(data).forEach(function(key){
            convertData.push(key+'='+encodeURIComponent(data[key]));
        });
        return convertData.join('&');
    };

    /**
     * Parse URI Request data into object
     * @param url
     * @returns {{}}
     */
    Util.parseGet = function(url){
        url = url || document.location;
        var params = {};
        var parser = document.createElement('a');
        parser.href = url;
        if(parser.search.length > 1){
            parser.search.substr(1).split('&').forEach(function(part){
                var item = part.split('=');
                params[item[0]] = decodeURIComponent(item[1]);
            });
        }
        return params;
    };

    /**
     * Parse Url string/location into object
     * @param url
     * @returns {{}}
     */
    Util.parseUrl = function(url){
        url = url || document.location;
        var params = {};
        var parser = document.createElement('a');
        parser.href = url;
        params.protocol = parser.protocol;
        params.host = parser.host;
        params.hostname = parser.hostname;
        params.port = parser.port;
        params.pathname = parser.pathname;
        params.hash = parser.hash;
        params.search = parser.search;
        params.get = Util.parseGet(parser.search);
        return params;
    };

    Util.each = function (data, callback) {
        if(Util.inArray(data)){
            for(var i = 0; i < data.length; i ++) callback.call(null, data[i]);
        }else if(Util.isObject(data)){
            for(var k in data) callback.call(null, k, data[k]);
        }else return false;
    };

    Util.ucfirst = function (string){
        return string && string[0].toUpperCase() + string.slice(1);
    };

    Util.node2html = function (element){
        var container = document.createElement("div");
        container.appendChild(element.cloneNode(true));
        return container.innerHTML;
    };

    Util.html2node = function (string){
        var i, fragment = document.createDocumentFragment(), container = document.createElement("div");
        container.innerHTML = string;
        while( i = container.firstChild ) fragment.appendChild(i);
        return fragment.childNodes.length === 1 ? fragment.firstChild : fragment;
    };
    
    Util.base64encode = function (str){
        var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var b64encoded = '';
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        for (var i=0; i<str.length;) {
            chr1 = str.charCodeAt(i++);
            chr2 = str.charCodeAt(i++);
            chr3 = str.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = isNaN(chr2) ? 64:(((chr2 & 15) << 2) | (chr3 >> 6));
            enc4 = isNaN(chr3) ? 64:(chr3 & 63);
            b64encoded += b64chars.charAt(enc1) + b64chars.charAt(enc2) +
                b64chars.charAt(enc3) + b64chars.charAt(enc4);
        }
        return b64encoded;
    };


    Util.base64decode = function (str) {
        var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var b64decoded = '';
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        str = str.replace(/[^a-z0-9\+\/\=]/gi, '');
        for (var i=0; i<str.length;) {
            enc1 = b64chars.indexOf(str.charAt(i++));
            enc2 = b64chars.indexOf(str.charAt(i++));
            enc3 = b64chars.indexOf(str.charAt(i++));
            enc4 = b64chars.indexOf(str.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            b64decoded = b64decoded + String.fromCharCode(chr1);
            if (enc3 < 64) {
                b64decoded += String.fromCharCode(chr2);
            }
            if (enc4 < 64) {
                b64decoded += String.fromCharCode(chr3);
            }
        }
        return b64decoded;
    };


    /**
     * Cross-browser function for the character of the event keypress:
     * @param event     event.type must keypress
     * @returns {*}
     */
    Util.getChar = function (event) {
        if (event.which == null) {
            if (event.keyCode < 32) return null;
            return String.fromCharCode(event.keyCode)
        }
        if (event.which != 0 && event.charCode != 0) {
            if (event.which < 32) return null;
            return String.fromCharCode(event.which);
        }
        return null;
    };

    Util.Date = function(){};
    Util.Date.msInDay = 864e5;
    Util.Date.msInHour = 36e5;
    Util.Date.msInMinute = 6e4;
    Util.Date.time = function(date){
        "use strict";
        return date instanceof Date ? date.getTime() : (new Date).getTime();

    };
    /**
     * Add days to some date
     * @param day           number of days. 0.04 - 1 hour, 0.5 - 12 hour, 1 - 1 day
     * @param startDate     type Date, start date
     * @returns {*}  type Date 
     */
    Util.Date.addDays = function (day, startDate){
        var date = startDate ? new Date(startDate) : new Date();
        date.setTime(date.getTime() + (day * 86400000));
        return date;
    };
    /**
     * Time between Dates
     * <pre>
     *     var from = new Date('2016-08-01 20:30');
     *     var to = new Date('2016-08-10 07:55');
     *     Util.Date.betweenDates(from, to); // Object { day: 8, hour: 11, minute: 25 }
     * </pre>
     * @namespace Util.Date.betweenDates
     * @param dateFrom
     * @param dateTo
     * @returns {{day: number, hour: number, minute: number}}
     */
    Util.Date.betweenDates = function(dateFrom, dateTo){
        dateFrom = dateFrom || new Date();
        dateTo = dateTo || new Date();
        var diffMs = (dateTo - dateFrom),
            diffDays = Math.round(diffMs / 864e5),
            diffHrs = Math.round((diffMs % 864e5) / 36e5),
            diffMins = Math.round(((diffMs % 864e5) % 36e5) / 6e4);
        return {day: diffDays, hour: diffHrs, minute: diffMins};
    };

    Util.Storage = function(name, value){
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
    Util.Storage.set = function (name, value) {
        try{value = JSON.stringify(value)}catch(error){}
        return window.localStorage.setItem(name, value);
    };
    Util.Storage.get = function (name) {
        var value = window.localStorage.getItem(name);
        if(value)
            try{value = JSON.parse(value)}catch(error){}
        return value;
    };
    Util.Storage.remove = function (name) {
        return window.localStorage.removeItem(name);
    };
    Util.Storage.key = function (name) {
        return window.localStorage.key(key);
    };
    // when invoked, will empty all keys out of the storage.
    Util.Storage.clear = function () {
        return window.localStorage.clear();
    };
    // returns an integer representing the number of data items stored in the Storage object.
    Util.Storage.length = function () {
        return window.localStorage.length;
    };



    /**
     * возвращает cookie с именем name, если есть, если нет, то undefined
     * @param name
     * @param value
     */
    Util.Cookie = function (name, value) {
        "use strict";
        if(value === undefined){
            return Util.Cookie.get(name);
        }
        else if (value === false || value === null){
            Util.Cookie.delete(name);
        }else {
            Util.Cookie.set(name, value);
        }

    };
    Util.Cookie.get = function (name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };
    /**
     *
     * @param name
     * @param value
     * @param {{}} options   {expires: 0, path: '/', domain: 'site.com', secure: false}
     *                          expires - ms, Date, -1, 0
     */
    Util.Cookie.set = function (name, value, options) {
        options = options || {};
        var expires = options.expires;
        if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }
        value = encodeURIComponent(value);
        var updatedCookie = name + "=" + value;
        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }
        document.cookie = updatedCookie;
    };

    Util.Cookie.delete = Util.Cookie.remove = function (name, option){
        "use strict";
        option = typeof option === 'object' ? option : {};
        option.expires = -1;
        Util.Cookie.set(name, "", option);
    };
    
    Util.getURLParameter = function(name) {
       var reg = (new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1];
       return reg === null ? undefined : decodeURI(reg);
    };
    
    /**
     * An asynchronous for-each loop
     *
     * @param   {Array}     array       The array to loop through
     *
     * @param   {function}  done        Callback function (when the loop is finished or an error occurs)
     *
     * @param   {function}  iterator
     * The logic for each iteration.  Signature is `function(item, index, next)`.
     * Call `next()` to continue to the next item.  Call `next(Error)` to throw an error and cancel the loop.
     * Or don't call `next` at all to break out of the loop.
     */
    Util.asyncForEach = function (array, done, iterator) {
        var i = 0;
        next();

        function next(err) {
            if (err)
                done(err);
            else if (i >= array.length)
                done();
            else if (i < array.length) {
                var item = array[i++];
                setTimeout(function() {
                    iterator(item, i - 1, next);
                }, 0);
            }
        }
    };
    

    /**
     * Calls the callback in a given interval until it returns true
     * @param {function} callback
     * @param {number} interval in milliseconds
     */
    Util.waitFor = function(callback, interval) {
        var internalCallback = function() {
            if(callback() !== true) {
                setTimeout(internalCallback, interval);
            }
        };
        internalCallback();
    };

    /**
     * Remove item from array
     * @param item
     * @param stack
     * @returns {Array}
     */
    Util.rmInArray = function(item, stack) {
        var newStack = [];
        for(var i = 0; i < stack.length; i ++) {
            if(stack[i] && stack[i] != item)
                newStack.push(stack[i]);
        }
        return newStack;
    };



    /**
     *
     * @param elem     Node елемент
     * @param callback получи как аргумет родительский елемент при каждой итерации,
     *                  если функция вернот false итерация прикратится
     * @param limit    количество итерация с возможных,
     */
    Util.eachParent = function (elem, callback, limit) {
        var i = 0;
        limit = limit || 99;
        while(elem.nodeType === Node.ELEMENT_NODE && i < limit ) {
            var res = callback.call({}, elem);
            if(res === false) i = limit;
            elem = elem.parentNode;
            i ++;
        }
    };



    /**
     * @param text
     * @returns {string|void|XML}
     */
    Util.toTranslit = function (text) {
        return text.replace(/([а-яё])|([\s_-])|([^a-z\d])/gi,
            function (all, ch, space, words, i) {
                if (space || words)
                    return space ? '-' : '';
                var code = ch.charCodeAt(0),
                    index = code == 1025 || code == 1105 ? 0 : code > 1071 ? code - 1071 : code - 1039,
                    t = ['yo','a','b','v','g','d','e','zh','z','i','y','k','l','m','n','o','p', 'r','s','t','u','f','h','c','ch','sh','shch','','y','','e','yu','ya'];
                return t[index];
            });
    };


    /**
     * Device detection
     * @returns {boolean}
     */
    Util.isMobile = function() {
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
            return true;
        }
        return false;
    };

    window.Util = Util;

})(window);
