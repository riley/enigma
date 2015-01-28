var TAU = Math.PI * 2;
// computerphile video on enigma
// https://www.youtube.com/watch?v=d2NWPG2gB_A

NodeList.prototype.forEach = Array.prototype.forEach;

var TWC = window.TWC || {};
TWC.dispatch = TWC.dispatch || $({});

function rad2deg(rad) {
    return 180 / Math.PI * rad;
}

function setAttrs(el, attrs) {
    Object.keys(attrs).forEach(function (key) {
        el.setAttribute(key, attrs[key]);
    });
}

var HALF_PI = Math.PI / 2;
var ns = "http://www.w3.org/2000/svg";
TWC.colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];