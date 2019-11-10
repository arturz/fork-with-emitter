"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function () {
    return Math.random().toString(36).slice(2) + (new Date).getTime().toString(36);
});
