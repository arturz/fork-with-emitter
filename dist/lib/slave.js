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
var events_1 = require("events");
var generateId_1 = require("./utils/generateId");
exports.isSlave = typeof process.send === 'function';
var events = Object.create(null);
var responseEmitter = new events_1.EventEmitter;
exports.master = {
    on: function (event, listener) {
        if (events[event] === undefined) {
            events[event] = [listener];
            return;
        }
        events[event].push(listener);
    },
    emit: function (event, payload) {
        if (process.send)
            process.send({ type: 'emit', event: event, payload: payload });
    },
    request: function (event, payload, maximumTimeout) {
        if (maximumTimeout === void 0) { maximumTimeout = 10; }
        return new Promise(function (resolve, reject) {
            if (!process.send)
                return;
            var id = generateId_1.default();
            process.send({ type: 'request', id: id, event: event, payload: payload });
            var resolveAndClear = function (response) {
                resolve(response);
                clearTimeout(timeoutHandler);
            };
            responseEmitter.once(id, resolveAndClear);
            var timeoutHandler = setTimeout(function () {
                responseEmitter.removeListener(id, resolveAndClear);
                reject();
            }, maximumTimeout * 1000);
        });
    }
};
if (exports.isSlave) {
    process.on('message', function (message) { return __awaiter(void 0, void 0, void 0, function () {
        var type, event, payload, id, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof message !== 'object')
                        return [2 /*return*/];
                    type = message.type, event = message.event, payload = message.payload, id = message.id;
                    if (type === 'response') {
                        responseEmitter.emit(id, payload);
                        return [2 /*return*/];
                    }
                    if (!(type === 'request' && process.send)) return [3 /*break*/, 2];
                    return [4 /*yield*/, events[event][0](payload)];
                case 1:
                    response = _a.sent();
                    process.send({ type: 'response', payload: response, id: id });
                    return [2 /*return*/];
                case 2:
                    if (type === 'emit') {
                        events[event].forEach(function (fn) { return fn(payload); });
                    }
                    return [2 /*return*/];
            }
        });
    }); });
}
