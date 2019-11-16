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
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var path_1 = require("path");
var generateId_1 = require("./utils/generateId");
var waitForExit_1 = require("./utils/waitForExit");
var EventsContainer_1 = require("./utils/EventsContainer");
var Slave = /** @class */ (function () {
    function Slave(fork) {
        var _this = this;
        this.fork = fork;
        this.eventsContainer = new EventsContainer_1.default;
        this.requestEventsContainer = new EventsContainer_1.default;
        //if process exits, every request's pending Promise will be rejected
        this.requestResolvers = Object.create(null);
        this.on = this.eventsContainer.add;
        this.once = this.eventsContainer.addOnce;
        this.removeListener = this.eventsContainer.delete;
        this.onRequest = this.requestEventsContainer.add;
        this.onceRequest = this.requestEventsContainer.addOnce;
        this.removeRequestListener = this.requestEventsContainer.delete;
        this.handleMessage = function (message) { return __awaiter(_this, void 0, void 0, function () {
            var type, payload, _a, event_1, data_1, _b, event_2, data, id, responsePayload, _c, error_1, _d, isRejected, data, id;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (typeof message !== 'object')
                            return [2 /*return*/];
                        type = message.type, payload = message.payload;
                        if (type === 'emit') {
                            _a = payload, event_1 = _a.event, data_1 = _a.data;
                            this.eventsContainer.forEach(event_1, function (fn) { return fn(data_1); });
                            return [2 /*return*/];
                        }
                        if (!(type === 'request')) return [3 /*break*/, 5];
                        _b = payload, event_2 = _b.event, data = _b.data, id = _b.id;
                        responsePayload = void 0;
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        _c = {
                            isRejected: false
                        };
                        return [4 /*yield*/, this.requestEventsContainer.get(event_2)[0](data)];
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
                        this.fork.send({ type: 'response', payload: responsePayload });
                        _e.label = 5;
                    case 5:
                        if (type === 'response') {
                            _d = payload, isRejected = _d.isRejected, data = _d.data, id = _d.id;
                            if (isRejected) {
                                this.requestResolvers[id].reject(data);
                                return [2 /*return*/];
                            }
                            this.requestResolvers[id].resolve(data);
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.fork.on('message', this.handleMessage);
        this.clearAfterExit();
    }
    Slave.prototype.clearAfterExit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, waitForExit_1.default(this.fork)];
                    case 1:
                        _a.sent();
                        this.eventsContainer = new EventsContainer_1.default;
                        this.requestEventsContainer = new EventsContainer_1.default;
                        //reject every request
                        Object.values(this.requestResolvers).forEach(function (_a) {
                            var reject = _a.reject;
                            return reject("Slave fork was killed");
                        });
                        this.requestResolvers = Object.create(null);
                        return [2 /*return*/];
                }
            });
        });
    };
    Slave.prototype.emit = function (event, data) {
        this.fork.send({
            type: 'emit',
            payload: { event: event, data: data }
        });
    };
    Slave.prototype.request = function (event, data, maximumTimeout) {
        var _this = this;
        if (maximumTimeout === void 0) { maximumTimeout = 10; }
        return new Promise(function (resolve, reject) {
            var id = generateId_1.default();
            var clear = function () {
                if (timeout !== null) {
                    clearTimeout();
                    timeout = null;
                }
                delete _this.requestResolvers[id];
            };
            var clearAndResolve = function (data) {
                clear();
                resolve(data);
            };
            var clearAndReject = function (error) {
                clear();
                reject(error);
            };
            _this.requestResolvers[id] = { resolve: clearAndResolve, reject: clearAndReject };
            _this.fork.send({
                type: 'request',
                payload: { event: event, data: data, id: id }
            });
            /*
              For very long tasks, not recommended though.
              If task crashes and forked process still works it will cause a memory leak.
            */
            if (maximumTimeout === Infinity)
                return;
            var timeout = setTimeout(function () { return clearAndReject("Request " + event + " was not handled by slave"); }, maximumTimeout * 1000);
        });
    };
    Slave.prototype.kill = function () {
        this.fork.kill('SIGINT');
    };
    return Slave;
}());
exports.createSlave = function (modulePath, options) {
    if (options === void 0) { options = {}; }
    options.stdio = options.stdio || [undefined, undefined, undefined, 'ipc'];
    //throw error if file does not exist
    fs_1.access(path_1.join(options.cwd || process.cwd(), modulePath), fs_1.constants.F_OK, function (error) {
        if (error)
            throw error;
    });
    var forked = child_process_1.fork(modulePath, options.args || [], options);
    forked.on('error', function (error) {
        throw error;
    });
    return new Slave(forked);
};
