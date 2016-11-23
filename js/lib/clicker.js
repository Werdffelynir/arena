(function(window){

    /**
     * var clicker = Clicker();
     * clicker.scan()
     * clicker.get()
     * clicker.get('group')
     * clicker.set('group', elem)
     * clicker.on('click', 'group', function (event) {})
     * clicker.click('group', function (elem, value) {});
     **/

    /**
     * @returns {*}
     * @namespace Clicker
     * @constructor
     */
    var clicker = function () {
        if (!(this instanceof Clicker))
            return new Clicker();

        this.list = [];
        this.errors = [];
        this.keyName = 'data-key';
        this.valueName = 'data-value';
        this.scan();
        return this;
    };

    /**
     * @returns {Array}
     */
    clicker.prototype.scan = function () {
        var key, elems = document.querySelectorAll('.clicker');
        for(var i = 0; i < elems.length; i ++ ){
            if (key = elems[i].getAttribute(this.keyName)) {
                this.set(key, elems[i]);
            }
        }
        return this.list;
    };

    /**
     *
     * @param event
     * @param key
     * @param callback
     * @param useCapture
     */
    clicker.prototype.on = function (event, key, callback, useCapture) {
        var elem = this.get(key);
        if(elem) {
            for(var i = 0; i < elem.length; i ++) {
                elem[i].addEventListener(event, callback, useCapture);
            }
        }
    };

    /**
     *
     * @param key
     * @param callback
     * @param useCapture
     */
    clicker.prototype.click = function (key,  callback, useCapture) {
        var valueName = this.valueName;
        var specialCallback = function (event) {callback.call(event, event.target, event.target.getAttribute(valueName))};
        this.on('click', key,  specialCallback, useCapture);
    };

    /**
     * @param key
     */
    clicker.prototype.get = function (key) {
        var i, result = [], list = this.list;
        if (key) {
            for(i = 0; i < list.length; i ++) {
                if(list[i].key === key)
                    result.push(list[i]);
            }
        } else
            return list;
        return result;
    };

    /**
     *
     * @param key
     * @param elem
     */
    clicker.prototype.set = function (key, elem) {
        elem.key = key;
        this.list.push(elem);
    };

    window.Clicker = clicker;
    window.Clicker.version = '0.0.1'

})(window);