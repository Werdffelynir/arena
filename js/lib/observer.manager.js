(function (window) {

    /**
     * @param global    Set global access for events
     * @returns {ObserverManager}
     * @constructor
     */
    var ObserverManager = function (global) {
        if (!(this instanceof ObserverManager)) {
            return new ObserverManager(global);
        }
        this.events = global ? window.ObserverManagerInstanse.events : {};
        this.listeners = global ? window.ObserverManagerInstanse.listeners : {};
    };
    ObserverManager.varsion = '0.0.1';
    ObserverManager.prototype.events = {};
    ObserverManager.prototype.listeners = {};

    /**
     * Add / replace event
     * @param eventName
     * @param callback
     * @param thisInst
     */
    ObserverManager.prototype.add = function (eventName, callback, thisInst) {
        this.events[eventName] = {eventName:eventName, callback:callback||function(){}, thisInst:thisInst}
    };

    /**
     * Remove event by eventName
     * @param eventName
     * @returns {*}
     */
    ObserverManager.prototype.remove = function (eventName) {
        if (this.events[eventName]) delete this.events[eventName];
        return eventName;
    };


    ObserverManager.randString = function (length) {
        var abc = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), result = '';
        length = length || 6;
        for (var i = 0; i < length; i++)
            result += abc[Math.floor(Math.random() * 16)];
        return result;
    };

    /**
     * Add only listener for event
     * @param listenerName
     * @param callback
     * @param args
     * @returns {boolean|string|*}
     */
    ObserverManager.prototype.addListener = function (listenerName, callback, args) {
        var event = this.decodeListenerName(listenerName).event,
            listener = this.decodeListenerName(listenerName).listener;

        if (!Array.isArray(this.listeners[event])) this.listeners[event] = [];
        if (!Array.isArray(args) && args !== undefined) args = [args];
        this.listeners[event].push({active:true, eventName:event, listenerName:listener, callback:callback, args:args});
        return listener;
    };

    ObserverManager.prototype.decodeListenerName = function (listenerName) {
        var result = {event:false, listener:false},
            listenerNameArray = listenerName.split(':');
        if (listenerNameArray.length == 2) {
            result.event = listenerNameArray[0].trim();
            result.listener = listenerNameArray[1].trim();
        } else
            result.event = listenerName;
        return result;
    };

    /**
     * Get array with listeners of event
     * @param listenerName
     * @returns {Array}
     */
    ObserverManager.prototype.getListeners = function (listenerName) {
        var event = this.decodeListenerName(listenerName).event,
            listener = this.decodeListenerName(listenerName).listener,
            listeners = [];
        if (this.listeners[event]) {
            for (var i = 0; i < this.listeners[event].length; i ++) {
                if (this.listeners[event][i] && (!listener || this.listeners[event][i]['listenerName'] == listener)) {
                    listeners.push(this.listeners[event][i]);
                }
            }
        }
        return listeners;
    };

    /**
     * Activate / deactivate listeners of event
     * @param listenerName
     * @param active
     */
    ObserverManager.prototype.activeListener = function (listenerName, active) {
        var listeners = this.getListeners(listenerName);
        if (listeners)
            listeners.map(function(listener){listener.active = !!active});
    };

    /**
     * Remove listeners of event
     * @param listenerName
     */
    ObserverManager.prototype.removeListener = function (listenerName) {
        var event = this.decodeListenerName(listenerName).event,
            listener = this.decodeListenerName(listenerName).listener;
        if (event && listener) {
            if (this.listeners[event]) {
                for (var i = 0; i < this.listeners[event].length; i ++)
                    if (this.listeners[event][i] && this.listeners[event][i]['listenerName'] == listener)
                        delete this.listeners[event][i];
            }
        } else
        if (event && this.listeners[event])
            delete this.listeners[event];
    };

    /**
     * Dispatch event by eventName
     * @param eventName
     */
    ObserverManager.prototype.dispatch = function (eventName) {
        if (typeof this.events[eventName] === 'object' && typeof this.events[eventName]['callback'] === 'function') {
            var thisInst = this.events[eventName]['thisInst']||{};
            thisInst.eventName = this.events[eventName]['eventName'];
            this.events[eventName]['callback'].call(thisInst);
            if (Array.isArray(this.listeners[eventName])) {
                this.listeners[eventName].map(function (listener) {
                    if (listener.active)
                        listener.callback.apply(thisInst, listener.args)
                });
            }
        }
    };

    window.ObserverManagerInstanse = {events:{},listeners:{}};
    window.ObserverManager = ObserverManager;

})(window);