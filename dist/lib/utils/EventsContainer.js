"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var EventsContainer = /** @class */ (function () {
    function EventsContainer() {
        var _this = this;
        this.events = Object.create(null);
        this.add = function (event, handler) {
            if (_this.events[event] === undefined) {
                _this.events[event] = [handler];
                return;
            }
            _this.events[event].push(handler);
        };
        this.addOnce = function (event, fn) {
            var handler = function (payload) {
                fn(payload);
                _this.delete(event, handler);
            };
            _this.add(event, handler);
        };
        this.delete = function (event, handler) {
            if (_this.events[event] === undefined)
                return;
            _this.events[event] = _this.events[event].filter(function (fn) { return fn !== handler; });
        };
        this.get = function (event) {
            if (_this.events[event] === undefined)
                return [];
            return __spreadArrays(_this.events[event]);
        };
        this.forEach = function (event, fn) {
            _this.get(event).forEach(fn);
        };
    }
    return EventsContainer;
}());
exports.default = EventsContainer;
