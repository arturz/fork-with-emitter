"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (childProcess) {
    return new Promise(function (resolve) {
        childProcess.once('exit', resolve);
        childProcess.once('error', resolve);
    });
});
