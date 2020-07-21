"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var generateId_1 = require("./utils/generateId");
var EventsContainer_1 = require("./utils/EventsContainer");
exports.isFork = typeof process.send === 'function';
var eventsContainer = new EventsContainer_1.default;
var requestEventsContainer = new EventsContainer_1.default;
var requestResolvers = Object.create(null);
exports.host = {
    on: eventsContainer.add,
    once: eventsContainer.addOnce,
    removeListener: eventsContainer.delete,
    onRequest: requestEventsContainer.add,
    onceRequest: requestEventsContainer.addOnce,
    removeRequestListener: requestEventsContainer.delete,
    emit: function (event, data) {
        if (!process.send)
            return;
        process.send({
            type: 'emit',
            payload: { event: event, data: data }
        });
    },
    request: function (event, data, maximumTimeout) {
        if (maximumTimeout === void 0) { maximumTimeout = 10; }
        return new Promise(function (resolve, reject) {
            if (!process.send)
                return;
            var id = generateId_1.default();
            var clear = function () {
                if (timeout !== null) {
                    clearTimeout();
                    timeout = null;
                }
                delete requestResolvers[id];
            };
            var clearAndResolve = function (data) {
                clear();
                resolve(data);
            };
            var clearAndReject = function (error) {
                clear();
                reject(error);
            };
            requestResolvers[id] = { resolve: clearAndResolve, reject: clearAndReject };
            process.send({
                type: 'request',
                payload: { event: event, data: data, id: id }
            });
            /*
              For very long tasks, not recommended though.
              If task crashes and forked process still works it will cause a memory leak.
            */
            if (maximumTimeout === Infinity)
                return;
            var timeout = setTimeout(function () { return clearAndReject("Request " + event + " was not handled by host"); }, maximumTimeout * 1000);
        });
    }
};
if (exports.isFork) {
    process.on('message', function (message) { return __awaiter(void 0, void 0, void 0, function () {
        var type, payload, _a, event_1, data_1, _b, event_2, data, id, handler, responsePayload, _c, error_1, _d, isRejected, data, id;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (typeof message !== 'object' || !process.send)
                        return [2 /*return*/];
                    type = message.type, payload = message.payload;
                    if (type === 'emit') {
                        _a = payload, event_1 = _a.event, data_1 = _a.data;
                        eventsContainer.forEach(event_1, function (fn) { return fn(data_1); });
                        return [2 /*return*/];
                    }
                    if (!(type === 'request')) return [3 /*break*/, 5];
                    _b = payload, event_2 = _b.event, data = _b.data, id = _b.id;
                    handler = requestEventsContainer.get(event_2)[0];
                    if (handler === undefined)
                        throw new Error("Received not handled request from host (" + event_2 + ")");
                    responsePayload = void 0;
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    _c = {
                        isRejected: false
                    };
                    return [4 /*yield*/, handler(data)];
                case 2:
                    responsePayload = (_c.data = _e.sent(),
                        _c.id = id,
                        _c);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _e.sent();
                    responsePayload = {
                        isRejected: true,
                        data: error_1 instanceof Error
                            ? error_1.stack
                            : error_1.toString(),
                        id: id
                    };
                    return [3 /*break*/, 4];
                case 4:
                    process.send({ type: 'response', payload: responsePayload });
                    _e.label = 5;
                case 5:
                    if (type === 'response') {
                        _d = payload, isRejected = _d.isRejected, data = _d.data, id = _d.id;
                        if (isRejected) {
                            requestResolvers[id].reject(data);
                            return [2 /*return*/];
                        }
                        requestResolvers[id].resolve(data);
                    }
                    return [2 /*return*/];
            }
        });
    }); });
}
