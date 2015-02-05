var RD = window.RD || {};

NodeList.prototype.forEach = Array.prototype.forEach;

// computerphile video on enigma
// https://www.youtube.com/watch?v=d2NWPG2gB_A


/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-07-23
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

if ("document" in self) {

// Full polyfill for browsers with no classList support
if (!("classList" in document.createElement("_")) || !("classList" in document.createElementNS("http://www.w3.org/2000/svg", '_'))) {

(function (view) {

"use strict";

if (!('Element' in view)) return;

var
    classListProp = "classList"
  , protoProp = "prototype"
  , elemCtrProto = view.Element[protoProp]
  , svgCtrProto = view.SVGElement[protoProp]
  , objCtr = Object
  , strTrim = String[protoProp].trim || function () {
    return this.replace(/^\s+|\s+$/g, "");
  }
  , arrIndexOf = Array[protoProp].indexOf || function (item) {
    var
        i = 0
      , len = this.length
    ;
    for (; i < len; i++) {
      if (i in this && this[i] === item) {
        return i;
      }
    }
    return -1;
  }
  // Vendors: please allow content code to instantiate DOMExceptions
  , DOMEx = function (type, message) {
    this.name = type;
    this.code = DOMException[type];
    this.message = message;
  }
  , checkTokenAndGetIndex = function (classList, token) {
    if (token === "") {
      throw new DOMEx(
          "SYNTAX_ERR"
        , "An invalid or illegal string was specified"
      );
    }
    if (/\s/.test(token)) {
      throw new DOMEx(
          "INVALID_CHARACTER_ERR"
        , "String contains an invalid character"
      );
    }
    return arrIndexOf.call(classList, token);
  }
  , ClassList = function (elem) {
    var
        trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
      , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
      , i = 0
      , len = classes.length
    ;
    for (; i < len; i++) {
      this.push(classes[i]);
    }
    this._updateClassName = function () {
      elem.setAttribute("class", this.toString());
    };
  }
  , classListProto = ClassList[protoProp] = []
  , classListGetter = function () {
    return new ClassList(this);
  }
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
  return this[i] || null;
};
classListProto.contains = function (token) {
  token += "";
  return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
  var
      tokens = arguments
    , i = 0
    , l = tokens.length
    , token
    , updated = false
  ;
  do {
    token = tokens[i] + "";
    if (checkTokenAndGetIndex(this, token) === -1) {
      this.push(token);
      updated = true;
    }
  }
  while (++i < l);

  if (updated) {
    this._updateClassName();
  }
};
classListProto.remove = function () {
  var
      tokens = arguments
    , i = 0
    , l = tokens.length
    , token
    , updated = false
    , index
  ;
  do {
    token = tokens[i] + "";
    index = checkTokenAndGetIndex(this, token);
    while (index !== -1) {
      this.splice(index, 1);
      updated = true;
      index = checkTokenAndGetIndex(this, token);
    }
  }
  while (++i < l);

  if (updated) {
    this._updateClassName();
  }
};
classListProto.toggle = function (token, force) {
  token += "";

  var
      result = this.contains(token)
    , method = result ?
      force !== true && "remove"
    :
      force !== false && "add"
  ;

  if (method) {
    this[method](token);
  }

  if (force === true || force === false) {
    return force;
  } else {
    return !result;
  }
};
classListProto.toString = function () {
  return this.join(" ");
};

if (objCtr.defineProperty) {
  var classListPropDesc = {
      get: classListGetter
    , enumerable: true
    , configurable: true
  };
  try {
    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
    objCtr.defineProperty(svgCtrProto, classListProp, classListPropDesc);
  } catch (ex) { // IE 8 doesn't support enumerable:true
    if (ex.number === -0x7FF5EC54) {
      classListPropDesc.enumerable = false;
      objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
      objCtr.defineProperty(svgCtrProto, classListProp, classListPropDesc);
    }
  }
} else if (objCtr[protoProp].__defineGetter__) {
  elemCtrProto.__defineGetter__(classListProp, classListGetter);
  svgCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(self));

} else {
// There is full or partial native classList support, so just check if we need
// to normalize the add/remove and toggle APIs.

(function () {
  "use strict";

  var testElement = document.createElement("_");

  testElement.classList.add("c1", "c2");

  // Polyfill for IE 10/11 and Firefox <26, where classList.add and
  // classList.remove exist but support only one argument at a time.
  if (!testElement.classList.contains("c2")) {
    var createMethod = function(method) {
      var original = DOMTokenList.prototype[method];

      DOMTokenList.prototype[method] = function(token) {
        var i, len = arguments.length;

        for (i = 0; i < len; i++) {
          token = arguments[i];
          original.call(this, token);
        }
      };
    };
    createMethod('add');
    createMethod('remove');
  }

  testElement.classList.toggle("c3", false);

  // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
  // support the second argument.
  if (testElement.classList.contains("c3")) {
    var _toggle = DOMTokenList.prototype.toggle;

    DOMTokenList.prototype.toggle = function(token, force) {
      if (1 in arguments && !this.contains(token) === !force) {
        return force;
      } else {
        return _toggle.call(this, token);
      }
    };

  }

  testElement = null;
}());

}

}

// for IE 9
if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}

