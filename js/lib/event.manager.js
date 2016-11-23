(function (window) {

    var EventManager = {

        version: '0.0.1',
        eventsType: {},
        superTarget: document.createDocumentFragment(),

        /**
         * Create new Event
         * @param name
         * @param details
         * @returns {CustomEvent}
         */
        addEvent: function(name, details) {
            var key, event = new CustomEvent(name, {detail: details});
            if (typeof details === 'object')
                for (key in details)
                    if (!event.hasOwnProperty(key)) event[key] = details[key]
            return EventManager.superTarget[name] = event;
        },

        /**
         * Remove Event
         * @param name
         */
        removeEvent: function(name){
            if (EventManager.superTarget[name]) delete EventManager.superTarget[name]
        },

        /**
         *
         * @param type
         * @param listener
         * @param useCapture
         * @returns {{type: *, listener: *, useCapture: (*|boolean)}}
         */
        addEventListener: function(type, listener, useCapture){
            useCapture = useCapture || false;
            EventManager.superTarget.addEventListener(type, listener, useCapture);
            return {type: type, listener: listener, useCapture: useCapture};
        },

        /**
         *
         * @param type
         * @param listener
         * @param useCapture
         */
        removeEventListener: function(type, listener, useCapture){
            EventManager.superTarget.removeEventListener(type, listener, useCapture||false)
        },

        /**
         *
         * @param type
         */
        dispatchEvent: function(type){
            if (EventManager.superTarget[type] instanceof CustomEvent)
                EventManager.superTarget.dispatchEvent(EventManager.superTarget[type])
        }
    };

    window.EventManager = EventManager
})(window);