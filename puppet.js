(function (window, document, $) {


  var objectPrototype = Object.prototype, 
      hasOwn = objectPrototype.hasOwnProperty,
      toString = objectPrototype.toString,
      arrayPrototype = Array.prototype,
      forEach,
      map;
  
  if (!arrayPrototype.forEach) {

    forEach = function (arr, callback, context) {

      var T, k, O, len, kValue;

      if (arr == null) {
        throw new TypeError('array is null or not defined');
      }

      O = Object(arr);
      len = O.length >>> 0;

      if (toString.call(callback) !== '[object Function]') {
        throw new TypeError(callback + ' is not a function');
      }

      if (context) {
        T = context;
      }

      k = 0;

      while (k < len) {
        if (k in O) {
          kValue = O[k];
          callback.call(T, kValue, k, O);
        }
        k++;
      }
    };

  } else {

    forEach = function (arr, callback, context) {
      arr.forEach(callback, context);
    };

  }
  
  if (!arrayPrototype.map) {
    
    map = function (callback, context) {

      var T, A, k, O, len, kValue, mappedValue;

      if (arr == null) {
        throw new TypeError('array is null or not defined');
      }

      O = Object(arr);
      len = O.length >>> 0;

      if (toString.call(callback) !== '[object Function]') {
        throw new TypeError(callback + ' is not a function');
      }

      if (context) {
        T = context;
      }

      A = new Array(len);
      k = 0;

      while (k < len) {
        if (k in O) {
          kValue = O[k];
          mappedValue = callback.call(T, kValue, k, O);
          A[k] = mappedValue;
        }
        k++;
      }

      return A;
    };    
    
  } else {

    map = function (arr, callback, context) {
      return arr.map(callback, context);
    };

  }
  
  
  var eventInterfaces = {
    
    HTMLEvents: {

      // event.initEvent(type, bubbles, cancelable); 
      initMethod: 'initEvent',

      defaults: [      

        // eventType
        // @type DOMString
        // Specifies the event type. This type may be any event type currently defined in this specification or a new event type.. The string must be an XML name.
        // Any new event type must not begin with any upper, lower, or mixed case version of the string "DOM". This prefix is reserved for future DOM event sets. It is also strongly recommended that third parties adding their own events use their own prefix to avoid confusion and lessen the probability of conflicts with other new events.
        { name: 'type', value: '' },

        // bubbles
        // @type boolean
        // Specifies whether or not the event can bubble.
        { name: 'bubbles', value: true },

        // cancelable
        // @type boolean
        // Specifies whether or not the event's default action can be prevented.
        { name: 'cancelable', value: true }

      ]
    }
  };

  eventInterfaces.UIEvents = {

    // event.initUIEvent(type, bubbles, cancelable, view, detail) 
    initMethod: 'initUIEvent',

    defaults: eventInterfaces.HTMLEvents.defaults.concat([

      // view
      // @type views::AbstractView
      // Specifies the Event's AbstractView.
      { name: 'view', value: window },

      // detail
      // @type long
      // Specifies the Event's detail.
      { name: 'detail', value: 1 }

    ])
  };
  

  // event.initMouseEvent(type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget);
  eventInterfaces.MouseEvents = {
    
    initMethod: 'initMouseEvent',
    
    defaults: eventInterfaces.UIEvents.defaults.concat([

      // screenX
      // @type long
      // Specifies the Event's screen x coordinate
      { name: 'screenX', value: 0 },

      // screenY
      // @type long
      // Specifies the Event's screen y coordinate
      { name: 'screenY', value: 0 },

      // clientX
      // @type long
      // Specifies the Event's client x coordinate
      { name: 'clientX', value: 0 },

      // clientY
      // @type long
      // Specifies the Event's client y coordinate
      { name: 'clientY', value: 0 },

      // ctrlKey
      // @type boolean
      // Specifies whether or not control key was depressed during the Event.
      { name: 'ctrlKey', value: false },

      // altKey
      // @type boolean
      // Specifies whether or not alt key was depressed during the Event.
      { name: 'altKey', value: false },

      // shiftKey
      // @type boolean
      // Specifies whether or not shift key was depressed during the Event.
      { name: 'shiftKey', value: false },

      // metaKey
      // @type boolean
      // Specifies whether or not meta key was depressed during the Event.
      { name: 'metaKey', value: false },

      // button
      // @type unsigned short
      // Specifies the Event's mouse button.
      { name: 'button', value: 0 },

      // relatedTarget
      // @type EventTarget
      // Specifies the Event's related EventTarget.
      { name: 'relatedTarget', value: null }

    ])
  };

  
  function createSimulatedEvent (eventInterfaceType, options) {
    
    var eventInterface = eventInterfaces[eventInterfaceType],
        initArgs,
        event;
    
    if (typeof options === 'string') {
      options = { type: options };
    }

    if (!options.type) {
      throw new TypeError('Invalid simulated event type.');
    }
    
    // Compile options and defaults to applicable arguments array
    initArgs = map(eventInterface.defaults, function (property) {
      return hasOwn.call(options, property.name) ? options[property.name] : property.value;
    });
    
    // Create event using respective event interface type
    event = document.createEvent(eventInterfaceType);
    
    // Initialize the event using the respective event initialization method
    event[eventInterface.initMethod].apply(event, initArgs);

    return event;
  }
  

  function simulateEvent (target, eventInterfaceType, options) {
    target.dispatchEvent(createSimulatedEvent(eventInterfaceType, options));
  }






  // Puppet interface
  function Puppet (target) {
    this.target = target;
  }
  
  var events = 'mouseover mouseout mousemove mousedown mouseup click dblclick'.split(' ');

  forEach(events, function (event) {
    Puppet.prototype[event] = function (options) {
      options || (options = {});
      options.type = event;
      simulateEvent(this.target, 'MouseEvents', options);
      return this;
    };
  });
  
  // Public API
  function puppet (target) {
    return new Puppet(target);
  }

  puppet.createSimulatedEvent = createSimulatedEvent;
  puppet.simulateEvent = simulateEvent;

  window.puppet = puppet;



  // jQuery plugin
  if (jQuery) {

    jQuery.fn.simulate = function (options) {

      if (!this.length) return this;

      return this.each(function () {
        this.dispatchEvent(createSimulatedEvent('MouseEvents', options));
      });

    };
  }



})(this, document, jQuery);