// // no-dependency custom events.
// // http://jsfiddle.net/ad4yG/
// var htmlEvents = {// list of real events
//     //<body> and <frameset> Events
//     onload:1,
//     onunload:1,
//     //Form Events
//     onblur:1,
//     onchange:1,
//     onfocus:1,
//     onreset:1,
//     onselect:1,
//     onsubmit:1,
//     //Image Events
//     onabort:1,
//     //Keyboard Events
//     onkeydown:1,
//     onkeypress:1,
//     onkeyup:1,
//     //Mouse Events
//     onclick:1,
//     ondblclick:1,
//     onmousedown:1,
//     onmousemove:1,
//     onmouseout:1,
//     onmouseover:1,
//     onmouseup:1
// };

// RD.triggerEvent = function (el,eventName) {
//     var event;
//     if(document.createEvent){
//         event = document.createEvent('HTMLEvents');
//         event.initEvent(eventName,true,true);
//     }else if(document.createEventObject){// IE < 9
//         event = document.createEventObject();
//         event.eventType = eventName;
//     }
//     event.eventName = eventName;
//     if(el.dispatchEvent){
//         el.dispatchEvent(event);
//     }else if(el.fireEvent && htmlEvents['on'+eventName]){// IE < 9
//         el.fireEvent('on'+event.eventType,event);// can trigger only real event (e.g. 'click')
//     }else if(el[eventName]){
//         el[eventName]();
//     }else if(el['on'+eventName]){
//         el['on'+eventName]();
//     }
// };

// RD.addEvent = function (el,type,handler) {
//     if(el.addEventListener){
//         el.addEventListener(type,handler,false);
//     }else if(el.attachEvent && htmlEvents['on'+type]){// IE < 9
//         el.attachEvent('on'+type,handler);
//     }else{
//         el['on'+type]=handler;
//     }
// };
// RD.removeEvent = function (el,type,handler){
//     if(el.removeventListener){
//         el.removeEventListener(type,handler,false);
//     }else if(el.detachEvent && htmlEvents['on'+type]){// IE < 9
//         el.detachEvent('on'+type,handler);
//     }else{
//         el['on'+type]=null;
//     }
// };

// var _body = document.body;
// var customEventFunction = function(){
//     alert('triggered custom event');
// };
// RD.addEvent(_body,'customEvent',customEventFunction);
// RD.triggerEvent(_body,'customEvent');


RD.dispatch = RD.dispatch || $({});

function rad2deg(rad) {
    return 180 / Math.PI * rad;
}

function setAttrs(el, attrs) {
    Object.keys(attrs).forEach(function (key) {
        el.setAttribute(key, attrs[key]);
    });
}

var HALF_PI = Math.PI / 2;
var TAU = Math.PI * 2;
var ns = "http://www.w3.org/2000/svg";
RD.colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#000000'];

RD.a = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

RD.start = "AMT".split('').map(function (letter) { return RD.a.indexOf(letter); });